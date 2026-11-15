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
                ${l.recorrencia === 'fixo' ? `Recorrente · mês <b>${l.parcela?.atual}/${l.parcela?.total}</b>` : `Parcela <b>${l.parcela?.atual}/${l.parcela?.total}</b>`}</p>
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
            <label class="field"><span id="lbl-valor">Valor lançado (R$) *</span>
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
          <!-- Recorrência (só em lançamento novo): aluguel, água, luz… -->
          <section class="rounded-2xl border border-slate-200 p-3 space-y-3" aria-labelledby="rec-titulo">
            <label class="flex items-center gap-3 cursor-pointer">
              <span class="flex-1 min-w-0">
                <span id="rec-titulo" class="block text-sm font-semibold">🔁 Recorrente</span>
                <span class="block text-xs text-slate-500">Repete todo mês — ex.: aluguel, água, luz</span>
              </span>
              <input type="checkbox" name="recorrente" class="toggle" role="switch" />
            </label>
            <div id="rep-box" class="hidden space-y-3">
              <div class="seg seg-neutro" role="radiogroup" aria-label="Valor de cada mês">
                <label><input type="radio" name="repeticao" value="fixo" checked><span>Mesmo valor todo mês</span></label>
                <label><input type="radio" name="repeticao" value="parcelado"><span>Parcelar o total</span></label>
              </div>
              <div class="seg seg-neutro" role="radiogroup" aria-label="Até quando repetir">
                <label><input type="radio" name="ateModo" value="vezes" checked><span>Nº de vezes</span></label>
                <label><input type="radio" name="ateModo" value="ate"><span>Até mês/ano</span></label>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <label class="field" data-ate="vezes"><span>Quantas vezes (meses)</span>
                  <input name="vezes" type="number" inputmode="numeric" min="2" max="120" value="12" class="input" /></label>
                <label class="field hidden" data-ate="ate"><span>Repetir até</span>
                  <input name="ate" type="month" class="input" /></label>
                <div class="flex flex-wrap items-end gap-1.5" data-atalhos>
                  <button type="button" data-ate-fim-ano class="chip !py-1.5 !text-xs">Até dezembro</button>
                  <button type="button" data-ate-12 class="chip !py-1.5 !text-xs">12 meses</button>
                </div>
              </div>
              <p id="rep-resumo" class="text-xs text-slate-700 bg-emerald-50 rounded-lg px-3 py-2" aria-live="polite"></p>
            </div>
          </section>`}

          <!-- Pagamento efetivado: separado do valor lançado (o lançado nunca é alterado aqui) -->
          <section class="rounded-2xl border border-slate-200 p-3 space-y-3" aria-labelledby="pg-titulo">
            <div class="flex items-center justify-between gap-2">
              <h3 id="pg-titulo" class="text-sm font-semibold">💸 <span data-pg-titulo>Pagamento</span></h3>
              <span id="pg-situacao" class="text-xs text-right"></span>
            </div>
            <div class="seg seg-3" role="radiogroup" aria-label="Situação do pagamento">
              <label><input type="radio" name="status" value="aberto" ${!['pago', 'parcial'].includes(v.status) ? 'checked' : ''}><span data-rot="aberto">Em aberto</span></label>
              <label><input type="radio" name="status" value="pago" ${v.status === 'pago' ? 'checked' : ''}><span data-rot="pago">Pago</span></label>
              <label><input type="radio" name="status" value="parcial" ${v.status === 'parcial' ? 'checked' : ''}><span>Parcial</span></label>
            </div>
            <div id="pago-fields" class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <label class="field"><span data-rot="data">Data do pagamento</span>
                  <input name="dataPagamento" type="date" class="input" value="${v.dataPagamento || ''}" /></label>
                <label class="field"><span data-rot="valor">Valor pago (R$)</span>
                  <input name="valorPago" class="input tabular-nums" inputmode="decimal" value="${fmt.decimalInput(v.valorPago)}" placeholder="0,00" /></label>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <button type="button" data-usar-lancado class="text-xs font-semibold text-emerald-700 hover:underline">Usar o valor lançado</button>
                <span id="pg-diff" class="text-xs ml-auto"></span>
              </div>
            </div>
            <label class="field"><span>Forma de pagamento</span>
              <input name="formaPagamento" class="input" list="formas-list" value="${esc(v.formaPagamento)}" placeholder="PIX, Boleto, Débito…" />
              <datalist id="formas-list">${formas.map((f) => `<option value="${esc(f.nome)}"></option>`).join('')}</datalist></label>
          </section>

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

    const tipoAtual = () => form.querySelector('input[name="tipo"]:checked').value;
    const dias = (a, b) => Math.round((new Date(`${b}T00:00`) - new Date(`${a}T00:00`)) / 86400000);

    /** Textos de receita/despesa (Pago × Recebido) e situação/diferença ao vivo. */
    const atualizarPagamento = () => {
      const rec = tipoAtual() === 'receita';
      const st = el('status').value;
      form.querySelector('[data-pg-titulo]').textContent = rec ? 'Recebimento' : 'Pagamento';
      form.querySelector('[data-rot="aberto"]').textContent = rec ? 'A receber' : 'Em aberto';
      form.querySelector('[data-rot="pago"]').textContent = rec ? 'Recebido' : 'Pago';
      form.querySelector('[data-rot="data"]').textContent = rec ? 'Data do recebimento' : 'Data do pagamento';
      form.querySelector('[data-rot="valor"]').textContent = rec ? 'Valor recebido (R$)' : 'Valor pago (R$)';
      form.querySelector('#pago-fields').classList.toggle('hidden', st === 'aberto');

      const lancado = P.toNumber(el('valorPrevisto').value);
      const pago = P.toNumber(el('valorPago').value);
      const venc = el('vencimento').value;
      const dpg = el('dataPagamento').value;
      const sit = form.querySelector('#pg-situacao');
      const diff = form.querySelector('#pg-diff');
      sit.innerHTML = '';
      diff.innerHTML = '';

      if (st === 'aberto') {
        if (venc) {
          const d = dias(hoje, venc);
          sit.innerHTML = d < 0 ? `<span class="text-rose-700 font-medium">! vencido há ${-d} dia${d === -1 ? '' : 's'}</span>`
            : d === 0 ? '<span class="text-amber-800 font-medium">vence hoje</span>'
            : `<span class="text-slate-500">vence em ${d} dia${d === 1 ? '' : 's'}</span>`;
        }
        return;
      }
      if (venc && dpg) {
        const atraso = dias(venc, dpg);
        sit.innerHTML = atraso > 0 ? `<span class="text-amber-800 font-medium">◷ ${rec ? 'recebido' : 'pago'} ${atraso} dia${atraso === 1 ? '' : 's'} após o vencimento</span>`
          : `<span class="text-emerald-800">✓ ${rec ? 'recebido' : 'pago'} em dia</span>`;
      }
      if (lancado == null || pago == null) return;
      const dif = Math.round((pago - lancado) * 100) / 100;
      if (st === 'parcial') {
        diff.innerHTML = pago < lancado ? `<span class="text-amber-800">Falta ${fmt.brl(lancado - pago)}</span>`
          : '<span class="text-rose-700">Valor ≥ lançado: marque “Pago”</span>';
      } else if (Math.abs(dif) < 0.01) {
        diff.innerHTML = '<span class="text-emerald-800">✓ igual ao lançado</span>';
      } else if (dif > 0) {
        diff.innerHTML = `<span class="text-amber-800">＋${fmt.brl(dif)} ${rec ? 'a mais' : 'a mais (juros/multa)'}</span>`;
      } else {
        diff.innerHTML = `<span class="text-emerald-800">−${fmt.brl(-dif)} ${rec ? 'a menos' : '(desconto)'}</span>`;
      }
    };

    const syncPago = () => {
      const st = el('status').value;
      if (st !== 'aberto') {
        if (!el('valorPago').value && st === 'pago') el('valorPago').value = el('valorPrevisto').value;
        if (!el('dataPagamento').value) el('dataPagamento').value = hoje;
      }
      atualizarPagamento();
    };
    syncPago();
    form.addEventListener('input', (e) => {
      if (['valorPrevisto', 'valorPago', 'dataPagamento', 'vencimento'].includes(e.target.name)) atualizarPagamento();
    });
    form.querySelector('[data-usar-lancado]').addEventListener('click', () => {
      el('valorPago').value = el('valorPrevisto').value;
      atualizarPagamento();
    });

    // Recorrência (só em lançamento novo): por nº de vezes ou até um mês/ano, com resumo ao vivo.
    const MAX_MESES = 120;
    const mesInicio = () => el('competencia').value || (el('vencimento').value || '').slice(0, 7);
    const mesesAte = (a, b) => {
      const [y1, m1] = a.split('-').map(Number);
      const [y2, m2] = b.split('-').map(Number);
      return (y2 - y1) * 12 + (m2 - m1) + 1;
    };
    const dezembro = (ini) => `${Number(ini.slice(0, 4)) + (ini.endsWith('-12') ? 1 : 0)}-12`;
    /** { modo: 'nao'|'fixo'|'parcelado', n, erro } */
    const recorrencia = () => {
      if (!el('recorrente')?.checked) return { modo: 'nao' };
      const modo = el('repeticao').value;
      const ini = mesInicio();
      let n;
      if (el('ateModo').value === 'ate') {
        if (!el('ate').value) return { modo, erro: 'Escolha até qual mês repetir.' };
        if (!ini) return { modo, erro: 'Informe o vencimento.' };
        n = mesesAte(ini, el('ate').value);
        if (n < 2) return { modo, erro: `Escolha um mês depois de ${fmt.monthShort(ini)}.` };
      } else {
        n = Math.trunc(Number(el('vezes').value));
        if (!(n >= 2)) return { modo, erro: 'Repita pelo menos 2 vezes.' };
      }
      if (n > MAX_MESES) return { modo, n, erro: `Máximo de ${MAX_MESES} meses (10 anos).` };
      return { modo, n };
    };

    const syncRepeticao = () => {
      if (!el('recorrente')) return;
      const r = recorrencia();
      const ligado = r.modo !== 'nao';
      form.querySelector('#rep-box').classList.toggle('hidden', !ligado);
      form.querySelector('#lbl-valor').textContent = r.modo === 'parcelado' ? 'Valor total (R$) *' : 'Valor lançado (R$) *';
      const porAte = el('ateModo').value === 'ate';
      form.querySelector('[data-ate="vezes"]').classList.toggle('hidden', porAte);
      form.querySelector('[data-ate="ate"]').classList.toggle('hidden', !porAte);
      if (mesInicio()) form.querySelector('[data-ate-fim-ano]').textContent = `Até ${fmt.monthShort(dezembro(mesInicio()))}`;
      if (!ligado) return;
      const resumo = form.querySelector('#rep-resumo');
      resumo.classList.toggle('bg-emerald-50', !r.erro);
      resumo.classList.toggle('bg-rose-50', !!r.erro);
      resumo.classList.toggle('text-rose-700', !!r.erro);
      if (r.erro) { resumo.textContent = `! ${r.erro}`; return; }
      const valor = P.toNumber(el('valorPrevisto').value);
      const ini = mesInicio();
      if (!valor || !ini) { resumo.textContent = 'Informe valor e vencimento para ver o resumo.'; return; }
      const de = `de ${fmt.monthShort(ini)} a ${fmt.monthShort(fmt.addMonths(ini, r.n - 1))}`;
      const dia = Number((el('vencimento').value || '').slice(8, 10));
      resumo.innerHTML = r.modo === 'parcelado'
        ? `<b>${r.n}x</b> de ${fmt.brl(Math.trunc((valor * 100) / r.n) / 100)} — ${de}.`
        : `<b>${r.n} lançamentos</b> de ${fmt.brl(valor)}, ${de}${dia ? `, vencendo todo dia ${dia}` : ''} (${fmt.brl(valor * r.n)} no total).`
          + '<br><span class="text-slate-500">Conta que muda de valor (água, luz): ajuste o mês quando ela chegar e escolha “Só este”.</span>';
    };
    form.addEventListener('input', syncRepeticao);
    form.querySelector('[data-ate-fim-ano]')?.addEventListener('click', () => {
      const ini = mesInicio();
      if (!ini) return;
      form.querySelector('input[name="ateModo"][value="ate"]').checked = true;
      el('ate').value = dezembro(ini);
      syncRepeticao();
    });
    form.querySelector('[data-ate-12]')?.addEventListener('click', () => {
      form.querySelector('input[name="ateModo"][value="vezes"]').checked = true;
      el('vezes').value = 12;
      syncRepeticao();
    });
    syncRepeticao();

    form.addEventListener('change', (e) => {
      const n = e.target.name;
      if (n === 'ateModo' && e.target.value === 'ate' && !el('ate').value && mesInicio()) el('ate').value = dezembro(mesInicio());
      if (['recorrente', 'repeticao', 'ateModo', 'ate', 'vezes', 'vencimento', 'competencia'].includes(n)) setTimeout(syncRepeticao);
      if (n === 'tipo') { el('categoria').innerHTML = categoriaOptions(e.target.value, el('categoria').value); atualizarPagamento(); }
      if (n === 'status') syncPago();
      if (n === 'vencimento' || n === 'dataPagamento') atualizarPagamento();
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
      if (status === 'parcial' && valorPago != null && valorPrevisto != null && valorPago >= valorPrevisto) {
        problemas.push('um valor pago menor que o lançado (ou marque “Pago”)');
      }
      const rec = l ? { modo: 'nao' } : recorrencia();
      const repeticao = rec.modo;
      const vezes = rec.n;
      if (rec.erro) problemas.push(`a recorrência (${rec.erro.replace(/\.$/, '').toLowerCase()})`);
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
        msg = repeticao === 'parcelado' ? `Criado em ${vezes} parcelas.`
          : `Recorrente criado: ${vezes} meses, até ${fmt.monthShort(fmt.addMonths(dados.competencia, vezes - 1))}.`;
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
