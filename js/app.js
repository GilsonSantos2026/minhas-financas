/**
 * app.js — Inicialização: estado global, rotas e ações que valem para todas as telas.
 */
window.Fin = window.Fin || {};

(() => {
  // Estado compartilhado entre telas (o mês inicial é definido após o desbloqueio).
  Fin.state = { mes: Fin.fmt.currentYM(), cartao: null, detalharFaturas: true };

  Fin.router.register('/dashboard', Fin.pages.dashboard);
  Fin.router.register('/lancamentos', Fin.pages.lancamentos);
  Fin.router.register('/cartoes', Fin.pages.cartoes);
  Fin.router.register('/importar-fatura', Fin.pages.importarFatura);
  Fin.router.register('/relatorios', Fin.pages.relatorios);
  Fin.router.register('/conciliacao', Fin.pages.conciliacao);
  Fin.router.register('/planilha', Fin.pages.planilha);
  Fin.router.register('/investimentos', Fin.pages.investimentos);
  Fin.router.register('/orcamento', Fin.pages.orcamento);
  Fin.router.register('/categorias', Fin.pages.categorias);
  Fin.router.register('/mais', Fin.pages.mais);
  Fin.router.register('/dados', Fin.pages.dados);

  // Ações globais por delegação (funcionam em qualquer tela e no conteúdo redesenhado).
  document.addEventListener('click', (e) => {
    const t = e.target;

    const toggle = t.closest('[data-toggle-pago]');
    if (toggle) {
      e.stopPropagation();
      const l = Fin.finance.togglePago(toggle.dataset.togglePago);
      if (l) Fin.ui.toast(l.status === 'pago' ? (l.tipo === 'receita' ? 'Marcado como recebido.' : 'Marcado como pago.') : 'Marcado como em aberto.');
      Fin.router.refresh();
      return;
    }

    const mes = t.closest('[data-month]');
    if (mes) {
      const d = Number(mes.dataset.month);
      Fin.state.mes = d === 0 ? Fin.fmt.currentYM() : Fin.fmt.addMonths(Fin.state.mes, d);
      Fin.router.render();
      return;
    }

    // Botão "＋": na tela de Cartões cria compra no cartão; nas demais, lançamento.
    if (t.closest('[data-new-lancamento]')) {
      if (Fin.router.current() === '/cartoes') Fin.forms.compra.open({ cartao: Fin.state.cartao });
      else Fin.forms.lancamento.open();
      return;
    }

    const filtro = t.closest('[data-filtro-status]');
    if (filtro) Fin.pages.lancamentos.filtros.status = filtro.dataset.filtroStatus;

    const cartaoLink = t.closest('[data-ir-cartao]');
    if (cartaoLink) Fin.state.cartao = cartaoLink.dataset.irCartao;

    openItem(t);
  });

  function openItem(t) {
    const orc = t.closest('[data-orc]');
    if (orc) return Fin.forms.categoria.open({ id: orc.dataset.orc, foco: 'orcamento' }), true;
    const compra = t.closest('[data-edit-compra]');
    if (compra) return Fin.forms.compra.open({ id: compra.dataset.editCompra }), true;
    const edit = t.closest('[data-edit]');
    if (edit) return Fin.forms.lancamento.open(edit.dataset.edit), true;
    return false;
  }

  // Enter/Espaço em itens clicáveis (acessibilidade pelo teclado).
  document.addEventListener('keydown', (e) => {
    const alvo = e.target.closest?.('[data-edit], [data-edit-compra], [data-orc]');
    if (alvo && e.target === alvo && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openItem(alvo);
    }
  });

  // Botão "Bloquear" (menu lateral e "Mais") e botão "olho" (ocultar valores).
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-bloquear]')) Fin.acesso.bloquear();
    if (e.target.closest('[data-ocultar]')) {
      const on = Fin.privacidade.alternar();
      Fin.ui.toast(on ? 'Valores ocultos.' : 'Valores visíveis.');
    }
  });
  Fin.privacidade.iniciar();

  /* ---------------- Início: só depois de entrar com usuário e senha ---------------- */

  let iniciado = false;
  function aoDesbloquear() {
    Fin.state.mes = Fin.finance.mesInicial();
    document.querySelectorAll('[data-usuario]').forEach((el) => (el.textContent = Fin.cofre.usuario() || ''));
    if (!iniciado) {
      iniciado = true;
      // Toda abertura começa no Início (sem dados ainda → tela de importação),
      // mesmo que o endereço guardado aponte para outra tela.
      const novo = /[?&]novo=1/.test(location.hash); // atalho do ícone: "Novo lançamento"
      const inicio = Fin.storage.hasData() ? '/dashboard' : '/dados';
      history.replaceState(null, '', `${location.pathname}${location.search}#${inicio}`);
      Fin.router.start(() => inicio);
      if (novo) Fin.forms.lancamento.open();
    } else {
      Fin.router.render();
    }
    Fin.drive?.aposDesbloquear();
  }

  // Dados chegaram de outro aparelho (sincronização) → redesenha a tela atual.
  window.addEventListener('fin:dados-externos', () => {
    if (iniciado && !Fin.storage.bloqueado() && !document.querySelector('#modal-root .modal-panel')) Fin.router.refresh();
  });

  /* ---------------- Bloqueio automático por inatividade ---------------- */

  let ultimaAtividade = Date.now();
  ['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach((ev) =>
    document.addEventListener(ev, () => (ultimaAtividade = Date.now()), { passive: true }));
  const verificarInatividade = () => {
    const min = Number(Fin.storage.prefs().bloqueioMin ?? 10); // 0 = nunca
    if (min > 0 && Fin.cofre.existeConta() && !Fin.storage.bloqueado() && Date.now() - ultimaAtividade > min * 60000) {
      Fin.acesso.bloquear();
    }
  };
  setInterval(verificarInatividade, 15000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') verificarInatividade(); });

  // App instalável/offline (só funciona em http/https; em file:// é ignorado).
  Fin.pwa.registrar();

  // Mostra "Criar acesso" (primeiro uso) ou "Entrar".
  Fin.acesso.iniciar(aoDesbloquear);
})();
