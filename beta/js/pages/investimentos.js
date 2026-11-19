/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.investimentos=(()=>{const t=Fin.fmt,v=t.esc,m=()=>Fin.inv,f=()=>Fin.forms.inv,U=[["resumo","Resumo"],["reserva","🛟 Reserva"],["ativos","Ativos"],["proventos","Proventos"],["rent","Rentabilidade"],["movs","Movimentações"],["metas","Metas"]],q={aplicado:"#2a78d6",ganho:"#0ca30c",proventos:"#0ca30c"},A={conta:"",tipo:"",busca:""},F=(a,s,r,n="")=>Fin.icones.titulo(a,s,r,{tag:"h3",cls:n}),$=(a,s="")=>`<section class="bg-white rounded-2xl shadow-sm p-4 min-w-0 ${s}">${a}</section>`,S=(a,s,r="",n="")=>`<div class="bg-white rounded-2xl shadow-sm p-3 min-w-0">
    <div class="text-xs text-slate-500">${a}</div><div class="text-lg font-semibold tabular-nums truncate ${n}">${s}</div>
    <div class="text-[11px] text-slate-500 truncate">${r}</div></div>`,L=a=>a>0?"text-emerald-700":a<0?"text-rose-700":"text-slate-600",j=a=>a==null?"—":`${a>0?"▲ ":a<0?"▼ ":""}${t.pct(Math.abs(a))}`;function I(){const a=Fin.cotacoes.dolar();return`<button type="button" data-act="dolar" class="inline-flex items-center gap-2 bg-white rounded-full shadow-sm px-3 py-1.5 text-sm" title="Atualizar dólar">
      <span aria-hidden="true">💵</span><span class="tabular-nums">US$ 1 = <b>${a?t.brl(a.valor):"—"}</b></span>
      <span class="text-xs text-slate-400" data-dolar-idade>${a?Fin.cotacoes.idade(a.em):"sem cotação"}</span><span aria-hidden="true" class="text-slate-400">↻</span></button>`}function B(a){return`
      ${Fin.ui.filtroPessoa()}
      <div class="flex flex-wrap items-center gap-2">
        <div class="mr-auto hidden md:block">${Fin.icones.titulo("alta","emerald","Investimentos",{cls:"text-xl",tam:"w-9 h-9",ic:"w-5 h-5"})}</div>
        <span data-dolar>${I()}</span>
        <button data-act="ajuda" class="btn btn-ghost !py-1.5 !px-2.5 bg-white shadow-sm" aria-label="Guias: o que são ações, FIIs, renda fixa e reserva" title="Guias rápidos">${Fin.icone("livro","w-4 h-4")}<span class="font-bold">?</span></button>
        <button data-act="importar" class="btn btn-ghost !py-1.5 bg-white shadow-sm">📥 Importar</button>
        <button data-act="precos" class="btn btn-ghost !py-1.5 bg-white shadow-sm">🏷️ Preços</button>
        <button data-act="novo-mov" class="btn btn-primary !py-1.5">＋ Movimentação</button>
      </div>
      <nav class="chips flex gap-2 overflow-x-auto pb-1" aria-label="Seções">
        ${U.map(([s,r])=>`<button data-aba="${s}" aria-pressed="${a===s}" class="chip !shadow-none border border-slate-200 ${a===s?"is-active !border-transparent":""}">${r}</button>`).join("")}
      </nav>`}function T(a,s){const r=m().acumulada(s.slice(-12)),n=m().acumulada(s),b=s.length?s[s.length-1]:null;return`
      ${a.semCotacao?`<p class="text-sm bg-amber-50 text-amber-900 rounded-xl px-3 py-2"><span aria-hidden="true">!</span> ${a.semCotacao} ativo(s) sem preço — usando o preço médio. <button data-act="precos" class="underline font-medium">Atualizar preços</button></p>`:""}
      ${!Fin.cotacoes.temChaves()&&a.abertas.length?'<p class="text-sm bg-sky-50 text-sky-900 rounded-xl px-3 py-2"><span aria-hidden="true">ⓘ</span> Preços informados à mão. <button data-act="chaves" class="underline font-medium">Ligar cotações automáticas</button> (brapi para B3, Finnhub para EUA).</p>':""}
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${S("Patrimônio total",t.brl(a.patrimonio),`<span class="${L(a.variacao)}">${j(a.variacao)}</span> sobre o aplicado`)}
        ${S("Valor aplicado",t.brl(a.investido),"custo do que você tem hoje")}
        ${S("Lucro total",t.brl(a.lucro),`capital ${t.brl(a.ganho)} · proventos ${t.brl(a.proventos.total)}`,L(a.lucro))}
        ${S("Rentabilidade",r!=null?`<span class="${L(r)}">${j(r)}</span>`:"—",r!=null?`12 meses · total ${j(n)}${b?.rent!=null?` · mês ${j(b.rent)}`:""}`:"precisa de 2 meses de histórico")}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        ${$(`
          <div class="flex items-start justify-between gap-3 flex-wrap mb-3">
            ${F("alta","emerald","Evolução do patrimônio")}
            ${Fin.charts.legend([{label:"Valor aplicado",color:q.aplicado},{label:"Ganho de capital",color:q.ganho}])}
          </div>
          <div id="inv-evolucao" class="w-full min-w-0 overflow-hidden"></div>
          <p class="text-xs text-slate-400 mt-1">Últimos 12 meses. Meses sem patrimônio registrado mostram só o aplicado ·
            <button data-act="foto" class="text-prim-700 font-medium hover:underline">informar mês passado</button></p>`)}
        ${$(`
          <div class="flex items-center justify-between gap-3 mb-3">
            ${F("pizza","violet","Alocação por classe")}
            <button data-act="alocacao" class="text-sm text-prim-700 font-medium hover:underline">% ideal</button>
          </div>
          ${G(m().alocacao(a))}`)}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        ${$(J(a))}
        ${$(Q())}
        ${$(X(m().conferenciaAportes(Fin.state.mes)))}
      </div>
      ${O(a,3)}`}function G(a){return a.length?`<ul class="space-y-3">${a.map(s=>{const r=s.ideal!=null?s.atual-s.ideal:null,n=r!=null&&Math.abs(r)>=.05?`<span class="text-amber-800">${r>0?"▲ acima":"▼ abaixo"} do ideal</span>`:r!=null?'<span class="text-emerald-700">✓ no alvo</span>':"";return`<li class="text-sm">
        <div class="flex items-center gap-2"><span class="truncate flex-1">${s.classe.icone} ${v(s.classe.nome)}</span>
          <span class="tabular-nums">${t.brl(s.valor)}</span></div>
        <div class="relative h-2.5 bg-slate-100 rounded mt-1" aria-hidden="true">
          <span class="absolute inset-y-0 left-0 rounded" style="width:${Math.min(100,s.atual*100)}%;background:${q.aplicado}"></span>
          ${s.ideal!=null?`<span class="absolute -top-1 -bottom-1 w-0.5 bg-slate-800" style="left:${Math.min(100,s.ideal*100)}%"></span>`:""}
        </div>
        <div class="flex justify-between text-xs text-slate-500 mt-0.5"><span>${t.pct(s.atual)}${s.ideal!=null?` / ideal ${t.pct(s.ideal)}`:""}</span>${n}</div>
      </li>`}).join("")}</ul>`:'<p class="text-sm text-slate-500">Sem ativos ainda.</p>'}function J(a){const s=m().contasVisiveis(),r=a.patrimonio||1,n=Fin.finance.temCasal(),b=u=>{if(!n)return"";const l=m().donoDe(u);if(l==="casal")return`<span class="autor-mini rounded-full grid place-items-center bg-prim-600 text-white shrink-0" title="Conta dos dois">${Fin.icone("usuario","w-2.5 h-2.5")}</span>`;const e=Fin.membros.porId(l);return`<span class="inline-flex shrink-0" title="Conta de ${v(Fin.membros.nome(e)||e.usuario)}">${Fin.membros.avatar(e,{tam:"autor-mini",txt:""})}</span>`};return`
      <div class="flex items-center justify-between mb-2">${F("banco","sky","Por conta")}
        <button data-act="nova-conta" class="text-sm text-prim-700 font-medium hover:underline">＋ Conta</button></div>
      <ul class="divide-y divide-slate-100">${s.map(u=>`
        <li><button data-conta="${u.id}" class="w-full flex items-center gap-2 py-2 text-left text-sm hover:bg-slate-50 rounded">
          <span aria-hidden="true">${u.icone||"🏦"}</span>${b(u)}<span class="flex-1 truncate">${v(u.nome)}
            <span class="text-xs text-slate-400">${u.tipo==="saldo"?"saldo":u.moeda==="USD"?"US$":"R$"}</span></span>
          <span class="tabular-nums">${t.brl(a.porConta[u.id]||0)}</span>
          <span class="text-xs text-slate-400 w-12 text-right">${t.pct((a.porConta[u.id]||0)/r)}</span>
        </button></li>`).join("")}</ul>`}function D(a){const s=a.cobertura;return s==null||!a.base?["○","bg-slate-100 text-slate-600","sem dados de despesas","#94a3b8"]:a.atual>=a.ideal?["✓","bg-emerald-50 text-emerald-800","reserva completa","#0ca30c"]:s>=3?["◐","bg-amber-50 text-amber-800","acima do mínimo (3 meses)","#fab219"]:["!","bg-rose-50 text-rose-700","abaixo do mínimo (3 meses)","#d03b3b"]}const N=a=>a==null?"—":`${a.toLocaleString("pt-BR",{maximumFractionDigits:1})} ${a>=.95&&a<1.05?"mês":"meses"}`;function Q(){const a=Fin.reserva.calcular(),[s,r,n]=D(a);return`
      <div class="flex items-center justify-between mb-2">${F("escudo","emerald","Reserva de emergência")}
        <button data-aba="reserva" class="text-sm text-prim-700 font-medium hover:underline">Ver →</button></div>
      <div class="text-2xl font-semibold tabular-nums">${t.brl(a.atual)}</div>
      <div class="mt-1"><span class="pill ${r}"><span aria-hidden="true">${s}</span>${N(a.cobertura)} · ${n}</span></div>
      <p class="text-xs text-slate-500 mt-2">Ideal: <b class="tabular-nums">${t.brl(a.ideal)}</b> (${a.mesesAlvo} meses × ${t.brl(a.base)} de custo essencial).</p>`}function Y(a){if(!Fin.finance.temCasal())return"";const s=Fin.membros,r=[{id:"casal",nome:"Dos dois",av:`<span class="w-7 h-7 rounded-full grid place-items-center bg-prim-600 text-white shrink-0">${Fin.icone("usuario","w-4 h-4")}</span>`},...Fin.cofre.pessoas().map(n=>({id:n.id,nome:`Só de ${s.primeiroNome(s.porId(n.id))||n.usuario}`,av:s.avatar(s.porId(n.id),{tam:"w-7 h-7",txt:"text-[10px]"})}))];return $(`
      <div class="text-sm font-medium mb-2">De quem é esta reserva?</div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="De quem é a reserva">
        ${r.map(n=>`<label class="quem-opcao"><input type="radio" name="rv-dono" value="${v(n.id)}" ${a.dono===n.id?"checked":""}><span>${n.av}<span class="truncate">${v(n.nome)}</span></span></label>`).join("")}
      </div>
      <p class="text-xs text-slate-500 mt-2">${a.dono==="casal"?"Compartilhada: custo essencial da casa inteira e o que está guardado nas contas de reserva de vocês dois.":"Individual: só a parte desta pessoa nas despesas (o que ela pagou + a parte dela nas contas dos dois) e só as contas de reserva dela."}</p>`)}function _(){const a=Fin.reserva.calcular();if(!a.janela)return $(`${F("escudo","emerald","Reserva de emergência")}
        <p class="text-sm text-slate-500 mt-1">Ainda não há meses completos de despesas para calcular o valor ideal. Lance receitas e despesas de pelo menos um mês inteiro.</p>`);const[s,r,n,b]=D(a),u=a.ideal>0?Math.min(1,a.atual/a.ideal):0,l=a.ideal>0?Math.min(1,a.minimo/a.ideal):0,e=a.prazo?t.monthLong(t.addMonths(t.currentYM(),a.prazo)).toLowerCase():"",o=Fin.reserva.PERFIS.map(d=>`
      <label class="flex items-start gap-3 rounded-xl border ${d.meses===a.mesesAlvo?"border-prim-500 bg-prim-50/50":"border-slate-200"} p-3 cursor-pointer">
        <input type="radio" name="rv-meses" value="${d.meses}" ${d.meses===a.mesesAlvo?"checked":""} class="accent-prim-600 mt-1">
        <span class="flex-1 min-w-0">
          <span class="block text-sm font-semibold">${d.meses} meses · ${d.nome}</span>
          <span class="block text-xs text-slate-500">${d.desc}</span>
        </span>
        <span class="text-sm font-semibold tabular-nums whitespace-nowrap">${t.brl(Math.ceil(a.base*d.meses/100)*100)}</span>
      </label>`).join(""),x={escolha:"sua escolha",essencial:"essencial",compromisso:"compromisso"},M=a.categorias.map(d=>`
      <tr class="${d.essencial?"":"text-slate-400"}">
        <td><label class="inline-flex items-center gap-2 cursor-pointer">
          <input type="checkbox" data-rv-cat="${v(d.nome)}" ${d.essencial?"checked":""} class="accent-prim-600 w-4 h-4">
          <span class="truncate max-w-[11rem]">${d.icone?`${d.icone} `:""}${v(d.nome)}</span></label></td>
        <td class="num">${t.brl(d.mediana)}</td>
        <td class="num">${t.brl(d.p75)}</td>
        <td>${d.variavel?"〰 variável":"▬ fixa"}</td>
        <td class="num">${d.pctCartao>=.05?`${Math.round(d.pctCartao*100)}%`:"—"}</td>
        <td class="text-xs">${d.motivo?x[d.motivo]:""}</td>
      </tr>`).join("");return`
      ${Y(a)}
      ${$(`
        <div class="flex items-start gap-3 flex-wrap">
          <div class="flex-1 min-w-[14rem]">
            <div class="text-sm text-slate-500">Reserva ideal · ${a.mesesAlvo} meses (${v(a.perfil.nome.toLowerCase())})</div>
            <div class="text-[40px] leading-tight font-semibold tracking-tight tabular-nums">${t.brl(a.ideal)}</div>
            <div class="text-sm text-slate-500">${a.mesesAlvo} × <b class="text-slate-700">${t.brl(a.base)}</b> de custo essencial por mês</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-slate-500">Você tem</div>
            <div class="text-2xl font-semibold tabular-nums">${t.brl(a.atual)}</div>
            <span class="pill ${r}"><span aria-hidden="true">${s}</span>${N(a.cobertura)} · ${n}</span>
          </div>
        </div>
        <div class="relative mt-4" aria-label="Progresso da reserva: ${Math.round(u*100)}%">
          <div class="h-3 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full" style="width:${u*100}%;background:${b}"></div></div>
          <span class="absolute -top-1 -bottom-1 w-0.5 bg-slate-700" style="left:${l*100}%" aria-hidden="true"></span>
        </div>
        <div class="flex justify-between text-xs text-slate-500 mt-1">
          <span>${Math.round(u*100)}% do ideal</span>
          <span style="margin-left:${Math.max(0,l*100-30)}%">▲ mínimo (3 meses): ${t.brl(a.minimo)}</span>
          <span>falta ${t.brl(a.falta)}</span>
        </div>
        <div class="flex flex-wrap gap-2 mt-4">
          <button data-act="rv-aporte" class="btn btn-primary">＋ Guardar na reserva</button>
          <button data-act="rv-saldo" class="btn btn-ghost">Atualizar saldo</button>
          <button data-act="rv-meta" class="btn btn-ghost">🎯 ${m().metas().some(d=>d.tipo==="classes"&&d.classes?.[0]==="reserva")?"Atualizar meta":"Criar meta"}</button>
        </div>`)}

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        ${$(`
          ${F("relogio","amber","Quanto tempo a reserva deve cobrir?")}
          <p class="text-xs text-slate-500 mt-0.5 mb-3">Quanto menos estável a renda, mais meses. Escolha o que descreve a sua situação.</p>
          <div class="space-y-2">${o}</div>`)}
        ${$(`
          ${F("alvo","orange","Plano para chegar lá")}
          ${a.sobraMediana>0?`
            <p class="text-sm text-slate-600 mt-1">Nos meses analisados sobrou, em geral, <b class="tabular-nums">${t.brl(a.sobraMediana)}</b> por mês. Guardar metade disso é um bom começo.</p>`:`
            <div class="text-sm bg-amber-50 text-amber-900 rounded-xl px-3 py-2 mt-2"><span aria-hidden="true">!</span>
              Nos meses analisados as despesas passaram da renda (em geral <b class="tabular-nums">${t.brl(a.sobraMediana)}</b> por mês).
              Antes da reserva, é preciso abrir espaço: os gastos <b>não essenciais</b> somam cerca de <b class="tabular-nums">${t.brl(a.naoEssencialMediana)}</b> por mês — reduzir parte deles é o caminho mais rápido.</div>`}
          <label class="field mt-3"><span>Quanto vou guardar por mês (R$)</span>
            <input id="rv-aporte" class="input tabular-nums" inputmode="decimal" value="${a.aporte?t.decimalInput(a.aporte):""}" placeholder="${a.sugerido?t.decimalInput(a.sugerido):"0,00"}"></label>
          <p class="text-sm mt-3" id="rv-prazo">${a.falta<=0?'<span class="text-emerald-800">✓ Reserva completa. Agora é manter: reponha sempre que usar.</span>':a.prazo?`Guardando <b class="tabular-nums">${t.brl(a.aporte)}</b> por mês, você chega lá em <b>${a.prazo} ${a.prazo===1?"mês":"meses"}</b> (${e}).${a.prazo>36?' <span class="text-amber-800">Prazo longo: comece pelo mínimo de 3 meses.</span>':""}`:"Informe quanto pretende guardar por mês para ver o prazo."}</p>
          <p class="text-xs text-slate-500 mt-3"><b>Onde guardar:</b> aplicações de <b>baixo risco</b> e <b>resgate no mesmo dia</b>, separadas da conta do dia a dia — rendendo pelo menos perto da Selic/CDI. Rentabilidade alta não é o objetivo; ter o dinheiro na hora é.</p>`)}
      </div>

      ${$(`
        ${F("lista","blue",`Como chegamos em ${t.brl(a.base)} por mês`)}
        <dl class="text-sm grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 mt-2 tabular-nums">
          <dt>Custo essencial do mês <span class="text-slate-500">(percentil 75 de ${a.janela} ${a.janela===1?"mês":"meses"})</span></dt><dd class="text-right">${t.brl(a.p75)}</dd>
          <dt>+ Parcelas já assumidas <span class="text-slate-500">(média dos próximos 6 meses, fora do essencial)</span></dt><dd class="text-right">${t.brl(a.compromissos)}</dd>
          <dt class="font-semibold border-t border-slate-200 pt-1">= Custo essencial por mês</dt><dd class="font-semibold border-t border-slate-200 pt-1 text-right">${t.brl(a.base)}</dd>
        </dl>
        <p class="text-xs text-slate-500 mt-2">Para comparar: média ${t.brl(a.media)} · mediana ${t.brl(a.mediana)} do essencial; gasto total médio ${t.brl(a.totalMedia)}.</p>
        <div class="flex items-start justify-between gap-3 flex-wrap mt-4 mb-2">
          <h4 class="text-sm font-semibold">Gastos por mês</h4>
          ${Fin.charts.legend([{label:"Essencial",color:"#2a78d6"},{label:"Não essencial",color:"#c3c2b7"}])}
        </div>
        <div id="rv-grafico" class="w-full min-w-0 overflow-hidden"></div>
        <details class="mt-3">
          <summary class="text-xs text-slate-500 flex items-center gap-1"><span class="chev">▸</span> Por que esse método</summary>
          <ul class="text-xs text-slate-600 mt-2 space-y-1.5 list-disc pl-5">
            <li><b>Só o essencial:</b> numa emergência (perda de renda, doença) você corta o supérfluo. Conta o que não dá para cortar: moradia, mercado, saúde, educação, contas da casa e dívidas já contratadas. A classificação vem das suas categorias; ajuste na lista abaixo.</li>
            <li><b>Cartão pela categoria de cada compra:</b> a fatura mistura mercado com lazer e varia muito. O app separa cada compra pela categoria e só soma as essenciais. Juros, IOF e multa do cartão ficam de fora.</li>
            <li><b>Percentil 75 em vez da média:</b> gasto variável oscila. O percentil 75 é o valor que cobre 3 de cada 4 meses observados — mais seguro que a média, sem ser puxado por um mês fora da curva.</li>
            <li><b>Só meses completos:</b> entram os meses fechados com receitas e despesas lançadas por inteiro (até 12). Meses só com compras do cartão ou lançados pela metade ficam de fora.</li>
            <li><b>Parcelas já assumidas:</b> compras parceladas não essenciais continuam chegando mesmo numa emergência — entram pela média dos próximos 6 meses.</li>
            <li><b>Meses de cobertura:</b> 3 a 12 conforme a estabilidade da renda; 6 meses para renda estável é a recomendação mais comum de educadores e planejadores financeiros.</li>
          </ul>
        </details>`)}

      ${$(`
        ${F("etiqueta","amber","O que entra no custo essencial")}
        <p class="text-xs text-slate-500 mt-0.5 mb-2">Marque o que você continuaria pagando numa emergência. Valores por mês nos ${a.janela} meses analisados.</p>
        <div class="table-wrap -mx-4 px-4">
          <table>
            <thead><tr><th>Categoria</th><th class="text-right">Mediana</th><th class="text-right">Percentil 75</th><th>Tipo</th><th class="text-right">No cartão</th><th>Origem</th></tr></thead>
            <tbody>${M}</tbody>
          </table>
        </div>
        ${Object.keys(a.cfg.essenciais||{}).length?'<button data-act="rv-padrao" class="text-xs text-prim-700 font-medium hover:underline mt-2">Voltar à classificação das categorias</button>':""}`)}`}function X(a){const s=Math.abs(a.diferenca)<.01;return`
      ${F("cofrinho","emerald",`Aportes de ${t.monthShort(Fin.state.mes)}`,"mb-1")}
      <p class="text-xs text-slate-500 mb-2">Conferência: Lançamentos (categorias de investimento) × carteira.</p>
      <dl class="text-sm grid grid-cols-[1fr_auto] gap-y-1 tabular-nums">
        <dt class="text-slate-500">Lançado nos Lançamentos</dt><dd>${t.brl(a.lancado)}</dd>
        <dt class="text-slate-500">Registrado na carteira</dt><dd>${t.brl(a.registrado)}</dd>
        <dt class="font-medium">Diferença</dt><dd class="font-medium ${s?"text-emerald-700":"text-amber-800"}">${s?"✓ ":"! "}${t.brl(a.diferenca)}</dd>
      </dl>
      <p class="text-xs text-slate-500 mt-2">${a.lancamentos.length} lançamento(s) de aporte · compras ${t.brl(a.entra)} · vendas/resgates ${t.brl(a.sai)}</p>`}function K(a){const s=a.patrimonio||1,r=m().config("alocacao")?.ideal||{},n=new Map;for(const e of a.abertas){const o=n.get(e.classe)||[];o.push({tipo:"ativo",p:e}),n.set(e.classe,o)}for(const e of a.contasSaldo){const o=n.get(e.classe)||[];o.push({tipo:"saldo",c:e}),n.set(e.classe,o)}const b=a.posicoes.filter(e=>e.qtd===0&&e.ops>0);if(!n.size)return $(`<p class="text-sm text-slate-600">Nenhum ativo ainda. Lance uma <b>compra</b> ou carregue sua <b>posição atual</b> colando a lista (ticker, quantidade e preço médio).</p>
        <div class="flex flex-wrap gap-2 mt-3"><button data-act="carga" class="btn btn-primary">📥 Carregar posição atual</button>
        <button data-act="novo-mov" class="btn btn-ghost">＋ Movimentação</button></div>`);const u=m().CLASSES.map(e=>e.id),l=[...n.entries()].sort((e,o)=>u.indexOf(e[0])-u.indexOf(o[0])).map(([e,o])=>{const x=m().classe(e),M=o.reduce((y,w)=>y+(w.p?w.p.valor:w.c.valor),0),d=o.reduce((y,w)=>y+(w.p?w.p.custoBRL:Math.max(0,w.c.investido)),0),C=d>0?(M-d)/d:null;return o.sort((y,w)=>(w.p?.valor??w.c.valor)-(y.p?.valor??y.c.valor)),`
        <section class="bg-white rounded-2xl shadow-sm min-w-0 overflow-hidden">
          <header class="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 border-b border-slate-100">
            <h3 class="font-semibold mr-auto">${x.icone} ${v(x.nome)} <span class="text-sm text-slate-400 font-normal">(${o.length})</span></h3>
            <span class="text-sm tabular-nums">${t.brl(M)}</span>
            <span class="text-sm tabular-nums ${L(C)}">${j(C)}</span>
            <span class="text-xs text-slate-500 tabular-nums">${t.pct(M/s)}${r[e]?` / ${t.pct(r[e]/100)}`:""}</span>
          </header>
          <div class="table-wrap">
            <table class="w-full">
              <thead><tr><th>Ativo</th><th class="text-right">Qtd</th><th class="text-right">Preço médio</th><th class="text-right">Preço atual</th><th class="text-right">Valor</th><th class="text-right">Rent.</th><th class="text-right">% cart.</th></tr></thead>
              <tbody>${o.map(y=>y.p?W(y.p,s):Z(y.c,s)).join("")}</tbody>
            </table>
          </div>
        </section>`}).join("");return`
      <div class="flex flex-wrap gap-3 text-sm px-1">
        <span class="text-slate-500 mr-auto">${a.abertas.length} ativos · ${a.contasSaldo.length} contas por saldo</span>
        <button data-act="carga" class="text-prim-700 font-semibold hover:underline">📥 Carregar posição (colar lista)</button>
        <button data-act="precos" class="text-prim-700 font-semibold hover:underline">🏷️ Atualizar preços</button>
      </div>
      ${l}
      ${b.length?`<details class="bg-white rounded-2xl shadow-sm p-4"><summary class="cursor-pointer text-sm font-medium">Posições encerradas (${b.length})</summary>
        <ul class="mt-2 text-sm divide-y divide-slate-100">${b.map(e=>`<li><button data-ativo="${e.ativo.id}" class="w-full flex justify-between py-1.5 hover:bg-slate-50">
          <span>${v(e.ativo.ticker)} <span class="text-xs text-slate-400">${v(e.conta?.nome||"")}</span></span>
          <span class="tabular-nums ${L(e.realizado)}">realizado ${t.brl(e.realizado)} · proventos ${t.brl(e.proventos)}</span></button></li>`).join("")}</ul></details>`:""}`}function W(a,s){const r=a.ativo;return`<tr data-ativo="${r.id}" class="cursor-pointer hover:bg-emerald-50/60">
      <td><div class="font-medium">${v(r.ticker)}</div><div class="text-[11px] text-slate-400">${v(a.conta?.nome||"")}${r.nome?` · ${v(r.nome)}`:""}</div></td>
      <td class="num">${t.qtd(a.qtd)}</td>
      <td class="num">${t.moeda(a.pm,a.moeda)}</td>
      <td class="num">${a.semCotacao?'<span class="text-amber-800">! sem preço</span>':`${t.moeda(r.preco,a.moeda)}<div class="text-[11px] text-slate-400">${t.date(r.precoEm).slice(0,5)}</div>`}</td>
      <td class="num font-medium">${t.brl(a.valor)}${a.moeda==="USD"?`<div class="text-[11px] text-slate-400">${t.moeda(a.valorMoeda,"USD")}</div>`:""}</td>
      <td class="num ${L(a.rent)}">${j(a.rent)}</td>
      <td class="num text-slate-500">${t.pct(a.valor/s)}</td>
    </tr>`}function Z(a,s){return`<tr data-conta-saldo="${a.conta.id}" class="cursor-pointer hover:bg-emerald-50/60">
      <td><div class="font-medium">${a.conta.icone||"🏦"} ${v(a.conta.nome)}</div><div class="text-[11px] text-slate-400">${a.ultimoSaldo?`saldo em ${t.date(a.ultimoSaldo)}`:"aportes − resgates"}</div></td>
      <td class="num">—</td><td class="num text-slate-500">aplicado<br>${t.brl(a.investido)}</td><td class="num">—</td>
      <td class="num font-medium">${t.brl(a.valor)}</td>
      <td class="num ${L(a.rent)}">${j(a.rent)}</td>
      <td class="num text-slate-500">${t.pct(a.valor/s)}</td>
    </tr>`}function aa(a){const s=a.proventos,r=m().metas().find(n=>n.tipo==="proventos");return`
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${S("Total recebido",t.brl(s.total),"desde o início")}
        ${S("Últimos 12 meses",t.brl(s.doze),`média ${t.brl(s.mediaMensal)}/mês${r?` / meta ${t.brl(r.alvo)}`:""}`)}
        ${S("Este mês",t.brl(s.mes),t.monthShort(t.currentYM()))}
        ${S("A receber",t.brl(s.totalAReceber),`${s.aReceber.length} provisionado(s)`)}
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        ${$(`<div class="flex items-start justify-between gap-3 flex-wrap mb-3">${F("moedas","emerald","Proventos por mês")}
          ${Fin.charts.legend([{label:"Recebido",color:q.proventos}])}</div>
          <div id="inv-proventos" class="w-full min-w-0 overflow-hidden"></div>`)}
        ${$(`${F("barras","blue","Por ativo (12 meses)","mb-3")}${s.porAtivo.length?Fin.charts.hbars(s.porAtivo.slice(0,10)):'<p class="text-sm text-slate-500">Nenhum provento nos últimos 12 meses.</p>'}`)}
      </div>
      ${$(`<div class="flex items-center justify-between mb-2">${F("lista","slate","Meus proventos")}
        <button data-act="novo-provento" class="text-sm text-prim-700 font-semibold hover:underline">＋ Provento</button></div>
        ${s.lista.length?`<div class="table-wrap"><table class="w-full"><thead><tr><th>Data</th><th>Ativo</th><th>Tipo</th><th class="text-right">Valor</th><th class="text-right">Em R$</th><th>Situação</th></tr></thead>
        <tbody>${s.lista.slice(0,60).map(n=>`<tr data-mov="${n.mov.id}" class="cursor-pointer hover:bg-emerald-50/60">
          <td class="tabular-nums">${t.date(n.data)}</td><td class="font-medium">${v(n.ativo?.ticker||"—")}</td>
          <td>${v({dividendo:"Dividendo",jcp:"JCP",rendimento:"Rendimento",outro:"Outro"}[n.mov.subtipo]||"Provento")}</td>
          <td class="num">${t.moeda(n.valorMoeda,n.moeda)}</td><td class="num">${t.brl(n.valor)}</td>
          <td>${n.futuro?'<span class="text-slate-500">○ A receber</span>':'<span class="text-emerald-700">✓ Recebido</span>'}</td></tr>`).join("")}</tbody></table></div>`:'<p class="text-sm text-slate-500">Nenhum provento registrado. Use “＋ Provento” (ou, na Etapa 3, a importação das notas).</p>'}`)}`}function ta(a){const s=m().acumulada(a.slice(-12)),r=m().acumulada(a),n=[...a].reverse().find(o=>o.rent!=null),b=[...new Set(a.map(o=>o.ym.slice(0,4)))].sort().reverse(),u=new Map(a.map(o=>[o.ym,o])),l=o=>{if(o==null)return'<td class="num text-slate-300">—</td>';const x=Math.min(1,Math.abs(o)/.06);return`<td class="num" style="background:${o>=0?`rgba(12,163,12,${.08+x*.3})`:`rgba(208,59,59,${.08+x*.3})`}">${o<0?"−":""}${t.pct(Math.abs(o))}</td>`},e=Fin.storage.list("invHist").filter(o=>o.informado&&!o.fonte).sort((o,x)=>x.id.localeCompare(o.id));return`
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
        ${S("Acumulada",r!=null?`<span class="${L(r)}">${j(r)}</span>`:"—","desde o 1º mês com histórico")}
        ${S("Últimos 12 meses",s!=null?`<span class="${L(s)}">${j(s)}</span>`:"—","composta mês a mês")}
        <div class="col-span-2 lg:col-span-1">${S("Último mês",n?`<span class="${L(n.rent)}">${j(n.rent)}</span>`:"—",n?t.monthLong(n.ym):"sem dados")}</div>
      </div>
      ${$(`<div class="flex items-center justify-between gap-2 mb-2 flex-wrap">${F("linha","emerald","Rentabilidade mês a mês")}
        <button data-act="foto" class="text-sm text-prim-700 font-semibold hover:underline">＋ Patrimônio de mês passado</button></div>
        ${a.some(o=>o.rent!=null)?`<div class="table-wrap"><table class="w-full"><thead><tr><th>Ano</th>${["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"].map(o=>`<th class="text-right">${o}</th>`).join("")}<th class="text-right">Ano</th></tr></thead>
          <tbody>${b.map(o=>{const x=Array.from({length:12},(d,C)=>u.get(`${o}-${String(C+1).padStart(2,"0")}`)),M=m().acumulada(x.filter(Boolean));return`<tr><td class="font-medium">${o}</td>${x.map(d=>l(d?.rent??null)).join("")}${l(M)}</tr>`}).join("")}</tbody></table></div>`:'<p class="text-sm text-slate-500">A rentabilidade aparece quando houver o patrimônio de dois meses seguidos. O app guarda o deste mês sozinho; para os anteriores, informe o patrimônio (ex.: copiando do Investidor 10).</p>'}
        <p class="text-xs text-slate-500 mt-2">Cálculo: (patrimônio final − inicial − aportes líquidos + proventos) ÷ (patrimônio inicial + metade dos aportes). Acumulado = composto.</p>`)}
      ${e.length?$(`${F("calendario","slate","Meses informados","mb-2")}<ul class="text-sm divide-y divide-slate-100">${e.map(o=>`
        <li><button data-foto="${o.id}" class="w-full flex justify-between py-1.5 hover:bg-slate-50"><span>${t.monthLong(o.id)}</span>
          <span class="tabular-nums">${t.brl(o.patrimonio)}${o.manual?` <span class="text-xs text-slate-400">aplicado ${t.brl(o.investido)}</span>`:""}</span></button></li>`).join("")}</ul>`):""}`}function ea(){const a=new Map(m().ativos().map(e=>[e.id,e])),s=new Map(m().contas().map(e=>[e.id,e])),r=Fin.parsers.normalize(A.busca),n=Fin.state.invFiltroAtivo||"",b=new Set(m().contasVisiveis().map(e=>e.id)),u=m().movs().filter(e=>!(!b.has(e.conta||a.get(e.ativo)?.conta)||A.conta&&e.conta!==A.conta||A.tipo&&e.tipo!==A.tipo||n&&e.ativo!==n||r&&!Fin.parsers.normalize(`${a.get(e.ativo)?.ticker||""} ${e.obs||""} ${s.get(e.conta)?.nome||""}`).includes(r))).sort((e,o)=>(o.data||"").localeCompare(e.data||"")||(o.criadoEm||"").localeCompare(e.criadoEm||"")),l=(e,o,x)=>`<option value="${v(e)}" ${e===x?"selected":""}>${v(o)}</option>`;return`
      ${$(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <input id="mv-busca" type="search" class="input col-span-2 lg:col-span-1" placeholder="Buscar ticker…" value="${v(A.busca)}" aria-label="Buscar">
        <select id="mv-conta" class="input" aria-label="Conta">${l("","Todas as contas",A.conta)}${m().contasVisiveis().map(e=>l(e.id,e.nome,A.conta)).join("")}</select>
        <select id="mv-tipo" class="input" aria-label="Tipo">${l("","Todos os tipos",A.tipo)}${Object.entries(m().TIPOS).map(([e,o])=>l(e,o.nome,A.tipo)).join("")}</select>
        ${n?`<button data-act="limpar-ativo" class="chip is-active">${v(a.get(n)?.ticker||"")} ✕</button>`:""}
      </div>`)}
      <p class="text-xs text-slate-500 px-1">${u.length} movimentações</p>
      ${$(u.length?`<div class="table-wrap"><table class="w-full"><thead><tr><th>Data</th><th>Tipo</th><th>Ativo / conta</th><th class="text-right">Qtd</th><th class="text-right">Preço</th><th class="text-right">Total</th><th class="text-right">Em R$</th></tr></thead>
        <tbody>${u.slice(0,300).map(e=>{const o=a.get(e.ativo),x=s.get(e.conta),M=o?.moeda||x?.moeda||"BRL",d=m().TIPOS[e.tipo]||{nome:e.tipo,icone:""},C=Number(e.qtd)||0,y=Number(e.preco)||0,w=e.valor!=null?Number(e.valor):e.tipo==="venda"?C*y-(e.taxas||0):C*y+(e.taxas||0),E=M==="USD"?e.cambio||m().dolarAtual()||0:1,i=e.tipo==="desdobramento"||e.tipo==="grupamento";return`<tr data-mov="${e.id}" class="cursor-pointer hover:bg-emerald-50/60">
            <td class="tabular-nums">${t.date(e.data)}</td>
            <td>${d.icone} ${d.nome}${{nota:"nota",i10:"Investidor 10",nomad:"extrato Nomad"}[e.origem]?` <span class="text-[11px] text-slate-400">${{nota:"nota",i10:"Investidor 10",nomad:"extrato Nomad"}[e.origem]}</span>`:""}</td>
            <td><span class="font-medium">${v(o?.ticker||x?.nome||"—")}</span>${o?` <span class="text-[11px] text-slate-400">${v(x?.nome||"")}</span>`:""}</td>
            <td class="num">${i?`1 → ${t.qtd(e.fator)}`:e.qtd!=null?t.qtd(e.qtd):""}</td>
            <td class="num">${e.preco!=null?t.moeda(e.preco,M):""}</td>
            <td class="num">${i?"":t.moeda(w,M)}</td>
            <td class="num">${i||M!=="USD"?"":t.brl(w*E)}</td></tr>`}).join("")}</tbody></table></div>`:'<p class="text-sm text-slate-500">Nenhuma movimentação com estes filtros.</p>')}`}function O(a,s=null){const r=m().metasVisiveis().map(l=>m().progressoMeta(l,a)).sort((l,e)=>l.concluida-e.concluida||e.pct-l.pct),n=Fin.finance.temCasal(),b=l=>{if(!n)return"";const e=m().donoMeta(l);return e==="casal"?'<span class="text-[11px] px-1.5 py-0.5 rounded-full bg-prim-50 text-prim-800 shrink-0">dos dois</span>':`<span class="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">de ${v(Fin.membros.primeiroNome(Fin.membros.porId(e)))}</span>`};if(s&&!r.length)return"";const u=s?r.slice(0,s):r;return`
      <div class="flex items-center justify-between px-1">${F("alvo","orange","Metas")}
        <span class="flex gap-3">${s&&r.length>s?'<button data-aba="metas" class="text-sm text-slate-500 hover:underline">ver todas</button>':""}
        <button data-act="nova-meta" class="text-sm text-prim-700 font-semibold hover:underline">＋ Meta</button></span></div>
      ${u.length?`<div class="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">${u.map(l=>`
        <button data-meta="${l.meta.id}" class="block w-full text-left bg-white rounded-2xl shadow-sm p-4 hover:ring-2 hover:ring-emerald-200 min-w-0">
          <div class="flex items-center gap-2"><span class="font-medium truncate flex-1">${v(l.meta.nome)}</span>${b(l.meta)}
            <span class="text-sm font-semibold ${l.concluida?"text-emerald-700":""}">${l.concluida?"✓ ":""}${t.pct(l.pct)}</span></div>
          <div class="h-2 bg-slate-100 rounded mt-2" aria-hidden="true"><div class="h-2 rounded" style="width:${l.pct*100}%;background:${l.concluida?q.ganho:q.aplicado}"></div></div>
          <dl class="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs mt-2 tabular-nums">
            <dt class="text-slate-500">${l.meta.tipo==="proventos"?"Média mensal":"Atual"}</dt><dd class="text-right">${t.brl(l.atual)}</dd>
            <dt class="text-slate-500">Objetivo</dt><dd class="text-right">${t.brl(l.alvo)}</dd>
            <dt class="text-slate-500">Faltam</dt><dd class="text-right">${t.brl(l.falta)}</dd>
            ${l.meta.aporteMensal?`<dt class="text-slate-500">Aporte mensal</dt><dd class="text-right">${t.brl(l.meta.aporteMensal)}</dd>`:""}
            ${l.conclusao?`<dt class="text-slate-500">Conclusão estimada</dt><dd class="text-right font-medium">${t.monthLong(l.conclusao)}</dd>`:""}
          </dl>
        </button>`).join("")}</div>`:'<p class="text-sm text-slate-500 px-1">Nenhuma meta ainda. Ex.: patrimônio de R$ 15 mil, R$ 100/mês de proventos, R$ 6 mil no exterior.</p>'}`}function sa(){return`<div class="space-y-4">
      ${$(`<div class="text-4xl" aria-hidden="true">💼</div>
        <h2 class="text-xl font-semibold mt-2">Seus investimentos junto com o orçamento</h2>
        <p class="text-sm text-slate-600 mt-2">Patrimônio, alocação, proventos, rentabilidade e metas — e os aportes conferidos com os Lançamentos (sem contar como despesa).</p>
        <ul class="text-sm text-slate-600 mt-3 space-y-1 list-disc pl-5">
          <li><b>Corretoras</b> (ex.: Rico em reais, Nomad em dólar): ativos com quantidade, preço médio e preço atual.</li>
          <li><b>Contas por saldo</b> (reserva de emergência, previdência, CDB): você informa aportes, resgates e o saldo.</li>
          <li>O dólar é atualizado sozinho; o custo em dólar usa a PTAX do dia da compra.</li>
        </ul>
        <div class="flex flex-wrap gap-2 mt-4">
          <button data-act="importar" class="btn btn-primary">📥 Importar (Investidor 10 / extratos Nomad)</button>
          <button data-act="comecar" class="btn btn-ghost">Começar com Rico, Nomad e Reserva</button>
          <button data-act="nova-conta" class="btn btn-ghost">Criar outra conta</button>
        </div>`)}
    </div>`}function oa(a,{signal:s}){if(!m().temDados()){a.innerHTML=sa(),a.addEventListener("click",i=>{const c=i.target.closest("[data-act]")?.dataset.act;c==="comecar"&&(m().criarContasPadrao(),Fin.ui.toast("Contas criadas: Rico, Nomad e Reserva de emergência."),Fin.router.refresh()),c==="nova-conta"&&f().conta(),c==="importar"&&Fin.importarInv.abrir()},{signal:s});return}m().garantirCategoria();const r=location.hash.match(/[?&]aba=(\w+)/);r&&(Fin.state.invAba=r[1],history.replaceState(null,"","#/investimentos"));const n=Fin.state.invAba||"resumo",b=m().resumo();m().salvarFoto(b);const u=m().historico(b),l={resumo:()=>T(b,u),reserva:_,ativos:()=>K(b),proventos:()=>aa(b),rent:()=>ta(u),movs:ea,metas:()=>O(b)}[n]||(()=>T(b,u));a.innerHTML=`<div class="space-y-4">${B(n)}${l()}</div>`;const e=a.querySelector("#inv-evolucao");if(e){const i=u.slice(-12).map(p=>({ym:p.ym,aplicado:Math.max(0,Math.min(p.aplicado,p.patrimonio??p.aplicado)),ganho:p.patrimonio!=null?Math.max(0,p.patrimonio-p.aplicado):null,saldo:p.patrimonio,extra:p.patrimonio!=null&&p.patrimonio<p.aplicado?`Perda: ${t.brl(p.patrimonio-p.aplicado)}`:p.rent!=null?`Rentabilidade do mês: ${j(p.rent)}`:""})),c=()=>Fin.charts.columns(e,i.length?i:[{ym:t.currentYM(),aplicado:0,ganho:0}],{stacked:!0,totalLabel:"Patrimônio",label:"Evolução do patrimônio",series:[{key:"aplicado",label:"Valor aplicado",color:q.aplicado},{key:"ganho",label:"Ganho de capital",color:q.ganho}]});c();const h=new ResizeObserver(()=>requestAnimationFrame(c));h.observe(e),s.addEventListener("abort",()=>h.disconnect())}const o=a.querySelector("#inv-proventos");if(o){const i=t.currentYM(),c=Array.from({length:12},(P,z)=>{const R=t.addMonths(i,z-11);return{ym:R,valor:b.proventos.porMes[R]||0}}),h=()=>Fin.charts.columns(o,c,{label:"Proventos por mês",series:[{key:"valor",label:"Recebido",color:q.proventos}]});h();const p=new ResizeObserver(()=>requestAnimationFrame(h));p.observe(o),s.addEventListener("abort",()=>p.disconnect())}const x=a.querySelector("#rv-grafico");if(x){const i=Fin.reserva.calcular(),c=()=>Fin.charts.columns(x,i.meses.map(p=>({ym:p.ym,essencial:p.essencial,outros:p.outros,saldo:p.total})),{stacked:!0,totalLabel:"Total",label:"Gastos essenciais e não essenciais por mês",series:[{key:"essencial",label:"Essencial",color:"#2a78d6"},{key:"outros",label:"Não essencial",color:"#c3c2b7"}]});c();const h=new ResizeObserver(()=>requestAnimationFrame(c));h.observe(x),s.addEventListener("abort",()=>h.disconnect())}a.querySelectorAll('input[name="rv-dono"]').forEach(i=>i.addEventListener("change",c=>{Fin.reserva.salvar({dono:c.target.value}),Fin.router.refresh()})),a.querySelectorAll('input[name="rv-meses"]').forEach(i=>i.addEventListener("change",c=>{Fin.reserva.salvar({meses:Number(c.target.value)}),Fin.router.refresh()})),a.querySelector("#rv-aporte")?.addEventListener("change",i=>{const c=Fin.parsers.toNumber(i.target.value);Fin.reserva.salvar({aporteMensal:c>0?c:null}),Fin.router.refresh()}),a.querySelectorAll("[data-rv-cat]").forEach(i=>i.addEventListener("change",c=>{const h={...Fin.reserva.config().essenciais||{}};h[c.target.dataset.rvCat]=c.target.checked,Fin.reserva.salvar({essenciais:h}),Fin.router.refresh()})),a.querySelector("#mv-busca")?.addEventListener("input",i=>{A.busca=i.target.value;const c=i.target.selectionStart;Fin.router.refresh();const h=document.getElementById("mv-busca");h?.focus(),h?.setSelectionRange(c,c)}),a.querySelector("#mv-conta")?.addEventListener("change",i=>{A.conta=i.target.value,Fin.router.refresh()}),a.querySelector("#mv-tipo")?.addEventListener("change",i=>{A.tipo=i.target.value,Fin.router.refresh()}),a.addEventListener("click",i=>{const c=i.target,h=c.closest("[data-aba]");if(h)return Fin.state.invAba=h.dataset.aba,Fin.router.refresh();const p=c.closest("[data-ativo]");if(p)return f().ativo(p.dataset.ativo);const P=c.closest("[data-mov]");if(P)return f().mov({id:P.dataset.mov});const z=c.closest("[data-conta]");if(z)return f().conta(z.dataset.conta);const R=c.closest("[data-conta-saldo]");if(R)return f().mov({conta:R.dataset.contaSaldo,tipo:"saldo"});const H=c.closest("[data-meta]");if(H)return f().meta(H.dataset.meta);const V=c.closest("[data-foto]");if(V)return f().foto(V.dataset.foto);const g=c.closest("[data-act]")?.dataset.act;if(g)if(g==="novo-mov")f().mov();else if(g==="novo-provento")f().mov({tipo:"provento",conta:m().contas().find(k=>k.tipo==="corretora")?.id});else if(g==="precos")f().precos();else if(g==="importar")Fin.importarInv.abrir();else if(g==="ajuda")Fin.pages.educacao.ajuda((Fin.state.invAba||"resumo")==="reserva"?"reserva":"investimentos");else if(g==="chaves")f().cotacoes();else if(g==="carga")f().carga();else if(g==="nova-conta")f().conta();else if(g==="nova-meta")f().meta();else if(g==="alocacao")f().alocacao();else if(g==="foto")f().foto();else if(g==="limpar-ativo")Fin.state.invFiltroAtivo=null,Fin.router.refresh();else if(g==="dolar")Fin.plano.pode("cotacoes")||Fin.plano.usarHoje("dolar")?d(!0):Fin.plano.avisar("cotacoes");else if(g==="rv-aporte")f().mov({conta:Fin.reserva.garantirConta().id,tipo:"aporte"});else if(g==="rv-saldo")f().mov({conta:Fin.reserva.garantirConta().id,tipo:"saldo"});else if(g==="rv-meta"){Fin.reserva.garantirConta();const k=Fin.reserva.calcular();Fin.reserva.salvarMeta(k),Fin.ui.toast(`Meta “Reserva de emergência”: ${t.brl(k.ideal)}.`),Fin.router.refresh()}else g==="rv-padrao"&&(Fin.reserva.salvar({essenciais:{}}),Fin.router.refresh())},{signal:s});const M=b.abertas.some(i=>i.moeda==="USD");async function d(i=!1){const c=Fin.cotacoes.dolar()?.valor;try{const h=await Fin.cotacoes.atualizarDolar();if(s.aborted)return;const p=a.querySelector("[data-dolar]");p&&(p.innerHTML=I()),i&&Fin.ui.toast(`Dólar: ${t.brl(h.valor)}`),M&&c!==h.valor&&!document.querySelector("#modal-root .modal-panel")&&Fin.router.refresh()}catch{i&&Fin.ui.toast("Não consegui atualizar o dólar (sem internet?).","error")}}const C=Fin.cotacoes.dolar(),y=Fin.plano.pode("cotacoes");y&&(!C||Date.now()-new Date(C.buscadoEm||C.em)>6e4)&&d();const w=Fin.storage.prefs().cotacoesUltima;y&&Fin.cotacoes.temChaves()&&(!w||Date.now()-new Date(w)>30*60*1e3)&&Fin.cotacoes.atualizarPrecos().then(i=>{s.aborted||!i.atualizados||(document.querySelector("#modal-root .modal-panel")||Fin.router.refresh(),i.falhas.length&&console.warn("[cotações]",i.falhas))}).catch(i=>console.warn("[cotações]",i));const E=setInterval(()=>{y&&document.visibilityState==="visible"&&d()},6e4);s.addEventListener("abort",()=>clearInterval(E))}return{title:"Investimentos",render:oa}})();
