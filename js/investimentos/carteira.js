/**
 * investimentos/carteira.js — Regras e cálculos da carteira de investimentos (sem tela).
 *
 * Dados (coleções sincronizadas):
 *  invContas  { id, nome, tipo: 'corretora'|'saldo', moeda: 'BRL'|'USD', classe (só 'saldo'), icone }
 *             corretora = guarda ativos com quantidade e preço (Rico, Nomad);
 *             saldo     = conta acompanhada pelo saldo (reserva, previdência, renda fixa…).
 *  invAtivos  { id, conta, ticker, nome, classe, moeda, preco, precoEm }
 *  invMovs    { id, data, conta, ativo (id) | null, tipo, qtd, preco, taxas, valor, cambio, fator, obs, origem }
 *             tipos de ativo: inicial | compra | venda | provento | desdobramento | grupamento | bonificacao
 *             tipos de conta-saldo: aporte | resgate | saldo
 *  invMetas   { id, nome, tipo: 'patrimonio'|'classes'|'proventos'|'conta', classes[], conta, alvo, aporteMensal }
 *  invHist    { id: 'AAAA-MM', patrimonio, investido, porClasse, dolar, em, manual }
 *  invConfig  { id: 'alocacao', ideal: { classe: % } }
 *
 * Regras:
 *  - Preço médio inclui as taxas da compra. Venda baixa o custo pelo preço médio; o lucro
 *    (ou prejuízo) vira "realizado".
 *  - Ativos em dólar: custo em reais pelo câmbio de cada operação (PTAX do dia, editável);
 *    valor atual em reais pelo dólar atual.
 *  - "Posição inicial" (inicial) = ativo que você já tinha antes de usar o app: entra no custo,
 *    mas NÃO é aporte do mês (não distorce a rentabilidade).
 *  - Rentabilidade do mês (Dietz modificado):
 *      (patrimônio fim − patrimônio início − aportes líquidos + proventos) ÷ (patrimônio início + aportes/2)
 *    Precisa do patrimônio dos dois meses (fotos em invHist: automáticas ou informadas).
 */
window.Fin = window.Fin || {};

