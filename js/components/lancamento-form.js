/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.forms=Fin.forms||{},Fin.forms.lancamento=(()=>{const m=Fin.fmt,f=m.esc,d=Fin.finance,y=Fin.parsers,z="__nova__";function V(u,e){const i=d.categorias(u),x=i.map(p=>p.nome);return'<option value="">Selecione…</option>'+[...e&&!x.includes(e)?[{nome:e,icone:""}]:[],...i].map(p=>`<option value="${f(p.nome)}" ${p.nome===e?"selected":""}>${p.icone?p.icone+" ":""}${f(p.nome)}</option>`).join("")+`<option value="${z}">＋ Nova categoria…</option>`}function ta(u,e){const i=d.categorias(u),x={};for(const b of d.todos())b.tipo===u&&(x[b.categoria]=(x[b.categoria]||0)+1);let n=[...i].sort((b,$)=>(x[$.nome]||0)-(x[b.nome]||0)).slice(0,7);const p=e&&!n.some(b=>b.nome===e)?i.find(b=>b.nome===e):null;return p&&(n=[...n.slice(0,6),p]),n}function qa(u,e){const i=ta(u,e),x=e&&!i.some(n=>n.nome===e);return i.map(n=>`
      <button type="button" class="cat-rapida" data-cat="${f(n.nome)}" aria-pressed="${n.nome===e}">
        <span class="cat-ic" aria-hidden="true">${n.icone||f(n.nome.slice(0,1).toUpperCase())}</span><span class="cat-nome">${f(n.nome)}</span>
      </button>`).join("")+`
      <button type="button" class="cat-rapida" data-cat-mais aria-pressed="${!!x}">
        <span class="cat-ic" aria-hidden="true">${Fin.icone("mais","w-4 h-4")}</span><span class="cat-nome">Outras</span>
      </button>`}function Pa(u,e){if(!d.temCasal())return"";const i=Fin.membros,x=Fin.cofre.membroId(),n=u?d.pagador(u):x,p=u?i.porId(d.autor(u)):null,b=[...Fin.cofre.pessoas().map($=>({id:$.id,nome:i.primeiroNome(i.porId($.id))||$.usuario,av:i.avatar(i.porId($.id),{tam:"w-7 h-7",txt:"text-[10px]"})})),{id:d.CASAL,nome:"Os dois",av:`<span class="w-7 h-7 rounded-full grid place-items-center bg-prim-600 text-white shrink-0">${Fin.icone("usuario","w-4 h-4")}</span>`}];return`
      <fieldset data-quem class="${e.tipo==="receita"?"hidden":""}">
        <legend class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Quem pagou?</legend>
        <div class="grid grid-cols-3 gap-2">
          ${b.map($=>`
            <label class="quem-opcao">
              <input type="radio" name="pagoPor" value="${f($.id)}" ${$.id===n?"checked":""} />
              <span>${$.av}<span class="truncate">${f($.nome)}</span></span>
            </label>`).join("")}
        </div>
        ${p?`<p class="text-xs text-slate-500 mt-1.5">Lançado por <b>${f(i.nome(p)||p.usuario)}</b>.</p>`:""}
      </fieldset>
      ${p&&e.tipo==="receita"?`<p data-quem-rec class="text-xs text-slate-500 -mt-2">Recebido por <b>${f(i.nome(p)||p.usuario)}</b> (quem lançou).</p>`:""}`}const oa=u=>u&&d.temCasal()&&d.autor(u)!==Fin.cofre.membroId()?Fin.membros.porId(d.autor(u)):null;function Sa(u){const e=oa(u);if(!e)return"";const i=f(Fin.membros.primeiroNome(e)||e.usuario);return`
      <div data-confirma-outro class="hidden px-5 py-4 border-t border-amber-200 bg-amber-50 sticky bottom-0 space-y-3" role="alertdialog" aria-live="assertive">
        <div class="flex items-start gap-2 text-sm text-amber-900">
          ${Fin.membros.avatar(e,{tam:"w-7 h-7",txt:"text-[10px]"})}
          <span><b>Este lançamento foi feito por ${i}.</b> <span data-confirma-texto>Quer mesmo salvar a alteração?</span></span>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" data-confirma-nao class="btn btn-ghost !py-1.5">Voltar</button>
          <button type="button" data-confirma-sim class="btn btn-primary !py-1.5">Sim, salvar</button>
        </div>
      </div>`}function La(u=null){const e=u?d.todos().find(a=>a.id===u):null;if(u&&!e)return Fin.ui.toast("Lançamento não encontrado.","error");const i=m.todayISO(),x=Fin.state.mes===m.currentYM()?i:`${Fin.state.mes}-01`,n=e||{tipo:"despesa",status:"aberto",data:x,vencimento:x,competencia:Fin.state.mes},p=n.pagamentos?.length?n.pagamentos:null,b=p?p[0]:{data:n.dataPagamento,valor:n.valorPago},$=(a={})=>`
      <div class="grid grid-cols-[1fr_1fr_auto] gap-2 items-end" data-pg-extra>
        <label class="field"><span data-pg-rot>Data</span><input type="date" class="input" data-pg-data value="${f(a.data||"")}" /></label>
        <label class="field"><span>Valor (R$)</span><input class="input tabular-nums" inputmode="decimal" data-pg-valor value="${m.decimalInput(a.valor)}" placeholder="0,00" /></label>
        <button type="button" data-pg-tirar class="icon-btn mb-0.5" aria-label="Tirar este pagamento">✕</button>
      </div>`,Fa=d.formasPagamento(),na=matchMedia("(max-width: 767px)").matches;e||(n.status=n.vencimento<=i?"pago":"aberto");const X=Fin.ui.openModal(`
      <form id="lanc-form" novalidate>
        <div data-arrastar class="flex items-center justify-between gap-2 px-5 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 class="font-semibold text-lg">${e?"Editar lançamento":"Novo lançamento"}</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>

        <div class="px-5 py-4 space-y-4">
          ${e?.grupo?`
            <div class="bg-slate-50 rounded-xl px-3 py-2.5 text-sm space-y-2">
              <p><span aria-hidden="true">${e.recorrencia==="fixo"?"🔁":"🧩"}</span>
                ${e.recorrencia==="fixo"?`Recorrente · mês <b>${e.parcela?.atual}/${e.parcela?.total}</b>`:`Parcela <b>${e.parcela?.atual}/${e.parcela?.total}</b>`}</p>
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
              <input id="lanc-valor" name="valorPrevisto" class="valor-grande-input tabular-nums" inputmode="${na?"none":"decimal"}" autocomplete="off" required value="${m.decimalInput(n.valorPrevisto)}" placeholder="0,00" />
            </div>
          </div>
          ${na?`
          <div class="teclado" data-teclado role="group" aria-label="Teclado do valor">
            ${["1","2","3","4","5","6","7","8","9","00","0"].map(a=>`<button type="button" data-tecla="${a}">${a}</button>`).join("")}
            <button type="button" data-tecla="apagar" aria-label="Apagar">⌫</button>
          </div>`:""}

          <div>
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Categoria</p>
            <div data-cats class="grid grid-cols-4 gap-2"></div>
            <label class="field mt-2 ${ta(n.tipo).some(a=>a.nome===n.categoria)||!n.categoria?"hidden":""}" data-cat-select><span>Todas as categorias</span>
              <select name="categoria" class="input" required>${V(n.tipo,n.categoria)}</select></label>
          </div>

          ${Pa(e,n)}

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
            <input name="descricao" class="input" maxlength="120" value="${f(n.descricao)}" placeholder="Ex.: Conta de luz" /></label>

          <details data-mais class="mais-opcoes border-t border-slate-100" ${e||Fin.modo?.completo?.()?"open":""}>
            <summary class="flex items-center gap-2 py-3 cursor-pointer">
              <span class="flex-1 min-w-0">
                <span class="block text-sm font-semibold text-prim-700">Mais opções</span>
                <span class="block text-xs text-slate-500 truncate">${e?"Mês do gasto, pagamento, forma e observação":"Repetir todo mês, mês do gasto, pagamento parcial, forma e observação"}</span>
              </span>
              <span class="mais-seta text-slate-400" aria-hidden="true">${Fin.icone("seta","w-5 h-5")}</span>
            </summary>
            <div class="space-y-4 pb-1">
          <label class="field"><span>Mês do gasto <span class="font-normal text-slate-400">(em que mês ele conta)</span></span>
            <input name="competencia" type="month" class="input" value="${n.competencia||""}" /></label>

          ${e?"":`
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
                  <input name="dataPagamento" type="date" class="input" value="${b.data||""}" /></label>
                <label class="field"><span data-rot="valor">Valor pago (R$)</span>
                  <input name="valorPago" class="input tabular-nums" inputmode="decimal" value="${m.decimalInput(b.valor)}" placeholder="0,00" /></label>
              </div>
              <div data-pg-extras class="space-y-3">${p?p.slice(1).map($).join(""):""}</div>
              <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                <button type="button" data-usar-lancado class="text-xs font-semibold text-prim-700 hover:underline">Usar o valor lançado</button>
                <button type="button" data-pg-mais class="text-xs font-semibold text-prim-700 hover:underline"><span data-pg-mais-rot>＋ Outro pagamento</span></button>
                <span id="pg-diff" class="text-xs ml-auto"></span>
              </div>
              <div id="pg-rotativo"></div>
            </div>
            <label class="field"><span>Forma de pagamento</span>
              <input name="formaPagamento" class="input" list="formas-list" value="${f(n.formaPagamento)}" placeholder="PIX, Boleto, Débito…" />
              <datalist id="formas-list">${Fa.map(a=>`<option value="${f(a.nome)}"></option>`).join("")}</datalist></label>
          </section>

          <label class="field"><span>Data do lançamento</span>
            <input name="data" type="date" class="input" value="${n.data||""}" /></label>

          <label class="field"><span>Observação</span>
            <textarea name="observacao" rows="2" class="input" maxlength="500">${f(n.observacao)}</textarea></label>
            </div>
          </details>

          <p id="form-erro" class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
        </div>

        <div data-rodape class="flex items-center gap-2 px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
          ${e?`<button type="button" data-delete class="btn btn-danger-ghost">${e.grupo?"Excluir…":"Excluir"}</button>`:""}
          <span class="flex-1"></span>
          <button type="button" data-close class="btn btn-ghost">Cancelar</button>
          <button type="submit" data-salvar class="btn btn-primary min-w-[9rem]">Salvar</button>
        </div>
        ${Sa(e)}
      </form>`,e?"Editar lançamento":"Novo lançamento"),s=X.querySelector("#lanc-form"),t=a=>s.elements[a];let ra=!!e;const Y=()=>s.querySelector('input[name="tipo"]:checked').value,la=(a,o)=>Math.round((new Date(`${o}T00:00`)-new Date(`${a}T00:00`))/864e5),G=s.querySelector("[data-pg-extras]"),R=()=>[...G.querySelectorAll("[data-pg-extra]")],ia=()=>[{data:t("dataPagamento").value||i,valor:y.toNumber(t("valorPago").value)},...R().map(a=>({data:a.querySelector("[data-pg-data]").value||i,valor:y.toNumber(a.querySelector("[data-pg-valor]").value)}))].filter(a=>a.valor!=null&&a.valor>0),ca=()=>R().length?d.somaPagamentos(ia()):y.toNumber(t("valorPago").value),F=()=>{const a=Y()==="receita",o=t("status").value,r=R().length>0;s.querySelector("[data-pg-titulo]").textContent=a?"Recebimento":"Pagamento",s.querySelector('[data-rot="aberto"]').textContent=a?"A receber":"Em aberto",s.querySelector('[data-rot="pago"]').textContent=a?"Recebido":"Pago",s.querySelector('[data-rot="data"]').textContent=r?"Data do 1º":a?"Data do recebimento":"Data do pagamento",s.querySelector('[data-rot="valor"]').textContent=r?a?"1º recebimento (R$)":"1º pagamento (R$)":a?"Valor recebido (R$)":"Valor pago (R$)",R().forEach((g,T)=>{g.querySelector("[data-pg-rot]").textContent=`Data do ${T+2}º`}),s.querySelector("[data-pg-mais-rot]").textContent=a?"＋ Outro recebimento":"＋ Outro pagamento",s.querySelector("#pago-fields").classList.toggle("hidden",o==="aberto");const l=y.toNumber(t("valorPrevisto").value),c=ca(),v=t("vencimento").value,M=t("dataPagamento").value,q=s.querySelector("#pg-situacao"),k=s.querySelector("#pg-diff");q.innerHTML="",k.innerHTML="";const C=!a&&d.isPagamentoFatura({tipo:"despesa",categoria:t("categoria").value}),S=C&&o!=="aberto"&&l>0&&c>0?d.faturaParcial({tipo:"despesa",categoria:t("categoria").value,status:o,valorPrevisto:l,valorPago:c}):null;if(s.querySelector("#pg-rotativo").innerHTML=S?Fin.ui.alertaRotativo(S,d.rotativo()):"",o==="aberto"){if(v){const g=la(i,v);q.innerHTML=g<0?`<span class="text-rose-700 font-medium">! vencido há ${-g} dia${g===-1?"":"s"}</span>`:g===0?'<span class="text-amber-800 font-medium">vence hoje</span>':`<span class="text-slate-500">vence em ${g} dia${g===1?"":"s"}</span>`}return}if(v&&M){const g=la(v,M);q.innerHTML=g>0?`<span class="text-amber-800 font-medium">◷ ${a?"recebido":"pago"} ${g} dia${g===1?"":"s"} após o vencimento</span>`:`<span class="text-emerald-800">✓ ${a?"recebido":"pago"} em dia</span>`}if(l==null||c==null)return;const h=Math.round((c-l)*100)/100,L=r?`<span class="text-slate-600">Total ${m.brl(c)} · </span>`:"";if(o==="parcial"){k.innerHTML=L+(c<l?`<span class="text-amber-800">Falta ${m.brl(l-c)}</span>`:r?'<span class="text-emerald-800">✓ completo: salva como “Pago”</span>':'<span class="text-rose-700">Valor ≥ lançado: marque “Pago”</span>');return}Math.abs(h)<.01?k.innerHTML=`${L}<span class="text-emerald-800">✓ igual ao lançado</span>`:h>0?k.innerHTML=`${L}<span class="text-amber-800">＋${m.brl(h)} ${a?"a mais":"a mais (juros/multa)"}</span>`:k.innerHTML=L+(C?`<span class="text-rose-700 font-medium">−${m.brl(-h)} a menos (rotativo)</span>`:`<span class="text-emerald-800">−${m.brl(-h)} ${a?"a menos":"(desconto)"}</span>`)},W=s.querySelector("[data-ja-pago]");let _=!!e,j=!e,N=!e;const Ma=()=>{const a=t("vencimento").value;return a&&a<=i?a:i},da=a=>{s.querySelector(`input[name="status"][value="${a}"]`).checked=!0},pa=()=>{const a=Y()==="receita",o=t("status").value;W.checked=o!=="aberto",s.querySelector("[data-ja-pago-rot]").textContent=a?"Já recebi":"Já está pago",s.querySelector("[data-ja-pago-sub]").textContent=o==="parcial"?`${a?"Recebido":"Pago"} em parte (veja em Mais opções)`:o==="pago"?`Entra como ${a?"recebido":"pago"}`:`Fica em “${a?"A receber":"A pagar"}”`,s.querySelector("[data-salvar]").textContent=e?"Salvar":a?"Salvar receita":"Salvar despesa"},Q=()=>{const a=t("status").value;a!=="aberto"&&(a==="pago"&&(j||!t("valorPago").value)&&(t("valorPago").value=t("valorPrevisto").value),N?t("dataPagamento").value=Ma():t("dataPagamento").value||(t("dataPagamento").value=i)),pa(),F()};Q(),W.addEventListener("change",a=>{a.stopPropagation(),_=!0,da(W.checked?"pago":"aberto"),Q()}),s.addEventListener("input",a=>{const o=a.target.name;o==="valorPago"&&(j=!1),o==="dataPagamento"&&(N=!1),o==="valorPrevisto"&&j&&t("status").value==="pago"&&(t("valorPago").value=t("valorPrevisto").value),["valorPrevisto","valorPago","dataPagamento","vencimento"].includes(o)&&F(),a.target.matches?.("[data-pg-valor], [data-pg-data]")&&(j=!1,F())}),s.querySelector("#pago-fields").addEventListener("click",a=>{if(a.target.closest("[data-pg-mais]")){const r=y.toNumber(t("valorPrevisto").value)||0,l=ca()||0,c=l>0?Math.round((r-l)*100)/100:0;G.insertAdjacentHTML("beforeend",$({data:i,valor:c>0?c:null})),j=!1,N=!1,F(),G.lastElementChild?.querySelector("[data-pg-valor]")?.focus()}const o=a.target.closest("[data-pg-tirar]");o&&(o.closest("[data-pg-extra]").remove(),F())}),s.querySelector("[data-teclado]")?.addEventListener("click",a=>{const o=a.target.closest("[data-tecla]");if(!o)return;let r=Math.round((y.toNumber(t("valorPrevisto").value)||0)*100);if(o.dataset.tecla==="apagar")r=Math.floor(r/10);else{const l=+`${r}${o.dataset.tecla}`;if(l>9999999999)return;r=l}t("valorPrevisto").value=r?m.decimalInput(r/100):"",t("valorPrevisto").dispatchEvent(new Event("input",{bubbles:!0}))});const K=s.querySelector("[data-cats]"),J=s.querySelector("[data-cat-select]"),I=()=>{K.innerHTML=qa(Y(),t("categoria").value),J.classList.contains("hidden")||K.querySelector("[data-cat-mais]").setAttribute("aria-pressed","true")};I(),K.addEventListener("click",a=>{const o=a.target.closest("button");if(o){if(o.hasAttribute("data-cat-mais")){J.classList.remove("hidden"),I(),t("categoria").focus();return}t("categoria").value=o.dataset.cat,J.classList.add("hidden"),t("categoria").dispatchEvent(new Event("change",{bubbles:!0})),I()}});const ua=(()=>{const a=new Date(`${i}T12:00`);return a.setDate(a.getDate()-1),`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}-${String(a.getDate()).padStart(2,"0")}`})(),ka=s.querySelector("[data-venc-campo]");let B=!1;const Z=()=>{const a=t("vencimento").value,o=B?"outra":a===i?"hoje":a===ua?"ontem":"outra";s.querySelectorAll("[data-quando-op]").forEach(r=>r.setAttribute("aria-pressed",String(r.dataset.quandoOp===o))),ka.classList.toggle("hidden",o!=="outra")};Z(),s.querySelector("[data-quando]").addEventListener("click",a=>{const o=a.target.closest("[data-quando-op]");if(!o)return;const r=o.dataset.quandoOp;if(B=r==="outra",B||(t("vencimento").value=r==="hoje"?i:ua,t("vencimento").dispatchEvent(new Event("change",{bubbles:!0}))),Z(),B){t("vencimento").focus();try{t("vencimento").showPicker?.()}catch{}}}),s.querySelector("[data-usar-lancado]").addEventListener("click",()=>{t("valorPago").value=t("valorPrevisto").value,F()});const ma=420,w=()=>t("competencia").value||(t("vencimento").value||"").slice(0,7),Ea=(a,o)=>{const[r,l]=a.split("-").map(Number),[c,v]=o.split("-").map(Number);return(c-r)*12+(v-l)+1},aa=a=>`${Number(a.slice(0,4))+(a.endsWith("-12")?1:0)}-12`,va=()=>{if(!t("recorrente")?.checked)return{modo:"nao"};const a=t("repeticao").value,o=w();let r;if(t("ateModo").value==="ate"){if(!t("ate").value)return{modo:a,erro:"Escolha até qual mês repetir."};if(!o)return{modo:a,erro:"Informe o vencimento."};if(r=Ea(o,t("ate").value),r<2)return{modo:a,erro:`Escolha um mês depois de ${m.monthShort(o)}.`}}else if(r=Math.trunc(Number(t("vezes").value)),!(r>=2))return{modo:a,erro:"Repita pelo menos 2 vezes."};return r>ma?{modo:a,n:r,erro:`Máximo de ${ma} meses (35 anos).`}:{modo:a,n:r}},D=()=>{if(!t("recorrente"))return;const a=va(),o=a.modo!=="nao";s.querySelector("#rep-box").classList.toggle("hidden",!o),s.querySelector("#lbl-valor").textContent=a.modo==="parcelado"?"Valor total (R$)":"Valor lançado (R$)";const r=t("ateModo").value==="ate";if(s.querySelector('[data-ate="vezes"]').classList.toggle("hidden",r),s.querySelector('[data-ate="ate"]').classList.toggle("hidden",!r),w()&&(s.querySelector("[data-ate-fim-ano]").textContent=`Até ${m.monthShort(aa(w()))}`),!o)return;const l=s.querySelector("#rep-resumo");if(l.classList.toggle("bg-emerald-50",!a.erro),l.classList.toggle("bg-rose-50",!!a.erro),l.classList.toggle("text-rose-700",!!a.erro),a.erro){l.textContent=`! ${a.erro}`;return}const c=y.toNumber(t("valorPrevisto").value),v=w();if(!c||!v){l.textContent="Informe valor e vencimento para ver o resumo.";return}const M=`de ${m.monthShort(v)} a ${m.monthShort(m.addMonths(v,a.n-1))}`,q=Number((t("vencimento").value||"").slice(8,10));l.innerHTML=a.modo==="parcelado"?`<b>${a.n}x</b> de ${m.brl(Math.trunc(c*100/a.n)/100)} — ${M}.`:`<b>${a.n} lançamentos</b> de ${m.brl(c)}, ${M}${q?`, vencendo todo dia ${q}`:""} (${m.brl(c*a.n)} no total).<br><span class="text-slate-500">Conta que muda de valor (água, luz): ajuste o mês quando ela chegar e escolha “Só este”.</span>`};s.addEventListener("input",D),s.querySelector("[data-ate-fim-ano]")?.addEventListener("click",()=>{const a=w();a&&(s.querySelector('input[name="ateModo"][value="ate"]').checked=!0,t("ate").value=aa(a),D())}),s.querySelector("[data-ate-12]")?.addEventListener("click",()=>{s.querySelector('input[name="ateModo"][value="vezes"]').checked=!0,t("vezes").value=12,D()}),D(),s.addEventListener("change",a=>{const o=a.target.name;o==="ateModo"&&a.target.value==="ate"&&!t("ate").value&&w()&&(t("ate").value=aa(w())),["recorrente","repeticao","ateModo","ate","vezes","vencimento","competencia"].includes(o)&&setTimeout(D),o==="tipo"&&(t("categoria").innerHTML=V(a.target.value,t("categoria").value),s.querySelector("[data-quem]")?.classList.toggle("hidden",a.target.value==="receita"),I(),pa(),F()),o==="status"&&(_=!0,Q()),o==="dataPagamento"&&(N=!1),(o==="vencimento"||o==="dataPagamento"||o==="categoria")&&F(),o==="competencia"&&(ra=!0),o==="vencimento"&&!ra&&a.target.value&&(t("competencia").value=a.target.value.slice(0,7)),o==="vencimento"&&(Z(),!_&&a.target.value&&da(a.target.value>i?"aberto":"pago"),(!_||N)&&Q()),o==="categoria"&&a.target.value===z&&sa(t("categoria"),s.querySelector('input[name="tipo"]:checked').value),o==="categoria"&&I()}),X.querySelectorAll("[data-close]").forEach(a=>a.addEventListener("click",Fin.ui.closeModal));const O=()=>s.querySelector('input[name="escopo"]:checked')?.value||"este",ga=oa(e);let ba=!1;const H=s.querySelector("[data-confirma-outro]"),fa=s.querySelector("[data-rodape]"),xa=(a,o,r)=>{H.querySelector("[data-confirma-texto]").textContent=a;const l=H.querySelector("[data-confirma-sim]");l.textContent=o,l.onclick=r,fa.classList.add("hidden"),H.classList.remove("hidden"),l.focus()};H?.querySelector("[data-confirma-nao]").addEventListener("click",()=>{H.classList.add("hidden"),fa.classList.remove("hidden")});const ha=(a=!1)=>{const o=O()==="proximos",r=o?`“${e.descricao||e.categoria}” e os próximos meses deste grupo`:`“${e.descricao||e.categoria}”`;if(!a&&!confirm(`Excluir ${r}? Esta ação não pode ser desfeita.${e.grupo&&!o?`

Dica: para excluir também os meses seguintes, marque “Este e os próximos”.`:""}`))return;const l=d.excluirLancamento(e,O());Fin.ui.closeModal(),Fin.ui.toast(l>1?`${l} lançamentos excluídos.`:"Lançamento excluído."),Fin.router.refresh()};X.querySelector("[data-delete]")?.addEventListener("click",()=>{if(!ga)return ha();const a=O()==="proximos";xa(`Quer mesmo excluir${a?" este e os próximos meses":""}? Não dá para desfazer.`,"Sim, excluir",()=>ha(!0))}),s.addEventListener("submit",a=>{a.preventDefault();const o=s.querySelector("#form-erro"),r=s.querySelector('input[name="tipo"]:checked').value,l=y.toNumber(t("valorPrevisto").value);let c=t("status").value;const v=R().length?ia():null;v&&c==="parcial"&&l!=null&&d.somaPagamentos(v)>=l-.005&&(c="pago");const M=c==="pago"&&j&&!v,q=c==="aberto"?e?.valorPago??null:v?d.somaPagamentos(v):M?l:y.toNumber(t("valorPago").value),k=c!=="aberto"&&!M&&(q===null||q<=0),C=t("vencimento").value||null,S=t("categoria").value,h=[];(l===null||l<=0)&&h.push("um valor maior que zero"),(!S||S===z)&&h.push("a categoria"),C||h.push("o vencimento"),k&&h.push("o valor pago"),c==="parcial"&&q!=null&&l!=null&&q>=l&&h.push("um valor pago menor que o lançado (ou marque “Pago”)");const L=e?{modo:"nao"}:va(),g=L.modo,T=L.n;if(L.erro&&h.push(`a recorrência (${L.erro.replace(/\.$/,"").toLowerCase()})`),h.length){o.textContent=`Informe ${h.join(", ")}.`,o.classList.remove("hidden"),(L.erro||k||c==="parcial"&&h.some(P=>P.includes("valor pago")))&&(s.querySelector("[data-mais]").open=!0),(!S||S===z)&&J.classList.remove("hidden"),o.scrollIntoView({block:"nearest"});return}if(ga&&!ba)return xa(`Quer mesmo salvar a alteração${O()==="proximos"?" (neste e nos próximos meses)":""}?`,"Sim, salvar",()=>{ba=!0,s.requestSubmit()});const wa=d.categorias().find(P=>P.nome===S),Ca=d.formasPagamento().find(P=>P.nome===t("formaPagamento").value.trim()),ea={tipo:r,descricao:t("descricao").value.trim()||S,categoria:S,categoriaIcone:wa?.icone??e?.categoriaIcone??null,valorPrevisto:l,formaPagamento:t("formaPagamento").value.trim()||null,formaPagamentoIcone:Ca?.icone??null,observacao:t("observacao").value.trim()||null};d.temCasal()&&(ea.pagoPor=r==="despesa"?s.querySelector('input[name="pagoPor"]:checked')?.value||Fin.cofre.membroId():null);const E={...e?{id:e.id}:{origem:"app"},...ea,valorPago:q,status:c,vencimento:C,data:t("data").value||C,dataPagamento:c==="aberto"?e?.dataPagamento??null:v?v.map(P=>P.data).sort().pop():t("dataPagamento").value||i,competencia:t("competencia").value||C.slice(0,7)};g==="nao"&&(E.pagamentos=c==="aberto"?e?.pagamentos??null:v&&v.length>1?v:null);let A,U=null;if(e)Fin.storage.upsert("lancamentos",E),e.grupo&&O()==="proximos"?(d.atualizarProximos(e,ea),A="Lançamento e próximos meses atualizados."):A="Lançamento atualizado.";else if(g!=="nao"){const P=d.criarRepetidos(E,g,T);U=()=>Fin.storage.set("lancamentos",Fin.storage.list("lancamentos").filter(ja=>ja.grupo!==P)),A=g==="parcelado"?`Criado em ${T} parcelas.`:`Recorrente criado: ${T} meses, até ${m.monthShort(m.addMonths(E.competencia,T-1))}.`}else{const P=Fin.storage.upsert("lancamentos",E);U=()=>Fin.storage.remove("lancamentos",P.id),A="Lançamento criado."}const $a=d.faturaParcial(E);Fin.ui.closeModal();const ya=U?{rotulo:"Desfazer",fn:()=>{U(),Fin.ui.toast("Lançamento desfeito."),Fin.router.refresh()}}:null;$a?Fin.ui.toast(`${A} ⚠️ ${m.brl($a.falta)} ficam no rotativo do cartão.`,"erro",ya):Fin.ui.toast(A,"ok",ya),!e&&E.competencia!==Fin.state.mes&&(Fin.state.mes=E.competencia),Fin.router.refresh()})}function sa(u,e){const i=(prompt(`Nome da nova categoria de ${e}:`)||"").trim();if(!i){u.value="";return}const{icone:x,nome:n}=y.splitEmoji(i),p=d.categorias(e).find(b=>y.normalize(b.nome)===y.normalize(n));p||Fin.storage.upsert("categorias",{nome:n,icone:x,tipo:e,classificacao:null,orcamentoMensal:0}),u.innerHTML=V(e,p?p.nome:n)}return Fin.forms.categoriaOptions=V,Fin.forms.novaCategoria=sa,Fin.forms.NOVA_CATEGORIA=z,{open:La}})();
