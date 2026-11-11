/**
 * format.js — Formatação para exibição (moeda, datas, meses) e utilidades de mês.
 * Datas internas são sempre texto ISO: "AAAA-MM-DD"; meses: "AAAA-MM".
 */
window.Fin = window.Fin || {};

Fin.fmt = (() => {
  const brlF = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const compactF = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const pad = (n) => String(n).padStart(2, '0');

  const brl = (v) => brlF.format(v || 0);
  const compact = (v) => compactF.format(v || 0);

  /** Valor para campo de formulário: 1234.5 → "1234,50". */
  const decimalInput = (v) => (v === null || v === undefined ? '' : Number(v).toFixed(2).replace('.', ','));

  const date = (iso) => (iso ? iso.split('-').reverse().join('/') : '—');

  function parseISO(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d || 1);
  }

  /** "2026-04-15" → "qua, 15 de abril" */
  function dayLabel(iso) {
    if (!iso) return 'Sem data';
    const d = parseISO(iso);
    return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
  }

  /** "2026-04" → "Abril de 2026" */
  function monthLong(ym) {
    const [y, m] = ym.split('-').map(Number);
    const nome = MESES[m - 1];
    return `${nome[0].toUpperCase()}${nome.slice(1)} de ${y}`;
  }

  /** "2026-04" → "abr/26" */
  function monthShort(ym) {
    const [y, m] = ym.split('-').map(Number);
    return `${MESES[m - 1].slice(0, 3)}/${String(y).slice(2)}`;
  }

  function addMonths(ym, n) {
    const [y, m] = ym.split('-').map(Number);
    const d = new Date(y, m - 1 + n, 1);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  }

  /** "2026-01-31" + 1 mês → "2026-02-28" (mantém o dia; ajusta para o último dia do mês). */
  function addMonthsISO(iso, n) {
    const [y, m, d] = iso.split('-').map(Number);
    const alvo = new Date(y, m - 1 + n, 1);
    const ultimo = new Date(alvo.getFullYear(), alvo.getMonth() + 1, 0).getDate();
    return `${alvo.getFullYear()}-${pad(alvo.getMonth() + 1)}-${pad(Math.min(d, ultimo))}`;
  }

  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  const currentYM = () => todayISO().slice(0, 7);

  const esc = (v) =>
    String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  return { brl, compact, decimalInput, date, dayLabel, monthLong, monthShort, addMonths, addMonthsISO, todayISO, currentYM, esc };
})();
