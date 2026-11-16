/**
 * pages/dashboard.js — Tela inicial: resumo do mês, evolução, categorias, contas e faturas.
 */
window.Fin = window.Fin || {};
Fin.pages = Fin.pages || {};

Fin.pages.dashboard = (() => {
  const fmt = Fin.fmt;
  const esc = fmt.esc;
  const F = Fin.finance;
  /** Título de cartão com ícone em círculo colorido. */
  const titulo = (icone, cor, texto, cls = '') => `<h2 class="font-semibold flex items-center gap-2 ${cls}">${Fin.icones.badge(icone, cor, 'w-7 h-7', 'w-4 h-4')}${texto}</h2>`;
  const card = (inner, cls = '') => `<section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5 min-w-0 ${cls}">${inner}</section>`;

  /** Resumo do mês: saldo previsto + receitas, despesas e a pagar num só cartão compacto. */
  /** "Boa tarde, Gilson!" com a foto de quem entrou neste aparelho. */
  function saudacaoHTML() {
    const M = Fin.membros;
    if (!M) return '';
    const m = M.atual();
    const nome = M.primeiroNome(m);
    const data = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    const semPerfil = !m.nome && !m.foto;
    return `
      <div class="flex items-center gap-3">
        <a href="#/configuracoes" class="shrink-0 rounded-full" aria-label="Perfil e configurações">${M.avatar(m, { tam: 'w-11 h-11', txt: 'text-sm', anel: 'ring-2 ring-white shadow-sm' })}</a>
        <div class="min-w-0 flex-1">
          <p class="text-lg font-semibold text-slate-900 leading-tight truncate">${M.saudacao()}${nome ? `, ${fmt.esc(nome)}` : ''}!</p>
          <p class="text-xs text-slate-500 saudacao-data">${data}${semPerfil ? ` · <a href="#/configuracoes" class="text-prim-700 font-medium hover:underline">Pôr seu nome e foto</a>` : ''}</p>
        </div>
      </div>`;
  }

  /** Minigráfico (linha) do resultado dos últimos meses, em branco sobre a cor do app. */
  function sparkline(valores) {
    if (valores.length < 2) return '';
    const w = 112, h = 48, p = 4;
    const min = Math.min(...valores), max = Math.max(...valores);
    const amp = max - min || 1;
    const pts = valores.map((v, i) => [p + (i * (w - 2 * p)) / (valores.length - 1), h - p - ((v - min) / amp) * (h - 2 * p)]);
    const zero = min < 0 && max > 0 ? h - p - ((0 - min) / amp) * (h - 2 * p) : null;
    const [lx, ly] = pts[pts.length - 1];
    return `<svg viewBox="0 0 ${w} ${h}" class="w-24 h-11 sm:w-28 sm:h-12 shrink-0" aria-hidden="true" focusable="false">
      ${zero != null ? `<line x1="${p}" x2="${w - p}" y1="${zero}" y2="${zero}" stroke="rgba(255,255,255,.35)" stroke-dasharray="3 3"/>` : ''}
      <polyline points="${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
      ${pts.slice(0, -1).map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="#fff" opacity=".75"/>`).join('')}
      <circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="3.6" fill="#fff"/>
    </svg>`;
  }

  /** Entradas / Saídas / A pagar: círculo colorido com seta, rótulo, valor e detalhe. */
  function io(icone, fundo, rotulo, valor, sub, corValor = 'text-slate-900') {
    return `
      <div class="flex flex-col sm:flex-row items-start gap-1.5 sm:gap-2.5 min-w-0">
        <span class="w-8 h-8 sm:w-9 sm:h-9 rounded-full grid place-items-center text-white shrink-0 ${fundo}" aria-hidden="true">${Fin.icone(icone, 'w-4 h-4 sm:w-[18px] sm:h-[18px]')}</span>
        <div class="min-w-0">
          <div class="text-[11px] sm:text-xs text-slate-500">${rotulo}</div>
          <div class="text-[13px] sm:text-base font-semibold tabular-nums whitespace-nowrap ${corValor}">${valor}</div>
          <div class="text-[11px] text-slate-500 truncate">${sub}</div>
        </div>
      </div>`;
  }

  /**
   * Resultado do mês (v2026-11-16.3): faixa na cor do app com o saldo, a variação sobre o mês
   * anterior e o minigráfico dos últimos 6 meses; embaixo Entradas, Saídas e A pagar.
   */
  function hero(r, ym) {
    const negativo = r.saldo < 0;
    const hist = F.historico(ym, 6);
    const anterior = hist.length > 1 ? hist[hist.length - 2].saldo : null;
    const variacao = anterior ? (r.saldo - anterior) / Math.abs(anterior) : null;
    const chipVar = variacao == null || !Number.isFinite(variacao) ? ''
      : `<span class="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 font-medium">${variacao >= 0 ? '▲' : '▼'} ${Math.round(Math.abs(variacao) * 100)}% vs. mês passado</span>`;
    const uso = r.receitas > 0 ? r.despesas / r.receitas : null; // quanto da receita as despesas consomem
    const corUso = uso == null ? '#94a3b8' : uso > 1 ? '#d03b3b' : uso > 0.9 ? '#fab219' : '#0ca30c';
    const textoUso = uso == null ? 'sem receitas lançadas no mês'
      : uso > 1 ? '<span class="text-rose-700">! gastando mais do que ganha</span>'
      : `sobra ${Math.round((1 - uso) * 100)}% da receita`;
    const pagar = r.atrasadas
      ? `<span class="text-rose-700 font-medium">! ${r.atrasadas} atrasada${r.atrasadas > 1 ? 's' : ''}</span>`
      : r.qtdAPagar ? `${r.qtdAPagar} ${r.qtdAPagar === 1 ? 'conta' : 'contas'}` : 'tudo pago ✓';
    const patrimonio = Fin.inv?.temDados() ? Fin.inv.resumo().patrimonio : null;
    return `
      <section class="rounded-2xl shadow-sm overflow-hidden bg-white min-w-0" data-hero>
        <div class="hero-topo text-white px-4 sm:px-5 pt-4 pb-4">
          <div class="flex items-start gap-3">
            <div class="flex-1 min-w-0">
              <div class="text-[11px] font-semibold uppercase tracking-wider text-white/75">Resultado do mês</div>
              <div class="text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums mt-0.5">${fmt.brl(r.saldo)}</div>
              <div class="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-xs">
                ${negativo ? '<span class="inline-flex items-center gap-1 rounded-full bg-rose-500/90 px-2 py-0.5 font-medium">! saldo negativo</span>' : ''}
                ${chipVar}
                <span class="text-white/80" title="recebido ${fmt.brl(r.recebido)} − pago ${fmt.brl(r.pago)}">realizado <b class="text-white tabular-nums">${fmt.brl(r.saldoRealizado)}</b></span>
              </div>
            </div>
            ${sparkline(hist.map((m) => m.saldo))}
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2 sm:gap-4 px-4 sm:px-5 pt-4">
          ${io('entrada', 'bg-emerald-600', 'Entradas', fmt.brl(r.receitas), `recebido ${fmt.brl(r.recebido)}`, 'text-emerald-700')}
          ${io('saida', 'bg-rose-600', 'Saídas', fmt.brl(r.despesas), `pago ${fmt.brl(r.pago)}`, 'text-rose-700')}
          ${io('relogio', r.atrasadas ? 'bg-rose-500' : 'bg-amber-500', 'A pagar', fmt.brl(r.aPagar), pagar)}
        </div>
        <div class="px-4 sm:px-5 pb-4 mt-4">
          <div class="h-1.5 rounded-full bg-slate-100 overflow-hidden" role="meter" aria-label="Despesas sobre a receita" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${uso == null ? 0 : Math.round(uso * 100)}">
            <div class="h-full rounded-full" style="width:${uso == null ? 0 : Math.min(100, uso * 100)}%;background:${corUso}"></div>
          </div>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500">
            <span>Despesas = <b class="text-slate-700">${uso == null ? '—' : `${Math.round(uso * 100)}%`}</b> da receita · ${textoUso}</span>
            ${r.aportes > 0 ? `<span class="inline-flex items-center gap-1">${Fin.icone('cofrinho', 'w-4 h-4 text-emerald-700')} investido no mês <b class="text-emerald-700 tabular-nums">${fmt.brl(r.aportes)}</b></span>` : ''}
            ${patrimonio != null ? `<a href="#/investimentos" class="inline-flex items-center gap-1 text-prim-700 font-medium hover:underline md:ml-auto">${Fin.icone('alta', 'w-4 h-4')} patrimônio <span class="tabular-nums">${fmt.brl(patrimonio)}</span> →</a>` : ''}
          </div>
        </div>
      </section>`;
  }

  /** Atalhos de destaque: Perguntar à IA (sem custo) e Aprender (próximo guia não lido). */
  function atalhosHTML() {
    const E = Fin.educacao;
    let aprender = '';
    if (E) {
      const lidos = new Set(Fin.storage.prefs().guiasLidos || []);
      const prox = E.ARTIGOS.find((a) => !lidos.has(a.id));
      const n = E.ARTIGOS.filter((a) => lidos.has(a.id)).length;
      aprender = `
        <a href="#/educacao${prox ? `?artigo=${prox.id}` : ''}" class="flex items-center gap-3 bg-white rounded-2xl shadow-sm p-3 hover:ring-2 hover:ring-emerald-200 min-w-0">
          ${Fin.icones.badge('livro', 'emerald', 'w-10 h-10', 'w-5 h-5')}
          <span class="flex-1 min-w-0">
            <span class="block text-sm font-semibold">Aprender <span class="text-[11px] font-normal text-slate-500">· ${n} de ${E.ARTIGOS.length} guias lidos</span></span>
            <span class="block text-xs text-slate-500 truncate">${prox ? `Próximo: ${esc(prox.titulo)} · ${prox.min} min` : 'Todos os guias lidos ✓ — reveja quando quiser'}</span>
            <span class="block h-1 rounded-full bg-slate-100 mt-1.5 overflow-hidden" aria-hidden="true"><span class="block h-full bg-emerald-500 rounded-full" style="width:${(n / E.ARTIGOS.length) * 100}%"></span></span>
          </span>
        </a>`;
    }
    const ia = Fin.ia ? `
      <button type="button" data-act="perguntar-ia" class="flex items-center gap-3 bg-white rounded-2xl shadow-sm p-3 hover:ring-2 hover:ring-violet-200 text-left min-w-0">
        ${Fin.icones.badge('mensagem', 'violet', 'w-10 h-10', 'w-5 h-5')}
        <span class="flex-1 min-w-0">
          <span class="block text-sm font-semibold">Perguntar à IA</span>
          <span class="block text-xs text-slate-500 truncate">Análise do mês no ChatGPT ou Gemini, sem custo</span>
        </span>
      </button>` : '';
    return aprender || ia ? `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${aprender}${ia}</div>` : '';
  }

  /**
   * Próximos 30 dias: contas em aberto atrasadas e as que vencem até daqui a 30 dias
   * (compromissos já conhecidos), com data em destaque e total. Segue o filtro por pessoa.
   */
  function proximosHTML() {
    const hoje = fmt.todayISO();
    const d30 = new Date(); d30.setDate(d30.getDate() + 30);
    const limite = `${d30.getFullYear()}-${String(d30.getMonth() + 1).padStart(2, '0')}-${String(d30.getDate()).padStart(2, '0')}`;
    const cats = F.catsInvestimento();
    const itens = F.lancamentos()
      .filter((l) => l.tipo === 'despesa' && !F.isPago(l) && !F.ehAporte(l, cats) && F.dataRef(l) && F.dataRef(l) <= limite)
      .filter((l) => F.dataRef(l) >= hoje || F.statusEfetivo(l) === 'atrasado')
      .sort((a, b) => F.dataRef(a).localeCompare(F.dataRef(b)));
    const falta = (l) => Math.max(0, F.valor(l) - (l.status === 'parcial' ? l.valorPago || 0 : 0));
    const total = itens.reduce((s, l) => s + falta(l), 0);
    const atrasadas = itens.filter((l) => F.dataRef(l) < hoje);
    const MES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const linhas = itens.slice(0, 7).map((l) => {
      const d = F.dataRef(l);
      const atras = d < hoje;
      return `
        <li class="flex items-center gap-3 py-2.5 cursor-pointer" data-edit="${l.id}" role="button" tabindex="0" aria-label="Editar ${esc(l.descricao || l.categoria)}">
          <span class="w-11 shrink-0 rounded-xl text-center py-1 ${atras ? 'bg-rose-50 text-rose-700' : d === hoje ? 'bg-amber-50 text-amber-800' : 'bg-slate-50 text-slate-700'}">
            <span class="block text-base font-semibold leading-tight tabular-nums">${d.slice(8, 10)}</span>
            <span class="block text-[10px] font-medium tracking-wide">${MES[Number(d.slice(5, 7)) - 1]}</span>
          </span>
          <span class="flex-1 min-w-0">
            <span class="flex items-center gap-1.5 text-sm font-medium min-w-0">${Fin.ui.autorMini(l)}<span class="truncate">${esc(l.descricao || l.categoria)}</span></span>
            <span class="block text-xs ${atras ? 'text-rose-700' : 'text-slate-500'} truncate">${atras ? `atrasada · ${esc(l.categoria || '')}` : d === hoje ? 'vence hoje' : esc([l.categoria, l.formaPagamento].filter(Boolean).join(' · '))}</span>
          </span>
          <span class="text-sm font-semibold tabular-nums text-rose-700 shrink-0">− ${fmt.brl(falta(l))}</span>
        </li>`;
    }).join('');
    return card(`
      <div class="flex items-start justify-between gap-2 mb-1">
        <div>${titulo('calendario', 'amber', 'Próximos 30 dias')}
          <p class="text-xs text-slate-500 mt-0.5">compromissos já conhecidos${atrasadas.length ? ` · <span class="text-rose-700 font-medium">${atrasadas.length} atrasada${atrasadas.length > 1 ? 's' : ''}</span>` : ''}</p></div>
        ${itens.length ? `<div class="text-right shrink-0"><div class="text-[11px] text-slate-500">total</div><div class="text-sm font-semibold tabular-nums">${fmt.brl(total)}</div></div>` : ''}
      </div>
      ${itens.length ? `<ul class="divide-y divide-slate-100">${linhas}</ul>
        ${itens.length > 7 ? `<a href="#/lancamentos" data-filtro-status="pendentes" class="block text-center text-sm text-prim-700 font-medium pt-3 hover:underline">Ver todas (${itens.length})</a>` : ''}`
        : '<p class="text-sm text-slate-500 py-3">Nada a pagar nos próximos 30 dias. 🎉</p>'}`);
  }

  function contasHTML(contas, ym) {
    if (!contas.length) {
      return '<p class="text-sm text-slate-500 py-3">Nenhuma conta em aberto neste mês. 🎉</p>';
    }
    const rows = contas.slice(0, 6).map((l) => `
      <li class="flex items-center gap-3 py-2.5" data-edit="${l.id}" role="button" tabindex="0">
        ${Fin.ui.catIcon(l.categoriaIcone, l.categoria, l.tipo)}
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium truncate">${esc(l.descricao || l.categoria)}</div>
          <div class="text-xs text-slate-500">vence ${fmt.date(F.dataRef(l))}</div>
        </div>
        <div class="text-right shrink-0">
          <div class="text-sm font-semibold tabular-nums">${l.status === 'parcial'
            ? `<span class="text-xs font-normal text-slate-500">falta</span> ${fmt.brl(F.valor(l) - (l.valorPago || 0))}`
            : fmt.brl(F.valor(l))}</div>
          ${Fin.ui.statusPill(l)}
        </div>
      </li>`).join('');
    const mais = contas.length > 6
      ? `<a href="#/lancamentos" data-filtro-status="pendentes" class="block text-center text-sm text-prim-700 font-medium pt-3 hover:underline">Ver todas (${contas.length})</a>`
      : '';
    return `<ul class="divide-y divide-slate-100">${rows}</ul>${mais}`;
  }

  function categoriasHTML(ym) {
    const cats = Fin.state.detalharFaturas ? F.porCategoriaDetalhada(ym) : F.porCategoria(ym, 'despesa');
    if (!cats.length) return '<p class="text-sm text-slate-500 py-3">Sem despesas neste mês.</p>';
    const total = cats.reduce((s, c) => s + c.total, 0);
    let data = cats.map((c) => ({ label: c.categoria, icone: c.icone, total: c.total }));
    if (data.length > 7) {
      const outros = data.slice(6).reduce((s, d) => s + d.total, 0);
      data = [...data.slice(0, 6), { label: `Outras (${cats.length - 6})`, icone: '', total: outros }];
    }
    return Fin.charts.hbars(data, { total });
  }

  function faturasHTML(ym) {
    const fs = F.faturas(ym);
    if (!fs.length) return '<p class="text-sm text-slate-500 py-3">Nenhuma compra no cartão com fatura neste mês.</p>';
    return `
      <ul class="divide-y divide-slate-100">${fs.map((f) => `
        <li><a href="#/cartoes" data-ir-cartao="${esc(f.cartao)}" class="flex items-center gap-3 py-2.5 hover:bg-slate-50 rounded-lg">
          ${Fin.icones.badge('cartao', 'violet', 'w-10 h-10')}
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate">${esc(f.cartao)}</div>
            <div class="text-xs text-slate-500">${f.qtd} ${f.qtd === 1 ? 'compra' : 'compras'}</div>
          </div>
          <div class="text-sm font-semibold tabular-nums">${fmt.brl(f.total)}</div>
          <span class="text-slate-300" aria-hidden="true">›</span>
        </a></li>`).join('')}
      </ul>
      <p class="text-xs text-slate-400 mt-2">O valor já entra nas despesas pelo lançamento de pagamento da fatura.</p>`;
  }

  /** Resumo do orçamento: as 4 categorias mais perto (ou acima) do limite. */
  function orcamentoHTML(ym) {
    const o = F.orcamento(ym);
    if (!o.itens.length) {
      return card(`
        <div class="flex flex-wrap items-center gap-3">
          ${Fin.icones.badge('alvo', 'orange', 'w-10 h-10')}
          <div class="flex-1 min-w-[12rem]">
            <h2 class="font-semibold">Orçamento</h2>
            <p class="text-sm text-slate-500">Defina limites mensais por categoria e acompanhe aqui.</p>
          </div>
          <a href="#/orcamento" class="btn btn-ghost">Definir orçamentos</a>
        </div>`);
    }
    const top = o.itens.slice(0, 4);
    return card(`
      <div class="flex items-center justify-between gap-3 mb-1">
        ${titulo('alvo', 'orange', 'Orçamento do mês')}
        <a href="#/orcamento" class="text-sm text-prim-700 font-medium hover:underline">Ver tudo (${o.itens.length})</a>
      </div>
      <ul class="grid md:grid-cols-2 md:gap-x-8 divide-y md:divide-y-0 divide-slate-100">${top.map(Fin.pages.orcamento.linhaHTML).join('')}</ul>`);
  }

  /* ---------- Saúde financeira (índice 0–100) e endividamento ---------- */

  const DIVIDA_SERIES = [
    { key: 'parcCartao', label: 'Parcelas no cartão', color: '#eb6834' },
    { key: 'parcOutras', label: 'Outras parcelas', color: '#f2a65a' },
    { key: 'rotativo', label: 'Rotativo do cartão', color: '#d03b3b' },
  ];

  function saudeHTML(serie) {
    if (!serie.length) return '';
    const atual = serie[serie.length - 1];
    const base = serie[Math.max(0, serie.length - 4)];
    const delta = atual.score - base.score;
    const meses = serie.length - 1 - Math.max(0, serie.length - 4);
    const tendencia = meses > 0 && delta !== 0
      ? `<span class="${delta > 0 ? 'text-emerald-800' : 'text-rose-700'} font-medium">${delta > 0 ? '▲' : '▼'} ${Math.abs(delta)} ponto${Math.abs(delta) > 1 ? 's' : ''}</span> em ${meses} ${meses > 1 ? 'meses' : 'mês'}`
      : meses > 0 ? 'estável nos últimos meses' : '';
    const f = atual.faixa;
    const vista = Fin.state.saudeVista || 'indice';
    const d = atual.dividas;
    const pilares = atual.pilares.map((p) => `
      <li class="py-2">
        <div class="flex items-center gap-2 text-sm">
          <span aria-hidden="true">${p.icone}</span>
          <span class="flex-1 min-w-0 font-medium truncate">${esc(p.nome)}</span>
          <span class="pill ${p.faixa.classe}"><span aria-hidden="true">${p.faixa.icone}</span>${Math.round(p.pts)}/${Fin.saude.MAX}</span>
        </div>
        <div class="h-1.5 rounded-full bg-slate-100 mt-1.5 overflow-hidden" aria-hidden="true">
          <div class="h-full rounded-full" style="width:${(p.pts / Fin.saude.MAX) * 100}%;background:${p.faixa.cor}"></div>
        </div>
        <div class="text-xs text-slate-500 mt-1">${p.texto}</div>
      </li>`).join('');
    const faltam = ['gasto', 'contas', 'dividas', 'reserva'].filter((id) => !atual.pilares.some((p) => p.id === id));
    const nomes = { gasto: 'gasto × renda (sem receitas no mês)', contas: 'contas em dia (nenhuma venceu ainda)', dividas: 'dívidas (sem receitas no mês)', reserva: 'reserva de emergência' };
    return card(`
      <div class="flex items-start justify-between gap-3 flex-wrap">
        <div>
          ${titulo('pulso', 'emerald', 'Saúde financeira')}
          <p class="text-xs text-slate-500">Índice de 0 a 100 · ${fmt.monthLong(atual.ym)}</p>
        </div>
        <div class="seg seg-neutro w-full sm:w-64" role="radiogroup" aria-label="Visão">
          <label><input type="radio" name="saude-vista" value="indice" ${vista === 'indice' ? 'checked' : ''}><span>Índice</span></label>
          <label><input type="radio" name="saude-vista" value="divida" ${vista === 'divida' ? 'checked' : ''}><span>Endividamento</span></label>
        </div>
      </div>

      ${vista === 'indice' ? `
      <div class="grid grid-cols-1 md:grid-cols-[11rem_1fr] gap-4 mt-3 items-start">
        <div class="flex md:flex-col items-center md:items-start gap-3 md:gap-1">
          <div class="text-5xl font-semibold tracking-tight tabular-nums">${atual.score}<span class="text-lg text-slate-400 font-normal">/100</span></div>
          <div class="space-y-1">
            <span class="pill ${f.classe} !text-xs"><span aria-hidden="true">${f.icone}</span>${f.nome}</span>
            ${tendencia ? `<div class="text-xs text-slate-500">${tendencia}</div>` : ''}
          </div>
        </div>
        <ul class="divide-y divide-slate-100 min-w-0">${pilares}</ul>
      </div>
      ${faltam.length ? `<p class="text-xs text-slate-400 mt-1">Fora do cálculo neste mês: ${faltam.map((k) => nomes[k]).join(', ')}.${faltam.includes('reserva') ? ' <a href="#/investimentos?aba=reserva" class="text-prim-700 font-medium hover:underline">Criar reserva</a>' : ''}</p>` : ''}
      <div id="chart-saude" class="w-full min-w-0 overflow-hidden mt-3"></div>
      <div class="flex flex-wrap gap-4 text-xs text-slate-600 mt-1">${Fin.saude.FAIXAS.map((x) => `
        <span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm" style="background:${x.cor};opacity:.6"></span><span aria-hidden="true">${x.icone}</span>${x.nome} ${x.id === 'bom' ? '(80+)' : x.id === 'atencao' ? '(40–79)' : '(até 39)'}</span>`).join('')}
      </div>` : `
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 text-sm">
        <div><div class="text-xs text-slate-500">Dívida a vencer</div><div class="text-lg font-semibold tabular-nums">${fmt.brl(d.estoque)}</div></div>
        <div><div class="text-xs text-slate-500">Parcelas + juros no mês</div><div class="text-lg font-semibold tabular-nums">${fmt.brl(d.servico)}</div></div>
        <div class="col-span-2 sm:col-span-1"><div class="text-xs text-slate-500">Comprometimento da renda</div>
          <div class="text-lg font-semibold tabular-nums ${atual.comprometimento > 0.3 ? 'text-rose-700' : ''}">${atual.comprometimento == null ? '—' : `${Math.round(atual.comprometimento * 100)}%`}
          <span class="text-xs font-normal text-slate-500">${atual.comprometimento == null ? '' : atual.comprometimento > 0.3 ? '! acima de 30%' : '✓ até 30%'}</span></div></div>
      </div>
      <div class="flex items-start justify-between gap-3 flex-wrap mt-3">${Fin.charts.legend(DIVIDA_SERIES)}</div>
      <div id="chart-saude" class="w-full min-w-0 overflow-hidden mt-2"></div>
      <p class="text-xs text-slate-400 mt-1">Barras: quanto ainda se devia no fim de cada mês — parcelas já assumidas (cartão e lançamentos parcelados) + saldo que ficou no rotativo.</p>`}

      <details class="mt-3">
        <summary class="text-xs text-slate-500 flex items-center gap-1"><span class="chev">▸</span> Como o índice é calculado</summary>
        <div class="text-xs text-slate-600 mt-2 space-y-1.5">
          <p>Inspirado no <b>FinHealth Score</b> (Financial Health Network), que mede a saúde financeira por comportamentos — gastar, poupar e pedir emprestado — e não pelo tamanho da renda. Cada pilar vale até 25 pontos:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li><b>Gasta menos do que ganha:</b> nota máxima guardando 20% da renda ou mais (regra 50/30/20); zero com gasto 10% acima da renda. Aportes em investimento contam como dinheiro guardado.</li>
            <li><b>Contas em dia:</b> parte das despesas vencidas no mês pagas até o vencimento. Fatura paga a menos não conta como em dia.</li>
            <li><b>Dívidas sob controle:</b> parcelas (cartão e parcelados), rotativo e juros do mês ÷ renda. Nota máxima até 10%; zero a partir de 40%. Bancos e o Banco Central costumam usar 30% como teto prudente. Mês com rotativo vale no máximo 12 pontos.</li>
            <li><b>Reserva de emergência:</b> meses de custo essencial cobertos pela reserva (Investimentos → Reserva). Nota máxima ao atingir a meta de meses escolhida lá (padrão 6).</li>
          </ul>
          <p>Pilar sem dados no mês fica de fora e o índice é proporcional aos demais. Faixas: <b>Saudável</b> 80+, <b>Atenção</b> 40–79, <b>Vulnerável</b> até 39. O mês atual é parcial: usa o previsto até o fim do mês.</p>
        </div>
      </details>`);
  }

  function desenharSaude(el, serie) {
    if (!el || !serie.length) return;
    if ((Fin.state.saudeVista || 'indice') === 'indice') {
      Fin.charts.line(el, serie.map((m) => ({
        ym: m.ym, valor: m.score, cor: m.faixa.cor,
        extra: `${m.faixa.icone} ${m.faixa.nome}<br>${m.pilares.map((p) => `${p.icone} ${Math.round(p.pts)}/25`).join(' · ')}`,
      })), {
        color: '#2a78d6', nome: 'Índice', label: 'Índice de saúde financeira nos últimos meses', pontos: true,
        escala: { min: 0, max: 100, passo: 25 }, formato: (v) => String(Math.round(v)),
        faixas: [{ de: 80, ate: 100, cor: '#0ca30c' }, { de: 40, ate: 80, cor: '#fab219' }, { de: 0, ate: 40, cor: '#d03b3b' }],
      });
    } else {
      Fin.charts.columns(el, serie.map((m) => ({
        ym: m.ym, parcCartao: m.dividas.futCartao, parcOutras: m.dividas.futOutras, rotativo: m.dividas.rotativo,
        saldo: m.dividas.estoque,
        extra: m.comprometimento == null ? '' : `Parcelas + juros no mês: ${Math.round(m.comprometimento * 100)}% da renda`,
      })), {
        series: DIVIDA_SERIES, stacked: true, totalLabel: 'Dívida a vencer', selected: serie[serie.length - 1].ym,
        label: 'Dívida a vencer no fim de cada mês',
        onSelect: (m) => { Fin.state.mes = m; Fin.router.render(); },
      });
    }
  }

  function tabelaHistorico(hist) {
    return `
      <details class="mt-3">
        <summary class="text-xs text-slate-500 flex items-center gap-1"><span class="chev">▸</span> Ver tabela</summary>
        <div class="table-wrap mt-2 border border-slate-200 rounded-xl">
          <table>
            <thead><tr><th>Mês</th><th class="num">Receitas</th><th class="num">Despesas</th><th class="num">Saldo</th></tr></thead>
            <tbody>${hist.map((h) => `<tr><td>${fmt.monthShort(h.ym)}</td><td class="num">${fmt.brl(h.receitas)}</td><td class="num">${fmt.brl(h.despesas)}</td><td class="num">${fmt.brl(h.saldo)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </details>`;
  }

  function render(view, { signal }) {
    if (!Fin.storage.hasData()) {
      view.innerHTML = Fin.ui.emptyState('📂', 'Nenhum dado ainda',
        'Importe sua planilha antiga ou crie seu primeiro lançamento.',
        '<a href="#/dados" class="btn btn-primary">Importar planilha</a>');
      return;
    }

    const ym = Fin.state.mes;
    const r = F.resumo(ym);
    const hist = F.historico(ym, 6);
    const contas = F.contasAbertas(ym);
    const series = [
      { key: 'receitas', label: 'Receitas', color: Fin.charts.SERIES.receitas },
      { key: 'despesas', label: 'Despesas', color: Fin.charts.SERIES.despesas },
    ];

    let saude = [];
    try { saude = Fin.saude.serie(ym, 12); } catch (e) { console.warn('[saude]', e); }

    // Lembrete de backup: alterações sem backup há 7+ dias (dá para adiar até reabrir o app).
    const b = Fin.storage.situacaoBackup();
    // Lembrete discreto (v2026-11-16.4): uma linha no fim do Início; o sininho também avisa.
    const lembrete = b.lembrar && !Fin.state.backupAdiado ? `
      <div class="flex items-center gap-2 text-xs text-amber-900 bg-amber-50/70 border border-amber-100 rounded-xl px-3 py-1.5" role="status">
        ${Fin.icone('cofreDados', 'w-4 h-4 shrink-0 text-amber-700')}
        <span class="flex-1 min-w-0 truncate">${b.ultimo ? `Último backup há <b>${b.dias} dias</b>` : '<b>Sem backup</b> ainda: os dados estão só neste aparelho'}</span>
        <a href="#/dados" class="font-semibold underline shrink-0">Fazer backup</a>
        <button data-act="adiar-backup" class="text-amber-900/60 hover:text-amber-900 shrink-0" aria-label="Esconder até reabrir o app" title="Esconder até reabrir o app">✕</button>
      </div>` : '';

    view.innerHTML = `
      <div class="space-y-4">
        ${saudacaoHTML()}
        ${Fin.ui.filtroPessoa()}
        ${Fin.ui.monthNav(ym)}
        ${hero(r, ym)}
        ${atalhosHTML()}
        ${ym === fmt.currentYM() ? proximosHTML() : ''}

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          ${card(`
            <div class="flex items-start justify-between gap-3 flex-wrap mb-3">
              ${titulo('barras', 'blue', 'Receitas x despesas')}
              ${Fin.charts.legend(series)}
            </div>
            <div id="chart-hist" class="w-full min-w-0 overflow-hidden"></div>
            <p class="text-xs text-slate-400 mt-1">Últimos 6 meses · toque em um mês para abri-lo ·
              <a href="#/relatorios" class="text-prim-700 font-medium hover:underline">Ver relatórios</a></p>
            ${tabelaHistorico(hist)}`)}
          ${card(`
            <div class="flex items-start justify-between gap-3 flex-wrap mb-3">
              ${titulo('pizza', 'orange', 'Despesas por categoria')}
              <label class="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input type="checkbox" id="detalhar-faturas" class="accent-prim-600 w-4 h-4" ${Fin.state.detalharFaturas ? 'checked' : ''} />
                Detalhar faturas do cartão
              </label>
            </div>
            ${categoriasHTML(ym)}`)}
        </div>

        ${saudeHTML(saude)}

        ${orcamentoHTML(ym)}

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          ${ym === fmt.currentYM() ? '' : card(`${titulo('calendario', 'amber', 'Contas a pagar', 'mb-1')}${contasHTML(contas, ym)}`)}
          ${card(`${titulo('cartao', 'violet', 'Faturas do cartão', 'mb-1')}${faturasHTML(ym)}`)}
        </div>

        ${lembrete}
      </div>`;

    view.querySelector('[data-act="perguntar-ia"]')?.addEventListener('click', () => Fin.ia.abrirAnalise());
    view.querySelector('[data-act="adiar-backup"]')?.addEventListener('click', () => {
      Fin.state.backupAdiado = true;
      Fin.router.refresh();
    });

    view.querySelector('#detalhar-faturas').addEventListener('change', (e) => {
      Fin.state.detalharFaturas = e.target.checked;
      Fin.router.refresh();
    });

    view.querySelectorAll('input[name="saude-vista"]').forEach((r) => r.addEventListener('change', (e) => {
      Fin.state.saudeVista = e.target.value;
      Fin.router.refresh();
    }));

    const chartEl = view.querySelector('#chart-hist');
    const saudeEl = view.querySelector('#chart-saude');
    const draw = () => {
      Fin.charts.columns(chartEl, hist, {
        series,
        selected: ym,
        label: 'Receitas e despesas dos últimos 6 meses',
        onSelect: (m) => { Fin.state.mes = m; Fin.router.render(); },
      });
      desenharSaude(saudeEl, saude);
    };
    // Redesenha quando a largura do container muda (girar o celular, abrir barra de rolagem…).
    let lastW = chartEl.clientWidth;
    draw(); // desenha já; o observer só redesenha quando a largura mudar
    // requestAnimationFrame: redesenha fora do ciclo do observer (evita o aviso "ResizeObserver loop").
    const ro = new ResizeObserver(() => requestAnimationFrame(() => {
      const w = chartEl.clientWidth;
      if (Math.abs(w - lastW) > 1) { lastW = w; draw(); }
    }));
    ro.observe(chartEl);
    signal.addEventListener('abort', () => ro.disconnect());
  }

  return { title: 'Início', render };
})();
