/**
 * router.js — Navegação entre telas pelo endereço (#/dashboard, #/lancamentos, #/dados).
 * Funciona abrindo o index.html direto do disco, sem servidor.
 *
 * Cada tela é um objeto { title, render(view, { signal }) }.
 * O "signal" é cancelado ao trocar de tela: use-o em addEventListener de
 * window/document para os ouvintes serem removidos automaticamente.
 */
window.Fin = window.Fin || {};

Fin.router = (() => {
  const routes = {};
  let controller = null;
  let fallback = () => '/dashboard';

  const register = (path, page) => (routes[path] = page);
  const go = (path) => {
    if (location.hash === `#${path}`) render();
    else location.hash = `#${path}`;
  };
  const current = () => location.hash.slice(1).split('?')[0] || fallback();

  function render() {
    if (Fin.storage.bloqueado()) return; // app bloqueado: nada é desenhado
    let path = current();
    if (!routes[path]) path = fallback();
    const page = routes[path];

    controller?.abort();
    controller = new AbortController();

    const view = document.getElementById('view');
    view.innerHTML = '';
    page.render(view, { signal: controller.signal });

    document.title = `${page.title} · Minhas Finanças`;
    document.getElementById('page-title').textContent = page.title;
    document.querySelectorAll('[data-nav]').forEach((a) => {
      const active = a.dataset.nav === path || (a.dataset.navAlso || '').split(' ').includes(path);
      a.classList.toggle('is-active', active);
      if (active) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  /** Redesenha a tela atual mantendo a rolagem (usado depois de salvar algo). */
  function refresh() {
    const y = window.scrollY;
    render();
    window.scrollTo(0, y);
  }

  function start(defaultRoute) {
    fallback = defaultRoute;
    window.addEventListener('hashchange', () => {
      render();
      window.scrollTo(0, 0);
    });
    render();
  }

  return { register, go, current, render, refresh, start };
})();
