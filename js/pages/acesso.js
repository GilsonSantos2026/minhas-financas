/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.acesso=(()=>{const g=t=>Fin.fmt.esc(t);let F=()=>{},r=null;const D=5,k=3e4;function R(){return`<div class="fixed inset-0 overflow-hidden pointer-events-none text-white" aria-hidden="true">${[["moedas",6,8,64,-12],["cifrao",80,6,52,10],["alta",12,72,72,0],["cartao",78,66,68,-8],["cofrinho",44,88,56,6],["carteira",88,34,44,12],["pizza",2,40,40,0],["barras",60,24,36,-6]].map(([a,o,e,s,i])=>`<span class="absolute opacity-[0.09]" style="left:${o}%;top:${e}%;transform:rotate(${i}deg)">${Fin.icone(a,"",`width="${s}" height="${s}"`)}</span>`).join("")}</div>`}function p(t){r.innerHTML=`
      <div class="fixed inset-0 z-[60] overflow-y-auto bg-gradient-to-br from-prim-600 to-prim-800">
        ${R()}
        <div class="relative min-h-full flex items-center justify-center p-4">
          <div class="w-full max-w-sm">
            <div class="flex flex-col items-center text-white mb-5">
              <div class="marca-mono w-16 h-16 rounded-2xl shadow-lg" aria-hidden="true"><svg viewBox="22 21 159 139"><polygon points="24,23 55,23 89,100 74,131" fill="#F3F5F8"/><polygon points="147,23 179,23 119,158 87,158" fill="#C6A45C"/><rect x="102" y="23" width="46" height="3.5" fill="#C6A45C"/><line x1="90" y1="93" x2="101.3" y2="69.5" stroke="#C6A45C" stroke-width="4.5"/><polygon points="110,51 94,66 108,73" fill="#C6A45C"/></svg></div>
              <h1 class="marca-nome text-[28px] mt-3">VALORIS</h1>
              <p class="marca-assinatura text-[11px] mt-1">Financial Intelligence</p>
            </div>
            <div class="bg-white rounded-2xl shadow-xl p-6">${t}</div>
            <p class="text-center text-xs text-white/80 mt-4">Seus dados ficam cifrados neste aparelho${Fin.config?.googleClientId?" e no seu Google Drive":""}.<br><span class="opacity-80">${Fin.config?.versaoApp||""}</span>
              · <a href="privacidade.html" target="_blank" rel="noopener" class="underline hover:text-white">Privacidade</a>
              · <a href="termos.html" target="_blank" rel="noopener" class="underline hover:text-white">Termos</a></p>
          </div>
        </div>
      </div>`,r.classList.remove("hidden"),setTimeout(()=>r.querySelector("input:not([type=hidden]):not([readonly])")?.focus(),50)}const m=(t,a,o)=>`
    <label class="field"><span>${a}</span>
      <div class="relative">
        <input name="${t}" type="password" class="input pr-12" autocomplete="${o}" required minlength="${t==="senha"&&o==="current-password"?1:8}" />
        <button type="button" data-olho="${t}" class="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-slate-500 hover:text-slate-800" aria-label="Mostrar senha">mostrar</button>
      </div></label>`,f='<p id="ac-erro" class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>',l=t=>{const a=r.querySelector("#ac-erro");a.textContent=t,a.classList.remove("hidden")},d=(t,a,o)=>{const e=t.querySelector("button[type=submit]");e.disabled=a,o&&(e.dataset.txt=e.dataset.txt||e.textContent),e.textContent=a?o:e.dataset.txt||e.textContent};function v(){r.querySelectorAll("[data-olho]").forEach(t=>t.addEventListener("click",()=>{const a=r.querySelector(`input[name="${t.dataset.olho}"]`),o=a.type==="password";a.type=o?"text":"password",t.textContent=o?"ocultar":"mostrar"}))}function w(t){const a=t.elements.senha,o=t.querySelector("#forca");if(!a||!o)return;const e=["muito fraca","fraca","razoável","boa","forte"],s=["#d03b3b","#ec835a","#fab219","#2a78d6","#0ca30c"];a.addEventListener("input",()=>{const i=Fin.cofre.forcaSenha(a.value);o.innerHTML=a.value?`<span class="inline-block h-1.5 rounded-full align-middle" style="width:${(i+1)*20}%;background:${s[i]}"></span>
        <span class="text-xs text-slate-500 ml-2">${e[i]}</span>`:""})}function S(){const t=!!localStorage.getItem(`${Fin.PREFIXO}lancamentos`);p(`
      <h2 class="font-semibold text-lg">Criar acesso</h2>
      <p class="text-sm text-slate-500 mt-1">${t?"Seus dados atuais serão protegidos (cifrados) com esta senha.":"Defina o usuário e a senha para entrar no app."}</p>
      <form id="ac-form" class="space-y-3 mt-4" novalidate>
        <label class="field"><span>Usuário</span><input name="usuario" class="input" autocomplete="username" maxlength="40" required /></label>
        ${m("senha","Senha (mínimo 8 caracteres)","new-password")}
        <div id="forca" class="h-4"></div>
        ${m("senha2","Repita a senha","new-password")}
        ${f}
        <button type="submit" class="btn btn-primary w-full">Criar acesso</button>
        <p class="text-xs text-slate-600 text-center bg-slate-50 rounded-lg px-3 py-2">Você vai precisar de uma <b>conta Google (Gmail)</b> para usar todas as funções. No teste fechado, use o Gmail que recebeu o convite.</p>
        <p class="text-xs text-slate-500 text-center">Ao criar o acesso, você concorda com os <a href="termos.html" target="_blank" rel="noopener" class="text-prim-700 underline">Termos de uso</a> e a <a href="privacidade.html" target="_blank" rel="noopener" class="text-prim-700 underline">Política de privacidade</a>.</p>
      </form>
      <p class="text-xs text-slate-500 mt-4">Se esquecer a senha, só a <b>chave de recuperação</b> (mostrada a seguir) devolve o acesso.</p>
      ${Fin.config?.googleClientId?`<div class="border-t border-slate-100 mt-4 pt-4 flex flex-col items-center gap-2">
        <button data-ir="drive" class="text-sm text-prim-700 font-semibold hover:underline">Já uso o app em outro aparelho</button>
        <button data-ir="convite" class="text-sm text-prim-700 font-semibold hover:underline">Recebi um convite (finanças da casa)</button></div>`:""}`);const a=r.querySelector("#ac-form");v(),w(a),a.addEventListener("submit",async o=>{o.preventDefault();const e=a.elements.usuario.value.trim(),s=a.elements.senha.value;if(!e)return l("Informe o usuário.");if(s.length<8)return l("A senha precisa ter pelo menos 8 caracteres.");if(s!==a.elements.senha2.value)return l("As senhas não conferem.");d(a,!0,"Protegendo seus dados…");try{const{codigoRecuperacao:i}=await Fin.cofre.criarConta(e,s);await Fin.storage.abrirCofre(),Fin.drive?.configurado()&&!Fin.drive.conectado()&&Fin.storage.setPref("driveOnboarding","pendente"),E(i,"Acesso criado!")}catch(i){d(a,!1),l(i.message)}})}function E(t,a){p(`
      <h2 class="font-semibold text-lg">${a}</h2>
      <p class="text-sm text-slate-600 mt-1">Esta é a sua <b>chave de recuperação</b>. Guarde-a fora deste aparelho
        (papel, gerenciador de senhas). Sem ela, uma senha esquecida não tem volta.</p>
      <div class="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
        <code id="ac-codigo" class="text-base sm:text-lg font-semibold tracking-wider break-all select-all">${g(t)}</code>
      </div>
      <div class="grid grid-cols-2 gap-2 mt-3">
        <button data-acao="copiar" class="btn btn-ghost">Copiar</button>
        <button data-acao="baixar" class="btn btn-ghost">Baixar .txt</button>
      </div>
      <label class="flex items-start gap-2 text-sm mt-4"><input id="ac-ok" type="checkbox" class="mt-0.5 w-4 h-4 accent-prim-600">
        <span>Guardei minha chave de recuperação em local seguro.</span></label>
      <button data-acao="continuar" class="btn btn-primary w-full mt-4" disabled>Continuar</button>`),r.querySelector("#ac-ok").addEventListener("change",o=>{r.querySelector('[data-acao="continuar"]').disabled=!o.target.checked}),r.addEventListener("click",async function o(e){const s=e.target.closest("[data-acao]")?.dataset.acao;if(s==="copiar")try{await navigator.clipboard.writeText(t),Fin.ui.toast("Chave copiada.")}catch{Fin.ui.toast("Selecione e copie a chave manualmente.","error")}if(s==="baixar"){const i=`Valoris — chave de recuperação
Usuário: ${Fin.cofre.usuario()}
Criada em: ${new Date().toLocaleString("pt-BR")}

${t}

Guarde este arquivo fora do aparelho. Quem tiver esta chave consegue redefinir sua senha.
`,u=document.createElement("a");u.href=URL.createObjectURL(new Blob([i],{type:"text/plain"})),u.download="minhas-financas-chave-recuperacao.txt",u.click(),setTimeout(()=>URL.revokeObjectURL(u.href),1e3)}s==="continuar"&&(r.removeEventListener("click",o),T()?C():h())})}const T=()=>!!Fin.drive?.configurado()&&!Fin.drive.conectado()&&Fin.storage.prefs().driveOnboarding==="pendente";function C(){const t=[["autorizar","Autorizando no Google"],["procurar","Procurando dados do app no seu Drive"],["criar","Criando o arquivo cifrado"],["pronto","Pronto! Seus dados estão guardados"]],a=t.map(([n])=>n),o=(n,c,b)=>`
      <li class="flex items-start gap-3">
        <span class="w-9 h-9 shrink-0 rounded-xl bg-prim-50 text-prim-700 grid place-items-center">${Fin.icone(n,"w-5 h-5")}</span>
        <span><span class="block text-sm font-semibold">${c}</span><span class="block text-xs text-slate-500 mt-0.5">${b}</span></span>
      </li>`;p(`
      <h2 class="font-semibold text-lg">Guarde seus dados no Google Drive</h2>
      <p class="text-sm text-slate-500 mt-1">Recomendado — leva menos de um minuto.</p>
      <ul data-beneficios class="space-y-3 mt-4">
        ${o("escudo","Cópia de segurança automática","Trocou ou perdeu o celular? Seus dados continuam lá.")}
        ${o("celular","No celular e no computador","Os mesmos dados em todos os seus aparelhos.")}
        ${o("cadeado","Só você consegue ler","Vai cifrado para uma pasta oculta do Drive. O app não vê seus outros arquivos.")}
      </ul>
      <ol id="ac-passos" class="hidden space-y-2.5 mt-4" aria-live="polite">${t.map(([n,c])=>`
        <li data-passo="${n}" class="flex items-center gap-2.5 text-sm text-slate-400">
          <span data-marca class="w-5 h-5 shrink-0 grid place-items-center rounded-full border-2 border-slate-200"></span>
          <span data-texto>${c}</span></li>`).join("")}</ol>
      <form id="ac-achado-form" class="hidden space-y-3 mt-4" novalidate>
        <p id="ac-achado" class="text-sm text-emerald-800 bg-emerald-50 rounded-lg px-3 py-2"></p>
        <label class="field"><span>Usuário usado lá</span><input name="usuario" class="input" autocomplete="username" required /></label>
        ${m("senha","Senha usada lá","current-password")}
        <button type="submit" class="btn btn-primary w-full">Trazer meus dados</button>
        <button type="button" data-acao="outra" class="w-full text-sm text-slate-500 hover:text-slate-800 hover:underline py-1">Usar outra conta Google</button>
      </form>
      <div class="mt-4">${f}</div>
      <div data-botoes class="mt-4 space-y-2">
        <button type="button" data-acao="conectar" class="btn btn-primary w-full">${Fin.icone("nuvem","w-5 h-5")} <span>Conectar Google Drive</span></button>
        <button type="button" data-acao="depois" class="w-full text-sm text-slate-500 hover:text-slate-800 hover:underline py-1">Agora não</button>
      </div>
      <div data-dica class="text-xs text-slate-500 mt-3 space-y-1.5">
        <p>Na janela do Google, escolha <b>o seu Gmail</b> e deixe <b>marcada</b> a permissão do Google Drive.</p>
        <p>Se aparecer <b>“O Google não verificou este app”</b>, toque no link <b>Avançado</b> e depois em <b>Acessar Valoris</b> (o botão azul “Voltar para a segurança” cancela a conexão).</p>
      </div>`);const e=n=>r.querySelector(n),s=e("#ac-achado-form");v();let i=null;function u(n,c){const b=e(`[data-passo="${n}"]`),x=b.querySelector("[data-marca]");b.className=`flex items-center gap-2.5 text-sm ${c==="feito"?"text-emerald-800":c==="ativo"?"text-slate-800 font-medium":c==="erro"?"text-rose-700":"text-slate-400"}`,x.className=`w-5 h-5 shrink-0 grid place-items-center rounded-full text-[11px] font-bold ${c==="feito"?"bg-emerald-600 text-white":c==="ativo"?"border-2 border-prim-600 border-t-transparent animate-spin":c==="erro"?"bg-rose-600 text-white":"border-2 border-slate-200"}`,x.innerHTML=c==="feito"?Fin.icone("check","w-3.5 h-3.5"):c==="erro"?"!":""}function $(n){n==="juntar"&&(e('[data-passo="criar"] [data-texto]').textContent="Conferindo os dados encontrados",n="criar"),i=n;const c=a.indexOf(n);a.forEach((b,x)=>u(b,x<c||n==="pronto"?"feito":x===c?"ativo":"espera"))}const L=()=>e("#ac-erro").classList.add("hidden");function A(n){$("pronto"),n&&(e('[data-passo="pronto"] [data-texto]').textContent=n),s.classList.add("hidden"),e("[data-botoes]").classList.add("hidden"),e("[data-dica]").classList.add("hidden"),setTimeout(h,n?3200:1600)}function O(n){u("procurar","feito"),u("criar","espera"),e("[data-botoes]").classList.add("hidden"),e("[data-dica]").classList.add("hidden"),e("[data-beneficios]").classList.add("hidden");const c=n.atualizadoEm?` (atualizados em ${new Date(n.atualizadoEm).toLocaleString("pt-BR")})`:"";e("#ac-achado").textContent=`Encontrei dados do app neste Google Drive${c}. Entre com o usuário e a senha usados lá para trazê-los para este aparelho.`,s.elements.usuario.value=n.conta?.usuario||"",s.classList.remove("hidden"),setTimeout(()=>(s.elements.usuario.value?s.elements.senha:s.elements.usuario).focus(),60)}function z(n){L(),n.disabled=!0,n.querySelector("span").textContent="Conectando…",e("#ac-passos").classList.remove("hidden"),Fin.drive.conectar({aoPasso:$}).then(c=>{if(c?.conflito)return O(c.conflito);if(c?.erro)throw new Error(c.erro);A()}).catch(c=>{i&&u(i,"erro"),n.disabled=!1,n.querySelector("span").textContent="Tentar de novo",l(c.message)})}r.querySelector('[data-acao="conectar"]').addEventListener("click",n=>z(n.currentTarget)),r.querySelector('[data-acao="depois"]').addEventListener("click",()=>{Fin.storage.setPref("driveOnboarding","adiado"),h(),Fin.ui.toast("Tudo bem! Dá para conectar depois em Dados e backup.")}),r.querySelector('[data-acao="outra"]').addEventListener("click",()=>{Fin.drive.estado.conflito=null,Fin.drive.desconectar(),C()}),s.addEventListener("submit",async n=>{n.preventDefault(),L(),d(s,!0,"Trazendo seus dados…"),$("juntar"),e('[data-passo="criar"] [data-texto]').textContent="Trazendo seus dados";try{if(await Fin.drive.resolverConflito(s.elements.usuario.value.trim(),s.elements.senha.value),Fin.drive.estado.erro)throw new Error(Fin.drive.estado.erro);A("Pronto! A partir de agora, entre com o usuário e a senha dessa conta (e use a chave de recuperação dela).")}catch(c){d(s,!1),u("criar","erro"),l(c.message)}})}function y(){const t=Fin.cofre.usuario()||"";p(`
      <h2 class="font-semibold text-lg">Entrar</h2>
      <form id="ac-form" class="space-y-3 mt-4" novalidate>
        <label class="field"><span>Usuário</span><input name="usuario" class="input" autocomplete="username" value="${g(t)}" required /></label>
        ${m("senha","Senha","current-password")}
        ${f}
        <button type="submit" class="btn btn-primary w-full">Entrar</button>
      </form>
      <div class="text-center mt-4"><button data-ir="recuperar" class="text-sm text-slate-500 hover:text-slate-800 hover:underline">Esqueci minha senha</button></div>
      ${Fin.config?.googleClientId?'<div class="text-center mt-2"><button data-ir="convite" class="text-sm text-slate-500 hover:text-slate-800 hover:underline">Recebi um convite (finanças da casa)</button></div>':""}`);const a=r.querySelector("#ac-form");t&&setTimeout(()=>a.elements.senha.focus(),60),v(),a.addEventListener("submit",async o=>{o.preventDefault();const e=Number(sessionStorage.getItem(`${Fin.PREFIXO}esperaAte`)||0);if(Date.now()<e)return l(`Muitas tentativas. Aguarde ${Math.ceil((e-Date.now())/1e3)} s.`);Fin.drive?.aoEntrar?.(),d(a,!0,"Entrando…");try{await Fin.cofre.entrar(a.elements.usuario.value,a.elements.senha.value),await Fin.storage.abrirCofre(),sessionStorage.removeItem(`${Fin.PREFIXO}tentativas`),h()}catch(s){d(a,!1);const i=Number(sessionStorage.getItem(`${Fin.PREFIXO}tentativas`)||0)+1;sessionStorage.setItem(`${Fin.PREFIXO}tentativas`,i),i>=D&&(sessionStorage.setItem(`${Fin.PREFIXO}esperaAte`,Date.now()+k),sessionStorage.setItem(`${Fin.PREFIXO}tentativas`,0)),l(s.message),a.elements.senha.select()}})}function X(){p(`
      <h2 class="font-semibold text-lg">Recuperar acesso</h2>
      <p class="text-sm text-slate-500 mt-1">Digite a chave de recuperação e escolha uma senha nova.</p>
      <form id="ac-form" class="space-y-3 mt-4" novalidate>
        <label class="field"><span>Chave de recuperação</span><input name="codigo" class="input font-mono uppercase" autocomplete="off" placeholder="XXXX-XXXX-…" required /></label>
        ${m("senha","Nova senha (mínimo 8 caracteres)","new-password")}
        <div id="forca" class="h-4"></div>
        ${m("senha2","Repita a nova senha","new-password")}
        ${f}
        <button type="submit" class="btn btn-primary w-full">Redefinir senha</button>
      </form>
      <div class="text-center mt-4"><button data-ir="entrar" class="text-sm text-slate-500 hover:underline">Voltar</button></div>`);const t=r.querySelector("#ac-form");v(),w(t),t.addEventListener("submit",async a=>{a.preventDefault();const o=t.elements.senha.value;if(o.length<8)return l("A senha precisa ter pelo menos 8 caracteres.");if(o!==t.elements.senha2.value)return l("As senhas não conferem.");d(t,!0,"Verificando…");try{const{codigoRecuperacao:e}=await Fin.cofre.recuperar(t.elements.codigo.value,o);await Fin.storage.abrirCofre(),E(e,"Senha redefinida! Nova chave de recuperação")}catch(e){d(t,!1),l(e.message)}})}function G(){p(`
      <h2 class="font-semibold text-lg">Usar dados de outro aparelho</h2>
      <p class="text-sm text-slate-500 mt-1">Conecte o mesmo Google usado no outro aparelho e entre com o mesmo usuário e senha do app.</p>
      <button data-acao="google" class="btn btn-ghost w-full mt-4 border border-slate-200">
        <span aria-hidden="true">🔑</span> Conectar Google Drive</button>
      <p data-dica class="text-xs text-slate-500 mt-2">Se aparecer “O Google não verificou este app”, toque em <b>Avançado</b> e depois em <b>Acessar Valoris</b>.</p>
      <form id="ac-form" class="space-y-3 mt-4 hidden" novalidate>
        <p id="ac-achado" class="text-sm text-emerald-800 bg-emerald-50 rounded-lg px-3 py-2"></p>
        <label class="field"><span>Usuário</span><input name="usuario" class="input" autocomplete="username" required /></label>
        ${m("senha","Senha","current-password")}
        <button type="submit" class="btn btn-primary w-full">Entrar</button>
      </form>
      ${f}
      <div class="text-center mt-4"><button data-ir="criar" class="text-sm text-slate-500 hover:underline">Voltar</button></div>`);let t=null;const a=r.querySelector("#ac-form");v(),r.querySelector('[data-acao="google"]').addEventListener("click",async o=>{const e=o.currentTarget;e.disabled=!0,e.textContent="Conectando…";try{if(t=await Fin.drive.baixarParaEntrar(),!t)throw new Error("Nenhum dado do app foi encontrado neste Google Drive. Crie o acesso normalmente.");e.classList.add("hidden"),r.querySelector("[data-dica]")?.classList.add("hidden"),a.classList.remove("hidden"),r.querySelector("#ac-achado").textContent=`Dados encontrados (atualizados em ${new Date(t.atualizadoEm).toLocaleString("pt-BR")}).`,a.elements.usuario.value=t.conta?.usuario||"",a.elements.senha.focus()}catch(s){e.disabled=!1,e.textContent="Conectar Google Drive",l(s.message)}}),a.addEventListener("submit",async o=>{o.preventDefault(),d(a,!0,"Abrindo…");try{await Fin.drive.entrarComRemoto(t,a.elements.usuario.value,a.elements.senha.value),h()}catch(e){d(a,!1),l(e.message)}})}function P(){p(`
      <h2 class="font-semibold text-lg">Entrar com um convite</h2>
      <p class="text-sm text-slate-600 mt-1">Alguém compartilhou as finanças da casa com você. Você vai precisar de:</p>
      <ol class="text-sm text-slate-600 mt-2 space-y-1 list-decimal pl-5">
        <li>o <b>Gmail</b> que recebeu o e-mail de compartilhamento do Google Drive;</li>
        <li>o <b>código do convite</b> (ex.: K7QM-2XRA-PZ4D) que a pessoa te passou.</li>
      </ol>
      <button data-acao="google" class="btn btn-ghost w-full mt-4 border border-slate-200">
        ${Fin.icone("nuvem","w-5 h-5")} Entrar no Google e escolher o arquivo</button>
      <p data-dica class="text-xs text-slate-500 mt-2">Na janela do Google, abra a pasta <b>${g(Fin.drive.PASTA)}</b> e escolha <b>${g(Fin.drive.NOME)}</b>.</p>
      <form id="ac-form" class="space-y-3 mt-4 hidden" novalidate>
        <p id="ac-achado" class="text-sm text-emerald-800 bg-emerald-50 rounded-lg px-3 py-2"></p>
        <label class="field"><span>Código do convite</span>
          <input name="codigo" class="input font-mono uppercase tracking-wider" autocomplete="one-time-code" placeholder="XXXX-XXXX-XXXX" required /></label>
        <label class="field"><span>Como você quer ser chamado(a)?</span>
          <input name="nome" class="input" autocomplete="nickname" maxlength="40" placeholder="Ex.: Ana" /></label>
        <label class="field"><span>Seu usuário (para entrar no app)</span>
          <input name="usuario" class="input" autocomplete="username" maxlength="40" required /></label>
        ${m("senha","Sua senha (mínimo 8 caracteres)","new-password")}
        <div id="forca" class="h-4"></div>
        ${m("senha2","Repita a senha","new-password")}
        <p class="text-xs text-slate-500">A senha é só sua: quem convidou não fica sabendo. Se esquecer, peça um novo convite e use o mesmo usuário.</p>
        <button type="submit" class="btn btn-primary w-full">Entrar nas finanças da casa</button>
      </form>
      ${f}
      <div class="text-center mt-4"><button data-ir="criar" class="text-sm text-slate-500 hover:underline">Voltar</button></div>`);let t=null;const a=r.querySelector("#ac-form");v(),w(a),r.querySelector('[data-acao="google"]').addEventListener("click",async o=>{const e=o.currentTarget;e.disabled=!0;const s=e.innerHTML;e.textContent="Abrindo o Google…",r.querySelector("#ac-erro").classList.add("hidden");try{if(t=await Fin.drive.escolherArquivoCompartilhado(),!t){e.disabled=!1,e.innerHTML=s;return}if(!Fin.cofre.convitesPendentes(t.conta).length)throw new Error("Este arquivo não tem convite em aberto (vencido ou já usado). Peça um novo convite.");e.classList.add("hidden"),r.querySelector("[data-dica]").classList.add("hidden"),a.classList.remove("hidden"),r.querySelector("#ac-achado").textContent=`Arquivo de ${t.conta?.usuario||"quem convidou"} encontrado (atualizado em ${new Date(t.atualizadoEm).toLocaleString("pt-BR")}).`,a.elements.codigo.focus()}catch(i){e.disabled=!1,e.innerHTML=s,l(i.message)}}),a.addEventListener("submit",async o=>{o.preventDefault();const e=a.elements,s=e.senha.value;if(!e.codigo.value.trim())return l("Digite o código do convite.");if(!e.usuario.value.trim())return l("Escolha um usuário.");if(s.length<8)return l("A senha precisa ter pelo menos 8 caracteres.");if(s!==e.senha2.value)return l("As senhas não conferem.");d(a,!0,"Conferindo o convite…");try{await Fin.drive.entrarPorConvite(t,e.codigo.value,e.usuario.value,s);const i=e.nome.value.trim().replace(/\s+/g," ");Fin.membros.salvarAtual(i?{nome:i}:{}),h(),Fin.ui.toast(`Bem-vindo(a)${i?`, ${i.split(" ")[0]}`:""}! Vocês agora usam as mesmas finanças.`)}catch(i){d(a,!1),l(i.message)}})}function h(){r.classList.add("hidden"),r.innerHTML="",F()}function I(t){F=t,r=document.getElementById("acesso-root"),r.addEventListener("click",a=>{const o=a.target.closest("[data-ir]")?.dataset.ir;o==="recuperar"&&X(),o==="entrar"&&y(),o==="criar"&&S(),o==="drive"&&G(),o==="convite"&&P()}),window.addEventListener("fin:acesso-removido",async()=>{await q(),l(`Seu acesso às finanças da casa foi removido por ${Fin.cofre.titular()||"quem convidou"}.`)}),Fin.cofre.existeConta()?y():S()}async function q(){Fin.storage.bloqueado()||(Fin.ui.closeModal(),await Fin.storage.fecharCofre(),document.getElementById("view").innerHTML="",window.dispatchEvent(new CustomEvent("fin:bloqueado")),y())}return{iniciar:I,bloquear:q,telaEntrar:y}})();
