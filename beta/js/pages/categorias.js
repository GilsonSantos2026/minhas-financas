/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.categorias=(()=>{const v=Fin.fmt,d=v.esc,b=Fin.finance;let h="despesa";function q(r,{signal:o}){const p=b.categorias(h),e=new Map;p.forEach(a=>{const n=a.classificacao||"Sem classificação";e.has(n)||e.set(n,[]),e.get(n).push(a)}),r.innerHTML=`
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="seg flex-1 max-w-xs" role="tablist" aria-label="Tipo de categoria">
            <label><input type="radio" name="cat-tipo" value="despesa" ${h==="despesa"?"checked":""}><span>Despesas</span></label>
            <label><input type="radio" name="cat-tipo" value="receita" ${h==="receita"?"checked":""}><span>Receitas</span></label>
          </div>
          <button data-act="nova" class="btn btn-primary ml-auto">＋ Nova</button>
        </div>
        ${p.length?'<p class="text-xs text-slate-500 px-1 -mt-1">Toque no <b>ícone</b> para ver os lançamentos da categoria; toque no resto da linha para editar nome, ícone, classificação ou orçamento.</p>':""}

        ${p.length?[...e.entries()].sort((a,n)=>a[0].localeCompare(n[0],"pt-BR")).map(([a,n])=>`
          <section>
            <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide px-1 mb-1.5">${d(a)}</h3>
            <ul class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
              ${n.map(s=>{const y=b.usosCategoria(s.nome,s.tipo).total;return`
                <li class="lanc-item flex items-center gap-3 px-3 sm:px-4 py-3" data-cat="${s.id}" role="button" tabindex="0" aria-label="Editar ${d(s.nome)}">
                  <button type="button" data-ver-cat="${s.id}" class="rounded-full shrink-0 hover:ring-2 hover:ring-prim-200 focus-visible:ring-2 focus-visible:ring-prim-500 transition" title="Ver os lançamentos de ${d(s.nome)}" aria-label="Ver os lançamentos de ${d(s.nome)}">
                    ${Fin.ui.catIcon(s.icone,s.nome,s.tipo)}</button>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium truncate">${d(s.nome)}</div>
                    <div class="text-xs text-slate-500">${y} ${y===1?"registro":"registros"}</div>
                  </div>
                  ${s.orcamentoMensal>0?`<div class="text-right text-xs text-slate-500 shrink-0">orçamento<div class="text-sm font-semibold text-slate-700 tabular-nums">${v.brl(s.orcamentoMensal)}</div></div>`:""}
                  <span class="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-prim-700 bg-prim-50 rounded-full px-2.5 py-1" aria-hidden="true">✎ Editar</span>
                </li>`}).join("")}
            </ul>
          </section>`).join(""):Fin.ui.emptyState("🏷️","Nenhuma categoria","Crie categorias para organizar seus lançamentos.")}
      </div>`,r.addEventListener("change",a=>{a.target.name==="cat-tipo"&&(h=a.target.value,Fin.router.render())},{signal:o}),r.addEventListener("click",a=>{if(a.target.closest('[data-act="nova"]'))return Fin.forms.categoria.open({tipo:h});const n=a.target.closest("[data-ver-cat]");if(n)return w(n.dataset.verCat);const s=a.target.closest("[data-cat]");s&&Fin.forms.categoria.open({id:s.dataset.cat})},{signal:o}),r.addEventListener("keydown",a=>{if(a.target.closest?.("[data-ver-cat]"))return;const n=a.target.closest?.("[data-cat]");n&&(a.key==="Enter"||a.key===" ")&&(a.preventDefault(),Fin.forms.categoria.open({id:n.dataset.cat}))},{signal:o})}const M={pago:["Pago","text-emerald-700"],aberto:["A pagar","text-slate-500"],atrasado:["Atrasado","text-rose-700"],parcial:["Parcial","text-amber-700"]};let g="12m";function S(r){const o=b.todos().filter(e=>e.categoria===r.nome&&e.tipo===r.tipo).map(e=>{const a=b.statusEfetivo(e),[n,s]=M[a]||["",""];return{id:e.id,tipo:"lanc",mes:b.competencia(e)||"",data:b.dataRef(e)||"",desc:e.descricao||r.nome,valor:b.valor(e),extra:n?`<span class="${s}">${r.tipo==="receita"&&a==="pago"?"Recebido":r.tipo==="receita"&&a==="aberto"?"A receber":n}</span>`:""}}),p=r.tipo==="despesa"?Fin.storage.list("cartaoCompras").filter(e=>e.categoria===r.nome).map(e=>({id:e.id,tipo:"compra",mes:e.fatura||String(e.data||"").slice(0,7),data:e.data||"",desc:e.descricao||r.nome,valor:Number(e.valor)||0,extra:d(`${e.cartao||"cartão"}${e.parcela?` · ${e.parcela.atual}/${e.parcela.total}`:""}`)})):[];return[...o,...p]}function w(r){const o=b.categorias().find(t=>t.id===r);if(!o)return;let p=S(o);const e=new Set,a=()=>{const t=p.filter(m=>m.tipo==="lanc").length,i=p.length-t;return[t&&`${t} ${t===1?"lançamento":"lançamentos"}`,i&&`${i} ${i===1?"compra":"compras"} no cartão`].filter(Boolean).join(" e ")||"Nenhum registro"},n=p.filter(t=>t.tipo==="lanc").length,s=b.categorias(o.tipo).filter(t=>t.id!==o.id),{ini:y,fim:C}=Fin.periodo.intervalo("12m",Fin.state.mes);g==="12m"&&!p.some(t=>t.mes>=y&&t.mes<=C)&&(g="tudo");const L=()=>{const{ini:t,fim:i}=Fin.periodo.intervalo(g,Fin.state.mes),m=p.filter(l=>l.mes>=t&&l.mes<=i).sort((l,f)=>f.mes.localeCompare(l.mes)||String(f.data).localeCompare(String(l.data))),x=m.reduce((l,f)=>l+f.valor,0),F=new Map;return m.forEach(l=>{F.has(l.mes)||F.set(l.mes,[]),F.get(l.mes).push(l)}),`
        <div class="flex items-baseline justify-between gap-2 px-1">
          <span class="text-sm text-slate-500">${Fin.periodo.rotulo(g,Fin.state.mes)} · ${m.length} ${m.length===1?"registro":"registros"}</span>
          <span class="font-semibold tabular-nums ${o.tipo==="receita"?"text-emerald-700":""}">${v.brl(x)}</span>
        </div>
        ${m.length?[...F.entries()].map(([l,f])=>`
          <section>
            <h3 class="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500 px-1 mb-1">
              <span>${l?v.monthLong(l):"Sem data"}</span><span class="tabular-nums">${v.brl(f.reduce((c,j)=>c+j.valor,0))}</span></h3>
            <ul class="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">${f.map(c=>`
              <li class="flex items-center ${e.has(c.id)?"bg-prim-50":""}">
                ${s.length?`<label class="pl-3 py-2 cursor-pointer shrink-0"><input type="checkbox" data-sel="${d(c.id)}" class="accent-prim-600 w-4 h-4 block" ${e.has(c.id)?"checked":""} aria-label="Marcar ${d(c.desc)}" /></label>`:""}
                <button type="button" data-abrir-reg="${c.tipo}:${d(c.id)}" class="flex-1 min-w-0 flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50" title="Abrir para editar">
                <span class="tabular-nums text-xs text-slate-400 shrink-0 w-11">${c.data?v.date(String(c.data).slice(0,10)).slice(0,5):"—"}</span>
                <span class="flex-1 min-w-0"><span class="block text-sm truncate">${d(c.desc)}</span>
                  <span class="block text-[11px] text-slate-400 truncate">${c.tipo==="compra"?`💳 ${c.extra}`:c.extra}</span></span>
                <span class="text-sm tabular-nums shrink-0">${v.brl(c.valor)}</span>
              </button></li>`).join("")}</ul>
          </section>`).join(""):'<p class="text-sm text-slate-500 text-center py-6">Nada nesta categoria no período. Experimente “Tudo”.</p>'}`},u=Fin.ui.openModal(`
      <div class="flex flex-col max-h-[85vh]">
        <div data-arrastar class="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-slate-100">
          ${Fin.ui.catIcon(o.icone,o.nome,o.tipo)}
          <div class="flex-1 min-w-0">
            <h2 class="font-semibold text-lg truncate">${d(o.nome)}</h2>
            <p class="text-xs text-slate-500" data-contagem>${a()}</p>
          </div>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <div class="px-5 pt-3 flex flex-wrap gap-1.5" data-periodos>${Fin.periodo.chips(g)}</div>
        ${s.length?'<p class="px-5 pt-2 text-xs text-slate-500">Achou algo na categoria errada? Marque e use <b>Mover para…</b>, ou toque no registro para editar.</p>':""}
        <div class="px-5 py-3 space-y-3 overflow-y-auto" data-corpo>${L()}</div>
        <div data-mover class="hidden flex flex-wrap items-center gap-2 px-5 py-3 border-t border-amber-200 bg-amber-50">
          <span class="text-sm text-amber-900 font-medium" data-mover-n></span>
          <select data-mover-destino class="input !py-1.5 text-sm flex-1 min-w-[9rem]" aria-label="Categoria de destino">
            ${s.map(t=>`<option value="${d(t.nome)}">${d(`${t.icone?`${t.icone} `:""}${t.nome}`)}</option>`).join("")}</select>
          <button type="button" data-mover-ok class="btn btn-primary !py-1.5">Mover</button>
          <button type="button" data-mover-limpar class="text-xs text-slate-500 hover:underline">Desmarcar</button>
        </div>
        <div class="flex items-center gap-2 px-5 py-3 border-t border-slate-100">
          <button type="button" data-editar-cat class="btn btn-ghost">✎ Editar categoria</button>
          <span class="flex-1"></span>
          ${n?'<button type="button" data-ir-lanc class="btn btn-primary">Abrir em Lançamentos</button>':""}
        </div>
      </div>`,`Lançamentos de ${o.nome}`);u.querySelectorAll("[data-close]").forEach(t=>t.addEventListener("click",Fin.ui.closeModal));const $=u.querySelector("[data-mover]"),k=()=>{$.classList.toggle("hidden",!e.size),e.size&&($.querySelector("[data-mover-n]").textContent=`${e.size} ${e.size===1?"marcado":"marcados"} →`)},E=()=>{u.querySelector("[data-corpo]").innerHTML=L(),u.querySelector("[data-contagem]").textContent=a(),k()};u.querySelector("[data-periodos]").addEventListener("click",t=>{const i=t.target.closest("[data-periodo]");i&&(g=i.dataset.periodo,u.querySelector("[data-periodos]").innerHTML=Fin.periodo.chips(g),E())}),u.querySelector("[data-corpo]").addEventListener("change",t=>{const i=t.target.closest("[data-sel]");i&&(i.checked?e.add(i.dataset.sel):e.delete(i.dataset.sel),i.closest("li").classList.toggle("bg-prim-50",i.checked),k())}),$.querySelector("[data-mover-limpar]").addEventListener("click",()=>{e.clear(),u.querySelectorAll("[data-sel]").forEach(t=>{t.checked=!1,t.closest("li").classList.remove("bg-prim-50")}),k()}),$.querySelector("[data-mover-ok]").addEventListener("click",()=>{const t=$.querySelector("[data-mover-destino]").value,i=s.find(x=>x.nome===t),m=e.size;b.moverCategoria(o.nome,t,o.tipo,i?.icone,new Set(e)),e.clear(),p=S(o),E(),Fin.ui.toast(`${m} ${m===1?"registro movido":"registros movidos"} para “${t}”.`),Fin.router.refresh()}),u.querySelector("[data-corpo]").addEventListener("click",t=>{const i=t.target.closest("[data-abrir-reg]");if(!i)return;const[m,x]=i.dataset.abrirReg.split(/:(.+)/);Fin.ui.closeModal(),m==="compra"?Fin.forms.compra.open({id:x}):Fin.forms.lancamento.open(x)}),u.querySelector("[data-editar-cat]").addEventListener("click",()=>{Fin.ui.closeModal(),Fin.forms.categoria.open({id:o.id})}),u.querySelector("[data-ir-lanc]")?.addEventListener("click",()=>{const t=Fin.pages.lancamentos.filtros;Object.assign(t,{busca:"",status:"",tipo:o.tipo,categoria:o.nome,periodo:g==="futuros"?"futuros":g,dia:null,visao:"lista"}),Fin.ui.closeModal(),location.hash="#/lancamentos"})}return{title:"Categorias",render:q,verRegistros:w}})();
