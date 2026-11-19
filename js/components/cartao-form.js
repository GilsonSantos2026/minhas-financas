/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.forms=Fin.forms||{},Fin.forms.cartao=(()=>{const m=Fin.fmt,u=m.esc,b=Fin.finance,l=Fin.parsers,o=Fin.storage;function f(r=null){if(!r&&!Fin.plano.exigir("cartoes",o.list("cartoes").length))return;const a=r?o.list("cartoes").find(t=>t.id===r):null,v=a?o.list("cartaoCompras").filter(t=>t.cartao===a.nome).length:0,p=t=>'<option value="">—</option>'+Array.from({length:31},(d,e)=>`<option value="${e+1}" ${t===e+1?"selected":""}>dia ${e+1}</option>`).join(""),i=Fin.ui.openModal(`
      <form id="cartao-form" novalidate>
        <div class="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 class="font-semibold text-lg">${a?"Configurar cartão":"Novo cartão"}</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <div class="px-5 py-4 space-y-4">
          <label class="field"><span>Nome do cartão *</span>
            <input name="nome" class="input" maxlength="40" value="${u(a?.nome)}" placeholder="Ex.: Nubank" /></label>

          <div class="grid grid-cols-2 gap-3">
            <label class="field"><span>Fechamento da fatura</span>
              <select name="diaFechamento" class="input">${p(a?.diaFechamento)}</select></label>
            <label class="field"><span>Vencimento da fatura</span>
              <select name="diaVencimento" class="input">${p(a?.diaVencimento)}</select></label>
          </div>
          <p class="text-xs text-slate-500 -mt-2">Com o fechamento, o app calcula sozinho em qual fatura cada compra cai.</p>

          <label class="field"><span>Limite (R$)</span>
            <input name="limite" class="input tabular-nums" inputmode="decimal" value="${m.decimalInput(a?.limite)}" placeholder="Opcional" /></label>

          <label class="field"><span>Palavra do lançamento de pagamento</span>
            <input name="palavraChave" class="input" maxlength="30" value="${u(a?.palavraChave)}" placeholder="Ex.: ourocard" /></label>
          <p class="text-xs text-slate-500 -mt-2">Usada para achar o pagamento da fatura nos lançamentos
            (ex.: “ourocard” encontra “CARTÃO - OUROCARD BB” na categoria Pagamento Fatura).</p>

          <p id="form-erro" class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
        </div>
        <div class="flex items-center gap-2 px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
          ${a?`<button type="button" data-delete class="btn btn-danger-ghost" ${v?'disabled title="Exclua as compras deste cartão primeiro"':""}>Excluir</button>`:""}
          <span class="flex-1"></span>
          <button type="button" data-close class="btn btn-ghost">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar</button>
        </div>
      </form>`,a?"Configurar cartão":"Novo cartão"),c=i.querySelector("#cartao-form"),s=t=>c.elements[t];i.querySelectorAll("[data-close]").forEach(t=>t.addEventListener("click",Fin.ui.closeModal)),i.querySelector("[data-delete]")?.addEventListener("click",()=>{confirm(`Excluir o cartão “${a.nome}”?`)&&(o.remove("cartoes",a.id),Fin.state.cartao=null,Fin.ui.closeModal(),Fin.ui.toast("Cartão excluído."),Fin.router.refresh())}),c.addEventListener("submit",t=>{t.preventDefault();const d=c.querySelector("#form-erro"),e=s("nome").value.trim(),h=b.cartoes().some(n=>n.id!==a?.id&&l.normalize(n.nome)===l.normalize(e));if(!e||h){d.textContent=e?"Já existe um cartão com esse nome.":"Informe o nome do cartão.",d.classList.remove("hidden");return}const F={...a?{id:a.id}:{},nome:e,diaFechamento:Number(s("diaFechamento").value)||null,diaVencimento:Number(s("diaVencimento").value)||null,limite:l.toNumber(s("limite").value),palavraChave:l.normalize(s("palavraChave").value)||l.normalize(e).split(" ")[0]};o.upsert("cartoes",F),a&&a.nome!==e&&o.set("cartaoCompras",o.list("cartaoCompras").map(n=>n.cartao===a.nome?{...n,cartao:e}:n)),Fin.state.cartao=e,Fin.ui.closeModal(),Fin.ui.toast(a?"Cartão atualizado.":"Cartão criado."),Fin.router.refresh()})}return{open:f}})();