Fin.inv = (() => {
  const S = Fin.storage;
  const fmt = Fin.fmt;
  const N = (v) => Fin.parsers.normalize(v);
  const r2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

  // [id, nome, ícone, moeda padrão]
  const CLASSES = [
    ['acao', 'Ações', '📊', 'BRL'],
    ['fii', 'FIIs', '🏢', 'BRL'],
    ['etf-br', 'ETFs (B3)', '🧺', 'BRL'],
    ['bdr', 'BDRs', '🌐', 'BRL'],
    ['stock', 'Stocks', '🗽', 'USD'], // (bandeiras não aparecem no Windows)
    ['reit', 'REITs', '🏬', 'USD'],
    ['etf', 'ETFs Intern.', '🌎', 'USD'],
    ['cripto', 'Criptomoedas', '🪙', 'BRL'],
    ['renda-fixa', 'Renda fixa', '🏦', 'BRL'],
    ['tesouro', 'Tesouro Direto', '🏛️', 'BRL'],
    ['reserva', 'Reserva de emergência', '🛟', 'BRL'],
    ['previdencia', 'Previdência', '🧓', 'BRL'],
    ['outro', 'Outros', '📦', 'BRL'],
  ].map(([id, nome, icone, moeda]) => ({ id, nome, icone, moeda }));
  const CLASSE = new Map(CLASSES.map((c) => [c.id, c]));
  const classe = (id) => CLASSE.get(id) || CLASSE.get('outro');
  const EXTERIOR = new Set(['stock', 'reit', 'etf']);

  const TIPOS = {
    inicial: { nome: 'Posição inicial', icone: '📥', ativo: true },
    compra: { nome: 'Compra', icone: '🟢', ativo: true },
    venda: { nome: 'Venda', icone: '🔴', ativo: true },
    provento: { nome: 'Provento', icone: '💰', ativo: true },
    desdobramento: { nome: 'Desdobramento', icone: '✂️', ativo: true },
    grupamento: { nome: 'Grupamento', icone: '🔗', ativo: true },
    bonificacao: { nome: 'Bonificação', icone: '🎁', ativo: true },
    aporte: { nome: 'Aporte', icone: '➕', ativo: false },
    resgate: { nome: 'Resgate', icone: '➖', ativo: false },
    saldo: { nome: 'Saldo atualizado', icone: '🧾', ativo: false },
    ajuste: { nome: 'Ajuste de quantidade', icone: '⚖️', ativo: true },
  };

  /* ---------------- Acesso aos dados ---------------- */

  const porNome = (a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR');
  const contas = () => [...S.list('invContas')].sort((a, b) => (a.tipo === b.tipo ? porNome(a, b) : a.tipo === 'corretora' ? -1 : 1));
  const conta = (id) => S.list('invContas').find((c) => c.id === id) || null;
  const ativos = () => S.list('invAtivos');
  const ativo = (id) => ativos().find((a) => a.id === id) || null;
  // Operações "substituídas" (do Investidor 10, trocadas pelas do extrato da Nomad) ficam guardadas só
  // para a reimportação não duplicar; não entram em nenhum cálculo nem na lista.
  const movs = () => S.list('invMovs').filter((m) => !m.substituido);
  const metas = () => S.list('invMetas');
  const temDados = () => S.list('invContas').length > 0;

  function config(id) { return S.list('invConfig').find((c) => c.id === id) || null; }
  function salvarConfig(id, dados) { return S.upsert('invConfig', { ...(config(id) || {}), ...dados, id }); }

  const ordenar = (lista) => [...lista].sort((a, b) =>
    (a.data || '').localeCompare(b.data || '') || (a.criadoEm || '').localeCompare(b.criadoEm || ''));

  const dolarAtual = () => Fin.cotacoes.dolar()?.valor || null;
  const moedaDe = (a, c = conta(a?.conta)) => a?.moeda || c?.moeda || 'BRL';

  /**
   * Câmbio de uma operação (R$ por unidade da moeda). Provento importado do Investidor 10
   * já vem em reais (moedaValor 'BRL').
   */
  const cambioMov = (m, moeda) => (m.moedaValor === 'BRL' ? 1 : moeda === 'USD' ? Number(m.cambio) || dolarAtual() || 0 : 1);

  /** Classe sugerida para um ticker novo. */
  function sugerirClasse(ticker, c) {
    const t = (ticker || '').toUpperCase();
    if (c?.moeda === 'USD') return 'stock';
    if (/^(BTC|ETH|SOL|USDT|USDC|ADA|XRP|BNB)$/.test(t)) return 'cripto';
    if (/3[2-5]$/.test(t)) return 'bdr';
    if (/11$/.test(t)) return 'fii';
    return 'acao';
  }

  /** Acha o ativo da conta pelo ticker ou cria. */
  function obterAtivo(contaId, ticker, classeId = null) {
    const t = ticker.trim().toUpperCase();
    const achado = ativos().find((a) => a.conta === contaId && a.ticker === t);
    if (achado) return achado;
    const c = conta(contaId);
    return S.upsert('invAtivos', { conta: contaId, ticker: t, nome: null, classe: classeId || sugerirClasse(t, c), moeda: c?.moeda || 'BRL', preco: null, precoEm: null });
  }

  /* ---------------- Posições ---------------- */

  /**
   * Posição de cada ativo, considerando as operações até a data "ate" (inclusive).
   * Sem "ate": até hoje (proventos futuros ficam de fora — são "a receber").
   */
  function posicoes(ate = null) {
    const limite = ate || fmt.todayISO();
    const cMap = new Map(S.list('invContas').map((c) => [c.id, c]));
    const out = new Map();
    for (const a of ativos()) {
      const c = cMap.get(a.conta);
      out.set(a.id, { ativo: a, conta: c, moeda: moedaDe(a, c), classe: a.classe, qtd: 0, custo: 0, custoBRL: 0, realizado: 0, proventos: 0, ops: 0 });
    }
    const conversoes = new Map(); // conversão/incorporação: o custo do ativo antigo passa para o novo
    for (const m of ordenar(movs())) {
      if (!m.ativo || (m.data || '') > limite) continue;
      const p = out.get(m.ativo);
      if (!p) continue;
      const cb = cambioMov(m, p.moeda);
      const q = Number(m.qtd) || 0;
      const pr = Number(m.preco) || 0;
      const tx = Number(m.taxas) || 0;
      p.ops++;
      switch (m.tipo) {
        case 'inicial':
        case 'compra': {
          const herdado = m.conv && conversoes.get(m.conv);
          if (herdado) {
            conversoes.delete(m.conv);
            p.qtd += q; p.custo += herdado.custo; p.custoBRL += herdado.custoBRL;
            break;
          }
          const tot = q * pr + tx;
          p.qtd += q; p.custo += tot; p.custoBRL += tot * cb;
          break;
        }
        case 'venda': {
          if (p.qtd <= 0) break;
          const qq = Math.min(q, p.qtd);
          const pm = p.custo / p.qtd;
          const pmB = p.custoBRL / p.qtd;
          if (m.conv) conversoes.set(m.conv, { custo: pm * qq, custoBRL: pmB * qq });
          else p.realizado += (qq * pr - tx) * cb - pmB * qq;
          p.custo -= pm * qq; p.custoBRL -= pmB * qq; p.qtd -= qq;
          // Sobra mínima depois de vender (extrato arredonda a 5 casas): considera zerado.
          if (p.qtd < 0.0001) { p.qtd = 0; p.custo = 0; p.custoBRL = 0; }
          break;
        }
        case 'ajuste': { // corrige a quantidade sem lucro/prejuízo: entra/sai pelo preço médio
          if (q < 0 && p.qtd > 0) {
            const qq = Math.min(-q, p.qtd);
            const f = qq / p.qtd;
            p.custo -= p.custo * f; p.custoBRL -= p.custoBRL * f; p.qtd -= qq;
            if (p.qtd < 1e-9) { p.qtd = 0; p.custo = 0; p.custoBRL = 0; }
          } else if (q > 0) {
            const pmU = p.qtd > 0 ? p.custo / p.qtd : pr;
            const pmB = p.qtd > 0 ? p.custoBRL / p.qtd : pr * cb;
            p.qtd += q; p.custo += pmU * q; p.custoBRL += pmB * q;
          }
          break;
        }
        case 'desdobramento': if (m.fator > 0) p.qtd *= m.fator; break;
        case 'grupamento': if (m.fator > 0) p.qtd /= m.fator; break;
        case 'bonificacao': p.qtd += q; p.custo += q * pr; p.custoBRL += q * pr * cb; break;
        case 'provento': p.proventos += (Number(m.valor) || 0) * cb; break;
        default: break;
      }
    }
    const dol = dolarAtual();
    for (const p of out.values()) {
      const preco = Number(p.ativo.preco) || 0;
      p.pm = p.qtd > 0 ? p.custo / p.qtd : 0;
      p.semCotacao = p.qtd > 0 && !(preco > 0);
      const precoUsado = preco > 0 ? preco : p.pm;
      // Sem dólar atual (offline na 1ª vez): usa o câmbio médio das compras.
      const fx = p.moeda === 'USD' ? dol || (p.custo ? p.custoBRL / p.custo : 0) : 1;
      p.preco = precoUsado;
      p.valorMoeda = p.qtd * precoUsado;
      p.valor = p.valorMoeda * fx;
      p.ganho = p.valor - p.custoBRL;
      p.rent = p.custoBRL > 0 ? p.ganho / p.custoBRL : null;
    }
    return [...out.values()];
  }

  /** Contas acompanhadas pelo saldo (reserva, previdência…), sempre em reais. */
  function contasSaldo(ate = null) {
    const limite = ate || fmt.todayISO();
    const todas = ordenar(movs());
    return contas().filter((c) => c.tipo === 'saldo').map((c) => {
      let valor = 0;
      let investido = 0;
      let ultimoSaldo = null;
      for (const m of todas) {
        if (m.conta !== c.id || m.ativo || (m.data || '') > limite) continue;
        const v = Number(m.valor) || 0;
        if (m.tipo === 'aporte') { valor += v; investido += v; } else if (m.tipo === 'resgate') { valor -= v; investido -= v; } else if (m.tipo === 'saldo') { valor = v; ultimoSaldo = m.data; }
      }
      return { conta: c, classe: c.classe || 'outro', valor, investido, ganho: valor - investido, rent: investido > 0 ? (valor - investido) / investido : null, ultimoSaldo };
    });
  }

  /* ---------------- Proventos ---------------- */

  function proventos() {
    const hoje = fmt.todayISO();
    const ym = fmt.currentYM();
    const ini12 = fmt.addMonths(ym, -11);
    const aMap = new Map(ativos().map((a) => [a.id, a]));
    const lista = [];
    for (const m of movs()) {
      if (m.tipo !== 'provento') continue;
      const a = aMap.get(m.ativo);
      const moeda = m.moedaValor || moedaDe(a);
      const valorBRL = (Number(m.valor) || 0) * cambioMov(m, moeda);
      lista.push({ mov: m, ativo: a, moeda, valorMoeda: Number(m.valor) || 0, valor: valorBRL, data: m.data, futuro: (m.data || '') > hoje });
    }
    lista.sort((a, b) => (b.data || '').localeCompare(a.data || ''));
    const recebidos = lista.filter((p) => !p.futuro);
    const porMes = {};
    for (const p of recebidos) { const k = p.data.slice(0, 7); porMes[k] = (porMes[k] || 0) + p.valor; }
    const soma = (arr) => arr.reduce((s, p) => s + p.valor, 0);
    const ult12 = recebidos.filter((p) => p.data.slice(0, 7) >= ini12);
    const porAtivo = new Map();
    for (const p of ult12) {
      const k = p.ativo?.ticker || '—';
      porAtivo.set(k, (porAtivo.get(k) || 0) + p.valor);
    }
    return {
      lista, recebidos, aReceber: lista.filter((p) => p.futuro).sort((a, b) => a.data.localeCompare(b.data)),
      total: soma(recebidos), doze: soma(ult12), mes: porMes[ym] || 0, mediaMensal: soma(ult12) / 12,
      totalAReceber: soma(lista.filter((p) => p.futuro)), porMes,
      porAtivo: [...porAtivo.entries()].map(([label, total]) => ({ label, total })).sort((a, b) => b.total - a.total),
    };
  }

  /* ---------------- Resumo da carteira ---------------- */

  function resumo() {
    const pos = posicoes();
    const abertas = pos.filter((p) => p.qtd > 0);
    const sal = contasSaldo();
    const prov = proventos();
    const patrimonio = abertas.reduce((s, p) => s + p.valor, 0) + sal.reduce((s, c) => s + c.valor, 0);
    const investido = abertas.reduce((s, p) => s + p.custoBRL, 0) + sal.reduce((s, c) => s + Math.max(0, c.investido), 0);
    const realizado = pos.reduce((s, p) => s + p.realizado, 0);
    const porClasse = {};
    for (const p of abertas) porClasse[p.classe] = (porClasse[p.classe] || 0) + p.valor;
    for (const c of sal) porClasse[c.classe] = (porClasse[c.classe] || 0) + c.valor;
    const porConta = {};
    for (const p of abertas) porConta[p.ativo.conta] = (porConta[p.ativo.conta] || 0) + p.valor;
    for (const c of sal) porConta[c.conta.id] = (porConta[c.conta.id] || 0) + c.valor;
    const ganho = patrimonio - investido;
    return {
      posicoes: pos, abertas, contasSaldo: sal, proventos: prov,
      patrimonio, investido, ganho, realizado,
      lucro: ganho + prov.total + realizado,
      variacao: investido > 0 ? ganho / investido : null,
      porClasse, porConta,
      exterior: Object.entries(porClasse).filter(([k]) => EXTERIOR.has(k)).reduce((s, [, v]) => s + v, 0),
      semCotacao: abertas.filter((p) => p.semCotacao).length,
    };
  }

  /* ---------------- Fluxos, histórico e rentabilidade ---------------- */

  /** Aportes líquidos por mês, em R$ (compras + aportes − vendas − resgates). "inicial" não conta. */
  function fluxos() {
    const out = {};
    const aMap = new Map(ativos().map((a) => [a.id, a]));
    const cMap = new Map(S.list('invContas').map((c) => [c.id, c]));
    for (const m of movs()) {
      if (!m.data || m.conv) continue; // conversões não são aporte nem resgate
      const k = m.data.slice(0, 7);
      const f = out[k] || (out[k] = { entra: 0, sai: 0 });
      const a = aMap.get(m.ativo);
      const cb = cambioMov(m, a ? moedaDe(a, cMap.get(a.conta)) : 'BRL');
      const q = Number(m.qtd) || 0;
      const pr = Number(m.preco) || 0;
      const tx = Number(m.taxas) || 0;
      if (m.tipo === 'compra') f.entra += (q * pr + tx) * cb;
      else if (m.tipo === 'venda') f.sai += (q * pr - tx) * cb;
      else if (m.tipo === 'aporte') f.entra += Number(m.valor) || 0;
      else if (m.tipo === 'resgate') f.sai += Number(m.valor) || 0;
    }
    for (const f of Object.values(out)) f.liquido = f.entra - f.sai;
    return out;
  }

  const fimDoMes = (ym) => { const [y, m] = ym.split('-').map(Number); return `${ym}-${String(new Date(y, m, 0).getDate()).padStart(2, '0')}`; };

  function investidoEm(dataISO) {
    const pos = posicoes(dataISO).filter((p) => p.qtd > 0).reduce((s, p) => s + p.custoBRL, 0);
    return pos + contasSaldo(dataISO).reduce((s, c) => s + Math.max(0, c.investido), 0);
  }

  /**
   * Linha do tempo mês a mês: aplicado, patrimônio (quando conhecido), aportes, proventos e
   * rentabilidade. Começa no 1º mês com operação ou foto.
   */
  function historico(r = resumo()) {
    const fotos = new Map(S.list('invHist').map((h) => [h.id, h]));
    const datas = [...movs().map((m) => (m.data || '').slice(0, 7)), ...fotos.keys()].filter(Boolean).sort();
    if (!datas.length) return [];
    const atual = fmt.currentYM();
    const fl = fluxos();
    const prov = r.proventos.porMes;
    const out = [];
    let anterior = null;
    for (let m = datas[0]; m <= atual && out.length < 240; m = fmt.addMonths(m, 1)) {
      const foto = fotos.get(m);
      const aplicado = foto?.manual && foto.investido != null ? foto.investido : m === atual ? r.investido : investidoEm(fimDoMes(m));
      const patrimonio = m === atual ? r.patrimonio : foto ? foto.patrimonio : null;
      const f = fl[m]?.liquido ?? (foto?.manual && anterior?.aplicado != null ? aplicado - anterior.aplicado : 0);
      const pv = prov[m] || 0;
      let rent = null;
      // Mês importado do Investidor 10 (e não corrigido pelos extratos): vale a rentabilidade calculada por ele.
      if (foto?.rentI10 != null && foto.fonte === 'i10' && m !== atual) rent = foto.rentI10;
      else if (patrimonio != null && anterior?.patrimonio != null) {
        const base = anterior.patrimonio + f / 2;
        if (base > 0) rent = (patrimonio - anterior.patrimonio - f + pv) / base;
      }
      const item = { ym: m, aplicado, patrimonio, ganho: patrimonio != null ? patrimonio - aplicado : null, aportes: f, proventos: pv, rent, foto };
      out.push(item);
      anterior = item;
    }
    return out;
  }

  /** Rentabilidade acumulada (composta) de uma lista de meses. */
  function acumulada(meses) {
    const com = meses.filter((m) => m.rent != null);
    if (!com.length) return null;
    return com.reduce((acc, m) => acc * (1 + m.rent), 1) - 1;
  }

  /** Guarda a foto do mês atual (no máx. uma gravação por dia, ou se o valor mudou). */
  function salvarFoto(r) {
    const id = fmt.currentYM();
    const hoje = fmt.todayISO();
    const ant = S.list('invHist').find((h) => h.id === id);
    const pat = r2(r.patrimonio);
    if (ant && ant.em === hoje && Math.abs((ant.patrimonio || 0) - pat) < 0.01) return;
    if (!(pat > 0) && !ant) return;
    S.upsert('invHist', {
      id, patrimonio: pat, investido: r2(r.investido), em: hoje, manual: false,
      porClasse: Object.fromEntries(Object.entries(r.porClasse).map(([k, v]) => [k, r2(v)])), dolar: dolarAtual(),
    });
  }

  /* ---------------- Metas, reserva e alocação ---------------- */

  function progressoMeta(meta, r) {
    let atual = 0;
    if (meta.tipo === 'patrimonio') atual = r.patrimonio;
    else if (meta.tipo === 'classes') atual = (meta.classes || []).reduce((s, k) => s + (r.porClasse[k] || 0), 0);
    else if (meta.tipo === 'proventos') atual = r.proventos.mediaMensal;
    else if (meta.tipo === 'conta') atual = r.porConta[meta.conta] || 0;
    const alvo = Number(meta.alvo) || 0;
    const falta = Math.max(0, alvo - atual);
    const pct = alvo > 0 ? Math.min(1, atual / alvo) : 0;
    const aporte = Number(meta.aporteMensal) || 0;
    const meses = meta.tipo !== 'proventos' && aporte > 0 && falta > 0 ? Math.ceil(falta / aporte) : null;
    return { meta, atual, alvo, falta, pct, meses, conclusao: meses ? fmt.addMonths(fmt.currentYM(), meses) : null, concluida: alvo > 0 && atual >= alvo };
  }

  /** Reserva de emergência em meses de despesa (média dos 6 meses fechados). */
  function reserva(r) {
    const valor = r.porClasse.reserva || 0;
    const hist = Fin.finance.historico(fmt.addMonths(fmt.currentYM(), -1), 6).filter((m) => m.despesas > 0);
    const media = hist.length ? hist.reduce((s, m) => s + m.despesas, 0) / hist.length : 0;
    return { valor, mediaDespesas: media, meses: media > 0 ? valor / media : null, mesesBase: hist.length };
  }

  function alocacao(r) {
    const ideal = config('alocacao')?.ideal || {};
    const total = r.patrimonio || 0;
    const ids = new Set([...Object.keys(r.porClasse).filter((k) => r.porClasse[k] > 0.005), ...Object.keys(ideal).filter((k) => ideal[k] > 0)]);
    return [...ids].map((id) => ({
      classe: classe(id), valor: r.porClasse[id] || 0,
      atual: total > 0 ? (r.porClasse[id] || 0) / total : 0,
      ideal: ideal[id] != null ? ideal[id] / 100 : null,
    })).sort((a, b) => b.valor - a.valor || (b.ideal || 0) - (a.ideal || 0));
  }

  /* ---------------- Ligação com os Lançamentos ---------------- */

  /** Garante a categoria de despesa marcada como investimento (aporte). */
  function garantirCategoria() {
    const cats = S.list('categorias');
    if (cats.some((c) => c.tipo === 'despesa' && c.investimento)) return;
    const mesmo = cats.find((c) => c.tipo === 'despesa' && N(c.nome) === 'investimentos');
    if (mesmo) S.upsert('categorias', { id: mesmo.id, investimento: true });
    else S.upsert('categorias', { nome: 'Investimentos', icone: '📈', tipo: 'despesa', classificacao: 'Investimentos', orcamentoMensal: 0, investimento: true });
  }

  /** Aportes do mês lançados nos Lançamentos × aportes registrados na carteira. */
  function conferenciaAportes(ym) {
    const lanc = Fin.finance.aportesDoMes(ym);
    const lancado = lanc.reduce((s, l) => s + Fin.finance.valor(l), 0);
    const f = fluxos()[ym] || { entra: 0, sai: 0, liquido: 0 };
    return { lancamentos: lanc, lancado, registrado: f.liquido, entra: f.entra, sai: f.sai, diferenca: r2(lancado - f.liquido) };
  }

  /* ---------------- Primeiros passos ---------------- */

  function criarContasPadrao() {
    const existentes = new Set(S.list('invContas').map((c) => N(c.nome)));
    const padrao = [
      { nome: 'Rico', tipo: 'corretora', moeda: 'BRL', icone: '🏦' },
      { nome: 'Nomad', tipo: 'corretora', moeda: 'USD', icone: '🌎' },
      { nome: 'Reserva de emergência', tipo: 'saldo', moeda: 'BRL', classe: 'reserva', icone: '🛟' },
    ].filter((c) => !existentes.has(N(c.nome)));
    if (padrao.length) S.set('invContas', [...S.list('invContas'), ...padrao.map((c) => ({ ...c, id: S.uid(), criadoEm: new Date().toISOString() }))]);
    garantirCategoria();
  }

  /** Remove o ativo e todas as suas operações. */
  function excluirAtivo(id) {
    S.set('invMovs', S.list('invMovs').filter((m) => m.ativo !== id));
    S.remove('invAtivos', id);
  }

  function excluirConta(id) {
    const ids = new Set(ativos().filter((a) => a.conta === id).map((a) => a.id));
    S.set('invMovs', S.list('invMovs').filter((m) => m.conta !== id && !ids.has(m.ativo)));
    S.set('invAtivos', ativos().filter((a) => a.conta !== id));
    S.remove('invContas', id);
  }

  return {
    CLASSES, classe, TIPOS, EXTERIOR,
    contas, conta, ativos, ativo, movs, metas, temDados, config, salvarConfig,
    sugerirClasse, obterAtivo, posicoes, contasSaldo, proventos, resumo, fluxos, historico, acumulada,
    salvarFoto, progressoMeta, reserva, alocacao, garantirCategoria, conferenciaAportes,
    criarContasPadrao, excluirAtivo, excluirConta, dolarAtual, ordenar,
  };
})();
