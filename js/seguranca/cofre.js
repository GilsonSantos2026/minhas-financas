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
 */
window.Fin = window.Fin || {};

Fin.cofre = (() => {
  const CHAVE_CONTA = 'fin:conta';
  const ITER_SENHA = 400000;
  const ITER_RECUPERACAO = 100000; // a chave de recuperação já é aleatória e longa
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
    };
  }

  /** Cria o acesso: gera a chave de dados e devolve a chave de recuperação (mostrar ao usuário!). */
  async function criarConta(usuario, senha) {
    const chave = await sub.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    const codigo = gerarCodigo();
    salvarConta(await montarEnvelope(usuario, senha, chave, codigo));
    chaveDados = chave;
    return { codigoRecuperacao: codigo };
  }

  /** Abre a chave de dados com usuário e senha de um envelope (local ou vindo do Drive). */
  async function abrirEnvelope(env, usuario, senha) {
    if (normUsuario(usuario) !== normUsuario(env.usuario)) throw new Error('Usuário ou senha incorretos.');
    try {
      const kek = await derivar(senha, deB64(env.kdf.sal), env.kdf.iter);
      return await desembrulhar(env.dekSenha, kek);
    } catch {
      throw new Error('Usuário ou senha incorretos.');
    }
  }

  async function entrar(usuario, senha) {
    const c = conta();
    if (!c) throw new Error('Nenhum acesso criado neste aparelho.');
    chaveDados = await abrirEnvelope(c, usuario, senha);
    return true;
  }

  /** Esqueceu a senha: abre com a chave de recuperação e define uma senha nova. */
  async function recuperar(codigo, novaSenha) {
    const c = conta();
    if (!c) throw new Error('Nenhum acesso criado neste aparelho.');
    let chave;
    try {
      const r = c.dekRecuperacao;
      chave = await desembrulhar(r, await derivar(normCodigo(codigo), deB64(r.sal), r.iter));
    } catch {
      throw new Error('Chave de recuperação incorreta.');
    }
    const novoCodigo = gerarCodigo();
    salvarConta(await montarEnvelope(c.usuario, novaSenha, chave, novoCodigo, c.criadaEm));
    chaveDados = chave;
    return { codigoRecuperacao: novoCodigo };
  }

  async function trocarSenha(senhaAtual, novaSenha) {
    const c = conta();
    const chave = await abrirEnvelope(c, c.usuario, senhaAtual);
    // mantém a mesma chave de recuperação: re-embrulha só a parte da senha
    const sal = aleatorio(16);
    c.kdf = { alg: 'PBKDF2-SHA256', iter: ITER_SENHA, sal: b64(sal) };
    c.dekSenha = await embrulhar(chave, await derivar(novaSenha, sal, ITER_SENHA));
    c.atualizadaEm = new Date().toISOString();
    salvarConta(c);
    chaveDados = chave;
  }

  async function novoCodigoRecuperacao(senhaAtual) {
    const c = conta();
    const chave = await abrirEnvelope(c, c.usuario, senhaAtual);
    const codigo = gerarCodigo();
    const sal = aleatorio(16);
    c.dekRecuperacao = { sal: b64(sal), iter: ITER_RECUPERACAO, ...(await embrulhar(chave, await derivar(normCodigo(codigo), sal, ITER_RECUPERACAO))) };
    c.atualizadaEm = new Date().toISOString();
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
    chaveDados = chave;
    return true;
  }

  /** Mesmo envelope em outro aparelho com senha nova? Adota sem pedir nada (a chave de dados é a mesma). */
  async function atualizarEnvelopeSeMesmaChave(env) {
    const c = conta();
    if (!c || !env || env.atualizadaEm <= c.atualizadaEm) return false;
    salvarConta(env); // a chave de dados não muda; só a senha/recuperação
    return true;
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
    usuario: () => conta()?.usuario || null,
  };
})();
