/**
 * sync/drive.js — Sincronização com o Google Drive.
 *
 * - Login Google pelo "Google Identity Services" (janela do Google; o app nunca vê sua senha).
 * - Permissões pedidas:
 *     drive.appdata → pasta oculta do app (modo de uma pessoa);
 *     drive.file    → só os arquivos que o próprio app criou ou que a pessoa escolheu no
 *                     seletor do Google (modo casal). O app NÃO enxerga os outros arquivos do Drive.
 * - Um único arquivo "minhas-financas.dat" com os dados JÁ CIFRADOS (o Google não
 *   consegue ler) + o "envelope" da conta, para outro aparelho abrir com a mesma senha.
 * - Modo casal (v2026-11-15.10): o arquivo passa para a pasta "Minhas Finanças (casa)" no Drive
 *   do titular, compartilhada com a outra pessoa (prefs.driveArquivo = { id, pasta }).
 *   O arquivo antigo da pasta oculta ganha "movidoPara": os outros aparelhos do titular
 *   mudam sozinhos para a pasta compartilhada.
 * - Quando muda algo: envia em poucos segundos. Ao abrir/voltar ao app e a cada 2 min:
 *   confere se o outro aparelho mudou algo e mescla registro a registro (sync/mesclar.js).
 */
window.Fin = window.Fin || {};

