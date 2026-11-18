/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.sugestoes=(()=>{const i=()=>Fin.storage,u=e=>Fin.fmt.esc(e),p={melhoria:["Sugestão de melhoria","mais"],problema:["Problema / erro","alerta"],duvida:["Dúvida","lupa"]},f=[["","Geral / várias telas"],["/dashboard","Início"],["/lancamentos","Lançamentos"],["/planilha","Planilha"],["/cartoes","Cartões"],["/investimentos","Investimentos"],["/relatorios","Relatórios"],["/orcamento","Orçamento"],["/conciliacao","Conciliação"],["/categorias","Categorias"],["/dados","Dados e backup"],["/configuracoes","Configurações"],["/educacao","Aprender"]],x=e=>(f.find(([t])=>t===e)||["",e||"Geral"])[1],y=()=>[...i().list("sugestoes")].sort((e,t)=>(t.criadoEm||"").localeCompare(e.criadoEm||"")),O=()=>y().filter(e=>(e.status||"nova")==="nova").length,$=()=>i().list("invConfig").find(e=>e.id==="sugestoes")||{},S=()=>$().email||"";function T(e){i().upsert("invConfig",{...$(),id:"sugestoes",email:String(e||"").trim()})}function I(){const e=navigator.userAgent,t=/Android/i.test(e)?"Android":/iPhone|iPad/i.test(e)?"iPhone/iPad":/Windows/i.test(e)?"Windows":/Mac/i.test(e)?"Mac":"Outro",n=/Edg\//.test(e)?"Edge":/Chrome\//.test(e)?"Chrome":/Safari\//.test(e)?"Safari":/Firefox\//.test(e)?"Firefox":"navegador",o=matchMedia("(display-mode: standalone)").matches?"app instalado":"site";return`${t} · ${n} · ${o} · tela ${innerWidth}×${innerHeight}`}function d(e){const[t]=p[e.tipo]||p.melhoria,n=new Date(e.criadoEm).toLocaleString("pt-BR"),o=[`Tipo: ${t}`,`Tela: ${x(e.tela)}`,`Enviado por: ${e.autorNome||"—"}${e.autorUsuario?` (usuário ${e.autorUsuario})`:""}`,`Data: ${n}`,...e.tecnico?[`Versão do app: ${e.versao||"—"}`,`Aparelho: ${e.aparelho||"—"}`]:[],"",e.tipo==="problema"?"O que aconteceu:":e.tipo==="duvida"?"Dúvida:":"Sugestão:",e.descricao||"—",...e.tipo==="problema"&&e.esperado?["","O que eu esperava:",e.esperado]:[],...e.tipo==="problema"&&e.passos?["","Como acontece (passo a passo):",e.passos]:[]];return{assunto:`[Valoris] ${t}: ${e.titulo}`,corpo:o.join(`
`)}}function w(e){const t=S();if(!t)return null;const n=d(e);return`mailto:${encodeURIComponent(t)}?subject=${encodeURIComponent(n.assunto)}&body=${encodeURIComponent(n.corpo)}`}async function F(e){const t=d(e);await navigator.clipboard.writeText(`${t.assunto}

${t.corpo}`)}const q="https://api.valoris.net.br/sugestao",m=()=>`${Fin.PREFIXO||"fin:"}sugResponder`,E=()=>{try{return localStorage.getItem(m())||""}catch{return""}},L=e=>{try{e?localStorage.setItem(m(),e):localStorage.removeItem(m())}catch{}};async function b(e,t="",n=""){const o=d(e),c=new AbortController,s=setTimeout(()=>c.abort(),15e3);try{const a=await fetch(q,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({assunto:o.assunto,texto:o.corpo,responder:t,site:n}),signal:c.signal}),r=await a.json().catch(()=>({}));return a.ok&&r.ok?{ok:!0}:{ok:!1,erro:r.erro||`O servidor respondeu ${a.status}.`}}catch{return{ok:!1,erro:navigator.onLine?"Não foi possível falar com o servidor agora.":"Sem internet agora."}}finally{clearTimeout(s)}}function P(e){const t=(Fin.router.current?.()||"").split("?")[0],n=Fin.ui.openModal(`
      <form id="sug-form" novalidate>
        <div data-arrastar class="flex items-center justify-between gap-2 px-5 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 class="font-semibold text-lg">Sugestão ou problema</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <div class="px-5 py-4 space-y-4">
          <fieldset><legend class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">O que você quer enviar?</legend>
            <div class="grid grid-cols-3 gap-2">${Object.entries(p).map(([s,[a,r]],l)=>`
              <label class="quem-opcao"><input type="radio" name="tipo" value="${s}" ${l===0?"checked":""}><span class="!flex-col !gap-1 text-center !py-2">${Fin.icone(r,"w-5 h-5")}<span class="text-xs leading-tight">${a}</span></span></label>`).join("")}
            </div></fieldset>
          <label class="field"><span>Em qual tela?</span>
            <select name="tela" class="input">${f.map(([s,a])=>`<option value="${s}" ${s===t?"selected":""}>${a}</option>`).join("")}</select></label>
          <label class="field"><span>Título *</span>
            <input name="titulo" class="input" maxlength="80" placeholder="Ex.: Poder filtrar por forma de pagamento" required /></label>
          <label class="field"><span data-rot-desc>Conte com detalhes *</span>
            <textarea name="descricao" class="input min-h-[6rem]" maxlength="2000" required placeholder="O que você gostaria, ou o que aconteceu"></textarea></label>
          <div data-so-problema class="space-y-4 hidden">
            <label class="field"><span>O que você esperava que acontecesse?</span>
              <textarea name="esperado" class="input min-h-[4rem]" maxlength="1000"></textarea></label>
            <label class="field"><span>Como repetir o problema (passo a passo)</span>
              <textarea name="passos" class="input min-h-[4rem]" maxlength="1000" placeholder="1. Abri Lançamentos  2. Toquei em…"></textarea></label>
          </div>
          <label class="field"><span>Seu e-mail para resposta <span class="font-normal text-slate-500">(opcional)</span></span>
            <input name="responder" type="email" class="input" maxlength="120" autocomplete="email" placeholder="Se quiser que a equipe te responda" value="${u(E())}" /></label>
          <label class="flex items-start gap-2 text-sm cursor-pointer">
            <input type="checkbox" name="tecnico" checked class="accent-prim-600 w-4 h-4 mt-0.5" />
            <span>Incluir informações técnicas (versão do app e tipo de aparelho). <span class="text-slate-500">Nenhum valor ou lançamento seu vai junto.</span></span>
          </label>
          <!-- Armadilha anti-robô: escondida de pessoas; se vier preenchida, o servidor descarta. -->
          <div class="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true"><label>Site<input name="site" tabindex="-1" autocomplete="off" /></label></div>
          <p data-erro class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
        </div>
        <div class="flex items-center gap-2 px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
          <span class="flex-1"></span>
          <button type="button" data-close class="btn btn-ghost">Cancelar</button>
          <button type="submit" class="btn btn-primary">Enviar</button>
        </div>
      </form>`,"Sugestão ou problema"),o=n.querySelector("form");n.querySelectorAll("[data-close]").forEach(s=>s.addEventListener("click",()=>Fin.ui.closeModal()));const c=()=>{const s=o.querySelector("[name=tipo]:checked").value;o.querySelector("[data-so-problema]").classList.toggle("hidden",s!=="problema"),o.querySelector("[data-rot-desc]").textContent=s==="problema"?"O que aconteceu? *":s==="duvida"?"Qual é a dúvida? *":"Conte com detalhes *"};o.addEventListener("change",c),o.addEventListener("submit",async s=>{s.preventDefault();const a=o.elements,r=o.querySelector("[data-erro]");if(!a.titulo.value.trim()||!a.descricao.value.trim()){r.textContent="Preencha o título e a descrição.",r.classList.remove("hidden");return}const l=a.responder.value.trim();if(l&&!a.responder.checkValidity()){r.textContent="Confira o e-mail para resposta (ou deixe em branco).",r.classList.remove("hidden");return}const v=o.querySelector("[type=submit]");if(v.disabled)return;v.disabled=!0,v.textContent="Enviando…",r.classList.add("hidden");const h=a.tecnico.checked,D=Fin.membros?.atual?.(),g=i().upsert("sugestoes",{tipo:o.querySelector("[name=tipo]:checked").value,tela:a.tela.value,titulo:a.titulo.value.trim(),descricao:a.descricao.value.trim(),esperado:a.esperado.value.trim()||null,passos:a.passos.value.trim()||null,autor:Fin.cofre?.membroId?.()||"m1",autorNome:Fin.membros?.nome?.(D)||"",autorUsuario:Fin.cofre?.usuario?.()||"",tecnico:h,versao:h?`${Fin.config?.versaoApp||""} (${await Promise.race([Fin.pwa?.versao?.()??null,new Promise(M=>setTimeout(()=>M(null),2500))])||"—"})`:null,aparelho:h?I():null,status:"nova"});L(l);const C=await b(g,l,a.site.value);C.ok&&i().upsert("sugestoes",{id:g.id,enviadoEm:new Date().toISOString()}),Fin.ui.closeModal(),e?.(g,C)})}function k(e,t={ok:!1}){if(t.ok){Fin.ui.openModal(`
        <div class="p-5 space-y-4 text-center">
          <div class="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 grid place-items-center">${Fin.icone("check","w-8 h-8")}</div>
          <div><h2 class="font-semibold text-lg">Enviado! Obrigado</h2>
            <p class="text-sm text-slate-600 mt-1">Sua mensagem já chegou à equipe do Valoris.${e.autor&&Fin.cofre?.ehPrincipal?.()?" Ela também fica em <b>Sugestões recebidas</b>.":""}</p></div>
          <button type="button" data-close class="btn btn-primary w-full">Fechar</button>
        </div>`,"Sugestão enviada").querySelector("[data-close]").addEventListener("click",()=>Fin.ui.closeModal());return}const n=w(e),o=d(e),c=`https://wa.me/?text=${encodeURIComponent(`${o.assunto}

${o.corpo}`)}`,s=Fin.ui.openModal(`
      <div class="p-5 space-y-4 text-center">
        <div class="mx-auto w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 grid place-items-center">${Fin.icone("alerta","w-8 h-8")}</div>
        <div><h2 class="font-semibold text-lg">Não deu para enviar agora</h2>
          <p class="text-sm text-slate-600 mt-1">${u(t.erro||"Tente de novo em instantes.")} Sua mensagem ficou guardada no app.</p></div>
        <div class="grid gap-2">
          <button type="button" data-tentar class="btn btn-primary">Tentar de novo</button>
          <a href="${u(c)}" target="_blank" rel="noopener" class="btn btn-ghost">${Fin.icone("mensagem","w-4 h-4")} Enviar pelo WhatsApp</a>
          ${n?`<a href="${u(n)}" class="btn btn-ghost" data-email>Enviar por e-mail</a>`:""}
          <button type="button" data-copiar class="btn btn-ghost">Copiar relatório</button>
          <button type="button" data-close class="btn btn-ghost">Fechar</button>
        </div>
      </div>`,"Sugestão não enviada");s.querySelector("[data-close]").addEventListener("click",()=>Fin.ui.closeModal()),s.querySelector("[data-copiar]").addEventListener("click",async()=>{try{await F(e),Fin.ui.toast("Relatório copiado.")}catch{Fin.ui.toast("Não foi possível copiar.","error")}}),s.querySelector("[data-tentar]").addEventListener("click",async a=>{const r=a.currentTarget;r.disabled=!0,r.textContent="Enviando…";const l=await b(e,E());l.ok&&i().upsert("sugestoes",{id:e.id,enviadoEm:new Date().toISOString()}),Fin.ui.closeModal(),k(e,l)})}function A(e,t){i().upsert("sugestoes",{id:e,status:t})}function j(e){i().remove("sugestoes",e)}return{TIPOS:p,nomeTela:x,lista:y,novas:O,emailDestino:S,salvarEmail:T,relatorio:d,mailto:w,copiar:F,abrir:P,enviado:k,enviarDireto:b,marcar:A,excluir:j,ENDPOINT:q}})();
