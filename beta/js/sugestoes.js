/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.sugestoes=(()=>{const i=()=>Fin.storage,f=e=>Fin.fmt.esc(e),l={melhoria:["Sugestão de melhoria","mais"],problema:["Problema / erro","alerta"],duvida:["Dúvida","lupa"]},u=[["","Geral / várias telas"],["/dashboard","Início"],["/lancamentos","Lançamentos"],["/planilha","Planilha"],["/cartoes","Cartões"],["/investimentos","Investimentos"],["/relatorios","Relatórios"],["/orcamento","Orçamento"],["/conciliacao","Conciliação"],["/categorias","Categorias"],["/dados","Dados e backup"],["/configuracoes","Configurações"],["/educacao","Aprender"]],p=e=>(u.find(([a])=>a===e)||["",e||"Geral"])[1],m=()=>[...i().list("sugestoes")].sort((e,a)=>(a.criadoEm||"").localeCompare(e.criadoEm||"")),x=()=>m().filter(e=>(e.status||"nova")==="nova").length,b=()=>i().list("invConfig").find(e=>e.id==="sugestoes")||{},v=()=>b().email||"";function $(e){i().upsert("invConfig",{...b(),id:"sugestoes",email:String(e||"").trim()})}function y(){const e=navigator.userAgent,a=/Android/i.test(e)?"Android":/iPhone|iPad/i.test(e)?"iPhone/iPad":/Windows/i.test(e)?"Windows":/Mac/i.test(e)?"Mac":"Outro",o=/Edg\//.test(e)?"Edge":/Chrome\//.test(e)?"Chrome":/Safari\//.test(e)?"Safari":/Firefox\//.test(e)?"Firefox":"navegador",t=matchMedia("(display-mode: standalone)").matches?"app instalado":"site";return`${a} · ${o} · ${t} · tela ${innerWidth}×${innerHeight}`}function d(e){const[a]=l[e.tipo]||l.melhoria,o=new Date(e.criadoEm).toLocaleString("pt-BR"),t=[`Tipo: ${a}`,`Tela: ${p(e.tela)}`,`Enviado por: ${e.autorNome||"—"}${e.autorUsuario?` (usuário ${e.autorUsuario})`:""}`,`Data: ${o}`,...e.tecnico?[`Versão do app: ${e.versao||"—"}`,`Aparelho: ${e.aparelho||"—"}`]:[],"",e.tipo==="problema"?"O que aconteceu:":e.tipo==="duvida"?"Dúvida:":"Sugestão:",e.descricao||"—",...e.tipo==="problema"&&e.esperado?["","O que eu esperava:",e.esperado]:[],...e.tipo==="problema"&&e.passos?["","Como acontece (passo a passo):",e.passos]:[]];return{assunto:`[Valoris] ${a}: ${e.titulo}`,corpo:t.join(`
`)}}function g(e){const a=v();if(!a)return null;const o=d(e);return`mailto:${encodeURIComponent(a)}?subject=${encodeURIComponent(o.assunto)}&body=${encodeURIComponent(o.corpo)}`}async function h(e){const a=d(e);await navigator.clipboard.writeText(`${a.assunto}

${a.corpo}`)}function F(e){const a=(Fin.router.current?.()||"").split("?")[0],o=Fin.ui.openModal(`
      <form id="sug-form" novalidate>
        <div data-arrastar class="flex items-center justify-between gap-2 px-5 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 class="font-semibold text-lg">Sugestão ou problema</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <div class="px-5 py-4 space-y-4">
          <fieldset><legend class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">O que você quer enviar?</legend>
            <div class="grid grid-cols-3 gap-2">${Object.entries(l).map(([s,[n,c]],r)=>`
              <label class="quem-opcao"><input type="radio" name="tipo" value="${s}" ${r===0?"checked":""}><span class="!flex-col !gap-1 text-center !py-2">${Fin.icone(c,"w-5 h-5")}<span class="text-xs leading-tight">${n}</span></span></label>`).join("")}
            </div></fieldset>
          <label class="field"><span>Em qual tela?</span>
            <select name="tela" class="input">${u.map(([s,n])=>`<option value="${s}" ${s===a?"selected":""}>${n}</option>`).join("")}</select></label>
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
          <label class="flex items-start gap-2 text-sm cursor-pointer">
            <input type="checkbox" name="tecnico" checked class="accent-prim-600 w-4 h-4 mt-0.5" />
            <span>Incluir informações técnicas (versão do app e tipo de aparelho). <span class="text-slate-500">Nenhum valor ou lançamento seu vai junto.</span></span>
          </label>
          <p data-erro class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
        </div>
        <div class="flex items-center gap-2 px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
          <span class="flex-1"></span>
          <button type="button" data-close class="btn btn-ghost">Cancelar</button>
          <button type="submit" class="btn btn-primary">Enviar</button>
        </div>
      </form>`,"Sugestão ou problema"),t=o.querySelector("form");o.querySelectorAll("[data-close]").forEach(s=>s.addEventListener("click",()=>Fin.ui.closeModal()));const C=()=>{const s=t.querySelector("[name=tipo]:checked").value;t.querySelector("[data-so-problema]").classList.toggle("hidden",s!=="problema"),t.querySelector("[data-rot-desc]").textContent=s==="problema"?"O que aconteceu? *":s==="duvida"?"Qual é a dúvida? *":"Conte com detalhes *"};t.addEventListener("change",C),t.addEventListener("submit",async s=>{s.preventDefault();const n=t.elements,c=t.querySelector("[data-erro]");if(!n.titulo.value.trim()||!n.descricao.value.trim()){c.textContent="Preencha o título e a descrição.",c.classList.remove("hidden");return}const r=n.tecnico.checked,E=Fin.membros?.atual?.(),k=i().upsert("sugestoes",{tipo:t.querySelector("[name=tipo]:checked").value,tela:n.tela.value,titulo:n.titulo.value.trim(),descricao:n.descricao.value.trim(),esperado:n.esperado.value.trim()||null,passos:n.passos.value.trim()||null,autor:Fin.cofre?.membroId?.()||"m1",autorNome:Fin.membros?.nome?.(E)||"",autorUsuario:Fin.cofre?.usuario?.()||"",tecnico:r,versao:r?`${Fin.config?.versaoApp||""} (${await Promise.race([Fin.pwa?.versao?.()??null,new Promise(P=>setTimeout(()=>P(null),2500))])||"—"})`:null,aparelho:r?y():null,status:"nova"});Fin.ui.closeModal(),e?.(k)})}function q(e){const a=g(e),o=Fin.cofre?.ehPrincipal?.(),t=Fin.ui.openModal(`
      <div class="p-5 space-y-4 text-center">
        <div class="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 grid place-items-center">${Fin.icone("check","w-8 h-8")}</div>
        <div><h2 class="font-semibold text-lg">Obrigado!</h2>
          <p class="text-sm text-slate-600 mt-1">${o?"Ficou guardado em <b>Sugestões recebidas</b>.":"Ficou guardado no app e chega ao titular na próxima sincronização."}${a?" Se quiser, envie também por e-mail.":""}</p></div>
        <div class="grid gap-2">
          ${a?`<a href="${f(a)}" class="btn btn-primary" data-email>${Fin.icone("mensagem","w-4 h-4")} Enviar por e-mail</a>`:""}
          <button type="button" data-copiar class="btn btn-ghost">Copiar relatório</button>
          <button type="button" data-close class="btn btn-ghost">Fechar</button>
        </div>
        ${!a&&o?'<p class="text-xs text-slate-500">Para receber por e-mail, informe o endereço em Configurações → Sugestões.</p>':""}
      </div>`,"Sugestão enviada");t.querySelector("[data-close]").addEventListener("click",()=>Fin.ui.closeModal()),t.querySelector("[data-copiar]").addEventListener("click",async()=>{try{await h(e),Fin.ui.toast("Relatório copiado.")}catch{Fin.ui.toast("Não foi possível copiar.","error")}})}function S(e,a){i().upsert("sugestoes",{id:e,status:a})}function w(e){i().remove("sugestoes",e)}return{TIPOS:l,nomeTela:p,lista:m,novas:x,emailDestino:v,salvarEmail:$,relatorio:d,mailto:g,copiar:h,abrir:F,enviado:q,marcar:S,excluir:w}})();
