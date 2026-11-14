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

  /** Lista de avisos: { id, nivel ('critico'|'atencao'|'info'), grupo, icone, titulo, sub, valor, acao }. */
  function lista() {
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
      for (const l of F.lancamentos()) {
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

      const b = Fin.storage.situacaoBackup();
      if (b.lembrar) {
        out.push({
          id: `backup:${b.ultimo || 'nunca'}`, nivel: 'atencao', grupo: 'app', icone: '🛟',
          titulo: 'Fazer backup', sub: b.ultimo ? `último backup há ${b.dias} dias, com alterações novas` : 'você ainda não fez nenhum backup',
          acao: { href: '#/dados', rotulo: 'Fazer backup' },
        });
      }
    }

    const dv = Fin.drive?.estado;
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
    ['orcamento', 'Orçamento'],
    ['app', 'App'],
  ];

  function itemHTML(a, novo) {
    let botao = ''; // item de lançamento: a linha inteira abre a edição
    if (a.acao.href) botao = `<a href="${a.acao.href}" class="btn btn-ghost !py-1.5 !px-3 text-xs shrink-0">${esc(a.acao.rotulo)}</a>`;
    else if (a.acao.drive) botao = '<button data-drive="reconectar" data-fechar class="btn btn-ghost !py-1.5 !px-3 text-xs shrink-0">Reconectar</button>';
    else if (a.acao.atualizar) botao = '<button data-atualizar-agora class="btn btn-primary !py-1.5 !px-3 text-xs shrink-0">Atualizar</button>';
    const clicavel = a.acao.edit ? `data-edit="${esc(a.acao.edit)}" role="button" tabindex="0"` : '';
    return `
      <li class="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-xl ${a.acao.edit ? 'hover:bg-slate-50 cursor-pointer' : ''}" ${clicavel}>
        <span class="w-9 h-9 shrink-0 rounded-full grid place-items-center text-base font-bold ${COR[a.nivel]}" aria-hidden="true">${esc(a.icone)}</span>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium truncate">${novo ? '<span class="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1.5 align-middle" title="Novo"></span><span class="sr-only">Novo: </span>' : ''}${esc(a.titulo)}</div>
          <div class="text-xs ${a.nivel === 'critico' ? 'text-rose-700' : 'text-slate-500'}">${esc(a.sub)}</div>
        </div>
        ${a.valor != null ? `<div class="text-sm font-semibold tabular-nums shrink-0">${fmt.brl(a.valor)}</div>` : ''}
        ${botao}
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
          mais = `<a href="#/planilha" data-ver-atrasadas class="block text-center text-sm text-emerald-700 font-medium pt-2 hover:underline">Ver todas as ${at.length} atrasadas na Planilha →</a>`;
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
    const panel = Fin.ui.openModal(`
      <div class="p-4 sm:p-5">
        <div class="flex items-center gap-3">
          <span class="text-xl" aria-hidden="true">🔔</span>
          <h2 class="font-semibold flex-1">Notificações</h2>
          <button data-fechar class="icon-btn" aria-label="Fechar">×</button>
        </div>
        ${itens.length ? secoes : `
          <div class="text-center py-8">
            <div class="text-3xl" aria-hidden="true">✓</div>
            <p class="font-medium mt-1">Tudo em dia</p>
            <p class="text-sm text-slate-500">Nenhuma conta atrasada ou vencendo nos próximos ${DIAS_ANTES} dias.</p>
          </div>`}
        ${pwa.suportado ? `
          <div class="flex flex-wrap items-center gap-2 border-t border-slate-100 mt-4 pt-3 text-xs text-slate-500">
            <span class="flex-1">Versão do app: <span data-versao>…</span>${pwa.novaVersao ? ' · <b class="text-amber-800">nova versão disponível</b>' : ''}</span>
            ${pwa.novaVersao ? '' : '<button data-procurar class="text-emerald-700 font-medium hover:underline">Procurar atualização</button>'}
          </div>` : ''}
      </div>`, 'Notificações');

    panel.addEventListener('click', (e) => {
      const t = e.target;
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
    if (alvo) alvo.textContent = ver || '—';
  }

  async function procurar() {
    const botoes = document.querySelectorAll('[data-atualizar]');
    botoes.forEach((b) => b.classList.add('atualizar-procurando'));
    try {
      const achou = await Fin.pwa.procurar();
      if (!achou) {
        const v = await Fin.pwa.versao().catch(() => null);
        Fin.ui.toast(`O app já está na versão mais nova${v ? ` (${v})` : ''}.`);
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
