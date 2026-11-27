// Transactions ledger: add income or spending, filter by category, type or text,
// and remove a line. Every change updates the totals everywhere at once.

import { CATEGORIES, INCOME_CATEGORIES } from './data.js';
import { monthTotals } from './store.js';
import { money, shortDate, escapeHtml, todayIso } from './format.js';

export function ledger(state, query) {
  const filterCat = query.get('cat') || 'all';
  const filterKind = query.get('kind') || 'all';
  const search = (query.get('q') || '').trim().toLowerCase();
  const totals = monthTotals(state);

  const sorted = [...state.transactions].sort((a, b) => (a.date < b.date ? 1 : -1));
  const shown = sorted.filter((t) => {
    if (filterCat !== 'all' && t.category !== filterCat) return false;
    if (filterKind !== 'all' && t.kind !== filterKind) return false;
    if (search && !t.note.toLowerCase().includes(search)) return false;
    return true;
  });

  const shownIncome = shown.filter((t) => t.kind === 'income').reduce((a, t) => a + t.amount, 0);
  const shownSpending = shown.filter((t) => t.kind === 'expense').reduce((a, t) => a + t.amount, 0);

  const allCats = [...CATEGORIES, ...INCOME_CATEGORIES];
  const catLabel = (id) => (allCats.find((c) => c.id === id) || { label: id }).label;

  const filterLink = (params, label, active) =>
    `<a class="chip${active ? ' chip-active' : ''}" href="#/transactions?${params}">${label}</a>`;

  const base = `kind=${filterKind}&cat=${filterCat}${search ? `&q=${encodeURIComponent(search)}` : ''}`;

  return `
  <h1>Transactions</h1>
  <p class="lede">Every dollar in and out for the household. November so far: <strong>${money(totals.income)}</strong> in,
  <strong>${money(totals.spending)}</strong> out.</p>

  <section class="card">
    <h2>Add a transaction</h2>
    <form id="add-form" class="form-grid" data-action="add-transaction">
      <label>Date <input type="date" name="date" value="${todayIso()}" required></label>
      <label>Description <input type="text" name="note" maxlength="80" placeholder="e.g. Green Market weekly shop" required></label>
      <label>Type
        <select name="kind" id="kind-select">
          <option value="expense">Spending</option>
          <option value="income">Income</option>
        </select>
      </label>
      <label>Category
        <select name="category" id="category-select">
          ${CATEGORIES.map((c) => `<option value="${c.id}">${c.label}</option>`).join('')}
        </select>
      </label>
      <label>Amount ($) <input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required></label>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Add transaction</button></div>
      <p class="form-msg" id="add-msg" role="status"></p>
    </form>
  </section>

  <section class="card">
    <h2>November ledger <span class="muted">(${shown.length} shown)</span></h2>
    <form class="filter-row" method="get" action="#/transactions" data-action="filter">
      <label class="sr-only" for="q">Search</label>
      <input type="search" id="q" name="q" value="${escapeHtml(search)}" placeholder="Search descriptions…">
      <button class="btn" type="submit">Search</button>
      <a class="btn btn-ghost" href="#/transactions">Clear</a>
    </form>
    <p class="chips" aria-label="Filter by type">
      ${filterLink(`kind=all&cat=${filterCat}`, 'All', filterKind === 'all')}
      ${filterLink(`kind=income&cat=${filterCat}`, 'Income', filterKind === 'income')}
      ${filterLink(`kind=expense&cat=${filterCat}`, 'Spending', filterKind === 'expense')}
    </p>
    <p class="chips" aria-label="Filter by category">
      ${filterLink(`kind=${filterKind}&cat=all`, 'All categories', filterCat === 'all')}
      ${CATEGORIES.map((c) => filterLink(`kind=${filterKind}&cat=${c.id}`, c.label, filterCat === c.id)).join('')}
    </p>
    <p class="card-note">Showing <strong>${money(shownIncome)}</strong> in and <strong>${money(shownSpending)}</strong> out.</p>
    ${shown.length ? `<table class="table">
      <thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead>
      <tbody>
        ${shown.map((t) => `<tr>
          <td>${shortDate(t.date)}</td>
          <td>${escapeHtml(t.note)}</td>
          <td>${escapeHtml(catLabel(t.category))}</td>
          <td class="num ${t.kind === 'income' ? 'amt-in' : 'amt-out'}">${t.kind === 'income' ? '+' : '&minus;'}${money(t.amount)}</td>
          <td class="num"><button class="btn btn-small" data-action="delete-transaction" data-id="${t.id}">Delete</button></td>
        </tr>`).join('')}
      </tbody>
    </table>` : '<p>Nothing matches those filters. Try clearing them.</p>'}
  </section>`;
}
