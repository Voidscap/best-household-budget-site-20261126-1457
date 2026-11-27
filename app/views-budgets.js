// Category budgets: one monthly limit per category, with live progress,
// over-budget warnings and the 50/30/20 rule as a reference point.

import { CATEGORIES, BUDGET_MONTH } from './data.js';
import { monthTotals, budgetTotal } from './store.js';
import { money, monthName, pct, escapeHtml } from './format.js';
import { budgetBar } from './charts.js';

export function budgets(state) {
  const { year, month } = BUDGET_MONTH;
  const totals = monthTotals(state, year, month);
  const totalLimit = budgetTotal(state);
  const totalSpent = totals.spending;

  const rows = CATEGORIES.map((c) => ({
    ...c,
    spent: totals.byCategory[c.id] || 0,
    limit: state.budgets[c.id] || 0,
  })).sort((a, b) => b.spent - a.spent);

  const needs = ['housing', 'groceries', 'transport', 'utilities', 'health'].reduce((a, id) => a + (totals.byCategory[id] || 0), 0);
  const wants = ['dining', 'entertainment', 'clothing', 'subscriptions', 'kids', 'other'].reduce((a, id) => a + (totals.byCategory[id] || 0), 0);
  const income = totals.income || 1;

  return `
  <h1>Budgets — ${monthName(year, month)}</h1>
  <p class="lede">Set a monthly limit for each category. The bars fill as you spend, turn amber past 85%,
  and red when a category goes over.</p>

  <section class="stat-grid" aria-label="Budget totals">
    <article class="stat"><p class="stat-label">Planned for November</p><p class="stat-value">${money(totalLimit)}</p><p class="stat-note">${pct(totalLimit, income)}% of income</p></article>
    <article class="stat"><p class="stat-label">Spent so far</p><p class="stat-value">${money(totalSpent)}</p><p class="stat-note">${pct(totalSpent, totalLimit)}% of the plan</p></article>
    <article class="stat"><p class="stat-label">Still in the plan</p><p class="stat-value">${money(Math.max(0, totalLimit - totalSpent))}</p><p class="stat-note">${rows.filter((r) => r.spent > r.limit).length} categor${rows.filter((r) => r.spent > r.limit).length === 1 ? 'y' : 'ies'} over budget</p></article>
    <article class="stat"><p class="stat-label">Planned saving</p><p class="stat-value">${money(Math.max(0, income - totalLimit))}</p><p class="stat-note">${pct(Math.max(0, income - totalLimit), income)}% of income</p></article>
  </section>

  <section class="card">
    <h2>Category budgets</h2>
    ${rows.map((r) => {
      const left = r.limit - r.spent;
      const status = r.spent > r.limit
        ? `<span class="tag tag-over">Over by ${money(r.spent - r.limit)}</span>`
        : left < r.limit * 0.15
          ? `<span class="tag tag-warn">${money(left)} left</span>`
          : `<span class="tag">${money(left)} left</span>`;
      return `<div class="budget-row">
        <div class="budget-row-head">
          <span><span class="swatch" style="background:${r.color}"></span> <strong>${escapeHtml(r.label)}</strong></span>
          <span>${money(r.spent)} of ${money(r.limit)} ${status}</span>
        </div>
        ${budgetBar(r.spent, r.limit)}
        <form class="budget-edit" data-action="set-budget" data-category="${r.id}">
          <label>Monthly limit ($) <input type="number" name="limit" min="0" step="1" value="${(r.limit / 100).toFixed(0)}" required></label>
          <button class="btn btn-small" type="submit">Save</button>
        </form>
      </div>`;
    }).join('')}
  </section>

  <section class="card">
    <h2>The 50/30/20 check</h2>
    <p>A classic rule of thumb: about 50% of after-tax income for needs, 30% for wants, 20% for saving.
    Here is where November actually lands:</p>
    <ul class="rule-list">
      <li><strong>Needs — ${pct(needs, income)}%</strong> (${money(needs)}): housing, groceries, transport, utilities, health. Target 50%.</li>
      <li><strong>Wants — ${pct(wants, income)}%</strong> (${money(wants)}): dining out, entertainment, clothing, subscriptions, kids, other. Target 30%.</li>
      <li><strong>Saving — ${pct(totals.saved, income)}%</strong> (${money(totals.saved)}): what is left after spending. Target 20%.</li>
    </ul>
    <p class="card-note">The rule is a starting point, not a verdict — a household with high rent will run needs above 50%,
    and that is fine as long as the saving line stays positive. <a href="#/guide">Read the budgeting guide &rarr;</a></p>
  </section>`;
}
