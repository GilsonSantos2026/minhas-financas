/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.dados=(()=>{const u=Fin.fmt,l=u.esc,{SCHEMAS:R}=Fin.columns,i={fileName:null,sheets:[],mode:null},U={lancamentos:"Lançamentos",cartao:"Cartão de crédito",categorias:"Categorias",ignorar:"Ignorar esta aba"};let p=null;function $(a,e){return`
      <div class="bg-slate-50 rounded-xl p-3 text-center">
        <div class="text-xl sm:text-2xl font-semibold text-slate-800">${l(e)}</div>
        <div class="text-[11px] sm:text-xs text-slate-500 leading-tight mt-0.5">${l(a)}</div>
      </div>`}const y=a=>new Date(a).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"}),O=5*1024,H=()=>{try{return!!navigator.canShare&&navigator.canShare({files:[new File(["{}"],"x.json",{type:"application/json"})]})}catch{return!1}};function g(a,e,s,r=""){return`
      <section class="bg-white rounded-2xl shadow-sm p-5 sm:p-6 ${r}">
        ${Fin.icones.doEmoji(e)?Fin.icones.titulo(Fin.icones.doEmoji(e),e==="⚠️"?"rose":e==="☁️"?"sky":"emerald",a,{cls:"text-lg",tam:"w-8 h-8",ic:"w-[18px] h-[18px]"}):`<h2 class="font-semibold text-lg flex items-center gap-2"><span aria-hidden="true">${e}</span>${a}</h2>`}
        ${s}
      </section>`}function V(){const a=Fin.storage,e=a.getMeta(),s=w=>a.list(w).length,r=a.usageKB(),o=Math.min(100,r/O*100),t=e?.restauradoEm?`Restaurado de um backup em ${y(e.restauradoEm)}`:e?.importadoEm?`Importado de “${l(e.arquivo)}” em ${y(e.importadoEm)}`:"Dados criados diretamente no app",n=a.situacaoBackup(),c=n.ultimo?`Último backup: <b>${n.dias===0?"hoje":n.dias===1?"ontem":`há ${n.dias} dias`}</b> (${y(n.ultimo)})`:"<b>Nenhum backup feito ainda.</b>",d=Fin.pwa;let h;d.instalado()?h='<p class="text-sm text-emerald-800 mt-2"><span aria-hidden="true">✓</span> Você está usando o app instalado.</p>':d.podeInstalar()?h=`<p class="text-sm text-slate-600 mt-1">Ícone na tela inicial, abre em tela cheia e funciona sem internet.</p>
        <button data-act="instalar" class="btn btn-primary mt-3">📲 Instalar app</button>`:d.estado.suportado?d.ios()?h=`<p class="text-sm text-slate-600 mt-1">No iPhone/iPad (Safari): toque em <b>Compartilhar</b> <span aria-hidden="true">⎋</span> e depois em
        <b>Adicionar à Tela de Início</b>.</p>`:h='<p class="text-sm text-slate-600 mt-1">Use o menu do navegador (⋮) → <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.</p>':h=`<p class="text-sm text-slate-600 mt-1">Para instalar no celular e usar sem internet, o app precisa ser aberto por um
        endereço <b>https</b> (ex.: GitHub Pages, gratuito) — aberto direto do arquivo no computador isso não é possível.
        O passo a passo está no <b>README.md</b> do projeto.</p>`;const x=Fin.drive,F=!!x?.configurado?.()&&!!x.conectado()&&!x.estado.conflito,v=Number(a.prefs().bloqueioMin??10),B=(w,ba,ha,va="")=>`
      <li class="flex items-start gap-3 py-2.5">
        <span class="w-7 h-7 rounded-full grid place-items-center shrink-0 ${w?"bg-emerald-100 text-emerald-700":"bg-amber-100 text-amber-800"}" aria-hidden="true">${w?Fin.icone("check","w-4 h-4"):"!"}</span>
        <span class="flex-1 min-w-0"><span class="block text-[15px] font-medium">${ba}</span><span class="block text-[13px] text-slate-500">${ha}</span></span>
        ${va}
      </li>`,k=[!F,n.lembrar||!n.ultimo,v===0].filter(Boolean).length,E=w=>`<h2 class="text-xs font-semibold uppercase tracking-[.1em] text-slate-500 px-1 pt-2">${w}</h2>`;return`
      <div class="space-y-4">
        <section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
          <div class="flex items-start gap-3">
            ${Fin.icones.badge(k?"alerta":"escudo",k?"amber":"emerald","w-10 h-10","w-6 h-6")}
            <div class="min-w-0">
              <h2 class="font-semibold text-lg leading-tight">${k?k===1?"Falta 1 cuidado com seus dados":`Faltam ${k} cuidados com seus dados`:"Seus dados estão protegidos"}</h2>
              <p class="text-sm text-slate-500 mt-0.5">${t}</p>
            </div>
          </div>
          <ul class="divide-y divide-slate-100 mt-2">
            ${B(F,"Google Drive",F?"Conectado: backup automático e uso em outros aparelhos":"Não conectado: conecte para ter backup automático",F?"":'<button data-act="drive-conectar" class="text-sm font-semibold text-prim-700 hover:underline shrink-0 min-h-[36px]">Conectar</button>')}
            ${B(!(n.lembrar||!n.ultimo),"Backup em arquivo",n.ultimo?`Último: ${n.dias===0?"hoje":n.dias===1?"ontem":`há ${n.dias} dias`}${n.pendente?" · há alterações depois dele":""}`:"Nenhum backup feito ainda",'<button data-act="backup" class="text-sm font-semibold text-prim-700 hover:underline shrink-0 min-h-[36px]">Baixar</button>')}
            ${B(v!==0,"Bloqueio automático",v?`O app se fecha após ${v>=60?"1 hora":`${v} min`} sem uso`:"Desligado: o app fica aberto até você sair")}
          </ul>
        </section>

        ${E("Proteger os dados")}
        ${L()}

        ${g("Backup","🛟",`
          <p class="text-sm mt-1 ${n.lembrar?"text-amber-800":"text-slate-600"}">${n.lembrar?'<span aria-hidden="true">!</span> ':""}${c}
            ${n.pendente&&n.ultimo?" Há alterações depois dele.":""}</p>
          <div class="flex flex-col sm:flex-row flex-wrap gap-2 mt-4">
            <button data-act="backup" class="btn btn-primary">⬇️ Baixar backup</button>
            ${H()?'<button data-act="compartilhar" class="btn btn-ghost">📤 Enviar para Drive, WhatsApp…</button>':""}
            <label class="btn btn-ghost cursor-pointer">♻️ Restaurar backup<input id="backup-input" type="file" accept=".json,application/json" class="sr-only"></label>
          </div>
          <details class="mt-4 text-sm text-slate-600">
            <summary class="flex items-center gap-1 font-medium text-slate-700"><span class="chev text-slate-400">▸</span> Como levar os dados para outro aparelho</summary>
            <ol class="list-decimal pl-5 mt-2 space-y-1">
              <li>Neste aparelho, toque em <b>Baixar backup</b> (ou <b>Enviar</b>, para mandar pelo Drive/WhatsApp/e-mail).</li>
              <li>No outro aparelho, abra o app e vá em <b>Dados e backup → Restaurar backup</b>.</li>
              <li>Escolha o arquivo <code>financas-backup-….json</code>. O app mostra o conteúdo antes de substituir.</li>
            </ol>
            <p class="mt-2 text-xs text-slate-500">Com o Google Drive conectado, os dados já passam sozinhos para os outros aparelhos; o backup em arquivo é uma cópia extra, guardada por você.</p>
          </details>`)}

        ${E("Conta")}
        ${K()}

        ${E("Este aparelho")}
        ${g("Instalar como app","📲",h)}
        ${g("Proteção do armazenamento","🔒",`
          <p class="text-sm text-slate-600 mt-1">Quando falta espaço, o navegador pode apagar dados de sites. Peça para proteger os dados deste app.</p>
          <p id="prot-status" class="text-sm mt-3 text-slate-500">Verificando…</p>`)}
        ${Fin.ui.dobra({grupo:"dados",id:"guardado",icone:"tabela",cor:"blue",titulo:"O que está guardado",resumo:`${s("lancamentos")} lançamentos · ${(r/1024).toFixed(1).replace(".",",")} MB de ~5 MB`,corpo:()=>`
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              ${$("lançamentos",s("lancamentos"))}${$("compras no cartão",s("cartaoCompras"))}${$("categorias",s("categorias"))}${$("cartões",Fin.finance.cartoes().length)}
            </div>
            <div class="mt-4">
              <div class="flex justify-between text-xs text-slate-500 mb-1"><span>Espaço usado</span><span class="tabular-nums">${(r/1024).toFixed(1).replace(".",",")} MB de ~5 MB</span></div>
              <div class="h-2 rounded-full bg-[#cde2fb] overflow-hidden" role="meter" aria-valuemin="0" aria-valuemax="${O}" aria-valuenow="${r}" aria-label="Espaço usado">
                <div class="h-full rounded-full" style="width:${o}%;background:${o>85?"#d03b3b":"#2a78d6"}"></div>
              </div>
            </div>`})}

        ${E("Avançado")}
        ${Fin.ui.dobra({grupo:"dados",id:"avancado",icone:"engrenagem",cor:"slate",titulo:"Planilha e apagar dados",resumo:"Importar a planilha de novo ou apagar tudo deste aparelho",corpo:()=>`
            <div class="space-y-4">
              <div>
                <h3 class="font-semibold text-[15px]">Importar a planilha de novo</h3>
                <p class="text-sm text-slate-600 mt-1">Importar a planilha de novo <b>substitui</b> lançamentos, compras, categorias e cartões. O app mostra o que muda e compara o arquivo com os dados de hoje antes de gravar.</p>
                <button data-act="reimport" class="btn btn-ghost mt-3">Importar planilha novamente</button>
              </div>
              <div class="border-t border-rose-100 pt-4">
                <h3 class="font-semibold text-[15px] text-rose-800">Apagar todos os dados</h3>
                <p class="text-sm text-slate-600 mt-1">Remove tudo deste aparelho: lançamentos, compras, categorias, cartões, investimentos e o acesso. O app mostra o que será apagado e pede confirmação.</p>
                <button data-act="apagar" class="btn btn-danger-ghost border border-rose-200 mt-3">Apagar todos os dados…</button>
              </div>
            </div>`})}
      </div>`}function K(){if(!Fin.cofre.existeConta())return"";const a=Number(Fin.storage.prefs().bloqueioMin??10),e=(s,r)=>`<option value="${s}" ${s===a?"selected":""}>${r}</option>`;return g("Conta e segurança","🔐",`
      <p class="text-sm text-slate-600 mt-1">Usuário: <b>${l(Fin.cofre.usuario())}</b> · os dados estão <b>cifrados</b> com a sua senha neste aparelho.</p>
      <div class="flex flex-col sm:flex-row flex-wrap gap-2 mt-4">
        <button data-act="trocar-senha" class="btn btn-ghost">Trocar senha</button>
        ${Fin.cofre.ehPrincipal()?'<button data-act="nova-chave" class="btn btn-ghost">Gerar nova chave de recuperação</button>':""}
        <button data-bloquear class="btn btn-ghost">🔒 Bloquear agora</button>
      </div>
      <label class="flex flex-wrap items-center gap-2 text-sm mt-4">
        <span class="text-slate-600">Bloquear automaticamente após</span>
        <select id="bloqueio-min" class="input !w-auto !py-1.5">${e(5,"5 min")}${e(10,"10 min")}${e(30,"30 min")}${e(60,"1 hora")}${e(0,"nunca (só pelo botão)")}</select>
        <span class="text-slate-600">sem uso</span>
      </label>`)}function L(){const a=Fin.drive;return Fin.cofre.existeConta()?a.configurado()?a.estado.conflito?g("Google Drive: dados com outra senha","☁️",`
        <p class="text-sm text-slate-600 mt-1">O Drive já tem dados do app protegidos com <b>outra senha</b> (criada em outro aparelho).
          Entre com o usuário e a senha usados lá: os dados dos dois aparelhos serão <b>juntados</b> e este aparelho passa a usar essa senha.</p>
        <form id="conflito-form" class="grid sm:grid-cols-3 gap-2 mt-3" autocomplete="off">
          <input name="usuario" class="input" placeholder="Usuário" value="${l(a.estado.conflito.conta?.usuario||"")}">
          <input name="senha" type="password" class="input" placeholder="Senha do outro aparelho" autocomplete="current-password">
          <button class="btn btn-primary">Juntar dados</button>
        </form>`,"border border-rose-100"):a.conectado()?g("Google Drive","☁️",`
      <div id="sync-status-dados" class="mt-2"></div>
      <p class="text-xs text-slate-500 mt-1">As alterações são enviadas em segundos e o app confere novidades ao abrir e a cada 2 minutos.</p>
      <div class="flex flex-col sm:flex-row gap-2 mt-3">
        <button data-act="drive-sync" class="btn btn-ghost">⟳ Sincronizar agora</button>
        <button data-act="drive-sair" class="btn btn-danger-ghost">Desconectar</button>
      </div>`):g("Sincronizar com o Google Drive","☁️",`
        <p class="text-sm text-slate-600 mt-1">Use os mesmos dados no celular e no computador. O app guarda um arquivo <b>cifrado</b>
          numa pasta oculta do seu Drive (o app não vê seus outros arquivos e o Google não consegue ler o conteúdo).</p>
        <button data-act="drive-conectar" class="btn btn-primary mt-3">Conectar Google Drive</button>
        <p class="text-xs text-slate-500 mt-2">Se aparecer “O Google não verificou este app”, toque em <b>Avançado</b> e depois em <b>Acessar Valoris</b>.</p>`):g("Sincronizar com o Google Drive","☁️",`
        <p class="text-sm text-slate-600 mt-1">Para usar os mesmos dados no celular e no computador, o app precisa estar publicado em
          um endereço <b>https</b> e ter um <b>Client ID do Google</b> configurado em <code>js/config.js</code>.
          O passo a passo está no <b>README.md</b> (“Sincronização com o Google Drive”).</p>`):""}function S(a,e,s,r,o){return new Promise(t=>{const n=Fin.ui.openModal(`
        <form id="pd-form" class="p-5 space-y-3" novalidate>
          <h2 class="font-semibold text-lg">${a}</h2>
          ${e?`<p class="text-sm text-slate-600">${e}</p>`:""}
          ${s.map(d=>`<label class="field"><span>${d.rotulo}</span><input name="${d.name}" type="${d.tipo||"password"}" value="${l(d.valor||"")}" class="input" autocomplete="${d.auto||"off"}"></label>`).join("")}
          <p id="pd-erro" class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" data-close class="btn btn-ghost">Cancelar</button>
            <button type="submit" class="btn btn-primary">${r}</button>
          </div>
        </form>`,a),c=n.querySelector("#pd-form");n.querySelector("[data-close]").addEventListener("click",()=>{Fin.ui.closeModal(),t(!1)}),c.addEventListener("submit",async d=>{d.preventDefault();const h=c.querySelector("button[type=submit]");h.disabled=!0;const x=Object.fromEntries(s.map(v=>[v.name,c.elements[v.name].value])),F=await o(x);if(h.disabled=!1,F){const v=c.querySelector("#pd-erro");v.textContent=F,v.classList.remove("hidden");return}Fin.ui.closeModal(),t(!0)})})}const M=()=>{Fin.drive.conectado()&&(Fin.storage.setPref("driveSujo",!0),Fin.drive.sincronizar())};async function J(){await S("Trocar senha","A chave de recuperação continua a mesma.",[{name:"atual",rotulo:"Senha atual",auto:"current-password"},{name:"nova",rotulo:"Nova senha (mínimo 8)",auto:"new-password"},{name:"nova2",rotulo:"Repita a nova senha",auto:"new-password"}],"Trocar",async({atual:e,nova:s,nova2:r})=>{if(s.length<8)return"A nova senha precisa ter pelo menos 8 caracteres.";if(s!==r)return"As senhas não conferem.";try{return await Fin.cofre.trocarSenha(e,s),null}catch{return"Senha atual incorreta."}})&&(Fin.ui.toast("Senha alterada."),M())}async function W(){let a=null;await S("Nova chave de recuperação","A chave anterior deixa de funcionar.",[{name:"senha",rotulo:"Senha atual",auto:"current-password"}],"Gerar",async({senha:s})=>{try{return{codigoRecuperacao:a}=await Fin.cofre.novoCodigoRecuperacao(s),null}catch{return"Senha incorreta."}})&&(Fin.ui.openModal(`
        <div class="p-5 space-y-3">
          <h2 class="font-semibold text-lg">Nova chave de recuperação</h2>
          <p class="text-sm text-slate-600">Guarde fora deste aparelho. A chave anterior não vale mais.</p>
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center"><code class="font-semibold tracking-wider break-all select-all">${l(a)}</code></div>
          <div class="flex justify-end"><button data-close class="btn btn-primary">Guardei</button></div>
        </div>`,"Nova chave de recuperação").querySelector("[data-close]").addEventListener("click",Fin.ui.closeModal),M())}const q={despesa:[["Moradia","🏠","Essencial"],["Contas da casa","💡","Essencial"],["Mercado","🛒","Essencial"],["Transporte","🚗","Essencial"],["Saúde","💊","Essencial"],["Educação","🎓","Essencial"],["Restaurantes e delivery","🍽️","Estilo de vida"],["Lazer","🎮","Estilo de vida"],["Roupas","👕","Estilo de vida"],["Cuidados pessoais","💇","Estilo de vida"],["Assinaturas","📱","Estilo de vida"],["Viagens","✈️","Estilo de vida"],["Presentes","🎁","Estilo de vida"],["Pets","🐾","Estilo de vida"],["Pagamento Fatura","💳","Financeiro"],["Impostos e taxas","🧾","Financeiro"],["Investimentos","📈","Financeiro",{investimento:!0}],["Outros gastos","📦","Outros"]],receita:[["Salário","💰","Receitas"],["Renda extra","💼","Receitas"],["Rendimentos","🏦","Receitas"],["Reembolsos","🔁","Receitas"],["Outras receitas","📦","Receitas"]]};function Z(){const a=q.despesa.length,e=q.receita.length,s=q.despesa.slice(0,8).map(([r,o])=>`<span class="inline-flex items-center gap-1 bg-slate-100 rounded-full px-2 py-0.5">${o} ${l(r)}</span>`).join(" ");return`
      <section class="bg-white rounded-2xl shadow-sm p-5 sm:p-6 mb-4 border-2 border-prim-200">
        ${Fin.icones.titulo("lista","prim","Começar do zero",{cls:"text-lg",tam:"w-8 h-8",ic:"w-[18px] h-[18px]"})}
        <p class="text-sm text-slate-600 mt-1">Não tem planilha? Comece já com <b>${a} categorias de despesa e ${e} de receita</b> prontas — dá para renomear, apagar ou criar outras depois.</p>
        <p class="text-xs text-slate-500 mt-2 flex flex-wrap gap-1">${s} <span class="px-1 py-0.5">e mais…</span></p>
        <button data-act="zero" class="btn btn-primary mt-4">Começar do zero</button>
        ${Fin.ehBeta&&Fin.demo?`
          <div class="mt-4 pt-4 border-t border-slate-100">
            <p class="text-sm text-slate-600"><b>Canal beta:</b> quer ver o app cheio, para testar ou gravar vídeos? Carregue <b>dados de demonstração</b> (fictícios): 12 meses de lançamentos, cartões, investimentos e metas.</p>
            <button data-act="demo" class="btn btn-ghost mt-3">🎬 Carregar dados de demonstração</button>
          </div>`:""}
      </section>
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 text-center mb-4">ou, se já tem seus lançamentos numa planilha</p>`}const N=()=>["despesa","receita"].flatMap(a=>q[a].map(([e,s,r,o])=>({id:Fin.storage.uid(),nome:e,icone:s,tipo:a,classificacao:r,orcamentoMensal:0,...o||{}})));function _(){try{Fin.demo.carregar(N())}catch(a){return console.error("[demo]",a),Fin.ui.toast("Não foi possível carregar a demonstração.","error")}Fin.state.mes=u.currentYM(),Fin.ui.toast("Dados de demonstração carregados (fictícios)."),location.hash="#/dashboard",setTimeout(()=>{!Fin.storage.prefs().tourVisto&&!Fin.tour.ativo()&&Fin.tour.iniciar()},900)}function X(){Fin.storage.comecarDoZero(N()),Fin.state.mes=u.currentYM(),Fin.ui.toast("Tudo pronto! Use o botão “＋” para o primeiro lançamento."),location.hash="#/dashboard",setTimeout(()=>{!Fin.storage.prefs().tourVisto&&!Fin.tour.ativo()&&Fin.tour.iniciar()},900)}function Y(){if(Fin.storage.hasData()||!Fin.drive.configurado()||Fin.drive.conectado()&&!Fin.drive.estado.conflito)return"";const a=L();return a?`<div class="mt-4">${a}</div>`:""}function Q(){return g("Já tem um backup?","♻️",`
      <p class="text-sm text-slate-600 mt-1">Em um aparelho novo, restaure o arquivo de backup baixado no outro aparelho.</p>
      <label class="btn btn-ghost cursor-pointer mt-3">♻️ Restaurar backup<input id="backup-input" type="file" accept=".json,application/json" class="sr-only"></label>`,"mt-4")}function aa(){const a=i.restore,e=Fin.storage,s=(r,o)=>`<tr><td>${r}</td><td class="num">${e.list(o).length}</td><td class="num font-semibold">${a.contagens[o]}</td></tr>`;return`
      <section class="bg-white rounded-2xl shadow-sm p-5 sm:p-6 space-y-4">
        <div>
          <h2 class="font-semibold text-lg">Restaurar backup</h2>
          <p class="text-sm text-slate-500 mt-1 break-all">${l(i.restoreArquivo)}${a.exportadoEm?` · feito em ${y(a.exportadoEm)}`:""}</p>
        </div>
        <div class="table-wrap border border-slate-200 rounded-xl"><table>
          <thead><tr><th></th><th class="num">Hoje no app</th><th class="num">No backup</th></tr></thead>
          <tbody>${s("Lançamentos","lancamentos")}${s("Compras no cartão","cartaoCompras")}${s("Categorias","categorias")}${s("Cartões","cartoes")}</tbody>
        </table></div>
        ${e.hasData()?`
          <p class="text-sm text-amber-800 bg-amber-50 rounded-lg px-3 py-2"><span aria-hidden="true">!</span> Os dados atuais deste aparelho serão <b>substituídos</b> pelos do backup.</p>
          <label class="flex items-start gap-2 text-sm"><input id="restore-copia" type="checkbox" checked class="mt-0.5 w-4 h-4 accent-prim-600">
            <span>Baixar antes uma cópia dos dados atuais (recomendado)</span></label>`:""}
        <div class="flex gap-2 justify-end">
          <button data-act="restore-cancel" class="btn btn-ghost">Cancelar</button>
          <button data-act="restore-ok" class="btn btn-primary">Restaurar</button>
        </div>
      </section>`}async function ea(a){if(!a)return;const e=await a.text();let s=null;try{s=await Fin.storage.lerBackup(e)}catch(r){if(!r.precisaSenha)return Fin.ui.toast(r.message,"error");if(await S("Backup protegido",l(r.message),[{name:"usuario",rotulo:"Usuário",tipo:"text",valor:r.usuario||"",auto:"username"},{name:"senha",rotulo:"Senha",auto:"current-password"}],"Abrir",async({usuario:o,senha:t})=>{try{return s=await Fin.storage.lerBackup(e,{usuario:o,senha:t}),null}catch(n){return n.precisaSenha?"Usuário ou senha incorretos.":n.message}}),!s)return}i.restore=s,i.restoreArquivo=a.name,i.mode="restore",b(),window.scrollTo(0,0)}async function ta(){p.querySelector("#restore-copia")?.checked&&G(await Fin.storage.exportBackup(),`financas-antes-de-restaurar-${u.todayISO()}.json`);try{Fin.storage.restaurarBackup(i.restore);const a=i.restore.contagens.lancamentos;Object.assign(i,{restore:null,restoreArquivo:null,mode:null}),Fin.state.mes=Fin.finance.mesInicial(),Fin.pwa.proteger().catch(()=>{}),Fin.ui.toast(`Backup restaurado: ${a} lançamentos.`),Fin.router.go("/dashboard")}catch(a){Fin.ui.toast(a.message,"error")}}async function z(){const a=p?.querySelector("#prot-status");if(!a)return;const{protegido:e}=await Fin.pwa.armazenamento();e===null?a.innerHTML="Este navegador não oferece essa proteção. Mantenha backups em dia.":e?a.innerHTML='<span class="text-emerald-800 font-medium"><span aria-hidden="true">✓</span> Dados protegidos contra limpeza automática.</span>':a.innerHTML='<span class="text-slate-600">Ainda não protegido.</span> <button data-act="proteger" class="ml-1 text-prim-700 font-semibold hover:underline">Proteger agora</button>'}function oa(){const a=Fin.storage.hasData()?'<button data-act="cancel" class="text-sm text-slate-500 hover:text-slate-800 shrink-0">Cancelar</button>':"";return`
      <section class="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
        <div class="flex items-start justify-between gap-3">
          <div>
            ${Fin.icones.titulo("upload","emerald","Importe sua planilha",{cls:"text-lg",tam:"w-8 h-8",ic:"w-[18px] h-[18px]"})}
            <p class="text-sm text-slate-500 mt-1">
              Envie o arquivo Excel com seus lançamentos antigos. Ele é lido aqui mesmo, no seu navegador — nada é enviado para a internet.
            </p>
          </div>${a}
        </div>
        <label id="dropzone" for="file-input"
          class="dropzone mt-5 flex flex-col items-center justify-center text-center gap-2 border-2 border-dashed border-slate-300 rounded-2xl px-4 py-10 cursor-pointer transition">
          <span class="text-4xl" aria-hidden="true">📂</span>
          <span class="font-medium">Toque para escolher o arquivo</span>
          <span class="text-sm text-slate-500 hidden sm:block">ou arraste e solte aqui</span>
          <span class="text-xs text-slate-400">.xlsx, .xls, .csv ou .ods</span>
          <input id="file-input" type="file" class="sr-only"
            accept=".xlsx,.xlsm,.xls,.csv,.ods,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" />
        </label>
        <div id="loading" class="hidden mt-5 flex items-center gap-3 text-sm text-slate-600">
          <span class="spinner" aria-hidden="true"></span> Lendo a planilha…
        </div>
      </section>`}function sa(){return`
      <section class="space-y-4">
        <div class="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              ${Fin.icones.titulo("lista","emerald","Confira antes de salvar",{cls:"text-lg",tam:"w-8 h-8",ic:"w-[18px] h-[18px]"})}
              <p class="text-sm text-slate-500 mt-1 break-all">${l(i.fileName)} · ${i.sheets.length} abas encontradas</p>
            </div>
            <button data-act="cancel" class="text-sm text-slate-500 hover:text-slate-800 shrink-0">Cancelar</button>
          </div>
          <div id="review-totals" class="grid grid-cols-3 gap-3 mt-5"></div>
          <p class="text-xs text-slate-500 mt-4">
            Cada aba foi analisada automaticamente. Se algo estiver errado, altere o tipo da aba ou abra
            “Colunas reconhecidas” para corrigir o mapeamento.
          </p>
        </div>
        <div id="sheets" class="space-y-4">${i.sheets.map(I).join("")}</div>
      </section>
      <div class="save-bar fixed inset-x-0 bottom-16 md:bottom-0 md:left-60 z-20 bg-white/95 backdrop-blur border-t border-slate-200">
        <div class="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <p id="save-summary" class="text-sm text-slate-600 flex-1 min-w-0"></p>
          <button data-act="save" id="btn-save" class="btn btn-primary shrink-0">Salvar no navegador</button>
        </div>
      </div>`}function P(){const a=Fin.importer.collect(i.sheets);p.querySelector("#review-totals").innerHTML=$("lançamentos",a.lancamentos.length)+$("compras no cartão",a.cartaoCompras.length)+$("categorias",a.categorias.length);const e=a.lancamentos.length+a.cartaoCompras.length;p.querySelector("#save-summary").textContent=e?`${e} registros prontos para salvar`:"Nenhum registro reconhecido ainda",p.querySelector("#btn-save").disabled=e===0&&a.categorias.length===0}function I(a,e){const s=a.kind==="ignorar",r=R[a.kind],o=r&&!Fin.columns.meetsRequired(a.mapping,r),t=a.headerRow!==null?a.headerRow+a.rowOffset+1:null,n=Object.entries(U).map(([d,h])=>`<option value="${d}" ${d===a.kind?"selected":""}>${h}</option>`).join(""),c=s?'<span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">ignorada</span>':`<span class="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">${a.records.length} registros</span>`;return`
      <article class="bg-white rounded-2xl shadow-sm p-4 sm:p-5 ${s?"opacity-75":""}" data-sheet="${e}">
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap"><h3 class="font-semibold truncate">${l(a.name)}</h3>${c}</div>
            ${s?"":`<p class="text-xs text-slate-500 mt-1">
              Cabeçalho na linha ${t} · ${Object.keys(a.mapping).length} colunas reconhecidas
              ${a.skipped?` · ${a.skipped} linhas sem data ou valor ignoradas (ex.: linhas-modelo vazias)`:""}</p>`}
          </div>
          <label class="text-sm flex items-center gap-2 shrink-0">
            <span class="text-slate-500">Tipo:</span>
            <select data-action="kind" class="input !w-auto !py-1.5">${n}</select>
          </label>
        </div>
        ${o?`<p class="mt-3 text-sm text-amber-800 bg-amber-50 rounded-lg px-3 py-2">
          Faltam colunas obrigatórias (data e valor). Ajuste em “Colunas reconhecidas”.</p>`:""}
        ${s?"":ra(a,o)+na(a)}
      </article>`}function ra(a,e){const s=R[a.kind],r=a.rows[a.headerRow]||[],o=n=>'<option value="">— ignorar coluna —</option>'+Object.entries(s.fields).map(([c,d])=>`<option value="${c}" ${c===n?"selected":""}>${l(d.label)}</option>`).join(""),t=r.map((n,c)=>({h:n,col:c})).filter(({h:n,col:c})=>typeof n=="string"&&n.trim()||a.mapping[c]).map(({h:n,col:c})=>`
        <div class="flex items-center gap-2 py-1.5">
          <span class="flex-1 min-w-0 truncate text-sm ${a.mapping[c]?"":"text-slate-400"}" title="${l(n)}">${l(n??`Coluna ${c+1}`)}</span>
          <span class="text-slate-300" aria-hidden="true">→</span>
          <select data-action="column" data-col="${c}" class="input !w-40 sm:!w-48 !py-1" aria-label="Campo para a coluna ${l(n)}">
            ${o(a.mapping[c])}
          </select>
        </div>`).join("");return`
      <details class="mt-4 border border-slate-200 rounded-xl" ${e?"open":""}>
        <summary class="px-3 py-2.5 text-sm font-medium flex items-center gap-2"><span class="chev text-slate-400">▸</span> Colunas reconhecidas</summary>
        <div class="px-3 pb-3 divide-y divide-slate-100">${t||'<p class="text-sm text-slate-500 py-2">Nenhum título de coluna encontrado.</p>'}</div>
      </details>`}function na(a){const e=a.records.slice(0,5);if(!e.length)return'<p class="mt-4 text-sm text-slate-500">Nenhum registro válido com o mapeamento atual.</p>';const s=t=>t?u.monthShort(t):"—",r=t=>`${t.categoriaIcone||""} ${l(t.categoria)}`,o={lancamentos:[["Data",t=>u.date(t.data)],["Descrição",t=>l(t.descricao)],["Categoria",r],["Tipo",t=>t.tipo==="receita"?"Receita":"Despesa"],["Valor",t=>u.brl(t.valorPago??t.valorPrevisto),"num"],["Status",t=>l(t.status)],["Compet.",t=>s(t.competencia)]],cartao:[["Data",t=>u.date(t.data)],["Descrição",t=>l(t.descricao)],["Categoria",r],["Parcela",t=>t.parcela?`${t.parcela.atual}/${t.parcela.total}`:"—"],["Valor",t=>u.brl(t.valor),"num"],["Fatura",t=>s(t.fatura)]],categorias:[["Categoria",t=>`${t.icone||""} ${l(t.nome)}`],["Tipo",t=>l(t.tipo)],["Classificação",t=>l(t.classificacao??"—")],["Orçamento",t=>u.brl(t.orcamentoMensal),"num"]]}[a.kind];return`
      <p class="mt-4 mb-2 text-xs font-medium text-slate-500 uppercase tracking-wide">Prévia (primeiros ${e.length})</p>
      <div class="table-wrap border border-slate-200 rounded-xl">
        <table>
          <thead><tr>${o.map(([t,,n])=>`<th class="${n||""}">${t}</th>`).join("")}</tr></thead>
          <tbody>${e.map(t=>`<tr>${o.map(([,n,c])=>`<td class="${c||""}">${n(t)}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
      </div>`}async function D(a){if(a){if(!/\.(xlsx|xlsm|xls|csv|ods)$/i.test(a.name)){Fin.ui.toast("Formato não suportado. Use .xlsx, .xls, .csv ou .ods.","error");return}p.querySelector("#loading")?.classList.remove("hidden");try{await Fin.importer.carregarXLSX()}catch(e){p.querySelector("#loading")?.classList.add("hidden"),Fin.ui.toast(e.message,"error");return}try{const e=await Fin.importer.readWorkbook(a);i.fileName=a.name,i.sheets=Fin.importer.analyze(e),i.mode="review",b(),window.scrollTo(0,0)}catch(e){console.error(e),Fin.ui.toast(`Não foi possível ler o arquivo: ${e.message}`,"error"),p.querySelector("#loading")?.classList.add("hidden")}}}const m=a=>a.toLocaleString("pt-BR"),f=(a,e,s)=>`${m(a)} ${a===1?e:s}`;function j(){const a=Fin.storage,e=a.list("lancamentos"),s=a.list("cartaoCompras"),r=e.map(o=>o.competencia).filter(Boolean).sort();return{lanc:e.length,compras:s.length,cats:a.list("categorias").length,cartoes:Fin.finance.cartoes().length,lancApp:e.filter(o=>o.origem==="app").length,lancEditados:e.filter(o=>o.origem!=="app"&&o.atualizadoEm).length,comprasApp:s.filter(o=>o.origem==="app"||o.origem==="pdf").length,invMovs:a.list("invMovs").length,invContas:a.list("invContas").length,de:r[0]||null,ate:r[r.length-1]||null,drive:Fin.drive?.conectado()||!1}}const A=(a,e)=>a?`${u.monthShort(a)} a ${u.monthShort(e)}`:"—";async function ia(){const a=j();await Fin.ui.confirmar({titulo:"Importar a planilha novamente?",icone:"upload",cor:"amber",intro:"A planilha vai <b>substituir</b> os lançamentos, compras, categorias e cartões deste app. Use só se a planilha for a versão mais completa dos seus dados.",perde:[`Os <b>${f(a.lanc,"lançamento","lançamentos")}</b> e <b>${f(a.compras,"compra","compras")} no cartão</b> de hoje serão trocados pelos da planilha.`,...a.lancApp?[a.lancApp===1?"<b>1 lançamento criado no app</b> (que não está na planilha) será perdido.":`<b>${m(a.lancApp)} lançamentos criados no app</b> (que não estão na planilha) serão perdidos.`]:[],...a.lancEditados?[`Alterações feitas no app em <b>${f(a.lancEditados,"lançamento","lançamentos")}</b> (pagamentos marcados, valores) voltam ao que está na planilha.`]:[],...a.comprasApp?[a.comprasApp===1?"<b>1 compra lançada</b> no app ou por PDF de fatura será perdida.":`<b>${m(a.comprasApp)} compras lançadas</b> no app ou por PDF de fatura serão perdidas.`]:[],'As categorias voltam às da planilha (marcações feitas no app, como "investimento", se perdem).',...a.drive?["<b>O Google Drive e os outros aparelhos</b> (celular/computador) também recebem a substituição na próxima sincronização."]:[],...Fin.cofre.pessoas().length>1?["<b>A outra pessoa da casa</b> também perde os lançamentos que ela fez no app e passa a ver os da planilha."]:[]],mantem:[...a.invMovs||a.invContas?["Investimentos (carteira, reserva, metas) não são tocados."]:[],"Usuário, senha e preferências.","Antes de gravar, o app mostra o arquivo escolhido e compara com os dados de hoje."],backup:C,ciente:"Entendi que os dados atuais serão substituídos pelos da planilha.",botao:"Continuar e escolher o arquivo"})&&(i.mode="upload",b())}async function la(a){const e=j(),s=Fin.storage.getMeta(),r=a.lancamentos.map(d=>d.competencia).filter(Boolean).sort(),o={lanc:a.lancamentos.length,compras:a.cartaoCompras.length,cats:a.categorias.length,de:r[0],ate:r[r.length-1]},t=[];s?.arquivo&&s.arquivo!==i.fileName&&t.push(`O arquivo escolhido (<b>${l(i.fileName)}</b>) é <b>diferente</b> do usado na última importação (<b>${l(s.arquivo)}</b>). Confira se é o arquivo certo.`),e.lanc&&o.lanc<e.lanc*.8&&t.push(`A planilha tem <b>menos lançamentos</b> (${m(o.lanc)}) do que o app hoje (${m(e.lanc)}): ${m(e.lanc-o.lanc)} sairiam.`),e.compras&&o.compras<e.compras*.8&&t.push(`A planilha tem <b>menos compras no cartão</b> (${m(o.compras)}) do que o app hoje (${m(e.compras)}).`),e.ate&&o.ate&&o.ate<e.ate&&t.push(`A planilha vai só até <b>${u.monthShort(o.ate)}</b>; o app tem lançamentos até <b>${u.monthShort(e.ate)}</b>.`);const n=(d,h,x)=>`<tr><td class="py-1 pr-3">${d}</td><td class="py-1 pr-3 text-right tabular-nums">${h}</td><td class="py-1 text-right tabular-nums font-medium ${h!==x?"text-amber-800":""}">${x}</td></tr>`,c=`
      <div class="text-sm">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Hoje × planilha escolhida</div>
        <table class="w-full">
          <thead><tr class="text-xs text-slate-500"><th class="text-left font-medium"></th><th class="text-right font-medium pr-3">Hoje no app</th><th class="text-right font-medium">Planilha</th></tr></thead>
          <tbody>
            ${n("Lançamentos",m(e.lanc),m(o.lanc))}
            ${n("Compras no cartão",m(e.compras),m(o.compras))}
            ${n("Categorias",m(e.cats),m(o.cats))}
            ${n("Período",A(e.de,e.ate),A(o.de,o.ate))}
          </tbody>
        </table>
        <p class="text-xs text-slate-500 mt-1">Arquivo: <b>${l(i.fileName)}</b>${s?.importadoEm?` · última importação: ${l(s.arquivo||"—")} em ${y(s.importadoEm)}`:""}</p>
      </div>`;return Fin.ui.confirmar({titulo:"Substituir os dados agora?",icone:"alerta",cor:"rose",intro:"Último passo. Depois disso, os dados de hoje só voltam com um backup.",avisos:t,resumo:c,perde:[`Os dados de hoje são trocados pelos da planilha <b>${l(i.fileName)}</b>.`,...e.lancApp?[e.lancApp===1?"<b>1 lançamento criado no app</b> será perdido.":`<b>${m(e.lancApp)} lançamentos criados no app</b> serão perdidos.`]:[],...e.drive?["A troca também vai para o <b>Google Drive</b> e para os outros aparelhos."]:[]],backup:C,ciente:t.length?"Conferi os avisos acima e quero substituir mesmo assim.":"Conferi o arquivo e quero substituir os dados.",botao:"Substituir dados"})}async function ca(){const a=Fin.importer.collect(i.sheets);if(!(Fin.storage.hasData()&&!await la(a)))try{Fin.storage.saveImport(a,{arquivo:i.fileName}),i.sheets=[],i.mode=null,Fin.state.mes=Fin.finance.mesInicial(),Fin.pwa.proteger().catch(()=>{}),Fin.ui.toast(`Pronto! ${a.lancamentos.length+a.cartaoCompras.length} registros salvos.`),Fin.router.go("/dashboard")}catch(e){Fin.ui.toast(e.message,"error")}}function G(a,e){const s=new Blob([a],{type:"application/json"}),r=document.createElement("a");r.href=URL.createObjectURL(s),r.download=e,r.click(),setTimeout(()=>URL.revokeObjectURL(r.href),1e3)}const T=()=>`financas-backup-${u.todayISO()}.json`;async function C(){Fin.finance.cartoes(),G(await Fin.storage.exportBackup(),T()),Fin.storage.registrarBackup(),Fin.ui.toast(Fin.cofre.existeConta()?"Backup baixado (cifrado: abre só com a sua senha).":"Backup baixado. Guarde o arquivo em um lugar seguro (ex.: Google Drive)."),b()}async function da(){Fin.finance.cartoes();const a=new File([await Fin.storage.exportBackup()],T(),{type:"application/json"});try{await navigator.share({files:[a],title:"Backup Valoris"}),Fin.storage.registrarBackup(),Fin.ui.toast("Backup enviado."),b()}catch(e){e?.name!=="AbortError"&&Fin.ui.toast("Não foi possível compartilhar. Use “Baixar backup”.","error")}}async function pa(){const a=j();if(!await Fin.ui.confirmar({titulo:"Apagar todos os dados deste aparelho?",icone:"alerta",cor:"rose",intro:"O app volta ao estado de recém-instalado neste navegador. <b>Não dá para desfazer</b> sem um backup.",perde:[`<b>${f(a.lanc,"lançamento","lançamentos")}</b> e <b>${f(a.compras,"compra","compras")} no cartão</b>${a.de?` (${A(a.de,a.ate)})`:""}.`,`<b>${f(a.cats,"categoria","categorias")}</b>, <b>${f(a.cartoes,"cartão","cartões")}</b>, orçamentos e configurações.`,...a.invMovs||a.invContas?[`<b>Investimentos</b>: ${f(a.invContas,"conta","contas")}, ${f(a.invMovs,"movimentação","movimentações")}, reserva e metas.`]:[],`O <b>acesso deste aparelho</b> (usuário ${l(Fin.cofre.usuario()||"")} e senha): o app volta para "Criar acesso".`],mantem:[...a.drive?['A cópia no <b>Google Drive</b>: o aparelho é desconectado antes de apagar, então o Drive e os outros aparelhos não são afetados. Para trazer de volta: "Já uso o app em outro aparelho".']:["Backups que você já baixou."],"Os outros aparelhos onde você usa o app."],backup:C,ciente:"Entendi que tudo neste aparelho será apagado e que não dá para desfazer.",palavra:"APAGAR",botao:"Apagar tudo"})){Fin.ui.toast("Nada foi apagado.");return}Fin.drive.desconectar(),Fin.storage.clearAll(),location.reload()}function ua(a){const e=a.target.closest("[data-sheet]");if(!e)return;const s=Number(e.dataset.sheet),r=i.sheets[s];a.target.dataset.action==="kind"&&Fin.importer.setKind(r,a.target.value),a.target.dataset.action==="column"&&Fin.importer.setColumn(r,Number(a.target.dataset.col),a.target.value);const o=e.querySelector("details")?.open;e.outerHTML=I(r,s);const t=p.querySelector(`[data-sheet="${s}"] details`);t&&o&&(t.open=!0),P()}function b(){const a=i.mode||(Fin.storage.hasData()?null:"upload");p.innerHTML=a==="review"?sa():a==="restore"?aa():a==="upload"?(Fin.storage.hasData()?"":Z())+oa()+Y()+Q():V(),a==="review"&&P(),a==="upload"&&ma(),a||(z(),Fin.drive.desenharStatus())}function ma(){const a=p.querySelector("#dropzone");p.querySelector("#file-input").addEventListener("change",e=>D(e.target.files[0])),["dragenter","dragover"].forEach(e=>a.addEventListener(e,s=>{s.preventDefault(),a.classList.add("is-dragging")})),["dragleave","drop"].forEach(e=>a.addEventListener(e,s=>{s.preventDefault(),a.classList.remove("is-dragging")})),a.addEventListener("drop",e=>D(e.dataTransfer.files[0]))}return{title:"Dados e backup",handleFile:D,state:i,render(a,{signal:e}){p=a,p.addEventListener("change",r=>{if(r.target.id==="backup-input")return ea(r.target.files[0]);if(r.target.id==="bloqueio-min")return Fin.storage.setPref("bloqueioMin",Number(r.target.value)),Fin.ui.toast("Bloqueio automático atualizado.");ua(r)},{signal:e}),p.addEventListener("submit",async r=>{if(r.target.id!=="conflito-form")return;r.preventDefault();const o=r.target;try{await Fin.drive.resolverConflito(o.elements.usuario.value,o.elements.senha.value),Fin.ui.toast("Dados juntados. Este aparelho agora usa a senha do outro aparelho."),b()}catch(t){Fin.ui.toast(t.message.includes("incorretos")?t.message:`Não foi possível juntar: ${t.message}`,"error")}},{signal:e}),p.addEventListener("click",async r=>{const o=r.target.closest("[data-act]")?.dataset.act;if(o==="backup"&&C(),o==="compartilhar"&&da(),o==="save"&&ca(),o==="reimport"&&ia(),o==="cancel"&&(i.mode=null,i.sheets=[],b()),o==="restore-ok"&&ta(),o==="restore-cancel"&&(Object.assign(i,{mode:null,restore:null}),b()),o==="apagar"&&pa(),o==="zero"&&!Fin.storage.hasData()&&X(),o==="demo"&&Fin.ehBeta&&!Fin.storage.hasData()&&_(),o==="instalar"&&(await Fin.pwa.instalar(),b()),o==="trocar-senha"&&J(),o==="nova-chave"&&W(),o==="drive-conectar"){try{const t=await Fin.drive.conectar();t?.conflito?Fin.ui.toast("Encontrei dados do app no seu Drive. Entre com o usuário e a senha usados lá para juntar."):t?.erro?Fin.ui.toast(t.erro,"error"):Fin.ui.toast("Google Drive conectado. Seus dados estão guardados.")}catch(t){Fin.ui.toast(t.message,"error")}b()}if(o==="drive-sync"&&Fin.drive.sincronizar(),o==="drive-sair"&&confirm("Desconectar o Google Drive deste aparelho? Os dados continuam aqui e no Drive.")&&(Fin.drive.desconectar(),b()),o==="proteger"){const t=await Fin.pwa.proteger();Fin.ui.toast(t?"Dados protegidos.":"O navegador não concedeu a proteção agora (ele decide pelo uso do site). Mantenha backups.",t?"ok":"error"),z()}},{signal:e}),window.addEventListener("fin:pwa",()=>{i.mode||b()},{signal:e});let s=!!Fin.drive.estado.conflito;window.addEventListener("fin:drive",()=>{const r=!!Fin.drive.estado.conflito;r!==s&&!i.mode&&(s=r,b())},{signal:e}),b(),Fin.drive.desenharStatus()}}})();
