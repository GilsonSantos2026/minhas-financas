/**
 * sugestoes.js — Canal de sugestões e problemas (Configurações → Sugestões).
 *
 * - Quem usa o app escreve uma sugestão, um problema ou uma dúvida. O app monta um relatório
 *   organizado (tipo, tela, quem enviou, data, versão do app, aparelho, descrição).
 * - O relatório fica gravado na coleção "sugestoes" (cifrada e sincronizada pelo Drive): no modo
 *   casal chega ao aparelho do titular, que vê a lista "Sugestões recebidas".
 * - "Enviar por e-mail" abre o app de e-mail já preenchido para o endereço que o TITULAR digitou
 *   em Configurações (guardado cifrado em invConfig 'sugestoes' — nunca no código, que é público).
 */
window.Fin = window.Fin || {};

Fin.sugestoes = (() => {
  const S = () => Fin.storage;
  const esc = (s) => Fin.fmt.esc(s);
  const TIPOS = { melhoria: ['Sugestão de melhoria', 'mais'], problema: ['Problema / erro', 'alerta'], duvida: ['Dúvida', 'lupa'] };
  const TELAS = [['', 'Geral / várias telas'], ['/dashboard', 'Início'], ['/lancamentos', 'Lançamentos'], ['/planilha', 'Planilha'],
    ['/cartoes', 'Cartões'], ['/investimentos', 'Investimentos'], ['/relatorios', 'Relatórios'], ['/orcamento', 'Orçamento'],
    ['/conciliacao', 'Conciliação'], ['/categorias', 'Categorias'], ['/dados', 'Dados e backup'], ['/configuracoes', 'Configurações'], ['/educacao', 'Aprender']];
  const nomeTela = (t) => (TELAS.find(([k]) => k === t) || ['', t || 'Geral'])[1];

  const lista = () => [...S().list('sugestoes')].sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
  const novas = () => lista().filter((s) => (s.status || 'nova') === 'nova').length;
  const config = () => S().list('invConfig').find((c) => c.id === 'sugestoes') || {};
  const emailDestino = () => config().email || '';
  function salvarEmail(email) {
    S().upsert('invConfig', { ...config(), id: 'sugestoes', email: String(email || '').trim() });
  }

  function aparelho() {
    const ua = navigator.userAgent;
    const so = /Android/i.test(ua) ? 'Android' : /iPhone|iPad/i.test(ua) ? 'iPhone/iPad' : /Windows/i.test(ua) ? 'Windows' : /Mac/i.test(ua) ? 'Mac' : 'Outro';
    const nav = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : /Firefox\//.test(ua) ? 'Firefox' : 'navegador';
    const app = matchMedia('(display-mode: standalone)').matches ? 'app instalado' : 'site';
    return `${so} · ${nav} · ${app} · tela ${innerWidth}×${innerHeight}`;
  }

  /** Texto do relatório (e-mail e "copiar"). */
  function relatorio(s) {
    const [tipo] = TIPOS[s.tipo] || TIPOS.melhoria;
    const quando = new Date(s.criadoEm).toLocaleString('pt-BR');
    const linhas = [
      `Tipo: ${tipo}`,
      `Tela: ${nomeTela(s.tela)}`,
      `Enviado por: ${s.autorNome || '—'}${s.autorUsuario ? ` (usuário ${s.autorUsuario})` : ''}`,
      `Data: ${quando}`,
      ...(s.tecnico ? [`Versão do app: ${s.versao || '—'}`, `Aparelho: ${s.aparelho || '—'}`] : []),
      '',
      s.tipo === 'problema' ? 'O que aconteceu:' : s.tipo === 'duvida' ? 'Dúvida:' : 'Sugestão:',
      s.descricao || '—',
      ...(s.tipo === 'problema' && s.esperado ? ['', 'O que eu esperava:', s.esperado] : []),
      ...(s.tipo === 'problema' && s.passos ? ['', 'Como acontece (passo a passo):', s.passos] : []),
    ];
    return { assunto: `[Valoris] ${tipo}: ${s.titulo}`, corpo: linhas.join('\n') };
  }

  function mailto(s) {
    const dest = emailDestino();
    if (!dest) return null;
    const r = relatorio(s);
    return `mailto:${encodeURIComponent(dest)}?subject=${encodeURIComponent(r.assunto)}&body=${encodeURIComponent(r.corpo)}`;
  }

  async function copiar(s) {
    const r = relatorio(s);
    await navigator.clipboard.writeText(`${r.assunto}\n\n${r.corpo}`);
  }

  /** Formulário de nova sugestão. aoSalvar(registro) é chamado depois de gravar. */
  function abrir(aoSalvar) {
    const telaAtual = (Fin.router.current?.() || '').split('?')[0];
    const panel = Fin.ui.openModal(`
      <form id="sug-form" novalidate>
        <div data-arrastar class="flex items-center justify-between gap-2 px-5 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 class="font-semibold text-lg">Sugestão ou problema</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <div class="px-5 py-4 space-y-4">
          <fieldset><legend class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">O que você quer enviar?</legend>
            <div class="grid grid-cols-3 gap-2">${Object.entries(TIPOS).map(([k, [rot, ic]], i) => `
              <label class="quem-opcao"><input type="radio" name="tipo" value="${k}" ${i === 0 ? 'checked' : ''}><span class="!flex-col !gap-1 text-center !py-2">${Fin.icone(ic, 'w-5 h-5')}<span class="text-xs leading-tight">${rot}</span></span></label>`).join('')}
            </div></fieldset>
          <label class="field"><span>Em qual tela?</span>
            <select name="tela" class="input">${TELAS.map(([k, n]) => `<option value="${k}" ${k === telaAtual ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
          <label class="field"><span>Título *</span>
            <input name="titulo" class="input" maxlength="80" placeholder="Ex.: Poder filtrar por forma de pagamento" required /></label>
          <label class="field"><span data-rot-desc>Conte com detalhes *</span>
            <textarea name="descricao" class="input min-h-[6rem]" maxlength="2000" required placeholder="O que você gostaria, ou o que aconteceu"></textarea></label>
          <div data-so-problema class="space-y-4 hidden">
            <label class="field"><span>O que você esperava que acontecesse?</span>
              <textarea name="esperado" class="input min-h-[4rem]" maxlength="1000"></textarea></label>
            <label class="field"><span>Como repetir o problema (passo a passo)</span>
              <textarea name="passos" class="input min-h-[4rem]" maxlength="1000" placeholder="1. Abri Lançamentos  2. Toquei em…"></textarea></label>
          </div>
          <label class="flex items-start gap-2 text-sm cursor-pointer">
            <input type="checkbox" name="tecnico" checked class="accent-prim-600 w-4 h-4 mt-0.5" />
            <span>Incluir informações técnicas (versão do app e tipo de aparelho). <span class="text-slate-500">Nenhum valor ou lançamento seu vai junto.</span></span>
          </label>
          <p data-erro class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
        </div>
        <div class="flex items-center gap-2 px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
          <span class="flex-1"></span>
          <button type="button" data-close class="btn btn-ghost">Cancelar</button>
          <button type="submit" class="btn btn-primary">Enviar</button>
        </div>
      </form>`, 'Sugestão ou problema');
    const form = panel.querySelector('form');
    panel.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => Fin.ui.closeModal()));
    const sync = () => {
      const t = form.querySelector('[name=tipo]:checked').value;
      form.querySelector('[data-so-problema]').classList.toggle('hidden', t !== 'problema');
      form.querySelector('[data-rot-desc]').textContent = t === 'problema' ? 'O que aconteceu? *' : t === 'duvida' ? 'Qual é a dúvida? *' : 'Conte com detalhes *';
    };
    form.addEventListener('change', sync);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = form.elements;
      const erro = form.querySelector('[data-erro]');
      if (!f.titulo.value.trim() || !f.descricao.value.trim()) {
        erro.textContent = 'Preencha o título e a descrição.';
        erro.classList.remove('hidden');
        return;
      }
      const tecnico = f.tecnico.checked;
      const m = Fin.membros?.atual?.();
      const reg = S().upsert('sugestoes', {
        tipo: form.querySelector('[name=tipo]:checked').value,
        tela: f.tela.value,
        titulo: f.titulo.value.trim(),
        descricao: f.descricao.value.trim(),
        esperado: f.esperado.value.trim() || null,
        passos: f.passos.value.trim() || null,
        autor: Fin.cofre?.membroId?.() || 'm1',
        autorNome: Fin.membros?.nome?.(m) || '',
        autorUsuario: Fin.cofre?.usuario?.() || '',
        tecnico,
        versao: tecnico ? `${Fin.config?.versaoApp || ''} (${await Promise.race([Fin.pwa?.versao?.() ?? null, new Promise((r) => setTimeout(() => r(null), 2500))]) || '—'})` : null,
        aparelho: tecnico ? aparelho() : null,
        status: 'nova',
      });
      Fin.ui.closeModal();
      aoSalvar?.(reg);
    });
  }

  /** Depois de gravar: oferece e-mail / copiar. */
  function enviado(reg) {
    const link = mailto(reg);
    const titular = Fin.cofre?.ehPrincipal?.();
    const panel = Fin.ui.openModal(`
      <div class="p-5 space-y-4 text-center">
        <div class="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 grid place-items-center">${Fin.icone('check', 'w-8 h-8')}</div>
        <div><h2 class="font-semibold text-lg">Obrigado!</h2>
          <p class="text-sm text-slate-600 mt-1">${titular
            ? 'Ficou guardado em <b>Sugestões recebidas</b>.'
            : 'Ficou guardado no app e chega ao titular na próxima sincronização.'}${link ? ' Se quiser, envie também por e-mail.' : ''}</p></div>
        <div class="grid gap-2">
          ${link ? `<a href="${esc(link)}" class="btn btn-primary" data-email>${Fin.icone('mensagem', 'w-4 h-4')} Enviar por e-mail</a>` : ''}
          <button type="button" data-copiar class="btn btn-ghost">Copiar relatório</button>
          <button type="button" data-close class="btn btn-ghost">Fechar</button>
        </div>
        ${!link && titular ? '<p class="text-xs text-slate-500">Para receber por e-mail, informe o endereço em Configurações → Sugestões.</p>' : ''}
      </div>`, 'Sugestão enviada');
    panel.querySelector('[data-close]').addEventListener('click', () => Fin.ui.closeModal());
    panel.querySelector('[data-copiar]').addEventListener('click', async () => {
      try { await copiar(reg); Fin.ui.toast('Relatório copiado.'); } catch { Fin.ui.toast('Não foi possível copiar.', 'error'); }
    });
  }

  function marcar(id, status) { S().upsert('sugestoes', { id, status }); }
  function excluir(id) { S().remove('sugestoes', id); }

  return { TIPOS, nomeTela, lista, novas, emailDestino, salvarEmail, relatorio, mailto, copiar, abrir, enviado, marcar, excluir };
})();
