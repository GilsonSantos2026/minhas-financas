/**
 * fatura/leitor.js — Lê uma fatura de cartão (PDF ou foto) e devolve os lançamentos.
 *
 * Como funciona:
 * 1. PDF  → PDF.js extrai cada pedaço de texto com sua posição (x, y) na página.
 *    Foto → Tesseract.js (OCR) reconhece as palavras com suas posições.
 * 2. Cada DATA vira uma "âncora" de linha. O VALOR é o primeiro "R$ ..." à direita
 *    na mesma altura, e a DESCRIÇÃO é o texto entre os dois (inclusive quando a
 *    descrição quebra em duas linhas). Isso funciona mesmo com páginas em duas
 *    colunas, como a do Sicoob.
 * 3. O ano vem do vencimento da fatura (as datas das compras não trazem o ano).
 *
 * Tudo roda no navegador: o arquivo nunca sai do seu computador.
 */
window.Fin = window.Fin || {};

Fin.faturaLeitor = (() => {
  const P = Fin.parsers;
  const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const TESSERACT = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';

  const MESES = { jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6, jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12 };
  const RE_DATA = /^(\d{1,2})(?:\/(\d{1,2})|\s+([A-Za-zÇç]{3}))$/;
  const RE_VALOR = /^-?\s*R\$\s*-?\s*\d{1,3}(?:\.\d{3})*,\d{2}$|^-?\d{1,3}(?:\.\d{3})*,\d{2}$/;
  const RE_CABECALHO = /^(data|descri|movimenta|valor|pa[ií]s|cidade|total|lan[cç]amentos)/i;

  /* ---------------- Carregamento das bibliotecas (só quando usadas) ---------------- */

  const scripts = {};
  function loadScript(src) {
    scripts[src] = scripts[src] || new Promise((ok, err) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = ok;
      s.onerror = () => { delete scripts[src]; err(new Error('Não foi possível carregar a biblioteca. Verifique a internet.')); };
      document.head.appendChild(s);
    });
    return scripts[src];
  }

  /* ---------------- Extração de texto com posição ---------------- */

  async function itensDoPdf(file, onProgress) {
    await loadScript(PDFJS);
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const itens = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      onProgress?.(`Lendo página ${p} de ${pdf.numPages}…`);
      const page = await pdf.getPage(p);
      const vp = page.getViewport({ scale: 1 });
      const tc = await page.getTextContent();
      for (const it of tc.items) {
        const str = it.str.replace(/\s+/g, ' ').trim();
        if (!str) continue;
        itens.push({ str, x: it.transform[4], y: vp.height - it.transform[5], w: it.width || 0, page: p, pageW: vp.width });
      }
    }
    return itens;
  }

  /** OCR: converte as palavras da foto para o mesmo formato do PDF (escala ~ pontos de PDF). */
  async function itensDaImagem(file, onProgress) {
    await loadScript(TESSERACT);
    onProgress?.('Preparando o reconhecimento de texto (OCR)…');
    const worker = await Tesseract.createWorker('por', 1, {
      logger: (m) => m.status === 'recognizing text' && onProgress?.(`Reconhecendo texto… ${Math.round(m.progress * 100)}%`),
    });
    try {
      const { data } = await worker.recognize(file);
      const words = (data.words || []).filter((w) => w.text.trim());
      const alturas = words.map((w) => w.bbox.y1 - w.bbox.y0).sort((a, b) => a - b);
      const k = 8 / (alturas[Math.floor(alturas.length / 2)] || 8); // letra ≈ 8pt, como no PDF
      const largura = Math.max(...words.map((w) => w.bbox.x1), 1) * k;
      return words.map((w) => ({
        str: w.text.trim(),
        x: w.bbox.x0 * k,
        y: ((w.bbox.y0 + w.bbox.y1) / 2) * k,
        w: (w.bbox.x1 - w.bbox.x0) * k,
        page: 1,
        pageW: largura,
      }));
    } finally {
      await worker.terminate();
    }
  }

  /**
   * Junta pedaços que deveriam estar juntos ("R$" + "1.234,56"; "28" + "OUT")
   * e separa data grudada na descrição ("05/10 PGTO..." → "05/10" + "PGTO...").
   */
  function normalizarItens(itens) {
    const out = [];
    const lista = itens.map((i) => ({ ...i }));
    const consumidos = new Set();

    // Procura, à direita e na mesma linha (tolerante a OCR), o pedaço que completa este.
    const parceiro = (it, re, maxDx) => lista.find((o) => !consumidos.has(o) && o !== it && o.page === it.page &&
      Math.abs(o.y - it.y) < 4 && o.x > it.x && o.x - (it.x + (it.w || 0)) < maxDx && re.test(o.str));

    for (const it of lista) {
      if (consumidos.has(it)) continue;
      if (/^-?R\$$/.test(it.str)) {
        const p = parceiro(it, /^-?[\d.]+,\d{2}$/, 40);
        if (p) { it.str = `${it.str} ${p.str}`; it.w = p.x + (p.w || 0) - it.x; consumidos.add(p); }
      } else if (/^\d{1,2}$/.test(it.str)) {
        const p = parceiro(it, /^[A-Za-zÇç]{3}\.?$/, 25);
        if (p && MESES[P.normalize(p.str)]) { it.str = `${it.str} ${p.str.replace('.', '')}`; it.w = p.x + (p.w || 0) - it.x; consumidos.add(p); }
      }
    }

    for (const it of lista) {
      if (consumidos.has(it)) continue;
      const m = it.str.match(/^(\d{2}\/\d{2})\s+(.+)$/);
      if (m && !RE_VALOR.test(m[2])) {
        out.push({ ...it, str: m[1] });
        out.push({ ...it, str: m[2], x: it.x + 30 });
        continue;
      }
      out.push(it);
    }
    return out;
  }

  /* ---------------- Montagem das linhas ---------------- */

  function montarLinhas(itens) {
    const valores = itens.filter((i) => RE_VALOR.test(i.str));

    // 1ª passada: cada valor pertence à data mais próxima à sua esquerda, na mesma altura.
    // Exceção: se entre essa data e outra mais à esquerda não há nenhum valor, a da direita
    // é só um pedaço da descrição (ex.: parcela "02/03" solta) e a linha é da data da esquerda.
    // Isso também separa corretamente páginas em duas colunas.
    const mesmaLinha = (p, q, tol = 3.5) => p.page === q.page && Math.abs(p.y - q.y) <= tol;
    const todasDatas = itens.filter((i) => RE_DATA.test(i.str) && valores.some((v) => mesmaLinha(i, v) && v.x > i.x + 20));

    // Datas de verdade ficam alinhadas numa coluna (muitas no mesmo x). Uma parcela solta
    // ("04/06") aparece poucas vezes na coluna da descrição: fica de fora quando há colunas melhores.
    const coluna = (i) => `${i.page}:${Math.round(i.x / 8)}`;
    const contagem = new Map();
    todasDatas.forEach((d) => contagem.set(coluna(d), (contagem.get(coluna(d)) || 0) + 1));
    const vizinhas = (d) => [-1, 0, 1].reduce((s, k) => s + (contagem.get(`${d.page}:${Math.round(d.x / 8) + k}`) || 0), 0);
    const maxPorPagina = new Map();
    todasDatas.forEach((d) => maxPorPagina.set(d.page, Math.max(maxPorPagina.get(d.page) || 0, vizinhas(d))));
    const alinhada = (d) => vizinhas(d) >= Math.max(1, maxPorPagina.get(d.page) * 0.25);
    const datas = todasDatas.filter(alinhada);

    const porAncora = new Map();
    for (const valor of valores) {
      const cand = datas.filter((d) => mesmaLinha(d, valor) && d.x < valor.x - 20).sort((p, q) => q.x - p.x);
      if (!cand.length) continue;
      let a = cand[0];
      for (const c of cand.slice(1)) {
        const valorEntre = valores.some((v) => v !== valor && mesmaLinha(v, a, 4.5) && v.x > c.x && v.x < a.x);
        if (valorEntre) break;
        a = c;
      }
      const atual = porAncora.get(a);
      if (!atual || valor.x < atual.valor.x) porAncora.set(a, { a, valor });
    }
    const pares = [...porAncora.values()];
    const ancoras = new Set(pares.map((p) => p.a));
    const usados = new Set();
    const linhas = [];

    // 2ª passada: descrição = texto entre a data e o valor, inclusive linhas quebradas.
    for (const { a, valor } of pares) {
      // Faixa vertical: metade da distância até a próxima linha da mesma coluna (máx. 7pt).
      const vizinhas = pares.filter((o) => o.a !== a && o.a.page === a.page && Math.abs(o.a.x - a.x) < 15).map((o) => Math.abs(o.a.y - a.y));
      const banda = Math.min(7, Math.max(3, (Math.min(...vizinhas, 20) / 2) - 0.5));

      const desc = itens
        .filter((i) => i !== a && i !== valor && i.page === a.page && i.x > a.x + 5 && i.x < valor.x - 1 &&
          Math.abs(i.y - a.y) <= banda && !ancoras.has(i) && !RE_VALOR.test(i.str))
        // mesma linha (±2.5pt, tolerante a OCR) → esquerda para direita; senão, de cima para baixo
        .sort((p, q) => (Math.abs(p.y - q.y) < 2.5 ? p.x - q.x : p.y - q.y));

      [a, valor, ...desc].forEach((i) => usados.add(i));
      linhas.push({ a, valor, texto: desc.map((d) => d.str).join(' ') });
    }

    // Títulos de seção (ex.: "RAFAELA LUIZ 5533", "Cartão Visa [****6682]") = portador do cartão.
    const ordem = (page, x, pageW, y) => page * 1e6 + (x < pageW / 2 ? 0 : 1) * 1e5 + y;
    const portadores = itens
      .filter((i) => !usados.has(i) && !RE_VALOR.test(i.str) && !RE_CABECALHO.test(i.str) &&
        (/\d{4}\s*[\])]?\s*$/.test(i.str) && /[a-z]{3}/i.test(i.str)) && !/\d{2}\/\d{2}\/\d{4}/.test(i.str))
      .map((i) => {
        const mesma = itens.filter((o) => o.page === i.page && Math.abs(o.y - i.y) < 2 && Math.abs(o.x - i.x) < 260 && !RE_VALOR.test(o.str));
        const texto = mesma.sort((p, q) => p.x - q.x).map((o) => o.str).join(' ')
          .replace(/\[?\*{3,}\s*(\d{4})\]?/, 'final $1').replace(/\s+/g, ' ').trim();
        return { texto, k: ordem(i.page, i.x, i.pageW, i.y) };
      })
      .sort((p, q) => p.k - q.k);

    return linhas
      .map((l) => ({ ...l, k: ordem(l.a.page, l.a.x, l.a.pageW, l.a.y) }))
      .sort((p, q) => p.k - q.k)
      .map((l) => ({ ...l, portador: portadores.filter((h) => h.k < l.k).pop()?.texto || null }));
  }

  /* ---------------- Interpretação ---------------- */

  const dinheiro = (s) => (s ? P.toNumber(s.replace(/\s/g, '')) : null);

  function extrairParcela(texto) {
    let m = texto.match(/\bparc(?:ela)?\.?\s*(\d{1,2})\s*(?:\/|de)\s*(\d{1,2})\b/i);
    if (!m) {
      const re = /(?<![\w.\/])(\d{2})\/(\d{2})(?![\/\d])/g;
      let r;
      while ((r = re.exec(texto))) {
        const antes = texto.slice(0, r.index);
        if (/ref\.?\s*$/i.test(antes)) continue;
        m = r;
      }
    }
    if (!m) return { parcela: null, texto };
    const atual = Number(m[1]);
    const total = Number(m[2]);
    if (!(atual >= 1 && total >= 2 && atual <= total && total <= 72)) return { parcela: null, texto };
    return { parcela: { atual, total }, texto: texto.replace(m[0], ' ') };
  }

  function dataISO(str, venc) {
    const m = str.match(RE_DATA);
    const dia = Number(m[1]);
    const mes = m[2] ? Number(m[2]) : MESES[P.normalize(m[3])];
    if (!mes || !dia) return null;
    const [vy, vm] = venc ? venc.split('-').map(Number) : [new Date().getFullYear(), 12];
    const ano = mes <= vm ? vy : vy - 1;
    const d = new Date(ano, mes - 1, dia);
    return d.getMonth() === mes - 1 ? `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}` : null;
  }

  /** Item mais próximo à direita ou abaixo de um rótulo (layout "rótulo em cima, valor embaixo"). */
  function perto(itens, reRotulo, reValor) {
    let melhor = null;
    for (const rot of itens.filter((i) => reRotulo.test(i.str))) {
      for (const d of itens.filter((i) => i.page === rot.page && i !== rot && reValor.test(i.str))) {
        const dx = d.x - rot.x;
        const dy = d.y - rot.y;
        if (dx < -40 || dx > 200 || dy < -3 || dy > 40) continue;
        const dist = Math.hypot(dx, dy * 2);
        if (!melhor || dist < melhor.dist) melhor = { d, dist };
      }
    }
    return melhor?.d || null;
  }

  /** Vencimento: a data (dd/mm/aaaa ou "7 NOV 2026") mais próxima do rótulo "Vencimento"/"Vence em". */
  function vencimentoPeloLayout(itens) {
    const RE_DT = /^(\d{1,2})\/(\d{2})\/(\d{4})$|^(\d{1,2})\s+([A-Za-zÇç]{3})\s+(\d{4})$/;
    const d = perto(itens, /^venc(imento|e em)?:?$/i, RE_DT);
    if (!d) return null;
    const m = d.str.match(RE_DT);
    if (m[1]) return `${m[3]}-${m[2]}-${m[1].padStart(2, '0')}`;
    const mes = MESES[P.normalize(m[5])];
    return mes ? `${m[6]}-${String(mes).padStart(2, '0')}-${m[4].padStart(2, '0')}` : null;
  }

  /** Informações gerais da fatura, procuradas no texto todo. */
  function cabecalho(texto) {
    const t = texto.replace(/\s+/g, ' ');
    const n = P.normalize(t);
    const banco = /sicoob/.test(n) ? 'Sicoob' : /ourocard|banco do brasil|bb com br/.test(n) ? 'Banco do Brasil'
      : /mercado pago/.test(n) ? 'Mercado Pago' : /nubank|nu pagamentos/.test(n) ? 'Nubank'
      : /itau/.test(n) ? 'Itaú' : /bradesco/.test(n) ? 'Bradesco' : /santander/.test(n) ? 'Santander'
      : /caixa/.test(n) ? 'Caixa' : /inter\b/.test(n) ? 'Inter' : null;

    let venc = null;
    let m = t.match(/venc(?:imento|e em)?:?\s*(\d{2})\/(\d{2})\/(\d{4})/i);
    if (m) venc = `${m[3]}-${m[2]}-${m[1]}`;
    if (!venc && (m = t.match(/vencimento\s+(\d{1,2})\s+([a-zç]{3})\w*\s+(\d{4})/i))) {
      const mes = MESES[P.normalize(m[2])];
      if (mes) venc = `${m[3]}-${String(mes).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }

    const num = (re) => { const r = t.match(re); return r ? dinheiro(r[r.length - 1]) : null; };
    const total = num(/(?:valor total de|total da fatura|total a pagar|saldo total\s*=?)\s*:?\s*R?\$?\s*([\d.]+,\d{2})/i);
    const saldoAnterior = num(/(?:saldo (?:da )?fatura anterior|saldo anterior|fatura anterior|total da fatura de [a-zç]+)\s*R?\$?\s*([\d.]+,\d{2})/i) ?? 0;
    const finalCartao = (t.match(/final\s*(\d{4})/i) || t.match(/\*{4,}\s*(\d{4})/) || [])[1] || null;
    return { banco, vencimento: venc, total, saldoAnterior, finalCartao };
  }

  function tipoDoItem(desc, valor) {
    const n = P.normalize(desc);
    if (/\b(pagamento|pgto|pagto|pag)\b/.test(n) && !/protec|seguro/.test(n)) return 'pagamento';
    if (valor < 0) return 'credito';
    if (/(juro|\biof\b|anuidade|encargo|tarifa|multa|\bmora\b|protecao perda|\bsms\b|rotativo)/.test(n)) return 'encargo';
    return 'compra';
  }

  /**
   * Lê o arquivo e devolve { info, itens, conferencia }.
   * itens: [{ data, descricao, valor, parcela, tipo, portador }]
   */
  async function ler(file, onProgress) {
    const isPdf = /pdf$/i.test(file.type) || /\.pdf$/i.test(file.name);
    const brutos = isPdf ? await itensDoPdf(file, onProgress) : await itensDaImagem(file, onProgress);
    if (!brutos.length) throw new Error(isPdf ? 'Este PDF não tem texto (pode ser uma imagem escaneada). Tente enviar como foto.' : 'Nenhum texto reconhecido na imagem.');

    onProgress?.('Identificando os lançamentos…');
    const itens = normalizarItens(brutos);
    const textoTodo = itens.map((i) => i.str).join(' ');
    const info = cabecalho(textoTodo);
    info.vencimento = vencimentoPeloLayout(itens) || info.vencimento;
    if (info.total == null) {
      const t = perto(itens, /^(total a pagar|valor total|total da fatura|valor da fatura)$/i, RE_VALOR);
      if (t) info.total = dinheiro(t.str);
    }

    const linhas = montarLinhas(itens);
    const portadoresDistintos = new Set(linhas.map((l) => l.portador).filter(Boolean));

    const resultado = linhas.map((l) => {
      let valor = dinheiro(l.valor.str);
      const { parcela, texto } = extrairParcela(l.texto);
      const descricao = texto.replace(/\s+BR\s*$/, '').replace(/\s{2,}/g, ' ').trim().replace(/[\s\-–]+$/, '');
      const tipo = tipoDoItem(descricao, valor);
      if (tipo === 'pagamento' && valor > 0) valor = -valor; // Mercado Pago mostra o pagamento positivo
      return {
        data: dataISO(l.a.str, info.vencimento),
        descricao,
        valor,
        parcela,
        tipo,
        portador: portadoresDistintos.size > 1 ? l.portador : null,
      };
    }).filter((i) => i.data && i.valor !== null && i.descricao);

    // Conferência: total = saldo anterior + pagamentos + (compras, encargos e créditos).
    const pagamentos = resultado.filter((i) => i.tipo === 'pagamento').reduce((s, i) => s + i.valor, 0);
    const novos = resultado.filter((i) => i.tipo !== 'pagamento').reduce((s, i) => s + i.valor, 0);
    const esperado = info.total != null ? info.total - info.saldoAnterior - pagamentos : null;
    const r2 = (v) => (v == null ? null : Math.round(v * 100) / 100);

    return {
      info,
      itens: resultado,
      conferencia: { lido: r2(novos), esperado: r2(esperado), ok: esperado != null && Math.abs(esperado - novos) < 0.02 },
    };
  }

  return { ler, loadScript };
})();
