// Reports: six-month trends, category breakdown, biggest expenses,
// plain-language insights computed from the household's own numbers.

import { CATEGORIES, BUDGET_MONTH } from './data.js';
import { monthTotals } from './store.js';
import { money, monthName, pct, escapeHtml } from './format.js';
import { monthlyBars } from './charts.js';

export function reports(state) {
  const { year, month } = BUDGET_MONTH;
  const totals = monthTotals(state, year, month);

  const months = state.history.map((h) => ({
    label: new Date(h.year, h.month - 1, 1).toLocaleString('en-US', { month: 'short' }),
    income: h.income,
    spending: h.month === month && h.year === year ? totals.spending : h.spending,
  }));

  const breakdown = CATEGORIES.map((c) => ({
    ...c,
    spent: totals.byCategory[c.id] || 0,
  }))
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  const biggest = [...state.transactions]
    .filter((t) => t.kind === 'expense' && t.date.startsWith('2026-11-'))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const avgSpending = Math.round(months.reduce((a, m) => a + m.spending, 0) / months.length);
  const avgIncome = Math.round(months.reduce((a, m) => a + m.income, 0) / months.length);
  const topCat = breakdown[0];
  const dining = totals.byCategory.dining || 0;

  const insights = [];
  if (totals.spending < avgSpending) {
    insights.push(`November spending (${money(totals.spending)}) is running below the six-month average (${money(avgSpending)}) — the household is on track for one of its lighter months.`);
  } else {
    insights.push(`November spending (${money(totals.spending)}) is above the six-month average (${money(avgSpending)}). Check the categories below for the reason.`);
  }
  if (topCat) {
    insights.push(`${topCat.label} is the biggest slice at ${money(topCat.spent)} — ${pct(topCat.spent, totals.spending)}% of November spending. Housing is fixed, so the lever is usually the next category down.`);
  }
  if (totals.saved > 0) {
    insights.push(`The household is saving ${money(totals.saved)} this month, a ${pct(totals.saved, totals.income)}% savings rate. At that pace, the emergency fund reaches its goal in about ${Math.max(1, Math.ceil((1000000 - 600000) / Math.max(1, totals.saved)))} months.`);
  } else {
    insights.push('Spending is ahead of income this month. Look for one category to trim before the month ends — dining out is usually the easiest to move.');
  }
  if (dining > 0) {
    insights.push(`Dining out is ${money(dining)} so far. One home-cooked dinner instead of takeout typically saves $25–$40 a time.`);
  }

  return `
  <h1>Reports — ${monthName(year, month)}</h1>
  <p class="lede">Six months of income against spending, where November's money actually went,
  and what the numbers suggest doing next.</p>

  <section class="stat-grid" aria-label="Six-month averages">
    <article class="stat"><p class="stat-label">Average income / month</p><p class="stat-value">${money(avgIncome)}</p><p class="stat-note">June – November 2026</p></article>
    <article class="stat"><p class="stat-label">Average spending / month</p><p class="stat-value">${money(avgSpending)}</p><p class="stat-note">June – November 2026</p></article>
    <article class="stat"><p class="stat-label">November saving</p><p class="stat-value">${money(totals.saved)}</p><p class="stat-note">${pct(totals.saved, totals.income)}% of income</p></article>
    <article class="stat"><p class="stat-label">Transactions</p><p class="stat-value">${totals.count}</p><p class="stat-note">in November so far</p></article>
  </section>

  <section class="card">
    <h2>Income vs spending, June – November</h2>
    ${monthlyBars(months)}
    <p class="card-note">Income is steady near ${money(617000)} a month. September was the heaviest spending month
    (${money(443000)}); August the lightest (${money(387500)}).</p>
  </section>

  <section class="two-col">
    <article class="card">
      <h2>November by category</h2>
      <table class="table">
        <thead><tr><th>Category</th><th class="num">Spent</th><th class="num">Share</th></tr></thead>
        <tbody>
          ${breakdown.map((c) => `<tr><td><span class="swatch" style="background:${c.color}"></span> ${escapeHtml(c.label)}</td><td class="num">${money(c.spent)}</td><td class="num">${pct(c.spent, totals.spending)}%</td></tr>`).join('')}
        </tbody>
      </table>
    </article>
    <article class="card">
      <h2>Biggest single expenses</h2>
      <ul class="txn-list">
        ${biggest.map((t) => `<li><span>${escapeHtml(t.note)}</span><span class="amt-out">&minus;${money(t.amount)}</span></li>`).join('')}
      </ul>
      <p class="card-note">Rent aside, the biggest single outlays are groceries and the kids' winter coats —
      both planned, neither a surprise.</p>
    </article>
  </section>

  <section class="card">
    <h2>What the numbers say</h2>
    <ul class="insight-list">
      ${insights.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}
    </ul>
    <p><button class="btn" data-action="export-csv">Download November as CSV</button>
    <span class="card-note">A plain CSV of every transaction, made on this device — nothing is uploaded.</span></p>
  </section>`;
}
