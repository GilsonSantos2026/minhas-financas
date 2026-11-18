/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.forms=Fin.forms||{},Fin.forms.lancamento=(()=>{const p=Fin.fmt,h=p.esc,d=Fin.finance,S=Fin.parsers,w="__nova__";function R(c,a){const l=d.categorias(c),b=l.map(u=>u.nome);return'<option value="">Selecione…</option>'+[...a&&!b.includes(a)?[{nome:a,icone:""}]:[],...l].map(u=>`<option value="${h(u.nome)}" ${u.nome===a?"selected":""}>${u.icone?u.icone+" ":""}${h(u.nome)}</option>`).join("")+`<option value="${w}">＋ Nova categoria…</option>`}function K(c,a){const l=d.categorias(c),b={};for(const v of d.todos())v.tipo===c&&(b[v.categoria]=(b[v.categoria]||0)+1);let n=[...l].sort((v,f)=>(b[f.nome]||0)-(b[v.nome]||0)).slice(0,7);const u=a&&!n.some(v=>v.nome===a)?l.find(v=>v.nome===a):null;return u&&(n=[...n.slice(0,6),u]),n}function ge(c,a){const l=K(c,a),b=a&&!l.some(n=>n.nome===a);return l.map(n=>`
      <button type="button" class="cat-rapida" data-cat="${h(n.nome)}" aria-pressed="${n.nome===a}">
        <span class="cat-ic" aria-hidden="true">${n.icone||h(n.nome.slice(0,1).toUpperCase())}</span><span class="cat-nome">${h(n.nome)}</span>
      </button>`).join("")+`
      <button type="button" class="cat-rapida" data-cat-mais aria-pressed="${!!b}">
        <span class="cat-ic" aria-hidden="true">${Fin.icone("mais","w-4 h-4")}</span><span class="cat-nome">Outras</span>
      </button>`}function be(c,a){if(!d.temCasal())return"";const l=Fin.membros,b=Fin.cofre.membroId(),n=c?d.pagador(c):b,u=c?l.porId(d.autor(c)):null,v=[...Fin.cofre.pessoas().map(f=>({id:f.id,nome:l.primeiroNome(l.porId(f.id))||f.usuario,av:l.avatar(l.porId(f.id),{tam:"w-7 h-7",txt:"text-[10px]"})})),{id:d.CASAL,nome:"Os dois",av:`<span class="w-7 h-7 rounded-full grid place-items-center bg-prim-600 text-white shrink-0">${Fin.icone("usuario","w-4 h-4")}</span>`}];return`
      <fieldset data-quem class="${a.tipo==="receita"?"hidden":""}">
        <legend class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Quem pagou?</legend>
        <div class="grid grid-cols-3 gap-2">
          ${v.map(f=>`
            <label class="quem-opcao">
              <input type="radio" name="pagoPor" value="${h(f.id)}" ${f.id===n?"checked":""} />
              <span>${f.av}<span class="truncate">${h(f.nome)}</span></span>
            </label>`).join("")}
        </div>
        ${u?`<p class="text-xs text-slate-500 mt-1.5">Lançado por <b>${h(l.nome(u)||u.usuario)}</b>.</p>`:""}
      </fieldset>
      ${u&&a.tipo==="receita"?`<p data-quem-rec class="text-xs text-slate-500 -mt-2">Recebido por <b>${h(l.nome(u)||u.usuario)}</b> (quem lançou).</p>`:""}`}const Z=c=>c&&d.temCasal()&&d.autor(c)!==Fin.cofre.membroId()?Fin.membros.porId(d.autor(c)):null;function fe(c){const a=Z(c);if(!a)return"";const l=h(Fin.membros.primeiroNome(a)||a.usuario);return`
      <div data-confirma-outro class="hidden px-5 py-4 border-t border-amber-200 bg-amber-50 sticky bottom-0 space-y-3" role="alertdialog" aria-live="assertive">
        <div class="flex items-start gap-2 text-sm text-amber-900">
          ${Fin.membros.avatar(a,{tam:"w-7 h-7",txt:"text-[10px]"})}
          <span><b>Este lançamento foi feito por ${l}.</b> <span data-confirma-texto>Quer mesmo salvar a alteração?</span></span>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" data-confirma-nao class="btn btn-ghost !py-1.5">Voltar</button>
          <button type="button" data-confirma-sim class="btn btn-primary !py-1.5">Sim, salvar</button>
        </div>
      </div>`}function xe(c=null){const a=c?d.todos().find(e=>e.id===c):null;if(c&&!a)return Fin.ui.toast("Lançamento não encontrado.","error");const l=p.todayISO(),b=Fin.state.mes===p.currentYM()?l:`${Fin.state.mes}-01`,n=a||{tipo:"despesa",status:"aberto",data:b,vencimento:b,competencia:Fin.state.mes},u=d.formasPagamento(),v=matchMedia("(max-width: 767px)").matches;a||(n.status=n.vencimento<=l?"pago":"aberto");const f=Fin.ui.openModal(`
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
            <label><input type="radio" name="tipo" value="despesa" ${n.tipo!=="receita"?"checked":""}><span>Despesa</span></label>
            <label><input type="radio" name="tipo" value="receita" ${n.tipo==="receita"?"checked":""}><span>Receita</span></label>
          </div>

          <!-- Redesign v2026-11-18.4: valor primeiro (teclado próprio no celular) -->
          <div class="valor-grande">
            <label for="lanc-valor" id="lbl-valor" class="block text-xs font-semibold text-slate-500 text-center">Valor lançado (R$)</label>
            <div class="flex items-baseline justify-center gap-1.5">
              <span class="text-lg font-semibold text-slate-500" aria-hidden="true">R$</span>
              <input id="lanc-valor" name="valorPrevisto" class="valor-grande-input tabular-nums" inputmode="${v?"none":"decimal"}" autocomplete="off" required value="${p.decimalInput(n.valorPrevisto)}" placeholder="0,00" />
            </div>
          </div>
          ${v?`
          <div class="teclado" data-teclado role="group" aria-label="Teclado do valor">
            ${["1","2","3","4","5","6","7","8","9","00","0"].map(e=>`<button type="button" data-tecla="${e}">${e}</button>`).join("")}
            <button type="button" data-tecla="apagar" aria-label="Apagar">⌫</button>
          </div>`:""}

          <div>
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Categoria</p>
            <div data-cats class="grid grid-cols-4 gap-2"></div>
            <label class="field mt-2 ${K(n.tipo).some(e=>e.nome===n.categoria)||!n.categoria?"hidden":""}" data-cat-select><span>Todas as categorias</span>
              <select name="categoria" class="input" required>${R(n.tipo,n.categoria)}</select></label>
          </div>

          ${be(a,n)}

          <div>
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Quando</p>
            <div class="flex flex-wrap gap-2" data-quando>
              <button type="button" class="chip-op" data-quando-op="hoje">Hoje</button>
              <button type="button" class="chip-op" data-quando-op="ontem">Ontem</button>
              <button type="button" class="chip-op" data-quando-op="outra">Outra data</button>
            </div>
            <label class="field mt-2" data-venc-campo><span>Data / vencimento *</span>
              <input name="vencimento" type="date" class="input" required value="${n.vencimento||n.data||""}" /></label>
          </div>

          <label class="flex items-center gap-3 py-1 cursor-pointer" data-ja-pago-linha>
            <span class="flex-1 min-w-0">
              <span class="block text-[15px] font-semibold" data-ja-pago-rot>Já está pago</span>
              <span class="block text-xs text-slate-500" data-ja-pago-sub></span>
            </span>
            <input type="checkbox" data-ja-pago class="toggle" role="switch" ${n.status!=="aberto"?"checked":""} />
          </label>

          <label class="field"><span>Descrição <span class="font-normal text-slate-400">(opcional)</span></span>
            <input name="descricao" class="input" maxlength="120" value="${h(n.descricao)}" placeholder="Ex.: Conta de luz" /></label>

          <details data-mais class="mais-opcoes border-t border-slate-100" ${a||Fin.modo?.completo?.()?"open":""}>
            <summary class="flex items-center gap-2 py-3 cursor-pointer">
              <span class="flex-1 min-w-0">
                <span class="block text-sm font-semibold text-prim-700">Mais opções</span>
                <span class="block text-xs text-slate-500 truncate">${a?"Mês do gasto, pagamento, forma e observação":"Repetir todo mês, mês do gasto, pagamento parcial, forma e observação"}</span>
              </span>
              <span class="mais-seta text-slate-400" aria-hidden="true">${Fin.icone("seta","w-5 h-5")}</span>
            </summary>
            <div class="space-y-4 pb-1">
          <label class="field"><span>Mês do gasto <span class="font-normal text-slate-400">(em que mês ele conta)</span></span>
            <input name="competencia" type="month" class="input" value="${n.competencia||""}" /></label>

          ${a?"":`
          <!-- Recorrência (só em lançamento novo): aluguel, água, luz… -->
          <section class="rounded-2xl border border-slate-200 p-3 space-y-3" aria-labelledby="rec-titulo">
            <label class="flex items-center gap-3 cursor-pointer">
              <span class="flex-1 min-w-0">
                <span id="rec-titulo" class="block text-sm font-semibold">🔁 Repetir todo mês</span>
                <span class="block text-xs text-slate-500">Aluguel, assinatura, financiamento (até 420 meses)</span>
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
                  <input name="vezes" type="number" inputmode="numeric" min="2" max="420" value="12" class="input" /></label>
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
              <label><input type="radio" name="status" value="aberto" ${["pago","parcial"].includes(n.status)?"":"checked"}><span data-rot="aberto">Em aberto</span></label>
              <label><input type="radio" name="status" value="pago" ${n.status==="pago"?"checked":""}><span data-rot="pago">Pago</span></label>
              <label><input type="radio" name="status" value="parcial" ${n.status==="parcial"?"checked":""}><span>Parcial</span></label>
            </div>
            <div id="pago-fields" class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <label class="field"><span data-rot="data">Data do pagamento</span>
                  <input name="dataPagamento" type="date" class="input" value="${n.dataPagamento||""}" /></label>
                <label class="field"><span data-rot="valor">Valor pago (R$)</span>
                  <input name="valorPago" class="input tabular-nums" inputmode="decimal" value="${p.decimalInput(n.valorPago)}" placeholder="0,00" /></label>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <button type="button" data-usar-lancado class="text-xs font-semibold text-prim-700 hover:underline">Usar o valor lançado</button>
                <span id="pg-diff" class="text-xs ml-auto"></span>
              </div>
              <div id="pg-rotativo"></div>
            </div>
            <label class="field"><span>Forma de pagamento</span>
              <input name="formaPagamento" class="input" list="formas-list" value="${h(n.formaPagamento)}" placeholder="PIX, Boleto, Débito…" />
              <datalist id="formas-list">${u.map(e=>`<option value="${h(e.nome)}"></option>`).join("")}</datalist></label>
          </section>

          <label class="field"><span>Data do lançamento</span>
            <input name="data" type="date" class="input" value="${n.data||""}" /></label>

          <label class="field"><span>Observação</span>
            <textarea name="observacao" rows="2" class="input" maxlength="500">${h(n.observacao)}</textarea></label>
            </div>
          </details>

          <p id="form-erro" class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
        </div>

        <div data-rodape class="flex items-center gap-2 px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
          ${a?`<button type="button" data-delete class="btn btn-danger-ghost">${a.grupo?"Excluir…":"Excluir"}</button>`:""}
          <span class="flex-1"></span>
          <button type="button" data-close class="btn btn-ghost">Cancelar</button>
          <button type="submit" data-salvar class="btn btn-primary min-w-[9rem]">Salvar</button>
        </div>
        ${fe(a)}
      </form>`,a?"Editar lançamento":"Novo lançamento"),s=f.querySelector("#lanc-form"),t=e=>s.elements[e];let ae=!!a;const J=()=>s.querySelector('input[name="tipo"]:checked').value,te=(e,o)=>Math.round((new Date(`${o}T00:00`)-new Date(`${e}T00:00`))/864e5),C=()=>{const e=J()==="receita",o=t("status").value;s.querySelector("[data-pg-titulo]").textContent=e?"Recebimento":"Pagamento",s.querySelector('[data-rot="aberto"]').textContent=e?"A receber":"Em aberto",s.querySelector('[data-rot="pago"]').textContent=e?"Recebido":"Pago",s.querySelector('[data-rot="data"]').textContent=e?"Data do recebimento":"Data do pagamento",s.querySelector('[data-rot="valor"]').textContent=e?"Valor recebido (R$)":"Valor pago (R$)",s.querySelector("#pago-fields").classList.toggle("hidden",o==="aberto");const r=S.toNumber(t("valorPrevisto").value),i=S.toNumber(t("valorPago").value),m=t("vencimento").value,y=t("dataPagamento").value,$=s.querySelector("#pg-situacao"),q=s.querySelector("#pg-diff");$.innerHTML="",q.innerHTML="";const k=!e&&d.isPagamentoFatura({tipo:"despesa",categoria:t("categoria").value}),P=k&&o!=="aberto"&&r>0&&i>0?d.faturaParcial({tipo:"despesa",categoria:t("categoria").value,status:o,valorPrevisto:r,valorPago:i}):null;if(s.querySelector("#pg-rotativo").innerHTML=P?Fin.ui.alertaRotativo(P,d.rotativo()):"",o==="aberto"){if(m){const g=te(l,m);$.innerHTML=g<0?`<span class="text-rose-700 font-medium">! vencido há ${-g} dia${g===-1?"":"s"}</span>`:g===0?'<span class="text-amber-800 font-medium">vence hoje</span>':`<span class="text-slate-500">vence em ${g} dia${g===1?"":"s"}</span>`}return}if(m&&y){const g=te(m,y);$.innerHTML=g>0?`<span class="text-amber-800 font-medium">◷ ${e?"recebido":"pago"} ${g} dia${g===1?"":"s"} após o vencimento</span>`:`<span class="text-emerald-800">✓ ${e?"recebido":"pago"} em dia</span>`}if(r==null||i==null)return;const x=Math.round((i-r)*100)/100;o==="parcial"?q.innerHTML=i<r?`<span class="text-amber-800">Falta ${p.brl(r-i)}</span>`:'<span class="text-rose-700">Valor ≥ lançado: marque “Pago”</span>':Math.abs(x)<.01?q.innerHTML='<span class="text-emerald-800">✓ igual ao lançado</span>':x>0?q.innerHTML=`<span class="text-amber-800">＋${p.brl(x)} ${e?"a mais":"a mais (juros/multa)"}</span>`:q.innerHTML=k?`<span class="text-rose-700 font-medium">−${p.brl(-x)} a menos (rotativo)</span>`:`<span class="text-emerald-800">−${p.brl(-x)} ${e?"a menos":"(desconto)"}</span>`},U=s.querySelector("[data-ja-pago]");let N=!!a,I=!a,D=!a;const he=()=>{const e=t("vencimento").value;return e&&e<=l?e:l},oe=e=>{s.querySelector(`input[name="status"][value="${e}"]`).checked=!0},se=()=>{const e=J()==="receita",o=t("status").value;U.checked=o!=="aberto",s.querySelector("[data-ja-pago-rot]").textContent=e?"Já recebi":"Já está pago",s.querySelector("[data-ja-pago-sub]").textContent=o==="parcial"?`${e?"Recebido":"Pago"} em parte (veja em Mais opções)`:o==="pago"?`Entra como ${e?"recebido":"pago"}`:`Fica em “${e?"A receber":"A pagar"}”`,s.querySelector("[data-salvar]").textContent=a?"Salvar":e?"Salvar receita":"Salvar despesa"},H=()=>{const e=t("status").value;e!=="aberto"&&(e==="pago"&&(I||!t("valorPago").value)&&(t("valorPago").value=t("valorPrevisto").value),D?t("dataPagamento").value=he():t("dataPagamento").value||(t("dataPagamento").value=l)),se(),C()};H(),U.addEventListener("change",e=>{e.stopPropagation(),N=!0,oe(U.checked?"pago":"aberto"),H()}),s.addEventListener("input",e=>{const o=e.target.name;o==="valorPago"&&(I=!1),o==="dataPagamento"&&(D=!1),o==="valorPrevisto"&&I&&t("status").value==="pago"&&(t("valorPago").value=t("valorPrevisto").value),["valorPrevisto","valorPago","dataPagamento","vencimento"].includes(o)&&C()}),s.querySelector("[data-teclado]")?.addEventListener("click",e=>{const o=e.target.closest("[data-tecla]");if(!o)return;let r=Math.round((S.toNumber(t("valorPrevisto").value)||0)*100);if(o.dataset.tecla==="apagar")r=Math.floor(r/10);else{const i=+`${r}${o.dataset.tecla}`;if(i>9999999999)return;r=i}t("valorPrevisto").value=r?p.decimalInput(r/100):"",t("valorPrevisto").dispatchEvent(new Event("input",{bubbles:!0}))});const X=s.querySelector("[data-cats]"),O=s.querySelector("[data-cat-select]"),j=()=>{X.innerHTML=ge(J(),t("categoria").value),O.classList.contains("hidden")||X.querySelector("[data-cat-mais]").setAttribute("aria-pressed","true")};j(),X.addEventListener("click",e=>{const o=e.target.closest("button");if(o){if(o.hasAttribute("data-cat-mais")){O.classList.remove("hidden"),j(),t("categoria").focus();return}t("categoria").value=o.dataset.cat,O.classList.add("hidden"),t("categoria").dispatchEvent(new Event("change",{bubbles:!0})),j()}});const ne=(()=>{const e=new Date(`${l}T12:00`);return e.setDate(e.getDate()-1),`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`})(),$e=s.querySelector("[data-venc-campo]");let V=!1;const Y=()=>{const e=t("vencimento").value,o=V?"outra":e===l?"hoje":e===ne?"ontem":"outra";s.querySelectorAll("[data-quando-op]").forEach(r=>r.setAttribute("aria-pressed",String(r.dataset.quandoOp===o))),$e.classList.toggle("hidden",o!=="outra")};Y(),s.querySelector("[data-quando]").addEventListener("click",e=>{const o=e.target.closest("[data-quando-op]");if(!o)return;const r=o.dataset.quandoOp;if(V=r==="outra",V||(t("vencimento").value=r==="hoje"?l:ne,t("vencimento").dispatchEvent(new Event("change",{bubbles:!0}))),Y(),V){t("vencimento").focus();try{t("vencimento").showPicker?.()}catch{}}}),s.querySelector("[data-usar-lancado]").addEventListener("click",()=>{t("valorPago").value=t("valorPrevisto").value,C()});const re=420,F=()=>t("competencia").value||(t("vencimento").value||"").slice(0,7),ye=(e,o)=>{const[r,i]=e.split("-").map(Number),[m,y]=o.split("-").map(Number);return(m-r)*12+(y-i)+1},B=e=>`${Number(e.slice(0,4))+(e.endsWith("-12")?1:0)}-12`,le=()=>{if(!t("recorrente")?.checked)return{modo:"nao"};const e=t("repeticao").value,o=F();let r;if(t("ateModo").value==="ate"){if(!t("ate").value)return{modo:e,erro:"Escolha até qual mês repetir."};if(!o)return{modo:e,erro:"Informe o vencimento."};if(r=ye(o,t("ate").value),r<2)return{modo:e,erro:`Escolha um mês depois de ${p.monthShort(o)}.`}}else if(r=Math.trunc(Number(t("vezes").value)),!(r>=2))return{modo:e,erro:"Repita pelo menos 2 vezes."};return r>re?{modo:e,n:r,erro:`Máximo de ${re} meses (35 anos).`}:{modo:e,n:r}},z=()=>{if(!t("recorrente"))return;const e=le(),o=e.modo!=="nao";s.querySelector("#rep-box").classList.toggle("hidden",!o),s.querySelector("#lbl-valor").textContent=e.modo==="parcelado"?"Valor total (R$)":"Valor lançado (R$)";const r=t("ateModo").value==="ate";if(s.querySelector('[data-ate="vezes"]').classList.toggle("hidden",r),s.querySelector('[data-ate="ate"]').classList.toggle("hidden",!r),F()&&(s.querySelector("[data-ate-fim-ano]").textContent=`Até ${p.monthShort(B(F()))}`),!o)return;const i=s.querySelector("#rep-resumo");if(i.classList.toggle("bg-emerald-50",!e.erro),i.classList.toggle("bg-rose-50",!!e.erro),i.classList.toggle("text-rose-700",!!e.erro),e.erro){i.textContent=`! ${e.erro}`;return}const m=S.toNumber(t("valorPrevisto").value),y=F();if(!m||!y){i.textContent="Informe valor e vencimento para ver o resumo.";return}const $=`de ${p.monthShort(y)} a ${p.monthShort(p.addMonths(y,e.n-1))}`,q=Number((t("vencimento").value||"").slice(8,10));i.innerHTML=e.modo==="parcelado"?`<b>${e.n}x</b> de ${p.brl(Math.trunc(m*100/e.n)/100)} — ${$}.`:`<b>${e.n} lançamentos</b> de ${p.brl(m)}, ${$}${q?`, vencendo todo dia ${q}`:""} (${p.brl(m*e.n)} no total).<br><span class="text-slate-500">Conta que muda de valor (água, luz): ajuste o mês quando ela chegar e escolha “Só este”.</span>`};s.addEventListener("input",z),s.querySelector("[data-ate-fim-ano]")?.addEventListener("click",()=>{const e=F();e&&(s.querySelector('input[name="ateModo"][value="ate"]').checked=!0,t("ate").value=B(e),z())}),s.querySelector("[data-ate-12]")?.addEventListener("click",()=>{s.querySelector('input[name="ateModo"][value="vezes"]').checked=!0,t("vezes").value=12,z()}),z(),s.addEventListener("change",e=>{const o=e.target.name;o==="ateModo"&&e.target.value==="ate"&&!t("ate").value&&F()&&(t("ate").value=B(F())),["recorrente","repeticao","ateModo","ate","vezes","vencimento","competencia"].includes(o)&&setTimeout(z),o==="tipo"&&(t("categoria").innerHTML=R(e.target.value,t("categoria").value),s.querySelector("[data-quem]")?.classList.toggle("hidden",e.target.value==="receita"),j(),se(),C()),o==="status"&&(N=!0,H()),o==="dataPagamento"&&(D=!1),(o==="vencimento"||o==="dataPagamento"||o==="categoria")&&C(),o==="competencia"&&(ae=!0),o==="vencimento"&&!ae&&e.target.value&&(t("competencia").value=e.target.value.slice(0,7)),o==="vencimento"&&(Y(),!N&&e.target.value&&oe(e.target.value>l?"aberto":"pago"),(!N||D)&&H()),o==="categoria"&&e.target.value===w&&ee(t("categoria"),s.querySelector('input[name="tipo"]:checked').value),o==="categoria"&&j()}),f.querySelectorAll("[data-close]").forEach(e=>e.addEventListener("click",Fin.ui.closeModal));const A=()=>s.querySelector('input[name="escopo"]:checked')?.value||"este",ie=Z(a);let ce=!1;const T=s.querySelector("[data-confirma-outro]"),de=s.querySelector("[data-rodape]"),ue=(e,o,r)=>{T.querySelector("[data-confirma-texto]").textContent=e;const i=T.querySelector("[data-confirma-sim]");i.textContent=o,i.onclick=r,de.classList.add("hidden"),T.classList.remove("hidden"),i.focus()};T?.querySelector("[data-confirma-nao]").addEventListener("click",()=>{T.classList.add("hidden"),de.classList.remove("hidden")});const pe=(e=!1)=>{const o=A()==="proximos",r=o?`“${a.descricao||a.categoria}” e os próximos meses deste grupo`:`“${a.descricao||a.categoria}”`;if(!e&&!confirm(`Excluir ${r}? Esta ação não pode ser desfeita.${a.grupo&&!o?`

Dica: para excluir também os meses seguintes, marque “Este e os próximos”.`:""}`))return;const i=d.excluirLancamento(a,A());Fin.ui.closeModal(),Fin.ui.toast(i>1?`${i} lançamentos excluídos.`:"Lançamento excluído."),Fin.router.refresh()};f.querySelector("[data-delete]")?.addEventListener("click",()=>{if(!ie)return pe();const e=A()==="proximos";ue(`Quer mesmo excluir${e?" este e os próximos meses":""}? Não dá para desfazer.`,"Sim, excluir",()=>pe(!0))}),s.addEventListener("submit",e=>{e.preventDefault();const o=s.querySelector("#form-erro"),r=s.querySelector('input[name="tipo"]:checked').value,i=S.toNumber(t("valorPrevisto").value),m=t("status").value,y=m==="pago"&&I,$=m==="aberto"?a?.valorPago??null:y?i:S.toNumber(t("valorPago").value),q=m!=="aberto"&&!y&&($===null||$<=0),k=t("vencimento").value||null,P=t("categoria").value,x=[];(i===null||i<=0)&&x.push("um valor maior que zero"),(!P||P===w)&&x.push("a categoria"),k||x.push("o vencimento"),q&&x.push("o valor pago"),m==="parcial"&&$!=null&&i!=null&&$>=i&&x.push("um valor pago menor que o lançado (ou marque “Pago”)");const g=a?{modo:"nao"}:le(),G=g.modo,Q=g.n;if(g.erro&&x.push(`a recorrência (${g.erro.replace(/\.$/,"").toLowerCase()})`),x.length){o.textContent=`Informe ${x.join(", ")}.`,o.classList.remove("hidden"),(g.erro||q||m==="parcial"&&x.some(L=>L.includes("valor pago")))&&(s.querySelector("[data-mais]").open=!0),(!P||P===w)&&O.classList.remove("hidden"),o.scrollIntoView({block:"nearest"});return}if(ie&&!ce)return ue(`Quer mesmo salvar a alteração${A()==="proximos"?" (neste e nos próximos meses)":""}?`,"Sim, salvar",()=>{ce=!0,s.requestSubmit()});const qe=d.categorias().find(L=>L.nome===P),Pe=d.formasPagamento().find(L=>L.nome===t("formaPagamento").value.trim()),W={tipo:r,descricao:t("descricao").value.trim()||P,categoria:P,categoriaIcone:qe?.icone??a?.categoriaIcone??null,valorPrevisto:i,formaPagamento:t("formaPagamento").value.trim()||null,formaPagamentoIcone:Pe?.icone??null,observacao:t("observacao").value.trim()||null};d.temCasal()&&(W.pagoPor=r==="despesa"?s.querySelector('input[name="pagoPor"]:checked')?.value||Fin.cofre.membroId():null);const M={...a?{id:a.id}:{origem:"app"},...W,valorPago:$,status:m,vencimento:k,data:t("data").value||k,dataPagamento:m==="aberto"?a?.dataPagamento??null:t("dataPagamento").value||l,competencia:t("competencia").value||k.slice(0,7)};let E,_=null;if(a)Fin.storage.upsert("lancamentos",M),a.grupo&&A()==="proximos"?(d.atualizarProximos(a,W),E="Lançamento e próximos meses atualizados."):E="Lançamento atualizado.";else if(G!=="nao"){const L=d.criarRepetidos(M,G,Q);_=()=>Fin.storage.set("lancamentos",Fin.storage.list("lancamentos").filter(Se=>Se.grupo!==L)),E=G==="parcelado"?`Criado em ${Q} parcelas.`:`Recorrente criado: ${Q} meses, até ${p.monthShort(p.addMonths(M.competencia,Q-1))}.`}else{const L=Fin.storage.upsert("lancamentos",M);_=()=>Fin.storage.remove("lancamentos",L.id),E="Lançamento criado."}const me=d.faturaParcial(M);Fin.ui.closeModal();const ve=_?{rotulo:"Desfazer",fn:()=>{_(),Fin.ui.toast("Lançamento desfeito."),Fin.router.refresh()}}:null;me?Fin.ui.toast(`${E} ⚠️ ${p.brl(me.falta)} ficam no rotativo do cartão.`,"erro",ve):Fin.ui.toast(E,"ok",ve),!a&&M.competencia!==Fin.state.mes&&(Fin.state.mes=M.competencia),Fin.router.refresh()})}function ee(c,a){const l=(prompt(`Nome da nova categoria de ${a}:`)||"").trim();if(!l){c.value="";return}const{icone:b,nome:n}=S.splitEmoji(l),u=d.categorias(a).find(v=>S.normalize(v.nome)===S.normalize(n));u||Fin.storage.upsert("categorias",{nome:n,icone:b,tipo:a,classificacao:null,orcamentoMensal:0}),c.innerHTML=R(a,u?u.nome:n)}return Fin.forms.categoriaOptions=R,Fin.forms.novaCategoria=ee,Fin.forms.NOVA_CATEGORIA=w,{open:xe}})();
