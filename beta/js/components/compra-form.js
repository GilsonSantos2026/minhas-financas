/**
 * components/compra-form.js — Compra no cartão de crédito.
 *
 * Nova compra: informa o valor TOTAL e o nº de parcelas; o app cria uma
 * parcela em cada fatura (mês seguinte, mês seguinte...).
 * Edição: altera uma parcela; descrição, categoria e observação valem para
 * todas as parcelas da mesma compra.
 *
 * Uso: Fin.forms.compra.open({ cartao })   → nova
 *      Fin.forms.compra.open({ id })       → editar
 */
window.Fin = window.Fin || {};
Fin.forms = Fin.forms || {};

Fin.forms.compra = (() => {
  const fmt = Fin.fmt;
  const esc = fmt.esc;
  const F = Fin.finance;
  const P = Fin.parsers;
  const S = Fin.storage;

  /**
   * Modo casal: compra lançada pela OUTRA pessoa → salvar/excluir pede confirmação
   * (barra no lugar dos botões, como no formulário de lançamento). Vale nos dois sentidos.
   */
  const autorOutro = (c) => (c && F.temCasal() && F.autor(c) !== Fin.cofre.membroId() ? Fin.membros.porId(F.autor(c)) : null);
  function deOutroHTML(c) {
    const a = autorOutro(c);
    if (!a) return '';
    const nome = esc(Fin.membros.primeiroNome(a) || a.usuario);
    return `
      <div data-confirma-outro class="hidden px-5 py-4 border-t border-amber-200 bg-amber-50 sticky bottom-0 space-y-3" role="alertdialog" aria-live="assertive">
        <div class="flex items-start gap-2 text-sm text-amber-900">
          ${Fin.membros.avatar(a, { tam: 'w-7 h-7', txt: 'text-[10px]' })}
          <span><b>Esta compra foi lançada por ${nome}.</b> <span data-confirma-texto>Quer mesmo salvar a alteração?</span></span>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" data-confirma-nao class="btn btn-ghost !py-1.5">Voltar</button>
          <button type="button" data-confirma-sim class="btn btn-primary !py-1.5">Sim, salvar</button>
        </div>
      </div>`;
  }

  function open({ id = null, cartao = null } = {}) {
    const c = id ? S.list('cartaoCompras').find((x) => x.id === id) : null;
    if (id && !c) return Fin.ui.toast('Compra não encontrada.', 'error');

    const cartoes = F.cartoes();
    if (!cartoes.length) {
      Fin.ui.toast('Cadastre um cartão primeiro.', 'error');
      return Fin.forms.cartao.open();
    }
    const nomeCartao = c?.cartao || cartao || Fin.state.cartao || cartoes[0].nome;
    const hoje = fmt.todayISO();
    const data = c?.data || hoje;
    const fatura = c?.fatura || F.faturaDaCompra(F.cartao(nomeCartao), data);
    const grupo = c?.grupo ? S.list('cartaoCompras').filter((x) => x.grupo === c.grupo) : [];
    const NOVA = Fin.forms.NOVA_CATEGORIA;

    const panel = Fin.ui.openModal(`
      <form id="compra-form" novalidate>
        <div data-arrastar class="flex items-center justify-between gap-2 px-5 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 class="font-semibold text-lg">${c ? 'Editar compra' : 'Nova compra no cartão'}</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>

        <div class="px-5 py-4 space-y-4">
          ${c?.parcela ? `<p class="text-sm bg-slate-50 rounded-xl px-3 py-2">Parcela <b>${c.parcela.atual}/${c.parcela.total}</b>${c.valorTotalCompra ? ` de uma compra de ${fmt.brl(c.valorTotalCompra)}` : ''}.
            ${grupo.length > 1 ? 'Descrição, categoria e observação serão atualizadas em todas as parcelas.' : ''}</p>` : ''}

          <label class="field"><span>Cartão *</span>
            <select name="cartao" class="input">${cartoes.map((k) => `<option ${k.nome === nomeCartao ? 'selected' : ''}>${esc(k.nome)}</option>`).join('')}</select></label>

          <label class="field"><span>Descrição *</span>
            <input name="descricao" class="input" maxlength="120" value="${esc(c?.descricao)}" placeholder="Ex.: Supermercado" /></label>

          <div class="grid grid-cols-2 gap-3">
            <label class="field"><span>${c ? 'Valor desta parcela (R$) *' : 'Valor total (R$) *'}</span>
              <input name="valor" class="input tabular-nums" inputmode="decimal" value="${fmt.decimalInput(c?.valor)}" placeholder="0,00" /></label>
            ${c ? `<label class="field"><span>Fatura</span>
                <input name="fatura" type="month" class="input" value="${fatura}" /></label>`
              : `<label class="field"><span>Parcelas</span>
                <select name="parcelas" class="input">${Array.from({ length: 24 }, (_, i) => `<option value="${i + 1}">${i + 1}x</option>`).join('')}</select></label>`}
          </div>

          <label class="field"><span>Categoria *</span>
            <select name="categoria" class="input">${Fin.forms.categoriaOptions('despesa', c?.categoria)}</select></label>

          <div class="grid grid-cols-2 gap-3">
            <label class="field"><span>Data da compra *</span>
              <input name="data" type="date" class="input" value="${data}" /></label>
            ${c ? '<div></div>' : `<label class="field"><span>1ª fatura</span>
              <input name="fatura" type="month" class="input" value="${fatura}" /></label>`}
          </div>

          <p id="compra-resumo" class="text-sm text-slate-600 bg-prim-50 rounded-xl px-3 py-2 ${c ? 'hidden' : ''}"></p>

          <label class="field"><span>Observação</span>
            <textarea name="observacao" rows="2" class="input" maxlength="500">${esc(c?.observacao)}</textarea></label>
          <p class="text-xs text-slate-400">Estorno ou crédito na fatura: informe o valor negativo (ex.: -50,00).</p>

          <p id="form-erro" class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
        </div>

        <div data-rodape class="flex flex-wrap items-center gap-2 px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
          ${c ? `<button type="button" data-delete="one" class="btn btn-danger-ghost">${grupo.length > 1 ? 'Excluir parcela' : 'Excluir'}</button>` : ''}
          ${grupo.length > 1 ? `<button type="button" data-delete="all" class="btn btn-danger-ghost">Excluir as ${grupo.length}</button>` : ''}
          <span class="flex-1"></span>
          <button type="button" data-close class="btn btn-ghost">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar</button>
        </div>
        ${deOutroHTML(c)}
      </form>`, c ? 'Editar compra' : 'Nova compra no cartão');

    const form = panel.querySelector('#compra-form');
    const el = (n) => form.elements[n];
    let faturaTocada = !!c;

    const atualizarResumo = () => {
      if (c) return;
      const total = P.toNumber(el('valor').value);
      const n = Number(el('parcelas').value);
      const fat = el('fatura').value;
      const box = form.querySelector('#compra-resumo');
      if (!total || !fat) { box.textContent = 'Informe o valor para ver as parcelas.'; return; }
      const parcela = Math.trunc((total * 100) / n) / 100;
      box.textContent = n === 1
        ? `Entra na fatura de ${fmt.monthLong(fat).toLowerCase()}.`
        : `${n}x de ${fmt.brl(parcela)} — faturas de ${fmt.monthShort(fat)} a ${fmt.monthShort(fmt.addMonths(fat, n - 1))}.`;
    };
    const recalcularFatura = () => {
      if (faturaTocada || !el('data').value) return;
      el('fatura').value = F.faturaDaCompra(F.cartao(el('cartao').value), el('data').value);
    };
    atualizarResumo();

    form.addEventListener('input', atualizarResumo);
    form.addEventListener('change', (e) => {
      const n = e.target.name;
      if (n === 'fatura') faturaTocada = true;
      if (n === 'data' || n === 'cartao') recalcularFatura();
      if (n === 'categoria' && e.target.value === NOVA) Fin.forms.novaCategoria(el('categoria'), 'despesa');
      atualizarResumo();
    });
    panel.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', Fin.ui.closeModal));

    // Compra da outra pessoa: barra de confirmação no lugar dos botões.
    const outro = autorOutro(c);
    let confirmadoOutro = false;
    const barra = form.querySelector('[data-confirma-outro]');
    const rodape = form.querySelector('[data-rodape]');
    const mostrarConfirmacao = (texto, rotulo, aoConfirmar) => {
      barra.querySelector('[data-confirma-texto]').textContent = texto;
      const sim = barra.querySelector('[data-confirma-sim]');
      sim.textContent = rotulo;
      sim.onclick = aoConfirmar;
      rodape.classList.add('hidden');
      barra.classList.remove('hidden');
      sim.focus();
    };
    barra?.querySelector('[data-confirma-nao]').addEventListener('click', () => {
      barra.classList.add('hidden');
      rodape.classList.remove('hidden');
    });

    const excluir = (todas) => {
      const ids = new Set(todas ? grupo.map((x) => x.id) : [c.id]);
      S.set('cartaoCompras', S.list('cartaoCompras').filter((x) => !ids.has(x.id)));
      Fin.ui.closeModal();
      Fin.ui.toast(todas ? 'Compra excluída.' : 'Parcela excluída.');
      Fin.router.refresh();
    };
    panel.querySelectorAll('[data-delete]').forEach((b) => b.addEventListener('click', () => {
      const todas = b.dataset.delete === 'all';
      if (outro) {
        return mostrarConfirmacao(
          todas ? `Quer mesmo excluir as ${grupo.length} parcelas? Não dá para desfazer.` : 'Quer mesmo excluir? Não dá para desfazer.',
          'Sim, excluir',
          () => excluir(todas),
        );
      }
      const msg = todas ? `Excluir as ${grupo.length} parcelas de “${c.descricao}”?` : `Excluir “${c.descricao}”${c.parcela ? ` (parcela ${c.parcela.atual}/${c.parcela.total})` : ''}?`;
      if (!confirm(`${msg} Esta ação não pode ser desfeita.`)) return;
      excluir(todas);
    }));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const erro = form.querySelector('#form-erro');
      const valor = P.toNumber(el('valor').value);
      const categoria = el('categoria').value;
      const problemas = [];
      if (!el('descricao').value.trim()) problemas.push('a descrição');
      if (!valor) problemas.push('o valor');
      if (!categoria || categoria === NOVA) problemas.push('a categoria');
      if (!el('data').value) problemas.push('a data da compra');
      if (!el('fatura').value) problemas.push('a fatura');
      if (problemas.length) {
        erro.textContent = `Informe ${problemas.join(', ')}.`;
        erro.classList.remove('hidden');
        return;
      }
      // Compra da outra pessoa: confirma antes de salvar (nos dois sentidos).
      if (outro && !confirmadoOutro) {
        return mostrarConfirmacao(
          `Quer mesmo salvar a alteração${grupo.length > 1 ? ' (descrição e categoria valem para todas as parcelas)' : ''}?`,
          'Sim, salvar',
          () => { confirmadoOutro = true; form.requestSubmit(); },
        );
      }

      const icone = F.categorias().find((k) => k.nome === categoria)?.icone ?? null;
      const comum = {
        cartao: el('cartao').value,
        descricao: el('descricao').value.trim(),
        categoria,
        categoriaIcone: icone,
        observacao: el('observacao').value.trim() || null,
      };

      if (c) {
        const lista = S.list('cartaoCompras').map((x) => {
          if (x.id === c.id) return { ...x, ...comum, data: el('data').value, valor, fatura: el('fatura').value, atualizadoEm: new Date().toISOString() };
          if (c.grupo && x.grupo === c.grupo) return { ...x, ...comum, atualizadoEm: new Date().toISOString() };
          return x;
        });
        S.set('cartaoCompras', lista);
        Fin.ui.toast('Compra atualizada.');
      } else {
        const parcelas = Number(el('parcelas').value);
        F.criarCompra({ ...comum, data: el('data').value, valorTotal: valor, parcelas, fatura: el('fatura').value });
        Fin.ui.toast(parcelas > 1 ? `Compra criada em ${parcelas} parcelas.` : 'Compra criada.');
        Fin.state.cartao = comum.cartao;
        Fin.state.mes = el('fatura').value;
      }
      Fin.ui.closeModal();
      Fin.router.refresh();
    });
  }

  return { open };
})();
