// Bills and reminders: recurring household bills, due days, paid state,
// and a running total of what is still owed this month.

import { money, escapeHtml } from './format.js';
import { upcomingBills } from './store.js';

export function bills(state) {
  const unpaid = state.bills.filter((b) => !b.paid);
  const paid = state.bills.filter((b) => b.paid);
  const unpaidTotal = unpaid.reduce((a, b) => a + b.amount, 0);
  const paidTotal = paid.reduce((a, b) => a + b.amount, 0);
  const next = upcomingBills(state);

  const row = (b) => `<tr>
    <td><strong>${escapeHtml(b.name)}</strong><br><span class="muted">${escapeHtml(b.note || '')}</span></td>
    <td>Day ${b.dueDay}</td>
    <td class="num">${money(b.amount)}</td>
    <td><button class="btn btn-small" data-action="toggle-bill" data-id="${b.id}">${b.paid ? 'Mark unpaid' : 'Mark paid'}</button></td>
  </tr>`;

  return `
  <h1>Bills &amp; reminders</h1>
  <p class="lede">The fixed costs that arrive on a schedule. ${unpaid.length} still to pay in November
  (${money(unpaidTotal)}), ${paid.length} already paid (${money(paidTotal)}).</p>

  ${next.length ? `<section class="card callout">
    <h2>Next up</h2>
    <p><strong>${escapeHtml(next[0].name)}</strong> — ${money(next[0].amount)} — due day ${next[0].dueDay}
    (${next[0].daysAway === 0 ? 'today' : `in ${next[0].daysAway} day${next[0].daysAway === 1 ? '' : 's'}`}).</p>
  </section>` : `<section class="card callout"><h2>All clear</h2><p>Every November bill is paid.</p></section>`}

  <section class="card">
    <h2>Still to pay</h2>
    ${unpaid.length ? `<table class="table">
      <thead><tr><th>Bill</th><th>Due</th><th class="num">Amount</th><th></th></tr></thead>
      <tbody>${unpaid.sort((a, b) => a.dueDay - b.dueDay).map(row).join('')}</tbody>
    </table>` : '<p>Nothing left to pay this month.</p>'}
  </section>

  <section class="card">
    <h2>Paid in November</h2>
    ${paid.length ? `<table class="table">
      <thead><tr><th>Bill</th><th>Due</th><th class="num">Amount</th><th></th></tr></thead>
      <tbody>${paid.sort((a, b) => a.dueDay - b.dueDay).map(row).join('')}</tbody>
    </table>` : '<p>No bills marked paid yet.</p>'}
  </section>

  <section class="card">
    <h2>Add a recurring bill</h2>
    <form class="form-grid" data-action="add-bill">
      <label>Bill name <input type="text" name="name" maxlength="60" placeholder="e.g. Home insurance" required></label>
      <label>Amount ($) <input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required></label>
      <label>Due day of month <input type="number" name="dueDay" min="1" max="31" placeholder="15" required></label>
      <label>Note <input type="text" name="note" maxlength="80" placeholder="e.g. Annual, paid monthly"></label>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Add bill</button></div>
      <p class="form-msg" role="status"></p>
    </form>
    <p class="card-note">Tip: put the due day one or two days before the real deadline, so a slow payment still lands on time.</p>
  </section>`;
}
