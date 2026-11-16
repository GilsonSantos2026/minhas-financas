/**
 * seguranca/cofre.js — Criptografia dos dados com a senha do usuário.
 *
 * Como funciona (padrão "envelope", usando a Web Crypto API do navegador):
 * - Uma CHAVE DE DADOS aleatória (AES-256-GCM) cifra todos os lançamentos.
 * - Essa chave fica guardada "embrulhada" duas vezes:
 *     1) com uma chave derivada da SENHA (PBKDF2-SHA256, 400 mil iterações);
 *     2) com uma chave derivada da CHAVE DE RECUPERAÇÃO (para quando esquecer a senha).
 * - Trocar a senha só re-embrulha a chave de dados: os dados não precisam ser recifrados.
 * - A senha e a chave de dados nunca são gravadas; a chave só existe na memória enquanto
 *   o app está desbloqueado.
 *
 * O "envelope" (dados da conta, sem segredos em claro) também vai junto do arquivo no
 * Google Drive, para outro aparelho conseguir abrir com a mesma senha.
 *
 * Modo casal (v2026-11-15.10) — mesma chave de dados, uma senha por pessoa:
 * - Campos de cima do envelope (usuario, kdf, dekSenha, dekRecuperacao) = membro principal ('m1').
 * - envelope.membros = [{ id, usuario, kdf, dekSenha, criadaEm, atualizadaEm }] → outras pessoas.
 * - envelope.convites = [{ id, criadoEm, expira, sal, iter, iv, dado }] → chave de dados embrulhada
 *   por um código de convite de uso único (7 dias). Quem tem o código cria a própria senha.
 * - envelope.removidos / convitesUsados = { id: data } para a mesclagem entre aparelhos.
 * - "fin:eu" (só neste aparelho) = { usuario, membroId } de quem entrou aqui.
 */
window.Fin = window.Fin || {};

