/**
 * pages/categorias.js — Cadastro de categorias de despesa e receita.
 */
window.Fin = window.Fin || {};
Fin.pages = Fin.pages || {};

Fin.pages.categorias = (() => {
  const fmt = Fin.fmt;
  const esc = fmt.esc;
  const F = Fin.finance;
  let tipo = 'despesa';

  function render(view, { signal }) {
    const cats = F.categorias(tipo);
    const grupos = new Map();
    cats.forEach((c) => {
      const k = c.classificacao || 'Sem classificação';
      if (!grupos.has(k)) grupos.set(k, []);
      grupos.get(k).push(c);
    });

    view.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="seg flex-1 max-w-xs" role="tablist" aria-label="Tipo de categoria">
            <label><input type="radio" name="cat-tipo" value="despesa" ${tipo === 'despesa' ? 'checked' : ''}><span>Despesas</span></label>
            <label><input type="radio" name="cat-tipo" value="receita" ${tipo === 'receita' ? 'checked' : ''}><span>Receitas</span></label>
          </div>
          <button data-act="nova" class="btn btn-primary ml-auto">＋ Nova</button>
        </div>
        ${cats.length ? '<p class="text-xs text-slate-500 px-1 -mt-1">Toque no <b>ícone</b> para ver os lançamentos da categoria; toque no resto da linha para editar nome, ícone, classificação ou orçamento.</p>' : ''}

        ${cats.length ? [...grupos.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR')).map(([grupo, itens]) => `
          <section>
            <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide px-1 mb-1.5">${esc(grupo)}</h3>
            <ul class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
              ${itens.map((c) => {
                const u = F.usosCategoria(c.nome, c.tipo).total;
                return `
                <li class="lanc-item flex items-center gap-3 px-3 sm:px-4 py-3" data-cat="${c.id}" role="button" tabindex="0" aria-label="Editar ${esc(c.nome)}">
                  <button type="button" data-ver-cat="${c.id}" class="rounded-full shrink-0 hover:ring-2 hover:ring-prim-300 focus-visible:ring-2 focus-visible:ring-prim-500 transition" title="Ver os lançamentos de ${esc(c.nome)}" aria-label="Ver os lançamentos de ${esc(c.nome)}">
                    ${Fin.ui.catIcon(c.icone, c.nome, c.tipo)}</button>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium truncate">${esc(c.nome)}</div>
                    <div class="text-xs text-slate-500">${u} ${u === 1 ? 'registro' : 'registros'}</div>
                  </div>
                  ${c.orcamentoMensal > 0 ? `<div class="text-right text-xs text-slate-500 shrink-0">orçamento<div class="text-sm font-semibold text-slate-700 tabular-nums">${fmt.brl(c.orcamentoMensal)}</div></div>` : ''}
                  <span class="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-prim-700 bg-prim-50 rounded-full px-2.5 py-1" aria-hidden="true">✎ Editar</span>
                </li>`;
              }).join('')}
            </ul>
          </section>`).join('')
        : Fin.ui.emptyState('🏷️', 'Nenhuma categoria', 'Crie categorias para organizar seus lançamentos.')}
      </div>`;

    view.addEventListener('change', (e) => {
      if (e.target.name === 'cat-tipo') { tipo = e.target.value; Fin.router.render(); }
    }, { signal });
    view.addEventListener('click', (e) => {
      if (e.target.closest('[data-act="nova"]')) return Fin.forms.categoria.open({ tipo });
      const ver = e.target.closest('[data-ver-cat]');
      if (ver) return verRegistros(ver.dataset.verCat);
      const li = e.target.closest('[data-cat]');
      if (li) Fin.forms.categoria.open({ id: li.dataset.cat });
    }, { signal });
    view.addEventListener('keydown', (e) => {
      if (e.target.closest?.('[data-ver-cat]')) return; // o botão do ícone trata Enter/Espaço sozinho
      const li = e.target.closest?.('[data-cat]');
      if (li && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); Fin.forms.categoria.open({ id: li.dataset.cat }); }
    }, { signal });
  }

  /* ---------- Janela "lançamentos da categoria" (toque no ícone) ---------- */

  const ROT_STATUS = { pago: ['Pago', 'text-emerald-700'], aberto: ['A pagar', 'text-slate-500'], atrasado: ['Atrasado', 'text-rose-700'], parcial: ['Parcial', 'text-amber-700'] };
  let periodoVer = '12m';

  /** Lançamentos + compras do cartão da categoria, com o mês (competência / fatura) de cada um. */
  function registrosDa(c) {
    const lanc = F.todos().filter((l) => l.categoria === c.nome && l.tipo === c.tipo).map((l) => {
      const st = F.statusEfetivo(l);
      const [rot, cls] = ROT_STATUS[st] || ['', ''];
      return {
        id: l.id, tipo: 'lanc', mes: F.competencia(l) || '', data: F.dataRef(l) || '',
        desc: l.descricao || c.nome, valor: F.valor(l),
        extra: rot ? `<span class="${cls}">${c.tipo === 'receita' && st === 'pago' ? 'Recebido' : c.tipo === 'receita' && st === 'aberto' ? 'A receber' : rot}</span>` : '',
      };
    });
    const comp = c.tipo === 'despesa' ? Fin.storage.list('cartaoCompras').filter((x) => x.categoria === c.nome).map((x) => ({
      id: x.id, tipo: 'compra', mes: x.fatura || String(x.data || '').slice(0, 7), data: x.data || '',
      desc: x.descricao || c.nome, valor: Number(x.valor) || 0,
      extra: esc(`${x.cartao || 'cartão'}${x.parcela ? ` · ${x.parcela.atual}/${x.parcela.total}` : ''}`),
    })) : [];
    return [...lanc, ...comp];
  }

  function verRegistros(id) {
    const c = F.categorias().find((k) => k.id === id);
    if (!c) return;
    let todos = registrosDa(c);
    const sel = new Set(); // registros marcados para mover de categoria
    const contagem = () => {
      const nL = todos.filter((r) => r.tipo === 'lanc').length;
      const nC = todos.length - nL;
      return [nL && `${nL} ${nL === 1 ? 'lançamento' : 'lançamentos'}`, nC && `${nC} ${nC === 1 ? 'compra' : 'compras'} no cartão`].filter(Boolean).join(' e ') || 'Nenhum registro';
    };
    const nL = todos.filter((r) => r.tipo === 'lanc').length;
    const outras = F.categorias(c.tipo).filter((k) => k.id !== c.id);
    // Sem nada nos últimos 12 meses (só futuros, por ex.) → abre em "Tudo".
    const { ini: i12, fim: f12 } = Fin.periodo.intervalo('12m', Fin.state.mes);
    if (periodoVer === '12m' && !todos.some((r) => r.mes >= i12 && r.mes <= f12)) periodoVer = 'tudo';

    const corpo = () => {
      const { ini, fim } = Fin.periodo.intervalo(periodoVer, Fin.state.mes);
      const lista = todos.filter((r) => r.mes >= ini && r.mes <= fim)
        .sort((a, b) => b.mes.localeCompare(a.mes) || String(b.data).localeCompare(String(a.data)));
      const total = lista.reduce((s, r) => s + r.valor, 0);
      const porMes = new Map();
      lista.forEach((r) => { if (!porMes.has(r.mes)) porMes.set(r.mes, []); porMes.get(r.mes).push(r); });
      return `
        <div class="flex items-baseline justify-between gap-2 px-1">
          <span class="text-sm text-slate-500">${Fin.periodo.rotulo(periodoVer, Fin.state.mes)} · ${lista.length} ${lista.length === 1 ? 'registro' : 'registros'}</span>
          <span class="font-semibold tabular-nums ${c.tipo === 'receita' ? 'text-emerald-700' : ''}">${fmt.brl(total)}</span>
        </div>
        ${lista.length ? [...porMes.entries()].map(([mes, itens]) => `
          <section>
            <h3 class="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500 px-1 mb-1">
              <span>${mes ? fmt.monthLong(mes) : 'Sem data'}</span><span class="tabular-nums">${fmt.brl(itens.reduce((s, r) => s + r.valor, 0))}</span></h3>
            <ul class="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">${itens.map((r) => `
              <li class="flex items-center ${sel.has(r.id) ? 'bg-prim-50' : ''}">
                ${outras.length ? `<label class="pl-3 py-2 cursor-pointer shrink-0"><input type="checkbox" data-sel="${esc(r.id)}" class="accent-prim-600 w-4 h-4 block" ${sel.has(r.id) ? 'checked' : ''} aria-label="Marcar ${esc(r.desc)}" /></label>` : ''}
                <button type="button" data-abrir-reg="${r.tipo}:${esc(r.id)}" class="flex-1 min-w-0 flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50" title="Abrir para editar">
                <span class="tabular-nums text-xs text-slate-400 shrink-0 w-11">${r.data ? fmt.date(String(r.data).slice(0, 10)).slice(0, 5) : '—'}</span>
                <span class="flex-1 min-w-0"><span class="block text-sm truncate">${esc(r.desc)}</span>
                  <span class="block text-[11px] text-slate-400 truncate">${r.tipo === 'compra' ? `💳 ${r.extra}` : r.extra}</span></span>
                <span class="text-sm tabular-nums shrink-0">${fmt.brl(r.valor)}</span>
              </button></li>`).join('')}</ul>
          </section>`).join('')
        : '<p class="text-sm text-slate-500 text-center py-6">Nada nesta categoria no período. Experimente “Tudo”.</p>'}`;
    };

    const panel = Fin.ui.openModal(`
      <div class="flex flex-col max-h-[85vh]">
        <div data-arrastar class="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-slate-100">
          ${Fin.ui.catIcon(c.icone, c.nome, c.tipo)}
          <div class="flex-1 min-w-0">
            <h2 class="font-semibold text-lg truncate">${esc(c.nome)}</h2>
            <p class="text-xs text-slate-500" data-contagem>${contagem()}</p>
          </div>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <div class="px-5 pt-3 flex flex-wrap gap-1.5" data-periodos>${Fin.periodo.chips(periodoVer)}</div>
        ${outras.length ? '<p class="px-5 pt-2 text-xs text-slate-500">Achou algo na categoria errada? Marque e use <b>Mover para…</b>, ou toque no registro para editar.</p>' : ''}
        <div class="px-5 py-3 space-y-3 overflow-y-auto" data-corpo>${corpo()}</div>
        <div data-mover class="hidden flex flex-wrap items-center gap-2 px-5 py-3 border-t border-amber-200 bg-amber-50">
          <span class="text-sm text-amber-900 font-medium" data-mover-n></span>
          <select data-mover-destino class="input !py-1.5 text-sm flex-1 min-w-[9rem]" aria-label="Categoria de destino">
            ${outras.map((k) => `<option value="${esc(k.nome)}">${esc(`${k.icone ? `${k.icone} ` : ''}${k.nome}`)}</option>`).join('')}</select>
          <button type="button" data-mover-ok class="btn btn-primary !py-1.5">Mover</button>
          <button type="button" data-mover-limpar class="text-xs text-slate-500 hover:underline">Desmarcar</button>
        </div>
        <div class="flex items-center gap-2 px-5 py-3 border-t border-slate-100">
          <button type="button" data-editar-cat class="btn btn-ghost">✎ Editar categoria</button>
          <span class="flex-1"></span>
          ${nL ? '<button type="button" data-ir-lanc class="btn btn-primary">Abrir em Lançamentos</button>' : ''}
        </div>
      </div>`, `Lançamentos de ${c.nome}`);

    panel.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', Fin.ui.closeModal));
    const barraMover = panel.querySelector('[data-mover]');
    const atualizarBarra = () => {
      barraMover.classList.toggle('hidden', !sel.size);
      if (sel.size) barraMover.querySelector('[data-mover-n]').textContent = `${sel.size} ${sel.size === 1 ? 'marcado' : 'marcados'} →`;
    };
    const redesenhar = () => {
      panel.querySelector('[data-corpo]').innerHTML = corpo();
      panel.querySelector('[data-contagem]').textContent = contagem();
      atualizarBarra();
    };
    panel.querySelector('[data-periodos]').addEventListener('click', (e) => {
      const p = e.target.closest('[data-periodo]');
      if (!p) return;
      periodoVer = p.dataset.periodo;
      panel.querySelector('[data-periodos]').innerHTML = Fin.periodo.chips(periodoVer);
      redesenhar();
    });
    panel.querySelector('[data-corpo]').addEventListener('change', (e) => {
      const cb = e.target.closest('[data-sel]');
      if (!cb) return;
      if (cb.checked) sel.add(cb.dataset.sel); else sel.delete(cb.dataset.sel);
      cb.closest('li').classList.toggle('bg-prim-50', cb.checked); // sem redesenhar: a rolagem fica onde está
      atualizarBarra();
    });
    barraMover.querySelector('[data-mover-limpar]').addEventListener('click', () => {
      sel.clear();
      panel.querySelectorAll('[data-sel]').forEach((cb) => { cb.checked = false; cb.closest('li').classList.remove('bg-prim-50'); });
      atualizarBarra();
    });
    barraMover.querySelector('[data-mover-ok]').addEventListener('click', () => {
      const destino = barraMover.querySelector('[data-mover-destino]').value;
      const d = outras.find((k) => k.nome === destino);
      const n = sel.size;
      F.moverCategoria(c.nome, destino, c.tipo, d?.icone, new Set(sel));
      sel.clear();
      todos = registrosDa(c);
      redesenhar();
      Fin.ui.toast(`${n} ${n === 1 ? 'registro movido' : 'registros movidos'} para “${destino}”.`);
      Fin.router.refresh(); // atualiza a contagem na lista de categorias por trás
    });
    panel.querySelector('[data-corpo]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-abrir-reg]');
      if (!b) return;
      const [tipoReg, rid] = b.dataset.abrirReg.split(/:(.+)/);
      Fin.ui.closeModal();
      if (tipoReg === 'compra') Fin.forms.compra.open({ id: rid });
      else Fin.forms.lancamento.open(rid);
    });
    panel.querySelector('[data-editar-cat]').addEventListener('click', () => {
      Fin.ui.closeModal();
      Fin.forms.categoria.open({ id: c.id });
    });
    panel.querySelector('[data-ir-lanc]')?.addEventListener('click', () => {
      const f = Fin.pages.lancamentos.filtros;
      Object.assign(f, { busca: '', status: '', tipo: c.tipo, categoria: c.nome, periodo: periodoVer === 'futuros' ? 'futuros' : periodoVer, dia: null, visao: 'lista' });
      Fin.ui.closeModal();
      location.hash = '#/lancamentos';
    });
  }

  return { title: 'Categorias', render, verRegistros };
})();
