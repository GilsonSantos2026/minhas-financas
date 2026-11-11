/**
 * analise.js — Cálculos dos Relatórios: totais de um período, comparação com o
 * período anterior, evolução mês a mês e cortes por categoria, classificação,
 * forma de pagamento e maiores despesas. Sem nenhuma tela.
 *
 * Período = intervalo de meses de competência, de "ini" a "fim" ("AAAA-MM").
 * "detalhar" = trocar "Pagamento Fatura" pelas compras do cartão (categoria real).
 */
window.Fin = window.Fin || {};

Fin.analise = (() => {
  const F = Fin.finance;
  const S = Fin.storage;
  const fmt = Fin.fmt;
  const N = (v) => Fin.parsers.normalize(v);

  function meses(ini, fim) {
    const out = [];
    for (let m = ini; m <= fim && out.length < 240; m = fmt.addMonths(m, 1)) out.push(m);
    return out;
  }

  /** Período imediatamente anterior, com a mesma quantidade de meses. */
  function anterior(ini, fim) {
    const n = meses(ini, fim).length;
    return { ini: fmt.addMonths(ini, -n), fim: fmt.addMonths(ini, -1) };
  }

  const noPeriodo = (ym, ini, fim) => ym >= ini && ym <= fim;
  const variacao = (atual, antes) => (antes ? (atual - antes) / Math.abs(antes) : null);

  function evolucao(ini, fim) {
    let acumulado = 0;
    return meses(ini, fim).map((ym) => {
      const r = F.resumo(ym);
      acumulado += r.saldo;
      return { ym, receitas: r.receitas, despesas: r.despesas, saldo: r.saldo, acumulado };
    });
  }

  function totais(ini, fim) {
    const ev = evolucao(ini, fim);
    const t = ev.reduce((s, m) => ({ receitas: s.receitas + m.receitas, despesas: s.despesas + m.despesas }), { receitas: 0, despesas: 0 });
    const n = ev.length || 1;
    const saldo = t.receitas - t.despesas;
    return {
      ...t,
      saldo,
      meses: ev.length,
      mesesComDados: ev.filter((m) => m.receitas > 0 || m.despesas > 0).length,
      mediaReceitas: t.receitas / n,
      mediaDespesas: t.despesas / n,
      poupanca: t.receitas > 0 ? saldo / t.receitas : null, // % da receita que sobrou
    };
  }

  /**
   * O período anterior serve de comparação? Só se tiver dados em todos os meses —
   * comparar com meses vazios (antes do início dos registros) gera variações enganosas.
   */
  function anteriorCompleto(ini, fim) {
    const ant = anterior(ini, fim);
    const t = totais(ant.ini, ant.fim);
    return t.mesesComDados === t.meses;
  }

  /** Totais do período + variação em relação ao período anterior. */
  function comparativo(ini, fim) {
    const atual = totais(ini, fim);
    const ant = anterior(ini, fim);
    const antes = totais(ant.ini, ant.fim);
    const completo = antes.mesesComDados === antes.meses;
    if (!completo) return { atual, antes, periodoAnterior: ant, completo, delta: { receitas: null, despesas: null, saldo: null, poupanca: null } };
    return {
      atual, antes, periodoAnterior: ant, completo,
      delta: {
        receitas: variacao(atual.receitas, antes.receitas),
        despesas: variacao(atual.despesas, antes.despesas),
        saldo: variacao(atual.saldo, antes.saldo),
        poupanca: atual.poupanca != null && antes.poupanca != null ? atual.poupanca - antes.poupanca : null, // pontos percentuais
      },
    };
  }

  /** Categorias do período (com o total de cada mês), do maior para o menor. */
  function categorias(ini, fim, tipo = 'despesa', detalhar = true) {
    const map = new Map();
    for (const ym of meses(ini, fim)) {
      const lista = tipo === 'despesa' && detalhar ? F.porCategoriaDetalhada(ym) : F.porCategoria(ym, tipo);
      for (const c of lista) {
        const cur = map.get(c.categoria) || { categoria: c.categoria, icone: c.icone, total: 0, porMes: {} };
        cur.total += c.total;
        cur.porMes[ym] = (cur.porMes[ym] || 0) + c.total;
        map.set(c.categoria, cur);
      }
    }
    return [...map.values()].filter((c) => c.total > 0.005).sort((a, b) => b.total - a.total);
  }

  /** Categorias com a variação em relação ao período anterior. */
  function categoriasComparadas(ini, fim, tipo, detalhar) {
    const atuais = categorias(ini, fim, tipo, detalhar);
    if (!anteriorCompleto(ini, fim)) return atuais.map((c) => ({ ...c, antes: null, delta: null }));
    const ant = anterior(ini, fim);
    const antes = new Map(categorias(ant.ini, ant.fim, tipo, detalhar).map((c) => [c.categoria, c.total]));
    return atuais.map((c) => ({ ...c, antes: antes.get(c.categoria) || 0, delta: variacao(c.total, antes.get(c.categoria) || 0) }));
  }

  /** Despesas agrupadas pela classificação da categoria (ex.: Essencial). */
  function porClassificacao(ini, fim, detalhar = true) {
    const classe = new Map(F.categorias('despesa').map((c) => [c.nome, c.classificacao || 'Sem classificação']));
    const map = new Map();
    for (const c of categorias(ini, fim, 'despesa', detalhar)) {
      const k = /sem detalhe/i.test(c.categoria) ? 'Cartão (sem detalhe)' : classe.get(c.categoria) || 'Sem classificação';
      map.set(k, (map.get(k) || 0) + c.total);
    }
    return [...map.entries()].map(([label, total]) => ({ label, total })).sort((a, b) => b.total - a.total);
  }

  /** Como as despesas foram pagas (forma de pagamento dos lançamentos). */
  function porForma(ini, fim) {
    const map = new Map();
    for (const l of F.lancamentos()) {
      if (l.tipo !== 'despesa' || !noPeriodo(F.competencia(l), ini, fim)) continue;
      const k = l.formaPagamento || 'Não informado';
      const cur = map.get(k) || { label: k, icone: l.formaPagamentoIcone, total: 0 };
      cur.total += F.valor(l);
      map.set(k, cur);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }

  /**
   * Itens de despesa do período (lançamentos + compras do cartão quando detalhado).
   * Com "detalhar", o lançamento "Pagamento Fatura" sai e entram as compras.
   */
  function itens(ini, fim, { tipo = 'despesa', detalhar = true, categoria = null } = {}) {
    const out = [];
    for (const l of F.lancamentos()) {
      if (l.tipo !== tipo || !noPeriodo(F.competencia(l), ini, fim)) continue;
      if (tipo === 'despesa' && detalhar && F.isPagamentoFatura(l)) continue;
      out.push({ data: F.dataRef(l), descricao: l.descricao || l.categoria, categoria: l.categoria, icone: l.categoriaIcone, valor: F.valor(l), origem: l.formaPagamento || 'Lançamento', id: l.id, tipoItem: 'lancamento' });
    }
    if (tipo === 'despesa' && detalhar) {
      for (const c of S.list('cartaoCompras')) {
        if (!noPeriodo(c.fatura, ini, fim) || !(c.valor > 0)) continue;
        out.push({ data: c.data, descricao: c.descricao, categoria: c.categoria, icone: c.categoriaIcone, valor: c.valor, origem: `💳 ${c.cartao}`, parcela: c.parcela, id: c.id, tipoItem: 'compra' });
      }
    }
    return (categoria ? out.filter((i) => i.categoria === categoria) : out).sort((a, b) => b.valor - a.valor);
  }

  /** CSV (separador ";" e BOM, abre direto no Excel em português). */
  function csv(ini, fim) {
    const cel = (v) => {
      const s = v == null ? '' : String(v);
      return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const num = (v) => (v == null ? '' : Number(v).toFixed(2).replace('.', ','));
    const linhas = [['Competência', 'Vencimento', 'Data', 'Tipo', 'Descrição', 'Categoria', 'Valor', 'Valor previsto', 'Valor pago', 'Status', 'Forma de pagamento', 'Observação']];
    F.lancamentos()
      .filter((l) => noPeriodo(F.competencia(l), ini, fim))
      .sort((a, b) => (F.dataRef(a) || '').localeCompare(F.dataRef(b) || ''))
      .forEach((l) => linhas.push([
        F.competencia(l), fmt.date(l.vencimento), fmt.date(l.data), l.tipo === 'receita' ? 'Receita' : 'Despesa',
        l.descricao, l.categoria, num(F.valor(l)), num(l.valorPrevisto), num(l.valorPago), F.statusEfetivo(l), l.formaPagamento, l.observacao,
      ]));
    return '﻿' + linhas.map((r) => r.map(cel).join(';')).join('\r\n');
  }

  return { meses, anterior, anteriorCompleto, evolucao, totais, comparativo, categorias, categoriasComparadas, porClassificacao, porForma, itens, csv };
})();
