/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.dashboard=(()=>{const r=Fin.fmt,v=r.esc,d=Fin.finance,g=(a,t,e,i="")=>`<h2 class="font-semibold flex items-center gap-2 ${i}">${Fin.icones.badge(a,t,"w-7 h-7","w-4 h-4")}${e}</h2>`,b=(a,t="")=>`<section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5 min-w-0 ${t}">${a}</section>`;function y(){const a=Fin.membros;if(!a)return"";const t=a.atual(),e=a.primeiroNome(t),i=new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"}),s=!t.nome&&!t.foto;return`
      <div class="flex items-center gap-3">
        <a href="#/configuracoes" class="shrink-0 rounded-full" aria-label="Perfil e configurações">${a.avatar(t,{tam:"w-11 h-11",txt:"text-sm",anel:"ring-2 ring-white shadow-sm"})}</a>
        <div class="min-w-0 flex-1">
          <p class="text-lg font-semibold text-slate-900 leading-tight truncate">${a.saudacao()}${e?`, ${r.esc(e)}`:""}!</p>
          <p class="text-xs text-slate-500 saudacao-data">${i}${s?' · <a href="#/configuracoes" class="text-prim-700 font-medium hover:underline">Pôr seu nome e foto</a>':""}</p>
        </div>
      </div>`}function k(a){if(a.length<2)return"";const t=112,e=48,i=4,s=Math.min(...a),c=Math.max(...a),p=c-s||1,l=a.map((m,o)=>[i+o*(t-2*i)/(a.length-1),e-i-(m-s)/p*(e-2*i)]),u=s<0&&c>0?e-i-(0-s)/p*(e-2*i):null,[h,n]=l[l.length-1];return`<svg viewBox="0 0 ${t} ${e}" class="hero-spark w-24 h-11 sm:w-28 sm:h-12 shrink-0" aria-hidden="true" focusable="false">
      ${u!=null?`<line x1="${i}" x2="${t-i}" y1="${u}" y2="${u}" stroke="rgba(255,255,255,.35)" stroke-dasharray="3 3"/>`:""}
      <polyline points="${l.map(([m,o])=>`${m.toFixed(1)},${o.toFixed(1)}`).join(" ")}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
      ${l.slice(0,-1).map(([m,o])=>`<circle cx="${m.toFixed(1)}" cy="${o.toFixed(1)}" r="2" fill="currentColor" opacity=".75"/>`).join("")}
      <circle cx="${h.toFixed(1)}" cy="${n.toFixed(1)}" r="3.6" fill="currentColor"/>
    </svg>`}function $(a,t,e,i,s,c="text-slate-900"){return`
      <div class="flex flex-col sm:flex-row items-start gap-1.5 sm:gap-2.5 min-w-0">
        <span class="w-8 h-8 sm:w-9 sm:h-9 rounded-full grid place-items-center text-white shrink-0 ${t}" aria-hidden="true">${Fin.icone(a,"w-4 h-4 sm:w-[18px] sm:h-[18px]")}</span>
        <div class="min-w-0">
          <div class="text-[11px] sm:text-xs text-slate-500">${e}</div>
          <div class="text-[13px] sm:text-base font-semibold tabular-nums whitespace-nowrap ${c}">${i}</div>
          <div class="text-[11px] text-slate-500 truncate">${s}</div>
        </div>
      </div>`}function M(a,t){const e=a.saldo<0,i=d.historico(t,6),s=i.length>1?i[i.length-2].saldo:null,c=s?(a.saldo-s)/Math.abs(s):null,p=c==null||!Number.isFinite(c)?"":`<span class="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 font-medium">${c>=0?"▲":"▼"} ${Math.round(Math.abs(c)*100)}% vs. mês passado</span>`,l=a.receitas>0?a.despesas/a.receitas:null,u=l==null?"#94a3b8":l>1?"#d03b3b":l>.9?"#fab219":"#0ca30c",h=l==null?"sem receitas lançadas no mês":l>1?'<span class="text-rose-700">! gastando mais do que ganha</span>':`sobra ${Math.round((1-l)*100)}% da receita`,n=a.atrasadas?`<span class="text-rose-700 font-medium">! ${a.atrasadas} atrasada${a.atrasadas>1?"s":""}</span>`:a.qtdAPagar?`${a.qtdAPagar} ${a.qtdAPagar===1?"conta":"contas"}`:"tudo pago ✓",m=Fin.inv?.temDados()?Fin.inv.resumo().patrimonio:null;return`
      <section class="rounded-2xl shadow-sm overflow-hidden bg-white min-w-0" data-hero>
        <div class="hero-topo text-white px-4 sm:px-5 pt-4 pb-4">
          <div class="flex items-start gap-3">
            <div class="flex-1 min-w-0">
              <div class="hero-rotulo text-[11px] font-semibold uppercase tracking-wider text-white/75">Resultado do mês</div>
              <div class="text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums mt-0.5">${r.brl(a.saldo)}</div>
              <div class="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-xs">
                ${e?'<span class="inline-flex items-center gap-1 rounded-full bg-rose-500/90 px-2 py-0.5 font-medium">! saldo negativo</span>':""}
                ${p}
                <span class="text-white/80" title="recebido ${r.brl(a.recebido)} − pago ${r.brl(a.pago)}">realizado <b class="text-white tabular-nums">${r.brl(a.saldoRealizado)}</b></span>
              </div>
            </div>
            ${k(i.map(o=>o.saldo))}
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2 sm:gap-4 px-4 sm:px-5 pt-4">
          ${$("entrada","bg-emerald-600","Entradas",r.brl(a.receitas),`recebido ${r.brl(a.recebido)}`,"text-emerald-700")}
          ${$("saida","bg-rose-600","Saídas",r.brl(a.despesas),`pago ${r.brl(a.pago)}`,"text-rose-700")}
          ${$("relogio",a.atrasadas?"bg-rose-500":"bg-amber-500","A pagar",r.brl(a.aPagar),n)}
        </div>
        <div class="px-4 sm:px-5 pb-4 mt-4">
          <div class="h-1.5 rounded-full bg-slate-100 overflow-hidden" role="meter" aria-label="Despesas sobre a receita" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${l==null?0:Math.round(l*100)}">
            <div class="h-full rounded-full" style="width:${l==null?0:Math.min(100,l*100)}%;background:${u}"></div>
          </div>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500">
            <span>Despesas = <b class="text-slate-700">${l==null?"—":`${Math.round(l*100)}%`}</b> da receita · ${h}</span>
            ${a.aportes>0?`<span class="inline-flex items-center gap-1">${Fin.icone("cofrinho","w-4 h-4 text-emerald-700")} investido no mês <b class="text-emerald-700 tabular-nums">${r.brl(a.aportes)}</b></span>`:""}
            ${m!=null?`<a href="#/investimentos" class="inline-flex items-center gap-1 text-prim-700 font-medium hover:underline md:ml-auto">${Fin.icone("alta","w-4 h-4")} patrimônio <span class="tabular-nums">${r.brl(m)}</span> →</a>`:""}
          </div>
        </div>
      </section>`}function S(){const a=Fin.educacao;let t="";if(a){const i=new Set(Fin.storage.prefs().guiasLidos||[]),s=a.ARTIGOS.find(p=>!i.has(p.id)),c=a.ARTIGOS.filter(p=>i.has(p.id)).length;t=`
        <a href="#/educacao${s?`?artigo=${s.id}`:""}" class="flex items-center gap-3 bg-white rounded-2xl shadow-sm p-3 hover:ring-2 hover:ring-emerald-200 min-w-0">
          ${Fin.icones.badge("livro","emerald","w-10 h-10","w-5 h-5")}
          <span class="flex-1 min-w-0">
            <span class="block text-sm font-semibold">Aprender <span class="text-[11px] font-normal text-slate-500">· ${c} de ${a.ARTIGOS.length} guias lidos</span></span>
            <span class="block text-xs text-slate-500 truncate">${s?`Próximo: ${v(s.titulo)} · ${s.min} min`:"Todos os guias lidos ✓ — reveja quando quiser"}</span>
            <span class="block h-1 rounded-full bg-slate-100 mt-1.5 overflow-hidden" aria-hidden="true"><span class="block h-full bg-emerald-500 rounded-full" style="width:${c/a.ARTIGOS.length*100}%"></span></span>
          </span>
        </a>`}const e=Fin.ia?`
      <button type="button" data-act="perguntar-ia" class="flex items-center gap-3 bg-white rounded-2xl shadow-sm p-3 hover:ring-2 hover:ring-violet-200 text-left min-w-0">
        ${Fin.icones.badge("mensagem","violet","w-10 h-10","w-5 h-5")}
        <span class="flex-1 min-w-0">
          <span class="block text-sm font-semibold">Perguntar à IA</span>
          <span class="block text-xs text-slate-500 truncate">Análise do mês no ChatGPT ou Gemini, sem custo</span>
        </span>
      </button>`:"";return t||e?`<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${t}${e}</div>`:""}function A(){const a=r.todayISO(),t=new Date;t.setDate(t.getDate()+30);const e=`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`,i=d.catsInvestimento(),s=d.lancamentos().filter(n=>n.tipo==="despesa"&&!d.isPago(n)&&!d.ehAporte(n,i)&&d.dataRef(n)&&d.dataRef(n)<=e).filter(n=>d.dataRef(n)>=a||d.statusEfetivo(n)==="atrasado").sort((n,m)=>d.dataRef(n).localeCompare(d.dataRef(m))),c=n=>Math.max(0,d.valor(n)-(n.status==="parcial"&&n.valorPago||0)),p=s.reduce((n,m)=>n+c(m),0),l=s.filter(n=>d.dataRef(n)<a),u=["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"],h=s.slice(0,7).map(n=>{const m=d.dataRef(n),o=m<a;return`
        <li class="flex items-center gap-3 py-2.5 cursor-pointer" data-edit="${n.id}" role="button" tabindex="0" aria-label="Editar ${v(n.descricao||n.categoria)}">
          <span class="w-11 shrink-0 rounded-xl text-center py-1 ${o?"bg-rose-50 text-rose-700":m===a?"bg-amber-50 text-amber-800":"bg-slate-50 text-slate-700"}">
            <span class="block text-base font-semibold leading-tight tabular-nums">${m.slice(8,10)}</span>
            <span class="block text-[10px] font-medium tracking-wide">${u[Number(m.slice(5,7))-1]}</span>
          </span>
          <span class="flex-1 min-w-0">
            <span class="flex items-center gap-1.5 text-sm font-medium min-w-0">${Fin.ui.autorMini(n)}<span class="truncate">${v(n.descricao||n.categoria)}</span></span>
            <span class="block text-xs ${o?"text-rose-700":"text-slate-500"} truncate">${o?`atrasada · ${v(n.categoria||"")}`:m===a?"vence hoje":v([n.categoria,n.formaPagamento].filter(Boolean).join(" · "))}</span>
          </span>
          <span class="text-sm font-semibold tabular-nums text-rose-700 shrink-0">− ${r.brl(c(n))}</span>
        </li>`}).join("");return b(`
      <div class="flex items-start justify-between gap-2 mb-1">
        <div>${g("calendario","amber","Próximos 30 dias")}
          <p class="text-xs text-slate-500 mt-0.5">compromissos já conhecidos${l.length?` · <span class="text-rose-700 font-medium">${l.length} atrasada${l.length>1?"s":""}</span>`:""}</p></div>
        ${s.length?`<div class="text-right shrink-0"><div class="text-[11px] text-slate-500">total</div><div class="text-sm font-semibold tabular-nums">${r.brl(p)}</div></div>`:""}
      </div>
      ${s.length?`<ul class="divide-y divide-slate-100">${h}</ul>
        ${s.length>7?`<a href="#/lancamentos" data-filtro-status="pendentes" class="block text-center text-sm text-prim-700 font-medium pt-3 hover:underline">Ver todas (${s.length})</a>`:""}`:'<p class="text-sm text-slate-500 py-3">Nada a pagar nos próximos 30 dias. 🎉</p>'}`)}function j(a,t){if(!a.length)return'<p class="text-sm text-slate-500 py-3">Nenhuma conta em aberto neste mês. 🎉</p>';const e=a.slice(0,6).map(s=>`
      <li class="flex items-center gap-3 py-2.5" data-edit="${s.id}" role="button" tabindex="0">
        ${Fin.ui.catIcon(s.categoriaIcone,s.categoria,s.tipo)}
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium truncate">${v(s.descricao||s.categoria)}</div>
          <div class="text-xs text-slate-500">vence ${r.date(d.dataRef(s))}</div>
        </div>
        <div class="text-right shrink-0">
          <div class="text-sm font-semibold tabular-nums">${s.status==="parcial"?`<span class="text-xs font-normal text-slate-500">falta</span> ${r.brl(d.valor(s)-(s.valorPago||0))}`:r.brl(d.valor(s))}</div>
          ${Fin.ui.statusPill(s)}
        </div>
      </li>`).join(""),i=a.length>6?`<a href="#/lancamentos" data-filtro-status="pendentes" class="block text-center text-sm text-prim-700 font-medium pt-3 hover:underline">Ver todas (${a.length})</a>`:"";return`<ul class="divide-y divide-slate-100">${e}</ul>${i}`}function R(a){const t=Fin.state.detalharFaturas?d.porCategoriaDetalhada(a):d.porCategoria(a,"despesa");if(!t.length)return'<p class="text-sm text-slate-500 py-3">Sem despesas neste mês.</p>';const e=t.reduce((s,c)=>s+c.total,0);let i=t.map(s=>({label:s.categoria,icone:s.icone,total:s.total}));if(i.length>7){const s=i.slice(6).reduce((c,p)=>c+p.total,0);i=[...i.slice(0,6),{label:`Outras (${t.length-6})`,icone:"",total:s}]}return Fin.charts.hbars(i,{total:e})}function D(a){const t=d.faturas(a);return t.length?`
      <ul class="divide-y divide-slate-100">${t.map(e=>`
        <li><a href="#/cartoes" data-ir-cartao="${v(e.cartao)}" class="flex items-center gap-3 py-2.5 hover:bg-slate-50 rounded-lg">
          ${Fin.icones.badge("cartao","violet","w-10 h-10")}
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate">${v(e.cartao)}</div>
            <div class="text-xs text-slate-500">${e.qtd} ${e.qtd===1?"compra":"compras"}</div>
          </div>
          <div class="text-sm font-semibold tabular-nums">${r.brl(e.total)}</div>
          <span class="text-slate-300" aria-hidden="true">›</span>
        </a></li>`).join("")}
      </ul>
      <p class="text-xs text-slate-400 mt-2">O valor já entra nas despesas pelo lançamento de pagamento da fatura.</p>`:'<p class="text-sm text-slate-500 py-3">Nenhuma compra no cartão com fatura neste mês.</p>'}function E(a){const t=d.orcamento(a);if(!t.itens.length)return b(`
        <div class="flex flex-wrap items-center gap-3">
          ${Fin.icones.badge("alvo","orange","w-10 h-10")}
          <div class="flex-1 min-w-[12rem]">
            <h2 class="font-semibold">Orçamento</h2>
            <p class="text-sm text-slate-500">Defina limites mensais por categoria e acompanhe aqui.</p>
          </div>
          <a href="#/orcamento" class="btn btn-ghost">Definir orçamentos</a>
        </div>`);const e=t.itens.slice(0,4);return b(`
      <div class="flex items-center justify-between gap-3 mb-1">
        ${g("alvo","orange","Orçamento do mês")}
        <a href="#/orcamento" class="text-sm text-prim-700 font-medium hover:underline">Ver tudo (${t.itens.length})</a>
      </div>
      <ul class="grid md:grid-cols-2 md:gap-x-8 divide-y md:divide-y-0 divide-slate-100">${e.map(Fin.pages.orcamento.linhaHTML).join("")}</ul>`)}const w=[{key:"parcCartao",label:"Parcelas no cartão",color:"#eb6834"},{key:"parcOutras",label:"Outras parcelas",color:"#f2a65a"},{key:"rotativo",label:"Rotativo do cartão",color:"#d03b3b"}];function q(a){if(!a.length)return"";const t=a[a.length-1],e=a[Math.max(0,a.length-4)],i=t.score-e.score,s=a.length-1-Math.max(0,a.length-4),c=s>0&&i!==0?`<span class="${i>0?"text-emerald-800":"text-rose-700"} font-medium">${i>0?"▲":"▼"} ${Math.abs(i)} ponto${Math.abs(i)>1?"s":""}</span> em ${s} ${s>1?"meses":"mês"}`:s>0?"estável nos últimos meses":"",p=t.faixa,l=Fin.state.saudeVista||"indice",u=t.dividas,h=t.pilares.map(o=>`
      <li class="py-2">
        <div class="flex items-center gap-2 text-sm">
          <span aria-hidden="true">${o.icone}</span>
          <span class="flex-1 min-w-0 font-medium truncate">${v(o.nome)}</span>
          <span class="pill ${o.faixa.classe}"><span aria-hidden="true">${o.faixa.icone}</span>${Math.round(o.pts)}/${Fin.saude.MAX}</span>
        </div>
        <div class="h-1.5 rounded-full bg-slate-100 mt-1.5 overflow-hidden" aria-hidden="true">
          <div class="h-full rounded-full" style="width:${o.pts/Fin.saude.MAX*100}%;background:${o.faixa.cor}"></div>
        </div>
        <div class="text-xs text-slate-500 mt-1">${o.texto}</div>
      </li>`).join(""),n=["gasto","contas","dividas","reserva"].filter(o=>!t.pilares.some(f=>f.id===o)),m={gasto:"gasto × renda (sem receitas no mês)",contas:"contas em dia (nenhuma venceu ainda)",dividas:"dívidas (sem receitas no mês)",reserva:"reserva de emergência"};return b(`
      <div class="flex items-start justify-between gap-3 flex-wrap">
        <div>
          ${g("pulso","emerald","Saúde financeira")}
          <p class="text-xs text-slate-500">Índice de 0 a 100 · ${r.monthLong(t.ym)}</p>
        </div>
        <div class="seg seg-neutro w-full sm:w-64" role="radiogroup" aria-label="Visão">
          <label><input type="radio" name="saude-vista" value="indice" ${l==="indice"?"checked":""}><span>Índice</span></label>
          <label><input type="radio" name="saude-vista" value="divida" ${l==="divida"?"checked":""}><span>Endividamento</span></label>
        </div>
      </div>

      ${l==="indice"?`
      <div class="grid grid-cols-1 md:grid-cols-[11rem_1fr] gap-4 mt-3 items-start">
        <div class="flex md:flex-col items-center md:items-start gap-3 md:gap-1">
          <div class="text-5xl font-semibold tracking-tight tabular-nums">${t.score}<span class="text-lg text-slate-400 font-normal">/100</span></div>
          <div class="space-y-1">
            <span class="pill ${p.classe} !text-xs"><span aria-hidden="true">${p.icone}</span>${p.nome}</span>
            ${c?`<div class="text-xs text-slate-500">${c}</div>`:""}
          </div>
        </div>
        <ul class="divide-y divide-slate-100 min-w-0">${h}</ul>
      </div>
      ${n.length?`<p class="text-xs text-slate-400 mt-1">Fora do cálculo neste mês: ${n.map(o=>m[o]).join(", ")}.${n.includes("reserva")?' <a href="#/investimentos?aba=reserva" class="text-prim-700 font-medium hover:underline">Criar reserva</a>':""}</p>`:""}
      <div id="chart-saude" class="w-full min-w-0 overflow-hidden mt-3"></div>
      <div class="flex flex-wrap gap-4 text-xs text-slate-600 mt-1">${Fin.saude.FAIXAS.map(o=>`
        <span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm" style="background:${o.cor};opacity:.6"></span><span aria-hidden="true">${o.icone}</span>${o.nome} ${o.id==="bom"?"(80+)":o.id==="atencao"?"(40–79)":"(até 39)"}</span>`).join("")}
      </div>`:`
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 text-sm">
        <div><div class="text-xs text-slate-500">Dívida a vencer</div><div class="text-lg font-semibold tabular-nums">${r.brl(u.estoque)}</div></div>
        <div><div class="text-xs text-slate-500">Parcelas + juros no mês</div><div class="text-lg font-semibold tabular-nums">${r.brl(u.servico)}</div></div>
        <div class="col-span-2 sm:col-span-1"><div class="text-xs text-slate-500">Comprometimento da renda</div>
          <div class="text-lg font-semibold tabular-nums ${t.comprometimento>.3?"text-rose-700":""}">${t.comprometimento==null?"—":`${Math.round(t.comprometimento*100)}%`}
          <span class="text-xs font-normal text-slate-500">${t.comprometimento==null?"":t.comprometimento>.3?"! acima de 30%":"✓ até 30%"}</span></div></div>
      </div>
      <div class="flex items-start justify-between gap-3 flex-wrap mt-3">${Fin.charts.legend(w)}</div>
      <div id="chart-saude" class="w-full min-w-0 overflow-hidden mt-2"></div>
      <p class="text-xs text-slate-400 mt-1">Barras: quanto ainda se devia no fim de cada mês — parcelas já assumidas (cartão e lançamentos parcelados) + saldo que ficou no rotativo.</p>`}

      <details class="mt-3">
        <summary class="text-xs text-slate-500 flex items-center gap-1"><span class="chev">▸</span> Como o índice é calculado</summary>
        <div class="text-xs text-slate-600 mt-2 space-y-1.5">
          <p>Inspirado no <b>FinHealth Score</b> (Financial Health Network), que mede a saúde financeira por comportamentos — gastar, poupar e pedir emprestado — e não pelo tamanho da renda. Cada pilar vale até 25 pontos:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li><b>Gasta menos do que ganha:</b> nota máxima guardando 20% da renda ou mais (regra 50/30/20); zero com gasto 10% acima da renda. Aportes em investimento contam como dinheiro guardado.</li>
            <li><b>Contas em dia:</b> parte das despesas vencidas no mês pagas até o vencimento. Fatura paga a menos não conta como em dia.</li>
            <li><b>Dívidas sob controle:</b> parcelas (cartão e parcelados), rotativo e juros do mês ÷ renda. Nota máxima até 10%; zero a partir de 40%. Bancos e o Banco Central costumam usar 30% como teto prudente. Mês com rotativo vale no máximo 12 pontos.</li>
            <li><b>Reserva de emergência:</b> meses de custo essencial cobertos pela reserva (Investimentos → Reserva). Nota máxima ao atingir a meta de meses escolhida lá (padrão 6).</li>
          </ul>
          <p>Pilar sem dados no mês fica de fora e o índice é proporcional aos demais. Faixas: <b>Saudável</b> 80+, <b>Atenção</b> 40–79, <b>Vulnerável</b> até 39. O mês atual é parcial: usa o previsto até o fim do mês.</p>
        </div>
      </details>`)}function I(a,t){!a||!t.length||((Fin.state.saudeVista||"indice")==="indice"?Fin.charts.line(a,t.map(e=>({ym:e.ym,valor:e.score,cor:e.faixa.cor,extra:`${e.faixa.icone} ${e.faixa.nome}<br>${e.pilares.map(i=>`${i.icone} ${Math.round(i.pts)}/25`).join(" · ")}`})),{color:"#2a78d6",nome:"Índice",label:"Índice de saúde financeira nos últimos meses",pontos:!0,escala:{min:0,max:100,passo:25},formato:e=>String(Math.round(e)),faixas:[{de:80,ate:100,cor:"#0ca30c"},{de:40,ate:80,cor:"#fab219"},{de:0,ate:40,cor:"#d03b3b"}]}):Fin.charts.columns(a,t.map(e=>({ym:e.ym,parcCartao:e.dividas.futCartao,parcOutras:e.dividas.futOutras,rotativo:e.dividas.rotativo,saldo:e.dividas.estoque,extra:e.comprometimento==null?"":`Parcelas + juros no mês: ${Math.round(e.comprometimento*100)}% da renda`})),{series:w,stacked:!0,totalLabel:"Dívida a vencer",selected:t[t.length-1].ym,label:"Dívida a vencer no fim de cada mês",onSelect:e=>{Fin.state.mes=e,Fin.router.render()}}))}function L(a){return`
      <details class="mt-3">
        <summary class="text-xs text-slate-500 flex items-center gap-1"><span class="chev">▸</span> Ver tabela</summary>
        <div class="table-wrap mt-2 border border-slate-200 rounded-xl">
          <table>
            <thead><tr><th>Mês</th><th class="num">Receitas</th><th class="num">Despesas</th><th class="num">Saldo</th></tr></thead>
            <tbody>${a.map(t=>`<tr><td>${r.monthShort(t.ym)}</td><td class="num">${r.brl(t.receitas)}</td><td class="num">${r.brl(t.despesas)}</td><td class="num">${r.brl(t.saldo)}</td></tr>`).join("")}</tbody>
          </table>
        </div>
      </details>`}function P(a,{signal:t}){if(!Fin.storage.hasData()){a.innerHTML=Fin.ui.emptyState("📂","Nenhum dado ainda","Importe sua planilha antiga ou crie seu primeiro lançamento.",'<a href="#/dados" class="btn btn-primary">Importar planilha</a>');return}const e=Fin.state.mes,i=d.resumo(e),s=d.historico(e,6),c=d.contasAbertas(e),p=[{key:"receitas",label:"Receitas",color:Fin.charts.SERIES.receitas},{key:"despesas",label:"Despesas",color:Fin.charts.SERIES.despesas}];let l=[];try{l=Fin.saude.serie(e,12)}catch(x){console.warn("[saude]",x)}const u=Fin.storage.situacaoBackup(),h=u.lembrar&&!Fin.state.backupAdiado?`
      <div class="flex items-center gap-2 text-xs text-amber-900 bg-amber-50/70 border border-amber-100 rounded-xl px-3 py-1.5" role="status">
        ${Fin.icone("cofreDados","w-4 h-4 shrink-0 text-amber-700")}
        <span class="flex-1 min-w-0 truncate">${u.ultimo?`Último backup há <b>${u.dias} dias</b>`:"<b>Sem backup</b> ainda: os dados estão só neste aparelho"}</span>
        <a href="#/dados" class="font-semibold underline shrink-0">Fazer backup</a>
        <button data-act="adiar-backup" class="text-amber-900/60 hover:text-amber-900 shrink-0" aria-label="Esconder até reabrir o app" title="Esconder até reabrir o app">✕</button>
      </div>`:"";a.innerHTML=`
      <div class="space-y-4">
        ${y()}
        ${Fin.ui.filtroPessoa()}
        ${Fin.ui.monthNav(e)}
        ${M(i,e)}
        ${S()}
        ${e===r.currentYM()?A():""}

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          ${b(`
            <div class="flex items-start justify-between gap-3 flex-wrap mb-3">
              ${g("barras","blue","Receitas x despesas")}
              ${Fin.charts.legend(p)}
            </div>
            <div id="chart-hist" class="w-full min-w-0 overflow-hidden"></div>
            <p class="text-xs text-slate-400 mt-1">Últimos 6 meses · toque em um mês para abri-lo ·
              <a href="#/relatorios" class="text-prim-700 font-medium hover:underline">Ver relatórios</a></p>
            ${L(s)}`)}
          ${b(`
            <div class="flex items-start justify-between gap-3 flex-wrap mb-3">
              ${g("pizza","orange","Despesas por categoria")}
              <label class="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input type="checkbox" id="detalhar-faturas" class="accent-prim-600 w-4 h-4" ${Fin.state.detalharFaturas?"checked":""} />
                Detalhar faturas do cartão
              </label>
            </div>
            ${R(e)}`)}
        </div>

        ${q(l)}

        ${E(e)}

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          ${e===r.currentYM()?"":b(`${g("calendario","amber","Contas a pagar","mb-1")}${j(c,e)}`)}
          ${b(`${g("cartao","violet","Faturas do cartão","mb-1")}${D(e)}`)}
        </div>

        ${h}
      </div>`,a.querySelector('[data-act="perguntar-ia"]')?.addEventListener("click",()=>Fin.ia.abrirAnalise()),a.querySelector('[data-act="adiar-backup"]')?.addEventListener("click",()=>{Fin.state.backupAdiado=!0,Fin.router.refresh()}),a.querySelector("#detalhar-faturas").addEventListener("change",x=>{Fin.state.detalharFaturas=x.target.checked,Fin.router.refresh()}),a.querySelectorAll('input[name="saude-vista"]').forEach(x=>x.addEventListener("change",T=>{Fin.state.saudeVista=T.target.value,Fin.router.refresh()}));const n=a.querySelector("#chart-hist"),m=a.querySelector("#chart-saude"),o=()=>{Fin.charts.columns(n,s,{series:p,selected:e,label:"Receitas e despesas dos últimos 6 meses",onSelect:x=>{Fin.state.mes=x,Fin.router.render()}}),I(m,l)};let f=n.clientWidth;o();const F=new ResizeObserver(()=>requestAnimationFrame(()=>{const x=n.clientWidth;Math.abs(x-f)>1&&(f=x,o())}));F.observe(n),t.addEventListener("abort",()=>F.disconnect())}return{title:"Início",render:P}})();