Fin.drive = (() => {
  const S = Fin.storage;
  const ESC_APPDATA = 'https://www.googleapis.com/auth/drive.appdata';
  const ESC_ARQUIVO = 'https://www.googleapis.com/auth/drive.file';
  const escopo = (comArquivo) => (comArquivo ? `${ESC_APPDATA} ${ESC_ARQUIVO}` : ESC_APPDATA);
  const NOME = 'minhas-financas.dat';
  const PASTA = 'Minhas Finanças (casa)';
  const GIS = 'https://accounts.google.com/gsi/client';
  const GAPI = 'https://apis.google.com/js/api.js';
  const API = 'https://www.googleapis.com/drive/v3/files';
  const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';

  const st = { token: null, expira: 0, escopos: '', pedido: null, sincronizando: false, erro: null, reconectar: false, conflito: null, geracao: 0, timer: null };
  let adaptadorTeste = null; // testes: imita o Drive sem internet

  const configurado = () => !!Fin.config?.googleClientId || !!adaptadorTeste;
  const conectado = () => configurado() && !!S.prefs().driveConectado;
  const tokenValido = () => !!adaptadorTeste || (!!st.token && Date.now() < st.expira);
  const temEscopoArquivo = () => !!adaptadorTeste || st.escopos.includes(ESC_ARQUIVO);
  const compartilhado = () => S.prefs().driveArquivo || null;

  /* ---------------- Token (Google Identity Services) ---------------- */

  let clienteToken = null;
  let esperando = [];

  async function carregarGIS() {
    if (window.google?.accounts?.oauth2) return;
    await Fin.faturaLeitor.loadScript(GIS);
  }

  function cliente() {
    if (clienteToken) return clienteToken;
    clienteToken = google.accounts.oauth2.initTokenClient({
      client_id: Fin.config.googleClientId,
      scope: ESC_APPDATA,
      callback: (resp) => {
        const fila = esperando; esperando = [];
        if (resp.error) return fila.forEach((p) => p.rej(new Error(resp.error_description || resp.error)));
        st.token = resp.access_token;
        st.expira = Date.now() + (Number(resp.expires_in || 3600) - 60) * 1000;
        st.escopos = String(resp.scope || '');
        st.reconectar = false;
        fila.forEach((p) => p.res(st.token));
      },
      error_callback: (err) => {
        const fila = esperando; esperando = [];
        st.reconectar = true;
        fila.forEach((p) => p.rej(new Error(err?.type === 'popup_closed' ? 'Janela do Google fechada.' : 'Não foi possível falar com o Google.')));
      },
    });
    return clienteToken;
  }

  /** Pede o token. Precisa ser chamado a partir de um clique (o Google abre uma janelinha). */
  function pedirToken(prompt = '', comArquivo = !!compartilhado()) {
    st.pedido = new Promise((res, rej) => {
      esperando.push({ res, rej });
      cliente().requestAccessToken({ prompt, scope: escopo(comArquivo) });
    }).finally(() => { st.pedido = null; });
    return st.pedido;
  }

  async function garantirToken() {
    if (tokenValido()) return;
    if (st.pedido) return st.pedido; // já pedido (ex.: no clique de "Entrar")
    st.reconectar = true;
    throw new Error('Conexão com o Google expirou.');
  }

  /* ---------------- Drive (REST) ---------------- */

  async function req(url, opts = {}) {
    const r = await fetch(url, { ...opts, headers: { ...(opts.headers || {}), Authorization: `Bearer ${st.token}` } });
    if (r.status === 401) { st.token = null; st.reconectar = true; throw new Error('Conexão com o Google expirou.'); }
    if (r.status === 404) { const e = new Error('Arquivo não encontrado no Drive (apagado ou sem acesso).'); e.status = 404; throw e; }
    if (!r.ok) throw new Error(`Google Drive respondeu ${r.status}.`);
    return r;
  }

  function multipart(meta, texto) {
    const b = `fin${Math.random().toString(36).slice(2)}`;
    return {
      corpo: `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n` +
        `--${b}\r\nContent-Type: application/json\r\n\r\n${texto}\r\n--${b}--`,
      tipo: `multipart/related; boundary=${b}`,
    };
  }

  const real = {
    /** Arquivo da pasta oculta (modo de uma pessoa). */
    async buscar() {
      const q = encodeURIComponent(`name='${NOME}'`);
      const j = await (await req(`${API}?spaces=appDataFolder&q=${q}&fields=files(id,version,modifiedTime)`)).json();
      return j.files?.[0] || null;
    },
    /** Arquivo por id (modo casal). */
    async info(id) {
      const j = await (await req(`${API}/${id}?fields=id,name,version,modifiedTime,trashed,parents`)).json();
      if (j.trashed) { const e = new Error('O arquivo compartilhado está na lixeira do Drive.'); e.status = 404; throw e; }
      return j;
    },
    async baixar(id) {
      return (await req(`${API}/${id}?alt=media`)).text();
    },
    async criar(texto) {
      const m = multipart({ name: NOME, parents: ['appDataFolder'] }, texto);
      return (await req(`${UPLOAD}?uploadType=multipart&fields=id,version,modifiedTime`, {
        method: 'POST', headers: { 'Content-Type': m.tipo }, body: m.corpo,
      })).json();
    },
    async atualizar(id, texto) {
      return (await req(`${UPLOAD}/${id}?uploadType=media&fields=id,version,modifiedTime`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: texto,
      })).json();
    },
    async criarPasta(nome) {
      return (await req(`${API}?fields=id`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nome, mimeType: 'application/vnd.google-apps.folder' }),
      })).json();
    },
    async criarEm(pasta, texto) {
      const m = multipart({ name: NOME, parents: [pasta], mimeType: 'application/json',
        description: 'Dados cifrados do app Minhas Finanças. Não edite nem apague.' }, texto);
      return (await req(`${UPLOAD}?uploadType=multipart&fields=id,version,modifiedTime`, {
        method: 'POST', headers: { 'Content-Type': m.tipo }, body: m.corpo,
      })).json();
    },
    async compartilhar(id, email, mensagem) {
      const p = new URLSearchParams({ sendNotificationEmail: 'true', emailMessage: mensagem || '', fields: 'id,emailAddress' });
      return (await req(`${API}/${id}/permissions?${p}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'user', role: 'writer', emailAddress: email }),
      })).json();
    },
    async permissoes(id) {
      const j = await (await req(`${API}/${id}/permissions?fields=permissions(id,emailAddress,displayName,role)`)).json();
      return j.permissions || [];
    },
    async removerPermissao(id, permId) {
      await req(`${API}/${id}/permissions/${permId}`, { method: 'DELETE' });
    },
    /** Seletor de arquivos do Google (Picker): concede ao app acesso ao arquivo escolhido. */
    async escolher() {
      if (!window.gapi) await Fin.faturaLeitor.loadScript(GAPI);
      await new Promise((res, rej) => gapi.load('picker', { callback: res, onerror: () => rej(new Error('Não foi possível abrir o seletor do Google.')) }));
      const gp = google.picker;
      return new Promise((resolve) => {
        const view = new gp.DocsView(gp.ViewId.DOCS)
          .setOwnedByMe(false)
          .setIncludeFolders(true)
          .setMimeTypes('application/json,application/octet-stream,text/plain');
        const b = new gp.PickerBuilder()
          .addView(view)
          .setOAuthToken(st.token)
          .setAppId(String(Fin.config.googleClientId).split('-')[0])
          .setLocale('pt-BR')
          .setTitle(`Escolha “${NOME}” (pasta ${PASTA})`)
          .setCallback((d) => {
            if (d.action === gp.Action.PICKED) resolve(d.docs?.[0]?.id || null);
            else if (d.action === gp.Action.CANCEL) resolve(null);
          });
        if (Fin.config.googlePickerKey) b.setDeveloperKey(Fin.config.googlePickerKey);
        b.build().setVisible(true);
      });
    },
  };
  const drive = () => adaptadorTeste || real;

  /** Arquivo em uso: o compartilhado (por id) ou o da pasta oculta. */
  async function localizar() {
    const c = compartilhado();
    if (c?.id) return drive().info(c.id);
    return drive().buscar();
  }

  /* ---------------- Sincronização ---------------- */

  function dispositivo() {
    const ua = navigator.userAgent;
    return /Android/i.test(ua) ? 'Android' : /iPhone|iPad/i.test(ua) ? 'iPhone/iPad' : /Windows/i.test(ua) ? 'Windows' : /Mac/i.test(ua) ? 'Mac' : 'Navegador';
  }

  async function montarArquivo(dados) {
    return JSON.stringify({
      app: 'minhas-financas', formato: 1, atualizadoEm: new Date().toISOString(), dispositivo: dispositivo(),
      conta: Fin.cofre.conta(),
      dados: await Fin.cofre.cifrar(JSON.stringify(dados)),
    });
  }

  async function enviar(id, dados) {
    const texto = await montarArquivo(dados);
    const r = id ? await drive().atualizar(id, texto) : await drive().criar(texto);
    S.setPref('driveVersao', String(r.version));
  }

  /** O arquivo da pasta oculta diz que os dados foram para a pasta compartilhada. */
  function seguirMudanca(movido) {
    S.setPref('driveArquivo', { id: movido.id, pasta: movido.pasta || null, desde: movido.em || new Date().toISOString() });
    S.setPref('driveVersao', null);
    S.setPref('driveSujo', true);
    if (!temEscopoArquivo()) {
      st.reconectar = true;
      throw new Error('Os dados agora ficam na pasta compartilhada. Toque em “Reconectar Google”.');
    }
    agendar(200);
  }

  async function sincronizar() {
    if (!conectado() || S.bloqueado() || st.sincronizando) return;
    if (!navigator.onLine && !adaptadorTeste) { st.erro = 'Sem internet — sincroniza quando a conexão voltar.'; return desenharStatus(); }
    st.sincronizando = true;
    st.erro = null;
    desenharStatus();
    const geracao = st.geracao;
    try {
      await garantirToken();
      if (compartilhado() && !temEscopoArquivo()) { st.reconectar = true; throw new Error('Toque em “Reconectar Google” para usar a pasta compartilhada.'); }
      await S.aguardarGravacao();
      let info;
      try {
        info = await localizar();
      } catch (e) {
        if (e.status === 404 && compartilhado()) throw new Error('Não achei o arquivo compartilhado no Drive (apagado ou acesso removido).');
        throw e;
      }
      const p = S.prefs();
      const sujo = p.driveSujo !== false;
      if (!info) {
        await enviar(null, S.exportarDados()); // primeiro envio (pasta oculta)
      } else if (String(info.version) === String(p.driveVersao)) {
        if (sujo) await enviar(info.id, S.exportarDados()); // só eu mudei
      } else {
        // O outro aparelho mudou algo: baixa, mescla e devolve o resultado.
        const arq = JSON.parse(await drive().baixar(info.id));
        if (!compartilhado() && arq.movidoPara?.id) return seguirMudanca(arq.movidoPara);
        let remoto;
        try {
          remoto = JSON.parse(await Fin.cofre.decifrar(arq.dados));
        } catch {
          st.conflito = arq;
          throw new Error('O Drive tem dados protegidos com outra senha. Resolva em Dados e backup.');
        }
        const envMudou = Fin.cofre.sincronizarEnvelope(arq.conta); // senhas, convites e pessoas
        const r = Fin.mesclar.mesclar(S.exportarDados(), remoto);
        if (r.mudouLocal) S.substituirDados(r.dados);
        if (r.mudouRemoto || envMudou) await enviar(info.id, r.dados);
        else S.setPref('driveVersao', String(info.version));
      }
      if (st.geracao === geracao) S.setPref('driveSujo', false);
      else agendar(); // mudou algo durante a sincronização
      S.setPref('driveUltimoSync', new Date().toISOString());
      st.conflito = null;
    } catch (err) {
      console.warn('[drive]', err);
      st.erro = err.message;
    } finally {
      st.sincronizando = false;
      desenharStatus();
    }
  }

  function agendar(ms = 4000) {
    clearTimeout(st.timer);
    st.timer = setTimeout(sincronizar, ms);
  }

  /* ---------------- Ações (chamadas pelas telas) ---------------- */

  /** Botão "Conectar Google Drive" (Dados e backup). */
  async function conectar() {
    if (!adaptadorTeste) {
      if (!window.google?.accounts?.oauth2) { await carregarGIS(); }
      await pedirToken('consent');
    }
    S.setPref('driveConectado', true);
    S.setPref('driveSujo', true);
    await sincronizar();
  }

  async function reconectar() {
    if (!adaptadorTeste) await pedirToken('');
    await sincronizar();
  }

  function desconectar() {
    if (st.token && window.google?.accounts?.oauth2) google.accounts.oauth2.revoke(st.token, () => {});
    st.token = null;
    st.escopos = '';
    // driveArquivo fica: ao reconectar, continua na pasta compartilhada (não cria uma cópia separada).
    ['driveConectado', 'driveVersao', 'driveUltimoSync'].forEach((k) => S.setPref(k, null));
    desenharStatus();
  }

  /** Clique de "Entrar": já renova a autorização do Google no mesmo clique. */
  function aoEntrar() {
    if (!conectado() || tokenValido() || adaptadorTeste || !window.google?.accounts?.oauth2) return;
    pedirToken('').catch(() => { st.reconectar = true; desenharStatus(); });
  }

  function aposDesbloquear() {
    desenharStatus();
    if (conectado()) setTimeout(sincronizar, 300);
  }

  /** Aparelho novo: baixa o arquivo do Drive para entrar com a mesma senha. */
  async function baixarParaEntrar() {
    if (!adaptadorTeste) {
      if (!window.google?.accounts?.oauth2) await carregarGIS();
      await pedirToken('consent', true);
    }
    let info = await drive().buscar();
    if (!info) return null;
    let arq = JSON.parse(await drive().baixar(info.id));
    if (arq.movidoPara?.id) {
      // os dados foram para a pasta compartilhada: baixa de lá (é a versão em uso)
      try {
        info = await drive().info(arq.movidoPara.id);
        const mov = arq.movidoPara;
        arq = JSON.parse(await drive().baixar(info.id));
        arq._arquivo = { id: info.id, pasta: mov.pasta || info.parents?.[0] || null };
      } catch (e) { console.warn('[drive] pasta compartilhada', e); }
    }
    arq._versao = String(info.version);
    return arq;
  }

  function prepararCofreRemoto(arq) {
    localStorage.setItem('fin:cofre', arq.dados); // já está cifrado com a mesma chave
  }

  async function entrarComRemoto(arq, usuario, senha) {
    const planoAntes = S.modo() === 'plano' && S.hasData() ? S.exportarDados() : null; // dados soltos deste aparelho
    await Fin.cofre.adotarEnvelope(arq.conta, usuario, senha);
    prepararCofreRemoto(arq);
    await S.abrirCofre();
    [...S.COLLECTIONS, 'meta', 'excluidos'].forEach((k) => localStorage.removeItem(`fin:${k}`));
    S.setPref('driveConectado', true);
    if (arq._arquivo) S.setPref('driveArquivo', arq._arquivo);
    S.setPref('driveVersao', arq._versao);
    S.setPref('driveSujo', false);
    if (planoAntes) {
      const r = Fin.mesclar.mesclar(S.exportarDados(), planoAntes);
      if (r.mudouLocal) { S.substituirDados(r.dados); S.setPref('driveSujo', true); }
    }
  }

  /** Conflito: o Drive foi criado com outra senha (outro aparelho criou acesso separado). */
  async function resolverConflito(usuario, senha) {
    const arq = st.conflito;
    if (!arq) return;
    const locais = S.exportarDados();
    await Fin.cofre.adotarEnvelope(arq.conta, usuario, senha); // passa a usar a senha/chave do Drive
    const remoto = JSON.parse(await Fin.cofre.decifrar(arq.dados));
    const r = Fin.mesclar.mesclar(locais, remoto);
    S.substituirDados(r.dados); // regrava o cofre local com a chave do Drive
    st.conflito = null;
    S.setPref('driveVersao', null);
    S.setPref('driveSujo', true);
    await sincronizar();
  }

  /* ---------------- Modo casal ---------------- */

  /**
   * Titular: passa os dados para a pasta "Minhas Finanças (casa)" e compartilha com o e-mail.
   * Chamar direto do clique (o Google pode abrir a janelinha de permissão).
   */
  async function ativarCompartilhamento(email) {
    if (!conectado()) throw new Error('Conecte o Google Drive primeiro (Dados e backup).');
    if (!adaptadorTeste && !temEscopoArquivo()) {
      if (!window.google?.accounts?.oauth2) await carregarGIS();
      await pedirToken('consent', true);
      if (!temEscopoArquivo()) throw new Error('Sem a permissão de arquivos do app no Drive. Marque a caixinha na janela do Google.');
    } else if (!tokenValido()) {
      await pedirToken('', true);
    }
    if (compartilhado()) return compartilharCom(email);

    await sincronizar(); // o local fica em dia com a pasta oculta antes da mudança
    if (st.erro) throw new Error(st.erro);
    const antigo = await drive().buscar();
    const pasta = await drive().criarPasta(PASTA);
    const novo = await drive().criarEm(pasta.id, await montarArquivo(S.exportarDados()));
    const agora = new Date().toISOString();
    if (antigo) {
      // deixa um aviso no arquivo antigo para os outros aparelhos do titular mudarem sozinhos
      const t = JSON.parse(await drive().baixar(antigo.id));
      t.movidoPara = { id: novo.id, pasta: pasta.id, em: agora };
      await drive().atualizar(antigo.id, JSON.stringify(t));
    }
    S.setPref('driveArquivo', { id: novo.id, pasta: pasta.id, desde: agora });
    S.setPref('driveVersao', String(novo.version));
    S.setPref('driveSujo', false);
    if (email) await compartilharCom(email);
    desenharStatus();
    return { pasta: pasta.id, arquivo: novo.id };
  }

  /** Compartilha a pasta com mais um e-mail (o Google manda um e-mail de aviso). */
  async function compartilharCom(email) {
    const c = compartilhado();
    if (!c?.pasta || !email) return;
    await garantirToken();
    const quem = Fin.membros?.nome?.() || Fin.cofre.usuario() || '';
    await drive().compartilhar(c.pasta, email.trim(),
      `${quem} compartilhou as finanças da casa com você no app Minhas Finanças. Abra o app, toque em “Recebi um convite” e use o código que ${quem || 'a pessoa'} vai te passar.`);
  }

  /** Quem tem acesso à pasta no Drive (para o titular conferir/remover). */
  async function acessosDrive() {
    const c = compartilhado();
    if (!c?.pasta) return [];
    await garantirToken();
    return drive().permissoes(c.pasta);
  }

  async function removerAcessoDrive(permId) {
    const c = compartilhado();
    if (!c?.pasta) return;
    await garantirToken();
    await drive().removerPermissao(c.pasta, permId);
  }

  /**
   * Quem recebeu o convite: entra no Google e escolhe o arquivo compartilhado.
   * Devolve o arquivo baixado (com o envelope) para validar o código do convite.
   */
  async function escolherArquivoCompartilhado() {
    if (!adaptadorTeste) {
      if (!window.google?.accounts?.oauth2) await carregarGIS();
      await pedirToken('consent', true);
      if (!temEscopoArquivo()) throw new Error('Sem a permissão de arquivos do app no Drive. Marque a caixinha na janela do Google.');
    }
    const id = await drive().escolher();
    if (!id) return null;
    const info = await drive().info(id);
    let arq;
    try { arq = JSON.parse(await drive().baixar(id)); } catch { arq = null; }
    if (!arq || arq.app !== 'minhas-financas' || !arq.conta || !arq.dados) {
      throw new Error(`Este não é o arquivo do app. Escolha “${NOME}” dentro da pasta “${PASTA}”.`);
    }
    arq._versao = String(info.version);
    arq._arquivo = { id, pasta: info.parents?.[0] || null };
    return arq;
  }

  /** Aceita o convite: cria o acesso desta pessoa e passa a usar os dados compartilhados. */
  async function entrarPorConvite(arq, codigo, usuario, senha) {
    const planoAntes = S.modo() === 'plano' && S.hasData() ? S.exportarDados() : null;
    await Fin.cofre.aceitarConvite(arq.conta, codigo, usuario, senha);
    prepararCofreRemoto(arq);
    await S.abrirCofre();
    [...S.COLLECTIONS, 'meta', 'excluidos'].forEach((k) => localStorage.removeItem(`fin:${k}`));
    S.setPref('driveConectado', true);
    S.setPref('driveArquivo', arq._arquivo);
    S.setPref('driveVersao', arq._versao);
    S.setPref('driveSujo', true); // envia o envelope com o acesso novo
    if (planoAntes) {
      const r = Fin.mesclar.mesclar(S.exportarDados(), planoAntes);
      if (r.mudouLocal) S.substituirDados(r.dados);
    }
  }

  /* ---------------- Indicador de status ---------------- */

  function textoStatus() {
    if (!configurado()) return null;
    if (!conectado()) return '<a href="#/dados" class="text-slate-500 hover:underline">☁️ Drive desconectado</a>';
    if (st.sincronizando) return '<span class="text-slate-500">⟳ Sincronizando…</span>';
    if (st.conflito) return '<a href="#/dados" class="text-rose-700 font-medium">! Conflito no Drive</a>';
    if (st.reconectar) return '<button data-drive="reconectar" class="text-amber-800 font-medium hover:underline">! Reconectar Google</button>';
    if (st.erro) return `<span class="text-amber-800" title="${Fin.fmt.esc(st.erro)}">! ${Fin.fmt.esc(st.erro.length > 40 ? 'Erro ao sincronizar' : st.erro)}</span>`;
    const u = S.prefs().driveUltimoSync;
    if (!u) return '<span class="text-slate-500">☁️ Aguardando sincronização</span>';
    const min = Math.round((Date.now() - new Date(u)) / 60000);
    return `<span class="text-emerald-800">✓ Sincronizado ${min < 1 ? 'agora' : `há ${min} min`}${compartilhado() ? ' · casa' : ''}</span>`;
  }

  function desenharStatus() {
    const t = textoStatus();
    ['sync-status-lateral', 'sync-status-mais', 'sync-status-dados'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = t ? `<div class="text-xs">${t}</div>` : '';
    });
    window.dispatchEvent(new CustomEvent('fin:drive'));
  }

  /* ---------------- Gatilhos ---------------- */

  window.addEventListener('fin:alterado', () => {
    st.geracao++;
    if (!conectado()) return;
    S.setPref('driveSujo', true);
    agendar();
  });
  window.addEventListener('online', () => conectado() && agendar(500));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && conectado()) agendar(500); });
  setInterval(() => { if (conectado() && !S.bloqueado()) sincronizar(); }, 2 * 60 * 1000);
  setInterval(desenharStatus, 60 * 1000);
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-drive="reconectar"]')) reconectar();
  });
  // Carrega o script do Google cedo: a janela de login precisa abrir no clique, sem espera.
  if (Fin.config?.googleClientId && /^https?:$/.test(location.protocol)) carregarGIS().catch(() => {});

  return {
    estado: st, configurado, conectado, compartilhado, sincronizar, conectar, reconectar, desconectar,
    aoEntrar, aposDesbloquear, baixarParaEntrar, entrarComRemoto, resolverConflito, desenharStatus,
    ativarCompartilhamento, compartilharCom, acessosDrive, removerAcessoDrive,
    escolherArquivoCompartilhado, entrarPorConvite, PASTA, NOME,
    usarAdaptador: (a) => { adaptadorTeste = a; },
  };
})();
