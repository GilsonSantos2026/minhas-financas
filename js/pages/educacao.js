/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.educacao=(()=>{const a=e=>Fin.fmt.esc(e),n=()=>Fin.educacao,p="Conteúdo educativo, em linguagem simples. Não é recomendação de investimento: avalie seu momento e, se precisar, procure um profissional certificado.",l=()=>new Set(Fin.storage.prefs().guiasLidos||[]);function m(e){const s=l();s.has(e)||(s.add(e),Fin.storage.setPref("guiasLidos",[...s]))}const u=e=>`
    <a href="#/educacao?artigo=${e.id}" class="group flex items-start gap-3 bg-white rounded-2xl shadow-sm p-4 hover:ring-2 hover:ring-prim-200 min-w-0">
      ${Fin.icones.badge(e.icone,e.cor,"w-11 h-11","w-6 h-6")}
      <span class="flex-1 min-w-0">
        <span class="block font-semibold leading-snug">${a(e.titulo)}${l().has(e.id)?' <span class="text-[11px] font-medium text-emerald-700 bg-emerald-50 rounded-full px-1.5 py-0.5 align-middle">✓ lido</span>':""}</span>
        <span class="block text-sm text-slate-500 mt-0.5">${a(e.resumo)}</span>
        <span class="inline-flex items-center gap-1 text-xs text-slate-400 mt-1.5">${Fin.icone("relogio","w-3.5 h-3.5")} ${e.min} min de leitura</span>
      </span>
      <span class="text-slate-300 group-hover:text-prim-600" aria-hidden="true">›</span>
    </a>`;function x(){const e=n().VIDEOS||[];return e.length?`
      <section aria-labelledby="videos-titulo">
        <div class="flex items-end justify-between gap-2 mb-2 px-1">
          <h2 id="videos-titulo" class="text-xs font-semibold uppercase tracking-wide text-slate-500">Vídeos de 1 minuto</h2>
          <span class="text-[11px] text-slate-400">precisa de internet</span>
        </div>
        <div class="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 snap-x" role="list">
          ${e.map(s=>`
            <button type="button" data-video="${a(s.id)}" role="listitem" class="snap-start shrink-0 w-[8.5rem] text-left group" aria-label="Assistir: ${a(s.titulo)}">
              <span class="relative block rounded-2xl overflow-hidden bg-slate-800 aspect-[9/16] shadow-sm group-hover:ring-2 group-hover:ring-prim-300">
                <img src="${a(s.capa)}" alt="" loading="lazy" decoding="async" class="w-full h-full object-cover" />
                <span class="absolute inset-0 grid place-items-center"><span class="w-11 h-11 rounded-full bg-white/90 text-slate-900 grid place-items-center shadow" aria-hidden="true">▶</span></span>
                <span class="absolute bottom-1.5 right-1.5 text-[11px] font-semibold text-white bg-black/55 rounded-full px-1.5 py-0.5">${s.seg} s</span>
              </span>
              <span class="block text-sm font-semibold leading-snug mt-1.5">${a(s.titulo)}</span>
              <span class="block text-xs text-slate-500 leading-snug">${a(s.resumo)}</span>
            </button>`).join("")}
        </div>
      </section>`:""}function r(e){const s=n().video(e);if(!s)return;const o=Fin.ui.openModal(`
      <div class="p-4 sm:p-5 space-y-3">
        <div class="flex items-center justify-between gap-2">
          <h2 class="font-semibold text-lg">${a(s.titulo)}</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <video class="block w-full max-h-[72vh] aspect-[9/16] mx-auto rounded-2xl bg-black" src="${a(s.arquivo)}" poster="${a(s.capa)}"
          controls playsinline autoplay preload="metadata"></video>
        <p class="text-xs text-slate-500">${a(s.resumo)} Os dados do vídeo são fictícios.</p>
      </div>`,s.titulo);o.querySelector("[data-close]").addEventListener("click",()=>Fin.ui.closeModal()),o.querySelector("video").addEventListener("error",()=>{o.querySelector("video").insertAdjacentHTML("afterend",'<p class="text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2">Não deu para carregar o vídeo. Confira a internet e tente de novo.</p>')},{once:!0})}function g(){return`
      <div class="space-y-5">
        <header class="flex items-start gap-3">
          ${Fin.icones.badge("livro","prim","w-11 h-11","w-6 h-6")}
          <div class="flex-1 min-w-0"><h1 class="text-xl font-semibold">Aprender</h1>
            <p class="text-sm text-slate-500">Guias rápidos sobre orçamento, reserva, investimentos e dívidas. Ler todos leva uns 25 minutos — e muda a forma de cuidar do dinheiro.</p></div>
        </header>
        ${(()=>{const e=n().ARTIGOS.filter(t=>l().has(t.id)).length,s=n().ARTIGOS.length,o=n().ARTIGOS.find(t=>!l().has(t.id));return`<div class="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold">${e===s?"Parabéns: você leu todos os guias ✓":`Seu progresso: ${e} de ${s} guias`}</div>
              <div class="h-2 rounded-full bg-slate-100 mt-2 overflow-hidden" role="progressbar" aria-valuemin="0" aria-valuemax="${s}" aria-valuenow="${e}"><div class="h-full rounded-full bg-emerald-500" style="width:${e/s*100}%"></div></div>
            </div>
            ${o?`<a href="#/educacao?artigo=${o.id}" class="btn btn-primary shrink-0">${e?"Continuar":"Começar"}</a>`:""}
          </div>`})()}
        ${x()}
        ${n().GRUPOS.map(([e,s])=>`
          <section>
            <h2 class="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 px-1">${a(s)}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">${n().ARTIGOS.filter(o=>o.grupo===e).map(u).join("")}</div>
          </section>`).join("")}
        <p class="text-xs text-slate-400 px-1">${p}</p>
      </div>`}function h(e){const s=n().ARTIGOS.filter(t=>t.id!==e.id&&!l().has(t.id)),o=(s.length?s:n().ARTIGOS.filter(t=>t.id!==e.id&&t.grupo===e.grupo)).slice(0,2);return`
      <article class="space-y-4 max-w-2xl mx-auto">
        <a href="#/educacao" class="inline-flex items-center gap-1 text-sm text-prim-700 font-medium hover:underline">‹ Todos os guias</a>
        <header class="bg-white rounded-2xl shadow-sm p-5">
          <div class="flex items-start gap-3">
            ${Fin.icones.badge(e.icone,e.cor,"w-12 h-12","w-7 h-7")}
            <div class="min-w-0">
              <h1 class="text-xl sm:text-2xl font-semibold leading-tight">${a(e.titulo)}</h1>
              <p class="text-sm text-slate-500 mt-1">${a(e.resumo)} · ${e.min} min</p>
            </div>
          </div>
          <div class="mt-4 rounded-xl bg-prim-50 p-3">
            <div class="text-xs font-semibold uppercase tracking-wide text-prim-800 mb-1.5">Em 3 pontos</div>
            <ol class="space-y-1.5 text-sm text-slate-700">${e.pontos.map((t,i)=>`
              <li class="flex gap-2"><span class="w-5 h-5 rounded-full bg-prim-600 text-white text-[11px] font-semibold grid place-items-center shrink-0 mt-0.5">${i+1}</span><span>${a(t)}</span></li>`).join("")}</ol>
          </div>
        </header>
        <div class="bg-white rounded-2xl shadow-sm p-5 space-y-5 leitura">
          ${e.secoes.map(t=>`
            <section>
              <h2 class="font-semibold text-base mb-1.5">${a(t.t)}</h2>
              ${(t.p||[]).map(i=>`<p class="text-[15px] leading-relaxed text-slate-700">${a(i)}</p>`).join("")}
              ${t.lista?`<ul class="mt-2 space-y-1.5">${t.lista.map(i=>`<li class="flex gap-2 text-[15px] leading-relaxed text-slate-700"><span class="text-prim-600 mt-0.5" aria-hidden="true">•</span><span>${a(i)}</span></li>`).join("")}</ul>`:""}
            </section>`).join("")}
        </div>
        ${o.length?`<section><h2 class="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 px-1">Leia também</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">${o.map(u).join("")}</div></section>`:""}
        <p class="text-xs text-slate-400 px-1">${p}</p>
      </article>`}function f(e,{signal:s}={}){const o=location.hash.match(/[?&]artigo=([\w-]+)/)?.[1],t=o?n().artigo(o):null;t&&m(t.id),e.innerHTML=t?h(t):g(),e.addEventListener("click",c=>{const d=c.target.closest("[data-video]");d&&r(d.dataset.video)},s?{signal:s}:void 0);const i=location.hash.match(/[?&]video=([\w-]+)/)?.[1];i&&setTimeout(()=>r(i),100),window.scrollTo(0,0)}function v(e){const o=(n().CONTEXTO[e]||[]).map(i=>n().artigo(i)).filter(Boolean);Fin.ui.openModal(`
      <div class="p-5 space-y-3">
        <div class="flex items-center justify-between gap-2">
          <h2 class="font-semibold text-lg flex items-center gap-2">${Fin.icones.badge("livro","prim","w-8 h-8","w-[18px] h-[18px]")} Guias rápidos</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <ul class="divide-y divide-slate-100">${o.map(i=>`
          <li><a href="#/educacao?artigo=${i.id}" data-close class="flex items-center gap-3 py-2.5 hover:bg-slate-50 rounded-lg -mx-1 px-1">
            ${Fin.icones.badge(i.icone,i.cor,"w-9 h-9","w-5 h-5")}
            <span class="flex-1 min-w-0"><span class="block text-sm font-medium">${a(i.titulo)}</span>
              <span class="block text-xs text-slate-500 truncate">${a(i.resumo)}</span></span>
            <span class="text-slate-300" aria-hidden="true">›</span></a></li>`).join("")}</ul>
        <a href="#/educacao" data-close class="block text-center text-sm text-prim-700 font-medium hover:underline">Ver todos os guias</a>
      </div>`,"Guias rápidos").querySelectorAll("[data-close]").forEach(i=>i.addEventListener("click",c=>{const d=i.getAttribute("href");c.preventDefault(),Fin.ui.closeModal(),d&&(location.hash=d.slice(1))}))}return{title:"Aprender",render:f,ajuda:v,abrirVideo:r}})();
