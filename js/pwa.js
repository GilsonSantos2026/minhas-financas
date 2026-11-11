/**
 * pwa.js — Recursos de "app instalado": service worker (offline), botão de instalar,
 * aviso de nova versão e proteção do armazenamento contra limpeza automática.
 *
 * Observação: o navegador só permite service worker em endereços http(s)
 * (ex.: GitHub Pages ou localhost). Abrindo o index.html direto do disco (file://),
 * o app funciona normalmente, mas não fica instalável/offline.
 */
window.Fin = window.Fin || {};

Fin.pwa = (() => {
  const st = {
    suportado: 'serviceWorker' in navigator && /^https?:$/.test(location.protocol),
    registrado: false,
    novaVersao: null, // service worker esperando para ativar
  };
  let pedidoInstalacao = null;

  const avisar = () => window.dispatchEvent(new CustomEvent('fin:pwa'));

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // guardamos para mostrar no nosso botão "Instalar app"
    pedidoInstalacao = e;
    avisar();
  });
  window.addEventListener('appinstalled', () => {
    pedidoInstalacao = null;
    Fin.ui?.toast('App instalado! Procure “Finanças” na tela inicial.');
    avisar();
  });

  const instalado = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ios = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const podeInstalar = () => !!pedidoInstalacao;

  async function instalar() {
    if (!pedidoInstalacao) return false;
    pedidoInstalacao.prompt();
    const { outcome } = await pedidoInstalacao.userChoice;
    pedidoInstalacao = null;
    avisar();
    return outcome === 'accepted';
  }

  function barraAtualizacao() {
    if (document.getElementById('pwa-update')) return;
    const bar = document.createElement('div');
    bar.id = 'pwa-update';
    bar.setAttribute('role', 'status');
    bar.className = 'fixed left-1/2 -translate-x-1/2 bottom-24 md:bottom-6 z-50 w-[min(92vw,26rem)] bg-slate-900 text-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 text-sm';
    bar.innerHTML = '<span class="flex-1">Nova versão do app disponível.</span><button class="font-semibold text-emerald-300 hover:underline">Atualizar</button>';
    bar.querySelector('button').addEventListener('click', () => st.novaVersao?.postMessage('SKIP_WAITING'));
    document.body.appendChild(bar);
  }

  async function registrar() {
    if (!st.suportado) return;
    try {
      const reg = await navigator.serviceWorker.register('sw.js');
      st.registrado = true;
      const esperando = (w) => { st.novaVersao = w; barraAtualizacao(); avisar(); };
      if (reg.waiting && navigator.serviceWorker.controller) esperando(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        w?.addEventListener('statechange', () => {
          if (w.state === 'installed' && navigator.serviceWorker.controller) esperando(w);
        });
      });
      let recarregando = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (recarregando) return;
        recarregando = true;
        location.reload();
      });
      setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000); // procura versão nova a cada hora
      avisar();
    } catch (err) {
      console.warn('[pwa] service worker não registrado', err);
    }
  }

  /** Pede ao navegador para não apagar os dados quando faltar espaço no aparelho. */
  async function proteger() {
    if (!navigator.storage?.persist) return null;
    if (await navigator.storage.persisted()) return true;
    return navigator.storage.persist();
  }

  async function armazenamento() {
    const protegido = navigator.storage?.persisted ? await navigator.storage.persisted() : null;
    return { protegido };
  }

  return { estado: st, instalado, ios, podeInstalar, instalar, registrar, proteger, armazenamento };
})();
