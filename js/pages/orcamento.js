/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.orcamento=(()=>{const i=Fin.fmt,o=i.esc,p=Fin.finance;function g(e,s){const n=s>0?e/s:0;return n>1?{cor:"#d03b3b",trilho:"#f6d0d0",icone:"!",texto:`Estourou ${i.brl(e-s)}`,cls:"text-rose-700"}:n>=.8?{cor:"#fab219",trilho:"#fdecc8",icone:"◐",texto:`Atenção: ${Math.round(n*100)}% usado`,cls:"text-amber-800"}:{cor:"#2a78d6",trilho:"#cde2fb",icone:"✓",texto:`Restam ${i.brl(s-e)}`,cls:"text-slate-600"}}function u(e,s,n){const t=g(e,s),c=s>0?Math.min(100,e/s*100):0;return`
      <div class="h-2 rounded-full overflow-hidden" style="background:${t.trilho}" role="meter"
           aria-valuemin="0" aria-valuemax="${s}" aria-valuenow="${Math.round(e*100)/100}" aria-label="${o(n)}: ${t.texto}">
        <div class="h-full rounded-full" style="width:${c}%;background:${t.cor}"></div>
      </div>
      <div class="flex justify-between gap-2 text-xs mt-1">
        <span class="${t.cls} font-medium"><span aria-hidden="true">${t.icone}</span> ${t.texto}</span>
        <span class="text-slate-500 tabular-nums">${i.brl(e)} de ${i.brl(s)}</span>
      </div>`}function x(e){return`
      <li class="py-3" data-orc="${e.id}" role="button" tabindex="0" aria-label="Editar orçamento de ${o(e.categoria)}">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-base" aria-hidden="true">${e.icone||"🏷️"}</span>
          <span class="text-sm font-medium truncate flex-1">${o(e.categoria)}</span>
        </div>
        ${u(e.gasto,e.orcado,e.categoria)}
      </li>`}function b(e,{signal:s}){const n=Fin.state.mes,t=p.orcamento(n),c=t.totalOrcado-t.totalGasto,r=t.itens.filter(a=>a.pct>1).length,f=t.itens.filter(a=>a.pct>=.8&&a.pct<=1).length,h=t.semOrcamento.length?`
      <section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
        ${Fin.icones.titulo("alerta","amber","Gastos sem orçamento")}
        <p class="text-xs text-slate-500 mb-2">Categorias com gasto neste mês e sem limite definido.</p>
        <ul class="divide-y divide-slate-100">
          ${t.semOrcamento.map(a=>`
            <li class="flex items-center gap-3 py-2.5">
              <span class="text-base" aria-hidden="true">${a.icone||"🏷️"}</span>
              <span class="text-sm flex-1 min-w-0 truncate">${o(a.categoria)}</span>
              <span class="text-sm tabular-nums text-slate-700">${i.brl(a.gasto)}</span>
              <button data-definir="${o(a.categoria)}" class="text-xs font-semibold text-prim-700 hover:underline shrink-0">Definir</button>
            </li>`).join("")}
        </ul>
      </section>`:"";e.innerHTML=`
      <div class="space-y-4">
        ${Fin.ui.filtroPessoa()}
        ${Fin.ui.monthNav(n)}
        ${t.itens.length?`
          <section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
            <div class="text-sm text-slate-500">${c>=0?"Disponível no orçamento":"Acima do orçamento"}</div>
            <div class="text-[40px] sm:text-5xl font-semibold tracking-tight mt-1 ${c<0?"text-rose-700":""}">${i.brl(Math.abs(c))}</div>
            <div class="mt-3">${u(t.totalGasto,t.totalOrcado,"Orçamento total")}</div>
            <p class="text-xs text-slate-500 mt-2">${t.itens.length} ${t.itens.length===1?"categoria":"categorias"} com orçamento
              ${r?` · <span class="text-rose-700 font-medium">! ${r} estourada${r>1?"s":""}</span>`:""}
              ${f?` · <span class="text-amber-800 font-medium">◐ ${f} em atenção</span>`:""}</p>
          </section>

          <section class="bg-white rounded-2xl shadow-sm px-4 sm:px-5 py-2">
            <ul class="divide-y divide-slate-100">${t.itens.map(x).join("")}</ul>
          </section>`:Fin.ui.emptyState("🎯","Nenhum orçamento definido","Defina um limite mensal por categoria e acompanhe aqui quanto já foi gasto. Comece pelas categorias abaixo.")}
        ${h}
        <p class="text-xs text-slate-500 px-1">Compras no cartão contam pela categoria de cada compra.
          <a href="#/categorias" class="text-prim-700 font-medium hover:underline">Gerenciar categorias</a></p>
      </div>`;const v=a=>Fin.forms.categoria.open({id:a,foco:"orcamento"});e.addEventListener("click",a=>{const $=a.target.closest("[data-definir]");if($){const l=$.dataset.definir;let d=p.categorias("despesa").find(m=>m.nome===l);if(!d){const m=t.semOrcamento.find(F=>F.categoria===l);d=Fin.storage.upsert("categorias",{nome:l,icone:m?.icone||null,tipo:"despesa",classificacao:null,orcamentoMensal:0})}v(d.id)}},{signal:s})}return{title:"Orçamento",render:b,linhaHTML:x}})();
