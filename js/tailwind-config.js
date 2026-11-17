/**
 * tailwind-config.js — Cores do tema para o Tailwind.
 * "prim" usa as variáveis --p-* e "dest" (destaque: dourado no tema Valoris) usa --d*,
 * todas trocadas por js/tema.js.
 * (Fica num arquivo, e não dentro do index.html, para a política de segurança (CSP)
 * poder proibir qualquer script embutido na página.)
 */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        prim: Object.fromEntries([50, 100, 200, 500, 600, 700, 800].map((n) => [n, `rgb(var(--p-${n}) / <alpha-value>)`])),
        dest: {
          DEFAULT: 'rgb(var(--d) / <alpha-value>)', // destaque
          texto: 'rgb(var(--d-texto) / <alpha-value>)', // destaque legível sobre fundo claro
          sobre: 'rgb(var(--d-sobre) / <alpha-value>)', // texto por cima do destaque
        },
      },
    },
  },
};
