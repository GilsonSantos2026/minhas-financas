/**
 * pages/educacao.js — Aba "Aprender": artigos curtos de educação financeira
 * (conteúdo em js/educacao.js). #/educacao lista; #/educacao?artigo=<id> abre um artigo.
 * Fin.pages.educacao.ajuda(contexto) abre a janela de guias do botão "?" (ex.: Investimentos).
 */
window.Fin = window.Fin || {};
Fin.pages = Fin.pages || {};

Fin.pages.educacao = (() => {
  const esc = (s) => Fin.fmt.esc(s);
  const E = () => Fin.educacao;
  const AVISO = 'Conteúdo educativo, em linguagem simples. Não é recomendação de investimento: avalie seu momento e, se precisar, procure um profissional certificado.';

  const cartao = (a) => `
    <a href="#/educacao?artigo=${a.id}" class="group flex items-start gap-3 bg-white rounded-2xl shadow-sm p-4 hover:ring-2 hover:ring-prim-200 min-w-0">
      ${Fin.icones.badge(a.icone, a.cor, 'w-11 h-11', 'w-6 h-6')}
      <span class="flex-1 min-w-0">
        <span class="block font-semibold leading-snug">${esc(a.titulo)}</span>
        <span class="block text-sm text-slate-500 mt-0.5">${esc(a.resumo)}</span>
        <span class="inline-flex items-center gap-1 text-xs text-slate-400 mt-1.5">${Fin.icone('relogio', 'w-3.5 h-3.5')} ${a.min} min de leitura</span>
      </span>
      <span class="text-slate-300 group-hover:text-prim-600" aria-hidden="true">›</span>
    </a>`;

  function listaHTML() {
    return `
      <div class="space-y-5">
        <header class="flex items-start gap-3">
          ${Fin.icones.badge('livro', 'prim', 'w-11 h-11', 'w-6 h-6')}
          <div><h1 class="text-xl font-semibold">Aprender</h1>
            <p class="text-sm text-slate-500">Guias rápidos sobre orçamento, reserva, investimentos e dívidas.</p></div>
        </header>
        ${E().GRUPOS.map(([g, nome]) => `
          <section>
            <h2 class="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 px-1">${esc(nome)}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">${E().ARTIGOS.filter((a) => a.grupo === g).map(cartao).join('')}</div>
          </section>`).join('')}
        <p class="text-xs text-slate-400 px-1">${AVISO}</p>
      </div>`;
  }

  function artigoHTML(a) {
    const outros = E().ARTIGOS.filter((x) => x.id !== a.id && x.grupo === a.grupo).slice(0, 2);
    return `
      <article class="space-y-4 max-w-2xl mx-auto">
        <a href="#/educacao" class="inline-flex items-center gap-1 text-sm text-prim-700 font-medium hover:underline">‹ Todos os guias</a>
        <header class="bg-white rounded-2xl shadow-sm p-5">
          <div class="flex items-start gap-3">
            ${Fin.icones.badge(a.icone, a.cor, 'w-12 h-12', 'w-7 h-7')}
            <div class="min-w-0">
              <h1 class="text-xl sm:text-2xl font-semibold leading-tight">${esc(a.titulo)}</h1>
              <p class="text-sm text-slate-500 mt-1">${esc(a.resumo)} · ${a.min} min</p>
            </div>
          </div>
          <div class="mt-4 rounded-xl bg-prim-50 p-3">
            <div class="text-xs font-semibold uppercase tracking-wide text-prim-800 mb-1.5">Em 3 pontos</div>
            <ol class="space-y-1.5 text-sm text-slate-700">${a.pontos.map((p, i) => `
              <li class="flex gap-2"><span class="w-5 h-5 rounded-full bg-prim-600 text-white text-[11px] font-semibold grid place-items-center shrink-0 mt-0.5">${i + 1}</span><span>${esc(p)}</span></li>`).join('')}</ol>
          </div>
        </header>
        <div class="bg-white rounded-2xl shadow-sm p-5 space-y-5 leitura">
          ${a.secoes.map((s) => `
            <section>
              <h2 class="font-semibold text-base mb-1.5">${esc(s.t)}</h2>
              ${(s.p || []).map((p) => `<p class="text-[15px] leading-relaxed text-slate-700">${esc(p)}</p>`).join('')}
              ${s.lista ? `<ul class="mt-2 space-y-1.5">${s.lista.map((x) => `<li class="flex gap-2 text-[15px] leading-relaxed text-slate-700"><span class="text-prim-600 mt-0.5" aria-hidden="true">•</span><span>${esc(x)}</span></li>`).join('')}</ul>` : ''}
            </section>`).join('')}
        </div>
        ${outros.length ? `<section><h2 class="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 px-1">Leia também</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">${outros.map(cartao).join('')}</div></section>` : ''}
        <p class="text-xs text-slate-400 px-1">${AVISO}</p>
      </article>`;
  }

  function render(view) {
    const id = location.hash.match(/[?&]artigo=([\w-]+)/)?.[1];
    const a = id ? E().artigo(id) : null;
    view.innerHTML = a ? artigoHTML(a) : listaHTML();
    window.scrollTo(0, 0);
  }

  /** Janela do botão "?": guias ligados à tela (ex.: 'investimentos', 'reserva'). */
  function ajuda(contexto) {
    const ids = E().CONTEXTO[contexto] || [];
    const lista = ids.map((i) => E().artigo(i)).filter(Boolean);
    const panel = Fin.ui.openModal(`
      <div class="p-5 space-y-3">
        <div class="flex items-center justify-between gap-2">
          <h2 class="font-semibold text-lg flex items-center gap-2">${Fin.icones.badge('livro', 'prim', 'w-8 h-8', 'w-[18px] h-[18px]')} Guias rápidos</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <ul class="divide-y divide-slate-100">${lista.map((a) => `
          <li><a href="#/educacao?artigo=${a.id}" data-close class="flex items-center gap-3 py-2.5 hover:bg-slate-50 rounded-lg -mx-1 px-1">
            ${Fin.icones.badge(a.icone, a.cor, 'w-9 h-9', 'w-5 h-5')}
            <span class="flex-1 min-w-0"><span class="block text-sm font-medium">${esc(a.titulo)}</span>
              <span class="block text-xs text-slate-500 truncate">${esc(a.resumo)}</span></span>
            <span class="text-slate-300" aria-hidden="true">›</span></a></li>`).join('')}</ul>
        <a href="#/educacao" data-close class="block text-center text-sm text-prim-700 font-medium hover:underline">Ver todos os guias</a>
      </div>`, 'Guias rápidos');
    panel.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', (e) => {
      const href = b.getAttribute('href');
      e.preventDefault();
      Fin.ui.closeModal();
      if (href) location.hash = href.slice(1);
    }));
  }

  return { title: 'Aprender', render, ajuda };
})();
