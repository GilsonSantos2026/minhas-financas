/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.ia=(()=>{const i=()=>Fin.finance,p=()=>Fin.fmt,C=s=>Fin.fmt.esc(s),f=[["ChatGPT","https://chatgpt.com/"],["Gemini","https://gemini.google.com/app"]],o=s=>Fin.fmt.brl(s||0),v=s=>`${Math.round((s||0)*100)}%`,u=s=>Fin.fmt.monthLong(s).toLowerCase();function g(){return i().pessoaAtiva?.()?"(Visão de uma pessoa do casal: receitas dela, o que ela pagou e a parte dela nas contas dos dois.)":""}function w(s,a=8){const r=i().porCategoriaDetalhada(s),n=r.reduce((c,l)=>c+l.total,0)||1;return r.slice(0,a).map(c=>`- ${c.categoria}: ${o(c.total)} (${v(c.total/n)})`).join(`
`)}function b(s=Fin.state.mes){const a=i().resumo(s),r=i().resumo(p().addMonths(s,-1)),n=p().todayISO(),c=i().lancamentos().filter(t=>t.tipo==="despesa"&&i().statusEfetivo(t)==="atrasado"&&(i().dataRef(t)||"")<n);let l=null;try{l=i().rotativo(null,s)}catch{}let d=null;try{d=Fin.saude.dividas(s)}catch{}let e=null;try{e=Fin.reserva.calcular()}catch{}return`Você é um consultor de finanças pessoais que explica de forma simples e prática.
Analise o resumo do meu orçamento familiar (valores em reais) e responda em português, em tópicos curtos:
1) os 3 pontos que mais merecem atenção;
2) 3 ações práticas para o próximo mês, com valores aproximados;
3) uma meta simples e mensurável para o próximo mês.
Não recomende produtos financeiros específicos.

${g()}
Mês: ${u(s)}
Receitas: ${o(a.receitas)} (recebido até agora ${o(a.recebido)})
Despesas: ${o(a.despesas)} (pago até agora ${o(a.pago)})
Saldo do mês: ${o(a.saldo)}
Despesas consomem ${a.receitas?v(a.despesas/a.receitas):"—"} da receita
Mês anterior: receitas ${o(r.receitas)}, despesas ${o(r.despesas)}, saldo ${o(r.saldo)}
Contas em aberto no mês: ${a.qtdAPagar} (${o(a.aPagar)}); atrasadas no total: ${c.length}${c.length?` (${o(c.reduce((t,m)=>t+i().valor(m),0))})`:""}
${a.aportes?`Investido no mês: ${o(a.aportes)}
`:""}
Maiores despesas por categoria no mês (cartão já detalhado pelas compras):
${w(s)}
${l?`
Cartão de crédito (12 meses): ${l.parciais.length} fatura(s) paga(s) abaixo do total (rotativo), faltando ${o(l.totalFalta)}; juros/IOF/multas lidos nas faturas: ${o(l.encargos)}`:""}
${d?`Dívidas: parcelas e juros consomem ${o(d.servico)} no mês; saldo de parcelas a vencer: ${o(d.estoque)}`:""}
${e?.base?`Reserva de emergência: tem ${o(e.atual)}; ideal ${o(e.ideal)} (${e.mesesAlvo} meses de custo essencial de ${o(e.base)})`:""}`.replace(/\n{3,}/g,`

`).trim()}function h(s=Fin.state.mes){const a=[1,2,3].map(e=>p().addMonths(s,-e)).reverse(),r=new Map;for(const e of a)for(const t of i().porCategoriaDetalhada(e))r.set(t.categoria,(r.get(t.categoria)||0)+t.total);const n=new Map(i().categorias("despesa").map(e=>[e.nome,e.classificacao||""])),c=[...r.entries()].sort((e,t)=>t[1]-e[1]).slice(0,15).map(([e,t])=>`- ${e}${n.get(e)?` [${n.get(e)}]`:""}: média ${o(t/3)}/mês`),l=a.reduce((e,t)=>e+i().resumo(t).receitas,0)/3,d=a.reduce((e,t)=>e+i().resumo(t).despesas,0)/3;return`Você é um consultor de finanças pessoais. Com base na média dos meus gastos dos últimos 3 meses (${u(a[0])} a ${u(a[2])}), em reais:
1) aponte onde dá para economizar mais, com valor estimado por mês em cada item;
2) separe o que é corte fácil, médio e difícil;
3) monte um plano de 30 dias para começar.
Responda em português, em tópicos curtos. Não recomende produtos financeiros específicos.

${g()}
Receita média: ${o(l)}/mês · Despesa média: ${o(d)}/mês
Gastos por categoria (entre colchetes, a classificação que eu uso):
${c.join(`
`)}`.replace(/\n{3,}/g,`

`).trim()}function x(s=Fin.state.mes){let a=null;try{a=Fin.saude.dividas(s)}catch{}let r=null;try{r=i().rotativo(null,s)}catch{}const n=i().resumo(s),c=p().todayISO(),l=new Map;for(const e of i().lancamentos()){if(e.tipo!=="despesa"||e.recorrencia!=="parcelado"||i().isPago(e)||(i().dataRef(e)||"")<c.slice(0,7))continue;const t=e.descricao||e.categoria,m=l.get(t)||{parcela:i().valor(e),restantes:0,total:0};m.restantes++,m.total+=i().valor(e),l.set(t,m)}const d=[...l.entries()].sort((e,t)=>t[1].total-e[1].total).slice(0,12).map(([e,t])=>`- ${e}: ${t.restantes} parcela(s) de ~${o(t.parcela)} (falta ${o(t.total)})`);return`Você é um consultor de finanças pessoais especializado em sair das dívidas. Com os dados abaixo (em reais):
1) diga qual dívida atacar primeiro e por quê (compare os métodos avalanche e bola de neve para o meu caso);
2) monte um plano mês a mês para os próximos 6 meses;
3) diga o que perguntar ao banco para renegociar (ex.: custo efetivo total).
Responda em português, em tópicos curtos. Não recomende bancos ou produtos específicos.

${g()}
Receita do mês: ${o(n.receitas)} · Despesas do mês: ${o(n.despesas)}
${a?`Parcelas e juros que vencem no mês: ${o(a.servico)} (cartão parcelado ${o(a.parcCartao)}, outras parcelas ${o(a.parcOutras)}, rotativo ${o(a.rotativo)}, juros ${o(a.juros)})
Saldo ainda a pagar em parcelas: cartão ${o(a.futCartao)}, outras ${o(a.futOutras)}`:""}
${r?`Faturas pagas abaixo do total nos últimos 12 meses: ${r.parciais.length} (faltou ${o(r.totalFalta)}); juros/IOF/multas: ${o(r.encargos)}`:""}
Parcelamentos em andamento:
${d.join(`
`)||"- nenhum lançamento parcelado em aberto"}`.replace(/\n{3,}/g,`

`).trim()}const $=[{id:"mes",titulo:"Análise do mês",desc:"Pontos de atenção, 3 ações e uma meta",fn:b,icone:"pulso"},{id:"economizar",titulo:"Onde economizar",desc:"Média de 3 meses por categoria",fn:h,icone:"alvo"},{id:"dividas",titulo:"Dívidas e parcelas",desc:"Plano para quitar e o que negociar",fn:x,icone:"balanca"}];function D(s){return`Abaixo está o texto extraído do PDF da fatura do meu cartão de crédito.
Liste TODOS os lançamentos da fatura (compras, parcelas, estornos/créditos, juros, IOF, multas e anuidade), um por linha, EXATAMENTE neste formato e sem mais nada:
DD/MM;DESCRIÇÃO;VALOR
Regras:
- VALOR com vírgula nos centavos e sem "R$" (ex.: 1.234,56). Estornos e créditos com sinal de menos (ex.: -50,00).
- Se for parcela, mantenha na descrição como "LOJA 03/10".
- Inclua o pagamento da fatura anterior como uma linha com a descrição "PAGAMENTO".
- Não inclua totais, limites, resumos nem cabeçalhos. Não use markdown nem tabela.

TEXTO DA FATURA:
${s}`}async function F(s){try{return await navigator.clipboard.writeText(s),!0}catch{return!1}}function q(s,{linhas:a=10}={}){return`
      <textarea data-ia-texto class="input font-mono !text-xs leading-relaxed" rows="${a}" spellcheck="false" aria-label="Texto para a IA">${C(s)}</textarea>
      <p class="text-xs text-slate-500">Revise e apague o que não quiser mandar. Vão só valores, categorias e datas — sem nomes, contas ou números de cartão.</p>
      <div class="grid grid-cols-3 gap-2">
        <button type="button" data-ia-copiar class="btn btn-primary !px-2">Copiar</button>
        ${f.map(([r,n])=>`<a href="${n}" target="_blank" rel="noopener" class="btn btn-ghost !px-2">Abrir ${r}</a>`).join("")}
      </div>
      <p class="text-[11px] text-slate-400">Dica: toque em Copiar, abra o ChatGPT ou o Gemini e cole (segure o dedo na caixa de mensagem → Colar).</p>`}function A(s){s.querySelector("[data-ia-copiar]")?.addEventListener("click",async()=>{const a=await F(s.querySelector("[data-ia-texto]").value);Fin.ui.toast(a?"Copiado! Agora cole no ChatGPT ou no Gemini.":"Não deu para copiar: selecione o texto e copie.",a?"ok":"error")})}function M(s="mes"){const a=Fin.ui.openModal(`
      <div class="p-5 space-y-4">
        <div data-arrastar class="flex items-center justify-between gap-2">
          <h2 class="font-semibold text-lg flex items-center gap-2">${Fin.icones.badge("mensagem","violet","w-8 h-8","w-[18px] h-[18px]")} Perguntar à IA</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <p class="text-sm text-slate-600">Use o <b>ChatGPT</b> ou o <b>Gemini</b> que você já tem, de graça: o app monta o pedido com os seus números, você copia e cola lá. Nada é enviado pelo app.</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="O que perguntar">
          ${$.map(n=>`<label class="quem-opcao"><input type="radio" name="ia-pedido" value="${n.id}" ${n.id===s?"checked":""}>
            <span class="!items-start">${Fin.icone(n.icone,"w-5 h-5 shrink-0 mt-0.5")}<span class="min-w-0"><span class="block">${n.titulo}</span><span class="block text-[11px] font-normal text-slate-500">${n.desc}</span></span></span></label>`).join("")}
        </div>
        <div data-ia-bloco class="space-y-3"></div>
      </div>`,"Perguntar à IA"),r=()=>{const n=a.querySelector("[name=ia-pedido]:checked").value;let c;try{c=$.find(l=>l.id===n).fn()}catch(l){console.warn("[ia]",l),c="Não foi possível montar o resumo (faltam dados)."}a.querySelector("[data-ia-bloco]").innerHTML=q(c),A(a)};a.addEventListener("change",n=>{n.target.name==="ia-pedido"&&r()}),a.querySelector("[data-close]").addEventListener("click",()=>Fin.ui.closeModal()),r()}return{PEDIDOS:$,analiseMes:b,economizar:h,dividas:x,pedidoFatura:D,blocoCopia:q,ligarCopia:A,copiar:F,abrirAnalise:M,LINKS:f}})();
