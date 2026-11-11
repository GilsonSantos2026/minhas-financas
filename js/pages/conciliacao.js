/**
 * pages/conciliacao.js — Conciliação: o que foi LANÇADO × o que foi PAGO (ou recebido).
 *
 * Para cada lançamento do período mostra o valor lançado, o pagamento efetivado (data e valor),
 * a diferença (juros/multa ou desconto), o que falta e atrasos. Também confere as faturas
 * do cartão: soma das compras × pagamento lançado × pago.
 */
window.Fin = window.Fin || {};
Fin.pages = Fin.pages || {};

Fin.pages.conciliacao = (() => {
  const fmt = Fin.fmt;
  const esc = fmt.esc;
  const F = Fin.finance;

  const st = { preset: 'mes', tipo: 'despesa', filtro: '' };
  const PRESETS = [['mes', 'Mês'], ['3m', '3 meses'], ['ano', 'Ano']];

  function periodo() {
    const fim = Fin.state.mes;
    if (st.preset === 'ano') return { ini: `${fim.slice(0, 4)}-01`, fim };
    return { ini: st.preset === '3m' ? fmt.addMonths(fim, -2) : fim, fim };
  }

  function situacoes(rec) {
    return {
      ok: ['✓', rec ? 'Recebido igual' : 'Pago igual', 'bg-emerald-50 text-emerald-800'],
      maior: ['＋', rec ? 'Recebido a mais' : 'Pago a mais', 'bg-amber-50 text-amber-800'],
      menor: ['−', rec ? 'Recebido a menos' : 'Pago a menos', 'bg-sky-50 text-sky-800'],
      parcial: ['◐', 'Parcial', 'bg-amber-50 text-amber-800'],
      atrasado: ['!', 'Atrasado', 'bg-rose-50 text-rose-700'],
      pendente: ['○', 'A vencer', 'bg-slate-100 text-slate-600'],
    };
  }

  const pill = (s, sit) => `<span class="pill ${s[sit][2]}"><span aria-hidden="true">${s[sit][0]}</span>${s[sit][1]}</span>`;

  function tile(rotulo, valor, sub = '', cls = '') {
    return `
      <div class="bg-white rounded-2xl shadow-sm p-4 min-w-0">
        <div class="text-xs text-slate-500">${rotulo}</div>
        <div class="text-lg sm:text-xl font-semibold mt-0.5 truncate tabular-nums ${cls}">${valor}</div>
        ${sub ? `<div class="text-xs text-slate-500 mt-0.5">${sub}</div>` : ''}
      </div>`;
  }

  function resumoHTML(t, rec) {
    const pct = Math.round(t.percentualPago * 100);
    return `
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${tile('Lançado', fmt.brl(t.lancado), `${t.qtd} ${t.qtd === 1 ? 'lançamento' : 'lançamentos'}`)}
        ${tile(rec ? 'Recebido' : 'Pago (efetivado)', fmt.brl(t.pago), `${pct}% ${rec ? 'recebido' : 'pago'}`, 'text-emerald-800')}
        ${tile(rec ? 'Falta receber' : 'Falta pagar', fmt.brl(t.pendente), t.porSituacao.atrasado ? `<span class="text-rose-700 font-medium">! ${t.porSituacao.atrasado} atrasado${t.porSituacao.atrasado > 1 ? 's' : ''}</span>` : 'nada atrasado ✓', t.pendente > 0 ? 'text-amber-800' : '')}
        ${tile('Diferença paga', `${t.acrescimos - t.descontos >= 0 ? '+' : '−'}${fmt.brl(Math.abs(t.acrescimos - t.descontos))}`,
          `<span class="text-amber-800">+${fmt.brl(t.acrescimos)} ${rec ? 'a mais' : 'juros/multas'}</span> · <span class="text-emerald-800">−${fmt.brl(t.descontos)} ${rec ? 'a menos' : 'descontos'}</span>`)}
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-4">
        <div class="flex justify-between text-xs text-slate-500 mb-1.5"><span>${rec ? 'Recebimentos' : 'Pagamentos'} conciliados</span><span class="tabular-nums">${pct}%</span></div>
        <div class="h-2 rounded-full bg-[#cde2fb] overflow-hidden" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Percentual conciliado">
          <div class="h-full rounded-full bg-[#2a78d6]" style="width:${pct}%"></div>
        </div>
        ${t.pagosComAtraso || t.semData ? `<p class="text-xs text-slate-600 mt-2">
          ${t.pagosComAtraso ? `<span class="text-amber-800">◷ ${t.pagosComAtraso} ${rec ? 'recebido' : 'pago'}${t.pagosComAtraso > 1 ? 's' : ''} depois do vencimento</span>` : ''}
          ${t.pagosComAtraso && t.semData ? ' · ' : ''}
          ${t.semData ? `<span>${t.semData} sem data de ${rec ? 'recebimento' : 'pagamento'} informada</span>` : ''}</p>` : ''}
      </div>`;
  }

  function filtrosHTML(t, s) {
    const ordem = ['atrasado', 'pendente', 'parcial', 'maior', 'menor', 'ok'];
    const chip = (k, rot, n) => `<button data-filtro="${k}" class="chip !shadow-none border border-slate-200 ${st.filtro === k ? 'is-active !border-transparent' : ''}">${rot}<span class="text-xs opacity-75 ml-1">${n}</span></button>`;
    return `<div class="chips flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filtrar por situação">
      ${chip('', 'Todos', t.qtd)}
      ${ordem.filter((k) => t.porSituacao[k]).map((k) => chip(k, `${s[k][0]} ${s[k][1]}`, t.porSituacao[k])).join('')}
    </div>`;
  }

  function linhaHTML({ l, c }, s, rec) {
    const venc = F.dataRef(l);
    const pagouTxt = c.pago
      ? `${fmt.brl(c.pago)}${l.dataPagamento ? ` <span class="text-slate-400">em ${fmt.date(l.dataPagamento).slice(0, 5)}</span>` : ''}`
      : '<span class="text-slate-400">—</span>';
    const dif = c.situacao === 'maior' ? `<span class="text-amber-800">+${fmt.brl(c.diferenca)}</span>`
      : c.situacao === 'menor' ? `<span class="text-emerald-800">−${fmt.brl(-c.diferenca)}</span>`
      : c.falta ? `<span class="text-slate-600">falta ${fmt.brl(c.falta)}</span>` : '<span class="text-slate-400">—</span>';
    const atraso = c.pagoComAtraso ? `<span class="text-amber-800">◷ ${c.diasAtraso}d após venc.</span>`
      : c.situacao === 'atrasado' ? `<span class="text-rose-700">vencido há ${c.diasAtraso}d</span>` : '';
    return `
      <li class="lanc-item px-3 sm:px-4 py-3 cursor-pointer" data-edit="${l.id}" role="button" tabindex="0" aria-label="Editar ${esc(l.descricao || l.categoria)}">
        <div class="flex items-start gap-3">
          ${Fin.ui.catIcon(l.categoriaIcone, l.categoria, l.tipo)}
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="text-sm font-medium truncate">${esc(l.descricao || l.categoria)}</div>
                <div class="text-xs text-slate-500 truncate">vence ${fmt.date(venc).slice(0, 5)} · ${esc(l.categoria)}${l.formaPagamento ? ` · ${esc(l.formaPagamento)}` : ''}</div>
              </div>
              <div class="shrink-0">${pill(s, c.situacao)}</div>
            </div>
            <dl class="grid grid-cols-3 gap-2 mt-2 text-xs tabular-nums">
              <div><dt class="text-slate-500">Lançado</dt><dd class="font-semibold text-slate-800">${fmt.brl(c.lancado)}</dd></div>
              <div><dt class="text-slate-500">${rec ? 'Recebido' : 'Pago'}</dt><dd class="font-semibold text-slate-800">${pagouTxt}</dd></div>
              <div class="text-right"><dt class="text-slate-500"><span class="sm:hidden">Dif.</span><span class="hidden sm:inline">Diferença</span></dt><dd class="font-semibold">${dif}</dd></div>
            </dl>
            ${atraso ? `<div class="text-[11px] mt-1">${atraso}</div>` : ''}
          </div>
        </div>
      </li>`;
  }

  function faturasHTML(fim) {
    const fs = F.conciliacaoFaturas(fim);
    if (!fs.length) return '';
    const s = situacoes(false);
    return `
      <section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
        <h2 class="font-semibold">Faturas do cartão · ${fmt.monthLong(fim).toLowerCase()}</h2>
        <p class="text-xs text-slate-500 mb-3">Soma das compras × lançamento de pagamento × valor efetivamente pago.</p>
        <div class="table-wrap border border-slate-200 rounded-xl"><table>
          <thead><tr><th>Cartão</th><th class="num">Compras</th><th class="num">Lançado</th><th class="num">Pago</th><th>Situação</th></tr></thead>
          <tbody>${fs.map((f) => `
            <tr ${f.pagamento ? `data-edit="${f.pagamento.id}" class="cursor-pointer hover:bg-slate-50"` : ''}>
              <td>💳 ${esc(f.cartao)}</td>
              <td class="num">${fmt.brl(f.compras)}</td>
              <td class="num">${f.pagamento ? fmt.brl(f.lancado) : '<span class="text-rose-700">não lançado</span>'}</td>
              <td class="num">${f.pagamento ? fmt.brl(f.pago) : '—'}</td>
              <td>${f.situacao ? pill(s, f.situacao) : `<a href="#/cartoes" data-ir-cartao="${esc(f.cartao)}" class="text-emerald-700 text-xs font-semibold hover:underline">Lançar</a>`}
                ${f.difComprasLancado && Math.abs(f.difComprasLancado) >= 0.01 ? `<div class="text-[11px] text-slate-500 mt-0.5">compras ${f.difComprasLancado > 0 ? '+' : '−'}${fmt.brl(Math.abs(f.difComprasLancado))} vs lançado</div>` : ''}</td>
            </tr>`).join('')}
          </tbody>
        </table></div>
      </section>`;
  }

  function csv(itens, rec) {
    const cel = (v) => { const x = v == null ? '' : String(v); return /[";\n]/.test(x) ? `"${x.replace(/"/g, '""')}"` : x; };
    const num = (v) => (v == null ? '' : Number(v).toFixed(2).replace('.', ','));
    const nomes = situacoes(rec);
    const linhas = [['Vencimento', 'Descrição', 'Categoria', 'Valor lançado', rec ? 'Valor recebido' : 'Valor pago', rec ? 'Data do recebimento' : 'Data do pagamento', 'Diferença', 'Falta', 'Dias de atraso', 'Situação', 'Forma de pagamento']];
    for (const { l, c } of itens) {
      linhas.push([fmt.date(F.dataRef(l)), l.descricao, l.categoria, num(c.lancado), num(c.pago), fmt.date(l.dataPagamento), num(c.diferenca), num(c.falta), c.diasAtraso || '', nomes[c.situacao][1], l.formaPagamento]);
    }
    return '﻿' + linhas.map((r) => r.map(cel).join(';')).join('\r\n');
  }

  function render(view, { signal }) {
    if (!Fin.storage.hasData()) {
      view.innerHTML = Fin.ui.emptyState('⚖️', 'Nada para conciliar', 'Crie lançamentos ou importe sua planilha.');
      return;
    }
    const { ini, fim } = periodo();
    const rec = st.tipo === 'receita';
    const s = situacoes(rec);
    const { itens, totais } = F.conciliacaoPeriodo(ini, fim, st.tipo);
    if (st.filtro && !totais.porSituacao[st.filtro]) st.filtro = '';
    const visiveis = st.filtro ? itens.filter((i) => i.c.situacao === st.filtro) : itens;

    view.innerHTML = `
      <div class="space-y-4">
        ${Fin.ui.monthNav(fim)}
        <div class="bg-white rounded-2xl shadow-sm p-3 flex flex-wrap items-center gap-3 justify-between">
          <div class="chips flex gap-2" role="tablist" aria-label="Período">
            ${PRESETS.map(([k, r]) => `<button data-preset="${k}" class="chip !shadow-none border border-slate-200 ${st.preset === k ? 'is-active !border-transparent' : ''}">${r}</button>`).join('')}
          </div>
          <div class="seg w-56 !text-xs" role="tablist" aria-label="Tipo">
            <label><input type="radio" name="conc-tipo" value="despesa" ${!rec ? 'checked' : ''}><span class="!py-1.5">Despesas</span></label>
            <label><input type="radio" name="conc-tipo" value="receita" ${rec ? 'checked' : ''}><span class="!py-1.5">Receitas</span></label>
          </div>
          <p class="text-xs text-slate-500 w-full">${ini === fim ? fmt.monthLong(fim) : `${fmt.monthShort(ini)} a ${fmt.monthShort(fim)}`} · por mês de competência</p>
        </div>

        ${resumoHTML(totais, rec)}
        ${!rec ? faturasHTML(fim) : ''}

        <section class="space-y-2">
          <div class="flex items-center justify-between gap-2 px-1">
            <h2 class="font-semibold">Lançamentos × ${rec ? 'recebimentos' : 'pagamentos'}</h2>
            <button data-act="csv" class="text-xs font-semibold text-emerald-700 hover:underline">⬇️ Exportar CSV</button>
          </div>
          ${filtrosHTML(totais, s)}
          ${visiveis.length
            ? `<ul class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">${visiveis.map((i) => linhaHTML(i, s, rec)).join('')}</ul>`
            : Fin.ui.emptyState('⚖️', 'Nada neste filtro', 'Escolha outra situação ou período.')}
          <p class="text-xs text-slate-500 px-1">Toque num lançamento para informar ou corrigir o ${rec ? 'recebimento' : 'pagamento'} (data e valor).</p>
        </section>
      </div>`;

    view.addEventListener('click', (e) => {
      const p = e.target.closest('[data-preset]');
      if (p) { st.preset = p.dataset.preset; return Fin.router.render(); }
      const f = e.target.closest('[data-filtro]');
      if (f) { st.filtro = f.dataset.filtro; return Fin.router.refresh(); }
      if (e.target.closest('[data-act="csv"]')) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv(visiveis, rec)], { type: 'text/csv;charset=utf-8' }));
        a.download = `conciliacao_${st.tipo}_${ini}_a_${fim}.csv`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }
    }, { signal });
    view.addEventListener('change', (e) => {
      if (e.target.name === 'conc-tipo') { st.tipo = e.target.value; st.filtro = ''; Fin.router.render(); }
    }, { signal });
  }

  return { title: 'Conciliação', render, estado: st };
})();
