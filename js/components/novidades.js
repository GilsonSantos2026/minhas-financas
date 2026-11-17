/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.novidadesTela=(()=>{const a=t=>Fin.fmt.esc(t),s=()=>Fin.novidades,l=t=>new Date(`${t}T12:00:00`).toLocaleDateString("pt-BR",{day:"numeric",month:"long",year:"numeric"}),i=t=>`
    <li class="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
      <span class="w-10 h-10 shrink-0 rounded-xl bg-prim-800 text-dest grid place-items-center">${Fin.icone(t.icone,"w-5 h-5")}</span>
      <span class="flex-1 min-w-0">
        <span class="block text-sm font-semibold">${a(t.titulo)}</span>
        <span class="block text-sm text-slate-600 mt-0.5">${a(t.texto)}</span>
        ${t.acao?`<button type="button" data-ir="${a(t.acao.rota)}" class="mt-1.5 text-sm font-semibold text-dest-texto hover:underline">${a(t.acao.rotulo)} ›</button>`:""}
      </span>
    </li>`,d=t=>{t.querySelectorAll("[data-close]").forEach(e=>e.addEventListener("click",Fin.ui.closeModal)),t.querySelectorAll("[data-ir]").forEach(e=>e.addEventListener("click",()=>{Fin.ui.closeModal(),location.hash=e.dataset.ir}))};function c(t=s().pendente()){if(!t)return null;s().marcarVista(t.id);const e=Fin.ui.openModal(`
      <div class="p-5 sm:p-6 space-y-4">
        <div class="flex items-start gap-3">
          <div class="flex-1 min-w-0">
            <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-dest-texto">${Fin.icone("alta","w-4 h-4")} Novidades</span>
            <h2 class="font-semibold text-lg leading-snug mt-0.5">${a(t.titulo)}</h2>
            <p class="text-xs text-slate-500">${l(t.data)}</p>
          </div>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <ul class="space-y-2">${t.itens.slice(0,4).map(i).join("")}</ul>
        <div class="flex flex-col gap-2 pt-1">
          <button type="button" data-close class="btn btn-primary w-full">Entendi</button>
          <button type="button" data-todas class="text-sm text-slate-500 hover:underline">Ver todas as novidades</button>
        </div>
      </div>`,"Novidades do app");return d(e),e.querySelector("[data-todas]").addEventListener("click",()=>{Fin.ui.closeModal(),setTimeout(r,50)}),e}function r(){const t=[...s().LISTA].reverse(),e=Fin.ui.openModal(`
      <div class="p-5 sm:p-6 space-y-4">
        <div class="flex items-center justify-between gap-2">
          <h2 class="font-semibold text-lg">Novidades do app</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        ${t.length?t.map(o=>`
          <section class="space-y-2">
            <h3 class="text-sm font-semibold">${a(o.titulo)} <span class="font-normal text-slate-500">· ${l(o.data)}</span></h3>
            <ul class="space-y-2">${o.itens.map(i).join("")}</ul>
          </section>`).join(""):'<p class="text-sm text-slate-500">Ainda não há novidades registradas.</p>'}
      </div>`,"Novidades do app");return d(e),e}function n(t=0){try{if(!s()?.pendente())return;if(Fin.storage.bloqueado()||Fin.tour?.ativo?.()||document.getElementById("abertura")||document.querySelector("#modal-root .modal-panel")||document.querySelector("#acesso-root > *")){t<120&&setTimeout(()=>n(t+1),1e3);return}c()}catch(e){console.warn("[novidades]",e)}}return window.addEventListener("fin:desbloqueado",()=>setTimeout(()=>n(),2500)),{abrir:c,todas:r,agendar:n}})();
