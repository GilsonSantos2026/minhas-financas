/**
 * investimentos/cotacoes.js — Dólar e PTAX (sem chave de acesso).
 *
 *  dolar      → AwesomeAPI (comercial, atraso de segundos a poucos minutos). Fica guardado
 *               nas preferências do aparelho para funcionar offline com o último valor.
 *  ptax(data) → PTAX de venda do Banco Central na data (ou no último dia útil antes dela).
 *               Usado para converter em reais o custo das compras em dólar.
 *
 * Nenhum dado do usuário vai nessas consultas (só a data, no caso da PTAX).
 */
window.Fin = window.Fin || {};

Fin.cotacoes = (() => {
  const S = Fin.storage;
  const URL_DOLAR = 'https://economia.awesomeapi.com.br/json/last/USD-BRL';
  const ptaxCache = new Map();

  /** Último dólar conhecido: { valor, em (ISO), fonte } ou null. */
  const dolar = () => S.prefs().dolar || null;

  async function atualizarDolar() {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    try {
      const r = await fetch(URL_DOLAR, { cache: 'no-store', signal: ctrl.signal });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      const q = j.USDBRL;
      const valor = Number(q.bid);
      if (!(valor > 0)) throw new Error('cotação inválida');
      const d = { valor, em: new Date(Number(q.timestamp) * 1000).toISOString(), variacao: Number(q.pctChange) || 0, fonte: 'AwesomeAPI', buscadoEm: new Date().toISOString() };
      S.setPref('dolar', d);
      return d;
    } finally {
      clearTimeout(t);
    }
  }

  const mdY = (iso) => { const [y, m, d] = iso.split('-'); return `${m}-${d}-${y}`; };

  /** PTAX de venda na data (procura até 10 dias para trás: fim de semana/feriado). */
  async function ptax(iso) {
    if (ptaxCache.has(iso)) return ptaxCache.get(iso);
    const salvas = S.prefs().ptax || {};
    if (salvas[iso]) { ptaxCache.set(iso, salvas[iso]); return salvas[iso]; }
    const ini = new Date(`${iso}T12:00:00`);
    ini.setDate(ini.getDate() - 10);
    const iniISO = ini.toISOString().slice(0, 10);
    const url = 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@i,dataFinalCotacao=@f)'
      + `?@i='${mdY(iniISO)}'&@f='${mdY(iso)}'&$format=json&$orderby=dataHoraCotacao%20desc&$top=1`;
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const v = (await r.json()).value?.[0]?.cotacaoVenda;
    if (!(v > 0)) throw new Error('PTAX indisponível');
    ptaxCache.set(iso, v);
    if (iso < Fin.fmt.todayISO()) { // dias passados não mudam: guarda (no máx. 400 datas)
      const novas = { ...salvas, [iso]: v };
      const chaves = Object.keys(novas).sort();
      while (chaves.length > 400) delete novas[chaves.shift()];
      S.setPref('ptax', novas);
    }
    return v;
  }

  /**
   * PTAX de venda de um período inteiro numa consulta só (para importações).
   * Devolve uma função data → valor que usa o último dia útil anterior quando precisa.
   */
  async function ptaxSerie(iniISO, fimISO) {
    const ini = new Date(`${iniISO}T12:00:00`);
    ini.setDate(ini.getDate() - 10);
    const url = 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@i,dataFinalCotacao=@f)'
      + `?@i='${mdY(ini.toISOString().slice(0, 10))}'&@f='${mdY(fimISO)}'&$format=json&$select=cotacaoVenda,dataHoraCotacao&$top=100000`;
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error(`PTAX: HTTP ${r.status}`);
    const lista = ((await r.json()).value || []).map((v) => [v.dataHoraCotacao.slice(0, 10), v.cotacaoVenda]).sort((a, b) => a[0].localeCompare(b[0]));
    if (!lista.length) throw new Error('PTAX indisponível');
    const dias = lista.map((x) => x[0]);
    return (iso) => {
      let lo = 0;
      let hi = dias.length - 1;
      let achado = 0;
      while (lo <= hi) { const mid = (lo + hi) >> 1; if (dias[mid] <= iso) { achado = mid; lo = mid + 1; } else hi = mid - 1; }
      return lista[achado][1];
    };
  }

  /** "há 2 min", "há 3 h", "em 12/11". */
  function idade(iso) {
    if (!iso) return '';
    const min = Math.round((Date.now() - new Date(iso)) / 60000);
    if (min < 1) return 'agora';
    if (min < 60) return `há ${min} min`;
    if (min < 60 * 24) return `há ${Math.round(min / 60)} h`;
    return `em ${Fin.fmt.date(iso.slice(0, 10)).slice(0, 5)}`;
  }

  return { dolar, atualizarDolar, ptax, ptaxSerie, idade };
})();
