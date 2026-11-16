/**
 * components/categoria-form.js — Criar/editar/excluir categoria (com orçamento mensal).
 *
 * Mudar nome/ícone de categoria em uso mostra os registros afetados e pergunta:
 * corrigir todos (padrão) ou manter os antigos (no caso do nome, cria a nova ao lado).
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
        <div data-arrastar class="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
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
            <label class="flex items-start gap-3 bg-emerald-50/60 rounded-xl p-3 cursor-pointer">
              <input type="checkbox" name="investimento" class="accent-prim-600 w-4 h-4 mt-0.5" ${c?.investimento ? 'checked' : ''} />
              <span class="text-sm"><b>📈 É aporte em investimento</b><br>
                <span class="text-slate-500">Não conta como despesa: aparece como “Investido no mês” e é conferido na aba Investimentos.</span></span>
            </label>
            <label class="field"><span>Orçamento mensal (R$)</span>
              <input name="orcamento" class="input tabular-nums" inputmode="decimal" value="${c?.orcamentoMensal ? fmt.decimalInput(c.orcamentoMensal) : ''}" placeholder="Sem limite" /></label>
            ${media > 0 ? `<button type="button" data-media class="text-sm text-prim-700 font-medium hover:underline -mt-2">
              Usar a média dos últimos 3 meses: ${fmt.brl(media)}</button>` : ''}` : ''}

          ${c ? `<p class="text-xs text-slate-500">Usada em ${usos.total} ${usos.total === 1 ? 'registro' : 'registros'}${usos.total ? '. Se mudar o nome ou o ícone, o app mostra quais são e pergunta se quer corrigi-los também.' : '.'}</p>` : ''}

          <div id="corrigir-box" class="hidden rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-3" role="alertdialog" aria-live="assertive">
            <p class="text-sm text-amber-900" data-corrigir-texto></p>
            <ul class="text-xs text-slate-600 bg-white rounded-lg divide-y divide-slate-100" data-corrigir-lista></ul>
            <div class="flex flex-col sm:flex-row-reverse gap-2">
              <button type="button" data-corrigir="sim" class="btn btn-primary"></button>
              <button type="button" data-corrigir="nao" class="btn btn-ghost !bg-white"></button>
            </div>
            <button type="button" data-corrigir="voltar" class="text-xs text-slate-500 hover:underline">‹ Voltar e continuar editando</button>
          </div>

          <div id="excluir-box" class="hidden bg-rose-50 rounded-xl p-3 space-y-2">
            <p class="text-sm text-rose-800">Esta categoria está em uso. Para onde mover os ${usos.total} registros?</p>
            <select name="destino" class="input">${outras.map((k) => `<option>${esc(k.nome)}</option>`).join('')}</select>
            <button type="button" data-confirmar-exclusao class="btn btn-danger-ghost !bg-white">Mover e excluir</button>
          </div>

          <p id="form-erro" class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
        </div>
        <div data-rodape class="flex items-center gap-2 px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
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

    /** Registros que usam a categoria (lançamentos + compras do cartão), mais recentes primeiro. */
    const registros = () => {
      if (!c) return [];
      const lanc = F.todos().filter((l) => l.categoria === c.nome && l.tipo === t)
        .map((l) => ({ data: l.vencimento || l.data || l.competencia || '', desc: l.descricao || c.nome, valor: l.valorPago || l.valorPrevisto || 0, onde: '' }));
      const comp = t === 'despesa' ? S.list('cartaoCompras').filter((x) => x.categoria === c.nome)
        .map((x) => ({ data: x.data || '', desc: x.descricao || c.nome, valor: x.valor || 0, onde: x.cartao ? `cartão ${x.cartao}` : 'cartão' })) : [];
      // Mais recentes até hoje primeiro; os futuros (parcelas, recorrentes) depois.
      const hoje = fmt.todayISO();
      const futuro = (r) => String(r.data) > hoje;
      const lista = [...lanc, ...comp].sort((a, b) => (futuro(a) - futuro(b))
        || (futuro(a) ? String(a.data).localeCompare(String(b.data)) : String(b.data).localeCompare(String(a.data))));
      lista.lanc = lanc.length;
      lista.comp = comp.length;
      return lista;
    };

    // Mudou nome/ícone de categoria em uso → mostra os registros e pergunta se corrige também.
    const box = form.querySelector('#corrigir-box');
    const rodape = form.querySelector('[data-rodape]');
    let decisao = null; // 'sim' | 'nao' depois que a pessoa escolhe
    const perguntarCorrecao = (nome, icone) => {
      const lista = registros();
      const n = lista.length;
      const mudouNome = c.nome !== nome;
      const novo = `${icone ? `${icone} ` : ''}${nome}`;
      const partes = [lista.lanc && `${lista.lanc} ${lista.lanc === 1 ? 'lançamento' : 'lançamentos'}`,
        lista.comp && `${lista.comp} ${lista.comp === 1 ? 'compra' : 'compras'} no cartão`].filter(Boolean).join(' e ');
      box.querySelector('[data-corrigir-texto]').innerHTML = mudouNome
        ? `Você mudou <b>“${esc(c.nome)}”</b> para <b>“${esc(novo)}”</b>. Há <b>${esc(partes)}</b> ${n === 1 ? 'já feito' : 'já feitos'} com o nome antigo. Quer corrigir também?`
        : `Você mudou o ícone para <b>${esc(icone || 'nenhum')}</b>. Quer atualizar também ${n === 1 ? 'o registro já feito' : 'os registros já feitos'} (<b>${esc(partes)}</b>)?`;
      const mostra = 5;
      box.querySelector('[data-corrigir-lista]').innerHTML = lista.slice(0, mostra).map((r) => `
        <li class="flex items-center gap-2 px-2.5 py-1.5">
          <span class="tabular-nums text-slate-400 shrink-0">${r.data ? fmt.date(String(r.data).slice(0, 10)) : '—'}</span>
          <span class="flex-1 min-w-0 truncate">${esc(r.desc)}${r.onde ? ` <span class="text-slate-400">· ${esc(r.onde)}</span>` : ''}</span>
          <span class="tabular-nums shrink-0">${fmt.brl(r.valor)}</span>
        </li>`).join('') + (n > mostra ? `<li class="px-2.5 py-1.5 text-slate-400">e mais ${n - mostra}…</li>` : '');
      box.querySelector('[data-corrigir="sim"]').textContent = `Sim, corrigir ${n === 1 ? 'o registro' : `os ${n}`}`;
      box.querySelector('[data-corrigir="nao"]').textContent = mudouNome
        ? `Não, manter “${c.nome}” nos antigos`
        : 'Não, só a categoria';
      box.querySelector('[data-corrigir="nao"]').title = mudouNome
        ? `Cria a categoria “${nome}” para os próximos e deixa “${c.nome}” como está nos registros já feitos.`
        : 'Os registros já feitos continuam com o ícone antigo.';
      rodape.classList.add('hidden');
      box.classList.remove('hidden');
      box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      box.querySelector('[data-corrigir="sim"]').focus();
    };
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-corrigir]');
      if (!b) return;
      if (b.dataset.corrigir === 'voltar') {
        box.classList.add('hidden');
        rodape.classList.remove('hidden');
        return;
      }
      decisao = b.dataset.corrigir;
      form.requestSubmit();
    });
    form.addEventListener('input', () => { // mexeu de novo → volta a perguntar no próximo "Salvar"
      if (box.classList.contains('hidden')) decisao = null;
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
      const mudouNome = !!c && c.nome !== nome;
      const mudouRegistros = !!c && (mudouNome || (c.icone || null) !== icone);
      if (mudouRegistros && usos.total > 0 && !decisao) return perguntarCorrecao(nome, icone);

      const investimento = t === 'despesa' ? !!el('investimento')?.checked : undefined;
      const dados = {
        nome, icone, tipo: t,
        classificacao: el('classificacao').value.trim() || null,
        orcamentoMensal: orcamento,
        ...(t === 'despesa' ? { investimento } : {}),
      };
      let aviso;
      if (c && decisao === 'nao' && mudouNome) {
        // Mantém a categoria antiga nos registros já feitos e cria a nova ao lado.
        S.upsert('categorias', dados);
        aviso = `Categoria “${nome}” criada. Os registros antigos continuam em “${c.nome}”.`;
      } else {
        S.upsert('categorias', { ...(c ? { id: c.id } : {}), ...dados });
        if (mudouRegistros && (decisao === 'sim' || usos.total === 0)) F.moverCategoria(c.nome, nome, t, icone);
        aviso = !c ? 'Categoria criada.'
          : decisao === 'sim' ? `Categoria atualizada e ${usos.total === 1 ? '1 registro corrigido' : `${usos.total} registros corrigidos`}.`
          : 'Categoria atualizada.';
      }
      if (c && t === 'despesa' && !!c.investimento !== investimento && usos.total > 0 && decisao !== 'nao') {
        aviso += investimento ? ' Os lançamentos dela agora contam como aporte, não como despesa.' : ' Os lançamentos dela voltam a contar como despesa.';
      }
      Fin.ui.closeModal();
      Fin.ui.toast(aviso);
      Fin.router.refresh();
    });
  }

  return { open };
})();
