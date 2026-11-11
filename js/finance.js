/**
 * finance.js — Regras de negócio e cálculos (sem nenhuma tela).
 *
 * Convenções importantes:
 * - Um lançamento pertence ao mês da sua COMPETÊNCIA ("AAAA-MM").
 * - Valor considerado: o valor pago, se já foi pago; senão, o valor previsto.
 * - Compras do cartão NÃO entram nas despesas: o gasto já aparece no
 *   lançamento "Pagamento Fatura". Elas servem para detalhar cada fatura.
 */
window.Fin = window.Fin || {};

Fin.finance = (() => {
  const S = Fin.storage;
  const fmt = Fin.fmt;

  const lancamentos = () => S.list('lancamentos');

  const dataRef = (l) => l.vencimento || l.data || l.dataPagamento || null;
  const competencia = (l) => l.competencia || (dataRef(l) || '').slice(0, 7);

  /**
   * Valor do lançamento: o valor pago quando quitado (pode ter juros/desconto);
   * senão o previsto. Pagamento parcial conta pelo total devido (o que falta vai para "A pagar").
   */
  function valor(l) {
    // Valor pago 0 em item "pago" = campo não preenchido na planilha → usa o previsto.
    if (l.status === 'pago' && l.valorPago) return l.valorPago;
    return l.valorPrevisto ?? l.valorPago ?? 0;
  }

  /** Status considerando a data de hoje: conta aberta com vencimento passado vira "atrasado". */
  function statusEfetivo(l) {
    if (l.status === 'pago' || l.status === 'parcial') return l.status;
    if (l.status === 'atrasado') return 'atrasado';
    const d = dataRef(l);
    return d && d < fmt.todayISO() ? 'atrasado' : 'aberto';
  }

  const isPago = (l) => statusEfetivo(l) === 'pago';

  function doMes(ym, list = lancamentos()) {
    return list.filter((l) => competencia(l) === ym);
  }

  function resumo(ym, list = doMes(ym)) {
    const r = { receitas: 0, recebido: 0, despesas: 0, pago: 0, aPagar: 0, qtdAPagar: 0, atrasadas: 0, qtd: list.length };
    for (const l of list) {
      const v = valor(l);
      const st = statusEfetivo(l);
      if (l.tipo === 'receita') {
        r.receitas += v;
        if (st === 'pago') r.recebido += v;
        else if (st === 'parcial') r.recebido += l.valorPago || 0;
      } else {
        r.despesas += v;
        if (st === 'pago') r.pago += v;
        else {
          const jaPago = st === 'parcial' ? l.valorPago || 0 : 0;
          if (st === 'parcial') r.pago += jaPago;
          r.aPagar += Math.max(0, (l.valorPrevisto ?? v) - jaPago);
          r.qtdAPagar++;
          if (st === 'atrasado') r.atrasadas++;
        }
      }
    }
    r.saldo = r.receitas - r.despesas;
    r.saldoRealizado = r.recebido - r.pago;
    return r;
  }

  /** Totais por categoria no mês, do maior para o menor. */
  function porCategoria(ym, tipo = 'despesa') {
    const map = new Map();
    for (const l of doMes(ym)) {
      if (l.tipo !== tipo) continue;
      const cur = map.get(l.categoria) || { categoria: l.categoria, icone: l.categoriaIcone, total: 0, qtd: 0 };
      cur.total += valor(l);
      cur.qtd++;
      map.set(l.categoria, cur);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }

  /** Receitas e despesas dos últimos n meses até ym (inclusive). */
  function historico(ym, n = 6) {
    const all = lancamentos();
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
      const m = fmt.addMonths(ym, -i);
      const r = resumo(m, doMes(m, all));
      out.push({ ym: m, receitas: r.receitas, despesas: r.despesas, saldo: r.saldo });
    }
    return out;
  }

  /** Despesas ainda não pagas do mês, por vencimento. */
  function contasAbertas(ym) {
    return doMes(ym)
      .filter((l) => l.tipo === 'despesa' && !isPago(l))
      .sort((a, b) => (dataRef(a) || '').localeCompare(dataRef(b) || ''));
  }

  /** Total de cada fatura de cartão com vencimento no mês ym. */
  function faturas(ym) {
    const map = new Map();
    for (const c of S.list('cartaoCompras')) {
      if (c.fatura !== ym) continue;
      const cur = map.get(c.cartao) || { cartao: c.cartao, total: 0, qtd: 0 };
      cur.total += c.valor || 0;
      cur.qtd++;
      map.set(c.cartao, cur);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }

  /** Mês inicial: o atual, se tiver lançamentos; senão o último mês com dados. */
  function mesInicial() {
    const atual = fmt.currentYM();
    const meses = [...new Set(lancamentos().map(competencia))].filter(Boolean).sort();
    if (!meses.length || meses.includes(atual)) return atual;
    const anteriores = meses.filter((m) => m <= atual);
    return anteriores.length ? anteriores[anteriores.length - 1] : meses[0];
  }

  function categorias(tipo) {
    return S.list('categorias')
      .filter((c) => !tipo || c.tipo === tipo)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  function formasPagamento() {
    const map = new Map();
    for (const l of lancamentos()) if (l.formaPagamento) map.set(l.formaPagamento, l.formaPagamentoIcone);
    return [...map.entries()].map(([nome, icone]) => ({ nome, icone })).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  /** Alterna entre pago e aberto (preserva o valor/data pagos para poder desfazer). */
  function togglePago(id) {
    const l = lancamentos().find((x) => x.id === id);
    if (!l) return null;
    if (isPago(l)) return S.upsert('lancamentos', { id, status: 'aberto' });
    return S.upsert('lancamentos', {
      id,
      status: 'pago',
      valorPago: l.status === 'parcial' ? l.valorPrevisto ?? l.valorPago : l.valorPago || l.valorPrevisto,
      dataPagamento: l.dataPagamento || fmt.todayISO(),
    });
  }

  /* ================= Cartões de crédito ================= */

  const N = (v) => Fin.parsers.normalize(v);
  const compras = () => S.list('cartaoCompras');
  const pad = (n) => String(n).padStart(2, '0');

  /** Lançamento que representa o pagamento de uma fatura (categoria contém "fatura"). */
  const isPagamentoFatura = (l) => l.tipo === 'despesa' && /fatura/.test(N(l.categoria));

  /**
   * Em qual fatura (mês de vencimento "AAAA-MM") cai uma compra feita em dataISO.
   * Compra no dia do fechamento ou depois vai para o ciclo seguinte.
   */
  function faturaDaCompra(cfg, dataISO) {
    const ym = dataISO.slice(0, 7);
    const dia = Number(dataISO.slice(8, 10));
    if (!cfg || !cfg.diaFechamento) return fmt.addMonths(ym, 1);
    const mesFechamento = dia < cfg.diaFechamento ? ym : fmt.addMonths(ym, 1);
    const venc = cfg.diaVencimento || 10;
    return venc > cfg.diaFechamento ? mesFechamento : fmt.addMonths(mesFechamento, 1);
  }

  /** Data de vencimento da fatura do mês ym (ajusta para o último dia, ex.: 31 em fevereiro). */
  function vencimentoFatura(cfg, ym) {
    if (!cfg || !cfg.diaVencimento) return null;
    const [y, m] = ym.split('-').map(Number);
    const ultimo = new Date(y, m, 0).getDate();
    return `${ym}-${pad(Math.min(cfg.diaVencimento, ultimo))}`;
  }

  /** Descobre o dia de vencimento (pelos pagamentos) e o de fechamento (pelas compras importadas). */
  function inferirConfig(nome, chave) {
    const k = N(chave);
    const dias = lancamentos()
      .filter((l) => isPagamentoFatura(l) && k && ` ${N(l.descricao)} `.includes(` ${k} `) && l.vencimento)
      .map((l) => Number(l.vencimento.slice(8, 10)));
    const moda = (arr) => {
      const c = {};
      arr.forEach((d) => (c[d] = (c[d] || 0) + 1));
      return Number(Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0]) || null;
    };
    const diaVencimento = moda(dias);

    // Testa todos os dias de fechamento e fica com o que acerta mais faturas.
    const amostra = compras().filter((c) => c.cartao === nome && c.data && c.fatura && (!c.parcela || c.parcela.atual === 1));
    let diaFechamento = null;
    if (diaVencimento && amostra.length >= 5) {
      let melhor = -1;
      for (let d = 1; d <= 31; d++) {
        const cfg = { diaFechamento: d, diaVencimento };
        const acertos = amostra.filter((c) => faturaDaCompra(cfg, c.data) === c.fatura).length;
        if (acertos > melhor) { melhor = acertos; diaFechamento = d; }
      }
    }
    return { diaVencimento, diaFechamento };
  }

  /** Palavra do nome do cartão que aparece na descrição dos pagamentos ("Ourocard Elo" → "ourocard"). */
  function adivinharChave(nome) {
    const pagamentos = lancamentos().filter(isPagamentoFatura).map((l) => ` ${N(l.descricao)} `);
    const tokens = N(nome).split(' ').filter((t) => t.length >= 3);
    return tokens.find((t) => pagamentos.some((p) => p.includes(` ${t} `))) || tokens[0] || '';
  }

  /** Lista de cartões. Cria automaticamente a configuração dos cartões vindos da importação. */
  function cartoes() {
    const cfgs = S.list('cartoes');
    const conhecidos = new Set(cfgs.map((c) => c.nome));
    const novos = [...new Set(compras().map((c) => c.cartao))].filter((n) => n && !conhecidos.has(n));
    if (novos.length) {
      for (const nome of novos) {
        const palavraChave = adivinharChave(nome);
        cfgs.push({ id: S.uid(), nome, palavraChave, limite: null, ...inferirConfig(nome, palavraChave) });
      }
      S.set('cartoes', cfgs);
    }
    return [...cfgs].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  const cartao = (nome) => cartoes().find((c) => c.nome === nome) || null;

  function comprasDaFatura(nome, ym) {
    return compras().filter((c) => (!nome || c.cartao === nome) && c.fatura === ym);
  }

  const soma = (arr, f = (x) => x.valor || 0) => Math.round(arr.reduce((s, x) => s + f(x), 0) * 100) / 100;

  /** Lançamento de pagamento da fatura do cartão no mês ym (ou null). */
  function pagamentoDaFatura(cfg, ym) {
    const k = N(cfg?.palavraChave);
    if (!k) return null;
    return doMes(ym).find((l) => isPagamentoFatura(l) && ` ${N(l.descricao)} `.includes(` ${k} `)) || null;
  }

  /** Limite comprometido: soma das faturas a partir do mês atual (inclui parcelas futuras). */
  function limiteUsado(nome) {
    const atual = fmt.currentYM();
    return soma(compras().filter((c) => c.cartao === nome && c.fatura >= atual));
  }

  /** Compras da fatura agrupadas por categoria. nome = null → todos os cartões. */
  function faturaPorCategoria(nome, ym) {
    const map = new Map();
    for (const c of comprasDaFatura(nome, ym)) {
      const cur = map.get(c.categoria) || { categoria: c.categoria, icone: c.categoriaIcone, total: 0, qtd: 0 };
      cur.total += c.valor || 0;
      cur.qtd++;
      map.set(c.categoria, cur);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }

  /**
   * Despesas por categoria trocando "Pagamento Fatura" pelas categorias reais das compras.
   * Se o pagamento for maior que a soma das compras, a diferença aparece como "Fatura (sem detalhe)".
   */
  function porCategoriaDetalhada(ym) {
    const base = porCategoria(ym, 'despesa');
    const pagFatura = base.filter((c) => /fatura/.test(N(c.categoria)));
    if (!pagFatura.length) return base;
    const totalDespesas = base.reduce((s, c) => s + c.total, 0);
    const totalPagFatura = pagFatura.reduce((s, c) => s + c.total, 0);
    const map = new Map(base.filter((c) => !pagFatura.includes(c)).map((c) => [c.categoria, { ...c }]));

    // Se as compras somam MAIS que o pagamento lançado (fatura paga em parte, rotativo…),
    // distribui o valor pago proporcionalmente entre as categorias das compras.
    // Assim o total detalhado sempre bate com as despesas do mês.
    const comprasCats = faturaPorCategoria(null, ym).filter((c) => c.total > 0);
    const somaCompras = comprasCats.reduce((s, c) => s + c.total, 0);
    const fator = somaCompras > totalPagFatura && somaCompras > 0 ? totalPagFatura / somaCompras : 1;

    for (const c of comprasCats) {
      const cur = map.get(c.categoria) || { categoria: c.categoria, icone: c.icone, total: 0, qtd: 0 };
      cur.total += c.total * fator;
      cur.qtd += c.qtd;
      map.set(c.categoria, cur);
    }
    // Créditos/estornos podem deixar uma categoria negativa: ela sai do gráfico e
    // a diferença é recalculada sobre o que sobrou, para o total bater com as despesas.
    const lista = [...map.values()].filter((c) => c.total > 0.005);
    const resto = totalDespesas - lista.reduce((s, c) => s + c.total, 0);
    if (resto > 0.5) lista.push({ categoria: 'Fatura (sem detalhe)', icone: '💳', total: resto, qtd: 0 });
    return lista.sort((a, b) => b.total - a.total);
  }

  /** Cria ou atualiza o lançamento de pagamento da fatura com o total das compras. */
  function sincronizarPagamento(cfg, ym) {
    const total = soma(comprasDaFatura(cfg.nome, ym));
    const pag = pagamentoDaFatura(cfg, ym);
    if (pag) return S.upsert('lancamentos', { id: pag.id, valorPrevisto: total });

    if (!cfg.palavraChave) S.upsert('cartoes', { id: cfg.id, palavraChave: N(cfg.nome).split(' ')[0] });
    const cat = categorias('despesa').find((c) => /fatura/.test(N(c.nome)));
    const venc = vencimentoFatura(cfg, ym) || `${ym}-10`;
    return S.upsert('lancamentos', {
      origem: 'app',
      tipo: 'despesa',
      descricao: `CARTÃO - ${cfg.nome.toUpperCase()}`,
      categoria: cat?.nome || 'Pagamento Fatura',
      categoriaIcone: cat?.icone || '💳',
      valorPrevisto: total,
      valorPago: null,
      status: 'aberto',
      vencimento: venc,
      data: venc,
      dataPagamento: null,
      competencia: ym,
      formaPagamento: null,
      formaPagamentoIcone: null,
      observacao: 'Gerado pela tela de Cartões',
    });
  }

  /**
   * Cria as parcelas de uma compra. Cada parcela vira um registro na fatura do seu mês.
   * O centavo que sobra da divisão fica na 1ª parcela.
   */
  function criarCompra({ cartao: nome, data, descricao, categoria, categoriaIcone, valorTotal, parcelas, fatura, observacao }) {
    const n = Math.max(1, Math.min(72, parcelas || 1));
    const centavos = Math.round(valorTotal * 100);
    const base = Math.trunc(centavos / n);
    const grupo = S.uid();
    const lista = S.list('cartaoCompras');
    for (let i = 0; i < n; i++) {
      const v = (i === 0 ? centavos - base * (n - 1) : base) / 100;
      lista.push({
        id: S.uid(),
        grupo,
        origem: 'app',
        cartao: nome,
        data,
        fatura: fmt.addMonths(fatura, i),
        descricao,
        categoria,
        categoriaIcone: categoriaIcone || null,
        valor: v,
        parcela: n > 1 ? { atual: i + 1, total: n } : null,
        valorTotalCompra: n > 1 ? valorTotal : null,
        observacao: observacao || null,
        criadoEm: new Date().toISOString(),
      });
    }
    S.set('cartaoCompras', lista);
    return grupo;
  }

  /* ================= Recorrência (parcelado e fixo mensal) ================= */

  /**
   * Cria n lançamentos ligados por um "grupo", um por mês.
   * - parcelado: divide o valor (centavos que sobram ficam na 1ª parcela)
   * - fixo: repete o mesmo valor todo mês
   * Só o 1º herda status/pagamento informados; os demais nascem "em aberto".
   */
  function criarRepetidos(base, modo, n) {
    const grupo = S.uid();
    const agora = new Date().toISOString();
    const centavos = Math.round(base.valorPrevisto * 100);
    const parte = Math.trunc(centavos / n);
    const lista = S.list('lancamentos');
    for (let i = 0; i < n; i++) {
      const venc = fmt.addMonthsISO(base.vencimento, i);
      const valorParcela = modo === 'parcelado' ? (i === 0 ? centavos - parte * (n - 1) : parte) / 100 : base.valorPrevisto;
      lista.push({
        ...base,
        id: S.uid(),
        grupo,
        recorrencia: modo,
        parcela: { atual: i + 1, total: n },
        valorPrevisto: valorParcela,
        vencimento: venc,
        data: i === 0 ? base.data : venc,
        competencia: fmt.addMonths(base.competencia, i),
        status: i === 0 ? base.status : 'aberto',
        // No parcelado, o "valor pago" digitado refere-se ao total: limita à 1ª parcela.
        valorPago: i === 0 && base.valorPago != null ? Math.min(base.valorPago, valorParcela) : null,
        dataPagamento: i === 0 ? base.dataPagamento : null,
        criadoEm: agora,
      });
    }
    S.set('lancamentos', lista);
    return grupo;
  }

  /** Lançamentos do mesmo grupo a partir deste (inclusive), por competência. */
  const esteEProximos = (l, x) => x.id === l.id || (l.grupo && x.grupo === l.grupo && competencia(x) > competencia(l));

  /** Aplica campos aos PRÓXIMOS do grupo (o próprio lançamento é salvo pelo formulário). */
  function atualizarProximos(l, campos) {
    const agora = new Date().toISOString();
    S.set('lancamentos', lancamentos().map((x) => (x.id !== l.id && esteEProximos(l, x) ? { ...x, ...campos, atualizadoEm: agora } : x)));
  }

  /** Exclui só este ou este e os próximos do grupo. Retorna quantos saíram. */
  function excluirLancamento(l, escopo = 'este') {
    const antes = lancamentos();
    const fica = antes.filter((x) => !(escopo === 'proximos' ? esteEProximos(l, x) : x.id === l.id));
    S.set('lancamentos', fica);
    return antes.length - fica.length;
  }

  /* ================= Categorias e orçamento ================= */

  function usosCategoria(nome, tipo) {
    const lanc = lancamentos().filter((l) => l.categoria === nome && l.tipo === tipo).length;
    const comp = tipo === 'despesa' ? compras().filter((c) => c.categoria === nome).length : 0;
    return { lancamentos: lanc, compras: comp, total: lanc + comp };
  }

  /** Troca a categoria (nome/ícone) em todos os lançamentos e compras que a usam. */
  function moverCategoria(de, para, tipo, icone) {
    const troca = (x) => ({ ...x, categoria: para, categoriaIcone: icone ?? null });
    S.set('lancamentos', lancamentos().map((l) => (l.categoria === de && l.tipo === tipo ? troca(l) : l)));
    if (tipo === 'despesa') S.set('cartaoCompras', compras().map((c) => (c.categoria === de ? troca(c) : c)));
  }

  /**
   * Orçamento do mês. O gasto de cada categoria considera as compras do cartão
   * pela categoria de cada compra (e não como "Pagamento Fatura").
   */
  function orcamento(ym) {
    const gastos = new Map(porCategoriaDetalhada(ym).map((c) => [c.categoria, c.total]));
    const cats = categorias('despesa');
    const itens = cats
      .filter((c) => c.orcamentoMensal > 0)
      .map((c) => {
        const gasto = gastos.get(c.nome) || 0;
        return { id: c.id, categoria: c.nome, icone: c.icone, orcado: c.orcamentoMensal, gasto, pct: gasto / c.orcamentoMensal };
      })
      .sort((a, b) => b.pct - a.pct);
    const comOrcamento = new Set(itens.map((i) => i.categoria));
    const semOrcamento = [...gastos.entries()]
      .filter(([nome, total]) => !comOrcamento.has(nome) && total > 0 && !/sem detalhe/i.test(nome))
      .map(([nome, total]) => {
        const c = cats.find((k) => k.nome === nome);
        return { id: c?.id || null, categoria: nome, icone: c?.icone || null, gasto: total };
      })
      .sort((a, b) => b.gasto - a.gasto);
    const totalOrcado = itens.reduce((s, i) => s + i.orcado, 0);
    const totalGasto = itens.reduce((s, i) => s + i.gasto, 0);
    return { itens, semOrcamento, totalOrcado, totalGasto };
  }

  /** Média de gasto da categoria nos n meses anteriores a ym (para sugerir orçamento). */
  function mediaGasto(nome, ym, n = 3) {
    let soma = 0;
    for (let i = 1; i <= n; i++) soma += porCategoriaDetalhada(fmt.addMonths(ym, -i)).find((c) => c.categoria === nome)?.total || 0;
    return Math.round((soma / n) * 100) / 100;
  }

  return {
    criarRepetidos, atualizarProximos, excluirLancamento, usosCategoria, moverCategoria, orcamento, mediaGasto,
    lancamentos, dataRef, competencia, valor, statusEfetivo, isPago, doMes, resumo,
    porCategoria, porCategoriaDetalhada, historico, contasAbertas, faturas, mesInicial, categorias, formasPagamento, togglePago,
    isPagamentoFatura, faturaDaCompra, vencimentoFatura, inferirConfig, cartoes, cartao, comprasDaFatura, soma,
    pagamentoDaFatura, limiteUsado, faturaPorCategoria, sincronizarPagamento, criarCompra,
  };
})();
