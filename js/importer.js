/**
 * importer.js — Lê o arquivo Excel (via SheetJS) e transforma cada linha em um
 * objeto JavaScript estruturado, pronto para ser salvo pelo Fin.storage.
 *
 * Fluxo:  arquivo → readWorkbook() → analyze() → [revisão na tela] → collect() → storage
 */
window.Fin = window.Fin || {};

Fin.importer = (() => {
  const P = Fin.parsers;

  const uid = () =>
    (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 10));

  /** Nome do cartão a partir do nome da aba: "💳1 Ourocard Elo" → "Ourocard Elo". */
  function cardName(sheetName) {
    const { nome } = P.splitEmoji(sheetName);
    return (nome || sheetName).replace(/^\d+\s*/, '').trim();
  }

  /* ---------- Conversores de linha → registro (um por tipo de aba) ---------- */

  const BUILDERS = {
    lancamentos(r, sheet) {
      const data = P.toISODate(r.dataLancamento);
      const vencimento = P.toISODate(r.vencimento);
      const dataPagamento = P.toISODate(r.dataPagamento);
      const valorPrevisto = P.toNumber(r.valorPrevisto);
      const valorPago = P.toNumber(r.valorPago);

      // Linha sem data ou sem valor = linha vazia/total/rodapé → ignora.
      if (!(data || vencimento || dataPagamento)) return null;
      if (valorPrevisto === null && valorPago === null) return null;

      // Sem coluna "Tipo": valor negativo = despesa, positivo = receita.
      const sinal = [valorPrevisto, valorPago].find((v) => v !== null && v !== 0) ?? 0;
      const tipo = P.toTipo(r.tipo) ?? (sinal < 0 ? 'despesa' : 'receita');
      const cat = P.splitEmoji(r.categoria);
      const forma = P.splitEmoji(r.formaPagamento);
      const abs = (v) => (v === null ? null : Math.abs(v));

      return {
        id: uid(),
        origem: sheet.name,
        data: data || vencimento || dataPagamento,
        vencimento,
        dataPagamento,
        competencia: P.toCompetencia(r.mes, r.ano, vencimento || data || dataPagamento),
        descricao: P.text(r.descricao),
        categoria: cat.nome || 'Sem categoria',
        categoriaIcone: cat.icone,
        tipo,
        valorPrevisto: abs(valorPrevisto),
        valorPago: abs(valorPago),
        status: P.toStatus(r.status) ?? (valorPago ? 'pago' : 'aberto'),
        statusOriginal: P.text(r.status),
        formaPagamento: forma.nome,
        formaPagamentoIcone: forma.icone,
        observacao: P.text(r.observacao),
      };
    },

    cartao(r, sheet) {
      const data = P.toISODate(r.dataCompra);
      const valor = P.toNumber(r.valor);
      if (!data || valor === null) return null;
      const cat = P.splitEmoji(r.categoria);

      return {
        id: uid(),
        cartao: cardName(sheet.name),
        origem: sheet.name,
        data,
        fatura: P.toCompetencia(r.mesFatura, r.anoFatura, data), // "AAAA-MM"
        descricao: P.text(r.descricao),
        categoria: cat.nome || 'Sem categoria',
        categoriaIcone: cat.icone,
        valor, // positivo = compra; negativo = estorno/crédito
        parcela: P.parseParcela(r.parcela),
        valorTotalCompra: P.toNumber(r.valorTotalCompra),
        observacao: P.text(r.observacao),
      };
    },

    categorias(r) {
      const c = P.splitEmoji(r.nome);
      if (!c.nome) return null;
      return {
        id: uid(),
        nome: c.nome,
        icone: c.icone,
        tipo: P.toTipo(r.tipo) ?? 'despesa',
        classificacao: P.text(r.classificacao),
        orcamentoMensal: P.toNumber(r.orcamento) ?? 0,
      };
    },
  };

  /* ---------- Leitura e análise ---------- */

  async function readWorkbook(file) {
    const buffer = await file.arrayBuffer();
    return XLSX.read(buffer, { type: 'array' });
  }

  /** Analisa todas as abas: detecta tipo, cabeçalho e mapeamento de colunas. */
  function analyze(workbook) {
    return workbook.SheetNames.map((name) => {
      const ws = workbook.Sheets[name];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null, blankrows: true });
      const rowOffset = ws['!ref'] ? XLSX.utils.decode_range(ws['!ref']).s.r : 0;
      const found = Fin.columns.detect(rows);

      const sheet = {
        name,
        rows,
        rowOffset,
        kind: found ? found.kind : 'ignorar',
        headerRow: found ? found.headerRow : null,
        mapping: found ? found.mapping : {},
      };
      build(sheet);
      return sheet;
    });
  }

  /** Troca manualmente o tipo de uma aba (ou "ignorar") e refaz o mapeamento. */
  function setKind(sheet, kind) {
    sheet.kind = kind;
    if (kind !== 'ignorar') {
      const found = Fin.columns.detect(sheet.rows, kind);
      sheet.headerRow = found ? found.headerRow : 0;
      sheet.mapping = found ? found.mapping : {};
    }
    build(sheet);
  }

  /** Ajusta manualmente uma coluna: campo = '' significa ignorar a coluna. */
  function setColumn(sheet, col, field) {
    for (const [c, f] of Object.entries(sheet.mapping)) {
      if (f === field || Number(c) === Number(col)) delete sheet.mapping[c];
    }
    if (field) sheet.mapping[col] = field;
    build(sheet);
  }

  /** Converte as linhas da aba em registros usando o mapeamento atual. */
  function build(sheet) {
    sheet.records = [];
    sheet.skipped = 0;
    if (sheet.kind === 'ignorar' || sheet.headerRow === null) return sheet;

    const builder = BUILDERS[sheet.kind];
    const entries = Object.entries(sheet.mapping);

    for (let i = sheet.headerRow + 1; i < sheet.rows.length; i++) {
      const row = sheet.rows[i];
      if (!row) continue;
      const obj = {};
      for (const [col, field] of entries) obj[field] = row[col];

      const rec = builder(obj, sheet);
      if (rec) sheet.records.push(rec);
      else if (Object.values(obj).some((v) => !P.isEmpty(v))) sheet.skipped++;
    }
    return sheet;
  }

  /** Junta os registros de todas as abas por coleção, prontos para salvar. */
  function collect(sheets) {
    const out = { lancamentos: [], cartaoCompras: [], categorias: [] };
    for (const s of sheets) {
      if (s.kind === 'lancamentos') out.lancamentos.push(...s.records);
      if (s.kind === 'cartao') out.cartaoCompras.push(...s.records);
      if (s.kind === 'categorias') out.categorias.push(...s.records);
    }

    // Garante que toda categoria usada nos lançamentos exista no cadastro.
    const key = (nome, tipo) => `${P.normalize(nome)}|${tipo}`;
    const known = new Map(out.categorias.map((c) => [key(c.nome, c.tipo), c]));
    const ensure = (nome, icone, tipo) => {
      if (!nome || known.has(key(nome, tipo))) return;
      const nova = { id: uid(), nome, icone, tipo, classificacao: null, orcamentoMensal: 0 };
      known.set(key(nome, tipo), nova);
      out.categorias.push(nova);
    };
    out.lancamentos.forEach((l) => ensure(l.categoria, l.categoriaIcone, l.tipo));
    out.cartaoCompras.forEach((c) => ensure(c.categoria, c.categoriaIcone, 'despesa'));

    // Ordena por data (mais recentes primeiro).
    const byDate = (a, b) => (b.data || '').localeCompare(a.data || '');
    out.lancamentos.sort(byDate);
    out.cartaoCompras.sort(byDate);
    return out;
  }

  return { readWorkbook, analyze, setKind, setColumn, build, collect };
})();
