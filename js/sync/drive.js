/**
 * sync/drive.js — Sincronização com o Google Drive (pasta oculta do app: appDataFolder).
 *
 * - Login Google pelo "Google Identity Services" (janela do Google; o app nunca vê sua senha).
 * - Permissão pedida: drive.appdata → o app só enxerga a própria pasta oculta,
 *   não os seus arquivos do Drive.
 * - Um único arquivo "minhas-financas.dat" com os dados JÁ CIFRADOS (o Google não
 *   consegue ler) + o "envelope" da conta, para outro aparelho abrir com a mesma senha.
 * - Quando muda algo: envia em poucos segundos. Ao abrir/voltar ao app e a cada 2 min:
 *   confere se o outro aparelho mudou algo e mescla registro a registro (sync/mesclar.js).
 */
window.Fin = window.Fin || {};

Fin.drive = (() => {
  const S = Fin.storage;
  const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
  const NOME = 'minhas-financas.dat';
  const GIS = 'https://accounts.google.com/gsi/client';
  const API = 'https://www.googleapis.com/drive/v3/files';
  const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';

  const st = { token: null, expira: 0, pedido: null, sincronizando: false, erro: null, reconectar: false, conflito: null, geracao: 0, timer: null };
  let adaptadorTeste = null; // testes: imita o Drive sem internet

  const configurado = () => !!Fin.config?.googleClientId || !!adaptadorTeste;
  const conectado = () => configurado() && !!S.prefs().driveConectado;
  const tokenValido = () => !!adaptadorTeste || (!!st.token && Date.now() < st.expira);

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
      scope: SCOPE,
      callback: (resp) => {
        const fila = esperando; esperando = [];
        if (resp.error) return fila.forEach((p) => p.rej(new Error(resp.error_description || resp.error)));
        st.token = resp.access_token;
        st.expira = Date.now() + (Number(resp.expires_in || 3600) - 60) * 1000;
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
  function pedirToken(prompt = '') {
    st.pedido = new Promise((res, rej) => {
      esperando.push({ res, rej });
      cliente().requestAccessToken({ prompt });
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
    if (!r.ok) throw new Error(`Google Drive respondeu ${r.status}.`);
    return r;
  }

  const real = {
    async buscar() {
      const q = encodeURIComponent(`name='${NOME}'`);
      const j = await (await req(`${API}?spaces=appDataFolder&q=${q}&fields=files(id,version,modifiedTime)`)).json();
      return j.files?.[0] || null;
    },
    async baixar(id) {
      return (await req(`${API}/${id}?alt=media`)).text();
    },
    async criar(texto) {
      const b = `fin${Math.random().toString(36).slice(2)}`;
      const corpo = `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name: NOME, parents: ['appDataFolder'] })}\r\n` +
        `--${b}\r\nContent-Type: application/json\r\n\r\n${texto}\r\n--${b}--`;
      return (await req(`${UPLOAD}?uploadType=multipart&fields=id,version,modifiedTime`, {
        method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${b}` }, body: corpo,
      })).json();
    },
    async atualizar(id, texto) {
      return (await req(`${UPLOAD}/${id}?uploadType=media&fields=id,version,modifiedTime`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: texto,
      })).json();
    },
  };
  const drive = () => adaptadorTeste || real;

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

  async function sincronizar() {
    if (!conectado() || S.bloqueado() || st.sincronizando) return;
    if (!navigator.onLine && !adaptadorTeste) { st.erro = 'Sem internet — sincroniza quando a conexão voltar.'; return desenharStatus(); }
    st.sincronizando = true;
    st.erro = null;
    desenharStatus();
    const geracao = st.geracao;
    try {
      await garantirToken();
      await S.aguardarGravacao();
      const info = await drive().buscar();
      const p = S.prefs();
      const sujo = p.driveSujo !== false;
      if (!info) {
        await enviar(null, S.exportarDados()); // primeiro envio
      } else if (String(info.version) === String(p.driveVersao)) {
        if (sujo) await enviar(info.id, S.exportarDados()); // só eu mudei
      } else {
        // O outro aparelho mudou algo: baixa, mescla e devolve o resultado.
        const arq = JSON.parse(await drive().baixar(info.id));
        let remoto;
        try {
          remoto = JSON.parse(await Fin.cofre.decifrar(arq.dados));
        } catch {
          st.conflito = arq;
          throw new Error('O Drive tem dados protegidos com outra senha. Resolva em Dados e backup.');
        }
        await Fin.cofre.atualizarEnvelopeSeMesmaChave(arq.conta); // senha trocada no outro aparelho
        const r = Fin.mesclar.mesclar(S.exportarDados(), remoto);
        if (r.mudouLocal) S.substituirDados(r.dados);
        if (r.mudouRemoto) await enviar(info.id, r.dados);
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
      await pedirToken('consent');
    }
    const info = await drive().buscar();
    if (!info) return null;
    const arq = JSON.parse(await drive().baixar(info.id));
    arq._versao = String(info.version);
    return arq;
  }

  async function entrarComRemoto(arq, usuario, senha) {
    const planoAntes = S.modo() === 'plano' && S.hasData() ? S.exportarDados() : null; // dados soltos deste aparelho
    await Fin.cofre.adotarEnvelope(arq.conta, usuario, senha);
    localStorage.setItem('fin:cofre', arq.dados); // já está cifrado com a mesma chave
    await S.abrirCofre();
    [...S.COLLECTIONS, 'meta', 'excluidos'].forEach((k) => localStorage.removeItem(`fin:${k}`));
    S.setPref('driveConectado', true);
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
    return `<span class="text-emerald-800">✓ Sincronizado ${min < 1 ? 'agora' : `há ${min} min`}</span>`;
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
    estado: st, configurado, conectado, sincronizar, conectar, reconectar, desconectar,
    aoEntrar, aposDesbloquear, baixarParaEntrar, entrarComRemoto, resolverConflito, desenharStatus,
    usarAdaptador: (a) => { adaptadorTeste = a; },
  };
})();
