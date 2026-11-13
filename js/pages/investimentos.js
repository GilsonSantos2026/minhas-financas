/**
 * pages/investimentos.js — Aba Investimentos (referência: Investidor 10, mas ligada ao orçamento).
 *
 * Abas: Resumo · Ativos · Proventos · Rentabilidade · Movimentações · Metas
 * Dólar ao vivo (AwesomeAPI, atualiza a cada minuto com a tela aberta) para converter os
 * ativos em US$. Preços dos ativos: informados (Etapa 2 trará a busca automática).
 */
window.Fin = window.Fin || {};
Fin.pages = Fin.pages || {};

Fin.pages.investimentos = (() => {
  const fmt = Fin.fmt;
  const esc = fmt.esc;
  const I = () => Fin.inv;
  const FI = () => Fin.forms.inv;

  const ABAS = [['resumo', 'Resumo'], ['ativos', 'Ativos'], ['proventos', 'Proventos'], ['rent', 'Rentabilidade'], ['movs', 'Movimentações'], ['metas', 'Metas']];
  const COR = { aplicado: '#2a78d6', ganho: '#0ca30c', proventos: '#0ca30c' };
  const filtroMovs = { conta: '', tipo: '', busca: '' };

  const card = (html, cls = '') => `<section class="bg-white rounded-2xl shadow-sm p-4 min-w-0 ${cls}">${html}</section>`;
  const tile = (rot, valor, sub = '', cls = '') => `<div class="bg-white rounded-2xl shadow-sm p-3 min-w-0">
    <div class="text-xs text-slate-500">${rot}</div><div class="text-lg font-semibold tabular-nums truncate ${cls}">${valor}</div>
    <div class="text-[11px] text-slate-500 truncate">${sub}</div></div>`;
  const sinal = (v) => (v > 0 ? 'text-emerald-700' : v < 0 ? 'text-rose-700' : 'text-slate-600');
  const pctS = (v) => (v == null ? '—' : `${v > 0 ? '▲ ' : v < 0 ? '▼ ' : ''}${fmt.pct(Math.abs(v))}`);

  /* ---------------- Cabeçalho ---------------- */

  function dolarChip() {
    const d = Fin.cotacoes.dolar();
    return `<button type="button" data-act="dolar" class="inline-flex items-center gap-2 bg-white rounded-full shadow-sm px-3 py-1.5 text-sm" title="Atualizar dólar">
      <span aria-hidden="true">💵</span><span class="tabular-nums">US$ 1 = <b>${d ? fmt.brl(d.valor) : '—'}</b></span>
      <span class="text-xs text-slate-400" data-dolar-idade>${d ? Fin.cotacoes.idade(d.em) : 'sem cotação'}</span><span aria-hidden="true" class="text-slate-400">↻</span></button>`;
  }

  function cabecalho(aba) {
    return `
      <div class="flex flex-wrap items-center gap-2">
        <h2 class="text-xl font-semibold mr-auto hidden md:block">Investimentos</h2>
        <span data-dolar>${dolarChip()}</span>
        <button data-act="importar" class="btn btn-ghost !py-1.5 bg-white shadow-sm">📥 Importar</button>
        <button data-act="precos" class="btn btn-ghost !py-1.5 bg-white shadow-sm">🏷️ Preços</button>
        <button data-act="novo-mov" class="btn btn-primary !py-1.5">＋ Movimentação</button>
      </div>
      <nav class="chips flex gap-2 overflow-x-auto pb-1" aria-label="Seções">
        ${ABAS.map(([k, r]) => `<button data-aba="${k}" aria-pressed="${aba === k}" class="chip !shadow-none border border-slate-200 ${aba === k ? 'is-active !border-transparent' : ''}">${r}</button>`).join('')}
      </nav>`;
  }

  /* ---------------- Resumo ---------------- */

  function resumoHTML(r, hist) {
    const doze = I().acumulada(hist.slice(-12));
    const total = I().acumulada(hist);
    const ult = hist.length ? hist[hist.length - 1] : null;
    return `
      ${r.semCotacao ? `<p class="text-sm bg-amber-50 text-amber-900 rounded-xl px-3 py-2"><span aria-hidden="true">!</span> ${r.semCotacao} ativo(s) sem preço — usando o preço médio. <button data-act="precos" class="underline font-medium">Atualizar preços</button></p>` : ''}
      ${!Fin.cotacoes.temChaves() && r.abertas.length ? `<p class="text-sm bg-sky-50 text-sky-900 rounded-xl px-3 py-2"><span aria-hidden="true">ⓘ</span> Preços informados à mão. <button data-act="chaves" class="underline font-medium">Ligar cotações automáticas</button> (brapi para B3, Finnhub para EUA).</p>` : ''}
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${tile('Patrimônio total', fmt.brl(r.patrimonio), `<span class="${sinal(r.variacao)}">${pctS(r.variacao)}</span> sobre o aplicado`)}
        ${tile('Valor aplicado', fmt.brl(r.investido), 'custo do que você tem hoje')}
        ${tile('Lucro total', fmt.brl(r.lucro), `capital ${fmt.brl(r.ganho)} · proventos ${fmt.brl(r.proventos.total)}`, sinal(r.lucro))}
        ${tile('Rentabilidade', doze != null ? `<span class="${sinal(doze)}">${pctS(doze)}</span>` : '—',
          doze != null ? `12 meses · total ${pctS(total)}${ult?.rent != null ? ` · mês ${pctS(ult.rent)}` : ''}` : 'precisa de 2 meses de histórico')}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        ${card(`
          <div class="flex items-start justify-between gap-3 flex-wrap mb-3">
            <h3 class="font-semibold">Evolução do patrimônio</h3>
            ${Fin.charts.legend([{ label: 'Valor aplicado', color: COR.aplicado }, { label: 'Ganho de capital', color: COR.ganho }])}
          </div>
          <div id="inv-evolucao" class="w-full min-w-0 overflow-hidden"></div>
          <p class="text-xs text-slate-400 mt-1">Últimos 12 meses. Meses sem patrimônio registrado mostram só o aplicado ·
            <button data-act="foto" class="text-emerald-700 font-medium hover:underline">informar mês passado</button></p>`)}
        ${card(`
          <div class="flex items-center justify-between gap-3 mb-3">
            <h3 class="font-semibold">Alocação por classe</h3>
            <button data-act="alocacao" class="text-sm text-emerald-700 font-medium hover:underline">% ideal</button>
          </div>
          ${alocacaoHTML(I().alocacao(r))}`)}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        ${card(contasHTML(r))}
        ${card(reservaHTML(I().reserva(r)))}
        ${card(aportesHTML(I().conferenciaAportes(Fin.state.mes)))}
      </div>
      ${metasHTML(r, 3)}`;
  }

  function alocacaoHTML(itens) {
    if (!itens.length) return '<p class="text-sm text-slate-500">Sem ativos ainda.</p>';
    return `<ul class="space-y-3">${itens.map((i) => {
      const desvio = i.ideal != null ? i.atual - i.ideal : null;
      const aviso = desvio != null && Math.abs(desvio) >= 0.05
        ? `<span class="text-amber-800">${desvio > 0 ? '▲ acima' : '▼ abaixo'} do ideal</span>` : desvio != null ? '<span class="text-emerald-700">✓ no alvo</span>' : '';
      return `<li class="text-sm">
        <div class="flex items-center gap-2"><span class="truncate flex-1">${i.classe.icone} ${esc(i.classe.nome)}</span>
          <span class="tabular-nums">${fmt.brl(i.valor)}</span></div>
        <div class="relative h-2.5 bg-slate-100 rounded mt-1" aria-hidden="true">
          <span class="absolute inset-y-0 left-0 rounded" style="width:${Math.min(100, i.atual * 100)}%;background:${COR.aplicado}"></span>
          ${i.ideal != null ? `<span class="absolute -top-1 -bottom-1 w-0.5 bg-slate-800" style="left:${Math.min(100, i.ideal * 100)}%"></span>` : ''}
        </div>
        <div class="flex justify-between text-xs text-slate-500 mt-0.5"><span>${fmt.pct(i.atual)}${i.ideal != null ? ` / ideal ${fmt.pct(i.ideal)}` : ''}</span>${aviso}</div>
      </li>`;
    }).join('')}</ul>`;
  }

  function contasHTML(r) {
    const contas = I().contas();
    const total = r.patrimonio || 1;
    return `
      <div class="flex items-center justify-between mb-2"><h3 class="font-semibold">Por conta</h3>
        <button data-act="nova-conta" class="text-sm text-emerald-700 font-medium hover:underline">＋ Conta</button></div>
      <ul class="divide-y divide-slate-100">${contas.map((c) => `
        <li><button data-conta="${c.id}" class="w-full flex items-center gap-2 py-2 text-left text-sm hover:bg-slate-50 rounded">
          <span aria-hidden="true">${c.icone || '🏦'}</span><span class="flex-1 truncate">${esc(c.nome)}
            <span class="text-xs text-slate-400">${c.tipo === 'saldo' ? 'saldo' : c.moeda === 'USD' ? 'US$' : 'R$'}</span></span>
          <span class="tabular-nums">${fmt.brl(r.porConta[c.id] || 0)}</span>
          <span class="text-xs text-slate-400 w-12 text-right">${fmt.pct((r.porConta[c.id] || 0) / total)}</span>
        </button></li>`).join('')}</ul>`;
  }

  function reservaHTML(rv) {
    const m = rv.meses;
    const [ic, cls, txt] = m == null ? ['○', 'text-slate-500', 'sem dados de despesas']
      : m >= 6 ? ['✓', 'text-emerald-700', 'confortável (6+ meses)'] : m >= 3 ? ['◐', 'text-amber-800', 'razoável (3 a 6 meses)'] : ['!', 'text-rose-700', 'baixa (menos de 3 meses)'];
    return `
      <h3 class="font-semibold mb-2">Reserva de emergência</h3>
      <div class="text-2xl font-semibold tabular-nums">${fmt.brl(rv.valor)}</div>
      <div class="text-sm mt-1 ${cls}"><span aria-hidden="true">${ic}</span> ${m == null ? '—' : `${String(m.toFixed(1)).replace('.', ',')} meses de despesas`} · ${txt}</div>
      <p class="text-xs text-slate-500 mt-2">Média de despesas: ${fmt.brl(rv.mediaDespesas)}/mês (${rv.mesesBase} meses fechados). Contas da classe “Reserva de emergência”.</p>`;
  }

  function aportesHTML(a) {
    const ok = Math.abs(a.diferenca) < 0.01;
    return `
      <h3 class="font-semibold mb-1">Aportes de ${fmt.monthShort(Fin.state.mes)}</h3>
      <p class="text-xs text-slate-500 mb-2">Conferência: Lançamentos (categorias de investimento) × carteira.</p>
      <dl class="text-sm grid grid-cols-[1fr_auto] gap-y-1 tabular-nums">
        <dt class="text-slate-500">Lançado nos Lançamentos</dt><dd>${fmt.brl(a.lancado)}</dd>
        <dt class="text-slate-500">Registrado na carteira</dt><dd>${fmt.brl(a.registrado)}</dd>
        <dt class="font-medium">Diferença</dt><dd class="font-medium ${ok ? 'text-emerald-700' : 'text-amber-800'}">${ok ? '✓ ' : '! '}${fmt.brl(a.diferenca)}</dd>
      </dl>
      <p class="text-xs text-slate-500 mt-2">${a.lancamentos.length} lançamento(s) de aporte · compras ${fmt.brl(a.entra)} · vendas/resgates ${fmt.brl(a.sai)}</p>`;
  }

  /* ---------------- Ativos ---------------- */

  function ativosHTML(r) {
    const total = r.patrimonio || 1;
    const ideal = I().config('alocacao')?.ideal || {};
    const grupos = new Map();
    for (const p of r.abertas) { const g = grupos.get(p.classe) || []; g.push({ tipo: 'ativo', p }); grupos.set(p.classe, g); }
    for (const c of r.contasSaldo) { const g = grupos.get(c.classe) || []; g.push({ tipo: 'saldo', c }); grupos.set(c.classe, g); }
    const fechados = r.posicoes.filter((p) => p.qtd === 0 && p.ops > 0);
    if (!grupos.size) {
      return card(`<p class="text-sm text-slate-600">Nenhum ativo ainda. Lance uma <b>compra</b> ou carregue sua <b>posição atual</b> colando a lista (ticker, quantidade e preço médio).</p>
        <div class="flex flex-wrap gap-2 mt-3"><button data-act="carga" class="btn btn-primary">📥 Carregar posição atual</button>
        <button data-act="novo-mov" class="btn btn-ghost">＋ Movimentação</button></div>`);
    }
    const ordem = I().CLASSES.map((c) => c.id);
    const blocos = [...grupos.entries()].sort((a, b) => ordem.indexOf(a[0]) - ordem.indexOf(b[0])).map(([cls, itens]) => {
      const k = I().classe(cls);
      const valor = itens.reduce((s, i) => s + (i.p ? i.p.valor : i.c.valor), 0);
      const custo = itens.reduce((s, i) => s + (i.p ? i.p.custoBRL : Math.max(0, i.c.investido)), 0);
      const rent = custo > 0 ? (valor - custo) / custo : null;
      itens.sort((a, b) => (b.p?.valor ?? b.c.valor) - (a.p?.valor ?? a.c.valor));
      return `
        <section class="bg-white rounded-2xl shadow-sm min-w-0 overflow-hidden">
          <header class="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 border-b border-slate-100">
            <h3 class="font-semibold mr-auto">${k.icone} ${esc(k.nome)} <span class="text-sm text-slate-400 font-normal">(${itens.length})</span></h3>
            <span class="text-sm tabular-nums">${fmt.brl(valor)}</span>
            <span class="text-sm tabular-nums ${sinal(rent)}">${pctS(rent)}</span>
            <span class="text-xs text-slate-500 tabular-nums">${fmt.pct(valor / total)}${ideal[cls] ? ` / ${fmt.pct(ideal[cls] / 100)}` : ''}</span>
          </header>
          <div class="table-wrap">
            <table class="w-full">
              <thead><tr><th>Ativo</th><th class="text-right">Qtd</th><th class="text-right">Preço médio</th><th class="text-right">Preço atual</th><th class="text-right">Valor</th><th class="text-right">Rent.</th><th class="text-right">% cart.</th></tr></thead>
              <tbody>${itens.map((i) => (i.p ? linhaAtivo(i.p, total) : linhaSaldo(i.c, total))).join('')}</tbody>
            </table>
          </div>
        </section>`;
    }).join('');
    return `
      <div class="flex flex-wrap gap-3 text-sm px-1">
        <span class="text-slate-500 mr-auto">${r.abertas.length} ativos · ${r.contasSaldo.length} contas por saldo</span>
        <button data-act="carga" class="text-emerald-700 font-semibold hover:underline">📥 Carregar posição (colar lista)</button>
        <button data-act="precos" class="text-emerald-700 font-semibold hover:underline">🏷️ Atualizar preços</button>
      </div>
      ${blocos}
      ${fechados.length ? `<details class="bg-white rounded-2xl shadow-sm p-4"><summary class="cursor-pointer text-sm font-medium">Posições encerradas (${fechados.length})</summary>
        <ul class="mt-2 text-sm divide-y divide-slate-100">${fechados.map((p) => `<li><button data-ativo="${p.ativo.id}" class="w-full flex justify-between py-1.5 hover:bg-slate-50">
          <span>${esc(p.ativo.ticker)} <span class="text-xs text-slate-400">${esc(p.conta?.nome || '')}</span></span>
          <span class="tabular-nums ${sinal(p.realizado)}">realizado ${fmt.brl(p.realizado)} · proventos ${fmt.brl(p.proventos)}</span></button></li>`).join('')}</ul></details>` : ''}`;
  }

  function linhaAtivo(p, total) {
    const a = p.ativo;
    return `<tr data-ativo="${a.id}" class="cursor-pointer hover:bg-emerald-50/60">
      <td><div class="font-medium">${esc(a.ticker)}</div><div class="text-[11px] text-slate-400">${esc(p.conta?.nome || '')}${a.nome ? ` · ${esc(a.nome)}` : ''}</div></td>
      <td class="num">${fmt.qtd(p.qtd)}</td>
      <td class="num">${fmt.moeda(p.pm, p.moeda)}</td>
      <td class="num">${p.semCotacao ? '<span class="text-amber-800">! sem preço</span>' : `${fmt.moeda(a.preco, p.moeda)}<div class="text-[11px] text-slate-400">${fmt.date(a.precoEm).slice(0, 5)}</div>`}</td>
      <td class="num font-medium">${fmt.brl(p.valor)}${p.moeda === 'USD' ? `<div class="text-[11px] text-slate-400">${fmt.moeda(p.valorMoeda, 'USD')}</div>` : ''}</td>
      <td class="num ${sinal(p.rent)}">${pctS(p.rent)}</td>
      <td class="num text-slate-500">${fmt.pct(p.valor / total)}</td>
    </tr>`;
  }

  function linhaSaldo(c, total) {
    return `<tr data-conta-saldo="${c.conta.id}" class="cursor-pointer hover:bg-emerald-50/60">
      <td><div class="font-medium">${c.conta.icone || '🏦'} ${esc(c.conta.nome)}</div><div class="text-[11px] text-slate-400">${c.ultimoSaldo ? `saldo em ${fmt.date(c.ultimoSaldo)}` : 'aportes − resgates'}</div></td>
      <td class="num">—</td><td class="num text-slate-500">aplicado<br>${fmt.brl(c.investido)}</td><td class="num">—</td>
      <td class="num font-medium">${fmt.brl(c.valor)}</td>
      <td class="num ${sinal(c.rent)}">${pctS(c.rent)}</td>
      <td class="num text-slate-500">${fmt.pct(c.valor / total)}</td>
    </tr>`;
  }

  /* ---------------- Proventos ---------------- */

  function proventosHTML(r) {
    const pv = r.proventos;
    const metaPv = I().metas().find((m) => m.tipo === 'proventos');
    return `
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${tile('Total recebido', fmt.brl(pv.total), 'desde o início')}
        ${tile('Últimos 12 meses', fmt.brl(pv.doze), `média ${fmt.brl(pv.mediaMensal)}/mês${metaPv ? ` / meta ${fmt.brl(metaPv.alvo)}` : ''}`)}
        ${tile('Este mês', fmt.brl(pv.mes), fmt.monthShort(fmt.currentYM()))}
        ${tile('A receber', fmt.brl(pv.totalAReceber), `${pv.aReceber.length} provisionado(s)`)}
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        ${card(`<div class="flex items-start justify-between gap-3 flex-wrap mb-3"><h3 class="font-semibold">Proventos por mês</h3>
          ${Fin.charts.legend([{ label: 'Recebido', color: COR.proventos }])}</div>
          <div id="inv-proventos" class="w-full min-w-0 overflow-hidden"></div>`)}
        ${card(`<h3 class="font-semibold mb-3">Por ativo (12 meses)</h3>${pv.porAtivo.length ? Fin.charts.hbars(pv.porAtivo.slice(0, 10)) : '<p class="text-sm text-slate-500">Nenhum provento nos últimos 12 meses.</p>'}`)}
      </div>
      ${card(`<div class="flex items-center justify-between mb-2"><h3 class="font-semibold">Meus proventos</h3>
        <button data-act="novo-provento" class="text-sm text-emerald-700 font-semibold hover:underline">＋ Provento</button></div>
        ${pv.lista.length ? `<div class="table-wrap"><table class="w-full"><thead><tr><th>Data</th><th>Ativo</th><th>Tipo</th><th class="text-right">Valor</th><th class="text-right">Em R$</th><th>Situação</th></tr></thead>
        <tbody>${pv.lista.slice(0, 60).map((p) => `<tr data-mov="${p.mov.id}" class="cursor-pointer hover:bg-emerald-50/60">
          <td class="tabular-nums">${fmt.date(p.data)}</td><td class="font-medium">${esc(p.ativo?.ticker || '—')}</td>
          <td>${esc({ dividendo: 'Dividendo', jcp: 'JCP', rendimento: 'Rendimento', outro: 'Outro' }[p.mov.subtipo] || 'Provento')}</td>
          <td class="num">${fmt.moeda(p.valorMoeda, p.moeda)}</td><td class="num">${fmt.brl(p.valor)}</td>
          <td>${p.futuro ? '<span class="text-slate-500">○ A receber</span>' : '<span class="text-emerald-700">✓ Recebido</span>'}</td></tr>`).join('')}</tbody></table></div>`
        : '<p class="text-sm text-slate-500">Nenhum provento registrado. Use “＋ Provento” (ou, na Etapa 3, a importação das notas).</p>'}`)}`;
  }

  /* ---------------- Rentabilidade ---------------- */

  function rentHTML(hist) {
    const doze = I().acumulada(hist.slice(-12));
    const total = I().acumulada(hist);
    const ult = [...hist].reverse().find((m) => m.rent != null);
    const anos = [...new Set(hist.map((m) => m.ym.slice(0, 4)))].sort().reverse();
    const porYm = new Map(hist.map((m) => [m.ym, m]));
    const celula = (v) => {
      if (v == null) return '<td class="num text-slate-300">—</td>';
      const a = Math.min(1, Math.abs(v) / 0.06);
      const bg = v >= 0 ? `rgba(12,163,12,${0.08 + a * 0.3})` : `rgba(208,59,59,${0.08 + a * 0.3})`;
      return `<td class="num" style="background:${bg}">${v < 0 ? '−' : ''}${fmt.pct(Math.abs(v))}</td>`;
    };
    const fotos = Fin.storage.list('invHist').filter((h) => h.informado && !h.fonte).sort((a, b) => b.id.localeCompare(a.id));
    return `
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
        ${tile('Acumulada', total != null ? `<span class="${sinal(total)}">${pctS(total)}</span>` : '—', 'desde o 1º mês com histórico')}
        ${tile('Últimos 12 meses', doze != null ? `<span class="${sinal(doze)}">${pctS(doze)}</span>` : '—', 'composta mês a mês')}
        <div class="col-span-2 lg:col-span-1">${tile('Último mês', ult ? `<span class="${sinal(ult.rent)}">${pctS(ult.rent)}</span>` : '—', ult ? fmt.monthLong(ult.ym) : 'sem dados')}</div>
      </div>
      ${card(`<div class="flex items-center justify-between gap-2 mb-2 flex-wrap"><h3 class="font-semibold">Rentabilidade mês a mês</h3>
        <button data-act="foto" class="text-sm text-emerald-700 font-semibold hover:underline">＋ Patrimônio de mês passado</button></div>
        ${hist.some((m) => m.rent != null) ? `<div class="table-wrap"><table class="w-full"><thead><tr><th>Ano</th>${['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((m) => `<th class="text-right">${m}</th>`).join('')}<th class="text-right">Ano</th></tr></thead>
          <tbody>${anos.map((y) => {
            const meses = Array.from({ length: 12 }, (_, i) => porYm.get(`${y}-${String(i + 1).padStart(2, '0')}`));
            const ano = I().acumulada(meses.filter(Boolean));
            return `<tr><td class="font-medium">${y}</td>${meses.map((m) => celula(m?.rent ?? null)).join('')}${celula(ano)}</tr>`;
          }).join('')}</tbody></table></div>`
        : '<p class="text-sm text-slate-500">A rentabilidade aparece quando houver o patrimônio de dois meses seguidos. O app guarda o deste mês sozinho; para os anteriores, informe o patrimônio (ex.: copiando do Investidor 10).</p>'}
        <p class="text-xs text-slate-500 mt-2">Cálculo: (patrimônio final − inicial − aportes líquidos + proventos) ÷ (patrimônio inicial + metade dos aportes). Acumulado = composto.</p>`)}
      ${fotos.length ? card(`<h3 class="font-semibold mb-2">Meses informados</h3><ul class="text-sm divide-y divide-slate-100">${fotos.map((h) => `
        <li><button data-foto="${h.id}" class="w-full flex justify-between py-1.5 hover:bg-slate-50"><span>${fmt.monthLong(h.id)}</span>
          <span class="tabular-nums">${fmt.brl(h.patrimonio)}${h.manual ? ` <span class="text-xs text-slate-400">aplicado ${fmt.brl(h.investido)}</span>` : ''}</span></button></li>`).join('')}</ul>`) : ''}`;
  }

  /* ---------------- Movimentações ---------------- */

  function movsHTML() {
    const aMap = new Map(I().ativos().map((a) => [a.id, a]));
    const cMap = new Map(I().contas().map((c) => [c.id, c]));
    const q = Fin.parsers.normalize(filtroMovs.busca);
    const fAtivo = Fin.state.invFiltroAtivo || '';
    const lista = I().movs().filter((m) => {
      if (filtroMovs.conta && m.conta !== filtroMovs.conta) return false;
      if (filtroMovs.tipo && m.tipo !== filtroMovs.tipo) return false;
      if (fAtivo && m.ativo !== fAtivo) return false;
      if (q && !Fin.parsers.normalize(`${aMap.get(m.ativo)?.ticker || ''} ${m.obs || ''} ${cMap.get(m.conta)?.nome || ''}`).includes(q)) return false;
      return true;
    }).sort((a, b) => (b.data || '').localeCompare(a.data || '') || (b.criadoEm || '').localeCompare(a.criadoEm || ''));
    const opt = (v, r, cur) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(r)}</option>`;
    return `
      ${card(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <input id="mv-busca" type="search" class="input col-span-2 lg:col-span-1" placeholder="Buscar ticker…" value="${esc(filtroMovs.busca)}" aria-label="Buscar">
        <select id="mv-conta" class="input" aria-label="Conta">${opt('', 'Todas as contas', filtroMovs.conta)}${I().contas().map((c) => opt(c.id, c.nome, filtroMovs.conta)).join('')}</select>
        <select id="mv-tipo" class="input" aria-label="Tipo">${opt('', 'Todos os tipos', filtroMovs.tipo)}${Object.entries(I().TIPOS).map(([k, t]) => opt(k, t.nome, filtroMovs.tipo)).join('')}</select>
        ${fAtivo ? `<button data-act="limpar-ativo" class="chip is-active">${esc(aMap.get(fAtivo)?.ticker || '')} ✕</button>` : ''}
      </div>`)}
      <p class="text-xs text-slate-500 px-1">${lista.length} movimentações</p>
      ${card(lista.length ? `<div class="table-wrap"><table class="w-full"><thead><tr><th>Data</th><th>Tipo</th><th>Ativo / conta</th><th class="text-right">Qtd</th><th class="text-right">Preço</th><th class="text-right">Total</th><th class="text-right">Em R$</th></tr></thead>
        <tbody>${lista.slice(0, 300).map((m) => {
          const a = aMap.get(m.ativo);
          const c = cMap.get(m.conta);
          const moeda = a?.moeda || c?.moeda || 'BRL';
          const t = I().TIPOS[m.tipo] || { nome: m.tipo, icone: '' };
          const q2 = Number(m.qtd) || 0;
          const p = Number(m.preco) || 0;
          const tot = m.valor != null ? Number(m.valor) : m.tipo === 'venda' ? q2 * p - (m.taxas || 0) : q2 * p + (m.taxas || 0);
          const cb = moeda === 'USD' ? m.cambio || I().dolarAtual() || 0 : 1;
          const semValor = m.tipo === 'desdobramento' || m.tipo === 'grupamento';
          return `<tr data-mov="${m.id}" class="cursor-pointer hover:bg-emerald-50/60">
            <td class="tabular-nums">${fmt.date(m.data)}</td>
            <td>${t.icone} ${t.nome}${{ nota: 'nota', i10: 'Investidor 10', nomad: 'extrato Nomad' }[m.origem] ? ` <span class="text-[11px] text-slate-400">${{ nota: 'nota', i10: 'Investidor 10', nomad: 'extrato Nomad' }[m.origem]}</span>` : ''}</td>
            <td><span class="font-medium">${esc(a?.ticker || c?.nome || '—')}</span>${a ? ` <span class="text-[11px] text-slate-400">${esc(c?.nome || '')}</span>` : ''}</td>
            <td class="num">${semValor ? `1 → ${fmt.qtd(m.fator)}` : m.qtd != null ? fmt.qtd(m.qtd) : ''}</td>
            <td class="num">${m.preco != null ? fmt.moeda(m.preco, moeda) : ''}</td>
            <td class="num">${semValor ? '' : fmt.moeda(tot, moeda)}</td>
            <td class="num">${semValor || moeda !== 'USD' ? '' : fmt.brl(tot * cb)}</td></tr>`;
        }).join('')}</tbody></table></div>` : '<p class="text-sm text-slate-500">Nenhuma movimentação com estes filtros.</p>')}`;
  }

  /* ---------------- Metas ---------------- */

  function metasHTML(r, limite = null) {
    const ms = I().metas().map((m) => I().progressoMeta(m, r)).sort((a, b) => a.concluida - b.concluida || b.pct - a.pct);
    if (limite && !ms.length) return '';
    const lista = limite ? ms.slice(0, limite) : ms;
    return `
      <div class="flex items-center justify-between px-1"><h3 class="font-semibold">Metas</h3>
        <span class="flex gap-3">${limite && ms.length > limite ? '<button data-aba="metas" class="text-sm text-slate-500 hover:underline">ver todas</button>' : ''}
        <button data-act="nova-meta" class="text-sm text-emerald-700 font-semibold hover:underline">＋ Meta</button></span></div>
      ${lista.length ? `<div class="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">${lista.map((p) => `
        <button data-meta="${p.meta.id}" class="block w-full text-left bg-white rounded-2xl shadow-sm p-4 hover:ring-2 hover:ring-emerald-200 min-w-0">
          <div class="flex items-center gap-2"><span class="font-medium truncate flex-1">${esc(p.meta.nome)}</span>
            <span class="text-sm font-semibold ${p.concluida ? 'text-emerald-700' : ''}">${p.concluida ? '✓ ' : ''}${fmt.pct(p.pct)}</span></div>
          <div class="h-2 bg-slate-100 rounded mt-2" aria-hidden="true"><div class="h-2 rounded" style="width:${p.pct * 100}%;background:${p.concluida ? COR.ganho : COR.aplicado}"></div></div>
          <dl class="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs mt-2 tabular-nums">
            <dt class="text-slate-500">${p.meta.tipo === 'proventos' ? 'Média mensal' : 'Atual'}</dt><dd class="text-right">${fmt.brl(p.atual)}</dd>
            <dt class="text-slate-500">Objetivo</dt><dd class="text-right">${fmt.brl(p.alvo)}</dd>
            <dt class="text-slate-500">Faltam</dt><dd class="text-right">${fmt.brl(p.falta)}</dd>
            ${p.meta.aporteMensal ? `<dt class="text-slate-500">Aporte mensal</dt><dd class="text-right">${fmt.brl(p.meta.aporteMensal)}</dd>` : ''}
            ${p.conclusao ? `<dt class="text-slate-500">Conclusão estimada</dt><dd class="text-right font-medium">${fmt.monthLong(p.conclusao)}</dd>` : ''}
          </dl>
        </button>`).join('')}</div>` : '<p class="text-sm text-slate-500 px-1">Nenhuma meta ainda. Ex.: patrimônio de R$ 15 mil, R$ 100/mês de proventos, R$ 6 mil no exterior.</p>'}`;
  }

  /* ---------------- Primeiro uso ---------------- */

  function vazioHTML() {
    return `<div class="space-y-4">
      ${card(`<div class="text-4xl" aria-hidden="true">💼</div>
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
    </div>`;
  }

  /* ---------------- Render ---------------- */

  function render(view, { signal }) {
    if (!I().temDados()) {
      view.innerHTML = vazioHTML();
      view.addEventListener('click', (e) => {
        const act = e.target.closest('[data-act]')?.dataset.act;
        if (act === 'comecar') { I().criarContasPadrao(); Fin.ui.toast('Contas criadas: Rico, Nomad e Reserva de emergência.'); Fin.router.refresh(); }
        if (act === 'nova-conta') FI().conta();
        if (act === 'importar') Fin.importarInv.abrir();
      }, { signal });
      return;
    }
    I().garantirCategoria();
    const aba = Fin.state.invAba || 'resumo';
    const r = I().resumo();
    I().salvarFoto(r);
    const hist = I().historico(r);

    const corpo = { resumo: () => resumoHTML(r, hist), ativos: () => ativosHTML(r), proventos: () => proventosHTML(r), rent: () => rentHTML(hist), movs: movsHTML, metas: () => metasHTML(r) }[aba] || (() => resumoHTML(r, hist));
    view.innerHTML = `<div class="space-y-4">${cabecalho(aba)}${corpo()}</div>`;

    // Gráficos
    const evo = view.querySelector('#inv-evolucao');
    if (evo) {
      const dados = hist.slice(-12).map((m) => ({
        ym: m.ym, aplicado: Math.max(0, Math.min(m.aplicado, m.patrimonio ?? m.aplicado)),
        ganho: m.patrimonio != null ? Math.max(0, m.patrimonio - m.aplicado) : null,
        saldo: m.patrimonio, extra: m.patrimonio != null && m.patrimonio < m.aplicado ? `Perda: ${fmt.brl(m.patrimonio - m.aplicado)}` : m.rent != null ? `Rentabilidade do mês: ${pctS(m.rent)}` : '',
      }));
      const desenhar = () => Fin.charts.columns(evo, dados.length ? dados : [{ ym: fmt.currentYM(), aplicado: 0, ganho: 0 }], {
        stacked: true, totalLabel: 'Patrimônio', label: 'Evolução do patrimônio',
        series: [{ key: 'aplicado', label: 'Valor aplicado', color: COR.aplicado }, { key: 'ganho', label: 'Ganho de capital', color: COR.ganho }],
      });
      desenhar();
      const ro = new ResizeObserver(() => requestAnimationFrame(desenhar));
      ro.observe(evo);
      signal.addEventListener('abort', () => ro.disconnect());
    }
    const pvEl = view.querySelector('#inv-proventos');
    if (pvEl) {
      const atual = fmt.currentYM();
      const dados = Array.from({ length: 12 }, (_, i) => { const ym = fmt.addMonths(atual, i - 11); return { ym, valor: r.proventos.porMes[ym] || 0 }; });
      const desenhar = () => Fin.charts.columns(pvEl, dados, { label: 'Proventos por mês', series: [{ key: 'valor', label: 'Recebido', color: COR.proventos }] });
      desenhar();
      const ro = new ResizeObserver(() => requestAnimationFrame(desenhar));
      ro.observe(pvEl);
      signal.addEventListener('abort', () => ro.disconnect());
    }

    // Filtros das movimentações
    view.querySelector('#mv-busca')?.addEventListener('input', (e) => {
      filtroMovs.busca = e.target.value;
      const pos = e.target.selectionStart;
      Fin.router.refresh();
      const novo = document.getElementById('mv-busca');
      novo?.focus(); novo?.setSelectionRange(pos, pos);
    });
    view.querySelector('#mv-conta')?.addEventListener('change', (e) => { filtroMovs.conta = e.target.value; Fin.router.refresh(); });
    view.querySelector('#mv-tipo')?.addEventListener('change', (e) => { filtroMovs.tipo = e.target.value; Fin.router.refresh(); });

    view.addEventListener('click', (e) => {
      const t = e.target;
      const abaBtn = t.closest('[data-aba]');
      if (abaBtn) { Fin.state.invAba = abaBtn.dataset.aba; return Fin.router.refresh(); }
      const at = t.closest('[data-ativo]');
      if (at) return FI().ativo(at.dataset.ativo);
      const mv = t.closest('[data-mov]');
      if (mv) return FI().mov({ id: mv.dataset.mov });
      const ct = t.closest('[data-conta]');
      if (ct) return FI().conta(ct.dataset.conta);
      const cs = t.closest('[data-conta-saldo]');
      if (cs) return FI().mov({ conta: cs.dataset.contaSaldo, tipo: 'saldo' });
      const mt = t.closest('[data-meta]');
      if (mt) return FI().meta(mt.dataset.meta);
      const ft = t.closest('[data-foto]');
      if (ft) return FI().foto(ft.dataset.foto);
      const act = t.closest('[data-act]')?.dataset.act;
      if (!act) return;
      if (act === 'novo-mov') FI().mov();
      else if (act === 'novo-provento') FI().mov({ tipo: 'provento', conta: I().contas().find((c) => c.tipo === 'corretora')?.id });
      else if (act === 'precos') FI().precos();
      else if (act === 'importar') Fin.importarInv.abrir();
      else if (act === 'chaves') FI().cotacoes();
      else if (act === 'carga') FI().carga();
      else if (act === 'nova-conta') FI().conta();
      else if (act === 'nova-meta') FI().meta();
      else if (act === 'alocacao') FI().alocacao();
      else if (act === 'foto') FI().foto();
      else if (act === 'limpar-ativo') { Fin.state.invFiltroAtivo = null; Fin.router.refresh(); }
      else if (act === 'dolar') atualizarDolar(true);
    }, { signal });

    // Dólar ao vivo: atualiza ao abrir (se tiver mais de 1 min) e a cada minuto.
    const temUSD = r.abertas.some((p) => p.moeda === 'USD');
    async function atualizarDolar(avisar = false) {
      const antes = Fin.cotacoes.dolar()?.valor;
      try {
        const d = await Fin.cotacoes.atualizarDolar();
        if (signal.aborted) return;
        const chip = view.querySelector('[data-dolar]');
        if (chip) chip.innerHTML = dolarChip();
        if (avisar) Fin.ui.toast(`Dólar: ${fmt.brl(d.valor)}`);
        // Redesenha com o dólar novo (se mudou e não há janela aberta).
        if (temUSD && antes !== d.valor && !document.querySelector('#modal-root .modal-panel')) Fin.router.refresh();
      } catch {
        if (avisar) Fin.ui.toast('Não consegui atualizar o dólar (sem internet?).', 'error');
      }
    }
    const d = Fin.cotacoes.dolar();
    if (!d || Date.now() - new Date(d.buscadoEm || d.em) > 60000) atualizarDolar();

    // Preços dos ativos: busca sozinho (se houver chaves) quando a última busca tem mais de 30 min.
    const ult = Fin.storage.prefs().cotacoesUltima;
    if (Fin.cotacoes.temChaves() && (!ult || Date.now() - new Date(ult) > 30 * 60 * 1000)) {
      Fin.cotacoes.atualizarPrecos().then((res) => {
        if (signal.aborted || !res.atualizados) return;
        if (!document.querySelector('#modal-root .modal-panel')) Fin.router.refresh();
        if (res.falhas.length) console.warn('[cotações]', res.falhas);
      }).catch((e) => console.warn('[cotações]', e));
    }
    const timer = setInterval(() => { if (document.visibilityState === 'visible') atualizarDolar(); }, 60000);
    signal.addEventListener('abort', () => clearInterval(timer));
  }

  return { title: 'Investimentos', render };
})();
