/**
 * tour.js — Tour guiado (balões de ajuda) para quem está começando.
 *
 * - Abre sozinho uma vez por aparelho, no Início, depois de entrar (prefs.tourVisto).
 * - "Rever tutorial" em Configurações → Ajuda chama Fin.tour.iniciar().
 * - Cada passo destaca um elemento da tela (recorte com fundo escurecido) e mostra um balão.
 *   Passos podem abrir/fechar o formulário de lançamento para mostrar os campos de verdade.
 * - Esc ou "Pular" encerram; setas ← → navegam.
 */
window.Fin = window.Fin || {};

Fin.tour = (() => {
  const esc = (s) => Fin.fmt.esc(s);
  let estado = null; // { passos, i, raiz, onKey, onResize }

  const visivel = (el) => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  /** Primeiro elemento visível entre os seletores (ou função que devolve o elemento). */
  function achar(alvo) {
    if (!alvo) return null;
    if (typeof alvo === 'function') return alvo();
    for (const sel of [].concat(alvo)) {
      const el = [...document.querySelectorAll(sel)].find(visivel);
      if (el) return el;
    }
    return null;
  }
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
  const casal = () => !!Fin.finance?.temCasal?.();
  const fecharForm = () => { if (document.querySelector('#lanc-form')) Fin.ui.closeModal(); };
  const abrirForm = async () => {
    if (!document.querySelector('#lanc-form')) { Fin.forms.lancamento.open(); await esperar(250); }
  };
  const campo = (sel) => () => document.querySelector(sel)?.closest('.grid, section, fieldset, .seg') || null;

  function passos() {
    const nome = Fin.membros?.primeiroNome?.() || '';
    return [
      { titulo: `Bem-vindo(a)${nome ? `, ${nome}` : ''}!`, texto: 'Em menos de um minuto: como lançar receitas e despesas, marcar o que foi pago e usar os filtros. Você pode pular quando quiser.', icone: 'carteira' },
      { alvo: ['aside [data-new-lancamento]', 'nav [data-new-lancamento]'], titulo: 'Novo lançamento', texto: 'Toque aqui para registrar uma despesa ou uma receita. Na tela Cartões, o mesmo botão cria uma compra no cartão.', icone: 'mais', antes: fecharForm },
      { alvo: '#lanc-form .seg', titulo: 'Despesa ou receita?', texto: 'Escolha o tipo primeiro: despesa é o que sai (conta, compra, boleto); receita é o que entra (salário, extra, reembolso).', icone: 'balanca', antes: abrirForm },
      { alvo: '[data-quem]', se: casal, titulo: 'Quem pagou?', texto: 'Diga quem pagou a despesa — você, a outra pessoa ou os dois. É isso que separa as contas no filtro por pessoa.', icone: 'usuario', antes: abrirForm },
      { alvo: campo('#lanc-form [name=valorPrevisto]'), titulo: 'Descrição, valor e categoria', texto: 'Escreva o que é, o valor e a categoria. O vencimento define o mês em que a conta aparece.', icone: 'etiqueta', antes: abrirForm },
      { alvo: campo('#lanc-form [name=recorrente]'), titulo: 'Contas que se repetem', texto: 'Aluguel, água, luz, escola? Ligue “Recorrente” e o app cria os próximos meses de uma vez (por número de vezes ou até um mês).', icone: 'reciclar', antes: abrirForm },
      { alvo: '#lanc-form section[aria-labelledby="pg-titulo"]', titulo: 'Pago ou em aberto', texto: 'Quando pagar, marque “Pago” (ou “Parcial”). Na lista, tocar na etiqueta de status também alterna pago/aberto.', icone: 'check', antes: abrirForm },
      { alvo: '#view .filtro-pessoa', se: casal, titulo: 'Ambos ou cada um', texto: 'Veja as finanças da casa (Ambos) ou só de uma pessoa: saldo, gráficos e totais são recalculados.', icone: 'usuario', antes: fecharForm },
      { alvo: () => document.querySelector('#view [data-month]')?.parentElement || null, titulo: 'Troque o mês', texto: 'Use as setas para ver meses anteriores ou futuros. Tudo no Início segue o mês escolhido.', icone: 'calendario', antes: fecharForm },
      { alvo: ['header [data-ocultar]', 'aside [data-ocultar]'], titulo: 'Esconder valores', texto: 'O olho borra todos os valores — útil em lugar público. O app sempre abre com os valores escondidos.', icone: 'cadeado', antes: fecharForm },
      { alvo: ['header [data-avisos]', 'aside [data-avisos]'], titulo: 'Avisos', texto: 'O sininho lembra contas vencendo ou atrasadas, faturas pagas a menos e backup. Dá para dispensar o que você já sabe.', icone: 'alerta', antes: fecharForm },
      { alvo: ['header [data-aprender]', 'aside [data-aprender]'], titulo: 'Aprender: comece por aqui', texto: 'Guias de 3 a 4 minutos sobre orçamento, reserva de emergência, investimentos, cartão e dívidas. Vale ler todos — o app mostra quantos você já leu e sugere o próximo no Início.', icone: 'livro', antes: fecharForm },
      { titulo: 'Pronto!', texto: 'Sugestão: leia agora o primeiro guia, “Orçamento sem sofrimento” (3 min). Para ver este tutorial de novo: Configurações → Ajuda → Rever tutorial.', icone: 'check', antes: fecharForm, fim: true,
        extra: { rotulo: 'Ler os guias', acao: () => { location.hash = '#/educacao?artigo=orcamento'; } } },
    ].filter((p) => !p.se || p.se());
  }

  function desenhar() {
    const { raiz, i } = estado;
    const p = estado.passos[i];
    const total = estado.passos.length;
    const alvo = achar(p.alvo);
    const recorte = raiz.querySelector('[data-recorte]');
    const balao = raiz.querySelector('[data-balao]');
    balao.innerHTML = `
      <div class="flex items-start gap-3">
        ${Fin.icones.badge(p.icone || 'carteira', 'prim', 'w-9 h-9', 'w-5 h-5')}
        <div class="min-w-0 flex-1">
          <div class="text-[11px] font-semibold uppercase tracking-wide text-prim-700">${i + 1} de ${total}</div>
          <h2 class="font-semibold text-base leading-snug" id="tour-titulo">${esc(p.titulo)}</h2>
          <p class="text-sm text-slate-600 mt-1">${esc(p.texto)}</p>
        </div>
      </div>
      <div class="flex items-center gap-2 mt-4">
        ${p.fim ? '' : '<button type="button" data-tour="pular" class="text-sm text-slate-500 hover:text-slate-800 hover:underline">Pular</button>'}
        <span class="flex-1"></span>
        ${i > 0 && !p.extra ? '<button type="button" data-tour="voltar" class="btn btn-ghost !py-1.5">Voltar</button>' : ''}
        ${p.extra ? `<button type="button" data-tour="extra" class="btn btn-ghost !py-1.5">${esc(p.extra.rotulo)}</button>` : ''}
        <button type="button" data-tour="proximo" class="btn btn-primary !py-1.5">${p.fim ? 'Concluir' : i === 0 ? 'Começar' : 'Próximo'}</button>
      </div>
      <div class="flex justify-center gap-1 mt-3" aria-hidden="true">${estado.passos.map((_, k) => `<span class="h-1.5 rounded-full ${k === i ? 'w-5 bg-prim-600' : 'w-1.5 bg-slate-200'}"></span>`).join('')}</div>`;

    if (alvo) {
      alvo.scrollIntoView({ block: 'center', inline: 'nearest' });
      const r = alvo.getBoundingClientRect();
      const pad = 6;
      Object.assign(recorte.style, { display: 'block', left: `${r.left - pad}px`, top: `${r.top - pad}px`, width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px` });
      raiz.querySelector('[data-fundo]').style.background = 'transparent';
      // Balão abaixo do alvo; se não couber, acima; na horizontal, centralizado e dentro da tela.
      const bw = Math.min(360, innerWidth - 24);
      balao.style.width = `${bw}px`;
      const bh = balao.offsetHeight;
      let top = r.bottom + 14;
      if (top + bh > innerHeight - 12) top = Math.max(12, r.top - bh - 14);
      let left = r.left + r.width / 2 - bw / 2;
      left = Math.max(12, Math.min(left, innerWidth - bw - 12));
      Object.assign(balao.style, { left: `${left}px`, top: `${top}px`, transform: 'none' });
    } else {
      recorte.style.display = 'none';
      raiz.querySelector('[data-fundo]').style.background = 'rgba(15, 23, 42, 0.66)';
      const bw = Math.min(380, innerWidth - 24);
      Object.assign(balao.style, { width: `${bw}px`, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' });
    }
    balao.querySelector('[data-tour="proximo"]').focus();
  }

  async function ir(i) {
    if (!estado) return;
    if (i < 0 || i >= estado.passos.length) return encerrar();
    estado.i = i;
    const p = estado.passos[i];
    estado.raiz.classList.add('tour-trocando');
    try { await p.antes?.(); } catch (e) { console.warn('[tour]', e); }
    await esperar(60);
    if (!estado) return;
    // Alvo sumiu (ex.: tela sem filtro)? Pula o passo na mesma direção.
    if (p.alvo && !achar(p.alvo)) {
      const dir = i >= (estado.ultimo ?? 0) ? 1 : -1;
      estado.ultimo = i;
      return ir(i + dir);
    }
    estado.ultimo = i;
    estado.raiz.classList.remove('tour-trocando');
    desenhar();
  }

  function encerrar() {
    if (!estado) return;
    fecharForm();
    removeEventListener('keydown', estado.onKey, true);
    removeEventListener('resize', estado.onResize);
    estado.raiz.remove();
    estado = null;
    try { Fin.storage.setPref('tourVisto', new Date().toISOString()); } catch { /* sem prefs */ }
  }

  async function iniciar() {
    if (estado) return;
    if (!/^#\/dashboard/.test(location.hash)) { location.hash = '#/dashboard'; await esperar(500); }
    Fin.ui.closeModal();
    const raiz = document.createElement('div');
    raiz.className = 'tour';
    raiz.setAttribute('role', 'dialog');
    raiz.setAttribute('aria-modal', 'true');
    raiz.setAttribute('aria-labelledby', 'tour-titulo');
    raiz.innerHTML = `
      <div data-fundo class="fixed inset-0"></div>
      <div data-recorte class="tour-recorte"></div>
      <div data-balao class="tour-balao"></div>`;
    document.body.appendChild(raiz);
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); encerrar(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); ir(estado.i + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); ir(estado.i - 1); }
    };
    const onResize = () => estado && desenhar();
    estado = { passos: passos(), i: 0, raiz, onKey, onResize };
    addEventListener('keydown', onKey, true);
    addEventListener('resize', onResize);
    raiz.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tour]')?.dataset.tour;
      if (b === 'extra') { const acao = estado.passos[estado.i].extra?.acao; encerrar(); acao?.(); return; }
      if (b === 'pular') encerrar();
      else if (b === 'voltar') ir(estado.i - 1);
      else if (b === 'proximo') ir(estado.i + 1);
    });
    ir(0);
  }

  /** Primeira vez neste aparelho: abre sozinho no Início, com dados e depois de entrar. */
  window.addEventListener('fin:desbloqueado', () => {
    setTimeout(() => {
      try {
        if (Fin.storage.prefs().tourVisto || !Fin.storage.hasData() || Fin.storage.bloqueado()) return;
        if (!/^#\/dashboard/.test(location.hash) || document.querySelector('#modal-root .modal-panel')) return;
        iniciar();
      } catch (e) { console.warn('[tour]', e); }
    }, 1200);
  });

  return { iniciar, encerrar, ativo: () => !!estado };
})();
