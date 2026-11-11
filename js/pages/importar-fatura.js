/**
 * pages/importar-fatura.js — Importar fatura de cartão (PDF ou foto) com tela de revisão.
 * Rota: #/importar-fatura (aberta pelo botão "Importar fatura" na tela Cartões).
 */
window.Fin = window.Fin || {};
Fin.pages = Fin.pages || {};

Fin.pages.importarFatura = (() => {
  const fmt = Fin.fmt;
  const esc = fmt.esc;
  const F = Fin.finance;
  const I = () => Fin.faturaImportador;

  const TIPOS = {
    compra: ['Compra', 'bg-slate-100 text-slate-600'],
    encargo: ['Encargo', 'bg-amber-50 text-amber-800'],
    credito: ['Crédito', 'bg-emerald-50 text-emerald-800'],
    pagamento: ['Pagamento', 'bg-sky-50 text-sky-800'],
  };

  // Estado da importação em andamento (sobrevive a trocas de tela até concluir/cancelar).
  const st = { arquivo: null, leitura: null, linhas: [], cartao: null, fatura: null, futuras: true, etapa: 'upload', progresso: '' };

  function reset() {
    Object.assign(st, { arquivo: null, leitura: null, linhas: [], cartao: null, fatura: null, futuras: true, etapa: 'upload', progresso: '' });
  }

  /* ---------------- Etapa 1: envio ---------------- */

  function htmlUpload() {
    return `
      <section class="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="font-semibold text-lg">Importar fatura do cartão</h2>
            <p class="text-sm text-slate-500 mt-1">Envie o PDF da fatura (recomendado) ou uma foto/print.
              O arquivo é lido aqui no seu navegador — nada é enviado para a internet.</p>
          </div>
          <a href="#/cartoes" class="text-sm text-slate-500 hover:text-slate-800 shrink-0">Voltar</a>
        </div>
        <label id="fat-drop" for="fat-input"
          class="dropzone mt-5 flex flex-col items-center justify-center text-center gap-2 border-2 border-dashed border-slate-300 rounded-2xl px-4 py-10 cursor-pointer transition">
          <span class="text-4xl" aria-hidden="true">📄</span>
          <span class="font-medium">Toque para escolher a fatura</span>
          <span class="text-sm text-slate-500 hidden sm:block">ou arraste e solte aqui</span>
          <span class="text-xs text-slate-400">PDF, JPG ou PNG</span>
          <input id="fat-input" type="file" class="sr-only" accept="application/pdf,.pdf,image/*" />
        </label>
        <ul class="text-xs text-slate-500 mt-4 space-y-1 list-disc pl-5">
          <li>Testado com faturas do Sicoob, Banco do Brasil (Ourocard) e Mercado Pago.</li>
          <li>Foto ou print usa reconhecimento de texto (OCR): é mais lento e pode errar — revise com atenção.</li>
        </ul>
      </section>`;
  }

  function htmlProcessando() {
    return `
      <section class="bg-white rounded-2xl shadow-sm p-8 text-center">
        <span class="spinner inline-block" aria-hidden="true"></span>
        <p class="mt-3 font-medium">${esc(st.arquivo?.name || '')}</p>
        <p id="fat-prog" class="text-sm text-slate-500 mt-1">${esc(st.progresso || 'Lendo a fatura…')}</p>
      </section>`;
  }

  /* ---------------- Etapa 2: revisão ---------------- */

  const selecionadas = () => st.linhas.filter((l) => l.incluir);

  function htmlConferencia() {
    const { info, conferencia: c } = st.leitura;
    const soma = selecionadas().reduce((s, l) => s + l.valor, 0);
    const linha = (rot, val) => `<div class="flex justify-between gap-3"><span class="text-slate-500">${rot}</span><span class="tabular-nums font-medium">${val}</span></div>`;
    let selo = '';
    if (c.esperado != null) {
      selo = c.ok
        ? `<p class="mt-2 text-sm text-emerald-800 bg-emerald-50 rounded-lg px-3 py-2"><span aria-hidden="true">✓</span> Leitura conferida: os lançamentos somam exatamente o esperado pela fatura.</p>`
        : `<p class="mt-2 text-sm text-amber-800 bg-amber-50 rounded-lg px-3 py-2"><span aria-hidden="true">!</span> Diferença de ${fmt.brl(c.esperado - c.lido)} entre o lido (${fmt.brl(c.lido)}) e o esperado (${fmt.brl(c.esperado)}). Confira se faltou algum item.</p>`;
    }
    return `
      <div class="text-sm space-y-1">
        ${info.total != null ? linha('Total da fatura', fmt.brl(info.total)) : ''}
        ${info.saldoAnterior ? linha('Saldo da fatura anterior', fmt.brl(info.saldoAnterior)) : ''}
        ${linha('Novos lançamentos lidos', fmt.brl(c.lido))}
        ${linha('Selecionados para importar', fmt.brl(soma))}
      </div>${selo}`;
  }

  const quando = (iso) => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

  /** Texto explicando de onde veio o registro que já existe. */
  function origemTexto(e) {
    if (!e) return '';
    if (e.origem === 'pdf') return `Já importado${e.arquivo ? ` de ${e.arquivo}` : ''}${e.criadoEm ? ` em ${quando(e.criadoEm)}` : ''}`;
    if (e.origem === 'app') return 'Já lançado manualmente no app';
    return 'Já existe (veio da planilha importada)';
  }

  /** Aviso no topo quando a fatura inteira (ou quase) já está na base. */
  function htmlJaImportada() {
    const j = I().jaImportada(st.linhas);
    if (!j) return '';
    const titulo = j.deImportacao
      ? `Esta fatura parece já ter sido importada${j.quando ? ` em ${quando(j.quando)}` : ''}${j.arquivo && j.arquivo !== st.arquivo.name ? ` (arquivo ${esc(j.arquivo)})` : ''}.`
      : 'Os lançamentos desta fatura já estão na base (vieram da planilha ou foram lançados no app).';
    const outros = j.deImportacao && j.dups > j.daImportacao
      ? ` (${j.daImportacao} da importação anterior e ${j.dups - j.daImportacao} da planilha/app)` : '';
    const detalhe = j.novos
      ? `${j.dups} de ${j.total} itens já existem${outros} e vieram desmarcados. ${j.novos === 1 ? 'Só 1 item é novo' : `Só ${j.novos} itens são novos`} — confira antes de importar.`
      : `Todos os ${j.total} itens já existem${outros}: não há nada novo para importar.`;
    return `
      <div class="rounded-xl bg-violet-50 text-violet-900 px-3 py-2.5 text-sm" role="status">
        <p class="font-semibold"><span aria-hidden="true">⧉</span> ${titulo}</p>
        <p class="mt-0.5">${detalhe}</p>
      </div>`;
  }

  function htmlLinha(l) {
    const [rot, cls] = TIPOS[l.tipo];
    const opts = F.categorias('despesa').map((c) => `<option ${c.nome === l.categoria ? 'selected' : ''}>${esc(c.nome)}</option>`).join('');
    const extra = F.categorias('despesa').some((c) => c.nome === l.categoria) ? '' : `<option selected>${esc(l.categoria)}</option>`;
    return `
      <li class="px-3 sm:px-4 py-3 ${l.incluir ? '' : 'bg-slate-50'}" data-n="${l.n}">
        <div class="flex items-start gap-3">
          <input type="checkbox" data-f="incluir" class="mt-1 w-5 h-5 accent-emerald-600 shrink-0" ${l.incluir ? 'checked' : ''}
                 aria-label="Importar ${esc(l.descricao)}" />
          <div class="flex-1 min-w-0 space-y-1.5">
            <div class="flex items-start gap-2">
              <input data-f="descricao" value="${esc(l.descricao)}" class="flex-1 min-w-0 text-sm font-medium bg-transparent border-0 border-b border-transparent focus:border-emerald-500 focus:outline-none px-0 py-0.5 ${l.incluir ? '' : 'text-slate-400 line-through'}" aria-label="Descrição" />
              <span class="text-sm font-semibold tabular-nums whitespace-nowrap ${l.valor < 0 ? 'text-emerald-700' : ''} ${l.incluir ? '' : 'text-slate-400'}">${fmt.brl(l.valor)}</span>
            </div>
            <div class="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span>${fmt.date(l.data).slice(0, 5)}</span>
              ${l.parcela ? `<span class="pill bg-slate-100 text-slate-600">parcela ${l.parcela.atual}/${l.parcela.total}</span>` : ''}
              <span class="pill ${cls}">${rot}</span>
              ${l.duplicada ? `<span class="pill bg-violet-50 text-violet-800" title="${esc(origemTexto(l.existente))}">⧉ já existe</span>` : ''}
              ${l.portador ? `<span class="truncate max-w-[12rem]" title="${esc(l.portador)}">${esc(l.portador)}</span>` : ''}
            </div>
            ${l.incluir ? `<select data-f="categoria" class="input !py-1 !text-xs !w-auto max-w-full" aria-label="Categoria">${extra}${opts}</select>` : ''}
          </div>
        </div>
      </li>`;
  }

  function htmlRevisao() {
    const { info } = st.leitura;
    const cartoes = F.cartoes();
    const futuras = I().parcelasFuturas(st.linhas, st.cartao, st.fatura);
    const sel = selecionadas();
    const dups = st.linhas.filter((l) => l.duplicada).length;

    return `
      <div class="space-y-4 pb-24">
        <section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5 space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h2 class="font-semibold text-lg">Confira a fatura</h2>
              <p class="text-sm text-slate-500 break-all">${esc(st.arquivo.name)}${info.banco ? ` · ${esc(info.banco)}` : ''}${info.finalCartao ? ` · final ${esc(info.finalCartao)}` : ''}</p>
            </div>
            <button data-act="cancelar" class="text-sm text-slate-500 hover:text-slate-800 shrink-0">Cancelar</button>
          </div>

          ${htmlJaImportada()}

          <div class="grid grid-cols-2 gap-3">
            <label class="field"><span>Cartão</span>
              <select id="fat-cartao" class="input">${cartoes.map((k) => `<option ${k.nome === st.cartao ? 'selected' : ''}>${esc(k.nome)}</option>`).join('')}</select></label>
            <label class="field"><span>Fatura (vencimento)</span>
              <input id="fat-mes" type="month" class="input" value="${st.fatura}" /></label>
          </div>

          ${htmlConferencia()}

          <label class="flex items-start gap-2 text-sm">
            <input id="fat-futuras" type="checkbox" class="mt-0.5 w-4 h-4 accent-emerald-600" ${st.futuras ? 'checked' : ''} />
            <span>Criar as parcelas futuras das compras parceladas
              <span class="text-slate-500">(${futuras.length} ${futuras.length === 1 ? 'parcela' : 'parcelas'} nas próximas faturas; as que já existem são ignoradas)</span></span>
          </label>
          ${dups ? `<p class="text-xs text-slate-500"><span aria-hidden="true">⧉</span> ${dups} ${dups === 1 ? 'item já existe' : 'itens já existem'} neste cartão/fatura e ${dups === 1 ? 'veio desmarcado' : 'vieram desmarcados'}. Pagamentos também vêm desmarcados (já estão nos seus lançamentos).</p>` : ''}
        </section>

        <div class="flex items-center justify-between px-1">
          <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide">${st.linhas.length} itens na fatura</h3>
          <div class="flex gap-3 text-xs font-medium">
            <button data-act="todos" class="text-emerald-700 hover:underline">Marcar todos</button>
            <button data-act="nenhum" class="text-slate-500 hover:underline">Desmarcar todos</button>
          </div>
        </div>
        <ul id="fat-lista" class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">${st.linhas.map(htmlLinha).join('')}</ul>
      </div>

      <div class="fixed inset-x-0 bottom-16 md:bottom-0 md:left-60 z-20 bg-white/95 backdrop-blur border-t border-slate-200">
        <div class="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <p class="text-sm text-slate-600 flex-1 min-w-0">
            <b>${sel.length}</b> ${sel.length === 1 ? 'item' : 'itens'} · <span class="tabular-nums">${fmt.brl(sel.reduce((s, l) => s + l.valor, 0))}</span>
            ${st.futuras && futuras.length ? `<span class="text-slate-400"> + ${futuras.length} futuras</span>` : ''}
          </p>
          <button data-act="importar" class="btn btn-primary shrink-0" ${sel.length ? '' : 'disabled'}>Importar</button>
        </div>
      </div>`;
  }

  /* ---------------- Ações ---------------- */

  let view = null;

  function draw() {
    if (!view) return;
    const y = window.scrollY;
    view.innerHTML = st.etapa === 'revisao' ? htmlRevisao() : st.etapa === 'processando' ? htmlProcessando() : htmlUpload();
    if (st.etapa === 'upload') bindUpload();
    if (st.etapa === 'revisao') window.scrollTo(0, y);
  }

  async function processar(file) {
    if (!file) return;
    if (!/pdf$|^image\//i.test(file.type) && !/\.(pdf|png|jpe?g|webp)$/i.test(file.name)) {
      Fin.ui.toast('Envie um PDF ou uma imagem (JPG/PNG).', 'error');
      return;
    }
    if (!F.cartoes().length) {
      Fin.ui.toast('Cadastre o cartão antes de importar a fatura.', 'error');
      return Fin.forms.cartao.open();
    }
    Object.assign(st, { arquivo: file, etapa: 'processando', progresso: '' });
    draw();
    try {
      const leitura = await Fin.faturaLeitor.ler(file, (msg) => {
        st.progresso = msg;
        const el = document.getElementById('fat-prog');
        if (el) el.textContent = msg;
      });
      if (!leitura.itens.length) throw new Error('Não encontrei lançamentos nesta fatura.');
      st.leitura = leitura;
      st.cartao = I().sugerirCartao(leitura.info);
      st.fatura = leitura.info.vencimento ? leitura.info.vencimento.slice(0, 7) : Fin.state.mes;
      st.linhas = I().preparar(leitura, st.cartao, st.fatura);
      st.etapa = 'revisao';
      draw();
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      st.etapa = 'upload';
      draw();
      Fin.ui.toast(err.message || 'Não foi possível ler a fatura.', 'error');
    }
  }

  function importar() {
    const r = I().salvar(st.linhas, { cartao: st.cartao, fatura: st.fatura, futuras: st.futuras, arquivo: st.arquivo.name });
    Fin.state.cartao = st.cartao;
    Fin.state.mes = st.fatura;
    reset();
    Fin.ui.toast(`${r.qtd} ${r.qtd === 1 ? 'item importado' : 'itens importados'}${r.futuras ? ` + ${r.futuras} parcelas futuras` : ''}.`);
    Fin.router.go('/cartoes');
  }

  function bindUpload() {
    const dz = view.querySelector('#fat-drop');
    view.querySelector('#fat-input').addEventListener('change', (e) => processar(e.target.files[0]));
    ['dragenter', 'dragover'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('is-dragging'); }));
    ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('is-dragging'); }));
    dz.addEventListener('drop', (e) => processar(e.dataTransfer.files[0]));
  }

  function render(container, { signal }) {
    view = container;
    if (st.etapa === 'processando' && !st.leitura) st.etapa = 'upload';
    draw();

    view.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'cancelar') { reset(); draw(); }
      if (act === 'importar') importar();
      if (act === 'todos' || act === 'nenhum') { st.linhas.forEach((l) => (l.incluir = act === 'todos')); draw(); }
    }, { signal });

    view.addEventListener('change', (e) => {
      const t = e.target;
      if (t.id === 'fat-cartao' || t.id === 'fat-mes') {
        if (t.id === 'fat-cartao') st.cartao = t.value;
        if (t.id === 'fat-mes' && t.value) st.fatura = t.value;
        I().remarcarDuplicados(st.linhas, st.cartao, st.fatura);
        return draw();
      }
      if (t.id === 'fat-futuras') { st.futuras = t.checked; return draw(); }
      const li = t.closest('[data-n]');
      if (!li) return;
      const l = st.linhas[Number(li.dataset.n)];
      if (t.dataset.f === 'incluir') { l.incluir = t.checked; draw(); }
      if (t.dataset.f === 'categoria') l.categoria = t.value;
      if (t.dataset.f === 'descricao') l.descricao = t.value.trim() || l.descricao;
    }, { signal });
  }

  return { title: 'Importar fatura', render, processar, estado: st };
})();
