/**
 * pages/dados.js — Tela "Dados e backup": importação da planilha (Etapa 1) e backup.
 */
window.Fin = window.Fin || {};
Fin.pages = Fin.pages || {};

Fin.pages.dados = (() => {
  const fmt = Fin.fmt;
  const esc = fmt.esc;
  const { SCHEMAS } = Fin.columns;
  const state = { fileName: null, sheets: [], mode: null }; // mode: 'upload' | 'review' | null

  const KIND_LABEL = {
    lancamentos: 'Lançamentos',
    cartao: 'Cartão de crédito',
    categorias: 'Categorias',
    ignorar: 'Ignorar esta aba',
  };

  let view = null;

  function stat(label, value) {
    return `
      <div class="bg-slate-50 rounded-xl p-3 text-center">
        <div class="text-xl sm:text-2xl font-semibold text-slate-800">${esc(value)}</div>
        <div class="text-[11px] sm:text-xs text-slate-500 leading-tight mt-0.5">${esc(label)}</div>
      </div>`;
  }

  /* ---------------- Painel: dados salvos ---------------- */

  const quando = (iso) => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  const LIMITE_KB = 5 * 1024; // LocalStorage: ~5 MB por site
  const podeCompartilhar = () => {
    try { return !!navigator.canShare && navigator.canShare({ files: [new File(['{}'], 'x.json', { type: 'application/json' })] }); } catch { return false; }
  };

  function secao(titulo, icone, corpo, extra = '') {
    return `
      <section class="bg-white rounded-2xl shadow-sm p-5 sm:p-6 ${extra}">
        ${Fin.icones.doEmoji(icone)
          ? Fin.icones.titulo(Fin.icones.doEmoji(icone), icone === '⚠️' ? 'rose' : icone === '☁️' ? 'sky' : 'emerald', titulo, { cls: 'text-lg', tam: 'w-8 h-8', ic: 'w-[18px] h-[18px]' })
          : `<h2 class="font-semibold text-lg flex items-center gap-2"><span aria-hidden="true">${icone}</span>${titulo}</h2>`}
        ${corpo}
      </section>`;
  }

  function renderImported() {
    const S = Fin.storage;
    const meta = S.getMeta();
    const n = (k) => S.list(k).length;
    const kb = S.usageKB();
    const uso = Math.min(100, (kb / LIMITE_KB) * 100);
    const origem = meta?.restauradoEm
      ? `Restaurado de um backup em ${quando(meta.restauradoEm)}`
      : meta?.importadoEm ? `Importado de “${esc(meta.arquivo)}” em ${quando(meta.importadoEm)}` : 'Dados criados diretamente no app';
    const b = S.situacaoBackup();
    const ultimo = b.ultimo
      ? `Último backup: <b>${b.dias === 0 ? 'hoje' : b.dias === 1 ? 'ontem' : `há ${b.dias} dias`}</b> (${quando(b.ultimo)})`
      : '<b>Nenhum backup feito ainda.</b>';
    const P = Fin.pwa;

    let instalar;
    if (P.instalado()) instalar = '<p class="text-sm text-emerald-800 mt-2"><span aria-hidden="true">✓</span> Você está usando o app instalado.</p>';
    else if (P.podeInstalar()) instalar = `<p class="text-sm text-slate-600 mt-1">Ícone na tela inicial, abre em tela cheia e funciona sem internet.</p>
        <button data-act="instalar" class="btn btn-primary mt-3">📲 Instalar app</button>`;
    else if (!P.estado.suportado) instalar = `<p class="text-sm text-slate-600 mt-1">Para instalar no celular e usar sem internet, o app precisa ser aberto por um
        endereço <b>https</b> (ex.: GitHub Pages, gratuito) — aberto direto do arquivo no computador isso não é possível.
        O passo a passo está no <b>README.md</b> do projeto.</p>`;
    else if (P.ios()) instalar = `<p class="text-sm text-slate-600 mt-1">No iPhone/iPad (Safari): toque em <b>Compartilhar</b> <span aria-hidden="true">⎋</span> e depois em
        <b>Adicionar à Tela de Início</b>.</p>`;
    else instalar = `<p class="text-sm text-slate-600 mt-1">Use o menu do navegador (⋮) → <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.</p>`;

    return `
      <div class="space-y-4">
        <section class="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
          <div class="flex items-start gap-3">
            ${Fin.icones.badge('check', 'emerald', 'w-10 h-10', 'w-6 h-6')}
            <div class="min-w-0">
              <h2 class="font-semibold text-lg">Seus dados estão neste navegador</h2>
              <p class="text-sm text-slate-500 mt-1">${origem}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            ${stat('lançamentos', n('lancamentos'))}${stat('compras no cartão', n('cartaoCompras'))}${stat('categorias', n('categorias'))}${stat('cartões', Fin.finance.cartoes().length)}
          </div>
          <div class="mt-4">
            <div class="flex justify-between text-xs text-slate-500 mb-1"><span>Espaço usado</span><span class="tabular-nums">${(kb / 1024).toFixed(1).replace('.', ',')} MB de ~5 MB</span></div>
            <div class="h-2 rounded-full bg-[#cde2fb] overflow-hidden" role="meter" aria-valuemin="0" aria-valuemax="${LIMITE_KB}" aria-valuenow="${kb}" aria-label="Espaço usado">
              <div class="h-full rounded-full" style="width:${uso}%;background:${uso > 85 ? '#d03b3b' : '#2a78d6'}"></div>
            </div>
          </div>
        </section>

        ${secaoConta()}
        ${secaoDrive()}

        ${secao('Backup', '🛟', `
          <p class="text-sm mt-1 ${b.lembrar ? 'text-amber-800' : 'text-slate-600'}">${b.lembrar ? '<span aria-hidden="true">!</span> ' : ''}${ultimo}
            ${b.pendente && b.ultimo ? ' Há alterações depois dele.' : ''}</p>
          <div class="flex flex-col sm:flex-row flex-wrap gap-2 mt-4">
            <button data-act="backup" class="btn btn-primary">⬇️ Baixar backup</button>
            ${podeCompartilhar() ? '<button data-act="compartilhar" class="btn btn-ghost">📤 Enviar para Drive, WhatsApp…</button>' : ''}
            <label class="btn btn-ghost cursor-pointer">♻️ Restaurar backup<input id="backup-input" type="file" accept=".json,application/json" class="sr-only"></label>
          </div>
          <details class="mt-4 text-sm text-slate-600">
            <summary class="flex items-center gap-1 font-medium text-slate-700"><span class="chev text-slate-400">▸</span> Como levar os dados para outro aparelho</summary>
            <ol class="list-decimal pl-5 mt-2 space-y-1">
              <li>Neste aparelho, toque em <b>Baixar backup</b> (ou <b>Enviar</b>, para mandar pelo Drive/WhatsApp/e-mail).</li>
              <li>No outro aparelho, abra o app e vá em <b>Dados e backup → Restaurar backup</b>.</li>
              <li>Escolha o arquivo <code>financas-backup-….json</code>. O app mostra o conteúdo antes de substituir.</li>
            </ol>
            <p class="mt-2 text-xs text-slate-500">Os dados não sincronizam sozinhos entre aparelhos: o backup é a ponte. Use sempre o mais recente.</p>
          </details>`)}

        ${secao('Proteção do armazenamento', '🔒', `
          <p class="text-sm text-slate-600 mt-1">Quando falta espaço, o navegador pode apagar dados de sites. Peça para proteger os dados deste app.</p>
          <p id="prot-status" class="text-sm mt-3 text-slate-500">Verificando…</p>`)}

        ${secao('Instalar como app', '📲', instalar)}

        ${secao('Planilha', '📄', `
          <p class="text-sm text-slate-600 mt-1">Importar a planilha de novo <b>substitui</b> lançamentos, compras, categorias e cartões. O app mostra o que muda e compara o arquivo com os dados de hoje antes de gravar.</p>
          <button data-act="reimport" class="btn btn-ghost mt-3">Importar planilha novamente</button>`)}

        ${secao('Apagar todos os dados', '⚠️', `
          <p class="text-sm text-slate-600 mt-1">Remove tudo deste aparelho: lançamentos, compras, categorias, cartões, investimentos e o acesso. O app mostra o que será apagado e pede confirmação.</p>
          <button data-act="apagar" class="btn btn-danger-ghost border border-rose-200 mt-3">Apagar todos os dados…</button>`, 'border border-rose-100')}
      </div>`;
  }

  /* ---------------- Conta e Google Drive ---------------- */

  function secaoConta() {
    if (!Fin.cofre.existeConta()) return '';
    const min = Number(Fin.storage.prefs().bloqueioMin ?? 10);
    const op = (v, r) => `<option value="${v}" ${v === min ? 'selected' : ''}>${r}</option>`;
    return secao('Conta e segurança', '🔐', `
      <p class="text-sm text-slate-600 mt-1">Usuário: <b>${esc(Fin.cofre.usuario())}</b> · os dados estão <b>cifrados</b> com a sua senha neste aparelho.</p>
      <div class="flex flex-col sm:flex-row flex-wrap gap-2 mt-4">
        <button data-act="trocar-senha" class="btn btn-ghost">Trocar senha</button>
        ${Fin.cofre.ehPrincipal() ? '<button data-act="nova-chave" class="btn btn-ghost">Gerar nova chave de recuperação</button>' : ''}
        <button data-bloquear class="btn btn-ghost">🔒 Bloquear agora</button>
      </div>
      <label class="flex flex-wrap items-center gap-2 text-sm mt-4">
        <span class="text-slate-600">Bloquear automaticamente após</span>
        <select id="bloqueio-min" class="input !w-auto !py-1.5">${op(5, '5 min')}${op(10, '10 min')}${op(30, '30 min')}${op(60, '1 hora')}${op(0, 'nunca (só pelo botão)')}</select>
        <span class="text-slate-600">sem uso</span>
      </label>`);
  }

  function secaoDrive() {
    const D = Fin.drive;
    if (!Fin.cofre.existeConta()) return '';
    if (!D.configurado()) {
      return secao('Sincronizar com o Google Drive', '☁️', `
        <p class="text-sm text-slate-600 mt-1">Para usar os mesmos dados no celular e no computador, o app precisa estar publicado em
          um endereço <b>https</b> e ter um <b>Client ID do Google</b> configurado em <code>js/config.js</code>.
          O passo a passo está no <b>README.md</b> (“Sincronização com o Google Drive”).</p>`);
    }
    if (D.estado.conflito) {
      return secao('Google Drive: dados com outra senha', '☁️', `
        <p class="text-sm text-slate-600 mt-1">O Drive já tem dados do app protegidos com <b>outra senha</b> (criada em outro aparelho).
          Entre com o usuário e a senha usados lá: os dados dos dois aparelhos serão <b>juntados</b> e este aparelho passa a usar essa senha.</p>
        <form id="conflito-form" class="grid sm:grid-cols-3 gap-2 mt-3" autocomplete="off">
          <input name="usuario" class="input" placeholder="Usuário" value="${esc(D.estado.conflito.conta?.usuario || '')}">
          <input name="senha" type="password" class="input" placeholder="Senha do outro aparelho" autocomplete="current-password">
          <button class="btn btn-primary">Juntar dados</button>
        </form>`, 'border border-rose-100');
    }
    if (!D.conectado()) {
      return secao('Sincronizar com o Google Drive', '☁️', `
        <p class="text-sm text-slate-600 mt-1">Use os mesmos dados no celular e no computador. O app guarda um arquivo <b>cifrado</b>
          numa pasta oculta do seu Drive (o app não vê seus outros arquivos e o Google não consegue ler o conteúdo).</p>
        <button data-act="drive-conectar" class="btn btn-primary mt-3">Conectar Google Drive</button>`);
    }
    return secao('Google Drive', '☁️', `
      <div id="sync-status-dados" class="mt-2"></div>
      <p class="text-xs text-slate-500 mt-1">As alterações são enviadas em segundos e o app confere novidades ao abrir e a cada 2 minutos.</p>
      <div class="flex flex-col sm:flex-row gap-2 mt-3">
        <button data-act="drive-sync" class="btn btn-ghost">⟳ Sincronizar agora</button>
        <button data-act="drive-sair" class="btn btn-danger-ghost">Desconectar</button>
      </div>`);
  }

  /**
   * Pequena janela com campos (senhas). Fica aberta até "validar" devolver null.
   * validar(valores) → mensagem de erro (string) ou null para fechar. Resolve true/false.
   */
  function pedirDados(titulo, texto, campos, botao, validar) {
    return new Promise((resolve) => {
      const panel = Fin.ui.openModal(`
        <form id="pd-form" class="p-5 space-y-3" novalidate>
          <h2 class="font-semibold text-lg">${titulo}</h2>
          ${texto ? `<p class="text-sm text-slate-600">${texto}</p>` : ''}
          ${campos.map((c) => `<label class="field"><span>${c.rotulo}</span><input name="${c.name}" type="${c.tipo || 'password'}" value="${esc(c.valor || '')}" class="input" autocomplete="${c.auto || 'off'}"></label>`).join('')}
          <p id="pd-erro" class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" data-close class="btn btn-ghost">Cancelar</button>
            <button type="submit" class="btn btn-primary">${botao}</button>
          </div>
        </form>`, titulo);
      const form = panel.querySelector('#pd-form');
      panel.querySelector('[data-close]').addEventListener('click', () => { Fin.ui.closeModal(); resolve(false); });
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type=submit]');
        btn.disabled = true;
        const valores = Object.fromEntries(campos.map((c) => [c.name, form.elements[c.name].value]));
        const erro = await validar(valores);
        btn.disabled = false;
        if (erro) {
          const p = form.querySelector('#pd-erro');
          p.textContent = erro;
          p.classList.remove('hidden');
          return;
        }
        Fin.ui.closeModal();
        resolve(true);
      });
    });
  }

  const avisarDrive = () => { if (Fin.drive.conectado()) { Fin.storage.setPref('driveSujo', true); Fin.drive.sincronizar(); } };

  async function trocarSenha() {
    const ok = await pedirDados('Trocar senha', 'A chave de recuperação continua a mesma.', [
      { name: 'atual', rotulo: 'Senha atual', auto: 'current-password' },
      { name: 'nova', rotulo: 'Nova senha (mínimo 8)', auto: 'new-password' },
      { name: 'nova2', rotulo: 'Repita a nova senha', auto: 'new-password' },
    ], 'Trocar', async ({ atual, nova, nova2 }) => {
      if (nova.length < 8) return 'A nova senha precisa ter pelo menos 8 caracteres.';
      if (nova !== nova2) return 'As senhas não conferem.';
      try { await Fin.cofre.trocarSenha(atual, nova); return null; } catch { return 'Senha atual incorreta.'; }
    });
    if (ok) { Fin.ui.toast('Senha alterada.'); avisarDrive(); }
  }

  async function novaChave() {
    let codigoRecuperacao = null;
    const ok = await pedirDados('Nova chave de recuperação', 'A chave anterior deixa de funcionar.',
      [{ name: 'senha', rotulo: 'Senha atual', auto: 'current-password' }], 'Gerar', async ({ senha }) => {
        try { ({ codigoRecuperacao } = await Fin.cofre.novoCodigoRecuperacao(senha)); return null; } catch { return 'Senha incorreta.'; }
      });
    if (!ok) return;
    {
      Fin.ui.openModal(`
        <div class="p-5 space-y-3">
          <h2 class="font-semibold text-lg">Nova chave de recuperação</h2>
          <p class="text-sm text-slate-600">Guarde fora deste aparelho. A chave anterior não vale mais.</p>
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center"><code class="font-semibold tracking-wider break-all select-all">${esc(codigoRecuperacao)}</code></div>
          <div class="flex justify-end"><button data-close class="btn btn-primary">Guardei</button></div>
        </div>`, 'Nova chave de recuperação').querySelector('[data-close]').addEventListener('click', Fin.ui.closeModal);
      avisarDrive();
    }
  }

  /** Bloco "restaurar" mostrado também na tela vazia (aparelho novo). */
  /* ---------------- Primeiro uso: começar do zero (sem planilha) ---------------- */

  // [nome, ícone, classificação, extras]
  const CATEGORIAS_PADRAO = {
    despesa: [
      ['Moradia', '🏠', 'Essencial'], ['Contas da casa', '💡', 'Essencial'], ['Mercado', '🛒', 'Essencial'],
      ['Transporte', '🚗', 'Essencial'], ['Saúde', '💊', 'Essencial'], ['Educação', '🎓', 'Essencial'],
      ['Restaurantes e delivery', '🍽️', 'Estilo de vida'], ['Lazer', '🎮', 'Estilo de vida'], ['Roupas', '👕', 'Estilo de vida'],
      ['Cuidados pessoais', '💇', 'Estilo de vida'], ['Assinaturas', '📱', 'Estilo de vida'], ['Viagens', '✈️', 'Estilo de vida'],
      ['Presentes', '🎁', 'Estilo de vida'], ['Pets', '🐾', 'Estilo de vida'],
      ['Pagamento Fatura', '💳', 'Financeiro'], ['Impostos e taxas', '🧾', 'Financeiro'],
      ['Investimentos', '📈', 'Financeiro', { investimento: true }], ['Outros gastos', '📦', 'Outros'],
    ],
    receita: [
      ['Salário', '💰', 'Receitas'], ['Renda extra', '💼', 'Receitas'], ['Rendimentos', '🏦', 'Receitas'],
      ['Reembolsos', '🔁', 'Receitas'], ['Outras receitas', '📦', 'Receitas'],
    ],
  };

  function blocoComecarZero() {
    const nD = CATEGORIAS_PADRAO.despesa.length;
    const nR = CATEGORIAS_PADRAO.receita.length;
    const exemplos = CATEGORIAS_PADRAO.despesa.slice(0, 8).map(([n, i]) => `<span class="inline-flex items-center gap-1 bg-slate-100 rounded-full px-2 py-0.5">${i} ${esc(n)}</span>`).join(' ');
    return `
      <section class="bg-white rounded-2xl shadow-sm p-5 sm:p-6 mb-4 border-2 border-prim-200">
        ${Fin.icones.titulo('lista', 'prim', 'Começar do zero', { cls: 'text-lg', tam: 'w-8 h-8', ic: 'w-[18px] h-[18px]' })}
        <p class="text-sm text-slate-600 mt-1">Não tem planilha? Comece já com <b>${nD} categorias de despesa e ${nR} de receita</b> prontas — dá para renomear, apagar ou criar outras depois.</p>
        <p class="text-xs text-slate-500 mt-2 flex flex-wrap gap-1">${exemplos} <span class="px-1 py-0.5">e mais…</span></p>
        <button data-act="zero" class="btn btn-primary mt-4">Começar do zero</button>
      </section>
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 text-center mb-4">ou, se já tem seus lançamentos numa planilha</p>`;
  }

  function comecarDoZero() {
    const cats = ['despesa', 'receita'].flatMap((tipo) => CATEGORIAS_PADRAO[tipo].map(([nome, icone, classificacao, extra]) => ({
      id: Fin.storage.uid(), nome, icone, tipo, classificacao, orcamentoMensal: 0, ...(extra || {}),
    })));
    Fin.storage.comecarDoZero(cats);
    Fin.state.mes = fmt.currentYM();
    Fin.ui.toast('Tudo pronto! Use o botão “＋” para o primeiro lançamento.');
    location.hash = '#/dashboard';
    // Tour de boas-vindas (uma vez por aparelho), agora que o app tem o básico.
    setTimeout(() => { if (!Fin.storage.prefs().tourVisto && !Fin.tour.ativo()) Fin.tour.iniciar(); }, 900);
  }

  function blocoRestaurarVazio() {
    return secao('Já tem um backup?', '♻️', `
      <p class="text-sm text-slate-600 mt-1">Em um aparelho novo, restaure o arquivo de backup baixado no outro aparelho.</p>
      <label class="btn btn-ghost cursor-pointer mt-3">♻️ Restaurar backup<input id="backup-input" type="file" accept=".json,application/json" class="sr-only"></label>`, 'mt-4');
  }

  /* ---------------- Restauração ---------------- */

  function renderRestore() {
    const r = state.restore;
    const S = Fin.storage;
    const linha = (rot, k) => `<tr><td>${rot}</td><td class="num">${S.list(k).length}</td><td class="num font-semibold">${r.contagens[k]}</td></tr>`;
    return `
      <section class="bg-white rounded-2xl shadow-sm p-5 sm:p-6 space-y-4">
        <div>
          <h2 class="font-semibold text-lg">Restaurar backup</h2>
          <p class="text-sm text-slate-500 mt-1 break-all">${esc(state.restoreArquivo)}${r.exportadoEm ? ` · feito em ${quando(r.exportadoEm)}` : ''}</p>
        </div>
        <div class="table-wrap border border-slate-200 rounded-xl"><table>
          <thead><tr><th></th><th class="num">Hoje no app</th><th class="num">No backup</th></tr></thead>
          <tbody>${linha('Lançamentos', 'lancamentos')}${linha('Compras no cartão', 'cartaoCompras')}${linha('Categorias', 'categorias')}${linha('Cartões', 'cartoes')}</tbody>
        </table></div>
        ${S.hasData() ? `
          <p class="text-sm text-amber-800 bg-amber-50 rounded-lg px-3 py-2"><span aria-hidden="true">!</span> Os dados atuais deste aparelho serão <b>substituídos</b> pelos do backup.</p>
          <label class="flex items-start gap-2 text-sm"><input id="restore-copia" type="checkbox" checked class="mt-0.5 w-4 h-4 accent-prim-600">
            <span>Baixar antes uma cópia dos dados atuais (recomendado)</span></label>` : ''}
        <div class="flex gap-2 justify-end">
          <button data-act="restore-cancel" class="btn btn-ghost">Cancelar</button>
          <button data-act="restore-ok" class="btn btn-primary">Restaurar</button>
        </div>
      </section>`;
  }

  async function escolherBackup(file) {
    if (!file) return;
    const texto = await file.text();
    let lido = null;
    try {
      lido = await Fin.storage.lerBackup(texto);
    } catch (err) {
      if (!err.precisaSenha) return Fin.ui.toast(err.message, 'error');
      // Backup cifrado com outra senha (ex.: de outro aparelho antes de sincronizar)
      await pedirDados('Backup protegido', esc(err.message), [
        { name: 'usuario', rotulo: 'Usuário', tipo: 'text', valor: err.usuario || '', auto: 'username' },
        { name: 'senha', rotulo: 'Senha', auto: 'current-password' },
      ], 'Abrir', async ({ usuario, senha }) => {
        try { lido = await Fin.storage.lerBackup(texto, { usuario, senha }); return null; } catch (e) { return e.precisaSenha ? 'Usuário ou senha incorretos.' : e.message; }
      });
      if (!lido) return;
    }
    state.restore = lido;
    state.restoreArquivo = file.name;
    state.mode = 'restore';
    draw();
    window.scrollTo(0, 0);
  }

  async function confirmarRestauracao() {
    if (view.querySelector('#restore-copia')?.checked) baixar(await Fin.storage.exportBackup(), `financas-antes-de-restaurar-${fmt.todayISO()}.json`);
    try {
      Fin.storage.restaurarBackup(state.restore);
      const total = state.restore.contagens.lancamentos;
      Object.assign(state, { restore: null, restoreArquivo: null, mode: null });
      Fin.state.mes = Fin.finance.mesInicial();
      Fin.pwa.proteger().catch(() => {});
      Fin.ui.toast(`Backup restaurado: ${total} lançamentos.`);
      Fin.router.go('/dashboard');
    } catch (err) {
      Fin.ui.toast(err.message, 'error');
    }
  }

  async function atualizarProtecao() {
    const el = view?.querySelector('#prot-status');
    if (!el) return;
    const { protegido } = await Fin.pwa.armazenamento();
    if (protegido === null) el.innerHTML = 'Este navegador não oferece essa proteção. Mantenha backups em dia.';
    else if (protegido) el.innerHTML = '<span class="text-emerald-800 font-medium"><span aria-hidden="true">✓</span> Dados protegidos contra limpeza automática.</span>';
    else el.innerHTML = '<span class="text-slate-600">Ainda não protegido.</span> <button data-act="proteger" class="ml-1 text-prim-700 font-semibold hover:underline">Proteger agora</button>';
  }

  /* ---------------- Painel: upload ---------------- */

  function renderUpload() {
    const voltar = Fin.storage.hasData()
      ? '<button data-act="cancel" class="text-sm text-slate-500 hover:text-slate-800 shrink-0">Cancelar</button>'
      : '';
    return `
      <section class="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
        <div class="flex items-start justify-between gap-3">
          <div>
            ${Fin.icones.titulo('upload', 'emerald', 'Importe sua planilha', { cls: 'text-lg', tam: 'w-8 h-8', ic: 'w-[18px] h-[18px]' })}
            <p class="text-sm text-slate-500 mt-1">
              Envie o arquivo Excel com seus lançamentos antigos. Ele é lido aqui mesmo, no seu navegador — nada é enviado para a internet.
            </p>
          </div>${voltar}
        </div>
        <label id="dropzone" for="file-input"
          class="dropzone mt-5 flex flex-col items-center justify-center text-center gap-2 border-2 border-dashed border-slate-300 rounded-2xl px-4 py-10 cursor-pointer transition">
          <span class="text-4xl" aria-hidden="true">📂</span>
          <span class="font-medium">Toque para escolher o arquivo</span>
          <span class="text-sm text-slate-500 hidden sm:block">ou arraste e solte aqui</span>
          <span class="text-xs text-slate-400">.xlsx, .xls, .csv ou .ods</span>
          <input id="file-input" type="file" class="sr-only"
            accept=".xlsx,.xlsm,.xls,.csv,.ods,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" />
        </label>
        <div id="loading" class="hidden mt-5 flex items-center gap-3 text-sm text-slate-600">
          <span class="spinner" aria-hidden="true"></span> Lendo a planilha…
        </div>
      </section>`;
  }

  /* ---------------- Painel: revisão ---------------- */

  function renderReview() {
    return `
      <section class="space-y-4">
        <div class="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              ${Fin.icones.titulo('lista', 'emerald', 'Confira antes de salvar', { cls: 'text-lg', tam: 'w-8 h-8', ic: 'w-[18px] h-[18px]' })}
              <p class="text-sm text-slate-500 mt-1 break-all">${esc(state.fileName)} · ${state.sheets.length} abas encontradas</p>
            </div>
            <button data-act="cancel" class="text-sm text-slate-500 hover:text-slate-800 shrink-0">Cancelar</button>
          </div>
          <div id="review-totals" class="grid grid-cols-3 gap-3 mt-5"></div>
          <p class="text-xs text-slate-500 mt-4">
            Cada aba foi analisada automaticamente. Se algo estiver errado, altere o tipo da aba ou abra
            “Colunas reconhecidas” para corrigir o mapeamento.
          </p>
        </div>
        <div id="sheets" class="space-y-4">${state.sheets.map(renderSheet).join('')}</div>
      </section>
      <div class="save-bar fixed inset-x-0 bottom-16 md:bottom-0 md:left-60 z-20 bg-white/95 backdrop-blur border-t border-slate-200">
        <div class="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <p id="save-summary" class="text-sm text-slate-600 flex-1 min-w-0"></p>
          <button data-act="save" id="btn-save" class="btn btn-primary shrink-0">Salvar no navegador</button>
        </div>
      </div>`;
  }

  function renderTotals() {
    const data = Fin.importer.collect(state.sheets);
    view.querySelector('#review-totals').innerHTML =
      stat('lançamentos', data.lancamentos.length) + stat('compras no cartão', data.cartaoCompras.length) + stat('categorias', data.categorias.length);
    const total = data.lancamentos.length + data.cartaoCompras.length;
    view.querySelector('#save-summary').textContent = total ? `${total} registros prontos para salvar` : 'Nenhum registro reconhecido ainda';
    view.querySelector('#btn-save').disabled = total === 0 && data.categorias.length === 0;
  }

  function renderSheet(sheet, idx) {
    const ignored = sheet.kind === 'ignorar';
    const schema = SCHEMAS[sheet.kind];
    const missing = schema && !Fin.columns.meetsRequired(sheet.mapping, schema);
    const excelRow = sheet.headerRow !== null ? sheet.headerRow + sheet.rowOffset + 1 : null;
    const kindOptions = Object.entries(KIND_LABEL)
      .map(([k, label]) => `<option value="${k}" ${k === sheet.kind ? 'selected' : ''}>${label}</option>`)
      .join('');
    const badge = ignored
      ? '<span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">ignorada</span>'
      : `<span class="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">${sheet.records.length} registros</span>`;

    return `
      <article class="bg-white rounded-2xl shadow-sm p-4 sm:p-5 ${ignored ? 'opacity-75' : ''}" data-sheet="${idx}">
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap"><h3 class="font-semibold truncate">${esc(sheet.name)}</h3>${badge}</div>
            ${!ignored ? `<p class="text-xs text-slate-500 mt-1">
              Cabeçalho na linha ${excelRow} · ${Object.keys(sheet.mapping).length} colunas reconhecidas
              ${sheet.skipped ? ` · ${sheet.skipped} linhas sem data ou valor ignoradas (ex.: linhas-modelo vazias)` : ''}</p>` : ''}
          </div>
          <label class="text-sm flex items-center gap-2 shrink-0">
            <span class="text-slate-500">Tipo:</span>
            <select data-action="kind" class="input !w-auto !py-1.5">${kindOptions}</select>
          </label>
        </div>
        ${missing ? `<p class="mt-3 text-sm text-amber-800 bg-amber-50 rounded-lg px-3 py-2">
          Faltam colunas obrigatórias (data e valor). Ajuste em “Colunas reconhecidas”.</p>` : ''}
        ${ignored ? '' : renderMapping(sheet, missing) + renderPreview(sheet)}
      </article>`;
  }

  function renderMapping(sheet, open) {
    const schema = SCHEMAS[sheet.kind];
    const headers = sheet.rows[sheet.headerRow] || [];
    const fieldOptions = (current) =>
      `<option value="">— ignorar coluna —</option>` +
      Object.entries(schema.fields)
        .map(([f, def]) => `<option value="${f}" ${f === current ? 'selected' : ''}>${esc(def.label)}</option>`)
        .join('');
    const items = headers
      .map((h, col) => ({ h, col }))
      .filter(({ h, col }) => (typeof h === 'string' && h.trim()) || sheet.mapping[col])
      .map(({ h, col }) => `
        <div class="flex items-center gap-2 py-1.5">
          <span class="flex-1 min-w-0 truncate text-sm ${sheet.mapping[col] ? '' : 'text-slate-400'}" title="${esc(h)}">${esc(h ?? `Coluna ${col + 1}`)}</span>
          <span class="text-slate-300" aria-hidden="true">→</span>
          <select data-action="column" data-col="${col}" class="input !w-40 sm:!w-48 !py-1" aria-label="Campo para a coluna ${esc(h)}">
            ${fieldOptions(sheet.mapping[col])}
          </select>
        </div>`)
      .join('');
    return `
      <details class="mt-4 border border-slate-200 rounded-xl" ${open ? 'open' : ''}>
        <summary class="px-3 py-2.5 text-sm font-medium flex items-center gap-2"><span class="chev text-slate-400">▸</span> Colunas reconhecidas</summary>
        <div class="px-3 pb-3 divide-y divide-slate-100">${items || '<p class="text-sm text-slate-500 py-2">Nenhum título de coluna encontrado.</p>'}</div>
      </details>`;
  }

  function renderPreview(sheet) {
    const recs = sheet.records.slice(0, 5);
    if (!recs.length) return '<p class="mt-4 text-sm text-slate-500">Nenhum registro válido com o mapeamento atual.</p>';
    const ym = (s) => (s ? fmt.monthShort(s) : '—');
    const cat = (r) => `${r.categoriaIcone || ''} ${esc(r.categoria)}`;
    const COLS = {
      lancamentos: [
        ['Data', (r) => fmt.date(r.data)],
        ['Descrição', (r) => esc(r.descricao)],
        ['Categoria', cat],
        ['Tipo', (r) => (r.tipo === 'receita' ? 'Receita' : 'Despesa')],
        ['Valor', (r) => fmt.brl(r.valorPago ?? r.valorPrevisto), 'num'],
        ['Status', (r) => esc(r.status)],
        ['Compet.', (r) => ym(r.competencia)],
      ],
      cartao: [
        ['Data', (r) => fmt.date(r.data)],
        ['Descrição', (r) => esc(r.descricao)],
        ['Categoria', cat],
        ['Parcela', (r) => (r.parcela ? `${r.parcela.atual}/${r.parcela.total}` : '—')],
        ['Valor', (r) => fmt.brl(r.valor), 'num'],
        ['Fatura', (r) => ym(r.fatura)],
      ],
      categorias: [
        ['Categoria', (r) => `${r.icone || ''} ${esc(r.nome)}`],
        ['Tipo', (r) => esc(r.tipo)],
        ['Classificação', (r) => esc(r.classificacao ?? '—')],
        ['Orçamento', (r) => fmt.brl(r.orcamentoMensal), 'num'],
      ],
    }[sheet.kind];
    return `
      <p class="mt-4 mb-2 text-xs font-medium text-slate-500 uppercase tracking-wide">Prévia (primeiros ${recs.length})</p>
      <div class="table-wrap border border-slate-200 rounded-xl">
        <table>
          <thead><tr>${COLS.map(([h, , cls]) => `<th class="${cls || ''}">${h}</th>`).join('')}</tr></thead>
          <tbody>${recs.map((r) => `<tr>${COLS.map(([, fn, cls]) => `<td class="${cls || ''}">${fn(r)}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>`;
  }

  /* ---------------- Ações ---------------- */

  async function handleFile(file) {
    if (!file) return;
    if (!/\.(xlsx|xlsm|xls|csv|ods)$/i.test(file.name)) {
      Fin.ui.toast('Formato não suportado. Use .xlsx, .xls, .csv ou .ods.', 'error');
      return;
    }
    if (typeof XLSX === 'undefined') {
      Fin.ui.toast('A biblioteca SheetJS não carregou. Verifique sua conexão e recarregue a página.', 'error');
      return;
    }
    view.querySelector('#loading')?.classList.remove('hidden');
    try {
      const wb = await Fin.importer.readWorkbook(file);
      state.fileName = file.name;
      state.sheets = Fin.importer.analyze(wb);
      state.mode = 'review';
      draw();
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      Fin.ui.toast(`Não foi possível ler o arquivo: ${err.message}`, 'error');
      view.querySelector('#loading')?.classList.add('hidden');
    }
  }

  /* ---------------- Confirmações (reimportar e apagar) ---------------- */

  const num = (n) => n.toLocaleString('pt-BR');
  const plural = (n, um, varios) => `${num(n)} ${n === 1 ? um : varios}`;

  /** Retrato do que existe hoje neste aparelho. */
  function retrato() {
    const S = Fin.storage;
    const l = S.list('lancamentos');
    const c = S.list('cartaoCompras');
    const comps = l.map((x) => x.competencia).filter(Boolean).sort();
    return {
      lanc: l.length, compras: c.length, cats: S.list('categorias').length, cartoes: Fin.finance.cartoes().length,
      lancApp: l.filter((x) => x.origem === 'app').length,
      lancEditados: l.filter((x) => x.origem !== 'app' && x.atualizadoEm).length,
      comprasApp: c.filter((x) => x.origem === 'app' || x.origem === 'pdf').length,
      invMovs: S.list('invMovs').length, invContas: S.list('invContas').length,
      de: comps[0] || null, ate: comps[comps.length - 1] || null,
      drive: Fin.drive?.conectado() || false,
    };
  }
  const periodo = (de, ate) => (de ? `${fmt.monthShort(de)} a ${fmt.monthShort(ate)}` : '—');

  /** 1º passo da reimportação: explica antes de escolher o arquivo. */
  async function confirmarReimportar() {
    const r = retrato();
    const ok = await Fin.ui.confirmar({
      titulo: 'Importar a planilha novamente?', icone: 'upload', cor: 'amber',
      intro: 'A planilha vai <b>substituir</b> os lançamentos, compras, categorias e cartões deste app. Use só se a planilha for a versão mais completa dos seus dados.',
      perde: [
        `Os <b>${plural(r.lanc, 'lançamento', 'lançamentos')}</b> e <b>${plural(r.compras, 'compra', 'compras')} no cartão</b> de hoje serão trocados pelos da planilha.`,
        ...(r.lancApp ? [r.lancApp === 1
          ? '<b>1 lançamento criado no app</b> (que não está na planilha) será perdido.'
          : `<b>${num(r.lancApp)} lançamentos criados no app</b> (que não estão na planilha) serão perdidos.`] : []),
        ...(r.lancEditados ? [`Alterações feitas no app em <b>${plural(r.lancEditados, 'lançamento', 'lançamentos')}</b> (pagamentos marcados, valores) voltam ao que está na planilha.`] : []),
        ...(r.comprasApp ? [r.comprasApp === 1
          ? '<b>1 compra lançada</b> no app ou por PDF de fatura será perdida.'
          : `<b>${num(r.comprasApp)} compras lançadas</b> no app ou por PDF de fatura serão perdidas.`] : []),
        'As categorias voltam às da planilha (marcações feitas no app, como "investimento", se perdem).',
        ...(r.drive ? ['<b>O Google Drive e os outros aparelhos</b> (celular/computador) também recebem a substituição na próxima sincronização.'] : []),
        ...(Fin.cofre.pessoas().length > 1 ? ['<b>A outra pessoa da casa</b> também perde os lançamentos que ela fez no app e passa a ver os da planilha.'] : []),
      ],
      mantem: [
        ...(r.invMovs || r.invContas ? ['Investimentos (carteira, reserva, metas) não são tocados.'] : []),
        'Usuário, senha e preferências.',
        'Antes de gravar, o app mostra o arquivo escolhido e compara com os dados de hoje.',
      ],
      backup: onBackup,
      ciente: 'Entendi que os dados atuais serão substituídos pelos da planilha.',
      botao: 'Continuar e escolher o arquivo',
    });
    if (ok) { state.mode = 'upload'; draw(); }
  }

  /** 2º passo: arquivo escolhido e conferido — compara com o que existe e pede a confirmação final. */
  async function confirmarSubstituicao(data) {
    const r = retrato();
    const meta = Fin.storage.getMeta();
    const comps = data.lancamentos.map((x) => x.competencia).filter(Boolean).sort();
    const novo = { lanc: data.lancamentos.length, compras: data.cartaoCompras.length, cats: data.categorias.length, de: comps[0], ate: comps[comps.length - 1] };
    const avisos = [];
    if (meta?.arquivo && meta.arquivo !== state.fileName) avisos.push(`O arquivo escolhido (<b>${esc(state.fileName)}</b>) é <b>diferente</b> do usado na última importação (<b>${esc(meta.arquivo)}</b>). Confira se é o arquivo certo.`);
    if (r.lanc && novo.lanc < r.lanc * 0.8) avisos.push(`A planilha tem <b>menos lançamentos</b> (${num(novo.lanc)}) do que o app hoje (${num(r.lanc)}): ${num(r.lanc - novo.lanc)} sairiam.`);
    if (r.compras && novo.compras < r.compras * 0.8) avisos.push(`A planilha tem <b>menos compras no cartão</b> (${num(novo.compras)}) do que o app hoje (${num(r.compras)}).`);
    if (r.ate && novo.ate && novo.ate < r.ate) avisos.push(`A planilha vai só até <b>${fmt.monthShort(novo.ate)}</b>; o app tem lançamentos até <b>${fmt.monthShort(r.ate)}</b>.`);
    const linha = (rot, a, b) => `<tr><td class="py-1 pr-3">${rot}</td><td class="py-1 pr-3 text-right tabular-nums">${a}</td><td class="py-1 text-right tabular-nums font-medium ${a !== b ? 'text-amber-800' : ''}">${b}</td></tr>`;
    const resumo = `
      <div class="text-sm">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Hoje × planilha escolhida</div>
        <table class="w-full">
          <thead><tr class="text-xs text-slate-500"><th class="text-left font-medium"></th><th class="text-right font-medium pr-3">Hoje no app</th><th class="text-right font-medium">Planilha</th></tr></thead>
          <tbody>
            ${linha('Lançamentos', num(r.lanc), num(novo.lanc))}
            ${linha('Compras no cartão', num(r.compras), num(novo.compras))}
            ${linha('Categorias', num(r.cats), num(novo.cats))}
            ${linha('Período', periodo(r.de, r.ate), periodo(novo.de, novo.ate))}
          </tbody>
        </table>
        <p class="text-xs text-slate-500 mt-1">Arquivo: <b>${esc(state.fileName)}</b>${meta?.importadoEm ? ` · última importação: ${esc(meta.arquivo || '—')} em ${quando(meta.importadoEm)}` : ''}</p>
      </div>`;
    return Fin.ui.confirmar({
      titulo: 'Substituir os dados agora?', icone: 'alerta', cor: 'rose',
      intro: 'Último passo. Depois disso, os dados de hoje só voltam com um backup.',
      avisos, resumo,
      perde: [
        `Os dados de hoje são trocados pelos da planilha <b>${esc(state.fileName)}</b>.`,
        ...(r.lancApp ? [r.lancApp === 1 ? '<b>1 lançamento criado no app</b> será perdido.' : `<b>${num(r.lancApp)} lançamentos criados no app</b> serão perdidos.`] : []),
        ...(r.drive ? ['A troca também vai para o <b>Google Drive</b> e para os outros aparelhos.'] : []),
      ],
      backup: onBackup,
      ciente: avisos.length ? 'Conferi os avisos acima e quero substituir mesmo assim.' : 'Conferi o arquivo e quero substituir os dados.',
      botao: 'Substituir dados',
    });
  }

  async function onSave() {
    const data = Fin.importer.collect(state.sheets);
    if (Fin.storage.hasData() && !(await confirmarSubstituicao(data))) return;
    try {
      Fin.storage.saveImport(data, { arquivo: state.fileName });
      state.sheets = [];
      state.mode = null;
      Fin.state.mes = Fin.finance.mesInicial();
      Fin.pwa.proteger().catch(() => {});
      Fin.ui.toast(`Pronto! ${data.lancamentos.length + data.cartaoCompras.length} registros salvos.`);
      Fin.router.go('/dashboard');
    } catch (err) {
      Fin.ui.toast(err.message, 'error');
    }
  }

  function baixar(texto, nome) {
    const blob = new Blob([texto], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nome;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  const nomeBackup = () => `financas-backup-${fmt.todayISO()}.json`;

  async function onBackup() {
    Fin.finance.cartoes(); // garante que a configuração dos cartões exista e vá no backup
    baixar(await Fin.storage.exportBackup(), nomeBackup());
    Fin.storage.registrarBackup();
    Fin.ui.toast(Fin.cofre.existeConta()
      ? 'Backup baixado (cifrado: abre só com a sua senha).'
      : 'Backup baixado. Guarde o arquivo em um lugar seguro (ex.: Google Drive).');
    draw();
  }

  /** Celular: abre a folha de compartilhamento (Drive, WhatsApp, e-mail…). */
  async function onCompartilhar() {
    Fin.finance.cartoes();
    const file = new File([await Fin.storage.exportBackup()], nomeBackup(), { type: 'application/json' });
    try {
      await navigator.share({ files: [file], title: 'Backup Valoris' });
      Fin.storage.registrarBackup();
      Fin.ui.toast('Backup enviado.');
      draw();
    } catch (err) {
      if (err?.name !== 'AbortError') Fin.ui.toast('Não foi possível compartilhar. Use “Baixar backup”.', 'error');
    }
  }

  async function onApagar() {
    const r = retrato();
    const ok = await Fin.ui.confirmar({
      titulo: 'Apagar todos os dados deste aparelho?', icone: 'alerta', cor: 'rose',
      intro: 'O app volta ao estado de recém-instalado neste navegador. <b>Não dá para desfazer</b> sem um backup.',
      perde: [
        `<b>${plural(r.lanc, 'lançamento', 'lançamentos')}</b> e <b>${plural(r.compras, 'compra', 'compras')} no cartão</b>${r.de ? ` (${periodo(r.de, r.ate)})` : ''}.`,
        `<b>${plural(r.cats, 'categoria', 'categorias')}</b>, <b>${plural(r.cartoes, 'cartão', 'cartões')}</b>, orçamentos e configurações.`,
        ...(r.invMovs || r.invContas ? [`<b>Investimentos</b>: ${plural(r.invContas, 'conta', 'contas')}, ${plural(r.invMovs, 'movimentação', 'movimentações')}, reserva e metas.`] : []),
        `O <b>acesso deste aparelho</b> (usuário ${esc(Fin.cofre.usuario() || '')} e senha): o app volta para "Criar acesso".`,
      ],
      mantem: [
        ...(r.drive ? ['A cópia no <b>Google Drive</b>: o aparelho é desconectado antes de apagar, então o Drive e os outros aparelhos não são afetados. Para trazer de volta: "Já uso o app em outro aparelho".'] : ['Backups que você já baixou.']),
        'Os outros aparelhos onde você usa o app.',
      ],
      backup: onBackup,
      ciente: 'Entendi que tudo neste aparelho será apagado e que não dá para desfazer.',
      palavra: 'APAGAR',
      botao: 'Apagar tudo',
    });
    if (!ok) { Fin.ui.toast('Nada foi apagado.'); return; }
    Fin.drive.desconectar();
    Fin.storage.clearAll(); // inclui o acesso (usuário/senha) deste aparelho
    location.reload(); // volta para "Criar acesso"
  }

  function onSheetChange(e) {
    const card = e.target.closest('[data-sheet]');
    if (!card) return;
    const idx = Number(card.dataset.sheet);
    const sheet = state.sheets[idx];
    if (e.target.dataset.action === 'kind') Fin.importer.setKind(sheet, e.target.value);
    if (e.target.dataset.action === 'column') Fin.importer.setColumn(sheet, Number(e.target.dataset.col), e.target.value);
    const wasOpen = card.querySelector('details')?.open;
    card.outerHTML = renderSheet(sheet, idx);
    const details = view.querySelector(`[data-sheet="${idx}"] details`);
    if (details && wasOpen) details.open = true;
    renderTotals();
  }

  function draw() {
    const mode = state.mode || (Fin.storage.hasData() ? null : 'upload');
    view.innerHTML = mode === 'review' ? renderReview()
      : mode === 'restore' ? renderRestore()
      : mode === 'upload' ? (Fin.storage.hasData() ? '' : blocoComecarZero()) + renderUpload() + blocoRestaurarVazio()
      : renderImported();
    if (mode === 'review') renderTotals();
    if (mode === 'upload') bindDropzone();
    if (!mode) { atualizarProtecao(); Fin.drive.desenharStatus(); }
  }

  function bindDropzone() {
    const dz = view.querySelector('#dropzone');
    view.querySelector('#file-input').addEventListener('change', (e) => handleFile(e.target.files[0]));
    ['dragenter', 'dragover'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('is-dragging'); }));
    ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('is-dragging'); }));
    dz.addEventListener('drop', (e) => handleFile(e.dataTransfer.files[0]));
  }

  return {
    title: 'Dados e backup',
    handleFile, // exposto para testes
    state,
    render(container, { signal }) {
      view = container;
      // #view é o mesmo elemento em todas as telas: o signal remove estes ouvintes ao sair.
      view.addEventListener('change', (e) => {
        if (e.target.id === 'backup-input') return escolherBackup(e.target.files[0]);
        if (e.target.id === 'bloqueio-min') {
          Fin.storage.setPref('bloqueioMin', Number(e.target.value));
          return Fin.ui.toast('Bloqueio automático atualizado.');
        }
        onSheetChange(e);
      }, { signal });
      view.addEventListener('submit', async (e) => {
        if (e.target.id !== 'conflito-form') return;
        e.preventDefault();
        const f = e.target;
        try {
          await Fin.drive.resolverConflito(f.elements.usuario.value, f.elements.senha.value);
          Fin.ui.toast('Dados juntados. Este aparelho agora usa a senha do outro aparelho.');
          draw();
        } catch (err) {
          Fin.ui.toast(err.message.includes('incorretos') ? err.message : `Não foi possível juntar: ${err.message}`, 'error');
        }
      }, { signal });
      view.addEventListener('click', async (e) => {
        const act = e.target.closest('[data-act]')?.dataset.act;
        if (act === 'backup') onBackup();
        if (act === 'compartilhar') onCompartilhar();
        if (act === 'save') onSave();
        if (act === 'reimport') confirmarReimportar();
        if (act === 'cancel') { state.mode = null; state.sheets = []; draw(); }
        if (act === 'restore-ok') confirmarRestauracao();
        if (act === 'restore-cancel') { Object.assign(state, { mode: null, restore: null }); draw(); }
        if (act === 'apagar') onApagar();
        if (act === 'zero' && !Fin.storage.hasData()) comecarDoZero();
        if (act === 'instalar') { await Fin.pwa.instalar(); draw(); }
        if (act === 'trocar-senha') trocarSenha();
        if (act === 'nova-chave') novaChave();
        if (act === 'drive-conectar') {
          try { await Fin.drive.conectar(); } catch (err) { Fin.ui.toast(err.message, 'error'); }
          draw();
        }
        if (act === 'drive-sync') Fin.drive.sincronizar();
        if (act === 'drive-sair' && confirm('Desconectar o Google Drive deste aparelho? Os dados continuam aqui e no Drive.')) { Fin.drive.desconectar(); draw(); }
        if (act === 'proteger') {
          const ok = await Fin.pwa.proteger();
          Fin.ui.toast(ok ? 'Dados protegidos.' : 'O navegador não concedeu a proteção agora (ele decide pelo uso do site). Mantenha backups.', ok ? 'ok' : 'error');
          atualizarProtecao();
        }
      }, { signal });
      // Estado de instalação muda (botão "Instalar" aparece/some) → redesenha se nada estiver em andamento.
      window.addEventListener('fin:pwa', () => { if (!state.mode) draw(); }, { signal });
      // Conflito no Drive apareceu/sumiu → redesenha a seção.
      let conflitoAntes = !!Fin.drive.estado.conflito;
      window.addEventListener('fin:drive', () => {
        const c = !!Fin.drive.estado.conflito;
        if (c !== conflitoAntes && !state.mode) { conflitoAntes = c; draw(); }
      }, { signal });
      draw();
      Fin.drive.desenharStatus();
    },
  };
})();
