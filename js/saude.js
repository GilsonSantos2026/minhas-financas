/**
 * saude.js — Índice de saúde financeira (0 a 100) e tendência de endividamento, mês a mês.
 *
 * Inspirado no FinHealth Score (Financial Health Network), que mede saúde financeira por
 * comportamentos — gastar, poupar, pedir emprestado e planejar — e adaptado ao que o app sabe
 * dos seus dados. Quatro pilares de 25 pontos:
 *
 *  1. Gasta menos do que ganha — taxa de poupança (receitas − despesas) ÷ receitas.
 *     25 pts com 20% ou mais (regra 50/30/20); 0 com déficit de 10% ou pior.
 *  2. Contas em dia — despesas vencidas no mês pagas até o vencimento (fatura paga a menos não conta).
 *  3. Dívidas sob controle — comprometimento da renda com parcelas (cartão e lançamentos parcelados),
 *     rotativo e juros do cartão ÷ receitas. 25 pts até 10%; 0 a partir de 40% (bancos e o
 *     Banco Central usam ~30% como teto prudente). Mês com rotativo vale no máximo 12 pts.
 *  4. Reserva de emergência — meses de despesas cobertos pela reserva. 25 pts com 6 meses ou mais.
 *
 * Pilar sem dados (ex.: sem receitas ou sem conta de reserva) fica de fora e o índice é
 * proporcional aos pilares avaliados. Faixas: Saudável ≥ 80 · Atenção 40–79 · Vulnerável < 40.
 */
window.Fin = window.Fin || {};

