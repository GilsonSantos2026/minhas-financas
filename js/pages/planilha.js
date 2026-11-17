/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.planilha=(()=>{const i=Fin.fmt,u=i.esc,c=Fin.finance,v=()=>Fin.parsers,t={periodo:"12m",custom:{ini:"",fim:""},busca:"",tipo:"",status:"",categoria:"",forma:"",ordem:{col:"vencimento",dir:1}},P={pago:["✓","Pago"],aberto:["○","Em aberto"],atrasado:["!","Atrasado"],parcial:["◐","Parcial"]},b=[["competencia","Compet.",a=>c.competencia(a),""],["vencimento","Vencimento",a=>c.dataRef(a)||"",""],["descricao","Descrição",a=>(a.descricao||"").toLowerCase(),"min-w-[18rem]"],["categoria","Categoria",a=>(a.categoria||"").toLowerCase(),"min-w-[9rem]"],["tipo","Tipo",a=>a.tipo,""],["lancado","Lançado",a=>(a.tipo==="receita"?1:-1)*(a.valorPrevisto??c.valor(a)),"num"],["status","Status",a=>c.statusEfetivo(a),""],["dataPagamento","Pago em",a=>a.dataPagamento||"",""],["pago","Valor pago",a=>c.conciliar(a).pago,"num"],["diferenca","Diferença",a=>c.conciliar(a).diferenca,"num"],["forma","Forma",a=>(a.formaPagamento||"").toLowerCase(),""],["observacao","Observação",a=>(a.observacao||"").toLowerCase(),"min-w-[12rem]"]];function F(a){const l=v().normalize(t.busca);return Fin.periodo.filtrar(a,t.periodo,Fin.state.mes,t.custom).filter(s=>{if(t.tipo&&s.tipo!==t.tipo||t.categoria&&s.categoria!==t.categoria||t.forma&&(s.formaPagamento||"—")!==t.forma)return!1;if(t.status){const r=c.statusEfetivo(s);if(t.status==="pendentes"?r==="pago":r!==t.status)return!1}return!(l&&!v().normalize([s.descricao,s.categoria,s.observacao,s.formaPagamento].join(" ")).includes(l))})}function y(a){const s=(b.find(r=>r[0]===t.ordem.col)||b[1])[2];return[...a].sort((r,o)=>{const d=s(r),p=s(o);return(typeof d=="number"&&typeof p=="number"?d-p:String(d).localeCompare(String(p),"pt-BR"))*t.ordem.dir||(c.dataRef(r)||"").localeCompare(c.dataRef(o)||"")})}function S(a,l){const s=c.conciliar(a),r=c.statusEfetivo(a),o=a.tipo==="receita",[d,p]=P[r]||["",r],x=r==="pago"?"text-emerald-800":r==="atrasado"?"text-rose-700":r==="parcial"?"text-amber-800":"text-slate-500",$=s.diferenca>0?`<span class="text-amber-800">+${i.brl(s.diferenca)}</span>`:s.diferenca<0?`<span class="text-emerald-800">−${i.brl(-s.diferenca)}</span>`:"";return`
      <tr data-edit="${a.id}" class="cursor-pointer ${l%2?"bg-slate-50/60":""} hover:bg-emerald-50/60">
        <td>${i.monthShort(c.competencia(a))}</td>
        <td class="tabular-nums">${i.date(c.dataRef(a))}</td>
        <td class="!whitespace-normal">${Fin.ui.autorMini(a)?`<span class="inline-flex align-middle mr-1">${Fin.ui.autorMini(a)}</span>`:""}${u(a.descricao||"—")}${a.grupo&&a.parcela?` <span class="text-slate-400 text-[11px]">${a.recorrencia==="fixo"?"🔁 ":""}${a.parcela.atual}/${a.parcela.total}</span>`:""}</td>
        <td>${a.categoriaIcone?`<span aria-hidden="true">${a.categoriaIcone}</span> `:""}${u(a.categoria||"")}</td>
        <td class="${o?"text-emerald-700":"text-slate-600"}">${o?"Receita":"Despesa"}</td>
        <td class="num font-semibold ${o?"text-emerald-700":""}">${o?"":"−"}${i.brl(s.lancado)}</td>
        <td class="${x}"><span aria-hidden="true">${d}</span> ${p}</td>
        <td class="tabular-nums">${a.dataPagamento&&r!=="aberto"&&r!=="atrasado"?i.date(a.dataPagamento):""}</td>
        <td class="num">${s.pago?i.brl(s.pago):""}</td>
        <td class="num">${$}</td>
        <td>${u(a.formaPagamento||"")}</td>
        <td class="!whitespace-normal text-slate-500 text-[12px]">${u(a.observacao||"")}</td>
      </tr>`}function w(a){const l={rec:0,desp:0,recPago:0,despPago:0,pend:0};for(const s of a){const r=c.conciliar(s);s.tipo==="receita"?(l.rec+=r.lancado,l.recPago+=r.pago):(l.desp+=r.lancado,l.despPago+=r.pago,l.pend+=r.falta)}return l}function L(a){const l=o=>{const d=o==null?"":String(o);return/[";\n]/.test(d)?`"${d.replace(/"/g,'""')}"`:d},s=o=>o==null||o===""?"":Number(o).toFixed(2).replace(".",","),r=[["Competência","Vencimento","Descrição","Categoria","Tipo","Valor lançado","Status","Data do pagamento","Valor pago","Diferença","Forma de pagamento","Observação"]];for(const o of a){const d=c.conciliar(o);r.push([c.competencia(o),i.date(c.dataRef(o)),o.descricao,o.categoria,o.tipo==="receita"?"Receita":"Despesa",s(d.lancado),(P[c.statusEfetivo(o)]||[])[1],o.dataPagamento?i.date(o.dataPagamento):"",d.pago?s(d.pago):"",d.diferenca?s(d.diferenca):"",o.formaPagamento,o.observacao])}return"\uFEFF"+r.map(o=>o.map(l).join(";")).join(`\r
`)}function T(a,{signal:l}){if(!Fin.storage.hasData()){a.innerHTML=Fin.ui.emptyState("📑","Nada para conferir","Crie lançamentos ou importe sua planilha.");return}const s=c.todos().filter(e=>c.daPessoa(e)),r=Fin.periodo.filtrar(s,t.periodo,Fin.state.mes,t.custom),o=[...new Set(r.map(e=>e.categoria).filter(Boolean))].sort((e,n)=>e.localeCompare(n,"pt-BR")),d=[...new Set(r.map(e=>e.formaPagamento||"—"))].sort((e,n)=>e.localeCompare(n,"pt-BR"));t.categoria&&!o.includes(t.categoria)&&(t.categoria=""),t.forma&&!d.includes(t.forma)&&(t.forma="");const p=(e,n,m)=>`<option value="${u(e)}" ${e===m?"selected":""}>${u(n)}</option>`,x=e=>t.ordem.col===e?t.ordem.dir>0?" ▲":" ▼":"";a.style.maxWidth="none",l.addEventListener("abort",()=>{a.style.maxWidth=""}),a.innerHTML=`
      <div class="space-y-3">
        <header class="hidden md:block">
          ${Fin.icones.titulo("tabela","slate","Planilha de conferência",{cls:"text-xl",tam:"w-9 h-9",ic:"w-5 h-5"})}
          <p class="text-sm text-slate-500">Todos os lançamentos, receitas e despesas, em linhas — filtre e confira.</p>
        </header>
        ${Fin.ui.filtroPessoa()}
        <section class="bg-white rounded-2xl shadow-sm p-3 space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <div class="chips flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Período">
              ${Fin.periodo.chips(t.periodo,[["custom","De/até"]])}
            </div>
            ${t.periodo==="mes"?`<div class="flex items-center gap-1 ml-auto">
              <button data-month="-1" class="icon-btn !w-8 !h-8 !text-lg" aria-label="Mês anterior">‹</button>
              <span class="text-sm font-medium">${i.monthShort(Fin.state.mes)}</span>
              <button data-month="1" class="icon-btn !w-8 !h-8 !text-lg" aria-label="Próximo mês">›</button></div>`:""}
          </div>
          ${t.periodo==="custom"?`<div class="grid grid-cols-2 gap-2 max-w-sm">
            <label class="field"><span>De</span><input id="pl-ini" type="month" class="input" value="${t.custom.ini||i.addMonths(i.currentYM(),-11)}"></label>
            <label class="field"><span>Até</span><input id="pl-fim" type="month" class="input" value="${t.custom.fim||i.currentYM()}"></label>
          </div>`:""}
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <input id="pl-busca" type="search" class="input col-span-2 sm:col-span-3 lg:col-span-2" placeholder="Buscar (ex.: aluguel)" value="${u(t.busca)}" aria-label="Buscar">
            <select id="pl-tipo" class="input" aria-label="Tipo">${p("","Receitas e despesas",t.tipo)}${p("despesa","Despesas",t.tipo)}${p("receita","Receitas",t.tipo)}</select>
            <select id="pl-status" class="input" aria-label="Status">${p("","Todos status",t.status)}${p("pendentes","Pendentes",t.status)}${p("pago","Pagos",t.status)}${p("atrasado","Atrasados",t.status)}${p("parcial","Parciais",t.status)}</select>
            <select id="pl-categoria" class="input" aria-label="Categoria">${p("","Todas categorias",t.categoria)}${o.map(e=>p(e,e,t.categoria)).join("")}</select>
            <select id="pl-forma" class="input" aria-label="Forma de pagamento">${p("","Todas formas",t.forma)}${d.map(e=>p(e,e==="—"?"Sem forma informada":e,t.forma)).join("")}</select>
          </div>
        </section>

        <div id="pl-resumo" class="grid grid-cols-2 lg:grid-cols-4 gap-2"></div>

        <div class="flex flex-wrap items-center justify-between gap-2 px-1">
          <p id="pl-info" class="text-xs text-slate-500"></p>
          <div class="flex gap-3">
            <button data-act="limpar" class="text-xs font-semibold text-slate-500 hover:underline">Limpar filtros</button>
            <button data-act="csv" class="text-xs font-semibold text-prim-700 hover:underline">⬇️ Exportar para Excel (CSV)</button>
          </div>
        </div>

        <div class="planilha bg-white rounded-2xl shadow-sm border border-slate-200 overflow-auto max-h-[70vh]">
          <table class="w-full text-[13px]">
            <thead class="sticky top-0 z-10 bg-slate-100">
              <tr>${b.map(([e,n,,m])=>`<th class="${m}"><button data-ordem="${e}" class="font-semibold hover:text-slate-900 whitespace-nowrap">${n}${x(e)}</button></th>`).join("")}</tr>
            </thead>
            <tbody id="pl-corpo"></tbody>
            <tfoot id="pl-rodape" class="sticky bottom-0 bg-slate-100 font-semibold"></tfoot>
          </table>
        </div>
        <p class="text-xs text-slate-500 px-1">Toque numa linha para editar. Toque no título de uma coluna para ordenar.</p>
      </div>`;let $=[];const h=()=>{const e=y(F(s));$=e;const n=w(c.naVisao(e)),m=(f,g,C,R="")=>`<div class="bg-white rounded-2xl shadow-sm p-3 min-w-0">
        <div class="text-[11px] text-slate-500">${f}</div><div class="font-semibold tabular-nums truncate ${R}">${g}</div>
        <div class="text-[11px] text-slate-500 truncate">${C}</div></div>`;a.querySelector("#pl-resumo").innerHTML=m("Receitas (lançado)",i.brl(n.rec),`recebido ${i.brl(n.recPago)}`,"text-emerald-700")+m("Despesas (lançado)",i.brl(n.desp),`pago ${i.brl(n.despPago)}`)+m("Saldo (lançado)",i.brl(n.rec-n.desp),"receitas − despesas",n.rec-n.desp<0?"text-rose-700":"")+m("Falta pagar",i.brl(n.pend),`${e.filter(f=>c.statusEfetivo(f)==="atrasado").length} atrasado(s)`,n.pend?"text-amber-800":""),a.querySelector("#pl-info").textContent=`${e.length} de ${s.length} lançamentos · ${Fin.periodo.rotulo(t.periodo,Fin.state.mes,t.custom)}`,a.querySelector("#pl-corpo").innerHTML=e.length?e.map(S).join(""):`<tr><td colspan="${b.length}" class="!text-center !py-8 text-slate-500">Nenhum lançamento com estes filtros.</td></tr>`,a.querySelector("#pl-rodape").innerHTML=e.length?`
        <tr><td colspan="5">Total · ${e.length} linhas</td>
          <td class="num">${i.brl(n.rec-n.desp)}</td><td></td><td></td>
          <td class="num">${i.brl(n.recPago-n.despPago)}</td><td colspan="3" class="!font-normal text-slate-500 text-[12px]">receitas − despesas</td></tr>`:""};a.querySelector("#pl-busca").addEventListener("input",e=>{t.busca=e.target.value,h()}),["tipo","status","categoria","forma"].forEach(e=>a.querySelector(`#pl-${e}`).addEventListener("change",n=>{t[e]=n.target.value,h()})),a.addEventListener("change",e=>{(e.target.id==="pl-ini"||e.target.id==="pl-fim")&&(t.custom.ini=a.querySelector("#pl-ini").value,t.custom.fim=a.querySelector("#pl-fim").value,Fin.router.render())},{signal:l}),a.addEventListener("click",e=>{const n=e.target.closest("[data-periodo]");if(n)return t.periodo=n.dataset.periodo,t.periodo==="custom"&&!t.custom.ini&&(t.custom={ini:i.addMonths(i.currentYM(),-11),fim:i.currentYM()}),Fin.router.render();const m=e.target.closest("[data-ordem]");if(m)return t.ordem=t.ordem.col===m.dataset.ordem?{col:m.dataset.ordem,dir:-t.ordem.dir}:{col:m.dataset.ordem,dir:1},Fin.router.refresh();const f=e.target.closest("[data-act]")?.dataset.act;if(f==="limpar")return Object.assign(t,{busca:"",tipo:"",status:"",categoria:"",forma:""}),Fin.router.render();if(f==="csv"){const g=document.createElement("a");g.href=URL.createObjectURL(new Blob([L($)],{type:"text/csv;charset=utf-8"})),g.download=`planilha_lancamentos_${i.todayISO()}.csv`,g.click(),setTimeout(()=>URL.revokeObjectURL(g.href),1e3)}},{signal:l}),h()}return{title:"Planilha",render:T,estado:t}})();
