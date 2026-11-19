/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.orcamento=(()=>{const o=Fin.fmt,d=o.esc,x=Fin.finance;function $(a,s){const i=s>0?a/s:0;return i>1?{cor:"#d03b3b",trilho:"#f6d0d0",icone:"!",texto:`Estourou ${o.brl(a-s)}`,cls:"text-rose-700"}:i>=.8?{cor:"#fab219",trilho:"#fdecc8",icone:"◐",texto:`Atenção: ${Math.round(i*100)}% usado`,cls:"text-amber-800"}:{cor:"#2a78d6",trilho:"#cde2fb",icone:"✓",texto:`Restam ${o.brl(s-a)}`,cls:"text-slate-600"}}function h(a,s,i){const t=$(a,s),m=s>0?Math.min(100,a/s*100):0;return`
      <div class="h-2 rounded-full overflow-hidden" style="background:${t.trilho}" role="meter"
           aria-valuemin="0" aria-valuemax="${s}" aria-valuenow="${Math.round(a*100)/100}" aria-label="${d(i)}: ${t.texto}">
        <div class="h-full rounded-full" style="width:${m}%;background:${t.cor}"></div>
      </div>
      <div class="flex justify-between gap-2 text-xs mt-1">
        <span class="${t.cls} font-medium"><span aria-hidden="true">${t.icone}</span> ${t.texto}</span>
        <span class="text-slate-500 tabular-nums">${o.brl(a)} de ${o.brl(s)}</span>
      </div>`}function b(a){return`
      <li class="py-3" data-orc="${a.id}" role="button" tabindex="0" aria-label="Editar orçamento de ${d(a.categoria)}">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-base" aria-hidden="true">${a.icone||"🏷️"}</span>
          <span class="text-sm font-medium truncate flex-1">${d(a.categoria)}</span>
        </div>
        ${h(a.gasto,a.orcado,a.categoria)}
      </li>`}function v(a,{signal:s}){const i=Fin.state.mes,t=x.orcamento(i),m=t.totalOrcado-t.totalGasto,p=t.itens.filter(e=>e.pct>1).length,f=t.itens.filter(e=>e.pct>=.8&&e.pct<=1).length,w=t.semOrcamento.reduce((e,n)=>e+(n.gasto||0),0),y=t.semOrcamento.length?Fin.ui.dobra({grupo:"orcamento",id:"sem",icone:"alerta",cor:"amber",titulo:"Gastos sem orçamento",resumo:`${t.semOrcamento.length} ${t.semOrcamento.length===1?"categoria soma":"categorias somam"} ${o.brl(w)} sem limite`,corpo:()=>`
        <p class="text-xs text-slate-500 mb-2">Categorias com gasto neste mês e sem limite definido.</p>
        <ul class="divide-y divide-slate-100">
          ${t.semOrcamento.map(e=>`
            <li class="flex items-center gap-3 py-2.5">
              <span class="text-base" aria-hidden="true">${e.icone||"🏷️"}</span>
              <span class="text-sm flex-1 min-w-0 truncate">${d(e.categoria)}</span>
              <span class="text-sm tabular-nums text-slate-700">${o.brl(e.gasto)}</span>
              <button data-definir="${d(e.categoria)}" class="text-xs font-semibold text-prim-700 hover:underline shrink-0 min-h-[36px] px-1">Definir</button>
            </li>`).join("")}
        </ul>`}):"";let u="";if(i===o.currentYM()&&t.totalOrcado>0){const e=new Date,n=e.getDate(),r=new Date(e.getFullYear(),e.getMonth()+1,0).getDate(),c=n>2?t.totalGasto/n*r:null;if(c!=null){const l=t.totalOrcado-c;u=l>=0?`No ritmo de hoje, o mês termina com <b>${o.brl(l)}</b> de folga.`:`No ritmo de hoje, o mês termina <b>${o.brl(-l)}</b> acima do orçamento.`,u+=` Faltam ${r-n} ${r-n===1?"dia":"dias"}.`}}const g=t.totalOrcado>0?Math.min(100,t.totalGasto/t.totalOrcado*100):0,O=t.totalGasto>t.totalOrcado?"#fb7185":g>=80?"#fbbf24":"#c6a45c",F=[...t.itens].sort((e,n)=>n.pct-e.pct);a.innerHTML=`
      <div class="space-y-4">
        ${Fin.ui.filtroPessoa()}
        ${Fin.ui.monthNav(i)}
        ${t.itens.length?`
          <section class="hero-topo text-white rounded-3xl shadow-sm p-4 sm:p-5 space-y-3">
            <div>
              <div class="hero-rotulo text-[12px] font-semibold uppercase tracking-wider text-white/75">${m>=0?"Ainda dá para gastar":"Acima do orçamento"}</div>
              <div class="text-[2.4rem] leading-tight font-semibold tracking-tight tabular-nums mt-0.5 ${m<0?"text-rose-200":""}">${o.brl(Math.abs(m))}</div>
            </div>
            <div>
              <div class="h-2 rounded-full bg-white/15 overflow-hidden" role="meter" aria-valuemin="0" aria-valuemax="${t.totalOrcado}" aria-valuenow="${Math.round(t.totalGasto*100)/100}" aria-label="Orçamento total usado"><div class="h-full rounded-full" style="width:${g}%;background:${O}"></div></div>
              <div class="flex justify-between text-[12px] text-white/75 mt-1"><span>${Math.round(t.totalGasto/t.totalOrcado*100)}% usado</span><span class="tabular-nums">${o.brl(t.totalGasto)} de ${o.brl(t.totalOrcado)}</span></div>
            </div>
            <div class="flex flex-wrap gap-1.5 text-[12px]">
              <span class="rounded-full bg-white/10 px-2.5 py-0.5">${t.itens.length} ${t.itens.length===1?"categoria":"categorias"}</span>
              ${p?`<span class="rounded-full bg-rose-400/25 text-rose-100 px-2.5 py-0.5 font-semibold">! ${p} estourada${p>1?"s":""}</span>`:""}
              ${f?`<span class="rounded-full bg-amber-400/25 text-amber-100 px-2.5 py-0.5 font-semibold">◐ ${f} em atenção</span>`:""}
              ${!p&&!f?'<span class="rounded-full bg-emerald-400/20 text-emerald-100 px-2.5 py-0.5 font-semibold">✓ tudo dentro do limite</span>':""}
            </div>
            ${u?`<p class="text-[13.5px] text-white/85">${u}</p>`:""}
          </section>

          <section class="bg-white rounded-2xl shadow-sm px-4 sm:px-5 py-2">
            <ul class="divide-y divide-slate-100">${F.map(b).join("")}</ul>
          </section>`:Fin.ui.emptyState("🎯","Nenhum orçamento definido","Defina um limite mensal por categoria e acompanhe aqui quanto já foi gasto. Comece pelas categorias abaixo.")}
        ${y}
        <p class="text-xs text-slate-500 px-1">Compras no cartão contam pela categoria de cada compra.
          <a href="#/categorias" class="text-prim-700 font-medium hover:underline">Gerenciar categorias</a></p>
      </div>`;const M=e=>Fin.forms.categoria.open({id:e,foco:"orcamento"});a.addEventListener("click",e=>{const n=e.target.closest("[data-definir]");if(n){const r=n.dataset.definir;let c=x.categorias("despesa").find(l=>l.nome===r);if(!c){const l=t.semOrcamento.find(j=>j.categoria===r);c=Fin.storage.upsert("categorias",{nome:r,icone:l?.icone||null,tipo:"despesa",classificacao:null,orcamentoMensal:0})}M(c.id)}},{signal:s})}return{title:"Orçamento",render:v,linhaHTML:b}})();
