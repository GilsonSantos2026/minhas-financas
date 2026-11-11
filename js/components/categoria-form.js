/**
 * components/categoria-form.js — Criar/editar/excluir categoria (com orçamento mensal).
 *
 * Renomear atualiza todos os lançamentos e compras que usam a categoria.
 * Excluir uma categoria em uso pede para onde mover os lançamentos.
 *
 * Uso: Fin.forms.categoria.open({ tipo })   → nova
 *      Fin.forms.categoria.open({ id })     → editar
 */
window.Fin = window.Fin || {};
Fin.forms = Fin.forms || {};

Fin.forms.categoria = (() => {
  const fmt = Fin.fmt;
  const esc = fmt.esc;
  const F = Fin.finance;
  const P = Fin.parsers;
  const S = Fin.storage;

  const SUGESTOES = ['🛒', '🍽️', '🏠', '💡', '🚿', '🚗', '⛽', '💊', '🎓', '👕', '🐾', '🎮', '✈️', '📱', '💳', '🧾', '🎁', '💰', '📈', '🏦'];

  function open({ id = null, tipo = 'despesa', foco = null } = {}) {
    const c = id ? S.list('categorias').find((x) => x.id === id) : null;
    const t = c?.tipo || tipo;
    const usos = c ? F.usosCategoria(c.nome, t) : { total: 0 };
    const classes = [...new Set(F.categorias().map((k) => k.classificacao).filter(Boolean))].sort();
    const ym = Fin.state.mes;
    const media = c && t === 'despesa' ? F.mediaGasto(c.nome, ym, 3) : 0;
    const outras = F.categorias(t).filter((k) => k.id !== c?.id);

    const panel = Fin.ui.openModal(`
      <form id="cat-form" novalidate>
        <div class="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 class="font-semibold text-lg">${c ? 'Editar categoria' : `Nova categoria de ${t}`}</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <div class="px-5 py-4 space-y-4">
          <div class="grid grid-cols-[5rem_1fr] gap-3">
            <label class="field"><span>Ícone</span>
              <input name="icone" class="input text-center text-xl" maxlength="8" value="${esc(c?.icone || '')}" placeholder="🙂" /></label>
            <label class="field"><span>Nome *</span>
              <input name="nome" class="input" maxlength="40" value="${esc(c?.nome || '')}" placeholder="Ex.: Mercado" /></label>
          </div>
          <div class="flex flex-wrap gap-1" aria-label="Sugestões de ícone">
            ${SUGESTOES.map((e) => `<button type="button" data-emoji="${e}" class="w-9 h-9 rounded-lg hover:bg-slate-100 text-lg" aria-label="Usar ${e}">${e}</button>`).join('')}
          </div>

          <label class="field"><span>Classificação</span>
            <input name="classificacao" class="input" list="classes-list" maxlength="30" value="${esc(c?.classificacao || '')}" placeholder="Ex.: Essencial" />
            <datalist id="classes-list">${classes.map((k) => `<option value="${esc(k)}"></option>`).join('')}</datalist></label>

          ${t === 'despesa' ? `
            <label class="field"><span>Orçamento mensal (R$)</span>
              <input name="orcamento" class="input tabular-nums" inputmode="decimal" value="${c?.orcamentoMensal ? fmt.decimalInput(c.orcamentoMensal) : ''}" placeholder="Sem limite" /></label>
            ${media > 0 ? `<button type="button" data-media class="text-sm text-emerald-700 font-medium hover:underline -mt-2">
              Usar a média dos últimos 3 meses: ${fmt.brl(media)}</button>` : ''}` : ''}

          ${c ? `<p class="text-xs text-slate-500">Usada em ${usos.total} ${usos.total === 1 ? 'registro' : 'registros'}. Renomear atualiza todos eles.</p>` : ''}

          <div id="excluir-box" class="hidden bg-rose-50 rounded-xl p-3 space-y-2">
            <p class="text-sm text-rose-800">Esta categoria está em uso. Para onde mover os ${usos.total} registros?</p>
            <select name="destino" class="input">${outras.map((k) => `<option>${esc(k.nome)}</option>`).join('')}</select>
            <button type="button" data-confirmar-exclusao class="btn btn-danger-ghost !bg-white">Mover e excluir</button>
          </div>

          <p id="form-erro" class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
        </div>
        <div class="flex items-center gap-2 px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
          ${c ? '<button type="button" data-delete class="btn btn-danger-ghost">Excluir</button>' : ''}
          <span class="flex-1"></span>
          <button type="button" data-close class="btn btn-ghost">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar</button>
        </div>
      </form>`, c ? 'Editar categoria' : 'Nova categoria');

    const form = panel.querySelector('#cat-form');
    const el = (n) => form.elements[n];
    if (foco && el(foco)) setTimeout(() => el(foco).focus(), 60);

    panel.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', Fin.ui.closeModal));
    panel.querySelectorAll('[data-emoji]').forEach((b) => b.addEventListener('click', () => { el('icone').value = b.dataset.emoji; }));
    panel.querySelector('[data-media]')?.addEventListener('click', () => { el('orcamento').value = fmt.decimalInput(media); });

    const excluir = (destino) => {
      if (destino) {
        const d = F.categorias(t).find((k) => k.nome === destino);
        F.moverCategoria(c.nome, destino, t, d?.icone);
      }
      S.remove('categorias', c.id);
      Fin.ui.closeModal();
      Fin.ui.toast(destino ? `Categoria excluída; registros movidos para “${destino}”.` : 'Categoria excluída.');
      Fin.router.refresh();
    };

    panel.querySelector('[data-delete]')?.addEventListener('click', () => {
      if (usos.total === 0) {
        if (confirm(`Excluir a categoria “${c.nome}”?`)) excluir(null);
        return;
      }
      if (!outras.length) return Fin.ui.toast('Crie outra categoria antes de excluir esta.', 'error');
      form.querySelector('#excluir-box').classList.remove('hidden');
    });
    panel.querySelector('[data-confirmar-exclusao]')?.addEventListener('click', () => {
      const destino = el('destino').value;
      if (confirm(`Mover ${usos.total} registros para “${destino}” e excluir “${c.nome}”?`)) excluir(destino);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const erro = form.querySelector('#form-erro');
      const { icone: iconeDoNome, nome: nomeLimpo } = P.splitEmoji(el('nome').value);
      const nome = (nomeLimpo || '').trim();
      const icone = el('icone').value.trim() || iconeDoNome || null;
      const orcamento = el('orcamento') ? P.toNumber(el('orcamento').value) ?? 0 : 0;
      const dup = F.categorias(t).some((k) => k.id !== c?.id && P.normalize(k.nome) === P.normalize(nome));
      if (!nome || dup || orcamento < 0) {
        erro.textContent = !nome ? 'Informe o nome.' : dup ? 'Já existe uma categoria com esse nome.' : 'O orçamento não pode ser negativo.';
        erro.classList.remove('hidden');
        return;
      }
      S.upsert('categorias', {
        ...(c ? { id: c.id } : {}),
        nome, icone, tipo: t,
        classificacao: el('classificacao').value.trim() || null,
        orcamentoMensal: orcamento,
      });
      if (c && (c.nome !== nome || c.icone !== icone)) F.moverCategoria(c.nome, nome, t, icone);
      Fin.ui.closeModal();
      Fin.ui.toast(c ? 'Categoria atualizada.' : 'Categoria criada.');
      Fin.router.refresh();
    });
  }

  return { open };
})();
