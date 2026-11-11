/**
 * components/cartao-form.js — Cadastro/configuração de um cartão de crédito.
 *
 * Uso: Fin.forms.cartao.open()       → novo cartão
 *      Fin.forms.cartao.open(id)     → configurar
 */
window.Fin = window.Fin || {};
Fin.forms = Fin.forms || {};

Fin.forms.cartao = (() => {
  const fmt = Fin.fmt;
  const esc = fmt.esc;
  const F = Fin.finance;
  const P = Fin.parsers;
  const S = Fin.storage;

  function open(id = null) {
    const k = id ? S.list('cartoes').find((x) => x.id === id) : null;
    const qtdCompras = k ? S.list('cartaoCompras').filter((c) => c.cartao === k.nome).length : 0;
    const dias = (sel) => `<option value="">—</option>` +
      Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}" ${sel === i + 1 ? 'selected' : ''}>dia ${i + 1}</option>`).join('');

    const panel = Fin.ui.openModal(`
      <form id="cartao-form" novalidate>
        <div class="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 class="font-semibold text-lg">${k ? 'Configurar cartão' : 'Novo cartão'}</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <div class="px-5 py-4 space-y-4">
          <label class="field"><span>Nome do cartão *</span>
            <input name="nome" class="input" maxlength="40" value="${esc(k?.nome)}" placeholder="Ex.: Nubank" /></label>

          <div class="grid grid-cols-2 gap-3">
            <label class="field"><span>Fechamento da fatura</span>
              <select name="diaFechamento" class="input">${dias(k?.diaFechamento)}</select></label>
            <label class="field"><span>Vencimento da fatura</span>
              <select name="diaVencimento" class="input">${dias(k?.diaVencimento)}</select></label>
          </div>
          <p class="text-xs text-slate-500 -mt-2">Com o fechamento, o app calcula sozinho em qual fatura cada compra cai.</p>

          <label class="field"><span>Limite (R$)</span>
            <input name="limite" class="input tabular-nums" inputmode="decimal" value="${fmt.decimalInput(k?.limite)}" placeholder="Opcional" /></label>

          <label class="field"><span>Palavra do lançamento de pagamento</span>
            <input name="palavraChave" class="input" maxlength="30" value="${esc(k?.palavraChave)}" placeholder="Ex.: ourocard" /></label>
          <p class="text-xs text-slate-500 -mt-2">Usada para achar o pagamento da fatura nos lançamentos
            (ex.: “ourocard” encontra “CARTÃO - OUROCARD BB” na categoria Pagamento Fatura).</p>

          <p id="form-erro" class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
        </div>
        <div class="flex items-center gap-2 px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
          ${k ? `<button type="button" data-delete class="btn btn-danger-ghost" ${qtdCompras ? 'disabled title="Exclua as compras deste cartão primeiro"' : ''}>Excluir</button>` : ''}
          <span class="flex-1"></span>
          <button type="button" data-close class="btn btn-ghost">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar</button>
        </div>
      </form>`, k ? 'Configurar cartão' : 'Novo cartão');

    const form = panel.querySelector('#cartao-form');
    const el = (n) => form.elements[n];
    panel.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', Fin.ui.closeModal));

    panel.querySelector('[data-delete]')?.addEventListener('click', () => {
      if (!confirm(`Excluir o cartão “${k.nome}”?`)) return;
      S.remove('cartoes', k.id);
      Fin.state.cartao = null;
      Fin.ui.closeModal();
      Fin.ui.toast('Cartão excluído.');
      Fin.router.refresh();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const erro = form.querySelector('#form-erro');
      const nome = el('nome').value.trim();
      const duplicado = F.cartoes().some((x) => x.id !== k?.id && P.normalize(x.nome) === P.normalize(nome));
      if (!nome || duplicado) {
        erro.textContent = !nome ? 'Informe o nome do cartão.' : 'Já existe um cartão com esse nome.';
        erro.classList.remove('hidden');
        return;
      }
      const dados = {
        ...(k ? { id: k.id } : {}),
        nome,
        diaFechamento: Number(el('diaFechamento').value) || null,
        diaVencimento: Number(el('diaVencimento').value) || null,
        limite: P.toNumber(el('limite').value),
        palavraChave: P.normalize(el('palavraChave').value) || P.normalize(nome).split(' ')[0],
      };
      S.upsert('cartoes', dados);

      // Renomeou? Atualiza as compras para continuarem ligadas ao cartão.
      if (k && k.nome !== nome) {
        S.set('cartaoCompras', S.list('cartaoCompras').map((c) => (c.cartao === k.nome ? { ...c, cartao: nome } : c)));
      }
      Fin.state.cartao = nome;
      Fin.ui.closeModal();
      Fin.ui.toast(k ? 'Cartão atualizado.' : 'Cartão criado.');
      Fin.router.refresh();
    });
  }

  return { open };
})();
