/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.plano=(()=>{const o={beta:{nome:"Beta",desc:"Fase de testes: tudo liberado, de graça.",tudo:!0},teste:{nome:"Teste completo",desc:"Tudo liberado por 7 dias.",tudo:!0},gratuito:{nome:"Gratuito",desc:"O essencial, com alguns limites.",tudo:!1},premium:{nome:"Premium",desc:"Tudo liberado.",tudo:!0},fundador:{nome:"Fundador",desc:"Premium para sempre, como agradecimento por ajudar a criar o Valoris.",tudo:!0}},a={cartoes:1,orcamento:5,invContas:2,invMetas:2,analisesMeses:3},r={cartoes:{icone:"cartao",cor:"blue",titulo:"Mais de 1 cartão",texto:`No plano Gratuito você usa ${a.cartoes} cartão. Os outros continuam aparecendo e a fatura deles pode ser paga normalmente; só não dá para lançar compras novas neles.`},casal:{icone:"usuario",cor:"violet",titulo:"Finanças a dois",texto:"Compartilhar as finanças com outra pessoa é do Premium. Um Premium vale para a casa: quem você convidar entra de graça."},cotacoes:{icone:"moedas",cor:"amber",titulo:"Cotações automáticas",texto:"No Gratuito, dólar e preços dos ativos não atualizam sozinhos: dá para atualizar 1 vez por dia, tocando no botão."},importarFatura:{icone:"upload",cor:"blue",titulo:"Importar fatura",texto:"Ler a fatura do cartão por PDF ou foto é do Premium. No Gratuito, lance as compras pelo botão Novo."},ia:{icone:"mensagem",cor:"violet",titulo:"Análise com IA",texto:"Os pedidos prontos para a inteligência artificial (análise do mês, onde economizar, dívidas) são do Premium."},orcamento:{icone:"alvo",cor:"emerald",titulo:"Orçamento em mais categorias",texto:`No Gratuito, até ${a.orcamento} categorias têm limite de gastos.`},invContas:{icone:"alta",cor:"amber",titulo:"Mais contas de investimento",texto:`No Gratuito, até ${a.invContas} contas de investimento.`},invMetas:{icone:"alvo",cor:"amber",titulo:"Mais metas",texto:`No Gratuito, até ${a.invMetas} metas.`},analises:{icone:"pizza",cor:"orange",titulo:"Análises de períodos longos",texto:`No Gratuito, as análises vão até ${a.analisesMeses} meses. 6 e 12 meses, ano e período personalizado são do Premium.`},temas:{icone:"paleta",cor:"prim",titulo:"Outras cores do app",texto:"No Gratuito, o app usa a cor Valoris. As outras cores são do Premium."}},m=["Cartões sem limite","Finanças a dois (vale para a casa)","Cotações automáticas","Importar fatura por PDF ou foto","Análise com IA","Orçamento, investimentos e metas sem limite","Análises de qualquer período","Todas as cores do app"],n=()=>`${Fin.PREFIXO}planoSimulado`,p=()=>{try{const e=sessionStorage.getItem(n());return o[e]?e:null}catch{return null}};function s(){const e=p();return e?{id:e,...o[e],simulado:!0}:{id:"beta",...o.beta}}const i=()=>!!s().tudo;function c(e,t=0){if(i())return!0;switch(e){case"cartoes":return t<a.cartoes;case"orcamento":return t<a.orcamento;case"invContas":return t<a.invContas;case"invMetas":return t<a.invMetas;case"analises":return t<=a.analisesMeses;default:return!1}}function x(e){if(i())return!0;const t=`${Fin.PREFIXO}planoUso:${e}`,l=Fin.fmt.todayISO();try{if(localStorage.getItem(t)===l)return!1;localStorage.setItem(t,l)}catch{}return!0}function b(e){if(i())return!0;const t=Fin.storage.list("cartoes");return!t.length||t[0].nome===e}const u=()=>`
    <ul class="grid gap-1.5 text-sm text-slate-700">
      ${m.map(e=>`<li class="flex items-center gap-2"><span class="text-emerald-600" aria-hidden="true">${Fin.icone("check","w-4 h-4")}</span>${e}</li>`).join("")}
    </ul>`;function d(e){const t=r[e]||{icone:"cadeado",cor:"prim",titulo:"Recurso do Premium",texto:"Este recurso é do plano Premium."};Fin.ui.openModal(`
      <div class="p-5 space-y-4">
        <div data-arrastar class="flex items-start gap-3">
          ${Fin.icones.badge(t.icone,t.cor,"w-11 h-11")}
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-amber-700">Premium</p>
            <h2 class="font-semibold text-lg leading-tight">${t.titulo}</h2>
          </div>
          <button type="button" data-close class="icon-btn shrink-0" aria-label="Fechar">✕</button>
        </div>
        <p class="text-[15px] text-slate-700">${t.texto}</p>
        <div class="rounded-2xl bg-slate-50 p-4">
          <p class="text-sm font-semibold mb-2">O Premium inclui</p>
          ${u()}
        </div>
        <p class="text-xs text-slate-500">Seus dados continuam sempre seus: ver, fazer backup, exportar e apagar funcionam em qualquer plano.</p>
        <div class="grid gap-2">
          <button type="button" class="btn btn-primary w-full min-h-[48px]" disabled>Conhecer o Premium (em breve)</button>
          <button type="button" data-close class="btn btn-ghost w-full">Agora não</button>
        </div>
      </div>`,"Recurso do Premium").querySelectorAll("[data-close]").forEach(I=>I.addEventListener("click",Fin.ui.closeModal))}function f(e,t=0){return c(e,t)?!0:(d(e),!1)}function g(e){const t=r[e];return`
      <section class="max-w-xl mx-auto bg-white rounded-2xl shadow-sm p-6 text-center space-y-4">
        <div class="flex justify-center">${Fin.icones.badge(t.icone,t.cor,"w-14 h-14","w-7 h-7")}</div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-amber-700">Premium</p>
          <h1 class="font-semibold text-xl">${t.titulo}</h1>
        </div>
        <p class="text-[15px] text-slate-700">${t.texto}</p>
        <div class="text-left rounded-2xl bg-slate-50 p-4">${u()}</div>
        <a href="#/dashboard" class="btn btn-ghost">Voltar ao Início</a>
      </section>`}function v(){const e=s(),t=e.id==="fundador"?'<span class="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold px-2.5 py-1">★ Fundador</span>':`<span class="inline-flex items-center rounded-full ${e.tudo?"bg-emerald-50 text-emerald-800":"bg-slate-100 text-slate-700"} text-xs font-semibold px-2.5 py-1">${e.nome}</span>`;return`
      <section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5 min-w-0" aria-labelledby="plano-titulo">
        <div class="flex items-center justify-between gap-3 mb-2">
          <h2 id="plano-titulo" class="flex items-center gap-2 font-semibold">${Fin.icones.badge("escudo","prim","w-8 h-8","w-[18px] h-[18px]")} Seu plano</h2>
          ${t}
        </div>
        <p class="text-sm text-slate-600">${e.desc}${e.simulado?" <b>(simulação de teste)</b>":""}</p>
        ${e.id==="beta"?'<p class="text-sm text-slate-500 mt-1">Os planos ainda não começaram. Veja como vão funcionar nos <a href="termos.html" target="_blank" rel="noopener" class="text-prim-700 underline">Termos de uso</a> (item 3).</p>':""}
      </section>`}function h(e){try{e&&o[e]?sessionStorage.setItem(n(),e):sessionStorage.removeItem(n())}catch{}return Fin.router?.refresh?.(),s()}return{LIGADO:!1,DIAS_TESTE:7,LIMITES:a,PLANOS:o,RECURSOS:r,atual:s,pode:c,exigir:f,avisar:d,usarHoje:x,cartaoLiberado:b,bloqueioHTML:g,cartaoHTML:v,simular:h}})();
