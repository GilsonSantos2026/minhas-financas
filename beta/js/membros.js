/**
 * membros.js — Quem usa o app: nome social, foto (avatar) e cor do app de cada pessoa.
 *
 * Coleção "membros" (cifrada e sincronizada como as demais):
 *   { id, usuario, nome, foto (data URL JPEG ~160 px), tema, principal, criadoEm, _mod }
 * O membro "atual" é o que corresponde ao usuário que entrou neste aparelho (Fin.cofre.usuario()).
 * Enquanto a pessoa não salva o perfil, ele existe só em memória (nada é gravado ao ler).
 *
 * Preparado para o modo casal (Etapa 2): cada pessoa terá o próprio registro; os lançamentos
 * antigos, sem autor, contam para o membro principal.
 */
window.Fin = window.Fin || {};

Fin.membros = (() => {
  const S = () => Fin.storage;
  const norm = (s) => String(s || '').trim().toLowerCase();

  function lista() {
    try { return S().list('membros'); } catch { return []; }
  }

  /** Membro de quem está usando este aparelho (sem gravar nada). */
  function atual() {
    const usuario = Fin.cofre?.usuario?.() || '';
    const id = Fin.cofre?.membroId?.() || 'm1';
    const todos = lista();
    const porId = todos.find((m) => m.id === id);
    if (porId) return porId;
    // Mesmo usuário com outro id (ex.: removido e convidado de novo): o perfil acompanha o acesso novo.
    const porUsuario = todos.find((m) => norm(m.usuario) === norm(usuario));
    if (porUsuario) return { ...porUsuario, id, _idAntigo: porUsuario.id, principal: id === 'm1' };
    return { id, usuario, nome: '', foto: '', tema: null, principal: id === 'm1', novo: true };
  }

  /** Perfil de um membro pelo id (ou um perfil mínimo com o usuário do envelope). */
  function porId(id) {
    const m = lista().find((x) => x.id === id);
    if (m) return m;
    const p = Fin.cofre?.pessoas?.().find((x) => x.id === id);
    return { id, usuario: p?.usuario || '', nome: '', foto: '', principal: id === 'm1' };
  }

  /** Salva (cria ou atualiza) o perfil de quem está usando. */
  function salvarAtual(campos) {
    const m = atual();
    const { novo, _idAntigo, ...base } = m;
    const item = { ...base, ...campos, usuario: base.usuario || Fin.cofre?.usuario?.() || '' };
    if (!item.id) item.id = S().uid();
    if (_idAntigo && _idAntigo !== item.id) S().remove('membros', _idAntigo);
    const salvo = S().upsert('membros', item);
    desenharTopo();
    return salvo;
  }

  /** Nome para exibir: nome social → usuário com inicial maiúscula. */
  function nome(m = atual()) {
    const n = String(m?.nome || '').trim() || String(m?.usuario || '').trim();
    return n ? n.charAt(0).toUpperCase() + n.slice(1) : '';
  }
  const primeiroNome = (m = atual()) => nome(m).split(/\s+/)[0] || '';

  function iniciais(m = atual()) {
    const partes = nome(m).split(/\s+/).filter(Boolean);
    if (!partes.length) return '?';
    return ((partes[0][0] || '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
  }

  /** Avatar redondo: foto ou iniciais na cor do app. tam = classes de tamanho; txt = tamanho da letra. */
  function avatar(m = atual(), { tam = 'w-10 h-10', txt = 'text-sm', anel = '' } = {}) {
    const esc = Fin.fmt?.esc || ((s) => s);
    if (m?.foto) {
      return `<img src="${esc(m.foto)}" alt="" class="${tam} ${anel} rounded-full object-cover shrink-0 bg-slate-100" />`;
    }
    return `<span class="${tam} ${anel} ${txt} rounded-full shrink-0 grid place-items-center font-semibold bg-prim-100 text-prim-800" aria-hidden="true">${esc(iniciais(m))}</span>`;
  }

  /** "Bom dia" / "Boa tarde" / "Boa noite" pela hora do aparelho. */
  function saudacao(d = new Date()) {
    const h = d.getHours();
    return h >= 5 && h < 12 ? 'Bom dia' : h >= 12 && h < 18 ? 'Boa tarde' : 'Boa noite';
  }

  /**
   * Lê uma imagem escolhida pelo usuário e devolve um JPEG quadrado pequeno (data URL).
   * Corta no centro e reduz para `lado` px — fica com ~5–15 KB dentro do cofre.
   */
  function prepararFoto(arquivo, lado = 160) {
    return new Promise((resolve, reject) => {
      if (!arquivo || !/^image\//.test(arquivo.type)) return reject(new Error('Escolha um arquivo de imagem (JPG, PNG…).'));
      if (arquivo.size > 15 * 1024 * 1024) return reject(new Error('Imagem muito grande (máximo 15 MB).'));
      const url = URL.createObjectURL(arquivo);
      const img = new Image();
      img.onload = () => {
        try {
          const menor = Math.min(img.naturalWidth, img.naturalHeight);
          const sx = (img.naturalWidth - menor) / 2;
          const sy = (img.naturalHeight - menor) / 2;
          const c = document.createElement('canvas');
          c.width = c.height = lado;
          const ctx = c.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, lado, lado);
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, sx, sy, menor, menor, 0, 0, lado, lado);
          resolve(c.toDataURL('image/jpeg', 0.82));
        } catch (e) { reject(e); } finally { URL.revokeObjectURL(url); }
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Não foi possível ler esta imagem.')); };
      img.src = url;
    });
  }

  /** Avatar no cabeçalho do celular e cartão de perfil no menu lateral. */
  function desenharTopo() {
    let m;
    try { m = atual(); } catch { return; }
    const esc = Fin.fmt?.esc || ((s) => s);
    document.querySelectorAll('[data-avatar-topo]').forEach((el) => {
      el.innerHTML = avatar(m, { tam: 'w-9 h-9', txt: 'text-xs', anel: 'ring-2 ring-white/60' });
      el.setAttribute('aria-label', `Perfil e configurações${nome(m) ? ` — ${nome(m)}` : ''}`);
    });
    document.querySelectorAll('[data-perfil-chip]').forEach((el) => {
      el.innerHTML = `${avatar(m, { tam: 'w-8 h-8', txt: 'text-xs' })}
        <span class="min-w-0 flex-1 leading-tight"><span class="block text-sm font-medium text-slate-700 truncate">${esc(nome(m) || 'Meu perfil')}</span>
        <span class="block text-xs text-slate-400 truncate">Perfil e configurações</span></span>`;
    });
  }

  /** Ao entrar: aplica a cor salva no perfil (vinda de outro aparelho) e desenha o avatar. */
  function aoDesbloquear() {
    const m = atual();
    let tema = m.tema;
    // Perfil ainda com o verde de fábrica (de antes da marca Valoris) → passa à cor da marca uma vez.
    if (tema && Fin.tema && tema === Fin.tema.ANTIGO_PADRAO && !m.temaMarca) {
      tema = Fin.tema.PADRAO;
      try { salvarAtual({ tema, temaMarca: 1 }); } catch { /* bloqueado: tenta na próxima */ }
    }
    if (tema && tema !== Fin.tema?.atual()) Fin.tema.aplicar(tema);
    desenharTopo();
  }

  window.addEventListener('fin:desbloqueado', aoDesbloquear);
  window.addEventListener('fin:dados-externos', aoDesbloquear);

  return { lista, atual, porId, salvarAtual, nome, primeiroNome, iniciais, avatar, saudacao, prepararFoto, desenharTopo };
})();
