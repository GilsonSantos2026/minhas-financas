/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.forms=Fin.forms||{},Fin.forms.categoria=(()=>{const u=Fin.fmt,r=u.esc,c=Fin.finance,y=Fin.parsers,b=Fin.storage,U=["🛒","🍽️","🏠","💡","🚿","🚗","⛽","💊","🎓","👕","🐾","🎮","✈️","📱","💳","🧾","🎁","💰","📈","🏦"];function D({id:N=null,tipo:G="despesa",foco:F=null}={}){const t=N?b.list("categorias").find(e=>e.id===N):null,n=t?.tipo||G,m=t?c.usosCategoria(t.nome,n):{total:0},H=[...new Set(c.categorias().map(e=>e.classificacao).filter(Boolean))].sort(),J=Fin.state.mes,q=t&&n==="despesa"?c.mediaGasto(t.nome,J,3):0,j=c.categorias(n).filter(e=>e.id!==t?.id),v=Fin.ui.openModal(`
      <form id="cat-form" novalidate>
        <div data-arrastar class="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 class="font-semibold text-lg">${t?"Editar categoria":`Nova categoria de ${n}`}</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <div class="px-5 py-4 space-y-4">
          <div class="grid grid-cols-[5rem_1fr] gap-3">
            <label class="field"><span>Ícone</span>
              <input name="icone" class="input text-center text-xl" maxlength="8" value="${r(t?.icone||"")}" placeholder="🙂" /></label>
            <label class="field"><span>Nome *</span>
              <input name="nome" class="input" maxlength="40" value="${r(t?.nome||"")}" placeholder="Ex.: Mercado" /></label>
          </div>

          <section id="afetados" class="hidden rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2" aria-live="polite">
            <p class="text-sm text-amber-900" data-afetados-texto></p>
            <div class="flex flex-wrap items-center gap-2">
              <input type="search" data-afetados-busca class="input !py-1.5 text-sm flex-1 min-w-[10rem]" placeholder="Filtrar por descrição ou cartão" aria-label="Filtrar registros afetados" />
              <button type="button" data-afetados-todos="1" class="text-xs font-medium text-prim-700 hover:underline">Marcar todos</button>
              <button type="button" data-afetados-todos="0" class="text-xs font-medium text-prim-700 hover:underline">Desmarcar todos</button>
            </div>
            <ul class="max-h-64 overflow-y-auto bg-white rounded-lg divide-y divide-slate-100 text-xs text-slate-600" data-afetados-lista></ul>
            <p class="text-xs text-amber-800" data-afetados-nota></p>
          </section>
          <div class="flex flex-wrap gap-1" aria-label="Sugestões de ícone">
            ${U.map(e=>`<button type="button" data-emoji="${e}" class="w-9 h-9 rounded-lg hover:bg-slate-100 text-lg" aria-label="Usar ${e}">${e}</button>`).join("")}
          </div>

          <label class="field"><span>Classificação</span>
            <input name="classificacao" class="input" list="classes-list" maxlength="30" value="${r(t?.classificacao||"")}" placeholder="Ex.: Essencial" />
            <datalist id="classes-list">${H.map(e=>`<option value="${r(e)}"></option>`).join("")}</datalist></label>

          ${n==="despesa"?`
            <label class="flex items-start gap-3 bg-emerald-50/60 rounded-xl p-3 cursor-pointer">
              <input type="checkbox" name="investimento" class="accent-prim-600 w-4 h-4 mt-0.5" ${t?.investimento?"checked":""} />
              <span class="text-sm"><b>📈 É aporte em investimento</b><br>
                <span class="text-slate-500">Não conta como despesa: aparece como “Investido no mês” e é conferido na aba Investimentos.</span></span>
            </label>
            <label class="field"><span>Orçamento mensal (R$)</span>
              <input name="orcamento" class="input tabular-nums" inputmode="decimal" value="${t?.orcamentoMensal?u.decimalInput(t.orcamentoMensal):""}" placeholder="Sem limite" /></label>
            ${q>0?`<button type="button" data-media class="text-sm text-prim-700 font-medium hover:underline -mt-2">
              Usar a média dos últimos 3 meses: ${u.brl(q)}</button>`:""}`:""}

          ${t?`<p class="text-xs text-slate-500">Usada em ${m.total} ${m.total===1?"registro":"registros"}${m.total?". Ao mudar o nome ou o ícone, aparece logo abaixo dele a lista do que será corrigido — desmarque o que não quiser mudar.":"."}</p>`:""}

          <div id="excluir-box" class="hidden bg-rose-50 rounded-xl p-3 space-y-2">
            <p class="text-sm text-rose-800">Esta categoria está em uso. Para onde mover os ${m.total} registros?</p>
            <select name="destino" class="input">${j.map(e=>`<option>${r(e.nome)}</option>`).join("")}</select>
            <button type="button" data-confirmar-exclusao class="btn btn-danger-ghost !bg-white">Mover e excluir</button>
          </div>

          <p id="form-erro" class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
        </div>
        <div data-rodape class="flex items-center gap-2 px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
          ${t?'<button type="button" data-delete class="btn btn-danger-ghost">Excluir</button>':""}
          <span class="flex-1"></span>
          <button type="button" data-close class="btn btn-ghost">Cancelar</button>
          <button type="submit" data-salvar class="btn btn-primary">Salvar</button>
        </div>
      </form>`,t?"Editar categoria":"Nova categoria"),p=v.querySelector("#cat-form"),l=e=>p.elements[e];F&&l(F)&&setTimeout(()=>l(F).focus(),60),v.querySelectorAll("[data-close]").forEach(e=>e.addEventListener("click",Fin.ui.closeModal)),v.querySelectorAll("[data-emoji]").forEach(e=>e.addEventListener("click",()=>{l("icone").value=e.dataset.emoji,E()})),v.querySelector("[data-media]")?.addEventListener("click",()=>{l("orcamento").value=u.decimalInput(q)});const O=e=>{if(e){const o=c.categorias(n).find(s=>s.nome===e);c.moverCategoria(t.nome,e,n,o?.icone)}b.remove("categorias",t.id),Fin.ui.closeModal(),Fin.ui.toast(e?`Categoria excluída; registros movidos para “${e}”.`:"Categoria excluída."),Fin.router.refresh()};v.querySelector("[data-delete]")?.addEventListener("click",()=>{if(m.total===0){confirm(`Excluir a categoria “${t.nome}”?`)&&O(null);return}if(!j.length)return Fin.ui.toast("Crie outra categoria antes de excluir esta.","error");p.querySelector("#excluir-box").classList.remove("hidden")}),v.querySelector("[data-confirmar-exclusao]")?.addEventListener("click",()=>{const e=l("destino").value;confirm(`Mover ${m.total} registros para “${e}” e excluir “${t.nome}”?`)&&O(e)});const C=u.todayISO(),g=(()=>{if(!t||!m.total)return[];const e=c.todos().filter(a=>a.categoria===t.nome&&a.tipo===n).map(a=>({id:a.id,data:String(a.vencimento||a.data||a.competencia||""),desc:a.descricao||t.nome,valor:a.valorPago||a.valorPrevisto||0,onde:""})),o=n==="despesa"?b.list("cartaoCompras").filter(a=>a.categoria===t.nome).map(a=>({id:a.id,data:String(a.data||""),desc:a.descricao||t.nome,valor:a.valor||0,onde:`cartão${a.cartao?` ${a.cartao}`:""}${a.parcela?` · ${a.parcela.atual}/${a.parcela.total}`:""}`})):[],s=a=>a.data>C;return[...e,...o].sort((a,f)=>s(a)-s(f)||(s(a)?a.data.localeCompare(f.data):f.data.localeCompare(a.data)))})(),d=new Set(g.map(e=>e.id)),z=()=>{const{icone:e,nome:o}=y.splitEmoji(l("nome").value);return{nome:(o||"").trim(),icone:l("icone").value.trim()||e||null}},A=()=>{if(!g.length)return null;const{nome:e,icone:o}=z();if(!e)return null;const s=t.nome!==e;return!s&&(t.icone||null)===o?null:{nome:e,icone:o,mudouNome:s}},x=p.querySelector("#afetados"),S=x.querySelector("[data-afetados-lista]"),I=p.querySelector("[data-salvar]"),P=e=>`
      <li><label class="flex items-center gap-2 px-2.5 py-1.5 cursor-pointer hover:bg-slate-50" data-reg-linha="${r(`${e.desc} ${e.onde}`.toLowerCase())}">
        <input type="checkbox" data-reg="${r(e.id)}" class="accent-prim-600 w-4 h-4 shrink-0" ${d.has(e.id)?"checked":""} />
        <span class="tabular-nums text-slate-400 shrink-0 w-[4.6rem]">${e.data?u.date(e.data.slice(0,10)):"—"}</span>
        <span class="flex-1 min-w-0 truncate">${r(e.desc)}${e.onde?` <span class="text-slate-400">· ${r(e.onde)}</span>`:""}</span>
        <span class="tabular-nums shrink-0">${u.brl(e.valor)}</span>
      </label></li>`;if(g.length){const e=g.filter(a=>a.data<=C),o=g.filter(a=>a.data>C),s=a=>`<li class="px-2.5 py-1 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500 sticky top-0">${a}</li>`;S.innerHTML=(e.length?s(`Já lançados (${e.length})`)+e.map(P).join(""):"")+(o.length?s(`Próximos meses (${o.length})`)+o.map(P).join(""):"")}function E(){const e=A();if(x.classList.toggle("hidden",!e),!e){I.textContent="Salvar";return}const o=g.length,s=d.size,a=`${e.icone?`${e.icone} `:""}${e.nome}`;x.querySelector("[data-afetados-texto]").innerHTML=e.mudouNome?`<b>${o} ${o===1?"registro usa":"registros usam"} “${r(t.nome)}”.</b> Os marcados passam para <b>“${r(a)}”</b> — ${s} de ${o} marcados.`:`<b>${o} ${o===1?"registro usa":"registros usam"} esta categoria.</b> Os marcados ficam com o ícone <b>${r(e.icone||"nenhum")}</b> — ${s} de ${o} marcados.`,x.querySelector("[data-afetados-nota]").textContent=s===o?"":e.mudouNome?`Os ${o-s} desmarcados continuam em “${t.nome}”, que fica na lista de categorias; a nova “${e.nome}” é criada ao lado.`:`Os ${o-s} desmarcados continuam com o ícone antigo.`,I.textContent=s?`Salvar e corrigir ${s}`:"Salvar sem corrigir"}p.addEventListener("input",e=>{(e.target.name==="nome"||e.target.name==="icone")&&E()}),S.addEventListener("change",e=>{const o=e.target.closest("[data-reg]");o&&(o.checked?d.add(o.dataset.reg):d.delete(o.dataset.reg),E())}),x.querySelector("[data-afetados-busca]").addEventListener("input",e=>{const o=e.target.value.trim().toLowerCase();S.querySelectorAll("[data-reg-linha]").forEach(s=>{s.parentElement.hidden=!!o&&!s.dataset.regLinha.includes(o)})}),x.querySelectorAll("[data-afetados-todos]").forEach(e=>e.addEventListener("click",()=>{const o=e.dataset.afetadosTodos==="1";S.querySelectorAll("[data-reg]").forEach(s=>{s.closest("li").hidden||(s.checked=o,o?d.add(s.dataset.reg):d.delete(s.dataset.reg))}),E()})),p.addEventListener("submit",e=>{e.preventDefault();const o=p.querySelector("#form-erro"),{nome:s,icone:a}=z(),f=l("orcamento")?y.toNumber(l("orcamento").value)??0:0,T=c.categorias(n).some(h=>h.id!==t?.id&&y.normalize(h.nome)===y.normalize(s));if(!s||T||f<0){o.textContent=s?T?"Já existe uma categoria com esse nome.":"O orçamento não pode ser negativo.":"Informe o nome.",o.classList.remove("hidden");return}const R=Fin.storage.list("categorias").filter(h=>h.id!==t?.id&&h.orcamentoMensal>0).length;if(f>0&&!(t?.orcamentoMensal>0)&&!Fin.plano.exigir("orcamento",R))return;const k=n==="despesa"?!!l("investimento")?.checked:void 0,L={nome:s,icone:a,tipo:n,classificacao:l("classificacao").value.trim()||null,orcamentoMensal:f,...n==="despesa"?{investimento:k}:{}},M=t?A():null,i=d.size,w=g.length;let $;t?M?.mudouNome&&i<w?(b.upsert("categorias",L),i&&c.moverCategoria(t.nome,s,n,a,new Set(d)),$=`Categoria “${s}” criada${i?` com ${i} ${i===1?"registro corrigido":"registros corrigidos"}`:""}. ${w-i} ${w-i===1?"continua":"continuam"} em “${t.nome}”.`):(b.upsert("categorias",{id:t.id,...L}),M&&i&&c.moverCategoria(t.nome,s,n,a,i===w?null:new Set(d)),$=M&&i?`Categoria atualizada e ${i===1?"1 registro corrigido":`${i} registros corrigidos`}.`:"Categoria atualizada.",n==="despesa"&&!!t.investimento!==k&&m.total>0&&($+=k?" Os lançamentos dela agora contam como aporte, não como despesa.":" Os lançamentos dela voltam a contar como despesa.")):(b.upsert("categorias",L),$="Categoria criada."),Fin.ui.closeModal(),Fin.ui.toast($),Fin.router.refresh()})}return{open:D}})();
