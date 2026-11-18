/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.dashboard=(()=>{const d=Fin.fmt,g=d.esc,l=Fin.finance,M=(a,s,e,o="")=>`<h2 class="font-semibold flex items-center gap-2 ${o}">${Fin.icones.badge(a,s,"w-7 h-7","w-4 h-4")}${e}</h2>`,w=(a,s="")=>`<section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5 min-w-0 ${s}">${a}</section>`;function O(){const a=Fin.membros;if(!a)return"";const s=a.atual(),e=a.primeiroNome(s),o=new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"}),t=!s.nome&&!s.foto;return`
      <div class="flex items-center gap-3">
        <a href="#/configuracoes" class="shrink-0 rounded-full hidden md:block" aria-label="Perfil e configurações">${a.avatar(s,{tam:"w-11 h-11",txt:"text-sm",anel:"ring-2 ring-white shadow-sm"})}</a>
        <div class="min-w-0 flex-1">
          <p class="text-[15px] md:text-lg font-semibold text-slate-800 leading-tight truncate">${a.saudacao()}${e?`, ${d.esc(e)}`:""}!</p>
          <p class="text-[12.5px] text-slate-500 saudacao-data">${o}${t?' · <a href="#/configuracoes" class="text-prim-700 font-medium hover:underline">Pôr seu nome e foto</a>':""}</p>
        </div>
      </div>`}function H(a){if(a.length<2)return"";const s=112,e=48,o=4,t=Math.min(...a),m=Math.max(...a),p=m-t||1,u=a.map((c,h)=>[o+h*(s-2*o)/(a.length-1),e-o-(c-t)/p*(e-2*o)]),x=t<0&&m>0?e-o-(0-t)/p*(e-2*o):null,[v,n]=u[u.length-1];return`<svg viewBox="0 0 ${s} ${e}" class="hero-spark w-24 h-11 sm:w-28 sm:h-12 shrink-0" aria-hidden="true" focusable="false">
      ${x!=null?`<line x1="${o}" x2="${s-o}" y1="${x}" y2="${x}" stroke="rgba(255,255,255,.35)" stroke-dasharray="3 3"/>`:""}
      <polyline points="${u.map(([c,h])=>`${c.toFixed(1)},${h.toFixed(1)}`).join(" ")}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
      ${u.slice(0,-1).map(([c,h])=>`<circle cx="${c.toFixed(1)}" cy="${h.toFixed(1)}" r="2" fill="currentColor" opacity=".75"/>`).join("")}
      <circle cx="${v.toFixed(1)}" cy="${n.toFixed(1)}" r="3.6" fill="currentColor"/>
    </svg>`}function N(a,s){const e=a.saldo<0,o=l.historico(s,6),t=o.length>1?o[o.length-2].saldo:null,m=t?(a.saldo-t)/Math.abs(t):null,p=Fin.state.heroAberto??Fin.modo?.completo?.()??!1,u=m==null||!Number.isFinite(m)?"":`<span class="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 font-medium">${m>=0?"▲":"▼"} ${Math.round(Math.abs(m)*100)}% vs. mês passado</span>`,x=a.receitas>0?a.despesas/a.receitas:null,v=x==null?"sem receitas lançadas no mês":x>1?"gastando mais do que ganha":`sobra ${Math.round((1-x)*100)}% da receita`,n=a.atrasadas?`${a.atrasadas} atrasada${a.atrasadas>1?"s":""}`:a.qtdAPagar?`${a.qtdAPagar} ${a.qtdAPagar===1?"conta":"contas"}`:"tudo pago",c=Fin.inv?.temDados()?Fin.inv.resumo().patrimonio:null,h=(r,$,F,R,S)=>`
      <a href="#/lancamentos" ${R} class="rounded-2xl bg-white/[.08] hover:bg-white/[.14] px-3 py-2.5 min-w-0 block">
        <span class="flex items-center gap-1.5 text-[12px] text-white/75"><span class="w-2 h-2 rounded-full shrink-0 ${F}" aria-hidden="true"></span>${r}</span>
        <span class="block text-[15px] font-semibold tabular-nums whitespace-nowrap mt-0.5">${$}</span>
        ${S?`<span class="block text-[11.5px] text-white/65 truncate">${S}</span>`:""}
      </a>`,f=(r,$)=>`<div class="flex items-center justify-between gap-3"><span class="text-white/75">${r}</span><b class="font-semibold tabular-nums text-right">${$}</b></div>`;return`
      <section class="hero-topo text-white rounded-3xl shadow-sm min-w-0" data-hero>
        <button type="button" data-act="hero" aria-expanded="${p}" class="w-full text-left px-4 sm:px-5 pt-4 pb-1 flex items-start gap-3">
          <span class="flex-1 min-w-0">
            <span class="hero-rotulo block text-[12px] font-semibold uppercase tracking-wider text-white/75">${e?"Faltou este mês":"Sobrou este mês"}</span>
            <span class="block text-[2.4rem] leading-tight font-semibold tracking-tight tabular-nums mt-0.5 ${e?"text-rose-200":""}">${d.brl(a.saldo)}</span>
            <span class="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-[12.5px] text-white/80">${u}<span>${p?"toque para fechar":"toque para ver detalhes"}</span></span>
          </span>
          ${H(o.map(r=>r.saldo))}
        </button>
        <div class="grid grid-cols-3 gap-2 px-3 sm:px-5 pt-3 pb-4">
          ${h("Entrou",d.brl(a.receitas),"bg-emerald-300",'data-filtro-tipo="receita"',"")}
          ${h("Saiu",d.brl(a.despesas),"bg-rose-300",'data-filtro-tipo="despesa"',"")}
          ${h("A pagar",d.brl(a.aPagar),a.atrasadas?"bg-rose-400":"bg-amber-300",'data-filtro-status="pendentes"',n)}
        </div>
        ${p?`
        <div class="border-t border-white/10 mx-4 sm:mx-5 py-3 grid gap-2 text-[13.5px]">
          ${f("Recebido até agora",d.brl(a.recebido))}
          ${f("Pago até agora",d.brl(a.pago))}
          ${f("Realizado (recebido − pago)",d.brl(a.saldoRealizado))}
          ${f("Despesas sobre a receita",x==null?"—":`${Math.round(x*100)}% · ${v}`)}
          ${a.aportes>0?f("Investido no mês",d.brl(a.aportes)):""}
          ${c!=null?`<a href="#/investimentos" class="flex items-center justify-between gap-3 hover:underline"><span class="text-white/75">Patrimônio</span><b class="font-semibold tabular-nums">${d.brl(c)} →</b></a>`:""}
        </div>`:""}
      </section>`}function V(){const a=Fin.educacao;let s="";if(a){const o=new Set(Fin.storage.prefs().guiasLidos||[]),t=a.ARTIGOS.find(p=>!o.has(p.id)),m=a.ARTIGOS.filter(p=>o.has(p.id)).length;s=`
        <a href="#/educacao${t?`?artigo=${t.id}`:""}" data-aprender class="flex flex-col gap-1.5 bg-white rounded-2xl shadow-sm p-3 hover:ring-2 hover:ring-emerald-200 min-w-0">
          ${Fin.icones.badge("livro","emerald","w-9 h-9","w-5 h-5")}
          <span class="block text-[14px] font-semibold">Aprender <span class="text-[12px] font-normal text-slate-500">· ${m}/${a.ARTIGOS.length}</span></span>
          <span class="block text-[12.5px] leading-snug text-slate-500">${t?`${g(t.titulo)} · ${t.min} min`:"Todos os guias lidos ✓"}</span>
        </a>`}const e=Fin.ia?`
      <button type="button" data-act="perguntar-ia" class="flex flex-col gap-1.5 bg-white rounded-2xl shadow-sm p-3 hover:ring-2 hover:ring-violet-200 text-left min-w-0">
        ${Fin.icones.badge("mensagem","violet","w-9 h-9","w-5 h-5")}
        <span class="block text-[14px] font-semibold">Perguntar à IA</span>
        <span class="block text-[12.5px] leading-snug text-slate-500">Análise do mês no ChatGPT ou Gemini, sem custo</span>
      </button>`:"";return s||e?`<div class="grid grid-cols-2 gap-3">${s}${e}</div>`:""}function z(){const a=d.todayISO(),s=new Date;s.setDate(s.getDate()+30);const e=`${s.getFullYear()}-${String(s.getMonth()+1).padStart(2,"0")}-${String(s.getDate()).padStart(2,"0")}`,o=l.catsInvestimento(),t=l.lancamentos().filter(n=>n.tipo==="despesa"&&!l.isPago(n)&&!l.ehAporte(n,o)&&l.dataRef(n)&&l.dataRef(n)<=e).filter(n=>l.dataRef(n)>=a||l.statusEfetivo(n)==="atrasado").sort((n,c)=>l.dataRef(n).localeCompare(l.dataRef(c))),m=n=>Math.max(0,l.valor(n)-(n.status==="parcial"&&n.valorPago||0)),p=t.reduce((n,c)=>n+m(c),0),u=t.filter(n=>l.dataRef(n)<a),x=["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"],v=t.slice(0,5).map(n=>{const c=l.dataRef(n),h=c<a;return`
        <li class="flex items-center gap-3 py-2.5 cursor-pointer" data-edit="${n.id}" role="button" tabindex="0" aria-label="Editar ${g(n.descricao||n.categoria)}">
          <span class="w-11 shrink-0 rounded-xl text-center py-1 ${h?"bg-rose-50 text-rose-700":c===a?"bg-amber-50 text-amber-800":"bg-slate-50 text-slate-700"}">
            <span class="block text-base font-semibold leading-tight tabular-nums">${c.slice(8,10)}</span>
            <span class="block text-[10px] font-medium tracking-wide">${x[Number(c.slice(5,7))-1]}</span>
          </span>
          <span class="flex-1 min-w-0">
            <span class="flex items-center gap-1.5 text-sm font-medium min-w-0">${Fin.ui.autorMini(n)}<span class="truncate">${g(n.descricao||n.categoria)}</span></span>
            <span class="block text-xs ${h?"text-rose-700":"text-slate-500"} truncate">${h?`atrasada · ${g(n.categoria||"")}`:c===a?"vence hoje":g([n.categoria,n.formaPagamento].filter(Boolean).join(" · "))}</span>
          </span>
          <span class="text-sm font-semibold tabular-nums text-rose-700 shrink-0">− ${d.brl(m(n))}</span>
        </li>`}).join("");return w(`
      <div class="flex items-start justify-between gap-2 mb-1">
        <div>${M("calendario","amber","Próximos 30 dias")}
          <p class="text-xs text-slate-500 mt-0.5">compromissos já conhecidos${u.length?` · <span class="text-rose-700 font-medium">${u.length} atrasada${u.length>1?"s":""}</span>`:""}</p></div>
        ${t.length?`<div class="text-right shrink-0"><div class="text-[11px] text-slate-500">total</div><div class="text-sm font-semibold tabular-nums">${d.brl(p)}</div></div>`:""}
      </div>
      ${t.length?`<ul class="divide-y divide-slate-100">${v}</ul>
        ${t.length>5?`<a href="#/lancamentos" data-filtro-status="pendentes" class="block text-center text-sm text-prim-700 font-medium pt-3 hover:underline">Ver todas (${t.length})</a>`:""}`:'<p class="text-sm text-slate-500 py-3">Nada a pagar nos próximos 30 dias. 🎉</p>'}`)}function B(a,s){if(!a.length)return'<p class="text-sm text-slate-500 py-3">Nenhuma conta em aberto neste mês. 🎉</p>';const e=a.slice(0,6).map(t=>`
      <li class="flex items-center gap-3 py-2.5" data-edit="${t.id}" role="button" tabindex="0">
        ${Fin.ui.catIcon(t.categoriaIcone,t.categoria,t.tipo)}
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium truncate">${g(t.descricao||t.categoria)}</div>
          <div class="text-xs text-slate-500">vence ${d.date(l.dataRef(t))}</div>
        </div>
        <div class="text-right shrink-0">
          <div class="text-sm font-semibold tabular-nums">${t.status==="parcial"?`<span class="text-xs font-normal text-slate-500">falta</span> ${d.brl(l.valor(t)-(t.valorPago||0))}`:d.brl(l.valor(t))}</div>
          ${Fin.ui.statusPill(t)}
        </div>
      </li>`).join(""),o=a.length>6?`<a href="#/lancamentos" data-filtro-status="pendentes" class="block text-center text-sm text-prim-700 font-medium pt-3 hover:underline">Ver todas (${a.length})</a>`:"";return`<ul class="divide-y divide-slate-100">${e}</ul>${o}`}function G(a){const s=Fin.state.detalharFaturas?l.porCategoriaDetalhada(a):l.porCategoria(a,"despesa");if(!s.length)return'<p class="text-sm text-slate-500 py-3">Sem despesas neste mês.</p>';const e=s.reduce((t,m)=>t+m.total,0);let o=s.map(t=>({label:t.categoria,icone:t.icone,total:t.total}));if(o.length>7){const t=o.slice(6).reduce((m,p)=>m+p.total,0);o=[...o.slice(0,6),{label:`Outras (${s.length-6})`,icone:"",total:t}]}return Fin.charts.hbars(o,{total:e})}function U(a){const s=l.faturas(a);return s.length?`
      <ul class="divide-y divide-slate-100">${s.map(e=>`
        <li><a href="#/cartoes" data-ir-cartao="${g(e.cartao)}" class="flex items-center gap-3 py-2.5 hover:bg-slate-50 rounded-lg">
          ${Fin.icones.badge("cartao","violet","w-10 h-10")}
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate">${g(e.cartao)}</div>
            <div class="text-xs text-slate-500">${e.qtd} ${e.qtd===1?"compra":"compras"}</div>
          </div>
          <div class="text-sm font-semibold tabular-nums">${d.brl(e.total)}</div>
          <span class="text-slate-300" aria-hidden="true">›</span>
        </a></li>`).join("")}
      </ul>
      <p class="text-xs text-slate-400 mt-2">O valor já entra nas despesas pelo lançamento de pagamento da fatura.</p>`:'<p class="text-sm text-slate-500 py-3">Nenhuma compra no cartão com fatura neste mês.</p>'}function ta(a){const s=l.orcamento(a);if(!s.itens.length)return w(`
        <div class="flex flex-wrap items-center gap-3">
          ${Fin.icones.badge("alvo","orange","w-10 h-10")}
          <div class="flex-1 min-w-[12rem]">
            <h2 class="font-semibold">Orçamento</h2>
            <p class="text-sm text-slate-500">Defina limites mensais por categoria e acompanhe aqui.</p>
          </div>
          <a href="#/orcamento" class="btn btn-ghost">Definir orçamentos</a>
        </div>`);const e=s.itens.slice(0,4);return w(`
      <div class="flex items-center justify-between gap-3 mb-1">
        ${M("alvo","orange","Orçamento do mês")}
        <a href="#/orcamento" class="text-sm text-prim-700 font-medium hover:underline">Ver tudo (${s.itens.length})</a>
      </div>
      <ul class="grid md:grid-cols-2 md:gap-x-8 divide-y md:divide-y-0 divide-slate-100">${e.map(Fin.pages.orcamento.linhaHTML).join("")}</ul>`)}const L=[{key:"parcCartao",label:"Parcelas no cartão",color:"#eb6834"},{key:"parcOutras",label:"Outras parcelas",color:"#f2a65a"},{key:"rotativo",label:"Rotativo do cartão",color:"#d03b3b"}];function J(a,s=!1){if(!a.length)return"";const e=a[a.length-1],o=a[Math.max(0,a.length-4)],t=e.score-o.score,m=a.length-1-Math.max(0,a.length-4),p=m>0&&t!==0?`<span class="${t>0?"text-emerald-800":"text-rose-700"} font-medium">${t>0?"▲":"▼"} ${Math.abs(t)} ponto${Math.abs(t)>1?"s":""}</span> em ${m} ${m>1?"meses":"mês"}`:m>0?"estável nos últimos meses":"",u=e.faixa,x=Fin.state.saudeVista||"indice",v=e.dividas,n=e.pilares.map(r=>`
      <li class="py-2">
        <div class="flex items-center gap-2 text-sm">
          <span aria-hidden="true">${r.icone}</span>
          <span class="flex-1 min-w-0 font-medium truncate">${g(r.nome)}</span>
          <span class="pill ${r.faixa.classe}"><span aria-hidden="true">${r.faixa.icone}</span>${Math.round(r.pts)}/${Fin.saude.MAX}</span>
        </div>
        <div class="h-1.5 rounded-full bg-slate-100 mt-1.5 overflow-hidden" aria-hidden="true">
          <div class="h-full rounded-full" style="width:${r.pts/Fin.saude.MAX*100}%;background:${r.faixa.cor}"></div>
        </div>
        <div class="text-xs text-slate-500 mt-1">${r.texto}</div>
      </li>`).join(""),c=["gasto","contas","dividas","reserva"].filter(r=>!e.pilares.some($=>$.id===r)),h={gasto:"gasto × renda (sem receitas no mês)",contas:"contas em dia (nenhuma venceu ainda)",dividas:"dívidas (sem receitas no mês)",reserva:"reserva de emergência"},f=`
      <div class="flex items-start justify-between gap-3 flex-wrap">
        <div>
          ${s?"":M("pulso","emerald","Saúde financeira")}
          <p class="text-xs text-slate-500">Índice de 0 a 100 · ${d.monthLong(e.ym)}</p>
        </div>
        <div class="seg seg-neutro w-full sm:w-64" role="radiogroup" aria-label="Visão">
          <label><input type="radio" name="saude-vista" value="indice" ${x==="indice"?"checked":""}><span>Índice</span></label>
          <label><input type="radio" name="saude-vista" value="divida" ${x==="divida"?"checked":""}><span>Endividamento</span></label>
        </div>
      </div>

      ${x==="indice"?`
      <div class="grid grid-cols-1 md:grid-cols-[11rem_1fr] gap-4 mt-3 items-start">
        <div class="flex md:flex-col items-center md:items-start gap-3 md:gap-1">
          <div class="text-5xl font-semibold tracking-tight tabular-nums">${e.score}<span class="text-lg text-slate-400 font-normal">/100</span></div>
          <div class="space-y-1">
            <span class="pill ${u.classe} !text-xs"><span aria-hidden="true">${u.icone}</span>${u.nome}</span>
            ${p?`<div class="text-xs text-slate-500">${p}</div>`:""}
          </div>
        </div>
        <ul class="divide-y divide-slate-100 min-w-0">${n}</ul>
      </div>
      ${c.length?`<p class="text-xs text-slate-400 mt-1">Fora do cálculo neste mês: ${c.map(r=>h[r]).join(", ")}.${c.includes("reserva")?' <a href="#/investimentos?aba=reserva" class="text-prim-700 font-medium hover:underline">Criar reserva</a>':""}</p>`:""}
      <div id="chart-saude" class="w-full min-w-0 overflow-hidden mt-3"></div>
      <div class="flex flex-wrap gap-4 text-xs text-slate-600 mt-1">${Fin.saude.FAIXAS.map(r=>`
        <span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm" style="background:${r.cor};opacity:.6"></span><span aria-hidden="true">${r.icone}</span>${r.nome} ${r.id==="bom"?"(80+)":r.id==="atencao"?"(40–79)":"(até 39)"}</span>`).join("")}
      </div>`:`
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 text-sm">
        <div><div class="text-xs text-slate-500">Dívida a vencer</div><div class="text-lg font-semibold tabular-nums">${d.brl(v.estoque)}</div></div>
        <div><div class="text-xs text-slate-500">Parcelas + juros no mês</div><div class="text-lg font-semibold tabular-nums">${d.brl(v.servico)}</div></div>
        <div class="col-span-2 sm:col-span-1"><div class="text-xs text-slate-500">Comprometimento da renda</div>
          <div class="text-lg font-semibold tabular-nums ${e.comprometimento>.3?"text-rose-700":""}">${e.comprometimento==null?"—":`${Math.round(e.comprometimento*100)}%`}
          <span class="text-xs font-normal text-slate-500">${e.comprometimento==null?"":e.comprometimento>.3?"! acima de 30%":"✓ até 30%"}</span></div></div>
      </div>
      <div class="flex items-start justify-between gap-3 flex-wrap mt-3">${Fin.charts.legend(L)}</div>
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
      </details>`;return s?f:w(f)}function W(a,s){!a||!s.length||((Fin.state.saudeVista||"indice")==="indice"?Fin.charts.line(a,s.map(e=>({ym:e.ym,valor:e.score,cor:e.faixa.cor,extra:`${e.faixa.icone} ${e.faixa.nome}<br>${e.pilares.map(o=>`${o.icone} ${Math.round(o.pts)}/25`).join(" · ")}`})),{color:"#2a78d6",nome:"Índice",label:"Índice de saúde financeira nos últimos meses",pontos:!0,escala:{min:0,max:100,passo:25},formato:e=>String(Math.round(e)),faixas:[{de:80,ate:100,cor:"#0ca30c"},{de:40,ate:80,cor:"#fab219"},{de:0,ate:40,cor:"#d03b3b"}]}):Fin.charts.columns(a,s.map(e=>({ym:e.ym,parcCartao:e.dividas.futCartao,parcOutras:e.dividas.futOutras,rotativo:e.dividas.rotativo,saldo:e.dividas.estoque,extra:e.comprometimento==null?"":`Parcelas + juros no mês: ${Math.round(e.comprometimento*100)}% da renda`})),{series:L,stacked:!0,totalLabel:"Dívida a vencer",selected:s[s.length-1].ym,label:"Dívida a vencer no fim de cada mês",onSelect:e=>{Fin.state.mes=e,Fin.router.render()}}))}function X(a){return`
      <details class="mt-3">
        <summary class="text-xs text-slate-500 flex items-center gap-1"><span class="chev">▸</span> Ver tabela</summary>
        <div class="table-wrap mt-2 border border-slate-200 rounded-xl">
          <table>
            <thead><tr><th>Mês</th><th class="num">Receitas</th><th class="num">Despesas</th><th class="num">Saldo</th></tr></thead>
            <tbody>${a.map(s=>`<tr><td>${d.monthShort(s.ym)}</td><td class="num">${d.brl(s.receitas)}</td><td class="num">${d.brl(s.despesas)}</td><td class="num">${d.brl(s.saldo)}</td></tr>`).join("")}</tbody>
          </table>
        </div>
      </details>`}function Y(a,{signal:s}){if(!Fin.storage.hasData()){a.innerHTML=Fin.ui.emptyState("📂","Nenhum dado ainda","Importe sua planilha antiga ou crie seu primeiro lançamento.",'<a href="#/dados" class="btn btn-primary">Importar planilha</a>');return}const e=Fin.state.mes,o=l.resumo(e),t=l.historico(e,6),m=l.contasAbertas(e),p=[{key:"receitas",label:"Receitas",color:Fin.charts.SERIES.receitas},{key:"despesas",label:"Despesas",color:Fin.charts.SERIES.despesas}];let u=[];try{u=Fin.saude.serie(e,12)}catch(i){console.warn("[saude]",i)}const x=Fin.storage.situacaoBackup(),v=x.lembrar&&!Fin.state.backupAdiado?`
      <div class="flex items-center gap-2 text-xs text-amber-900 bg-amber-50/70 border border-amber-100 rounded-xl px-3 py-1.5" role="status">
        ${Fin.icone("cofreDados","w-4 h-4 shrink-0 text-amber-700")}
        <span class="flex-1 min-w-0 truncate">${x.ultimo?`Último backup há <b>${x.dias} dias</b>`:"<b>Sem backup</b> ainda: os dados estão só neste aparelho"}</span>
        <a href="#/dados" class="font-semibold underline shrink-0">Fazer backup</a>
        <button data-act="adiar-backup" class="text-amber-900/60 hover:text-amber-900 shrink-0" aria-label="Esconder até reabrir o app" title="Esconder até reabrir o app">✕</button>
      </div>`:"",n=!!Fin.modo?.completo?.();Fin.state.dobrasInicio=Fin.state.dobrasInicio||{};const c=i=>Fin.state.dobrasInicio[i]??n,h=t.slice(0,-1).filter(i=>i.despesas>0),f=h.length?h.reduce((i,b)=>i+b.despesas,0)/h.length:0,r=f?(o.despesas-f)/f:null,$=r==null?"Últimos 6 meses":`Saídas ${Math.round(Math.abs(r)*100)}% ${r>=0?"acima":"abaixo"} da média dos meses anteriores`,F=Fin.state.detalharFaturas?l.porCategoriaDetalhada(e):l.porCategoria(e,"despesa"),R=F.reduce((i,b)=>i+b.total,0),S=F.length?`Maior gasto: ${g(F[0].categoria)} (${Math.round(F[0].total/R*100)}%)`:"Sem despesas neste mês",y=u[u.length-1],C=y?[...y.pilares].sort((i,b)=>i.pts-b.pts)[0]:null,_=y?`${y.faixa.nome}${C?` · ponto fraco: ${g(C.nome.toLowerCase())}`:""}`:"",k=l.orcamento(e),E=k.itens.filter(i=>i.pct>1).length,P=k.itens.filter(i=>i.pct>=.8&&i.pct<=1).length,Z=k.itens.length?E?`${E} categoria${E>1?"s":""} acima do limite`:P?`${P} perto do limite`:"Tudo dentro do limite ✓":"Defina limites por categoria",A=(i,b,D,Q,aa,ea)=>`
      <section class="bg-white rounded-2xl shadow-sm min-w-0 overflow-hidden" data-dobra-sec="${i}">
        <button type="button" data-dobra="${i}" aria-expanded="${c(i)}" class="w-full flex items-center gap-3 px-4 py-3.5 text-left min-h-[64px]">
          ${Fin.icones.badge(b,D,"w-9 h-9","w-[18px] h-[18px]")}
          <span class="flex-1 min-w-0"><span class="block text-[15px] font-semibold">${Q}</span><span class="block text-[13px] text-slate-500 truncate">${aa}</span></span>
          <span class="text-slate-400 transition-transform ${c(i)?"rotate-180":""}" aria-hidden="true">${Fin.icone("seta","w-5 h-5")}</span>
        </button>
        ${c(i)?`<div class="px-4 pb-4 min-w-0">${ea()}</div>`:""}
      </section>`,K=k.itens.slice(0,4);a.innerHTML=`
      <div class="space-y-4">
        ${O()}
        ${Fin.ui.filtroPessoa()}
        ${Fin.ui.monthNav(e)}
        ${N(o,e)}
        ${e===d.currentYM()?z():w(`${M("calendario","amber","Contas a pagar","mb-1")}${B(m,e)}`)}
        ${w(`<div class="flex items-center justify-between gap-2 mb-1">${M("cartao","violet","Faturas do cartão")}<a href="#/cartoes" class="text-sm text-prim-700 font-medium hover:underline">Cartões</a></div>${U(e)}`)}

        <div class="pt-1">
          <div class="flex items-center justify-between gap-2 mb-2 px-1">
            <h2 class="text-[15px] font-semibold text-slate-800">Análises do mês</h2>
            <a href="#/relatorios" class="text-sm text-prim-700 font-medium hover:underline">Abrir Análises</a>
          </div>
          <div class="space-y-2.5">
            ${A("hist","barras","blue","Receitas × despesas",$,()=>`
              <div class="flex justify-end mb-2">${Fin.charts.legend(p)}</div>
              <div id="chart-hist" class="w-full min-w-0 overflow-hidden"></div>
              <p class="text-xs text-slate-500 mt-1">Últimos 6 meses · toque em um mês para abri-lo</p>
              ${X(t)}`)}
            ${A("cats","pizza","orange","Despesas por categoria",S,()=>`
              <label class="inline-flex items-center gap-2 text-[13px] text-slate-600 cursor-pointer mb-2">
                <input type="checkbox" id="detalhar-faturas" class="accent-prim-600 w-4 h-4" ${Fin.state.detalharFaturas?"checked":""} />
                Detalhar faturas do cartão
              </label>
              ${G(e)}`)}
            ${y?A("saude","pulso","emerald",`Saúde financeira: ${y.score}/100`,_,()=>J(u,!0)):""}
            ${A("orc","alvo","orange","Orçamento do mês",Z,()=>k.itens.length?`<ul class="grid md:grid-cols-2 md:gap-x-8 divide-y md:divide-y-0 divide-slate-100">${K.map(Fin.pages.orcamento.linhaHTML).join("")}</ul>
                 <a href="#/orcamento" class="block text-sm text-prim-700 font-medium pt-2 hover:underline">Ver todo o orçamento (${k.itens.length})</a>`:'<p class="text-sm text-slate-500">Defina limites mensais por categoria e acompanhe aqui.</p><a href="#/orcamento" class="btn btn-ghost mt-2">Definir orçamentos</a>')}
          </div>
        </div>

        ${V()}
        ${v}
      </div>`,a.querySelector('[data-act="perguntar-ia"]')?.addEventListener("click",()=>Fin.ia.abrirAnalise()),a.querySelector('[data-act="adiar-backup"]')?.addEventListener("click",()=>{Fin.state.backupAdiado=!0,Fin.router.refresh()}),a.querySelector('[data-act="hero"]')?.addEventListener("click",()=>{Fin.state.heroAberto=!(Fin.state.heroAberto??n),Fin.router.refresh()}),a.querySelectorAll("[data-dobra]").forEach(i=>i.addEventListener("click",()=>{const b=i.dataset.dobra;Fin.state.dobrasInicio[b]=!c(b),Fin.router.refresh()})),a.querySelector("#detalhar-faturas")?.addEventListener("change",i=>{Fin.state.detalharFaturas=i.target.checked,Fin.router.refresh()}),a.querySelectorAll('input[name="saude-vista"]').forEach(i=>i.addEventListener("change",b=>{Fin.state.saudeVista=b.target.value,Fin.router.refresh()}));const q=a.querySelector("#chart-hist"),I=a.querySelector("#chart-saude"),T=()=>{q&&Fin.charts.columns(q,t,{series:p,selected:e,label:"Receitas e despesas dos últimos 6 meses",onSelect:i=>{Fin.state.mes=i,Fin.router.render()}}),I&&W(I,u)},j=q||I;if(T(),j){let i=j.clientWidth;const b=new ResizeObserver(()=>requestAnimationFrame(()=>{const D=j.clientWidth;Math.abs(D-i)>1&&(i=D,T())}));b.observe(j),s.addEventListener("abort",()=>b.disconnect())}}return{title:"Início",render:Y}})();
