/**
 * pages/orcamento.js — Orçamento mensal por categoria: quanto foi gasto x o limite.
 *
 * O gasto conta as compras do cartão pela categoria de cada compra (a fatura é
 * "detalhada"), então o limite de "Supermercado" inclui o que foi pago no cartão.
 */
window.Fin = window.Fin || {};
Fin.pages = Fin.pages || {};

Fin.pages.orcamento = (() => {
  const fmt = Fin.fmt;
  const esc = fmt.esc;
  const F = Fin.finance;

  /** Estado do limite: sempre com ícone + texto (nunca só cor). */
  function estado(gasto, orcado) {
    const pct = orcado > 0 ? gasto / orcado : 0;
    if (pct > 1) return { cor: '#d03b3b', trilho: '#f6d0d0', icone: '!', texto: `Estourou ${fmt.brl(gasto - orcado)}`, cls: 'text-rose-700' };
    if (pct >= 0.8) return { cor: '#fab219', trilho: '#fdecc8', icone: '◐', texto: `Atenção: ${Math.round(pct * 100)}% usado`, cls: 'text-amber-800' };
    return { cor: '#2a78d6', trilho: '#cde2fb', icone: '✓', texto: `Restam ${fmt.brl(orcado - gasto)}`, cls: 'text-slate-600' };
  }

  function medidor(gasto, orcado, rotulo) {
    const e = estado(gasto, orcado);
    const pct = orcado > 0 ? Math.min(100, (gasto / orcado) * 100) : 0;
    return `
      <div class="h-2 rounded-full overflow-hidden" style="background:${e.trilho}" role="meter"
           aria-valuemin="0" aria-valuemax="${orcado}" aria-valuenow="${Math.round(gasto * 100) / 100}" aria-label="${esc(rotulo)}: ${e.texto}">
        <div class="h-full rounded-full" style="width:${pct}%;background:${e.cor}"></div>
      </div>
      <div class="flex justify-between gap-2 text-xs mt-1">
        <span class="${e.cls} font-medium"><span aria-hidden="true">${e.icone}</span> ${e.texto}</span>
        <span class="text-slate-500 tabular-nums">${fmt.brl(gasto)} de ${fmt.brl(orcado)}</span>
      </div>`;
  }

  /** Linha de uma categoria com orçamento (reaproveitada no Início). */
  function linhaHTML(i) {
    return `
      <li class="py-3" data-orc="${i.id}" role="button" tabindex="0" aria-label="Editar orçamento de ${esc(i.categoria)}">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-base" aria-hidden="true">${i.icone || '🏷️'}</span>
          <span class="text-sm font-medium truncate flex-1">${esc(i.categoria)}</span>
        </div>
        ${medidor(i.gasto, i.orcado, i.categoria)}
      </li>`;
  }

  function render(view, { signal }) {
    const ym = Fin.state.mes;
    const o = F.orcamento(ym);
    const disponivel = o.totalOrcado - o.totalGasto;
    const estourados = o.itens.filter((i) => i.pct > 1).length;
    const atencao = o.itens.filter((i) => i.pct >= 0.8 && i.pct <= 1).length;

    const semOrc = o.semOrcamento.length ? `
      <section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
        <h2 class="font-semibold">Gastos sem orçamento</h2>
        <p class="text-xs text-slate-500 mb-2">Categorias com gasto neste mês e sem limite definido.</p>
        <ul class="divide-y divide-slate-100">
          ${o.semOrcamento.map((s) => `
            <li class="flex items-center gap-3 py-2.5">
              <span class="text-base" aria-hidden="true">${s.icone || '🏷️'}</span>
              <span class="text-sm flex-1 min-w-0 truncate">${esc(s.categoria)}</span>
              <span class="text-sm tabular-nums text-slate-700">${fmt.brl(s.gasto)}</span>
              <button data-definir="${esc(s.categoria)}" class="text-xs font-semibold text-emerald-700 hover:underline shrink-0">Definir</button>
            </li>`).join('')}
        </ul>
      </section>` : '';

    view.innerHTML = `
      <div class="space-y-4">
        ${Fin.ui.monthNav(ym)}
        ${o.itens.length ? `
          <section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
            <div class="text-sm text-slate-500">${disponivel >= 0 ? 'Disponível no orçamento' : 'Acima do orçamento'}</div>
            <div class="text-[40px] sm:text-5xl font-semibold tracking-tight mt-1 ${disponivel < 0 ? 'text-rose-700' : ''}">${fmt.brl(Math.abs(disponivel))}</div>
            <div class="mt-3">${medidor(o.totalGasto, o.totalOrcado, 'Orçamento total')}</div>
            <p class="text-xs text-slate-500 mt-2">${o.itens.length} ${o.itens.length === 1 ? 'categoria' : 'categorias'} com orçamento
              ${estourados ? ` · <span class="text-rose-700 font-medium">! ${estourados} estourada${estourados > 1 ? 's' : ''}</span>` : ''}
              ${atencao ? ` · <span class="text-amber-800 font-medium">◐ ${atencao} em atenção</span>` : ''}</p>
          </section>

          <section class="bg-white rounded-2xl shadow-sm px-4 sm:px-5 py-2">
            <ul class="divide-y divide-slate-100">${o.itens.map(linhaHTML).join('')}</ul>
          </section>`
        : Fin.ui.emptyState('🎯', 'Nenhum orçamento definido',
            'Defina um limite mensal por categoria e acompanhe aqui quanto já foi gasto. Comece pelas categorias abaixo.')}
        ${semOrc}
        <p class="text-xs text-slate-500 px-1">Compras no cartão contam pela categoria de cada compra.
          <a href="#/categorias" class="text-emerald-700 font-medium hover:underline">Gerenciar categorias</a></p>
      </div>`;

    // Clique em [data-orc] (linha com orçamento) é tratado em app.js (vale também no Início).
    const abrir = (id) => Fin.forms.categoria.open({ id, foco: 'orcamento' });
    view.addEventListener('click', (e) => {
      const def = e.target.closest('[data-definir]');
      if (def) {
        const nome = def.dataset.definir;
        let c = F.categorias('despesa').find((k) => k.nome === nome);
        if (!c) {
          const s = o.semOrcamento.find((x) => x.categoria === nome);
          c = Fin.storage.upsert('categorias', { nome, icone: s?.icone || null, tipo: 'despesa', classificacao: null, orcamentoMensal: 0 });
        }
        abrir(c.id);
      }
    }, { signal });
  }

  return { title: 'Orçamento', render, linhaHTML };
})();
