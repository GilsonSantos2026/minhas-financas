/**
 * investimentos/reserva.js — Reserva de emergência: quanto guardar e como chegar lá.
 *
 * Metodologia (valor ideal):
 *  1. Custo essencial do mês = despesas das categorias ESSENCIAIS (classificação da categoria,
 *     mais compromissos que não dá para cortar: aluguel, condomínio, impostos, seguros,
 *     empréstimos/financiamentos). O cartão entra PELA CATEGORIA DE CADA COMPRA — não pelo
 *     valor da fatura — então só o que é essencial no cartão conta. Juros/IOF/multa do cartão
 *     e o lançamento "Pagamento Fatura" ficam de fora (seriam contados em dobro / não são custo de vida).
 *  2. Janela: até 12 meses FECHADOS com dados (o mês atual ainda está incompleto).
 *  3. Base mensal = percentil 75 desses meses: cobre 3 de cada 4 meses observados. Mais
 *     prudente que a média para gastos variáveis (cartão), sem ser puxado por um mês atípico.
 *  4. + Compromissos já assumidos: média mensal das parcelas futuras (próximos 6 meses) de
 *     compras/parcelamentos em categorias não essenciais — numa emergência elas continuam vindo.
 *  5. Reserva ideal = base mensal × meses de cobertura conforme a estabilidade da renda
 *     (3 a 12 meses; 6 para renda estável é a recomendação mais comum de educadores financeiros).
 */
window.Fin = window.Fin || {};

