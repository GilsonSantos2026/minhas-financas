/**
 * ia.js — "Copiar para a IA" (v2026-11-16.8): usar o ChatGPT ou o Gemini que a pessoa já tem,
 * SEM custo, sem chave e sem cadastro.
 *
 * O app monta um texto pronto (pedido + dados resumidos), a pessoa revisa, copia e cola no
 * ChatGPT/Gemini. Nada é enviado pelo app: só sai o que a pessoa colar.
 * Os resumos levam valores, categorias e datas — sem nomes, usuários, contas ou números de cartão.
 *
 * Análises: mês (pontos de atenção e sugestões), onde economizar (3 meses), dívidas e parcelas.
 * Fatura: o texto da fatura vai para a IA, que devolve "DD/MM;DESCRIÇÃO;VALOR"; a resposta colada
 * volta para a conferência do Importar fatura (ver pages/importar-fatura.js).
 */
window.Fin = window.Fin || {};

Fin.ia = (() => {
  const F = () => Fin.finance;
  const fmt = () => Fin.fmt;
  const esc = (s) => Fin.fmt.esc(s);
  const LINKS = [
    ['ChatGPT', 'https://chatgpt.com/'],
    ['Gemini', 'https://gemini.google.com/app'],
  ];
  const brl = (v) => Fin.fmt.brl(v || 0);
  const pct = (v) => `${Math.round((v || 0) * 100)}%`;
  const mesNome = (ym) => Fin.fmt.monthLong(ym).toLowerCase();

  function cabecalhoDados() {
    const p = F().pessoaAtiva?.();
    return p ? `(Visão de uma pessoa do casal: receitas dela, o que ela pagou e a parte dela nas contas dos dois.)` : '';
  }

  function topCategorias(ym, n = 8) {
    const lista = F().porCategoriaDetalhada(ym);
    const total = lista.reduce((s, c) => s + c.total, 0) || 1;
    return lista.slice(0, n).map((c) => `- ${c.categoria}: ${brl(c.total)} (${pct(c.total / total)})`).join('\n');
  }

  /* ---------------- Pedidos prontos ---------------- */

  function analiseMes(ym = Fin.state.mes) {
    const r = F().resumo(ym);
    const ant = F().resumo(fmt().addMonths(ym, -1));
    const hoje = fmt().todayISO();
    const atras = F().lancamentos().filter((l) => l.tipo === 'despesa' && F().statusEfetivo(l) === 'atrasado' && (F().dataRef(l) || '') < hoje);
    let rot = null; try { rot = F().rotativo(null, ym); } catch { /* sem cartões */ }
    let div = null; try { div = Fin.saude.dividas(ym); } catch { /* sem dados */ }
    let rv = null; try { rv = Fin.reserva.calcular(); } catch { /* sem dados */ }
    return `Você é um consultor de finanças pessoais que explica de forma simples e prática.
Analise o resumo do meu orçamento familiar (valores em reais) e responda em português, em tópicos curtos:
1) os 3 pontos que mais merecem atenção;
2) 3 ações práticas para o próximo mês, com valores aproximados;
3) uma meta simples e mensurável para o próximo mês.
Não recomende produtos financeiros específicos.

${cabecalhoDados()}
Mês: ${mesNome(ym)}
Receitas: ${brl(r.receitas)} (recebido até agora ${brl(r.recebido)})
Despesas: ${brl(r.despesas)} (pago até agora ${brl(r.pago)})
Saldo do mês: ${brl(r.saldo)}
Despesas consomem ${r.receitas ? pct(r.despesas / r.receitas) : '—'} da receita
Mês anterior: receitas ${brl(ant.receitas)}, despesas ${brl(ant.despesas)}, saldo ${brl(ant.saldo)}
Contas em aberto no mês: ${r.qtdAPagar} (${brl(r.aPagar)}); atrasadas no total: ${atras.length}${atras.length ? ` (${brl(atras.reduce((s, l) => s + F().valor(l), 0))})` : ''}
${r.aportes ? `Investido no mês: ${brl(r.aportes)}\n` : ''}
Maiores despesas por categoria no mês (cartão já detalhado pelas compras):
${topCategorias(ym)}
${rot ? `\nCartão de crédito (12 meses): ${rot.parciais.length} fatura(s) paga(s) abaixo do total (rotativo), faltando ${brl(rot.totalFalta)}; juros/IOF/multas lidos nas faturas: ${brl(rot.encargos)}` : ''}
${div ? `Dívidas: parcelas e juros consomem ${brl(div.servico)} no mês; saldo de parcelas a vencer: ${brl(div.estoque)}` : ''}
${rv?.base ? `Reserva de emergência: tem ${brl(rv.atual)}; ideal ${brl(rv.ideal)} (${rv.mesesAlvo} meses de custo essencial de ${brl(rv.base)})` : ''}`.replace(/\n{3,}/g, '\n\n').trim();
  }

  function economizar(ym = Fin.state.mes) {
    const meses = [1, 2, 3].map((i) => fmt().addMonths(ym, -i)).reverse();
    const mapa = new Map();
    for (const m of meses) for (const c of F().porCategoriaDetalhada(m)) mapa.set(c.categoria, (mapa.get(c.categoria) || 0) + c.total);
    const classe = new Map(F().categorias('despesa').map((c) => [c.nome, c.classificacao || '']));
    const linhas = [...mapa.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)
      .map(([cat, v]) => `- ${cat}${classe.get(cat) ? ` [${classe.get(cat)}]` : ''}: média ${brl(v / 3)}/mês`);
    const rec = meses.reduce((s, m) => s + F().resumo(m).receitas, 0) / 3;
    const desp = meses.reduce((s, m) => s + F().resumo(m).despesas, 0) / 3;
    return `Você é um consultor de finanças pessoais. Com base na média dos meus gastos dos últimos 3 meses (${mesNome(meses[0])} a ${mesNome(meses[2])}), em reais:
1) aponte onde dá para economizar mais, com valor estimado por mês em cada item;
2) separe o que é corte fácil, médio e difícil;
3) monte um plano de 30 dias para começar.
Responda em português, em tópicos curtos. Não recomende produtos financeiros específicos.

${cabecalhoDados()}
Receita média: ${brl(rec)}/mês · Despesa média: ${brl(desp)}/mês
Gastos por categoria (entre colchetes, a classificação que eu uso):
${linhas.join('\n')}`.replace(/\n{3,}/g, '\n\n').trim();
  }

  function dividas(ym = Fin.state.mes) {
    let d = null; try { d = Fin.saude.dividas(ym); } catch { /* sem dados */ }
    let rot = null; try { rot = F().rotativo(null, ym); } catch { /* sem cartões */ }
    const r = F().resumo(ym);
    const hoje = fmt().todayISO();
    const parcelados = new Map();
    for (const l of F().lancamentos()) {
      if (l.tipo !== 'despesa' || l.recorrencia !== 'parcelado' || F().isPago(l) || (F().dataRef(l) || '') < hoje.slice(0, 7)) continue;
      const k = l.descricao || l.categoria;
      const cur = parcelados.get(k) || { parcela: F().valor(l), restantes: 0, total: 0 };
      cur.restantes++; cur.total += F().valor(l);
      parcelados.set(k, cur);
    }
    const lista = [...parcelados.entries()].sort((a, b) => b[1].total - a[1].total).slice(0, 12)
      .map(([k, v]) => `- ${k}: ${v.restantes} parcela(s) de ~${brl(v.parcela)} (falta ${brl(v.total)})`);
    return `Você é um consultor de finanças pessoais especializado em sair das dívidas. Com os dados abaixo (em reais):
1) diga qual dívida atacar primeiro e por quê (compare os métodos avalanche e bola de neve para o meu caso);
2) monte um plano mês a mês para os próximos 6 meses;
3) diga o que perguntar ao banco para renegociar (ex.: custo efetivo total).
Responda em português, em tópicos curtos. Não recomende bancos ou produtos específicos.

${cabecalhoDados()}
Receita do mês: ${brl(r.receitas)} · Despesas do mês: ${brl(r.despesas)}
${d ? `Parcelas e juros que vencem no mês: ${brl(d.servico)} (cartão parcelado ${brl(d.parcCartao)}, outras parcelas ${brl(d.parcOutras)}, rotativo ${brl(d.rotativo)}, juros ${brl(d.juros)})
Saldo ainda a pagar em parcelas: cartão ${brl(d.futCartao)}, outras ${brl(d.futOutras)}` : ''}
${rot ? `Faturas pagas abaixo do total nos últimos 12 meses: ${rot.parciais.length} (faltou ${brl(rot.totalFalta)}); juros/IOF/multas: ${brl(rot.encargos)}` : ''}
Parcelamentos em andamento:
${lista.join('\n') || '- nenhum lançamento parcelado em aberto'}`.replace(/\n{3,}/g, '\n\n').trim();
  }

  const PEDIDOS = [
    { id: 'mes', titulo: 'Análise do mês', desc: 'Pontos de atenção, 3 ações e uma meta', fn: analiseMes, icone: 'pulso' },
    { id: 'economizar', titulo: 'Onde economizar', desc: 'Média de 3 meses por categoria', fn: economizar, icone: 'alvo' },
    { id: 'dividas', titulo: 'Dívidas e parcelas', desc: 'Plano para quitar e o que negociar', fn: dividas, icone: 'balanca' },
  ];

  /** Pedido que a IA recebe para ler a fatura (a resposta volta para o app). */
  function pedidoFatura(textoFatura) {
    return `Abaixo está o texto extraído do PDF da fatura do meu cartão de crédito.
Liste TODOS os lançamentos da fatura (compras, parcelas, estornos/créditos, juros, IOF, multas e anuidade), um por linha, EXATAMENTE neste formato e sem mais nada:
DD/MM;DESCRIÇÃO;VALOR
Regras:
- VALOR com vírgula nos centavos e sem "R$" (ex.: 1.234,56). Estornos e créditos com sinal de menos (ex.: -50,00).
- Se for parcela, mantenha na descrição como "LOJA 03/10".
- Inclua o pagamento da fatura anterior como uma linha com a descrição "PAGAMENTO".
- Não inclua totais, limites, resumos nem cabeçalhos. Não use markdown nem tabela.

TEXTO DA FATURA:
${textoFatura}`;
  }

  /* ---------------- Janela "Copiar para a IA" ---------------- */

  async function copiar(texto) {
    try { await navigator.clipboard.writeText(texto); return true; } catch { return false; }
  }

  /** Bloco com o texto (editável), Copiar e links para abrir o ChatGPT/Gemini. */
  function blocoCopia(texto, { linhas = 10 } = {}) {
    return `
      <textarea data-ia-texto class="input font-mono !text-xs leading-relaxed" rows="${linhas}" spellcheck="false" aria-label="Texto para a IA">${esc(texto)}</textarea>
      <p class="text-xs text-slate-500">Revise e apague o que não quiser mandar. Vão só valores, categorias e datas — sem nomes, contas ou números de cartão.</p>
      <div class="grid grid-cols-3 gap-2">
        <button type="button" data-ia-copiar class="btn btn-primary !px-2">Copiar</button>
        ${LINKS.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener" class="btn btn-ghost !px-2">Abrir ${n}</a>`).join('')}
      </div>
      <p class="text-[11px] text-slate-400">Dica: toque em Copiar, abra o ChatGPT ou o Gemini e cole (segure o dedo na caixa de mensagem → Colar).</p>`;
  }
  function ligarCopia(panel) {
    panel.querySelector('[data-ia-copiar]')?.addEventListener('click', async () => {
      const ok = await copiar(panel.querySelector('[data-ia-texto]').value);
      Fin.ui.toast(ok ? 'Copiado! Agora cole no ChatGPT ou no Gemini.' : 'Não deu para copiar: selecione o texto e copie.', ok ? 'ok' : 'error');
    });
  }

  /** Janela de análises (Início). */
  function abrirAnalise(inicial = 'mes') {
    const panel = Fin.ui.openModal(`
      <div class="p-5 space-y-4">
        <div data-arrastar class="flex items-center justify-between gap-2">
          <h2 class="font-semibold text-lg flex items-center gap-2">${Fin.icones.badge('mensagem', 'violet', 'w-8 h-8', 'w-[18px] h-[18px]')} Perguntar à IA</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <p class="text-sm text-slate-600">Use o <b>ChatGPT</b> ou o <b>Gemini</b> que você já tem, de graça: o app monta o pedido com os seus números, você copia e cola lá. Nada é enviado pelo app.</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="O que perguntar">
          ${PEDIDOS.map((p) => `<label class="quem-opcao"><input type="radio" name="ia-pedido" value="${p.id}" ${p.id === inicial ? 'checked' : ''}>
            <span class="!items-start">${Fin.icone(p.icone, 'w-5 h-5 shrink-0 mt-0.5')}<span class="min-w-0"><span class="block">${p.titulo}</span><span class="block text-[11px] font-normal text-slate-500">${p.desc}</span></span></span></label>`).join('')}
        </div>
        <div data-ia-bloco class="space-y-3"></div>
      </div>`, 'Perguntar à IA');
    const desenhar = () => {
      const id = panel.querySelector('[name=ia-pedido]:checked').value;
      let texto;
      try { texto = PEDIDOS.find((p) => p.id === id).fn(); } catch (e) { console.warn('[ia]', e); texto = 'Não foi possível montar o resumo (faltam dados).'; }
      panel.querySelector('[data-ia-bloco]').innerHTML = blocoCopia(texto);
      ligarCopia(panel);
    };
    panel.addEventListener('change', (e) => { if (e.target.name === 'ia-pedido') desenhar(); });
    panel.querySelector('[data-close]').addEventListener('click', () => Fin.ui.closeModal());
    desenhar();
  }

  return { PEDIDOS, analiseMes, economizar, dividas, pedidoFatura, blocoCopia, ligarCopia, copiar, abrirAnalise, LINKS };
})();
