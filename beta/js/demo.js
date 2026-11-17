/**
 * demo.js — Dados de DEMONSTRAÇÃO (fictícios) para gravar vídeos e mostrar o app.
 *
 * Só é oferecido no canal beta (Fin.ehBeta), na tela de primeiro uso (Dados).
 * Gera 12 meses de receitas e despesas, 2 cartões com compras (incl. parceladas e o
 * pagamento de cada fatura), uma carteira de investimentos com proventos, reserva de
 * emergência, evolução patrimonial (fotos mensais) e metas. Sempre os mesmos números
 * (gerador com semente fixa), coerentes entre si e com o mês atual.
 */
window.Fin = window.Fin || {};

Fin.demo = (() => {
  const fmt = Fin.fmt;
  const S = Fin.storage;
  const r2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

  // Gerador de números com semente fixa (mulberry32): mesmos dados a cada carga.
  function rng(semente) {
    let a = semente >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const dia = (ym, d) => `${ym}-${String(Math.min(d, 28)).padStart(2, '0')}`;

  function carregar(categoriasPadrao) {
    const F = Fin.finance;
    const rnd = rng(20261117);
    const entre = (a, b) => r2(a + rnd() * (b - a));
    const escolhe = (xs) => xs[Math.floor(rnd() * xs.length)];
    const hoje = fmt.todayISO();
    const atual = fmt.currentYM();
    const inicio = fmt.addMonths(atual, -11);
    const meses = [];
    for (let m = inicio; m <= atual; m = fmt.addMonths(m, 1)) meses.push(m);

    // 1) Base: categorias prontas (as mesmas do "Começar do zero") + meta "zero".
    S.comecarDoZero(categoriasPadrao);
    const icone = (nome) => F.categorias().find((c) => c.nome === nome)?.icone || null;

    // 2) Lançamentos mensais (receitas e despesas fixas/variáveis).
    const lanc = [];
    const novo = (tipo, descricao, categoria, valor, ym, d, extra = {}) => {
      const venc = dia(ym, d);
      const pago = venc <= hoje;
      lanc.push({
        id: S.uid(), origem: 'demo', tipo, descricao, categoria, categoriaIcone: icone(categoria),
        valorPrevisto: valor, valorPago: pago ? valor : null, status: pago ? 'pago' : 'aberto',
        vencimento: venc, data: venc, dataPagamento: pago ? venc : null, competencia: ym,
        formaPagamento: tipo === 'receita' ? 'Transferência' : extra.forma || 'Pix', ...extra.campos,
      });
    };
    meses.forEach((ym, i) => {
      novo('receita', 'Salário', 'Salário', 8500, ym, 5);
      if (i % 3 === 1) novo('receita', 'Projeto freelance', 'Renda extra', entre(700, 1600), ym, 18);
      novo('receita', 'Rendimento da conta', 'Rendimentos', entre(70, 140), ym, 28);
      novo('despesa', 'Aluguel', 'Moradia', 2200, ym, 10, { forma: 'Boleto' });
      novo('despesa', 'Condomínio', 'Moradia', 420, ym, 10, { forma: 'Boleto' });
      novo('despesa', 'Energia elétrica', 'Contas da casa', entre(170, 260), ym, 15, { forma: 'Débito automático' });
      novo('despesa', 'Água', 'Contas da casa', entre(80, 120), ym, 20, { forma: 'Débito automático' });
      novo('despesa', 'Internet e celular', 'Contas da casa', 149.9, ym, 12, { forma: 'Débito automático' });
      novo('despesa', 'Plano de saúde', 'Saúde', 480, ym, 8, { forma: 'Boleto' });
      novo('despesa', 'Curso de inglês', 'Educação', 390, ym, 7, { forma: 'Boleto' });
      novo('despesa', 'Seguro do carro', 'Transporte', 186.4, ym, 22, { forma: 'Boleto' });
      novo('despesa', 'Aporte mensal', 'Investimentos', 1000, ym, 6, { forma: 'Transferência' });
      if (i % 4 === 2) novo('despesa', 'IPVA / licenciamento', 'Impostos e taxas', entre(250, 420), ym, 25, { forma: 'Pix' });
    });

    // 3) Cartões e compras (à vista e parceladas). Fatura de cada compra pelo fechamento do cartão.
    const cartoes = [
      { id: S.uid(), nome: 'Nubank', diaFechamento: 3, diaVencimento: 10, limite: 9000, palavraChave: 'nubank' },
      { id: S.uid(), nome: 'Visa Platinum', diaFechamento: 26, diaVencimento: 5, limite: 14000, palavraChave: 'visa' },
    ];
    S.set('cartoes', cartoes);
    const compra = (cartao, descricao, categoria, valorTotal, data, parcelas = 1) => {
      const fatura = F.faturaDaCompra(F.cartao(cartao), data);
      F.criarCompra({ cartao, descricao, categoria, categoriaIcone: icone(categoria), data, valorTotal, parcelas, fatura });
    };
    const LOJAS = {
      Mercado: ['Supermercado Bom Preço', 'Atacadão', 'Hortifruti da Esquina', 'Padaria Pão Quente'],
      'Restaurantes e delivery': ['iFood', 'Restaurante Sabor Caseiro', 'Pizzaria Bella', 'Café Central'],
      Transporte: ['Posto Shell', 'Posto Ipiranga', 'Uber', 'Estacionamento'],
      Lazer: ['Cinema', 'Ingresso show', 'Parque'],
      Saúde: ['Drogaria São Paulo', 'Farmácia Popular'],
      Pets: ['Pet Shop Amigo'],
      'Cuidados pessoais': ['Barbearia', 'Salão Beleza Pura'],
      Roupas: ['Renner', 'C&A'],
    };
    meses.forEach((ym, i) => {
      const ate = ym === atual ? Math.max(1, Number(hoje.slice(8, 10)) - 1) : 28;
      const data = () => dia(ym, 1 + Math.floor(rnd() * ate));
      for (let k = 0; k < 4; k++) compra(k % 2 ? 'Nubank' : 'Visa Platinum', escolhe(LOJAS.Mercado), 'Mercado', entre(140, 460), data());
      for (let k = 0; k < 4; k++) compra('Nubank', escolhe(LOJAS['Restaurantes e delivery']), 'Restaurantes e delivery', entre(38, 140), data());
      for (let k = 0; k < 2; k++) compra('Visa Platinum', escolhe(LOJAS.Transporte.slice(0, 2)), 'Transporte', entre(180, 260), data());
      compra('Nubank', 'Uber', 'Transporte', entre(18, 45), data());
      compra('Nubank', 'Streaming de vídeo', 'Assinaturas', 55.9, dia(ym, 9));
      compra('Nubank', 'Streaming de música', 'Assinaturas', 21.9, dia(ym, 14));
      compra('Visa Platinum', escolhe(LOJAS.Saúde), 'Saúde', entre(35, 160), data());
      compra('Visa Platinum', escolhe(LOJAS.Pets), 'Pets', entre(90, 210), data());
      if (i % 2 === 0) compra('Nubank', escolhe(LOJAS.Lazer), 'Lazer', entre(60, 220), data());
      if (i % 3 === 0) compra('Visa Platinum', escolhe(LOJAS['Cuidados pessoais']), 'Cuidados pessoais', entre(50, 140), data());
      if (i % 4 === 1) compra('Visa Platinum', escolhe(LOJAS.Roupas), 'Roupas', entre(150, 420), data());
    });
    // Parceladas (as parcelas futuras aparecem nas próximas faturas).
    compra('Visa Platinum', 'Notebook', 'Outros gastos', 3600, dia(fmt.addMonths(atual, -4), 12), 10);
    compra('Nubank', 'Passagens aéreas — férias', 'Viagens', 2400, dia(fmt.addMonths(atual, -2), 20), 6);
    compra('Visa Platinum', 'Geladeira', 'Moradia', 4200, dia(fmt.addMonths(atual, -7), 8), 12);

    // 4) Pagamento de cada fatura (lançamento "Pagamento Fatura" = soma das compras da fatura).
    const todas = S.list('cartaoCompras');
    cartoes.forEach((k) => {
      meses.concat([fmt.addMonths(atual, 1)]).forEach((ym) => {
        const total = r2(todas.filter((c) => c.cartao === k.nome && c.fatura === ym).reduce((s, c) => s + (Number(c.valor) || 0), 0));
        if (total <= 0) return;
        novo('despesa', `CARTÃO - ${k.nome.toUpperCase()}`, 'Pagamento Fatura', total, ym, k.diaVencimento, { forma: 'Débito em conta' });
      });
    });
    S.set('lancamentos', lanc);

    // Orçamentos de algumas categorias (para a tela Orçamento ficar viva).
    const orc = { Mercado: 1500, 'Restaurantes e delivery': 450, Transporte: 700, Lazer: 250, Assinaturas: 90 };
    S.set('categorias', S.list('categorias').map((c) => (orc[c.nome] ? { ...c, orcamentoMensal: orc[c.nome] } : c)));

    // 5) Investimentos: corretora + reserva, ativos, compras mensais, proventos, fotos e metas.
    const contaCorr = { id: S.uid(), nome: 'Corretora', tipo: 'corretora', moeda: 'BRL', icone: '📈' };
    const contaRes = { id: S.uid(), nome: 'Reserva de emergência', tipo: 'saldo', moeda: 'BRL', classe: 'reserva', icone: '🛟' };
    S.set('invContas', [contaCorr, contaRes]);
    // [ticker, nome, classe, preço inicial, preço atual, provento mensal por cota (FII) | semestral (ação)]
    const ATIVOS = [
      ['TESOURO-SELIC', 'Tesouro Selic 2029', 'tesouro', 14000, 15300, 0],
      ['CDB-LIQ', 'CDB Liquidez Diária', 'renda-fixa', 1000, 1095, 0],
      ['ITSA4', 'Itaúsa PN', 'acao', 9.6, 11.2, 0.35],
      ['BBAS3', 'Banco do Brasil ON', 'acao', 25.4, 28.9, 1.1],
      ['MXRF11', 'Maxi Renda FII', 'fii', 9.9, 10.15, 0.1],
      ['HGLG11', 'CSHG Logística FII', 'fii', 158, 164.5, 1.1],
      ['BOVA11', 'iShares Ibovespa', 'etf-br', 118, 131.4, 0],
    ];
    const ativos = ATIVOS.map(([ticker, nome, classe, , precoAtual]) => ({ id: S.uid(), conta: contaCorr.id, ticker, nome, classe, moeda: 'BRL', preco: precoAtual, precoEm: hoje }));
    S.set('invAtivos', ativos);
    const movs = [];
    const mov = (m) => movs.push({ id: S.uid(), taxas: 0, origem: 'manual', ...m });
    const qtd = new Map();
    const precoEm = (i, k) => ATIVOS[i][3] + (ATIVOS[i][4] - ATIVOS[i][3]) * (k / 11); // sobe aos poucos
    // Posição inicial (antes de usar o app): não conta como aporte.
    [[0, 1], [1, 4], [2, 400], [3, 120], [4, 600], [5, 25], [6, 40]].forEach(([i, q]) => {
      mov({ data: dia(inicio, 2), conta: contaCorr.id, ativo: ativos[i].id, tipo: 'inicial', qtd: q, preco: ATIVOS[i][3] });
      qtd.set(i, q);
    });
    // Aporte de R$ 1.000 por mês, alternando os ativos.
    const ROTACAO = [4, 2, 6, 5, 1, 3];
    meses.forEach((ym, k) => {
      const i = ROTACAO[k % ROTACAO.length];
      const p = r2(precoEm(i, k));
      const q = i === 1 ? 1 : Math.max(1, Math.floor(1000 / p));
      mov({ data: dia(ym, 7), conta: contaCorr.id, ativo: ativos[i].id, tipo: 'compra', qtd: q, preco: p });
      qtd.set(i, (qtd.get(i) || 0) + q);
      // Proventos: FIIs todo mês; ações a cada 6 meses.
      [4, 5].forEach((f) => mov({ data: dia(ym, 15), conta: contaCorr.id, ativo: ativos[f].id, tipo: 'provento', valor: r2((qtd.get(f) || 0) * ATIVOS[f][5]), qtd: 0, preco: 0 }));
      if (k % 6 === 3) [2, 3].forEach((a) => mov({ data: dia(ym, 20), conta: contaCorr.id, ativo: ativos[a].id, tipo: 'provento', valor: r2((qtd.get(a) || 0) * ATIVOS[a][5]), qtd: 0, preco: 0 }));
      // Reserva: aporte mensal de R$ 300.
      mov({ data: dia(ym, 6), conta: contaRes.id, ativo: null, tipo: k === 0 ? 'aporte' : 'aporte', valor: k === 0 ? 12000 : 300 });
    });
    const reservaAportado = 12000 + 300 * (meses.length - 1);
    mov({ data: hoje, conta: contaRes.id, ativo: null, tipo: 'saldo', valor: r2(reservaAportado * 1.072) });
    S.set('invMovs', movs);

    // Fotos mensais do patrimônio (evolução): aplicado acumulado × rendimento crescente.
    const hist = [];
    let aplicado = ATIVOS.reduce((s, a, i) => s + a[3] * ([1, 4, 400, 120, 600, 25, 40][i]), 0);
    meses.slice(0, -1).forEach((ym, k) => {
      aplicado += 1000 + (k === 0 ? 12000 : 300);
      const patrimonio = r2(aplicado * (1 + 0.004 * (k + 1) + (k % 3 === 2 ? -0.003 : 0)));
      hist.push({ id: ym, patrimonio, investido: r2(aplicado), em: `${ym}-28`, manual: true, porClasse: {}, dolar: null });
    });
    S.set('invHist', hist);

    S.set('invMetas', [
      { id: S.uid(), nome: 'Independência financeira', tipo: 'patrimonio', classes: [], conta: null, alvo: 1000000, aporteMensal: 1300, dono: 'casal' },
      { id: S.uid(), nome: 'Viagem dos sonhos', tipo: 'classes', classes: ['renda-fixa', 'tesouro'], conta: null, alvo: 30000, aporteMensal: 500, dono: 'casal' },
      { id: S.uid(), nome: 'Renda passiva de R$ 1.000/mês', tipo: 'proventos', classes: [], conta: null, alvo: 1000, aporteMensal: 1000, dono: 'casal' },
    ]);
    S.set('invConfig', [{ id: 'alocacao', ideal: { 'renda-fixa': 15, tesouro: 25, acao: 20, fii: 20, 'etf-br': 10, reserva: 10 } }]);
    try { Fin.inv.garantirCategoria(); } catch { /* ok */ }

    return { lancamentos: S.list('lancamentos').length, compras: S.list('cartaoCompras').length, movs: movs.length };
  }

  return { carregar };
})();