Fin.cofre = (() => {
  const CHAVE_CONTA = 'fin:conta';
  const CHAVE_EU = 'fin:eu';
  const ITER_SENHA = 600000; // recomendação atual (OWASP) p/ PBKDF2-SHA256; envelopes antigos (400 mil) sobem no próximo login
  const ITER_RECUPERACAO = 100000; // a chave de recuperação já é aleatória e longa
  const ITER_CONVITE = 300000;     // código de convite é mais curto: derivação mais lenta
  const DIAS_CONVITE = 7;
  const sub = crypto.subtle;
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  let chaveDados = null; // CryptoKey em memória (só enquanto desbloqueado)

  /* ---------------- utilidades ---------------- */

  const aleatorio = (n) => crypto.getRandomValues(new Uint8Array(n));
  function b64(buf) {
    const bytes = new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }
  const deB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const normUsuario = (u) => String(u || '').trim().toLowerCase();

  async function derivar(segredo, sal, iter) {
    const base = await sub.importKey('raw', enc.encode(segredo), 'PBKDF2', false, ['deriveKey']);
    return sub.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: sal, iterations: iter }, base,
      { name: 'AES-GCM', length: 256 }, false, ['wrapKey', 'unwrapKey']);
  }

  async function embrulhar(chave, kek) {
    const iv = aleatorio(12);
    const dado = await sub.wrapKey('raw', chave, kek, { name: 'AES-GCM', iv });
    return { iv: b64(iv), dado: b64(dado) };
  }

  async function desembrulhar(emb, kek) {
    return sub.unwrapKey('raw', deB64(emb.dado), kek, { name: 'AES-GCM', iv: deB64(emb.iv) },
      { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  }

  /** Chave de recuperação: 160 bits em base32, em grupos (ex.: ABCD-EFGH-…). */
  function gerarCodigo() {
    const alfa = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem 0/O/1/I para não confundir
    const bytes = aleatorio(32);
    let s = '';
    for (const b of bytes) s += alfa[b % 32];
    return s.match(/.{4}/g).join('-');
  }
  const normCodigo = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

  /* ---------------- conta ---------------- */

  function conta() {
    try { return JSON.parse(localStorage.getItem(CHAVE_CONTA)); } catch { return null; }
  }
  const existeConta = () => !!conta();
  const salvarConta = (c) => localStorage.setItem(CHAVE_CONTA, JSON.stringify(c));

  /** Quem entrou neste aparelho: { usuario, membroId }. Sem registro = membro principal. */
  function eu() {
    try {
      const e = JSON.parse(localStorage.getItem(CHAVE_EU));
      if (e?.usuario) return e;
    } catch { /* ignora */ }
    const c = conta();
    return c ? { usuario: c.usuario, membroId: 'm1' } : null;
  }
  const definirEu = (usuario, membroId) => localStorage.setItem(CHAVE_EU, JSON.stringify({ usuario, membroId }));
  const ehPrincipal = () => (eu()?.membroId || 'm1') === 'm1';

  /** Acha a entrada (principal ou outra pessoa) de um usuário no envelope. */
  function entradaDe(env, usuario) {
    if (!env) return null;
    if (normUsuario(usuario) === normUsuario(env.usuario)) return { id: 'm1', usuario: env.usuario, kdf: env.kdf, dekSenha: env.dekSenha };
    return (env.membros || []).find((m) => normUsuario(m.usuario) === normUsuario(usuario)) || null;
  }

  async function montarEnvelope(usuario, senha, chave, codigo, criadaEm) {
    const salSenha = aleatorio(16);
    const salRec = aleatorio(16);
    return {
      v: 1,
      usuario: String(usuario).trim(),
      kdf: { alg: 'PBKDF2-SHA256', iter: ITER_SENHA, sal: b64(salSenha) },
      dekSenha: await embrulhar(chave, await derivar(senha, salSenha, ITER_SENHA)),
      dekRecuperacao: { sal: b64(salRec), iter: ITER_RECUPERACAO, ...(await embrulhar(chave, await derivar(normCodigo(codigo), salRec, ITER_RECUPERACAO))) },
      criadaEm: criadaEm || new Date().toISOString(),
      atualizadaEm: new Date().toISOString(),
      principalEm: new Date().toISOString(),
    };
  }

  /** Cria o acesso: gera a chave de dados e devolve a chave de recuperação (mostrar ao usuário!). */
  async function criarConta(usuario, senha) {
    const chave = await sub.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    const codigo = gerarCodigo();
    salvarConta(await montarEnvelope(usuario, senha, chave, codigo));
    definirEu(String(usuario).trim(), 'm1');
    chaveDados = chave;
    return { codigoRecuperacao: codigo };
  }

  /**
   * Abre a chave de dados com usuário e senha de um envelope (local ou vindo do Drive).
   * Vale para o principal e para as outras pessoas do envelope. Retorna a chave (CryptoKey).
   */
  async function abrirEnvelope(env, usuario, senha) {
    const ent = entradaDe(env, usuario);
    if (!ent) throw new Error('Usuário ou senha incorretos.');
    try {
      const kek = await derivar(senha, deB64(ent.kdf.sal), ent.kdf.iter);
      return await desembrulhar(ent.dekSenha, kek);
    } catch {
      throw new Error('Usuário ou senha incorretos.');
    }
  }

  async function entrar(usuario, senha) {
    const c = conta();
    if (!c) throw new Error('Nenhum acesso criado neste aparelho.');
    chaveDados = await abrirEnvelope(c, usuario, senha);
    const ent = entradaDe(c, usuario);
    definirEu(ent.usuario, ent.id);
    await reforcarSenha(c, ent, senha).catch(() => null); // nunca impede a entrada
    return true;
  }

  /**
   * Senha protegida com menos rodadas que o padrão atual → re-embrulha a chave de dados com
   * a MESMA senha e o padrão novo (a pessoa não percebe nada; a recuperação não muda).
   */
  async function reforcarSenha(c, ent, senha) {
    if ((ent.kdf?.iter || 0) >= ITER_SENHA || !chaveDados) return;
    const sal = aleatorio(16);
    const kdf = { alg: 'PBKDF2-SHA256', iter: ITER_SENHA, sal: b64(sal) };
    const dekSenha = await embrulhar(chaveDados, await derivar(senha, sal, ITER_SENHA));
    const agora = new Date().toISOString();
    if (ent.id === 'm1') Object.assign(c, { kdf, dekSenha, principalEm: agora });
    else {
      const m = (c.membros || []).find((x) => x.id === ent.id);
      if (!m) return;
      Object.assign(m, { kdf, dekSenha, atualizadaEm: agora });
    }
    c.atualizadaEm = agora;
    salvarConta(c);
  }

  /** Esqueceu a senha: abre com a chave de recuperação e define uma senha nova (só o principal). */
  async function recuperar(codigo, novaSenha) {
    const c = conta();
    if (!c) throw new Error('Nenhum acesso criado neste aparelho.');
    if (!ehPrincipal()) throw new Error(`A chave de recuperação é de ${c.usuario}. Peça a essa pessoa um novo convite para criar uma senha nova.`);
    let chave;
    try {
      const r = c.dekRecuperacao;
      chave = await desembrulhar(r, await derivar(normCodigo(codigo), deB64(r.sal), r.iter));
    } catch {
      throw new Error('Chave de recuperação incorreta.');
    }
    const novoCodigo = gerarCodigo();
    // mantém as outras pessoas e os convites; troca só a parte do principal
    salvarConta({ ...c, ...(await montarEnvelope(c.usuario, novaSenha, chave, novoCodigo, c.criadaEm)) });
    definirEu(c.usuario, 'm1');
    chaveDados = chave;
    return { codigoRecuperacao: novoCodigo };
  }

  /** Troca a senha de quem entrou neste aparelho (principal ou outra pessoa). */
  async function trocarSenha(senhaAtual, novaSenha) {
    const c = conta();
    const quem = eu();
    const chave = await abrirEnvelope(c, quem.usuario, senhaAtual);
    // mantém a mesma chave de recuperação: re-embrulha só a parte da senha
    const sal = aleatorio(16);
    const kdf = { alg: 'PBKDF2-SHA256', iter: ITER_SENHA, sal: b64(sal) };
    const dekSenha = await embrulhar(chave, await derivar(novaSenha, sal, ITER_SENHA));
    const agora = new Date().toISOString();
    if (quem.membroId === 'm1') {
      Object.assign(c, { kdf, dekSenha, principalEm: agora });
    } else {
      const m = (c.membros || []).find((x) => x.id === quem.membroId);
      if (!m) throw new Error('Seu acesso não está mais neste envelope.');
      Object.assign(m, { kdf, dekSenha, atualizadaEm: agora });
    }
    c.atualizadaEm = agora;
    salvarConta(c);
    chaveDados = chave;
  }

  async function novoCodigoRecuperacao(senhaAtual) {
    const c = conta();
    if (!ehPrincipal()) throw new Error('Só o titular do acesso tem chave de recuperação.');
    const chave = await abrirEnvelope(c, c.usuario, senhaAtual);
    const codigo = gerarCodigo();
    const sal = aleatorio(16);
    c.dekRecuperacao = { sal: b64(sal), iter: ITER_RECUPERACAO, ...(await embrulhar(chave, await derivar(normCodigo(codigo), sal, ITER_RECUPERACAO))) };
    c.atualizadaEm = c.principalEm = new Date().toISOString();
    salvarConta(c);
    return { codigoRecuperacao: codigo };
  }

  /**
   * Usa um envelope de outro aparelho (vindo do Drive): passa a valer neste aparelho.
   * Retorna a chave aberta (o chamador decide se ela vira a chave atual).
   */
  async function adotarEnvelope(env, usuario, senha) {
    const chave = await abrirEnvelope(env, usuario, senha);
    salvarConta(env);
    const ent = entradaDe(env, usuario);
    definirEu(ent.usuario, ent.id);
    chaveDados = chave;
    return true;
  }

  /* ---------------- Modo casal: convites e outras pessoas ---------------- */

  /** Código de convite: 12 caracteres em 3 grupos (ex.: K7QM-2XRA-PZ4D). */
  function gerarConvite() {
    const alfa = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (const b of aleatorio(12)) s += alfa[b % 32];
    return s.match(/.{4}/g).join('-');
  }

  /** Cria um convite (precisa estar desbloqueado). Devolve o código para mostrar UMA vez. */
  async function criarConvite() {
    if (!chaveDados) throw new Error('Cofre bloqueado.');
    const c = conta();
    const codigo = gerarConvite();
    const sal = aleatorio(16);
    const agora = new Date();
    const conv = {
      id: `cv${Date.now().toString(36)}${b64(aleatorio(4)).replace(/[^A-Za-z0-9]/g, '')}`,
      criadoEm: agora.toISOString(),
      expira: new Date(agora.getTime() + DIAS_CONVITE * 86400000).toISOString(),
      sal: b64(sal), iter: ITER_CONVITE,
      ...(await embrulhar(chaveDados, await derivar(normCodigo(codigo), sal, ITER_CONVITE))),
    };
    c.convites = [...(c.convites || []).filter((x) => x.expira > agora.toISOString()), conv];
    c.atualizadaEm = agora.toISOString();
    salvarConta(c);
    return { codigo, expira: conv.expira, id: conv.id };
  }

  /** Cancela convites ainda não usados. */
  function cancelarConvites() {
    const c = conta();
    if (!c?.convites?.length) return;
    const agora = new Date().toISOString();
    c.convitesUsados = { ...(c.convitesUsados || {}) };
    for (const x of c.convites) c.convitesUsados[x.id] = agora;
    c.convites = [];
    c.atualizadaEm = agora;
    salvarConta(c);
  }

  const convitesPendentes = (env = conta()) => {
    const agora = new Date().toISOString();
    return (env?.convites || []).filter((x) => x.expira > agora && !env.convitesUsados?.[x.id]);
  };

  /**
   * Aceita um convite num envelope vindo do Drive: abre a chave com o código, cria o acesso
   * desta pessoa (usuário + senha próprios) e passa a usar o envelope neste aparelho.
   * Mesmo usuário de alguém já convidado = troca a senha dessa pessoa (serve para "esqueci a senha").
   */
  async function aceitarConvite(env, codigo, usuario, senha) {
    usuario = String(usuario || '').trim();
    if (!usuario) throw new Error('Informe um usuário.');
    if (normUsuario(usuario) === normUsuario(env.usuario)) throw new Error(`O usuário “${env.usuario}” já é de quem convidou. Escolha outro.`);
    let chave = null;
    let usado = null;
    for (const cv of convitesPendentes(env)) {
      try {
        chave = await desembrulhar(cv, await derivar(normCodigo(codigo), deB64(cv.sal), cv.iter));
        usado = cv;
        break;
      } catch { /* tenta o próximo */ }
    }
    if (!chave) throw new Error('Código de convite incorreto ou vencido. Peça um novo convite.');
    const agora = new Date().toISOString();
    const sal = aleatorio(16);
    const existente = (env.membros || []).find((m) => normUsuario(m.usuario) === normUsuario(usuario));
    const entrada = {
      id: existente?.id || `m${Date.now().toString(36)}`,
      usuario,
      kdf: { alg: 'PBKDF2-SHA256', iter: ITER_SENHA, sal: b64(sal) },
      dekSenha: await embrulhar(chave, await derivar(senha, sal, ITER_SENHA)),
      criadaEm: existente?.criadaEm || agora,
      atualizadaEm: agora,
    };
    const novo = {
      ...env,
      membros: [...(env.membros || []).filter((m) => m.id !== entrada.id), entrada],
      convites: (env.convites || []).filter((x) => x.id !== usado.id),
      convitesUsados: { ...(env.convitesUsados || {}), [usado.id]: agora },
      atualizadaEm: agora,
    };
    if (novo.removidos?.[entrada.id]) { novo.removidos = { ...novo.removidos }; delete novo.removidos[entrada.id]; }
    salvarConta(novo);
    definirEu(usuario, entrada.id);
    chaveDados = chave;
    return { membroId: entrada.id };
  }

  /** Pessoas com acesso: principal + outras (sem segredos). */
  function pessoas(env = conta()) {
    if (!env) return [];
    return [
      { id: 'm1', usuario: env.usuario, principal: true, criadaEm: env.criadaEm },
      ...(env.membros || []).map((m) => ({ id: m.id, usuario: m.usuario, principal: false, criadaEm: m.criadaEm })),
    ];
  }

  /** Tira o acesso de uma pessoa (só o principal). Ela deixa de conseguir entrar com a senha dela. */
  function removerPessoa(id) {
    if (!ehPrincipal()) throw new Error('Só o titular pode remover pessoas.');
    if (id === 'm1') throw new Error('O titular não pode ser removido.');
    const c = conta();
    const agora = new Date().toISOString();
    c.membros = (c.membros || []).filter((m) => m.id !== id);
    c.removidos = { ...(c.removidos || {}), [id]: agora };
    c.atualizadaEm = agora;
    salvarConta(c);
  }

  /**
   * Junta o envelope deste aparelho com o do Drive (mesma chave de dados).
   * Principal: vale o mais recente (principalEm). Outras pessoas: por id, a mais recente;
   * removidas saem. Convites: união, menos os usados, cancelados e vencidos.
   */
  function mesclarEnvelope(a, b) {
    if (!a) return b;
    if (!b) return a;
    const pe = (e) => e.principalEm || e.atualizadaEm || '';
    const princ = pe(b) > pe(a) ? b : a;
    const removidos = { ...(a.removidos || {}), ...(b.removidos || {}) };
    for (const [k, v] of Object.entries(b.removidos || {})) if ((a.removidos || {})[k] > v) removidos[k] = a.removidos[k];
    const usados = { ...(a.convitesUsados || {}), ...(b.convitesUsados || {}) };
    const mapa = new Map();
    for (const m of [...(a.membros || []), ...(b.membros || [])]) {
      const ja = mapa.get(m.id);
      if (!ja || (m.atualizadaEm || '') > (ja.atualizadaEm || '')) mapa.set(m.id, m);
    }
    const membros = [...mapa.values()].sort((x, y) => (x.id > y.id ? 1 : -1)).filter((m) => !(removidos[m.id] && removidos[m.id] >= (m.atualizadaEm || '')));
    const agora = new Date().toISOString();
    const conv = new Map();
    for (const x of [...(a.convites || []), ...(b.convites || [])]) if (!usados[x.id] && x.expira > agora) conv.set(x.id, x);
    const out = {
      ...princ,
      membros,
      convites: [...conv.values()].sort((x, y) => (x.id > y.id ? 1 : -1)),
      atualizadaEm: [a.atualizadaEm || '', b.atualizadaEm || ''].sort().pop(),
    };
    if (Object.keys(removidos).length) out.removidos = removidos; else delete out.removidos;
    if (Object.keys(usados).length) out.convitesUsados = usados; else delete out.convitesUsados;
    if (!membros.length) delete out.membros;
    if (!out.convites.length) delete out.convites;
    return out;
  }

  /**
   * Envelope vindo do Drive (mesma chave): junta com o local. Retorna true se o resultado
   * difere do que está no Drive (precisa reenviar). Se a pessoa deste aparelho foi removida,
   * avisa com o evento fin:acesso-removido.
   */
  function sincronizarEnvelope(remoto) {
    const local = conta();
    if (!local || !remoto) return false;
    const junto = mesclarEnvelope(local, remoto);
    const ordenar = (e) => JSON.stringify(e, Object.keys(e).sort());
    if (ordenar(junto) !== ordenar(local)) salvarConta(junto);
    const quem = eu();
    if (quem && quem.membroId !== 'm1' && !entradaDe(junto, quem.usuario)) {
      window.dispatchEvent(new CustomEvent('fin:acesso-removido'));
    }
    return ordenar(junto) !== ordenar(remoto);
  }

  /** Compatibilidade (versões antigas chamavam esta): agora mescla. */
  async function atualizarEnvelopeSeMesmaChave(env) {
    return sincronizarEnvelope(env);
  }

  /* ---------------- cifrar / decifrar ---------------- */

  const aberto = () => !!chaveDados;
  function bloquear() { chaveDados = null; }

  async function cifrar(texto) {
    if (!chaveDados) throw new Error('Cofre bloqueado.');
    const iv = aleatorio(12);
    const ct = await sub.encrypt({ name: 'AES-GCM', iv }, chaveDados, enc.encode(texto));
    return `v1.${b64(iv)}.${b64(ct)}`;
  }

  async function decifrar(payload, chave = chaveDados) {
    if (!chave) throw new Error('Cofre bloqueado.');
    const [v, iv, ct] = String(payload).split('.');
    if (v !== 'v1') throw new Error('Formato cifrado desconhecido.');
    try {
      return dec.decode(await sub.decrypt({ name: 'AES-GCM', iv: deB64(iv) }, chave, deB64(ct)));
    } catch {
      throw new Error('Não foi possível decifrar: chave diferente.');
    }
  }

  /** Força de senha simples (0–4) para orientar o usuário. */
  function forcaSenha(s) {
    let p = 0;
    if (s.length >= 8) p++;
    if (s.length >= 12) p++;
    if (/[a-z]/.test(s) && /[A-Z]/.test(s)) p++;
    if (/\d/.test(s) && /[^A-Za-z0-9]/.test(s)) p++;
    return Math.min(4, p);
  }

  return {
    existeConta, conta, criarConta, entrar, recuperar, trocarSenha, novoCodigoRecuperacao, abrirEnvelope,
    adotarEnvelope, atualizarEnvelopeSeMesmaChave, aberto, bloquear, cifrar, decifrar, forcaSenha,
    // modo casal
    eu, ehPrincipal, criarConvite, cancelarConvites, convitesPendentes, aceitarConvite, pessoas, removerPessoa,
    mesclarEnvelope, sincronizarEnvelope,
    usuario: () => eu()?.usuario || null,
    membroId: () => eu()?.membroId || 'm1',
    titular: () => conta()?.usuario || null,
  };
})();
