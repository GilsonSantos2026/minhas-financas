/*! © 2026 Valoris Financial Intelligence. Todos os direitos reservados. Software proprietário: proibido copiar, reutilizar ou criar obras derivadas (veja LICENSE e termos.html). */
window.Fin=window.Fin||{},Fin.pages=Fin.pages||{},Fin.pages.investimentos=(()=>{const e=Fin.fmt,x=e.esc,p=()=>Fin.inv,g=()=>Fin.forms.inv,U=[["resumo","Resumo"],["reserva","🛟 Reserva"],["ativos","Ativos"],["proventos","Proventos"],["rent","Rentabilidade"],["movs","Movimentações"],["metas","Metas"]],C={aplicado:"#2a78d6",ganho:"#0ca30c",proventos:"#0ca30c"},A={conta:"",tipo:"",busca:""},M=(a,s,r,n="")=>Fin.icones.titulo(a,s,r,{tag:"h3",cls:n}),$=(a,s="")=>`<section class="bg-white rounded-2xl shadow-sm p-4 min-w-0 ${s}">${a}</section>`,L=(a,s,r="",n="")=>`<div class="bg-white rounded-2xl shadow-sm p-3 min-w-0">
    <div class="text-xs text-slate-500">${a}</div><div class="text-lg font-semibold tabular-nums truncate ${n}">${s}</div>
    <div class="text-[11px] text-slate-500 truncate">${r}</div></div>`,q=a=>a>0?"text-emerald-700":a<0?"text-rose-700":"text-slate-600",S=a=>a==null?"—":`${a>0?"▲ ":a<0?"▼ ":""}${e.pct(Math.abs(a))}`;function I(){const a=Fin.cotacoes.dolar();return`<button type="button" data-act="dolar" class="inline-flex items-center gap-2 bg-white rounded-full shadow-sm px-3 py-1.5 text-sm" title="Atualizar dólar">
      <span aria-hidden="true">💵</span><span class="tabular-nums">US$ 1 = <b>${a?e.brl(a.valor):"—"}</b></span>
      <span class="text-xs text-slate-400" data-dolar-idade>${a?Fin.cotacoes.idade(a.em):"sem cotação"}</span><span aria-hidden="true" class="text-slate-400">↻</span></button>`}function B(a){return`
      ${Fin.ui.filtroPessoa()}
      <!-- Redesign v2026-11-19: dólar + ajuda em cima; as 3 ações numa grade de botões grandes. -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="mr-auto hidden md:block">${Fin.icones.titulo("alta","emerald","Investimentos",{cls:"text-xl",tam:"w-9 h-9",ic:"w-5 h-5"})}</div>
        <span data-dolar class="mr-auto md:mr-0">${I()}</span>
        <button data-act="ajuda" class="btn btn-ghost !py-1.5 !px-2.5 bg-white shadow-sm min-h-[40px]" aria-label="Guias: o que são ações, FIIs, renda fixa e reserva" title="Guias rápidos">${Fin.icone("livro","w-4 h-4")}<span class="font-bold">?</span></button>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <button data-act="novo-mov" class="btn btn-primary min-h-[48px] !px-2 text-[13px] sm:text-sm">${Fin.icone("mais","w-4 h-4")} Movimentação</button>
        <button data-act="importar" class="btn btn-ghost bg-white shadow-sm min-h-[48px] !px-2 text-[13px] sm:text-sm">${Fin.icone("upload","w-4 h-4")} Importar</button>
        <button data-act="precos" class="btn btn-ghost bg-white shadow-sm min-h-[48px] !px-2 text-[13px] sm:text-sm">${Fin.icone("etiqueta","w-4 h-4")} Preços</button>
      </div>
      <nav class="chips flex gap-2 overflow-x-auto pb-1" aria-label="Seções">
        ${U.map(([s,r])=>`<button data-aba="${s}" aria-pressed="${a===s}" class="chip !shadow-none border border-slate-200 ${a===s?"is-active !border-transparent":""}">${r}</button>`).join("")}
      </nav>`}function T(a,s){const r=p().acumulada(s.slice(-12)),n=p().acumulada(s),v=s.length?s[s.length-1]:null;return`
      ${a.semCotacao?`<p class="text-sm bg-amber-50 text-amber-900 rounded-xl px-3 py-2"><span aria-hidden="true">!</span> ${a.semCotacao} ativo(s) sem preço — usando o preço médio. <button data-act="precos" class="underline font-medium">Atualizar preços</button></p>`:""}
      ${!Fin.cotacoes.temChaves()&&a.abertas.length?'<p class="text-sm bg-sky-50 text-sky-900 rounded-xl px-3 py-2"><span aria-hidden="true">ⓘ</span> Preços informados à mão. <button data-act="chaves" class="underline font-medium">Ligar cotações automáticas</button> (brapi para B3, Finnhub para EUA).</p>':""}
      ${G(a,r,n,v)}

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        ${Fin.ui.dobra({grupo:"inv",id:"evolucao",icone:"alta",cor:"emerald",titulo:"Evolução do patrimônio",resumo:r!=null?`12 meses: ${S(r)}`:"Últimos 12 meses",corpo:()=>`
            <div class="flex justify-end mb-2">${Fin.charts.legend([{label:"Valor aplicado",color:C.aplicado},{label:"Ganho de capital",color:C.ganho}])}</div>
            <div id="inv-evolucao" class="w-full min-w-0 overflow-hidden"></div>
            <p class="text-xs text-slate-400 mt-1">Últimos 12 meses. Meses sem patrimônio registrado mostram só o aplicado ·
              <button data-act="foto" class="text-prim-700 font-medium hover:underline">informar mês passado</button></p>`})}
        ${(()=>{const i=p().alocacao(a),l=i.filter(u=>u.ideal!=null&&Math.abs(u.atual-u.ideal)>=.05).length,t=[...i].sort((u,f)=>f.valor-u.valor)[0],o=i.length?l?`${l} ${l===1?"classe fora":"classes fora"} do % ideal`:t?`Maior: ${x(t.classe.nome)} (${e.pct(t.atual)})`:"":"Sem ativos ainda";return Fin.ui.dobra({grupo:"inv",id:"alocacao",icone:"pizza",cor:"violet",titulo:"Alocação por classe",resumo:o,corpo:()=>`<div class="flex justify-end mb-2"><button data-act="alocacao" class="text-sm text-prim-700 font-medium hover:underline">Definir % ideal</button></div>${J(i)}`})})()}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        ${$(Q(a))}
        ${$(Y())}
        ${$(K(p().conferenciaAportes(Fin.state.mes)))}
      </div>
      ${O(a,3)}`}function G(a,s,r,n){const v=(t,o,u,f="")=>`
      <div class="rounded-2xl bg-white/[.08] px-3 py-2.5 min-w-0">
        <span class="block text-[12px] text-white/75">${t}</span>
        <span class="block text-[15px] font-semibold tabular-nums whitespace-nowrap mt-0.5 ${f}">${o}</span>
        ${u?`<span class="block text-[11.5px] text-white/65 truncate">${u}</span>`:""}
      </div>`,i=t=>t>0?"text-emerald-200":t<0?"text-rose-200":"",l=[];return a.lucro&&l.push(`${a.lucro>=0?"Você ganhou":"Você perdeu"} <b>${e.brl(Math.abs(a.lucro))}</b> no total (capital ${e.brl(a.ganho)} · proventos ${e.brl(a.proventos.total)}).`),n?.rent!=null&&l.push(`Neste mês: ${S(n.rent)}.`),`
      <section class="hero-topo text-white rounded-3xl shadow-sm p-4 sm:p-5 space-y-3 min-w-0">
        <div>
          <div class="hero-rotulo text-[12px] font-semibold uppercase tracking-wider text-white/75">Patrimônio investido</div>
          <div class="text-[2.4rem] leading-tight font-semibold tracking-tight tabular-nums mt-0.5">${e.brl(a.patrimonio)}</div>
          <span class="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[12.5px] font-medium mt-1.5 ${i(a.variacao)}">${S(a.variacao)} sobre o aplicado</span>
        </div>
        <div class="grid grid-cols-3 gap-2">
          ${v("Aplicado",e.brl(a.investido),"o que você pôs")}
          ${v("Lucro",e.brl(a.lucro),"capital + proventos",i(a.lucro))}
          ${v("12 meses",s!=null?S(s):"—",s!=null?`total ${S(r)}`:"falta histórico",i(s))}
        </div>
        ${l.length?`<p class="text-[13.5px] text-white/85">${l.join(" ")}</p>`:""}
      </section>`}function J(a){return a.length?`<ul class="space-y-3">${a.map(s=>{const r=s.ideal!=null?s.atual-s.ideal:null,n=r!=null&&Math.abs(r)>=.05?`<span class="text-amber-800">${r>0?"▲ acima":"▼ abaixo"} do ideal</span>`:r!=null?'<span class="text-emerald-700">✓ no alvo</span>':"";return`<li class="text-sm">
        <div class="flex items-center gap-2"><span class="truncate flex-1">${s.classe.icone} ${x(s.classe.nome)}</span>
          <span class="tabular-nums">${e.brl(s.valor)}</span></div>
        <div class="relative h-2.5 bg-slate-100 rounded mt-1" aria-hidden="true">
          <span class="absolute inset-y-0 left-0 rounded" style="width:${Math.min(100,s.atual*100)}%;background:${C.aplicado}"></span>
          ${s.ideal!=null?`<span class="absolute -top-1 -bottom-1 w-0.5 bg-slate-800" style="left:${Math.min(100,s.ideal*100)}%"></span>`:""}
        </div>
        <div class="flex justify-between text-xs text-slate-500 mt-0.5"><span>${e.pct(s.atual)}${s.ideal!=null?` / ideal ${e.pct(s.ideal)}`:""}</span>${n}</div>
      </li>`}).join("")}</ul>`:'<p class="text-sm text-slate-500">Sem ativos ainda.</p>'}function Q(a){const s=p().contasVisiveis(),r=a.patrimonio||1,n=Fin.finance.temCasal(),v=i=>{if(!n)return"";const l=p().donoDe(i);if(l==="casal")return`<span class="autor-mini rounded-full grid place-items-center bg-prim-600 text-white shrink-0" title="Conta dos dois">${Fin.icone("usuario","w-2.5 h-2.5")}</span>`;const t=Fin.membros.porId(l);return`<span class="inline-flex shrink-0" title="Conta de ${x(Fin.membros.nome(t)||t.usuario)}">${Fin.membros.avatar(t,{tam:"autor-mini",txt:""})}</span>`};return`
      <div class="flex items-center justify-between mb-2">${M("banco","sky","Por conta")}
        <button data-act="nova-conta" class="text-sm text-prim-700 font-medium hover:underline">＋ Conta</button></div>
      <ul class="divide-y divide-slate-100">${s.map(i=>`
        <li><button data-conta="${i.id}" class="w-full flex items-center gap-2 py-2 text-left text-sm hover:bg-slate-50 rounded">
          <span aria-hidden="true">${i.icone||"🏦"}</span>${v(i)}<span class="flex-1 truncate">${x(i.nome)}
            <span class="text-xs text-slate-400">${i.tipo==="saldo"?"saldo":i.moeda==="USD"?"US$":"R$"}</span></span>
          <span class="tabular-nums">${e.brl(a.porConta[i.id]||0)}</span>
          <span class="text-xs text-slate-400 w-12 text-right">${e.pct((a.porConta[i.id]||0)/r)}</span>
        </button></li>`).join("")}</ul>`}function D(a){const s=a.cobertura;return s==null||!a.base?["○","bg-slate-100 text-slate-600","sem dados de despesas","#94a3b8"]:a.atual>=a.ideal?["✓","bg-emerald-50 text-emerald-800","reserva completa","#0ca30c"]:s>=3?["◐","bg-amber-50 text-amber-800","acima do mínimo (3 meses)","#fab219"]:["!","bg-rose-50 text-rose-700","abaixo do mínimo (3 meses)","#d03b3b"]}const N=a=>a==null?"—":`${a.toLocaleString("pt-BR",{maximumFractionDigits:1})} ${a>=.95&&a<1.05?"mês":"meses"}`;function Y(){const a=Fin.reserva.calcular(),[s,r,n]=D(a);return`
      <div class="flex items-center justify-between mb-2">${M("escudo","emerald","Reserva de emergência")}
        <button data-aba="reserva" class="text-sm text-prim-700 font-medium hover:underline">Ver →</button></div>
      <div class="text-2xl font-semibold tabular-nums">${e.brl(a.atual)}</div>
      <div class="mt-1"><span class="pill ${r}"><span aria-hidden="true">${s}</span>${N(a.cobertura)} · ${n}</span></div>
      <p class="text-xs text-slate-500 mt-2">Ideal: <b class="tabular-nums">${e.brl(a.ideal)}</b> (${a.mesesAlvo} meses × ${e.brl(a.base)} de custo essencial).</p>`}function _(a){if(!Fin.finance.temCasal())return"";const s=Fin.membros,r=[{id:"casal",nome:"Dos dois",av:`<span class="w-7 h-7 rounded-full grid place-items-center bg-prim-600 text-white shrink-0">${Fin.icone("usuario","w-4 h-4")}</span>`},...Fin.cofre.pessoas().map(n=>({id:n.id,nome:`Só de ${s.primeiroNome(s.porId(n.id))||n.usuario}`,av:s.avatar(s.porId(n.id),{tam:"w-7 h-7",txt:"text-[10px]"})}))];return $(`
      <div class="text-sm font-medium mb-2">De quem é esta reserva?</div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="De quem é a reserva">
        ${r.map(n=>`<label class="quem-opcao"><input type="radio" name="rv-dono" value="${x(n.id)}" ${a.dono===n.id?"checked":""}><span>${n.av}<span class="truncate">${x(n.nome)}</span></span></label>`).join("")}
      </div>
      <p class="text-xs text-slate-500 mt-2">${a.dono==="casal"?"Compartilhada: custo essencial da casa inteira e o que está guardado nas contas de reserva de vocês dois.":"Individual: só a parte desta pessoa nas despesas (o que ela pagou + a parte dela nas contas dos dois) e só as contas de reserva dela."}</p>`)}function X(){const a=Fin.reserva.calcular();if(!a.janela)return $(`${M("escudo","emerald","Reserva de emergência")}
        <p class="text-sm text-slate-500 mt-1">Ainda não há meses completos de despesas para calcular o valor ideal. Lance receitas e despesas de pelo menos um mês inteiro.</p>`);const[s,r,n,v]=D(a),i=a.ideal>0?Math.min(1,a.atual/a.ideal):0,l=a.ideal>0?Math.min(1,a.minimo/a.ideal):0,t=a.prazo?e.monthLong(e.addMonths(e.currentYM(),a.prazo)).toLowerCase():"",o=Fin.reserva.PERFIS.map(c=>`
      <label class="flex items-start gap-3 rounded-xl border ${c.meses===a.mesesAlvo?"border-prim-500 bg-prim-50/50":"border-slate-200"} p-3 cursor-pointer">
        <input type="radio" name="rv-meses" value="${c.meses}" ${c.meses===a.mesesAlvo?"checked":""} class="accent-prim-600 mt-1">
        <span class="flex-1 min-w-0">
          <span class="block text-sm font-semibold">${c.meses} meses · ${c.nome}</span>
          <span class="block text-xs text-slate-500">${c.desc}</span>
        </span>
        <span class="text-sm font-semibold tabular-nums whitespace-nowrap">${e.brl(Math.ceil(a.base*c.meses/100)*100)}</span>
      </label>`).join(""),u={escolha:"sua escolha",essencial:"essencial",compromisso:"compromisso"},f=a.categorias.map(c=>`
      <tr class="${c.essencial?"":"text-slate-400"}">
        <td><label class="inline-flex items-center gap-2 cursor-pointer">
          <input type="checkbox" data-rv-cat="${x(c.nome)}" ${c.essencial?"checked":""} class="accent-prim-600 w-4 h-4">
          <span class="truncate max-w-[11rem]">${c.icone?`${c.icone} `:""}${x(c.nome)}</span></label></td>
        <td class="num">${e.brl(c.mediana)}</td>
        <td class="num">${e.brl(c.p75)}</td>
        <td>${c.variavel?"〰 variável":"▬ fixa"}</td>
        <td class="num">${c.pctCartao>=.05?`${Math.round(c.pctCartao*100)}%`:"—"}</td>
        <td class="text-xs">${c.motivo?u[c.motivo]:""}</td>
      </tr>`).join("");return`
      ${_(a)}
      ${$(`
        <div class="flex items-start gap-3 flex-wrap">
          <div class="flex-1 min-w-[14rem]">
            <div class="text-sm text-slate-500">Reserva ideal · ${a.mesesAlvo} meses (${x(a.perfil.nome.toLowerCase())})</div>
            <div class="text-[40px] leading-tight font-semibold tracking-tight tabular-nums">${e.brl(a.ideal)}</div>
            <div class="text-sm text-slate-500">${a.mesesAlvo} × <b class="text-slate-700">${e.brl(a.base)}</b> de custo essencial por mês</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-slate-500">Você tem</div>
            <div class="text-2xl font-semibold tabular-nums">${e.brl(a.atual)}</div>
            <span class="pill ${r}"><span aria-hidden="true">${s}</span>${N(a.cobertura)} · ${n}</span>
          </div>
        </div>
        <div class="relative mt-4" aria-label="Progresso da reserva: ${Math.round(i*100)}%">
          <div class="h-3 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full" style="width:${i*100}%;background:${v}"></div></div>
          <span class="absolute -top-1 -bottom-1 w-0.5 bg-slate-700" style="left:${l*100}%" aria-hidden="true"></span>
        </div>
        <div class="flex justify-between text-xs text-slate-500 mt-1">
          <span>${Math.round(i*100)}% do ideal</span>
          <span style="margin-left:${Math.max(0,l*100-30)}%">▲ mínimo (3 meses): ${e.brl(a.minimo)}</span>
          <span>falta ${e.brl(a.falta)}</span>
        </div>
        <div class="flex flex-wrap gap-2 mt-4">
          <button data-act="rv-aporte" class="btn btn-primary">＋ Guardar na reserva</button>
          <button data-act="rv-saldo" class="btn btn-ghost">Atualizar saldo</button>
          <button data-act="rv-meta" class="btn btn-ghost">🎯 ${p().metas().some(c=>c.tipo==="classes"&&c.classes?.[0]==="reserva")?"Atualizar meta":"Criar meta"}</button>
        </div>`)}

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        ${$(`
          ${M("relogio","amber","Quanto tempo a reserva deve cobrir?")}
          <p class="text-xs text-slate-500 mt-0.5 mb-3">Quanto menos estável a renda, mais meses. Escolha o que descreve a sua situação.</p>
          <div class="space-y-2">${o}</div>`)}
        ${$(`
          ${M("alvo","orange","Plano para chegar lá")}
          ${a.sobraMediana>0?`
            <p class="text-sm text-slate-600 mt-1">Nos meses analisados sobrou, em geral, <b class="tabular-nums">${e.brl(a.sobraMediana)}</b> por mês. Guardar metade disso é um bom começo.</p>`:`
            <div class="text-sm bg-amber-50 text-amber-900 rounded-xl px-3 py-2 mt-2"><span aria-hidden="true">!</span>
              Nos meses analisados as despesas passaram da renda (em geral <b class="tabular-nums">${e.brl(a.sobraMediana)}</b> por mês).
              Antes da reserva, é preciso abrir espaço: os gastos <b>não essenciais</b> somam cerca de <b class="tabular-nums">${e.brl(a.naoEssencialMediana)}</b> por mês — reduzir parte deles é o caminho mais rápido.</div>`}
          <label class="field mt-3"><span>Quanto vou guardar por mês (R$)</span>
            <input id="rv-aporte" class="input tabular-nums" inputmode="decimal" value="${a.aporte?e.decimalInput(a.aporte):""}" placeholder="${a.sugerido?e.decimalInput(a.sugerido):"0,00"}"></label>
          <p class="text-sm mt-3" id="rv-prazo">${a.falta<=0?'<span class="text-emerald-800">✓ Reserva completa. Agora é manter: reponha sempre que usar.</span>':a.prazo?`Guardando <b class="tabular-nums">${e.brl(a.aporte)}</b> por mês, você chega lá em <b>${a.prazo} ${a.prazo===1?"mês":"meses"}</b> (${t}).${a.prazo>36?' <span class="text-amber-800">Prazo longo: comece pelo mínimo de 3 meses.</span>':""}`:"Informe quanto pretende guardar por mês para ver o prazo."}</p>
          <p class="text-xs text-slate-500 mt-3"><b>Onde guardar:</b> aplicações de <b>baixo risco</b> e <b>resgate no mesmo dia</b>, separadas da conta do dia a dia — rendendo pelo menos perto da Selic/CDI. Rentabilidade alta não é o objetivo; ter o dinheiro na hora é.</p>`)}
      </div>

      ${$(`
        ${M("lista","blue",`Como chegamos em ${e.brl(a.base)} por mês`)}
        <dl class="text-sm grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 mt-2 tabular-nums">
          <dt>Custo essencial do mês <span class="text-slate-500">(percentil 75 de ${a.janela} ${a.janela===1?"mês":"meses"})</span></dt><dd class="text-right">${e.brl(a.p75)}</dd>
          <dt>+ Parcelas já assumidas <span class="text-slate-500">(média dos próximos 6 meses, fora do essencial)</span></dt><dd class="text-right">${e.brl(a.compromissos)}</dd>
          <dt class="font-semibold border-t border-slate-200 pt-1">= Custo essencial por mês</dt><dd class="font-semibold border-t border-slate-200 pt-1 text-right">${e.brl(a.base)}</dd>
        </dl>
        <p class="text-xs text-slate-500 mt-2">Para comparar: média ${e.brl(a.media)} · mediana ${e.brl(a.mediana)} do essencial; gasto total médio ${e.brl(a.totalMedia)}.</p>
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
        ${M("etiqueta","amber","O que entra no custo essencial")}
        <p class="text-xs text-slate-500 mt-0.5 mb-2">Marque o que você continuaria pagando numa emergência. Valores por mês nos ${a.janela} meses analisados.</p>
        <div class="table-wrap -mx-4 px-4">
          <table>
            <thead><tr><th>Categoria</th><th class="text-right">Mediana</th><th class="text-right">Percentil 75</th><th>Tipo</th><th class="text-right">No cartão</th><th>Origem</th></tr></thead>
            <tbody>${f}</tbody>
          </table>
        </div>
        ${Object.keys(a.cfg.essenciais||{}).length?'<button data-act="rv-padrao" class="text-xs text-prim-700 font-medium hover:underline mt-2">Voltar à classificação das categorias</button>':""}`)}`}function K(a){const s=Math.abs(a.diferenca)<.01;return`
      ${M("cofrinho","emerald",`Aportes de ${e.monthShort(Fin.state.mes)}`,"mb-1")}
      <p class="text-xs text-slate-500 mb-2">Conferência: Lançamentos (categorias de investimento) × carteira.</p>
      <dl class="text-sm grid grid-cols-[1fr_auto] gap-y-1 tabular-nums">
        <dt class="text-slate-500">Lançado nos Lançamentos</dt><dd>${e.brl(a.lancado)}</dd>
        <dt class="text-slate-500">Registrado na carteira</dt><dd>${e.brl(a.registrado)}</dd>
        <dt class="font-medium">Diferença</dt><dd class="font-medium ${s?"text-emerald-700":"text-amber-800"}">${s?"✓ ":"! "}${e.brl(a.diferenca)}</dd>
      </dl>
      <p class="text-xs text-slate-500 mt-2">${a.lancamentos.length} lançamento(s) de aporte · compras ${e.brl(a.entra)} · vendas/resgates ${e.brl(a.sai)}</p>`}function W(a){const s=a.patrimonio||1,r=p().config("alocacao")?.ideal||{},n=new Map;for(const t of a.abertas){const o=n.get(t.classe)||[];o.push({tipo:"ativo",p:t}),n.set(t.classe,o)}for(const t of a.contasSaldo){const o=n.get(t.classe)||[];o.push({tipo:"saldo",c:t}),n.set(t.classe,o)}const v=a.posicoes.filter(t=>t.qtd===0&&t.ops>0);if(!n.size)return $(`<p class="text-sm text-slate-600">Nenhum ativo ainda. Lance uma <b>compra</b> ou carregue sua <b>posição atual</b> colando a lista (ticker, quantidade e preço médio).</p>
        <div class="flex flex-wrap gap-2 mt-3"><button data-act="carga" class="btn btn-primary">📥 Carregar posição atual</button>
        <button data-act="novo-mov" class="btn btn-ghost">＋ Movimentação</button></div>`);const i=p().CLASSES.map(t=>t.id),l=[...n.entries()].sort((t,o)=>i.indexOf(t[0])-i.indexOf(o[0])).map(([t,o])=>{const u=p().classe(t),f=o.reduce((F,y)=>F+(y.p?y.p.valor:y.c.valor),0),c=o.reduce((F,y)=>F+(y.p?y.p.custoBRL:Math.max(0,y.c.investido)),0),j=c>0?(f-c)/c:null;return o.sort((F,y)=>(y.p?.valor??y.c.valor)-(F.p?.valor??F.c.valor)),`
        <section class="bg-white rounded-2xl shadow-sm min-w-0 overflow-hidden">
          <header class="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 border-b border-slate-100">
            <h3 class="font-semibold mr-auto">${u.icone} ${x(u.nome)} <span class="text-sm text-slate-400 font-normal">(${o.length})</span></h3>
            <span class="text-sm tabular-nums">${e.brl(f)}</span>
            <span class="text-sm tabular-nums ${q(j)}">${S(j)}</span>
            <span class="text-xs text-slate-500 tabular-nums">${e.pct(f/s)}${r[t]?` / ${e.pct(r[t]/100)}`:""}</span>
          </header>
          <div class="table-wrap">
            <table class="w-full">
              <thead><tr><th>Ativo</th><th class="text-right">Qtd</th><th class="text-right">Preço médio</th><th class="text-right">Preço atual</th><th class="text-right">Valor</th><th class="text-right">Rent.</th><th class="text-right">% cart.</th></tr></thead>
              <tbody>${o.map(F=>F.p?Z(F.p,s):aa(F.c,s)).join("")}</tbody>
            </table>
          </div>
        </section>`}).join("");return`
      <div class="flex flex-wrap gap-3 text-sm px-1">
        <span class="text-slate-500 mr-auto">${a.abertas.length} ativos · ${a.contasSaldo.length} contas por saldo</span>
        <button data-act="carga" class="text-prim-700 font-semibold hover:underline">📥 Carregar posição (colar lista)</button>
        <button data-act="precos" class="text-prim-700 font-semibold hover:underline">🏷️ Atualizar preços</button>
      </div>
      ${l}
      ${v.length?`<details class="bg-white rounded-2xl shadow-sm p-4"><summary class="cursor-pointer text-sm font-medium">Posições encerradas (${v.length})</summary>
        <ul class="mt-2 text-sm divide-y divide-slate-100">${v.map(t=>`<li><button data-ativo="${t.ativo.id}" class="w-full flex justify-between py-1.5 hover:bg-slate-50">
          <span>${x(t.ativo.ticker)} <span class="text-xs text-slate-400">${x(t.conta?.nome||"")}</span></span>
          <span class="tabular-nums ${q(t.realizado)}">realizado ${e.brl(t.realizado)} · proventos ${e.brl(t.proventos)}</span></button></li>`).join("")}</ul></details>`:""}`}function Z(a,s){const r=a.ativo;return`<tr data-ativo="${r.id}" class="cursor-pointer hover:bg-emerald-50/60">
      <td><div class="font-medium">${x(r.ticker)}</div><div class="text-[11px] text-slate-400">${x(a.conta?.nome||"")}${r.nome?` · ${x(r.nome)}`:""}</div></td>
      <td class="num">${e.qtd(a.qtd)}</td>
      <td class="num">${e.moeda(a.pm,a.moeda)}</td>
      <td class="num">${a.semCotacao?'<span class="text-amber-800">! sem preço</span>':`${e.moeda(r.preco,a.moeda)}<div class="text-[11px] text-slate-400">${e.date(r.precoEm).slice(0,5)}</div>`}</td>
      <td class="num font-medium">${e.brl(a.valor)}${a.moeda==="USD"?`<div class="text-[11px] text-slate-400">${e.moeda(a.valorMoeda,"USD")}</div>`:""}</td>
      <td class="num ${q(a.rent)}">${S(a.rent)}</td>
      <td class="num text-slate-500">${e.pct(a.valor/s)}</td>
    </tr>`}function aa(a,s){return`<tr data-conta-saldo="${a.conta.id}" class="cursor-pointer hover:bg-emerald-50/60">
      <td><div class="font-medium">${a.conta.icone||"🏦"} ${x(a.conta.nome)}</div><div class="text-[11px] text-slate-400">${a.ultimoSaldo?`saldo em ${e.date(a.ultimoSaldo)}`:"aportes − resgates"}</div></td>
      <td class="num">—</td><td class="num text-slate-500">aplicado<br>${e.brl(a.investido)}</td><td class="num">—</td>
      <td class="num font-medium">${e.brl(a.valor)}</td>
      <td class="num ${q(a.rent)}">${S(a.rent)}</td>
      <td class="num text-slate-500">${e.pct(a.valor/s)}</td>
    </tr>`}function ta(a){const s=a.proventos,r=p().metas().find(n=>n.tipo==="proventos");return`
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${L("Total recebido",e.brl(s.total),"desde o início")}
        ${L("Últimos 12 meses",e.brl(s.doze),`média ${e.brl(s.mediaMensal)}/mês${r?` / meta ${e.brl(r.alvo)}`:""}`)}
        ${L("Este mês",e.brl(s.mes),e.monthShort(e.currentYM()))}
        ${L("A receber",e.brl(s.totalAReceber),`${s.aReceber.length} provisionado(s)`)}
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        ${$(`<div class="flex items-start justify-between gap-3 flex-wrap mb-3">${M("moedas","emerald","Proventos por mês")}
          ${Fin.charts.legend([{label:"Recebido",color:C.proventos}])}</div>
          <div id="inv-proventos" class="w-full min-w-0 overflow-hidden"></div>`)}
        ${$(`${M("barras","blue","Por ativo (12 meses)","mb-3")}${s.porAtivo.length?Fin.charts.hbars(s.porAtivo.slice(0,10)):'<p class="text-sm text-slate-500">Nenhum provento nos últimos 12 meses.</p>'}`)}
      </div>
      ${$(`<div class="flex items-center justify-between mb-2">${M("lista","slate","Meus proventos")}
        <button data-act="novo-provento" class="text-sm text-prim-700 font-semibold hover:underline">＋ Provento</button></div>
        ${s.lista.length?`<div class="table-wrap"><table class="w-full"><thead><tr><th>Data</th><th>Ativo</th><th>Tipo</th><th class="text-right">Valor</th><th class="text-right">Em R$</th><th>Situação</th></tr></thead>
        <tbody>${s.lista.slice(0,60).map(n=>`<tr data-mov="${n.mov.id}" class="cursor-pointer hover:bg-emerald-50/60">
          <td class="tabular-nums">${e.date(n.data)}</td><td class="font-medium">${x(n.ativo?.ticker||"—")}</td>
          <td>${x({dividendo:"Dividendo",jcp:"JCP",rendimento:"Rendimento",outro:"Outro"}[n.mov.subtipo]||"Provento")}</td>
          <td class="num">${e.moeda(n.valorMoeda,n.moeda)}</td><td class="num">${e.brl(n.valor)}</td>
          <td>${n.futuro?'<span class="text-slate-500">○ A receber</span>':'<span class="text-emerald-700">✓ Recebido</span>'}</td></tr>`).join("")}</tbody></table></div>`:'<p class="text-sm text-slate-500">Nenhum provento registrado. Use “＋ Provento” (ou, na Etapa 3, a importação das notas).</p>'}`)}`}function ea(a){const s=p().acumulada(a.slice(-12)),r=p().acumulada(a),n=[...a].reverse().find(o=>o.rent!=null),v=[...new Set(a.map(o=>o.ym.slice(0,4)))].sort().reverse(),i=new Map(a.map(o=>[o.ym,o])),l=o=>{if(o==null)return'<td class="num text-slate-300">—</td>';const u=Math.min(1,Math.abs(o)/.06);return`<td class="num" style="background:${o>=0?`rgba(12,163,12,${.08+u*.3})`:`rgba(208,59,59,${.08+u*.3})`}">${o<0?"−":""}${e.pct(Math.abs(o))}</td>`},t=Fin.storage.list("invHist").filter(o=>o.informado&&!o.fonte).sort((o,u)=>u.id.localeCompare(o.id));return`
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
        ${L("Acumulada",r!=null?`<span class="${q(r)}">${S(r)}</span>`:"—","desde o 1º mês com histórico")}
        ${L("Últimos 12 meses",s!=null?`<span class="${q(s)}">${S(s)}</span>`:"—","composta mês a mês")}
        <div class="col-span-2 lg:col-span-1">${L("Último mês",n?`<span class="${q(n.rent)}">${S(n.rent)}</span>`:"—",n?e.monthLong(n.ym):"sem dados")}</div>
      </div>
      ${$(`<div class="flex items-center justify-between gap-2 mb-2 flex-wrap">${M("linha","emerald","Rentabilidade mês a mês")}
        <button data-act="foto" class="text-sm text-prim-700 font-semibold hover:underline">＋ Patrimônio de mês passado</button></div>
        ${a.some(o=>o.rent!=null)?`<div class="table-wrap"><table class="w-full"><thead><tr><th>Ano</th>${["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"].map(o=>`<th class="text-right">${o}</th>`).join("")}<th class="text-right">Ano</th></tr></thead>
          <tbody>${v.map(o=>{const u=Array.from({length:12},(c,j)=>i.get(`${o}-${String(j+1).padStart(2,"0")}`)),f=p().acumulada(u.filter(Boolean));return`<tr><td class="font-medium">${o}</td>${u.map(c=>l(c?.rent??null)).join("")}${l(f)}</tr>`}).join("")}</tbody></table></div>`:'<p class="text-sm text-slate-500">A rentabilidade aparece quando houver o patrimônio de dois meses seguidos. O app guarda o deste mês sozinho; para os anteriores, informe o patrimônio (ex.: copiando do Investidor 10).</p>'}
        <p class="text-xs text-slate-500 mt-2">Cálculo: (patrimônio final − inicial − aportes líquidos + proventos) ÷ (patrimônio inicial + metade dos aportes). Acumulado = composto.</p>`)}
      ${t.length?$(`${M("calendario","slate","Meses informados","mb-2")}<ul class="text-sm divide-y divide-slate-100">${t.map(o=>`
        <li><button data-foto="${o.id}" class="w-full flex justify-between py-1.5 hover:bg-slate-50"><span>${e.monthLong(o.id)}</span>
          <span class="tabular-nums">${e.brl(o.patrimonio)}${o.manual?` <span class="text-xs text-slate-400">aplicado ${e.brl(o.investido)}</span>`:""}</span></button></li>`).join("")}</ul>`):""}`}function sa(){const a=new Map(p().ativos().map(t=>[t.id,t])),s=new Map(p().contas().map(t=>[t.id,t])),r=Fin.parsers.normalize(A.busca),n=Fin.state.invFiltroAtivo||"",v=new Set(p().contasVisiveis().map(t=>t.id)),i=p().movs().filter(t=>!(!v.has(t.conta||a.get(t.ativo)?.conta)||A.conta&&t.conta!==A.conta||A.tipo&&t.tipo!==A.tipo||n&&t.ativo!==n||r&&!Fin.parsers.normalize(`${a.get(t.ativo)?.ticker||""} ${t.obs||""} ${s.get(t.conta)?.nome||""}`).includes(r))).sort((t,o)=>(o.data||"").localeCompare(t.data||"")||(o.criadoEm||"").localeCompare(t.criadoEm||"")),l=(t,o,u)=>`<option value="${x(t)}" ${t===u?"selected":""}>${x(o)}</option>`;return`
      ${$(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <input id="mv-busca" type="search" class="input col-span-2 lg:col-span-1" placeholder="Buscar ticker…" value="${x(A.busca)}" aria-label="Buscar">
        <select id="mv-conta" class="input" aria-label="Conta">${l("","Todas as contas",A.conta)}${p().contasVisiveis().map(t=>l(t.id,t.nome,A.conta)).join("")}</select>
        <select id="mv-tipo" class="input" aria-label="Tipo">${l("","Todos os tipos",A.tipo)}${Object.entries(p().TIPOS).map(([t,o])=>l(t,o.nome,A.tipo)).join("")}</select>
        ${n?`<button data-act="limpar-ativo" class="chip is-active">${x(a.get(n)?.ticker||"")} ✕</button>`:""}
      </div>`)}
      <p class="text-xs text-slate-500 px-1">${i.length} movimentações</p>
      ${$(i.length?`<div class="table-wrap"><table class="w-full"><thead><tr><th>Data</th><th>Tipo</th><th>Ativo / conta</th><th class="text-right">Qtd</th><th class="text-right">Preço</th><th class="text-right">Total</th><th class="text-right">Em R$</th></tr></thead>
        <tbody>${i.slice(0,300).map(t=>{const o=a.get(t.ativo),u=s.get(t.conta),f=o?.moeda||u?.moeda||"BRL",c=p().TIPOS[t.tipo]||{nome:t.tipo,icone:""},j=Number(t.qtd)||0,F=Number(t.preco)||0,y=t.valor!=null?Number(t.valor):t.tipo==="venda"?j*F-(t.taxas||0):j*F+(t.taxas||0),E=f==="USD"?t.cambio||p().dolarAtual()||0:1,d=t.tipo==="desdobramento"||t.tipo==="grupamento";return`<tr data-mov="${t.id}" class="cursor-pointer hover:bg-emerald-50/60">
            <td class="tabular-nums">${e.date(t.data)}</td>
            <td>${c.icone} ${c.nome}${{nota:"nota",i10:"Investidor 10",nomad:"extrato Nomad"}[t.origem]?` <span class="text-[11px] text-slate-400">${{nota:"nota",i10:"Investidor 10",nomad:"extrato Nomad"}[t.origem]}</span>`:""}</td>
            <td><span class="font-medium">${x(o?.ticker||u?.nome||"—")}</span>${o?` <span class="text-[11px] text-slate-400">${x(u?.nome||"")}</span>`:""}</td>
            <td class="num">${d?`1 → ${e.qtd(t.fator)}`:t.qtd!=null?e.qtd(t.qtd):""}</td>
            <td class="num">${t.preco!=null?e.moeda(t.preco,f):""}</td>
            <td class="num">${d?"":e.moeda(y,f)}</td>
            <td class="num">${d||f!=="USD"?"":e.brl(y*E)}</td></tr>`}).join("")}</tbody></table></div>`:'<p class="text-sm text-slate-500">Nenhuma movimentação com estes filtros.</p>')}`}function O(a,s=null){const r=p().metasVisiveis().map(l=>p().progressoMeta(l,a)).sort((l,t)=>l.concluida-t.concluida||t.pct-l.pct),n=Fin.finance.temCasal(),v=l=>{if(!n)return"";const t=p().donoMeta(l);return t==="casal"?'<span class="text-[11px] px-1.5 py-0.5 rounded-full bg-prim-50 text-prim-800 shrink-0">dos dois</span>':`<span class="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">de ${x(Fin.membros.primeiroNome(Fin.membros.porId(t)))}</span>`};if(s&&!r.length)return"";const i=s?r.slice(0,s):r;return`
      <div class="flex items-center justify-between px-1">${M("alvo","orange","Metas")}
        <span class="flex gap-3">${s&&r.length>s?'<button data-aba="metas" class="text-sm text-slate-500 hover:underline">ver todas</button>':""}
        <button data-act="nova-meta" class="text-sm text-prim-700 font-semibold hover:underline">＋ Meta</button></span></div>
      ${i.length?`<div class="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">${i.map(l=>`
        <button data-meta="${l.meta.id}" class="block w-full text-left bg-white rounded-2xl shadow-sm p-4 hover:ring-2 hover:ring-emerald-200 min-w-0">
          <div class="flex items-center gap-2"><span class="font-medium truncate flex-1">${x(l.meta.nome)}</span>${v(l.meta)}
            <span class="text-sm font-semibold ${l.concluida?"text-emerald-700":""}">${l.concluida?"✓ ":""}${e.pct(l.pct)}</span></div>
          <div class="h-2 bg-slate-100 rounded mt-2" aria-hidden="true"><div class="h-2 rounded" style="width:${l.pct*100}%;background:${l.concluida?C.ganho:C.aplicado}"></div></div>
          <dl class="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs mt-2 tabular-nums">
            <dt class="text-slate-500">${l.meta.tipo==="proventos"?"Média mensal":"Atual"}</dt><dd class="text-right">${e.brl(l.atual)}</dd>
            <dt class="text-slate-500">Objetivo</dt><dd class="text-right">${e.brl(l.alvo)}</dd>
            <dt class="text-slate-500">Faltam</dt><dd class="text-right">${e.brl(l.falta)}</dd>
            ${l.meta.aporteMensal?`<dt class="text-slate-500">Aporte mensal</dt><dd class="text-right">${e.brl(l.meta.aporteMensal)}</dd>`:""}
            ${l.conclusao?`<dt class="text-slate-500">Conclusão estimada</dt><dd class="text-right font-medium">${e.monthLong(l.conclusao)}</dd>`:""}
          </dl>
        </button>`).join("")}</div>`:'<p class="text-sm text-slate-500 px-1">Nenhuma meta ainda. Ex.: patrimônio de R$ 15 mil, R$ 100/mês de proventos, R$ 6 mil no exterior.</p>'}`}function oa(){return`<div class="space-y-4">
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
    </div>`}function na(a,{signal:s}){if(!p().temDados()){a.innerHTML=oa(),a.addEventListener("click",d=>{const m=d.target.closest("[data-act]")?.dataset.act;m==="comecar"&&(p().criarContasPadrao(),Fin.ui.toast("Contas criadas: Rico, Nomad e Reserva de emergência."),Fin.router.refresh()),m==="nova-conta"&&g().conta(),m==="importar"&&Fin.importarInv.abrir()},{signal:s});return}p().garantirCategoria();const r=location.hash.match(/[?&]aba=(\w+)/);r&&(Fin.state.invAba=r[1],history.replaceState(null,"","#/investimentos"));const n=Fin.state.invAba||"resumo",v=p().resumo();p().salvarFoto(v);const i=p().historico(v),l={resumo:()=>T(v,i),reserva:X,ativos:()=>W(v),proventos:()=>ta(v),rent:()=>ea(i),movs:sa,metas:()=>O(v)}[n]||(()=>T(v,i));a.innerHTML=`<div class="space-y-4">${B(n)}${l()}</div>`;const t=a.querySelector("#inv-evolucao");if(t){const d=i.slice(-12).map(b=>({ym:b.ym,aplicado:Math.max(0,Math.min(b.aplicado,b.patrimonio??b.aplicado)),ganho:b.patrimonio!=null?Math.max(0,b.patrimonio-b.aplicado):null,saldo:b.patrimonio,extra:b.patrimonio!=null&&b.patrimonio<b.aplicado?`Perda: ${e.brl(b.patrimonio-b.aplicado)}`:b.rent!=null?`Rentabilidade do mês: ${S(b.rent)}`:""})),m=()=>Fin.charts.columns(t,d.length?d:[{ym:e.currentYM(),aplicado:0,ganho:0}],{stacked:!0,totalLabel:"Patrimônio",label:"Evolução do patrimônio",series:[{key:"aplicado",label:"Valor aplicado",color:C.aplicado},{key:"ganho",label:"Ganho de capital",color:C.ganho}]});m();const h=new ResizeObserver(()=>requestAnimationFrame(m));h.observe(t),s.addEventListener("abort",()=>h.disconnect())}const o=a.querySelector("#inv-proventos");if(o){const d=e.currentYM(),m=Array.from({length:12},(P,R)=>{const k=e.addMonths(d,R-11);return{ym:k,valor:v.proventos.porMes[k]||0}}),h=()=>Fin.charts.columns(o,m,{label:"Proventos por mês",series:[{key:"valor",label:"Recebido",color:C.proventos}]});h();const b=new ResizeObserver(()=>requestAnimationFrame(h));b.observe(o),s.addEventListener("abort",()=>b.disconnect())}const u=a.querySelector("#rv-grafico");if(u){const d=Fin.reserva.calcular(),m=()=>Fin.charts.columns(u,d.meses.map(b=>({ym:b.ym,essencial:b.essencial,outros:b.outros,saldo:b.total})),{stacked:!0,totalLabel:"Total",label:"Gastos essenciais e não essenciais por mês",series:[{key:"essencial",label:"Essencial",color:"#2a78d6"},{key:"outros",label:"Não essencial",color:"#c3c2b7"}]});m();const h=new ResizeObserver(()=>requestAnimationFrame(m));h.observe(u),s.addEventListener("abort",()=>h.disconnect())}a.querySelectorAll('input[name="rv-dono"]').forEach(d=>d.addEventListener("change",m=>{Fin.reserva.salvar({dono:m.target.value}),Fin.router.refresh()})),a.querySelectorAll('input[name="rv-meses"]').forEach(d=>d.addEventListener("change",m=>{Fin.reserva.salvar({meses:Number(m.target.value)}),Fin.router.refresh()})),a.querySelector("#rv-aporte")?.addEventListener("change",d=>{const m=Fin.parsers.toNumber(d.target.value);Fin.reserva.salvar({aporteMensal:m>0?m:null}),Fin.router.refresh()}),a.querySelectorAll("[data-rv-cat]").forEach(d=>d.addEventListener("change",m=>{const h={...Fin.reserva.config().essenciais||{}};h[m.target.dataset.rvCat]=m.target.checked,Fin.reserva.salvar({essenciais:h}),Fin.router.refresh()})),a.querySelector("#mv-busca")?.addEventListener("input",d=>{A.busca=d.target.value;const m=d.target.selectionStart;Fin.router.refresh();const h=document.getElementById("mv-busca");h?.focus(),h?.setSelectionRange(m,m)}),a.querySelector("#mv-conta")?.addEventListener("change",d=>{A.conta=d.target.value,Fin.router.refresh()}),a.querySelector("#mv-tipo")?.addEventListener("change",d=>{A.tipo=d.target.value,Fin.router.refresh()}),a.addEventListener("click",d=>{const m=d.target,h=m.closest("[data-aba]");if(h)return Fin.state.invAba=h.dataset.aba,Fin.router.refresh();const b=m.closest("[data-ativo]");if(b)return g().ativo(b.dataset.ativo);const P=m.closest("[data-mov]");if(P)return g().mov({id:P.dataset.mov});const R=m.closest("[data-conta]");if(R)return g().conta(R.dataset.conta);const k=m.closest("[data-conta-saldo]");if(k)return g().mov({conta:k.dataset.contaSaldo,tipo:"saldo"});const H=m.closest("[data-meta]");if(H)return g().meta(H.dataset.meta);const V=m.closest("[data-foto]");if(V)return g().foto(V.dataset.foto);const w=m.closest("[data-act]")?.dataset.act;if(w)if(w==="novo-mov")g().mov();else if(w==="novo-provento")g().mov({tipo:"provento",conta:p().contas().find(z=>z.tipo==="corretora")?.id});else if(w==="precos")g().precos();else if(w==="importar")Fin.importarInv.abrir();else if(w==="ajuda")Fin.pages.educacao.ajuda((Fin.state.invAba||"resumo")==="reserva"?"reserva":"investimentos");else if(w==="chaves")g().cotacoes();else if(w==="carga")g().carga();else if(w==="nova-conta")g().conta();else if(w==="nova-meta")g().meta();else if(w==="alocacao")g().alocacao();else if(w==="foto")g().foto();else if(w==="limpar-ativo")Fin.state.invFiltroAtivo=null,Fin.router.refresh();else if(w==="dolar")Fin.plano.pode("cotacoes")||Fin.plano.usarHoje("dolar")?c(!0):Fin.plano.avisar("cotacoes");else if(w==="rv-aporte")g().mov({conta:Fin.reserva.garantirConta().id,tipo:"aporte"});else if(w==="rv-saldo")g().mov({conta:Fin.reserva.garantirConta().id,tipo:"saldo"});else if(w==="rv-meta"){Fin.reserva.garantirConta();const z=Fin.reserva.calcular();Fin.reserva.salvarMeta(z),Fin.ui.toast(`Meta “Reserva de emergência”: ${e.brl(z.ideal)}.`),Fin.router.refresh()}else w==="rv-padrao"&&(Fin.reserva.salvar({essenciais:{}}),Fin.router.refresh())},{signal:s});const f=v.abertas.some(d=>d.moeda==="USD");async function c(d=!1){const m=Fin.cotacoes.dolar()?.valor;try{const h=await Fin.cotacoes.atualizarDolar();if(s.aborted)return;const b=a.querySelector("[data-dolar]");b&&(b.innerHTML=I()),d&&Fin.ui.toast(`Dólar: ${e.brl(h.valor)}`),f&&m!==h.valor&&!document.querySelector("#modal-root .modal-panel")&&Fin.router.refresh()}catch{d&&Fin.ui.toast("Não consegui atualizar o dólar (sem internet?).","error")}}const j=Fin.cotacoes.dolar(),F=Fin.plano.pode("cotacoes");F&&(!j||Date.now()-new Date(j.buscadoEm||j.em)>6e4)&&c();const y=Fin.storage.prefs().cotacoesUltima;F&&Fin.cotacoes.temChaves()&&(!y||Date.now()-new Date(y)>30*60*1e3)&&Fin.cotacoes.atualizarPrecos().then(d=>{s.aborted||!d.atualizados||(document.querySelector("#modal-root .modal-panel")||Fin.router.refresh(),d.falhas.length&&console.warn("[cotações]",d.falhas))}).catch(d=>console.warn("[cotações]",d));const E=setInterval(()=>{F&&document.visibilityState==="visible"&&c()},6e4);s.addEventListener("abort",()=>clearInterval(E))}return{title:"Investimentos",render:na}})();
