/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.cartoes=(()=>{const e=Fin.fmt,p=e.esc,o=Fin.finance;function j(d,i){return`
      <div class="chips flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0" role="tablist" aria-label="Cartões">
        ${d.map(s=>`
          <button role="tab" aria-selected="${s.nome===i}" data-cartao="${p(s.nome)}"
            class="chip ${s.nome===i?"is-active":""}"><span aria-hidden="true">💳</span>${p(s.nome)}</button>`).join("")}
        <button data-act="novo-cartao" class="chip" aria-label="Adicionar cartão">＋ Cartão</button>
      </div>`}function y(d,i,s){const a=o.pagamentoDaFatura(d,i);if(!a)return s?`
        <div class="flex flex-wrap items-center gap-3 bg-amber-50 rounded-xl px-3 py-2.5 text-sm">
          <span class="flex-1 min-w-[12rem]"><span aria-hidden="true">!</span> Nenhum lançamento de pagamento desta fatura.</span>
          <button data-act="sync" class="btn btn-ghost !py-1.5 !bg-white">Lançar pagamento</button>
        </div>`:"";const t=o.valor(a),r=Math.round((s-(a.valorPrevisto??t))*100)/100,n=o.statusEfetivo(a),l=["aberto","atrasado"].includes(n)&&!a.pagamentos?.length,m=a.pagamentos?.length||0,h=a.vencimento?e.date(a.vencimento):"";return`
      <div class="bg-slate-50 rounded-xl px-3 py-2.5 text-sm space-y-2">
        <div class="flex items-center gap-3" data-edit="${a.id}" role="button" tabindex="0" aria-label="Abrir lançamento de pagamento">
          <span class="flex-1 min-w-0">${n==="pago"||n==="parcial"?"Pagamento":"A pagar"}: ${o.faturaParcial(a)?`pagou <b class="tabular-nums text-rose-700">${e.brl(a.valorPago)}</b> de <b class="tabular-nums">${e.brl(a.valorPrevisto)}</b>`:`<b class="tabular-nums">${e.brl(t)}</b>`}
            <span class="text-slate-500 truncate">· ${m>1?`em ${m} pagamentos`:n==="pago"||n==="parcial"?p(a.descricao):`vence ${h}, em Lançamentos`}</span></span>
          ${Fin.ui.statusPill(a)}
        </div>
        ${["aberto","atrasado","parcial"].includes(n)?`
          <button type="button" data-edit="${a.id}" class="btn btn-ghost !py-1.5 !bg-white w-full">${n==="parcial"?"Registrar outro pagamento":"Registrar pagamento"}</button>`:""}
        ${Math.abs(r)>=.01?`
          <div class="flex flex-wrap items-center gap-2 text-xs text-slate-600 border-t border-slate-200 pt-2">
            <span class="flex-1 min-w-[12rem]">Compras somam ${e.brl(s)} (${r>0?"+":"−"}${e.brl(Math.abs(r))} em relação ao lançamento).</span>
            ${l?`<button data-act="sync" class="text-prim-700 font-semibold hover:underline">Atualizar para ${e.brl(s)}</button>`:""}
          </div>`:""}
      </div>
      ${o.faturaParcial(a)?Fin.ui.alertaRotativo(o.faturaParcial(a)):""}`}function L(d){const i=o.rotativo(d.nome,e.currentYM()),s=Math.round((i.encargos+i.pagoAMais)*100)/100,a=i.parciais.length;if(!a&&!s)return o.todos().filter(m=>o.isPagamentoFatura(m)&&o.statusEfetivo(m)==="pago"&&o.pagamentoDaFatura(d,o.competencia(m))?.id===m.id).length>=3?'<p class="text-xs text-emerald-800 bg-emerald-50 rounded-xl px-3 py-2"><span aria-hidden="true">✓</span> Fatura paga inteira nos últimos 12 meses — sem juros de rotativo.</p>':"";const t=a>=3,r=i.parciais.map(l=>`
      <li class="flex items-center gap-2 py-1.5" data-edit="${l.l.id}" role="button" tabindex="0">
        <span class="w-16 shrink-0 text-slate-500">${e.monthShort(l.competencia)}</span>
        <span class="flex-1 min-w-0 truncate">pagou ${e.brl(l.pago)} de ${e.brl(l.devido)}</span>
        <span class="shrink-0 font-medium text-rose-700 tabular-nums">−${e.brl(l.falta)}</span>
      </li>`).join(""),n=i.itensEncargo.slice().sort((l,m)=>m.fatura.localeCompare(l.fatura)).map(l=>`
      <li class="flex items-center gap-2 py-1.5">
        <span class="w-16 shrink-0 text-slate-500">${e.monthShort(l.fatura)}</span>
        <span class="flex-1 min-w-0 truncate">${p(l.descricao)}</span>
        <span class="shrink-0 font-medium tabular-nums">${e.brl(l.valor)}</span>
      </li>`).join("");return`
      <details class="rounded-xl ${t?"bg-rose-50 text-rose-900":"bg-amber-50 text-amber-900"} px-3 py-2.5 text-sm">
        <summary class="flex items-start gap-2">
          <span aria-hidden="true">${t?"!":"◐"}</span>
          <span class="flex-1">
            <b>Rotativo nos últimos 12 meses:</b> ${a} fatura${a===1?"":"s"} paga${a===1?"":"s"} a menos${a?` (${e.brl(i.totalFalta)} ficaram para trás)`:""}${s?` · <b>${e.brl(s)}</b> em juros, IOF e multa`:""}.
            ${t?'<span class="block text-xs mt-0.5">Está virando hábito: esses juros são o gasto mais caro do orçamento.</span>':""}
          </span>
          <span class="chev text-xs mt-0.5" aria-hidden="true">▸</span>
        </summary>
        <div class="mt-2 space-y-2 text-xs">
          ${r?`<div><div class="font-semibold mb-0.5">Faturas pagas a menos</div><ul class="divide-y divide-black/5">${r}</ul></div>`:""}
          ${n?`<div><div class="font-semibold mb-0.5">Juros, IOF e multa cobrados nas faturas</div><ul class="divide-y divide-black/5">${n}</ul></div>`:""}
          ${i.pagoAMais?`<p>Pago acima do lançado (juros/multa por atraso): <b>${e.brl(i.pagoAMais)}</b>.</p>`:""}
          <p class="opacity-80">Juros e encargos são lidos das compras da fatura com “juros”, “encargos”, “IOF”, “multa”, “mora” ou “rotativo” na descrição.</p>
        </div>
      </details>`}function k(d){if(!d.length)return Fin.ui.emptyState("🧾","Nenhuma compra nesta fatura","Use “Nova compra” para lançar.");const i=new Map;return[...d].sort((s,a)=>(s.data||"").localeCompare(a.data||"")).forEach(s=>{i.has(s.data)||i.set(s.data,[]),i.get(s.data).push(s)}),[...i.entries()].map(([s,a])=>`
      <section>
        <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide px-1 mb-1.5">${e.dayLabel(s)}</h3>
        <ul class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">${a.map(t=>`
          <li class="lanc-item flex items-center gap-3 px-3 sm:px-4 py-3" data-edit-compra="${t.id}" role="button" tabindex="0" aria-label="Editar ${p(t.descricao)}">
            ${Fin.ui.catIcon(t.categoriaIcone,t.categoria,"despesa")}
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate">${p(t.descricao||t.categoria)}</div>
              <div class="text-xs text-slate-500 truncate">${p(t.categoria)}${t.via?` · <span class="font-semibold ${t.via==="virtual"?"text-sky-700":"text-amber-700"}" title="${p(t.portador||"")}">${t.via==="virtual"?"cartão virtual":"cartão adicional"}</span>`:""}</div>
            </div>
            <div class="text-right shrink-0">
              <div class="text-sm font-semibold tabular-nums ${t.valor<0?"text-emerald-700":""}">${e.brl(t.valor)}</div>
              ${t.parcela?`<div class="text-[11px] text-slate-500">parcela ${t.parcela.atual}/${t.parcela.total}</div>`:""}
            </div>
          </li>`).join("")}
        </ul>
      </section>`).join("")}function A(d,{signal:i}){const s=o.cartoes();if(!s.length)d.innerHTML=Fin.ui.emptyState("💳","Nenhum cartão cadastrado","Cadastre seus cartões para acompanhar faturas, parcelas e limite.",'<button data-act="novo-cartao" class="btn btn-primary">＋ Cadastrar cartão</button>');else{if(!s.some(c=>c.nome===Fin.state.cartao)){const c=s.map(v=>[v.nome,o.soma(o.comprasDaFatura(v.nome,Fin.state.mes))]);Fin.state.cartao=c.sort((v,z)=>z[1]-v[1])[0][0]}const a=s.find(c=>c.nome===Fin.state.cartao),t=Fin.state.mes,r=o.comprasDaFatura(a.nome,t),n=o.soma(r),l=o.vencimentoFatura(a,t),{diaFechamento:m}=o.diasDaFatura(a,t),h=t>=e.currentYM(),b=o.faturaPorCategoria(a.nome,t),$=r.filter(c=>c.parcela&&c.parcela.total>1).length,M=Fin.storage.list("cartaoCompras").filter(c=>c.cartao===a.nome).length,C=o.pagamentoDaFatura(a,t),F=C?o.statusEfetivo(C):null,E=n?F==="pago"?'<span class="rounded-full bg-emerald-400/20 text-emerald-100 px-2.5 py-0.5 text-xs font-semibold">✓ Paga</span>':F==="parcial"?'<span class="rounded-full bg-amber-400/25 text-amber-100 px-2.5 py-0.5 text-xs font-semibold">Paga em parte</span>':F==="atrasado"?'<span class="rounded-full bg-rose-400/25 text-rose-100 px-2.5 py-0.5 text-xs font-semibold">! Atrasada</span>':'<span class="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">Em aberto</span>':"",g=o.soma(o.comprasDaFatura(a.nome,e.addMonths(t,-1))),x=g>0?(n-g)/g:null,P=x==null||Math.abs(x)<.05?g>0?`Parecida com a fatura de ${e.monthShort(e.addMonths(t,-1))}`:"":`${Math.round(Math.abs(x)*100)}% ${x>0?"maior":"menor"} que a fatura de ${e.monthShort(e.addMonths(t,-1))}`,f=a.limite?o.limiteUsado(a.nome):0,u=a.limite?Math.min(100,f/a.limite*100):0,D=u>=90?"#fb7185":u>=70?"#fbbf24":"#c6a45c",w=b.length?b[0]:null,S=w&&n>0?`Maior gasto: ${p(w.categoria)} (${Math.round(w.total/n*100)}%)`:"";d.innerHTML=`
        <div class="space-y-4">
          ${j(s,a.nome)}
          ${Fin.ui.monthNav(t)}

          <section class="hero-topo text-white rounded-3xl shadow-sm p-4 sm:p-5 space-y-3 min-w-0">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="hero-rotulo text-[12px] font-semibold uppercase tracking-wider text-white/75 truncate">Fatura de ${e.monthShort(t)} · ${p(a.nome)}</div>
                <div class="text-[2.4rem] leading-tight font-semibold tracking-tight tabular-nums mt-0.5">${e.brl(n)}</div>
              </div>
              <button data-act="config" class="icon-btn shrink-0 !text-white hover:!bg-white/10" aria-label="Configurar cartão" title="Configurar cartão">${Fin.icone("engrenagem","w-5 h-5")}</button>
            </div>
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-white/85">
              ${E}
              <span>${l?`Vence ${e.date(l)}`:"Vencimento não configurado"}${m?` · fecha dia ${m}`:""}</span>
            </div>
            <p class="text-[13px] text-white/75">${r.length} ${r.length===1?"compra":"compras"}${$?` (${$} parcelada${$>1?"s":""})`:""}${P?` · ${P}`:""}${h?"":" · fatura passada"}</p>
            ${a.limite?`
              <div class="pt-1">
                <div class="flex justify-between text-[12px] text-white/75 mb-1"><span>Limite usado${u>=90?' · <b class="text-rose-200">quase esgotado</b>':u>=70?' · <b class="text-amber-200">atenção</b>':""}</span><span class="tabular-nums">${e.brl(f)} de ${e.brl(a.limite)}</span></div>
                <div class="h-2 rounded-full bg-white/15 overflow-hidden" role="meter" aria-valuemin="0" aria-valuemax="${a.limite}" aria-valuenow="${f}" aria-label="Limite usado"><div class="h-full rounded-full" style="width:${u}%;background:${D}"></div></div>
                <div class="text-[12px] text-white/70 mt-1">Disponível <b class="text-white tabular-nums">${e.brl(Math.max(0,a.limite-f))}</b> · inclui parcelas futuras</div>
              </div>`:""}
          </section>

          ${!a.diaFechamento||!a.diaVencimento?'<p class="text-sm bg-amber-50 rounded-2xl px-4 py-3"><span aria-hidden="true">!</span> Configure os dias de fechamento e vencimento para o app calcular as faturas. <button data-act="config" class="text-prim-700 font-semibold hover:underline">Configurar</button></p>':""}
          ${y(a,t,n)?`<div class="bg-white rounded-2xl shadow-sm p-3 space-y-2">${y(a,t,n)}</div>`:""}
          ${L(a)}

          <div class="grid grid-cols-2 gap-2">
            <button data-act="nova-compra" class="btn btn-primary min-h-[48px]">${Fin.icone("mais","w-5 h-5")} Nova compra</button>
            <a href="#/importar-fatura" class="btn btn-ghost min-h-[48px] bg-white shadow-sm">${Fin.icone("upload","w-5 h-5")} Importar fatura</a>
          </div>

          ${b.length?Fin.ui.dobra({grupo:"cartoes",id:"cats",icone:"pizza",cor:"orange",titulo:"Gastos por categoria",resumo:S,corpo:()=>Fin.charts.hbars(b.map(c=>({label:c.categoria,icone:c.icone,total:c.total})),{total:Math.max(n,.01)})}):""}

          ${r.length||M?`
            <div class="flex items-center justify-between gap-3 px-1 pt-1">
              <h2 class="text-[15px] font-semibold text-slate-800">${r.length?`Compras da fatura <span class="font-normal text-slate-500">(${r.length})</span>`:"Compras do cartão"}</h2>
              ${M?'<button data-act="apagar-compras" class="text-xs font-semibold text-rose-700 hover:underline">Apagar compras…</button>':""}
            </div>`:""}
          <div class="space-y-4">${k(r)}</div>
        </div>`}d.addEventListener("click",a=>{const t=a.target.closest("[data-cartao]");if(t){Fin.state.cartao=t.dataset.cartao,Fin.router.render();return}const r=a.target.closest("[data-act]")?.dataset.act;if(!r)return;const n=o.cartao(Fin.state.cartao);if(r==="novo-cartao"&&Fin.forms.cartao.open(),r==="config"&&n&&Fin.forms.cartao.open(n.id),r==="nova-compra"&&Fin.forms.compra.open({cartao:Fin.state.cartao}),r==="apagar-compras"&&n&&Fin.forms.cartao.apagarCompras({cartao:n.nome,ym:Fin.state.mes}),r==="sync"&&n){const l=o.sincronizarPagamento(n,Fin.state.mes);Fin.ui.toast(`Pagamento da fatura: ${e.brl(l.valorPrevisto)}.`),Fin.router.refresh()}},{signal:i})}return{title:"Cartões",render:A}})();
