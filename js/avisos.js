/**
 * avisos.js — Sininho de notificações e botão "Atualizar" no topo (ao lado do olho).
 *
 * Sininho: junta o que pede atenção — contas atrasadas, contas que vencem em até 3 dias,
 * receitas não recebidas, orçamento estourado no mês, backup pendente, problema no Google
 * Drive e versão nova do app. O número vermelho mostra os avisos ainda não vistos; o sino
 * fica colorido enquanto houver algum aviso (vermelho se algo estiver atrasado).
 *
 * Atualizar: cinza quando o app está na versão mais nova (tocar procura atualização);
 * amarelo pulsando quando há versão nova (tocar atualiza).
 */
window.Fin = window.Fin || {};

Fin.avisos = (() => {
  const fmt = Fin.fmt;
  const esc = fmt.esc;
  const DIAS_ANTES = 3; // "vence em breve" = hoje até daqui a 3 dias
  const MAX_LISTA = 6;

  const somaDias = (iso, n) => { const d = new Date(`${iso}T12:00`); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const diasEntre = (a, b) => Math.round((new Date(`${b}T12:00`) - new Date(`${a}T12:00`)) / 86400000);
  const quando = (dias) => (dias === 0 ? 'vence hoje' : dias === 1 ? 'vence amanhã' : `vence em ${dias} dias`);

  /* ---------------- Dispensados ("já estou ciente") ---------------- */

  const dispensados = () => new Set(Fin.storage.prefs().avisosDispensados || []);
  const gravarDispensados = (ids) => { try { Fin.storage.setPref('avisosDispensados', [...ids]); } catch { /* bloqueado */ } };

  /**
   * Avisos visíveis = todos menos os dispensados. A dispensa vale para aquela mensagem enquanto
   * a situação durar: quando o aviso deixa de existir (conta paga, Drive reconectado…), a dispensa
   * é esquecida — se a situação voltar a ocorrer, o aviso aparece normalmente.
   */
  function lista() {
    const todos = gerar();
    let disp = dispensados();
    if (disp.size && !Fin.storage.bloqueado()) {
      const ativos = new Set(todos.map((a) => a.id));
      const manter = [...disp].filter((id) => ativos.has(id));
      if (manter.length !== disp.size) { gravarDispensados(manter); disp = new Set(manter); }
    }
    return todos.filter((a) => !disp.has(a.id));
  }

  /** Quantos avisos existem agora mas estão dispensados. */
  function qtdDispensados() {
    const disp = dispensados();
    return disp.size ? gerar().filter((a) => disp.has(a.id)).length : 0;
  }

  /** Todos os avisos: { id, nivel ('critico'|'atencao'|'info'), grupo, icone, titulo, sub, valor, acao }. */
  function gerar() {
    const out = [];
    const desbloqueado = !Fin.storage.bloqueado();

    if (desbloqueado && Fin.storage.hasData()) {
      const F = Fin.finance;
      const hoje = fmt.todayISO();
      const limite = somaDias(hoje, DIAS_ANTES);
      const cats = F.catsInvestimento();
      const atrasadas = [];
      const breve = [];
      const receitas = [];
      for (const l of F.todos()) {
        if (F.ehAporte(l, cats)) continue;
        const st = F.statusEfetivo(l);
        if (st === 'pago') continue;
        const d = F.dataRef(l);
        const falta = st === 'parcial' ? Math.max(0, F.valor(l) - (l.valorPago || 0)) : F.valor(l);
        if (l.tipo === 'receita') {
          if (d && d < hoje) receitas.push({ l, d, falta });
        } else if (st === 'atrasado' || (st === 'parcial' && d && d < hoje)) {
          atrasadas.push({ l, d, falta });
        } else if (d && d >= hoje && d <= limite) {
          breve.push({ l, d, falta });
        }
      }
      atrasadas.sort((a, b) => (a.d || '').localeCompare(b.d || ''));
      breve.sort((a, b) => a.d.localeCompare(b.d));
      receitas.sort((a, b) => a.d.localeCompare(b.d));

      for (const { l, d, falta } of atrasadas) {
        const dias = d ? diasEntre(d, hoje) : null;
        out.push({
          id: `atrasada:${l.id}`, nivel: 'critico', grupo: 'contas', icone: '!',
          titulo: l.descricao || l.categoria, sub: `${l.status === 'parcial' ? 'falta pagar · ' : ''}venceu ${d ? fmt.date(d) : ''}${dias ? ` · há ${dias} dia${dias > 1 ? 's' : ''}` : ''}`,
          valor: falta, acao: { edit: l.id },
        });
      }
      for (const { l, d, falta } of breve) {
        const dias = diasEntre(hoje, d);
        out.push({
          id: `vence:${l.id}:${d}`, nivel: dias <= 1 ? 'atencao' : 'info', grupo: 'contas', icone: '⏰',
          titulo: l.descricao || l.categoria, sub: `${quando(dias)} · ${fmt.date(d)}`, valor: falta, acao: { edit: l.id },
        });
      }
      for (const { l, d, falta } of receitas) {
        out.push({
          id: `receita:${l.id}`, nivel: 'atencao', grupo: 'receitas', icone: '○',
          titulo: l.descricao || l.categoria, sub: `a receber desde ${fmt.date(d)}`, valor: falta, acao: { edit: l.id },
        });
      }

      const ym = fmt.currentYM();
      for (const o of F.orcamento(ym).itens.filter((i) => i.pct > 1)) {
        out.push({
          id: `orc:${o.categoria}:${ym}`, nivel: 'atencao', grupo: 'orcamento', icone: o.icone || '🎯',
          titulo: `Orçamento estourado: ${o.categoria}`, sub: `gasto ${fmt.brl(o.gasto)} de ${fmt.brl(o.orcado)} em ${fmt.monthLong(ym)}`,
          acao: { href: '#/orcamento', rotulo: 'Ver orçamento' },
        });
      }

      // Rotativo do cartão: fatura paga a menos neste mês ou no anterior; e frequência em 12 meses.
      const rot = F.rotativo(null, ym);
      const recentes = rot.parciais.filter((p) => p.competencia >= fmt.addMonths(ym, -1));
      for (const p of recentes) {
        out.push({
          id: `rotativo:${p.l.id}`, nivel: 'critico', grupo: 'cartao', icone: '⚠️',
          titulo: `Fatura paga a menos: ${p.l.descricao || p.cartao || 'cartão'}`,
          sub: `${fmt.brl(p.falta)} foram para o rotativo (juros de mais de 10% ao mês)`,
          acao: { edit: p.l.id },
        });
      }
      if (rot.parciais.length >= 3) {
        const custo = rot.encargos + rot.pagoAMais;
        out.push({
          id: `rotativo-freq:${ym}:${rot.parciais.length}`, nivel: 'atencao', grupo: 'cartao', icone: '💳',
          titulo: `Rotativo em ${rot.parciais.length} dos últimos 12 meses`,
          sub: custo > 0 ? `${fmt.brl(custo)} em juros, IOF e multa identificados` : 'pagar a fatura inteira evita os juros mais caros',
          acao: { href: '#/cartoes', rotulo: 'Ver cartões' },
        });
      }

      const b = Fin.storage.situacaoBackup();
      if (b.lembrar) {
        out.push({
          id: `backup:${b.ultimo || 'nunca'}`, nivel: 'atencao', grupo: 'app', icone: '🛟',
          titulo: 'Fazer backup', sub: b.ultimo ? `último backup há ${b.dias} dias, com alterações novas` : 'você ainda não fez nenhum backup',
          acao: { href: '#/dados', rotulo: 'Fazer backup' },
        });
      }

      // Titular: sugestões/problemas novos enviados por outra pessoa da casa (v2026-11-16.5).
      if (Fin.cofre?.ehPrincipal?.() && Fin.sugestoes) {
        const eu = Fin.cofre.membroId();
        const novas = Fin.sugestoes.lista().filter((s) => (s.status || 'nova') === 'nova' && s.autor !== eu);
        if (novas.length) {
          out.push({
            id: `sugestao:${novas.map((s) => s.id).sort().join(',').slice(0, 120)}`, nivel: 'info', grupo: 'app', icone: '💬',
            titulo: novas.length === 1 ? `Nova sugestão: ${novas[0].titulo}` : `${novas.length} sugestões novas`,
            sub: novas.length === 1 ? `de ${novas[0].autorNome || novas[0].autorUsuario || 'outra pessoa'}` : 'enviadas pelo app',
            acao: { href: '#/configuracoes', rotulo: 'Ver' },
          });
        }
      }
    }

    const dv = Fin.drive?.estado;
    // Conta nova que pulou o passo do Drive (onboarding Etapa 4): lembrete até conectar.
    if (desbloqueado && dv && Fin.drive.configurado() && !Fin.drive.conectado()
      && ['pendente', 'adiado'].includes(Fin.storage.prefs().driveOnboarding)) {
      out.push({ id: 'drive:guardar', nivel: 'atencao', grupo: 'app', icone: '☁️', titulo: 'Seus dados estão só neste aparelho', sub: 'conecte o Google Drive para ter cópia automática', acao: { href: '#/dados', rotulo: 'Conectar' } });
    }
    if (desbloqueado && dv && Fin.drive.conectado()) {
      if (dv.conflito) out.push({ id: 'drive:conflito', nivel: 'critico', grupo: 'app', icone: '☁️', titulo: 'Conflito no Google Drive', sub: 'os dados do Drive foram criados com outra senha', acao: { href: '#/dados', rotulo: 'Resolver' } });
      else if (dv.reconectar) out.push({ id: 'drive:reconectar', nivel: 'atencao', grupo: 'app', icone: '☁️', titulo: 'Reconectar o Google Drive', sub: 'a conexão expirou; os dados não estão sincronizando', acao: { drive: true } });
      else if (dv.erro) out.push({ id: 'drive:erro', nivel: 'atencao', grupo: 'app', icone: '☁️', titulo: 'Erro ao sincronizar', sub: dv.erro, acao: { href: '#/dados', rotulo: 'Ver' } });
    }

    if (Fin.pwa?.estado.novaVersao) {
      out.push({ id: 'versao', nivel: 'info', grupo: 'app', icone: '✨', titulo: 'Nova versão do app', sub: 'toque em Atualizar para usar a versão mais nova', acao: { atualizar: true } });
    }
    return out;
  }

  /* ---------------- Vistos (o número some depois de abrir o sininho) ---------------- */

  const vistos = () => new Set(Fin.storage.prefs().avisosVistos || []);
  function marcarVistos(itens) {
    try { Fin.storage.setPref('avisosVistos', itens.map((a) => a.id)); } catch { /* bloqueado */ }
  }

  /* ---------------- Botões do topo ---------------- */

  let ultimos = [];
  function desenhar() {
    let itens = [];
    try { itens = lista(); } catch (e) { console.warn('[avisos]', e); }
    ultimos = itens;
    const v = vistos();
    const novos = itens.filter((a) => !v.has(a.id)).length;
    const nivel = itens.some((a) => a.nivel === 'critico') ? 'critico' : itens.length ? 'atencao' : '';
    document.querySelectorAll('[data-avisos]').forEach((b) => {
      b.classList.toggle('sino-critico', nivel === 'critico');
      b.classList.toggle('sino-atencao', nivel === 'atencao');
      const badge = b.querySelector('.topo-badge');
      badge.textContent = novos > 9 ? '9+' : String(novos);
      badge.hidden = !novos;
      const txt = itens.length ? `Notificações: ${itens.length}${novos ? `, ${novos} nova${novos > 1 ? 's' : ''}` : ''}` : 'Notificações: nenhuma';
      b.setAttribute('aria-label', txt);
      b.title = txt;
    });
    const pwa = Fin.pwa?.estado || {};
    const temNova = !!pwa.novaVersao;
    document.querySelectorAll('[data-atualizar]').forEach((b) => {
      b.hidden = !pwa.suportado;
      b.classList.toggle('atualizar-disponivel', temNova);
      const txt = temNova ? 'Nova versão disponível: atualizar agora' : 'App na versão mais nova. Tocar para procurar atualização';
      b.setAttribute('aria-label', txt);
      b.title = txt;
    });
  }

  /* ---------------- Painel ---------------- */

  const COR = {
    critico: 'bg-rose-50 text-rose-700',
    atencao: 'bg-amber-50 text-amber-800',
    info: 'bg-slate-100 text-slate-600',
  };
  const GRUPOS = [
    ['contas', 'Contas a pagar'],
    ['receitas', 'Receitas não recebidas'],
    ['cartao', 'Cartão de crédito'],
    ['orcamento', 'Orçamento'],
    ['app', 'App'],
  ];

  function itemHTML(a, novo) {
    let botao = ''; // item de lançamento: a linha inteira abre a edição
    if (a.acao.href) botao = `<a href="${a.acao.href}" class="btn btn-ghost !py-1.5 !px-3 text-xs shrink-0">${esc(a.acao.rotulo)}</a>`;
    else if (a.acao.drive) botao = '<button data-drive="reconectar" data-fechar class="btn btn-ghost !py-1.5 !px-3 text-xs shrink-0">Reconectar</button>';
    else if (a.acao.atualizar) botao = '<button data-atualizar-agora class="btn btn-primary !py-1.5 !px-3 text-xs shrink-0">Atualizar</button>';
    const clicavel = a.acao.edit ? `data-edit="${esc(a.acao.edit)}" role="button" tabindex="0"` : '';
    // A caixinha fica FORA da área clicável (tocar nela não abre o lançamento).
    return `
      <li class="flex items-center gap-1 py-1.5 -mx-2">
        <label class="shrink-0 p-2 cursor-pointer" title="Selecionar para dispensar">
          <input type="checkbox" data-dispensar="${esc(a.id)}" class="accent-prim-600 w-4 h-4 block" aria-label="Selecionar “${esc(a.titulo)}” para dispensar">
        </label>
        <div class="flex-1 min-w-0 flex items-center gap-3 py-1 pr-2 rounded-xl ${a.acao.edit ? 'hover:bg-slate-50 cursor-pointer' : ''}" ${clicavel}>
          <span class="w-9 h-9 shrink-0 rounded-full grid place-items-center text-base font-bold ${COR[a.nivel]}" aria-hidden="true">${esc(a.icone)}</span>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate">${novo ? '<span class="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1.5 align-middle" title="Novo"></span><span class="sr-only">Novo: </span>' : ''}${esc(a.titulo)}</div>
            <div class="text-xs ${a.nivel === 'critico' ? 'text-rose-700' : 'text-slate-500'}">${esc(a.sub)}</div>
          </div>
          ${a.valor != null ? `<div class="text-sm font-semibold tabular-nums shrink-0">${fmt.brl(a.valor)}</div>` : ''}
          ${botao}
        </div>
      </li>`;
  }

  async function abrir() {
    desenhar();
    const itens = ultimos;
    const v = vistos();
    const atrasadas = itens.filter((a) => a.id.startsWith('atrasada:'));
    const secoes = GRUPOS.map(([g, nome]) => {
      let doGrupo = itens.filter((a) => a.grupo === g);
      if (!doGrupo.length) return '';
      let mais = '';
      if (g === 'contas') {
        // atrasadas primeiro; muitas → mostra as mais antigas e um atalho para a Planilha
        const at = doGrupo.filter((a) => a.nivel === 'critico');
        const resto = doGrupo.filter((a) => a.nivel !== 'critico');
        if (at.length > MAX_LISTA) {
          mais = `<a href="#/planilha" data-ver-atrasadas class="block text-center text-sm text-prim-700 font-medium pt-2 hover:underline">Ver todas as ${at.length} atrasadas na Planilha →</a>`;
          doGrupo = [...at.slice(0, MAX_LISTA), ...resto];
        }
      }
      if (g === 'receitas' && doGrupo.length > MAX_LISTA) {
        mais = `<p class="text-xs text-slate-500 text-center pt-2">e mais ${doGrupo.length - MAX_LISTA}</p>`;
        doGrupo = doGrupo.slice(0, MAX_LISTA);
      }
      const total = g === 'contas' && atrasadas.length
        ? ` · <span class="text-rose-700">! ${atrasadas.length} atrasada${atrasadas.length > 1 ? 's' : ''}</span>` : '';
      return `
        <section class="pt-3">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500">${nome}${total}</h3>
          <ul class="divide-y divide-slate-100">${doGrupo.map((a) => itemHTML(a, !v.has(a.id))).join('')}</ul>
          ${mais}
        </section>`;
    }).join('');

    const pwa = Fin.pwa?.estado || {};
    const ocultos = qtdDispensados();
    const panel = Fin.ui.openModal(`
      <div class="p-4 sm:p-5">
        <div class="flex items-center gap-3">
          <span class="text-xl" aria-hidden="true">🔔</span>
          <h2 class="font-semibold flex-1">Notificações</h2>
          <button data-fechar class="icon-btn" aria-label="Fechar">×</button>
        </div>
        ${itens.length ? `
          <div class="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <label class="inline-flex items-center gap-2 cursor-pointer px-0.5"><input type="checkbox" data-selecionar-todos class="accent-prim-600 w-4 h-4"> Selecionar todas</label>
            <span class="ml-auto hidden sm:inline">Marque as que você já viu e não quer mais ver</span>
          </div>
          ${secoes}
          <div class="sticky bottom-0 -mx-4 sm:-mx-5 px-4 sm:px-5 py-3 mt-2 bg-white border-t border-slate-100 flex items-center gap-2">
            <button data-dispensar-sel class="btn btn-ghost !py-2 flex-1 sm:flex-none" disabled>Dispensar selecionadas</button>
            <span class="text-xs text-slate-500 flex-1 hidden sm:block">Somem até acontecer de novo.</span>
          </div>` : `
          <div class="text-center py-8">
            <div class="text-3xl" aria-hidden="true">✓</div>
            <p class="font-medium mt-1">Tudo em dia</p>
            <p class="text-sm text-slate-500">${ocultos ? 'Nenhum aviso novo.' : `Nenhuma conta atrasada ou vencendo nos próximos ${DIAS_ANTES} dias.`}</p>
          </div>`}
        ${ocultos ? `
          <p class="text-xs text-slate-500 mt-3">${ocultos} aviso${ocultos > 1 ? 's' : ''} dispensado${ocultos > 1 ? 's' : ''} (continua${ocultos > 1 ? 'm' : ''} valendo, só não aparece${ocultos > 1 ? 'm' : ''}).
            <button data-restaurar class="text-prim-700 font-medium hover:underline">Mostrar de novo</button></p>` : ''}
        ${pwa.suportado ? `
          <div class="flex flex-wrap items-center gap-2 border-t border-slate-100 mt-4 pt-3 text-xs text-slate-500">
            <span class="flex-1">Versão do app: <span data-versao>…</span>${pwa.novaVersao ? ' · <b class="text-amber-800">nova versão disponível</b>' : ''}</span>
            ${pwa.novaVersao ? '' : '<button data-procurar class="text-prim-700 font-medium hover:underline">Procurar atualização</button>'}
          </div>` : ''}
      </div>`, 'Notificações');

    // Seleção para dispensar
    const caixas = () => [...panel.querySelectorAll('[data-dispensar]')];
    const btnDisp = panel.querySelector('[data-dispensar-sel]');
    const atualizarSel = () => {
      const n = caixas().filter((c) => c.checked).length;
      if (btnDisp) {
        btnDisp.disabled = !n;
        btnDisp.textContent = n ? `Dispensar ${n} selecionada${n > 1 ? 's' : ''}` : 'Dispensar selecionadas';
        btnDisp.classList.toggle('btn-primary', !!n);
        btnDisp.classList.toggle('btn-ghost', !n);
      }
      const todos = panel.querySelector('[data-selecionar-todos]');
      if (todos) { todos.checked = n > 0 && n === caixas().length; todos.indeterminate = n > 0 && n < caixas().length; }
    };
    panel.addEventListener('change', (e) => {
      if (e.target.matches('[data-selecionar-todos]')) caixas().forEach((c) => { c.checked = e.target.checked; });
      if (e.target.matches('[data-dispensar], [data-selecionar-todos]')) atualizarSel();
    });

    panel.addEventListener('click', (e) => {
      const t = e.target;
      if (t.closest('[data-dispensar-sel]')) {
        const sel = caixas().filter((c) => c.checked).map((c) => c.dataset.dispensar);
        if (!sel.length) return;
        gravarDispensados(new Set([...dispensados(), ...sel]));
        Fin.ui.toast(`${sel.length} aviso${sel.length > 1 ? 's' : ''} dispensado${sel.length > 1 ? 's' : ''}. Volta${sel.length > 1 ? 'm' : ''} a aparecer se acontecer de novo.`);
        abrir();
        return;
      }
      if (t.closest('[data-restaurar]')) { gravarDispensados([]); abrir(); return; }
      if (t.closest('[data-ver-atrasadas]')) {
        Object.assign(Fin.pages.planilha.estado, { periodo: 'tudo', status: 'atrasado', busca: '', tipo: 'despesa', categoria: '', forma: '' });
      }
      if (t.closest('[data-atualizar-agora]')) { Fin.pwa.atualizar(); return; }
      if (t.closest('[data-procurar]')) { Fin.ui.closeModal(); procurar(); return; }
      if (t.closest('a[href^="#"], [data-fechar]')) Fin.ui.closeModal();
    });
    marcarVistos(itens);
    desenhar();
    const ver = await Fin.pwa?.versao?.().catch(() => null);
    const alvo = panel.querySelector('[data-versao]');
    if (alvo) alvo.textContent = `${Fin.config?.versaoApp || ''}${ver ? ` (${ver})` : ''}` || '—';
  }

  async function procurar() {
    const botoes = document.querySelectorAll('[data-atualizar]');
    botoes.forEach((b) => b.classList.add('atualizar-procurando'));
    try {
      const achou = await Fin.pwa.procurar();
      if (!achou) {
        const v = await Fin.pwa.versao().catch(() => null);
        Fin.ui.toast(`O app já está na versão mais nova: ${Fin.config?.versaoApp || ''}${v ? ` (${v})` : ''}.`);
      }
    } catch {
      Fin.ui.toast('Não foi possível procurar atualização (sem internet?).', 'erro');
    } finally {
      botoes.forEach((b) => b.classList.remove('atualizar-procurando'));
      desenhar();
    }
  }

  /** Botão Atualizar do topo: atualiza se houver versão nova; senão procura. */
  function clicarAtualizar() {
    if (Fin.pwa?.estado.novaVersao) Fin.pwa.atualizar();
    else procurar();
  }

  function iniciar() {
    let pendente = null;
    const agendar = () => { clearTimeout(pendente); pendente = setTimeout(desenhar, 400); };
    ['fin:alterado', 'fin:dados-externos', 'fin:drive', 'fin:pwa', 'fin:desbloqueado', 'fin:bloqueado'].forEach((ev) => window.addEventListener(ev, agendar));
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') agendar(); });
    setInterval(desenhar, 5 * 60 * 1000); // vira o dia, vencimentos mudam
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-avisos]')) abrir();
      else if (e.target.closest('[data-atualizar]')) clicarAtualizar();
    });
    desenhar();
  }

  return { iniciar, lista, desenhar, abrir, procurar };
})();
