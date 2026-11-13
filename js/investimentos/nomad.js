/**
 * investimentos/nomad.js — Lê o extrato mensal da Nomad (Apex Clearing, PDF, inglês ou português).
 *
 * Extrai:
 *  - período ("2026-10-01 - 2026-10-31");
 *  - operações (BUY/SELL), inclusive as "pendentes de liquidação" (aparecem de novo no mês
 *    seguinte — quem importa remove a repetição);
 *  - proventos (CASH_DIVIDEND: valor líquido, já sem o imposto retido nos EUA);
 *  - outros eventos (MERGER, TRANSFER, DEPOSIT, WITHDRAWAL…) só para mostrar na conferência;
 *  - carteira no fim do mês (símbolo, quantidade, preço, valor).
 *
 * O PDF é lido no navegador (PDF.js); nada sai do aparelho.
 */
window.Fin = window.Fin || {};

Fin.nomad = (() => {
  const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const TICKER = /^[A-Z][A-Z0-9.]{0,6}$/;
  const DATA = /^\d{4}-\d{2}-\d{2}$/;
  const ehNum = (s) => /^-?[\d.,]+$/.test(s) && /\d/.test(s);

  /** "1,565.90" (EN), "1.565,90" ou "0,03" (PT), "0.02463" → número. */
  function num(s) {
    let t = String(s).trim();
    if (/,/.test(t) && /\./.test(t)) t = t.lastIndexOf(',') > t.lastIndexOf('.') ? t.replace(/\./g, '').replace(',', '.') : t.replace(/,/g, '');
    else if (/,/.test(t)) t = /^-?\d{1,3}(,\d{3})+$/.test(t) && !/^-?0,/.test(t) ? t.replace(/,/g, '') : t.replace(',', '.');
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }

  async function linhas(file) {
    await Fin.faturaLeitor.loadScript(PDFJS);
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const out = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const vp = page.getViewport({ scale: 1 });
      const tc = await page.getTextContent();
      const its = tc.items.map((i) => ({ s: i.str.replace(/\s+/g, ' ').trim(), x: i.transform[4], y: vp.height - i.transform[5] })).filter((i) => i.s);
      its.sort((a, b) => a.y - b.y || a.x - b.x);
      const ls = [];
      for (const it of its) {
        const l = ls.find((k) => Math.abs(k.y - it.y) <= 2.5);
        if (l) l.its.push(it); else ls.push({ y: it.y, its: [it] });
      }
      ls.sort((a, b) => a.y - b.y);
      for (const l of ls) { l.its.sort((a, b) => a.x - b.x); out.push({ p, y: l.y, its: l.its }); }
      // As páginas depois da atividade são só avisos legais.
      if (ls.some((l) => /^(Investment objectives|Objetivos de investimento)/i.test(l.its.map((i) => i.s).join(' ')))) break;
    }
    return out;
  }

  async function ler(file) {
    const L = await linhas(file);
    const r = { arquivo: file.name, inicio: null, fim: null, operacoes: [], proventos: [], outros: [], carteira: [], idioma: 'en' };
    let sec = null;
    let pendente = false;
    for (const l of L) {
      // Às vezes o PDF junta duas colunas num pedaço só ("-0.05846 1,054.4475"): separa por espaço.
      const s = l.its.flatMap((i) => i.s.split(' ')).filter(Boolean);
      const txt = s.join(' ');
      const per = txt.match(/(\d{4}-\d{2}-\d{2}) - (\d{4}-\d{2}-\d{2})/);
      if (per && !r.inicio) { r.inicio = per[1]; r.fim = per[2]; }
      if (/Data do extrato|RESUMO DA CONTA|CARTEIRA/.test(txt)) r.idioma = 'pt';
      const x0 = l.its[0].x;
      // Títulos de seção
      if (x0 < 70 && /^(PORTFOLIO|CARTEIRA)\b/.test(txt)) { sec = 'carteira'; continue; }
      if (x0 < 70 && /(PENDING SETTLEMENT|PENDENTE)/i.test(txt)) { sec = 'oper'; pendente = true; continue; }
      if (x0 < 70 && /^(TRADING ACTIVITIES|ATIVIDADES DE( NEGOCIA)?)/.test(txt)) { sec = 'oper'; pendente = false; continue; }
      if (x0 < 70 && /^(NON-TRADING|ATIVIDADES? (N[ÃA]O|SEM)|OUTRAS ATIVIDADES)/i.test(txt)) { sec = 'outras'; continue; }
      if (x0 < 70 && /^(ACCOUNT SUMMARY|RESUMO DA CONTA|FDIC INSURED|SALDOS BANC|INCOME AND|RESUMO DE)/i.test(txt)) { sec = null; continue; }

      // Operação: BUY/SELL | pregão | liquidação | descrição… | símbolo | qtd | preço | líquido | comissão | taxa | taxas | capacidade
      if (/^(BUY|SELL)$/.test(s[0]) && DATA.test(s[1] || '')) {
        const n = s.length;
        if (n >= 11 && ehNum(s[n - 2]) && ehNum(s[n - 7])) {
          r.operacoes.push({
            tipo: s[0] === 'BUY' ? 'compra' : 'venda', data: s[1], liquidacao: s[2], simbolo: s[n - 8], descricao: s.slice(3, n - 8).join(' '),
            qtd: Math.abs(num(s[n - 7])), preco: num(s[n - 6]), liquido: Math.abs(num(s[n - 5])),
            taxas: (num(s[n - 4]) || 0) + (num(s[n - 3]) || 0) + (num(s[n - 2]) || 0), pendente,
          });
        }
        continue;
      }
      // Outras atividades: data | TIPO | descrição… | símbolo | qtd | valor | taxa
      if (DATA.test(s[0]) && /^[A-Z_]{4,}$/.test(s[1] || '') && s[1] !== 'SWEEP') {
        const n = s.length;
        const sim = [...l.its].reverse().find((i) => i.x > 400 && i.x < 480 && TICKER.test(i.s))?.s || null;
        const ev = { data: s[0], tipo: s[1], simbolo: sim, qtd: num(s[n - 3]), valor: num(s[n - 2]), taxa: num(s[n - 1]), descricao: s.slice(2, n - 3).join(' ') };
        if (ev.tipo === 'CASH_DIVIDEND') r.proventos.push(ev); else r.outros.push(ev);
        continue;
      }
      // Carteira: descrição… | símbolo | qtd | alugados | preço | valor | valor anterior | % var | % total
      if (sec === 'carteira') {
        let k = s.length;
        while (k > 0 && ehNum(s[k - 1])) k--;
        const nums = s.slice(k);
        if (nums.length >= 7 && k > 0 && TICKER.test(s[k - 1])) {
          r.carteira.push({ simbolo: s[k - 1], descricao: s.slice(0, k - 1).join(' '), qtd: num(nums[0]), preco: num(nums[2]), valor: num(nums[3]) });
        }
      }
    }
    // Proventos: a linha seguinte pode trazer o símbolo quando a descrição empurra (raro); sem símbolo, descarta.
    r.proventos = r.proventos.filter((p) => p.simbolo && p.valor > 0);
    if (!r.inicio) throw new Error(`${file.name}: não parece um extrato da Nomad (período não encontrado).`);
    return r;
  }

  /** Classe provável pelo nome do papel no extrato. */
  function classePelaDescricao(desc) {
    const d = (desc || '').toUpperCase();
    if (/\b(RLTY|REALTY|REIT|EQUINIX|PROPERT|INDL INC|INVITATION HOMES|DIGITAL R)/.test(d)) return 'reit';
    if (/\b(ETF|EXCHANGE[- ]TRADED|ISHARES|INVESCO|SPDR|VANGUARD|WISDOMTREE|FIRST TR|GLOBAL X|VANECK|SELECT SECTOR|TR UNIT|TRUST)\b/.test(d)) return 'etf';
    return 'stock';
  }

  return { ler, num, classePelaDescricao };
})();
