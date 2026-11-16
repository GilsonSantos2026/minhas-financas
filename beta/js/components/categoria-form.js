/**
 * components/categoria-form.js — Criar/editar/excluir categoria (com orçamento mensal).
 *
 * Mudar nome/ícone de categoria em uso abre, logo abaixo do nome, a lista dos registros
 * afetados (todos marcados; dá para filtrar e desmarcar). Só os marcados são corrigidos;
 * se o nome mudou e sobrou algum desmarcado, a antiga continua e a nova é criada ao lado.
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

          <section id="afetados" class="hidden rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2" aria-live="polite">
            <p class="text-sm text-amber-900" data-afetados-texto></p>
            <div class="flex flex-wrap items-center gap-2">
              <input type="search" data-afetados-busca class="input !py-1.5 text-sm flex-1 min-w-[10rem]" placeholder="Filtrar por descrição ou cartão" aria-label="Filtrar registros afetados" />
              <button type="button" data-afetados-todos="1" class="text-xs font-medium text-prim-700 hover:underline">Marcar todos</button>
              <button type="button" data-afetados-todos="0" class="text-xs font-medium text-prim-700 hover:underline">Desmarcar todos</button>
            </div>
            <ul class="max-h-64 overflow-y-auto bg-white rounded-lg divide-y divide-slate-100 text-xs text-slate-600" data-afetados-lista></ul>
            <p class="text-xs text-amber-800" data-afetados-nota></p>
          </section>
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

          ${c ? `<p class="text-xs text-slate-500">Usada em ${usos.total} ${usos.total === 1 ? 'registro' : 'registros'}${usos.total ? '. Ao mudar o nome ou o ícone, aparece logo abaixo dele a lista do que será corrigido — desmarque o que não quiser mudar.' : '.'}</p>` : ''}

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
          <button type="submit" data-salvar class="btn btn-primary">Salvar</button>
        </div>
      </form>`, c ? 'Editar categoria' : 'Nova categoria');

    const form = panel.querySelector('#cat-form');
    const el = (n) => form.elements[n];
    if (foco && el(foco)) setTimeout(() => el(foco).focus(), 60);

    panel.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', Fin.ui.closeModal));
    panel.querySelectorAll('[data-emoji]').forEach((b) => b.addEventListener('click', () => { el('icone').value = b.dataset.emoji; atualizarAfetados(); }));
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

    /** Registros que usam a categoria (lançamentos + compras do cartão): até hoje (recentes primeiro), depois os futuros. */
    const hoje = fmt.todayISO();
    const registros = (() => {
      if (!c || !usos.total) return [];
      const lanc = F.todos().filter((l) => l.categoria === c.nome && l.tipo === t)
        .map((l) => ({ id: l.id, data: String(l.vencimento || l.data || l.competencia || ''), desc: l.descricao || c.nome, valor: l.valorPago || l.valorPrevisto || 0, onde: '' }));
      const comp = t === 'despesa' ? S.list('cartaoCompras').filter((x) => x.categoria === c.nome)
        .map((x) => ({ id: x.id, data: String(x.data || ''), desc: x.descricao || c.nome, valor: x.valor || 0, onde: `cartão${x.cartao ? ` ${x.cartao}` : ''}${x.parcela ? ` · ${x.parcela.atual}/${x.parcela.total}` : ''}` })) : [];
      const futuro = (r) => r.data > hoje;
      return [...lanc, ...comp].sort((a, b) => (futuro(a) - futuro(b))
        || (futuro(a) ? a.data.localeCompare(b.data) : b.data.localeCompare(a.data)));
    })();
    const marcados = new Set(registros.map((r) => r.id)); // começa com tudo marcado

    // Nome/ícone como ficarão ao salvar (mesma regra do envio).
    const novoNomeIcone = () => {
      const { icone: iconeDoNome, nome: nomeLimpo } = P.splitEmoji(el('nome').value);
      return { nome: (nomeLimpo || '').trim(), icone: el('icone').value.trim() || iconeDoNome || null };
    };
    const mudancaNosRegistros = () => {
      if (!registros.length) return null;
      const { nome, icone } = novoNomeIcone();
      if (!nome) return null;
      const mudouNome = c.nome !== nome;
      if (!mudouNome && (c.icone || null) === icone) return null;
      return { nome, icone, mudouNome };
    };

    // Quadro "logo abaixo do nome": lista do que será corrigido, com caixas para marcar/desmarcar.
    const quadro = form.querySelector('#afetados');
    const lista = quadro.querySelector('[data-afetados-lista]');
    const botaoSalvar = form.querySelector('[data-salvar]');
    const linha = (r) => `
      <li><label class="flex items-center gap-2 px-2.5 py-1.5 cursor-pointer hover:bg-slate-50" data-reg-linha="${esc(`${r.desc} ${r.onde}`.toLowerCase())}">
        <input type="checkbox" data-reg="${esc(r.id)}" class="accent-prim-600 w-4 h-4 shrink-0" ${marcados.has(r.id) ? 'checked' : ''} />
        <span class="tabular-nums text-slate-400 shrink-0 w-[4.6rem]">${r.data ? fmt.date(r.data.slice(0, 10)) : '—'}</span>
        <span class="flex-1 min-w-0 truncate">${esc(r.desc)}${r.onde ? ` <span class="text-slate-400">· ${esc(r.onde)}</span>` : ''}</span>
        <span class="tabular-nums shrink-0">${fmt.brl(r.valor)}</span>
      </label></li>`;
    if (registros.length) {
      const passados = registros.filter((r) => r.data <= hoje);
      const futuros = registros.filter((r) => r.data > hoje);
      const titulo = (txt) => `<li class="px-2.5 py-1 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500 sticky top-0">${txt}</li>`;
      lista.innerHTML = (passados.length ? titulo(`Já lançados (${passados.length})`) + passados.map(linha).join('') : '')
        + (futuros.length ? titulo(`Próximos meses (${futuros.length})`) + futuros.map(linha).join('') : '');
    }

    function atualizarAfetados() {
      const m = mudancaNosRegistros();
      quadro.classList.toggle('hidden', !m);
      if (!m) { botaoSalvar.textContent = 'Salvar'; return; }
      const n = registros.length;
      const k = marcados.size;
      const novo = `${m.icone ? `${m.icone} ` : ''}${m.nome}`;
      quadro.querySelector('[data-afetados-texto]').innerHTML = m.mudouNome
        ? `<b>${n} ${n === 1 ? 'registro usa' : 'registros usam'} “${esc(c.nome)}”.</b> Os marcados passam para <b>“${esc(novo)}”</b> — ${k} de ${n} marcados.`
        : `<b>${n} ${n === 1 ? 'registro usa' : 'registros usam'} esta categoria.</b> Os marcados ficam com o ícone <b>${esc(m.icone || 'nenhum')}</b> — ${k} de ${n} marcados.`;
      quadro.querySelector('[data-afetados-nota]').textContent = k === n ? ''
        : m.mudouNome ? `Os ${n - k} desmarcados continuam em “${c.nome}”, que fica na lista de categorias; a nova “${m.nome}” é criada ao lado.`
          : `Os ${n - k} desmarcados continuam com o ícone antigo.`;
      botaoSalvar.textContent = k ? `Salvar e corrigir ${k}` : 'Salvar sem corrigir';
    }
    form.addEventListener('input', (e) => {
      if (e.target.name === 'nome' || e.target.name === 'icone') atualizarAfetados();
    });
    lista.addEventListener('change', (e) => {
      const cb = e.target.closest('[data-reg]');
      if (!cb) return;
      if (cb.checked) marcados.add(cb.dataset.reg); else marcados.delete(cb.dataset.reg);
      atualizarAfetados();
    });
    quadro.querySelector('[data-afetados-busca]').addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      lista.querySelectorAll('[data-reg-linha]').forEach((l) => { l.parentElement.hidden = !!q && !l.dataset.regLinha.includes(q); });
    });
    quadro.querySelectorAll('[data-afetados-todos]').forEach((b) => b.addEventListener('click', () => {
      const marcar = b.dataset.afetadosTodos === '1';
      // Com filtro ativo, vale só para as linhas visíveis.
      lista.querySelectorAll('[data-reg]').forEach((cb) => {
        if (cb.closest('li').hidden) return;
        cb.checked = marcar;
        if (marcar) marcados.add(cb.dataset.reg); else marcados.delete(cb.dataset.reg);
      });
      atualizarAfetados();
    }));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const erro = form.querySelector('#form-erro');
      const { nome, icone } = novoNomeIcone();
      const orcamento = el('orcamento') ? P.toNumber(el('orcamento').value) ?? 0 : 0;
      const dup = F.categorias(t).some((k) => k.id !== c?.id && P.normalize(k.nome) === P.normalize(nome));
      if (!nome || dup || orcamento < 0) {
        erro.textContent = !nome ? 'Informe o nome.' : dup ? 'Já existe uma categoria com esse nome.' : 'O orçamento não pode ser negativo.';
        erro.classList.remove('hidden');
        return;
      }
      const investimento = t === 'despesa' ? !!el('investimento')?.checked : undefined;
      const dados = {
        nome, icone, tipo: t,
        classificacao: el('classificacao').value.trim() || null,
        orcamentoMensal: orcamento,
        ...(t === 'despesa' ? { investimento } : {}),
      };
      const m = c ? mudancaNosRegistros() : null;
      const k = marcados.size;
      const n = registros.length;
      let aviso;
      if (!c) {
        S.upsert('categorias', dados);
        aviso = 'Categoria criada.';
      } else if (m?.mudouNome && k < n) {
        // Parte fica com o nome antigo → a categoria antiga continua e a nova é criada ao lado.
        S.upsert('categorias', dados);
        if (k) F.moverCategoria(c.nome, nome, t, icone, new Set(marcados));
        aviso = `Categoria “${nome}” criada${k ? ` com ${k} ${k === 1 ? 'registro corrigido' : 'registros corrigidos'}` : ''}. ${n - k} ${n - k === 1 ? 'continua' : 'continuam'} em “${c.nome}”.`;
      } else {
        S.upsert('categorias', { id: c.id, ...dados });
        if (m && k) F.moverCategoria(c.nome, nome, t, icone, k === n ? null : new Set(marcados));
        aviso = m && k ? `Categoria atualizada e ${k === 1 ? '1 registro corrigido' : `${k} registros corrigidos`}.` : 'Categoria atualizada.';
        if (t === 'despesa' && !!c.investimento !== investimento && usos.total > 0) {
          aviso += investimento ? ' Os lançamentos dela agora contam como aporte, não como despesa.' : ' Os lançamentos dela voltam a contar como despesa.';
        }
      }
      Fin.ui.closeModal();
      Fin.ui.toast(aviso);
      Fin.router.refresh();
    });
  }

  return { open };
})();
