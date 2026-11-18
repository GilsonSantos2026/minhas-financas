/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.configuracoes=(()=>{const x=Fin.fmt,o=e=>x.esc(e),v=(e,i="")=>`<section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5 min-w-0 ${i}">${e}</section>`;function h(e,i){const a={...e,...i},r=i.nome??e.nome??"";return v(`
      ${Fin.icones.titulo("usuario","prim","Perfil",{cls:"mb-4"})}
      <div class="flex flex-col sm:flex-row sm:items-center gap-5">
        <div class="relative mx-auto sm:mx-0 shrink-0">
          ${Fin.membros.avatar(a,{tam:"w-24 h-24",txt:"text-2xl",anel:"ring-4 ring-prim-50"})}
          <label for="perfil-foto" class="absolute -right-1 -bottom-1 w-9 h-9 rounded-full bg-prim-600 text-white grid place-items-center shadow cursor-pointer hover:bg-prim-700" title="Trocar foto">
            ${Fin.icone("camera","w-[18px] h-[18px]")}<span class="sr-only">Trocar foto</span>
          </label>
          <input id="perfil-foto" type="file" accept="image/*" class="sr-only" />
        </div>
        <div class="flex-1 min-w-0 space-y-3">
          <label class="field"><span>Como você quer ser chamado(a)?</span>
            <input id="perfil-nome" class="input" maxlength="40" autocomplete="nickname" placeholder="Ex.: ${o(Fin.membros.nome(e)||"seu nome")}" value="${o(r)}" /></label>
          <p class="text-xs text-slate-500">Aparece na saudação do Início e, no modo casal, nos seus lançamentos.
            Usuário de acesso: <b class="text-slate-700">${o(Fin.cofre?.usuario?.()||"—")}</b> (não muda).</p>
          <div class="flex flex-wrap items-center gap-2">
            <label for="perfil-foto" class="btn btn-ghost !py-1.5 cursor-pointer">${Fin.icone("camera","w-4 h-4")} ${a.foto?"Trocar foto":"Escolher foto"}</label>
            ${a.foto?'<button data-act="sem-foto" class="btn btn-danger-ghost !py-1.5">Remover foto</button>':""}
          </div>
        </div>
      </div>
      <div class="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 text-sm text-slate-600 flex-1 min-w-[12rem]">
          <span class="text-xs text-slate-400">Prévia:</span>
          ${Fin.membros.avatar({...a,nome:r},{tam:"w-7 h-7",txt:"text-[10px]"})}
          <span id="perfil-previa" class="font-medium text-slate-800">${o(Fin.membros.saudacao())}${Fin.membros.primeiroNome({...a,nome:r})?`, ${o(Fin.membros.primeiroNome({...a,nome:r}))}`:""}!</span>
        </div>
        <button data-act="salvar-perfil" class="btn btn-primary" ${i.sujo?"":"disabled"}>Salvar perfil</button>
      </div>`)}function w(){const e=Fin.tema.atual(),i=Fin.tema.porId(e);return v(`
      ${Fin.icones.titulo("paleta","prim","Cor do app",{cls:"mb-1"})}
      <p class="text-sm text-slate-500 mb-4">A primeira, <b>Valoris</b> (azul-marinho com dourado), é a cor da marca e o padrão. Toque em outra se preferir: botões, menu e destaques mudam na hora. As cores de significado
        (pago, atrasado, receitas e despesas nos gráficos) continuam as mesmas.</p>
      <div class="grid grid-cols-6 gap-3 sm:gap-4 max-w-md mx-auto" role="radiogroup" aria-label="Cor do app">
        ${Fin.tema.TEMAS.map(a=>`
          <button type="button" role="radio" aria-checked="${a.id===e}" data-tema="${a.id}" title="${o(a.nome)}"
            class="tema-bolinha aspect-square w-full max-w-[3.25rem] mx-auto rounded-full ${a.id===e?"is-ativo":""}"
            style="--cor:${a.cores[a.id==="valoris"?800:600]};${a.id==="valoris"?`background:linear-gradient(135deg, ${a.cores[800]} 58%, ${a.destaque.cor} 58%)`:""}"><span class="sr-only">${o(a.nome)}</span></button>`).join("")}
      </div>
      <p class="text-center font-semibold mt-3" id="tema-nome">${o(i.nome)}</p>`)}function f(){if(!Fin.drive?.configurado())return"";const e=Fin.cofre,i=e.membroId(),a=e.ehPrincipal(),r=Fin.drive.conectado(),u=Fin.drive.compartilhado(),s=e.convitesPendentes(),t=e.pessoas().map(c=>{const m=Fin.membros.porId(c.id),p=Fin.membros.nome(m)||c.usuario,l=[c.principal?"titular":"",c.id===i?"você":""].filter(Boolean);return`
        <li class="flex items-center gap-3 py-2.5">
          ${Fin.membros.avatar(m,{tam:"w-10 h-10",txt:"text-xs"})}
          <span class="flex-1 min-w-0">
            <span class="block text-sm font-medium truncate">${o(p)} ${l.map(d=>`<span class="ml-1 text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">${d}</span>`).join("")}</span>
            <span class="block text-xs text-slate-500 truncate">usuário ${o(c.usuario)}</span>
          </span>
          ${a&&!c.principal?`<button data-act="remover-pessoa" data-id="${o(c.id)}" data-nome="${o(p)}" class="btn btn-danger-ghost !px-2 !py-1 text-xs">Remover</button>`:""}
        </li>`}).join("");let n="";return a?r?u?n=`
        <div class="flex flex-wrap items-center gap-2">
          <button data-act="convidar" class="btn btn-primary">${Fin.icone("usuario","w-4 h-4")} Gerar convite</button>
          <button data-act="acessos-drive" class="btn btn-ghost">Quem acessa a pasta no Drive</button>
        </div>
        ${s.length?`<p class="text-xs text-amber-800 bg-amber-50 rounded-lg px-3 py-2 mt-3">
          ${s.length===1?"1 convite em aberto":`${s.length} convites em aberto`} (vence ${x.dataBR?x.dataBR(s[s.length-1].expira.slice(0,10)):new Date(s[s.length-1].expira).toLocaleDateString("pt-BR")}).
          <button data-act="cancelar-convites" class="underline font-medium ml-1">Cancelar</button></p>`:""}
        <div id="acessos-drive" class="mt-3"></div>
        <p class="text-xs text-slate-500 mt-3">Os dados ficam na pasta <b>${o(Fin.drive.PASTA)}</b> do seu Google Drive. Não apague nem mova o arquivo.</p>`:n=`
        <p class="text-sm text-slate-600">Divida as finanças da casa com outra pessoa: cada um entra com <b>o próprio usuário e senha</b>,
          no próprio celular, e vocês veem e editam os mesmos lançamentos. Os dados continuam cifrados.</p>
        <button data-act="compartilhar" class="btn btn-primary mt-3">${Fin.icone("usuario","w-4 h-4")} Convidar uma pessoa</button>`:n=`<p class="text-sm text-slate-600">Para dividir as finanças com outra pessoa (ex.: esposa ou marido), primeiro
        <a href="#/dados" class="text-prim-700 font-medium hover:underline">conecte o Google Drive em Dados e backup</a>.</p>`:n=`<p class="text-sm text-slate-600">Você entrou pelo convite de <b>${o(e.titular()||"")}</b>. Vocês veem e editam as mesmas finanças; cada um tem a própria senha.</p>`,v(`
      ${Fin.icones.titulo("usuario","prim","Pessoas (finanças da casa)",{cls:"mb-2"})}
      <ul class="divide-y divide-slate-100 mb-3">${t}</ul>
      ${S()}
      ${n}`)}function S(){const e=Fin.cofre.pessoas();if(e.length!==2)return"";const i=Fin.finance.divisao(),[a,r]=e,u=Math.round(i[a.id]),s=Fin.membros,t=n=>o(s.primeiroNome(s.porId(n.id))||n.usuario);return`
      <div class="rounded-xl bg-slate-50 p-3 mb-3">
        <div class="text-sm font-medium">Divisão das contas dos dois</div>
        <p class="text-xs text-slate-500">Quando uma despesa é paga por “Os dois”, quanto fica com cada um (no filtro por pessoa).</p>
        <div class="flex items-center gap-3 mt-2">
          ${s.avatar(s.porId(a.id),{tam:"w-8 h-8",txt:"text-[10px]"})}
          <input type="range" min="0" max="100" step="5" value="${u}" data-divisao class="flex-1 accent-prim-600" aria-label="Parte de ${t(a)} nas contas dos dois" />
          ${s.avatar(s.porId(r.id),{tam:"w-8 h-8",txt:"text-[10px]"})}
        </div>
        <div class="flex justify-between text-xs mt-1 tabular-nums">
          <span><b data-div-a>${u}%</b> ${t(a)}</span><span>${t(r)} <b data-div-b>${100-u}%</b></span>
        </div>
      </div>`}function q(e,i,a){const r=Fin.membros.primeiroNome()||Fin.cofre.usuario(),u=location.origin+location.pathname,s=`${r} te convidou para as finanças da casa no app Valoris.

1) Abra ${u}
2) Toque em "Recebi um convite (finanças da casa)"
3) Entre com o seu Gmail${a?` (${a})`:""} e escolha o arquivo "${Fin.drive.NOME}" na pasta "${Fin.drive.PASTA}"
4) Código do convite: ${e}

O código vale até ${new Date(i).toLocaleDateString("pt-BR")} e só pode ser usado uma vez.`,t=Fin.ui.openModal(`
      <div class="p-5 space-y-4">
        <div class="flex items-center justify-between gap-2">
          <h2 class="font-semibold text-lg">Convite pronto</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <p class="text-sm text-slate-600">Passe este código para a pessoa${a?` (${o(a)})`:""}. Ele aparece <b>só agora</b>:
          se perder, é só gerar outro.</p>
        <div class="bg-prim-50 border border-prim-200 rounded-xl p-4 text-center">
          <code class="text-2xl font-bold tracking-[0.2em] text-prim-800 select-all">${o(e)}</code>
          <p class="text-xs text-slate-500 mt-1">vale até ${new Date(i).toLocaleDateString("pt-BR")} · uso único</p>
        </div>
        <ol class="text-sm text-slate-600 space-y-1 list-decimal pl-5">
          <li>No celular dela/dele: abrir o app (${o(location.host)}) e tocar em <b>“Recebi um convite”</b>.</li>
          <li>Entrar com o <b>Gmail</b>${a?` <b>${o(a)}</b>`:""} e escolher <b>${o(Fin.drive.NOME)}</b> na pasta <b>${o(Fin.drive.PASTA)}</b>.</li>
          <li>Digitar o código e criar o próprio usuário e senha.</li>
        </ol>
        <div class="grid grid-cols-2 gap-2">
          <button data-act="copiar-convite" class="btn btn-ghost">Copiar mensagem</button>
          <a class="btn btn-primary" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(s)}">Enviar no WhatsApp</a>
        </div>
      </div>`,"Convite");t.querySelector("[data-close]").addEventListener("click",()=>Fin.ui.closeModal()),t.querySelector('[data-act="copiar-convite"]').addEventListener("click",async()=>{try{await navigator.clipboard.writeText(s),Fin.ui.toast("Mensagem copiada.")}catch{Fin.ui.toast("Não deu para copiar: selecione o código.","error")}})}function E({primeira:e}){return new Promise(i=>{let a=!1;const r=t=>{a||(a=!0,s.disconnect(),Fin.ui.closeModal(),i(t))},u=Fin.ui.openModal(`
        <form class="p-5 space-y-4" novalidate>
          <div class="flex items-center justify-between gap-2">
            <h2 class="font-semibold text-lg">${e?"Convidar uma pessoa":"Gerar convite"}</h2>
            <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
          </div>
          ${e?`<div class="text-sm text-slate-600 space-y-2">
            <p>O que vai acontecer:</p>
            <ul class="space-y-1.5">
              <li>• Os dados passam da pasta oculta do app para a pasta <b>${o(Fin.drive.PASTA)}</b> no <b>seu</b> Google Drive (continuam cifrados).</li>
              <li>• A pasta é compartilhada com o Gmail abaixo: o Google manda um e-mail avisando.</li>
              <li>• Você recebe um <b>código de convite</b> para passar à pessoa. Com ele, ela cria o próprio usuário e senha.</li>
              <li>• Seus outros aparelhos mudam sozinhos para a pasta nova (pode pedir “Reconectar Google” uma vez).</li>
            </ul>
            <p class="text-xs text-slate-500">Antes, o app pede ao Google a permissão de <b>arquivos criados pelo app</b> (não dá acesso aos seus outros arquivos).</p>
          </div>`:'<p class="text-sm text-slate-600">Para alguém que já tem acesso à pasta, deixe o e-mail em branco. Para uma pessoa nova, informe o Gmail dela.</p>'}
          <label class="field"><span>Gmail da pessoa${e?"":" (opcional)"}</span>
            <input name="email" type="email" class="input" autocomplete="off" placeholder="nome@gmail.com" ${e?"required":""} /></label>
          <p data-erro class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
          <div class="flex justify-end gap-2">
            <button type="button" data-close class="btn btn-ghost">Cancelar</button>
            <button type="submit" class="btn btn-primary">${e?"Compartilhar e gerar convite":"Gerar convite"}</button>
          </div>
        </form>`,"Convidar"),s=new MutationObserver(()=>{document.body.contains(u)||r(null)});s.observe(document.getElementById("modal-root"),{childList:!0}),u.querySelectorAll("[data-close]").forEach(t=>t.addEventListener("click",()=>r(null))),u.querySelector("form").addEventListener("submit",t=>{t.preventDefault();const n=t.target.elements.email.value.trim();if((e||n)&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n)){const c=u.querySelector("[data-erro]");c.textContent="Digite um e-mail válido (o Gmail da pessoa).",c.classList.remove("hidden");return}r({email:n})})})}async function $(e,i){const a=await E({primeira:i});if(a){Fin.ui.toast(i?"Preparando a pasta compartilhada…":"Gerando convite…");try{i?await Fin.drive.ativarCompartilhamento(a.email):a.email&&await Fin.drive.compartilharCom(a.email);const r=await Fin.cofre.criarConvite();if(window.dispatchEvent(new CustomEvent("fin:alterado")),await Fin.drive.sincronizar(),Fin.drive.estado.erro)throw new Error(Fin.drive.estado.erro);q(r.codigo,r.expira,a.email)}catch(r){console.warn("[convite]",r),Fin.ui.toast(r.message||"Não foi possível criar o convite.","error")}e.querySelector("#cfg-pessoas").innerHTML=f()}}async function F(e){const i=e.querySelector("#acessos-drive");i.innerHTML='<p class="text-xs text-slate-500">Consultando o Google Drive…</p>';try{const a=await Fin.drive.acessosDrive();i.innerHTML=`<ul class="text-sm divide-y divide-slate-100 border border-slate-100 rounded-xl px-3">${a.map(r=>`
        <li class="flex items-center gap-2 py-2">
          <span class="flex-1 min-w-0 truncate">${o(r.displayName||r.emailAddress||"Conta Google")}
            <span class="block text-xs text-slate-500 truncate">${o(r.emailAddress||"")} · ${r.role==="owner"?"dono":"pode editar"}</span></span>
          ${r.role==="owner"?"":`<button data-act="remover-drive" data-perm="${o(r.id)}" data-email="${o(r.emailAddress||"")}" class="btn btn-danger-ghost !px-2 !py-1 text-xs">Tirar acesso</button>`}
        </li>`).join("")}</ul>`}catch(a){i.innerHTML=`<p class="text-xs text-rose-700">${o(a.message)}</p>`}}function y(){const e=Fin.sugestoes,i=Fin.cofre.ehPrincipal(),a=i?e.lista():e.lista().filter(t=>t.autor===Fin.cofre.membroId()),r={nova:["nova","bg-amber-100 text-amber-900"],vista:["vista","bg-slate-100 text-slate-600"],feita:["✓ feita","bg-emerald-50 text-emerald-800"]},u=a.slice(0,20).map(t=>{const[n,c]=r[t.status||"nova"]||r.nova,[m,p]=e.TIPOS[t.tipo]||e.TIPOS.melhoria,l=e.mailto(t);return`
        <li class="py-3">
          <details class="group">
            <summary class="flex items-start gap-3 cursor-pointer list-none" data-sug-ver="${o(t.id)}">
              ${Fin.icones.badge(p,t.tipo==="problema"?"rose":t.tipo==="duvida"?"sky":"emerald","w-8 h-8","w-4 h-4")}
              <span class="flex-1 min-w-0">
                <span class="block text-sm font-medium truncate">${o(t.titulo)}</span>
                <span class="block text-xs text-slate-500 truncate">${o(m)} · ${o(e.nomeTela(t.tela))} · ${o(t.autorNome||t.autorUsuario||"—")} · ${new Date(t.criadoEm).toLocaleDateString("pt-BR")}</span>
              </span>
              <span class="text-[11px] px-1.5 py-0.5 rounded-full shrink-0 ${c}">${n}</span>
            </summary>
            <div class="mt-2 ml-11 space-y-2">
              <pre class="text-xs whitespace-pre-wrap bg-slate-50 rounded-lg p-2.5 text-slate-700 font-sans">${o(e.relatorio(t).corpo)}</pre>
              <div class="flex flex-wrap gap-2">
                ${l?`<a href="${o(l)}" class="btn btn-ghost !py-1 text-xs">${Fin.icone("mensagem","w-3.5 h-3.5")} E-mail</a>`:""}
                <button data-act="sug-copiar" data-id="${o(t.id)}" class="btn btn-ghost !py-1 text-xs">Copiar relatório</button>
                ${i?`
                  ${(t.status||"nova")!=="feita"?`<button data-act="sug-status" data-id="${o(t.id)}" data-status="feita" class="btn btn-ghost !py-1 text-xs">✓ Marcar como feita</button>`:`<button data-act="sug-status" data-id="${o(t.id)}" data-status="vista" class="btn btn-ghost !py-1 text-xs">Reabrir</button>`}
                  <button data-act="sug-excluir" data-id="${o(t.id)}" class="btn btn-danger-ghost !py-1 text-xs">Excluir</button>`:""}
              </div>
            </div>
          </details>
        </li>`}).join(""),s=i?e.novas():0;return v(`
      <div class="flex items-start justify-between gap-2 mb-2">
        ${Fin.icones.titulo("mensagem","prim","Sugestões e problemas")}
        ${s?`<span data-sug-novas class="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-medium shrink-0">${s} nova${s>1?"s":""}</span>`:""}
      </div>
      <p class="text-sm text-slate-500">Achou um erro, tem uma ideia ou uma dúvida? Mande por aqui: o app monta um relatório organizado e ele <b>chega na hora</b> à equipe do Valoris — sem precisar de e-mail.</p>
      <button data-act="sug-nova" class="btn btn-primary mt-3">${Fin.icone("mensagem","w-4 h-4")} Enviar sugestão ou problema</button>
      ${i?`
        <div class="mt-4 rounded-xl bg-slate-50 p-3">
          <label class="field"><span>E-mail para receber as sugestões (opcional)</span>
            <div class="flex gap-2"><input id="sug-email" type="email" class="input" placeholder="seu@email.com" value="${o(e.emailDestino())}" autocomplete="email" />
              <button data-act="sug-email" class="btn btn-ghost shrink-0">Salvar</button></div></label>
          <p class="text-xs text-slate-500 mt-1">Só para a alternativa “Enviar por e-mail” (quando o envio direto não funcionar). Fica guardado cifrado nos dados do app (não vai para o código do site).</p>
        </div>`:""}
      ${u?`<h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500 mt-4">${i?"Sugestões recebidas":"Enviadas por você"}</h3>
        <ul class="divide-y divide-slate-100">${u}</ul>`:""}`)}function k(){return v(`
      ${Fin.icones.titulo("lupa","prim","Ajuda",{cls:"mb-2"})}
      <button data-act="rever-tour" class="w-full flex items-center gap-3 -mx-1 px-1 py-2 rounded-xl hover:bg-slate-50 text-left">
        ${Fin.icones.badge("check","emerald","w-10 h-10")}
        <span class="flex-1 min-w-0"><span class="block text-sm font-medium">Rever tutorial</span>
          <span class="block text-xs text-slate-500">Balões que mostram como lançar receitas e despesas, marcar pago e usar os filtros</span></span>
        <span class="text-slate-300" aria-hidden="true">›</span>
      </button>
      ${Fin.novidadesTela?`<button data-act="novidades" class="w-full flex items-center gap-3 -mx-1 px-1 py-2 rounded-xl hover:bg-slate-50 text-left">
        ${Fin.icones.badge("alta","prim","w-10 h-10")}
        <span class="flex-1 min-w-0"><span class="block text-sm font-medium">Novidades do app</span>
          <span class="block text-xs text-slate-500">O que mudou em cada versão</span></span>
        <span class="text-slate-300" aria-hidden="true">›</span>
      </button>`:""}`)}function T(){return v(`
      <a href="#/dados" class="flex items-center gap-3 -m-1 p-1 rounded-xl hover:bg-slate-50">
        ${Fin.icones.badge("cadeado","slate","w-10 h-10")}
        <span class="flex-1 min-w-0"><span class="block text-sm font-medium">Segurança, backup e Google Drive</span>
          <span class="block text-xs text-slate-500">Senha, bloqueio automático, backup, sincronização e importação</span></span>
        <span class="text-slate-300" aria-hidden="true">›</span>
      </a>`,"!py-3")}function A(e,{signal:i}){const a={sujo:!1},r=()=>{const s=Fin.membros.atual();e.innerHTML=`
        <div class="space-y-4 max-w-2xl mx-auto">
          ${Fin.icones.titulo("engrenagem","prim","Configurações",{tag:"h1",cls:"text-xl hidden md:flex",tam:"w-9 h-9",ic:"w-5 h-5"})}
          <div id="cfg-perfil">${h(s,a)}</div>
          <div id="cfg-pessoas">${f()}</div>
          ${w()}
          ${v(`${Fin.icones.titulo("barras","prim","Modo de exibição",{cls:"mb-2"})}
            <p class="text-sm text-slate-500 mb-3">No <b>Essencial</b>, o app mostra primeiro o que importa e deixa os detalhes a um toque. No <b>Completo</b>, tudo já vem aberto. Nenhuma função some.</p>
            ${Fin.modo.interruptorHTML()}`)}
          ${k()}
          <div id="cfg-sugestoes">${y()}</div>
          ${T()}
          <p class="text-center text-xs text-slate-400 pt-1">© 2026 Valoris Financial Intelligence · <b class="text-slate-500">${o(Fin.config?.versaoApp||"")}</b> <span data-cfg-build></span><br>Todos os direitos reservados.</p>
          <p class="text-center text-xs pt-1"><a href="privacidade.html" target="_blank" rel="noopener" class="text-prim-700 hover:underline">Política de privacidade</a> · <a href="termos.html" target="_blank" rel="noopener" class="text-prim-700 hover:underline">Termos de uso</a></p>
        </div>`},u=()=>{const s=document.activeElement?.id,t=s==="perfil-nome"?document.activeElement.selectionStart:null;if(e.querySelector("#cfg-perfil").innerHTML=h(Fin.membros.atual(),a),s==="perfil-nome"){const n=e.querySelector("#perfil-nome");n.focus(),t!=null&&n.setSelectionRange(t,t)}};r(),Fin.pwa?.versao?.().then(s=>{const t=e.querySelector("[data-cfg-build]");t&&s&&(t.textContent=`· build ${s}`)}).catch(()=>{}),e.addEventListener("input",s=>{if(s.target.id!=="perfil-nome")return;a.nome=s.target.value,a.sujo=!0;const t={...Fin.membros.atual(),...a},n=Fin.membros.primeiroNome(t);e.querySelector("#perfil-previa").textContent=`${Fin.membros.saudacao()}${n?`, ${n}`:""}!`,e.querySelector('[data-act="salvar-perfil"]').disabled=!1},{signal:i}),e.addEventListener("input",s=>{if(!s.target.matches("[data-divisao]"))return;const t=Number(s.target.value);e.querySelector("[data-div-a]").textContent=`${t}%`,e.querySelector("[data-div-b]").textContent=`${100-t}%`},{signal:i}),e.addEventListener("change",s=>{if(!s.target.matches("[data-divisao]"))return;const t=Number(s.target.value),[n,c]=Fin.cofre.pessoas();Fin.finance.salvarDivisao({[n.id]:t,[c.id]:100-t}),Fin.ui.toast("Divisão salva.")},{signal:i}),e.addEventListener("change",async s=>{if(s.target.id!=="perfil-foto")return;const t=s.target.files?.[0];if(s.target.value="",!!t)try{a.foto=await Fin.membros.prepararFoto(t),a.sujo=!0,u(),Fin.ui.toast("Foto pronta. Toque em “Salvar perfil” para guardar.")}catch(n){Fin.ui.toast(n.message||"Não foi possível usar esta imagem.","error")}},{signal:i}),e.addEventListener("click",s=>{const t=s.target.closest("[data-tema]");if(t){const l=Fin.tema.aplicar(t.dataset.tema);try{Fin.membros.atual().tema!==l.id&&Fin.membros.salvarAtual({tema:l.id,temaMarca:1})}catch(d){console.warn("[tema]",d)}e.querySelectorAll("[data-tema]").forEach(d=>{const b=d.dataset.tema===l.id;d.classList.toggle("is-ativo",b),d.setAttribute("aria-checked",String(b))}),e.querySelector("#tema-nome").textContent=l.nome;return}const n=s.target.closest("[data-act]"),c=n?.dataset.act;if(c==="rever-tour")return Fin.tour.iniciar();if(c==="novidades")return Fin.novidadesTela.todas();const m=()=>{e.querySelector("#cfg-sugestoes").innerHTML=y()},p=s.target.closest("[data-sug-ver]");if(p&&Fin.cofre.ehPrincipal()){const l=Fin.sugestoes.lista().find(d=>d.id===p.dataset.sugVer);if(l&&(l.status||"nova")==="nova"){Fin.sugestoes.marcar(l.id,"vista");const d=p.querySelector("span.rounded-full");d&&(d.textContent="vista",d.className="text-[11px] px-1.5 py-0.5 rounded-full shrink-0 bg-slate-100 text-slate-600");const b=e.querySelector("[data-sug-novas]"),g=Fin.sugestoes.novas();b&&(g?b.textContent=`${g} nova${g>1?"s":""}`:b.remove())}}if(c==="sug-nova")return Fin.sugestoes.abrir((l,d)=>{m(),Fin.sugestoes.enviado(l,d)});if(c==="sug-email"){const l=e.querySelector("#sug-email").value.trim();return l&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l)?Fin.ui.toast("Digite um e-mail válido.","error"):(Fin.sugestoes.salvarEmail(l),m(),Fin.ui.toast(l?"E-mail salvo.":"E-mail removido."))}if(c==="sug-copiar"){const l=Fin.sugestoes.lista().find(d=>d.id===n.dataset.id);l&&Fin.sugestoes.copiar(l).then(()=>Fin.ui.toast("Relatório copiado.")).catch(()=>Fin.ui.toast("Não foi possível copiar.","error"));return}if(c==="sug-status")return Fin.sugestoes.marcar(n.dataset.id,n.dataset.status),m();if(c==="sug-excluir")return confirm("Excluir esta sugestão? Não dá para desfazer.")?(Fin.sugestoes.excluir(n.dataset.id),m()):void 0;if(c==="compartilhar")return $(e,!0);if(c==="convidar")return $(e,!1);if(c==="acessos-drive")return F(e);if(c==="cancelar-convites")return Fin.cofre.cancelarConvites(),window.dispatchEvent(new CustomEvent("fin:alterado")),e.querySelector("#cfg-pessoas").innerHTML=f(),Fin.ui.toast("Convites cancelados.");if(c==="remover-drive"){(async()=>{if(await Fin.ui.confirmar({titulo:"Tirar o acesso à pasta no Drive?",icone:"nuvem",cor:"rose",intro:`<b>${o(n.dataset.email||"Esta conta")}</b> deixa de ver a pasta <b>${o(Fin.drive.PASTA)}</b> no Google Drive e para de receber atualizações.`,ciente:"Entendi",botao:"Tirar acesso"}))try{await Fin.drive.removerAcessoDrive(n.dataset.perm),Fin.ui.toast("Acesso à pasta removido."),F(e)}catch(d){Fin.ui.toast(d.message,"error")}})();return}if(c==="remover-pessoa"){(async()=>{const l=n.dataset.nome;if(await Fin.ui.confirmar({titulo:`Remover ${l}?`,icone:"usuario",cor:"rose",intro:`${o(l)} não vai mais conseguir entrar nas finanças da casa com a senha dela/dele.`,perde:[`O acesso de <b>${o(l)}</b> (usuário e senha).`],mantem:["Todos os lançamentos, inclusive os que essa pessoa fez.","Seu acesso e seus outros aparelhos."],avisos:["Para cortar de vez, tire também o acesso dela à pasta no Google Drive (botão “Quem acessa a pasta no Drive”)."],ciente:"Entendi",botao:"Remover acesso"}))try{Fin.cofre.removerPessoa(n.dataset.id),window.dispatchEvent(new CustomEvent("fin:alterado")),e.querySelector("#cfg-pessoas").innerHTML=f(),Fin.ui.toast(`${l} foi removido(a).`)}catch(b){Fin.ui.toast(b.message,"error")}})();return}if(c==="sem-foto")a.foto="",a.sujo=!0,u();else if(c==="salvar-perfil"){const l={};a.nome!==void 0&&(l.nome=a.nome.trim().replace(/\s+/g," ")),a.foto!==void 0&&(l.foto=a.foto),Fin.membros.salvarAtual(l),delete a.nome,delete a.foto,a.sujo=!1,u(),Fin.ui.toast("Perfil salvo.")}},{signal:i}),e.addEventListener("keydown",s=>{const t=s.target.closest("[data-tema]");if(!t||!["ArrowRight","ArrowLeft","ArrowDown","ArrowUp"].includes(s.key))return;s.preventDefault();const n=[...e.querySelectorAll("[data-tema]")],c=n.indexOf(t),m=s.key==="ArrowRight"?1:s.key==="ArrowLeft"?-1:s.key==="ArrowDown"?6:-6,p=n[(c+m+n.length)%n.length];p.focus(),p.click()},{signal:i}),window.addEventListener("fin:dados-externos",()=>{a.sujo||r()},{signal:i})}return{title:"Configurações",render:A}})();
