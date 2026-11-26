/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.forms=Fin.forms||{},Fin.forms.cartao=(()=>{const h=Fin.fmt,b=h.esc,y=Fin.finance,F=Fin.parsers,p=Fin.storage;function O(d=null){if(!d&&!Fin.plano.exigir("cartoes",p.list("cartoes").length))return;const e=d?p.list("cartoes").find(a=>a.id===d):null,q=e?p.list("cartaoCompras").filter(a=>a.cartao===e.nome).length:0,S=a=>'<option value="">—</option>'+Array.from({length:31},(o,l)=>`<option value="${l+1}" ${a===l+1?"selected":""}>dia ${l+1}</option>`).join(""),u=Fin.ui.openModal(`
      <form id="cartao-form" novalidate>
        <div class="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 class="font-semibold text-lg">${e?"Configurar cartão":"Novo cartão"}</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <div class="px-5 py-4 space-y-4">
          <label class="field"><span>Nome do cartão *</span>
            <input name="nome" class="input" maxlength="40" value="${b(e?.nome)}" placeholder="Ex.: Nubank" /></label>

          <div class="grid grid-cols-2 gap-3">
            <label class="field"><span>Fechamento da fatura</span>
              <select name="diaFechamento" class="input">${S(e?.diaFechamento)}</select></label>
            <label class="field"><span>Vencimento da fatura</span>
              <select name="diaVencimento" class="input">${S(e?.diaVencimento)}</select></label>
          </div>
          <p class="text-xs text-slate-500 -mt-2">Com o fechamento, o app calcula sozinho em qual fatura cada compra cai.</p>

          <fieldset data-vigencia class="hidden rounded-xl bg-prim-50 px-3 py-2.5 space-y-2 text-sm">
            <legend class="sr-only">A partir de quando valem os novos dias</legend>
            <p class="font-medium">Os novos dias valem para quais faturas?</p>
            <label class="flex items-start gap-2 cursor-pointer">
              <input type="radio" name="vigencia" value="desde" class="mt-0.5 accent-prim-600" checked>
              <span class="flex-1">A partir de uma fatura <span class="block text-xs text-slate-500">As anteriores continuam com os dias antigos.</span></span></label>
            <label class="field pl-6"><span>Primeira fatura com os novos dias</span>
              <input type="month" name="desde" class="input"></label>
            <label class="flex items-start gap-2 cursor-pointer">
              <input type="radio" name="vigencia" value="todas" class="mt-0.5 accent-prim-600">
              <span class="flex-1">Todas as faturas <span class="block text-xs text-slate-500">O dia estava cadastrado errado.</span></span></label>
            <div data-reagendar class="hidden border-t border-slate-200 pt-2">
              <label class="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" name="reagendar" class="mt-0.5 w-4 h-4 accent-prim-600" checked>
                <span class="flex-1" data-reagendar-texto></span></label>
            </div>
            <p class="text-xs text-slate-500">Compras já lançadas continuam na fatura em que estão.</p>
          </fieldset>

          ${e?.diasAntigos?.length?`
          <div data-historico class="rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-600 space-y-1">
            <p class="font-semibold">Dias anteriores deste cartão</p>
            ${[...e.diasAntigos].sort((a,o)=>a.ate.localeCompare(o.ate)).map(a=>`
              <p>Até a fatura de ${b(h.monthShort(a.ate))}: fecha ${a.diaFechamento?`dia ${a.diaFechamento}`:"—"} · vence ${a.diaVencimento?`dia ${a.diaVencimento}`:"—"}</p>`).join("")}
            <label class="flex items-start gap-2 cursor-pointer pt-1">
              <input type="checkbox" name="esquecer" class="mt-0.5 w-4 h-4 accent-prim-600">
              <span class="flex-1">Apagar este histórico e usar os dias atuais em todas as faturas</span></label>
          </div>`:""}

          <label class="field"><span>Limite (R$)</span>
            <input name="limite" class="input tabular-nums" inputmode="decimal" value="${h.decimalInput(e?.limite)}" placeholder="Opcional" /></label>

          <label class="field"><span>Palavra do lançamento de pagamento</span>
            <input name="palavraChave" class="input" maxlength="30" value="${b(e?.palavraChave)}" placeholder="Ex.: ourocard" /></label>
          <p class="text-xs text-slate-500 -mt-2">Usada para achar o pagamento da fatura nos lançamentos
            (ex.: “ourocard” encontra “CARTÃO - OUROCARD BB” na categoria Pagamento Fatura).</p>

          <p id="form-erro" class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
        </div>
        <div class="flex flex-wrap items-center gap-2 px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
          ${e?'<button type="button" data-delete class="btn btn-danger-ghost">Excluir cartão</button>':""}
          ${e&&q?'<button type="button" data-apagar-compras class="btn btn-ghost !text-rose-700">Apagar compras…</button>':""}
          <span class="flex-1"></span>
          <button type="button" data-close class="btn btn-ghost">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar</button>
        </div>
      </form>`,e?"Configurar cartão":"Novo cartão"),m=u.querySelector("#cartao-form"),r=a=>m.elements[a];u.querySelectorAll("[data-close]").forEach(a=>a.addEventListener("click",Fin.ui.closeModal)),u.querySelector("[data-apagar-compras]")?.addEventListener("click",()=>{Fin.ui.closeModal(),z({cartao:e.nome,ym:Fin.state.mes})}),u.querySelector("[data-delete]")?.addEventListener("click",()=>{if(q){Fin.ui.closeModal(),z({cartao:e.nome,ym:Fin.state.mes,excluirCartao:!0});return}confirm(`Excluir o cartão “${e.nome}”?`)&&(p.remove("cartoes",e.id),Fin.state.cartao=null,Fin.ui.closeModal(),Fin.ui.toast("Cartão excluído."),Fin.router.refresh())});const $=()=>({diaFechamento:Number(r("diaFechamento").value)||null,diaVencimento:Number(r("diaVencimento").value)||null}),x=()=>{if(!e)return!1;const a=$();return["diaFechamento","diaVencimento"].some(o=>e[o]&&a[o]!==e[o])},A=()=>{const a=r("vigencia").value==="desde"?r("desde").value:null,o=$();return{desde:a,cfg:{...o,palavraChave:F.normalize(r("palavraChave").value)||F.normalize(r("nome").value).split(" ")[0],diasAntigos:a?y.historicoDias(e,o,a):[]}}};if(e){const a=h.currentYM(),o=y.pagamentoDaFatura(e,a);r("desde").value=o&&["pago","parcial"].includes(y.statusEfetivo(o))?h.addMonths(a,1):a}const i=()=>{const a=x();if(m.querySelector("[data-vigencia]").classList.toggle("hidden",!a),m.querySelector("[data-historico]")?.classList.toggle("hidden",a),!a)return;r("desde").disabled=r("vigencia").value!=="desde";const{cfg:o,desde:l}=A(),g=r("vigencia").value==="desde"&&!l?[]:y.pagamentosAReagendar(o,l);m.querySelector("[data-reagendar]").classList.toggle("hidden",!g.length),m.querySelector("[data-reagendar-texto]").textContent=g.length===1?`Mudar também o vencimento do pagamento em aberto (${h.date(g[0].l.vencimento)} → ${h.date(g[0].vencimento)})`:`Mudar também o vencimento dos ${g.length} pagamentos em aberto`};m.addEventListener("input",i),m.addEventListener("change",i),m.addEventListener("submit",a=>{a.preventDefault();const o=m.querySelector("#form-erro"),l=r("nome").value.trim(),g=y.cartoes().some(s=>s.id!==e?.id&&F.normalize(s.nome)===F.normalize(l));if(!l||g){o.textContent=l?"Já existe um cartão com esse nome.":"Informe o nome do cartão.",o.classList.remove("hidden");return}const L=x();if(L&&r("vigencia").value==="desde"&&!/^\d{4}-\d{2}$/.test(r("desde").value)){o.textContent="Informe a primeira fatura com os novos dias.",o.classList.remove("hidden");return}const C={...e?{id:e.id}:{},nome:l,...$(),limite:F.toNumber(r("limite").value),palavraChave:F.normalize(r("palavraChave").value)||F.normalize(l).split(" ")[0]};let t=[];if(L){const{cfg:s,desde:c}=A();C.diasAntigos=s.diasAntigos,r("reagendar").checked&&(t=y.pagamentosAReagendar(s,c))}else r("esquecer")?.checked&&(C.diasAntigos=[]);p.upsert("cartoes",C);for(const{l:s,vencimento:c}of t)p.upsert("lancamentos",{id:s.id,vencimento:c,status:"aberto",...s.data===s.vencimento?{data:c}:{}});e&&e.nome!==l&&p.set("cartaoCompras",p.list("cartaoCompras").map(s=>s.cartao===e.nome?{...s,cartao:l}:s)),Fin.state.cartao=l,Fin.ui.closeModal(),Fin.ui.toast(e?t.length?`Cartão atualizado. ${t.length===1?"1 pagamento ficou":`${t.length} pagamentos ficaram`} com a nova data.`:"Cartão atualizado.":"Cartão criado."),Fin.router.refresh()})}async function R(){y.cartoes();const d=new Blob([await p.exportBackup()],{type:"application/json"}),e=document.createElement("a");e.href=URL.createObjectURL(d),e.download=`financas-backup-${h.todayISO()}.json`,e.click(),setTimeout(()=>URL.revokeObjectURL(e.href),1e3),p.registrarBackup()}function z({cartao:d,ym:e=Fin.state.mes,excluirCartao:q=!1}={}){const S=y.cartao(d),u=p.list("cartaoCompras").filter(t=>t.cartao===d);if(!S||!u.length){Fin.ui.toast("Este cartão não tem compras para apagar.");return}const m=u.map(t=>t.fatura).filter(Boolean).sort(),r=m[0]||e,$=m[m.length-1]||e,x=t=>t?h.monthShort(t):"—",A=Fin.ui.openModal(`
      <form id="apagar-form" novalidate>
        <div data-arrastar class="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 class="font-semibold text-lg">Apagar compras · ${b(d)}</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <div class="px-5 py-4 space-y-4">
          <fieldset class="space-y-2">
            <legend class="text-sm font-medium text-slate-700 mb-1">O que apagar?</legend>
            <label class="quem-opcao-linha flex items-start gap-2 text-sm cursor-pointer rounded-xl border border-slate-200 px-3 py-2.5">
              <input type="radio" name="escopo" value="fatura" class="mt-0.5 accent-rose-600">
              <span><b>Só a fatura de ${b(x(e))}</b><span class="block text-xs text-slate-500" data-n="fatura"></span></span></label>
            <label class="flex items-start gap-2 text-sm cursor-pointer rounded-xl border border-slate-200 px-3 py-2.5">
              <input type="radio" name="escopo" value="periodo" class="mt-0.5 accent-rose-600">
              <span class="flex-1"><b>Um período</b> (de fatura a fatura)
                <span class="grid grid-cols-2 gap-2 mt-2">
                  <label class="field"><span>De</span><input type="month" name="de" class="input" value="${b(e)}"></label>
                  <label class="field"><span>Até</span><input type="month" name="ate" class="input" value="${b(e)}"></label>
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
            <input type="checkbox" name="cartao" class="mt-0.5 w-4 h-4 accent-rose-600" ${q?"checked":""}>
            <span>Excluir também o <b>cartão “${b(d)}”</b> (configuração, vencimento e limite)</span></label>

          <p class="text-sm bg-slate-50 rounded-xl px-3 py-2.5" data-resumo></p>
          <p class="text-xs text-slate-500">Os lançamentos de <b>pagamento da fatura</b> (em Lançamentos) <b>não</b> são apagados.</p>
          <p id="form-erro" class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
        </div>
        <div class="flex items-center gap-2 px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
          <span class="flex-1"></span>
          <button type="button" data-close class="btn btn-ghost">Cancelar</button>
          <button type="submit" class="btn bg-rose-600 hover:bg-rose-700 text-white">Continuar</button>
        </div>
      </form>`,"Apagar compras do cartão"),i=A.querySelector("#apagar-form"),a=t=>i.elements[t],o=()=>i.querySelector("[name=escopo]:checked").value;i.querySelector(`[name=escopo][value="${q?"todas":"fatura"}"]`).checked=!0,A.querySelectorAll("[data-close]").forEach(t=>t.addEventListener("click",Fin.ui.closeModal));const l=(t,s,c)=>t.fatura&&t.fatura>=s&&t.fatura<=c,g=t=>`${t.length} ${t.length===1?"compra":"compras"} · ${h.brl(y.soma(t))}`;function L(){const t=o();let s=t==="todas"?u:t==="fatura"?u.filter(n=>n.fatura===e):u.filter(n=>l(n,a("de").value||r,a("ate").value||$));const c=new Set(s.filter(n=>n.grupo&&n.parcela?.total>1).map(n=>n.grupo)),f=t==="todas"?[]:u.filter(n=>n.grupo&&c.has(n.grupo)&&!s.includes(n));return a("futuras").checked&&(s=[...s,...f]),{lista:s,futuras:f}}function C(){const t=o(),s=a("de").value||r,c=a("ate").value||$;i.querySelector("[data-n=fatura]").textContent=g(u.filter(v=>v.fatura===e)),i.querySelector("[data-n=periodo]").textContent=s>c?"A fatura inicial é depois da final.":g(u.filter(v=>l(v,s,c))),i.querySelector("[data-n=todas]").textContent=`${g(u)} · faturas de ${x(r)} a ${x($)}`,i.querySelector("[data-g=futuras]").classList.toggle("hidden",t==="todas"),i.querySelector("[data-g=cartao]").classList.toggle("hidden",t!=="todas");const{lista:f,futuras:n}=L();i.querySelector("[data-n=futuras]").textContent=n.length?`${n.length} ${n.length===1?"parcela futura encontrada":"parcelas futuras encontradas"}.`:"Nenhuma parcela futura encontrada.",i.querySelector("[data-resumo]").innerHTML=f.length?`Serão apagadas <b>${g(f)}</b>${t==="todas"&&a("cartao").checked?" e o cartão":""}.`:"Nenhuma compra encontrada com essa escolha."}i.addEventListener("input",C),i.addEventListener("change",C),C(),i.addEventListener("submit",async t=>{t.preventDefault();const s=i.querySelector("#form-erro"),c=o();if(c==="periodo"&&(a("de").value||r)>(a("ate").value||$)){s.textContent="A fatura inicial precisa ser antes (ou igual) à final.",s.classList.remove("hidden");return}const{lista:f,futuras:n}=L(),v=c==="todas"&&a("cartao").checked;if(!f.length&&!v){s.textContent="Nenhuma compra encontrada com essa escolha.",s.classList.remove("hidden");return}const w=[...new Set(f.map(k=>k.fatura).filter(Boolean))].sort(),M=f.filter(k=>k.parcela?.total>1).length,D=c==="fatura"?`da fatura de ${x(e)}`:c==="periodo"?`das faturas de ${x(a("de").value)} a ${x(a("ate").value)}`:"de todas as faturas";if(!await Fin.ui.confirmar({titulo:v?`Excluir o cartão “${b(d)}” e todas as compras?`:`Apagar as compras ${D}?`,intro:`Cartão <b>${b(d)}</b>. As compras apagadas somem das faturas, do limite usado e dos gráficos.`,perde:[`<b>${f.length}</b> ${f.length===1?"compra":"compras"} serão apagadas (<b>${h.brl(y.soma(f))}</b>)${w.length?` · faturas de ${x(w[0])} a ${x(w[w.length-1])}`:""}`,...M?[`${M} ${M===1?"é parcelada":"são parceladas"}${a("futuras").checked&&n.length?`; as ${n.length} parcelas futuras também serão apagadas`:c==="todas"?"":"; as parcelas de outras faturas continuam (só se você não marcou apagá-las)"}`]:[],...v?[`O cartão “${b(d)}” (fechamento, vencimento, limite) será excluído`]:[],"Sincronizado com o Google Drive, some também dos outros aparelhos"],mantem:["Os lançamentos de pagamento da fatura (em Lançamentos) continuam como estão",...v?[]:[`O cartão “${b(d)}” continua cadastrado`]],backup:R,ciente:"Entendi que as compras serão apagadas e que não dá para desfazer.",palavra:c==="todas"?"APAGAR":null,botao:v?"Excluir cartão e compras":"Apagar compras"}))return;const E=new Set(f.map(k=>k.id));p.set("cartaoCompras",p.list("cartaoCompras").filter(k=>!E.has(k.id))),v&&(p.remove("cartoes",S.id),Fin.state.cartao=null),Fin.ui.toast(v?`Cartão “${d}” e ${E.size} compras apagados.`:`${E.size} ${E.size===1?"compra apagada":"compras apagadas"}.`),Fin.router.refresh()})}return{open:O,apagarCompras:z}})();
