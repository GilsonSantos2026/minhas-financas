/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.lancamentos=(()=>{const d=Fin.fmt,b=d.esc,c=Fin.finance,e={busca:"",tipo:"",status:"",categoria:"",periodo:"mes",visao:"lista",dia:null},f=()=>e.periodo!=="mes";function $(t,r){const s=new Map;for(const l of t){const g=c.dataRef(l);if(!g||g.slice(0,7)!==r)continue;const x=s.get(g)||{r:0,d:0};l.tipo==="receita"?x.r+=l.valorPrevisto??c.valor(l):x.d+=l.valorPrevisto??c.valor(l),s.set(g,x)}const[i,n]=r.split("-").map(Number),m=new Date(i,n,0).getDate(),p=(new Date(i,n-1,1).getDay()+6)%7,o=d.todayISO(),a=l=>l>=1e3?`${(l/1e3).toLocaleString("pt-BR",{maximumFractionDigits:1})} mil`:Math.round(l).toLocaleString("pt-BR"),u=[];for(let l=0;l<p;l++)u.push('<div class="cal-dia fora" aria-hidden="true"></div>');for(let l=1;l<=m;l++){const g=`${r}-${String(l).padStart(2,"0")}`,x=s.get(g),S=`${l} de ${d.monthLong(r).split(" ")[0].toLowerCase()}${x?`: ${x.r?`entra ${d.brl(x.r)}`:""}${x.r&&x.d?", ":""}${x.d?`sai ${d.brl(x.d)}`:""}`:", sem lançamentos"}`;u.push(`<button type="button" data-dia="${g}" class="cal-dia ${g===o?"hoje":""} ${e.dia===g?"sel":""}" aria-pressed="${e.dia===g}" aria-label="${b(S)}">
        <span class="n">${l}</span>
        ${x?.r?`<span class="r vlr">+${a(x.r)}</span>`:""}
        ${x?.d?`<span class="d vlr">−${a(x.d)}</span>`:""}
      </button>`)}return`
      <section class="bg-white rounded-2xl shadow-sm p-3">
        <div class="cal text-[11px] font-semibold text-slate-400 mb-1" aria-hidden="true">${["S","T","Q","Q","S","S","D"].map(l=>`<div class="text-center">${l}</div>`).join("")}</div>
        <div class="cal">${u.join("")}</div>
        <p class="text-[11px] text-slate-500 mt-2 flex flex-wrap gap-x-3"><span class="text-emerald-700">+ entra</span><span class="text-orange-700">− sai</span><span>pelo vencimento · toque no dia para ver os lançamentos</span></p>
      </section>`}function h(t){const r=Fin.parsers.normalize(e.busca);return t.filter(s=>{if(e.tipo&&s.tipo!==e.tipo||e.categoria&&s.categoria!==e.categoria)return!1;if(e.status){const i=c.statusEfetivo(s);if(e.status==="pendentes"?i==="pago":i!==e.status)return!1}return!(r&&!Fin.parsers.normalize([s.descricao,s.categoria,s.observacao,s.formaPagamento].join(" ")).includes(r))})}function w(t){const r=c.resumo(null,c.naVisao(t)),s=(i,n,m="")=>`
      <div class="bg-white rounded-2xl shadow-sm p-3 text-center min-w-0">
        <div class="text-[11px] sm:text-xs text-slate-500">${i}</div>
        <div class="text-sm sm:text-base font-semibold tabular-nums truncate ${m}">${d.brl(n)}</div>
      </div>`;return s("Receitas",r.receitas,"text-emerald-700")+s("Despesas",r.despesas,"text-rose-700")+s("Saldo",r.saldo,r.saldo<0?"text-rose-700":"")}function v(t,r=!1){const s=t.tipo==="receita",i=t.grupo&&t.parcela?t.recorrencia==="fixo"?`🔁 ${t.parcela.atual}/${t.parcela.total}`:`${t.parcela.atual}/${t.parcela.total}`:null,m=[r&&c.dataRef(t)?d.date(c.dataRef(t)).slice(0,5):null,i,t.categoria,t.formaPagamento].filter(Boolean).map(b).join(" · ");return`
      <li class="lanc-item flex items-center gap-3 px-3 sm:px-4 py-3" data-edit="${t.id}" role="button" tabindex="0"
          aria-label="Editar ${b(t.descricao||t.categoria)}">
        ${Fin.ui.catIcon(t.categoriaIcone,t.categoria,t.tipo)}
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium flex items-center gap-1.5 min-w-0">${Fin.ui.autorMini(t)}<span class="truncate">${b(t.descricao||t.categoria)}</span></div>
          <div class="text-xs text-slate-500 truncate">${m}</div>
        </div>
        <div class="text-right shrink-0 flex flex-col items-end gap-0.5">
          <div class="text-sm font-semibold tabular-nums ${s?"text-emerald-700":"text-slate-800"}" title="Valor lançado">${s?"+":"−"} ${d.brl(t.valorPrevisto??c.valor(t))}</div>
          ${Fin.ui.pagamentoLinha(t)}
          <div class="mt-0.5">${Fin.ui.statusPill(t)}</div>
        </div>
      </li>`}function y(t){const r=new Map;[...t].sort((i,n)=>c.competencia(i).localeCompare(c.competencia(n))||(c.dataRef(i)||"").localeCompare(c.dataRef(n)||"")).forEach(i=>{const n=c.competencia(i);r.has(n)||r.set(n,[]),r.get(n).push(i)});const s=d.currentYM();return[...r.entries()].map(([i,n])=>{const m=n.filter(o=>o.tipo==="despesa").reduce((o,a)=>o+(a.valorPrevisto??c.valor(a)),0),p=n.filter(o=>o.tipo==="receita").reduce((o,a)=>o+(a.valorPrevisto??c.valor(a)),0);return`
      <section data-mes="${i}">
        <h3 class="text-xs font-medium uppercase tracking-wide mb-1.5 px-1 flex flex-wrap items-center gap-x-2 ${i===s?"text-blue-700":"text-slate-500"}">
          <span>${d.monthLong(i)}${i===s?" · mês atual":""}</span>
          <span class="ml-auto normal-case tracking-normal text-[11px] font-normal text-slate-500">${n.length} ${n.length===1?"lançamento":"lançamentos"}
            ${m?` · desp. ${d.brl(m)}`:""}${p?` · rec. ${d.brl(p)}`:""}</span>
        </h3>
        <ul class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">${n.map(o=>v(o,!0)).join("")}</ul>
      </section>`}).join("")}function F(t,r){const s=Fin.periodo.meses(e.periodo,Fin.state.mes,r);if(s.length<2)return"";const i=new Map;t.forEach(o=>{const a=c.competencia(o),u=i.get(a)||{qtd:0,total:0};u.qtd++,u.total+=o.valorPrevisto??c.valor(o),i.set(a,u)});const n=s.filter(o=>!i.has(o)),m=d.currentYM(),p=s.map(o=>{const a=i.get(o);return a?`<button data-ir-mes="${o}" class="rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-left hover:bg-emerald-100 ${o===m?"ring-2 ring-blue-400":""}" title="${d.monthLong(o)}: ${a.qtd} lançamento(s)">
            <div class="text-[11px] text-emerald-800 font-semibold">✓ ${d.monthShort(o)}</div>
            <div class="text-[11px] tabular-nums text-slate-700">${d.brl(a.total)}</div>
            ${a.qtd>1?`<div class="text-[10px] text-amber-800">${a.qtd} lançamentos</div>`:""}
          </button>`:`<button data-ir-mes="${o}" class="rounded-xl border border-dashed border-amber-400 bg-amber-50 px-2 py-1.5 text-left hover:bg-amber-100 ${o===m?"ring-2 ring-blue-400":""}" title="${d.monthLong(o)}: sem lançamento">
            <div class="text-[11px] text-amber-900 font-semibold">! ${d.monthShort(o)}</div>
            <div class="text-[11px] text-amber-800">sem lançamento</div>
          </button>`}).join("");return`
      <section class="bg-white rounded-2xl shadow-sm p-4">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          ${Fin.icones.titulo("calendario","blue","Conferência mês a mês")}
          <span class="text-xs ${n.length?"text-amber-800 font-medium":"text-emerald-800"}">
            ${n.length?`! ${n.length} de ${s.length} meses sem lançamento`:`✓ presente nos ${s.length} meses`}</span>
        </div>
        <p class="text-xs text-slate-500 mt-0.5 mb-3">“${b(e.busca||e.categoria)}” · ${Fin.periodo.rotulo(e.periodo,Fin.state.mes).toLowerCase()} · toque num mês para abri-lo.</p>
        <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">${p}</div>
      </section>`}function q(t){if(!t.length){const s=e.busca||e.tipo||e.status||e.categoria;return Fin.ui.emptyState("🔎",s?"Nada encontrado":f()?"Nenhum lançamento no período":"Nenhum lançamento neste mês",s?"Tente mudar a busca, o período ou os filtros.":"Use o botão “＋” para adicionar.",s?'<button data-limpar class="btn btn-ghost">Limpar filtros</button>':"")}if(f())return y(t);const r=new Map;return[...t].sort((s,i)=>(c.dataRef(s)||"").localeCompare(c.dataRef(i)||"")||(s.descricao||"").localeCompare(i.descricao||"")).forEach(s=>{const i=c.dataRef(s)||"";r.has(i)||r.set(i,[]),r.get(i).push(s)}),[...r.entries()].map(([s,i])=>{const n=L(s);return`
      <section class="${n.secao}"${n.hoje?" data-hoje":""}>
        <h3 class="text-xs font-medium uppercase tracking-wide mb-1.5 flex items-center gap-2 ${n.titulo}">
          ${n.icone?`<span aria-hidden="true">${n.icone}</span>`:""}<span>${d.dayLabel(s)}</span>
          ${n.etiqueta?`<span class="ml-auto normal-case tracking-normal text-[11px] px-2 py-0.5 rounded-full ${n.etiquetaCls}">${n.etiqueta}</span>`:""}
        </h3>
        <ul class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden ${n.lista}">${i.map(v).join("")}</ul>
      </section>`}).join("")}function L(t){const r={secao:"",titulo:"text-slate-500 px-1",lista:"",icone:"",etiqueta:"",etiquetaCls:"",hoje:!1};if(!t)return r;const[s,i,n]=t.split("-").map(Number),m=new Date,p=new Date(m.getFullYear(),m.getMonth(),m.getDate()),o=Math.round((new Date(s,i-1,n)-p)/864e5);return o===0?{...r,hoje:!0,icone:"📅",titulo:"text-[13px] text-white bg-blue-600 rounded-lg px-3 py-2 shadow-sm",lista:"ring-2 ring-blue-500",etiqueta:"Hoje",etiquetaCls:"font-semibold bg-white text-blue-700"}:o===-1?{...r,icone:"⚠️",titulo:"text-rose-700 bg-rose-50 border-l-4 border-rose-600 px-3 py-1.5",lista:"ring-1 ring-rose-200",etiqueta:"Ontem",etiquetaCls:"font-semibold bg-rose-600 text-white"}:o===1?{...r,icone:"⏰",titulo:"text-amber-800 bg-amber-50 border-l-4 border-amber-500 px-3 py-1.5",etiqueta:"Amanhã",etiquetaCls:"font-semibold bg-amber-500 text-white"}:o<-1?{...r,secao:"opacity-60",titulo:"text-slate-400 px-1"}:{...r,etiqueta:`em ${o} dias`,etiquetaCls:"text-slate-400 font-normal"}}function M(t,{signal:r}){const s=Fin.state.mes,i=c.todos().filter(a=>c.daPessoa(a)),n=f()?Fin.periodo.filtrar(i,e.periodo,s):c.doMes(s,i),m=[...new Set(n.map(a=>a.categoria))].sort((a,u)=>a.localeCompare(u,"pt-BR"));e.categoria&&!m.includes(e.categoria)&&(e.categoria="");const p=(a,u,l)=>`<option value="${b(a)}" ${a===l?"selected":""}>${b(u)}</option>`;t.innerHTML=`
      <div class="space-y-4">
        ${Fin.ui.filtroPessoa()}
        ${f()?`<div class="barra-mes hero-topo text-white rounded-2xl shadow-sm px-4 py-3 flex items-center justify-between gap-3">
               <div><div class="font-semibold">${Fin.periodo.rotulo(e.periodo,s)}</div>
               <div class="hero-rotulo text-[11px] font-semibold uppercase tracking-wider text-white/75">pelo mês de competência</div></div>
               <button data-periodo="mes" class="text-xs font-semibold text-white bg-white/15 hover:bg-white/25 rounded-full px-3 py-1.5 shrink-0">Ver por mês</button>
             </div>`:Fin.ui.monthNav(s)}
        <div id="lanc-resumo" class="grid grid-cols-3 gap-2"></div>
        ${f()?"":`<a href="#/conciliacao" class="flex items-center justify-between bg-white rounded-2xl shadow-sm px-4 py-2.5 text-sm hover:bg-slate-50">
          <span><span aria-hidden="true">⚖️</span> Conciliar lançado × pago do mês</span><span class="text-slate-300" aria-hidden="true">›</span></a>`}

        <div class="bg-white rounded-2xl shadow-sm p-3 space-y-2">
          <div class="flex items-center gap-2">
            <div class="chips flex gap-2 overflow-x-auto pb-1 flex-1 min-w-0" role="group" aria-label="Período da busca">
              ${Fin.periodo.chips(e.periodo)}
            </div>
            ${f()?"":`<div class="seg seg-neutro !grid-cols-2 shrink-0 !p-0.5" role="group" aria-label="Ver como">
              <label><input type="radio" name="visao" value="lista" ${e.visao!=="calendario"?"checked":""}><span class="!py-1 !px-2 inline-flex items-center gap-1" title="Lista">${Fin.icone("lista","w-4 h-4")}<span class="sr-only sm:not-sr-only">Lista</span></span></label>
              <label><input type="radio" name="visao" value="calendario" ${e.visao==="calendario"?"checked":""}><span class="!py-1 !px-2 inline-flex items-center gap-1" title="Calendário">${Fin.icone("calendario","w-4 h-4")}<span class="sr-only sm:not-sr-only">Calendário</span></span></label>
            </div>`}
          </div>
          <input id="f-busca" type="search" class="input" placeholder="${f()?"Buscar em todo o período (ex.: aluguel)…":"Buscar descrição, categoria, observação…"}"
                 value="${b(e.busca)}" aria-label="Buscar lançamentos" />
          <div class="grid grid-cols-3 gap-2">
            <select id="f-tipo" class="input" aria-label="Filtrar por tipo">
              ${p("","Todos os tipos",e.tipo)}${p("receita","Receitas",e.tipo)}${p("despesa","Despesas",e.tipo)}
            </select>
            <select id="f-status" class="input" aria-label="Filtrar por status">
              ${p("","Todos status",e.status)}${p("pendentes","Pendentes",e.status)}${p("pago","Pagos",e.status)}${p("atrasado","Atrasados",e.status)}${p("parcial","Parciais",e.status)}
            </select>
            <select id="f-categoria" class="input" aria-label="Filtrar por categoria">
              ${p("","Categorias",e.categoria)}${m.map(a=>p(a,a,e.categoria)).join("")}
            </select>
          </div>
        </div>

        <div id="lanc-cobertura"></div>
        <div id="lanc-cal"></div>
        <div id="lanc-dia"></div>
        <div id="lanc-lista" class="space-y-4"></div>
        <p id="lanc-contagem" class="text-center text-xs text-slate-400"></p>
      </div>`,e.dia&&(f()||e.dia.slice(0,7)!==s||e.visao!=="calendario")&&(e.dia=null);const o=()=>{const a=h(n),u=!f()&&e.visao==="calendario",l=u&&e.dia?a.filter(g=>c.dataRef(g)===e.dia):a;t.querySelector("#lanc-resumo").innerHTML=w(a),t.querySelector("#lanc-cobertura").innerHTML=f()&&(e.busca.trim()||e.categoria)?F(a,i):"",t.querySelector("#lanc-cal").innerHTML=u?$(a,s):"",t.querySelector("#lanc-dia").innerHTML=u&&e.dia?`
        <div class="flex items-center justify-between gap-2 text-sm px-1">
          <span>Mostrando <b>${d.date(e.dia)}</b> · ${l.length} ${l.length===1?"lançamento":"lançamentos"}</span>
          <button data-dia-limpar class="text-prim-700 font-medium hover:underline">Ver o mês todo</button>
        </div>`:"",t.querySelector("#lanc-lista").innerHTML=q(l),t.querySelector("#lanc-contagem").textContent=l.length?`${l.length} de ${n.length} lançamentos`:""};t.querySelector("#f-busca").addEventListener("input",a=>{e.busca=a.target.value,o()}),t.querySelector("#f-tipo").addEventListener("change",a=>{e.tipo=a.target.value,o()}),t.querySelector("#f-status").addEventListener("change",a=>{e.status=a.target.value,o()}),t.querySelector("#f-categoria").addEventListener("change",a=>{e.categoria=a.target.value,o()}),t.addEventListener("change",a=>{a.target.name==="visao"&&(e.visao=a.target.value,e.dia=null,o())},{signal:r}),t.addEventListener("click",a=>{const u=a.target.closest("[data-dia]");if(u){e.dia=e.dia===u.dataset.dia?null:u.dataset.dia,o(),e.dia&&t.querySelector("#lanc-dia")?.scrollIntoView({block:"nearest",behavior:"smooth"});return}if(a.target.closest("[data-dia-limpar]")){e.dia=null,o();return}if(a.target.closest("[data-limpar]")){Object.assign(e,{busca:"",tipo:"",status:"",categoria:""}),Fin.router.render();return}const l=a.target.closest("[data-periodo]");if(l){e.periodo=l.dataset.periodo,Fin.router.render(),setTimeout(()=>t.querySelector("#f-busca")?.focus(),0);return}const g=a.target.closest("[data-ir-mes]");g&&(Fin.state.mes=g.dataset.irMes,e.periodo="mes",Fin.router.render(),window.scrollTo(0,0))},{signal:r}),o()}return{title:"Lançamentos",filtros:e,render:M}})();
