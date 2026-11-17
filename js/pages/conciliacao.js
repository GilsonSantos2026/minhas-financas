/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.conciliacao=(()=>{const s=Fin.fmt,p=s.esc,m=Fin.finance,r={preset:"mes",tipo:"despesa",filtro:""},h=[["mes","Mês"],["3m","3 meses"],["ano","Ano"]];function w(){const a=Fin.state.mes;return r.preset==="ano"?{ini:`${a.slice(0,4)}-01`,fim:a}:{ini:r.preset==="3m"?s.addMonths(a,-2):a,fim:a}}function x(a){return{ok:["✓",a?"Recebido igual":"Pago igual","bg-emerald-50 text-emerald-800"],maior:["＋",a?"Recebido a mais":"Pago a mais","bg-amber-50 text-amber-800"],menor:["−",a?"Recebido a menos":"Pago a menos","bg-sky-50 text-sky-800"],parcial:["◐","Parcial","bg-amber-50 text-amber-800"],atrasado:["!","Atrasado","bg-rose-50 text-rose-700"],pendente:["○","A vencer","bg-slate-100 text-slate-600"]}}const v=(a,t)=>`<span class="pill ${a[t][2]}"><span aria-hidden="true">${a[t][0]}</span>${a[t][1]}</span>`;function u(a,t,n="",e=""){return`
      <div class="bg-white rounded-2xl shadow-sm p-4 min-w-0">
        <div class="text-xs text-slate-500">${a}</div>
        <div class="text-lg sm:text-xl font-semibold mt-0.5 truncate tabular-nums ${e}">${t}</div>
        ${n?`<div class="text-xs text-slate-500 mt-0.5">${n}</div>`:""}
      </div>`}function F(a,t){const n=Math.round(a.percentualPago*100);return`
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${u("Lançado",s.brl(a.lancado),`${a.qtd} ${a.qtd===1?"lançamento":"lançamentos"}`)}
        ${u(t?"Recebido":"Pago (efetivado)",s.brl(a.pago),`${n}% ${t?"recebido":"pago"}`,"text-emerald-800")}
        ${u(t?"Falta receber":"Falta pagar",s.brl(a.pendente),a.porSituacao.atrasado?`<span class="text-rose-700 font-medium">! ${a.porSituacao.atrasado} atrasado${a.porSituacao.atrasado>1?"s":""}</span>`:"nada atrasado ✓",a.pendente>0?"text-amber-800":"")}
        ${u("Diferença paga",`${a.acrescimos-a.descontos>=0?"+":"−"}${s.brl(Math.abs(a.acrescimos-a.descontos))}`,`<span class="text-amber-800">+${s.brl(a.acrescimos)} ${t?"a mais":"juros/multas"}</span> · <span class="text-emerald-800">−${s.brl(a.descontos)} ${t?"a menos":"descontos"}</span>`)}
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-4">
        <div class="flex justify-between text-xs text-slate-500 mb-1.5"><span>${t?"Recebimentos":"Pagamentos"} conciliados</span><span class="tabular-nums">${n}%</span></div>
        <div class="h-2 rounded-full bg-[#cde2fb] overflow-hidden" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${n}" aria-label="Percentual conciliado">
          <div class="h-full rounded-full bg-[#2a78d6]" style="width:${n}%"></div>
        </div>
        ${a.pagosComAtraso||a.semData?`<p class="text-xs text-slate-600 mt-2">
          ${a.pagosComAtraso?`<span class="text-amber-800">◷ ${a.pagosComAtraso} ${t?"recebido":"pago"}${a.pagosComAtraso>1?"s":""} depois do vencimento</span>`:""}
          ${a.pagosComAtraso&&a.semData?" · ":""}
          ${a.semData?`<span>${a.semData} sem data de ${t?"recebimento":"pagamento"} informada</span>`:""}</p>`:""}
      </div>`}function L(a,t){const n=["atrasado","pendente","parcial","maior","menor","ok"],e=(o,c,i)=>`<button data-filtro="${o}" class="chip !shadow-none border border-slate-200 ${r.filtro===o?"is-active !border-transparent":""}">${c}<span class="text-xs opacity-75 ml-1">${i}</span></button>`;return`<div class="chips flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filtrar por situação">
      ${e("","Todos",a.qtd)}
      ${n.filter(o=>a.porSituacao[o]).map(o=>e(o,`${t[o][0]} ${t[o][1]}`,a.porSituacao[o])).join("")}
    </div>`}function y({l:a,c:t},n,e){const o=m.dataRef(a),c=t.pago?`${s.brl(t.pago)}${a.dataPagamento?` <span class="text-slate-400">em ${s.date(a.dataPagamento).slice(0,5)}</span>`:""}`:'<span class="text-slate-400">—</span>',i=t.situacao==="maior"?`<span class="text-amber-800">+${s.brl(t.diferenca)}</span>`:t.situacao==="menor"?`<span class="text-emerald-800">−${s.brl(-t.diferenca)}</span>`:t.falta?`<span class="text-slate-600">falta ${s.brl(t.falta)}</span>`:'<span class="text-slate-400">—</span>',d=t.pagoComAtraso?`<span class="text-amber-800">◷ ${t.diasAtraso}d após venc.</span>`:t.situacao==="atrasado"?`<span class="text-rose-700">vencido há ${t.diasAtraso}d</span>`:"";return`
      <li class="lanc-item px-3 sm:px-4 py-3 cursor-pointer" data-edit="${a.id}" role="button" tabindex="0" aria-label="Editar ${p(a.descricao||a.categoria)}">
        <div class="flex items-start gap-3">
          ${Fin.ui.catIcon(a.categoriaIcone,a.categoria,a.tipo)}
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="text-sm font-medium truncate">${p(a.descricao||a.categoria)}</div>
                <div class="text-xs text-slate-500 truncate">vence ${s.date(o).slice(0,5)} · ${p(a.categoria)}${a.formaPagamento?` · ${p(a.formaPagamento)}`:""}</div>
              </div>
              <div class="shrink-0">${v(n,t.situacao)}</div>
            </div>
            <dl class="grid grid-cols-3 gap-2 mt-2 text-xs tabular-nums">
              <div><dt class="text-slate-500">Lançado</dt><dd class="font-semibold text-slate-800">${s.brl(t.lancado)}</dd></div>
              <div><dt class="text-slate-500">${e?"Recebido":"Pago"}</dt><dd class="font-semibold text-slate-800">${c}</dd></div>
              <div class="text-right"><dt class="text-slate-500"><span class="sm:hidden">Dif.</span><span class="hidden sm:inline">Diferença</span></dt><dd class="font-semibold">${i}</dd></div>
            </dl>
            ${d?`<div class="text-[11px] mt-1">${d}</div>`:""}
          </div>
        </div>
      </li>`}function P(a){const t=m.conciliacaoFaturas(a);if(!t.length)return"";const n=x(!1);return`
      <section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
        ${Fin.icones.titulo("cartao","violet",`Faturas do cartão · ${s.monthLong(a).toLowerCase()}`)}
        <p class="text-xs text-slate-500 mb-3">Soma das compras × lançamento de pagamento × valor efetivamente pago.</p>
        <div class="table-wrap border border-slate-200 rounded-xl"><table>
          <thead><tr><th>Cartão</th><th class="num">Compras</th><th class="num">Lançado</th><th class="num">Pago</th><th>Situação</th></tr></thead>
          <tbody>${t.map(e=>`
            <tr ${e.pagamento?`data-edit="${e.pagamento.id}" class="cursor-pointer hover:bg-slate-50"`:""}>
              <td>💳 ${p(e.cartao)}</td>
              <td class="num">${s.brl(e.compras)}</td>
              <td class="num">${e.pagamento?s.brl(e.lancado):'<span class="text-rose-700">não lançado</span>'}</td>
              <td class="num">${e.pagamento?s.brl(e.pago):"—"}</td>
              <td>${e.situacao?v(n,e.situacao):`<a href="#/cartoes" data-ir-cartao="${p(e.cartao)}" class="text-prim-700 text-xs font-semibold hover:underline">Lançar</a>`}
                ${e.difComprasLancado&&Math.abs(e.difComprasLancado)>=.01?`<div class="text-[11px] text-slate-500 mt-0.5">compras ${e.difComprasLancado>0?"+":"−"}${s.brl(Math.abs(e.difComprasLancado))} vs lançado</div>`:""}</td>
            </tr>`).join("")}
          </tbody>
        </table></div>
      </section>`}function C(a,t){const n=i=>{const d=i==null?"":String(i);return/[";\n]/.test(d)?`"${d.replace(/"/g,'""')}"`:d},e=i=>i==null?"":Number(i).toFixed(2).replace(".",","),o=x(t),c=[["Vencimento","Descrição","Categoria","Valor lançado",t?"Valor recebido":"Valor pago",t?"Data do recebimento":"Data do pagamento","Diferença","Falta","Dias de atraso","Situação","Forma de pagamento"]];for(const{l:i,c:d}of a)c.push([s.date(m.dataRef(i)),i.descricao,i.categoria,e(d.lancado),e(d.pago),s.date(i.dataPagamento),e(d.diferenca),e(d.falta),d.diasAtraso||"",o[d.situacao][1],i.formaPagamento]);return"\uFEFF"+c.map(i=>i.map(n).join(";")).join(`\r
`)}function S(a,{signal:t}){if(!Fin.storage.hasData()){a.innerHTML=Fin.ui.emptyState("⚖️","Nada para conciliar","Crie lançamentos ou importe sua planilha.");return}const{ini:n,fim:e}=w(),o=r.tipo==="receita",c=x(o),{itens:i,totais:d}=m.conciliacaoPeriodo(n,e,r.tipo);r.filtro&&!d.porSituacao[r.filtro]&&(r.filtro="");const g=r.filtro?i.filter(l=>l.c.situacao===r.filtro):i;a.innerHTML=`
      <div class="space-y-4">
        ${Fin.ui.filtroPessoa()}
        ${Fin.ui.monthNav(e)}
        <div class="bg-white rounded-2xl shadow-sm p-3 flex flex-wrap items-center gap-3 justify-between">
          <div class="chips flex gap-2" role="tablist" aria-label="Período">
            ${h.map(([l,b])=>`<button data-preset="${l}" class="chip !shadow-none border border-slate-200 ${r.preset===l?"is-active !border-transparent":""}">${b}</button>`).join("")}
          </div>
          <div class="seg w-56 !text-xs" role="tablist" aria-label="Tipo">
            <label><input type="radio" name="conc-tipo" value="despesa" ${o?"":"checked"}><span class="!py-1.5">Despesas</span></label>
            <label><input type="radio" name="conc-tipo" value="receita" ${o?"checked":""}><span class="!py-1.5">Receitas</span></label>
          </div>
          <p class="text-xs text-slate-500 w-full">${n===e?s.monthLong(e):`${s.monthShort(n)} a ${s.monthShort(e)}`} · por mês de competência</p>
        </div>

        ${F(d,o)}
        ${o?"":P(e)}

        <section class="space-y-2">
          <div class="flex items-center justify-between gap-2 px-1">
            ${Fin.icones.titulo("balanca","sky",`Lançamentos × ${o?"recebimentos":"pagamentos"}`)}
            <button data-act="csv" class="text-xs font-semibold text-prim-700 hover:underline">⬇️ Exportar CSV</button>
          </div>
          ${L(d,c)}
          ${g.length?`<ul class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">${g.map(l=>y(l,c,o)).join("")}</ul>`:Fin.ui.emptyState("⚖️","Nada neste filtro","Escolha outra situação ou período.")}
          <p class="text-xs text-slate-500 px-1">Toque num lançamento para informar ou corrigir o ${o?"recebimento":"pagamento"} (data e valor).</p>
        </section>
      </div>`,a.addEventListener("click",l=>{const b=l.target.closest("[data-preset]");if(b)return r.preset=b.dataset.preset,Fin.router.render();const f=l.target.closest("[data-filtro]");if(f)return r.filtro=f.dataset.filtro,Fin.router.refresh();if(l.target.closest('[data-act="csv"]')){const $=document.createElement("a");$.href=URL.createObjectURL(new Blob([C(g,o)],{type:"text/csv;charset=utf-8"})),$.download=`conciliacao_${r.tipo}_${n}_a_${e}.csv`,$.click(),setTimeout(()=>URL.revokeObjectURL($.href),1e3)}},{signal:t}),a.addEventListener("change",l=>{l.target.name==="conc-tipo"&&(r.tipo=l.target.value,r.filtro="",Fin.router.render())},{signal:t})}return{title:"Conciliação",render:S,estado:r}})();
