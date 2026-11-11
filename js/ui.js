/**
 * ui.js — Peças de interface reaproveitadas pelas telas:
 * toast, modal (vira "bottom sheet" no celular), navegador de mês e etiqueta de status.
 */
window.Fin = window.Fin || {};

Fin.ui = (() => {
  const fmt = Fin.fmt;

  function toast(msg, kind = 'ok') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.remove('bg-emerald-600', 'bg-rose-600', 'hidden');
    el.classList.add(kind === 'ok' ? 'bg-emerald-600' : 'bg-rose-600');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.add('hidden'), 4000);
  }

  /* ---------- Modal ---------- */

  let lastFocus = null;
  const onKey = (e) => e.key === 'Escape' && closeModal();

  function openModal(innerHTML, label = 'Janela') {
    lastFocus = document.activeElement;
    const root = document.getElementById('modal-root');
    root.innerHTML = `
      <div class="fixed inset-0 z-40 bg-slate-900/40 flex items-end sm:items-center justify-center sm:p-4" data-backdrop>
        <div class="modal-panel bg-white w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl"
             role="dialog" aria-modal="true" aria-label="${fmt.esc(label)}">${innerHTML}</div>
      </div>`;
    root.querySelector('[data-backdrop]').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });
    document.addEventListener('keydown', onKey);
    document.body.classList.add('overflow-hidden');
    const panel = root.querySelector('.modal-panel');
    setTimeout(() => panel.querySelector('input, select, textarea, button')?.focus(), 30);
    return panel;
  }

  function closeModal() {
    document.getElementById('modal-root').innerHTML = '';
    document.removeEventListener('keydown', onKey);
    document.body.classList.remove('overflow-hidden');
    lastFocus?.focus?.();
  }

  /* ---------- Navegador de mês (os cliques são tratados em app.js) ---------- */

  function monthNav(ym) {
    const atual = fmt.currentYM();
    return `
      <div class="flex items-center justify-between bg-white rounded-2xl shadow-sm px-2 py-2">
        <button data-month="-1" class="icon-btn" aria-label="Mês anterior">‹</button>
        <div class="text-center">
          <div class="font-semibold">${fmt.monthLong(ym)}</div>
          ${ym !== atual ? '<button data-month="0" class="text-xs text-emerald-700 hover:underline">voltar para o mês atual</button>' : '<div class="text-xs text-slate-400">mês atual</div>'}
        </div>
        <button data-month="1" class="icon-btn" aria-label="Próximo mês">›</button>
      </div>`;
  }

  /* ---------- Status (ícone + texto: nunca só cor) ---------- */

  function statusPill(l) {
    const st = Fin.finance.statusEfetivo(l);
    const rec = l.tipo === 'receita';
    const map = {
      pago: ['✓', rec ? 'Recebido' : 'Pago', 'bg-emerald-50 text-emerald-800'],
      aberto: ['○', rec ? 'A receber' : 'A pagar', 'bg-slate-100 text-slate-600'],
      atrasado: ['!', 'Atrasado', 'bg-rose-50 text-rose-700'],
      parcial: ['◐', 'Parcial', 'bg-amber-50 text-amber-800'],
    };
    const [icon, label, cls] = map[st];
    const acao = st === 'pago' ? 'Marcar como não pago' : rec ? 'Marcar como recebido' : 'Marcar como pago';
    return `<button type="button" data-toggle-pago="${l.id}" class="pill ${cls}" title="${acao}" aria-label="${label}. ${acao}">
      <span aria-hidden="true">${icon}</span>${label}</button>`;
  }

  /** Bolinha com o emoji da categoria (ou a inicial). */
  function catIcon(icone, nome, tipo) {
    const bg = tipo === 'receita' ? 'bg-emerald-50' : 'bg-slate-100';
    const content = icone || fmt.esc((nome || '?').slice(0, 1).toUpperCase());
    return `<span class="w-10 h-10 shrink-0 rounded-full ${bg} grid place-items-center text-lg" aria-hidden="true">${content}</span>`;
  }

  function emptyState(icon, title, text, actionHTML = '') {
    return `
      <div class="bg-white rounded-2xl shadow-sm p-8 text-center">
        <div class="text-4xl mb-2" aria-hidden="true">${icon}</div>
        <h2 class="font-semibold">${title}</h2>
        <p class="text-sm text-slate-500 mt-1">${text}</p>
        ${actionHTML ? `<div class="mt-4">${actionHTML}</div>` : ''}
      </div>`;
  }

  return { toast, openModal, closeModal, monthNav, statusPill, catIcon, emptyState };
})();
