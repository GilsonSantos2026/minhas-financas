/**
 * icones.js — Ícones de traço (SVG) com tema de finanças, no mesmo estilo do olho e do sino.
 *
 * Uso:  Fin.icone('carteira', 'w-5 h-5')      → string <svg>
 *       <span data-icone="cartao"></span>      → trocado pelo SVG em Fin.icones.aplicar(raiz)
 * A cor vem de "currentColor" (herda do texto). Emojis continuam nas categorias (escolha do usuário).
 */
window.Fin = window.Fin || {};

Fin.icones = (() => {
  const P = {
    // navegação
    casa: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-5.5h4V21"/>',
    recibo: '<path d="M6 2.5h12v19l-3-2-3 2-3-2-3 2z"/><path d="M9 7.5h6M9 11h6M9 14.5h3.5"/>',
    balanca: '<path d="M12 4v16M7 20h10M5 7.5h14"/><path d="M12 4.5 12 7.5"/><path d="M5 7.5 2.5 13a2.5 2.5 0 0 0 5 0z"/><path d="M19 7.5 16.5 13a2.5 2.5 0 0 0 5 0z"/>',
    tabela: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M3 14.5h18M9 4v16"/>',
    cartao: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 9.5h19"/><path d="M6 15h4"/>',
    alta: '<path d="M3 3.5V20.5h17.5"/><path d="M7 15l4-4 3 3 6-6.5"/><path d="M15.5 7.5H20V12"/>',
    pizza: '<path d="M20.5 13.5A8.5 8.5 0 1 1 10.5 3.5v10z"/><path d="M14 3.2a8.5 8.5 0 0 1 6.8 6.8H14z"/>',
    alvo: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    etiqueta: '<path d="M3 12.5V4a1 1 0 0 1 1-1h8.5l8.5 8.5-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    cofreDados: '<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    menu: '<path d="M4 6.5h16M4 12h16M4 17.5h16"/>',
    cadeado: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
    mais: '<path d="M12 5v14M5 12h14"/>',
    // finanças
    carteira: '<path d="M4 7.5V6a2 2 0 0 1 2-2h11v3.5"/><path d="M3.5 7.5h16a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5h-14A2 2 0 0 1 3.5 18.5z"/><path d="M21 12h-4a2 2 0 0 0 0 4h4"/><circle cx="17" cy="14" r=".6" fill="currentColor"/>',
    entrada: '<circle cx="12" cy="12" r="8.5"/><path d="M12 16V8M8.5 11.5 12 8l3.5 3.5"/>',
    saida: '<circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8.5 12.5 12 16l3.5-3.5"/>',
    calendario: '<rect x="3.5" y="4.5" width="17" height="16" rx="2"/><path d="M3.5 9.5h17M8 2.5v4M16 2.5v4"/><path d="M8 13.5h2M14 13.5h2M8 17h2"/>',
    barras: '<path d="M3 20.5h18"/><path d="M6 17V11M10.5 17V6M15 17v-4M19.5 17V8"/>',
    pulso: '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>',
    escudo: '<path d="M12 3 19.5 6v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z"/><path d="M9 12l2 2 4-4.5"/>',
    moedas: '<ellipse cx="9" cy="7" rx="5.5" ry="2.5"/><path d="M3.5 7v3.5c0 1.4 2.5 2.5 5.5 2.5"/><path d="M3.5 10.5V14c0 1.4 2.5 2.5 5.5 2.5"/><ellipse cx="15" cy="13" rx="5.5" ry="2.5"/><path d="M9.5 13v4c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-4"/>',
    cifrao: '<path d="M12 2.5v19"/><path d="M16.5 6.5c-.6-1.4-2.4-2.5-4.5-2.5-2.5 0-4.5 1.5-4.5 3.5s2 3 4.5 3.5 4.5 1.5 4.5 3.5-2 3.5-4.5 3.5c-2.1 0-3.9-1.1-4.5-2.5"/>',
    maleta: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2"/><path d="M3 12.5h18"/><path d="M11 12.5v1.5h2v-1.5"/>',
    relogio: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    // utilidades
    lupa: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    nuvem: '<path d="M7 18.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.4 1.6A3.8 3.8 0 0 1 17.5 18.5z"/>',
    download: '<path d="M12 3.5v11M7.5 10.5 12 15l4.5-4.5"/><path d="M4 16.5v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
    upload: '<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5"/><path d="M4 16.5v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
    chave: '<circle cx="8" cy="15" r="4.5"/><path d="m11.2 11.8 8.3-8.3M16.5 6.5l2.5 2.5M14 9l2 2"/>',
    linha: '<path d="M3 3.5V20.5h17.5"/><path d="M6.5 16c2-1 3-5 5-5s2.5 3 4.5 3 2.5-4.5 4-6"/>',
    celular: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18h3"/>',
    documento: '<path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"/><path d="M14 2.5V8h5.5"/><path d="M8.5 13h7M8.5 16.5h5"/>',
    alerta: '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.2" r=".6" fill="currentColor"/>',
    reciclar: '<path d="M20 11.5A8 8 0 0 0 6 6.3L4 8.5"/><path d="M4 4v4.5h4.5"/><path d="M4 12.5a8 8 0 0 0 14 5.2l2-2.2"/><path d="M20 20v-4.5h-4.5"/>',
    banco: '<path d="M3 9.5 12 4l9 5.5"/><path d="M4.5 10v7.5M9.5 10v7.5M14.5 10v7.5M19.5 10v7.5"/><path d="M3 20.5h18"/>',
    lista: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.5" cy="6.5" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="17.5" r="1" fill="currentColor"/>',
    check: '<circle cx="12" cy="12" r="8.5"/><path d="m8 12.5 2.8 2.8L16.5 9.5"/>',
    cofrinho: '<path d="M4.5 11.5c0-3.6 3.4-6 7.5-6 1.7 0 3.2.4 4.4 1.1L19 5.5l-.4 3.1c.8.8 1.4 1.8 1.6 2.9H21.5v3.5h-1.6c-.5 1.2-1.4 2.2-2.4 2.9V20h-3v-1.6c-.8.2-1.6.2-2.5.2s-1.7 0-2.5-.2V20H6.5v-2.6c-1.3-1.2-2-2.7-2-4.4z"/><circle cx="16" cy="10.5" r=".7" fill="currentColor"/><path d="M10 8.5h3"/>',
  };

  /** SVG do ícone (traço 1,8, cor do texto). */
  function icone(nome, cls = 'w-5 h-5', extra = '') {
    const p = P[nome];
    if (!p) return '';
    return `<svg class="${cls}" ${extra} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${p}</svg>`;
  }

  /** Troca cada <span data-icone="nome" data-classe="…"> pelo SVG (menus fixos do index.html). */
  function aplicar(raiz = document) {
    raiz.querySelectorAll('[data-icone]').forEach((el) => {
      el.innerHTML = icone(el.dataset.icone, el.dataset.classe || 'w-5 h-5');
      el.removeAttribute('data-icone');
    });
  }

  /** Ícone num círculo colorido (badge), para cabeçalhos de cartões e listas. */
  function badge(nome, cor = 'emerald', tam = 'w-9 h-9', ic = 'w-5 h-5') {
    const cores = {
      emerald: 'bg-emerald-50 text-emerald-700', blue: 'bg-blue-50 text-blue-700', orange: 'bg-orange-50 text-orange-700',
      amber: 'bg-amber-50 text-amber-700', rose: 'bg-rose-50 text-rose-700', slate: 'bg-slate-100 text-slate-600',
      violet: 'bg-violet-50 text-violet-700', sky: 'bg-sky-50 text-sky-700',
    };
    return `<span class="${tam} shrink-0 rounded-xl grid place-items-center ${cores[cor] || cores.slate}" aria-hidden="true">${icone(nome, ic)}</span>`;
  }

  /** Título com ícone: <h2|h3> com badge. */
  function titulo(nome, cor, texto, { tag = 'h2', cls = '', tam = 'w-7 h-7', ic = 'w-4 h-4' } = {}) {
    return `<${tag} class="font-semibold flex items-center gap-2 ${cls}">${badge(nome, cor, tam, ic)}<span class="min-w-0">${texto}</span></${tag}>`;
  }

  /** Emojis decorativos antigos → ícone equivalente (estados vazios, seções). */
  const DE_EMOJI = {
    '⚖️': 'balanca', '🧾': 'recibo', '💳': 'cartao', '🏷️': 'etiqueta', '📂': 'cofreDados', '📊': 'pizza',
    '🎯': 'alvo', '🔎': 'lupa', '📑': 'tabela', '🛟': 'escudo', '🔒': 'cadeado', '🔐': 'chave', '📲': 'celular',
    '📄': 'documento', '⚠️': 'alerta', '☁️': 'nuvem', '♻️': 'reciclar', '💼': 'alta', '📈': 'alta', '💰': 'moedas',
  };
  const doEmoji = (e) => DE_EMOJI[e] || (P[e] ? e : null);

  Fin.icone = icone;
  return { icone, aplicar, badge, titulo, doEmoji, nomes: Object.keys(P) };
})();
