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
          ${aparenciaHTML()}
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
      const act = e.target.closest('[data-act]')?.dataset.act;
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
