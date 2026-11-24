/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.cartoes=(()=>{const s=Fin.fmt,m=s.esc,o=Fin.finance;function P(d,r){return`
      <div class="chips flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0" role="tablist" aria-label="Cartões">
        ${d.map(e=>`
          <button role="tab" aria-selected="${e.nome===r}" data-cartao="${m(e.nome)}"
            class="chip ${e.nome===r?"is-active":""}"><span aria-hidden="true">💳</span>${m(e.nome)}</button>`).join("")}
        <button data-act="novo-cartao" class="chip" aria-label="Adicionar cartão">＋ Cartão</button>
      </div>`}function w(d,r,e){const a=o.pagamentoDaFatura(d,r);if(!a)return e?`
        <div class="flex flex-wrap items-center gap-3 bg-amber-50 rounded-xl px-3 py-2.5 text-sm">
          <span class="flex-1 min-w-[12rem]"><span aria-hidden="true">!</span> Nenhum lançamento de pagamento desta fatura.</span>
          <button data-act="sync" class="btn btn-ghost !py-1.5 !bg-white">Lançar pagamento</button>
        </div>`:"";const t=o.valor(a),n=Math.round((e-(a.valorPrevisto??t))*100)/100,i=["aberto","atrasado"].includes(o.statusEfetivo(a));return`
      <div class="bg-slate-50 rounded-xl px-3 py-2.5 text-sm space-y-2">
        <div class="flex items-center gap-3" data-edit="${a.id}" role="button" tabindex="0" aria-label="Abrir lançamento de pagamento">
          <span class="flex-1 min-w-0">Pagamento: ${o.faturaParcial(a)?`pagou <b class="tabular-nums text-rose-700">${s.brl(a.valorPago)}</b> de <b class="tabular-nums">${s.brl(a.valorPrevisto)}</b>`:`<b class="tabular-nums">${s.brl(t)}</b>`}
            <span class="text-slate-500 truncate">· ${m(a.descricao)}</span></span>
          ${Fin.ui.statusPill(a)}
        </div>
        ${Math.abs(n)>=.01?`
          <div class="flex flex-wrap items-center gap-2 text-xs text-slate-600 border-t border-slate-200 pt-2">
            <span class="flex-1 min-w-[12rem]">Compras somam ${s.brl(e)} (${n>0?"+":"−"}${s.brl(Math.abs(n))} em relação ao lançamento).</span>
            ${i?`<button data-act="sync" class="text-prim-700 font-semibold hover:underline">Atualizar para ${s.brl(e)}</button>`:""}
          </div>`:""}
      </div>
      ${o.faturaParcial(a)?Fin.ui.alertaRotativo(o.faturaParcial(a)):""}`}function j(d){const r=o.rotativo(d.nome,s.currentYM()),e=Math.round((r.encargos+r.pagoAMais)*100)/100,a=r.parciais.length;if(!a&&!e)return o.todos().filter(p=>o.isPagamentoFatura(p)&&o.statusEfetivo(p)==="pago"&&o.pagamentoDaFatura(d,o.competencia(p))?.id===p.id).length>=3?'<p class="text-xs text-emerald-800 bg-emerald-50 rounded-xl px-3 py-2"><span aria-hidden="true">✓</span> Fatura paga inteira nos últimos 12 meses — sem juros de rotativo.</p>':"";const t=a>=3,n=r.parciais.map(l=>`
      <li class="flex items-center gap-2 py-1.5" data-edit="${l.l.id}" role="button" tabindex="0">
        <span class="w-16 shrink-0 text-slate-500">${s.monthShort(l.competencia)}</span>
        <span class="flex-1 min-w-0 truncate">pagou ${s.brl(l.pago)} de ${s.brl(l.devido)}</span>
        <span class="shrink-0 font-medium text-rose-700 tabular-nums">−${s.brl(l.falta)}</span>
      </li>`).join(""),i=r.itensEncargo.slice().sort((l,p)=>p.fatura.localeCompare(l.fatura)).map(l=>`
      <li class="flex items-center gap-2 py-1.5">
        <span class="w-16 shrink-0 text-slate-500">${s.monthShort(l.fatura)}</span>
        <span class="flex-1 min-w-0 truncate">${m(l.descricao)}</span>
        <span class="shrink-0 font-medium tabular-nums">${s.brl(l.valor)}</span>
      </li>`).join("");return`
      <details class="rounded-xl ${t?"bg-rose-50 text-rose-900":"bg-amber-50 text-amber-900"} px-3 py-2.5 text-sm">
        <summary class="flex items-start gap-2">
          <span aria-hidden="true">${t?"!":"◐"}</span>
          <span class="flex-1">
            <b>Rotativo nos últimos 12 meses:</b> ${a} fatura${a===1?"":"s"} paga${a===1?"":"s"} a menos${a?` (${s.brl(r.totalFalta)} ficaram para trás)`:""}${e?` · <b>${s.brl(e)}</b> em juros, IOF e multa`:""}.
            ${t?'<span class="block text-xs mt-0.5">Está virando hábito: esses juros são o gasto mais caro do orçamento.</span>':""}
          </span>
          <span class="chev text-xs mt-0.5" aria-hidden="true">▸</span>
        </summary>
        <div class="mt-2 space-y-2 text-xs">
          ${n?`<div><div class="font-semibold mb-0.5">Faturas pagas a menos</div><ul class="divide-y divide-black/5">${n}</ul></div>`:""}
          ${i?`<div><div class="font-semibold mb-0.5">Juros, IOF e multa cobrados nas faturas</div><ul class="divide-y divide-black/5">${i}</ul></div>`:""}
          ${r.pagoAMais?`<p>Pago acima do lançado (juros/multa por atraso): <b>${s.brl(r.pagoAMais)}</b>.</p>`:""}
          <p class="opacity-80">Juros e encargos são lidos das compras da fatura com “juros”, “encargos”, “IOF”, “multa”, “mora” ou “rotativo” na descrição.</p>
        </div>
      </details>`}function L(d){if(!d.length)return Fin.ui.emptyState("🧾","Nenhuma compra nesta fatura","Use “Nova compra” para lançar.");const r=new Map;return[...d].sort((e,a)=>(e.data||"").localeCompare(a.data||"")).forEach(e=>{r.has(e.data)||r.set(e.data,[]),r.get(e.data).push(e)}),[...r.entries()].map(([e,a])=>`
      <section>
        <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide px-1 mb-1.5">${s.dayLabel(e)}</h3>
        <ul class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">${a.map(t=>`
          <li class="lanc-item flex items-center gap-3 px-3 sm:px-4 py-3" data-edit-compra="${t.id}" role="button" tabindex="0" aria-label="Editar ${m(t.descricao)}">
            ${Fin.ui.catIcon(t.categoriaIcone,t.categoria,"despesa")}
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate">${m(t.descricao||t.categoria)}</div>
              <div class="text-xs text-slate-500 truncate">${m(t.categoria)}${t.via?` · <span class="font-semibold ${t.via==="virtual"?"text-sky-700":"text-amber-700"}" title="${m(t.portador||"")}">${t.via==="virtual"?"cartão virtual":"cartão adicional"}</span>`:""}</div>
            </div>
            <div class="text-right shrink-0">
              <div class="text-sm font-semibold tabular-nums ${t.valor<0?"text-emerald-700":""}">${s.brl(t.valor)}</div>
              ${t.parcela?`<div class="text-[11px] text-slate-500">parcela ${t.parcela.atual}/${t.parcela.total}</div>`:""}
            </div>
          </li>`).join("")}
        </ul>
      </section>`).join("")}function k(d,{signal:r}){const e=o.cartoes();if(!e.length)d.innerHTML=Fin.ui.emptyState("💳","Nenhum cartão cadastrado","Cadastre seus cartões para acompanhar faturas, parcelas e limite.",'<button data-act="novo-cartao" class="btn btn-primary">＋ Cadastrar cartão</button>');else{if(!e.some(c=>c.nome===Fin.state.cartao)){const c=e.map(v=>[v.nome,o.soma(o.comprasDaFatura(v.nome,Fin.state.mes))]);Fin.state.cartao=c.sort((v,S)=>S[1]-v[1])[0][0]}const a=e.find(c=>c.nome===Fin.state.cartao),t=Fin.state.mes,n=o.comprasDaFatura(a.nome,t),i=o.soma(n),l=o.vencimentoFatura(a,t),p=t>=s.currentYM(),b=o.faturaPorCategoria(a.nome,t),h=n.filter(c=>c.parcela&&c.parcela.total>1).length,y=Fin.storage.list("cartaoCompras").filter(c=>c.cartao===a.nome).length,M=o.pagamentoDaFatura(a,t),$=M?o.statusEfetivo(M):null,A=i?$==="pago"?'<span class="rounded-full bg-emerald-400/20 text-emerald-100 px-2.5 py-0.5 text-xs font-semibold">✓ Paga</span>':$==="parcial"?'<span class="rounded-full bg-amber-400/25 text-amber-100 px-2.5 py-0.5 text-xs font-semibold">Paga em parte</span>':$==="atrasado"?'<span class="rounded-full bg-rose-400/25 text-rose-100 px-2.5 py-0.5 text-xs font-semibold">! Atrasada</span>':'<span class="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">Em aberto</span>':"",x=o.soma(o.comprasDaFatura(a.nome,s.addMonths(t,-1))),f=x>0?(i-x)/x:null,C=f==null||Math.abs(f)<.05?x>0?`Parecida com a fatura de ${s.monthShort(s.addMonths(t,-1))}`:"":`${Math.round(Math.abs(f)*100)}% ${f>0?"maior":"menor"} que a fatura de ${s.monthShort(s.addMonths(t,-1))}`,g=a.limite?o.limiteUsado(a.nome):0,u=a.limite?Math.min(100,g/a.limite*100):0,E=u>=90?"#fb7185":u>=70?"#fbbf24":"#c6a45c",F=b.length?b[0]:null,D=F&&i>0?`Maior gasto: ${m(F.categoria)} (${Math.round(F.total/i*100)}%)`:"";d.innerHTML=`
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
              ${A}
              <span>${l?`Vence ${s.date(l)}`:"Vencimento não configurado"}${a.diaFechamento?` · fecha dia ${a.diaFechamento}`:""}</span>
            </div>
            <p class="text-[13px] text-white/75">${n.length} ${n.length===1?"compra":"compras"}${h?` (${h} parcelada${h>1?"s":""})`:""}${C?` · ${C}`:""}${p?"":" · fatura passada"}</p>
            ${a.limite?`
              <div class="pt-1">
                <div class="flex justify-between text-[12px] text-white/75 mb-1"><span>Limite usado${u>=90?' · <b class="text-rose-200">quase esgotado</b>':u>=70?' · <b class="text-amber-200">atenção</b>':""}</span><span class="tabular-nums">${s.brl(g)} de ${s.brl(a.limite)}</span></div>
                <div class="h-2 rounded-full bg-white/15 overflow-hidden" role="meter" aria-valuemin="0" aria-valuemax="${a.limite}" aria-valuenow="${g}" aria-label="Limite usado"><div class="h-full rounded-full" style="width:${u}%;background:${E}"></div></div>
                <div class="text-[12px] text-white/70 mt-1">Disponível <b class="text-white tabular-nums">${s.brl(Math.max(0,a.limite-g))}</b> · inclui parcelas futuras</div>
              </div>`:""}
          </section>

          ${!a.diaFechamento||!a.diaVencimento?'<p class="text-sm bg-amber-50 rounded-2xl px-4 py-3"><span aria-hidden="true">!</span> Configure os dias de fechamento e vencimento para o app calcular as faturas. <button data-act="config" class="text-prim-700 font-semibold hover:underline">Configurar</button></p>':""}
          ${w(a,t,i)?`<div class="bg-white rounded-2xl shadow-sm p-3 space-y-2">${w(a,t,i)}</div>`:""}
          ${j(a)}

          <div class="grid grid-cols-2 gap-2">
            <button data-act="nova-compra" class="btn btn-primary min-h-[48px]">${Fin.icone("mais","w-5 h-5")} Nova compra</button>
            <a href="#/importar-fatura" class="btn btn-ghost min-h-[48px] bg-white shadow-sm">${Fin.icone("upload","w-5 h-5")} Importar fatura</a>
          </div>

          ${b.length?Fin.ui.dobra({grupo:"cartoes",id:"cats",icone:"pizza",cor:"orange",titulo:"Gastos por categoria",resumo:D,corpo:()=>Fin.charts.hbars(b.map(c=>({label:c.categoria,icone:c.icone,total:c.total})),{total:Math.max(i,.01)})}):""}

          ${n.length||y?`
            <div class="flex items-center justify-between gap-3 px-1 pt-1">
              <h2 class="text-[15px] font-semibold text-slate-800">${n.length?`Compras da fatura <span class="font-normal text-slate-500">(${n.length})</span>`:"Compras do cartão"}</h2>
              ${y?'<button data-act="apagar-compras" class="text-xs font-semibold text-rose-700 hover:underline">Apagar compras…</button>':""}
            </div>`:""}
          <div class="space-y-4">${L(n)}</div>
        </div>`}d.addEventListener("click",a=>{const t=a.target.closest("[data-cartao]");if(t){Fin.state.cartao=t.dataset.cartao,Fin.router.render();return}const n=a.target.closest("[data-act]")?.dataset.act;if(!n)return;const i=o.cartao(Fin.state.cartao);if(n==="novo-cartao"&&Fin.forms.cartao.open(),n==="config"&&i&&Fin.forms.cartao.open(i.id),n==="nova-compra"&&Fin.forms.compra.open({cartao:Fin.state.cartao}),n==="apagar-compras"&&i&&Fin.forms.cartao.apagarCompras({cartao:i.nome,ym:Fin.state.mes}),n==="sync"&&i){const l=o.sincronizarPagamento(i,Fin.state.mes);Fin.ui.toast(`Pagamento da fatura: ${s.brl(l.valorPrevisto)}.`),Fin.router.refresh()}},{signal:r})}return{title:"Cartões",render:k}})();
