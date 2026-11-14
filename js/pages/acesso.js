/**
 * pages/acesso.js — Telas de acesso (ficam por cima do app, em tela cheia):
 *  criar   → primeiro uso: usuário + senha (os dados passam a ser cifrados)
 *  codigo  → mostra a chave de recuperação (anotar/baixar)
 *  entrar  → usuário + senha
 *  recuperar → esqueci a senha: chave de recuperação + senha nova
 *  drive   → já uso em outro aparelho: entra pelo Google Drive com a mesma senha
 */
window.Fin = window.Fin || {};

Fin.acesso = (() => {
  const esc = (v) => Fin.fmt.esc(v);
  let aoDesbloquear = () => {};
  let root = null;

  const MAX_TENTATIVAS = 5;
  const ESPERA_MS = 30000;

  function casca(inner) {
    root.innerHTML = `
      <div class="fixed inset-0 z-[60] overflow-y-auto bg-gradient-to-br from-emerald-600 to-teal-700">
        <div class="min-h-full flex items-center justify-center p-4">
          <div class="w-full max-w-sm">
            <div class="flex flex-col items-center text-white mb-5">
              <img src="icons/icon-192.png" alt="" class="w-16 h-16 rounded-2xl shadow-lg">
              <h1 class="text-xl font-semibold mt-3">Minhas Finanças</h1>
            </div>
            <div class="bg-white rounded-2xl shadow-xl p-6">${inner}</div>
            <p class="text-center text-xs text-emerald-50/80 mt-4">Seus dados ficam cifrados neste aparelho${Fin.config?.googleClientId ? ' e no seu Google Drive' : ''}.</p>
          </div>
        </div>
      </div>`;
    root.classList.remove('hidden');
    setTimeout(() => root.querySelector('input:not([type=hidden]):not([readonly])')?.focus(), 50);
  }

  const campoSenha = (name, rotulo, auto) => `
    <label class="field"><span>${rotulo}</span>
      <div class="relative">
        <input name="${name}" type="password" class="input pr-12" autocomplete="${auto}" required minlength="${name === 'senha' && auto === 'current-password' ? 1 : 8}" />
        <button type="button" data-olho="${name}" class="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-slate-500 hover:text-slate-800" aria-label="Mostrar senha">mostrar</button>
      </div></label>`;

  const erroBox = '<p id="ac-erro" class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>';
  const mostrarErro = (msg) => { const e = root.querySelector('#ac-erro'); e.textContent = msg; e.classList.remove('hidden'); };
  const ocupado = (form, sim, texto) => {
    const b = form.querySelector('button[type=submit]');
    b.disabled = sim;
    if (texto) b.dataset.txt = b.dataset.txt || b.textContent;
    b.textContent = sim ? texto : b.dataset.txt || b.textContent;
  };

  function ligarOlhos() {
    root.querySelectorAll('[data-olho]').forEach((b) => b.addEventListener('click', () => {
      const i = root.querySelector(`input[name="${b.dataset.olho}"]`);
      const ver = i.type === 'password';
      i.type = ver ? 'text' : 'password';
      b.textContent = ver ? 'ocultar' : 'mostrar';
    }));
  }

  function medidorForca(form) {
    const i = form.elements.senha;
    const barra = form.querySelector('#forca');
    if (!i || !barra) return;
    const rot = ['muito fraca', 'fraca', 'razoável', 'boa', 'forte'];
    const cor = ['#d03b3b', '#ec835a', '#fab219', '#2a78d6', '#0ca30c'];
    i.addEventListener('input', () => {
      const f = Fin.cofre.forcaSenha(i.value);
      barra.innerHTML = i.value ? `<span class="inline-block h-1.5 rounded-full align-middle" style="width:${(f + 1) * 20}%;background:${cor[f]}"></span>
        <span class="text-xs text-slate-500 ml-2">${rot[f]}</span>` : '';
    });
  }

  /* ---------------- Telas ---------------- */

  function telaCriar() {
    const temDados = !!localStorage.getItem('fin:lancamentos');
    casca(`
      <h2 class="font-semibold text-lg">Criar acesso</h2>
      <p class="text-sm text-slate-500 mt-1">${temDados ? 'Seus dados atuais serão protegidos (cifrados) com esta senha.' : 'Defina o usuário e a senha para entrar no app.'}</p>
      <form id="ac-form" class="space-y-3 mt-4" novalidate>
        <label class="field"><span>Usuário</span><input name="usuario" class="input" autocomplete="username" maxlength="40" required /></label>
        ${campoSenha('senha', 'Senha (mínimo 8 caracteres)', 'new-password')}
        <div id="forca" class="h-4"></div>
        ${campoSenha('senha2', 'Repita a senha', 'new-password')}
        ${erroBox}
        <button type="submit" class="btn btn-primary w-full">Criar acesso</button>
      </form>
      <p class="text-xs text-slate-500 mt-4">Se esquecer a senha, só a <b>chave de recuperação</b> (mostrada a seguir) devolve o acesso.</p>
      ${Fin.config?.googleClientId ? `<div class="border-t border-slate-100 mt-4 pt-4 text-center">
        <button data-ir="drive" class="text-sm text-emerald-700 font-semibold hover:underline">Já uso o app em outro aparelho</button></div>` : ''}`);
    const form = root.querySelector('#ac-form');
    ligarOlhos();
    medidorForca(form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const u = form.elements.usuario.value.trim();
      const s = form.elements.senha.value;
      if (!u) return mostrarErro('Informe o usuário.');
      if (s.length < 8) return mostrarErro('A senha precisa ter pelo menos 8 caracteres.');
      if (s !== form.elements.senha2.value) return mostrarErro('As senhas não conferem.');
      ocupado(form, true, 'Protegendo seus dados…');
      try {
        const { codigoRecuperacao } = await Fin.cofre.criarConta(u, s);
        await Fin.storage.abrirCofre();
        telaCodigo(codigoRecuperacao, 'Acesso criado!');
      } catch (err) {
        ocupado(form, false);
        mostrarErro(err.message);
      }
    });
  }

  function telaCodigo(codigo, titulo) {
    casca(`
      <h2 class="font-semibold text-lg">${titulo}</h2>
      <p class="text-sm text-slate-600 mt-1">Esta é a sua <b>chave de recuperação</b>. Guarde-a fora deste aparelho
        (papel, gerenciador de senhas). Sem ela, uma senha esquecida não tem volta.</p>
      <div class="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
        <code id="ac-codigo" class="text-base sm:text-lg font-semibold tracking-wider break-all select-all">${esc(codigo)}</code>
      </div>
      <div class="grid grid-cols-2 gap-2 mt-3">
        <button data-acao="copiar" class="btn btn-ghost">Copiar</button>
        <button data-acao="baixar" class="btn btn-ghost">Baixar .txt</button>
      </div>
      <label class="flex items-start gap-2 text-sm mt-4"><input id="ac-ok" type="checkbox" class="mt-0.5 w-4 h-4 accent-emerald-600">
        <span>Guardei minha chave de recuperação em local seguro.</span></label>
      <button data-acao="continuar" class="btn btn-primary w-full mt-4" disabled>Continuar</button>`);
    root.querySelector('#ac-ok').addEventListener('change', (e) => { root.querySelector('[data-acao="continuar"]').disabled = !e.target.checked; });
    root.addEventListener('click', async function h(e) {
      const a = e.target.closest('[data-acao]')?.dataset.acao;
      if (a === 'copiar') { try { await navigator.clipboard.writeText(codigo); Fin.ui.toast('Chave copiada.'); } catch { Fin.ui.toast('Selecione e copie a chave manualmente.', 'error'); } }
      if (a === 'baixar') {
        const txt = `Minhas Finanças — chave de recuperação\nUsuário: ${Fin.cofre.usuario()}\nCriada em: ${new Date().toLocaleString('pt-BR')}\n\n${codigo}\n\nGuarde este arquivo fora do aparelho. Quem tiver esta chave consegue redefinir sua senha.\n`;
        const a2 = document.createElement('a');
        a2.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain' }));
        a2.download = 'minhas-financas-chave-recuperacao.txt';
        a2.click();
        setTimeout(() => URL.revokeObjectURL(a2.href), 1000);
      }
      if (a === 'continuar') { root.removeEventListener('click', h); concluir(); }
    });
  }

  function telaEntrar() {
    const usuario = Fin.cofre.usuario() || '';
    casca(`
      <h2 class="font-semibold text-lg">Entrar</h2>
      <form id="ac-form" class="space-y-3 mt-4" novalidate>
        <label class="field"><span>Usuário</span><input name="usuario" class="input" autocomplete="username" value="${esc(usuario)}" required /></label>
        ${campoSenha('senha', 'Senha', 'current-password')}
        ${erroBox}
        <button type="submit" class="btn btn-primary w-full">Entrar</button>
      </form>
      <div class="text-center mt-4"><button data-ir="recuperar" class="text-sm text-slate-500 hover:text-slate-800 hover:underline">Esqueci minha senha</button></div>`);
    const form = root.querySelector('#ac-form');
    if (usuario) setTimeout(() => form.elements.senha.focus(), 60);
    ligarOlhos();
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const bloqueadoAte = Number(sessionStorage.getItem('fin:esperaAte') || 0);
      if (Date.now() < bloqueadoAte) return mostrarErro(`Muitas tentativas. Aguarde ${Math.ceil((bloqueadoAte - Date.now()) / 1000)} s.`);
      // Mesmo clique: já pede a autorização do Google (popups só abrem a partir de um clique).
      Fin.drive?.aoEntrar?.();
      ocupado(form, true, 'Entrando…');
      try {
        await Fin.cofre.entrar(form.elements.usuario.value, form.elements.senha.value);
        await Fin.storage.abrirCofre();
        sessionStorage.removeItem('fin:tentativas');
        concluir();
      } catch (err) {
        ocupado(form, false);
        const n = Number(sessionStorage.getItem('fin:tentativas') || 0) + 1;
        sessionStorage.setItem('fin:tentativas', n);
        if (n >= MAX_TENTATIVAS) {
          sessionStorage.setItem('fin:esperaAte', Date.now() + ESPERA_MS);
          sessionStorage.setItem('fin:tentativas', 0);
        }
        mostrarErro(err.message);
        form.elements.senha.select();
      }
    });
  }

  function telaRecuperar() {
    casca(`
      <h2 class="font-semibold text-lg">Recuperar acesso</h2>
      <p class="text-sm text-slate-500 mt-1">Digite a chave de recuperação e escolha uma senha nova.</p>
      <form id="ac-form" class="space-y-3 mt-4" novalidate>
        <label class="field"><span>Chave de recuperação</span><input name="codigo" class="input font-mono uppercase" autocomplete="off" placeholder="XXXX-XXXX-…" required /></label>
        ${campoSenha('senha', 'Nova senha (mínimo 8 caracteres)', 'new-password')}
        <div id="forca" class="h-4"></div>
        ${campoSenha('senha2', 'Repita a nova senha', 'new-password')}
        ${erroBox}
        <button type="submit" class="btn btn-primary w-full">Redefinir senha</button>
      </form>
      <div class="text-center mt-4"><button data-ir="entrar" class="text-sm text-slate-500 hover:underline">Voltar</button></div>`);
    const form = root.querySelector('#ac-form');
    ligarOlhos();
    medidorForca(form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const s = form.elements.senha.value;
      if (s.length < 8) return mostrarErro('A senha precisa ter pelo menos 8 caracteres.');
      if (s !== form.elements.senha2.value) return mostrarErro('As senhas não conferem.');
      ocupado(form, true, 'Verificando…');
      try {
        const { codigoRecuperacao } = await Fin.cofre.recuperar(form.elements.codigo.value, s);
        await Fin.storage.abrirCofre();
        telaCodigo(codigoRecuperacao, 'Senha redefinida! Nova chave de recuperação');
      } catch (err) {
        ocupado(form, false);
        mostrarErro(err.message);
      }
    });
  }

  /** Outro aparelho já usa o app: baixa o cofre do Drive e abre com a mesma senha. */
  function telaDrive() {
    casca(`
      <h2 class="font-semibold text-lg">Usar dados de outro aparelho</h2>
      <p class="text-sm text-slate-500 mt-1">Conecte o mesmo Google usado no outro aparelho e entre com o mesmo usuário e senha do app.</p>
      <button data-acao="google" class="btn btn-ghost w-full mt-4 border border-slate-200">
        <span aria-hidden="true">🔑</span> Conectar Google Drive</button>
      <form id="ac-form" class="space-y-3 mt-4 hidden" novalidate>
        <p id="ac-achado" class="text-sm text-emerald-800 bg-emerald-50 rounded-lg px-3 py-2"></p>
        <label class="field"><span>Usuário</span><input name="usuario" class="input" autocomplete="username" required /></label>
        ${campoSenha('senha', 'Senha', 'current-password')}
        <button type="submit" class="btn btn-primary w-full">Entrar</button>
      </form>
      ${erroBox}
      <div class="text-center mt-4"><button data-ir="criar" class="text-sm text-slate-500 hover:underline">Voltar</button></div>`);
    let remoto = null;
    const form = root.querySelector('#ac-form');
    ligarOlhos();
    root.querySelector('[data-acao="google"]').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      btn.textContent = 'Conectando…';
      try {
        remoto = await Fin.drive.baixarParaEntrar();
        if (!remoto) throw new Error('Nenhum dado do app foi encontrado neste Google Drive. Crie o acesso normalmente.');
        btn.classList.add('hidden');
        form.classList.remove('hidden');
        root.querySelector('#ac-achado').textContent = `Dados encontrados (atualizados em ${new Date(remoto.atualizadoEm).toLocaleString('pt-BR')}).`;
        form.elements.usuario.value = remoto.conta?.usuario || '';
        form.elements.senha.focus();
      } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Conectar Google Drive';
        mostrarErro(err.message);
      }
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      ocupado(form, true, 'Abrindo…');
      try {
        await Fin.drive.entrarComRemoto(remoto, form.elements.usuario.value, form.elements.senha.value);
        concluir();
      } catch (err) {
        ocupado(form, false);
        mostrarErro(err.message);
      }
    });
  }

  /* ---------------- Fluxo ---------------- */

  function concluir() {
    root.classList.add('hidden');
    root.innerHTML = '';
    aoDesbloquear();
  }

  function iniciar(callback) {
    aoDesbloquear = callback;
    root = document.getElementById('acesso-root');
    root.addEventListener('click', (e) => {
      const ir = e.target.closest('[data-ir]')?.dataset.ir;
      if (ir === 'recuperar') telaRecuperar();
      if (ir === 'entrar') telaEntrar();
      if (ir === 'criar') telaCriar();
      if (ir === 'drive') telaDrive();
    });
    if (Fin.cofre.existeConta()) telaEntrar();
    else telaCriar();
  }

  /** Bloqueia o app (botão "Bloquear" ou inatividade) e volta para "Entrar". */
  async function bloquear() {
    if (Fin.storage.bloqueado()) return;
    Fin.ui.closeModal();
    await Fin.storage.fecharCofre();
    document.getElementById('view').innerHTML = '';
    window.dispatchEvent(new CustomEvent('fin:bloqueado'));
    telaEntrar();
  }

  return { iniciar, bloquear, telaEntrar };
})();
