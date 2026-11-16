/**
 * puxar.js — "Puxar para atualizar" do próprio app (celular).
 *
 * O gesto nativo do navegador RECARREGA a página, o que tranca o cofre (a chave só existe na
 * memória) e obriga a entrar de novo. Por isso o gesto nativo é desligado no CSS
 * (overscroll-behavior-y: none) e este módulo faz o gesto do app:
 *   puxar no topo da tela → sincroniza com o Google Drive, procura versão nova do app e
 *   redesenha a tela atual — sem sair da conta.
 * Atualização do app continua pelo botão "Atualizar" (essa sim recarrega e pede a senha).
 */
window.Fin = window.Fin || {};

Fin.puxar = (() => {
  const LIMIAR = 70;   // px puxados (já com resistência) para disparar
  const MAX = 110;
  let y0 = null, puxado = 0, ocupado = false, el = null;

  function indicador() {
    if (el) return el;
    el = document.createElement('div');
    el.className = 'puxar';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<span class="puxar-bola"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36L21 8"/><path d="M21 3v5h-5"/></svg></span>`;
    document.body.appendChild(el);
    return el;
  }

  /** O gesto vale aqui? (app aberto, no topo, sem janela/tour/tela de entrada por cima) */
  function podePuxar(alvo) {
    if (ocupado || window.scrollY > 0) return false;
    if (Fin.storage?.bloqueado?.()) return false;
    if (document.querySelector('#modal-root .modal-panel, .tour')) return false;
    if (!document.getElementById('acesso-root')?.classList.contains('hidden')) return false;
    // Dentro de algo que rola por conta própria (ex.: tabela da Planilha rolada), não interfere.
    for (let n = alvo; n && n !== document.body; n = n.parentElement) {
      if (n.scrollTop > 0) return false;
    }
    return true;
  }

  function mover(px) {
    const i = indicador();
    const p = Math.min(1, px / LIMIAR);
    i.style.transform = `translate(-50%, ${Math.min(px, MAX) - 48}px)`;
    i.style.opacity = String(Math.min(1, p * 1.2));
    i.querySelector('svg').style.transform = `rotate(${p * 270}deg)`;
    i.classList.toggle('pronto', px >= LIMIAR);
  }

  function recolher() {
    if (!el) return;
    el.classList.remove('pronto', 'girando');
    el.style.transition = 'transform .2s, opacity .2s';
    el.style.transform = 'translate(-50%, -56px)';
    el.style.opacity = '0';
    setTimeout(() => { if (el) el.style.transition = ''; }, 220);
  }

  /** Atualiza os dados sem recarregar a página. */
  async function atualizar() {
    if (ocupado) return;
    ocupado = true;
    const i = indicador();
    i.style.transition = 'transform .15s';
    i.style.transform = `translate(-50%, ${LIMIAR - 48}px)`;
    i.classList.add('girando');
    let msg = 'Atualizado.';
    try {
      if (Fin.drive?.conectado?.()) {
        await Fin.drive.sincronizar();
        if (Fin.drive.estado?.erro) msg = Fin.drive.estado.erro;
        else if (Fin.drive.estado?.reconectar) msg = 'Toque em “Reconectar Google” para sincronizar.';
        else msg = 'Atualizado com o Google Drive.';
      }
      Fin.pwa?.procurar?.().catch?.(() => {});
      window.dispatchEvent(new CustomEvent('fin:dados-externos'));
      Fin.router.refresh();
    } catch (e) {
      console.warn('[puxar]', e);
      msg = 'Não foi possível atualizar agora.';
    } finally {
      ocupado = false;
      recolher();
      Fin.ui.toast(msg, /não foi|Reconectar|erro/i.test(msg) ? 'error' : 'ok');
    }
  }

  document.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1 || !podePuxar(e.target)) { y0 = null; return; }
    y0 = e.touches[0].clientY;
    puxado = 0;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (y0 == null) return;
    const dy = e.touches[0].clientY - y0;
    if (dy <= 0 || window.scrollY > 0) { if (puxado) recolher(); puxado = 0; return; }
    puxado = dy * 0.5; // resistência
    mover(puxado);
  }, { passive: true });

  const fim = () => {
    if (y0 == null) return;
    y0 = null;
    if (puxado >= LIMIAR) atualizar(); else recolher();
    puxado = 0;
  };
  document.addEventListener('touchend', fim, { passive: true });
  document.addEventListener('touchcancel', fim, { passive: true });

  return { atualizar };
})();
