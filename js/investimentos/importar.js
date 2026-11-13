/**
 * investimentos/importar.js — Importa o histórico de investimentos.
 *
 *  1. Investidor 10 (arquivo .json gerado uma vez a partir da sua conta): todas as operações
 *     desde 2019, proventos, preços atuais e o patrimônio mês a mês.
 *     B3 → conta Rico · US$ → conta Nomad · cripto → conta Cripto. Câmbio das operações em
 *     dólar = PTAX de venda do dia. Proventos do Investidor 10 já vêm em reais.
 *  2. Extratos mensais da Nomad (PDF): nos meses que os extratos cobrem, as compras, vendas e
 *     proventos da Nomad passam a ser os do extrato (substituem os do Investidor 10). No fim,
 *     compara a quantidade de cada ativo com a carteira do último extrato e oferece o ajuste.
 *
 * Tudo é montado numa cópia e só grava depois da conferência ("Importar").
 * Reimportar não duplica: cada operação guarda a origem (ext).
 */
window.Fin = window.Fin || {};

Fin.importarInv = (() => {
  const S = Fin.storage;
  const fmt = Fin.fmt;
  const esc = fmt.esc;
  const N = (v) => Fin.parsers.normalize(v);
  const agora = () => new Date().toISOString();
  const clone = (x) => JSON.parse(JSON.stringify(x));

  const CLASSE_I10 = { 'Ações': 'acao', FIIs: 'fii', ETFs: 'etf-br', BDRs: 'bdr', Stocks: 'stock', Reits: 'reit', 'ETFs Intern.': 'etf', Criptomoedas: 'cripto', 'Fiagros': 'fii' };
  const SUBTIPO = (t) => (/jscp|jcp|juros/i.test(t) ? 'jcp' : /rend/i.test(t) ? 'rendimento' : /divid/i.test(t) ? 'dividendo' : 'outro');

  /* ---------------- Estado em memória ---------------- */

  function base() {
    return { contas: clone(S.list('invContas')), ativos: clone(S.list('invAtivos')), movs: clone(S.list('invMovs')), hist: clone(S.list('invHist')) };
  }

  function conta(est, nome, dados) {
    let c = est.contas.find((k) => N(k.nome) === N(nome));
    if (!c) { c = { id: S.uid(), criadoEm: agora(), nome, ...dados }; est.contas.push(c); }
    return c;
  }

  function ativo(est, contaId, ticker, classe, moeda) {
    const t = ticker.toUpperCase();
    let a = est.ativos.find((x) => x.conta === contaId && x.ticker === t);
    if (!a) { a = { id: S.uid(), criadoEm: agora(), conta: contaId, ticker: t, nome: null, classe, moeda, preco: null, precoEm: null }; est.ativos.push(a); }
    return a;
  }

  /** Quantidade de cada ativo até a data (mesmas regras do motor da carteira). */
  function quantidades(est, ate = '9999-12-31') {
    const q = new Map();
    const lista = est.movs.filter((m) => m.ativo && !m.substituido && (m.data || '') <= ate)
      .sort((a, b) => (a.data || '').localeCompare(b.data || '') || (a.criadoEm || '').localeCompare(b.criadoEm || ''));
    for (const m of lista) {
      let v = q.get(m.ativo) || 0;
      const n = Number(m.qtd) || 0;
      if (m.tipo === 'compra' || m.tipo === 'inicial' || m.tipo === 'bonificacao') v += n;
      else if (m.tipo === 'venda') v = v - n < 0.0001 ? 0 : v - n; // sobra mínima de venda = zerado (igual ao motor)
      else if (m.tipo === 'desdobramento' && m.fator > 0) v *= m.fator;
      else if (m.tipo === 'grupamento' && m.fator > 0) v /= m.fator;
      else if (m.tipo === 'ajuste') v = Math.max(0, v + n);
      q.set(m.ativo, v < 1e-9 ? 0 : v);
    }
    return q;
  }

  /* ---------------- Investidor 10 ---------------- */

  async function planoI10(dados, est, aviso) {
    if (dados?.fonte !== 'investidor10' || !Array.isArray(dados.operacoes)) throw new Error('Este arquivo não é a exportação do Investidor 10.');
    const col = (nome) => Object.fromEntries(dados.colunas[nome].map((c, i) => [c, i]));
    const o = col('operacoes');
    const pv = col('proventos');
    const ps = col('posicoes');
    const pt = col('patrimonio');
    const r = { compras: 0, vendas: 0, eventos: 0, bonificacoes: 0, conversoes: 0, proventos: 0, jaExistiam: 0, ignorados: [], fotos: 0, precos: 0 };
    const C = {
      rico: conta(est, 'Rico', { tipo: 'corretora', moeda: 'BRL', icone: '🏦' }),
      nomad: conta(est, 'Nomad', { tipo: 'corretora', moeda: 'USD', icone: '🌎' }),
      cripto: null,
    };
    const contaPara = (classe, moeda) => (classe === 'cripto'
      ? (C.cripto = C.cripto || conta(est, 'Cripto', { tipo: 'corretora', moeda: 'BRL', icone: '🪙' }))
      : moeda === 'USD' ? C.nomad : C.rico);
    const ja = new Set(est.movs.map((m) => m.ext).filter(Boolean));

    // PTAX de todo o período das operações em dólar (uma consulta).
    const datasUSD = dados.operacoes.filter((x) => x[o.moeda] === 'USD').map((x) => x[o.data]).sort();
    let ptax = null;
    if (datasUSD.length) {
      aviso('Buscando o dólar (PTAX) das datas das operações…');
      ptax = await Fin.cotacoes.ptaxSerie(datasUSD[0], datasUSD[datasUSD.length - 1]);
    }

    aviso('Montando as operações…');
    for (const x of dados.operacoes) {
      const ext = `i10:${x[o.id]}`;
      if (ja.has(ext)) { r.jaExistiam++; continue; }
      const classe = CLASSE_I10[x[o.classe]] || 'outro';
      const moeda = x[o.moeda] === 'USD' ? 'USD' : 'BRL';
      const c = contaPara(classe, moeda);
      const a = ativo(est, c.id, x[o.ticker], classe, c.moeda);
      const m = { id: S.uid(), criadoEm: agora(), conta: c.id, ativo: a.id, data: x[o.data], origem: 'i10', ext, taxas: 0 };
      const tipo = x[o.tipo];
      const fonte = N(x[o.fonte]);
      if (/desdobr|grupam|inplit|split/i.test(tipo) && x[o.de] && x[o.para]) {
        Object.assign(m, x[o.para] >= x[o.de] ? { tipo: 'desdobramento', fator: x[o.para] / x[o.de] } : { tipo: 'grupamento', fator: x[o.de] / x[o.para] });
        r.eventos++;
      } else if (/compra/i.test(tipo) && fonte.startsWith('bonus')) {
        Object.assign(m, { tipo: 'bonificacao', qtd: x[o.qtd], preco: x[o.preco] });
        r.bonificacoes++;
      } else if (/compra|venda/i.test(tipo)) {
        Object.assign(m, { tipo: /compra/i.test(tipo) ? 'compra' : 'venda', qtd: x[o.qtd], preco: x[o.preco] });
        if (fonte.startsWith('conversao')) { m.conv = `i10c:${x[o.info]}`; r.conversoes++; } else if (m.tipo === 'compra') r.compras++; else r.vendas++;
      } else {
        r.ignorados.push(`${x[o.data]} ${x[o.ticker]} ${tipo}`);
        continue;
      }
      if (!(m.qtd > 0) && m.qtd !== undefined) { r.ignorados.push(`${x[o.data]} ${x[o.ticker]} ${tipo} (quantidade 0)`); continue; }
      if (moeda === 'USD' && m.qtd !== undefined && ptax) m.cambio = ptax(m.data);
      est.movs.push(m);
    }

    for (const x of dados.proventos || []) {
      const ext = `i10p:${x[pv.id]}`;
      if (ja.has(ext)) { r.jaExistiam++; continue; }
      const liquido = Number(x[pv.liquido]);
      if (!(liquido > 0) || !x[pv.dataPagamento]) continue;
      const classe = CLASSE_I10[x[pv.categoria]] || (x[pv.pais] === 'US' ? 'stock' : 'acao');
      const c = contaPara(classe, x[pv.pais] === 'US' || ['stock', 'reit', 'etf'].includes(classe) ? 'USD' : 'BRL');
      const a = ativo(est, c.id, x[pv.ticker], classe, c.moeda);
      est.movs.push({ id: S.uid(), criadoEm: agora(), conta: c.id, ativo: a.id, tipo: 'provento', data: x[pv.dataPagamento], valor: Math.round(liquido * 100) / 100, moedaValor: 'BRL', subtipo: SUBTIPO(x[pv.tipo]), origem: 'i10', ext });
      r.proventos++;
    }

    // Preços atuais e conferência das quantidades com as posições do Investidor 10.
    const dataArq = (dados.geradoEm || agora()).slice(0, 10);
    const qtds = quantidades(est);
    const diffs = [];
    const vistos = new Set();
    for (const x of dados.posicoes || []) {
      const t = x[ps.ticker];
      const a = est.ativos.find((k) => k.ticker === t && [C.rico.id, C.nomad.id, C.cripto?.id].includes(k.conta));
      if (!a) { diffs.push({ ticker: t, app: 0, ref: Number(x[ps.qtd]) }); continue; }
      vistos.add(a.id);
      if (Number(x[ps.precoAtual]) > 0) { a.preco = Number(x[ps.precoAtual]); a.precoEm = dataArq; r.precos++; }
      const app = qtds.get(a.id) || 0;
      const ref = Number(x[ps.qtd]);
      if (Math.abs(app - ref) > Math.max(0.0001, ref * 0.001)) diffs.push({ ativo: a.id, ticker: t, app, ref, preco: a.preco, data: dataArq });
    }
    for (const a of est.ativos) {
      const q = qtds.get(a.id) || 0;
      if (q > 0.0001 && !vistos.has(a.id) && [C.rico.id, C.nomad.id].includes(a.conta)) diffs.push({ ativo: a.id, ticker: a.ticker, app: q, ref: 0, preco: a.preco, data: dataArq });
    }
    // Se a Nomad já foi conferida pelos extratos, o Investidor 10 (desatualizado lá) não serve de referência.
    if (est.movs.some((m) => m.conta === C.nomad.id && m.origem === 'nomad')) {
      for (let i = diffs.length - 1; i >= 0; i--) if (contaDoAtivo(est, diffs[i].ativo) === C.nomad.id) diffs.splice(i, 1);
    }

    // Patrimônio mês a mês (vira o histórico de rentabilidade).
    const atual = fmt.currentYM();
    for (const x of dados.patrimonio || []) {
      const [mm, aa] = String(x[pt.mes]).split('/');
      const ym = `20${aa}-${mm}`;
      const pat = Number(x[pt.patrimonio]);
      if (!(pat > 0) || ym >= atual) continue;
      const i = est.hist.findIndex((h) => h.id === ym);
      if (i >= 0 && est.hist[i].informado && est.hist[i].fonte !== 'i10') continue; // não sobrescreve o que você digitou
      const rm = dados.rentabilidadeMensal?.[ym];
      const foto = { id: ym, patrimonio: Math.round(pat * 100) / 100, investido: Math.round(Number(x[pt.aplicado]) * 100) / 100, manual: true, informado: true, fonte: 'i10', em: dataArq, rentI10: rm != null ? rm / 100 : null };
      if (i >= 0) est.hist[i] = { ...est.hist[i], ...foto }; else est.hist.push(foto);
      r.fotos++;
    }
    // Meses em que o Investidor 10 tem rentabilidade mas não tem patrimônio: guarda só a rentabilidade.
    for (const [ym, v] of Object.entries(dados.rentabilidadeMensal || {})) {
      if (ym >= atual || est.hist.some((h) => h.id === ym)) continue;
      est.hist.push({ id: ym, patrimonio: null, investido: null, manual: false, informado: false, fonte: 'i10', em: dataArq, rentI10: v / 100 });
    }
    return { ...r, diffs };
  }

  /* ---------------- Extratos da Nomad ---------------- */

  async function planoNomad(extratos, est, aviso) {
    const nomad = conta(est, 'Nomad', { tipo: 'corretora', moeda: 'USD', icone: '🌎' });
    extratos.sort((a, b) => a.inicio.localeCompare(b.inicio));
    const meses = new Set(extratos.map((e) => e.inicio.slice(0, 7)));
    const cobre = (d) => meses.has((d || '').slice(0, 7));
    const r = { extratos: extratos.length, meses: [...meses].sort(), faltando: [], compras: 0, vendas: 0, proventos: 0, removidos: 0, duplicados: 0, ignorados: [] };
    for (let m = r.meses[0]; m <= r.meses[r.meses.length - 1]; m = fmt.addMonths(m, 1)) if (!meses.has(m)) r.faltando.push(m);

    // Antes de trocar: o que o Investidor 10 achava que havia na Nomad no fim de cada mês
    // (para corrigir o patrimônio mensal dele quando divergir do extrato).
    const ativosNomad = new Map(est.ativos.filter((a) => a.conta === nomad.id).map((a) => [a.id, a.ticker]));
    const visaoI10 = extratos.map((e) => {
      const q = quantidades(est, e.fim);
      const porTicker = {};
      for (const [id, t] of ativosNomad) if ((q.get(id) || 0) > 0.0001) porTicker[t] = q.get(id);
      return porTicker;
    });

    // Nos meses cobertos, o extrato manda. As do Investidor 10 ficam guardadas como "substituídas"
    // (assim reimportar o Investidor 10 não as traz de volta); as de importação anterior de extrato saem.
    const alvo = (m) => m.conta === nomad.id && ['compra', 'venda', 'provento'].includes(m.tipo) && cobre(m.data);
    est.movs = est.movs.filter((m) => !(alvo(m) && m.origem === 'nomad'));
    for (const m of est.movs) if (alvo(m) && m.origem === 'i10' && !m.substituido) { m.substituido = true; r.removidos++; }

    const datas = extratos.flatMap((e) => [...e.operacoes.map((x) => x.data), ...e.proventos.map((x) => x.data)]).sort();
    aviso('Buscando o dólar (PTAX) das datas dos extratos…');
    const ptax = datas.length ? await Fin.cotacoes.ptaxSerie(datas[0], datas[datas.length - 1]) : () => null;

    const descricoes = new Map();
    for (const e of extratos) for (const c of e.carteira) descricoes.set(c.simbolo, c.descricao);
    const ativoNomad = (sim, desc) => {
      const ex = est.ativos.find((a) => a.conta === nomad.id && a.ticker === sim);
      return ex || ativo(est, nomad.id, sim, Fin.nomad.classePelaDescricao(desc || descricoes.get(sim)), 'USD');
    };
    const vistos = new Set();
    const diasEntre = (a, b) => Math.abs(new Date(a) - new Date(b)) / 86400000;

    for (const e of extratos) {
      for (const op of e.operacoes) {
        const chave = `${op.tipo}|${op.data}|${op.simbolo}|${op.qtd}|${op.preco}`;
        if (vistos.has(chave)) { r.duplicados++; continue; }
        vistos.add(chave);
        const a = ativoNomad(op.simbolo, op.descricao);
        if (!cobre(op.data)) { // operação de um mês sem extrato (ex.: pendente que liquidou depois): evita repetir a do Investidor 10
          const igual = est.movs.find((m) => !m.substituido && m.ativo === a.id && m.tipo === op.tipo && Math.abs((m.qtd || 0) - op.qtd) < 0.0002 && diasEntre(m.data, op.data) <= 4);
          if (igual) { r.duplicados++; continue; }
        }
        est.movs.push({ id: S.uid(), criadoEm: agora(), conta: nomad.id, ativo: a.id, tipo: op.tipo, data: op.data, qtd: op.qtd, preco: op.preco, taxas: Math.round((op.taxas || 0) * 100) / 100, cambio: ptax(op.data), origem: 'nomad', ext: `nomad:${chave}` });
        if (op.tipo === 'compra') r.compras++; else r.vendas++;
      }
      for (const p of e.proventos) {
        const chave = `div|${p.data}|${p.simbolo}|${p.valor}`;
        if (vistos.has(chave)) { r.duplicados++; continue; }
        vistos.add(chave);
        const a = ativoNomad(p.simbolo, p.descricao);
        est.movs.push({ id: S.uid(), criadoEm: agora(), conta: nomad.id, ativo: a.id, tipo: 'provento', subtipo: 'dividendo', data: p.data, valor: p.valor, cambio: ptax(p.data), origem: 'nomad', ext: `nomad:${chave}` });
        r.proventos++;
      }
      for (const x of e.outros) if (!/^(SWEEP|TRANSFER|DEPOSIT|WITHDRAWAL|MERGER)$/.test(x.tipo)) r.ignorados.push(`${x.data} ${x.tipo} ${x.simbolo || ''} ${x.valor ?? ''}`);
    }

    // Conferência com a carteira do último extrato.
    const ult = extratos[extratos.length - 1];
    const qtds = quantidades(est, ult.fim);
    const diffs = [];
    const naCarteira = new Set();
    for (const c of ult.carteira) {
      const a = ativoNomad(c.simbolo, c.descricao);
      naCarteira.add(a.id);
      if (!a.preco || (a.precoEm || '') < ult.fim) { a.preco = c.preco; a.precoEm = ult.fim; }
      const app = qtds.get(a.id) || 0;
      if (Math.abs(app - c.qtd) > Math.max(0.00002, c.qtd * 0.0005)) diffs.push({ ativo: a.id, ticker: c.simbolo, app, ref: c.qtd, preco: c.preco });
    }
    for (const a of est.ativos.filter((x) => x.conta === nomad.id)) {
      const q = qtds.get(a.id) || 0;
      if (q > 0.00002 && !naCarteira.has(a.id)) diffs.push({ ativo: a.id, ticker: a.ticker, app: q, ref: 0, preco: a.preco });
    }
    r.ultimo = { fim: ult.fim, posicoes: ult.carteira.length, valor: ult.carteira.reduce((s, c) => s + c.valor, 0) };

    // Patrimônio mensal vindo do Investidor 10: onde a carteira dele divergir do extrato (ex.: vendas que
    // ele não registrou), troca a parte Nomad pelo valor real do extrato (US$ × PTAX do fim do mês).
    r.mesesCorrigidos = [];
    r.correcoes = [];
    const ultimoPreco = {};
    const ptaxFim = ptax;
    extratos.forEach((e, i) => {
      for (const c of e.carteira) ultimoPreco[c.simbolo] = c.preco;
      const ym = e.inicio.slice(0, 7);
      const foto = est.hist.find((h) => h.id === ym && h.fonte === 'i10');
      if (!foto) return;
      const real = e.carteira.reduce((s, c) => s + c.valor, 0);
      const doI10 = Object.entries(visaoI10[i]).reduce((s, [t, q]) => s + q * (ultimoPreco[t] || 0), 0);
      if (!real || Math.abs(doI10 - real) / real <= 0.02) return;
      const fx = ptaxFim(e.fim) || 0;
      const b3 = Math.max(0, foto.patrimonio - doI10 * fx);
      Object.assign(foto, { patrimonio: Math.round((b3 + real * fx) * 100) / 100, manual: false, investido: null, fonte: 'i10+nomad', rentI10: null });
      r.mesesCorrigidos.push(ym);
      r.correcoes.push({ ym, fim: e.fim, nomadBRL: real * fx, contaNomad: nomad.id });
    });
    return { ...r, diffs, contaNomad: nomad.id };
  }

  /* ---------------- Notas de negociação da Rico ---------------- */

  const chaveEsp = (e) => N(e).replace(/\s+/g, ' ').trim();

  /** Descobre o ticker de cada negócio: nota → nome já confirmado → mesma operação no app → prefixo. */
  function resolverRico(notas, est) {
    const rico = conta(est, 'Rico', { tipo: 'corretora', moeda: 'BRL', icone: '🏦' });
    const memoria = Fin.inv.config('ricoNomes')?.mapa || {};
    const ativosRico = est.ativos.filter((a) => a.conta === rico.id);
    const tickerDe = (id) => est.ativos.find((a) => a.id === id)?.ticker;
    const linhas = [];
    notas.forEach((n, ni) => {
      for (const g of n.negocios) {
        let ticker = g.ticker;
        let como = ticker ? 'nota' : null;
        if (!ticker && g.especificacao && memoria[chaveEsp(g.especificacao)]) { ticker = memoria[chaveEsp(g.especificacao)]; como = 'lembrado'; }
        if (!ticker) {
          const cands = new Set(est.movs.filter((m) => !m.substituido && m.conta === rico.id && m.data === n.data && m.tipo === g.tipo && Math.abs((m.preco || 0) - g.preco) < 0.006).map((m) => tickerDe(m.ativo)));
          if (cands.size === 1) { ticker = [...cands][0]; como = 'app'; }
        }
        if (!ticker) {
          const palavras = (g.especificacao || '').split(' ').filter((w) => /^[A-Z]{4}$/.test(w));
          const achado = ativosRico.find((a) => palavras.some((w) => a.ticker.startsWith(w)));
          if (achado) { ticker = achado.ticker; como = 'prefixo'; }
        }
        linhas.push({ ni, g, ticker, como });
      }
    });
    return { rico: rico.id, linhas, pendentes: linhas.filter((l) => !l.ticker).length };
  }

  /** Grava (na cópia) as operações das notas: soma por dia/ativo/tipo, rateia as taxas e substitui as do Investidor 10. */
  function aplicarRico(est, notas, res) {
    const r = { novos: 0, substituidos: 0, jaExistiam: 0, taxas: 0 };
    const ja = new Set(est.movs.map((m) => m.ext).filter(Boolean));
    const grupos = new Map();
    for (const l of res.linhas) {
      const n = notas[l.ni];
      const totalNota = n.negocios.reduce((s, g) => s + g.valor, 0) || 1;
      const k = `${n.numero}|${n.data}|${l.ticker}|${l.g.tipo}`;
      const gr = grupos.get(k) || { n, ticker: l.ticker, tipo: l.g.tipo, qtd: 0, valor: 0, taxas: 0 };
      gr.qtd += l.g.qtd; gr.valor += l.g.valor; gr.taxas += n.taxas * (l.g.valor / totalNota);
      grupos.set(k, gr);
    }
    for (const gr of grupos.values()) {
      const ext = `nota:${gr.n.numero}:${gr.ticker}:${gr.tipo}`;
      if (ja.has(ext)) { r.jaExistiam++; continue; }
      const a = ativo(est, res.rico, gr.ticker, Fin.inv.sugerirClasse(gr.ticker, { moeda: 'BRL' }), 'BRL');
      for (const m of est.movs) {
        if (!m.substituido && m.ativo === a.id && m.tipo === gr.tipo && m.data === gr.n.data && m.origem !== 'nota') { m.substituido = true; r.substituidos++; }
      }
      const taxas = Math.round(gr.taxas * 100) / 100;
      est.movs.push({ id: S.uid(), criadoEm: agora(), conta: res.rico, ativo: a.id, tipo: gr.tipo, data: gr.n.data, qtd: gr.qtd, preco: Math.round((gr.valor / gr.qtd) * 1e6) / 1e6, taxas, origem: 'nota', ext, obs: `Nota ${gr.n.numero}` });
      r.novos++; r.taxas += taxas;
    }
    return r;
  }

  /* ---------------- Gravar ---------------- */

  function aplicar(est, ajustes = [], correcoes = []) {
    for (const d of ajustes) {
      const nomadId = est.contas.find((c) => N(c.nome) === 'nomad')?.id;
      const contaId = est.ativos.find((a) => a.id === d.ativo)?.conta;
      est.movs.push({
        id: S.uid(), criadoEm: agora(), conta: contaId, ativo: d.ativo, tipo: 'ajuste', data: d.data, qtd: Math.round((d.ref - d.app) * 1e8) / 1e8, preco: d.preco || 0,
        origem: contaId === nomadId ? 'nomad' : 'i10',
        obs: contaId === nomadId ? `Ajuste para bater com o extrato de ${fmt.monthShort(d.data.slice(0, 7))}` : 'Ajuste para bater com o Investidor 10 (ativo sem lançamento de saída)',
      });
    }
    S.set('invContas', est.contas);
    S.set('invAtivos', est.ativos);
    S.set('invMovs', est.movs);
    S.set('invHist', est.hist);
    // Meses corrigidos pelo extrato: parte B3 = posições da B3 naquele fim de mês (pelo preço atual
    // conhecido — a B3 é pequena perto da Nomad; melhor que a sobra do total do Investidor 10).
    if (correcoes.length) {
      const hist = S.list('invHist').map((h) => {
        const c = correcoes.find((k) => k.ym === h.id);
        if (!c) return h;
        const b3 = Fin.inv.posicoes(c.fim).filter((p) => p.qtd > 0 && p.ativo.conta !== c.contaNomad).reduce((s, p) => s + p.valor, 0);
        return { ...h, patrimonio: Math.round((b3 + c.nomadBRL) * 100) / 100 };
      });
      S.set('invHist', hist);
    }
    Fin.inv.garantirCategoria();
  }

  /* ---------------- Tela (janela) ---------------- */

  function abrir() {
    const panel = Fin.ui.openModal(`
      <form novalidate>
        <div class="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 class="font-semibold text-lg">Importar investimentos</h2>
          <button type="button" data-close class="icon-btn" aria-label="Fechar">✕</button>
        </div>
        <div class="px-5 py-4 space-y-4" data-corpo>
          <label class="field"><span>Investidor 10 (arquivo <b>investidor10.json</b>)</span>
            <input type="file" name="i10" accept=".json,application/json" class="input"></label>
          <label class="field"><span>Extratos mensais da Nomad (PDF — pode escolher vários)</span>
            <input type="file" name="nomad" accept="application/pdf,.pdf" multiple class="input"></label>
          <label class="field"><span>Notas de negociação da Rico (PDF — pode escolher várias)</span>
            <input type="file" name="rico" accept="application/pdf,.pdf" multiple class="input"></label>
          <label class="field"><span>Senha dos PDFs da Rico</span>
            <input type="password" name="senhaRico" class="input" autocomplete="off" placeholder="Só se escolher notas da Rico — não fica guardada"></label>
          <p class="text-xs text-slate-500">Nada é gravado antes da conferência. Os arquivos são lidos neste aparelho e não vão para nenhum servidor.
            Reimportar não duplica.</p>
          <p data-status class="text-sm text-slate-600"></p>
          <p data-erro class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>
        </div>
        <div class="flex items-center gap-2 px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
          <span class="flex-1"></span>
          <button type="button" data-close class="btn btn-ghost">Cancelar</button>
          <button type="submit" class="btn btn-primary" data-ok>Ler arquivos</button>
        </div>
      </form>`, 'Importar investimentos');
    panel.closest('.modal-panel').classList.add('sm:!max-w-2xl');
    panel.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', Fin.ui.closeModal));
    const form = panel.querySelector('form');
    const status = (t) => { form.querySelector('[data-status]').textContent = t; };
    const erro = (t) => { const e = form.querySelector('[data-erro]'); e.textContent = t; e.classList.remove('hidden'); };
    let plano = null;

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (plano) return gravar();
      const fI10 = form.elements.i10.files[0];
      const fNomad = [...form.elements.nomad.files];
      const fRico = [...form.elements.rico.files];
      if (!fI10 && !fNomad.length && !fRico.length) return erro('Escolha o arquivo do Investidor 10, os extratos da Nomad e/ou as notas da Rico.');
      const ok = form.querySelector('[data-ok]');
      ok.disabled = true;
      try {
        const est = base();
        const res = {};
        if (fI10) {
          status('Lendo o arquivo do Investidor 10…');
          let dados;
          try { dados = JSON.parse(await fI10.text()); } catch { throw new Error('O arquivo do Investidor 10 não pôde ser lido (JSON inválido).'); }
          res.i10 = await planoI10(dados, est, status);
        }
        if (fNomad.length) {
          const extratos = [];
          for (const [i, f] of fNomad.entries()) {
            status(`Lendo extrato ${i + 1} de ${fNomad.length}: ${f.name}…`);
            extratos.push(await Fin.nomad.ler(f));
          }
          res.nomad = await planoNomad(extratos, est, status);
          // Com os extratos, a Nomad é conferida por eles (não pelo Investidor 10).
          if (res.i10) res.i10.diffs = res.i10.diffs.filter((d) => contaDoAtivo(est, d.ativo) !== res.nomad.contaNomad);
        }
        if (fRico.length) {
          const senha = form.elements.senhaRico.value;
          const notas = [];
          for (const [i, f] of fRico.entries()) {
            status(`Lendo nota ${i + 1} de ${fRico.length}: ${f.name}…`);
            notas.push(await Fin.rico.ler(f, senha));
          }
          notas.sort((a, b) => a.data.localeCompare(b.data));
          res.rico = { notas, ...resolverRico(notas, est) };
        }
        plano = { est, res };
        status('');
        mostrar();
        ok.textContent = 'Importar';
      } catch (e) {
        console.error(e);
        erro(e.message || String(e));
        status('');
      } finally {
        ok.disabled = false;
      }
    });

    function mostrar() {
      const { res } = plano;
      const lin = (rot, v) => `<div class="flex justify-between gap-3"><span class="text-slate-500">${rot}</span><span class="tabular-nums">${v}</span></div>`;
      const tabDiffs = (diffs, origem, rotRef) => (diffs.length ? `
        <div class="table-wrap max-h-64 overflow-auto border border-slate-100 rounded-lg"><table class="w-full"><thead><tr>
          <th>Ajustar</th><th>Ativo</th><th class="text-right">No app</th><th class="text-right">${rotRef}</th></tr></thead>
          <tbody>${diffs.map((d, i) => `<tr><td>${d.ativo ? `<input type="checkbox" data-ajuste="${origem}:${i}" class="accent-emerald-600" checked aria-label="Ajustar ${esc(d.ticker)}">` : ''}</td>
            <td class="font-medium">${esc(d.ticker)}</td><td class="num">${fmt.qtd(d.app)}</td><td class="num">${fmt.qtd(d.ref)}</td></tr>`).join('')}</tbody></table></div>`
        : '<p class="text-sm text-emerald-700">✓ Todas as quantidades conferem.</p>');
      const corpo = form.querySelector('[data-corpo]');
      corpo.innerHTML = `
        ${res.i10 ? `<section class="space-y-2"><h3 class="font-semibold">Investidor 10</h3>
          <div class="text-sm bg-slate-50 rounded-xl p-3 space-y-0.5">
            ${lin('Compras', res.i10.compras)}${lin('Vendas', res.i10.vendas)}${lin('Bonificações', res.i10.bonificacoes)}
            ${lin('Desdobramentos/grupamentos', res.i10.eventos)}${lin('Conversões (incorporações)', res.i10.conversoes / 2)}
            ${lin('Proventos', res.i10.proventos)}${lin('Meses de patrimônio', res.i10.fotos)}${lin('Preços atuais', res.i10.precos)}
            ${res.i10.jaExistiam ? lin('Já importados antes (ignorados)', res.i10.jaExistiam) : ''}
            ${res.i10.ignorados.length ? lin('Não entendidos', res.i10.ignorados.length) : ''}
          </div>
          <p class="text-xs text-slate-500">Conferência com as posições atuais do Investidor 10 (B3). Diferença costuma ser ativo que saiu da bolsa (OPA, recuperação judicial) sem lançamento — marcado = zerar/igualar com um <b>ajuste</b> (sem lucro/prejuízo).</p>
          ${tabDiffs(res.i10.diffs, 'i10', 'No Investidor 10')}</section>` : ''}
        ${res.nomad ? `<section class="space-y-2"><h3 class="font-semibold">Extratos da Nomad</h3>
          <div class="text-sm bg-slate-50 rounded-xl p-3 space-y-0.5">
            ${lin('Extratos', `${res.nomad.extratos} (${res.nomad.meses.map((m) => fmt.monthShort(m)).join(', ')})`)}
            ${res.nomad.faltando.length ? `<div class="text-amber-800">! Falta o extrato de ${res.nomad.faltando.map((m) => fmt.monthShort(m)).join(', ')} — as operações desse mês continuam as do Investidor 10.</div>` : ''}
            ${lin('Compras', res.nomad.compras)}${lin('Vendas', res.nomad.vendas)}${lin('Proventos (US$, líquidos)', res.nomad.proventos)}
            ${lin('Substituídos do Investidor 10 nesses meses', res.nomad.removidos)}
            ${res.nomad.duplicados ? lin('Repetidos ignorados (pendentes etc.)', res.nomad.duplicados) : ''}
            ${lin(`Carteira em ${fmt.date(res.nomad.ultimo.fim)}`, `${res.nomad.ultimo.posicoes} ativos · ${fmt.moeda(res.nomad.ultimo.valor, 'USD')}`)}
            ${res.nomad.mesesCorrigidos.length ? `<div class="text-slate-600">Patrimônio do Investidor 10 corrigido pelo extrato em ${res.nomad.mesesCorrigidos.map((m) => fmt.monthShort(m)).join(', ')} (vendas que ele não tinha).</div>` : ''}
          </div>
          <p class="text-xs text-slate-500">Quantidade no app × carteira do último extrato. Marcados = lançar um <b>ajuste</b> para igualar (sem lucro/prejuízo).</p>
          ${tabDiffs(res.nomad.diffs, 'nomad', 'No extrato')}</section>` : ''}
        ${res.rico ? `<section class="space-y-2"><h3 class="font-semibold">Notas da Rico</h3>
          <div class="text-sm bg-slate-50 rounded-xl p-3 space-y-0.5">
            ${lin('Notas', `${res.rico.notas.length} (${fmt.date(res.rico.notas[0].data)} a ${fmt.date(res.rico.notas[res.rico.notas.length - 1].data)})`)}
            ${lin('Negócios', res.rico.linhas.length)}
            ${lin('Taxas (rateadas no preço médio)', fmt.brl(res.rico.notas.reduce((s, n) => s + n.taxas, 0)))}
            <div class="text-slate-600">As operações do mesmo dia e ativo que vieram do Investidor 10 (sem taxas) serão trocadas pelas da nota.</div>
          </div>
          <div class="table-wrap max-h-72 overflow-auto border border-slate-100 rounded-lg"><table class="w-full"><thead><tr>
            <th>Data</th><th>C/V</th><th>Na nota</th><th class="text-right">Qtd × preço</th><th>Ativo</th></tr></thead>
            <tbody>${res.rico.linhas.map((l, i) => `<tr>
              <td class="tabular-nums">${fmt.date(res.rico.notas[l.ni].data).slice(0, 5)}</td><td>${l.g.tipo === 'compra' ? 'C' : 'V'}</td>
              <td class="!whitespace-normal text-[12px]">${esc(l.g.especificacao || '(sem nome no PDF)')}</td>
              <td class="num">${fmt.qtd(l.g.qtd)} × ${fmt.brl(l.g.preco)}</td>
              <td><input data-rico="${i}" class="input !py-1 !w-28 uppercase ${l.ticker ? '' : '!border-amber-500'}" value="${esc(l.ticker || '')}" placeholder="TICKER" aria-label="Ticker"
                list="rico-tickers"><span class="block text-[11px] text-slate-400">${{ nota: 'da nota', lembrado: 'lembrado', app: 'pela operação no app', prefixo: 'pelo nome' }[l.como] || '! informe'}</span></td></tr>`).join('')}</tbody></table></div>
          <datalist id="rico-tickers">${[...new Set(plano.est.ativos.filter((a) => a.conta === res.rico.rico).map((a) => a.ticker))].sort().map((t) => `<option value="${esc(t)}"></option>`).join('')}</datalist>
          ${res.rico.pendentes ? `<p class="text-sm text-amber-800">! ${res.rico.pendentes} negócio(s) sem ativo identificado — informe o ticker (o app lembra nas próximas notas).</p>` : ''}</section>` : ''}
        <p data-erro class="hidden text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2" role="alert"></p>`;
    }

    function gravar() {
      const { est, res } = plano;
      const ajustes = [...form.querySelectorAll('[data-ajuste]:checked')].map((c) => {
        const [origem, i] = c.dataset.ajuste.split(':');
        return origem === 'nomad' ? { ...res.nomad.diffs[Number(i)], data: res.nomad.ultimo.fim } : { ...res.i10.diffs[Number(i)] };
      });
      if (res.rico) {
        const vazios = [];
        form.querySelectorAll('[data-rico]').forEach((inp) => {
          const t = inp.value.trim().toUpperCase().replace(/F$/, '');
          const l = res.rico.linhas[Number(inp.dataset.rico)];
          if (!/^[A-Z]{4}\d{1,2}[A-Z]?$/.test(t)) vazios.push(l.g.especificacao || `${l.g.qtd} × ${l.g.preco}`);
          else { if (l.ticker !== t) l.como = 'usuario'; l.ticker = t; }
        });
        if (vazios.length) return erro(`Informe o ticker de: ${vazios.slice(0, 3).join(', ')}${vazios.length > 3 ? '…' : ''}`);
        res.rico.resultado = aplicarRico(est, res.rico.notas, res.rico);
      }
      try {
        aplicar(est, ajustes, res.nomad?.correcoes || []);
        if (res.rico) { // lembra os nomes → ticker para as próximas notas
          const mapa = { ...(Fin.inv.config('ricoNomes')?.mapa || {}) };
          for (const l of res.rico.linhas) if (l.g.especificacao && !l.g.ticker) mapa[chaveEsp(l.g.especificacao)] = l.ticker;
          Fin.inv.salvarConfig('ricoNomes', { mapa });
        }
      } catch (e) {
        return erro(e.message || String(e));
      }
      Fin.ui.closeModal();
      const rr = res.rico?.resultado;
      Fin.ui.toast(`Importação concluída${ajustes.length ? ` · ${ajustes.length} ajuste(s)` : ''}${rr ? ` · notas: ${rr.novos} operação(ões), ${rr.substituidos} trocada(s), taxas ${fmt.brl(rr.taxas)}` : ''}.`);
      Fin.state.invAba = 'resumo';
      Fin.router.refresh();
    }
  }

  const contaDoAtivo = (est, id) => est.ativos.find((a) => a.id === id)?.conta || null;

  return { abrir, planoI10, planoNomad, aplicar, base, quantidades, contaDoAtivo, resolverRico, aplicarRico };
})();
