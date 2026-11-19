/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.relatorios=(()=>{const r=Fin.fmt,f=r.esc,$=()=>Fin.analise,u=()=>Fin.charts,I=[["mes","Mês"],["3m","3 meses"],["6m","6 meses"],["12m","12 meses"],["ano","Ano"],["custom","Personalizado"]],s={preset:"6m",ini:null,fim:null,tipo:"despesa",categoria:null,todas:!1,aba:"geral"},k={mes:1,"3m":3,"6m":6,"12m":12,ano:12,custom:99};function A(){if(Fin.plano.pode("analises",k[s.preset])||(s.preset="3m"),s.preset==="custom"&&s.ini&&s.fim)return s.ini<=s.fim?{ini:s.ini,fim:s.fim}:{ini:s.fim,fim:s.ini};const e=Fin.state.mes,a={mes:1,"3m":3,"6m":6,"12m":12}[s.preset];return{ini:s.preset==="ano"?`${e.slice(0,4)}-01`:r.addMonths(e,-((a||6)-1)),fim:e}}const w=(e,a)=>e===a?r.monthLong(e):`${r.monthShort(e)} a ${r.monthShort(a)}`,v=e=>`${(e*100).toFixed(Math.abs(e)<.1?1:0).replace(".",",")}%`;function y(e,a,o=!1){if(e==null||!Number.isFinite(e))return'<span class="text-slate-400">—</span>';const t=Math.abs(e*100);if(t<.5)return'<span class="text-slate-500">= estável</span>';const i=e>0===a,d=`${t.toFixed(t<10?1:0).replace(".",",")}${o?" p.p.":"%"}`;return`<span class="${i?"text-[#006300]":"text-rose-700"} font-medium"><span aria-hidden="true">${e>0?"▲":"▼"}</span> ${e>0?"subiu":"caiu"} ${d}</span>`}const x=(e,a="")=>`<section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5 min-w-0 ${a}">${e}</section>`;function E(e,a,o,t,i=null,d="slate"){return`
      <div class="bg-white rounded-2xl shadow-sm p-4 min-w-0">
        <div class="text-xs text-slate-500 flex items-center gap-2">${i?Fin.icones.badge(i,d,"w-7 h-7","w-4 h-4"):""}${e}</div>
        <div class="text-lg sm:text-xl font-semibold mt-0.5 truncate">${a}</div>
        <div class="text-xs text-slate-500 mt-0.5 truncate">${o}</div>
        <div class="text-xs mt-1.5">${t}</div>
      </div>`}function q(e,a,o){const t=s.preset!=="custom",i=(d,c,m)=>`<button type="button" data-rel-mover="${d}" class="icon-btn shrink-0 w-11 h-11" aria-label="${c}">${Fin.icone("seta",`w-5 h-5 ${m}`)}</button>`;return x(`
      <div class="flex items-center gap-2">
        ${t?i(-1,"Período anterior","rotate-90"):""}
        <div class="flex-1 min-w-0 text-center">
          <div class="font-semibold truncate">${w(e,a)}</div>
          <div class="text-xs text-slate-500 truncate">comparado a ${w(o.ini,o.fim)}</div>
        </div>
        ${t?i(1,"Próximo período","-rotate-90"):""}
      </div>
      <div class="chips flex gap-2 overflow-x-auto -mx-1 px-1 pb-1 mt-3" role="group" aria-label="Tamanho do período">
        ${I.map(([d,c])=>`<button type="button" aria-pressed="${s.preset===d}" data-preset="${d}" class="chip !shadow-none border border-slate-200 shrink-0 ${s.preset===d?"is-active !border-transparent":""}">${c}</button>`).join("")}
      </div>
      ${s.preset==="custom"?`
        <div class="grid grid-cols-2 gap-3 mt-3">
          <label class="field"><span>De</span><input id="rel-ini" type="month" class="input" value="${e}"></label>
          <label class="field"><span>Até</span><input id="rel-fim" type="month" class="input" value="${a}"></label>
        </div>`:""}`,"!p-3 sm:!p-4")}const P=[["geral","Visão geral"],["categorias","Categorias"],["evolucao","Evolução"]],C=()=>`
    <div class="grid grid-cols-3 gap-1 bg-slate-200/70 rounded-xl p-1" role="tablist" aria-label="Análises">
      ${P.map(([e,a])=>`<button type="button" role="tab" id="aba-${e}" aria-controls="rel-painel" aria-selected="${s.aba===e}" data-aba="${e}" class="rel-aba">${a}</button>`).join("")}
    </div>`;function D(e,a,o,t,i){const d=e.atual,c=[],m=d.meses>1?"no período":"no mês";(d.receitas||d.despesas)&&c.push(d.saldo<0?["alerta","rose",`Você gastou mais do que recebeu: faltaram <b>${r.brl(-d.saldo)}</b> ${m}.`]:["check","emerald",`Sobraram <b>${r.brl(d.saldo)}</b> ${m}${d.poupanca!=null?` — ${v(d.poupanca)} do que entrou`:""}.`]);const n=e.delta.despesas;e.completo&&Number.isFinite(n)&&Math.abs(n)>=.05&&c.push([n>0?"alta":"saida",n>0?"amber":"emerald",`Suas despesas ${n>0?"subiram":"caíram"} <b>${v(Math.abs(n))}</b> em relação a ${w(i.ini,i.fim)}.`]);const g=$().categoriasComparadas(o,t,"despesa",Fin.state.detalharFaturas),S=g.reduce((l,p)=>l+p.total,0);g.length&&S>0&&c.push(["pizza","orange",`<b>${f(g[0].categoria)}</b> foi o maior gasto: ${r.brl(g[0].total)} (${v(g[0].total/S)} das despesas).`]);const F=e.completo?g.filter(l=>Number.isFinite(l.antes)&&l.antes>0&&Number.isFinite(l.delta)&&l.delta>=.2).sort((l,p)=>p.total-p.antes-(l.total-l.antes))[0]:null;if(F&&c.push(["alta","amber",`<b>${f(F.categoria)}</b> subiu ${v(F.delta)} (+${r.brl(F.total-F.antes)}) — vale olhar.`]),a.length>1){const l=a.reduce((h,b)=>b.saldo>h.saldo?b:h,a[0]),p=a.reduce((h,b)=>b.saldo<h.saldo?b:h,a[0]);l.ym!==p.ym&&c.push(["calendario","blue",`Melhor mês: <b>${r.monthShort(l.ym)}</b> (${r.brl(l.saldo)}). Mais apertado: <b>${r.monthShort(p.ym)}</b> (${r.brl(p.saldo)}).`])}return c.length?x(`
      ${Fin.icones.titulo("pulso","emerald","O que aconteceu",{cls:"mb-3"})}
      <ul class="space-y-3">${c.map(([l,p,h])=>`
        <li class="flex items-start gap-3">${Fin.icones.badge(l,p,"w-8 h-8","w-4 h-4")}<p class="text-[15px] leading-snug text-slate-700 pt-1 min-w-0">${h}</p></li>`).join("")}
      </ul>`):""}function z(e,a){const o=$().categoriasComparadas(e,a,"despesa",Fin.state.detalharFaturas).slice(0,5);return o.length?x(`
      <div class="flex items-center justify-between gap-2 mb-3">
        ${Fin.icones.titulo("pizza","orange","Onde mais gastou")}
        <button type="button" data-aba="categorias" class="text-sm text-prim-700 font-medium hover:underline">Ver todas</button>
      </div>
      ${u().hbars(o.map(t=>({label:t.categoria,icone:t.icone,total:t.total})))}`):""}const V=()=>`
    <label class="inline-flex items-center gap-2 cursor-pointer text-[13px] text-slate-600 px-1">
      <input type="checkbox" id="rel-detalhar" class="accent-prim-600 w-4 h-4" ${Fin.state.detalharFaturas?"checked":""}>
      Detalhar faturas do cartão (mostra as compras no lugar da fatura)
    </label>`;function j(e){const a=e.atual,o=a.meses;return`
      ${e.completo?"":`<p class="text-xs text-slate-500 bg-white rounded-xl px-3 py-2 shadow-sm">
        <span aria-hidden="true">ⓘ</span> Sem comparação: o período anterior (${w(e.periodoAnterior.ini,e.periodoAnterior.fim)}) não tem dados em todos os meses.</p>`}
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${E("Receitas",r.brl(a.receitas),o>1?`média ${r.brl(a.mediaReceitas)}/mês`:"&nbsp;",y(e.delta.receitas,!0),"entrada","blue")}
        ${E("Despesas",r.brl(a.despesas),o>1?`média ${r.brl(a.mediaDespesas)}/mês`:"&nbsp;",y(e.delta.despesas,!1),"saida","orange")}
        ${E("Saldo",`<span class="${a.saldo<0?"text-rose-700":""}">${r.brl(a.saldo)}</span>`,a.saldo<0?"gastou mais do que recebeu":"sobrou no período",y(e.delta.saldo,!0),"carteira",a.saldo<0?"rose":"emerald")}
        ${E("Taxa de poupança",a.poupanca==null?"—":`<span class="${a.poupanca<0?"text-rose-700":""}">${v(a.poupanca)}</span>`,a.aportes>0?`inclui ${r.brl(a.aportes)} investidos`:"da receita que sobrou",y(e.delta.poupanca,!0,!0),"cofrinho","emerald")}
      </div>`}function N(e){const a=[{key:"receitas",label:"Receitas",color:u().SERIES.receitas},{key:"despesas",label:"Despesas",color:u().SERIES.despesas}];return x(`
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
      </details>`)}function O(e){const a=e.reduce((t,i)=>i.saldo>t.saldo?i:t,e[0]),o=e.reduce((t,i)=>i.saldo<t.saldo?i:t,e[0]);return x(`
      ${Fin.icones.titulo("linha","emerald","Saldo acumulado")}
      <p class="text-xs text-slate-500 mb-3">Soma dos saldos mês a mês no período.</p>
      <div id="rel-saldo" class="w-full min-w-0 overflow-hidden"></div>
      ${e.length>1?`<div class="grid grid-cols-2 gap-3 mt-3 text-xs">
        <div class="bg-slate-50 rounded-xl p-2.5"><div class="text-slate-500">Melhor mês</div><div class="font-semibold text-slate-800">${r.monthShort(a.ym)} · ${r.brl(a.saldo)}</div></div>
        <div class="bg-slate-50 rounded-xl p-2.5"><div class="text-slate-500">Pior mês</div><div class="font-semibold text-slate-800">${r.monthShort(o.ym)} · ${r.brl(o.saldo)}</div></div>
      </div>`:""}`)}function U(e,a,o){const t=e.reduce((n,g)=>n+g.total,0)||1,i=Math.max(...e.map(n=>n.total),1),d=s.todas?e:e.slice(0,10),c=s.tipo==="despesa"?u().SERIES.despesas:u().SERIES.receitas,m=d.map(n=>`
      <li>
        <button data-relcat="${f(n.categoria)}" class="hbar-row w-full text-left text-sm py-1.5 rounded-lg hover:bg-slate-50 ${s.categoria===n.categoria?"bg-slate-50":""}"
                aria-expanded="${s.categoria===n.categoria}" title="${f(n.categoria)}: ${r.brl(n.total)} (${v(n.total/t)})">
          <span class="truncate text-slate-700">${n.icone?`<span aria-hidden="true">${n.icone}</span> `:""}${f(n.categoria)}</span>
          <span class="flex items-center min-w-0"><span class="h-2.5 rounded-r" style="width:${Math.max(1.5,n.total/i*100)}%;background:${c}"></span></span>
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
        ${e.length>10?`<button data-act="todas" class="mt-2 text-sm text-prim-700 font-medium hover:underline">${s.todas?"Mostrar só as 10 maiores":`Ver todas as ${e.length} categorias`}</button>`:""}`:'<p class="text-sm text-slate-500 py-3">Nada neste período.</p>'}`)}function W(e,a,o){const t=e.find(m=>m.categoria===s.categoria);if(!t)return"";const i=$().meses(a,o).length,d=e.reduce((m,n)=>m+n.total,0)||1,c=$().itens(a,o,{tipo:s.tipo,detalhar:Fin.state.detalharFaturas,categoria:t.categoria}).slice(0,8);return x(`
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="font-semibold truncate">${t.icone?`<span aria-hidden="true">${t.icone}</span> `:""}${f(t.categoria)}</h2>
          <p class="text-xs text-slate-500">${r.brl(t.total)} no período · ${v(t.total/d)} do total${i>1?` · média ${r.brl(t.total/i)}/mês`:""}</p>
        </div>
        <button data-act="fechar-cat" class="icon-btn shrink-0" aria-label="Fechar detalhe">✕</button>
      </div>
      ${i>1?'<div id="rel-cat" class="w-full min-w-0 overflow-hidden mt-3"></div>':""}
      <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide mt-4 mb-1">Maiores lançamentos</h3>
      ${c.length?`<ul class="divide-y divide-slate-100">${c.map(H).join("")}</ul>`:'<p class="text-sm text-slate-500">—</p>'}`,"ring-2 ring-emerald-100")}function H(e){return`
      <li class="flex items-center gap-3 py-2.5 cursor-pointer" ${e.tipoItem==="compra"?`data-edit-compra="${e.id}"`:`data-edit="${e.id}"`} role="button" tabindex="0">
        <span class="text-base w-6 text-center shrink-0" aria-hidden="true">${e.icone||"•"}</span>
        <div class="flex-1 min-w-0">
          <div class="text-sm truncate">${f(e.descricao)}</div>
          <div class="text-xs text-slate-500 truncate">${r.date(e.data)} · ${f(e.origem)}${e.parcela?` · ${e.parcela.atual}/${e.parcela.total}`:""}</div>
        </div>
        <span class="text-sm font-semibold tabular-nums shrink-0">${r.brl(e.valor)}</span>
      </li>`}function _(e,a){const o=Fin.state.detalharFaturas,t=$().porClassificacao(e,a,o),i=$().porForma(e,a),d=$().itens(e,a,{tipo:"despesa",detalhar:o}).slice(0,10);return`
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        ${x(`${Fin.icones.titulo("etiqueta","amber","Por classificação")}
          <p class="text-xs text-slate-500 mb-3">Despesas pelo grupo da categoria (ex.: Essencial). Ajuste em Categorias.</p>
          ${t.length?u().hbars(t.map(c=>({label:c.label,total:c.total}))):'<p class="text-sm text-slate-500">—</p>'}`)}
        ${x(`${Fin.icones.titulo("carteira","violet","Por forma de pagamento")}
          <p class="text-xs text-slate-500 mb-3">Como as despesas foram pagas (fatura do cartão conta pela forma usada para pagá-la).</p>
          ${i.length?u().hbars(i.slice(0,8).map(c=>({label:c.label,icone:c.icone,total:c.total}))):'<p class="text-sm text-slate-500">—</p>'}`)}
      </div>
      ${x(`${Fin.icones.titulo("saida","rose","Maiores despesas do período",{cls:"mb-1"})}
        ${d.length?`<ul class="divide-y divide-slate-100">${d.map(H).join("")}</ul>`:'<p class="text-sm text-slate-500 py-2">—</p>'}`)}`}function R(e,a,o){if(!e)return;let t=e.clientWidth;a();const i=new ResizeObserver(()=>requestAnimationFrame(()=>{Math.abs(e.clientWidth-t)>1&&(t=e.clientWidth,a())}));i.observe(e),o.addEventListener("abort",()=>i.disconnect())}function B(e,{signal:a}){if(!Fin.storage.hasData()){e.innerHTML=Fin.ui.emptyState("📊","Sem dados para analisar","Importe sua planilha ou crie lançamentos.",'<a href="#/dados" class="btn btn-primary">Importar planilha</a>');return}const{ini:o,fim:t}=A(),i=$().anterior(o,t),d=$().comparativo(o,t),c=$().evolucao(o,t),m=$().categoriasComparadas(o,t,s.tipo,Fin.state.detalharFaturas);s.categoria&&!m.some(l=>l.categoria===s.categoria)&&(s.categoria=null);const n={geral:()=>`
        ${D(d,c,o,t,i)}
        ${Fin.modo?.completo?.()?j(d):`
          <details class="mais-opcoes bg-white rounded-2xl shadow-sm px-4">
            <summary class="flex items-center gap-2 py-3.5 cursor-pointer min-h-[52px]">
              <span class="flex-1 text-[15px] font-semibold text-prim-700">Ver os números do período</span>
              <span class="mais-seta text-slate-400" aria-hidden="true">${Fin.icone("seta","w-5 h-5")}</span>
            </summary>
            <div class="pb-4 space-y-3">${j(d)}</div>
          </details>`}
        ${z(o,t)}`,categorias:()=>`
        ${V()}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          ${U(m,o,t)}
          <div id="rel-det-wrap">${W(m,o,t)}</div>
        </div>
        ${_(o,t)}`,evolucao:()=>`
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          ${N(c)}
          ${O(c)}
        </div>`}[s.aba]||(()=>"");e.innerHTML=`
      <div class="space-y-4">
        ${Fin.ui.filtroPessoa()}
        ${q(o,t,i)}
        ${C()}
        <div id="rel-painel" role="tabpanel" aria-labelledby="aba-${s.aba}" class="space-y-4">${n()}</div>
        <div class="flex flex-wrap items-center gap-3 justify-between bg-white rounded-2xl shadow-sm p-4">
          <p class="text-sm text-slate-600">Leve os lançamentos de ${w(o,t)} para o Excel.</p>
          <button data-act="csv" class="btn btn-ghost">⬇️ Exportar CSV</button>
        </div>
      </div>`;const g=e.querySelector("#rel-evo");R(g,()=>u().columns(g,c,{series:[{key:"receitas",label:"Receitas",color:u().SERIES.receitas},{key:"despesas",label:"Despesas",color:u().SERIES.despesas}],label:"Receitas e despesas por mês",onSelect:l=>{Fin.state.mes=l,s.preset="mes",Fin.router.render()}}),a);const S=e.querySelector("#rel-saldo");R(S,()=>u().line(S,c.map(l=>({ym:l.ym,valor:l.acumulado,extra:`Saldo do mês: ${r.brl(l.saldo)}`})),{nome:"Acumulado",label:"Saldo acumulado no período",color:u().SERIES.receitas}),a);const F=()=>{const l=e.querySelector("#rel-cat"),p=m.find(b=>b.categoria===s.categoria);if(!l||!p)return;const h=[{key:"valor",label:p.categoria,color:s.tipo==="despesa"?u().SERIES.despesas:u().SERIES.receitas}];u().columns(l,$().meses(o,t).map(b=>({ym:b,valor:p.porMes[b]||0})),{series:h,label:`Histórico de ${p.categoria}`})};R(e.querySelector("#rel-cat"),F,a),e.addEventListener("click",l=>{const p=l.target.closest("[data-aba]");if(p){s.aba=p.dataset.aba,Fin.router.refresh(),window.scrollTo(0,0);return}const h=l.target.closest("[data-rel-mover]");if(h)return Fin.state.mes=r.addMonths(Fin.state.mes,Number(h.dataset.relMover)*(s.preset==="ano"?12:$().meses(o,t).length)),Fin.router.render();const b=l.target.closest("[data-preset]");if(b&&!Fin.plano.exigir("analises",k[b.dataset.preset]))return;if(b)return s.preset=b.dataset.preset,s.preset==="custom"&&!s.ini&&Object.assign(s,{ini:o,fim:t}),Fin.router.render();const L=l.target.closest("[data-relcat]");if(L){s.categoria=s.categoria===L.dataset.relcat?null:L.dataset.relcat,Fin.router.refresh(),s.categoria&&window.innerWidth<1024&&document.getElementById("rel-det-wrap")?.scrollIntoView({behavior:"smooth",block:"start"});return}const T=l.target.closest("[data-act]")?.dataset.act;if(T==="todas"&&(s.todas=!s.todas,Fin.router.refresh()),T==="fechar-cat"&&(s.categoria=null,Fin.router.refresh()),T==="csv"){const G=new Blob([$().csv(o,t)],{type:"text/csv;charset=utf-8"}),M=document.createElement("a");M.href=URL.createObjectURL(G),M.download=`financas_${o}_a_${t}.csv`,M.click(),setTimeout(()=>URL.revokeObjectURL(M.href),1e3)}},{signal:a}),e.addEventListener("change",l=>{const p=l.target;if(p.name==="rel-tipo")return s.tipo=p.value,s.categoria=null,Fin.router.refresh();if(p.id==="rel-detalhar")return Fin.state.detalharFaturas=p.checked,Fin.router.refresh();if(p.id==="rel-ini"&&p.value)return s.ini=p.value,Fin.router.render();if(p.id==="rel-fim"&&p.value)return s.fim=p.value,Fin.router.render()},{signal:a})}return{title:"Análises",render:B,estado:s}})();
