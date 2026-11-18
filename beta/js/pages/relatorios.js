/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.relatorios=(()=>{const l=Fin.fmt,$=l.esc,m=()=>Fin.analise,p=()=>Fin.charts,R=[["mes","Mês"],["3m","3 meses"],["6m","6 meses"],["12m","12 meses"],["ano","Ano"],["custom","Personalizado"]],s={preset:"6m",ini:null,fim:null,tipo:"despesa",categoria:null,todas:!1};function k(){if(s.preset==="custom"&&s.ini&&s.fim)return s.ini<=s.fim?{ini:s.ini,fim:s.fim}:{ini:s.fim,fim:s.ini};const e=Fin.state.mes,t={mes:1,"3m":3,"6m":6,"12m":12}[s.preset];return{ini:s.preset==="ano"?`${e.slice(0,4)}-01`:l.addMonths(e,-((t||6)-1)),fim:e}}const v=(e,t)=>e===t?l.monthLong(e):`${l.monthShort(e)} a ${l.monthShort(t)}`,w=e=>`${(e*100).toFixed(Math.abs(e)<.1?1:0).replace(".",",")}%`;function g(e,t,o=!1){if(e==null||!Number.isFinite(e))return'<span class="text-slate-400">—</span>';const a=Math.abs(e*100);if(a<.5)return'<span class="text-slate-500">= estável</span>';const r=e>0===t,u=`${a.toFixed(a<10?1:0).replace(".",",")}${o?" p.p.":"%"}`;return`<span class="${r?"text-[#006300]":"text-rose-700"} font-medium"><span aria-hidden="true">${e>0?"▲":"▼"}</span> ${e>0?"subiu":"caiu"} ${u}</span>`}const h=(e,t="")=>`<section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5 min-w-0 ${t}">${e}</section>`;function F(e,t,o,a,r=null,u="slate"){return`
      <div class="bg-white rounded-2xl shadow-sm p-4 min-w-0">
        <div class="text-xs text-slate-500 flex items-center gap-2">${r?Fin.icones.badge(r,u,"w-7 h-7","w-4 h-4"):""}${e}</div>
        <div class="text-lg sm:text-xl font-semibold mt-0.5 truncate">${t}</div>
        <div class="text-xs text-slate-500 mt-0.5 truncate">${o}</div>
        <div class="text-xs mt-1.5">${a}</div>
      </div>`}function L(e,t,o){return h(`
      <div class="chips flex gap-2 overflow-x-auto -mx-1 px-1 pb-1" role="tablist" aria-label="Período">
        ${R.map(([a,r])=>`<button role="tab" aria-selected="${s.preset===a}" data-preset="${a}" class="chip !shadow-none border border-slate-200 ${s.preset===a?"is-active !border-transparent":""}">${r}</button>`).join("")}
      </div>
      ${s.preset==="custom"?`
        <div class="grid grid-cols-2 gap-3 mt-3">
          <label class="field"><span>De</span><input id="rel-ini" type="month" class="input" value="${e}"></label>
          <label class="field"><span>Até</span><input id="rel-fim" type="month" class="input" value="${t}"></label>
        </div>`:""}
      <div class="flex flex-wrap items-center justify-between gap-2 mt-3 text-xs text-slate-500">
        <span><b class="text-slate-700">${v(e,t)}</b> · comparado a ${v(o.ini,o.fim)}</span>
        <label class="inline-flex items-center gap-2 cursor-pointer">
          <input type="checkbox" id="rel-detalhar" class="accent-prim-600 w-4 h-4" ${Fin.state.detalharFaturas?"checked":""}>
          Detalhar faturas do cartão
        </label>
      </div>`,"!p-3 sm:!p-4")}function T(e){const t=e.atual,o=t.meses;return`
      ${e.completo?"":`<p class="text-xs text-slate-500 bg-white rounded-xl px-3 py-2 shadow-sm">
        <span aria-hidden="true">ⓘ</span> Sem comparação: o período anterior (${v(e.periodoAnterior.ini,e.periodoAnterior.fim)}) não tem dados em todos os meses.</p>`}
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${F("Receitas",l.brl(t.receitas),o>1?`média ${l.brl(t.mediaReceitas)}/mês`:"&nbsp;",g(e.delta.receitas,!0),"entrada","blue")}
        ${F("Despesas",l.brl(t.despesas),o>1?`média ${l.brl(t.mediaDespesas)}/mês`:"&nbsp;",g(e.delta.despesas,!1),"saida","orange")}
        ${F("Saldo",`<span class="${t.saldo<0?"text-rose-700":""}">${l.brl(t.saldo)}</span>`,t.saldo<0?"gastou mais do que recebeu":"sobrou no período",g(e.delta.saldo,!0),"carteira",t.saldo<0?"rose":"emerald")}
        ${F("Taxa de poupança",t.poupanca==null?"—":`<span class="${t.poupanca<0?"text-rose-700":""}">${w(t.poupanca)}</span>`,t.aportes>0?`inclui ${l.brl(t.aportes)} investidos`:"da receita que sobrou",g(e.delta.poupanca,!0,!0),"cofrinho","emerald")}
      </div>`}function j(e){const t=[{key:"receitas",label:"Receitas",color:p().SERIES.receitas},{key:"despesas",label:"Despesas",color:p().SERIES.despesas}];return h(`
      <div class="flex items-start justify-between gap-3 flex-wrap mb-3">
        ${Fin.icones.titulo("barras","blue","Receitas x despesas por mês")}
        ${p().legend(t)}
      </div>
      <div id="rel-evo" class="w-full min-w-0 overflow-hidden"></div>
      <details class="mt-3">
        <summary class="text-xs text-slate-500 flex items-center gap-1"><span class="chev">▸</span> Ver tabela</summary>
        <div class="table-wrap mt-2 border border-slate-200 rounded-xl"><table>
          <thead><tr><th>Mês</th><th class="num">Receitas</th><th class="num">Despesas</th><th class="num">Saldo</th><th class="num">Acumulado</th></tr></thead>
          <tbody>${e.map(o=>`<tr><td>${l.monthShort(o.ym)}</td><td class="num">${l.brl(o.receitas)}</td><td class="num">${l.brl(o.despesas)}</td><td class="num">${l.brl(o.saldo)}</td><td class="num">${l.brl(o.acumulado)}</td></tr>`).join("")}</tbody>
        </table></div>
      </details>`)}function I(e){const t=e.reduce((a,r)=>r.saldo>a.saldo?r:a,e[0]),o=e.reduce((a,r)=>r.saldo<a.saldo?r:a,e[0]);return h(`
      ${Fin.icones.titulo("linha","emerald","Saldo acumulado")}
      <p class="text-xs text-slate-500 mb-3">Soma dos saldos mês a mês no período.</p>
      <div id="rel-saldo" class="w-full min-w-0 overflow-hidden"></div>
      ${e.length>1?`<div class="grid grid-cols-2 gap-3 mt-3 text-xs">
        <div class="bg-slate-50 rounded-xl p-2.5"><div class="text-slate-500">Melhor mês</div><div class="font-semibold text-slate-800">${l.monthShort(t.ym)} · ${l.brl(t.saldo)}</div></div>
        <div class="bg-slate-50 rounded-xl p-2.5"><div class="text-slate-500">Pior mês</div><div class="font-semibold text-slate-800">${l.monthShort(o.ym)} · ${l.brl(o.saldo)}</div></div>
      </div>`:""}`)}function H(e,t,o){const a=e.reduce((i,y)=>i+y.total,0)||1,r=Math.max(...e.map(i=>i.total),1),u=s.todas?e:e.slice(0,10),c=s.tipo==="despesa"?p().SERIES.despesas:p().SERIES.receitas,b=u.map(i=>`
      <li>
        <button data-relcat="${$(i.categoria)}" class="hbar-row w-full text-left text-sm py-1.5 rounded-lg hover:bg-slate-50 ${s.categoria===i.categoria?"bg-slate-50":""}"
                aria-expanded="${s.categoria===i.categoria}" title="${$(i.categoria)}: ${l.brl(i.total)} (${w(i.total/a)})">
          <span class="truncate text-slate-700">${i.icone?`<span aria-hidden="true">${i.icone}</span> `:""}${$(i.categoria)}</span>
          <span class="flex items-center min-w-0"><span class="h-2.5 rounded-r" style="width:${Math.max(1.5,i.total/r*100)}%;background:${c}"></span></span>
          <span class="text-right whitespace-nowrap">
            <span class="tabular-nums text-slate-700">${l.brl(i.total)}</span><span class="text-slate-400 text-xs ml-1">${w(i.total/a)}</span>
            ${i.antes===null?"":`<span class="block text-[11px]">${i.antes?g(i.delta,s.tipo==="receita"):'<span class="text-slate-400">novo no período</span>'}</span>`}
          </span>
        </button>
      </li>`).join("");return h(`
      <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
        ${Fin.icones.titulo("pizza","orange","Por categoria")}
        <div class="seg w-56 !text-xs" role="tablist" aria-label="Tipo">
          <label><input type="radio" name="rel-tipo" value="despesa" ${s.tipo==="despesa"?"checked":""}><span class="!py-1.5">Despesas</span></label>
          <label><input type="radio" name="rel-tipo" value="receita" ${s.tipo==="receita"?"checked":""}><span class="!py-1.5">Receitas</span></label>
        </div>
      </div>
      ${e.length?`<ul class="space-y-0.5">${b}</ul>
        <p class="text-xs text-slate-400 mt-2">Toque numa categoria para ver o histórico e os maiores lançamentos.</p>
        ${e.length>10?`<button data-act="todas" class="mt-2 text-sm text-prim-700 font-medium hover:underline">${s.todas?"Mostrar só as 10 maiores":`Ver todas as ${e.length} categorias`}</button>`:""}`:'<p class="text-sm text-slate-500 py-3">Nada neste período.</p>'}`)}function A(e,t,o){const a=e.find(b=>b.categoria===s.categoria);if(!a)return"";const r=m().meses(t,o).length,u=e.reduce((b,i)=>b+i.total,0)||1,c=m().itens(t,o,{tipo:s.tipo,detalhar:Fin.state.detalharFaturas,categoria:a.categoria}).slice(0,8);return h(`
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="font-semibold truncate">${a.icone?`<span aria-hidden="true">${a.icone}</span> `:""}${$(a.categoria)}</h2>
          <p class="text-xs text-slate-500">${l.brl(a.total)} no período · ${w(a.total/u)} do total${r>1?` · média ${l.brl(a.total/r)}/mês`:""}</p>
        </div>
        <button data-act="fechar-cat" class="icon-btn shrink-0" aria-label="Fechar detalhe">✕</button>
      </div>
      ${r>1?'<div id="rel-cat" class="w-full min-w-0 overflow-hidden mt-3"></div>':""}
      <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide mt-4 mb-1">Maiores lançamentos</h3>
      ${c.length?`<ul class="divide-y divide-slate-100">${c.map(M).join("")}</ul>`:'<p class="text-sm text-slate-500">—</p>'}`,"ring-2 ring-emerald-100")}function M(e){return`
      <li class="flex items-center gap-3 py-2.5 cursor-pointer" ${e.tipoItem==="compra"?`data-edit-compra="${e.id}"`:`data-edit="${e.id}"`} role="button" tabindex="0">
        <span class="text-base w-6 text-center shrink-0" aria-hidden="true">${e.icone||"•"}</span>
        <div class="flex-1 min-w-0">
          <div class="text-sm truncate">${$(e.descricao)}</div>
          <div class="text-xs text-slate-500 truncate">${l.date(e.data)} · ${$(e.origem)}${e.parcela?` · ${e.parcela.atual}/${e.parcela.total}`:""}</div>
        </div>
        <span class="text-sm font-semibold tabular-nums shrink-0">${l.brl(e.valor)}</span>
      </li>`}function D(e,t){const o=Fin.state.detalharFaturas,a=m().porClassificacao(e,t,o),r=m().porForma(e,t),u=m().itens(e,t,{tipo:"despesa",detalhar:o}).slice(0,10);return`
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        ${h(`${Fin.icones.titulo("etiqueta","amber","Por classificação")}
          <p class="text-xs text-slate-500 mb-3">Despesas pelo grupo da categoria (ex.: Essencial). Ajuste em Categorias.</p>
          ${a.length?p().hbars(a.map(c=>({label:c.label,total:c.total}))):'<p class="text-sm text-slate-500">—</p>'}`)}
        ${h(`${Fin.icones.titulo("carteira","violet","Por forma de pagamento")}
          <p class="text-xs text-slate-500 mb-3">Como as despesas foram pagas (fatura do cartão conta pela forma usada para pagá-la).</p>
          ${r.length?p().hbars(r.slice(0,8).map(c=>({label:c.label,icone:c.icone,total:c.total}))):'<p class="text-sm text-slate-500">—</p>'}`)}
      </div>
      ${h(`${Fin.icones.titulo("saida","rose","Maiores despesas do período",{cls:"mb-1"})}
        ${u.length?`<ul class="divide-y divide-slate-100">${u.map(M).join("")}</ul>`:'<p class="text-sm text-slate-500 py-2">—</p>'}`)}`}function E(e,t,o){if(!e)return;let a=e.clientWidth;t();const r=new ResizeObserver(()=>requestAnimationFrame(()=>{Math.abs(e.clientWidth-a)>1&&(a=e.clientWidth,t())}));r.observe(e),o.addEventListener("abort",()=>r.disconnect())}function q(e,{signal:t}){if(!Fin.storage.hasData()){e.innerHTML=Fin.ui.emptyState("📊","Sem dados para analisar","Importe sua planilha ou crie lançamentos.",'<a href="#/dados" class="btn btn-primary">Importar planilha</a>');return}const{ini:o,fim:a}=k(),r=m().anterior(o,a),u=m().comparativo(o,a),c=m().evolucao(o,a),b=m().categoriasComparadas(o,a,s.tipo,Fin.state.detalharFaturas);s.categoria&&!b.some(d=>d.categoria===s.categoria)&&(s.categoria=null),e.innerHTML=`
      <div class="space-y-4">
        ${Fin.ui.filtroPessoa()}
        ${s.preset==="custom"?"":`${Fin.ui.monthNav(a)}`}
        ${L(o,a,r)}
        ${T(u)}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          ${j(c)}
          ${I(c)}
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          ${H(b,o,a)}
          <div id="rel-det-wrap">${A(b,o,a)}</div>
        </div>
        ${D(o,a)}
        <div class="flex flex-wrap items-center gap-3 justify-between bg-white rounded-2xl shadow-sm p-4">
          <p class="text-sm text-slate-600">Leve os lançamentos de ${v(o,a)} para o Excel.</p>
          <button data-act="csv" class="btn btn-ghost">⬇️ Exportar CSV</button>
        </div>
      </div>`;const i=e.querySelector("#rel-evo");E(i,()=>p().columns(i,c,{series:[{key:"receitas",label:"Receitas",color:p().SERIES.receitas},{key:"despesas",label:"Despesas",color:p().SERIES.despesas}],label:"Receitas e despesas por mês",onSelect:d=>{Fin.state.mes=d,s.preset="mes",Fin.router.render()}}),t);const y=e.querySelector("#rel-saldo");E(y,()=>p().line(y,c.map(d=>({ym:d.ym,valor:d.acumulado,extra:`Saldo do mês: ${l.brl(d.saldo)}`})),{nome:"Acumulado",label:"Saldo acumulado no período",color:p().SERIES.receitas}),t);const P=()=>{const d=e.querySelector("#rel-cat"),n=b.find(x=>x.categoria===s.categoria);if(!d||!n)return;const f=[{key:"valor",label:n.categoria,color:s.tipo==="despesa"?p().SERIES.despesas:p().SERIES.receitas}];p().columns(d,m().meses(o,a).map(x=>({ym:x,valor:n.porMes[x]||0})),{series:f,label:`Histórico de ${n.categoria}`})};E(e.querySelector("#rel-cat"),P,t),e.addEventListener("click",d=>{const n=d.target.closest("[data-preset]");if(n)return s.preset=n.dataset.preset,s.preset==="custom"&&!s.ini&&Object.assign(s,{ini:o,fim:a}),Fin.router.render();const f=d.target.closest("[data-relcat]");if(f){s.categoria=s.categoria===f.dataset.relcat?null:f.dataset.relcat,Fin.router.refresh(),s.categoria&&window.innerWidth<1024&&document.getElementById("rel-det-wrap")?.scrollIntoView({behavior:"smooth",block:"start"});return}const x=d.target.closest("[data-act]")?.dataset.act;if(x==="todas"&&(s.todas=!s.todas,Fin.router.refresh()),x==="fechar-cat"&&(s.categoria=null,Fin.router.refresh()),x==="csv"){const C=new Blob([m().csv(o,a)],{type:"text/csv;charset=utf-8"}),S=document.createElement("a");S.href=URL.createObjectURL(C),S.download=`financas_${o}_a_${a}.csv`,S.click(),setTimeout(()=>URL.revokeObjectURL(S.href),1e3)}},{signal:t}),e.addEventListener("change",d=>{const n=d.target;if(n.name==="rel-tipo")return s.tipo=n.value,s.categoria=null,Fin.router.refresh();if(n.id==="rel-detalhar")return Fin.state.detalharFaturas=n.checked,Fin.router.refresh();if(n.id==="rel-ini"&&n.value)return s.ini=n.value,Fin.router.render();if(n.id==="rel-fim"&&n.value)return s.fim=n.value,Fin.router.render()},{signal:t})}return{title:"Análises",render:q,estado:s}})();
