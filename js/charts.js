/**
 * charts.js — Gráficos leves em SVG/HTML, sem biblioteca externa.
 *
 * Regras seguidas: cores fixas por série (azul = receitas, laranja = despesas),
 * barras finas (até 24px) com ponta arredondada de 4px, grade discreta,
 * legenda sempre visível, tooltip ao passar o mouse/tocar e tabela alternativa.
 */
window.Fin = window.Fin || {};

Fin.charts = (() => {
  const fmt = Fin.fmt;
  const C = {
    grid: '#e1e0d9',
    axis: '#c3c2b7',
    muted: '#898781',
    ink: '#0b0b0b',
    highlight: '#f1f5f9',
  };
  const SERIES = { receitas: '#2a78d6', despesas: '#eb6834', categoria: '#2a78d6' };

  /** Arredonda o topo do eixo para um número "bonito". */
  function niceMax(v) {
    if (v <= 0) return 1;
    const exp = Math.pow(10, Math.floor(Math.log10(v)));
    const f = v / exp;
    const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
    return nice * exp;
  }

  /** Barra com topo arredondado (4px) e base reta. */
  function barPath(x, y, w, h) {
    const r = Math.min(4, w / 2, h);
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }

  function legend(series) {
    return `<div class="flex flex-wrap gap-4 text-xs text-slate-600">${series
      .map((s) => `<span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm" style="background:${s.color}"></span>${s.label}</span>`)
      .join('')}</div>`;
  }

  /**
   * Colunas agrupadas por mês.
   * @param el    container (o SVG ocupa a largura dele)
   * @param data  [{ ym, receitas, despesas, saldo }]
   * @param opts  { series:[{key,label,color}], selected: 'AAAA-MM', onSelect(ym) }
   */
  function columns(el, data, opts) {
    const W = Math.max(240, el.clientWidth);
    const H = 210;
    const m = { t: 10, r: 6, b: 26, l: 46 };
    const iw = W - m.l - m.r;
    const ih = H - m.t - m.b;
    const n = opts.series.length;
    // Topo do eixo em degraus "redondos" (ex.: 0 / 500 / 1.000 / 1.500 / 2.000)
    const maiorValor = Math.max(0, ...data.flatMap((d) => opts.series.map((s) => d[s.key])));
    const passoY = niceMax(maiorValor / 4 || 0.25);
    const max = Math.max(passoY, Math.ceil(maiorValor / passoY) * passoY);
    const nTicksY = Math.round(max / passoY);
    const y = (v) => m.t + ih - (v / max) * ih;
    const band = iw / data.length;
    const gap = 2;
    const bw = Math.max(4, Math.min(24, (band * 0.62 - gap * (n - 1)) / n));

    let svg = `<svg width="${W}" height="${H}" role="img" aria-label="${fmt.esc(opts.label || 'Gráfico')}" style="display:block">`;

    // destaque do mês selecionado
    data.forEach((d, i) => {
      if (d.ym === opts.selected) svg += `<rect x="${m.l + band * i + 2}" y="${m.t}" width="${band - 4}" height="${ih}" rx="6" fill="${C.highlight}"/>`;
    });

    // grade e eixo
    Array.from({ length: nTicksY + 1 }, (_, k) => k * passoY).forEach((v) => {
      const yy = Math.round(y(v)) + 0.5;
      svg += `<line x1="${m.l}" x2="${W - m.r}" y1="${yy}" y2="${yy}" stroke="${v === 0 ? C.axis : C.grid}" stroke-width="1"/>`;
      svg += `<text x="${m.l - 8}" y="${yy + 4}" text-anchor="end" font-size="11" fill="${C.muted}" class="vlr" style="font-variant-numeric:tabular-nums">${fmt.compact(v)}</text>`;
    });

    // barras (rótulos de mês espaçados quando não cabem todos — ex.: 12 meses no celular)
    const passoRotulo = Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(iw / 42))));
    data.forEach((d, i) => {
      const cx = m.l + band * i + band / 2;
      let x = cx - (n * bw + (n - 1) * gap) / 2;
      opts.series.forEach((s) => {
        const v = d[s.key];
        const h = (v / max) * ih;
        if (h > 0.5) svg += `<path d="${barPath(x, y(v), bw, h)}" fill="${s.color}"/>`;
        x += bw + gap;
      });
      const sel = d.ym === opts.selected;
      const ultimo = i === data.length - 1;
      // mostra a cada "passo"; o último mês sempre aparece (e o vizinho anterior some para não encostar)
      if (!sel && !ultimo && (i % passoRotulo !== 0 || data.length - 1 - i < passoRotulo)) return;
      svg += `<text x="${cx}" y="${H - 8}" text-anchor="middle" font-size="11" fill="${sel ? C.ink : C.muted}" font-weight="${sel ? 600 : 400}">${fmt.monthShort(d.ym)}</text>`;
    });

    // áreas de toque (maiores que as barras)
    data.forEach((d, i) => {
      svg += `<rect data-i="${i}" x="${m.l + band * i}" y="0" width="${band}" height="${H}" fill="transparent" style="cursor:pointer"/>`;
    });
    svg += '</svg>';

    el.style.position = 'relative';
    el.innerHTML = svg + '<div class="chart-tip hidden"></div>';
    const tip = el.querySelector('.chart-tip');

    const show = (i) => {
      const d = data[i];
      tip.innerHTML = `
        <div class="font-semibold mb-1">${fmt.monthLong(d.ym)}</div>
        ${opts.series.map((s) => `<div class="flex items-center gap-2"><span class="w-2 h-2 rounded-sm" style="background:${s.color}"></span>${s.label}<span class="ml-auto pl-3 tabular-nums">${fmt.brl(d[s.key])}</span></div>`).join('')}
        ${d.saldo !== undefined ? `<div class="flex gap-2 border-t border-slate-200 mt-1 pt-1">Saldo<span class="ml-auto pl-3 tabular-nums font-medium">${fmt.brl(d.saldo)}</span></div>` : ''}`;
      tip.classList.remove('hidden');
      const cx = m.l + band * i + band / 2;
      const tw = tip.offsetWidth;
      tip.style.left = `${Math.min(Math.max(0, cx - tw / 2), W - tw)}px`;
      tip.style.top = '0px';
    };
    el.querySelectorAll('rect[data-i]').forEach((r) => {
      const i = Number(r.dataset.i);
      r.addEventListener('pointerenter', () => show(i));
      r.addEventListener('click', () => opts.onSelect && opts.onSelect(data[i].ym));
    });
    el.addEventListener('pointerleave', () => tip.classList.add('hidden'));
  }

  /** Barras horizontais (uma série), com valor na ponta. data: [{ label, icone, total }] */
  function hbars(data, opts = {}) {
    const max = Math.max(...data.map((d) => d.total), 1);
    const total = opts.total || data.reduce((s, d) => s + d.total, 0) || 1;
    return `<ul class="space-y-3">${data
      .map((d) => {
        const pct = Math.round((d.total / total) * 100);
        return `
        <li class="hbar-row text-sm" title="${fmt.esc(d.label)}: ${fmt.brl(d.total)} (${pct}% do total)">
          <span class="truncate text-slate-700">${d.icone ? `<span aria-hidden="true">${d.icone}</span> ` : ''}${fmt.esc(d.label)}</span>
          <span class="flex items-center gap-2 min-w-0">
            <span class="h-2.5 rounded-r" style="width:${Math.max(1.5, (d.total / max) * 100)}%;background:${SERIES.categoria}"></span>
          </span>
          <span class="text-right tabular-nums text-slate-700 whitespace-nowrap">${fmt.brl(d.total)}<span class="text-slate-400 text-xs ml-1">${pct}%</span></span>
        </li>`;
      })
      .join('')}</ul>`;
  }

  /**
   * Linha (uma série) — ex.: saldo acumulado. Aceita valores negativos (linha do zero marcada).
   * @param data [{ ym, valor }]   opts { color, label, nome }
   */
  function line(el, data, opts = {}) {
    const W = Math.max(240, el.clientWidth);
    const H = 200;
    const m = { t: 14, r: 18, b: 26, l: 52 };
    const iw = W - m.l - m.r;
    const ih = H - m.t - m.b;
    const cor = opts.color || SERIES.receitas;
    const vals = data.map((d) => d.valor);
    // Eixo sempre inclui o zero, em degraus "redondos" (ex.: 5 mil), alinhados ao zero.
    const maxV = Math.max(0, ...vals);
    const minV = Math.min(0, ...vals);
    const passo = niceMax((maxV - minV) / 4 || 1);
    const top = Math.ceil(maxV / passo) * passo || passo;
    const bot = Math.floor(minV / passo) * passo;
    const nTicks = Math.round((top - bot) / passo);
    const y = (v) => m.t + ((top - v) / (top - bot || 1)) * ih;
    const x = (i) => m.l + (data.length === 1 ? iw / 2 : (i * iw) / (data.length - 1));

    let svg = `<svg width="${W}" height="${H}" role="img" aria-label="${fmt.esc(opts.label || 'Gráfico de linha')}" style="display:block">`;
    for (let k = 0; k <= nTicks; k++) {
      const v = bot + passo * k;
      const yy = Math.round(y(v)) + 0.5;
      const zero = Math.abs(v) < 1e-9;
      svg += `<line x1="${m.l}" x2="${W - m.r}" y1="${yy}" y2="${yy}" stroke="${zero ? C.axis : C.grid}" stroke-width="1"/>`;
      svg += `<text x="${m.l - 8}" y="${yy + 4}" text-anchor="end" font-size="11" fill="${C.muted}" class="vlr" style="font-variant-numeric:tabular-nums">${fmt.compact(v)}</text>`;
    }
    const passoX = Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(iw / 42))));
    data.forEach((d, i) => {
      const ultimo = i === data.length - 1;
      if (ultimo || (i % passoX === 0 && data.length - 1 - i >= passoX)) {
        svg += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="${C.muted}">${fmt.monthShort(d.ym)}</text>`;
      }
    });
    const pts = data.map((d, i) => `${x(i).toFixed(1)},${y(d.valor).toFixed(1)}`);
    if (data.length > 1) {
      svg += `<path d="M${x(0)},${y(0)}L${pts.join('L')}L${x(data.length - 1)},${y(0)}Z" fill="${cor}" opacity="0.1"/>`;
      svg += `<path d="M${pts.join('L')}" fill="none" stroke="${cor}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    }
    // ponto final com anel na cor da superfície + valor (único rótulo direto)
    const ult = data[data.length - 1];
    const ux = x(data.length - 1);
    const uy = y(ult.valor);
    svg += `<circle cx="${ux}" cy="${uy}" r="5" fill="${cor}" stroke="#fff" stroke-width="2"/>`;
    // rótulo com "halo" branco para não se misturar com a linha
    svg += `<text x="${Math.min(ux, W - 4)}" y="${uy - 10}" text-anchor="end" font-size="12" font-weight="600" fill="${C.ink}" stroke="#fff" stroke-width="3" paint-order="stroke">${fmt.brl(ult.valor)}</text>`;
    // camada de interação
    svg += `<line class="cross" x1="0" x2="0" y1="${m.t}" y2="${m.t + ih}" stroke="${C.axis}" stroke-width="1" visibility="hidden"/>`;
    svg += `<circle class="crossdot" r="5" fill="${cor}" stroke="#fff" stroke-width="2" visibility="hidden"/>`;
    svg += `<rect class="hit" x="${m.l - 10}" y="0" width="${iw + 20}" height="${H}" fill="transparent"/>`;
    svg += '</svg>';

    el.style.position = 'relative';
    el.innerHTML = svg + '<div class="chart-tip hidden"></div>';
    const tip = el.querySelector('.chart-tip');
    const cross = el.querySelector('.cross');
    const dot = el.querySelector('.crossdot');
    const hit = el.querySelector('.hit');

    const mostrar = (clientX) => {
      const r = el.getBoundingClientRect();
      const px = clientX - r.left;
      const i = data.length === 1 ? 0 : Math.max(0, Math.min(data.length - 1, Math.round(((px - m.l) / iw) * (data.length - 1))));
      const d = data[i];
      cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i)); cross.setAttribute('visibility', 'visible');
      dot.setAttribute('cx', x(i)); dot.setAttribute('cy', y(d.valor)); dot.setAttribute('visibility', 'visible');
      tip.innerHTML = `<div class="font-semibold mb-1">${fmt.monthLong(d.ym)}</div>
        <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full" style="background:${cor}"></span>${fmt.esc(opts.nome || 'Valor')}<span class="ml-auto pl-3 tabular-nums">${fmt.brl(d.valor)}</span></div>
        ${d.extra ? `<div class="text-slate-500 mt-0.5">${d.extra}</div>` : ''}`;
      tip.classList.remove('hidden');
      const tw = tip.offsetWidth;
      tip.style.left = `${Math.min(Math.max(0, x(i) - tw / 2), W - tw)}px`;
      tip.style.top = '0px';
    };
    hit.addEventListener('pointermove', (e) => mostrar(e.clientX));
    hit.addEventListener('pointerdown', (e) => mostrar(e.clientX));
    el.addEventListener('pointerleave', () => {
      tip.classList.add('hidden');
      cross.setAttribute('visibility', 'hidden');
      dot.setAttribute('visibility', 'hidden');
    });
  }

  return { columns, hbars, legend, line, SERIES };
})();
