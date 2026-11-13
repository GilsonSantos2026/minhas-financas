/**
 * investimentos/rico.js — Lê a nota de negociação da Rico (padrão SINACOR/B3, PDF com senha).
 *
 * Extrai: número da nota, data do pregão, cada negócio (C/V, mercado, especificação, quantidade,
 * preço, valor) e as taxas (liquidação + registro + emolumentos/transferência + custos).
 * A senha do PDF é pedida a quem importa e não fica guardada.
 */
window.Fin = window.Fin || {};

Fin.rico = (() => {
  const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const num = (s) => { const n = Number(String(s).replace(/\./g, '').replace(',', '.')); return Number.isFinite(n) ? n : null; };
  const ehValor = (s) => /^-?\d{1,3}(\.\d{3})*,\d{2,}$/.test(s);
  const ehQtd = (s) => /^\d{1,3}(\.\d{3})*$|^\d+$/.test(s);
  const iso = (br) => br.split('/').reverse().join('-');

  async function linhas(file, senha) {
    await Fin.faturaLeitor.loadScript(PDFJS);
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
    let pdf;
    try {
      pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer(), password: senha || undefined }).promise;
    } catch (e) {
      if (e?.name === 'PasswordException') throw Object.assign(new Error(senha ? `${file.name}: senha incorreta.` : `${file.name}: o PDF tem senha — informe a senha das notas.`), { senha: true });
      throw e;
    }
    const out = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const vp = page.getViewport({ scale: 1 });
      const tc = await page.getTextContent();
      const its = tc.items.map((i) => ({ s: i.str.replace(/\s+/g, ' ').trim(), x: i.transform[4], y: vp.height - i.transform[5] })).filter((i) => i.s);
      its.sort((a, b) => a.y - b.y || a.x - b.x);
      const ls = [];
      for (const it of its) { const l = ls.find((k) => Math.abs(k.y - it.y) <= 2.5); if (l) l.its.push(it); else ls.push({ y: it.y, its: [it] }); }
      ls.sort((a, b) => a.y - b.y);
      for (const l of ls) { l.its.sort((a, b) => a.x - b.x); out.push({ p, ...l }); }
    }
    return out;
  }

  /** Valor de uma linha de rótulo do resumo financeiro ("Taxa de liquidação 0,24 D"). */
  function valorDoRotulo(L, re) {
    for (const l of L) {
      const s = l.its.map((i) => i.s);
      const k = s.findIndex((t) => re.test(t));
      if (k < 0) continue;
      const v = s.slice(k + 1).find(ehValor);
      if (v != null) return num(v);
    }
    return 0;
  }

  async function ler(file, senha) {
    const L = await linhas(file, senha);
    const texto = L.map((l) => l.its.map((i) => i.s).join(' ')).join('\n');
    if (!/NOTA DE NEGOCIA/i.test(texto)) throw new Error(`${file.name}: não parece uma nota de negociação.`);
    const nota = { arquivo: file.name, numero: null, data: null, negocios: [], taxas: 0, irrf: 0, liquido: null };
    // Número e data do pregão: linha abaixo de "Nr. nota | Folha | Data pregão"
    const i = L.findIndex((l) => /Nr\. ?nota/i.test(l.its.map((x) => x.s).join(' ')));
    if (i >= 0 && L[i + 1]) {
      const s = L[i + 1].its.map((x) => x.s);
      nota.numero = s.find((t) => /^\d{5,}$/.test(t)) || null;
      const d = s.find((t) => /^\d{2}\/\d{2}\/\d{4}$/.test(t));
      if (d) nota.data = iso(d);
    }
    if (!nota.data) { const d = texto.match(/Data preg[ãa]o[\s\S]{0,80}?(\d{2}\/\d{2}\/\d{4})/i); if (d) nota.data = iso(d[1]); }
    if (!nota.data) throw new Error(`${file.name}: data do pregão não encontrada.`);

    for (const l of L) {
      const s = l.its.map((x) => x.s);
      if (!/BOVESPA|B3/i.test(s[0] || '') || !/^[CV]$/.test(s[1] || '')) continue;
      // da direita para a esquerda: D/C | valor | preço | quantidade | obs | especificação…
      let k = s.length - 1;
      if (/^[CD]$/.test(s[k])) k--;
      const valor = num(s[k--]);
      const preco = num(s[k--]);
      const qtd = num(s[k--]);
      if (!(qtd > 0) || !(preco > 0)) continue;
      while (k > 2 && /^[@#DFBTCIPHXYL82]{1,3}$/.test(s[k]) && !/^(CI|PN|ON|ER)$/.test(s[k])) k--;
      const mercado = s[2];
      const esp = s.slice(3, k + 1).filter((t) => !/^\d+$/.test(t)).join(' ').trim();
      const tk = esp.match(/\b([A-Z]{4}\d{1,2}[A-Z]?)\b/);
      nota.negocios.push({ tipo: s[1] === 'C' ? 'compra' : 'venda', mercado, especificacao: esp, ticker: tk ? tk[1].replace(/F$/, '') : null, qtd, preco, valor: valor || qtd * preco });
    }
    if (!nota.negocios.length) throw new Error(`${file.name}: nenhum negócio encontrado.`);
    nota.taxas = Math.round((valorDoRotulo(L, /^Taxa de liquida/i) + valorDoRotulo(L, /^Taxa de Registro/i)
      + valorDoRotulo(L, /^Total Bovespa/i) + valorDoRotulo(L, /^Total Custos/i)) * 100) / 100;
    nota.irrf = valorDoRotulo(L, /^I\.R\.R\.F/i);
    const liq = L.find((l) => /^L[íi]quido para/i.test(l.its.map((x) => x.s).join(' ')));
    if (liq) nota.liquido = num(liq.its.map((x) => x.s).find(ehValor));
    return nota;
  }

  return { ler };
})();
