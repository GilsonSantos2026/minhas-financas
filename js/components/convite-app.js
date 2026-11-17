/**
 * components/convite-app.js — Convite para instalar o app (Etapa 2 do onboarding).
 *
 * Aparece UMA vez por aparelho, logo após a 1ª conexão bem-sucedida com o Google Drive
 * (evento 'fin:drive-primeira-conexao', disparado por js/sync/drive.js), e só se:
 *   - Fin.pwa.conviteApp() === 'pendente' (aparelho novo; quem já usava o app é 'legado');
 *   - o app ainda não está instalado / aberto como app.
 * Espera o app ficar livre (desbloqueado, sem tour, sem outra janela, sem a abertura animada).
 *
 * Botão principal "Instalar aplicativo":
 *   - Android / computador (Chrome, Edge): pedido nativo (beforeinstallprompt), espera até 3 s;
 *   - iPhone / iPad (Safari): guia visual de 3 passos (Compartilhar → Adicionar à Tela de Início);
 *   - outros: guia genérico (menu ⋮ → Instalar app / Adicionar à tela inicial).
 * "Continuar pelo navegador" (ou fechar) = não pergunta mais. Quem mudar de ideia tem o botão
 * "Instalar app" em Dados e backup.
 */
window.Fin = window.Fin || {};

Fin.conviteApp = (() => {
  const P = () => Fin.pwa;
  const MONO = '<svg viewBox="22 21 159 139" aria-hidden="true"><polygon points="24,23 55,23 89,100 74,131" fill="#F3F5F8"/><polygon points="147,23 179,23 119,158 87,158" fill="#C6A45C"/><rect x="102" y="23" width="46" height="4" fill="#C6A45C"/><line x1="90" y1="93" x2="101.3" y2="69.5" stroke="#C6A45C" stroke-width="5"/><polygon points="110,51 94,66 108,73" fill="#C6A45C"/></svg>';
  const ICONE_COMPARTILHAR = '<svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M6 11v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8"/></svg>';
  const ICONE_ADICIONAR = '<svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/></svg>';

  const beneficio = (icone, texto) => `
    <li class="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5">
      <span class="text-dest-texto shrink-0">${Fin.icone(icone, 'w-5 h-5')}</span>
      <span class="text-sm text-slate-700">${texto}</span></li>`;

  const passo = (n, html) => `
    <li class="flex items-center gap-3">
      <span class="w-7 h-7 shrink-0 rounded-full bg-prim-800 text-white grid place-items-center text-sm font-semibold">${n}</span>
      <span class="text-sm text-slate-700 flex flex-wrap items-center gap-1">${html}</span></li>`;

  const guiaIOS = () => `
    <div class="rounded-xl border border-slate-200 p-4 space-y-3">
      <p class="text-sm font-semibold">No iPhone/iPad (Safari):</p>
      <ol class="space-y-2.5">
        ${passo(1, `Toque em <b>Compartilhar</b> <span class="inline-grid place-items-center w-7 h-7 rounded-lg bg-slate-100 text-blue-600">${ICONE_COMPARTILHAR}</span> na barra do Safari`)}
        ${passo(2, `Escolha <b>Adicionar à Tela de Início</b> <span class="inline-grid place-items-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700">${ICONE_ADICIONAR}</span>`)}
        ${passo(3, 'Toque em <b>Adicionar</b>. O ícone do Valoris aparece na tela inicial.')}
      </ol>
    </div>`;

  const guiaGenerico = () => `
    <div class="rounded-xl border border-slate-200 p-4 space-y-3">
      <p class="text-sm font-semibold">Pelo menu do navegador:</p>
      <ol class="space-y-2.5">
        ${passo(1, 'Toque no menu <b class="text-lg leading-none">⋮</b> (ou <b>…</b>) do navegador')}
        ${passo(2, 'Escolha <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>')}
        ${passo(3, 'Confirme. O ícone do Valoris aparece na tela inicial.')}
      </ol>
    </div>`;

  function abrir() {
    P().marcarConvite('mostrado'); // uma vez só, qualquer que seja a escolha
    const panel = Fin.ui.openModal(`
      <div class="p-5 sm:p-6 space-y-4">
        <div class="flex items-start gap-3">
          <div class="marca-mono w-12 h-12 rounded-xl" aria-hidden="true">${MONO}</div>
          <div class="flex-1 min-w-0">
            <h2 class="font-semibold text-lg leading-snug">Leve o Valoris na sua tela inicial</h2>
            <p class="text-sm text-slate-500 mt-0.5">Instale o app neste aparelho: é gratuito e leva poucos segundos.</p>
          </div>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${beneficio('celular', 'Abre em tela cheia, como um app')}
          ${beneficio('relogio', 'Abre mais rápido')}
          ${beneficio('nuvem', 'Funciona mesmo sem internet')}
          ${beneficio('casa', 'Ícone sempre à mão na tela inicial')}
        </ul>
        <div data-guia></div>
        <p data-erro class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
        <div class="flex flex-col gap-2 pt-1">
          <button type="button" data-instalar class="btn btn-primary w-full">Instalar aplicativo</button>
          <button type="button" data-navegador class="btn btn-ghost w-full">Continuar pelo navegador</button>
        </div>
      </div>`, 'Instalar o app');

    const guia = panel.querySelector('[data-guia]');
    const botao = panel.querySelector('[data-instalar]');
    panel.querySelector('[data-close]').addEventListener('click', Fin.ui.closeModal);
    panel.querySelector('[data-navegador]').addEventListener('click', Fin.ui.closeModal);
    botao.addEventListener('click', async () => {
      if (P().ios()) { guia.innerHTML = guiaIOS(); botao.textContent = 'Entendi'; botao.onclick = Fin.ui.closeModal; return; }
      botao.disabled = true;
      botao.textContent = 'Preparando…';
      try {
        const temPedido = await P().aguardarPedido(3000);
        if (temPedido) {
          const aceitou = await P().instalar();
          Fin.ui.closeModal();
          if (!aceitou) Fin.ui.toast('Tudo bem! Se mudar de ideia: Dados e backup → Instalar app.');
          return;
        }
        guia.innerHTML = guiaGenerico();
        botao.textContent = 'Entendi';
        botao.onclick = Fin.ui.closeModal;
      } catch (e) {
        console.warn('[convite-app]', e);
        guia.innerHTML = guiaGenerico();
        botao.textContent = 'Entendi';
        botao.onclick = Fin.ui.closeModal;
      } finally {
        botao.disabled = false;
      }
    });
    return panel;
  }

  /** Mostra quando o app estiver livre (até ~2 min tentando; depois fica para a próxima conexão). */
  function agendar(tentativa = 0) {
    if (P().conviteApp() !== 'pendente') return;
    if (P().instalado()) { P().marcarConvite('mostrado'); return; }
    const ocupado = Fin.storage.bloqueado() || Fin.tour?.ativo?.() || document.getElementById('abertura')
      || document.querySelector('#modal-root .modal-panel') || document.querySelector('#acesso-root > *');
    if (ocupado) {
      if (tentativa < 120) setTimeout(() => agendar(tentativa + 1), 1000);
      return;
    }
    abrir();
  }

  window.addEventListener('fin:drive-primeira-conexao', () => setTimeout(() => agendar(), 1200));

  return { abrir, agendar };
})();
