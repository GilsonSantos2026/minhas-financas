/**
 * periodo.js — Períodos de consulta usados em Lançamentos e na Planilha.
 *
 *  mes      → só o mês escolhido (seletor ‹ ›)
 *  12m      → últimos 12 meses até o mês atual (inclusive)
 *  futuros  → do mês atual em diante
 *  tudo     → todo o histórico
 *  custom   → de/até (só na Planilha)
 *
 * Sempre pelo mês de COMPETÊNCIA do lançamento.
 */
window.Fin = window.Fin || {};

Fin.periodo = (() => {
  const fmt = Fin.fmt;
  const OPCOES = [['mes', 'Mês'], ['12m', '12 meses'], ['futuros', 'Futuros'], ['tudo', 'Tudo']];

  /** Intervalo { ini, fim } em "AAAA-MM". */
  function intervalo(periodo, mesRef, custom = {}) {
    const atual = fmt.currentYM();
    if (periodo === 'mes') return { ini: mesRef, fim: mesRef };
    if (periodo === '12m') return { ini: fmt.addMonths(atual, -11), fim: atual };
    if (periodo === 'futuros') return { ini: atual, fim: '9999-12' };
    if (periodo === 'custom' && custom.ini && custom.fim) return custom.ini <= custom.fim ? { ini: custom.ini, fim: custom.fim } : { ini: custom.fim, fim: custom.ini };
    return { ini: '0000-01', fim: '9999-12' };
  }

  function filtrar(lista, periodo, mesRef, custom) {
    const { ini, fim } = intervalo(periodo, mesRef, custom);
    return lista.filter((l) => {
      const c = Fin.finance.competencia(l);
      return c && c >= ini && c <= fim;
    });
  }

  /** Meses exibidos na "conferência mês a mês" (inclui meses sem lançamento). */
  function meses(periodo, mesRef, todos, custom) {
    const comps = todos.map((l) => Fin.finance.competencia(l)).filter(Boolean).sort();
    let { ini, fim } = intervalo(periodo, mesRef, custom);
    if (ini === '0000-01') ini = comps[0] || fmt.currentYM();
    if (fim === '9999-12') fim = comps[comps.length - 1] || fmt.currentYM();
    const out = [];
    for (let m = ini; m <= fim && out.length < 240; m = fmt.addMonths(m, 1)) out.push(m);
    return out;
  }

  function rotulo(periodo, mesRef, custom) {
    const { ini, fim } = intervalo(periodo, mesRef, custom);
    if (periodo === 'mes') return fmt.monthLong(mesRef);
    if (periodo === '12m') return `Últimos 12 meses (${fmt.monthShort(ini)} a ${fmt.monthShort(fim)})`;
    if (periodo === 'futuros') return `De ${fmt.monthShort(ini)} em diante`;
    if (periodo === 'custom') return `${fmt.monthShort(ini)} a ${fmt.monthShort(fim)}`;
    return 'Todo o período';
  }

  /** Botões de período (chips). */
  function chips(atual, extras = []) {
    return [...OPCOES, ...extras].map(([k, r]) =>
      `<button type="button" data-periodo="${k}" aria-pressed="${atual === k}"
        class="chip !shadow-none border border-slate-200 ${atual === k ? 'is-active !border-transparent' : ''}">${r}</button>`).join('');
  }

  return { OPCOES, intervalo, filtrar, meses, rotulo, chips };
})();
