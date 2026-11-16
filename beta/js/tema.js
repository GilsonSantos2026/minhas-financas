/**
 * tema.js — Cor do app (12 opções). Carregado logo no início, antes de desenhar qualquer tela.
 *
 * Como funciona: a cor principal é um conjunto de variáveis CSS (--p-50 … --p-800, em "r g b").
 * O Tailwind usa essas variáveis na cor "prim" (bg-prim-600, text-prim-700…) e o styles.css
 * usa rgb(var(--p-600)) nos botões, menu, abas e destaques. Trocar a cor = trocar as variáveis.
 *
 * A escolha fica em prefs.tema (para a tela de entrada já abrir com a cor) e no perfil do
 * membro (Fin.membros), que sincroniza: a mesma pessoa vê a mesma cor no celular e no computador.
 * Cores de significado (verde = pago/positivo, vermelho = atraso, azul/laranja dos gráficos)
 * NÃO mudam com o tema.
 */
window.Fin = window.Fin || {};

Fin.tema = (() => {
  const NIVEIS = [50, 100, 200, 500, 600, 700, 800];
  // [id, nome, 50, 100, 200, 500, 600, 700, 800]
  const LISTA = [
    ['esmeralda', 'Esmeralda', '#ecfdf5', '#d1fae5', '#a7f3d0', '#10b981', '#059669', '#047857', '#065f46'],
    ['marinho', 'Azul-marinho', '#eff5fb', '#dbe8f4', '#b9d2e9', '#3f7bb0', '#2d6596', '#24527b', '#1d4263'],
    ['roxo', 'Roxo', '#faf5ff', '#f3e8ff', '#e9d5ff', '#a855f7', '#9333ea', '#7e22ce', '#6b21a8'],
    ['verde', 'Verde', '#f0fdf4', '#dcfce7', '#bbf7d0', '#22c55e', '#16a34a', '#15803d', '#166534'],
    ['vermelho', 'Vermelho', '#fef2f2', '#fee2e2', '#fecaca', '#ef4444', '#dc2626', '#b91c1c', '#991b1b'],
    ['rosa', 'Rosa', '#fdf2f8', '#fce7f3', '#fbcfe8', '#ec4899', '#db2777', '#be185d', '#9d174d'],
    ['petroleo', 'Azul-petróleo', '#ecfeff', '#cffafe', '#a5f3fc', '#06b6d4', '#0e7490', '#155e75', '#164e63'],
    ['mostarda', 'Mostarda', '#fefce8', '#fef9c3', '#fef08a', '#ca8a04', '#a16207', '#854d0e', '#713f12'],
    ['grafite', 'Grafite', '#f8fafc', '#f1f5f9', '#e2e8f0', '#64748b', '#475569', '#334155', '#1e293b'],
    ['laranja', 'Laranja', '#fff7ed', '#ffedd5', '#fed7aa', '#f97316', '#ea580c', '#c2410c', '#9a3412'],
    ['indigo', 'Índigo', '#eef2ff', '#e0e7ff', '#c7d2fe', '#6366f1', '#4f46e5', '#4338ca', '#3730a3'],
    ['azul', 'Azul', '#eff6ff', '#dbeafe', '#bfdbfe', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'],
  ];
  const TEMAS = LISTA.map(([id, nome, ...hex]) => ({ id, nome, cores: Object.fromEntries(NIVEIS.map((n, i) => [n, hex[i]])) }));
  const PADRAO = 'esmeralda';

  const rgb = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
  };
  const porId = (id) => TEMAS.find((t) => t.id === id) || TEMAS.find((t) => t.id === PADRAO);

  function lerPref() {
    try { return JSON.parse(localStorage.getItem(`${Fin.PREFIXO || 'fin:'}prefs`) || '{}').tema || PADRAO; } catch { return PADRAO; }
  }
  function gravarPref(id) {
    // Grava direto (este módulo carrega antes do storage.js).
    try {
      const p = JSON.parse(localStorage.getItem(`${Fin.PREFIXO || 'fin:'}prefs`) || '{}');
      if (p.tema === id) return;
      p.tema = id;
      localStorage.setItem(`${Fin.PREFIXO || 'fin:'}prefs`, JSON.stringify(p));
    } catch { /* sem armazenamento: vale só nesta sessão */ }
  }

  let atual = null;

  /** Aplica a cor na tela (e guarda neste aparelho). */
  function aplicar(id, { guardar = true } = {}) {
    const t = porId(id);
    const raiz = document.documentElement.style;
    for (const n of NIVEIS) raiz.setProperty(`--p-${n}`, rgb(t.cores[n]));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.cores[600]);
    atual = t.id;
    if (guardar) gravarPref(t.id);
    window.dispatchEvent(new CustomEvent('fin:tema', { detail: t.id }));
    return t;
  }

  aplicar(lerPref(), { guardar: false });

  return { TEMAS, PADRAO, aplicar, atual: () => atual, porId };
})();
