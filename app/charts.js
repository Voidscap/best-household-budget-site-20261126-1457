// Hand-drawn SVG charts: a donut, vertical bars and a simple line chart.
// No chart library, no network — just geometry and the household's own numbers.

import { moneyShort } from './format.js';

const TAU = Math.PI * 2;

function polar(cx, cy, r, angle) {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

// Donut of spending by category. `slices` is [{ label, value, color }].
export function donutChart(slices, size = 220) {
  const total = slices.reduce((a, s) => a + s.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 6;
  const rInner = rOuter - 30;
  if (!total) {
    return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="No spending yet" class="chart">
      <circle cx="${cx}" cy="${cy}" r="${(rOuter + rInner) / 2}" fill="none" stroke="#e5ddcd" stroke-width="30"/>
      <text x="${cx}" y="${cy}" text-anchor="middle" class="chart-empty">No spending yet</text>
    </svg>`;
  }
  let angle = -Math.PI / 2;
  const parts = slices.map((s) => {
    const frac = s.value / total;
    const a0 = angle;
    const a1 = angle + frac * TAU;
    angle = a1;
    const [x0, y0] = polar(cx, cy, rOuter, a0);
    const [x1, y1] = polar(cx, cy, rOuter, a1);
    const [xi1, yi1] = polar(cx, cy, rInner, a1);
    const [xi0, yi0] = polar(cx, cy, rInner, a0);
    const large = frac > 0.5 ? 1 : 0;
    const path = `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${rOuter} ${rOuter} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L ${xi1.toFixed(1)} ${yi1.toFixed(1)} A ${rInner} ${rInner} 0 ${large} 0 ${xi0.toFixed(1)} ${yi0.toFixed(1)} Z`;
    return `<path d="${path}" fill="${s.color}"><title>${s.label}: ${moneyShort(s.value)}</title></path>`;
  });
  return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Spending by category" class="chart">
    ${parts.join('\n    ')}
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" class="chart-center-big">${moneyShort(total)}</text>
    <text x="${cx}" y="${cy + 16}" text-anchor="middle" class="chart-center-small">spent in November</text>
  </svg>`;
}

// Vertical bar chart of monthly totals. `months` is [{ label, income, spending }].
export function monthlyBars(months, width = 560, height = 220) {
  const pad = { top: 14, right: 8, bottom: 26, left: 44 };
  const max = Math.max(1, ...months.flatMap((m) => [m.income, m.spending]));
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const slot = innerW / months.length;
  const barW = Math.min(22, (slot - 18) / 2);
  const y = (v) => pad.top + innerH - (v / max) * innerH;
  const grid = [0.25, 0.5, 0.75, 1].map((f) => {
    const gy = pad.top + innerH - f * innerH;
    return `<line x1="${pad.left}" y1="${gy.toFixed(1)}" x2="${width - pad.right}" y2="${gy.toFixed(1)}" class="grid-line"/>
      <text x="${pad.left - 6}" y="${(gy + 4).toFixed(1)}" text-anchor="end" class="axis-label">${moneyShort(max * f)}</text>`;
  });
  const bars = months.map((m, i) => {
    const x0 = pad.left + i * slot + (slot - barW * 2 - 6) / 2;
    return `<rect x="${x0.toFixed(1)}" y="${y(m.income).toFixed(1)}" width="${barW}" height="${(pad.top + innerH - y(m.income)).toFixed(1)}" rx="3" fill="#1e4636"><title>${m.label} income ${moneyShort(m.income)}</title></rect>
      <rect x="${(x0 + barW + 6).toFixed(1)}" y="${y(m.spending).toFixed(1)}" width="${barW}" height="${(pad.top + innerH - y(m.spending)).toFixed(1)}" rx="3" fill="#d98e32"><title>${m.label} spending ${moneyShort(m.spending)}</title></rect>
      <text x="${(pad.left + i * slot + slot / 2).toFixed(1)}" y="${height - 8}" text-anchor="middle" class="axis-label">${m.label}</text>`;
  });
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Monthly income and spending" class="chart chart-bars">
    ${grid.join('\n    ')}
    ${bars.join('\n    ')}
  </svg>
  <p class="legend"><span class="swatch" style="background:#1e4636"></span> Income
  <span class="swatch" style="background:#d98e32"></span> Spending</p>`;
}

// Horizontal progress bar for one budget line.
export function budgetBar(spent, limit) {
  const frac = limit > 0 ? Math.min(1, spent / limit) : 0;
  const over = limit > 0 && spent > limit;
  const cls = over ? 'bar-fill bar-over' : frac > 0.85 ? 'bar-fill bar-warn' : 'bar-fill';
  return `<div class="bar-track" role="img" aria-label="${Math.round(frac * 100)} percent of budget used">
    <div class="${cls}" style="width:${(frac * 100).toFixed(1)}%"></div>
  </div>`;
}

// A thin savings-progress bar for a goal.
export function goalBar(saved, target) {
  const frac = target > 0 ? Math.min(1, saved / target) : 0;
  return `<div class="bar-track bar-goal" role="img" aria-label="${Math.round(frac * 100)} percent of goal saved">
    <div class="bar-fill bar-saved" style="width:${(frac * 100).toFixed(1)}%"></div>
  </div>`;
}
