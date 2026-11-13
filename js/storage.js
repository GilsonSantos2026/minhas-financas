/**
 * storage.js — Camada de dados do app.
 *
 * Toda leitura/escrita passa por aqui; as telas só chamam get/set/list/upsert/remove.
 *
 * Dois modos:
 * - "plano"  (sem acesso criado): cada coleção é um JSON em claro no LocalStorage (fin:…).
 * - "cofre"  (com usuário e senha): os dados vivem na memória enquanto o app está
 *            desbloqueado e são gravados CIFRADOS numa única chave (fin:cofre).
 *            Bloqueado, nada pode ser lido.
 *
 * Coleções: lancamentos, cartaoCompras, categorias, cartoes  (+ meta e excluidos)
 *           investimentos: invContas, invAtivos, invMovs, invMetas, invHist, invConfig
 *           (a importação da planilha não mexe nelas; backup antigo sem elas também não)
 *
 * Para a sincronização entre aparelhos, toda gravação de coleção:
 * - carimba "_mod" (data/hora) nos registros que mudaram;
 * - registra em "excluidos" os ids removidos (para a exclusão chegar ao outro aparelho).
 */
window.Fin = window.Fin || {};

Fin.storage = (() => {
  const PREFIX = 'fin:';
  const BASICAS = ['lancamentos', 'cartaoCompras', 'categorias', 'cartoes'];
  const INVEST = ['invContas', 'invAtivos', 'invMovs', 'invMetas', 'invHist', 'invConfig'];
  const COLLECTIONS = [...BASICAS, ...INVEST];
  const DADOS = new Set([...COLLECTIONS, 'meta', 'excluidos']); // o que é cifrado e sincronizado
  const SCHEMA_VERSION = 1;

  let modo = localStorage.getItem(PREFIX + 'conta') ? 'cofre' : 'plano';
  let cofre = null; // { dados } quando desbloqueado

  /*
   * Cache em memória (modo plano): cada coleção é lida (JSON.parse) uma única vez.
   * Regra para quem usa: não altere a lista recebida sem chamar set() em seguida.
   */
  const cache = new Map();
  window.addEventListener('storage', (e) => {
    if (modo === 'plano') { cache.clear(); assinaturas.clear(); }
    if (e.key === PREFIX + 'conta' && !e.newValue) location.reload();
  });

  /* ---------------- Assinaturas (detectar o que mudou) ---------------- */

  // coleção → (id → JSON do registro como foi lido/gravado por último)
  const assinaturas = new Map();
  function assinar(key, lista) {
    const m = new Map();
    for (const it of lista || []) if (it && it.id) m.set(it.id, JSON.stringify(it));
    assinaturas.set(key, m);
  }

  function carimbar(key, novo) {
    if (!assinaturas.has(key)) {
      // Coleção gravada sem ter sido lida antes: assina o que está gravado hoje.
      let atual = [];
      if (modo === 'plano') { try { atual = JSON.parse(localStorage.getItem(PREFIX + key)) || []; } catch { atual = []; } }
      assinar(key, atual);
    }
    const sig = assinaturas.get(key);
    const agora = new Date().toISOString();
    const vistos = new Set();
    for (const it of novo) {
      if (!it || !it.id) continue;
      vistos.add(it.id);
      if (sig.get(it.id) !== JSON.stringify(it)) {
        it._mod = agora;
        sig.set(it.id, JSON.stringify(it));
      }
    }
    const exc = get('excluidos', {}) || {};
    const col = exc[key] || {};
    let mudou = false;
    for (const id of [...sig.keys()]) {
      if (!vistos.has(id)) { col[id] = agora; sig.delete(id); mudou = true; }
    }
    for (const id of vistos) if (col[id]) { delete col[id]; mudou = true; } // recriado
    if (mudou) { exc[key] = col; set('excluidos', exc); }
  }

  /* ---------------- Leitura e gravação ---------------- */

  function get(key, fallback = null) {
    if (modo === 'cofre' && DADOS.has(key)) {
      if (!cofre) return fallback; // bloqueado
      return cofre.dados[key] ?? fallback;
    }
    if (cache.has(key)) return cache.get(key) ?? fallback;
    try {
      const raw = localStorage.getItem(PREFIX + key);
      const valor = raw ? JSON.parse(raw) : null;
      cache.set(key, valor);
      if (COLLECTIONS.includes(key)) assinar(key, valor);
      return valor ?? fallback;
    } catch (err) {
      console.error(`[storage] Falha ao ler "${key}"`, err);
      return fallback;
    }
  }

  function marcarAlterado(key) {
    if (!COLLECTIONS.includes(key)) return;
    localStorage.setItem(PREFIX + 'alteradoEm', new Date().toISOString());
    window.dispatchEvent(new CustomEvent('fin:alterado', { detail: { key } }));
  }

  /**
   * Grava uma chave. Opções:
   *  semCarimbo: não marca _mod/exclusões (usado ao aplicar dados vindos da sincronização).
   */
  function set(key, value, opts = {}) {
    if (modo === 'cofre' && DADOS.has(key) && !cofre) throw new Error('O app está bloqueado. Entre novamente.');
    if (COLLECTIONS.includes(key)) {
      if (opts.semCarimbo) assinar(key, value);
      else carimbar(key, value);
    }
    if (modo === 'cofre' && DADOS.has(key)) {
      cofre.dados[key] = value;
      if (!opts.semEvento) marcarAlterado(key);
      agendarGravacao();
      return;
    }
    // Pode lançar QuotaExceededError (limite de ~5 MB do LocalStorage).
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      cache.set(key, value);
      if (!opts.semEvento) marcarAlterado(key);
    } catch (err) {
      cache.delete(key);
      throw err;
    }
  }

  /* ---------------- Cofre (dados cifrados) ---------------- */

  let gravando = null;
  let pendente = false;

  /** Grava o cofre cifrado; gravações seguidas são agrupadas. */
  function agendarGravacao() {
    if (gravando) { pendente = true; return gravando; }
    gravando = (async () => {
      do {
        pendente = false;
        if (!cofre) break;
        const payload = await Fin.cofre.cifrar(JSON.stringify(cofre.dados));
        localStorage.setItem(PREFIX + 'cofre', payload);
      } while (pendente);
    })()
      .catch((err) => {
        console.error('[storage] falha ao gravar cofre', err);
        const cheio = err && (err.name === 'QuotaExceededError' || err.code === 22);
        Fin.ui?.toast(cheio ? 'Armazenamento cheio: a última alteração não foi salva. Faça um backup.' : `Falha ao salvar: ${err.message}`, 'error');
      })
      .finally(() => { gravando = null; });
    return gravando;
  }
  const aguardarGravacao = () => gravando || Promise.resolve();

  function normalizar(d) {
    const out = { meta: d?.meta ?? null, excluidos: d?.excluidos || {} };
    for (const k of COLLECTIONS) out[k] = Array.isArray(d?.[k]) ? d[k] : [];
    return out;
  }

  function lerPlano() {
    const d = {};
    for (const k of DADOS) {
      try { d[k] = JSON.parse(localStorage.getItem(PREFIX + k)); } catch { d[k] = null; }
    }
    return d;
  }

  /**
   * Abre o cofre depois que a senha foi validada (Fin.cofre.entrar/criarConta).
   * Primeira vez: migra os dados em claro para o cofre e apaga a versão em claro.
   */
  async function abrirCofre() {
    const payload = localStorage.getItem(PREFIX + 'cofre');
    const dados = payload ? JSON.parse(await Fin.cofre.decifrar(payload)) : lerPlano();
    cofre = { dados: normalizar(dados) };
    modo = 'cofre';
    cache.clear();
    COLLECTIONS.forEach((k) => assinar(k, cofre.dados[k]));
    if (!payload) {
      await agendarGravacao();
      for (const k of DADOS) localStorage.removeItem(PREFIX + k); // não deixa cópia em claro
    }
  }

  async function fecharCofre() {
    await aguardarGravacao();
    cofre = null;
    assinaturas.clear();
    Fin.cofre.bloquear();
  }

  /** Todos os dados sincronizáveis (para enviar ao Drive). */
  function exportarDados() {
    const d = {};
    for (const k of DADOS) d[k] = get(k, k === 'excluidos' ? {} : k === 'meta' ? null : []);
    return d;
  }

  /** Aplica dados vindos da sincronização (já mesclados), sem carimbar de novo. */
  function substituirDados(d) {
    const n = normalizar(d);
    for (const k of DADOS) set(k, n[k], { semCarimbo: true, semEvento: true });
    window.dispatchEvent(new CustomEvent('fin:dados-externos'));
  }

  /* ---------------- Preferências (não cifradas, não sincronizadas) ---------------- */

  function prefs() {
    return get('prefs', {}) || {};
  }
  function setPref(k, v) {
    set('prefs', { ...prefs(), [k]: v });
  }

  function getMeta() {
    return get('meta', null);
  }

  /* ---------------- Importação / restauração (tudo ou nada) ---------------- */

  function saveImport(data, info) {
    gravarTudo(data, {
      versao: SCHEMA_VERSION,
      importadoEm: new Date().toISOString(),
      arquivo: info.arquivo,
      contagens: Object.fromEntries(BASICAS.map((k) => [k, (data[k] || []).length])),
    });
  }

  /** Coleções a gravar: as básicas sempre; as de investimentos só se vierem nos dados. */
  const aGravar = (data) => COLLECTIONS.filter((k) => BASICAS.includes(k) || Array.isArray(data[k]));

  /** Grava todas as coleções + meta; no modo plano desfaz tudo se algo falhar. */
  function gravarTudo(data, meta) {
    if (modo === 'cofre') {
      aGravar(data).forEach((k) => set(k, data[k] || []));
      set('meta', meta);
      return;
    }
    const keys = [...COLLECTIONS, 'meta', 'excluidos'];
    const snapshot = Object.fromEntries(keys.map((k) => [k, localStorage.getItem(PREFIX + k)]));
    try {
      aGravar(data).forEach((k) => set(k, data[k] || []));
      set('meta', meta);
    } catch (err) {
      cache.clear();
      assinaturas.clear();
      keys.forEach((k) => {
        if (snapshot[k] === null) localStorage.removeItem(PREFIX + k);
        else localStorage.setItem(PREFIX + k, snapshot[k]);
      });
      const quota = err && (err.name === 'QuotaExceededError' || err.code === 22);
      throw new Error(quota
        ? 'O armazenamento do navegador está cheio (limite de ~5 MB). Nada foi alterado.'
        : `Não foi possível salvar os dados: ${err.message}`);
    }
  }

  /** Apaga TUDO deste navegador (inclusive o acesso). */
  function clearAll() {
    cache.clear();
    assinaturas.clear();
    cofre = null;
    modo = 'plano';
    Fin.cofre?.bloquear();
    Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k));
  }

  /* ---------------- Backup ---------------- */

  const BACKUP_APP = 'minhas-financas';
  const BACKUP_VERSAO = 3;

  /**
   * Gera o backup. Com acesso criado, o conteúdo vai CIFRADO (abre com a mesma senha,
   * inclusive em outro aparelho, porque o "envelope" da conta vai junto).
   */
  async function exportBackup() {
    const contagens = Object.fromEntries(COLLECTIONS.map((k) => [k, get(k, []).length]));
    const base = { app: BACKUP_APP, versaoBackup: BACKUP_VERSAO, exportadoEm: new Date().toISOString(), contagens };
    if (modo === 'cofre') {
      return JSON.stringify({ ...base, cifrado: true, conta: Fin.cofre.conta(), dados: await Fin.cofre.cifrar(JSON.stringify(exportarDados())) });
    }
    const backup = { ...base, meta: getMeta() };
    COLLECTIONS.forEach((k) => (backup[k] = get(k, [])));
    return JSON.stringify(backup);
  }

  function registrarBackup() {
    setPref('ultimoBackup', new Date().toISOString());
  }

  function situacaoBackup(diasLembrete = 7) {
    const ultimo = prefs().ultimoBackup || null;
    const alteradoEm = localStorage.getItem(PREFIX + 'alteradoEm');
    const pendente = !!alteradoEm && (!ultimo || alteradoEm > ultimo);
    const dias = ultimo ? Math.floor((Date.now() - new Date(ultimo)) / 86400000) : null;
    return { ultimo, dias, pendente, lembrar: hasData() && pendente && (dias === null || dias >= diasLembrete) };
  }

  /**
   * Lê e valida um backup (não grava nada).
   * Backup cifrado de OUTRA conta: lança erro com .precisaSenha = true e .envelope;
   * chame de novo com { usuario, senha } dessa conta.
   */
  async function lerBackup(texto, credenciais = null) {
    let obj;
    try { obj = JSON.parse(texto); } catch { throw new Error('O arquivo não é um backup válido (JSON ilegível).'); }
    if (!obj || obj.app !== BACKUP_APP) throw new Error('Este arquivo não é um backup do Minhas Finanças.');

    let fonte = obj;
    if (obj.cifrado) {
      let chave = null;
      if (credenciais) chave = await Fin.cofre.abrirEnvelope(obj.conta, credenciais.usuario, credenciais.senha);
      try {
        fonte = JSON.parse(await Fin.cofre.decifrar(obj.dados, chave || undefined));
      } catch {
        const e = new Error('Este backup foi protegido com outra senha. Informe o usuário e a senha usados quando ele foi feito.');
        e.precisaSenha = true;
        e.usuario = obj.conta?.usuario;
        throw e;
      }
    }
    const dados = {};
    for (const k of COLLECTIONS) {
      if (fonte[k] === undefined) { if (BASICAS.includes(k)) dados[k] = []; continue; } // backups antigos não tinham "cartoes" nem investimentos
      if (!Array.isArray(fonte[k])) throw new Error(`Backup corrompido: “${k}” não é uma lista.`);
      dados[k] = fonte[k];
    }
    if (!dados.lancamentos.length && !dados.cartaoCompras.length) throw new Error('O backup não tem lançamentos.');
    return {
      dados,
      meta: fonte.meta || null,
      exportadoEm: obj.exportadoEm || null,
      cifrado: !!obj.cifrado,
      contagens: Object.fromEntries(COLLECTIONS.filter((k) => dados[k]).map((k) => [k, dados[k].length])),
    };
  }

  function restaurarBackup(lido) {
    gravarTudo(lido.dados, {
      ...(lido.meta || {}),
      versao: SCHEMA_VERSION,
      restauradoEm: new Date().toISOString(),
      backupDe: lido.exportadoEm,
      contagens: lido.contagens,
    });
    registrarBackup();
  }

  function usageKB() {
    let chars = 0;
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => (chars += k.length + (localStorage.getItem(k) || '').length));
    return Math.round((chars * 2) / 1024);
  }

  /* ---------------- CRUD genérico (usado pelas telas) ---------------- */

  const uid = () =>
    (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 10));

  function list(collection) {
    return get(collection, []);
  }

  /** Cria (sem id) ou atualiza (com id) um item. Retorna o item salvo. */
  function upsert(collection, item) {
    const items = list(collection);
    const now = new Date().toISOString();
    const i = item.id ? items.findIndex((x) => x.id === item.id) : -1;
    let saved;
    if (i >= 0) {
      saved = { ...items[i], ...item, atualizadoEm: now };
      items[i] = saved;
    } else {
      saved = { ...item, id: item.id || uid(), criadoEm: now };
      items.push(saved);
    }
    set(collection, items);
    return saved;
  }

  function remove(collection, id) {
    set(collection, list(collection).filter((x) => x.id !== id));
  }

  function hasData() {
    return !!getMeta() || list('lancamentos').length > 0;
  }

  return {
    get, set, getMeta, saveImport, clearAll, exportBackup, usageKB,
    prefs, setPref, registrarBackup, situacaoBackup, lerBackup, restaurarBackup,
    list, upsert, remove, hasData, uid, COLLECTIONS,
    // cofre e sincronização
    modo: () => modo, bloqueado: () => modo === 'cofre' && !cofre,
    abrirCofre, fecharCofre, aguardarGravacao, exportarDados, substituirDados,
  };
})();
