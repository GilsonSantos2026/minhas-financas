/**
 * pages/planilha.js — Conferência em formato de planilha: todos os lançamentos (receitas e
 * despesas) numa tabela linear, com filtros no topo, ordenação por coluna, totais no rodapé
 * e exportação CSV. Tocar numa linha abre o lançamento para editar.
 */
window.Fin = window.Fin || {};
Fin.pages = Fin.pages || {};

Fin.pages.planilha = (() => {
  const fmt = Fin.fmt;
  const esc = fmt.esc;
  const F = Fin.finance;
  const P = () => Fin.parsers;

  const st = {
    periodo: '12m', custom: { ini: '', fim: '' },
    busca: '', tipo: '', status: '', categoria: '', forma: '',
    ordem: { col: 'vencimento', dir: 1 },
  };

  const STATUS = { pago: ['✓', 'Pago'], aberto: ['○', 'Em aberto'], atrasado: ['!', 'Atrasado'], parcial: ['◐', 'Parcial'] };

  // Colunas: [chave, título, valor para ordenar, classe]
  const COLS = [
    ['competencia', 'Compet.', (l) => F.competencia(l), ''],
    ['vencimento', 'Vencimento', (l) => F.dataRef(l) || '', ''],
    ['descricao', 'Descrição', (l) => (l.descricao || '').toLowerCase(), 'min-w-[18rem]'],
    ['categoria', 'Categoria', (l) => (l.categoria || '').toLowerCase(), 'min-w-[9rem]'],
    ['tipo', 'Tipo', (l) => l.tipo, ''],
    ['lancado', 'Lançado', (l) => (l.tipo === 'receita' ? 1 : -1) * (l.valorPrevisto ?? F.valor(l)), 'num'],
    ['status', 'Status', (l) => F.statusEfetivo(l), ''],
    ['dataPagamento', 'Pago em', (l) => l.dataPagamento || '', ''],
    ['pago', 'Valor pago', (l) => F.conciliar(l).pago, 'num'],
    ['diferenca', 'Diferença', (l) => F.conciliar(l).diferenca, 'num'],
    ['forma', 'Forma', (l) => (l.formaPagamento || '').toLowerCase(), ''],
    ['observacao', 'Observação', (l) => (l.observacao || '').toLowerCase(), 'min-w-[12rem]'],
  ];

  function filtrar(todos) {
    const q = P().normalize(st.busca);
    return Fin.periodo.filtrar(todos, st.periodo, Fin.state.mes, st.custom).filter((l) => {
      if (st.tipo && l.tipo !== st.tipo) return false;
      if (st.categoria && l.categoria !== st.categoria) return false;
      if (st.forma && (l.formaPagamento || '—') !== st.forma) return false;
      if (st.status) {
        const s = F.statusEfetivo(l);
        if (st.status === 'pendentes' ? s === 'pago' : s !== st.status) return false;
      }
      if (q && !P().normalize([l.descricao, l.categoria, l.observacao, l.formaPagamento].join(' ')).includes(q)) return false;
      return true;
    });
  }

  function ordenar(lista) {
    const col = COLS.find((c) => c[0] === st.ordem.col) || COLS[1];
    const f = col[2];
    return [...lista].sort((a, b) => {
      const x = f(a);
      const y = f(b);
      const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'pt-BR');
      return r * st.ordem.dir || (F.dataRef(a) || '').localeCompare(F.dataRef(b) || '');
    });
  }

  function linhaHTML(l, i) {
    const c = F.conciliar(l);
    const s = F.statusEfetivo(l);
    const rec = l.tipo === 'receita';
    const [ic, rot] = STATUS[s] || ['', s];
    const corSt = s === 'pago' ? 'text-emerald-800' : s === 'atrasado' ? 'text-rose-700' : s === 'parcial' ? 'text-amber-800' : 'text-slate-500';
    const dif = c.diferenca > 0 ? `<span class="text-amber-800">+${fmt.brl(c.diferenca)}</span>`
      : c.diferenca < 0 ? `<span class="text-emerald-800">−${fmt.brl(-c.diferenca)}</span>` : '';
    return `
      <tr data-edit="${l.id}" class="cursor-pointer ${i % 2 ? 'bg-slate-50/60' : ''} hover:bg-emerald-50/60">
        <td>${fmt.monthShort(F.competencia(l))}</td>
        <td class="tabular-nums">${fmt.date(F.dataRef(l))}</td>
        <td class="!whitespace-normal">${esc(l.descricao || '—')}${l.grupo && l.parcela ? ` <span class="text-slate-400 text-[11px]">${l.recorrencia === 'fixo' ? '🔁 ' : ''}${l.parcela.atual}/${l.parcela.total}</span>` : ''}</td>
        <td>${l.categoriaIcone ? `<span aria-hidden="true">${l.categoriaIcone}</span> ` : ''}${esc(l.categoria || '')}</td>
        <td class="${rec ? 'text-emerald-700' : 'text-slate-600'}">${rec ? 'Receita' : 'Despesa'}</td>
        <td class="num font-semibold ${rec ? 'text-emerald-700' : ''}">${rec ? '' : '−'}${fmt.brl(c.lancado)}</td>
        <td class="${corSt}"><span aria-hidden="true">${ic}</span> ${rot}</td>
        <td class="tabular-nums">${l.dataPagamento && s !== 'aberto' && s !== 'atrasado' ? fmt.date(l.dataPagamento) : ''}</td>
        <td class="num">${c.pago ? fmt.brl(c.pago) : ''}</td>
        <td class="num">${dif}</td>
        <td>${esc(l.formaPagamento || '')}</td>
        <td class="!whitespace-normal text-slate-500 text-[12px]">${esc(l.observacao || '')}</td>
      </tr>`;
  }

  function totais(lista) {
    const t = { rec: 0, desp: 0, recPago: 0, despPago: 0, pend: 0 };
    for (const l of lista) {
      const c = F.conciliar(l);
      if (l.tipo === 'receita') { t.rec += c.lancado; t.recPago += c.pago; } else { t.desp += c.lancado; t.despPago += c.pago; t.pend += c.falta; }
    }
    return t;
  }

  function csv(lista) {
    const cel = (v) => { const x = v == null ? '' : String(v); return /[";\n]/.test(x) ? `"${x.replace(/"/g, '""')}"` : x; };
    const num = (v) => (v == null || v === '' ? '' : Number(v).toFixed(2).replace('.', ','));
    const linhas = [['Competência', 'Vencimento', 'Descrição', 'Categoria', 'Tipo', 'Valor lançado', 'Status', 'Data do pagamento', 'Valor pago', 'Diferença', 'Forma de pagamento', 'Observação']];
    for (const l of lista) {
      const c = F.conciliar(l);
      linhas.push([F.competencia(l), fmt.date(F.dataRef(l)), l.descricao, l.categoria, l.tipo === 'receita' ? 'Receita' : 'Despesa',
        num(c.lancado), (STATUS[F.statusEfetivo(l)] || [])[1], l.dataPagamento ? fmt.date(l.dataPagamento) : '', c.pago ? num(c.pago) : '',
        c.diferenca ? num(c.diferenca) : '', l.formaPagamento, l.observacao]);
    }
    return '﻿' + linhas.map((r) => r.map(cel).join(';')).join('\r\n');
  }

  function render(view, { signal }) {
    if (!Fin.storage.hasData()) {
      view.innerHTML = Fin.ui.emptyState('📑', 'Nada para conferir', 'Crie lançamentos ou importe sua planilha.');
      return;
    }
    const todos = F.lancamentos();
    const noPeriodo = Fin.periodo.filtrar(todos, st.periodo, Fin.state.mes, st.custom);
    const cats = [...new Set(noPeriodo.map((l) => l.categoria).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    const formas = [...new Set(noPeriodo.map((l) => l.formaPagamento || '—'))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    if (st.categoria && !cats.includes(st.categoria)) st.categoria = '';
    if (st.forma && !formas.includes(st.forma)) st.forma = '';
    const opt = (v, r, cur) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(r)}</option>`;
    const seta = (k) => (st.ordem.col === k ? (st.ordem.dir > 0 ? ' ▲' : ' ▼') : '');

    // A planilha usa a largura toda da tela (as outras telas ficam limitadas a max-w-5xl).
    view.style.maxWidth = 'none';
    signal.addEventListener('abort', () => { view.style.maxWidth = ''; });

    view.innerHTML = `
      <div class="space-y-3">
        <header class="hidden md:block">
          <h2 class="text-xl font-semibold">Planilha de conferência</h2>
          <p class="text-sm text-slate-500">Todos os lançamentos, receitas e despesas, em linhas — filtre e confira.</p>
        </header>
        <section class="bg-white rounded-2xl shadow-sm p-3 space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <div class="chips flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Período">
              ${Fin.periodo.chips(st.periodo, [['custom', 'De/até']])}
            </div>
            ${st.periodo === 'mes' ? `<div class="flex items-center gap-1 ml-auto">
              <button data-month="-1" class="icon-btn !w-8 !h-8 !text-lg" aria-label="Mês anterior">‹</button>
              <span class="text-sm font-medium">${fmt.monthShort(Fin.state.mes)}</span>
              <button data-month="1" class="icon-btn !w-8 !h-8 !text-lg" aria-label="Próximo mês">›</button></div>` : ''}
          </div>
          ${st.periodo === 'custom' ? `<div class="grid grid-cols-2 gap-2 max-w-sm">
            <label class="field"><span>De</span><input id="pl-ini" type="month" class="input" value="${st.custom.ini || fmt.addMonths(fmt.currentYM(), -11)}"></label>
            <label class="field"><span>Até</span><input id="pl-fim" type="month" class="input" value="${st.custom.fim || fmt.currentYM()}"></label>
          </div>` : ''}
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <input id="pl-busca" type="search" class="input col-span-2 sm:col-span-3 lg:col-span-2" placeholder="Buscar (ex.: aluguel)" value="${esc(st.busca)}" aria-label="Buscar">
            <select id="pl-tipo" class="input" aria-label="Tipo">${opt('', 'Receitas e despesas', st.tipo)}${opt('despesa', 'Despesas', st.tipo)}${opt('receita', 'Receitas', st.tipo)}</select>
            <select id="pl-status" class="input" aria-label="Status">${opt('', 'Todos status', st.status)}${opt('pendentes', 'Pendentes', st.status)}${opt('pago', 'Pagos', st.status)}${opt('atrasado', 'Atrasados', st.status)}${opt('parcial', 'Parciais', st.status)}</select>
            <select id="pl-categoria" class="input" aria-label="Categoria">${opt('', 'Todas categorias', st.categoria)}${cats.map((c) => opt(c, c, st.categoria)).join('')}</select>
            <select id="pl-forma" class="input" aria-label="Forma de pagamento">${opt('', 'Todas formas', st.forma)}${formas.map((f) => opt(f, f === '—' ? 'Sem forma informada' : f, st.forma)).join('')}</select>
          </div>
        </section>

        <div id="pl-resumo" class="grid grid-cols-2 lg:grid-cols-4 gap-2"></div>

        <div class="flex flex-wrap items-center justify-between gap-2 px-1">
          <p id="pl-info" class="text-xs text-slate-500"></p>
          <div class="flex gap-3">
            <button data-act="limpar" class="text-xs font-semibold text-slate-500 hover:underline">Limpar filtros</button>
            <button data-act="csv" class="text-xs font-semibold text-emerald-700 hover:underline">⬇️ Exportar para Excel (CSV)</button>
          </div>
        </div>

        <div class="planilha bg-white rounded-2xl shadow-sm border border-slate-200 overflow-auto max-h-[70vh]">
          <table class="w-full text-[13px]">
            <thead class="sticky top-0 z-10 bg-slate-100">
              <tr>${COLS.map(([k, t, , cls]) => `<th class="${cls}"><button data-ordem="${k}" class="font-semibold hover:text-slate-900 whitespace-nowrap">${t}${seta(k)}</button></th>`).join('')}</tr>
            </thead>
            <tbody id="pl-corpo"></tbody>
            <tfoot id="pl-rodape" class="sticky bottom-0 bg-slate-100 font-semibold"></tfoot>
          </table>
        </div>
        <p class="text-xs text-slate-500 px-1">Toque numa linha para editar. Toque no título de uma coluna para ordenar.</p>
      </div>`;

    let ultimaLista = [];
    const draw = () => {
      const lista = ordenar(filtrar(todos));
      ultimaLista = lista;
      const t = totais(lista);
      const tile = (r, v, sub, cls = '') => `<div class="bg-white rounded-2xl shadow-sm p-3 min-w-0">
        <div class="text-[11px] text-slate-500">${r}</div><div class="font-semibold tabular-nums truncate ${cls}">${v}</div>
        <div class="text-[11px] text-slate-500 truncate">${sub}</div></div>`;
      view.querySelector('#pl-resumo').innerHTML =
        tile('Receitas (lançado)', fmt.brl(t.rec), `recebido ${fmt.brl(t.recPago)}`, 'text-emerald-700') +
        tile('Despesas (lançado)', fmt.brl(t.desp), `pago ${fmt.brl(t.despPago)}`) +
        tile('Saldo (lançado)', fmt.brl(t.rec - t.desp), 'receitas − despesas', t.rec - t.desp < 0 ? 'text-rose-700' : '') +
        tile('Falta pagar', fmt.brl(t.pend), `${lista.filter((l) => F.statusEfetivo(l) === 'atrasado').length} atrasado(s)`, t.pend ? 'text-amber-800' : '');
      view.querySelector('#pl-info').textContent = `${lista.length} de ${todos.length} lançamentos · ${Fin.periodo.rotulo(st.periodo, Fin.state.mes, st.custom)}`;
      view.querySelector('#pl-corpo').innerHTML = lista.length
        ? lista.map(linhaHTML).join('')
        : `<tr><td colspan="${COLS.length}" class="!text-center !py-8 text-slate-500">Nenhum lançamento com estes filtros.</td></tr>`;
      view.querySelector('#pl-rodape').innerHTML = lista.length ? `
        <tr><td colspan="5">Total · ${lista.length} linhas</td>
          <td class="num">${fmt.brl(t.rec - t.desp)}</td><td></td><td></td>
          <td class="num">${fmt.brl(t.recPago - t.despPago)}</td><td colspan="3" class="!font-normal text-slate-500 text-[12px]">receitas − despesas</td></tr>` : '';
    };

    view.querySelector('#pl-busca').addEventListener('input', (e) => { st.busca = e.target.value; draw(); });
    ['tipo', 'status', 'categoria', 'forma'].forEach((k) => view.querySelector(`#pl-${k}`).addEventListener('change', (e) => { st[k] = e.target.value; draw(); }));
    view.addEventListener('change', (e) => {
      if (e.target.id === 'pl-ini' || e.target.id === 'pl-fim') {
        st.custom.ini = view.querySelector('#pl-ini').value;
        st.custom.fim = view.querySelector('#pl-fim').value;
        Fin.router.render();
      }
    }, { signal });
    view.addEventListener('click', (e) => {
      const p = e.target.closest('[data-periodo]');
      if (p) {
        st.periodo = p.dataset.periodo;
        if (st.periodo === 'custom' && !st.custom.ini) st.custom = { ini: fmt.addMonths(fmt.currentYM(), -11), fim: fmt.currentYM() };
        return Fin.router.render();
      }
      const o = e.target.closest('[data-ordem]');
      if (o) {
        st.ordem = st.ordem.col === o.dataset.ordem ? { col: o.dataset.ordem, dir: -st.ordem.dir } : { col: o.dataset.ordem, dir: 1 };
        return Fin.router.refresh();
      }
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'limpar') {
        Object.assign(st, { busca: '', tipo: '', status: '', categoria: '', forma: '' });
        return Fin.router.render();
      }
      if (act === 'csv') {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv(ultimaLista)], { type: 'text/csv;charset=utf-8' }));
        a.download = `planilha_lancamentos_${fmt.todayISO()}.csv`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }
    }, { signal });
    draw();
  }

  return { title: 'Planilha', render, estado: st };
})();
