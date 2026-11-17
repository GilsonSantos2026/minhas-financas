/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.cartoes=(()=>{const e=Fin.fmt,m=e.esc,n=Fin.finance;function f(i,o){return`
      <div class="chips flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0" role="tablist" aria-label="Cartões">
        ${i.map(s=>`
          <button role="tab" aria-selected="${s.nome===o}" data-cartao="${m(s.nome)}"
            class="chip ${s.nome===o?"is-active":""}"><span aria-hidden="true">💳</span>${m(s.nome)}</button>`).join("")}
        <button data-act="novo-cartao" class="chip" aria-label="Adicionar cartão">＋ Cartão</button>
      </div>`}function x(i,o,s){const a=n.pagamentoDaFatura(i,o);if(!a)return s?`
        <div class="flex flex-wrap items-center gap-3 bg-amber-50 rounded-xl px-3 py-2.5 text-sm">
          <span class="flex-1 min-w-[12rem]"><span aria-hidden="true">!</span> Nenhum lançamento de pagamento desta fatura.</span>
          <button data-act="sync" class="btn btn-ghost !py-1.5 !bg-white">Lançar pagamento</button>
        </div>`:"";const t=n.valor(a),r=Math.round((s-(a.valorPrevisto??t))*100)/100,c=["aberto","atrasado"].includes(n.statusEfetivo(a));return`
      <div class="bg-slate-50 rounded-xl px-3 py-2.5 text-sm space-y-2">
        <div class="flex items-center gap-3" data-edit="${a.id}" role="button" tabindex="0" aria-label="Abrir lançamento de pagamento">
          <span class="flex-1 min-w-0">Pagamento: ${n.faturaParcial(a)?`pagou <b class="tabular-nums text-rose-700">${e.brl(a.valorPago)}</b> de <b class="tabular-nums">${e.brl(a.valorPrevisto)}</b>`:`<b class="tabular-nums">${e.brl(t)}</b>`}
            <span class="text-slate-500 truncate">· ${m(a.descricao)}</span></span>
          ${Fin.ui.statusPill(a)}
        </div>
        ${Math.abs(r)>=.01?`
          <div class="flex flex-wrap items-center gap-2 text-xs text-slate-600 border-t border-slate-200 pt-2">
            <span class="flex-1 min-w-[12rem]">Compras somam ${e.brl(s)} (${r>0?"+":"−"}${e.brl(Math.abs(r))} em relação ao lançamento).</span>
            ${c?`<button data-act="sync" class="text-prim-700 font-semibold hover:underline">Atualizar para ${e.brl(s)}</button>`:""}
          </div>`:""}
      </div>
      ${n.faturaParcial(a)?Fin.ui.alertaRotativo(n.faturaParcial(a)):""}`}function g(i){const o=n.rotativo(i.nome,e.currentYM()),s=Math.round((o.encargos+o.pagoAMais)*100)/100,a=o.parciais.length;if(!a&&!s)return n.todos().filter(p=>n.isPagamentoFatura(p)&&n.statusEfetivo(p)==="pago"&&n.pagamentoDaFatura(i,n.competencia(p))?.id===p.id).length>=3?'<p class="text-xs text-emerald-800 bg-emerald-50 rounded-xl px-3 py-2"><span aria-hidden="true">✓</span> Fatura paga inteira nos últimos 12 meses — sem juros de rotativo.</p>':"";const t=a>=3,r=o.parciais.map(l=>`
      <li class="flex items-center gap-2 py-1.5" data-edit="${l.l.id}" role="button" tabindex="0">
        <span class="w-16 shrink-0 text-slate-500">${e.monthShort(l.competencia)}</span>
        <span class="flex-1 min-w-0 truncate">pagou ${e.brl(l.pago)} de ${e.brl(l.devido)}</span>
        <span class="shrink-0 font-medium text-rose-700 tabular-nums">−${e.brl(l.falta)}</span>
      </li>`).join(""),c=o.itensEncargo.slice().sort((l,p)=>p.fatura.localeCompare(l.fatura)).map(l=>`
      <li class="flex items-center gap-2 py-1.5">
        <span class="w-16 shrink-0 text-slate-500">${e.monthShort(l.fatura)}</span>
        <span class="flex-1 min-w-0 truncate">${m(l.descricao)}</span>
        <span class="shrink-0 font-medium tabular-nums">${e.brl(l.valor)}</span>
      </li>`).join("");return`
      <details class="rounded-xl ${t?"bg-rose-50 text-rose-900":"bg-amber-50 text-amber-900"} px-3 py-2.5 text-sm">
        <summary class="flex items-start gap-2">
          <span aria-hidden="true">${t?"!":"◐"}</span>
          <span class="flex-1">
            <b>Rotativo nos últimos 12 meses:</b> ${a} fatura${a===1?"":"s"} paga${a===1?"":"s"} a menos${a?` (${e.brl(o.totalFalta)} ficaram para trás)`:""}${s?` · <b>${e.brl(s)}</b> em juros, IOF e multa`:""}.
            ${t?'<span class="block text-xs mt-0.5">Está virando hábito: esses juros são o gasto mais caro do orçamento.</span>':""}
          </span>
          <span class="chev text-xs mt-0.5" aria-hidden="true">▸</span>
        </summary>
        <div class="mt-2 space-y-2 text-xs">
          ${r?`<div><div class="font-semibold mb-0.5">Faturas pagas a menos</div><ul class="divide-y divide-black/5">${r}</ul></div>`:""}
          ${c?`<div><div class="font-semibold mb-0.5">Juros, IOF e multa cobrados nas faturas</div><ul class="divide-y divide-black/5">${c}</ul></div>`:""}
          ${o.pagoAMais?`<p>Pago acima do lançado (juros/multa por atraso): <b>${e.brl(o.pagoAMais)}</b>.</p>`:""}
          <p class="opacity-80">Juros e encargos são lidos das compras da fatura com “juros”, “encargos”, “IOF”, “multa”, “mora” ou “rotativo” na descrição.</p>
        </div>
      </details>`}function $(i){if(!i.limite)return"";const o=n.limiteUsado(i.nome),s=Math.min(100,o/i.limite*100),[a,t]=s>=90?["#d03b3b","! Limite quase esgotado"]:s>=70?["#fab219","Atenção ao limite"]:["#2a78d6",""];return`
      <div>
        <div class="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Limite usado ${t?`· <b class="text-slate-700">${t}</b>`:""}</span>
          <span class="tabular-nums">${e.brl(o)} de ${e.brl(i.limite)}</span>
        </div>
        <div class="h-2 rounded-full bg-[#cde2fb] overflow-hidden" role="meter" aria-valuemin="0" aria-valuemax="${i.limite}" aria-valuenow="${o}" aria-label="Limite usado">
          <div class="h-full rounded-full" style="width:${s}%;background:${a}"></div>
        </div>
        <div class="text-xs text-slate-500 mt-1">Disponível: <b class="text-slate-700 tabular-nums">${e.brl(Math.max(0,i.limite-o))}</b> · inclui parcelas futuras</div>
      </div>`}function h(i){if(!i.length)return Fin.ui.emptyState("🧾","Nenhuma compra nesta fatura","Use “Nova compra” para lançar.");const o=new Map;return[...i].sort((s,a)=>(s.data||"").localeCompare(a.data||"")).forEach(s=>{o.has(s.data)||o.set(s.data,[]),o.get(s.data).push(s)}),[...o.entries()].map(([s,a])=>`
      <section>
        <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide px-1 mb-1.5">${e.dayLabel(s)}</h3>
        <ul class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">${a.map(t=>`
          <li class="lanc-item flex items-center gap-3 px-3 sm:px-4 py-3" data-edit-compra="${t.id}" role="button" tabindex="0" aria-label="Editar ${m(t.descricao)}">
            ${Fin.ui.catIcon(t.categoriaIcone,t.categoria,"despesa")}
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate">${m(t.descricao||t.categoria)}</div>
              <div class="text-xs text-slate-500 truncate">${m(t.categoria)}</div>
            </div>
            <div class="text-right shrink-0">
              <div class="text-sm font-semibold tabular-nums ${t.valor<0?"text-emerald-700":""}">${e.brl(t.valor)}</div>
              ${t.parcela?`<div class="text-[11px] text-slate-500">parcela ${t.parcela.atual}/${t.parcela.total}</div>`:""}
            </div>
          </li>`).join("")}
        </ul>
      </section>`).join("")}function F(i,{signal:o}){const s=n.cartoes();if(!s.length)i.innerHTML=Fin.ui.emptyState("💳","Nenhum cartão cadastrado","Cadastre seus cartões para acompanhar faturas, parcelas e limite.",'<button data-act="novo-cartao" class="btn btn-primary">＋ Cadastrar cartão</button>');else{if(!s.some(d=>d.nome===Fin.state.cartao)){const d=s.map(u=>[u.nome,n.soma(n.comprasDaFatura(u.nome,Fin.state.mes))]);Fin.state.cartao=d.sort((u,w)=>w[1]-u[1])[0][0]}const a=s.find(d=>d.nome===Fin.state.cartao),t=Fin.state.mes,r=n.comprasDaFatura(a.nome,t),c=n.soma(r),l=n.vencimentoFatura(a,t),p=t>=e.currentYM(),b=n.faturaPorCategoria(a.nome,t),v=r.filter(d=>d.parcela&&d.parcela.total>1).length;i.innerHTML=`
        <div class="space-y-4">
          ${f(s,a.nome)}
          ${Fin.ui.monthNav(t)}

          <section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5 space-y-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="text-sm text-slate-500">Fatura de ${e.monthLong(t).toLowerCase()} · ${m(a.nome)}</div>
                <div class="text-[40px] sm:text-5xl font-semibold tracking-tight mt-1">${e.brl(c)}</div>
                <div class="text-sm text-slate-500 mt-1">
                  ${l?`Vence ${e.date(l)}`:"Vencimento não configurado"}
                  ${a.diaFechamento?` · fecha dia ${a.diaFechamento}`:""}
                  · ${r.length} ${r.length===1?"compra":"compras"}${v?` (${v} parceladas)`:""}
                  ${p?"":" · fatura passada"}
                </div>
              </div>
              <button data-act="config" class="icon-btn shrink-0" aria-label="Configurar cartão" title="Configurar cartão">⚙️</button>
            </div>
            ${!a.diaFechamento||!a.diaVencimento?'<p class="text-sm bg-amber-50 rounded-xl px-3 py-2"><span aria-hidden="true">!</span> Configure os dias de fechamento e vencimento para o app calcular as faturas. <button data-act="config" class="text-prim-700 font-semibold hover:underline">Configurar</button></p>':""}
            ${x(a,t,c)}
            ${g(a)}
            ${$(a)}
            <div class="flex flex-col sm:flex-row gap-2">
              <button data-act="nova-compra" class="btn btn-primary">＋ Nova compra</button>
              <a href="#/importar-fatura" class="btn btn-ghost">📄 Importar fatura (PDF ou foto)</a>
            </div>
          </section>

          ${b.length?`
            <section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5 min-w-0">
              ${Fin.icones.titulo("pizza","orange","Gastos da fatura por categoria",{cls:"mb-3"})}
              ${Fin.charts.hbars(b.map(d=>({label:d.categoria,icone:d.icone,total:d.total})),{total:Math.max(c,.01)})}
            </section>`:""}

          <div class="space-y-4">${h(r)}</div>
        </div>`}i.addEventListener("click",a=>{const t=a.target.closest("[data-cartao]");if(t){Fin.state.cartao=t.dataset.cartao,Fin.router.render();return}const r=a.target.closest("[data-act]")?.dataset.act;if(!r)return;const c=n.cartao(Fin.state.cartao);if(r==="novo-cartao"&&Fin.forms.cartao.open(),r==="config"&&c&&Fin.forms.cartao.open(c.id),r==="nova-compra"&&Fin.forms.compra.open({cartao:Fin.state.cartao}),r==="sync"&&c){const l=n.sincronizarPagamento(c,Fin.state.mes);Fin.ui.toast(`Pagamento da fatura: ${e.brl(l.valorPrevisto)}.`),Fin.router.refresh()}},{signal:o})}return{title:"Cartões",render:F}})();
