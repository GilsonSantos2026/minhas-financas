/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.importarFatura=(()=>{const c=Fin.fmt,i=c.esc,f=Fin.finance,u=()=>Fin.faturaImportador,q={compra:["Compra","bg-slate-100 text-slate-600"],encargo:["Encargo","bg-amber-50 text-amber-800"],credito:["Crédito","bg-emerald-50 text-emerald-800"],pagamento:["Pagamento","bg-sky-50 text-sky-800"]},t={arquivo:null,leitura:null,linhas:[],cartao:null,fatura:null,futuras:!0,etapa:"upload",progresso:""};function b(){Object.assign(t,{arquivo:null,leitura:null,linhas:[],cartao:null,fatura:null,futuras:!0,etapa:"upload",progresso:""})}function C(){return`
      <section class="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
        <div class="flex items-start justify-between gap-3">
          <div>
            ${Fin.icones.titulo("upload","violet","Importar fatura do cartão",{cls:"text-lg",tam:"w-8 h-8",ic:"w-[18px] h-[18px]"})}
            <p class="text-sm text-slate-500 mt-1">Envie o PDF da fatura (recomendado) ou uma foto/print.
              O arquivo é lido aqui no seu navegador — nada é enviado para a internet.</p>
          </div>
          <a href="#/cartoes" class="text-sm text-slate-500 hover:text-slate-800 shrink-0">Voltar</a>
        </div>
        <label id="fat-drop" for="fat-input"
          class="dropzone mt-5 flex flex-col items-center justify-center text-center gap-2 border-2 border-dashed border-slate-300 rounded-2xl px-4 py-10 cursor-pointer transition">
          <span class="text-4xl" aria-hidden="true">📄</span>
          <span class="font-medium">Toque para escolher a fatura</span>
          <span class="text-sm text-slate-500 hidden sm:block">ou arraste e solte aqui</span>
          <span class="text-xs text-slate-400">PDF, JPG ou PNG</span>
          <input id="fat-input" type="file" class="sr-only" accept="application/pdf,.pdf,image/*" />
        </label>
        <ul class="text-xs text-slate-500 mt-4 space-y-1 list-disc pl-5">
          <li>Testado com faturas do Sicoob, Banco do Brasil (Ourocard) e Mercado Pago. PDF com senha: o app pede a senha.</li>
          <li>Foto ou print usa reconhecimento de texto (OCR): é mais lento e pode errar — revise com atenção.</li>
        </ul>
      </section>
      <section class="bg-white rounded-2xl shadow-sm p-5 mt-4">
        <div class="flex items-start gap-3">
          ${Fin.icones.badge("mensagem","violet","w-10 h-10","w-5 h-5")}
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold">O leitor não entendeu a sua fatura?</h3>
            <p class="text-sm text-slate-500 mt-0.5">Use o ChatGPT ou o Gemini que você já tem, sem custo: o app copia o texto da fatura,
              a IA organiza os lançamentos e você cola a resposta aqui para conferir e importar.</p>
            <label for="fat-input-ia" class="btn btn-ghost mt-3 cursor-pointer">${Fin.icone("mensagem","w-4 h-4")} Ler com ajuda da IA</label>
            <input id="fat-input-ia" type="file" class="sr-only" accept="application/pdf,.pdf,image/*" />
          </div>
        </div>
      </section>`}function E(){return`
      <section class="bg-white rounded-2xl shadow-sm p-8 text-center">
        <span class="spinner inline-block" aria-hidden="true"></span>
        <p class="mt-3 font-medium">${i(t.arquivo?.name||"")}</p>
        <p id="fat-prog" class="text-sm text-slate-500 mt-1">${i(t.progresso||"Lendo a fatura…")}</p>
      </section>`}const g=()=>t.linhas.filter(a=>a.incluir);function L(){const{info:a,conferencia:o}=t.leitura,s=g().reduce((r,p)=>r+p.valor,0),e=(r,p)=>`<div class="flex justify-between gap-3"><span class="text-slate-500">${r}</span><span class="tabular-nums font-medium">${p}</span></div>`;let n="";return o.esperado!=null&&(n=o.ok?'<p class="mt-2 text-sm text-emerald-800 bg-emerald-50 rounded-lg px-3 py-2"><span aria-hidden="true">✓</span> Leitura conferida: os lançamentos somam exatamente o esperado pela fatura.</p>':`<p class="mt-2 text-sm text-amber-800 bg-amber-50 rounded-lg px-3 py-2"><span aria-hidden="true">!</span> Diferença de ${c.brl(o.esperado-o.lido)} entre o lido (${c.brl(o.lido)}) e o esperado (${c.brl(o.esperado)}). Confira se faltou algum item.</p>`),`
      <div class="text-sm space-y-1">
        ${a.total!=null?e("Total da fatura",c.brl(a.total)):""}
        ${a.saldoAnterior?e("Saldo da fatura anterior",c.brl(a.saldoAnterior)):""}
        ${e("Novos lançamentos lidos",c.brl(o.lido))}
        ${e("Selecionados para importar",c.brl(s))}
      </div>${n}`}const h=a=>new Date(a).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"});function j(a){return a?a.origem==="pdf"?`Já importado${a.arquivo?` de ${a.arquivo}`:""}${a.criadoEm?` em ${h(a.criadoEm)}`:""}`:a.origem==="app"?"Já lançado manualmente no app":"Já existe (veio da planilha importada)":""}function k(){const a=u().jaImportada(t.linhas);if(!a)return"";const o=a.deImportacao?`Esta fatura parece já ter sido importada${a.quando?` em ${h(a.quando)}`:""}${a.arquivo&&a.arquivo!==t.arquivo.name?` (arquivo ${i(a.arquivo)})`:""}.`:"Os lançamentos desta fatura já estão na base (vieram da planilha ou foram lançados no app).",s=a.deImportacao&&a.dups>a.daImportacao?` (${a.daImportacao} da importação anterior e ${a.dups-a.daImportacao} da planilha/app)`:"",e=a.novos?`${a.dups} de ${a.total} itens já existem${s} e vieram desmarcados. ${a.novos===1?"Só 1 item é novo":`Só ${a.novos} itens são novos`} — confira antes de importar.`:`Todos os ${a.total} itens já existem${s}: não há nada novo para importar.`;return`
      <div class="rounded-xl bg-violet-50 text-violet-900 px-3 py-2.5 text-sm" role="status">
        <p class="font-semibold"><span aria-hidden="true">⧉</span> ${o}</p>
        <p class="mt-0.5">${e}</p>
      </div>`}function I(){const a=t.leitura?.cartoes;if(!a?.misturada)return"";const o=a.resumo.map(s=>{const e=s.via==="virtual"?"Virtual":s.via==="adicional"?"Adicional":"Principal";return`<li class="flex items-center gap-2 py-1">
        <span class="pill ${s.via==="virtual"?"bg-sky-50 text-sky-800":s.via==="adicional"?"bg-amber-50 text-amber-800":"bg-slate-100 text-slate-600"}">${e}</span>
        <span class="flex-1 min-w-0 truncate" title="${i(s.secao)}">${i(s.secao)}</span>
        <span class="shrink-0 text-xs text-slate-600 tabular-nums">${s.qtd} ${s.qtd===1?"compra":"compras"} · ${c.brl(s.total)}</span>
      </li>`}).join("");return`
      <div class="rounded-xl bg-amber-50 text-amber-900 px-3 py-2.5 text-sm" role="status">
        <p class="font-semibold"><span aria-hidden="true">≠</span> ${a.resumo.length>1?`Esta fatura tem compras de ${a.resumo.length} cartões diferentes.`:`Esta fatura é de um cartão ${a.resumo[0].via}.`}</p>
        <p class="mt-0.5 text-xs">Cada compra é marcada como <b>principal</b>, <b>adicional</b> ou <b>virtual</b> ao importar, e a marca fica nos lançamentos do cartão.</p>
        <ul class="mt-1 divide-y divide-amber-200/60">${o}</ul>
      </div>`}function S(a){const[o,s]=q[a.tipo],e=f.categorias("despesa").map(r=>`<option ${r.nome===a.categoria?"selected":""}>${i(r.nome)}</option>`).join(""),n=f.categorias("despesa").some(r=>r.nome===a.categoria)?"":`<option selected>${i(a.categoria)}</option>`;return`
      <li class="px-3 sm:px-4 py-3 ${a.incluir?"":"bg-slate-50"}" data-n="${a.n}">
        <div class="flex items-start gap-3">
          <input type="checkbox" data-f="incluir" class="mt-1 w-5 h-5 accent-prim-600 shrink-0" ${a.incluir?"checked":""}
                 aria-label="Importar ${i(a.descricao)}" />
          <div class="flex-1 min-w-0 space-y-1.5">
            <div class="flex items-start gap-2">
              <input data-f="descricao" value="${i(a.descricao)}" class="flex-1 min-w-0 text-sm font-medium bg-transparent border-0 border-b border-transparent focus:border-prim-500 focus:outline-none px-0 py-0.5 ${a.incluir?"":"text-slate-400 line-through"}" aria-label="Descrição" />
              <span class="text-sm font-semibold tabular-nums whitespace-nowrap ${a.valor<0?"text-emerald-700":""} ${a.incluir?"":"text-slate-400"}">${c.brl(a.valor)}</span>
            </div>
            <div class="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span>${c.date(a.data).slice(0,5)}</span>
              ${a.parcela?`<span class="pill bg-slate-100 text-slate-600">parcela ${a.parcela.atual}/${a.parcela.total}</span>`:""}
              <span class="pill ${s}">${o}</span>
              ${a.duplicada?`<span class="pill bg-violet-50 text-violet-800" title="${i(j(a.existente))}">⧉ já existe</span>`:""}
              ${a.via?`<span class="pill ${a.via==="virtual"?"bg-sky-50 text-sky-800":"bg-amber-50 text-amber-800"}" title="${i(a.secao||"")}">${a.via==="virtual"?"Cartão virtual":"Cartão adicional"}</span>`:""}
              ${a.secao?`<span class="truncate max-w-[12rem]" title="${i(a.secao)}">${i(a.secao)}</span>`:""}
            </div>
            ${a.incluir?`<select data-f="categoria" class="input !py-1 !text-xs !w-auto max-w-full" aria-label="Categoria">${n}${e}</select>`:""}
          </div>
        </div>
      </li>`}function P(){const{info:a}=t.leitura,o=f.cartoes(),s=u().parcelasFuturas(t.linhas,t.cartao,t.fatura),e=g(),n=t.linhas.filter(r=>r.duplicada).length;return`
      <div class="space-y-4 pb-24">
        <section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5 space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              ${Fin.icones.titulo("recibo","violet","Confira a fatura",{cls:"text-lg",tam:"w-8 h-8",ic:"w-[18px] h-[18px]"})}
              <p class="text-sm text-slate-500 break-all">${i(t.arquivo.name)}${a.banco?` · ${i(a.banco)}`:""}${a.finalCartao?` · final ${i(a.finalCartao)}`:""}</p>
            </div>
            <button data-act="cancelar" class="text-sm text-slate-500 hover:text-slate-800 shrink-0">Cancelar</button>
          </div>

          ${k()}
          ${I()}

          <div class="grid grid-cols-2 gap-3">
            <label class="field"><span>Cartão</span>
              <select id="fat-cartao" class="input">${o.map(r=>`<option ${r.nome===t.cartao?"selected":""}>${i(r.nome)}</option>`).join("")}</select></label>
            <label class="field"><span>Fatura (vencimento)</span>
              <input id="fat-mes" type="month" class="input" value="${t.fatura}" /></label>
          </div>

          ${L()}

          <label class="flex items-start gap-2 text-sm">
            <input id="fat-futuras" type="checkbox" class="mt-0.5 w-4 h-4 accent-prim-600" ${t.futuras?"checked":""} />
            <span>Criar as parcelas futuras das compras parceladas
              <span class="text-slate-500">(${s.length} ${s.length===1?"parcela":"parcelas"} nas próximas faturas; as que já existem são ignoradas)</span></span>
          </label>
          ${n?`<p class="text-xs text-slate-500"><span aria-hidden="true">⧉</span> ${n} ${n===1?"item já existe":"itens já existem"} neste cartão/fatura e ${n===1?"veio desmarcado":"vieram desmarcados"}. Pagamentos também vêm desmarcados (já estão nos seus lançamentos).</p>`:""}
        </section>

        <div class="flex items-center justify-between px-1">
          <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide">${t.linhas.length} itens na fatura</h3>
          <div class="flex gap-3 text-xs font-medium">
            <button data-act="todos" class="text-prim-700 hover:underline">Marcar todos</button>
            <button data-act="nenhum" class="text-slate-500 hover:underline">Desmarcar todos</button>
          </div>
        </div>
        <ul id="fat-lista" class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">${t.linhas.map(S).join("")}</ul>
      </div>

      <div class="fixed inset-x-0 bottom-16 md:bottom-0 md:left-60 z-20 bg-white/95 backdrop-blur border-t border-slate-200">
        <div class="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <p class="text-sm text-slate-600 flex-1 min-w-0">
            <b>${e.length}</b> ${e.length===1?"item":"itens"} · <span class="tabular-nums">${c.brl(e.reduce((r,p)=>r+p.valor,0))}</span>
            ${t.futuras&&s.length?`<span class="text-slate-400"> + ${s.length} futuras</span>`:""}
          </p>
          <button data-act="importar" class="btn btn-primary shrink-0" ${e.length?"":"disabled"}>Importar</button>
        </div>
      </div>`}let d=null;function l(){if(!d)return;const a=window.scrollY;d.innerHTML=t.etapa==="revisao"?P():t.etapa==="processando"?E():C(),t.etapa==="upload"&&D(),t.etapa==="revisao"&&window.scrollTo(0,a)}function $(a,o){return new Promise(s=>{let e=!1;const n=x=>{e||(e=!0,p.disconnect(),Fin.ui.closeModal(),s(x))},r=Fin.ui.openModal(`
        <form class="p-5 space-y-4" novalidate autocomplete="off">
          <div class="flex items-start gap-3">
            ${Fin.icones.badge("cadeado","amber","w-10 h-10","w-5 h-5")}
            <div class="min-w-0 flex-1">
              <h2 class="font-semibold text-lg leading-tight">Fatura protegida por senha</h2>
              <p class="text-sm text-slate-500 truncate">${i(a)}</p>
            </div>
          </div>
          <p class="text-sm text-slate-600">Veja no e-mail do banco qual é a senha — costuma ser parte do CPF (ex.: os 5 primeiros números) ou a data de nascimento.</p>
          <label class="field"><span>Senha do PDF</span>
            <div class="relative">
              <input name="senha" type="password" class="input pr-16" autocomplete="off" inputmode="text" />
              <button type="button" data-ver class="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-slate-500 hover:text-slate-800">mostrar</button>
            </div></label>
          ${o?'<p class="text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert">Senha incorreta. Tente de novo.</p>':""}
          <p class="text-xs text-slate-500">${Fin.icone("cadeado","w-3.5 h-3.5 inline -mt-0.5")} A senha é usada só para abrir este arquivo agora e <b>não fica guardada</b>.</p>
          <div class="flex justify-end gap-2">
            <button type="button" data-cancelar class="btn btn-ghost">Cancelar</button>
            <button type="submit" class="btn btn-primary">Abrir fatura</button>
          </div>
        </form>`,"Senha da fatura"),p=new MutationObserver(()=>{document.body.contains(r)||n(null)});p.observe(document.getElementById("modal-root"),{childList:!0});const m=r.querySelector("[name=senha]");setTimeout(()=>m.focus(),50),r.querySelector("[data-ver]").addEventListener("click",x=>{const F=m.type==="password";m.type=F?"text":"password",x.currentTarget.textContent=F?"ocultar":"mostrar"}),r.querySelector("[data-cancelar]").addEventListener("click",()=>n(null)),r.querySelector("form").addEventListener("submit",x=>{if(x.preventDefault(),!m.value)return m.focus();n(m.value)})})}function y(a){t.leitura=a,t.cartao=u().sugerirCartao(a.info),t.fatura=a.info.vencimento?a.info.vencimento.slice(0,7):Fin.state.mes,t.linhas=u().preparar(a,t.cartao,t.fatura),t.etapa="revisao",l(),window.scrollTo(0,0)}async function w(a,o=null){if(!a)return;if(!f.cartoes().length)return Fin.ui.toast("Cadastre o cartão antes de importar a fatura.","error"),Fin.forms.cartao.open();Object.assign(t,{arquivo:a,etapa:"processando",progresso:"Extraindo o texto da fatura…"}),l();let s;try{s=await Fin.faturaLeitor.texto(a,n=>{const r=document.getElementById("fat-prog");r&&(r.textContent=n)},{senha:o})}catch(n){if(t.etapa="upload",l(),n?.senha){const r=await $(a.name,n.incorreta);return r?w(a,r):Fin.ui.toast("Importação cancelada.")}return Fin.ui.toast(n.message||"Não foi possível ler o arquivo.","error")}if(t.etapa="upload",l(),!s.texto.trim())return Fin.ui.toast("Não achei texto neste arquivo.","error");const e=Fin.ui.openModal(`
      <div class="p-5 space-y-4">
        <div data-arrastar class="flex items-center justify-between gap-2">
          <h2 class="font-semibold text-lg">Ler a fatura com a IA</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <section class="space-y-2">
          <div class="text-sm font-semibold"><span class="inline-grid place-items-center w-5 h-5 rounded-full bg-prim-600 text-white text-[11px] mr-1">1</span> Copie e cole no ChatGPT ou no Gemini</div>
          ${Fin.ia.blocoCopia(Fin.ia.pedidoFatura(s.texto),{linhas:7})}
        </section>
        <section class="space-y-2">
          <div class="text-sm font-semibold"><span class="inline-grid place-items-center w-5 h-5 rounded-full bg-prim-600 text-white text-[11px] mr-1">2</span> Cole aqui a resposta da IA</div>
          <textarea data-ia-resposta class="input font-mono !text-xs" rows="7" spellcheck="false" placeholder="05/10;SUPERMERCADO EXEMPLO;123,45&#10;07/10;LOJA X 02/06;89,90"></textarea>
          <p data-ia-erro class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
          <button type="button" data-ia-conferir class="btn btn-primary w-full">Conferir lançamentos</button>
        </section>
      </div>`,"Ler a fatura com a IA");Fin.ia.ligarCopia(e),e.querySelector("[data-close]").addEventListener("click",()=>Fin.ui.closeModal()),e.querySelector("[data-ia-conferir]").addEventListener("click",()=>{const n=Fin.faturaLeitor.deTexto(e.querySelector("[data-ia-resposta]").value,s.info),r=e.querySelector("[data-ia-erro]");if(!n.itens.length){r.textContent="Não achei nenhuma linha no formato DD/MM;DESCRIÇÃO;VALOR. Confira se colou a resposta inteira.",r.classList.remove("hidden");return}Fin.ui.closeModal(),t.arquivo=a,y(n),Fin.ui.toast(`${n.itens.length} lançamentos lidos pela IA. Confira antes de importar.`)})}async function v(a,o=null){if(a){if(!/pdf$|^image\//i.test(a.type)&&!/\.(pdf|png|jpe?g|webp)$/i.test(a.name)){Fin.ui.toast("Envie um PDF ou uma imagem (JPG/PNG).","error");return}if(!f.cartoes().length)return Fin.ui.toast("Cadastre o cartão antes de importar a fatura.","error"),Fin.forms.cartao.open();Object.assign(t,{arquivo:a,etapa:"processando",progresso:""}),l();try{const s=await Fin.faturaLeitor.ler(a,e=>{t.progresso=e;const n=document.getElementById("fat-prog");n&&(n.textContent=e)},{senha:o});if(o=null,!s.itens.length)throw new Error("Não encontrei lançamentos nesta fatura. Tente “Ler com ajuda da IA”, logo abaixo.");y(s)}catch(s){if(o=null,s?.senha){t.etapa="upload",l();const e=await $(a.name,s.incorreta);return e?v(a,e):Fin.ui.toast("Importação cancelada.")}console.error(s),t.etapa="upload",l(),Fin.ui.toast(s.message||"Não foi possível ler a fatura.","error")}}}function T(){const a=u().salvar(t.linhas,{cartao:t.cartao,fatura:t.fatura,futuras:t.futuras,arquivo:t.arquivo.name});Fin.plano.marcarMes("importarFatura"),Fin.state.cartao=t.cartao,Fin.state.mes=t.fatura,b(),Fin.ui.toast(`${a.qtd} ${a.qtd===1?"item importado":"itens importados"}${a.futuras?` + ${a.futuras} parcelas futuras`:""}.`),Fin.router.go("/cartoes")}function D(){const a=d.querySelector("#fat-drop");d.querySelector("#fat-input").addEventListener("change",o=>v(o.target.files[0])),d.querySelector("#fat-input-ia")?.addEventListener("change",o=>w(o.target.files[0])),["dragenter","dragover"].forEach(o=>a.addEventListener(o,s=>{s.preventDefault(),a.classList.add("is-dragging")})),["dragleave","drop"].forEach(o=>a.addEventListener(o,s=>{s.preventDefault(),a.classList.remove("is-dragging")})),a.addEventListener("drop",o=>v(o.dataTransfer.files[0]))}function A(a,{signal:o}){if(!Fin.plano.pode("importarFatura")){a.innerHTML=Fin.plano.bloqueioHTML("importarFatura");return}d=a,t.etapa==="processando"&&!t.leitura&&(t.etapa="upload"),l(),d.addEventListener("click",s=>{const e=s.target.closest("[data-act]")?.dataset.act;e==="cancelar"&&(b(),l()),e==="importar"&&T(),(e==="todos"||e==="nenhum")&&(t.linhas.forEach(n=>n.incluir=e==="todos"),l())},{signal:o}),d.addEventListener("change",s=>{const e=s.target;if(e.id==="fat-cartao"||e.id==="fat-mes")return e.id==="fat-cartao"&&(t.cartao=e.value),e.id==="fat-mes"&&e.value&&(t.fatura=e.value),u().remarcarDuplicados(t.linhas,t.cartao,t.fatura),l();if(e.id==="fat-futuras")return t.futuras=e.checked,l();const n=e.closest("[data-n]");if(!n)return;const r=t.linhas[Number(n.dataset.n)];e.dataset.f==="incluir"&&(r.incluir=e.checked,l()),e.dataset.f==="categoria"&&(r.categoria=e.value),e.dataset.f==="descricao"&&(r.descricao=e.value.trim()||r.descricao)},{signal:o})}return{title:"Importar fatura",render:A,processar:v,estado:t}})();
