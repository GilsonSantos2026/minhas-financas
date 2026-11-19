/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.ui=(()=>{const d=Fin.fmt;function g(e,t="ok",a=null){const s=document.getElementById("toast");if(s.textContent=e,a){const o=document.createElement("button");o.type="button",o.className="ml-3 font-bold underline underline-offset-2",o.textContent=a.rotulo,o.addEventListener("click",()=>{s.classList.add("hidden"),a.fn()},{once:!0}),s.append(o)}s.classList.remove("bg-emerald-600","bg-rose-600","hidden"),s.classList.add(t==="ok"?"bg-emerald-600":"bg-rose-600"),clearTimeout(g.t),g.t=setTimeout(()=>s.classList.add("hidden"),a?7e3:4e3)}let F=null;const q=e=>e.key==="Escape"&&$();function L(e,t="Janela"){y(),F=document.activeElement;const a=document.getElementById("modal-root");a.innerHTML=`
      <div class="fixed inset-0 z-40 bg-slate-900/40 flex items-end sm:items-center justify-center sm:p-4" data-backdrop>
        <div class="modal-panel bg-white w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl"
             role="dialog" aria-modal="true" aria-label="${d.esc(t)}">${e}</div>
      </div>`,a.querySelector("[data-backdrop]").addEventListener("click",o=>{o.target===o.currentTarget&&$()}),document.addEventListener("keydown",q),document.body.classList.add("overflow-hidden");const s=a.querySelector(".modal-panel");return A(a,s),setTimeout(()=>s.querySelector("input, select, textarea, button:not([data-centralizar])")?.focus(),30),s}let h=null,y=()=>{};function A(e,t){const a=t.querySelector("[data-arrastar]");if(!a)return;const s=e.querySelector("[data-backdrop]"),o=()=>matchMedia("(min-width: 640px)").matches,n=a.querySelector("h2, h3");a.classList.add("modal-alca"),a.title="Arraste para mover a janela",n?.insertAdjacentHTML("beforebegin",`<span class="modal-grip" aria-hidden="true"><svg viewBox="0 0 10 16" width="10" height="16" fill="currentColor">
        <circle cx="2" cy="2" r="1.4"/><circle cx="8" cy="2" r="1.4"/><circle cx="2" cy="8" r="1.4"/>
        <circle cx="8" cy="8" r="1.4"/><circle cx="2" cy="14" r="1.4"/><circle cx="8" cy="14" r="1.4"/></svg></span>`);const c=a.querySelector("[data-close]");c?.insertAdjacentHTML("beforebegin",`<button type="button" data-centralizar class="icon-btn modal-centro" hidden
         aria-label="Voltar a janela ao centro" title="Voltar ao centro">${Fin.icone?Fin.icone("alvo","w-4 h-4"):"◎"}</button>`);const l=a.querySelector("[data-centralizar]");c&&l&&c.parentElement.insertBefore(l,c),n&&!n.classList.contains("flex-1")&&n.classList.add("flex-1");let i=!1,u=null,m=null,p=!1;const b=()=>{if(!i)return;const r=8;u.x=Math.max(r,Math.min(u.x,innerWidth-t.offsetWidth-r)),u.y=Math.max(r,Math.min(u.y,innerHeight-t.offsetHeight-r)),t.style.left=`${Math.round(u.x)}px`,t.style.top=`${Math.round(u.y)}px`,h={...u}},f=r=>{t.contains(r.target)||r.target.closest?.("#toast")||(r.preventDefault(),r.stopPropagation(),p||(p=!0,g("Com a janela aberta, a tela de fundo é só para consulta: dá para rolar, selecionar e copiar.")))},w=(r,x)=>{if(i)return;const v=t.getBoundingClientRect();i=!0,u={x:r??v.left,y:x??v.top},t.style.width=`${v.width}px`,t.classList.add("modal-solta"),s.classList.add("modal-fundo-livre"),document.body.classList.remove("overflow-hidden"),document.addEventListener("click",f,!0),l.hidden=!1,b()},E=()=>{i&&(i=!1,h=null,t.classList.remove("modal-solta"),t.style.left=t.style.top=t.style.width="",s.classList.remove("modal-fundo-livre"),document.body.classList.add("overflow-hidden"),document.removeEventListener("click",f,!0),l.hidden=!0)};a.addEventListener("pointerdown",r=>{if(!o()||r.button!==0||r.target.closest("button, a, input, select, textarea, label"))return;const x=t.getBoundingClientRect();m={px:r.clientX,py:r.clientY,x:i?u.x:x.left,y:i?u.y:x.top,moveu:!1},a.setPointerCapture(r.pointerId),r.preventDefault()}),a.addEventListener("pointermove",r=>{if(!m)return;const x=r.clientX-m.px,v=r.clientY-m.py;!m.moveu&&Math.hypot(x,v)<4||(m.moveu=!0,i||w(m.x,m.y),a.classList.add("arrastando"),u.x=m.x+x,u.y=m.y+v,b())});const C=()=>{m=null,a.classList.remove("arrastando")};a.addEventListener("pointerup",C),a.addEventListener("pointercancel",C),a.addEventListener("dblclick",r=>{r.target.closest("button")||E()}),l.addEventListener("click",E);const S=()=>{i&&(o()?b():E())};addEventListener("resize",S);const j=window.ResizeObserver?new ResizeObserver(()=>b()):null;j?.observe(t),y=()=>{document.removeEventListener("click",f,!0),removeEventListener("resize",S),j?.disconnect(),y=()=>{}},h&&o()&&w(h.x,h.y)}function $(){y(),document.getElementById("modal-root").innerHTML="",document.removeEventListener("keydown",q),document.body.classList.remove("overflow-hidden"),F?.focus?.()}function P(e={}){return new Promise(t=>{let a=!1;const s=c=>{a||(a=!0,n.disconnect(),$(),t(c))},o=L(`
        <div class="p-5 space-y-4">
          <div class="flex items-start gap-3">
            ${e.avatar||""}
            <div class="min-w-0"><h2 class="font-semibold text-lg leading-tight">${e.titulo||"Confirmar"}</h2>
              ${e.texto?`<p class="text-sm text-slate-600 mt-1">${e.texto}</p>`:""}</div>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" data-nao class="btn btn-ghost">${e.nao||"Cancelar"}</button>
            <button type="button" data-sim class="btn btn-primary">${e.sim||"Confirmar"}</button>
          </div>
        </div>`,e.titulo||"Confirmar"),n=new MutationObserver(()=>{document.body.contains(o)||s(!1)});n.observe(document.getElementById("modal-root"),{childList:!0}),o.querySelector("[data-nao]").addEventListener("click",()=>s(!1)),o.querySelector("[data-sim]").addEventListener("click",()=>s(!0)),setTimeout(()=>o.querySelector("[data-sim]").focus(),40)})}function I(){const e=Fin.finance;if(!e?.temCasal?.())return"";const t=Fin.membros,a=e.pessoaAtiva(),s=Fin.cofre.pessoas(),o=(i,u,m)=>`<button type="button" data-filtro-pessoa="${d.esc(i)}" aria-pressed="${(a||"todos")===i}">${m}${d.esc(u)}</button>`,n=`<span class="w-6 h-6 rounded-full grid place-items-center bg-slate-100 text-slate-600 shrink-0">${Fin.icone("usuario","w-3.5 h-3.5")}</span>`,c=a?Math.round(e.parteDe(a)*100):null,l=a&&t.primeiroNome(t.porId(a))||"";return`
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <div class="filtro-pessoa" role="group" aria-label="Ver finanças de">
          ${o("todos","Ambos",n)}
          ${s.map(i=>o(i.id,t.primeiroNome(t.porId(i.id))||i.usuario,t.avatar(t.porId(i.id),{tam:"w-6 h-6",txt:"text-[9px]"}))).join("")}
        </div>
        ${a?`<p class="text-xs text-slate-500">Só de ${d.esc(l)}: as receitas, o que pagou e <b>${c}%</b> das contas dos dois.
          <a href="#/configuracoes" class="text-prim-700 hover:underline">Divisão</a></p>`:""}
      </div>`}function z(e){const t=Fin.finance;if(!t?.temCasal?.())return"";const a=Fin.membros,s=t.pagador(e);if(s===t.CASAL)return`<span class="autor-mini rounded-full grid place-items-center bg-prim-600 text-white shrink-0" title="Pago pelos dois">${Fin.icone("usuario","w-2.5 h-2.5")}</span>`;const o=a.porId(s),n=a.nome(o)||o.usuario,c=t.autor(e),l=e.tipo==="receita"?`Recebido por ${n}`:c!==s?`Pago por ${n} · lançado por ${a.nome(a.porId(c))}`:`Pago por ${n}`;return`<span title="${d.esc(l)}" class="inline-flex shrink-0">${a.avatar(o,{tam:"autor-mini",txt:""})}</span>`}function B(e){return new Promise(t=>{const a=e.cor!=="amber",s=(p,b,f)=>p.map(w=>`<li class="flex gap-2"><span class="font-bold shrink-0 ${f}" aria-hidden="true">${b}</span><span>${w}</span></li>`).join(""),o=L(`
        <form class="p-5 space-y-4" novalidate>
          <div class="flex items-start gap-3">
            ${Fin.icones?Fin.icones.badge(e.icone||"alerta",a?"rose":"amber","w-10 h-10","w-6 h-6"):""}
            <div class="flex-1 min-w-0">
              <h2 class="font-semibold text-lg leading-tight">${e.titulo}</h2>
              ${e.intro?`<p class="text-sm text-slate-600 mt-1">${e.intro}</p>`:""}
            </div>
            <button type="button" data-nao class="icon-btn shrink-0" aria-label="Cancelar">✕</button>
          </div>
          ${e.avisos?.length?`<ul class="text-sm bg-amber-50 text-amber-900 rounded-xl px-3 py-2.5 space-y-1.5">${s(e.avisos,"!","text-amber-700")}</ul>`:""}
          ${e.perde?.length?`
            <div class="rounded-xl border ${a?"border-rose-200 bg-rose-50/60":"border-amber-200 bg-amber-50/60"} px-3 py-2.5">
              <div class="text-xs font-semibold uppercase tracking-wide ${a?"text-rose-700":"text-amber-800"} mb-1.5">O que vai acontecer</div>
              <ul class="text-sm space-y-1.5">${s(e.perde,"✕",a?"text-rose-600":"text-amber-700")}</ul>
            </div>`:""}
          ${e.mantem?.length?`
            <div class="rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5">
              <div class="text-xs font-semibold uppercase tracking-wide text-emerald-800 mb-1.5">Continua como está</div>
              <ul class="text-sm space-y-1.5">${s(e.mantem,"✓","text-emerald-700")}</ul>
            </div>`:""}
          ${e.resumo||""}
          ${e.backup?`
            <div class="flex flex-wrap items-center gap-2 text-sm bg-slate-50 rounded-xl px-3 py-2.5">
              <span class="flex-1 min-w-[12rem]">Recomendado: <b>baixe um backup</b> antes. Com ele dá para voltar atrás.</span>
              <button type="button" data-backup class="btn btn-ghost !bg-white !py-1.5">Baixar backup agora</button>
            </div>`:""}
          <label class="flex items-start gap-2 text-sm cursor-pointer">
            <input type="checkbox" data-ciente class="accent-rose-600 w-4 h-4 mt-0.5 shrink-0">
            <span>${e.ciente||"Entendi o que vai acontecer e que não dá para desfazer."}</span>
          </label>
          ${e.palavra?`
            <label class="field"><span>Para confirmar, digite <b>${e.palavra}</b></span>
              <input data-palavra class="input" autocomplete="off" autocapitalize="characters" spellcheck="false"></label>`:""}
          <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
            <button type="button" data-nao class="btn btn-ghost">Cancelar</button>
            <button type="submit" data-sim class="btn ${a?"bg-rose-600 hover:bg-rose-700":"bg-amber-600 hover:bg-amber-700"} text-white" disabled>${e.botao||"Confirmar"}</button>
          </div>
        </form>`,e.titulo.replace(/<[^>]+>/g,""));let n=!1;const c=p=>{n||(n=!0,l.disconnect(),$(),t(p))},l=new MutationObserver(()=>{!o.isConnected&&!n&&(n=!0,l.disconnect(),t(!1))});l.observe(document.getElementById("modal-root"),{childList:!0});const i=o.querySelector("form"),u=o.querySelector("[data-sim]"),m=()=>o.querySelector("[data-ciente]").checked&&(!e.palavra||(o.querySelector("[data-palavra]").value||"").trim().toUpperCase()===e.palavra);i.addEventListener("input",()=>{u.disabled=!m()}),i.addEventListener("change",()=>{u.disabled=!m()}),i.addEventListener("submit",p=>{p.preventDefault(),m()&&c(!0)}),o.querySelectorAll("[data-nao]").forEach(p=>p.addEventListener("click",()=>c(!1))),o.querySelector("[data-backup]")?.addEventListener("click",async p=>{const b=p.currentTarget;b.disabled=!0;try{await e.backup(),b.textContent="✓ Backup baixado"}catch(f){b.disabled=!1,g(f.message,"error")}}),setTimeout(()=>o.querySelector("[data-nao]")?.focus(),40)})}function T(e){const t=d.currentYM();return`
      <div class="barra-mes hero-topo flex items-center justify-between rounded-2xl shadow-sm px-2 py-2 text-white">
        <button data-month="-1" class="icon-btn" aria-label="Mês anterior">‹</button>
        <div class="text-center">
          <div class="font-semibold">${d.monthLong(e)}</div>
          ${e!==t?'<button data-month="0" class="hero-rotulo text-[11px] font-semibold uppercase tracking-wider text-white/80 hover:underline">voltar para o mês atual</button>':'<div class="hero-rotulo text-[11px] font-semibold uppercase tracking-wider text-white/75">mês atual</div>'}
        </div>
        <button data-month="1" class="icon-btn" aria-label="Próximo mês">›</button>
      </div>`}function O(e){const t=Fin.finance.statusEfetivo(e),a=e.tipo==="receita",s={pago:["✓",a?"Recebido":"Pago","bg-emerald-50 text-emerald-800"],aberto:["○",a?"A receber":"A pagar","bg-slate-100 text-slate-600"],atrasado:["!","Atrasado","bg-rose-50 text-rose-700"],parcial:["◐","Parcial","bg-amber-50 text-amber-800"]},[o,n,c]=s[t],l=t==="pago"?"Marcar como não pago":a?"Marcar como recebido":"Marcar como pago";return`<button type="button" data-toggle-pago="${e.id}" class="pill ${c}" title="${l}" aria-label="${n}. ${l}">
      <span aria-hidden="true">${o}</span>${n}</button>`}function R(e){const t=Fin.finance.conciliar(e),a=e.tipo==="receita";if(t.situacao==="pendente"||t.situacao==="atrasado")return"";const s=e.dataPagamento?` · ${d.date(e.dataPagamento).slice(0,5)}`:"";if(t.situacao==="parcial")return`<div class="text-[11px] text-amber-800 tabular-nums">${a?"recebido":"pago"} ${d.brl(t.pago)}${s} · falta ${d.brl(t.falta)}</div>`;const o=t.situacao==="maior"?` <span class="text-amber-800">+${d.brl(t.diferenca)}</span>`:t.situacao==="menor"?` <span class="text-emerald-800">−${d.brl(-t.diferenca)}</span>`:"";return`<div class="text-[11px] text-slate-500 tabular-nums">${a?"recebido":"pago"} ${d.brl(t.pago)}${s}${o}</div>`}function D(e,t=null,{compacto:a=!1}={}){const s=t?t.parciais.length:0,o=t?t.encargos+t.pagoAMais:0,n=t&&(s>1||o>0)?`
      <p class="text-xs bg-white/70 rounded-lg px-2 py-1.5">
        Nos últimos ${t.meses} meses: <b>${s} fatura${s===1?"":"s"} paga${s===1?"":"s"} a menos</b>${o>0?` · <b>${d.brl(o)}</b> em juros, IOF e multa já identificados`:""}.
        ${s>=3?"Virou hábito — e é o que mais pesa no orçamento.":""}</p>`:"",c=a?"":`
      <p class="text-xs text-rose-900/80">Se não der para pagar tudo, compare antes: o <b>parcelamento da fatura</b> oferecido pelo banco costuma ter juros menores que o rotativo. E segure novas compras no cartão até zerar o saldo.</p>`;return`
      <div class="rounded-xl bg-rose-50 text-rose-900 border border-rose-200 px-3 py-2.5 text-sm space-y-1.5" role="note">
        <p class="font-semibold"><span aria-hidden="true">⚠️</span> Fatura paga a menos: ${d.brl(e.falta)} vão para o rotativo</p>
        <p class="text-xs">O que falta volta na próxima fatura com <b>juros, IOF e multa</b>. O rotativo é um dos créditos mais caros do mercado (costuma passar de 10% ao mês): só no próximo mês, pode custar <b>mais de ${d.brl(e.custoMes)}</b> — e os juros crescem sobre os juros.</p>
        ${n}${c}
      </div>`}function H(e,t,a){const s=a==="receita"?"bg-emerald-50":"bg-slate-100",o=e||d.esc((t||"?").slice(0,1).toUpperCase());return`<span class="w-10 h-10 shrink-0 rounded-full ${s} grid place-items-center text-lg" aria-hidden="true">${o}</span>`}function N(e,t,a,s=""){return`
      <div class="bg-white rounded-2xl shadow-sm p-8 text-center">
        ${Fin.icones?.doEmoji(e)?`<div class="relative mx-auto mb-3 w-16 h-16" aria-hidden="true">
              <span class="absolute -right-2 -top-1 text-prim-200">${Fin.icone("moedas","w-6 h-6")}</span>
              <span class="w-16 h-16 rounded-2xl bg-prim-50 text-prim-600 grid place-items-center">${Fin.icone(Fin.icones.doEmoji(e),"w-8 h-8")}</span>
            </div>`:`<div class="text-4xl mb-2" aria-hidden="true">${e}</div>`}
        <h2 class="font-semibold">${t}</h2>
        <p class="text-sm text-slate-500 mt-1">${a}</p>
        ${s?`<div class="mt-4">${s}</div>`:""}
      </div>`}const k=(e,t)=>`${e}:${t}`,M=(e,t)=>(Fin.state.dobras||{})[k(e,t)]??!!Fin.modo?.completo?.();function V({grupo:e,id:t,icone:a,cor:s,titulo:o,resumo:n="",corpo:c}){const l=M(e,t);return`
      <section class="bg-white rounded-2xl shadow-sm min-w-0 overflow-hidden">
        <button type="button" data-ui-dobra="${k(e,t)}" aria-expanded="${l}" class="w-full flex items-center gap-3 px-4 py-3.5 text-left min-h-[64px]">
          ${Fin.icones.badge(a,s,"w-9 h-9","w-[18px] h-[18px]")}
          <span class="flex-1 min-w-0"><span class="block text-[15px] font-semibold">${o}</span>${n?`<span class="block text-[13px] text-slate-500 truncate">${n}</span>`:""}</span>
          <span class="text-slate-400 transition-transform ${l?"rotate-180":""}" aria-hidden="true">${Fin.icone("seta","w-5 h-5")}</span>
        </button>
        ${l?`<div class="px-4 pb-4 min-w-0">${c()}</div>`:""}
      </section>`}return document.addEventListener("click",e=>{const t=e.target.closest?.("[data-ui-dobra]");if(!t)return;const[a,s]=t.dataset.uiDobra.split(":");Fin.state.dobras=Fin.state.dobras||{},Fin.state.dobras[k(a,s)]=!M(a,s),Fin.router.refresh()}),{toast:g,openModal:L,closeModal:$,confirmar:B,perguntar:P,filtroPessoa:I,autorMini:z,monthNav:T,statusPill:O,pagamentoLinha:R,alertaRotativo:D,catIcon:H,emptyState:N,dobra:V}})();
