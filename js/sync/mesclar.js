/**
 * sync/mesclar.js — Junta os dados de dois aparelhos, registro a registro.
 *
 * Regras (por id, em cada coleção):
 * - Existe só de um lado → entra.
 * - Existe dos dois lados → vale o editado por último (_mod; senão atualizadoEm/criadoEm).
 * - Foi excluído (em "excluidos") DEPOIS da última edição → sai dos dois lados.
 *   Editado depois da exclusão → volta (a edição é mais recente).
 * Exclusões com mais de 180 dias são esquecidas (para o arquivo não crescer para sempre).
 *
 * Função pura: não lê nem grava nada. Retorna também se cada lado precisa ser atualizado.
 */
window.Fin = window.Fin || {};

Fin.mesclar = (() => {
  const COLS = ['lancamentos', 'cartaoCompras', 'categorias', 'cartoes'];
  const DIAS_EXCLUSAO = 180;
  const mod = (it) => it?._mod || it?.atualizadoEm || it?.criadoEm || '';
  const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  function normalizar(d) {
    const out = { meta: d?.meta ?? null, excluidos: d?.excluidos || {} };
    for (const c of COLS) out[c] = Array.isArray(d?.[c]) ? d[c] : [];
    return out;
  }

  function dataMeta(m) {
    return (m && (m.restauradoEm || m.importadoEm)) || '';
  }

  function mesclar(localBruto, remotoBruto) {
    const local = normalizar(localBruto);
    const remoto = normalizar(remotoBruto);
    const limite = new Date(Date.now() - DIAS_EXCLUSAO * 86400000).toISOString();
    const dados = { excluidos: {} };
    let mudouLocal = false;
    let mudouRemoto = false;

    for (const col of COLS) {
      const eL = local.excluidos[col] || {};
      const eR = remoto.excluidos[col] || {};
      const exc = { ...eL };
      for (const [id, t] of Object.entries(eR)) if (!exc[id] || t > exc[id]) exc[id] = t;

      const mL = new Map(local[col].filter((i) => i && i.id).map((i) => [i.id, i]));
      const mR = new Map(remoto[col].filter((i) => i && i.id).map((i) => [i.id, i]));
      const ids = [...mL.keys(), ...[...mR.keys()].filter((id) => !mL.has(id))];

      const res = [];
      for (const id of ids) {
        const L = mL.get(id);
        const R = mR.get(id);
        const vence = !L ? R : !R ? L : mod(R) > mod(L) ? R : L;
        if (exc[id] && exc[id] >= mod(vence)) {
          // excluído depois da última edição
          if (L) mudouLocal = true;
          if (R) mudouRemoto = true;
          continue;
        }
        if (exc[id]) delete exc[id]; // editado depois de excluído → volta
        res.push(vence);
        if (!L || (vence === R && !igual(L, R))) mudouLocal = true;
        if (!R || (vence === L && !igual(L, R))) mudouRemoto = true;
      }
      for (const [id, t] of Object.entries(exc)) if (t < limite) delete exc[id];
      dados[col] = res;
      dados.excluidos[col] = exc;
      if (!igual(exc, eL)) mudouLocal = true;
      if (!igual(exc, eR)) mudouRemoto = true;
    }

    // meta: fica a da importação/restauração mais recente
    dados.meta = dataMeta(remoto.meta) > dataMeta(local.meta) ? remoto.meta : local.meta;
    if (!igual(dados.meta, local.meta)) mudouLocal = true;
    if (!igual(dados.meta, remoto.meta)) mudouRemoto = true;

    return { dados, mudouLocal, mudouRemoto };
  }

  return { mesclar };
})();
