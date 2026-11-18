/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.mais=(()=>{const e=[["Planejar",[["#/orcamento","alvo","emerald","Orçamento","Limite de gastos por categoria"],["#/investimentos","alta","amber","Investimentos e metas","Patrimônio, reserva, ativos, proventos e metas"]]],["Organizar",[["#/cartoes","cartao","blue","Cartões e faturas","Compras, parcelas, limite e pagamento da fatura"],["#/categorias","etiqueta","violet","Categorias","Criar, editar, ícones e classificação"]]],["Ferramentas",[["#/conciliacao","balanca","slate","Conferir com o extrato","Previsto × pago: diferenças, pendências e atrasos"],["#/planilha","tabela","slate","Planilha","Todos os lançamentos em tabela, com filtros"],["#/importar-fatura","upload","slate","Importar fatura","PDF ou foto da fatura do cartão"]]],["Conta",[["#/dados","cofreDados","blue","Dados e backup","Google Drive, backup e importar planilha"],["#/educacao","livro","amber","Aprender","Guias rápidos: orçamento, reserva, investimentos e dívidas","data-aprender"],["#/configuracoes","engrenagem","prim","Configurações","Perfil, cor do app, pessoas, ajuda e sugestões"]]]];function s(t){t.innerHTML=`
      ${e.map(([a,o])=>`
        <section class="mb-5" aria-label="${a}">
          <h2 class="text-xs font-semibold uppercase tracking-[.1em] text-slate-500 mb-2 px-1">${a}</h2>
          <ul class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
            ${o.map(([i,r,n,l,p,c])=>`
              <li><a href="${i}" ${c||""} class="flex items-center gap-3 px-4 py-3.5 min-h-[64px] hover:bg-slate-50">
                ${Fin.icones.badge(r,n,"w-10 h-10")}
                <span class="flex-1 min-w-0"><span class="block text-[15px] font-medium">${l}</span>
                  <span class="block text-[13px] text-slate-500">${p}</span></span>
                <span class="text-slate-300" aria-hidden="true">›</span>
              </a></li>`).join("")}
          </ul>
        </section>`).join("")}
      <div id="sync-status-mais" class="mb-3"></div>
      <button data-bloquear class="w-full bg-white rounded-2xl shadow-sm flex items-center gap-3 px-4 py-3.5 min-h-[64px] text-left hover:bg-slate-50">
        ${Fin.icones.badge("sair","rose","w-10 h-10")}
        <span class="flex-1"><span class="block text-[15px] font-medium text-rose-700">Sair do app</span>
          <span class="block text-[13px] text-slate-500">Usuário: ${Fin.fmt.esc(Fin.cofre.usuario()||"—")} · para voltar, entre com sua senha</span></span>
      </button>`,Fin.drive?.desenharStatus()}return{title:"Mais",render:s}})();
