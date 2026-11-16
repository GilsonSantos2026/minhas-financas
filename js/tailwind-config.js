/**
 * tailwind-config.js — Cor principal do app (tema) para o Tailwind.
 * "prim" usa as variáveis --p-* trocadas por js/tema.js.
 * (Fica num arquivo, e não dentro do index.html, para a política de segurança (CSP)
 * poder proibir qualquer script embutido na página.)
 */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        prim: Object.fromEntries([50, 100, 200, 500, 600, 700, 800].map((n) => [n, `rgb(var(--p-${n}) / <alpha-value>)`])),
      },
    },
  },
};