Fin.reserva = (() => {
  const F = Fin.finance;
  const fmt = Fin.fmt;
  const S = Fin.storage;
  const N = (v) => Fin.parsers.normalize(v);

  const PERFIS = [
    { meses: 3, nome: 'Duas rendas estáveis', desc: 'casal em que as duas pessoas têm renda fixa' },
    { meses: 6, nome: 'Renda estável', desc: 'CLT ou servidor público — recomendação mais comum' },
    { meses: 9, nome: 'Estável com dependentes', desc: 'uma renda sustentando filhos ou outras pessoas' },
    { meses: 12, nome: 'Renda variável', desc: 'autônomo, comissão, empresário' },
  ];
  /** Compromissos que continuam numa emergência, mesmo marcados como "não essencial". */
  const RE_COMPROMISSO = /\b(emprestimos?|financiamentos?|consorcio|impostos?|iptu|ipva|condominio|seguros?|aluguel|pensao)\b/;
  const RE_ENCARGO = /\b(juros|encargos?|iof|multa|mora|rotativ\w*)\b/;
  const JANELA = 12;
  const MESES_COMPROMISSO = 6;

  const r2 = (v) => Math.round(v * 100) / 100;
  const config = () => ({ meses: 6, essenciais: {}, aporteMensal: null, ...(Fin.inv?.config('reserva') || {}) });
  const salvar = (dados) => Fin.inv.salvarConfig('reserva', dados);

  function percentil(vals, p) {
    if (!vals.length) return 0;
    const v = [...vals].sort((a, b) => a - b);
    const k = (v.length - 1) * p;
    const i = Math.floor(k);
    return v[i] + (v[Math.min(i + 1, v.length - 1)] - v[i]) * (k - i);
  }

  /** Categoria conta como essencial? → { essencial, motivo: 'escolha'|'essencial'|'compromisso'|'' } */
  function classificar(nome, cfg = config()) {
    if (cfg.essenciais && Object.prototype.hasOwnProperty.call(cfg.essenciais, nome)) {
      return { essencial: !!cfg.essenciais[nome], motivo: 'escolha' };
    }
    const cat = F.categorias('despesa').find((c) => c.nome === nome);
    if (/^essencial$/.test(N(cat?.classificacao))) return { essencial: true, motivo: 'essencial' };
    if (RE_COMPROMISSO.test(N(nome))) return { essencial: true, motivo: 'compromisso' };
    return { essencial: false, motivo: '' };
  }

  /** Gasto por categoria no mês: lançamentos (sem fatura/aportes) + compras do cartão pela categoria. */
  function gastosDoMes(ym) {
    const cats = F.catsInvestimento();
    const m = new Map();
    const add = (nome, v, cartao) => {
      const k = nome || 'Sem categoria';
      const c = m.get(k) || { total: 0, cartao: 0 };
      c.total += v;
      if (cartao) c.cartao += v;
      m.set(k, c);
    };
    for (const l of F.doMes(ym)) {
      if (l.tipo !== 'despesa' || F.isPagamentoFatura(l) || F.ehAporte(l, cats)) continue;
      add(l.categoria, F.valor(l), false);
    }
    for (const c of S.list('cartaoCompras')) {
      if (c.fatura !== ym || RE_ENCARGO.test(N(c.descricao))) continue;
      add(c.categoria, c.valor || 0, true);
    }
    return m;
  }

  /**
   * Meses fechados e COMPLETOS (os mais recentes, até 12): com receita lançada e pelo menos
   * metade dos lançamentos de despesa de um mês típico. Evita meses só com compras do cartão
   * (antes de começar a usar o app) ou o mês de início, lançado pela metade.
   */
  function janela() {
    const atual = fmt.currentYM();
    const cont = new Map();
    for (const l of F.lancamentos()) {
      const ym = F.competencia(l);
      if (!ym || ym >= atual) continue;
      const c = cont.get(ym) || { d: 0, r: 0 };
      if (l.tipo === 'receita') c.r++; else c.d++;
      cont.set(ym, c);
    }
    const tipico = percentil([...cont.values()].map((c) => c.d), 0.5);
    let meses = [...cont.entries()].filter(([, c]) => c.r > 0 && c.d >= tipico * 0.5).map(([ym]) => ym);
    if (meses.length < 3) meses = [...cont.keys()];
    return meses.sort().slice(-JANELA);
  }

  function calcular() {
    const cfg = config();
    const meses = janela();
    const porMes = meses.map((ym) => ({ ym, gastos: gastosDoMes(ym) }));
    const nomes = new Set(porMes.flatMap((m) => [...m.gastos.keys()]));
    const categorias = [...nomes].map((nome) => {
      const serie = porMes.map((m) => Math.max(0, m.gastos.get(nome)?.total || 0));
      const cartao = porMes.reduce((s, m) => s + Math.max(0, m.gastos.get(nome)?.cartao || 0), 0);
      const soma = serie.reduce((s, v) => s + v, 0);
      const media = serie.length ? soma / serie.length : 0;
      const dp = serie.length ? Math.sqrt(serie.reduce((s, v) => s + (v - media) ** 2, 0) / serie.length) : 0;
      const cat = F.categorias('despesa').find((c) => c.nome === nome);
      return {
        nome, icone: cat?.icone || '', ...classificar(nome, cfg),
        media: r2(media), mediana: r2(percentil(serie, 0.5)), p75: r2(percentil(serie, 0.75)),
        freq: serie.filter((v) => v > 0).length, variavel: media > 0 && dp / media > 0.35,
        pctCartao: soma > 0 ? cartao / soma : 0,
      };
    }).filter((c) => c.media > 0).sort((a, b) => b.media - a.media);
    const essenciais = new Set(categorias.filter((c) => c.essencial).map((c) => c.nome));

    const mesesInfo = porMes.map(({ ym, gastos }) => {
      let essencial = 0;
      let outros = 0;
      for (const [nome, g] of gastos) {
        const v = Math.max(0, g.total);
        if (essenciais.has(nome)) essencial += v; else outros += v;
      }
      return { ym, essencial: r2(essencial), outros: r2(outros), total: r2(essencial + outros) };
    });
    const ess = mesesInfo.map((m) => m.essencial);
    const p75 = r2(percentil(ess, 0.75));

    // Compromissos já assumidos (parcelas futuras de categorias não essenciais).
    const atual = fmt.currentYM();
    const ate = fmt.addMonths(atual, MESES_COMPROMISSO - 1);
    let futuras = 0;
    for (const c of S.list('cartaoCompras')) {
      if (c.parcela?.total > 1 && c.fatura >= atual && c.fatura <= ate && !essenciais.has(c.categoria) && (c.valor || 0) > 0) futuras += c.valor;
    }
    for (const l of F.lancamentos()) {
      const comp = F.competencia(l);
      if (l.tipo === 'despesa' && l.recorrencia === 'parcelado' && comp >= atual && comp <= ate && !F.isPago(l) && !essenciais.has(l.categoria)) futuras += F.valor(l);
    }
    const compromissos = r2(futuras / MESES_COMPROMISSO);

    const base = r2(p75 + compromissos);
    const mesesAlvo = Number(cfg.meses) || 6;
    const ideal = Math.ceil((base * mesesAlvo) / 100) * 100;
    const minimo = Math.ceil((base * 3) / 100) * 100;

    // Situação atual
    const temInv = !!Fin.inv?.temDados();
    const atualValor = temInv ? (Fin.inv.resumo().porClasse.reserva || 0) : 0;
    const conta = temInv ? Fin.inv.contas().find((c) => c.tipo === 'saldo' && c.classe === 'reserva') || null : null;

    // Capacidade de poupança: mediana da sobra (receitas − despesas) nos meses da janela.
    const sobras = meses.map((ym) => { const r = F.resumo(ym); return r.receitas - r.despesas; });
    const sobraMediana = r2(percentil(sobras, 0.5));
    const sugerido = sobraMediana > 0 ? Math.max(50, Math.round((sobraMediana * 0.5) / 50) * 50) : null;
    const naoEssencialMediana = r2(percentil(mesesInfo.map((m) => m.outros), 0.5));
    const aporte = Number(cfg.aporteMensal) || sugerido || 0;
    const falta = Math.max(0, ideal - atualValor);

    return {
      cfg, perfil: PERFIS.find((p) => p.meses === mesesAlvo) || { meses: mesesAlvo, nome: `${mesesAlvo} meses`, desc: '' },
      meses: mesesInfo, janela: meses.length, categorias,
      media: r2(ess.reduce((s, v) => s + v, 0) / (ess.length || 1)), mediana: r2(percentil(ess, 0.5)), p75,
      totalMedia: r2(mesesInfo.reduce((s, m) => s + m.total, 0) / (mesesInfo.length || 1)),
      compromissos, base, mesesAlvo, ideal, minimo,
      atual: r2(atualValor), conta, cobertura: base > 0 ? atualValor / base : null,
      falta: r2(falta), sobraMediana, sugerido, aporte, naoEssencialMediana, prazo: aporte > 0 && falta > 0 ? Math.ceil(falta / aporte) : 0,
    };
  }

  /** Garante a conta "Reserva de emergência" (conta por saldo, classe reserva). */
  function garantirConta() {
    const c = Fin.inv.contas().find((x) => x.tipo === 'saldo' && x.classe === 'reserva');
    if (c) return c;
    return S.upsert('invContas', { nome: 'Reserva de emergência', tipo: 'saldo', moeda: 'BRL', classe: 'reserva', icone: '🛟', criadoEm: new Date().toISOString() });
  }

  /** Cria ou atualiza a meta "Reserva de emergência" com o valor ideal. */
  function salvarMeta(rv) {
    const m = Fin.inv.metas().find((x) => x.tipo === 'classes' && (x.classes || []).length === 1 && x.classes[0] === 'reserva');
    return S.upsert('invMetas', { ...(m || {}), nome: 'Reserva de emergência', tipo: 'classes', classes: ['reserva'], alvo: rv.ideal, aporteMensal: rv.aporte || null });
  }

  return { calcular, classificar, config, salvar, garantirConta, salvarMeta, PERFIS, percentil };
})();
