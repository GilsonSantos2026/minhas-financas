/**
 * investimentos/formularios.js — Janelas da aba Investimentos.
 *
 *  Fin.forms.inv.conta(id?)          corretora (Rico, Nomad) ou conta-saldo (reserva, previdência)
 *  Fin.forms.inv.mov({ id?, conta?, ativo?, tipo? })   compra, venda, provento, aporte…
 *  Fin.forms.inv.ativo(id)           ticker, classe, preço atual; excluir
 *  Fin.forms.inv.precos()            atualizar os preços de todos os ativos de uma vez
 *  Fin.forms.inv.carga(contaId)      posição inicial colando uma lista (TICKER QTD PREÇO)
 *  Fin.forms.inv.meta(id?)           metas (patrimônio, classes, proventos, conta)
 *  Fin.forms.inv.alocacao()          % ideal por classe
 *  Fin.forms.inv.foto(ym?)           patrimônio de um mês passado (ex.: copiado do Investidor 10)
 */
window.Fin = window.Fin || {};
Fin.forms = Fin.forms || {};

Fin.forms.inv = (() => {
  const fmt = Fin.fmt;
  const esc = fmt.esc;
  const S = Fin.storage;
  const I = () => Fin.inv;

  /** Número digitado (aceita "1.234,56", "0,0234", "12.5", "US$ 3,10"), sem arredondar. */
  function num(v) {
    if (v == null) return null;
    let s = String(v).trim().replace(/US\$|R\$|\s| /g, '');
    if (!s) return null;
    if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
    else if ((s.match(/\./g) || []).length > 1) s = s.replace(/\./g, '');
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }
  const numInput = (v) => (v == null || v === '' ? '' : String(v).replace('.', ','));

  function modal(titulo, corpo, { excluir = false, salvar = 'Salvar' } = {}) {
    const panel = Fin.ui.openModal(`
      <form novalidate class="inv-form">
        <div class="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 class="font-semibold text-lg">${titulo}</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <div class="px-5 py-4 space-y-4">${corpo}
          <p data-erro class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
        </div>
        <div class="flex items-center gap-2 px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
          ${excluir ? '<button type="button" data-delete class="btn btn-danger-ghost">Excluir</button>' : ''}
          <span class="flex-1"></span>
          <button type="button" data-close class="btn btn-ghost">Cancelar</button>
          <button type="submit" class="btn btn-primary">${salvar}</button>
        </div>
      </form>`, titulo);
    panel.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', Fin.ui.closeModal));
    const form = panel.querySelector('form');
    const erro = (msg) => { const e = form.querySelector('[data-erro]'); e.textContent = msg; e.classList.remove('hidden'); return false; };
    return { panel, form, el: (n) => form.elements[n], erro };
  }

  const concluir = (msg) => { Fin.ui.closeModal(); Fin.ui.toast(msg); Fin.router.refresh(); };
  const opt = (v, r, cur) => `<option value="${esc(v)}" ${String(v) === String(cur ?? '') ? 'selected' : ''}>${esc(r)}</option>`;
  const classesOptions = (cur) => I().CLASSES.map((c) => opt(c.id, `${c.icone} ${c.nome}`, cur)).join('');

  /* ---------------- Conta ---------------- */

  function conta(id = null) {
    const c = id ? I().conta(id) : null;
    const usos = c ? I().movs().filter((m) => m.conta === c.id).length : 0;
    const { panel, form, el, erro } = modal(c ? 'Editar conta' : 'Nova conta', `
      <div class="grid grid-cols-[5rem_1fr] gap-3">
        <label class="field"><span>Ícone</span><input name="icone" class="input text-center text-xl" maxlength="8" value="${esc(c?.icone || '')}" placeholder="🏦"></label>
        <label class="field"><span>Nome *</span><input name="nome" class="input" maxlength="40" value="${esc(c?.nome || '')}" placeholder="Ex.: Rico, Nomad, Previdência"></label>
      </div>
      <fieldset class="field"><legend class="text-sm font-medium text-slate-700 mb-1">Tipo</legend>
        <div class="seg">
          <label><input type="radio" name="tipo" value="corretora" ${c?.tipo !== 'saldo' ? 'checked' : ''}><span>Corretora (ativos)</span></label>
          <label><input type="radio" name="tipo" value="saldo" ${c?.tipo === 'saldo' ? 'checked' : ''}><span>Pelo saldo</span></label>
        </div></fieldset>
      <p class="text-xs text-slate-500 -mt-2" data-dica></p>
      <label class="field" data-g="corretora"><span>Moeda dos ativos</span>
        <select name="moeda" class="input">${opt('BRL', 'Real (R$) — B3', c?.moeda)}${opt('USD', 'Dólar (US$) — exterior', c?.moeda)}</select></label>
      <label class="field" data-g="saldo"><span>Classe</span>
        <select name="classe" class="input">${classesOptions(c?.classe || 'reserva')}</select></label>
      ${c && usos ? `<p class="text-xs text-slate-500">${usos} movimentações nesta conta.</p>` : ''}`, { excluir: !!c });
    const sync = () => {
      const t = form.querySelector('[name=tipo]:checked').value;
      form.querySelectorAll('[data-g]').forEach((g) => g.classList.toggle('hidden', g.dataset.g !== t));
      form.querySelector('[data-dica]').textContent = t === 'corretora'
        ? 'Guarda ativos com quantidade e preço (ações, FIIs, stocks, ETFs…).'
        : 'Você informa aportes, resgates e o saldo de tempos em tempos (reserva, previdência, CDB…).';
    };
    form.querySelectorAll('[name=tipo]').forEach((r) => r.addEventListener('change', sync));
    sync();
    panel.querySelector('[data-delete]')?.addEventListener('click', () => {
      if (!confirm(`Excluir a conta “${c.nome}”${usos ? ` e as ${usos} movimentações dela` : ''}? Não dá para desfazer.`)) return;
      I().excluirConta(c.id);
      concluir('Conta excluída.');
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = el('nome').value.trim();
      if (!nome) return erro('Informe o nome.');
      if (I().contas().some((k) => k.id !== c?.id && Fin.parsers.normalize(k.nome) === Fin.parsers.normalize(nome))) return erro('Já existe uma conta com esse nome.');
      const tipo = form.querySelector('[name=tipo]:checked').value;
      if (c && c.tipo !== tipo && usos) return erro('Esta conta já tem movimentações: não dá para trocar o tipo.');
      S.upsert('invContas', {
        ...(c ? { id: c.id } : {}), nome, icone: el('icone').value.trim() || null, tipo,
        moeda: tipo === 'corretora' ? el('moeda').value : 'BRL',
        classe: tipo === 'saldo' ? el('classe').value : null,
      });
      concluir(c ? 'Conta atualizada.' : 'Conta criada.');
    });
  }

  /* ---------------- Movimentação ---------------- */

  const G = {
    ativo: ['inicial', 'compra', 'venda', 'provento', 'desdobramento', 'grupamento', 'bonificacao'],
    qtd: ['inicial', 'compra', 'venda', 'bonificacao'],
    preco: ['inicial', 'compra', 'venda', 'bonificacao'],
    taxas: ['compra', 'venda'],
    valor: ['provento', 'aporte', 'resgate', 'saldo'],
    fator: ['desdobramento', 'grupamento'],
    subtipo: ['provento'],
    cambio: ['inicial', 'compra', 'venda', 'provento', 'bonificacao'],
  };
  const TIPOS_CORRETORA = ['compra', 'venda', 'provento', 'inicial', 'desdobramento', 'grupamento', 'bonificacao'];
  const TIPOS_SALDO = ['aporte', 'resgate', 'saldo'];

  function mov({ id = null, conta: contaId = null, ativo: ativoId = null, tipo = null } = {}) {
    const m = id ? I().movs().find((x) => x.id === id) : null;
    const contas = I().contas();
    if (!contas.length) return Fin.ui.toast('Crie uma conta primeiro (ex.: Rico ou Nomad).', 'error');
    const a0 = I().ativo(m?.ativo || ativoId);
    let cId = m?.conta || a0?.conta || contaId || contas[0].id;
    const { panel, form, el, erro } = modal(m ? 'Editar movimentação' : 'Nova movimentação', `
      <div class="grid grid-cols-2 gap-3">
        <label class="field"><span>Conta</span><select name="conta" class="input">${contas.map((c) => opt(c.id, `${c.icone ? `${c.icone} ` : ''}${c.nome}`, cId)).join('')}</select></label>
        <label class="field"><span>Tipo</span><select name="tipo" class="input"></select></label>
      </div>
      <div data-g="ativo" class="grid grid-cols-2 gap-3">
        <label class="field col-span-2 sm:col-span-1"><span>Ativo (ticker) *</span>
          <input name="ticker" class="input uppercase" list="inv-tickers" autocomplete="off" maxlength="16" value="${esc(a0?.ticker || '')}" placeholder="Ex.: MXRF11, VOO">
          <datalist id="inv-tickers"></datalist></label>
        <label class="field col-span-2 sm:col-span-1" data-novo><span>Classe do ativo novo</span><select name="classe" class="input">${classesOptions()}</select></label>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <label class="field"><span data-rot-data>Data</span><input name="data" type="date" class="input" value="${m?.data || fmt.todayISO()}"></label>
        <label class="field" data-g="subtipo"><span>Provento</span><select name="subtipo" class="input">
          ${opt('dividendo', 'Dividendo', m?.subtipo)}${opt('jcp', 'JCP', m?.subtipo)}${opt('rendimento', 'Rendimento (FII)', m?.subtipo)}${opt('outro', 'Outro', m?.subtipo)}</select></label>
        <label class="field" data-g="fator"><span>Proporção: 1 para</span><input name="fator" class="input tabular-nums" inputmode="decimal" value="${numInput(m?.fator)}" placeholder="Ex.: 4"></label>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <label class="field" data-g="qtd"><span>Quantidade *</span><input name="qtd" class="input tabular-nums" inputmode="decimal" value="${numInput(m?.qtd)}" placeholder="0"></label>
        <label class="field" data-g="preco"><span data-rot-preco>Preço *</span><input name="preco" class="input tabular-nums" inputmode="decimal" value="${numInput(m?.preco)}" placeholder="0,00"></label>
        <label class="field" data-g="taxas"><span>Taxas</span><input name="taxas" class="input tabular-nums" inputmode="decimal" value="${numInput(m?.taxas)}" placeholder="0,00"></label>
      </div>
      <label class="field" data-g="valor"><span data-rot-valor>Valor *</span><input name="valor" class="input tabular-nums" inputmode="decimal" value="${numInput(m?.valor)}" placeholder="0,00"></label>
      <div data-g="cambio" class="bg-sky-50 rounded-xl p-3 space-y-1">
        <label class="field"><span>Câmbio (R$ por US$)</span><input name="cambio" class="input tabular-nums" inputmode="decimal" value="${numInput(m?.cambio)}" placeholder="Buscando PTAX…"></label>
        <p class="text-xs text-slate-500" data-cambio-info>PTAX de venda do Banco Central na data (pode corrigir).</p>
      </div>
      <p class="text-sm text-slate-600 tabular-nums" data-total></p>
      <label class="field"><span>Observação</span><input name="obs" class="input" maxlength="120" value="${esc(m?.obs || '')}" placeholder="Opcional"></label>
      <p class="text-xs text-slate-500" data-dica-inicial>“Posição inicial”: o que você já tinha antes de usar o app — quantidade atual e preço médio. Não conta como aporte do mês.</p>`, { excluir: !!m });

    const contaAtual = () => I().conta(el('conta').value);
    const moeda = () => contaAtual()?.moeda || 'BRL';
    const sigla = () => (moeda() === 'USD' ? 'US$' : 'R$');
    let cambioManual = !!m?.cambio;

    const preencherTipos = () => {
      const c = contaAtual();
      const lista = c?.tipo === 'saldo' ? TIPOS_SALDO : TIPOS_CORRETORA;
      const atual = el('tipo').value || m?.tipo || tipo;
      el('tipo').innerHTML = lista.map((t) => opt(t, `${I().TIPOS[t].icone} ${I().TIPOS[t].nome}`, lista.includes(atual) ? atual : lista[0])).join('');
      panel.querySelector('#inv-tickers').innerHTML = I().ativos().filter((a) => a.conta === c?.id)
        .sort((a, b) => a.ticker.localeCompare(b.ticker)).map((a) => `<option value="${esc(a.ticker)}"></option>`).join('');
    };

    const buscarCambio = async () => {
      if (cambioManual || moeda() !== 'USD' || !G.cambio.includes(el('tipo').value)) return;
      const d = el('data').value;
      const info = form.querySelector('[data-cambio-info]');
      if (!d) return;
      info.textContent = 'Buscando a PTAX…';
      try {
        const v = await Fin.cotacoes.ptax(d);
        if (cambioManual || el('data').value !== d) return;
        el('cambio').value = numInput(v);
        info.textContent = `PTAX de venda de ${fmt.date(d)} (ou último dia útil antes). Pode corrigir.`;
      } catch {
        const dol = I().dolarAtual();
        if (dol && !el('cambio').value) el('cambio').value = numInput(dol);
        info.textContent = 'Não consegui a PTAX agora (sem internet?). Informe o câmbio do dia.';
      }
      atualizar();
    };

    const atualizar = () => {
      const t = el('tipo').value;
      const c = contaAtual();
      for (const [g, tipos] of Object.entries(G)) {
        const vis = tipos.includes(t) && (g !== 'cambio' || moeda() === 'USD');
        form.querySelectorAll(`[data-g="${g}"]`).forEach((x) => x.classList.toggle('hidden', !vis));
      }
      form.querySelector('[data-dica-inicial]').classList.toggle('hidden', t !== 'inicial');
      const tk = el('ticker').value.trim().toUpperCase();
      const existe = I().ativos().some((a) => a.conta === c?.id && a.ticker === tk);
      form.querySelector('[data-novo]').classList.toggle('hidden', !tk || existe || c?.tipo === 'saldo');
      if (tk && !existe) el('classe').value = el('classe').dataset.mexido ? el('classe').value : I().sugerirClasse(tk, c);
      form.querySelector('[data-rot-preco]').textContent = `${t === 'inicial' ? 'Preço médio' : 'Preço'} (${sigla()}) *`;
      form.querySelector('[data-rot-valor]').textContent = t === 'provento' ? `Valor líquido recebido (${sigla()}) *`
        : t === 'saldo' ? 'Saldo na data (R$) *' : `Valor (R$) *`;
      form.querySelector('[data-rot-data]').textContent = t === 'provento' ? 'Data do pagamento' : t === 'inicial' ? 'Data de referência' : 'Data';
      // total
      const q = num(el('qtd').value) || 0;
      const p = num(el('preco').value) || 0;
      const tx = num(el('taxas').value) || 0;
      const cb = num(el('cambio').value) || 0;
      let total = '';
      if (G.qtd.includes(t) && q && p) {
        const v = t === 'venda' ? q * p - tx : q * p + (G.taxas.includes(t) ? tx : 0);
        total = `Total: <b>${fmt.moeda(v, moeda())}</b>${moeda() === 'USD' && cb ? ` ≈ ${fmt.brl(v * cb)}` : ''}`;
      } else if (t === 'provento' && moeda() === 'USD' && cb && num(el('valor').value)) {
        total = `≈ ${fmt.brl(num(el('valor').value) * cb)}`;
      }
      form.querySelector('[data-total]').innerHTML = total;
    };

    preencherTipos();
    atualizar();
    buscarCambio();
    el('conta').addEventListener('change', () => { preencherTipos(); atualizar(); buscarCambio(); });
    el('tipo').addEventListener('change', () => { atualizar(); buscarCambio(); });
    el('data').addEventListener('change', () => { cambioManual = false; buscarCambio(); });
    el('cambio').addEventListener('input', () => { cambioManual = true; atualizar(); });
    el('classe').addEventListener('change', () => { el('classe').dataset.mexido = '1'; });
    ['ticker', 'qtd', 'preco', 'taxas', 'valor'].forEach((n) => el(n).addEventListener('input', atualizar));

    panel.querySelector('[data-delete]')?.addEventListener('click', () => {
      if (!confirm('Excluir esta movimentação?')) return;
      S.remove('invMovs', m.id);
      concluir('Movimentação excluída.');
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const t = el('tipo').value;
      const c = contaAtual();
      const data = el('data').value;
      if (!data) return erro('Informe a data.');
      const d = { conta: c.id, tipo: t, data, obs: el('obs').value.trim() || null, ativo: null, qtd: null, preco: null, taxas: null, valor: null, fator: null, cambio: null, subtipo: null };
      if (G.ativo.includes(t)) {
        const tk = el('ticker').value.trim().toUpperCase();
        if (!tk) return erro('Informe o ticker do ativo.');
        if (!/^[A-Z0-9.\-^]{1,16}$/.test(tk)) return erro('Ticker inválido.');
        if (t !== 'inicial' && t !== 'compra' && t !== 'bonificacao' && !I().ativos().some((a) => a.conta === c.id && a.ticker === tk)) {
          return erro(`“${tk}” ainda não está nesta conta. Lance primeiro a compra ou a posição inicial.`);
        }
      }
      if (G.qtd.includes(t)) {
        d.qtd = num(el('qtd').value);
        d.preco = num(el('preco').value);
        if (!(d.qtd > 0)) return erro('Informe a quantidade.');
        if (d.preco == null || d.preco < 0) return erro('Informe o preço.');
      }
      if (G.taxas.includes(t)) { d.taxas = num(el('taxas').value) || 0; if (d.taxas < 0) return erro('Taxas não podem ser negativas.'); }
      if (G.valor.includes(t)) { d.valor = num(el('valor').value); if (d.valor == null || d.valor < 0 || (t !== 'saldo' && !(d.valor > 0))) return erro('Informe o valor.'); }
      if (G.fator.includes(t)) { d.fator = num(el('fator').value); if (!(d.fator > 0)) return erro('Informe a proporção (ex.: 4 para “1 para 4”).'); }
      if (G.subtipo.includes(t)) d.subtipo = el('subtipo').value;
      if (G.cambio.includes(t) && moeda() === 'USD') { d.cambio = num(el('cambio').value); if (!(d.cambio > 0)) return erro('Informe o câmbio (R$ por US$).'); }
      if (G.ativo.includes(t)) {
        const a = I().obterAtivo(c.id, el('ticker').value, el('classe').value);
        d.ativo = a.id;
        if (t === 'venda') {
          const p = I().posicoes(data).find((x) => x.ativo.id === a.id);
          const qtdAntes = (p?.qtd || 0) + (m?.tipo === 'venda' && m.ativo === a.id ? m.qtd : 0);
          if (d.qtd > qtdAntes + 1e-9) return erro(`Você tinha ${fmt.qtd(qtdAntes)} ${a.ticker} nessa data.`);
        }
        if (!(a.preco > 0) && d.preco > 0 && (t === 'compra' || t === 'inicial')) S.upsert('invAtivos', { id: a.id, preco: d.preco, precoEm: data });
        // Desdobramento/grupamento novo: o preço guardado (de antes do evento) acompanha a proporção.
        if (!m && (t === 'desdobramento' || t === 'grupamento') && a.preco > 0 && (a.precoEm || '') <= data) {
          S.upsert('invAtivos', { id: a.id, preco: t === 'desdobramento' ? a.preco / d.fator : a.preco * d.fator });
        }
      }
      S.upsert('invMovs', { ...(m ? { id: m.id } : {}), ...d, origem: m?.origem || 'manual' });
      concluir(m ? 'Movimentação atualizada.' : `${I().TIPOS[t].nome} registrada.`);
    });
  }

  /* ---------------- Ativo ---------------- */

  function ativo(id) {
    const a = I().ativo(id);
    if (!a) return;
    const c = I().conta(a.conta);
    const p = I().posicoes().find((x) => x.ativo.id === id);
    const n = I().movs().filter((m) => m.ativo === id).length;
    const moeda = p?.moeda || 'BRL';
    const { panel, form, el, erro } = modal(`${esc(a.ticker)} · ${esc(c?.nome || '')}`, `
      <div class="grid grid-cols-2 gap-3">
        <label class="field"><span>Ticker</span><input name="ticker" class="input uppercase" maxlength="16" value="${esc(a.ticker)}"></label>
        <label class="field"><span>Classe</span><select name="classe" class="input">${classesOptions(a.classe)}</select></label>
      </div>
      <label class="field"><span>Nome (opcional)</span><input name="nome" class="input" maxlength="60" value="${esc(a.nome || '')}" placeholder="Ex.: Vanguard S&P 500"></label>
      <div class="grid grid-cols-2 gap-3">
        <label class="field"><span>Preço atual (${moeda === 'USD' ? 'US$' : 'R$'})</span><input name="preco" class="input tabular-nums" inputmode="decimal" value="${numInput(a.preco)}"></label>
        <label class="field"><span>Data do preço</span><input name="precoEm" type="date" class="input" value="${a.precoEm || fmt.todayISO()}"></label>
      </div>
      ${p ? `<div class="bg-slate-50 rounded-xl p-3 text-sm grid grid-cols-2 gap-x-3 gap-y-1 tabular-nums">
        <span class="text-slate-500">Quantidade</span><span class="text-right">${fmt.qtd(p.qtd)}</span>
        <span class="text-slate-500">Preço médio</span><span class="text-right">${fmt.moeda(p.pm, moeda)}</span>
        <span class="text-slate-500">Custo</span><span class="text-right">${fmt.brl(p.custoBRL)}</span>
        <span class="text-slate-500">Valor atual</span><span class="text-right">${fmt.brl(p.valor)}</span>
        <span class="text-slate-500">Proventos</span><span class="text-right">${fmt.brl(p.proventos)}</span>
        ${p.realizado ? `<span class="text-slate-500">Lucro realizado</span><span class="text-right">${fmt.brl(p.realizado)}</span>` : ''}
      </div>` : ''}
      <div class="flex flex-wrap gap-3 text-sm">
        <button type="button" data-novo-mov="compra" class="text-emerald-700 font-semibold hover:underline">＋ Compra</button>
        <button type="button" data-novo-mov="venda" class="text-emerald-700 font-semibold hover:underline">＋ Venda</button>
        <button type="button" data-novo-mov="provento" class="text-emerald-700 font-semibold hover:underline">＋ Provento</button>
        <button type="button" data-ver-movs class="text-slate-500 hover:underline ml-auto">${n} movimentações →</button>
      </div>`, { excluir: true });
    panel.querySelectorAll('[data-novo-mov]').forEach((b) => b.addEventListener('click', () => mov({ ativo: a.id, tipo: b.dataset.novoMov })));
    panel.querySelector('[data-ver-movs]').addEventListener('click', () => {
      Fin.state.invFiltroAtivo = a.id;
      Fin.state.invAba = 'movs';
      Fin.ui.closeModal();
      if (Fin.router.current() === '/investimentos') Fin.router.refresh(); else Fin.router.go('/investimentos');
    });
    panel.querySelector('[data-delete]').addEventListener('click', () => {
      if (!confirm(`Excluir ${a.ticker}${n ? ` e as ${n} movimentações dele` : ''}? Não dá para desfazer.`)) return;
      I().excluirAtivo(a.id);
      concluir('Ativo excluído.');
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const tk = el('ticker').value.trim().toUpperCase();
      if (!/^[A-Z0-9.\-^]{1,16}$/.test(tk)) return erro('Ticker inválido.');
      if (I().ativos().some((x) => x.id !== a.id && x.conta === a.conta && x.ticker === tk)) return erro('Já existe esse ticker nesta conta.');
      const preco = num(el('preco').value);
      if (preco != null && preco < 0) return erro('Preço inválido.');
      S.upsert('invAtivos', { id: a.id, ticker: tk, classe: el('classe').value, nome: el('nome').value.trim() || null, preco, precoEm: preco != null ? el('precoEm').value || fmt.todayISO() : null });
      concluir('Ativo atualizado.');
    });
  }

  /* ---------------- Preços de todos os ativos ---------------- */

  function precos() {
    const pos = I().posicoes().filter((p) => p.qtd > 0).sort((a, b) => (a.conta?.nome || '').localeCompare(b.conta?.nome || '') || a.ativo.ticker.localeCompare(b.ativo.ticker));
    if (!pos.length) return Fin.ui.toast('Nenhum ativo em carteira ainda.', 'error');
    const { form, el } = modal('Atualizar preços', `
      <div class="flex flex-wrap items-center gap-2 bg-emerald-50 rounded-xl p-3 text-sm">
        <span class="flex-1 min-w-[12rem]">${Fin.cotacoes.temChaves() ? 'Cotações automáticas ligadas.' : 'Ligue as cotações automáticas (brapi para B3, Finnhub para EUA).'}</span>
        <button type="button" data-auto class="btn btn-primary !py-1.5">${Fin.cotacoes.temChaves() ? '↻ Atualizar agora' : 'Configurar'}</button>
        <button type="button" data-chaves class="text-emerald-700 font-medium hover:underline">⚙️ Chaves</button>
      </div>
      <p class="text-sm text-slate-500">Ou informe à mão o preço atual de cada ativo (fechamento do dia anterior serve). Campo vazio = mantém o preço guardado.</p>
      <label class="field"><span>Data dos preços</span><input name="data" type="date" class="input" value="${fmt.todayISO()}"></label>
      <ul class="divide-y divide-slate-100">${pos.map((p) => `
        <li class="flex items-center gap-3 py-2">
          <div class="flex-1 min-w-0">
            <div class="font-medium">${esc(p.ativo.ticker)} <span class="text-xs text-slate-400">${esc(p.conta?.nome || '')}</span></div>
            <div class="text-xs text-slate-500">${p.ativo.preco ? `${fmt.moeda(p.ativo.preco, p.moeda)} em ${fmt.date(p.ativo.precoEm)}` : 'sem preço'}</div>
          </div>
          <span class="text-xs text-slate-500">${p.moeda === 'USD' ? 'US$' : 'R$'}</span>
          <input data-preco="${p.ativo.id}" class="input !w-28 tabular-nums text-right" inputmode="decimal" aria-label="Preço de ${esc(p.ativo.ticker)}">
        </li>`).join('')}</ul>`, { salvar: 'Salvar preços' });
    form.querySelector('[data-auto]').addEventListener('click', () => { Fin.ui.closeModal(); atualizarAgora(); });
    form.querySelector('[data-chaves]').addEventListener('click', () => { Fin.ui.closeModal(); cotacoes(); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = el('data').value || fmt.todayISO();
      const mapa = new Map();
      form.querySelectorAll('[data-preco]').forEach((i) => { const v = num(i.value); if (v > 0) mapa.set(i.dataset.preco, v); });
      if (!mapa.size) return Fin.ui.closeModal();
      S.set('invAtivos', I().ativos().map((a) => (mapa.has(a.id) ? { ...a, preco: mapa.get(a.id), precoEm: data } : a)));
      concluir(`${mapa.size} ${mapa.size === 1 ? 'preço atualizado' : 'preços atualizados'}.`);
    });
  }

  /* ---------------- Carga inicial (colar lista) ---------------- */

  function carga(contaId = null) {
    const corretoras = I().contas().filter((c) => c.tipo === 'corretora');
    if (!corretoras.length) return Fin.ui.toast('Crie uma corretora primeiro.', 'error');
    const { form, el, erro } = modal('Carregar posição atual', `
      <p class="text-sm text-slate-600">Cole uma linha por ativo: <b>TICKER  QUANTIDADE  PREÇO MÉDIO</b> (separados por espaço, tab ou ponto e vírgula). Ex.:</p>
      <pre class="bg-slate-50 rounded-lg p-2 text-xs">VOO 0,0147 679,00\nMSFT; 0,37; 410,50\nBBDC4 2 18,49</pre>
      <div class="grid grid-cols-2 gap-3">
        <label class="field"><span>Corretora</span><select name="conta" class="input">${corretoras.map((c) => opt(c.id, c.nome, contaId || corretoras[0].id)).join('')}</select></label>
        <label class="field"><span>Data de referência</span><input name="data" type="date" class="input" value="${fmt.todayISO()}"></label>
      </div>
      <label class="field" data-cambio><span>Câmbio médio (R$ por US$)</span><input name="cambio" class="input tabular-nums" inputmode="decimal" placeholder="Ex.: 5,40"></label>
      <p class="text-xs text-slate-500 -mt-2" data-cambio>Se não souber, use o dólar médio das suas compras; dá para corrigir depois em cada ativo.</p>
      <label class="field"><span>Lista</span><textarea name="lista" rows="8" class="input font-mono text-xs" placeholder="TICKER QTD PREÇO"></textarea></label>
      <p class="text-sm text-slate-600" data-previa></p>`, { salvar: 'Carregar' });
    const moeda = () => I().conta(el('conta').value)?.moeda || 'BRL';
    const ler = () => el('lista').value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => {
      const p = l.split(/[;\t]+|\s+/).filter(Boolean);
      return { linha: l, ticker: (p[0] || '').toUpperCase(), qtd: num(p[1]), preco: num(p[2]) };
    });
    const previa = () => {
      const itens = ler();
      const ok = itens.filter((i) => /^[A-Z0-9.\-^]{1,16}$/.test(i.ticker) && i.qtd > 0 && i.preco >= 0);
      const ruins = itens.length - ok.length;
      form.querySelector('[data-previa]').innerHTML = itens.length
        ? `${ok.length} ativos prontos${ruins ? ` · <span class="text-rose-700">! ${ruins} linhas não entendidas</span>` : ''} · custo ${fmt.moeda(ok.reduce((s, i) => s + i.qtd * i.preco, 0), moeda())}` : '';
      form.querySelectorAll('[data-cambio]').forEach((x) => x.classList.toggle('hidden', moeda() !== 'USD'));
      return { ok, ruins };
    };
    el('lista').addEventListener('input', previa);
    el('conta').addEventListener('change', previa);
    previa();
    if (Fin.inv.dolarAtual()) el('cambio').placeholder = `Ex.: ${numInput(Fin.inv.dolarAtual().toFixed(2))}`;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const { ok, ruins } = previa();
      if (!ok.length) return erro('Nenhuma linha válida. Formato: TICKER QUANTIDADE PREÇO');
      if (ruins && !confirm(`${ruins} linhas não foram entendidas e serão ignoradas. Continuar?`)) return;
      const cId = el('conta').value;
      const cambio = moeda() === 'USD' ? num(el('cambio').value) : null;
      if (moeda() === 'USD' && !(cambio > 0)) return erro('Informe o câmbio médio (R$ por US$).');
      const data = el('data').value || fmt.todayISO();
      const novos = [];
      for (const i of ok) {
        const a = I().obterAtivo(cId, i.ticker);
        if (!(a.preco > 0)) S.upsert('invAtivos', { id: a.id, preco: i.preco, precoEm: data });
        novos.push({ id: S.uid(), criadoEm: new Date().toISOString(), conta: cId, ativo: a.id, tipo: 'inicial', data, qtd: i.qtd, preco: i.preco, taxas: 0, cambio, origem: 'carga' });
      }
      S.set('invMovs', [...S.list('invMovs'), ...novos]);
      concluir(`${novos.length} ativos carregados. Confira a classe de cada um em Ativos.`);
    });
  }

  /* ---------------- Metas ---------------- */

  function meta(id = null) {
    const mt = id ? I().metas().find((x) => x.id === id) : null;
    const contas = I().contas();
    const sel = new Set(mt?.classes || ['stock', 'reit', 'etf']);
    const { panel, form, el, erro } = modal(mt ? 'Editar meta' : 'Nova meta', `
      <label class="field"><span>Nome *</span><input name="nome" class="input" maxlength="50" value="${esc(mt?.nome || '')}" placeholder="Ex.: Patrimônio de R$ 15 mil"></label>
      <label class="field"><span>Acompanhar</span><select name="tipo" class="input">
        ${opt('patrimonio', 'Patrimônio total', mt?.tipo)}${opt('classes', 'Algumas classes (ex.: exterior)', mt?.tipo)}
        ${opt('proventos', 'Média mensal de proventos (12 meses)', mt?.tipo)}${opt('conta', 'Uma conta', mt?.tipo)}</select></label>
      <fieldset data-g="classes" class="grid grid-cols-2 gap-1 text-sm">${I().CLASSES.map((c) => `
        <label class="flex items-center gap-2"><input type="checkbox" name="cls" value="${c.id}" class="accent-emerald-600" ${sel.has(c.id) ? 'checked' : ''}>${c.icone} ${c.nome}</label>`).join('')}</fieldset>
      <label class="field" data-g="conta"><span>Conta</span><select name="conta" class="input">${contas.map((c) => opt(c.id, c.nome, mt?.conta)).join('')}</select></label>
      <div class="grid grid-cols-2 gap-3">
        <label class="field"><span>Objetivo (R$) *</span><input name="alvo" class="input tabular-nums" inputmode="decimal" value="${numInput(mt?.alvo)}"></label>
        <label class="field" data-g="aporte"><span>Aporte mensal (R$)</span><input name="aporte" class="input tabular-nums" inputmode="decimal" value="${numInput(mt?.aporteMensal)}" placeholder="Para prever a data"></label>
      </div>`, { excluir: !!mt });
    const sync = () => {
      const t = el('tipo').value;
      form.querySelector('[data-g=classes]').classList.toggle('hidden', t !== 'classes');
      form.querySelector('[data-g=conta]').classList.toggle('hidden', t !== 'conta');
      form.querySelector('[data-g=aporte]').classList.toggle('hidden', t === 'proventos');
    };
    el('tipo').addEventListener('change', sync);
    sync();
    panel.querySelector('[data-delete]')?.addEventListener('click', () => {
      if (!confirm('Excluir esta meta?')) return;
      S.remove('invMetas', mt.id);
      concluir('Meta excluída.');
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = el('nome').value.trim();
      const alvo = num(el('alvo').value);
      const t = el('tipo').value;
      const classes = [...form.querySelectorAll('[name=cls]:checked')].map((x) => x.value);
      if (!nome) return erro('Informe o nome.');
      if (!(alvo > 0)) return erro('Informe o objetivo.');
      if (t === 'classes' && !classes.length) return erro('Escolha ao menos uma classe.');
      S.upsert('invMetas', { ...(mt ? { id: mt.id } : {}), nome, tipo: t, alvo, aporteMensal: t === 'proventos' ? null : num(el('aporte').value) || null, classes: t === 'classes' ? classes : null, conta: t === 'conta' ? el('conta').value : null });
      concluir(mt ? 'Meta atualizada.' : 'Meta criada.');
    });
  }

  /* ---------------- Alocação ideal ---------------- */

  function alocacao() {
    const ideal = I().config('alocacao')?.ideal || {};
    const r = I().resumo();
    const { form, erro } = modal('Alocação ideal', `
      <p class="text-sm text-slate-500">Quanto você quer em cada classe (% do patrimônio). Deixe vazio as que não usa.</p>
      <ul class="divide-y divide-slate-100">${I().CLASSES.map((c) => `
        <li class="flex items-center gap-3 py-2">
          <span class="flex-1">${c.icone} ${c.nome} <span class="text-xs text-slate-400">${r.patrimonio > 0 && r.porClasse[c.id] ? `hoje ${fmt.pct(r.porClasse[c.id] / r.patrimonio)}` : ''}</span></span>
          <input data-ideal="${c.id}" class="input !w-20 tabular-nums text-right" inputmode="decimal" value="${numInput(ideal[c.id])}" aria-label="% ideal de ${c.nome}"><span class="text-sm text-slate-500">%</span>
        </li>`).join('')}</ul>
      <p class="text-sm font-medium" data-soma></p>`);
    const soma = () => {
      let s = 0;
      form.querySelectorAll('[data-ideal]').forEach((i) => { s += num(i.value) || 0; });
      const el = form.querySelector('[data-soma]');
      el.textContent = `Total: ${String(Math.round(s * 100) / 100).replace('.', ',')}%${Math.abs(s - 100) > 0.01 && s > 0 ? ' — o ideal é somar 100%' : ''}`;
      el.className = `text-sm font-medium ${Math.abs(s - 100) > 0.01 && s > 0 ? 'text-amber-800' : 'text-emerald-700'}`;
      return s;
    };
    form.addEventListener('input', soma);
    soma();
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const novo = {};
      let invalido = false;
      form.querySelectorAll('[data-ideal]').forEach((i) => { const v = num(i.value); if (v != null) { if (v < 0 || v > 100) invalido = true; if (v > 0) novo[i.dataset.ideal] = v; } });
      if (invalido) return erro('Use valores entre 0 e 100.');
      I().salvarConfig('alocacao', { ideal: novo });
      concluir('Alocação ideal salva.');
    });
  }

  /* ---------------- Patrimônio de um mês passado ---------------- */

  function foto(ym = null) {
    const h = ym ? S.list('invHist').find((x) => x.id === ym) : null;
    const { panel, form, el, erro } = modal(h ? `Patrimônio de ${fmt.monthShort(ym)}` : 'Informar patrimônio de um mês', `
      <p class="text-sm text-slate-500">Para ter a evolução e a rentabilidade dos meses antes do app (ex.: copiando do Investidor 10 → Patrimônio).</p>
      <label class="field"><span>Mês</span><input name="mes" type="month" class="input" max="${fmt.addMonths(fmt.currentYM(), -1)}" value="${ym || fmt.addMonths(fmt.currentYM(), -1)}" ${h ? 'readonly' : ''}></label>
      <div class="grid grid-cols-2 gap-3">
        <label class="field"><span>Patrimônio no fim do mês (R$) *</span><input name="pat" class="input tabular-nums" inputmode="decimal" value="${numInput(h?.patrimonio)}"></label>
        <label class="field"><span>Valor aplicado (R$)</span><input name="apl" class="input tabular-nums" inputmode="decimal" value="${numInput(h?.manual ? h.investido : null)}" placeholder="Opcional"></label>
      </div>
      <p class="text-xs text-slate-500">Valor aplicado = quanto você tinha investido do bolso (sem os ganhos). No Investidor 10 é a parte “Valor aplicado” do gráfico.</p>
      <p class="text-xs text-amber-800 bg-amber-50 rounded-lg px-2 py-1.5">Some tudo o que o app acompanha (corretoras <b>e</b> contas por saldo, como a reserva). Se informar só a carteira do Investidor 10, cadastre a reserva com data a partir do mês seguinte — senão a rentabilidade daquele mês sai distorcida.</p>`, { excluir: !!h });
    panel.querySelector('[data-delete]')?.addEventListener('click', () => {
      if (!confirm(`Apagar o patrimônio de ${fmt.monthShort(ym)}?`)) return;
      S.remove('invHist', ym);
      concluir('Mês apagado.');
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const mes = el('mes').value;
      const pat = num(el('pat').value);
      const apl = num(el('apl').value);
      if (!/^\d{4}-\d{2}$/.test(mes) || mes >= fmt.currentYM()) return erro('Escolha um mês anterior ao atual.');
      if (!(pat >= 0) || pat == null) return erro('Informe o patrimônio.');
      S.upsert('invHist', { id: mes, patrimonio: pat, investido: apl, manual: apl != null, em: fmt.todayISO(), informado: true });
      concluir(`Patrimônio de ${fmt.monthShort(mes)} salvo.`);
    });
  }

  /* ---------------- Chaves das cotações automáticas ---------------- */

  function cotacoes() {
    const c = I().config('cotacoes') || {};
    const estado = (v) => (v ? '<span class="text-emerald-700">✓ configurada</span>' : '<span class="text-slate-500">○ não configurada</span>');
    const { form, el, erro } = modal('Cotações automáticas', `
      <p class="text-sm text-slate-600">Com as chaves, o app busca sozinho o preço dos ativos ao abrir Investimentos (no máximo a cada 30 min por ativo).
        Elas ficam <b>cifradas</b> neste aparelho e no seu Drive, e vão só para o serviço de cotação.</p>
      <label class="field"><span>B3 (ações, FIIs, ETFs, BDRs) — token da <b>brapi.dev</b> ${estado(c.brapiToken)}</span>
        <input name="brapi" type="password" class="input font-mono" autocomplete="off" spellcheck="false" placeholder="${c.brapiToken ? 'manter o atual' : 'cole aqui o token'}"></label>
      <p class="text-xs text-slate-500 -mt-2">brapi.dev → Dashboard → API Keys / Tokens. Grátis: 15 mil consultas/mês, preço com até 30 min de atraso.</p>
      <label class="field"><span>EUA (Nomad) — chave da <b>Finnhub</b> ${estado(c.finnhubKey)}</span>
        <input name="finnhub" type="password" class="input font-mono" autocomplete="off" spellcheck="false" placeholder="${c.finnhubKey ? 'manter a atual' : 'cole aqui a chave (opcional)'}"></label>
      <p class="text-xs text-slate-500 -mt-2">finnhub.io → criar conta grátis → Dashboard → API key. Grátis: 60 consultas/min.</p>
      <div class="flex flex-wrap gap-3 text-sm">
        ${c.brapiToken ? '<label class="inline-flex items-center gap-2"><input type="checkbox" name="tirarBrapi" class="accent-rose-600"> Remover token da brapi</label>' : ''}
        ${c.finnhubKey ? '<label class="inline-flex items-center gap-2"><input type="checkbox" name="tirarFinnhub" class="accent-rose-600"> Remover chave da Finnhub</label>' : ''}
      </div>`, { salvar: 'Salvar e atualizar preços' });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const novo = { ...c };
      const b = el('brapi').value.trim();
      const f = el('finnhub').value.trim();
      if (b) { if (!/^[A-Za-z0-9_\-.]{8,200}$/.test(b)) return erro('O token da brapi parece incompleto.'); novo.brapiToken = b; }
      if (f) { if (!/^[A-Za-z0-9_\-.]{8,200}$/.test(f)) return erro('A chave da Finnhub parece incompleta.'); novo.finnhubKey = f; }
      if (el('tirarBrapi')?.checked) delete novo.brapiToken;
      if (el('tirarFinnhub')?.checked) delete novo.finnhubKey;
      I().salvarConfig('cotacoes', { brapiToken: novo.brapiToken || null, finnhubKey: novo.finnhubKey || null });
      Fin.ui.closeModal();
      await atualizarAgora();
    });
  }

  /** Busca os preços agora e mostra o resultado. */
  async function atualizarAgora() {
    if (!Fin.cotacoes.temChaves()) { cotacoes(); return; }
    Fin.ui.toast('Buscando cotações…');
    const r = await Fin.cotacoes.atualizarPrecos({ forcar: true, onProgress: (t) => Fin.ui.toast(t) });
    const faltam = [r.semChave.b3 ? `${r.semChave.b3} da B3 sem token` : '', r.semChave.eua ? `${r.semChave.eua} dos EUA sem chave da Finnhub` : ''].filter(Boolean).join(' · ');
    Fin.ui.toast(`${r.atualizados} preço(s) atualizado(s)${r.falhas.length ? ` · ${r.falhas.length} falha(s): ${r.falhas.slice(0, 2).join('; ')}` : ''}${faltam ? ` · ${faltam}` : ''}`, r.falhas.length && !r.atualizados ? 'error' : 'ok');
    Fin.router.refresh();
  }

  return { conta, mov, ativo, precos, carga, meta, alocacao, foto, num, cotacoes, atualizarAgora };
})();
