/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.forms=Fin.forms||{},Fin.forms.lancamento=(()=>{const c=Fin.fmt,x=c.esc,i=Fin.finance,y=Fin.parsers,w="__nova__";function R(p,a){const d=i.categorias(p),P=d.map(u=>u.nome);return'<option value="">Selecione…</option>'+[...a&&!P.includes(a)?[{nome:a,icone:""}]:[],...d].map(u=>`<option value="${x(u.nome)}" ${u.nome===a?"selected":""}>${u.icone?u.icone+" ":""}${x(u.nome)}</option>`).join("")+`<option value="${w}">＋ Nova categoria…</option>`}function Y(p,a){if(!i.temCasal())return"";const d=Fin.membros,P=Fin.cofre.membroId(),l=p?i.pagador(p):P,u=p?d.porId(i.autor(p)):null,q=[...Fin.cofre.pessoas().map(o=>({id:o.id,nome:d.primeiroNome(d.porId(o.id))||o.usuario,av:d.avatar(d.porId(o.id),{tam:"w-7 h-7",txt:"text-[10px]"})})),{id:i.CASAL,nome:"Os dois",av:`<span class="w-7 h-7 rounded-full grid place-items-center bg-prim-600 text-white shrink-0">${Fin.icone("usuario","w-4 h-4")}</span>`}];return`
      <fieldset data-quem class="${a.tipo==="receita"?"hidden":""}">
        <legend class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Quem pagou?</legend>
        <div class="grid grid-cols-3 gap-2">
          ${q.map(o=>`
            <label class="quem-opcao">
              <input type="radio" name="pagoPor" value="${x(o.id)}" ${o.id===l?"checked":""} />
              <span>${o.av}<span class="truncate">${x(o.nome)}</span></span>
            </label>`).join("")}
        </div>
        ${u?`<p class="text-xs text-slate-500 mt-1.5">Lançado por <b>${x(d.nome(u)||u.usuario)}</b>.</p>`:""}
      </fieldset>
      ${u&&a.tipo==="receita"?`<p data-quem-rec class="text-xs text-slate-500 -mt-2">Recebido por <b>${x(d.nome(u)||u.usuario)}</b> (quem lançou).</p>`:""}`}const A=p=>p&&i.temCasal()&&i.autor(p)!==Fin.cofre.membroId()?Fin.membros.porId(i.autor(p)):null;function J(p){const a=A(p);if(!a)return"";const d=x(Fin.membros.primeiroNome(a)||a.usuario);return`
      <div data-confirma-outro class="hidden px-5 py-4 border-t border-amber-200 bg-amber-50 sticky bottom-0 space-y-3" role="alertdialog" aria-live="assertive">
        <div class="flex items-start gap-2 text-sm text-amber-900">
          ${Fin.membros.avatar(a,{tam:"w-7 h-7",txt:"text-[10px]"})}
          <span><b>Este lançamento foi feito por ${d}.</b> <span data-confirma-texto>Quer mesmo salvar a alteração?</span></span>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" data-confirma-nao class="btn btn-ghost !py-1.5">Voltar</button>
          <button type="button" data-confirma-sim class="btn btn-primary !py-1.5">Sim, salvar</button>
        </div>
      </div>`}function K(p=null){const a=p?i.todos().find(e=>e.id===p):null;if(p&&!a)return Fin.ui.toast("Lançamento não encontrado.","error");const d=c.todayISO(),P=Fin.state.mes===c.currentYM()?d:`${Fin.state.mes}-01`,l=a||{tipo:"despesa",status:"aberto",data:P,vencimento:P,competencia:Fin.state.mes},u=i.formasPagamento(),q=Fin.ui.openModal(`
      <form id="lanc-form" novalidate>
        <div data-arrastar class="flex items-center justify-between gap-2 px-5 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 class="font-semibold text-lg">${a?"Editar lançamento":"Novo lançamento"}</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>

        <div class="px-5 py-4 space-y-4">
          ${a?.grupo?`
            <div class="bg-slate-50 rounded-xl px-3 py-2.5 text-sm space-y-2">
              <p><span aria-hidden="true">${a.recorrencia==="fixo"?"🔁":"🧩"}</span>
                ${a.recorrencia==="fixo"?`Recorrente · mês <b>${a.parcela?.atual}/${a.parcela?.total}</b>`:`Parcela <b>${a.parcela?.atual}/${a.parcela?.total}</b>`}</p>
              <fieldset class="flex flex-wrap gap-x-4 gap-y-1">
                <legend class="sr-only">Aplicar alterações a</legend>
                <label class="inline-flex items-center gap-1.5"><input type="radio" name="escopo" value="este" checked class="accent-prim-600"> Só este</label>
                <label class="inline-flex items-center gap-1.5"><input type="radio" name="escopo" value="proximos" class="accent-prim-600"> Este e os próximos</label>
              </fieldset>
            </div>`:""}

          <div class="seg" role="radiogroup" aria-label="Tipo">
            <label><input type="radio" name="tipo" value="despesa" ${l.tipo!=="receita"?"checked":""}><span>Despesa</span></label>
            <label><input type="radio" name="tipo" value="receita" ${l.tipo==="receita"?"checked":""}><span>Receita</span></label>
          </div>

          ${Y(a,l)}

          <label class="field"><span>Descrição *</span>
            <input name="descricao" class="input" required maxlength="120" value="${x(l.descricao)}" placeholder="Ex.: Conta de luz" /></label>

          <div class="grid grid-cols-2 gap-3">
            <label class="field"><span id="lbl-valor">Valor lançado (R$) *</span>
              <input name="valorPrevisto" class="input tabular-nums" inputmode="decimal" required value="${c.decimalInput(l.valorPrevisto)}" placeholder="0,00" /></label>
            <label class="field"><span>Categoria *</span>
              <select name="categoria" class="input" required>${R(l.tipo,l.categoria)}</select></label>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <label class="field"><span>Vencimento *</span>
              <input name="vencimento" type="date" class="input" required value="${l.vencimento||l.data||""}" /></label>
            <label class="field"><span>Mês de competência</span>
              <input name="competencia" type="month" class="input" value="${l.competencia||""}" /></label>
          </div>

          ${a?"":`
          <!-- Recorrência (só em lançamento novo): aluguel, água, luz… -->
          <section class="rounded-2xl border border-slate-200 p-3 space-y-3" aria-labelledby="rec-titulo">
            <label class="flex items-center gap-3 cursor-pointer">
              <span class="flex-1 min-w-0">
                <span id="rec-titulo" class="block text-sm font-semibold">🔁 Recorrente</span>
                <span class="block text-xs text-slate-500">Repete todo mês — ex.: aluguel, água, luz</span>
              </span>
              <input type="checkbox" name="recorrente" class="toggle" role="switch" />
            </label>
            <div id="rep-box" class="hidden space-y-3">
              <div class="seg seg-neutro" role="radiogroup" aria-label="Valor de cada mês">
                <label><input type="radio" name="repeticao" value="fixo" checked><span>Mesmo valor todo mês</span></label>
                <label><input type="radio" name="repeticao" value="parcelado"><span>Parcelar o total</span></label>
              </div>
              <div class="seg seg-neutro" role="radiogroup" aria-label="Até quando repetir">
                <label><input type="radio" name="ateModo" value="vezes" checked><span>Nº de vezes</span></label>
                <label><input type="radio" name="ateModo" value="ate"><span>Até mês/ano</span></label>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <label class="field" data-ate="vezes"><span>Quantas vezes (meses)</span>
                  <input name="vezes" type="number" inputmode="numeric" min="2" max="120" value="12" class="input" /></label>
                <label class="field hidden" data-ate="ate"><span>Repetir até</span>
                  <input name="ate" type="month" class="input" /></label>
                <div class="flex flex-wrap items-end gap-1.5" data-atalhos>
                  <button type="button" data-ate-fim-ano class="chip !py-1.5 !text-xs">Até dezembro</button>
                  <button type="button" data-ate-12 class="chip !py-1.5 !text-xs">12 meses</button>
                </div>
              </div>
              <p id="rep-resumo" class="text-xs text-slate-700 bg-prim-50 rounded-lg px-3 py-2" aria-live="polite"></p>
            </div>
          </section>`}

          <!-- Pagamento efetivado: separado do valor lançado (o lançado nunca é alterado aqui) -->
          <section class="rounded-2xl border border-slate-200 p-3 space-y-3" aria-labelledby="pg-titulo">
            <div class="flex items-center justify-between gap-2">
              <h3 id="pg-titulo" class="text-sm font-semibold">💸 <span data-pg-titulo>Pagamento</span></h3>
              <span id="pg-situacao" class="text-xs text-right"></span>
            </div>
            <div class="seg seg-3" role="radiogroup" aria-label="Situação do pagamento">
              <label><input type="radio" name="status" value="aberto" ${["pago","parcial"].includes(l.status)?"":"checked"}><span data-rot="aberto">Em aberto</span></label>
              <label><input type="radio" name="status" value="pago" ${l.status==="pago"?"checked":""}><span data-rot="pago">Pago</span></label>
              <label><input type="radio" name="status" value="parcial" ${l.status==="parcial"?"checked":""}><span>Parcial</span></label>
            </div>
            <div id="pago-fields" class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <label class="field"><span data-rot="data">Data do pagamento</span>
                  <input name="dataPagamento" type="date" class="input" value="${l.dataPagamento||""}" /></label>
                <label class="field"><span data-rot="valor">Valor pago (R$)</span>
                  <input name="valorPago" class="input tabular-nums" inputmode="decimal" value="${c.decimalInput(l.valorPago)}" placeholder="0,00" /></label>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <button type="button" data-usar-lancado class="text-xs font-semibold text-prim-700 hover:underline">Usar o valor lançado</button>
                <span id="pg-diff" class="text-xs ml-auto"></span>
              </div>
              <div id="pg-rotativo"></div>
            </div>
            <label class="field"><span>Forma de pagamento</span>
              <input name="formaPagamento" class="input" list="formas-list" value="${x(l.formaPagamento)}" placeholder="PIX, Boleto, Débito…" />
              <datalist id="formas-list">${u.map(e=>`<option value="${x(e.nome)}"></option>`).join("")}</datalist></label>
          </section>

          <label class="field"><span>Data do lançamento</span>
            <input name="data" type="date" class="input" value="${l.data||""}" /></label>

          <label class="field"><span>Observação</span>
            <textarea name="observacao" rows="2" class="input" maxlength="500">${x(l.observacao)}</textarea></label>

          <p id="form-erro" class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
        </div>

        <div data-rodape class="flex items-center gap-2 px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
          ${a?`<button type="button" data-delete class="btn btn-danger-ghost">${a.grupo?"Excluir…":"Excluir"}</button>`:""}
          <span class="flex-1"></span>
          <button type="button" data-close class="btn btn-ghost">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar</button>
        </div>
        ${J(a)}
      </form>`,a?"Editar lançamento":"Novo lançamento"),o=q.querySelector("#lanc-form"),t=e=>o.elements[e];let j=!!a;const Z=()=>o.querySelector('input[name="tipo"]:checked').value,V=(e,s)=>Math.round((new Date(`${s}T00:00`)-new Date(`${e}T00:00`))/864e5),k=()=>{const e=Z()==="receita",s=t("status").value;o.querySelector("[data-pg-titulo]").textContent=e?"Recebimento":"Pagamento",o.querySelector('[data-rot="aberto"]').textContent=e?"A receber":"Em aberto",o.querySelector('[data-rot="pago"]').textContent=e?"Recebido":"Pago",o.querySelector('[data-rot="data"]').textContent=e?"Data do recebimento":"Data do pagamento",o.querySelector('[data-rot="valor"]').textContent=e?"Valor recebido (R$)":"Valor pago (R$)",o.querySelector("#pago-fields").classList.toggle("hidden",s==="aberto");const r=y.toNumber(t("valorPrevisto").value),n=y.toNumber(t("valorPago").value),m=t("vencimento").value,b=t("dataPagamento").value,$=o.querySelector("#pg-situacao"),g=o.querySelector("#pg-diff");$.innerHTML="",g.innerHTML="";const f=!e&&i.isPagamentoFatura({tipo:"despesa",categoria:t("categoria").value}),F=f&&s!=="aberto"&&r>0&&n>0?i.faturaParcial({tipo:"despesa",categoria:t("categoria").value,status:s,valorPrevisto:r,valorPago:n}):null;if(o.querySelector("#pg-rotativo").innerHTML=F?Fin.ui.alertaRotativo(F,i.rotativo()):"",s==="aberto"){if(m){const v=V(d,m);$.innerHTML=v<0?`<span class="text-rose-700 font-medium">! vencido há ${-v} dia${v===-1?"":"s"}</span>`:v===0?'<span class="text-amber-800 font-medium">vence hoje</span>':`<span class="text-slate-500">vence em ${v} dia${v===1?"":"s"}</span>`}return}if(m&&b){const v=V(m,b);$.innerHTML=v>0?`<span class="text-amber-800 font-medium">◷ ${e?"recebido":"pago"} ${v} dia${v===1?"":"s"} após o vencimento</span>`:`<span class="text-emerald-800">✓ ${e?"recebido":"pago"} em dia</span>`}if(r==null||n==null)return;const h=Math.round((n-r)*100)/100;s==="parcial"?g.innerHTML=n<r?`<span class="text-amber-800">Falta ${c.brl(r-n)}</span>`:'<span class="text-rose-700">Valor ≥ lançado: marque “Pago”</span>':Math.abs(h)<.01?g.innerHTML='<span class="text-emerald-800">✓ igual ao lançado</span>':h>0?g.innerHTML=`<span class="text-amber-800">＋${c.brl(h)} ${e?"a mais":"a mais (juros/multa)"}</span>`:g.innerHTML=f?`<span class="text-rose-700 font-medium">−${c.brl(-h)} a menos (rotativo)</span>`:`<span class="text-emerald-800">−${c.brl(-h)} ${e?"a menos":"(desconto)"}</span>`},D=()=>{const e=t("status").value;e!=="aberto"&&(!t("valorPago").value&&e==="pago"&&(t("valorPago").value=t("valorPrevisto").value),t("dataPagamento").value||(t("dataPagamento").value=d)),k()};D(),o.addEventListener("input",e=>{["valorPrevisto","valorPago","dataPagamento","vencimento"].includes(e.target.name)&&k()}),o.querySelector("[data-usar-lancado]").addEventListener("click",()=>{t("valorPago").value=t("valorPrevisto").value,k()});const O=120,S=()=>t("competencia").value||(t("vencimento").value||"").slice(0,7),ee=(e,s)=>{const[r,n]=e.split("-").map(Number),[m,b]=s.split("-").map(Number);return(m-r)*12+(b-n)+1},N=e=>`${Number(e.slice(0,4))+(e.endsWith("-12")?1:0)}-12`,_=()=>{if(!t("recorrente")?.checked)return{modo:"nao"};const e=t("repeticao").value,s=S();let r;if(t("ateModo").value==="ate"){if(!t("ate").value)return{modo:e,erro:"Escolha até qual mês repetir."};if(!s)return{modo:e,erro:"Informe o vencimento."};if(r=ee(s,t("ate").value),r<2)return{modo:e,erro:`Escolha um mês depois de ${c.monthShort(s)}.`}}else if(r=Math.trunc(Number(t("vezes").value)),!(r>=2))return{modo:e,erro:"Repita pelo menos 2 vezes."};return r>O?{modo:e,n:r,erro:`Máximo de ${O} meses (10 anos).`}:{modo:e,n:r}},E=()=>{if(!t("recorrente"))return;const e=_(),s=e.modo!=="nao";o.querySelector("#rep-box").classList.toggle("hidden",!s),o.querySelector("#lbl-valor").textContent=e.modo==="parcelado"?"Valor total (R$) *":"Valor lançado (R$) *";const r=t("ateModo").value==="ate";if(o.querySelector('[data-ate="vezes"]').classList.toggle("hidden",r),o.querySelector('[data-ate="ate"]').classList.toggle("hidden",!r),S()&&(o.querySelector("[data-ate-fim-ano]").textContent=`Até ${c.monthShort(N(S()))}`),!s)return;const n=o.querySelector("#rep-resumo");if(n.classList.toggle("bg-emerald-50",!e.erro),n.classList.toggle("bg-rose-50",!!e.erro),n.classList.toggle("text-rose-700",!!e.erro),e.erro){n.textContent=`! ${e.erro}`;return}const m=y.toNumber(t("valorPrevisto").value),b=S();if(!m||!b){n.textContent="Informe valor e vencimento para ver o resumo.";return}const $=`de ${c.monthShort(b)} a ${c.monthShort(c.addMonths(b,e.n-1))}`,g=Number((t("vencimento").value||"").slice(8,10));n.innerHTML=e.modo==="parcelado"?`<b>${e.n}x</b> de ${c.brl(Math.trunc(m*100/e.n)/100)} — ${$}.`:`<b>${e.n} lançamentos</b> de ${c.brl(m)}, ${$}${g?`, vencendo todo dia ${g}`:""} (${c.brl(m*e.n)} no total).<br><span class="text-slate-500">Conta que muda de valor (água, luz): ajuste o mês quando ela chegar e escolha “Só este”.</span>`};o.addEventListener("input",E),o.querySelector("[data-ate-fim-ano]")?.addEventListener("click",()=>{const e=S();e&&(o.querySelector('input[name="ateModo"][value="ate"]').checked=!0,t("ate").value=N(e),E())}),o.querySelector("[data-ate-12]")?.addEventListener("click",()=>{o.querySelector('input[name="ateModo"][value="vezes"]').checked=!0,t("vezes").value=12,E()}),E(),o.addEventListener("change",e=>{const s=e.target.name;s==="ateModo"&&e.target.value==="ate"&&!t("ate").value&&S()&&(t("ate").value=N(S())),["recorrente","repeticao","ateModo","ate","vezes","vencimento","competencia"].includes(s)&&setTimeout(E),s==="tipo"&&(t("categoria").innerHTML=R(e.target.value,t("categoria").value),o.querySelector("[data-quem]")?.classList.toggle("hidden",e.target.value==="receita"),k()),s==="status"&&D(),(s==="vencimento"||s==="dataPagamento"||s==="categoria")&&k(),s==="competencia"&&(j=!0),s==="vencimento"&&!j&&e.target.value&&(t("competencia").value=e.target.value.slice(0,7)),s==="categoria"&&e.target.value===w&&H(t("categoria"),o.querySelector('input[name="tipo"]:checked').value)}),q.querySelectorAll("[data-close]").forEach(e=>e.addEventListener("click",Fin.ui.closeModal));const z=()=>o.querySelector('input[name="escopo"]:checked')?.value||"este",Q=A(a);let X=!1;const C=o.querySelector("[data-confirma-outro]"),B=o.querySelector("[data-rodape]"),G=(e,s,r)=>{C.querySelector("[data-confirma-texto]").textContent=e;const n=C.querySelector("[data-confirma-sim]");n.textContent=s,n.onclick=r,B.classList.add("hidden"),C.classList.remove("hidden"),n.focus()};C?.querySelector("[data-confirma-nao]").addEventListener("click",()=>{C.classList.add("hidden"),B.classList.remove("hidden")});const U=(e=!1)=>{const s=z()==="proximos",r=s?`“${a.descricao||a.categoria}” e os próximos meses deste grupo`:`“${a.descricao||a.categoria}”`;if(!e&&!confirm(`Excluir ${r}? Esta ação não pode ser desfeita.${a.grupo&&!s?`

Dica: para excluir também os meses seguintes, marque “Este e os próximos”.`:""}`))return;const n=i.excluirLancamento(a,z());Fin.ui.closeModal(),Fin.ui.toast(n>1?`${n} lançamentos excluídos.`:"Lançamento excluído."),Fin.router.refresh()};q.querySelector("[data-delete]")?.addEventListener("click",()=>{if(!Q)return U();const e=z()==="proximos";G(`Quer mesmo excluir${e?" este e os próximos meses":""}? Não dá para desfazer.`,"Sim, excluir",()=>U(!0))}),o.addEventListener("submit",e=>{e.preventDefault();const s=o.querySelector("#form-erro"),r=o.querySelector('input[name="tipo"]:checked').value,n=y.toNumber(t("valorPrevisto").value),m=t("status").value,b=m==="aberto"?a?.valorPago??null:y.toNumber(t("valorPago").value),$=t("vencimento").value||null,g=t("categoria").value,f=[];t("descricao").value.trim()||f.push("a descrição"),(n===null||n<=0)&&f.push("um valor maior que zero"),(!g||g===w)&&f.push("a categoria"),$||f.push("o vencimento"),m!=="aberto"&&(b===null||b<=0)&&f.push("o valor pago"),m==="parcial"&&b!=null&&n!=null&&b>=n&&f.push("um valor pago menor que o lançado (ou marque “Pago”)");const F=a?{modo:"nao"}:_(),h=F.modo,v=F.n;if(F.erro&&f.push(`a recorrência (${F.erro.replace(/\.$/,"").toLowerCase()})`),f.length){s.textContent=`Informe ${f.join(", ")}.`,s.classList.remove("hidden");return}if(Q&&!X)return G(`Quer mesmo salvar a alteração${z()==="proximos"?" (neste e nos próximos meses)":""}?`,"Sim, salvar",()=>{X=!0,o.requestSubmit()});const ae=i.categorias().find(I=>I.nome===g),te=i.formasPagamento().find(I=>I.nome===t("formaPagamento").value.trim()),T={tipo:r,descricao:t("descricao").value.trim(),categoria:g,categoriaIcone:ae?.icone??a?.categoriaIcone??null,valorPrevisto:n,formaPagamento:t("formaPagamento").value.trim()||null,formaPagamentoIcone:te?.icone??null,observacao:t("observacao").value.trim()||null};i.temCasal()&&(T.pagoPor=r==="despesa"?o.querySelector('input[name="pagoPor"]:checked')?.value||Fin.cofre.membroId():null);const L={...a?{id:a.id}:{origem:"app"},...T,valorPago:b,status:m,vencimento:$,data:t("data").value||$,dataPagamento:m==="aberto"?a?.dataPagamento??null:t("dataPagamento").value||d,competencia:t("competencia").value||$.slice(0,7)};let M;a?(Fin.storage.upsert("lancamentos",L),a.grupo&&z()==="proximos"?(i.atualizarProximos(a,T),M="Lançamento e próximos meses atualizados."):M="Lançamento atualizado."):h!=="nao"?(i.criarRepetidos(L,h,v),M=h==="parcelado"?`Criado em ${v} parcelas.`:`Recorrente criado: ${v} meses, até ${c.monthShort(c.addMonths(L.competencia,v-1))}.`):(Fin.storage.upsert("lancamentos",L),M="Lançamento criado.");const W=i.faturaParcial(L);Fin.ui.closeModal(),W?Fin.ui.toast(`${M} ⚠️ ${c.brl(W.falta)} ficam no rotativo do cartão.`,"erro"):Fin.ui.toast(M),!a&&L.competencia!==Fin.state.mes&&(Fin.state.mes=L.competencia),Fin.router.refresh()})}function H(p,a){const d=(prompt(`Nome da nova categoria de ${a}:`)||"").trim();if(!d){p.value="";return}const{icone:P,nome:l}=y.splitEmoji(d),u=i.categorias(a).find(q=>y.normalize(q.nome)===y.normalize(l));u||Fin.storage.upsert("categorias",{nome:l,icone:P,tipo:a,classificacao:null,orcamentoMensal:0}),p.innerHTML=R(a,u?u.nome:l)}return Fin.forms.categoriaOptions=R,Fin.forms.novaCategoria=H,Fin.forms.NOVA_CATEGORIA=w,{open:K}})();
