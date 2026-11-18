/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.relatorios=(()=>{const r=Fin.fmt,f=r.esc,b=()=>Fin.analise,u=()=>Fin.charts,j=[["mes","Mês"],["3m","3 meses"],["6m","6 meses"],["12m","12 meses"],["ano","Ano"],["custom","Personalizado"]],s={preset:"6m",ini:null,fim:null,tipo:"despesa",categoria:null,todas:!1,aba:"geral"};function H(){if(s.preset==="custom"&&s.ini&&s.fim)return s.ini<=s.fim?{ini:s.ini,fim:s.fim}:{ini:s.fim,fim:s.ini};const e=Fin.state.mes,a={mes:1,"3m":3,"6m":6,"12m":12}[s.preset];return{ini:s.preset==="ano"?`${e.slice(0,4)}-01`:r.addMonths(e,-((a||6)-1)),fim:e}}const w=(e,a)=>e===a?r.monthLong(e):`${r.monthShort(e)} a ${r.monthShort(a)}`,v=e=>`${(e*100).toFixed(Math.abs(e)<.1?1:0).replace(".",",")}%`;function y(e,a,o=!1){if(e==null||!Number.isFinite(e))return'<span class="text-slate-400">—</span>';const t=Math.abs(e*100);if(t<.5)return'<span class="text-slate-500">= estável</span>';const i=e>0===a,p=`${t.toFixed(t<10?1:0).replace(".",",")}${o?" p.p.":"%"}`;return`<span class="${i?"text-[#006300]":"text-rose-700"} font-medium"><span aria-hidden="true">${e>0?"▲":"▼"}</span> ${e>0?"subiu":"caiu"} ${p}</span>`}const x=(e,a="")=>`<section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5 min-w-0 ${a}">${e}</section>`;function M(e,a,o,t,i=null,p="slate"){return`
      <div class="bg-white rounded-2xl shadow-sm p-4 min-w-0">
        <div class="text-xs text-slate-500 flex items-center gap-2">${i?Fin.icones.badge(i,p,"w-7 h-7","w-4 h-4"):""}${e}</div>
        <div class="text-lg sm:text-xl font-semibold mt-0.5 truncate">${a}</div>
        <div class="text-xs text-slate-500 mt-0.5 truncate">${o}</div>
        <div class="text-xs mt-1.5">${t}</div>
      </div>`}function I(e,a,o){const t=s.preset!=="custom",i=(p,d,m)=>`<button type="button" data-rel-mover="${p}" class="icon-btn shrink-0 w-11 h-11" aria-label="${d}">${Fin.icone("seta",`w-5 h-5 ${m}`)}</button>`;return x(`
      <div class="flex items-center gap-2">
        ${t?i(-1,"Período anterior","rotate-90"):""}
        <div class="flex-1 min-w-0 text-center">
          <div class="font-semibold truncate">${w(e,a)}</div>
          <div class="text-xs text-slate-500 truncate">comparado a ${w(o.ini,o.fim)}</div>
        </div>
        ${t?i(1,"Próximo período","-rotate-90"):""}
      </div>
      <div class="chips flex gap-2 overflow-x-auto -mx-1 px-1 pb-1 mt-3" role="group" aria-label="Tamanho do período">
        ${j.map(([p,d])=>`<button type="button" aria-pressed="${s.preset===p}" data-preset="${p}" class="chip !shadow-none border border-slate-200 shrink-0 ${s.preset===p?"is-active !border-transparent":""}">${d}</button>`).join("")}
      </div>
      ${s.preset==="custom"?`
        <div class="grid grid-cols-2 gap-3 mt-3">
          <label class="field"><span>De</span><input id="rel-ini" type="month" class="input" value="${e}"></label>
          <label class="field"><span>Até</span><input id="rel-fim" type="month" class="input" value="${a}"></label>
        </div>`:""}`,"!p-3 sm:!p-4")}const A=[["geral","Visão geral"],["categorias","Categorias"],["evolucao","Evolução"]],q=()=>`
    <div class="grid grid-cols-3 gap-1 bg-slate-200/70 rounded-xl p-1" role="tablist" aria-label="Análises">
      ${A.map(([e,a])=>`<button type="button" role="tab" id="aba-${e}" aria-controls="rel-painel" aria-selected="${s.aba===e}" data-aba="${e}" class="rel-aba">${a}</button>`).join("")}
    </div>`;function C(e,a,o,t,i){const p=e.atual,d=[],m=p.meses>1?"no período":"no mês";(p.receitas||p.despesas)&&d.push(p.saldo<0?["alerta","rose",`Você gastou mais do que recebeu: faltaram <b>${r.brl(-p.saldo)}</b> ${m}.`]:["check","emerald",`Sobraram <b>${r.brl(p.saldo)}</b> ${m}${p.poupanca!=null?` — ${v(p.poupanca)} do que entrou`:""}.`]);const n=e.delta.despesas;e.completo&&Number.isFinite(n)&&Math.abs(n)>=.05&&d.push([n>0?"alta":"saida",n>0?"amber":"emerald",`Suas despesas ${n>0?"subiram":"caíram"} <b>${v(Math.abs(n))}</b> em relação a ${w(i.ini,i.fim)}.`]);const g=b().categoriasComparadas(o,t,"despesa",Fin.state.detalharFaturas),S=g.reduce((l,c)=>l+c.total,0);g.length&&S>0&&d.push(["pizza","orange",`<b>${f(g[0].categoria)}</b> foi o maior gasto: ${r.brl(g[0].total)} (${v(g[0].total/S)} das despesas).`]);const F=e.completo?g.filter(l=>Number.isFinite(l.antes)&&l.antes>0&&Number.isFinite(l.delta)&&l.delta>=.2).sort((l,c)=>c.total-c.antes-(l.total-l.antes))[0]:null;if(F&&d.push(["alta","amber",`<b>${f(F.categoria)}</b> subiu ${v(F.delta)} (+${r.brl(F.total-F.antes)}) — vale olhar.`]),a.length>1){const l=a.reduce((h,$)=>$.saldo>h.saldo?$:h,a[0]),c=a.reduce((h,$)=>$.saldo<h.saldo?$:h,a[0]);l.ym!==c.ym&&d.push(["calendario","blue",`Melhor mês: <b>${r.monthShort(l.ym)}</b> (${r.brl(l.saldo)}). Mais apertado: <b>${r.monthShort(c.ym)}</b> (${r.brl(c.saldo)}).`])}return d.length?x(`
      ${Fin.icones.titulo("pulso","emerald","O que aconteceu",{cls:"mb-3"})}
      <ul class="space-y-3">${d.map(([l,c,h])=>`
        <li class="flex items-start gap-3">${Fin.icones.badge(l,c,"w-8 h-8","w-4 h-4")}<p class="text-[15px] leading-snug text-slate-700 pt-1 min-w-0">${h}</p></li>`).join("")}
      </ul>`):""}function P(e,a){const o=b().categoriasComparadas(e,a,"despesa",Fin.state.detalharFaturas).slice(0,5);return o.length?x(`
      <div class="flex items-center justify-between gap-2 mb-3">
        ${Fin.icones.titulo("pizza","orange","Onde mais gastou")}
        <button type="button" data-aba="categorias" class="text-sm text-prim-700 font-medium hover:underline">Ver todas</button>
      </div>
      ${u().hbars(o.map(t=>({label:t.categoria,icone:t.icone,total:t.total})))}`):""}const D=()=>`
    <label class="inline-flex items-center gap-2 cursor-pointer text-[13px] text-slate-600 px-1">
      <input type="checkbox" id="rel-detalhar" class="accent-prim-600 w-4 h-4" ${Fin.state.detalharFaturas?"checked":""}>
      Detalhar faturas do cartão (mostra as compras no lugar da fatura)
    </label>`;function z(e){const a=e.atual,o=a.meses;return`
      ${e.completo?"":`<p class="text-xs text-slate-500 bg-white rounded-xl px-3 py-2 shadow-sm">
        <span aria-hidden="true">ⓘ</span> Sem comparação: o período anterior (${w(e.periodoAnterior.ini,e.periodoAnterior.fim)}) não tem dados em todos os meses.</p>`}
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${M("Receitas",r.brl(a.receitas),o>1?`média ${r.brl(a.mediaReceitas)}/mês`:"&nbsp;",y(e.delta.receitas,!0),"entrada","blue")}
        ${M("Despesas",r.brl(a.despesas),o>1?`média ${r.brl(a.mediaDespesas)}/mês`:"&nbsp;",y(e.delta.despesas,!1),"saida","orange")}
        ${M("Saldo",`<span class="${a.saldo<0?"text-rose-700":""}">${r.brl(a.saldo)}</span>`,a.saldo<0?"gastou mais do que recebeu":"sobrou no período",y(e.delta.saldo,!0),"carteira",a.saldo<0?"rose":"emerald")}
        ${M("Taxa de poupança",a.poupanca==null?"—":`<span class="${a.poupanca<0?"text-rose-700":""}">${v(a.poupanca)}</span>`,a.aportes>0?`inclui ${r.brl(a.aportes)} investidos`:"da receita que sobrou",y(e.delta.poupanca,!0,!0),"cofrinho","emerald")}
      </div>`}function V(e){const a=[{key:"receitas",label:"Receitas",color:u().SERIES.receitas},{key:"despesas",label:"Despesas",color:u().SERIES.despesas}];return x(`
      <div class="flex items-start justify-between gap-3 flex-wrap mb-3">
        ${Fin.icones.titulo("barras","blue","Receitas x despesas por mês")}
        ${u().legend(a)}
      </div>
      <div id="rel-evo" class="w-full min-w-0 overflow-hidden"></div>
      <details class="mt-3">
        <summary class="text-xs text-slate-500 flex items-center gap-1"><span class="chev">▸</span> Ver tabela</summary>
        <div class="table-wrap mt-2 border border-slate-200 rounded-xl"><table>
          <thead><tr><th>Mês</th><th class="num">Receitas</th><th class="num">Despesas</th><th class="num">Saldo</th><th class="num">Acumulado</th></tr></thead>
          <tbody>${e.map(o=>`<tr><td>${r.monthShort(o.ym)}</td><td class="num">${r.brl(o.receitas)}</td><td class="num">${r.brl(o.despesas)}</td><td class="num">${r.brl(o.saldo)}</td><td class="num">${r.brl(o.acumulado)}</td></tr>`).join("")}</tbody>
        </table></div>
      </details>`)}function N(e){const a=e.reduce((t,i)=>i.saldo>t.saldo?i:t,e[0]),o=e.reduce((t,i)=>i.saldo<t.saldo?i:t,e[0]);return x(`
      ${Fin.icones.titulo("linha","emerald","Saldo acumulado")}
      <p class="text-xs text-slate-500 mb-3">Soma dos saldos mês a mês no período.</p>
      <div id="rel-saldo" class="w-full min-w-0 overflow-hidden"></div>
      ${e.length>1?`<div class="grid grid-cols-2 gap-3 mt-3 text-xs">
        <div class="bg-slate-50 rounded-xl p-2.5"><div class="text-slate-500">Melhor mês</div><div class="font-semibold text-slate-800">${r.monthShort(a.ym)} · ${r.brl(a.saldo)}</div></div>
        <div class="bg-slate-50 rounded-xl p-2.5"><div class="text-slate-500">Pior mês</div><div class="font-semibold text-slate-800">${r.monthShort(o.ym)} · ${r.brl(o.saldo)}</div></div>
      </div>`:""}`)}function O(e,a,o){const t=e.reduce((n,g)=>n+g.total,0)||1,i=Math.max(...e.map(n=>n.total),1),p=s.todas?e:e.slice(0,10),d=s.tipo==="despesa"?u().SERIES.despesas:u().SERIES.receitas,m=p.map(n=>`
      <li>
        <button data-relcat="${f(n.categoria)}" class="hbar-row w-full text-left text-sm py-1.5 rounded-lg hover:bg-slate-50 ${s.categoria===n.categoria?"bg-slate-50":""}"
                aria-expanded="${s.categoria===n.categoria}" title="${f(n.categoria)}: ${r.brl(n.total)} (${v(n.total/t)})">
          <span class="truncate text-slate-700">${n.icone?`<span aria-hidden="true">${n.icone}</span> `:""}${f(n.categoria)}</span>
          <span class="flex items-center min-w-0"><span class="h-2.5 rounded-r" style="width:${Math.max(1.5,n.total/i*100)}%;background:${d}"></span></span>
          <span class="text-right whitespace-nowrap">
            <span class="tabular-nums text-slate-700">${r.brl(n.total)}</span><span class="text-slate-400 text-xs ml-1">${v(n.total/t)}</span>
            ${n.antes===null?"":`<span class="block text-[11px]">${n.antes?y(n.delta,s.tipo==="receita"):'<span class="text-slate-400">novo no período</span>'}</span>`}
          </span>
        </button>
      </li>`).join("");return x(`
      <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
        ${Fin.icones.titulo("pizza","orange","Por categoria")}
        <div class="seg w-56 !text-xs" role="tablist" aria-label="Tipo">
          <label><input type="radio" name="rel-tipo" value="despesa" ${s.tipo==="despesa"?"checked":""}><span class="!py-1.5">Despesas</span></label>
          <label><input type="radio" name="rel-tipo" value="receita" ${s.tipo==="receita"?"checked":""}><span class="!py-1.5">Receitas</span></label>
        </div>
      </div>
      ${e.length?`<ul class="space-y-0.5">${m}</ul>
        <p class="text-xs text-slate-400 mt-2">Toque numa categoria para ver o histórico e os maiores lançamentos.</p>
        ${e.length>10?`<button data-act="todas" class="mt-2 text-sm text-prim-700 font-medium hover:underline">${s.todas?"Mostrar só as 10 maiores":`Ver todas as ${e.length} categorias`}</button>`:""}`:'<p class="text-sm text-slate-500 py-3">Nada neste período.</p>'}`)}function U(e,a,o){const t=e.find(m=>m.categoria===s.categoria);if(!t)return"";const i=b().meses(a,o).length,p=e.reduce((m,n)=>m+n.total,0)||1,d=b().itens(a,o,{tipo:s.tipo,detalhar:Fin.state.detalharFaturas,categoria:t.categoria}).slice(0,8);return x(`
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="font-semibold truncate">${t.icone?`<span aria-hidden="true">${t.icone}</span> `:""}${f(t.categoria)}</h2>
          <p class="text-xs text-slate-500">${r.brl(t.total)} no período · ${v(t.total/p)} do total${i>1?` · média ${r.brl(t.total/i)}/mês`:""}</p>
        </div>
        <button data-act="fechar-cat" class="icon-btn shrink-0" aria-label="Fechar detalhe">✕</button>
      </div>
      ${i>1?'<div id="rel-cat" class="w-full min-w-0 overflow-hidden mt-3"></div>':""}
      <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide mt-4 mb-1">Maiores lançamentos</h3>
      ${d.length?`<ul class="divide-y divide-slate-100">${d.map(T).join("")}</ul>`:'<p class="text-sm text-slate-500">—</p>'}`,"ring-2 ring-emerald-100")}function T(e){return`
      <li class="flex items-center gap-3 py-2.5 cursor-pointer" ${e.tipoItem==="compra"?`data-edit-compra="${e.id}"`:`data-edit="${e.id}"`} role="button" tabindex="0">
        <span class="text-base w-6 text-center shrink-0" aria-hidden="true">${e.icone||"•"}</span>
        <div class="flex-1 min-w-0">
          <div class="text-sm truncate">${f(e.descricao)}</div>
          <div class="text-xs text-slate-500 truncate">${r.date(e.data)} · ${f(e.origem)}${e.parcela?` · ${e.parcela.atual}/${e.parcela.total}`:""}</div>
        </div>
        <span class="text-sm font-semibold tabular-nums shrink-0">${r.brl(e.valor)}</span>
      </li>`}function W(e,a){const o=Fin.state.detalharFaturas,t=b().porClassificacao(e,a,o),i=b().porForma(e,a),p=b().itens(e,a,{tipo:"despesa",detalhar:o}).slice(0,10);return`
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        ${x(`${Fin.icones.titulo("etiqueta","amber","Por classificação")}
          <p class="text-xs text-slate-500 mb-3">Despesas pelo grupo da categoria (ex.: Essencial). Ajuste em Categorias.</p>
          ${t.length?u().hbars(t.map(d=>({label:d.label,total:d.total}))):'<p class="text-sm text-slate-500">—</p>'}`)}
        ${x(`${Fin.icones.titulo("carteira","violet","Por forma de pagamento")}
          <p class="text-xs text-slate-500 mb-3">Como as despesas foram pagas (fatura do cartão conta pela forma usada para pagá-la).</p>
          ${i.length?u().hbars(i.slice(0,8).map(d=>({label:d.label,icone:d.icone,total:d.total}))):'<p class="text-sm text-slate-500">—</p>'}`)}
      </div>
      ${x(`${Fin.icones.titulo("saida","rose","Maiores despesas do período",{cls:"mb-1"})}
        ${p.length?`<ul class="divide-y divide-slate-100">${p.map(T).join("")}</ul>`:'<p class="text-sm text-slate-500 py-2">—</p>'}`)}`}function L(e,a,o){if(!e)return;let t=e.clientWidth;a();const i=new ResizeObserver(()=>requestAnimationFrame(()=>{Math.abs(e.clientWidth-t)>1&&(t=e.clientWidth,a())}));i.observe(e),o.addEventListener("abort",()=>i.disconnect())}function B(e,{signal:a}){if(!Fin.storage.hasData()){e.innerHTML=Fin.ui.emptyState("📊","Sem dados para analisar","Importe sua planilha ou crie lançamentos.",'<a href="#/dados" class="btn btn-primary">Importar planilha</a>');return}const{ini:o,fim:t}=H(),i=b().anterior(o,t),p=b().comparativo(o,t),d=b().evolucao(o,t),m=b().categoriasComparadas(o,t,s.tipo,Fin.state.detalharFaturas);s.categoria&&!m.some(l=>l.categoria===s.categoria)&&(s.categoria=null);const n={geral:()=>`
        ${C(p,d,o,t,i)}
        ${z(p)}
        ${P(o,t)}`,categorias:()=>`
        ${D()}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          ${O(m,o,t)}
          <div id="rel-det-wrap">${U(m,o,t)}</div>
        </div>
        ${W(o,t)}`,evolucao:()=>`
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          ${V(d)}
          ${N(d)}
        </div>`}[s.aba]||(()=>"");e.innerHTML=`
      <div class="space-y-4">
        ${Fin.ui.filtroPessoa()}
        ${I(o,t,i)}
        ${q()}
        <div id="rel-painel" role="tabpanel" aria-labelledby="aba-${s.aba}" class="space-y-4">${n()}</div>
        <div class="flex flex-wrap items-center gap-3 justify-between bg-white rounded-2xl shadow-sm p-4">
          <p class="text-sm text-slate-600">Leve os lançamentos de ${w(o,t)} para o Excel.</p>
          <button data-act="csv" class="btn btn-ghost">⬇️ Exportar CSV</button>
        </div>
      </div>`;const g=e.querySelector("#rel-evo");L(g,()=>u().columns(g,d,{series:[{key:"receitas",label:"Receitas",color:u().SERIES.receitas},{key:"despesas",label:"Despesas",color:u().SERIES.despesas}],label:"Receitas e despesas por mês",onSelect:l=>{Fin.state.mes=l,s.preset="mes",Fin.router.render()}}),a);const S=e.querySelector("#rel-saldo");L(S,()=>u().line(S,d.map(l=>({ym:l.ym,valor:l.acumulado,extra:`Saldo do mês: ${r.brl(l.saldo)}`})),{nome:"Acumulado",label:"Saldo acumulado no período",color:u().SERIES.receitas}),a);const F=()=>{const l=e.querySelector("#rel-cat"),c=m.find($=>$.categoria===s.categoria);if(!l||!c)return;const h=[{key:"valor",label:c.categoria,color:s.tipo==="despesa"?u().SERIES.despesas:u().SERIES.receitas}];u().columns(l,b().meses(o,t).map($=>({ym:$,valor:c.porMes[$]||0})),{series:h,label:`Histórico de ${c.categoria}`})};L(e.querySelector("#rel-cat"),F,a),e.addEventListener("click",l=>{const c=l.target.closest("[data-aba]");if(c){s.aba=c.dataset.aba,Fin.router.refresh(),window.scrollTo(0,0);return}const h=l.target.closest("[data-rel-mover]");if(h)return Fin.state.mes=r.addMonths(Fin.state.mes,Number(h.dataset.relMover)*(s.preset==="ano"?12:b().meses(o,t).length)),Fin.router.render();const $=l.target.closest("[data-preset]");if($)return s.preset=$.dataset.preset,s.preset==="custom"&&!s.ini&&Object.assign(s,{ini:o,fim:t}),Fin.router.render();const R=l.target.closest("[data-relcat]");if(R){s.categoria=s.categoria===R.dataset.relcat?null:R.dataset.relcat,Fin.router.refresh(),s.categoria&&window.innerWidth<1024&&document.getElementById("rel-det-wrap")?.scrollIntoView({behavior:"smooth",block:"start"});return}const k=l.target.closest("[data-act]")?.dataset.act;if(k==="todas"&&(s.todas=!s.todas,Fin.router.refresh()),k==="fechar-cat"&&(s.categoria=null,Fin.router.refresh()),k==="csv"){const _=new Blob([b().csv(o,t)],{type:"text/csv;charset=utf-8"}),E=document.createElement("a");E.href=URL.createObjectURL(_),E.download=`financas_${o}_a_${t}.csv`,E.click(),setTimeout(()=>URL.revokeObjectURL(E.href),1e3)}},{signal:a}),e.addEventListener("change",l=>{const c=l.target;if(c.name==="rel-tipo")return s.tipo=c.value,s.categoria=null,Fin.router.refresh();if(c.id==="rel-detalhar")return Fin.state.detalharFaturas=c.checked,Fin.router.refresh();if(c.id==="rel-ini"&&c.value)return s.ini=c.value,Fin.router.render();if(c.id==="rel-fim"&&c.value)return s.fim=c.value,Fin.router.render()},{signal:a})}return{title:"Análises",render:B,estado:s}})();
