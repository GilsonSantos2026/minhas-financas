/**
 * pages/cartoes.js — Cartões de crédito: fatura do mês, pagamento, limite e compras.
 * O mês exibido é o mês de VENCIMENTO da fatura (o mesmo seletor de mês do app).
 */
window.Fin = window.Fin || {};
Fin.pages = Fin.pages || {};

Fin.pages.cartoes = (() => {
  const fmt = Fin.fmt;
  const esc = fmt.esc;
  const F = Fin.finance;

  function chips(cartoes, atual) {
    return `
      <div class="chips flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0" role="tablist" aria-label="Cartões">
        ${cartoes.map((k) => `
          <button role="tab" aria-selected="${k.nome === atual}" data-cartao="${esc(k.nome)}"
            class="chip ${k.nome === atual ? 'is-active' : ''}"><span aria-hidden="true">💳</span>${esc(k.nome)}</button>`).join('')}
        <button data-act="novo-cartao" class="chip" aria-label="Adicionar cartão">＋ Cartão</button>
      </div>`;
  }

  function pagamentoHTML(cfg, ym, total) {
    const pag = F.pagamentoDaFatura(cfg, ym);
    if (!pag) {
      if (!total) return '';
      return `
        <div class="flex flex-wrap items-center gap-3 bg-amber-50 rounded-xl px-3 py-2.5 text-sm">
          <span class="flex-1 min-w-[12rem]"><span aria-hidden="true">!</span> Nenhum lançamento de pagamento desta fatura.</span>
          <button data-act="sync" class="btn btn-ghost !py-1.5 !bg-white">Lançar pagamento</button>
        </div>`;
    }
    const valorPag = F.valor(pag);
    const diff = Math.round((total - (pag.valorPrevisto ?? valorPag)) * 100) / 100;
    // Só oferece atualizar o valor se nada foi pago ainda (pago/parcial preservam o valor real).
    const podeAtualizar = ['aberto', 'atrasado'].includes(F.statusEfetivo(pag));
    return `
      <div class="bg-slate-50 rounded-xl px-3 py-2.5 text-sm space-y-2">
        <div class="flex items-center gap-3" data-edit="${pag.id}" role="button" tabindex="0" aria-label="Abrir lançamento de pagamento">
          <span class="flex-1 min-w-0">Pagamento: ${F.faturaParcial(pag)
            ? `pagou <b class="tabular-nums text-rose-700">${fmt.brl(pag.valorPago)}</b> de <b class="tabular-nums">${fmt.brl(pag.valorPrevisto)}</b>`
            : `<b class="tabular-nums">${fmt.brl(valorPag)}</b>`}
            <span class="text-slate-500 truncate">· ${esc(pag.descricao)}</span></span>
          ${Fin.ui.statusPill(pag)}
        </div>
        ${Math.abs(diff) >= 0.01 ? `
          <div class="flex flex-wrap items-center gap-2 text-xs text-slate-600 border-t border-slate-200 pt-2">
            <span class="flex-1 min-w-[12rem]">Compras somam ${fmt.brl(total)} (${diff > 0 ? '+' : '−'}${fmt.brl(Math.abs(diff))} em relação ao lançamento).</span>
            ${podeAtualizar ? `<button data-act="sync" class="text-emerald-700 font-semibold hover:underline">Atualizar para ${fmt.brl(total)}</button>` : ''}
          </div>` : ''}
      </div>
      ${F.faturaParcial(pag) ? Fin.ui.alertaRotativo(F.faturaParcial(pag)) : ''}`;
  }

  /**
   * Histórico do rotativo do cartão (12 meses até o mês atual): quantas faturas foram pagas a
   * menos e quanto já saiu em juros/IOF/multa. Sem nenhuma, um reforço positivo.
   */
  function rotativoHTML(cfg) {
    const h = F.rotativo(cfg.nome, fmt.currentYM());
    const custo = Math.round((h.encargos + h.pagoAMais) * 100) / 100;
    const vezes = h.parciais.length;
    if (!vezes && !custo) {
      const pagos = F.lancamentos().filter((l) => F.isPagamentoFatura(l) && F.statusEfetivo(l) === 'pago'
        && F.pagamentoDaFatura(cfg, F.competencia(l))?.id === l.id).length;
      return pagos >= 3 ? `<p class="text-xs text-emerald-800 bg-emerald-50 rounded-xl px-3 py-2"><span aria-hidden="true">✓</span> Fatura paga inteira nos últimos 12 meses — sem juros de rotativo.</p>` : '';
    }
    const critico = vezes >= 3;
    const linhas = h.parciais.map((p) => `
      <li class="flex items-center gap-2 py-1.5" data-edit="${p.l.id}" role="button" tabindex="0">
        <span class="w-16 shrink-0 text-slate-500">${fmt.monthShort(p.competencia)}</span>
        <span class="flex-1 min-w-0 truncate">pagou ${fmt.brl(p.pago)} de ${fmt.brl(p.devido)}</span>
        <span class="shrink-0 font-medium text-rose-700 tabular-nums">−${fmt.brl(p.falta)}</span>
      </li>`).join('');
    const encargos = h.itensEncargo.slice().sort((a, b) => b.fatura.localeCompare(a.fatura)).map((c) => `
      <li class="flex items-center gap-2 py-1.5">
        <span class="w-16 shrink-0 text-slate-500">${fmt.monthShort(c.fatura)}</span>
        <span class="flex-1 min-w-0 truncate">${esc(c.descricao)}</span>
        <span class="shrink-0 font-medium tabular-nums">${fmt.brl(c.valor)}</span>
      </li>`).join('');
    return `
      <details class="rounded-xl ${critico ? 'bg-rose-50 text-rose-900' : 'bg-amber-50 text-amber-900'} px-3 py-2.5 text-sm">
        <summary class="flex items-start gap-2">
          <span aria-hidden="true">${critico ? '!' : '◐'}</span>
          <span class="flex-1">
            <b>Rotativo nos últimos 12 meses:</b> ${vezes} fatura${vezes === 1 ? '' : 's'} paga${vezes === 1 ? '' : 's'} a menos${vezes ? ` (${fmt.brl(h.totalFalta)} ficaram para trás)` : ''}${custo ? ` · <b>${fmt.brl(custo)}</b> em juros, IOF e multa` : ''}.
            ${critico ? '<span class="block text-xs mt-0.5">Está virando hábito: esses juros são o gasto mais caro do orçamento.</span>' : ''}
          </span>
          <span class="chev text-xs mt-0.5" aria-hidden="true">▸</span>
        </summary>
        <div class="mt-2 space-y-2 text-xs">
          ${linhas ? `<div><div class="font-semibold mb-0.5">Faturas pagas a menos</div><ul class="divide-y divide-black/5">${linhas}</ul></div>` : ''}
          ${encargos ? `<div><div class="font-semibold mb-0.5">Juros, IOF e multa cobrados nas faturas</div><ul class="divide-y divide-black/5">${encargos}</ul></div>` : ''}
          ${h.pagoAMais ? `<p>Pago acima do lançado (juros/multa por atraso): <b>${fmt.brl(h.pagoAMais)}</b>.</p>` : ''}
          <p class="opacity-80">Juros e encargos são lidos das compras da fatura com “juros”, “encargos”, “IOF”, “multa”, “mora” ou “rotativo” na descrição.</p>
        </div>
      </details>`;
  }

  function limiteHTML(cfg) {
    if (!cfg.limite) return '';
    const usado = F.limiteUsado(cfg.nome);
    const pct = Math.min(100, (usado / cfg.limite) * 100);
    const [cor, rotulo] = pct >= 90 ? ['#d03b3b', '! Limite quase esgotado'] : pct >= 70 ? ['#fab219', 'Atenção ao limite'] : ['#2a78d6', ''];
    return `
      <div>
        <div class="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Limite usado ${rotulo ? `· <b class="text-slate-700">${rotulo}</b>` : ''}</span>
          <span class="tabular-nums">${fmt.brl(usado)} de ${fmt.brl(cfg.limite)}</span>
        </div>
        <div class="h-2 rounded-full bg-[#cde2fb] overflow-hidden" role="meter" aria-valuemin="0" aria-valuemax="${cfg.limite}" aria-valuenow="${usado}" aria-label="Limite usado">
          <div class="h-full rounded-full" style="width:${pct}%;background:${cor}"></div>
        </div>
        <div class="text-xs text-slate-500 mt-1">Disponível: <b class="text-slate-700 tabular-nums">${fmt.brl(Math.max(0, cfg.limite - usado))}</b> · inclui parcelas futuras</div>
      </div>`;
  }

  function comprasHTML(compras) {
    if (!compras.length) return Fin.ui.emptyState('🧾', 'Nenhuma compra nesta fatura', 'Use “Nova compra” para lançar.');
    const grupos = new Map();
    [...compras].sort((a, b) => (a.data || '').localeCompare(b.data || '')).forEach((c) => {
      if (!grupos.has(c.data)) grupos.set(c.data, []);
      grupos.get(c.data).push(c);
    });
    return [...grupos.entries()].map(([dia, itens]) => `
      <section>
        <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide px-1 mb-1.5">${fmt.dayLabel(dia)}</h3>
        <ul class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">${itens.map((c) => `
          <li class="lanc-item flex items-center gap-3 px-3 sm:px-4 py-3" data-edit-compra="${c.id}" role="button" tabindex="0" aria-label="Editar ${esc(c.descricao)}">
            ${Fin.ui.catIcon(c.categoriaIcone, c.categoria, 'despesa')}
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate">${esc(c.descricao || c.categoria)}</div>
              <div class="text-xs text-slate-500 truncate">${esc(c.categoria)}</div>
            </div>
            <div class="text-right shrink-0">
              <div class="text-sm font-semibold tabular-nums ${c.valor < 0 ? 'text-emerald-700' : ''}">${fmt.brl(c.valor)}</div>
              ${c.parcela ? `<div class="text-[11px] text-slate-500">parcela ${c.parcela.atual}/${c.parcela.total}</div>` : ''}
            </div>
          </li>`).join('')}
        </ul>
      </section>`).join('');
  }

  function render(view, { signal }) {
    const cartoes = F.cartoes();
    if (!cartoes.length) {
      view.innerHTML = Fin.ui.emptyState('💳', 'Nenhum cartão cadastrado',
        'Cadastre seus cartões para acompanhar faturas, parcelas e limite.',
        '<button data-act="novo-cartao" class="btn btn-primary">＋ Cadastrar cartão</button>');
    } else {
      // Sem cartão escolhido: abre no que tem a maior fatura do mês.
      if (!cartoes.some((k) => k.nome === Fin.state.cartao)) {
        const totais = cartoes.map((k) => [k.nome, F.soma(F.comprasDaFatura(k.nome, Fin.state.mes))]);
        Fin.state.cartao = totais.sort((a, b) => b[1] - a[1])[0][0];
      }
      const cfg = cartoes.find((k) => k.nome === Fin.state.cartao);
      const ym = Fin.state.mes;
      const compras = F.comprasDaFatura(cfg.nome, ym);
      const total = F.soma(compras);
      const venc = F.vencimentoFatura(cfg, ym);
      const aberta = ym >= fmt.currentYM();
      const cats = F.faturaPorCategoria(cfg.nome, ym);
      const parceladas = compras.filter((c) => c.parcela && c.parcela.total > 1).length;

      view.innerHTML = `
        <div class="space-y-4">
          ${chips(cartoes, cfg.nome)}
          ${Fin.ui.monthNav(ym)}

          <section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5 space-y-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="text-sm text-slate-500">Fatura de ${fmt.monthLong(ym).toLowerCase()} · ${esc(cfg.nome)}</div>
                <div class="text-[40px] sm:text-5xl font-semibold tracking-tight mt-1">${fmt.brl(total)}</div>
                <div class="text-sm text-slate-500 mt-1">
                  ${venc ? `Vence ${fmt.date(venc)}` : 'Vencimento não configurado'}
                  ${cfg.diaFechamento ? ` · fecha dia ${cfg.diaFechamento}` : ''}
                  · ${compras.length} ${compras.length === 1 ? 'compra' : 'compras'}${parceladas ? ` (${parceladas} parceladas)` : ''}
                  ${aberta ? '' : ' · fatura passada'}
                </div>
              </div>
              <button data-act="config" class="icon-btn shrink-0" aria-label="Configurar cartão" title="Configurar cartão">⚙️</button>
            </div>
            ${!cfg.diaFechamento || !cfg.diaVencimento ? `<p class="text-sm bg-amber-50 rounded-xl px-3 py-2"><span aria-hidden="true">!</span> Configure os dias de fechamento e vencimento para o app calcular as faturas. <button data-act="config" class="text-emerald-700 font-semibold hover:underline">Configurar</button></p>` : ''}
            ${pagamentoHTML(cfg, ym, total)}
            ${rotativoHTML(cfg)}
            ${limiteHTML(cfg)}
            <div class="flex flex-col sm:flex-row gap-2">
              <button data-act="nova-compra" class="btn btn-primary">＋ Nova compra</button>
              <a href="#/importar-fatura" class="btn btn-ghost">📄 Importar fatura (PDF ou foto)</a>
            </div>
          </section>

          ${cats.length ? `
            <section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5 min-w-0">
              <h2 class="font-semibold mb-3">Gastos da fatura por categoria</h2>
              ${Fin.charts.hbars(cats.map((c) => ({ label: c.categoria, icone: c.icone, total: c.total })), { total: Math.max(total, 0.01) })}
            </section>` : ''}

          <div class="space-y-4">${comprasHTML(compras)}</div>
        </div>`;
    }

    view.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-cartao]');
      if (chip) { Fin.state.cartao = chip.dataset.cartao; Fin.router.render(); return; }
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (!act) return;
      const cfg = F.cartao(Fin.state.cartao);
      if (act === 'novo-cartao') Fin.forms.cartao.open();
      if (act === 'config' && cfg) Fin.forms.cartao.open(cfg.id);
      if (act === 'nova-compra') Fin.forms.compra.open({ cartao: Fin.state.cartao });
      if (act === 'sync' && cfg) {
        const l = F.sincronizarPagamento(cfg, Fin.state.mes);
        Fin.ui.toast(`Pagamento da fatura: ${fmt.brl(l.valorPrevisto)}.`);
        Fin.router.refresh();
      }
    }, { signal });
  }

  return { title: 'Cartões', render };
})();
