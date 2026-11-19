/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.cartoes=(()=>{const s=Fin.fmt,m=s.esc,o=Fin.finance;function P(c,n){return`
      <div class="chips flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0" role="tablist" aria-label="Cartões">
        ${c.map(e=>`
          <button role="tab" aria-selected="${e.nome===n}" data-cartao="${m(e.nome)}"
            class="chip ${e.nome===n?"is-active":""}"><span aria-hidden="true">💳</span>${m(e.nome)}</button>`).join("")}
        <button data-act="novo-cartao" class="chip" aria-label="Adicionar cartão">＋ Cartão</button>
      </div>`}function w(c,n,e){const a=o.pagamentoDaFatura(c,n);if(!a)return e?`
        <div class="flex flex-wrap items-center gap-3 bg-amber-50 rounded-xl px-3 py-2.5 text-sm">
          <span class="flex-1 min-w-[12rem]"><span aria-hidden="true">!</span> Nenhum lançamento de pagamento desta fatura.</span>
          <button data-act="sync" class="btn btn-ghost !py-1.5 !bg-white">Lançar pagamento</button>
        </div>`:"";const t=o.valor(a),r=Math.round((e-(a.valorPrevisto??t))*100)/100,i=["aberto","atrasado"].includes(o.statusEfetivo(a));return`
      <div class="bg-slate-50 rounded-xl px-3 py-2.5 text-sm space-y-2">
        <div class="flex items-center gap-3" data-edit="${a.id}" role="button" tabindex="0" aria-label="Abrir lançamento de pagamento">
          <span class="flex-1 min-w-0">Pagamento: ${o.faturaParcial(a)?`pagou <b class="tabular-nums text-rose-700">${s.brl(a.valorPago)}</b> de <b class="tabular-nums">${s.brl(a.valorPrevisto)}</b>`:`<b class="tabular-nums">${s.brl(t)}</b>`}
            <span class="text-slate-500 truncate">· ${m(a.descricao)}</span></span>
          ${Fin.ui.statusPill(a)}
        </div>
        ${Math.abs(r)>=.01?`
          <div class="flex flex-wrap items-center gap-2 text-xs text-slate-600 border-t border-slate-200 pt-2">
            <span class="flex-1 min-w-[12rem]">Compras somam ${s.brl(e)} (${r>0?"+":"−"}${s.brl(Math.abs(r))} em relação ao lançamento).</span>
            ${i?`<button data-act="sync" class="text-prim-700 font-semibold hover:underline">Atualizar para ${s.brl(e)}</button>`:""}
          </div>`:""}
      </div>
      ${o.faturaParcial(a)?Fin.ui.alertaRotativo(o.faturaParcial(a)):""}`}function C(c){const n=o.rotativo(c.nome,s.currentYM()),e=Math.round((n.encargos+n.pagoAMais)*100)/100,a=n.parciais.length;if(!a&&!e)return o.todos().filter(p=>o.isPagamentoFatura(p)&&o.statusEfetivo(p)==="pago"&&o.pagamentoDaFatura(c,o.competencia(p))?.id===p.id).length>=3?'<p class="text-xs text-emerald-800 bg-emerald-50 rounded-xl px-3 py-2"><span aria-hidden="true">✓</span> Fatura paga inteira nos últimos 12 meses — sem juros de rotativo.</p>':"";const t=a>=3,r=n.parciais.map(l=>`
      <li class="flex items-center gap-2 py-1.5" data-edit="${l.l.id}" role="button" tabindex="0">
        <span class="w-16 shrink-0 text-slate-500">${s.monthShort(l.competencia)}</span>
        <span class="flex-1 min-w-0 truncate">pagou ${s.brl(l.pago)} de ${s.brl(l.devido)}</span>
        <span class="shrink-0 font-medium text-rose-700 tabular-nums">−${s.brl(l.falta)}</span>
      </li>`).join(""),i=n.itensEncargo.slice().sort((l,p)=>p.fatura.localeCompare(l.fatura)).map(l=>`
      <li class="flex items-center gap-2 py-1.5">
        <span class="w-16 shrink-0 text-slate-500">${s.monthShort(l.fatura)}</span>
        <span class="flex-1 min-w-0 truncate">${m(l.descricao)}</span>
        <span class="shrink-0 font-medium tabular-nums">${s.brl(l.valor)}</span>
      </li>`).join("");return`
      <details class="rounded-xl ${t?"bg-rose-50 text-rose-900":"bg-amber-50 text-amber-900"} px-3 py-2.5 text-sm">
        <summary class="flex items-start gap-2">
          <span aria-hidden="true">${t?"!":"◐"}</span>
          <span class="flex-1">
            <b>Rotativo nos últimos 12 meses:</b> ${a} fatura${a===1?"":"s"} paga${a===1?"":"s"} a menos${a?` (${s.brl(n.totalFalta)} ficaram para trás)`:""}${e?` · <b>${s.brl(e)}</b> em juros, IOF e multa`:""}.
            ${t?'<span class="block text-xs mt-0.5">Está virando hábito: esses juros são o gasto mais caro do orçamento.</span>':""}
          </span>
          <span class="chev text-xs mt-0.5" aria-hidden="true">▸</span>
        </summary>
        <div class="mt-2 space-y-2 text-xs">
          ${r?`<div><div class="font-semibold mb-0.5">Faturas pagas a menos</div><ul class="divide-y divide-black/5">${r}</ul></div>`:""}
          ${i?`<div><div class="font-semibold mb-0.5">Juros, IOF e multa cobrados nas faturas</div><ul class="divide-y divide-black/5">${i}</ul></div>`:""}
          ${n.pagoAMais?`<p>Pago acima do lançado (juros/multa por atraso): <b>${s.brl(n.pagoAMais)}</b>.</p>`:""}
          <p class="opacity-80">Juros e encargos são lidos das compras da fatura com “juros”, “encargos”, “IOF”, “multa”, “mora” ou “rotativo” na descrição.</p>
        </div>
      </details>`}function j(c){if(!c.length)return Fin.ui.emptyState("🧾","Nenhuma compra nesta fatura","Use “Nova compra” para lançar.");const n=new Map;return[...c].sort((e,a)=>(e.data||"").localeCompare(a.data||"")).forEach(e=>{n.has(e.data)||n.set(e.data,[]),n.get(e.data).push(e)}),[...n.entries()].map(([e,a])=>`
      <section>
        <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide px-1 mb-1.5">${s.dayLabel(e)}</h3>
        <ul class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">${a.map(t=>`
          <li class="lanc-item flex items-center gap-3 px-3 sm:px-4 py-3" data-edit-compra="${t.id}" role="button" tabindex="0" aria-label="Editar ${m(t.descricao)}">
            ${Fin.ui.catIcon(t.categoriaIcone,t.categoria,"despesa")}
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate">${m(t.descricao||t.categoria)}</div>
              <div class="text-xs text-slate-500 truncate">${m(t.categoria)}</div>
            </div>
            <div class="text-right shrink-0">
              <div class="text-sm font-semibold tabular-nums ${t.valor<0?"text-emerald-700":""}">${s.brl(t.valor)}</div>
              ${t.parcela?`<div class="text-[11px] text-slate-500">parcela ${t.parcela.atual}/${t.parcela.total}</div>`:""}
            </div>
          </li>`).join("")}
        </ul>
      </section>`).join("")}function L(c,{signal:n}){const e=o.cartoes();if(!e.length)c.innerHTML=Fin.ui.emptyState("💳","Nenhum cartão cadastrado","Cadastre seus cartões para acompanhar faturas, parcelas e limite.",'<button data-act="novo-cartao" class="btn btn-primary">＋ Cadastrar cartão</button>');else{if(!e.some(d=>d.nome===Fin.state.cartao)){const d=e.map(h=>[h.nome,o.soma(o.comprasDaFatura(h.nome,Fin.state.mes))]);Fin.state.cartao=d.sort((h,D)=>D[1]-h[1])[0][0]}const a=e.find(d=>d.nome===Fin.state.cartao),t=Fin.state.mes,r=o.comprasDaFatura(a.nome,t),i=o.soma(r),l=o.vencimentoFatura(a,t),p=t>=s.currentYM(),b=o.faturaPorCategoria(a.nome,t),v=r.filter(d=>d.parcela&&d.parcela.total>1).length,y=o.pagamentoDaFatura(a,t),$=y?o.statusEfetivo(y):null,k=i?$==="pago"?'<span class="rounded-full bg-emerald-400/20 text-emerald-100 px-2.5 py-0.5 text-xs font-semibold">✓ Paga</span>':$==="parcial"?'<span class="rounded-full bg-amber-400/25 text-amber-100 px-2.5 py-0.5 text-xs font-semibold">Paga em parte</span>':$==="atrasado"?'<span class="rounded-full bg-rose-400/25 text-rose-100 px-2.5 py-0.5 text-xs font-semibold">! Atrasada</span>':'<span class="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">Em aberto</span>':"",x=o.soma(o.comprasDaFatura(a.nome,s.addMonths(t,-1))),f=x>0?(i-x)/x:null,M=f==null||Math.abs(f)<.05?x>0?`Parecida com a fatura de ${s.monthShort(s.addMonths(t,-1))}`:"":`${Math.round(Math.abs(f)*100)}% ${f>0?"maior":"menor"} que a fatura de ${s.monthShort(s.addMonths(t,-1))}`,g=a.limite?o.limiteUsado(a.nome):0,u=a.limite?Math.min(100,g/a.limite*100):0,A=u>=90?"#fb7185":u>=70?"#fbbf24":"#c6a45c",F=b.length?b[0]:null,E=F&&i>0?`Maior gasto: ${m(F.categoria)} (${Math.round(F.total/i*100)}%)`:"";c.innerHTML=`
        <div class="space-y-4">
          ${P(e,a.nome)}
          ${Fin.ui.monthNav(t)}

          <section class="hero-topo text-white rounded-3xl shadow-sm p-4 sm:p-5 space-y-3 min-w-0">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="hero-rotulo text-[12px] font-semibold uppercase tracking-wider text-white/75 truncate">Fatura de ${s.monthShort(t)} · ${m(a.nome)}</div>
                <div class="text-[2.4rem] leading-tight font-semibold tracking-tight tabular-nums mt-0.5">${s.brl(i)}</div>
              </div>
              <button data-act="config" class="icon-btn shrink-0 !text-white hover:!bg-white/10" aria-label="Configurar cartão" title="Configurar cartão">${Fin.icone("engrenagem","w-5 h-5")}</button>
            </div>
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-white/85">
              ${k}
              <span>${l?`Vence ${s.date(l)}`:"Vencimento não configurado"}${a.diaFechamento?` · fecha dia ${a.diaFechamento}`:""}</span>
            </div>
            <p class="text-[13px] text-white/75">${r.length} ${r.length===1?"compra":"compras"}${v?` (${v} parcelada${v>1?"s":""})`:""}${M?` · ${M}`:""}${p?"":" · fatura passada"}</p>
            ${a.limite?`
              <div class="pt-1">
                <div class="flex justify-between text-[12px] text-white/75 mb-1"><span>Limite usado${u>=90?' · <b class="text-rose-200">quase esgotado</b>':u>=70?' · <b class="text-amber-200">atenção</b>':""}</span><span class="tabular-nums">${s.brl(g)} de ${s.brl(a.limite)}</span></div>
                <div class="h-2 rounded-full bg-white/15 overflow-hidden" role="meter" aria-valuemin="0" aria-valuemax="${a.limite}" aria-valuenow="${g}" aria-label="Limite usado"><div class="h-full rounded-full" style="width:${u}%;background:${A}"></div></div>
                <div class="text-[12px] text-white/70 mt-1">Disponível <b class="text-white tabular-nums">${s.brl(Math.max(0,a.limite-g))}</b> · inclui parcelas futuras</div>
              </div>`:""}
          </section>

          ${!a.diaFechamento||!a.diaVencimento?'<p class="text-sm bg-amber-50 rounded-2xl px-4 py-3"><span aria-hidden="true">!</span> Configure os dias de fechamento e vencimento para o app calcular as faturas. <button data-act="config" class="text-prim-700 font-semibold hover:underline">Configurar</button></p>':""}
          ${w(a,t,i)?`<div class="bg-white rounded-2xl shadow-sm p-3 space-y-2">${w(a,t,i)}</div>`:""}
          ${C(a)}

          <div class="grid grid-cols-2 gap-2">
            <button data-act="nova-compra" class="btn btn-primary min-h-[48px]">${Fin.icone("mais","w-5 h-5")} Nova compra</button>
            <a href="#/importar-fatura" class="btn btn-ghost min-h-[48px] bg-white shadow-sm">${Fin.icone("upload","w-5 h-5")} Importar fatura</a>
          </div>

          ${b.length?Fin.ui.dobra({grupo:"cartoes",id:"cats",icone:"pizza",cor:"orange",titulo:"Gastos por categoria",resumo:E,corpo:()=>Fin.charts.hbars(b.map(d=>({label:d.categoria,icone:d.icone,total:d.total})),{total:Math.max(i,.01)})}):""}

          ${r.length?`<h2 class="text-[15px] font-semibold text-slate-800 px-1 pt-1">Compras da fatura <span class="font-normal text-slate-500">(${r.length})</span></h2>`:""}
          <div class="space-y-4">${j(r)}</div>
        </div>`}c.addEventListener("click",a=>{const t=a.target.closest("[data-cartao]");if(t){Fin.state.cartao=t.dataset.cartao,Fin.router.render();return}const r=a.target.closest("[data-act]")?.dataset.act;if(!r)return;const i=o.cartao(Fin.state.cartao);if(r==="novo-cartao"&&Fin.forms.cartao.open(),r==="config"&&i&&Fin.forms.cartao.open(i.id),r==="nova-compra"&&Fin.forms.compra.open({cartao:Fin.state.cartao}),r==="sync"&&i){const l=o.sincronizarPagamento(i,Fin.state.mes);Fin.ui.toast(`Pagamento da fatura: ${s.brl(l.valorPrevisto)}.`),Fin.router.refresh()}},{signal:n})}return{title:"Cartões",render:L}})();
