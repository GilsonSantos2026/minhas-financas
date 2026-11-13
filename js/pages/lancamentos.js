/**
 * pages/lancamentos.js — Lista de lançamentos com busca e filtros.
 * Período: Mês (agrupado por dia) ou 12 meses / Futuros / Tudo (agrupado por mês).
 * Com uma busca ativa em vários meses, mostra a "conferência mês a mês": em quais
 * meses o lançamento existe e em quais está faltando.
 * Tocar em um item abre o formulário; tocar no status alterna pago/aberto.
 */
window.Fin = window.Fin || {};
Fin.pages = Fin.pages || {};

Fin.pages.lancamentos = (() => {
  const fmt = Fin.fmt;
  const esc = fmt.esc;
  const F = Fin.finance;

  // Filtros ficam guardados enquanto o app está aberto (sobrevivem à troca de tela).
  const filtros = { busca: '', tipo: '', status: '', categoria: '', periodo: 'mes' };
  const multiMes = () => filtros.periodo !== 'mes';

  function aplicar(lista) {
    const q = Fin.parsers.normalize(filtros.busca);
    return lista.filter((l) => {
      if (filtros.tipo && l.tipo !== filtros.tipo) return false;
      if (filtros.categoria && l.categoria !== filtros.categoria) return false;
      if (filtros.status) {
        const st = F.statusEfetivo(l);
        if (filtros.status === 'pendentes' ? st === 'pago' : st !== filtros.status) return false;
      }
      if (q) {
        const alvo = Fin.parsers.normalize([l.descricao, l.categoria, l.observacao, l.formaPagamento].join(' '));
        if (!alvo.includes(q)) return false;
      }
      return true;
    });
  }

  function resumoHTML(lista) {
    const r = F.resumo(null, lista);
    const item = (label, v, cls = '') => `
      <div class="bg-white rounded-2xl shadow-sm p-3 text-center min-w-0">
        <div class="text-[11px] sm:text-xs text-slate-500">${label}</div>
        <div class="text-sm sm:text-base font-semibold tabular-nums truncate ${cls}">${fmt.brl(v)}</div>
      </div>`;
    return item('Receitas', r.receitas, 'text-emerald-700') + item('Despesas', r.despesas, 'text-rose-700') + item('Saldo', r.saldo, r.saldo < 0 ? 'text-rose-700' : '');
  }

  function itemHTML(l, mostrarData = false) {
    const rec = l.tipo === 'receita';
    const rep = l.grupo && l.parcela
      ? (l.recorrencia === 'fixo' ? `🔁 ${l.parcela.atual}/${l.parcela.total}` : `${l.parcela.atual}/${l.parcela.total}`)
      : null;
    const data = mostrarData && F.dataRef(l) ? fmt.date(F.dataRef(l)).slice(0, 5) : null;
    const sub = [data, rep, l.categoria, l.formaPagamento].filter(Boolean).map(esc).join(' · ');
    return `
      <li class="lanc-item flex items-center gap-3 px-3 sm:px-4 py-3" data-edit="${l.id}" role="button" tabindex="0"
          aria-label="Editar ${esc(l.descricao || l.categoria)}">
        ${Fin.ui.catIcon(l.categoriaIcone, l.categoria, l.tipo)}
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium truncate">${esc(l.descricao || l.categoria)}</div>
          <div class="text-xs text-slate-500 truncate">${sub}</div>
        </div>
        <div class="text-right shrink-0 flex flex-col items-end gap-0.5">
          <div class="text-sm font-semibold tabular-nums ${rec ? 'text-emerald-700' : 'text-slate-800'}" title="Valor lançado">${rec ? '+' : '−'} ${fmt.brl(l.valorPrevisto ?? F.valor(l))}</div>
          ${Fin.ui.pagamentoLinha(l)}
          <div class="mt-0.5">${Fin.ui.statusPill(l)}</div>
        </div>
      </li>`;
  }

  /** Vários meses: agrupa por mês de competência, com quantidade e total lançado. */
  function listaPorMesHTML(lista) {
    const grupos = new Map();
    [...lista]
      .sort((a, b) => F.competencia(a).localeCompare(F.competencia(b)) || (F.dataRef(a) || '').localeCompare(F.dataRef(b) || ''))
      .forEach((l) => {
        const k = F.competencia(l);
        if (!grupos.has(k)) grupos.set(k, []);
        grupos.get(k).push(l);
      });
    const atual = fmt.currentYM();
    return [...grupos.entries()].map(([ym, itens]) => {
      const desp = itens.filter((l) => l.tipo === 'despesa').reduce((s, l) => s + (l.valorPrevisto ?? F.valor(l)), 0);
      const rec = itens.filter((l) => l.tipo === 'receita').reduce((s, l) => s + (l.valorPrevisto ?? F.valor(l)), 0);
      return `
      <section data-mes="${ym}">
        <h3 class="text-xs font-medium uppercase tracking-wide mb-1.5 px-1 flex flex-wrap items-center gap-x-2 ${ym === atual ? 'text-blue-700' : 'text-slate-500'}">
          <span>${fmt.monthLong(ym)}${ym === atual ? ' · mês atual' : ''}</span>
          <span class="ml-auto normal-case tracking-normal text-[11px] font-normal text-slate-500">${itens.length} ${itens.length === 1 ? 'lançamento' : 'lançamentos'}
            ${desp ? ` · desp. ${fmt.brl(desp)}` : ''}${rec ? ` · rec. ${fmt.brl(rec)}` : ''}</span>
        </h3>
        <ul class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">${itens.map((l) => itemHTML(l, true)).join('')}</ul>
      </section>`;
    }).join('');
  }

  /**
   * Conferência mês a mês (busca ativa em vários meses): um quadrinho por mês com quantidade
   * e valor lançado; meses SEM lançamento ficam em destaque (provável esquecimento).
   */
  function coberturaHTML(lista, todos) {
    const meses = Fin.periodo.meses(filtros.periodo, Fin.state.mes, todos);
    if (meses.length < 2) return '';
    const porMes = new Map();
    lista.forEach((l) => {
      const k = F.competencia(l);
      const cur = porMes.get(k) || { qtd: 0, total: 0 };
      cur.qtd++;
      cur.total += l.valorPrevisto ?? F.valor(l);
      porMes.set(k, cur);
    });
    const faltando = meses.filter((m) => !porMes.has(m));
    const atual = fmt.currentYM();
    const celulas = meses.map((m) => {
      const c = porMes.get(m);
      return c
        ? `<button data-ir-mes="${m}" class="rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-left hover:bg-emerald-100 ${m === atual ? 'ring-2 ring-blue-400' : ''}" title="${fmt.monthLong(m)}: ${c.qtd} lançamento(s)">
            <div class="text-[11px] text-emerald-800 font-semibold">✓ ${fmt.monthShort(m)}</div>
            <div class="text-[11px] tabular-nums text-slate-700">${fmt.brl(c.total)}</div>
            ${c.qtd > 1 ? `<div class="text-[10px] text-amber-800">${c.qtd} lançamentos</div>` : ''}
          </button>`
        : `<button data-ir-mes="${m}" class="rounded-xl border border-dashed border-amber-400 bg-amber-50 px-2 py-1.5 text-left hover:bg-amber-100 ${m === atual ? 'ring-2 ring-blue-400' : ''}" title="${fmt.monthLong(m)}: sem lançamento">
            <div class="text-[11px] text-amber-900 font-semibold">! ${fmt.monthShort(m)}</div>
            <div class="text-[11px] text-amber-800">sem lançamento</div>
          </button>`;
    }).join('');
    return `
      <section class="bg-white rounded-2xl shadow-sm p-4">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <h2 class="font-semibold">Conferência mês a mês</h2>
          <span class="text-xs ${faltando.length ? 'text-amber-800 font-medium' : 'text-emerald-800'}">
            ${faltando.length ? `! ${faltando.length} de ${meses.length} meses sem lançamento` : `✓ presente nos ${meses.length} meses`}</span>
        </div>
        <p class="text-xs text-slate-500 mt-0.5 mb-3">“${esc(filtros.busca || filtros.categoria)}” · ${Fin.periodo.rotulo(filtros.periodo, Fin.state.mes).toLowerCase()} · toque num mês para abri-lo.</p>
        <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">${celulas}</div>
      </section>`;
  }

  function listaHTML(lista) {
    if (!lista.length) {
      const temFiltro = filtros.busca || filtros.tipo || filtros.status || filtros.categoria;
      return Fin.ui.emptyState('🔎', temFiltro ? 'Nada encontrado' : multiMes() ? 'Nenhum lançamento no período' : 'Nenhum lançamento neste mês',
        temFiltro ? 'Tente mudar a busca, o período ou os filtros.' : 'Use o botão “＋” para adicionar.',
        temFiltro ? '<button data-limpar class="btn btn-ghost">Limpar filtros</button>' : '');
    }
    if (multiMes()) return listaPorMesHTML(lista);
    const grupos = new Map();
    [...lista]
      .sort((a, b) => (F.dataRef(a) || '').localeCompare(F.dataRef(b) || '') || (a.descricao || '').localeCompare(b.descricao || ''))
      .forEach((l) => {
        const k = F.dataRef(l) || '';
        if (!grupos.has(k)) grupos.set(k, []);
        grupos.get(k).push(l);
      });
    return [...grupos.entries()].map(([dia, itens]) => {
      const d = diaInfo(dia);
      return `
      <section class="${d.secao}"${d.hoje ? ' data-hoje' : ''}>
        <h3 class="text-xs font-medium uppercase tracking-wide mb-1.5 flex items-center gap-2 ${d.titulo}">
          ${d.icone ? `<span aria-hidden="true">${d.icone}</span>` : ''}<span>${fmt.dayLabel(dia)}</span>
          ${d.etiqueta ? `<span class="ml-auto normal-case tracking-normal text-[11px] font-semibold px-2 py-0.5 rounded-full ${d.etiquetaCls}">${d.etiqueta}</span>` : ''}
        </h3>
        <ul class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden ${d.lista}">${itens.map(itemHTML).join('')}</ul>
      </section>`;
    }).join('');
  }

  /** Destaque do cabeçalho conforme a distância do dia até hoje. */
  function diaInfo(iso) {
    const base = { secao: '', titulo: 'text-slate-500 px-1', lista: '', icone: '', etiqueta: '', etiquetaCls: '', hoje: false };
    if (!iso) return base;
    const [y, m, dd] = iso.split('-').map(Number);
    const agora = new Date();
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    const diff = Math.round((new Date(y, m - 1, dd) - hoje) / 86400000);
    if (diff === 0) return { ...base, hoje: true, icone: '📅',
      titulo: 'text-[13px] text-white bg-blue-600 rounded-lg px-3 py-2 shadow-sm',
      lista: 'ring-2 ring-blue-500',
      etiqueta: 'Hoje', etiquetaCls: 'bg-white text-blue-700' };
    if (diff === -1) return { ...base, icone: '⚠️',
      titulo: 'text-rose-700 bg-rose-50 border-l-4 border-rose-600 px-3 py-1.5',
      lista: 'ring-1 ring-rose-200',
      etiqueta: 'Ontem', etiquetaCls: 'bg-rose-600 text-white' };
    if (diff === 1) return { ...base, icone: '⏰',
      titulo: 'text-amber-800 bg-amber-50 border-l-4 border-amber-500 px-3 py-1.5',
      etiqueta: 'Amanhã', etiquetaCls: 'bg-amber-500 text-white' };
    if (diff < -1) return { ...base, secao: 'opacity-60', titulo: 'text-slate-400 px-1' };
    return { ...base, etiqueta: `em ${diff} dias`, etiquetaCls: 'text-slate-400 font-normal' };
  }

  function render(view, { signal }) {
    const ym = Fin.state.mes;
    const todos = F.lancamentos();
    const base = multiMes() ? Fin.periodo.filtrar(todos, filtros.periodo, ym) : F.doMes(ym);
    const cats = [...new Set(base.map((l) => l.categoria))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    if (filtros.categoria && !cats.includes(filtros.categoria)) filtros.categoria = '';
    const opt = (v, label, cur) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(label)}</option>`;

    view.innerHTML = `
      <div class="space-y-4">
        ${multiMes()
          ? `<div class="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center justify-between gap-3">
               <div><div class="font-semibold">${Fin.periodo.rotulo(filtros.periodo, ym)}</div>
               <div class="text-xs text-slate-500">pelo mês de competência</div></div>
               <button data-periodo="mes" class="text-xs font-semibold text-emerald-700 hover:underline shrink-0">Ver por mês</button>
             </div>`
          : Fin.ui.monthNav(ym)}
        <div id="lanc-resumo" class="grid grid-cols-3 gap-2"></div>
        ${multiMes() ? '' : `<a href="#/conciliacao" class="flex items-center justify-between bg-white rounded-2xl shadow-sm px-4 py-2.5 text-sm hover:bg-slate-50">
          <span><span aria-hidden="true">⚖️</span> Conciliar lançado × pago do mês</span><span class="text-slate-300" aria-hidden="true">›</span></a>`}

        <div class="bg-white rounded-2xl shadow-sm p-3 space-y-2">
          <div class="chips flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Período da busca">
            ${Fin.periodo.chips(filtros.periodo)}
          </div>
          <input id="f-busca" type="search" class="input" placeholder="${multiMes() ? 'Buscar em todo o período (ex.: aluguel)…' : 'Buscar descrição, categoria, observação…'}"
                 value="${esc(filtros.busca)}" aria-label="Buscar lançamentos" />
          <div class="grid grid-cols-3 gap-2">
            <select id="f-tipo" class="input" aria-label="Filtrar por tipo">
              ${opt('', 'Todos os tipos', filtros.tipo)}${opt('receita', 'Receitas', filtros.tipo)}${opt('despesa', 'Despesas', filtros.tipo)}
            </select>
            <select id="f-status" class="input" aria-label="Filtrar por status">
              ${opt('', 'Todos status', filtros.status)}${opt('pendentes', 'Pendentes', filtros.status)}${opt('pago', 'Pagos', filtros.status)}${opt('atrasado', 'Atrasados', filtros.status)}${opt('parcial', 'Parciais', filtros.status)}
            </select>
            <select id="f-categoria" class="input" aria-label="Filtrar por categoria">
              ${opt('', 'Categorias', filtros.categoria)}${cats.map((c) => opt(c, c, filtros.categoria)).join('')}
            </select>
          </div>
        </div>

        <div id="lanc-cobertura"></div>
        <div id="lanc-lista" class="space-y-4"></div>
        <p id="lanc-contagem" class="text-center text-xs text-slate-400"></p>
      </div>`;

    const draw = () => {
      const lista = aplicar(base);
      view.querySelector('#lanc-resumo').innerHTML = resumoHTML(lista);
      view.querySelector('#lanc-cobertura').innerHTML = multiMes() && (filtros.busca.trim() || filtros.categoria) ? coberturaHTML(lista, todos) : '';
      view.querySelector('#lanc-lista').innerHTML = listaHTML(lista);
      view.querySelector('#lanc-contagem').textContent = lista.length ? `${lista.length} de ${base.length} lançamentos` : '';
    };

    view.querySelector('#f-busca').addEventListener('input', (e) => { filtros.busca = e.target.value; draw(); });
    view.querySelector('#f-tipo').addEventListener('change', (e) => { filtros.tipo = e.target.value; draw(); });
    view.querySelector('#f-status').addEventListener('change', (e) => { filtros.status = e.target.value; draw(); });
    view.querySelector('#f-categoria').addEventListener('change', (e) => { filtros.categoria = e.target.value; draw(); });
    view.addEventListener('click', (e) => {
      if (e.target.closest('[data-limpar]')) {
        Object.assign(filtros, { busca: '', tipo: '', status: '', categoria: '' });
        Fin.router.render();
        return;
      }
      const p = e.target.closest('[data-periodo]');
      if (p) {
        filtros.periodo = p.dataset.periodo;
        Fin.router.render();
        setTimeout(() => view.querySelector('#f-busca')?.focus(), 0);
        return;
      }
      const mes = e.target.closest('[data-ir-mes]');
      if (mes) {
        Fin.state.mes = mes.dataset.irMes;
        filtros.periodo = 'mes';
        Fin.router.render();
        window.scrollTo(0, 0);
      }
    }, { signal });
    draw();
  }

  return { title: 'Lançamentos', filtros, render };
})();
