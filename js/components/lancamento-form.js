/**
 * components/lancamento-form.js — Formulário para criar, editar e excluir lançamentos.
 * Abre como janela no computador e como "bottom sheet" no celular.
 *
 * Uso: Fin.forms.lancamento.open()        → novo
 *      Fin.forms.lancamento.open(id)      → editar
 */
window.Fin = window.Fin || {};
Fin.forms = Fin.forms || {};

Fin.forms.lancamento = (() => {
  const fmt = Fin.fmt;
  const esc = fmt.esc;
  const F = Fin.finance;
  const P = Fin.parsers;
  const NOVA = '__nova__';

  /** Opções do seletor de categoria (reaproveitado pelo formulário de compra no cartão). */
  function categoriaOptions(tipo, atual) {
    const cats = F.categorias(tipo);
    const nomes = cats.map((c) => c.nome);
    const extra = atual && !nomes.includes(atual) ? [{ nome: atual, icone: '' }] : [];
    return `<option value="">Selecione…</option>` +
      [...extra, ...cats].map((c) => `<option value="${esc(c.nome)}" ${c.nome === atual ? 'selected' : ''}>${c.icone ? c.icone + ' ' : ''}${esc(c.nome)}</option>`).join('') +
      `<option value="${NOVA}">＋ Nova categoria…</option>`;
  }

  function open(id = null) {
    const l = id ? F.lancamentos().find((x) => x.id === id) : null;
    if (id && !l) return Fin.ui.toast('Lançamento não encontrado.', 'error');

    const hoje = fmt.todayISO();
    // Novo lançamento: data de hoje se o mês aberto é o atual; senão, dia 1 do mês aberto.
    const dataPadrao = Fin.state.mes === fmt.currentYM() ? hoje : `${Fin.state.mes}-01`;
    const v = l || { tipo: 'despesa', status: 'aberto', data: dataPadrao, vencimento: dataPadrao, competencia: Fin.state.mes };
    const formas = F.formasPagamento();

    const panel = Fin.ui.openModal(`
      <form id="lanc-form" novalidate>
        <div class="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 class="font-semibold text-lg">${l ? 'Editar lançamento' : 'Novo lançamento'}</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>

        <div class="px-5 py-4 space-y-4">
          ${l?.grupo ? `
            <div class="bg-slate-50 rounded-xl px-3 py-2.5 text-sm space-y-2">
              <p><span aria-hidden="true">${l.recorrencia === 'fixo' ? '🔁' : '🧩'}</span>
                ${l.recorrencia === 'fixo' ? `Lançamento fixo · mês <b>${l.parcela?.atual}/${l.parcela?.total}</b>` : `Parcela <b>${l.parcela?.atual}/${l.parcela?.total}</b>`}</p>
              <fieldset class="flex flex-wrap gap-x-4 gap-y-1">
                <legend class="sr-only">Aplicar alterações a</legend>
                <label class="inline-flex items-center gap-1.5"><input type="radio" name="escopo" value="este" checked class="accent-emerald-600"> Só este</label>
                <label class="inline-flex items-center gap-1.5"><input type="radio" name="escopo" value="proximos" class="accent-emerald-600"> Este e os próximos</label>
              </fieldset>
            </div>` : ''}

          <div class="seg" role="radiogroup" aria-label="Tipo">
            <label><input type="radio" name="tipo" value="despesa" ${v.tipo !== 'receita' ? 'checked' : ''}><span>Despesa</span></label>
            <label><input type="radio" name="tipo" value="receita" ${v.tipo === 'receita' ? 'checked' : ''}><span>Receita</span></label>
          </div>

          <label class="field"><span>Descrição *</span>
            <input name="descricao" class="input" required maxlength="120" value="${esc(v.descricao)}" placeholder="Ex.: Conta de luz" /></label>

          <div class="grid grid-cols-2 gap-3">
            <label class="field"><span id="lbl-valor">Valor previsto (R$) *</span>
              <input name="valorPrevisto" class="input tabular-nums" inputmode="decimal" required value="${fmt.decimalInput(v.valorPrevisto)}" placeholder="0,00" /></label>
            <label class="field"><span>Categoria *</span>
              <select name="categoria" class="input" required>${categoriaOptions(v.tipo, v.categoria)}</select></label>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <label class="field"><span>Vencimento *</span>
              <input name="vencimento" type="date" class="input" required value="${v.vencimento || v.data || ''}" /></label>
            <label class="field"><span>Mês de competência</span>
              <input name="competencia" type="month" class="input" value="${v.competencia || ''}" /></label>
          </div>

          ${l ? '' : `
          <div class="space-y-2">
            <label class="field"><span>Repetir</span>
              <select name="repeticao" class="input">
                <option value="nao">Não repetir</option>
                <option value="parcelado">Parcelado (divide o valor em parcelas)</option>
                <option value="fixo">Fixo todo mês (mesmo valor)</option>
              </select></label>
            <div id="rep-box" class="hidden grid grid-cols-[7rem_1fr] gap-3 items-center">
              <label class="field"><span>Meses</span>
                <input name="vezes" type="number" inputmode="numeric" min="2" max="120" value="12" class="input" /></label>
              <p id="rep-resumo" class="text-xs text-slate-600 bg-emerald-50 rounded-lg px-3 py-2 self-end"></p>
            </div>
          </div>`}

          <div class="grid grid-cols-2 gap-3">
            <label class="field"><span>Status</span>
              <select name="status" class="input">
                <option value="aberto" ${!['pago', 'parcial'].includes(v.status) ? 'selected' : ''}>Em aberto</option>
                <option value="pago" ${v.status === 'pago' ? 'selected' : ''}>Pago / recebido</option>
                <option value="parcial" ${v.status === 'parcial' ? 'selected' : ''}>Pago parcialmente</option>
              </select></label>
            <label class="field"><span>Forma de pagamento</span>
              <input name="formaPagamento" class="input" list="formas-list" value="${esc(v.formaPagamento)}" placeholder="PIX, Boleto…" />
              <datalist id="formas-list">${formas.map((f) => `<option value="${esc(f.nome)}"></option>`).join('')}</datalist></label>
          </div>

          <div id="pago-fields" class="grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-3">
            <label class="field"><span>Valor pago (R$)</span>
              <input name="valorPago" class="input tabular-nums" inputmode="decimal" value="${fmt.decimalInput(v.valorPago)}" placeholder="0,00" /></label>
            <label class="field"><span>Data do pagamento</span>
              <input name="dataPagamento" type="date" class="input" value="${v.dataPagamento || ''}" /></label>
          </div>

          <label class="field"><span>Data do lançamento</span>
            <input name="data" type="date" class="input" value="${v.data || ''}" /></label>

          <label class="field"><span>Observação</span>
            <textarea name="observacao" rows="2" class="input" maxlength="500">${esc(v.observacao)}</textarea></label>

          <p id="form-erro" class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
        </div>

        <div class="flex items-center gap-2 px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
          ${l ? `<button type="button" data-delete class="btn btn-danger-ghost">${l.grupo ? 'Excluir…' : 'Excluir'}</button>` : ''}
          <span class="flex-1"></span>
          <button type="button" data-close class="btn btn-ghost">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar</button>
        </div>
      </form>`, l ? 'Editar lançamento' : 'Novo lançamento');

    const form = panel.querySelector('#lanc-form');
    const el = (name) => form.elements[name];
    let competenciaTocada = !!l;

    const syncPago = () => {
      const st = el('status').value;
      form.querySelector('#pago-fields').classList.toggle('hidden', st === 'aberto');
      if (st !== 'aberto') {
        if (!el('valorPago').value && st === 'pago') el('valorPago').value = el('valorPrevisto').value;
        if (!el('dataPagamento').value) el('dataPagamento').value = hoje;
      }
    };
    syncPago();

    // Repetição (só em lançamento novo): mostra quantidade de meses e um resumo.
    const syncRepeticao = () => {
      if (!el('repeticao')) return;
      const modo = el('repeticao').value;
      const n = Math.max(2, Math.min(120, Number(el('vezes').value) || 2));
      form.querySelector('#rep-box').classList.toggle('hidden', modo === 'nao');
      form.querySelector('#lbl-valor').textContent = modo === 'parcelado' ? 'Valor total (R$) *' : 'Valor previsto (R$) *';
      const valor = P.toNumber(el('valorPrevisto').value);
      const ini = el('competencia').value || (el('vencimento').value || '').slice(0, 7);
      const resumo = form.querySelector('#rep-resumo');
      if (modo === 'nao') return;
      if (!valor || !ini) { resumo.textContent = 'Informe valor e vencimento para ver o resumo.'; return; }
      const fim = fmt.monthShort(fmt.addMonths(ini, n - 1));
      resumo.textContent = modo === 'parcelado'
        ? `${n}x de ${fmt.brl(Math.trunc((valor * 100) / n) / 100)} — de ${fmt.monthShort(ini)} a ${fim}.`
        : `${fmt.brl(valor)} por mês, de ${fmt.monthShort(ini)} a ${fim} (${fmt.brl(valor * n)} no total).`;
    };
    form.addEventListener('input', syncRepeticao);
    syncRepeticao();

    form.addEventListener('change', (e) => {
      const n = e.target.name;
      if (['repeticao', 'vencimento', 'competencia'].includes(n)) setTimeout(syncRepeticao);
      if (n === 'tipo') el('categoria').innerHTML = categoriaOptions(e.target.value, el('categoria').value);
      if (n === 'status') syncPago();
      if (n === 'competencia') competenciaTocada = true;
      if (n === 'vencimento' && !competenciaTocada && e.target.value) el('competencia').value = e.target.value.slice(0, 7);
      if (n === 'categoria' && e.target.value === NOVA) novaCategoria(el('categoria'), form.querySelector('input[name="tipo"]:checked').value);
    });

    panel.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', Fin.ui.closeModal));

    const escopo = () => form.querySelector('input[name="escopo"]:checked')?.value || 'este';

    panel.querySelector('[data-delete]')?.addEventListener('click', () => {
      const proximos = escopo() === 'proximos';
      const alvo = proximos ? `“${l.descricao || l.categoria}” e os próximos meses deste grupo` : `“${l.descricao || l.categoria}”`;
      if (!confirm(`Excluir ${alvo}? Esta ação não pode ser desfeita.${l.grupo && !proximos ? '\n\nDica: para excluir também os meses seguintes, marque “Este e os próximos”.' : ''}`)) return;
      const qtd = F.excluirLancamento(l, escopo());
      Fin.ui.closeModal();
      Fin.ui.toast(qtd > 1 ? `${qtd} lançamentos excluídos.` : 'Lançamento excluído.');
      Fin.router.refresh();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const erro = form.querySelector('#form-erro');
      const tipo = form.querySelector('input[name="tipo"]:checked').value;
      const valorPrevisto = P.toNumber(el('valorPrevisto').value);
      const status = el('status').value;
      const valorPago = status === 'aberto' ? (l?.valorPago ?? null) : P.toNumber(el('valorPago').value);
      const vencimento = el('vencimento').value || null;
      const categoria = el('categoria').value;

      const problemas = [];
      if (!el('descricao').value.trim()) problemas.push('a descrição');
      if (valorPrevisto === null || valorPrevisto <= 0) problemas.push('um valor maior que zero');
      if (!categoria || categoria === NOVA) problemas.push('a categoria');
      if (!vencimento) problemas.push('o vencimento');
      if (status !== 'aberto' && (valorPago === null || valorPago <= 0)) problemas.push('o valor pago');
      const repeticao = el('repeticao')?.value || 'nao';
      const vezes = Number(el('vezes')?.value);
      if (repeticao !== 'nao' && !(vezes >= 2 && vezes <= 120)) problemas.push('a quantidade de meses (2 a 120)');
      if (problemas.length) {
        erro.textContent = `Informe ${problemas.join(', ')}.`;
        erro.classList.remove('hidden');
        return;
      }

      const cat = F.categorias().find((c) => c.nome === categoria);
      const forma = F.formasPagamento().find((f) => f.nome === el('formaPagamento').value.trim());
      // Campos que fazem sentido repetir nos próximos meses de um grupo.
      const comuns = {
        tipo,
        descricao: el('descricao').value.trim(),
        categoria,
        categoriaIcone: cat?.icone ?? l?.categoriaIcone ?? null,
        valorPrevisto,
        formaPagamento: el('formaPagamento').value.trim() || null,
        formaPagamentoIcone: forma?.icone ?? null,
        observacao: el('observacao').value.trim() || null,
      };
      const dados = {
        ...(l ? { id: l.id } : { origem: 'app' }),
        ...comuns,
        valorPago,
        status,
        vencimento,
        data: el('data').value || vencimento,
        dataPagamento: status === 'aberto' ? (l?.dataPagamento ?? null) : el('dataPagamento').value || hoje,
        competencia: el('competencia').value || vencimento.slice(0, 7),
      };

      let msg;
      if (l) {
        Fin.storage.upsert('lancamentos', dados);
        if (l.grupo && escopo() === 'proximos') {
          // Parcelado: o valor digitado é o da parcela; vale igual para as próximas.
          F.atualizarProximos(l, comuns);
          msg = 'Lançamento e próximos meses atualizados.';
        } else msg = 'Lançamento atualizado.';
      } else if (repeticao !== 'nao') {
        F.criarRepetidos(dados, repeticao, vezes);
        msg = repeticao === 'parcelado' ? `Criado em ${vezes} parcelas.` : `Lançamento fixo criado para ${vezes} meses.`;
      } else {
        Fin.storage.upsert('lancamentos', dados);
        msg = 'Lançamento criado.';
      }

      Fin.ui.closeModal();
      Fin.ui.toast(msg);
      if (!l && dados.competencia !== Fin.state.mes) Fin.state.mes = dados.competencia;
      Fin.router.refresh();
    });
  }

  /** Pergunta o nome, cria a categoria e já a seleciona no <select>. */
  function novaCategoria(sel, tipo) {
    const nome = (prompt(`Nome da nova categoria de ${tipo}:`) || '').trim();
    if (!nome) { sel.value = ''; return; }
    const { icone, nome: limpo } = P.splitEmoji(nome);
    const existe = F.categorias(tipo).find((c) => P.normalize(c.nome) === P.normalize(limpo));
    if (!existe) Fin.storage.upsert('categorias', { nome: limpo, icone, tipo, classificacao: null, orcamentoMensal: 0 });
    sel.innerHTML = categoriaOptions(tipo, existe ? existe.nome : limpo);
  }

  Fin.forms.categoriaOptions = categoriaOptions;
  Fin.forms.novaCategoria = novaCategoria;
  Fin.forms.NOVA_CATEGORIA = NOVA;

  return { open };
})();
