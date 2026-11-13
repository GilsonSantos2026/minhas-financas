/**
 * pages/dashboard.js — Tela inicial: resumo do mês, evolução, categorias, contas e faturas.
 */
window.Fin = window.Fin || {};
Fin.pages = Fin.pages || {};

Fin.pages.dashboard = (() => {
  const fmt = Fin.fmt;
  const esc = fmt.esc;
  const F = Fin.finance;
  const card = (inner, cls = '') => `<section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5 min-w-0 ${cls}">${inner}</section>`;

  function tile(label, value, sub) {
    return `
      <div class="bg-white rounded-2xl shadow-sm p-4">
        <div class="text-xs text-slate-500">${label}</div>
        <div class="text-lg sm:text-xl font-semibold mt-0.5 whitespace-nowrap">${value}</div>
        <div class="text-xs text-slate-500 mt-0.5">${sub}</div>
      </div>`;
  }

  function hero(r) {
    return card(`
      <div class="text-sm text-slate-500">Saldo previsto do mês</div>
      <div class="text-[40px] sm:text-5xl font-semibold tracking-tight mt-1 ${r.saldo < 0 ? 'text-rose-700' : 'text-slate-900'}">${fmt.brl(r.saldo)}</div>
      <div class="text-sm text-slate-500 mt-2">
        Realizado até agora: <span class="font-medium text-slate-700">${fmt.brl(r.saldoRealizado)}</span>
        <span class="text-slate-400">(recebido ${fmt.brl(r.recebido)} − pago ${fmt.brl(r.pago)})</span>
      </div>
      ${r.aportes > 0 ? `<div class="text-sm text-slate-500 mt-1"><span aria-hidden="true">📈</span> Investido no mês: <span class="font-medium text-emerald-700">${fmt.brl(r.aportes)}</span>
        <span class="text-slate-400">(não entra nas despesas)</span></div>` : ''}
      ${Fin.inv?.temDados() ? `<a href="#/investimentos" class="inline-flex items-center gap-1 text-sm text-emerald-700 font-medium hover:underline mt-2">
        <span aria-hidden="true">💼</span> Patrimônio investido: ${fmt.brl(Fin.inv.resumo().patrimonio)} →</a>` : ''}`);
  }

  function contasHTML(contas, ym) {
    if (!contas.length) {
      return '<p class="text-sm text-slate-500 py-3">Nenhuma conta em aberto neste mês. 🎉</p>';
    }
    const rows = contas.slice(0, 6).map((l) => `
      <li class="flex items-center gap-3 py-2.5" data-edit="${l.id}" role="button" tabindex="0">
        ${Fin.ui.catIcon(l.categoriaIcone, l.categoria, l.tipo)}
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium truncate">${esc(l.descricao || l.categoria)}</div>
          <div class="text-xs text-slate-500">vence ${fmt.date(F.dataRef(l))}</div>
        </div>
        <div class="text-right shrink-0">
          <div class="text-sm font-semibold tabular-nums">${l.status === 'parcial'
            ? `<span class="text-xs font-normal text-slate-500">falta</span> ${fmt.brl(F.valor(l) - (l.valorPago || 0))}`
            : fmt.brl(F.valor(l))}</div>
          ${Fin.ui.statusPill(l)}
        </div>
      </li>`).join('');
    const mais = contas.length > 6
      ? `<a href="#/lancamentos" data-filtro-status="pendentes" class="block text-center text-sm text-emerald-700 font-medium pt-3 hover:underline">Ver todas (${contas.length})</a>`
      : '';
    return `<ul class="divide-y divide-slate-100">${rows}</ul>${mais}`;
  }

  function categoriasHTML(ym) {
    const cats = Fin.state.detalharFaturas ? F.porCategoriaDetalhada(ym) : F.porCategoria(ym, 'despesa');
    if (!cats.length) return '<p class="text-sm text-slate-500 py-3">Sem despesas neste mês.</p>';
    const total = cats.reduce((s, c) => s + c.total, 0);
    let data = cats.map((c) => ({ label: c.categoria, icone: c.icone, total: c.total }));
    if (data.length > 7) {
      const outros = data.slice(6).reduce((s, d) => s + d.total, 0);
      data = [...data.slice(0, 6), { label: `Outras (${cats.length - 6})`, icone: '', total: outros }];
    }
    return Fin.charts.hbars(data, { total });
  }

  function faturasHTML(ym) {
    const fs = F.faturas(ym);
    if (!fs.length) return '<p class="text-sm text-slate-500 py-3">Nenhuma compra no cartão com fatura neste mês.</p>';
    return `
      <ul class="divide-y divide-slate-100">${fs.map((f) => `
        <li><a href="#/cartoes" data-ir-cartao="${esc(f.cartao)}" class="flex items-center gap-3 py-2.5 hover:bg-slate-50 rounded-lg">
          <span class="w-10 h-10 rounded-full bg-slate-100 grid place-items-center text-lg shrink-0" aria-hidden="true">💳</span>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate">${esc(f.cartao)}</div>
            <div class="text-xs text-slate-500">${f.qtd} ${f.qtd === 1 ? 'compra' : 'compras'}</div>
          </div>
          <div class="text-sm font-semibold tabular-nums">${fmt.brl(f.total)}</div>
          <span class="text-slate-300" aria-hidden="true">›</span>
        </a></li>`).join('')}
      </ul>
      <p class="text-xs text-slate-400 mt-2">O valor já entra nas despesas pelo lançamento de pagamento da fatura.</p>`;
  }

  /** Resumo do orçamento: as 4 categorias mais perto (ou acima) do limite. */
  function orcamentoHTML(ym) {
    const o = F.orcamento(ym);
    if (!o.itens.length) {
      return card(`
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-2xl" aria-hidden="true">🎯</span>
          <div class="flex-1 min-w-[12rem]">
            <h2 class="font-semibold">Orçamento</h2>
            <p class="text-sm text-slate-500">Defina limites mensais por categoria e acompanhe aqui.</p>
          </div>
          <a href="#/orcamento" class="btn btn-ghost">Definir orçamentos</a>
        </div>`);
    }
    const top = o.itens.slice(0, 4);
    return card(`
      <div class="flex items-center justify-between gap-3 mb-1">
        <h2 class="font-semibold">Orçamento do mês</h2>
        <a href="#/orcamento" class="text-sm text-emerald-700 font-medium hover:underline">Ver tudo (${o.itens.length})</a>
      </div>
      <ul class="grid md:grid-cols-2 md:gap-x-8 divide-y md:divide-y-0 divide-slate-100">${top.map(Fin.pages.orcamento.linhaHTML).join('')}</ul>`);
  }

  function tabelaHistorico(hist) {
    return `
      <details class="mt-3">
        <summary class="text-xs text-slate-500 flex items-center gap-1"><span class="chev">▸</span> Ver tabela</summary>
        <div class="table-wrap mt-2 border border-slate-200 rounded-xl">
          <table>
            <thead><tr><th>Mês</th><th class="num">Receitas</th><th class="num">Despesas</th><th class="num">Saldo</th></tr></thead>
            <tbody>${hist.map((h) => `<tr><td>${fmt.monthShort(h.ym)}</td><td class="num">${fmt.brl(h.receitas)}</td><td class="num">${fmt.brl(h.despesas)}</td><td class="num">${fmt.brl(h.saldo)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </details>`;
  }

  function render(view, { signal }) {
    if (!Fin.storage.hasData()) {
      view.innerHTML = Fin.ui.emptyState('📂', 'Nenhum dado ainda',
        'Importe sua planilha antiga ou crie seu primeiro lançamento.',
        '<a href="#/dados" class="btn btn-primary">Importar planilha</a>');
      return;
    }

    const ym = Fin.state.mes;
    const r = F.resumo(ym);
    const hist = F.historico(ym, 6);
    const contas = F.contasAbertas(ym);
    const series = [
      { key: 'receitas', label: 'Receitas', color: Fin.charts.SERIES.receitas },
      { key: 'despesas', label: 'Despesas', color: Fin.charts.SERIES.despesas },
    ];

    // Lembrete de backup: alterações sem backup há 7+ dias (dá para adiar até reabrir o app).
    const b = Fin.storage.situacaoBackup();
    const lembrete = b.lembrar && !Fin.state.backupAdiado ? `
      <div class="flex flex-wrap items-center gap-3 bg-amber-50 text-amber-900 rounded-2xl px-4 py-3 text-sm" role="status">
        <span class="text-xl" aria-hidden="true">🛟</span>
        <span class="flex-1 min-w-[12rem]">${b.ultimo ? `Seu último backup foi há <b>${b.dias} dias</b> e há alterações novas.` : 'Você ainda <b>não fez nenhum backup</b>. Os dados existem só neste aparelho.'}</span>
        <a href="#/dados" class="btn btn-primary !py-1.5">Fazer backup</a>
        <button data-act="adiar-backup" class="text-amber-900/70 hover:text-amber-900 text-xs underline">Depois</button>
      </div>` : '';

    view.innerHTML = `
      <div class="space-y-4">
        ${lembrete}
        ${Fin.ui.monthNav(ym)}
        ${hero(r)}
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
          ${tile('Receitas', fmt.brl(r.receitas), `recebido ${fmt.brl(r.recebido)}`)}
          ${tile('Despesas', fmt.brl(r.despesas), `pago ${fmt.brl(r.pago)}`)}
          <div class="col-span-2 lg:col-span-1">
            ${tile('A pagar', fmt.brl(r.aPagar), r.qtdAPagar
              ? `${r.qtdAPagar} ${r.qtdAPagar === 1 ? 'conta' : 'contas'}${r.atrasadas ? ` · <span class="text-rose-700 font-medium">! ${r.atrasadas} atrasada${r.atrasadas > 1 ? 's' : ''}</span>` : ''}`
              : 'tudo pago ✓')}
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          ${card(`
            <div class="flex items-start justify-between gap-3 flex-wrap mb-3">
              <h2 class="font-semibold">Receitas x despesas</h2>
              ${Fin.charts.legend(series)}
            </div>
            <div id="chart-hist" class="w-full min-w-0 overflow-hidden"></div>
            <p class="text-xs text-slate-400 mt-1">Últimos 6 meses · toque em um mês para abri-lo ·
              <a href="#/relatorios" class="text-emerald-700 font-medium hover:underline">Ver relatórios</a></p>
            ${tabelaHistorico(hist)}`)}
          ${card(`
            <div class="flex items-start justify-between gap-3 flex-wrap mb-3">
              <h2 class="font-semibold">Despesas por categoria</h2>
              <label class="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input type="checkbox" id="detalhar-faturas" class="accent-emerald-600 w-4 h-4" ${Fin.state.detalharFaturas ? 'checked' : ''} />
                Detalhar faturas do cartão
              </label>
            </div>
            ${categoriasHTML(ym)}`)}
        </div>

        ${orcamentoHTML(ym)}

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          ${card(`<h2 class="font-semibold mb-1">Contas a pagar</h2>${contasHTML(contas, ym)}`)}
          ${card(`<h2 class="font-semibold mb-1">Faturas do cartão</h2>${faturasHTML(ym)}`)}
        </div>
      </div>`;

    view.querySelector('[data-act="adiar-backup"]')?.addEventListener('click', () => {
      Fin.state.backupAdiado = true;
      Fin.router.refresh();
    });

    view.querySelector('#detalhar-faturas').addEventListener('change', (e) => {
      Fin.state.detalharFaturas = e.target.checked;
      Fin.router.refresh();
    });

    const chartEl = view.querySelector('#chart-hist');
    const draw = () => Fin.charts.columns(chartEl, hist, {
      series,
      selected: ym,
      label: 'Receitas e despesas dos últimos 6 meses',
      onSelect: (m) => { Fin.state.mes = m; Fin.router.render(); },
    });
    // Redesenha quando a largura do container muda (girar o celular, abrir barra de rolagem…).
    let lastW = chartEl.clientWidth;
    draw(); // desenha já; o observer só redesenha quando a largura mudar
    // requestAnimationFrame: redesenha fora do ciclo do observer (evita o aviso "ResizeObserver loop").
    const ro = new ResizeObserver(() => requestAnimationFrame(() => {
      const w = chartEl.clientWidth;
      if (Math.abs(w - lastW) > 1) { lastW = w; draw(); }
    }));
    ro.observe(chartEl);
    signal.addEventListener('abort', () => ro.disconnect());
  }

  return { title: 'Início', render };
})();
