/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.mais=(()=>{const a=[["#/investimentos","alta","emerald","Investimentos","Patrimônio, reserva, ativos, proventos e metas"],["#/conciliacao","balanca","sky","Conciliação","Lançado × pago: diferenças, pendências e atrasos"],["#/planilha","tabela","slate","Planilha","Todos os lançamentos em tabela, com filtros, para conferência"],["#/relatorios","pizza","violet","Relatórios","Evolução, categorias, comparativos e exportação"],["#/orcamento","alvo","orange","Orçamento","Limites mensais por categoria"],["#/categorias","etiqueta","amber","Categorias","Criar, editar, ícones e classificação"],["#/dados","cofreDados","blue","Dados e backup","Importar planilha e baixar backup"],["#/educacao","livro","emerald","Aprender","Guias rápidos: orçamento, reserva, investimentos e dívidas"],["#/configuracoes","engrenagem","prim","Configurações","Perfil, cor do app, pessoas, ajuda e sugestões"]];function e(s){s.innerHTML=`
      <ul class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
        ${a.map(([i,o,t,n,r])=>`
          <li><a href="${i}" class="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50">
            ${Fin.icones.badge(o,t,"w-10 h-10")}
            <span class="flex-1 min-w-0"><span class="block text-sm font-medium">${n}</span>
              <span class="block text-xs text-slate-500">${r}</span></span>
            <span class="text-slate-300" aria-hidden="true">›</span>
          </a></li>`).join("")}
      </ul>
      <div id="sync-status-mais" class="mt-4"></div>
      <button data-bloquear class="mt-4 w-full bg-white rounded-2xl shadow-sm flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50">
        ${Fin.icones.badge("sair","slate","w-10 h-10")}
        <span class="flex-1"><span class="block text-sm font-medium">Sair do app</span>
          <span class="block text-xs text-slate-500">Usuário: ${Fin.fmt.esc(Fin.cofre.usuario()||"—")} · para voltar, entre com sua senha</span></span>
      </button>`,Fin.drive?.desenharStatus()}return{title:"Mais",render:e}})();
