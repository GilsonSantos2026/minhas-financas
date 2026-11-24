/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.forms=Fin.forms||{},Fin.forms.cartao=(()=>{const $=Fin.fmt,f=$.esc,y=Fin.finance,F=Fin.parsers,d=Fin.storage;function M(r=null){if(!r&&!Fin.plano.exigir("cartoes",d.list("cartoes").length))return;const a=r?d.list("cartoes").find(o=>o.id===r):null,C=a?d.list("cartaoCompras").filter(o=>o.cartao===a.nome).length:0,k=o=>'<option value="">—</option>'+Array.from({length:31},(m,n)=>`<option value="${n+1}" ${o===n+1?"selected":""}>dia ${n+1}</option>`).join(""),c=Fin.ui.openModal(`
      <form id="cartao-form" novalidate>
        <div class="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 class="font-semibold text-lg">${a?"Configurar cartão":"Novo cartão"}</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <div class="px-5 py-4 space-y-4">
          <label class="field"><span>Nome do cartão *</span>
            <input name="nome" class="input" maxlength="40" value="${f(a?.nome)}" placeholder="Ex.: Nubank" /></label>

          <div class="grid grid-cols-2 gap-3">
            <label class="field"><span>Fechamento da fatura</span>
              <select name="diaFechamento" class="input">${k(a?.diaFechamento)}</select></label>
            <label class="field"><span>Vencimento da fatura</span>
              <select name="diaVencimento" class="input">${k(a?.diaVencimento)}</select></label>
          </div>
          <p class="text-xs text-slate-500 -mt-2">Com o fechamento, o app calcula sozinho em qual fatura cada compra cai.</p>

          <label class="field"><span>Limite (R$)</span>
            <input name="limite" class="input tabular-nums" inputmode="decimal" value="${$.decimalInput(a?.limite)}" placeholder="Opcional" /></label>

          <label class="field"><span>Palavra do lançamento de pagamento</span>
            <input name="palavraChave" class="input" maxlength="30" value="${f(a?.palavraChave)}" placeholder="Ex.: ourocard" /></label>
          <p class="text-xs text-slate-500 -mt-2">Usada para achar o pagamento da fatura nos lançamentos
            (ex.: “ourocard” encontra “CARTÃO - OUROCARD BB” na categoria Pagamento Fatura).</p>

          <p id="form-erro" class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
        </div>
        <div class="flex items-center gap-2 px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
          ${a?'<button type="button" data-delete class="btn btn-danger-ghost">Excluir cartão</button>':""}
          ${a&&C?'<button type="button" data-apagar-compras class="btn btn-ghost !text-rose-700">Apagar compras…</button>':""}
          <span class="flex-1"></span>
          <button type="button" data-close class="btn btn-ghost">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar</button>
        </div>
      </form>`,a?"Configurar cartão":"Novo cartão"),x=c.querySelector("#cartao-form"),g=o=>x.elements[o];c.querySelectorAll("[data-close]").forEach(o=>o.addEventListener("click",Fin.ui.closeModal)),c.querySelector("[data-apagar-compras]")?.addEventListener("click",()=>{Fin.ui.closeModal(),w({cartao:a.nome,ym:Fin.state.mes})}),c.querySelector("[data-delete]")?.addEventListener("click",()=>{if(C){Fin.ui.closeModal(),w({cartao:a.nome,ym:Fin.state.mes,excluirCartao:!0});return}confirm(`Excluir o cartão “${a.nome}”?`)&&(d.remove("cartoes",a.id),Fin.state.cartao=null,Fin.ui.closeModal(),Fin.ui.toast("Cartão excluído."),Fin.router.refresh())}),x.addEventListener("submit",o=>{o.preventDefault();const m=x.querySelector("#form-erro"),n=g("nome").value.trim(),s=y.cartoes().some(h=>h.id!==a?.id&&F.normalize(h.nome)===F.normalize(n));if(!n||s){m.textContent=n?"Já existe um cartão com esse nome.":"Informe o nome do cartão.",m.classList.remove("hidden");return}const i={...a?{id:a.id}:{},nome:n,diaFechamento:Number(g("diaFechamento").value)||null,diaVencimento:Number(g("diaVencimento").value)||null,limite:F.toNumber(g("limite").value),palavraChave:F.normalize(g("palavraChave").value)||F.normalize(n).split(" ")[0]};d.upsert("cartoes",i),a&&a.nome!==n&&d.set("cartaoCompras",d.list("cartaoCompras").map(h=>h.cartao===a.nome?{...h,cartao:n}:h)),Fin.state.cartao=n,Fin.ui.closeModal(),Fin.ui.toast(a?"Cartão atualizado.":"Cartão criado."),Fin.router.refresh()})}async function N(){y.cartoes();const r=new Blob([await d.exportBackup()],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(r),a.download=`financas-backup-${$.todayISO()}.json`,a.click(),setTimeout(()=>URL.revokeObjectURL(a.href),1e3),d.registrarBackup()}function w({cartao:r,ym:a=Fin.state.mes,excluirCartao:C=!1}={}){const k=y.cartao(r),c=d.list("cartaoCompras").filter(e=>e.cartao===r);if(!k||!c.length){Fin.ui.toast("Este cartão não tem compras para apagar.");return}const x=c.map(e=>e.fatura).filter(Boolean).sort(),g=x[0]||a,o=x[x.length-1]||a,m=e=>e?$.monthShort(e):"—",n=Fin.ui.openModal(`
      <form id="apagar-form" novalidate>
        <div data-arrastar class="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 class="font-semibold text-lg">Apagar compras · ${f(r)}</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <div class="px-5 py-4 space-y-4">
          <fieldset class="space-y-2">
            <legend class="text-sm font-medium text-slate-700 mb-1">O que apagar?</legend>
            <label class="quem-opcao-linha flex items-start gap-2 text-sm cursor-pointer rounded-xl border border-slate-200 px-3 py-2.5">
              <input type="radio" name="escopo" value="fatura" class="mt-0.5 accent-rose-600">
              <span><b>Só a fatura de ${f(m(a))}</b><span class="block text-xs text-slate-500" data-n="fatura"></span></span></label>
            <label class="flex items-start gap-2 text-sm cursor-pointer rounded-xl border border-slate-200 px-3 py-2.5">
              <input type="radio" name="escopo" value="periodo" class="mt-0.5 accent-rose-600">
              <span class="flex-1"><b>Um período</b> (de fatura a fatura)
                <span class="grid grid-cols-2 gap-2 mt-2">
                  <label class="field"><span>De</span><input type="month" name="de" class="input" value="${f(a)}"></label>
                  <label class="field"><span>Até</span><input type="month" name="ate" class="input" value="${f(a)}"></label>
                </span>
                <span class="block text-xs text-slate-500 mt-1" data-n="periodo"></span></span></label>
            <label class="flex items-start gap-2 text-sm cursor-pointer rounded-xl border border-slate-200 px-3 py-2.5">
              <input type="radio" name="escopo" value="todas" class="mt-0.5 accent-rose-600">
              <span><b>Todas as compras deste cartão</b><span class="block text-xs text-slate-500" data-n="todas"></span></span></label>
          </fieldset>

          <label class="flex items-start gap-2 text-sm cursor-pointer" data-g="futuras">
            <input type="checkbox" name="futuras" class="mt-0.5 w-4 h-4 accent-rose-600">
            <span>Apagar também as <b>parcelas futuras</b> (de outras faturas) das compras parceladas que forem apagadas
              <span class="block text-xs text-slate-500" data-n="futuras"></span></span></label>
          <label class="flex items-start gap-2 text-sm cursor-pointer" data-g="cartao">
            <input type="checkbox" name="cartao" class="mt-0.5 w-4 h-4 accent-rose-600" ${C?"checked":""}>
            <span>Excluir também o <b>cartão “${f(r)}”</b> (configuração, vencimento e limite)</span></label>

          <p class="text-sm bg-slate-50 rounded-xl px-3 py-2.5" data-resumo></p>
          <p class="text-xs text-slate-500">Os lançamentos de <b>pagamento da fatura</b> (em Lançamentos) <b>não</b> são apagados.</p>
          <p id="form-erro" class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
        </div>
        <div class="flex items-center gap-2 px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
          <span class="flex-1"></span>
          <button type="button" data-close class="btn btn-ghost">Cancelar</button>
          <button type="submit" class="btn bg-rose-600 hover:bg-rose-700 text-white">Continuar</button>
        </div>
      </form>`,"Apagar compras do cartão"),s=n.querySelector("#apagar-form"),i=e=>s.elements[e],h=()=>s.querySelector("[name=escopo]:checked").value;s.querySelector(`[name=escopo][value="${C?"todas":"fatura"}"]`).checked=!0,n.querySelectorAll("[data-close]").forEach(e=>e.addEventListener("click",Fin.ui.closeModal));const z=(e,l,p)=>e.fatura&&e.fatura>=l&&e.fatura<=p,S=e=>`${e.length} ${e.length===1?"compra":"compras"} · ${$.brl(y.soma(e))}`;function O(){const e=h();let l=e==="todas"?c:e==="fatura"?c.filter(t=>t.fatura===a):c.filter(t=>z(t,i("de").value||g,i("ate").value||o));const p=new Set(l.filter(t=>t.grupo&&t.parcela?.total>1).map(t=>t.grupo)),u=e==="todas"?[]:c.filter(t=>t.grupo&&p.has(t.grupo)&&!l.includes(t));return i("futuras").checked&&(l=[...l,...u]),{lista:l,futuras:u}}function E(){const e=h(),l=i("de").value||g,p=i("ate").value||o;s.querySelector("[data-n=fatura]").textContent=S(c.filter(b=>b.fatura===a)),s.querySelector("[data-n=periodo]").textContent=l>p?"A fatura inicial é depois da final.":S(c.filter(b=>z(b,l,p))),s.querySelector("[data-n=todas]").textContent=`${S(c)} · faturas de ${m(g)} a ${m(o)}`,s.querySelector("[data-g=futuras]").classList.toggle("hidden",e==="todas"),s.querySelector("[data-g=cartao]").classList.toggle("hidden",e!=="todas");const{lista:u,futuras:t}=O();s.querySelector("[data-n=futuras]").textContent=t.length?`${t.length} ${t.length===1?"parcela futura encontrada":"parcelas futuras encontradas"}.`:"Nenhuma parcela futura encontrada.",s.querySelector("[data-resumo]").innerHTML=u.length?`Serão apagadas <b>${S(u)}</b>${e==="todas"&&i("cartao").checked?" e o cartão":""}.`:"Nenhuma compra encontrada com essa escolha."}s.addEventListener("input",E),s.addEventListener("change",E),E(),s.addEventListener("submit",async e=>{e.preventDefault();const l=s.querySelector("#form-erro"),p=h();if(p==="periodo"&&(i("de").value||g)>(i("ate").value||o)){l.textContent="A fatura inicial precisa ser antes (ou igual) à final.",l.classList.remove("hidden");return}const{lista:u,futuras:t}=O(),b=p==="todas"&&i("cartao").checked;if(!u.length&&!b){l.textContent="Nenhuma compra encontrada com essa escolha.",l.classList.remove("hidden");return}const q=[...new Set(u.map(v=>v.fatura).filter(Boolean))].sort(),A=u.filter(v=>v.parcela?.total>1).length,R=p==="fatura"?`da fatura de ${m(a)}`:p==="periodo"?`das faturas de ${m(i("de").value)} a ${m(i("ate").value)}`:"de todas as faturas";if(!await Fin.ui.confirmar({titulo:b?`Excluir o cartão “${f(r)}” e todas as compras?`:`Apagar as compras ${R}?`,intro:`Cartão <b>${f(r)}</b>. As compras apagadas somem das faturas, do limite usado e dos gráficos.`,perde:[`<b>${u.length}</b> ${u.length===1?"compra":"compras"} serão apagadas (<b>${$.brl(y.soma(u))}</b>)${q.length?` · faturas de ${m(q[0])} a ${m(q[q.length-1])}`:""}`,...A?[`${A} ${A===1?"é parcelada":"são parceladas"}${i("futuras").checked&&t.length?`; as ${t.length} parcelas futuras também serão apagadas`:p==="todas"?"":"; as parcelas de outras faturas continuam (só se você não marcou apagá-las)"}`]:[],...b?[`O cartão “${f(r)}” (fechamento, vencimento, limite) será excluído`]:[],"Sincronizado com o Google Drive, some também dos outros aparelhos"],mantem:["Os lançamentos de pagamento da fatura (em Lançamentos) continuam como estão",...b?[]:[`O cartão “${f(r)}” continua cadastrado`]],backup:N,ciente:"Entendi que as compras serão apagadas e que não dá para desfazer.",palavra:p==="todas"?"APAGAR":null,botao:b?"Excluir cartão e compras":"Apagar compras"}))return;const L=new Set(u.map(v=>v.id));d.set("cartaoCompras",d.list("cartaoCompras").filter(v=>!L.has(v.id))),b&&(d.remove("cartoes",k.id),Fin.state.cartao=null),Fin.ui.toast(b?`Cartão “${r}” e ${L.size} compras apagados.`:`${L.size} ${L.size===1?"compra apagada":"compras apagadas"}.`),Fin.router.refresh()})}return{open:M,apagarCompras:w}})();
