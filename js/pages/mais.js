/**
 * pages/mais.js — Menu "Mais" do celular (no computador, estes itens ficam no menu lateral).
 */
window.Fin = window.Fin || {};
Fin.pages = Fin.pages || {};

Fin.pages.mais = (() => {
  const ITENS = [
    ['#/conciliacao', '⚖️', 'Conciliação', 'Lançado × pago: diferenças, pendências e atrasos'],
    ['#/relatorios', '📊', 'Relatórios', 'Evolução, categorias, comparativos e exportação'],
    ['#/orcamento', '🎯', 'Orçamento', 'Limites mensais por categoria'],
    ['#/categorias', '🏷️', 'Categorias', 'Criar, editar, ícones e classificação'],
    ['#/dados', '💾', 'Dados e backup', 'Importar planilha e baixar backup'],
  ];

  function render(view) {
    view.innerHTML = `
      <ul class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
        ${ITENS.map(([href, icone, titulo, desc]) => `
          <li><a href="${href}" class="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50">
            <span class="w-10 h-10 rounded-full bg-slate-100 grid place-items-center text-lg shrink-0" aria-hidden="true">${icone}</span>
            <span class="flex-1 min-w-0"><span class="block text-sm font-medium">${titulo}</span>
              <span class="block text-xs text-slate-500">${desc}</span></span>
            <span class="text-slate-300" aria-hidden="true">›</span>
          </a></li>`).join('')}
      </ul>
      <div id="sync-status-mais" class="mt-4"></div>
      <button data-bloquear class="mt-4 w-full bg-white rounded-2xl shadow-sm flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50">
        <span class="w-10 h-10 rounded-full bg-slate-100 grid place-items-center text-lg shrink-0" aria-hidden="true">🔒</span>
        <span class="flex-1"><span class="block text-sm font-medium">Bloquear o app</span>
          <span class="block text-xs text-slate-500">Usuário: ${Fin.fmt.esc(Fin.cofre.usuario() || '—')}</span></span>
      </button>`;
    Fin.drive?.desenharStatus();
  }

  return { title: 'Mais', render };
})();
