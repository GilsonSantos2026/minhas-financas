/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.conviteApp=(()=>{const o=()=>Fin.pwa,c='<svg viewBox="22 21 159 139" aria-hidden="true"><polygon points="24,23 55,23 89,100 74,131" fill="#F3F5F8"/><polygon points="147,23 179,23 119,158 87,158" fill="#C6A45C"/><rect x="102" y="23" width="46" height="4" fill="#C6A45C"/><line x1="90" y1="93" x2="101.3" y2="69.5" stroke="#C6A45C" stroke-width="5"/><polygon points="110,51 94,66 108,73" fill="#C6A45C"/></svg>',p='<svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M6 11v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8"/></svg>',u='<svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/></svg>',i=(e,t)=>`
    <li class="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5">
      <span class="text-dest-texto shrink-0">${Fin.icone(e,"w-5 h-5")}</span>
      <span class="text-sm text-slate-700">${t}</span></li>`,n=(e,t)=>`
    <li class="flex items-center gap-3">
      <span class="w-7 h-7 shrink-0 rounded-full bg-prim-800 text-white grid place-items-center text-sm font-semibold">${e}</span>
      <span class="text-sm text-slate-700 flex flex-wrap items-center gap-1">${t}</span></li>`,m=()=>`
    <div class="rounded-xl border border-slate-200 p-4 space-y-3">
      <p class="text-sm font-semibold">No iPhone/iPad (Safari):</p>
      <ol class="space-y-2.5">
        ${n(1,`Toque em <b>Compartilhar</b> <span class="inline-grid place-items-center w-7 h-7 rounded-lg bg-slate-100 text-blue-600">${p}</span> na barra do Safari`)}
        ${n(2,`Escolha <b>Adicionar à Tela de Início</b> <span class="inline-grid place-items-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700">${u}</span>`)}
        ${n(3,"Toque em <b>Adicionar</b>. O ícone do Valoris aparece na tela inicial.")}
      </ol>
    </div>`,l=()=>`
    <div class="rounded-xl border border-slate-200 p-4 space-y-3">
      <p class="text-sm font-semibold">Pelo menu do navegador:</p>
      <ol class="space-y-2.5">
        ${n(1,'Toque no menu <b class="text-lg leading-none">⋮</b> (ou <b>…</b>) do navegador')}
        ${n(2,"Escolha <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>")}
        ${n(3,"Confirme. O ícone do Valoris aparece na tela inicial.")}
      </ol>
    </div>`;function r(){o().marcarConvite("mostrado");const e=Fin.ui.openModal(`
      <div class="p-5 sm:p-6 space-y-4">
        <div class="flex items-start gap-3">
          <div class="marca-mono w-12 h-12 rounded-xl" aria-hidden="true">${c}</div>
          <div class="flex-1 min-w-0">
            <h2 class="font-semibold text-lg leading-snug">Leve o Valoris na sua tela inicial</h2>
            <p class="text-sm text-slate-500 mt-0.5">Instale o app neste aparelho: é gratuito e leva poucos segundos.</p>
          </div>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${i("celular","Abre em tela cheia, como um app")}
          ${i("relogio","Abre mais rápido")}
          ${i("nuvem","Funciona mesmo sem internet")}
          ${i("casa","Ícone sempre à mão na tela inicial")}
        </ul>
        <div data-guia></div>
        <p data-erro class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
        <div class="flex flex-col gap-2 pt-1">
          <button type="button" data-instalar class="btn btn-primary w-full">Instalar aplicativo</button>
          <button type="button" data-navegador class="btn btn-ghost w-full">Continuar pelo navegador</button>
        </div>
      </div>`,"Instalar o app"),t=e.querySelector("[data-guia]"),a=e.querySelector("[data-instalar]");return e.querySelector("[data-close]").addEventListener("click",Fin.ui.closeModal),e.querySelector("[data-navegador]").addEventListener("click",Fin.ui.closeModal),a.addEventListener("click",async()=>{if(o().ios()){t.innerHTML=m(),a.textContent="Entendi",a.onclick=Fin.ui.closeModal;return}a.disabled=!0,a.textContent="Preparando…";try{if(await o().aguardarPedido(3e3)){const b=await o().instalar();Fin.ui.closeModal(),b||Fin.ui.toast("Tudo bem! Se mudar de ideia: Dados e backup → Instalar app.");return}t.innerHTML=l(),a.textContent="Entendi",a.onclick=Fin.ui.closeModal}catch(d){console.warn("[convite-app]",d),t.innerHTML=l(),a.textContent="Entendi",a.onclick=Fin.ui.closeModal}finally{a.disabled=!1}}),e}function s(e=0){if(o().conviteApp()!=="pendente")return;if(o().instalado()){o().marcarConvite("mostrado");return}if(Fin.storage.bloqueado()||Fin.tour?.ativo?.()||document.getElementById("abertura")||document.querySelector("#modal-root .modal-panel")||document.querySelector("#acesso-root > *")){e<120&&setTimeout(()=>s(e+1),1e3);return}r()}return window.addEventListener("fin:drive-primeira-conexao",()=>setTimeout(()=>s(),1200)),{abrir:r,agendar:s}})();
