/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.forms=Fin.forms||{},Fin.forms.compra=(()=>{const l=Fin.fmt,g=l.esc,n=Fin.finance,F=Fin.parsers,m=Fin.storage,C=c=>c&&n.temCasal()&&n.autor(c)!==Fin.cofre.membroId()?Fin.membros.porId(n.autor(c)):null;function A(c){const f=C(c);if(!f)return"";const a=g(Fin.membros.primeiroNome(f)||f.usuario);return`
      <div data-confirma-outro class="hidden px-5 py-4 border-t border-amber-200 bg-amber-50 sticky bottom-0 space-y-3" role="alertdialog" aria-live="assertive">
        <div class="flex items-start gap-2 text-sm text-amber-900">
          ${Fin.membros.avatar(f,{tam:"w-7 h-7",txt:"text-[10px]"})}
          <span><b>Esta compra foi lançada por ${a}.</b> <span data-confirma-texto>Quer mesmo salvar a alteração?</span></span>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" data-confirma-nao class="btn btn-ghost !py-1.5">Voltar</button>
          <button type="button" data-confirma-sim class="btn btn-primary !py-1.5">Sim, salvar</button>
        </div>
      </div>`}function M({id:c=null,cartao:f=null}={}){const a=c?m.list("cartaoCompras").find(t=>t.id===c):null;if(c&&!a)return Fin.ui.toast("Compra não encontrada.","error");const x=n.cartoes();if(!x.length)return Fin.ui.toast("Cadastre um cartão primeiro.","error"),Fin.forms.cartao.open();const S=a?.cartao||f||Fin.state.cartao||x[0].nome,j=l.todayISO(),E=a?.data||j,w=a?.fatura||n.faturaDaCompra(n.cartao(S),E),d=a?.grupo?m.list("cartaoCompras").filter(t=>t.grupo===a.grupo):[],L=Fin.forms.NOVA_CATEGORIA,$=Fin.ui.openModal(`
      <form id="compra-form" novalidate>
        <div data-arrastar class="flex items-center justify-between gap-2 px-5 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 class="font-semibold text-lg">${a?"Editar compra":"Nova compra no cartão"}</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>

        <div class="px-5 py-4 space-y-4">
          ${a?.parcela?`<p class="text-sm bg-slate-50 rounded-xl px-3 py-2">Parcela <b>${a.parcela.atual}/${a.parcela.total}</b>${a.valorTotalCompra?` de uma compra de ${l.brl(a.valorTotalCompra)}`:""}.
            ${d.length>1?"Descrição, categoria e observação serão atualizadas em todas as parcelas.":""}</p>`:""}

          <label class="field"><span>Cartão *</span>
            <select name="cartao" class="input">${x.map(t=>`<option ${t.nome===S?"selected":""}>${g(t.nome)}</option>`).join("")}</select></label>

          <label class="field"><span>Descrição *</span>
            <input name="descricao" class="input" maxlength="120" value="${g(a?.descricao)}" placeholder="Ex.: Supermercado" /></label>

          <div class="grid grid-cols-2 gap-3">
            <label class="field"><span>${a?"Valor desta parcela (R$) *":"Valor total (R$) *"}</span>
              <input name="valor" class="input tabular-nums" inputmode="decimal" value="${l.decimalInput(a?.valor)}" placeholder="0,00" /></label>
            ${a?`<label class="field"><span>Fatura</span>
                <input name="fatura" type="month" class="input" value="${w}" /></label>`:`<label class="field"><span>Parcelas</span>
                <select name="parcelas" class="input">${Array.from({length:24},(t,e)=>`<option value="${e+1}">${e+1}x</option>`).join("")}</select></label>`}
          </div>

          <label class="field"><span>Categoria *</span>
            <select name="categoria" class="input">${Fin.forms.categoriaOptions("despesa",a?.categoria)}</select></label>

          <div class="grid grid-cols-2 gap-3">
            <label class="field"><span>Data da compra *</span>
              <input name="data" type="date" class="input" value="${E}" /></label>
            ${a?"<div></div>":`<label class="field"><span>1ª fatura</span>
              <input name="fatura" type="month" class="input" value="${w}" /></label>`}
          </div>

          <p id="compra-resumo" class="text-sm text-slate-600 bg-prim-50 rounded-xl px-3 py-2 ${a?"hidden":""}"></p>

          <label class="field"><span>Observação</span>
            <textarea name="observacao" rows="2" class="input" maxlength="500">${g(a?.observacao)}</textarea></label>
          <p class="text-xs text-slate-400">Estorno ou crédito na fatura: informe o valor negativo (ex.: -50,00).</p>

          <p id="form-erro" class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
        </div>

        <div data-rodape class="flex flex-wrap items-center gap-2 px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
          ${a?`<button type="button" data-delete="one" class="btn btn-danger-ghost">${d.length>1?"Excluir parcela":"Excluir"}</button>`:""}
          ${d.length>1?`<button type="button" data-delete="all" class="btn btn-danger-ghost">Excluir as ${d.length}</button>`:""}
          <span class="flex-1"></span>
          <button type="button" data-close class="btn btn-ghost">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar</button>
        </div>
        ${A(a)}
      </form>`,a?"Editar compra":"Nova compra no cartão"),i=$.querySelector("#compra-form"),r=t=>i.elements[t];let q=!!a;const y=()=>{if(a)return;const t=F.toNumber(r("valor").value),e=Number(r("parcelas").value),o=r("fatura").value,s=i.querySelector("#compra-resumo");if(!t||!o){s.textContent="Informe o valor para ver as parcelas.";return}const u=Math.trunc(t*100/e)/100;s.textContent=e===1?`Entra na fatura de ${l.monthLong(o).toLowerCase()}.`:`${e}x de ${l.brl(u)} — faturas de ${l.monthShort(o)} a ${l.monthShort(l.addMonths(o,e-1))}.`},k=()=>{q||!r("data").value||(r("fatura").value=n.faturaDaCompra(n.cartao(r("cartao").value),r("data").value))};y(),i.addEventListener("input",y),i.addEventListener("change",t=>{const e=t.target.name;e==="fatura"&&(q=!0),(e==="data"||e==="cartao")&&k(),e==="categoria"&&t.target.value===L&&Fin.forms.novaCategoria(r("categoria"),"despesa"),y()}),$.querySelectorAll("[data-close]").forEach(t=>t.addEventListener("click",Fin.ui.closeModal));const N=C(a);let O=!1;const b=i.querySelector("[data-confirma-outro]"),I=i.querySelector("[data-rodape]"),z=(t,e,o)=>{b.querySelector("[data-confirma-texto]").textContent=t;const s=b.querySelector("[data-confirma-sim]");s.textContent=e,s.onclick=o,I.classList.add("hidden"),b.classList.remove("hidden"),s.focus()};b?.querySelector("[data-confirma-nao]").addEventListener("click",()=>{b.classList.add("hidden"),I.classList.remove("hidden")});const D=t=>{const e=new Set(t?d.map(o=>o.id):[a.id]);m.set("cartaoCompras",m.list("cartaoCompras").filter(o=>!e.has(o.id))),Fin.ui.closeModal(),Fin.ui.toast(t?"Compra excluída.":"Parcela excluída."),Fin.router.refresh()};$.querySelectorAll("[data-delete]").forEach(t=>t.addEventListener("click",()=>{const e=t.dataset.delete==="all";if(N)return z(e?`Quer mesmo excluir as ${d.length} parcelas? Não dá para desfazer.`:"Quer mesmo excluir? Não dá para desfazer.","Sim, excluir",()=>D(e));const o=e?`Excluir as ${d.length} parcelas de “${a.descricao}”?`:`Excluir “${a.descricao}”${a.parcela?` (parcela ${a.parcela.atual}/${a.parcela.total})`:""}?`;confirm(`${o} Esta ação não pode ser desfeita.`)&&D(e)})),i.addEventListener("submit",t=>{t.preventDefault();const e=i.querySelector("#form-erro"),o=F.toNumber(r("valor").value),s=r("categoria").value,u=[];if(r("descricao").value.trim()||u.push("a descrição"),o||u.push("o valor"),(!s||s===L)&&u.push("a categoria"),r("data").value||u.push("a data da compra"),r("fatura").value||u.push("a fatura"),u.length){e.textContent=`Informe ${u.join(", ")}.`,e.classList.remove("hidden");return}if(N&&!O)return z(`Quer mesmo salvar a alteração${d.length>1?" (descrição e categoria valem para todas as parcelas)":""}?`,"Sim, salvar",()=>{O=!0,i.requestSubmit()});const T=n.categorias().find(p=>p.nome===s)?.icone??null,h={cartao:r("cartao").value,descricao:r("descricao").value.trim(),categoria:s,categoriaIcone:T,observacao:r("observacao").value.trim()||null};if(a){const p=m.list("cartaoCompras").map(v=>v.id===a.id?{...v,...h,data:r("data").value,valor:o,fatura:r("fatura").value,atualizadoEm:new Date().toISOString()}:a.grupo&&v.grupo===a.grupo?{...v,...h,atualizadoEm:new Date().toISOString()}:v);m.set("cartaoCompras",p),Fin.ui.toast("Compra atualizada.")}else{const p=Number(r("parcelas").value);n.criarCompra({...h,data:r("data").value,valorTotal:o,parcelas:p,fatura:r("fatura").value}),Fin.ui.toast(p>1?`Compra criada em ${p} parcelas.`:"Compra criada."),Fin.state.cartao=h.cartao,Fin.state.mes=r("fatura").value}Fin.ui.closeModal(),Fin.router.refresh()})}return{open:M}})();
