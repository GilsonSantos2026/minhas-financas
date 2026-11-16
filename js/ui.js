/**
 * ui.js — Peças de interface reaproveitadas pelas telas:
 * toast, modal (vira "bottom sheet" no celular), navegador de mês e etiqueta de status.
 */
window.Fin = window.Fin || {};

Fin.ui = (() => {
  const fmt = Fin.fmt;

  function toast(msg, kind = 'ok') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.remove('bg-emerald-600', 'bg-rose-600', 'hidden');
    el.classList.add(kind === 'ok' ? 'bg-emerald-600' : 'bg-rose-600');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.add('hidden'), 4000);
  }

  /* ---------- Modal ---------- */

  let lastFocus = null;
  const onKey = (e) => e.key === 'Escape' && closeModal();

  function openModal(innerHTML, label = 'Janela') {
    limparArraste();
    lastFocus = document.activeElement;
    const root = document.getElementById('modal-root');
    root.innerHTML = `
      <div class="fixed inset-0 z-40 bg-slate-900/40 flex items-end sm:items-center justify-center sm:p-4" data-backdrop>
        <div class="modal-panel bg-white w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl"
             role="dialog" aria-modal="true" aria-label="${fmt.esc(label)}">${innerHTML}</div>
      </div>`;
    root.querySelector('[data-backdrop]').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });
    document.addEventListener('keydown', onKey);
    document.body.classList.add('overflow-hidden');
    const panel = root.querySelector('.modal-panel');
    arrastavel(root, panel);
    setTimeout(() => panel.querySelector('input, select, textarea, button:not([data-centralizar])')?.focus(), 30);
    return panel;
  }

  /* ---------- Janela que se move (formulários com cabeçalho [data-arrastar]) ----------
   * No computador (≥ 640 px) o cabeçalho vira alça: arrastar solta a janela, o fundo
   * deixa de escurecer e fica só para consulta (dá para rolar, selecionar e copiar texto;
   * cliques que abririam outra coisa são bloqueados para não perder o que está sendo
   * digitado). A próxima janela abre na mesma posição até "Voltar ao centro". */

  let ultimaPos = null;          // posição guardada durante o uso (some ao recarregar)
  let limparArraste = () => {};

  function arrastavel(root, panel) {
    const alca = panel.querySelector('[data-arrastar]');
    if (!alca) return;
    const fundo = root.querySelector('[data-backdrop]');
    const computador = () => matchMedia('(min-width: 640px)').matches;
    const titulo = alca.querySelector('h2, h3');

    alca.classList.add('modal-alca');
    alca.title = 'Arraste para mover a janela';
    titulo?.insertAdjacentHTML('beforebegin',
      `<span class="modal-grip" aria-hidden="true"><svg viewBox="0 0 10 16" width="10" height="16" fill="currentColor">
        <circle cx="2" cy="2" r="1.4"/><circle cx="8" cy="2" r="1.4"/><circle cx="2" cy="8" r="1.4"/>
        <circle cx="8" cy="8" r="1.4"/><circle cx="2" cy="14" r="1.4"/><circle cx="8" cy="14" r="1.4"/></svg></span>`);
    const fechar = alca.querySelector('[data-close]');
    fechar?.insertAdjacentHTML('beforebegin',
      `<button type="button" data-centralizar class="icon-btn modal-centro" hidden
         aria-label="Voltar a janela ao centro" title="Voltar ao centro">${Fin.icone ? Fin.icone('alvo', 'w-4 h-4') : '◎'}</button>`);
    const btnCentro = alca.querySelector('[data-centralizar]');
    if (fechar && btnCentro) fechar.parentElement.insertBefore(btnCentro, fechar);
    // Título + botões juntos à direita do grip
    if (titulo && !titulo.classList.contains('flex-1')) titulo.classList.add('flex-1');

    let solta = false, pos = null, inicio = null, avisou = false;

    const ajustar = () => {
      if (!solta) return;
      // A janela inteira fica dentro da área visível (altura máxima = tela − 16 px no CSS).
      const m = 8;
      pos.x = Math.max(m, Math.min(pos.x, innerWidth - panel.offsetWidth - m));
      pos.y = Math.max(m, Math.min(pos.y, innerHeight - panel.offsetHeight - m));
      panel.style.left = `${Math.round(pos.x)}px`;
      panel.style.top = `${Math.round(pos.y)}px`;
      ultimaPos = { ...pos };
    };

    // Com a janela solta, o fundo serve só para consulta.
    const bloquearFundo = (e) => {
      if (panel.contains(e.target) || e.target.closest?.('#toast')) return;
      e.preventDefault();
      e.stopPropagation();
      if (!avisou) {
        avisou = true;
        toast('Com a janela aberta, a tela de fundo é só para consulta: dá para rolar, selecionar e copiar.');
      }
    };

    const soltar = (x, y) => {
      if (solta) return;
      const r = panel.getBoundingClientRect();
      solta = true;
      pos = { x: x ?? r.left, y: y ?? r.top };
      panel.style.width = `${r.width}px`;
      panel.classList.add('modal-solta');
      fundo.classList.add('modal-fundo-livre');
      document.body.classList.remove('overflow-hidden');
      document.addEventListener('click', bloquearFundo, true);
      btnCentro.hidden = false;
      ajustar();
    };

    const centralizar = () => {
      if (!solta) return;
      solta = false;
      ultimaPos = null;
      panel.classList.remove('modal-solta');
      panel.style.left = panel.style.top = panel.style.width = '';
      fundo.classList.remove('modal-fundo-livre');
      document.body.classList.add('overflow-hidden');
      document.removeEventListener('click', bloquearFundo, true);
      btnCentro.hidden = true;
    };

    alca.addEventListener('pointerdown', (e) => {
      if (!computador() || e.button !== 0 || e.target.closest('button, a, input, select, textarea, label')) return;
      const r = panel.getBoundingClientRect();
      inicio = { px: e.clientX, py: e.clientY, x: solta ? pos.x : r.left, y: solta ? pos.y : r.top, moveu: false };
      alca.setPointerCapture(e.pointerId);
      e.preventDefault();               // não seleciona o título ao arrastar
    });
    alca.addEventListener('pointermove', (e) => {
      if (!inicio) return;
      const dx = e.clientX - inicio.px, dy = e.clientY - inicio.py;
      if (!inicio.moveu && Math.hypot(dx, dy) < 4) return;
      inicio.moveu = true;
      if (!solta) soltar(inicio.x, inicio.y);
      alca.classList.add('arrastando');
      pos.x = inicio.x + dx;
      pos.y = inicio.y + dy;
      ajustar();
    });
    const parar = () => { inicio = null; alca.classList.remove('arrastando'); };
    alca.addEventListener('pointerup', parar);
    alca.addEventListener('pointercancel', parar);
    alca.addEventListener('dblclick', (e) => { if (!e.target.closest('button')) centralizar(); });
    btnCentro.addEventListener('click', centralizar);

    const aoRedimensionar = () => {
      if (!solta) return;
      if (!computador()) centralizar(); else ajustar();
    };
    addEventListener('resize', aoRedimensionar);
    // O formulário cresce (ex.: abrir "Recorrente") → reencaixa na tela.
    const ro = window.ResizeObserver ? new ResizeObserver(() => ajustar()) : null;
    ro?.observe(panel);

    limparArraste = () => {
      document.removeEventListener('click', bloquearFundo, true);
      removeEventListener('resize', aoRedimensionar);
      ro?.disconnect();
      limparArraste = () => {};
    };

    // Reabre onde a última janela ficou.
    if (ultimaPos && computador()) soltar(ultimaPos.x, ultimaPos.y);
  }

  function closeModal() {
    limparArraste();
    document.getElementById('modal-root').innerHTML = '';
    document.removeEventListener('keydown', onKey);
    document.body.classList.remove('overflow-hidden');
    lastFocus?.focus?.();
  }

  /**
   * Pergunta simples Sim/Não numa janela (sem caixinha de "entendi"). Promise<boolean>.
   * opts: { titulo, texto (html), sim, nao, avatar (html opcional) }
   */
  function perguntar(opts = {}) {
    return new Promise((resolve) => {
      let fim = false;
      const terminar = (v) => { if (fim) return; fim = true; obs.disconnect(); closeModal(); resolve(v); };
      const panel = openModal(`
        <div class="p-5 space-y-4">
          <div class="flex items-start gap-3">
            ${opts.avatar || ''}
            <div class="min-w-0"><h2 class="font-semibold text-lg leading-tight">${opts.titulo || 'Confirmar'}</h2>
              ${opts.texto ? `<p class="text-sm text-slate-600 mt-1">${opts.texto}</p>` : ''}</div>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" data-nao class="btn btn-ghost">${opts.nao || 'Cancelar'}</button>
            <button type="button" data-sim class="btn btn-primary">${opts.sim || 'Confirmar'}</button>
          </div>
        </div>`, opts.titulo || 'Confirmar');
      const obs = new MutationObserver(() => { if (!document.body.contains(panel)) terminar(false); });
      obs.observe(document.getElementById('modal-root'), { childList: true });
      panel.querySelector('[data-nao]').addEventListener('click', () => terminar(false));
      panel.querySelector('[data-sim]').addEventListener('click', () => terminar(true));
      setTimeout(() => panel.querySelector('[data-sim]').focus(), 40);
    });
  }

  /* ---------- Modo casal: filtro Ambos / pessoa ---------- */

  /**
   * Seletor no topo das telas de totais e gráficos (só aparece com 2+ pessoas).
   * Ambos = tudo; pessoa = receitas dela + o que ela pagou + a parte dela nas contas dos dois.
   */
  function filtroPessoa() {
    const F = Fin.finance;
    if (!F?.temCasal?.()) return '';
    const M = Fin.membros;
    const ativo = F.pessoaAtiva();
    const pessoas = Fin.cofre.pessoas();
    const btn = (id, rotulo, av) => `<button type="button" data-filtro-pessoa="${fmt.esc(id)}" aria-pressed="${(ativo || 'todos') === id}">${av}${fmt.esc(rotulo)}</button>`;
    const doisAv = `<span class="w-6 h-6 rounded-full grid place-items-center bg-slate-100 text-slate-600 shrink-0">${Fin.icone('usuario', 'w-3.5 h-3.5')}</span>`;
    const pct = ativo ? Math.round(F.parteDe(ativo) * 100) : null;
    const nomeAtivo = ativo ? (M.primeiroNome(M.porId(ativo)) || '') : '';
    return `
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <div class="filtro-pessoa" role="group" aria-label="Ver finanças de">
          ${btn('todos', 'Ambos', doisAv)}
          ${pessoas.map((p) => btn(p.id, M.primeiroNome(M.porId(p.id)) || p.usuario, M.avatar(M.porId(p.id), { tam: 'w-6 h-6', txt: 'text-[9px]' }))).join('')}
        </div>
        ${ativo ? `<p class="text-xs text-slate-500">Só de ${fmt.esc(nomeAtivo)}: as receitas, o que pagou e <b>${pct}%</b> das contas dos dois.
          <a href="#/configuracoes" class="text-prim-700 hover:underline">Divisão</a></p>` : ''}
      </div>`;
  }

  /** Mini-avatar de quem lançou/pagou (listas). Vazio com uma pessoa só. */
  function autorMini(l) {
    const F = Fin.finance;
    if (!F?.temCasal?.()) return '';
    const M = Fin.membros;
    const pg = F.pagador(l);
    if (pg === F.CASAL) {
      return `<span class="autor-mini rounded-full grid place-items-center bg-prim-600 text-white shrink-0" title="Pago pelos dois">${Fin.icone('usuario', 'w-2.5 h-2.5')}</span>`;
    }
    const m = M.porId(pg);
    const nome = M.nome(m) || m.usuario;
    const autor = F.autor(l);
    const dica = l.tipo === 'receita' ? `Recebido por ${nome}` : autor !== pg ? `Pago por ${nome} · lançado por ${M.nome(M.porId(autor))}` : `Pago por ${nome}`;
    return `<span title="${fmt.esc(dica)}" class="inline-flex shrink-0">${M.avatar(m, { tam: 'autor-mini', txt: '' })}</span>`;
  }

  /* ---------- Confirmação de ação perigosa ---------- */

  /**
   * Caixa que explica o que vai acontecer antes de uma ação que não tem volta.
   * opts: { titulo, icone, cor ('rose'|'amber'), intro, perde: [html], mantem: [html], avisos: [html],
   *         resumo: html, backup: async fn | null, ciente: texto da caixinha, palavra: 'APAGAR' | null,
   *         botao: texto do botão de confirmar }
   * Resolve true (confirmou) ou false (cancelou/fechou).
   */
  function confirmar(opts) {
    return new Promise((resolve) => {
      const rose = opts.cor !== 'amber';
      const lista = (itens, sinal, cls) => itens.map((t) => `<li class="flex gap-2"><span class="font-bold shrink-0 ${cls}" aria-hidden="true">${sinal}</span><span>${t}</span></li>`).join('');
      const panel = openModal(`
        <form class="p-5 space-y-4" novalidate>
          <div class="flex items-start gap-3">
            ${Fin.icones ? Fin.icones.badge(opts.icone || 'alerta', rose ? 'rose' : 'amber', 'w-10 h-10', 'w-6 h-6') : ''}
            <div class="flex-1 min-w-0">
              <h2 class="font-semibold text-lg leading-tight">${opts.titulo}</h2>
              ${opts.intro ? `<p class="text-sm text-slate-600 mt-1">${opts.intro}</p>` : ''}
            </div>
            <button type="button" data-nao class="icon-btn shrink-0" aria-label="Cancelar">✕</button>
          </div>
          ${opts.avisos?.length ? `<ul class="text-sm bg-amber-50 text-amber-900 rounded-xl px-3 py-2.5 space-y-1.5">${lista(opts.avisos, '!', 'text-amber-700')}</ul>` : ''}
          ${opts.perde?.length ? `
            <div class="rounded-xl border ${rose ? 'border-rose-200 bg-rose-50/60' : 'border-amber-200 bg-amber-50/60'} px-3 py-2.5">
              <div class="text-xs font-semibold uppercase tracking-wide ${rose ? 'text-rose-700' : 'text-amber-800'} mb-1.5">O que vai acontecer</div>
              <ul class="text-sm space-y-1.5">${lista(opts.perde, '✕', rose ? 'text-rose-600' : 'text-amber-700')}</ul>
            </div>` : ''}
          ${opts.mantem?.length ? `
            <div class="rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5">
              <div class="text-xs font-semibold uppercase tracking-wide text-emerald-800 mb-1.5">Continua como está</div>
              <ul class="text-sm space-y-1.5">${lista(opts.mantem, '✓', 'text-emerald-700')}</ul>
            </div>` : ''}
          ${opts.resumo || ''}
          ${opts.backup ? `
            <div class="flex flex-wrap items-center gap-2 text-sm bg-slate-50 rounded-xl px-3 py-2.5">
              <span class="flex-1 min-w-[12rem]">Recomendado: <b>baixe um backup</b> antes. Com ele dá para voltar atrás.</span>
              <button type="button" data-backup class="btn btn-ghost !bg-white !py-1.5">Baixar backup agora</button>
            </div>` : ''}
          <label class="flex items-start gap-2 text-sm cursor-pointer">
            <input type="checkbox" data-ciente class="accent-rose-600 w-4 h-4 mt-0.5 shrink-0">
            <span>${opts.ciente || 'Entendi o que vai acontecer e que não dá para desfazer.'}</span>
          </label>
          ${opts.palavra ? `
            <label class="field"><span>Para confirmar, digite <b>${opts.palavra}</b></span>
              <input data-palavra class="input" autocomplete="off" autocapitalize="characters" spellcheck="false"></label>` : ''}
          <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
            <button type="button" data-nao class="btn btn-ghost">Cancelar</button>
            <button type="submit" data-sim class="btn ${rose ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'} text-white" disabled>${opts.botao || 'Confirmar'}</button>
          </div>
        </form>`, opts.titulo.replace(/<[^>]+>/g, ''));

      let fim = false;
      const terminar = (v) => { if (fim) return; fim = true; obs.disconnect(); closeModal(); resolve(v); };
      // Fechou de outro jeito (Esc, toque fora) = cancelou.
      const obs = new MutationObserver(() => { if (!panel.isConnected && !fim) { fim = true; obs.disconnect(); resolve(false); } });
      obs.observe(document.getElementById('modal-root'), { childList: true });

      const form = panel.querySelector('form');
      const sim = panel.querySelector('[data-sim]');
      const valido = () => panel.querySelector('[data-ciente]').checked
        && (!opts.palavra || (panel.querySelector('[data-palavra]').value || '').trim().toUpperCase() === opts.palavra);
      form.addEventListener('input', () => { sim.disabled = !valido(); });
      form.addEventListener('change', () => { sim.disabled = !valido(); });
      form.addEventListener('submit', (e) => { e.preventDefault(); if (valido()) terminar(true); });
      panel.querySelectorAll('[data-nao]').forEach((b) => b.addEventListener('click', () => terminar(false)));
      panel.querySelector('[data-backup]')?.addEventListener('click', async (e) => {
        const b = e.currentTarget;
        b.disabled = true;
        try { await opts.backup(); b.textContent = '✓ Backup baixado'; } catch (err) { b.disabled = false; toast(err.message, 'error'); }
      });
      setTimeout(() => panel.querySelector('[data-nao]')?.focus(), 40); // foco no Cancelar, não no perigo
    });
  }

  /* ---------- Navegador de mês (os cliques são tratados em app.js) ---------- */

  function monthNav(ym) {
    const atual = fmt.currentYM();
    return `
      <div class="flex items-center justify-between bg-white rounded-2xl shadow-sm px-2 py-2">
        <button data-month="-1" class="icon-btn" aria-label="Mês anterior">‹</button>
        <div class="text-center">
          <div class="font-semibold">${fmt.monthLong(ym)}</div>
          ${ym !== atual ? '<button data-month="0" class="text-xs text-prim-700 hover:underline">voltar para o mês atual</button>' : '<div class="text-xs text-slate-400">mês atual</div>'}
        </div>
        <button data-month="1" class="icon-btn" aria-label="Próximo mês">›</button>
      </div>`;
  }

  /* ---------- Status (ícone + texto: nunca só cor) ---------- */

  function statusPill(l) {
    const st = Fin.finance.statusEfetivo(l);
    const rec = l.tipo === 'receita';
    const map = {
      pago: ['✓', rec ? 'Recebido' : 'Pago', 'bg-emerald-50 text-emerald-800'],
      aberto: ['○', rec ? 'A receber' : 'A pagar', 'bg-slate-100 text-slate-600'],
      atrasado: ['!', 'Atrasado', 'bg-rose-50 text-rose-700'],
      parcial: ['◐', 'Parcial', 'bg-amber-50 text-amber-800'],
    };
    const [icon, label, cls] = map[st];
    const acao = st === 'pago' ? 'Marcar como não pago' : rec ? 'Marcar como recebido' : 'Marcar como pago';
    return `<button type="button" data-toggle-pago="${l.id}" class="pill ${cls}" title="${acao}" aria-label="${label}. ${acao}">
      <span aria-hidden="true">${icon}</span>${label}</button>`;
  }

  /**
   * Linha curta com o pagamento efetivado de um lançamento (abaixo do valor lançado):
   * "pago R$ 220,83 · 05/05 · +R$ 4,89", "pago R$ 1.000,00 de R$ 1.738,82", etc.
   */
  function pagamentoLinha(l) {
    const c = Fin.finance.conciliar(l);
    const rec = l.tipo === 'receita';
    if (c.situacao === 'pendente' || c.situacao === 'atrasado') return '';
    const data = l.dataPagamento ? ` · ${fmt.date(l.dataPagamento).slice(0, 5)}` : '';
    if (c.situacao === 'parcial') {
      return `<div class="text-[11px] text-amber-800 tabular-nums">${rec ? 'recebido' : 'pago'} ${fmt.brl(c.pago)}${data} · falta ${fmt.brl(c.falta)}</div>`;
    }
    const dif = c.situacao === 'maior' ? ` <span class="text-amber-800">+${fmt.brl(c.diferenca)}</span>`
      : c.situacao === 'menor' ? ` <span class="text-emerald-800">−${fmt.brl(-c.diferenca)}</span>` : '';
    return `<div class="text-[11px] text-slate-500 tabular-nums">${rec ? 'recebido' : 'pago'} ${fmt.brl(c.pago)}${data}${dif}</div>`;
  }

  /**
   * Alerta de rotativo: fatura de cartão paga a menos. p = Fin.finance.faturaParcial(l);
   * hist = Fin.finance.rotativo(...) (opcional, para mostrar a frequência).
   */
  function alertaRotativo(p, hist = null, { compacto = false } = {}) {
    const vezes = hist ? hist.parciais.length : 0;
    const custo = hist ? hist.encargos + hist.pagoAMais : 0;
    const freq = hist && (vezes > 1 || custo > 0) ? `
      <p class="text-xs bg-white/70 rounded-lg px-2 py-1.5">
        Nos últimos ${hist.meses} meses: <b>${vezes} fatura${vezes === 1 ? '' : 's'} paga${vezes === 1 ? '' : 's'} a menos</b>${custo > 0 ? ` · <b>${fmt.brl(custo)}</b> em juros, IOF e multa já identificados` : ''}.
        ${vezes >= 3 ? 'Virou hábito — e é o que mais pesa no orçamento.' : ''}</p>` : '';
    const dica = compacto ? '' : `
      <p class="text-xs text-rose-900/80">Se não der para pagar tudo, compare antes: o <b>parcelamento da fatura</b> oferecido pelo banco costuma ter juros menores que o rotativo. E segure novas compras no cartão até zerar o saldo.</p>`;
    return `
      <div class="rounded-xl bg-rose-50 text-rose-900 border border-rose-200 px-3 py-2.5 text-sm space-y-1.5" role="note">
        <p class="font-semibold"><span aria-hidden="true">⚠️</span> Fatura paga a menos: ${fmt.brl(p.falta)} vão para o rotativo</p>
        <p class="text-xs">O que falta volta na próxima fatura com <b>juros, IOF e multa</b>. O rotativo é um dos créditos mais caros do mercado (costuma passar de 10% ao mês): só no próximo mês, pode custar <b>mais de ${fmt.brl(p.custoMes)}</b> — e os juros crescem sobre os juros.</p>
        ${freq}${dica}
      </div>`;
  }

  /** Bolinha com o emoji da categoria (ou a inicial). */
  function catIcon(icone, nome, tipo) {
    const bg = tipo === 'receita' ? 'bg-emerald-50' : 'bg-slate-100';
    const content = icone || fmt.esc((nome || '?').slice(0, 1).toUpperCase());
    return `<span class="w-10 h-10 shrink-0 rounded-full ${bg} grid place-items-center text-lg" aria-hidden="true">${content}</span>`;
  }

  function emptyState(icon, title, text, actionHTML = '') {
    return `
      <div class="bg-white rounded-2xl shadow-sm p-8 text-center">
        ${Fin.icones?.doEmoji(icon)
          ? `<div class="relative mx-auto mb-3 w-16 h-16" aria-hidden="true">
              <span class="absolute -right-2 -top-1 text-prim-200">${Fin.icone('moedas', 'w-6 h-6')}</span>
              <span class="w-16 h-16 rounded-2xl bg-prim-50 text-prim-600 grid place-items-center">${Fin.icone(Fin.icones.doEmoji(icon), 'w-8 h-8')}</span>
            </div>`
          : `<div class="text-4xl mb-2" aria-hidden="true">${icon}</div>`}
        <h2 class="font-semibold">${title}</h2>
        <p class="text-sm text-slate-500 mt-1">${text}</p>
        ${actionHTML ? `<div class="mt-4">${actionHTML}</div>` : ''}
      </div>`;
  }

  return { toast, openModal, closeModal, confirmar, perguntar, filtroPessoa, autorMini, monthNav, statusPill, pagamentoLinha, alertaRotativo, catIcon, emptyState };
})();
