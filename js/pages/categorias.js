/**
 * pages/categorias.js — Cadastro de categorias de despesa e receita.
 */
window.Fin = window.Fin || {};
Fin.pages = Fin.pages || {};

Fin.pages.categorias = (() => {
  const fmt = Fin.fmt;
  const esc = fmt.esc;
  const F = Fin.finance;
  let tipo = 'despesa';

  function render(view, { signal }) {
    const cats = F.categorias(tipo);
    const grupos = new Map();
    cats.forEach((c) => {
      const k = c.classificacao || 'Sem classificação';
      if (!grupos.has(k)) grupos.set(k, []);
      grupos.get(k).push(c);
    });

    view.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="seg flex-1 max-w-xs" role="tablist" aria-label="Tipo de categoria">
            <label><input type="radio" name="cat-tipo" value="despesa" ${tipo === 'despesa' ? 'checked' : ''}><span>Despesas</span></label>
            <label><input type="radio" name="cat-tipo" value="receita" ${tipo === 'receita' ? 'checked' : ''}><span>Receitas</span></label>
          </div>
          <button data-act="nova" class="btn btn-primary ml-auto">＋ Nova</button>
        </div>

        ${cats.length ? [...grupos.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR')).map(([grupo, itens]) => `
          <section>
            <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide px-1 mb-1.5">${esc(grupo)}</h3>
            <ul class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
              ${itens.map((c) => {
                const u = F.usosCategoria(c.nome, c.tipo).total;
                return `
                <li class="lanc-item flex items-center gap-3 px-3 sm:px-4 py-3" data-cat="${c.id}" role="button" tabindex="0" aria-label="Editar ${esc(c.nome)}">
                  ${Fin.ui.catIcon(c.icone, c.nome, c.tipo)}
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium truncate">${esc(c.nome)}</div>
                    <div class="text-xs text-slate-500">${u} ${u === 1 ? 'registro' : 'registros'}</div>
                  </div>
                  ${c.orcamentoMensal > 0 ? `<div class="text-right text-xs text-slate-500 shrink-0">orçamento<div class="text-sm font-semibold text-slate-700 tabular-nums">${fmt.brl(c.orcamentoMensal)}</div></div>` : ''}
                  <span class="text-slate-300" aria-hidden="true">›</span>
                </li>`;
              }).join('')}
            </ul>
          </section>`).join('')
        : Fin.ui.emptyState('🏷️', 'Nenhuma categoria', 'Crie categorias para organizar seus lançamentos.')}
      </div>`;

    view.addEventListener('change', (e) => {
      if (e.target.name === 'cat-tipo') { tipo = e.target.value; Fin.router.render(); }
    }, { signal });
    view.addEventListener('click', (e) => {
      if (e.target.closest('[data-act="nova"]')) return Fin.forms.categoria.open({ tipo });
      const li = e.target.closest('[data-cat]');
      if (li) Fin.forms.categoria.open({ id: li.dataset.cat });
    }, { signal });
    view.addEventListener('keydown', (e) => {
      const li = e.target.closest?.('[data-cat]');
      if (li && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); Fin.forms.categoria.open({ id: li.dataset.cat }); }
    }, { signal });
  }

  return { title: 'Categorias', render };
})();
