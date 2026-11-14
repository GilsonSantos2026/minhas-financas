/**
 * privacidade.js — Botão "olho" para ocultar (desfocar) os valores, como nos apps de banco.
 *
 * Como funciona: todo texto com valor em reais ("R$ 1.234,56", "-R$ 10,00", "R$ -563,80")
 * é envolvido automaticamente num <span class="vlr"> (ou, dentro de gráficos SVG, o <text>
 * recebe a classe "vlr"). Um observador marca também o conteúdo que as telas desenham depois.
 * Com a classe "ocultar-valores" no <html>, o CSS desfoca tudo que tem ".vlr".
 *
 * Campos de formulário não são desfocados (quem está editando precisa ver o que digita).
 * Toda abertura do app começa com os valores ocultos.
 */
window.Fin = window.Fin || {};

Fin.privacidade = (() => {
  const RE = /-?\s?(?:US|R)\$\s?-?[\d.]+,\d{2}/; // R$ e US$
  const RE_G = /-?\s?(?:US|R)\$\s?-?[\d.]+,\d{2}/g;
  const IGNORAR = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'OPTION', 'SELECT', 'CODE', 'TITLE']);

  function marcarTexto(no) {
    const pai = no.parentNode;
    if (!pai || pai.nodeType !== 1 || IGNORAR.has(pai.nodeName)) return;
    if (pai.closest('.vlr, [data-sem-ocultar]')) return;
    const t = no.nodeValue;
    if (!t || !RE.test(t)) return;
    if (pai instanceof SVGElement) { pai.classList.add('vlr'); return; } // texto de gráfico
    const frag = document.createDocumentFragment();
    let ult = 0;
    t.replace(RE_G, (m, pos) => {
      if (pos > ult) frag.appendChild(document.createTextNode(t.slice(ult, pos)));
      const s = document.createElement('span');
      s.className = 'vlr';
      s.textContent = m;
      frag.appendChild(s);
      ult = pos + m.length;
      return m;
    });
    if (ult < t.length) frag.appendChild(document.createTextNode(t.slice(ult)));
    pai.replaceChild(frag, no);
  }

  function marcar(raiz) {
    if (raiz.nodeType === 3) return marcarTexto(raiz);
    if (raiz.nodeType !== 1) return;
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    const nos = [];
    while (w.nextNode()) nos.push(w.currentNode);
    nos.forEach(marcarTexto);
  }

  const ativo = () => document.documentElement.classList.contains('ocultar-valores');

  function aplicar(on) {
    document.documentElement.classList.toggle('ocultar-valores', on);
    document.querySelectorAll('[data-ocultar]').forEach((b) => {
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', on ? 'Mostrar valores' : 'Ocultar valores');
      b.title = on ? 'Mostrar valores' : 'Ocultar valores';
    });
  }

  function alternar() {
    const on = !ativo();
    aplicar(on);
    try { Fin.storage.setPref('ocultarValores', on); } catch { /* bloqueado: vale só nesta sessão */ }
    return on;
  }

  /** Ao abrir o app os valores começam sempre ocultos; o olho mostra durante o uso. */
  function iniciar() {
    aplicar(true);
    try { Fin.storage.setPref('ocultarValores', true); } catch { /* bloqueado: vale só nesta sessão */ }
    marcar(document.body);
    new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === 'characterData') marcarTexto(m.target);
        else m.addedNodes.forEach(marcar);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  return { iniciar, alternar, ativo, marcar };
})();