Fin.saude = (() => {
  const F = Fin.finance;
  const fmt = Fin.fmt;
  const S = Fin.storage;
  const MAX = 25;

  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const r2 = (v) => Math.round(v * 100) / 100;
  /** 0..1 entre "zero" (0 ponto) e "cheio" (pontuação máxima); funciona com escala invertida. */
  const escala = (v, zero, cheio) => clamp01((v - zero) / (cheio - zero));
  const fim = (ym) => `${ym}-31`;

  const FAIXAS = [
    { min: 80, id: 'bom', nome: 'Saudável', icone: '✓', cor: '#0ca30c', classe: 'bg-emerald-50 text-emerald-800' },
    { min: 40, id: 'atencao', nome: 'Atenção', icone: '◐', cor: '#fab219', classe: 'bg-amber-50 text-amber-800' },
    { min: 0, id: 'critico', nome: 'Vulnerável', icone: '!', cor: '#d03b3b', classe: 'bg-rose-50 text-rose-700' },
  ];
  const faixa = (score) => FAIXAS.find((f) => score >= f.min) || FAIXAS[2];

  /* ---------------- Dívidas do mês e estoque a vencer ---------------- */

  /** Comprometimento do mês e saldo devedor a vencer no fim do mês ym. */
  function dividas(ym) {
    const compras = S.list('cartaoCompras');
    const cats = F.catsInvestimento();
    const doMes = F.doMes(ym);
    const ehParc = (c) => c.parcela && c.parcela.total > 1 && (c.valor || 0) > 0;
    const parcCartao = F.soma(compras.filter((c) => c.fatura === ym && ehParc(c)));
    const parcOutras = r2(doMes.filter((l) => l.tipo === 'despesa' && l.recorrencia === 'parcelado' && !F.ehAporte(l, cats))
      .reduce((s, l) => s + F.valor(l), 0));
    const rot = F.rotativo(null, ym, 1); // só este mês
    const rotativo = rot.totalFalta;
    const juros = r2(rot.encargos + rot.pagoAMais);

    // Estoque: parcelas que ainda vão vencer, de compras/parcelamentos feitos até o fim do mês.
    const futCartao = F.soma(compras.filter((c) => c.fatura > ym && ehParc(c) && (c.data || '9') <= fim(ym)));
    const inicioGrupo = new Map();
    for (const l of F.lancamentos()) {
      if (l.recorrencia !== 'parcelado' || !l.grupo) continue;
      const c = F.competencia(l);
      if (!inicioGrupo.has(l.grupo) || c < inicioGrupo.get(l.grupo)) inicioGrupo.set(l.grupo, c);
    }
    const futOutras = r2(F.lancamentos().filter((l) => l.tipo === 'despesa' && l.recorrencia === 'parcelado' && l.grupo
      && F.competencia(l) > ym && inicioGrupo.get(l.grupo) <= ym && !F.isPago(l) && !F.ehAporte(l, cats))
      .reduce((s, l) => s + F.valor(l), 0));

    return {
      parcCartao, parcOutras, rotativo, juros,
      servico: r2(parcCartao + parcOutras + rotativo + juros), // o que a dívida "consome" da renda no mês
      futCartao, futOutras,
      estoque: r2(futCartao + futOutras + rotativo), // quanto ainda se deve ao fim do mês
    };
  }

  /* ---------------- Pilares ---------------- */

  function contasEmDia(ym) {
    const hoje = fmt.todayISO();
    const limite = ym < hoje.slice(0, 7) ? fim(ym) : hoje;
    const cats = F.catsInvestimento();
    let total = 0;
    let emDia = 0;
    for (const l of F.doMes(ym)) {
      if (l.tipo !== 'despesa' || F.ehAporte(l, cats)) continue;
      const v = F.dataRef(l);
      if (!v || v > limite) continue;
      total++;
      if (F.statusEfetivo(l) === 'pago' && (!l.dataPagamento || l.dataPagamento <= v) && !F.faturaParcial(l)) emDia++;
    }
    return total ? { pct: emDia / total, total, fora: total - emDia } : null;
  }

  function reservaNoMes(ym) {
    if (!Fin.inv?.temDados?.()) return null;
    // Só avalia se a reserva foi informada alguma vez (conta de reserva com movimento ou ativo de reserva).
    const contasRes = new Set(Fin.inv.contas().filter((c) => c.tipo === 'saldo' && c.classe === 'reserva').map((c) => c.id));
    const ativosRes = new Set(Fin.inv.ativos().filter((a) => a.classe === 'reserva').map((a) => a.id));
    if (!Fin.inv.movs().some((m) => (m.ativo ? ativosRes.has(m.ativo) : contasRes.has(m.conta)))) return null;
    const ate = ym >= fmt.currentYM() ? fmt.todayISO() : fim(ym);
    const saldo = Fin.inv.contasSaldo(ate).filter((c) => c.classe === 'reserva').reduce((s, c) => s + c.valor, 0);
    const ativos = Fin.inv.posicoes(ate).filter((p) => p.classe === 'reserva' && p.qtd > 0)
      .reduce((s, p) => s + (p.valor ?? p.custoBRL ?? 0), 0);
    const valor = saldo + ativos;
    const hist = F.historico(fmt.addMonths(ym, -1), 6).filter((m) => m.despesas > 0);
    const media = hist.length ? hist.reduce((s, m) => s + m.despesas, 0) / hist.length : 0;
    return media > 0 ? { valor, media, meses: valor / media } : null;
  }

  /** Índice do mês: { ym, score|null, faixa, pilares[], dividas, receitas, comprometimento } */
  function mes(ym) {
    const r = F.resumo(ym);
    const d = dividas(ym);
    const pilares = [];

    // 1. Gasta menos do que ganha
    if (r.receitas > 0) {
      const taxa = (r.receitas - r.despesas) / r.receitas;
      pilares.push({
        id: 'gasto', nome: 'Gasta menos do que ganha', icone: '💰', pts: MAX * escala(taxa, -0.1, 0.2),
        texto: taxa >= 0 ? `sobrou ${Math.round(taxa * 100)}% da renda (meta: 20%)` : `gastou ${Math.round(-taxa * 100)}% além da renda`,
      });
    } else if (r.despesas > 0) {
      pilares.push({ id: 'gasto', nome: 'Gasta menos do que ganha', icone: '💰', pts: 0, texto: 'despesas sem receita no mês' });
    }

    // 2. Contas em dia
    const c = contasEmDia(ym);
    if (c) {
      pilares.push({
        id: 'contas', nome: 'Contas em dia', icone: '📅', pts: MAX * c.pct,
        texto: c.fora ? `${c.fora} de ${c.total} conta${c.total > 1 ? 's' : ''} com atraso ou paga a menos` : `todas as ${c.total} contas pagas no prazo`,
      });
    }

    // 3. Dívidas sob controle
    let comprometimento = null;
    if (r.receitas > 0) {
      comprometimento = d.servico / r.receitas;
      let pts = MAX * escala(comprometimento, 0.4, 0.1);
      if (d.rotativo > 0) pts = Math.min(pts, 12);
      pilares.push({
        id: 'dividas', nome: 'Dívidas sob controle', icone: '💳', pts,
        texto: `parcelas e juros = ${Math.round(comprometimento * 100)}% da renda (teto: 30%)${d.rotativo > 0 ? ' · rotativo no mês' : ''}`,
      });
    }

    // 4. Reserva de emergência
    const res = reservaNoMes(ym);
    if (res) {
      pilares.push({
        id: 'reserva', nome: 'Reserva de emergência', icone: '🛟', pts: MAX * escala(res.meses, 0, 6),
        texto: `${res.meses.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${res.meses >= 0.95 && res.meses < 1.05 ? 'mês' : 'meses'} de despesas (meta: 6)`,
      });
    }

    pilares.forEach((p) => { p.pts = Math.round(p.pts * 10) / 10; p.faixa = faixa((p.pts / MAX) * 100); });
    const score = pilares.length ? Math.round((pilares.reduce((s, p) => s + p.pts, 0) / (pilares.length * MAX)) * 100) : null;
    return { ym, score, faixa: score == null ? null : faixa(score), pilares, dividas: d, receitas: r.receitas, comprometimento };
  }

  /** Série de n meses terminando em ym (nunca depois do mês atual). */
  function serie(ym = fmt.currentYM(), n = 12) {
    const ultimo = ym > fmt.currentYM() ? fmt.currentYM() : ym;
    const out = [];
    for (let i = n - 1; i >= 0; i--) out.push(mes(fmt.addMonths(ultimo, -i)));
    // começa no primeiro mês com dados (evita meses vazios antes do início do uso)
    const k = out.findIndex((m) => m.score != null);
    return k < 0 ? [] : out.slice(k);
  }

  return { mes, serie, dividas, faixa, FAIXAS, MAX };
})();
