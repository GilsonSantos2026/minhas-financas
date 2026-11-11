/**
 * column-map.js — Reconhecimento automático das colunas da planilha.
 *
 * COMO FUNCIONA
 * 1. Cada "esquema" (lançamentos, cartão, categorias) lista os campos que o app
 *    entende e, para cada campo, os nomes de coluna possíveis (sinônimos).
 * 2. O cabeçalho da planilha é normalizado ("Data Lanç." → "data lanc") e
 *    comparado com os sinônimos. Vence o sinônimo MAIS LONGO encontrado, assim
 *    "Valor Pago" vira valorPago (e não valorPrevisto, que tem o sinônimo "valor").
 * 3. O cabeçalho não precisa estar na linha 1: as primeiras 25 linhas de cada aba
 *    são testadas e vence a linha/esquema que reconhecer mais colunas.
 *
 * PARA ADAPTAR À SUA PLANILHA: basta acrescentar sinônimos nas listas abaixo
 * (sempre em minúsculas e sem acentos).
 */
window.Fin = window.Fin || {};

Fin.columns = (() => {
  const SCHEMAS = {
    lancamentos: {
      label: 'Lançamentos',
      // Cada grupo exige pelo menos um dos campos para a aba ser reconhecida.
      required: [['dataLancamento', 'vencimento', 'dataPagamento'], ['valorPrevisto', 'valorPago']],
      fields: {
        dataLancamento: { label: 'Data do lançamento', synonyms: ['data', 'data lanc', 'data lancamento', 'dt lanc', 'data transacao', 'data movimento'] },
        vencimento:     { label: 'Vencimento',         synonyms: ['vencimento', 'venc', 'data vencimento', 'dt venc'] },
        categoria:      { label: 'Categoria',          synonyms: ['categoria', 'grupo', 'subcategoria'] },
        tipo:           { label: 'Tipo (entrada/saída)', synonyms: ['tipo', 'natureza', 'tipo lancamento', 'entrada saida', 'e s'] },
        descricao:      { label: 'Descrição',          synonyms: ['descricao', 'historico', 'item', 'detalhe', 'lancamento', 'nome'] },
        valorPrevisto:  { label: 'Valor previsto',     synonyms: ['valor', 'valor previsto', 'valor r', 'montante', 'quantia', 'valor original'] },
        status:         { label: 'Status',             synonyms: ['status', 'situacao', 'pago'] },
        dataPagamento:  { label: 'Data do pagamento',  synonyms: ['data pagto', 'data pgto', 'data pagamento', 'pago em', 'dt pagto'] },
        valorPago:      { label: 'Valor pago',         synonyms: ['valor pago', 'valor pgto', 'valor realizado', 'realizado'] },
        formaPagamento: { label: 'Forma de pagamento', synonyms: ['forma pagto', 'forma pgto', 'forma pagamento', 'forma de pagamento', 'meio de pagamento', 'conta'] },
        observacao:     { label: 'Observação',         synonyms: ['observacao', 'observacoes', 'obs', 'notas', 'comentario'] },
        mes:            { label: 'Mês (competência)',  synonyms: ['mes', 'competencia', 'mes ref', 'mes referencia'] },
        ano:            { label: 'Ano (competência)',  synonyms: ['ano', 'ano ref'] },
      },
    },

    cartao: {
      label: 'Cartão de crédito',
      required: [['dataCompra'], ['valor']],
      fields: {
        dataCompra:       { label: 'Data da compra',        synonyms: ['data', 'data da compra', 'data compra'] },
        descricao:        { label: 'Descrição',             synonyms: ['descricao', 'historico', 'estabelecimento', 'item'] },
        categoria:        { label: 'Categoria',             synonyms: ['categoria'] },
        valor:            { label: 'Valor (da parcela)',    synonyms: ['valor', 'valor parcela', 'valor r'] },
        parcela:          { label: 'Parcela (ex.: 03/10)',  synonyms: ['parcela', 'parcelas', 'n parcela'] },
        observacao:       { label: 'Observação',            synonyms: ['observacao', 'obs'] },
        mesFatura:        { label: 'Mês da fatura',         synonyms: ['mes fatura', 'mes da fatura', 'fatura'] },
        anoFatura:        { label: 'Ano da fatura',         synonyms: ['ano fatura', 'ano da fatura'] },
        valorTotalCompra: { label: 'Valor total da compra', synonyms: ['valor total', 'valor total da compra', 'total da compra'] },
      },
    },

    categorias: {
      label: 'Categorias',
      required: [['nome'], ['tipo', 'classificacao', 'orcamento']],
      fields: {
        nome:          { label: 'Categoria',        synonyms: ['categoria', 'nome', 'nome categoria'] },
        tipo:          { label: 'Tipo',             synonyms: ['tipo'] },
        classificacao: { label: 'Classificação',    synonyms: ['classificacao', 'grupo'] },
        orcamento:     { label: 'Orçamento mensal', synonyms: ['orcamento', 'orcamento mensal', 'limite', 'meta'] },
      },
    },
  };

  const normalize = (v) => Fin.parsers.normalize(v);

  /** Descobre qual campo de um esquema corresponde a um título de coluna. */
  function matchField(header, schema) {
    if (typeof header !== 'string') return null;
    const h = ` ${normalize(header)} `;
    if (!h.trim()) return null;
    let best = null;
    let bestLen = 0;
    for (const [field, def] of Object.entries(schema.fields)) {
      for (const syn of def.synonyms) {
        if (h.includes(` ${syn} `) && syn.length > bestLen) {
          best = field;
          bestLen = syn.length;
        }
      }
    }
    return best;
  }

  /** Gera { índiceDaColuna: campo } para uma linha de cabeçalho. Cada campo é usado uma vez. */
  function autoMap(headers, schema) {
    const mapping = {};
    const used = new Set();
    (headers || []).forEach((header, col) => {
      const field = matchField(header, schema);
      if (field && !used.has(field)) {
        mapping[col] = field;
        used.add(field);
      }
    });
    return mapping;
  }

  function meetsRequired(mapping, schema) {
    const fields = Object.values(mapping);
    return schema.required.every((group) => group.some((f) => fields.includes(f)));
  }

  /**
   * Procura a linha de cabeçalho e o tipo de aba.
   * @param rows      linhas da aba (arrays de células)
   * @param onlyKind  força um esquema específico (usado quando você troca o tipo manualmente)
   * @returns { kind, headerRow, mapping, score } ou null se nada for reconhecido
   */
  function detect(rows, onlyKind = null) {
    const kinds = onlyKind ? [onlyKind] : Object.keys(SCHEMAS);
    let best = null;
    const limit = Math.min(rows.length, 25);

    for (let i = 0; i < limit; i++) {
      const headers = rows[i] || [];
      const textCells = headers.filter((c) => typeof c === 'string' && c.trim()).length;
      if (textCells < 2) continue;

      for (const kind of kinds) {
        const schema = SCHEMAS[kind];
        const mapping = autoMap(headers, schema);
        if (!onlyKind && !meetsRequired(mapping, schema)) continue;
        const score = Object.keys(mapping).length;
        if (score > 0 && (!best || score > best.score)) best = { kind, headerRow: i, mapping, score };
      }
    }
    return best;
  }

  return { SCHEMAS, matchField, autoMap, meetsRequired, detect };
})();
