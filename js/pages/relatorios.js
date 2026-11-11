/**
 * pages/relatorios.js — Relatórios (inspirados nos de Mobills/Organizze):
 * período configurável, comparação com o período anterior, evolução mensal,
 * saldo acumulado, categorias com detalhamento, classificação, forma de
 * pagamento, maiores despesas e exportação CSV.
 */
window.Fin = window.Fin || {};
Fin.pages = Fin.pages || {};

Fin.pages.relatorios = (() => {
  const fmt = Fin.fmt;
  const esc = fmt.esc;
  const A = () => Fin.analise;
  const CH = () => Fin.charts;

  const PRESETS = [['mes', 'Mês'], ['3m', '3 meses'], ['6m', '6 meses'], ['12m', '12 meses'], ['ano', 'Ano'], ['custom', 'Personalizado']];
  const st = { preset: '6m', ini: null, fim: null, tipo: 'despesa', categoria: null, todas: false };

  function periodo() {
    if (st.preset === 'custom' && st.ini && st.fim) return st.ini <= st.fim ? { ini: st.ini, fim: st.fim } : { ini: st.fim, fim: st.ini };
    const fim = Fin.state.mes;
    const n = { mes: 1, '3m': 3, '6m': 6, '12m': 12 }[st.preset];
    const ini = st.preset === 'ano' ? `${fim.slice(0, 4)}-01` : fmt.addMonths(fim, -((n || 6) - 1));
    return { ini, fim };
  }

  const rotuloPeriodo = (ini, fim) => (ini === fim ? fmt.monthLong(ini) : `${fmt.monthShort(ini)} a ${fmt.monthShort(fim)}`);
  const pct = (v) => `${(v * 100).toFixed(Math.abs(v) < 0.1 ? 1 : 0).replace('.', ',')}%`;

  /** Variação com seta + texto. A cor depende de "subir é bom?" (despesa subir é ruim). */
  function delta(v, sobeBom, pontos = false) {
    if (v == null || !Number.isFinite(v)) return '<span class="text-slate-400">—</span>';
    const abs = Math.abs(v * 100);
    if (abs < 0.5) return '<span class="text-slate-500">= estável</span>';
    const bom = v > 0 === sobeBom;
    const txt = `${abs.toFixed(abs < 10 ? 1 : 0).replace('.', ',')}${pontos ? ' p.p.' : '%'}`;
    return `<span class="${bom ? 'text-[#006300]' : 'text-rose-700'} font-medium"><span aria-hidden="true">${v > 0 ? '▲' : '▼'}</span> ${v > 0 ? 'subiu' : 'caiu'} ${txt}</span>`;
  }

  const card = (inner, cls = '') => `<section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5 min-w-0 ${cls}">${inner}</section>`;

  function kpi(rotulo, valor, sub, d) {
    return `
      <div class="bg-white rounded-2xl shadow-sm p-4 min-w-0">
        <div class="text-xs text-slate-500">${rotulo}</div>
        <div class="text-lg sm:text-xl font-semibold mt-0.5 truncate">${valor}</div>
        <div class="text-xs text-slate-500 mt-0.5 truncate">${sub}</div>
        <div class="text-xs mt-1.5">${d}</div>
      </div>`;
  }

  /* ---------------- Blocos ---------------- */

  function filtrosHTML(ini, fim, ant) {
    return card(`
      <div class="chips flex gap-2 overflow-x-auto -mx-1 px-1 pb-1" role="tablist" aria-label="Período">
        ${PRESETS.map(([k, r]) => `<button role="tab" aria-selected="${st.preset === k}" data-preset="${k}" class="chip !shadow-none border border-slate-200 ${st.preset === k ? 'is-active !border-transparent' : ''}">${r}</button>`).join('')}
      </div>
      ${st.preset === 'custom' ? `
        <div class="grid grid-cols-2 gap-3 mt-3">
          <label class="field"><span>De</span><input id="rel-ini" type="month" class="input" value="${ini}"></label>
          <label class="field"><span>Até</span><input id="rel-fim" type="month" class="input" value="${fim}"></label>
        </div>` : ''}
      <div class="flex flex-wrap items-center justify-between gap-2 mt-3 text-xs text-slate-500">
        <span><b class="text-slate-700">${rotuloPeriodo(ini, fim)}</b> · comparado a ${rotuloPeriodo(ant.ini, ant.fim)}</span>
        <label class="inline-flex items-center gap-2 cursor-pointer">
          <input type="checkbox" id="rel-detalhar" class="accent-emerald-600 w-4 h-4" ${Fin.state.detalharFaturas ? 'checked' : ''}>
          Detalhar faturas do cartão
        </label>
      </div>`, '!p-3 sm:!p-4');
  }

  function kpisHTML(c) {
    const a = c.atual;
    const n = a.meses;
    return `
      ${c.completo ? '' : `<p class="text-xs text-slate-500 bg-white rounded-xl px-3 py-2 shadow-sm">
        <span aria-hidden="true">ⓘ</span> Sem comparação: o período anterior (${rotuloPeriodo(c.periodoAnterior.ini, c.periodoAnterior.fim)}) não tem dados em todos os meses.</p>`}
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${kpi('Receitas', fmt.brl(a.receitas), n > 1 ? `média ${fmt.brl(a.mediaReceitas)}/mês` : '&nbsp;', delta(c.delta.receitas, true))}
        ${kpi('Despesas', fmt.brl(a.despesas), n > 1 ? `média ${fmt.brl(a.mediaDespesas)}/mês` : '&nbsp;', delta(c.delta.despesas, false))}
        ${kpi('Saldo', `<span class="${a.saldo < 0 ? 'text-rose-700' : ''}">${fmt.brl(a.saldo)}</span>`, a.saldo < 0 ? 'gastou mais do que recebeu' : 'sobrou no período', delta(c.delta.saldo, true))}
        ${kpi('Taxa de poupança', a.poupanca == null ? '—' : `<span class="${a.poupanca < 0 ? 'text-rose-700' : ''}">${pct(a.poupanca)}</span>`, 'da receita que sobrou', delta(c.delta.poupanca, true, true))}
      </div>`;
  }

  function evolucaoHTML(ev) {
    const series = [
      { key: 'receitas', label: 'Receitas', color: CH().SERIES.receitas },
      { key: 'despesas', label: 'Despesas', color: CH().SERIES.despesas },
    ];
    return card(`
      <div class="flex items-start justify-between gap-3 flex-wrap mb-3">
        <h2 class="font-semibold">Receitas x despesas por mês</h2>
        ${CH().legend(series)}
      </div>
      <div id="rel-evo" class="w-full min-w-0 overflow-hidden"></div>
      <details class="mt-3">
        <summary class="text-xs text-slate-500 flex items-center gap-1"><span class="chev">▸</span> Ver tabela</summary>
        <div class="table-wrap mt-2 border border-slate-200 rounded-xl"><table>
          <thead><tr><th>Mês</th><th class="num">Receitas</th><th class="num">Despesas</th><th class="num">Saldo</th><th class="num">Acumulado</th></tr></thead>
          <tbody>${ev.map((m) => `<tr><td>${fmt.monthShort(m.ym)}</td><td class="num">${fmt.brl(m.receitas)}</td><td class="num">${fmt.brl(m.despesas)}</td><td class="num">${fmt.brl(m.saldo)}</td><td class="num">${fmt.brl(m.acumulado)}</td></tr>`).join('')}</tbody>
        </table></div>
      </details>`);
  }

  function saldoHTML(ev) {
    const melhor = ev.reduce((m, x) => (x.saldo > m.saldo ? x : m), ev[0]);
    const pior = ev.reduce((m, x) => (x.saldo < m.saldo ? x : m), ev[0]);
    return card(`
      <h2 class="font-semibold">Saldo acumulado</h2>
      <p class="text-xs text-slate-500 mb-3">Soma dos saldos mês a mês no período.</p>
      <div id="rel-saldo" class="w-full min-w-0 overflow-hidden"></div>
      ${ev.length > 1 ? `<div class="grid grid-cols-2 gap-3 mt-3 text-xs">
        <div class="bg-slate-50 rounded-xl p-2.5"><div class="text-slate-500">Melhor mês</div><div class="font-semibold text-slate-800">${fmt.monthShort(melhor.ym)} · ${fmt.brl(melhor.saldo)}</div></div>
        <div class="bg-slate-50 rounded-xl p-2.5"><div class="text-slate-500">Pior mês</div><div class="font-semibold text-slate-800">${fmt.monthShort(pior.ym)} · ${fmt.brl(pior.saldo)}</div></div>
      </div>` : ''}`);
  }

  function categoriasHTML(cats, ini, fim) {
    const total = cats.reduce((s, c) => s + c.total, 0) || 1;
    const max = Math.max(...cats.map((c) => c.total), 1);
    const lista = st.todas ? cats : cats.slice(0, 10);
    const cor = st.tipo === 'despesa' ? CH().SERIES.despesas : CH().SERIES.receitas;
    const linhas = lista.map((c) => `
      <li>
        <button data-relcat="${esc(c.categoria)}" class="hbar-row w-full text-left text-sm py-1.5 rounded-lg hover:bg-slate-50 ${st.categoria === c.categoria ? 'bg-slate-50' : ''}"
                aria-expanded="${st.categoria === c.categoria}" title="${esc(c.categoria)}: ${fmt.brl(c.total)} (${pct(c.total / total)})">
          <span class="truncate text-slate-700">${c.icone ? `<span aria-hidden="true">${c.icone}</span> ` : ''}${esc(c.categoria)}</span>
          <span class="flex items-center min-w-0"><span class="h-2.5 rounded-r" style="width:${Math.max(1.5, (c.total / max) * 100)}%;background:${cor}"></span></span>
          <span class="text-right whitespace-nowrap">
            <span class="tabular-nums text-slate-700">${fmt.brl(c.total)}</span><span class="text-slate-400 text-xs ml-1">${pct(c.total / total)}</span>
            ${c.antes === null ? '' : `<span class="block text-[11px]">${c.antes ? delta(c.delta, st.tipo === 'receita') : '<span class="text-slate-400">novo no período</span>'}</span>`}
          </span>
        </button>
      </li>`).join('');

    return card(`
      <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h2 class="font-semibold">Por categoria</h2>
        <div class="seg w-56 !text-xs" role="tablist" aria-label="Tipo">
          <label><input type="radio" name="rel-tipo" value="despesa" ${st.tipo === 'despesa' ? 'checked' : ''}><span class="!py-1.5">Despesas</span></label>
          <label><input type="radio" name="rel-tipo" value="receita" ${st.tipo === 'receita' ? 'checked' : ''}><span class="!py-1.5">Receitas</span></label>
        </div>
      </div>
      ${cats.length ? `<ul class="space-y-0.5">${linhas}</ul>
        <p class="text-xs text-slate-400 mt-2">Toque numa categoria para ver o histórico e os maiores lançamentos.</p>
        ${cats.length > 10 ? `<button data-act="todas" class="mt-2 text-sm text-emerald-700 font-medium hover:underline">${st.todas ? 'Mostrar só as 10 maiores' : `Ver todas as ${cats.length} categorias`}</button>` : ''}`
      : '<p class="text-sm text-slate-500 py-3">Nada neste período.</p>'}`);
  }

  function detalheHTML(cats, ini, fim) {
    const c = cats.find((x) => x.categoria === st.categoria);
    if (!c) return '';
    const n = A().meses(ini, fim).length;
    const total = cats.reduce((s, x) => s + x.total, 0) || 1;
    const itens = A().itens(ini, fim, { tipo: st.tipo, detalhar: Fin.state.detalharFaturas, categoria: c.categoria }).slice(0, 8);
    return card(`
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="font-semibold truncate">${c.icone ? `<span aria-hidden="true">${c.icone}</span> ` : ''}${esc(c.categoria)}</h2>
          <p class="text-xs text-slate-500">${fmt.brl(c.total)} no período · ${pct(c.total / total)} do total${n > 1 ? ` · média ${fmt.brl(c.total / n)}/mês` : ''}</p>
        </div>
        <button data-act="fechar-cat" class="icon-btn shrink-0" aria-label="Fechar detalhe">✕</button>
      </div>
      ${n > 1 ? '<div id="rel-cat" class="w-full min-w-0 overflow-hidden mt-3"></div>' : ''}
      <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide mt-4 mb-1">Maiores lançamentos</h3>
      ${itens.length ? `<ul class="divide-y divide-slate-100">${itens.map(itemHTML).join('')}</ul>` : '<p class="text-sm text-slate-500">—</p>'}`, 'ring-2 ring-emerald-100');
  }

  function itemHTML(i) {
    const attr = i.tipoItem === 'compra' ? `data-edit-compra="${i.id}"` : `data-edit="${i.id}"`;
    return `
      <li class="flex items-center gap-3 py-2.5 cursor-pointer" ${attr} role="button" tabindex="0">
        <span class="text-base w-6 text-center shrink-0" aria-hidden="true">${i.icone || '•'}</span>
        <div class="flex-1 min-w-0">
          <div class="text-sm truncate">${esc(i.descricao)}</div>
          <div class="text-xs text-slate-500 truncate">${fmt.date(i.data)} · ${esc(i.origem)}${i.parcela ? ` · ${i.parcela.atual}/${i.parcela.total}` : ''}</div>
        </div>
        <span class="text-sm font-semibold tabular-nums shrink-0">${fmt.brl(i.valor)}</span>
      </li>`;
  }

  function extrasHTML(ini, fim) {
    const det = Fin.state.detalharFaturas;
    const classes = A().porClassificacao(ini, fim, det);
    const formas = A().porForma(ini, fim);
    const maiores = A().itens(ini, fim, { tipo: 'despesa', detalhar: det }).slice(0, 10);
    return `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        ${card(`<h2 class="font-semibold">Por classificação</h2>
          <p class="text-xs text-slate-500 mb-3">Despesas pelo grupo da categoria (ex.: Essencial). Ajuste em Categorias.</p>
          ${classes.length ? CH().hbars(classes.map((c) => ({ label: c.label, total: c.total }))) : '<p class="text-sm text-slate-500">—</p>'}`)}
        ${card(`<h2 class="font-semibold">Por forma de pagamento</h2>
          <p class="text-xs text-slate-500 mb-3">Como as despesas foram pagas (fatura do cartão conta pela forma usada para pagá-la).</p>
          ${formas.length ? CH().hbars(formas.slice(0, 8).map((f) => ({ label: f.label, icone: f.icone, total: f.total }))) : '<p class="text-sm text-slate-500">—</p>'}`)}
      </div>
      ${card(`<h2 class="font-semibold mb-1">Maiores despesas do período</h2>
        ${maiores.length ? `<ul class="divide-y divide-slate-100">${maiores.map(itemHTML).join('')}</ul>` : '<p class="text-sm text-slate-500 py-2">—</p>'}`)}`;
  }

  /* ---------------- Montagem ---------------- */

  function observar(el, desenhar, signal) {
    if (!el) return;
    let w = el.clientWidth;
    desenhar(); // desenha já; o observer só redesenha quando a largura mudar
    const ro = new ResizeObserver(() => requestAnimationFrame(() => {
      if (Math.abs(el.clientWidth - w) > 1) { w = el.clientWidth; desenhar(); }
    }));
    ro.observe(el);
    signal.addEventListener('abort', () => ro.disconnect());
  }

  function render(view, { signal }) {
    if (!Fin.storage.hasData()) {
      view.innerHTML = Fin.ui.emptyState('📊', 'Sem dados para analisar', 'Importe sua planilha ou crie lançamentos.', '<a href="#/dados" class="btn btn-primary">Importar planilha</a>');
      return;
    }
    const { ini, fim } = periodo();
    const ant = A().anterior(ini, fim);
    const comp = A().comparativo(ini, fim);
    const ev = A().evolucao(ini, fim);
    const cats = A().categoriasComparadas(ini, fim, st.tipo, Fin.state.detalharFaturas);
    if (st.categoria && !cats.some((c) => c.categoria === st.categoria)) st.categoria = null;

    view.innerHTML = `
      <div class="space-y-4">
        ${st.preset === 'custom' ? '' : `${Fin.ui.monthNav(fim)}`}
        ${filtrosHTML(ini, fim, ant)}
        ${kpisHTML(comp)}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          ${evolucaoHTML(ev)}
          ${saldoHTML(ev)}
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          ${categoriasHTML(cats, ini, fim)}
          <div id="rel-det-wrap">${detalheHTML(cats, ini, fim)}</div>
        </div>
        ${extrasHTML(ini, fim)}
        <div class="flex flex-wrap items-center gap-3 justify-between bg-white rounded-2xl shadow-sm p-4">
          <p class="text-sm text-slate-600">Leve os lançamentos de ${rotuloPeriodo(ini, fim)} para o Excel.</p>
          <button data-act="csv" class="btn btn-ghost">⬇️ Exportar CSV</button>
        </div>
      </div>`;

    // Gráficos (redesenhados quando a largura muda)
    const evoEl = view.querySelector('#rel-evo');
    observar(evoEl, () => CH().columns(evoEl, ev, {
      series: [
        { key: 'receitas', label: 'Receitas', color: CH().SERIES.receitas },
        { key: 'despesas', label: 'Despesas', color: CH().SERIES.despesas },
      ],
      label: 'Receitas e despesas por mês',
      onSelect: (m) => { Fin.state.mes = m; st.preset = 'mes'; Fin.router.render(); },
    }), signal);
    const saldoEl = view.querySelector('#rel-saldo');
    observar(saldoEl, () => CH().line(saldoEl, ev.map((m) => ({ ym: m.ym, valor: m.acumulado, extra: `Saldo do mês: ${fmt.brl(m.saldo)}` })),
      { nome: 'Acumulado', label: 'Saldo acumulado no período', color: CH().SERIES.receitas }), signal);
    const desenharCat = () => {
      const el = view.querySelector('#rel-cat');
      const c = cats.find((x) => x.categoria === st.categoria);
      if (!el || !c) return;
      const serie = [{ key: 'valor', label: c.categoria, color: st.tipo === 'despesa' ? CH().SERIES.despesas : CH().SERIES.receitas }];
      CH().columns(el, A().meses(ini, fim).map((ym) => ({ ym, valor: c.porMes[ym] || 0 })), { series: serie, label: `Histórico de ${c.categoria}` });
    };
    observar(view.querySelector('#rel-cat'), desenharCat, signal);

    // Interações
    view.addEventListener('click', (e) => {
      const p = e.target.closest('[data-preset]');
      if (p) { st.preset = p.dataset.preset; if (st.preset === 'custom' && !st.ini) Object.assign(st, { ini, fim }); return Fin.router.render(); }
      const cat = e.target.closest('[data-relcat]');
      if (cat) {
        st.categoria = st.categoria === cat.dataset.relcat ? null : cat.dataset.relcat;
        Fin.router.refresh();
        if (st.categoria && window.innerWidth < 1024) document.getElementById('rel-det-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'todas') { st.todas = !st.todas; Fin.router.refresh(); }
      if (act === 'fechar-cat') { st.categoria = null; Fin.router.refresh(); }
      if (act === 'csv') {
        const blob = new Blob([A().csv(ini, fim)], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `financas_${ini}_a_${fim}.csv`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }
    }, { signal });

    view.addEventListener('change', (e) => {
      const t = e.target;
      if (t.name === 'rel-tipo') { st.tipo = t.value; st.categoria = null; return Fin.router.refresh(); }
      if (t.id === 'rel-detalhar') { Fin.state.detalharFaturas = t.checked; return Fin.router.refresh(); }
      if (t.id === 'rel-ini' && t.value) { st.ini = t.value; return Fin.router.render(); }
      if (t.id === 'rel-fim' && t.value) { st.fim = t.value; return Fin.router.render(); }
    }, { signal });
  }

  return { title: 'Relatórios', render, estado: st };
})();
