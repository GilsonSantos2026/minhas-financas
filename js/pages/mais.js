/**
 * pages/mais.js — Menu "Mais" do celular (no computador, estes itens ficam no menu lateral).
 */
window.Fin = window.Fin || {};
Fin.pages = Fin.pages || {};

Fin.pages.mais = (() => {
  const ITENS = [
    ['#/investimentos', 'alta', 'emerald', 'Investimentos', 'Patrimônio, reserva, ativos, proventos e metas'],
    ['#/conciliacao', 'balanca', 'sky', 'Conciliação', 'Lançado × pago: diferenças, pendências e atrasos'],
    ['#/planilha', 'tabela', 'slate', 'Planilha', 'Todos os lançamentos em tabela, com filtros, para conferência'],
    ['#/relatorios', 'pizza', 'violet', 'Relatórios', 'Evolução, categorias, comparativos e exportação'],
    ['#/orcamento', 'alvo', 'orange', 'Orçamento', 'Limites mensais por categoria'],
    ['#/categorias', 'etiqueta', 'amber', 'Categorias', 'Criar, editar, ícones e classificação'],
    ['#/dados', 'cofreDados', 'blue', 'Dados e backup', 'Importar planilha e baixar backup'],
  ];

  function render(view) {
    view.innerHTML = `
      <ul class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
        ${ITENS.map(([href, icone, cor, titulo, desc]) => `
          <li><a href="${href}" class="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50">
            ${Fin.icones.badge(icone, cor, 'w-10 h-10')}
            <span class="flex-1 min-w-0"><span class="block text-sm font-medium">${titulo}</span>
              <span class="block text-xs text-slate-500">${desc}</span></span>
            <span class="text-slate-300" aria-hidden="true">›</span>
          </a></li>`).join('')}
      </ul>
      <div id="sync-status-mais" class="mt-4"></div>
      <button data-bloquear class="mt-4 w-full bg-white rounded-2xl shadow-sm flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50">
        ${Fin.icones.badge('cadeado', 'slate', 'w-10 h-10')}
        <span class="flex-1"><span class="block text-sm font-medium">Bloquear o app</span>
          <span class="block text-xs text-slate-500">Usuário: ${Fin.fmt.esc(Fin.cofre.usuario() || '—')}</span></span>
      </button>`;
    Fin.drive?.desenharStatus();
  }

  return { title: 'Mais', render };
})();
