/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.educacao=(()=>{const n=e=>Fin.fmt.esc(e),o=()=>Fin.educacao,d="Conteúdo educativo, em linguagem simples. Não é recomendação de investimento: avalie seu momento e, se precisar, procure um profissional certificado.",l=()=>new Set(Fin.storage.prefs().guiasLidos||[]);function p(e){const s=l();s.has(e)||(s.add(e),Fin.storage.setPref("guiasLidos",[...s]))}const r=e=>`
    <a href="#/educacao?artigo=${e.id}" class="group flex items-start gap-3 bg-white rounded-2xl shadow-sm p-4 hover:ring-2 hover:ring-prim-200 min-w-0">
      ${Fin.icones.badge(e.icone,e.cor,"w-11 h-11","w-6 h-6")}
      <span class="flex-1 min-w-0">
        <span class="block font-semibold leading-snug">${n(e.titulo)}${l().has(e.id)?' <span class="text-[11px] font-medium text-emerald-700 bg-emerald-50 rounded-full px-1.5 py-0.5 align-middle">✓ lido</span>':""}</span>
        <span class="block text-sm text-slate-500 mt-0.5">${n(e.resumo)}</span>
        <span class="inline-flex items-center gap-1 text-xs text-slate-400 mt-1.5">${Fin.icone("relogio","w-3.5 h-3.5")} ${e.min} min de leitura</span>
      </span>
      <span class="text-slate-300 group-hover:text-prim-600" aria-hidden="true">›</span>
    </a>`;function m(){return`
      <div class="space-y-5">
        <header class="flex items-start gap-3">
          ${Fin.icones.badge("livro","prim","w-11 h-11","w-6 h-6")}
          <div class="flex-1 min-w-0"><h1 class="text-xl font-semibold">Aprender</h1>
            <p class="text-sm text-slate-500">Guias rápidos sobre orçamento, reserva, investimentos e dívidas. Ler todos leva uns 25 minutos — e muda a forma de cuidar do dinheiro.</p></div>
        </header>
        ${(()=>{const e=o().ARTIGOS.filter(t=>l().has(t.id)).length,s=o().ARTIGOS.length,a=o().ARTIGOS.find(t=>!l().has(t.id));return`<div class="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold">${e===s?"Parabéns: você leu todos os guias ✓":`Seu progresso: ${e} de ${s} guias`}</div>
              <div class="h-2 rounded-full bg-slate-100 mt-2 overflow-hidden" role="progressbar" aria-valuemin="0" aria-valuemax="${s}" aria-valuenow="${e}"><div class="h-full rounded-full bg-emerald-500" style="width:${e/s*100}%"></div></div>
            </div>
            ${a?`<a href="#/educacao?artigo=${a.id}" class="btn btn-primary shrink-0">${e?"Continuar":"Começar"}</a>`:""}
          </div>`})()}
        ${o().GRUPOS.map(([e,s])=>`
          <section>
            <h2 class="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 px-1">${n(s)}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">${o().ARTIGOS.filter(a=>a.grupo===e).map(r).join("")}</div>
          </section>`).join("")}
        <p class="text-xs text-slate-400 px-1">${d}</p>
      </div>`}function u(e){const s=o().ARTIGOS.filter(t=>t.id!==e.id&&!l().has(t.id)),a=(s.length?s:o().ARTIGOS.filter(t=>t.id!==e.id&&t.grupo===e.grupo)).slice(0,2);return`
      <article class="space-y-4 max-w-2xl mx-auto">
        <a href="#/educacao" class="inline-flex items-center gap-1 text-sm text-prim-700 font-medium hover:underline">‹ Todos os guias</a>
        <header class="bg-white rounded-2xl shadow-sm p-5">
          <div class="flex items-start gap-3">
            ${Fin.icones.badge(e.icone,e.cor,"w-12 h-12","w-7 h-7")}
            <div class="min-w-0">
              <h1 class="text-xl sm:text-2xl font-semibold leading-tight">${n(e.titulo)}</h1>
              <p class="text-sm text-slate-500 mt-1">${n(e.resumo)} · ${e.min} min</p>
            </div>
          </div>
          <div class="mt-4 rounded-xl bg-prim-50 p-3">
            <div class="text-xs font-semibold uppercase tracking-wide text-prim-800 mb-1.5">Em 3 pontos</div>
            <ol class="space-y-1.5 text-sm text-slate-700">${e.pontos.map((t,i)=>`
              <li class="flex gap-2"><span class="w-5 h-5 rounded-full bg-prim-600 text-white text-[11px] font-semibold grid place-items-center shrink-0 mt-0.5">${i+1}</span><span>${n(t)}</span></li>`).join("")}</ol>
          </div>
        </header>
        <div class="bg-white rounded-2xl shadow-sm p-5 space-y-5 leitura">
          ${e.secoes.map(t=>`
            <section>
              <h2 class="font-semibold text-base mb-1.5">${n(t.t)}</h2>
              ${(t.p||[]).map(i=>`<p class="text-[15px] leading-relaxed text-slate-700">${n(i)}</p>`).join("")}
              ${t.lista?`<ul class="mt-2 space-y-1.5">${t.lista.map(i=>`<li class="flex gap-2 text-[15px] leading-relaxed text-slate-700"><span class="text-prim-600 mt-0.5" aria-hidden="true">•</span><span>${n(i)}</span></li>`).join("")}</ul>`:""}
            </section>`).join("")}
        </div>
        ${a.length?`<section><h2 class="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 px-1">Leia também</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">${a.map(r).join("")}</div></section>`:""}
        <p class="text-xs text-slate-400 px-1">${d}</p>
      </article>`}function x(e){const s=location.hash.match(/[?&]artigo=([\w-]+)/)?.[1],a=s?o().artigo(s):null;a&&p(a.id),e.innerHTML=a?u(a):m(),window.scrollTo(0,0)}function g(e){const a=(o().CONTEXTO[e]||[]).map(i=>o().artigo(i)).filter(Boolean);Fin.ui.openModal(`
      <div class="p-5 space-y-3">
        <div class="flex items-center justify-between gap-2">
          <h2 class="font-semibold text-lg flex items-center gap-2">${Fin.icones.badge("livro","prim","w-8 h-8","w-[18px] h-[18px]")} Guias rápidos</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <ul class="divide-y divide-slate-100">${a.map(i=>`
          <li><a href="#/educacao?artigo=${i.id}" data-close class="flex items-center gap-3 py-2.5 hover:bg-slate-50 rounded-lg -mx-1 px-1">
            ${Fin.icones.badge(i.icone,i.cor,"w-9 h-9","w-5 h-5")}
            <span class="flex-1 min-w-0"><span class="block text-sm font-medium">${n(i.titulo)}</span>
              <span class="block text-xs text-slate-500 truncate">${n(i.resumo)}</span></span>
            <span class="text-slate-300" aria-hidden="true">›</span></a></li>`).join("")}</ul>
        <a href="#/educacao" data-close class="block text-center text-sm text-prim-700 font-medium hover:underline">Ver todos os guias</a>
      </div>`,"Guias rápidos").querySelectorAll("[data-close]").forEach(i=>i.addEventListener("click",h=>{const c=i.getAttribute("href");h.preventDefault(),Fin.ui.closeModal(),c&&(location.hash=c.slice(1))}))}return{title:"Aprender",render:x,ajuda:g}})();
