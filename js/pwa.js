/**
 * pwa.js — Recursos de "app instalado": service worker (offline), botão de instalar,
 * versão nova (o aviso é o botão "Atualizar" do topo, em avisos.js) e proteção do armazenamento contra limpeza automática.
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

  let reg = null;

  /** Ativa a versão nova (o app recarrega sozinho). O aviso fica no botão "Atualizar" do topo. */
  function atualizar() {
    if (!st.novaVersao) return false;
    st.novaVersao.postMessage('SKIP_WAITING');
    return true;
  }

  /** Procura versão nova agora. Resolve true se encontrou (fica esperando em "Atualizar"). */
  async function procurar() {
    if (!reg) return false;
    await reg.update();
    if (reg.installing) {
      await new Promise((res) => {
        const w = reg.installing;
        const fim = () => { if (['installed', 'activated', 'redundant'].includes(w.state)) res(); };
        w.addEventListener('statechange', fim);
        setTimeout(res, 15000);
      });
    }
    return !!st.novaVersao;
  }

  /** Versão do app em uso (pergunta ao service worker ativo). */
  function versao() {
    const sw = navigator.serviceWorker?.controller;
    if (!sw) return Promise.resolve(null);
    return new Promise((res) => {
      const canal = new MessageChannel();
      canal.port1.onmessage = (e) => res(e.data || null);
      sw.postMessage('VERSAO', [canal.port2]);
      setTimeout(() => res(null), 2000);
    });
  }

  async function registrar() {
    if (!st.suportado) return;
    try {
      reg = await navigator.serviceWorker.register('sw.js');
      st.registrado = true;
      const esperando = (w) => {
        const primeira = !st.novaVersao;
        st.novaVersao = w;
        if (primeira) Fin.ui?.toast('Nova versão disponível — toque em Atualizar no topo.');
        avisar();
      };
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

  return { estado: st, instalado, ios, podeInstalar, instalar, registrar, proteger, armazenamento, atualizar, procurar, versao };
})();
