/**
 * components/novidades.js — Painel "Novidades" (bottom sheet) e lista completa.
 *
 * Aparece uma vez por novidade (Fin.novidades.pendente()), depois de entrar no app e só com o
 * app livre: desbloqueado, sem abertura animada, sem tutorial, sem outra janela e sem o
 * convite para instalar (que tem prioridade). Espera até ~2 min; senão fica para a próxima vez.
 * Configurações → Ajuda → "Novidades do app" abre a lista de todas as versões.
 */
window.Fin = window.Fin || {};

Fin.novidadesTela = (() => {
  const esc = (s) => Fin.fmt.esc(s);
  const N = () => Fin.novidades;
  const dataLonga = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  const itemHTML = (it) => `
    <li class="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
      <span class="w-10 h-10 shrink-0 rounded-xl bg-prim-800 text-dest grid place-items-center">${Fin.icone(it.icone, 'w-5 h-5')}</span>
      <span class="flex-1 min-w-0">
        <span class="block text-sm font-semibold">${esc(it.titulo)}</span>
        <span class="block text-sm text-slate-600 mt-0.5">${esc(it.texto)}</span>
        ${it.acao ? `<button type="button" data-ir="${esc(it.acao.rota)}" class="mt-1.5 text-sm font-semibold text-dest-texto hover:underline">${esc(it.acao.rotulo)} ›</button>` : ''}
      </span>
    </li>`;

  const ligarBotoes = (panel) => {
    panel.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', Fin.ui.closeModal));
    panel.querySelectorAll('[data-ir]').forEach((b) => b.addEventListener('click', () => {
      Fin.ui.closeModal();
      location.hash = b.dataset.ir;
    }));
  };

  /** Painel de uma versão (marca como vista ao abrir: aparece uma vez só). */
  function abrir(nov = N().pendente()) {
    if (!nov) return null;
    N().marcarVista(nov.id);
    const panel = Fin.ui.openModal(`
      <div class="p-5 sm:p-6 space-y-4">
        <div class="flex items-start gap-3">
          <div class="flex-1 min-w-0">
            <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-dest-texto">${Fin.icone('alta', 'w-4 h-4')} Novidades</span>
            <h2 class="font-semibold text-lg leading-snug mt-0.5">${esc(nov.titulo)}</h2>
            <p class="text-xs text-slate-500">${dataLonga(nov.data)}</p>
          </div>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <ul class="space-y-2">${nov.itens.slice(0, 4).map(itemHTML).join('')}</ul>
        <div class="flex flex-col gap-2 pt-1">
          <button type="button" data-close class="btn btn-primary w-full">Entendi</button>
          <button type="button" data-todas class="text-sm text-slate-500 hover:underline">Ver todas as novidades</button>
        </div>
      </div>`, 'Novidades do app');
    ligarBotoes(panel);
    panel.querySelector('[data-todas]').addEventListener('click', () => { Fin.ui.closeModal(); setTimeout(todas, 50); });
    return panel;
  }

  /** Lista de todas as versões (mais recente primeiro). */
  function todas() {
    const lista = [...N().LISTA].reverse();
    const panel = Fin.ui.openModal(`
      <div class="p-5 sm:p-6 space-y-4">
        <div class="flex items-center justify-between gap-2">
          <h2 class="font-semibold text-lg">Novidades do app</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        ${lista.length ? lista.map((n) => `
          <section class="space-y-2">
            <h3 class="text-sm font-semibold">${esc(n.titulo)} <span class="font-normal text-slate-500">· ${dataLonga(n.data)}</span></h3>
            <ul class="space-y-2">${n.itens.map(itemHTML).join('')}</ul>
          </section>`).join('') : '<p class="text-sm text-slate-500">Ainda não há novidades registradas.</p>'}
      </div>`, 'Novidades do app');
    ligarBotoes(panel);
    return panel;
  }

  /** Mostra a novidade pendente quando o app estiver livre. */
  function agendar(tentativa = 0) {
    try {
      if (!N()?.pendente()) return;
      // O convite para instalar (se houver) entra antes: ele agenda ~1,2 s após a conexão e nós
      // só 2,5 s após entrar — e esperamos qualquer janela aberta fechar.
      const ocupado = Fin.storage.bloqueado() || Fin.tour?.ativo?.() || document.getElementById('abertura')
        || document.querySelector('#modal-root .modal-panel') || document.querySelector('#acesso-root > *');
      if (ocupado) {
        if (tentativa < 120) setTimeout(() => agendar(tentativa + 1), 1000);
        return;
      }
      abrir();
    } catch (e) { console.warn('[novidades]', e); }
  }

  // Depois de entrar no app (o tutorial dos novos começa ~1,2 s depois; damos folga).
  window.addEventListener('fin:desbloqueado', () => setTimeout(() => agendar(), 2500));

  return { abrir, todas, agendar };
})();
