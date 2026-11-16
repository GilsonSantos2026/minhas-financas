/**
 * pages/configuracoes.js — Configurações: Perfil (nome social e foto) e Aparência (cor do app).
 * Segurança, senha, backup e Google Drive continuam em "Dados e backup".
 */
window.Fin = window.Fin || {};
Fin.pages = Fin.pages || {};

Fin.pages.configuracoes = (() => {
  const fmt = Fin.fmt;
  const esc = (s) => fmt.esc(s);
  const card = (inner, cls = '') => `<section class="bg-white rounded-2xl shadow-sm p-4 sm:p-5 min-w-0 ${cls}">${inner}</section>`;

  function perfilHTML(m, rascunho) {
    const ver = { ...m, ...rascunho };
    const nomeAtual = rascunho.nome ?? m.nome ?? '';
    return card(`
      ${Fin.icones.titulo('usuario', 'prim', 'Perfil', { cls: 'mb-4' })}
      <div class="flex flex-col sm:flex-row sm:items-center gap-5">
        <div class="relative mx-auto sm:mx-0 shrink-0">
          ${Fin.membros.avatar(ver, { tam: 'w-24 h-24', txt: 'text-2xl', anel: 'ring-4 ring-prim-50' })}
          <label for="perfil-foto" class="absolute -right-1 -bottom-1 w-9 h-9 rounded-full bg-prim-600 text-white grid place-items-center shadow cursor-pointer hover:bg-prim-700" title="Trocar foto">
            ${Fin.icone('camera', 'w-[18px] h-[18px]')}<span class="sr-only">Trocar foto</span>
          </label>
          <input id="perfil-foto" type="file" accept="image/*" class="sr-only" />
        </div>
        <div class="flex-1 min-w-0 space-y-3">
          <label class="field"><span>Como você quer ser chamado(a)?</span>
            <input id="perfil-nome" class="input" maxlength="40" autocomplete="nickname" placeholder="Ex.: ${esc(Fin.membros.nome(m) || 'seu nome')}" value="${esc(nomeAtual)}" /></label>
          <p class="text-xs text-slate-500">Aparece na saudação do Início e, no modo casal, nos seus lançamentos.
            Usuário de acesso: <b class="text-slate-700">${esc(Fin.cofre?.usuario?.() || '—')}</b> (não muda).</p>
          <div class="flex flex-wrap items-center gap-2">
            <label for="perfil-foto" class="btn btn-ghost !py-1.5 cursor-pointer">${Fin.icone('camera', 'w-4 h-4')} ${ver.foto ? 'Trocar foto' : 'Escolher foto'}</label>
            ${ver.foto ? '<button data-act="sem-foto" class="btn btn-danger-ghost !py-1.5">Remover foto</button>' : ''}
          </div>
        </div>
      </div>
      <div class="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 text-sm text-slate-600 flex-1 min-w-[12rem]">
          <span class="text-xs text-slate-400">Prévia:</span>
          ${Fin.membros.avatar({ ...ver, nome: nomeAtual }, { tam: 'w-7 h-7', txt: 'text-[10px]' })}
          <span id="perfil-previa" class="font-medium text-slate-800">${esc(Fin.membros.saudacao())}${Fin.membros.primeiroNome({ ...ver, nome: nomeAtual }) ? `, ${esc(Fin.membros.primeiroNome({ ...ver, nome: nomeAtual }))}` : ''}!</span>
        </div>
        <button data-act="salvar-perfil" class="btn btn-primary" ${rascunho.sujo ? '' : 'disabled'}>Salvar perfil</button>
      </div>`);
  }

  function aparenciaHTML() {
    const atual = Fin.tema.atual();
    const t = Fin.tema.porId(atual);
    return card(`
      ${Fin.icones.titulo('paleta', 'prim', 'Cor do app', { cls: 'mb-1' })}
      <p class="text-sm text-slate-500 mb-4">Toque em uma cor: botões, menu e destaques mudam na hora. As cores de significado
        (pago, atrasado, receitas e despesas nos gráficos) continuam as mesmas.</p>
      <div class="grid grid-cols-6 gap-3 sm:gap-4 max-w-md mx-auto" role="radiogroup" aria-label="Cor do app">
        ${Fin.tema.TEMAS.map((x) => `
          <button type="button" role="radio" aria-checked="${x.id === atual}" data-tema="${x.id}" title="${esc(x.nome)}"
            class="tema-bolinha aspect-square w-full max-w-[3.25rem] mx-auto rounded-full ${x.id === atual ? 'is-ativo' : ''}"
            style="--cor:${x.cores[600]}"><span class="sr-only">${esc(x.nome)}</span></button>`).join('')}
      </div>
      <p class="text-center font-semibold mt-3" id="tema-nome">${esc(t.nome)}</p>`);
  }

  /* ---------------- Modo casal: pessoas com acesso ---------------- */

  function pessoasHTML() {
    if (!Fin.drive?.configurado()) return '';
    const C = Fin.cofre;
    const eu = C.membroId();
    const titular = C.ehPrincipal();
    const conectado = Fin.drive.conectado();
    const comp = Fin.drive.compartilhado();
    const pendentes = C.convitesPendentes();
    const linhas = C.pessoas().map((p) => {
      const m = Fin.membros.porId(p.id);
      const nome = Fin.membros.nome(m) || p.usuario;
      const tags = [p.principal ? 'titular' : '', p.id === eu ? 'você' : ''].filter(Boolean);
      return `
        <li class="flex items-center gap-3 py-2.5">
          ${Fin.membros.avatar(m, { tam: 'w-10 h-10', txt: 'text-xs' })}
          <span class="flex-1 min-w-0">
            <span class="block text-sm font-medium truncate">${esc(nome)} ${tags.map((t) => `<span class="ml-1 text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">${t}</span>`).join('')}</span>
            <span class="block text-xs text-slate-500 truncate">usuário ${esc(p.usuario)}</span>
          </span>
          ${titular && !p.principal ? `<button data-act="remover-pessoa" data-id="${esc(p.id)}" data-nome="${esc(nome)}" class="btn btn-danger-ghost !px-2 !py-1 text-xs">Remover</button>` : ''}
        </li>`;
    }).join('');

    let acoes = '';
    if (!titular) {
      acoes = `<p class="text-sm text-slate-600">Você entrou pelo convite de <b>${esc(C.titular() || '')}</b>. Vocês veem e editam as mesmas finanças; cada um tem a própria senha.</p>`;
    } else if (!conectado) {
      acoes = `<p class="text-sm text-slate-600">Para dividir as finanças com outra pessoa (ex.: esposa ou marido), primeiro
        <a href="#/dados" class="text-prim-700 font-medium hover:underline">conecte o Google Drive em Dados e backup</a>.</p>`;
    } else if (!comp) {
      acoes = `
        <p class="text-sm text-slate-600">Divida as finanças da casa com outra pessoa: cada um entra com <b>o próprio usuário e senha</b>,
          no próprio celular, e vocês veem e editam os mesmos lançamentos. Os dados continuam cifrados.</p>
        <button data-act="compartilhar" class="btn btn-primary mt-3">${Fin.icone('usuario', 'w-4 h-4')} Convidar uma pessoa</button>`;
    } else {
      acoes = `
        <div class="flex flex-wrap items-center gap-2">
          <button data-act="convidar" class="btn btn-primary">${Fin.icone('usuario', 'w-4 h-4')} Gerar convite</button>
          <button data-act="acessos-drive" class="btn btn-ghost">Quem acessa a pasta no Drive</button>
        </div>
        ${pendentes.length ? `<p class="text-xs text-amber-800 bg-amber-50 rounded-lg px-3 py-2 mt-3">
          ${pendentes.length === 1 ? '1 convite em aberto' : `${pendentes.length} convites em aberto`} (vence ${fmt.dataBR ? fmt.dataBR(pendentes[pendentes.length - 1].expira.slice(0, 10)) : new Date(pendentes[pendentes.length - 1].expira).toLocaleDateString('pt-BR')}).
          <button data-act="cancelar-convites" class="underline font-medium ml-1">Cancelar</button></p>` : ''}
        <div id="acessos-drive" class="mt-3"></div>
        <p class="text-xs text-slate-500 mt-3">Os dados ficam na pasta <b>${esc(Fin.drive.PASTA)}</b> do seu Google Drive. Não apague nem mova o arquivo.</p>`;
    }

    return card(`
      ${Fin.icones.titulo('usuario', 'prim', 'Pessoas (finanças da casa)', { cls: 'mb-2' })}
      <ul class="divide-y divide-slate-100 mb-3">${linhas}</ul>
      ${divisaoHTML()}
      ${acoes}`);
  }

  /** Divisão das contas pagas pelos dois (só com 2 pessoas). Usada no filtro por pessoa. */
  function divisaoHTML() {
    const ps = Fin.cofre.pessoas();
    if (ps.length !== 2) return '';
    const d = Fin.finance.divisao();
    const [a, b] = ps;
    const va = Math.round(d[a.id]);
    const M = Fin.membros;
    const nome = (p) => esc(M.primeiroNome(M.porId(p.id)) || p.usuario);
    return `
      <div class="rounded-xl bg-slate-50 p-3 mb-3">
        <div class="text-sm font-medium">Divisão das contas dos dois</div>
        <p class="text-xs text-slate-500">Quando uma despesa é paga por “Os dois”, quanto fica com cada um (no filtro por pessoa).</p>
        <div class="flex items-center gap-3 mt-2">
          ${M.avatar(M.porId(a.id), { tam: 'w-8 h-8', txt: 'text-[10px]' })}
          <input type="range" min="0" max="100" step="5" value="${va}" data-divisao class="flex-1 accent-prim-600" aria-label="Parte de ${nome(a)} nas contas dos dois" />
          ${M.avatar(M.porId(b.id), { tam: 'w-8 h-8', txt: 'text-[10px]' })}
        </div>
        <div class="flex justify-between text-xs mt-1 tabular-nums">
          <span><b data-div-a>${va}%</b> ${nome(a)}</span><span>${nome(b)} <b data-div-b>${100 - va}%</b></span>
        </div>
      </div>`;
  }

  /** Mostra o código do convite (uma vez), com cópia e WhatsApp. */
  function mostrarConvite(codigo, expira, email) {
    const quem = Fin.membros.primeiroNome() || Fin.cofre.usuario();
    const site = location.origin + location.pathname;
    const msg = `${quem} te convidou para as finanças da casa no app Minhas Finanças.\n\n1) Abra ${site}\n2) Toque em "Recebi um convite (finanças da casa)"\n3) Entre com o seu Gmail${email ? ` (${email})` : ''} e escolha o arquivo "${Fin.drive.NOME}" na pasta "${Fin.drive.PASTA}"\n4) Código do convite: ${codigo}\n\nO código vale até ${new Date(expira).toLocaleDateString('pt-BR')} e só pode ser usado uma vez.`;
    const panel = Fin.ui.openModal(`
      <div class="p-5 space-y-4">
        <div class="flex items-center justify-between gap-2">
          <h2 class="font-semibold text-lg">Convite pronto</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <p class="text-sm text-slate-600">Passe este código para a pessoa${email ? ` (${esc(email)})` : ''}. Ele aparece <b>só agora</b>:
          se perder, é só gerar outro.</p>
        <div class="bg-prim-50 border border-prim-200 rounded-xl p-4 text-center">
          <code class="text-2xl font-bold tracking-[0.2em] text-prim-800 select-all">${esc(codigo)}</code>
          <p class="text-xs text-slate-500 mt-1">vale até ${new Date(expira).toLocaleDateString('pt-BR')} · uso único</p>
        </div>
        <ol class="text-sm text-slate-600 space-y-1 list-decimal pl-5">
          <li>No celular dela/dele: abrir o app (${esc(location.host)}) e tocar em <b>“Recebi um convite”</b>.</li>
          <li>Entrar com o <b>Gmail</b>${email ? ` <b>${esc(email)}</b>` : ''} e escolher <b>${esc(Fin.drive.NOME)}</b> na pasta <b>${esc(Fin.drive.PASTA)}</b>.</li>
          <li>Digitar o código e criar o próprio usuário e senha.</li>
        </ol>
        <div class="grid grid-cols-2 gap-2">
          <button data-act="copiar-convite" class="btn btn-ghost">Copiar mensagem</button>
          <a class="btn btn-primary" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(msg)}">Enviar no WhatsApp</a>
        </div>
      </div>`, 'Convite');
    panel.querySelector('[data-close]').addEventListener('click', () => Fin.ui.closeModal());
    panel.querySelector('[data-act="copiar-convite"]').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(msg); Fin.ui.toast('Mensagem copiada.'); } catch { Fin.ui.toast('Não deu para copiar: selecione o código.', 'error'); }
    });
  }

  /** Formulário: Gmail da pessoa (opcional quando a pasta já está compartilhada). */
  function pedirEmail({ primeira }) {
    return new Promise((resolve) => {
      let fim = false;
      const terminar = (v) => { if (fim) return; fim = true; obs.disconnect(); Fin.ui.closeModal(); resolve(v); };
      const panel = Fin.ui.openModal(`
        <form class="p-5 space-y-4" novalidate>
          <div class="flex items-center justify-between gap-2">
            <h2 class="font-semibold text-lg">${primeira ? 'Convidar uma pessoa' : 'Gerar convite'}</h2>
            <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
          </div>
          ${primeira ? `<div class="text-sm text-slate-600 space-y-2">
            <p>O que vai acontecer:</p>
            <ul class="space-y-1.5">
              <li>• Os dados passam da pasta oculta do app para a pasta <b>${esc(Fin.drive.PASTA)}</b> no <b>seu</b> Google Drive (continuam cifrados).</li>
              <li>• A pasta é compartilhada com o Gmail abaixo: o Google manda um e-mail avisando.</li>
              <li>• Você recebe um <b>código de convite</b> para passar à pessoa. Com ele, ela cria o próprio usuário e senha.</li>
              <li>• Seus outros aparelhos mudam sozinhos para a pasta nova (pode pedir “Reconectar Google” uma vez).</li>
            </ul>
            <p class="text-xs text-slate-500">Antes, o app pede ao Google a permissão de <b>arquivos criados pelo app</b> (não dá acesso aos seus outros arquivos).</p>
          </div>` : '<p class="text-sm text-slate-600">Para alguém que já tem acesso à pasta, deixe o e-mail em branco. Para uma pessoa nova, informe o Gmail dela.</p>'}
          <label class="field"><span>Gmail da pessoa${primeira ? '' : ' (opcional)'}</span>
            <input name="email" type="email" class="input" autocomplete="off" placeholder="nome@gmail.com" ${primeira ? 'required' : ''} /></label>
          <p data-erro class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
          <div class="flex justify-end gap-2">
            <button type="button" data-close class="btn btn-ghost">Cancelar</button>
            <button type="submit" class="btn btn-primary">${primeira ? 'Compartilhar e gerar convite' : 'Gerar convite'}</button>
          </div>
        </form>`, 'Convidar');
      const obs = new MutationObserver(() => { if (!document.body.contains(panel)) terminar(null); });
      obs.observe(document.getElementById('modal-root'), { childList: true });
      panel.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => terminar(null)));
      panel.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.elements.email.value.trim();
        if ((primeira || email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          const er = panel.querySelector('[data-erro]');
          er.textContent = 'Digite um e-mail válido (o Gmail da pessoa).';
          er.classList.remove('hidden');
          return;
        }
        terminar({ email });
      });
    });
  }

  async function convidar(view, primeira) {
    const r = await pedirEmail({ primeira });
    if (!r) return;
    Fin.ui.toast(primeira ? 'Preparando a pasta compartilhada…' : 'Gerando convite…');
    try {
      if (primeira) await Fin.drive.ativarCompartilhamento(r.email);
      else if (r.email) await Fin.drive.compartilharCom(r.email);
      const conv = await Fin.cofre.criarConvite();
      window.dispatchEvent(new CustomEvent('fin:alterado'));
      await Fin.drive.sincronizar(); // o convite precisa estar no Drive para a pessoa achar
      if (Fin.drive.estado.erro) throw new Error(Fin.drive.estado.erro);
      mostrarConvite(conv.codigo, conv.expira, r.email);
    } catch (err) {
      console.warn('[convite]', err);
      Fin.ui.toast(err.message || 'Não foi possível criar o convite.', 'error');
    }
    view.querySelector('#cfg-pessoas').innerHTML = pessoasHTML();
  }

  async function listarAcessosDrive(view) {
    const box = view.querySelector('#acessos-drive');
    box.innerHTML = '<p class="text-xs text-slate-500">Consultando o Google Drive…</p>';
    try {
      const lista = await Fin.drive.acessosDrive();
      box.innerHTML = `<ul class="text-sm divide-y divide-slate-100 border border-slate-100 rounded-xl px-3">${lista.map((p) => `
        <li class="flex items-center gap-2 py-2">
          <span class="flex-1 min-w-0 truncate">${esc(p.displayName || p.emailAddress || 'Conta Google')}
            <span class="block text-xs text-slate-500 truncate">${esc(p.emailAddress || '')} · ${p.role === 'owner' ? 'dono' : 'pode editar'}</span></span>
          ${p.role === 'owner' ? '' : `<button data-act="remover-drive" data-perm="${esc(p.id)}" data-email="${esc(p.emailAddress || '')}" class="btn btn-danger-ghost !px-2 !py-1 text-xs">Tirar acesso</button>`}
        </li>`).join('')}</ul>`;
    } catch (err) {
      box.innerHTML = `<p class="text-xs text-rose-700">${esc(err.message)}</p>`;
    }
  }

  function ajudaHTML() {
    return card(`
      ${Fin.icones.titulo('lupa', 'prim', 'Ajuda', { cls: 'mb-2' })}
      <button data-act="rever-tour" class="w-full flex items-center gap-3 -mx-1 px-1 py-2 rounded-xl hover:bg-slate-50 text-left">
        ${Fin.icones.badge('check', 'emerald', 'w-10 h-10')}
        <span class="flex-1 min-w-0"><span class="block text-sm font-medium">Rever tutorial</span>
          <span class="block text-xs text-slate-500">Balões que mostram como lançar receitas e despesas, marcar pago e usar os filtros</span></span>
        <span class="text-slate-300" aria-hidden="true">›</span>
      </button>`);
  }

  function atalhosHTML() {
    return card(`
      <a href="#/dados" class="flex items-center gap-3 -m-1 p-1 rounded-xl hover:bg-slate-50">
        ${Fin.icones.badge('cadeado', 'slate', 'w-10 h-10')}
        <span class="flex-1 min-w-0"><span class="block text-sm font-medium">Segurança, backup e Google Drive</span>
          <span class="block text-xs text-slate-500">Senha, bloqueio automático, backup, sincronização e importação</span></span>
        <span class="text-slate-300" aria-hidden="true">›</span>
      </a>`, '!py-3');
  }

  function render(view, { signal }) {
    const rascunho = { sujo: false };

    const desenhar = () => {
      const m = Fin.membros.atual();
      view.innerHTML = `
        <div class="space-y-4 max-w-2xl mx-auto">
          ${Fin.icones.titulo('engrenagem', 'prim', 'Configurações', { tag: 'h1', cls: 'text-xl hidden md:flex', tam: 'w-9 h-9', ic: 'w-5 h-5' })}
          <div id="cfg-perfil">${perfilHTML(m, rascunho)}</div>
          <div id="cfg-pessoas">${pessoasHTML()}</div>
          ${aparenciaHTML()}
          ${ajudaHTML()}
          ${atalhosHTML()}
        </div>`;
    };
    const redesenharPerfil = () => {
      const foco = document.activeElement?.id;
      const pos = foco === 'perfil-nome' ? document.activeElement.selectionStart : null;
      view.querySelector('#cfg-perfil').innerHTML = perfilHTML(Fin.membros.atual(), rascunho);
      if (foco === 'perfil-nome') {
        const i = view.querySelector('#perfil-nome');
        i.focus();
        if (pos != null) i.setSelectionRange(pos, pos);
      }
    };
    desenhar();

    view.addEventListener('input', (e) => {
      if (e.target.id !== 'perfil-nome') return;
      rascunho.nome = e.target.value;
      rascunho.sujo = true;
      const m = { ...Fin.membros.atual(), ...rascunho };
      const pn = Fin.membros.primeiroNome(m);
      view.querySelector('#perfil-previa').textContent = `${Fin.membros.saudacao()}${pn ? `, ${pn}` : ''}!`;
      view.querySelector('[data-act="salvar-perfil"]').disabled = false;
    }, { signal });

    // Divisão das contas dos dois: mostra ao arrastar, grava ao soltar.
    view.addEventListener('input', (e) => {
      if (!e.target.matches('[data-divisao]')) return;
      const v = Number(e.target.value);
      view.querySelector('[data-div-a]').textContent = `${v}%`;
      view.querySelector('[data-div-b]').textContent = `${100 - v}%`;
    }, { signal });
    view.addEventListener('change', (e) => {
      if (!e.target.matches('[data-divisao]')) return;
      const v = Number(e.target.value);
      const [a, b] = Fin.cofre.pessoas();
      Fin.finance.salvarDivisao({ [a.id]: v, [b.id]: 100 - v });
      Fin.ui.toast('Divisão salva.');
    }, { signal });

    view.addEventListener('change', async (e) => {
      if (e.target.id !== 'perfil-foto') return;
      const arq = e.target.files?.[0];
      e.target.value = '';
      if (!arq) return;
      try {
        rascunho.foto = await Fin.membros.prepararFoto(arq);
        rascunho.sujo = true;
        redesenharPerfil();
        Fin.ui.toast('Foto pronta. Toque em “Salvar perfil” para guardar.');
      } catch (err) {
        Fin.ui.toast(err.message || 'Não foi possível usar esta imagem.', 'error');
      }
    }, { signal });

    view.addEventListener('click', (e) => {
      const tema = e.target.closest('[data-tema]');
      if (tema) {
        const t = Fin.tema.aplicar(tema.dataset.tema);
        // guarda no perfil (sincroniza com os outros aparelhos da mesma pessoa)
        try { if (Fin.membros.atual().tema !== t.id) Fin.membros.salvarAtual({ tema: t.id }); } catch (err) { console.warn('[tema]', err); }
        view.querySelectorAll('[data-tema]').forEach((b) => {
          const on = b.dataset.tema === t.id;
          b.classList.toggle('is-ativo', on);
          b.setAttribute('aria-checked', String(on));
        });
        view.querySelector('#tema-nome').textContent = t.nome;
        return;
      }
      const alvo = e.target.closest('[data-act]');
      const act = alvo?.dataset.act;
      if (act === 'rever-tour') return Fin.tour.iniciar();
      if (act === 'compartilhar') return convidar(view, true);
      if (act === 'convidar') return convidar(view, false);
      if (act === 'acessos-drive') return listarAcessosDrive(view);
      if (act === 'cancelar-convites') {
        Fin.cofre.cancelarConvites();
        window.dispatchEvent(new CustomEvent('fin:alterado'));
        view.querySelector('#cfg-pessoas').innerHTML = pessoasHTML();
        return Fin.ui.toast('Convites cancelados.');
      }
      if (act === 'remover-drive') {
        (async () => {
          const ok = await Fin.ui.confirmar({
            titulo: 'Tirar o acesso à pasta no Drive?', icone: 'nuvem', cor: 'rose',
            intro: `<b>${esc(alvo.dataset.email || 'Esta conta')}</b> deixa de ver a pasta <b>${esc(Fin.drive.PASTA)}</b> no Google Drive e para de receber atualizações.`,
            ciente: 'Entendi', botao: 'Tirar acesso',
          });
          if (!ok) return;
          try { await Fin.drive.removerAcessoDrive(alvo.dataset.perm); Fin.ui.toast('Acesso à pasta removido.'); listarAcessosDrive(view); } catch (err) { Fin.ui.toast(err.message, 'error'); }
        })();
        return;
      }
      if (act === 'remover-pessoa') {
        (async () => {
          const nome = alvo.dataset.nome;
          const ok = await Fin.ui.confirmar({
            titulo: `Remover ${nome}?`, icone: 'usuario', cor: 'rose',
            intro: `${esc(nome)} não vai mais conseguir entrar nas finanças da casa com a senha dela/dele.`,
            perde: [`O acesso de <b>${esc(nome)}</b> (usuário e senha).`],
            mantem: ['Todos os lançamentos, inclusive os que essa pessoa fez.', 'Seu acesso e seus outros aparelhos.'],
            avisos: ['Para cortar de vez, tire também o acesso dela à pasta no Google Drive (botão “Quem acessa a pasta no Drive”).'],
            ciente: 'Entendi', botao: 'Remover acesso',
          });
          if (!ok) return;
          try {
            Fin.cofre.removerPessoa(alvo.dataset.id);
            window.dispatchEvent(new CustomEvent('fin:alterado'));
            view.querySelector('#cfg-pessoas').innerHTML = pessoasHTML();
            Fin.ui.toast(`${nome} foi removido(a).`);
          } catch (err) { Fin.ui.toast(err.message, 'error'); }
        })();
        return;
      }
      if (act === 'sem-foto') {
        rascunho.foto = '';
        rascunho.sujo = true;
        redesenharPerfil();
      } else if (act === 'salvar-perfil') {
        const campos = {};
        if (rascunho.nome !== undefined) campos.nome = rascunho.nome.trim().replace(/\s+/g, ' ');
        if (rascunho.foto !== undefined) campos.foto = rascunho.foto;
        Fin.membros.salvarAtual(campos);
        delete rascunho.nome; delete rascunho.foto; rascunho.sujo = false;
        redesenharPerfil();
        Fin.ui.toast('Perfil salvo.');
      }
    }, { signal });

    // Teclado nas bolinhas de cor (setas), como um grupo de opções.
    view.addEventListener('keydown', (e) => {
      const b = e.target.closest('[data-tema]');
      if (!b || !['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
      e.preventDefault();
      const todos = [...view.querySelectorAll('[data-tema]')];
      const i = todos.indexOf(b);
      const passo = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowDown' ? 6 : -6;
      const prox = todos[(i + passo + todos.length) % todos.length];
      prox.focus();
      prox.click();
    }, { signal });

    // Perfil mudou em outro aparelho (sync): redesenha se não houver edição em curso.
    window.addEventListener('fin:dados-externos', () => { if (!rascunho.sujo) desenhar(); }, { signal });
  }

  return { title: 'Configurações', render };
})();
