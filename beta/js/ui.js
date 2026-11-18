/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.ui=(()=>{const l=Fin.fmt;function g(e,t="ok",a=null){const o=document.getElementById("toast");if(o.textContent=e,a){const s=document.createElement("button");s.type="button",s.className="ml-3 font-bold underline underline-offset-2",s.textContent=a.rotulo,s.addEventListener("click",()=>{o.classList.add("hidden"),a.fn()},{once:!0}),o.append(s)}o.classList.remove("bg-emerald-600","bg-rose-600","hidden"),o.classList.add(t==="ok"?"bg-emerald-600":"bg-rose-600"),clearTimeout(g.t),g.t=setTimeout(()=>o.classList.add("hidden"),a?7e3:4e3)}let E=null;const F=e=>e.key==="Escape"&&y();function L(e,t="Janela"){$(),E=document.activeElement;const a=document.getElementById("modal-root");a.innerHTML=`
      <div class="fixed inset-0 z-40 bg-slate-900/40 flex items-end sm:items-center justify-center sm:p-4" data-backdrop>
        <div class="modal-panel bg-white w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl"
             role="dialog" aria-modal="true" aria-label="${l.esc(t)}">${e}</div>
      </div>`,a.querySelector("[data-backdrop]").addEventListener("click",s=>{s.target===s.currentTarget&&y()}),document.addEventListener("keydown",F),document.body.classList.add("overflow-hidden");const o=a.querySelector(".modal-panel");return S(a,o),setTimeout(()=>o.querySelector("input, select, textarea, button:not([data-centralizar])")?.focus(),30),o}let h=null,$=()=>{};function S(e,t){const a=t.querySelector("[data-arrastar]");if(!a)return;const o=e.querySelector("[data-backdrop]"),s=()=>matchMedia("(min-width: 640px)").matches,r=a.querySelector("h2, h3");a.classList.add("modal-alca"),a.title="Arraste para mover a janela",r?.insertAdjacentHTML("beforebegin",`<span class="modal-grip" aria-hidden="true"><svg viewBox="0 0 10 16" width="10" height="16" fill="currentColor">
        <circle cx="2" cy="2" r="1.4"/><circle cx="8" cy="2" r="1.4"/><circle cx="2" cy="8" r="1.4"/>
        <circle cx="8" cy="8" r="1.4"/><circle cx="2" cy="14" r="1.4"/><circle cx="8" cy="14" r="1.4"/></svg></span>`);const c=a.querySelector("[data-close]");c?.insertAdjacentHTML("beforebegin",`<button type="button" data-centralizar class="icon-btn modal-centro" hidden
         aria-label="Voltar a janela ao centro" title="Voltar ao centro">${Fin.icone?Fin.icone("alvo","w-4 h-4"):"◎"}</button>`);const m=a.querySelector("[data-centralizar]");c&&m&&c.parentElement.insertBefore(m,c),r&&!r.classList.contains("flex-1")&&r.classList.add("flex-1");let i=!1,d=null,u=null,p=!1;const b=()=>{if(!i)return;const n=8;d.x=Math.max(n,Math.min(d.x,innerWidth-t.offsetWidth-n)),d.y=Math.max(n,Math.min(d.y,innerHeight-t.offsetHeight-n)),t.style.left=`${Math.round(d.x)}px`,t.style.top=`${Math.round(d.y)}px`,h={...d}},f=n=>{t.contains(n.target)||n.target.closest?.("#toast")||(n.preventDefault(),n.stopPropagation(),p||(p=!0,g("Com a janela aberta, a tela de fundo é só para consulta: dá para rolar, selecionar e copiar.")))},w=(n,v)=>{if(i)return;const x=t.getBoundingClientRect();i=!0,d={x:n??x.left,y:v??x.top},t.style.width=`${x.width}px`,t.classList.add("modal-solta"),o.classList.add("modal-fundo-livre"),document.body.classList.remove("overflow-hidden"),document.addEventListener("click",f,!0),m.hidden=!1,b()},k=()=>{i&&(i=!1,h=null,t.classList.remove("modal-solta"),t.style.left=t.style.top=t.style.width="",o.classList.remove("modal-fundo-livre"),document.body.classList.add("overflow-hidden"),document.removeEventListener("click",f,!0),m.hidden=!0)};a.addEventListener("pointerdown",n=>{if(!s()||n.button!==0||n.target.closest("button, a, input, select, textarea, label"))return;const v=t.getBoundingClientRect();u={px:n.clientX,py:n.clientY,x:i?d.x:v.left,y:i?d.y:v.top,moveu:!1},a.setPointerCapture(n.pointerId),n.preventDefault()}),a.addEventListener("pointermove",n=>{if(!u)return;const v=n.clientX-u.px,x=n.clientY-u.py;!u.moveu&&Math.hypot(v,x)<4||(u.moveu=!0,i||w(u.x,u.y),a.classList.add("arrastando"),d.x=u.x+v,d.y=u.y+x,b())});const q=()=>{u=null,a.classList.remove("arrastando")};a.addEventListener("pointerup",q),a.addEventListener("pointercancel",q),a.addEventListener("dblclick",n=>{n.target.closest("button")||k()}),m.addEventListener("click",k);const M=()=>{i&&(s()?b():k())};addEventListener("resize",M);const C=window.ResizeObserver?new ResizeObserver(()=>b()):null;C?.observe(t),$=()=>{document.removeEventListener("click",f,!0),removeEventListener("resize",M),C?.disconnect(),$=()=>{}},h&&s()&&w(h.x,h.y)}function y(){$(),document.getElementById("modal-root").innerHTML="",document.removeEventListener("keydown",F),document.body.classList.remove("overflow-hidden"),E?.focus?.()}function j(e={}){return new Promise(t=>{let a=!1;const o=c=>{a||(a=!0,r.disconnect(),y(),t(c))},s=L(`
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
        </div>`,e.titulo||"Confirmar"),r=new MutationObserver(()=>{document.body.contains(s)||o(!1)});r.observe(document.getElementById("modal-root"),{childList:!0}),s.querySelector("[data-nao]").addEventListener("click",()=>o(!1)),s.querySelector("[data-sim]").addEventListener("click",()=>o(!0)),setTimeout(()=>s.querySelector("[data-sim]").focus(),40)})}function P(){const e=Fin.finance;if(!e?.temCasal?.())return"";const t=Fin.membros,a=e.pessoaAtiva(),o=Fin.cofre.pessoas(),s=(i,d,u)=>`<button type="button" data-filtro-pessoa="${l.esc(i)}" aria-pressed="${(a||"todos")===i}">${u}${l.esc(d)}</button>`,r=`<span class="w-6 h-6 rounded-full grid place-items-center bg-slate-100 text-slate-600 shrink-0">${Fin.icone("usuario","w-3.5 h-3.5")}</span>`,c=a?Math.round(e.parteDe(a)*100):null,m=a&&t.primeiroNome(t.porId(a))||"";return`
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <div class="filtro-pessoa" role="group" aria-label="Ver finanças de">
          ${s("todos","Ambos",r)}
          ${o.map(i=>s(i.id,t.primeiroNome(t.porId(i.id))||i.usuario,t.avatar(t.porId(i.id),{tam:"w-6 h-6",txt:"text-[9px]"}))).join("")}
        </div>
        ${a?`<p class="text-xs text-slate-500">Só de ${l.esc(m)}: as receitas, o que pagou e <b>${c}%</b> das contas dos dois.
          <a href="#/configuracoes" class="text-prim-700 hover:underline">Divisão</a></p>`:""}
      </div>`}function A(e){const t=Fin.finance;if(!t?.temCasal?.())return"";const a=Fin.membros,o=t.pagador(e);if(o===t.CASAL)return`<span class="autor-mini rounded-full grid place-items-center bg-prim-600 text-white shrink-0" title="Pago pelos dois">${Fin.icone("usuario","w-2.5 h-2.5")}</span>`;const s=a.porId(o),r=a.nome(s)||s.usuario,c=t.autor(e),m=e.tipo==="receita"?`Recebido por ${r}`:c!==o?`Pago por ${r} · lançado por ${a.nome(a.porId(c))}`:`Pago por ${r}`;return`<span title="${l.esc(m)}" class="inline-flex shrink-0">${a.avatar(s,{tam:"autor-mini",txt:""})}</span>`}function I(e){return new Promise(t=>{const a=e.cor!=="amber",o=(p,b,f)=>p.map(w=>`<li class="flex gap-2"><span class="font-bold shrink-0 ${f}" aria-hidden="true">${b}</span><span>${w}</span></li>`).join(""),s=L(`
        <form class="p-5 space-y-4" novalidate>
          <div class="flex items-start gap-3">
            ${Fin.icones?Fin.icones.badge(e.icone||"alerta",a?"rose":"amber","w-10 h-10","w-6 h-6"):""}
            <div class="flex-1 min-w-0">
              <h2 class="font-semibold text-lg leading-tight">${e.titulo}</h2>
              ${e.intro?`<p class="text-sm text-slate-600 mt-1">${e.intro}</p>`:""}
            </div>
            <button type="button" data-nao class="icon-btn shrink-0" aria-label="Cancelar">✕</button>
          </div>
          ${e.avisos?.length?`<ul class="text-sm bg-amber-50 text-amber-900 rounded-xl px-3 py-2.5 space-y-1.5">${o(e.avisos,"!","text-amber-700")}</ul>`:""}
          ${e.perde?.length?`
            <div class="rounded-xl border ${a?"border-rose-200 bg-rose-50/60":"border-amber-200 bg-amber-50/60"} px-3 py-2.5">
              <div class="text-xs font-semibold uppercase tracking-wide ${a?"text-rose-700":"text-amber-800"} mb-1.5">O que vai acontecer</div>
              <ul class="text-sm space-y-1.5">${o(e.perde,"✕",a?"text-rose-600":"text-amber-700")}</ul>
            </div>`:""}
          ${e.mantem?.length?`
            <div class="rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5">
              <div class="text-xs font-semibold uppercase tracking-wide text-emerald-800 mb-1.5">Continua como está</div>
              <ul class="text-sm space-y-1.5">${o(e.mantem,"✓","text-emerald-700")}</ul>
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
        </form>`,e.titulo.replace(/<[^>]+>/g,""));let r=!1;const c=p=>{r||(r=!0,m.disconnect(),y(),t(p))},m=new MutationObserver(()=>{!s.isConnected&&!r&&(r=!0,m.disconnect(),t(!1))});m.observe(document.getElementById("modal-root"),{childList:!0});const i=s.querySelector("form"),d=s.querySelector("[data-sim]"),u=()=>s.querySelector("[data-ciente]").checked&&(!e.palavra||(s.querySelector("[data-palavra]").value||"").trim().toUpperCase()===e.palavra);i.addEventListener("input",()=>{d.disabled=!u()}),i.addEventListener("change",()=>{d.disabled=!u()}),i.addEventListener("submit",p=>{p.preventDefault(),u()&&c(!0)}),s.querySelectorAll("[data-nao]").forEach(p=>p.addEventListener("click",()=>c(!1))),s.querySelector("[data-backup]")?.addEventListener("click",async p=>{const b=p.currentTarget;b.disabled=!0;try{await e.backup(),b.textContent="✓ Backup baixado"}catch(f){b.disabled=!1,g(f.message,"error")}}),setTimeout(()=>s.querySelector("[data-nao]")?.focus(),40)})}function z(e){const t=l.currentYM();return`
      <div class="barra-mes hero-topo flex items-center justify-between rounded-2xl shadow-sm px-2 py-2 text-white">
        <button data-month="-1" class="icon-btn" aria-label="Mês anterior">‹</button>
        <div class="text-center">
          <div class="font-semibold">${l.monthLong(e)}</div>
          ${e!==t?'<button data-month="0" class="hero-rotulo text-[11px] font-semibold uppercase tracking-wider text-white/80 hover:underline">voltar para o mês atual</button>':'<div class="hero-rotulo text-[11px] font-semibold uppercase tracking-wider text-white/75">mês atual</div>'}
        </div>
        <button data-month="1" class="icon-btn" aria-label="Próximo mês">›</button>
      </div>`}function B(e){const t=Fin.finance.statusEfetivo(e),a=e.tipo==="receita",o={pago:["✓",a?"Recebido":"Pago","bg-emerald-50 text-emerald-800"],aberto:["○",a?"A receber":"A pagar","bg-slate-100 text-slate-600"],atrasado:["!","Atrasado","bg-rose-50 text-rose-700"],parcial:["◐","Parcial","bg-amber-50 text-amber-800"]},[s,r,c]=o[t],m=t==="pago"?"Marcar como não pago":a?"Marcar como recebido":"Marcar como pago";return`<button type="button" data-toggle-pago="${e.id}" class="pill ${c}" title="${m}" aria-label="${r}. ${m}">
      <span aria-hidden="true">${s}</span>${r}</button>`}function T(e){const t=Fin.finance.conciliar(e),a=e.tipo==="receita";if(t.situacao==="pendente"||t.situacao==="atrasado")return"";const o=e.dataPagamento?` · ${l.date(e.dataPagamento).slice(0,5)}`:"";if(t.situacao==="parcial")return`<div class="text-[11px] text-amber-800 tabular-nums">${a?"recebido":"pago"} ${l.brl(t.pago)}${o} · falta ${l.brl(t.falta)}</div>`;const s=t.situacao==="maior"?` <span class="text-amber-800">+${l.brl(t.diferenca)}</span>`:t.situacao==="menor"?` <span class="text-emerald-800">−${l.brl(-t.diferenca)}</span>`:"";return`<div class="text-[11px] text-slate-500 tabular-nums">${a?"recebido":"pago"} ${l.brl(t.pago)}${o}${s}</div>`}function O(e,t=null,{compacto:a=!1}={}){const o=t?t.parciais.length:0,s=t?t.encargos+t.pagoAMais:0,r=t&&(o>1||s>0)?`
      <p class="text-xs bg-white/70 rounded-lg px-2 py-1.5">
        Nos últimos ${t.meses} meses: <b>${o} fatura${o===1?"":"s"} paga${o===1?"":"s"} a menos</b>${s>0?` · <b>${l.brl(s)}</b> em juros, IOF e multa já identificados`:""}.
        ${o>=3?"Virou hábito — e é o que mais pesa no orçamento.":""}</p>`:"",c=a?"":`
      <p class="text-xs text-rose-900/80">Se não der para pagar tudo, compare antes: o <b>parcelamento da fatura</b> oferecido pelo banco costuma ter juros menores que o rotativo. E segure novas compras no cartão até zerar o saldo.</p>`;return`
      <div class="rounded-xl bg-rose-50 text-rose-900 border border-rose-200 px-3 py-2.5 text-sm space-y-1.5" role="note">
        <p class="font-semibold"><span aria-hidden="true">⚠️</span> Fatura paga a menos: ${l.brl(e.falta)} vão para o rotativo</p>
        <p class="text-xs">O que falta volta na próxima fatura com <b>juros, IOF e multa</b>. O rotativo é um dos créditos mais caros do mercado (costuma passar de 10% ao mês): só no próximo mês, pode custar <b>mais de ${l.brl(e.custoMes)}</b> — e os juros crescem sobre os juros.</p>
        ${r}${c}
      </div>`}function R(e,t,a){const o=a==="receita"?"bg-emerald-50":"bg-slate-100",s=e||l.esc((t||"?").slice(0,1).toUpperCase());return`<span class="w-10 h-10 shrink-0 rounded-full ${o} grid place-items-center text-lg" aria-hidden="true">${s}</span>`}function D(e,t,a,o=""){return`
      <div class="bg-white rounded-2xl shadow-sm p-8 text-center">
        ${Fin.icones?.doEmoji(e)?`<div class="relative mx-auto mb-3 w-16 h-16" aria-hidden="true">
              <span class="absolute -right-2 -top-1 text-prim-200">${Fin.icone("moedas","w-6 h-6")}</span>
              <span class="w-16 h-16 rounded-2xl bg-prim-50 text-prim-600 grid place-items-center">${Fin.icone(Fin.icones.doEmoji(e),"w-8 h-8")}</span>
            </div>`:`<div class="text-4xl mb-2" aria-hidden="true">${e}</div>`}
        <h2 class="font-semibold">${t}</h2>
        <p class="text-sm text-slate-500 mt-1">${a}</p>
        ${o?`<div class="mt-4">${o}</div>`:""}
      </div>`}return{toast:g,openModal:L,closeModal:y,confirmar:I,perguntar:j,filtroPessoa:P,autorMini:A,monthNav:z,statusPill:B,pagamentoLinha:T,alertaRotativo:O,catIcon:R,emptyState:D}})();
