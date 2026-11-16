/**
 * parsers.js — Converte o conteúdo "cru" das células do Excel em dados limpos.
 *
 * Cada função recebe o valor exatamente como veio da planilha (número, texto,
 * data, vazio...) e devolve um valor normalizado ou null quando não entende.
 */
window.Fin = window.Fin || {};

Fin.parsers = (() => {
  const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const pad = (n) => String(n).padStart(2, '0');

  function isEmpty(v) {
    return v === null || v === undefined || (typeof v === 'string' && v.trim() === '');
  }

  /** Remove acentos, deixa minúsculo e troca símbolos/emojis por espaço. */
  function normalize(text) {
    return String(text ?? '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function text(v) {
    return isEmpty(v) ? null : String(v).trim();
  }

  function validDate(y, m, d) {
    y = Number(y); m = Number(m); d = Number(d);
    const dt = new Date(Date.UTC(y, m - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
    return `${y}-${pad(m)}-${pad(d)}`;
  }

  /**
   * Datas → "AAAA-MM-DD".
   * Aceita: número serial do Excel (ex.: 45987), objeto Date, "26/11/2025", "2025-11-26".
   */
  function toISODate(v) {
    if (isEmpty(v)) return null;
    if (v instanceof Date) {
      return isNaN(v) ? null : `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())}`;
    }
    if (typeof v === 'number') {
      if (v < 1 || v > 2958465) return null; // fora do intervalo de datas do Excel
      const d = XLSX.SSF.parse_date_code(v);
      return d ? validDate(d.y, d.m, d.d) : null;
    }
    const s = String(v).trim();
    let m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/); // dd/mm/aaaa (padrão BR)
    if (m) return validDate(m[3].length === 2 ? '20' + m[3] : m[3], m[2], m[1]);
    m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/); // aaaa-mm-dd
    if (m) return validDate(m[1], m[2], m[3]);
    if (/^\d+(\.\d+)?$/.test(s)) return toISODate(Number(s)); // serial salvo como texto
    return null;
  }

  /**
   * Valores → número com 2 casas.
   * Aceita: 1234.5, "R$ 1.234,56", "-50,00", "(50,00)" (negativo contábil).
   */
  function toNumber(v) {
    if (isEmpty(v)) return null;
    if (typeof v === 'number') return Number.isFinite(v) ? Math.round(v * 100) / 100 : null;

    let s = String(v).trim();
    let neg = false;
    if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
    s = s.replace(/[R$\s ]/g, '');
    if (s.startsWith('-')) { neg = !neg; s = s.slice(1); }
    if (s.endsWith('-')) { neg = !neg; s = s.slice(0, -1); }

    if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.'); // 1.234,56 → 1234.56
    else if ((s.match(/\./g) || []).length > 1) s = s.replace(/\./g, ''); // 1.234.567 → 1234567

    const n = Number(s);
    if (!Number.isFinite(n) || s === '') return null;
    return Math.round((neg ? -n : n) * 100) / 100;
  }

  /** "Entrada"/"Receita"/"Crédito" → 'receita'; "Saída"/"Despesa"/"Débito" → 'despesa'. */
  function toTipo(v) {
    const s = normalize(v);
    if (!s) return null;
    if (/^(e|c|r|\+)$/.test(s) || /(entrada|receita|credito|ganho|renda)/.test(s)) return 'receita';
    if (/^(s|d|-)$/.test(s) || /(saida|despesa|debito|gasto)/.test(s)) return 'despesa';
    return null;
  }

  /** Normaliza o status de pagamento: 'pago' | 'aberto' | 'atrasado' | 'parcial'. */
  function toStatus(v) {
    const s = normalize(v);
    if (!s) return null;
    if (s.includes('parcial')) return 'parcial';
    if (/(atrasad|vencid)/.test(s)) return 'atrasado';
    if (/(nao pago|abert|pendente|a pagar|agendad)/.test(s)) return 'aberto';
    if (/(pago|paga|quitad|^ok$|^sim$|recebid)/.test(s)) return 'pago';
    return null;
  }

  /**
   * Separa o emoji do início do texto: "🎓 Educação" → { icone: '🎓', nome: 'Educação' }.
   * Útil para exibir o ícone da categoria na interface depois.
   */
  function splitEmoji(v) {
    const s = text(v);
    if (!s) return { icone: null, nome: null };
    const m = s.match(/^((?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|️|‍)+)\s*(.*)$/u);
    return m ? { icone: m[1], nome: m[2].trim() || null } : { icone: null, nome: s };
  }

  /** Mês: aceita 4, "04", "abr", "Abril", ou uma data. Retorna 1–12 ou null. */
  function toMonth(v) {
    if (isEmpty(v)) return null;
    if (typeof v === 'number') {
      if (v >= 1 && v <= 12) return Math.trunc(v);
      const iso = toISODate(v);
      return iso ? Number(iso.slice(5, 7)) : null;
    }
    const s = normalize(v);
    if (/^\d{1,2}$/.test(s) && +s >= 1 && +s <= 12) return +s;
    const idx = MESES.indexOf(s.slice(0, 3));
    return idx >= 0 ? idx + 1 : null;
  }

  /**
   * Competência (mês de referência) → "AAAA-MM".
   * Usa as colunas Mês/Ano quando existem; senão cai para a data informada.
   */
  function toCompetencia(mes, ano, fallbackISO) {
    const m = toMonth(mes);
    const y = toNumber(ano);
    if (m && y && y > 1900) return `${Math.trunc(y)}-${pad(m)}`;
    if (m && fallbackISO) return `${fallbackISO.slice(0, 4)}-${pad(m)}`;
    return fallbackISO ? fallbackISO.slice(0, 7) : null;
  }

  /** Parcela: "06/10", "6 de 10" → { atual: 6, total: 10 }. */
  function parseParcela(v) {
    const s = text(v);
    if (!s) return null;
    const m = s.match(/(\d{1,3})\s*(?:\/|de)\s*(\d{1,3})/i);
    return m ? { atual: Number(m[1]), total: Number(m[2]) } : null;
  }

  return {
    isEmpty, normalize, text, toISODate, toNumber, toTipo, toStatus,
    splitEmoji, toMonth, toCompetencia, parseParcela,
  };
})();
