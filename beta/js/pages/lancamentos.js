/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.lancamentos=(()=>{const m=Fin.fmt,g=m.esc,p=Fin.finance,t={busca:"",tipo:"",status:"",categoria:"",periodo:"mes",visao:"lista",dia:null},f=()=>t.periodo!=="mes";function y(e,s){const a=new Map;for(const o of e){const d=p.dataRef(o);if(!d||d.slice(0,7)!==s)continue;const c=a.get(d)||{r:0,d:0};o.tipo==="receita"?c.r+=o.valorPrevisto??p.valor(o):c.d+=o.valorPrevisto??p.valor(o),a.set(d,c)}const[i,l]=s.split("-").map(Number),u=new Date(i,l,0).getDate(),b=(new Date(i,l-1,1).getDay()+6)%7,n=m.todayISO(),r=o=>o>=1e3?`${(o/1e3).toLocaleString("pt-BR",{maximumFractionDigits:1})} mil`:Math.round(o).toLocaleString("pt-BR"),x=[];for(let o=0;o<b;o++)x.push('<div class="cal-dia fora" aria-hidden="true"></div>');for(let o=1;o<=u;o++){const d=`${s}-${String(o).padStart(2,"0")}`,c=a.get(d),v=`${o} de ${m.monthLong(s).split(" ")[0].toLowerCase()}${c?`: ${c.r?`entra ${m.brl(c.r)}`:""}${c.r&&c.d?", ":""}${c.d?`sai ${m.brl(c.d)}`:""}`:", sem lançamentos"}`;x.push(`<button type="button" data-dia="${d}" class="cal-dia ${d===n?"hoje":""} ${t.dia===d?"sel":""}" aria-pressed="${t.dia===d}" aria-label="${g(v)}">
        <span class="n">${o}</span>
        ${c?.r?`<span class="r vlr">+${r(c.r)}</span>`:""}
        ${c?.d?`<span class="d vlr">−${r(c.d)}</span>`:""}
      </button>`)}return`
      <section class="bg-white rounded-2xl shadow-sm p-3">
        <div class="cal text-[11px] font-semibold text-slate-400 mb-1" aria-hidden="true">${["S","T","Q","Q","S","S","D"].map(o=>`<div class="text-center">${o}</div>`).join("")}</div>
        <div class="cal">${x.join("")}</div>
        <p class="text-[11px] text-slate-500 mt-2 flex flex-wrap gap-x-3"><span class="text-emerald-700">+ entra</span><span class="text-orange-700">− sai</span><span>pelo vencimento · toque no dia para ver os lançamentos</span></p>
      </section>`}function h(e){const s=Fin.parsers.normalize(t.busca);return e.filter(a=>{if(t.tipo&&a.tipo!==t.tipo||t.categoria&&a.categoria!==t.categoria)return!1;if(t.status){const i=p.statusEfetivo(a);if(t.status==="pendentes"?i==="pago":i!==t.status)return!1}return!(s&&!Fin.parsers.normalize([a.descricao,a.categoria,a.observacao,a.formaPagamento].join(" ")).includes(s))})}function F(e){const s=p.resumo(null,p.naVisao(e));return`
      <div class="bg-white rounded-2xl shadow-sm px-3 py-2.5 grid grid-cols-3 divide-x divide-slate-100 text-center">
        <div class="min-w-0 px-1"><div class="text-xs text-slate-500">Entrou</div><div class="text-sm font-semibold tabular-nums truncate text-emerald-700">${m.brl(s.receitas)}</div></div>
        <div class="min-w-0 px-1"><div class="text-xs text-slate-500">Saiu</div><div class="text-sm font-semibold tabular-nums truncate text-rose-700">${m.brl(s.despesas)}</div></div>
        <div class="min-w-0 px-1"><div class="text-xs text-slate-500">Saldo</div><div class="text-sm font-semibold tabular-nums truncate ${s.saldo<0?"text-rose-700":"text-slate-800"}">${m.brl(s.saldo)}</div></div>
      </div>`}const L={receita:"Receitas",despesa:"Despesas"},$={pendentes:"A pagar / a receber",pago:"Pagos",atrasado:"Atrasados",parcial:"Parciais"},M=()=>[t.periodo!=="mes",t.tipo,t.status,t.categoria].filter(Boolean).length;function q(){const e=(a,i)=>`<button type="button" data-tirar="${a}" class="chip !py-1 !text-xs border border-prim-200 bg-prim-50 text-prim-800 inline-flex items-center gap-1" aria-label="Tirar filtro ${g(i)}">${g(i)} <span aria-hidden="true">✕</span></button>`,s=[t.periodo!=="mes"?e("periodo",Fin.periodo.OPCOES.find(([a])=>a===t.periodo)?.[1]||t.periodo):"",t.tipo?e("tipo",L[t.tipo]):"",t.status?e("status",$[t.status]):"",t.categoria?e("categoria",t.categoria):""].filter(Boolean);return s.length?`${s.join("")}<button type="button" data-limpar class="text-xs font-medium text-prim-700 hover:underline px-1">Limpar</button>`:""}function S(e){const s={periodo:t.periodo,tipo:t.tipo,status:t.status,categoria:t.categoria},a=Fin.state.mes,i=o=>o!=="mes"?Fin.periodo.filtrar(e,o,a):p.doMes(a,e),l=()=>{const o={...t};Object.assign(t,s);const d=h(i(s.periodo)).length;return Object.assign(t,o),d},u=(o,d,c)=>`<button type="button" class="chip-op" data-f="${o}" data-v="${g(d)}" aria-pressed="${s[o]===d}">${g(c)}</button>`,b=(o,d)=>`<div><p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">${o}</p><div class="flex flex-wrap gap-2">${d}</div></div>`,n=()=>{const o=[...new Set(i(s.periodo).map(c=>c.categoria))].sort((c,v)=>c.localeCompare(v,"pt-BR"));s.categoria&&!o.includes(s.categoria)&&(s.categoria="");const d=l();return`
        <div class="px-5 py-4 space-y-4">
          ${b("Período",Fin.periodo.OPCOES.map(([c,v])=>u("periodo",c,v)).join(""))}
          ${b("Tipo",u("tipo","","Todos")+u("tipo","despesa","Despesas")+u("tipo","receita","Receitas"))}
          ${b("Situação",u("status","","Todas")+Object.entries($).map(([c,v])=>u("status",c,v)).join(""))}
          ${b("Categoria",u("categoria","","Todas")+o.map(c=>u("categoria",c,c)).join(""))}
        </div>
        <div class="px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white grid gap-2">
          <button type="button" data-ver class="btn btn-primary w-full min-h-[48px]">${d?`Ver ${d} ${d===1?"lançamento":"lançamentos"}`:"Nenhum lançamento com esses filtros"}</button>
          <button type="button" data-zerar class="btn btn-ghost w-full">Limpar filtros</button>
        </div>`},r=Fin.ui.openModal(`
      <div id="folha-filtros">
        <div data-arrastar class="flex items-center justify-between gap-2 px-5 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 class="font-semibold text-lg">Filtros</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <div data-corpo>${n()}</div>
      </div>`,"Filtros");r.querySelector("[data-close]").addEventListener("click",Fin.ui.closeModal);const x=r.querySelector("[data-corpo]");x.addEventListener("click",o=>{const d=o.target.closest("[data-f]");if(d){s[d.dataset.f]=d.dataset.v,x.innerHTML=n();return}if(o.target.closest("[data-zerar]")){Object.assign(s,{periodo:"mes",tipo:"",status:"",categoria:""}),x.innerHTML=n();return}o.target.closest("[data-ver]")&&(Object.assign(t,s,{dia:null}),Fin.ui.closeModal(),Fin.router.render())})}function w(e,s=!1){const a=e.tipo==="receita",i=e.grupo&&e.parcela?e.recorrencia==="fixo"?`🔁 ${e.parcela.atual}/${e.parcela.total}`:`${e.parcela.atual}/${e.parcela.total}`:null,u=[s&&p.dataRef(e)?m.date(p.dataRef(e)).slice(0,5):null,i,e.descricao&&e.descricao!==e.categoria?e.categoria:null].filter(Boolean).map(g).join(" · "),b=["parcial","maior","menor"].includes(p.conciliar(e).situacao)?Fin.ui.pagamentoLinha(e):"";return`
      <li class="lanc-item flex items-center gap-3 px-3 sm:px-4 py-3" data-edit="${e.id}" role="button" tabindex="0"
          aria-label="Editar ${g(e.descricao||e.categoria)}">
        ${Fin.ui.catIcon(e.categoriaIcone,e.categoria,e.tipo)}
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium flex items-center gap-1.5 min-w-0">${Fin.ui.autorMini(e)}<span class="truncate">${g(e.descricao||e.categoria)}</span></div>
          ${u?`<div class="text-xs text-slate-500 truncate">${u}</div>`:""}
        </div>
        <div class="text-right shrink-0 flex flex-col items-end gap-0.5">
          <div class="text-sm font-semibold tabular-nums ${a?"text-emerald-700":"text-slate-800"}" title="Valor lançado">${a?"+":"−"} ${m.brl(e.valorPrevisto??p.valor(e))}</div>
          ${b}
          <div class="mt-0.5">${Fin.ui.statusPill(e)}</div>
        </div>
      </li>`}function j(e){const s=new Map;[...e].sort((i,l)=>p.competencia(i).localeCompare(p.competencia(l))||(p.dataRef(i)||"").localeCompare(p.dataRef(l)||"")).forEach(i=>{const l=p.competencia(i);s.has(l)||s.set(l,[]),s.get(l).push(i)});const a=m.currentYM();return[...s.entries()].map(([i,l])=>{const u=l.filter(n=>n.tipo==="despesa").reduce((n,r)=>n+(r.valorPrevisto??p.valor(r)),0),b=l.filter(n=>n.tipo==="receita").reduce((n,r)=>n+(r.valorPrevisto??p.valor(r)),0);return`
      <section data-mes="${i}">
        <h3 class="text-xs font-medium uppercase tracking-wide mb-1.5 px-1 flex flex-wrap items-center gap-x-2 ${i===a?"text-blue-700":"text-slate-500"}">
          <span>${m.monthLong(i)}${i===a?" · mês atual":""}</span>
          <span class="ml-auto normal-case tracking-normal text-[11px] font-normal text-slate-500">${l.length} ${l.length===1?"lançamento":"lançamentos"}
            ${u?` · desp. ${m.brl(u)}`:""}${b?` · rec. ${m.brl(b)}`:""}</span>
        </h3>
        <ul class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">${l.map(n=>w(n,!0)).join("")}</ul>
      </section>`}).join("")}function T(e,s){const a=Fin.periodo.meses(t.periodo,Fin.state.mes,s);if(a.length<2)return"";const i=new Map;e.forEach(n=>{const r=p.competencia(n),x=i.get(r)||{qtd:0,total:0};x.qtd++,x.total+=n.valorPrevisto??p.valor(n),i.set(r,x)});const l=a.filter(n=>!i.has(n)),u=m.currentYM(),b=a.map(n=>{const r=i.get(n);return r?`<button data-ir-mes="${n}" class="rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-left hover:bg-emerald-100 ${n===u?"ring-2 ring-blue-400":""}" title="${m.monthLong(n)}: ${r.qtd} lançamento(s)">
            <div class="text-[11px] text-emerald-800 font-semibold">✓ ${m.monthShort(n)}</div>
            <div class="text-[11px] tabular-nums text-slate-700">${m.brl(r.total)}</div>
            ${r.qtd>1?`<div class="text-[10px] text-amber-800">${r.qtd} lançamentos</div>`:""}
          </button>`:`<button data-ir-mes="${n}" class="rounded-xl border border-dashed border-amber-400 bg-amber-50 px-2 py-1.5 text-left hover:bg-amber-100 ${n===u?"ring-2 ring-blue-400":""}" title="${m.monthLong(n)}: sem lançamento">
            <div class="text-[11px] text-amber-900 font-semibold">! ${m.monthShort(n)}</div>
            <div class="text-[11px] text-amber-800">sem lançamento</div>
          </button>`}).join("");return`
      <section class="bg-white rounded-2xl shadow-sm p-4">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          ${Fin.icones.titulo("calendario","blue","Conferência mês a mês")}
          <span class="text-xs ${l.length?"text-amber-800 font-medium":"text-emerald-800"}">
            ${l.length?`! ${l.length} de ${a.length} meses sem lançamento`:`✓ presente nos ${a.length} meses`}</span>
        </div>
        <p class="text-xs text-slate-500 mt-0.5 mb-3">“${g(t.busca||t.categoria)}” · ${Fin.periodo.rotulo(t.periodo,Fin.state.mes).toLowerCase()} · toque num mês para abri-lo.</p>
        <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">${b}</div>
      </section>`}function k(e){if(!e.length){const a=t.busca||t.tipo||t.status||t.categoria;return Fin.ui.emptyState("🔎",a?"Nada encontrado":f()?"Nenhum lançamento no período":"Nenhum lançamento neste mês",a?"Tente mudar a busca, o período ou os filtros.":"Use o botão “＋” para adicionar.",a?'<button data-limpar class="btn btn-ghost">Limpar filtros</button>':"")}if(f())return j(e);const s=new Map;return[...e].sort((a,i)=>(p.dataRef(a)||"").localeCompare(p.dataRef(i)||"")||(a.descricao||"").localeCompare(i.descricao||"")).forEach(a=>{const i=p.dataRef(a)||"";s.has(i)||s.set(i,[]),s.get(i).push(a)}),[...s.entries()].map(([a,i])=>{const l=C(a);return`
      <section class="${l.secao}"${l.hoje?" data-hoje":""}>
        <h3 class="text-xs font-medium uppercase tracking-wide mb-1.5 flex items-center gap-2 ${l.titulo}">
          ${l.icone?`<span aria-hidden="true">${l.icone}</span>`:""}<span>${m.dayLabel(a)}</span>
          ${l.etiqueta?`<span class="ml-auto normal-case tracking-normal text-[11px] px-2 py-0.5 rounded-full ${l.etiquetaCls}">${l.etiqueta}</span>`:""}
        </h3>
        <ul class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden ${l.lista}">${i.map(u=>w(u)).join("")}</ul>
      </section>`}).join("")}function C(e){const s={secao:"",titulo:"text-slate-500 px-1",lista:"",icone:"",etiqueta:"",etiquetaCls:"",hoje:!1};if(!e)return s;const[a,i,l]=e.split("-").map(Number),u=new Date,b=new Date(u.getFullYear(),u.getMonth(),u.getDate()),n=Math.round((new Date(a,i-1,l)-b)/864e5);return n===0?{...s,hoje:!0,icone:"📅",titulo:"text-[13px] text-white bg-blue-600 rounded-lg px-3 py-2 shadow-sm",lista:"ring-2 ring-blue-500",etiqueta:"Hoje",etiquetaCls:"font-semibold bg-white text-blue-700"}:n===-1?{...s,icone:"⚠️",titulo:"text-rose-700 bg-rose-50 border-l-4 border-rose-600 px-3 py-1.5",lista:"ring-1 ring-rose-200",etiqueta:"Ontem",etiquetaCls:"font-semibold bg-rose-600 text-white"}:n===1?{...s,icone:"⏰",titulo:"text-amber-800 bg-amber-50 border-l-4 border-amber-500 px-3 py-1.5",etiqueta:"Amanhã",etiquetaCls:"font-semibold bg-amber-500 text-white"}:n<-1?{...s,secao:"opacity-60",titulo:"text-slate-400 px-1"}:{...s,etiqueta:`em ${n} dias`,etiquetaCls:"text-slate-400 font-normal"}}function P(e,{signal:s}){const a=Fin.state.mes,i=p.todos().filter(r=>p.daPessoa(r)),l=f()?Fin.periodo.filtrar(i,t.periodo,a):p.doMes(a,i),u=[...new Set(l.map(r=>r.categoria))];t.categoria&&!u.includes(t.categoria)&&(t.categoria="");const b=M();e.innerHTML=`
      <div class="space-y-3">
        ${Fin.ui.filtroPessoa()}
        ${f()?`<div class="barra-mes hero-topo text-white rounded-2xl shadow-sm px-4 py-3 flex items-center justify-between gap-3">
               <div><div class="font-semibold">${Fin.periodo.rotulo(t.periodo,a)}</div>
               <div class="hero-rotulo text-[11px] font-semibold uppercase tracking-wider text-white/75">pelo mês de competência</div></div>
               <button data-periodo="mes" class="text-xs font-semibold text-white bg-white/15 hover:bg-white/25 rounded-full px-3 py-1.5 shrink-0">Ver por mês</button>
             </div>`:Fin.ui.monthNav(a)}
        <div id="lanc-resumo"></div>

        <!-- Redesign v2026-11-18.4: busca + um botão "Filtros" (folha) + lista/calendário.
             Conciliar foi para Mais → Ferramentas ("Conferir com o extrato"). -->
        <div class="flex items-center gap-2">
          <label class="relative flex-1 min-w-0">
            <span class="sr-only">Buscar lançamentos</span>
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true">${Fin.icone("lupa","w-[18px] h-[18px]")}</span>
            <input id="f-busca" type="search" class="input !pl-10 min-h-[44px]" placeholder="${f()?"Buscar no período (ex.: aluguel)":"Buscar lançamento"}" value="${g(t.busca)}" />
          </label>
          <button type="button" data-abrir-filtros class="relative shrink-0 inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl bg-white shadow-sm text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  aria-label="Filtros${b?` (${b} ligado${b>1?"s":""})`:""}">
            ${Fin.icone("filtro","w-5 h-5")}<span class="hidden sm:inline">Filtros</span>
            ${b?`<span class="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-prim-700 text-white text-[11px] font-bold grid place-items-center" aria-hidden="true">${b}</span>`:""}
          </button>
          ${f()?"":`<div class="seg seg-neutro !grid-cols-2 shrink-0 !p-0.5" role="group" aria-label="Ver como">
            <label><input type="radio" name="visao" value="lista" ${t.visao!=="calendario"?"checked":""}><span class="!py-2 !px-2.5 inline-flex items-center" title="Lista">${Fin.icone("lista","w-[18px] h-[18px]")}<span class="sr-only">Lista</span></span></label>
            <label><input type="radio" name="visao" value="calendario" ${t.visao==="calendario"?"checked":""}><span class="!py-2 !px-2.5 inline-flex items-center" title="Calendário">${Fin.icone("calendario","w-[18px] h-[18px]")}<span class="sr-only">Calendário</span></span></label>
          </div>`}
        </div>
        ${b?`<div class="flex flex-wrap items-center gap-2" aria-label="Filtros ligados">${q()}</div>`:""}

        <div id="lanc-cobertura"></div>
        <div id="lanc-cal"></div>
        <div id="lanc-dia"></div>
        <div id="lanc-lista" class="space-y-4"></div>
        <p id="lanc-contagem" class="text-center text-xs text-slate-400"></p>
      </div>`,t.dia&&(f()||t.dia.slice(0,7)!==a||t.visao!=="calendario")&&(t.dia=null);const n=()=>{const r=h(l),x=!f()&&t.visao==="calendario",o=x&&t.dia?r.filter(d=>p.dataRef(d)===t.dia):r;e.querySelector("#lanc-resumo").innerHTML=F(r),e.querySelector("#lanc-cobertura").innerHTML=f()&&(t.busca.trim()||t.categoria)?T(r,i):"",e.querySelector("#lanc-cal").innerHTML=x?y(r,a):"",e.querySelector("#lanc-dia").innerHTML=x&&t.dia?`
        <div class="flex items-center justify-between gap-2 text-sm px-1">
          <span>Mostrando <b>${m.date(t.dia)}</b> · ${o.length} ${o.length===1?"lançamento":"lançamentos"}</span>
          <button data-dia-limpar class="text-prim-700 font-medium hover:underline">Ver o mês todo</button>
        </div>`:"",e.querySelector("#lanc-lista").innerHTML=k(o),e.querySelector("#lanc-contagem").textContent=o.length?`${o.length} de ${l.length} lançamentos`:""};e.querySelector("#f-busca").addEventListener("input",r=>{t.busca=r.target.value,n()}),e.querySelector("[data-abrir-filtros]").addEventListener("click",()=>S(i)),e.addEventListener("change",r=>{r.target.name==="visao"&&(t.visao=r.target.value,t.dia=null,n())},{signal:s}),e.addEventListener("click",r=>{const x=r.target.closest("[data-dia]");if(x){t.dia=t.dia===x.dataset.dia?null:x.dataset.dia,n(),t.dia&&e.querySelector("#lanc-dia")?.scrollIntoView({block:"nearest",behavior:"smooth"});return}if(r.target.closest("[data-dia-limpar]")){t.dia=null,n();return}const o=r.target.closest("[data-tirar]");if(o){t[o.dataset.tirar]=o.dataset.tirar==="periodo"?"mes":"",Fin.router.render();return}if(r.target.closest("[data-limpar]")){Object.assign(t,{busca:"",tipo:"",status:"",categoria:"",periodo:"mes"}),Fin.router.render();return}const d=r.target.closest("[data-periodo]");if(d){t.periodo=d.dataset.periodo,Fin.router.render(),setTimeout(()=>e.querySelector("#f-busca")?.focus(),0);return}const c=r.target.closest("[data-ir-mes]");c&&(Fin.state.mes=c.dataset.irMes,t.periodo="mes",Fin.router.render(),window.scrollTo(0,0))},{signal:s}),n()}return{title:"Lançamentos",filtros:t,render:P}})();
