// Dashboard: the month at a glance — totals, spending donut, six-month bars,
// budget progress, upcoming bills, savings goals and recent transactions.

import { CATEGORIES, BUDGET_MONTH } from './data.js';
import { monthTotals, budgetTotal, upcomingBills } from './store.js';
import { money, moneyShort, monthName, pct, shortDate, escapeHtml } from './format.js';
import { donutChart, monthlyBars, budgetBar, goalBar } from './charts.js';

export function dashboard(state) {
  const { year, month } = BUDGET_MONTH;
  const totals = monthTotals(state, year, month);
  const budget = budgetTotal(state);
  const bills = upcomingBills(state);
  const recent = [...state.transactions]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);

  const slices = CATEGORIES.map((c) => ({
    label: c.label,
    value: totals.byCategory[c.id] || 0,
    color: c.color,
  })).filter((s) => s.value > 0);

  const months = state.history.map((h) => ({
    label: new Date(h.year, h.month - 1, 1).toLocaleString('en-US', { month: 'short' }),
    income: h.income,
    spending: h.month === month && h.year === year ? totals.spending : h.spending,
  }));

  const topBudgets = CATEGORIES.map((c) => ({
    ...c,
    spent: totals.byCategory[c.id] || 0,
    limit: state.budgets[c.id] || 0,
  }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 4);

  const savedPct = totals.income > 0 ? pct(totals.saved, totals.income) : 0;

  return `
  <section class="hero">
    <div>
      <p class="eyebrow">November 2026 &middot; ${escapeHtml(state.household.name)}</p>
      <h1>Your money, in one calm place.</h1>
      <p class="lede">Income, spending, budgets, bills and savings for the whole household —
      updated the moment you enter something, and kept on this device only.</p>
      <p class="hero-actions">
        <a class="btn btn-primary" href="#/transactions">Add a transaction</a>
        <a class="btn" href="#/reports">See the reports</a>
      </p>
    </div>
    <div class="hero-card">
      <p class="card-label">Left to spend in November</p>
      <p class="hero-number">${money(Math.max(0, budget - totals.spending))}</p>
      <p class="card-note">of a ${money(budget)} monthly plan &middot; ${money(totals.spending)} spent so far</p>
      ${budgetBar(totals.spending, budget)}
      <p class="card-note">${savedPct}% of income saved this month</p>
    </div>
  </section>

  <section class="stat-grid" aria-label="November totals">
    <article class="stat"><p class="stat-label">Income</p><p class="stat-value">${money(totals.income)}</p><p class="stat-note">${totals.count} transactions this month</p></article>
    <article class="stat"><p class="stat-label">Spending</p><p class="stat-value">${money(totals.spending)}</p><p class="stat-note">${money(budget - totals.spending)} under plan</p></article>
    <article class="stat"><p class="stat-label">Saved</p><p class="stat-value">${money(totals.saved)}</p><p class="stat-note">${savedPct}% savings rate</p></article>
    <article class="stat"><p class="stat-label">Bills still due</p><p class="stat-value">${bills.length}</p><p class="stat-note">${bills.length ? `${money(bills.reduce((a, b) => a + b.amount, 0))} to pay` : 'All paid for November'}</p></article>
  </section>

  <section class="two-col">
    <article class="card">
      <h2>Where November went</h2>
      <div class="donut-wrap">
        ${donutChart(slices)}
        <ul class="donut-legend">
          ${slices.map((s) => `<li><span class="swatch" style="background:${s.color}"></span>${escapeHtml(s.label)} <strong>${money(s.value)}</strong></li>`).join('')}
        </ul>
      </div>
      <p><a href="#/budgets">Adjust the budgets &rarr;</a></p>
    </article>
    <article class="card">
      <h2>Six months: income vs spending</h2>
      ${monthlyBars(months)}
      <p class="card-note">November spending updates live as you add transactions. Income has stayed near ${money(617000)} a month; spending is lowest in August, highest in September.</p>
    </article>
  </section>

  <section class="two-col">
    <article class="card">
      <h2>Budgets to watch</h2>
      ${topBudgets.map((b) => `
        <div class="budget-line">
          <div class="budget-line-head"><span>${escapeHtml(b.label)}</span><span>${money(b.spent)} of ${money(b.limit)}</span></div>
          ${budgetBar(b.spent, b.limit)}
        </div>`).join('')}
      <p><a href="#/budgets">All eleven budgets &rarr;</a></p>
    </article>
    <article class="card">
      <h2>Bills coming up</h2>
      ${bills.length ? `<ul class="bill-list">
        ${bills.slice(0, 4).map((b) => `<li><span><strong>${escapeHtml(b.name)}</strong> &middot; due day ${b.dueDay}</span><span>${money(b.amount)}</span></li>`).join('')}
      </ul>` : '<p>Every November bill is paid. Nice work.</p>'}
      <p><a href="#/bills">All bills &amp; reminders &rarr;</a></p>
    </article>
  </section>

  <section class="two-col">
    <article class="card">
      <h2>Savings goals</h2>
      ${state.goals.map((g) => `
        <div class="goal-line">
          <div class="budget-line-head"><span>${escapeHtml(g.name)}</span><span>${money(g.saved)} of ${money(g.target)}</span></div>
          ${goalBar(g.saved, g.target)}
        </div>`).join('')}
      <p><a href="#/goals">Add money to a goal &rarr;</a></p>
    </article>
    <article class="card">
      <h2>Recent transactions</h2>
      <ul class="txn-list">
        ${recent.map((t) => {
          const cat = CATEGORIES.find((c) => c.id === t.category);
          return `<li><span>${shortDate(t.date)} &middot; ${escapeHtml(t.note)}</span><span class="${t.kind === 'income' ? 'amt-in' : 'amt-out'}">${t.kind === 'income' ? '+' : '&minus;'}${money(t.amount)}</span></li>`;
        }).join('')}
      </ul>
      <p><a href="#/transactions">Full ledger &rarr;</a></p>
    </article>
  </section>`;
}
