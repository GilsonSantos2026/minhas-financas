/**
 * fatura/importador.js — Regras para transformar o que foi lido da fatura em compras do app:
 * qual cartão, qual categoria, o que já existe (duplicado) e criação das parcelas futuras.
 */
window.Fin = window.Fin || {};

Fin.faturaImportador = (() => {
  const P = Fin.parsers;
  const F = Fin.finance;
  const S = Fin.storage;
  const fmt = Fin.fmt;
  const N = (v) => P.normalize(v);

  /* ---------------- Cartão ---------------- */

  const PISTAS_BANCO = {
    Sicoob: ['sicoob', 'visa'],
    'Banco do Brasil': ['ourocard', 'bb', 'elo'],
    'Mercado Pago': ['mercadopago', 'mercado'],
    Nubank: ['nubank', 'nu'],
  };

  function sugerirCartao(info) {
    const cartoes = F.cartoes();
    const pistas = PISTAS_BANCO[info.banco] || (info.banco ? [N(info.banco)] : []);
    const achado = cartoes.find((k) => {
      const alvo = ` ${N(k.nome)} ${N(k.palavraChave)} `;
      return pistas.some((p) => alvo.includes(` ${p} `) || alvo.includes(p));
    });
    return achado?.nome || Fin.state.cartao || cartoes[0]?.nome || null;
  }

  /* ---------------- Categoria ---------------- */

  /** "MP *MERCADOLIVRE 04/06 GUARULHOS" → "mercadolivre guarulhos" (sem prefixos, números e símbolos). */
  function chave(desc) {
    return N(desc)
      .replace(/\b(mp|dl|pg|pag|pgto|ec|ifd|iz|sumup|pagseguro|parc|parcela|de)\b/g, ' ')
      .replace(/\d+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Histórico: chave da descrição → última categoria usada nas compras de cartão. */
  function memoria() {
    const mapa = new Map();
    const compras = [...S.list('cartaoCompras')].sort((a, b) => (a.data || '').localeCompare(b.data || ''));
    for (const c of compras) {
      if (!c.categoria || c.categoria === 'Sem categoria') continue;
      const k = chave(c.descricao);
      if (!k) continue;
      mapa.set(k, c.categoria);
      const tokens = k.split(' ');
      mapa.set(tokens.slice(0, 2).join(' '), c.categoria);
      if (tokens[0].length >= 4) mapa.set(`1:${tokens[0]}`, c.categoria);
    }
    return mapa;
  }

  /** Palavras-chave → trechos de nome de categoria (usados só se a categoria existir no seu cadastro). */
  const REGRAS = [
    [/(posto|combust|shell|ipiranga|petro|gasolina)/, ['combust', 'transporte', 'veicul', 'carro']],
    [/(uber|\b99\b|taxi|cabify|estaciona|pedagio|sem parar|vistoauto|despachan)/, ['transporte', 'veicul', 'carro']],
    [/(farmac|drogar|droga|raia|pacheco)/, ['farmac', 'saude']],
    [/(supermerc|mercado|atacad|assai|hiper|carrefour|confianca|sacolao|hortifruti)/, ['supermerc', 'mercado', 'aliment']],
    [/(padaria|lanche|pizz|restaur|\bbar\b|pastel|espetinho|ifood|burger|cafe|sorvet)/, ['aliment', 'restaur', 'lanche', 'lazer']],
    [/(pet|cobasi|petz|veterin)/, ['pet', 'animal']],
    [/(claro|vivo|\btim\b|\boi\b|internet|telefon)/, ['internet', 'telefon', 'celular']],
    [/(microsoft|netflix|spotify|google|apple|amazon prime|subscription|assinatura|melimais|disney|investidor)/, ['assinatura', 'streaming', 'servic']],
    [/(escola|curso|faculd|livrar|educa)/, ['educa']],
    [/(loteria)/, ['loteria', 'jogo', 'lazer']],
    [/(seguro)/, ['seguro']],
    [/(moda|roupa|calcad|renner|riachuelo|cea|havan)/, ['vestu', 'roupa', 'compras']],
    [/(mercadolivre|amazon|shopee|magalu|americanas|aliexpress)/, ['compras', 'eletron', 'outros']],
    [/(juro|iof|anuidade|encargo|tarifa|multa|mora|protecao|sms|rotativo)/, ['taxa', 'tarifa', 'juros', 'encargo', 'imposto']],
  ];

  function categoriaPorNome(trechos) {
    const cats = F.categorias('despesa');
    for (const t of trechos) {
      const c = cats.find((k) => N(k.nome).includes(t));
      if (c) return c.nome;
    }
    return null;
  }

  function sugerirCategoria(desc, tipo, mem) {
    const k = chave(desc);
    const tokens = k.split(' ');
    const lembrada = mem.get(k) || mem.get(tokens.slice(0, 2).join(' ')) || (tokens[0]?.length >= 4 && mem.get(`1:${tokens[0]}`));
    if (lembrada && tipo === 'compra') return lembrada;
    const n = N(desc);
    for (const [re, trechos] of REGRAS) {
      if (re.test(n)) {
        const c = categoriaPorNome(trechos);
        if (c) return c;
      }
    }
    return lembrada || categoriaPorNome(['outros gastos', 'outros', 'diversos']) || F.categorias('despesa')[0]?.nome || 'Sem categoria';
  }

  /* ---------------- Duplicados ---------------- */

  /**
   * Mesma compra = mesmo cartão, mesma fatura, mesma data e valor igual
   * (tolerância de 5 centavos, para lançamentos digitados com arredondamento).
   *
   * A comparação é UM PARA UM: cada compra já existente "casa" com um único item
   * da fatura. Assim, duas compras idênticas no mesmo dia (ex.: dois cafés de R$ 5,00)
   * com só uma já lançada → uma vem como "já existe" e a outra como nova.
   */
  function indiceExistentes(cartao) {
    const mapa = new Map();
    for (const c of S.list('cartaoCompras')) {
      if (c.cartao !== cartao) continue;
      const k = `${c.fatura}|${c.data}`;
      if (!mapa.has(k)) mapa.set(k, []);
      mapa.get(k).push({ valor: c.valor || 0, compra: c, usada: false });
    }

    /** Procura uma compra igual ainda não usada; se achar, marca como usada e devolve. */
    function consumir(fatura, data, valor) {
      let melhor = null;
      for (const e of mapa.get(`${fatura}|${data}`) || []) {
        const diff = Math.abs(e.valor - valor);
        if (!e.usada && diff <= 0.05 && (!melhor || diff < Math.abs(melhor.valor - valor))) melhor = e;
      }
      if (!melhor) return null;
      melhor.usada = true;
      const c = melhor.compra;
      return {
        origem: c.origem || null,
        criadoEm: c.criadoEm || null,
        arquivo: (c.observacao || '').match(/Importado de (.+)$/)?.[1] || null,
      };
    }
    return { consumir };
  }

  /* ---------------- Preparação e gravação ---------------- */

  /** Monta as linhas da tela de revisão. */
  function preparar(leitura, cartao, fatura) {
    const mem = memoria();
    const idx = indiceExistentes(cartao);
    return leitura.itens.map((i, n) => {
      const existente = idx.consumir(fatura, i.data, i.valor);
      return {
        n,
        ...i,
        categoria: sugerirCategoria(i.descricao, i.tipo, mem),
        duplicada: !!existente,
        existente,
        incluir: !existente && i.tipo !== 'pagamento',
      };
    });
  }

  /** Recalcula os duplicados (ao trocar cartão ou fatura) mantendo as escolhas do usuário. */
  function remarcarDuplicados(linhas, cartao, fatura) {
    const idx = indiceExistentes(cartao);
    for (const l of linhas) {
      const existente = idx.consumir(fatura, l.data, l.valor);
      const dup = !!existente;
      if (dup !== l.duplicada) l.incluir = !dup && l.tipo !== 'pagamento';
      l.duplicada = dup;
      l.existente = existente;
    }
  }

  /**
   * A fatura inteira parece já estar na base? (80% ou mais dos itens, sem contar
   * pagamentos, já existem.) Diz também se veio de uma importação de PDF e quando.
   */
  function jaImportada(linhas) {
    const itens = linhas.filter((l) => l.tipo !== 'pagamento');
    const dups = itens.filter((l) => l.duplicada);
    if (!itens.length || dups.length / itens.length < 0.8) return null;
    const doPdf = dups.filter((l) => l.existente?.origem === 'pdf');
    const ultima = doPdf.map((l) => l.existente).filter((e) => e.criadoEm).sort((a, b) => a.criadoEm.localeCompare(b.criadoEm)).pop();
    return {
      total: itens.length,
      dups: dups.length,
      novos: itens.length - dups.length,
      deImportacao: doPdf.length > 0,
      daImportacao: doPdf.length,
      quando: ultima?.criadoEm || null,
      arquivo: ultima?.arquivo || null,
    };
  }

  /** Quantas parcelas futuras seriam criadas (desconsiderando as que já existem). */
  function parcelasFuturas(linhas, cartao, fatura) {
    const idx = indiceExistentes(cartao);
    const out = [];
    for (const l of linhas) {
      if (!l.incluir || !l.parcela || l.parcela.atual >= l.parcela.total) continue;
      for (let p = l.parcela.atual + 1; p <= l.parcela.total; p++) {
        const fat = fmt.addMonths(fatura, p - l.parcela.atual);
        if (!idx.consumir(fat, l.data, l.valor)) out.push({ linha: l, parcela: p, fatura: fat });
      }
    }
    return out;
  }

  function salvar(linhas, { cartao, fatura, futuras, arquivo }) {
    const cats = F.categorias();
    const icone = (nome) => cats.find((c) => c.nome === nome)?.icone ?? null;
    const lista = S.list('cartaoCompras');
    const agora = new Date().toISOString();
    const grupos = new Map();
    let qtd = 0;

    const novo = (l, parcelaAtual, fat, grupo) => ({
      id: S.uid(),
      grupo: grupo || null,
      origem: 'pdf',
      cartao,
      data: l.data,
      fatura: fat,
      descricao: l.descricao,
      categoria: l.categoria,
      categoriaIcone: icone(l.categoria),
      valor: l.valor,
      parcela: l.parcela ? { atual: parcelaAtual, total: l.parcela.total } : null,
      valorTotalCompra: l.parcela ? Math.round(l.valor * l.parcela.total * 100) / 100 : null,
      observacao: [l.portador, `Importado de ${arquivo}`].filter(Boolean).join(' · '),
      criadoEm: agora,
    });

    for (const l of linhas.filter((x) => x.incluir)) {
      const grupo = l.parcela ? S.uid() : null;
      grupos.set(l, grupo);
      lista.push(novo(l, l.parcela?.atual, fatura, grupo));
      qtd++;
    }
    const extras = futuras ? parcelasFuturas(linhas, cartao, fatura) : [];
    for (const e of extras) lista.push(novo(e.linha, e.parcela, e.fatura, grupos.get(e.linha)));

    S.set('cartaoCompras', lista);
    return { qtd, futuras: extras.length };
  }

  return { sugerirCartao, sugerirCategoria, preparar, remarcarDuplicados, jaImportada, parcelasFuturas, salvar };
})();
