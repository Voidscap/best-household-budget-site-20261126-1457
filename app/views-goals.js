// Savings goals: progress toward each goal, add money to one, or start a new goal.

import { money, pct, escapeHtml } from './format.js';
import { goalBar } from './charts.js';

export function goals(state) {
  const totalSaved = state.goals.reduce((a, g) => a + g.saved, 0);
  const totalTarget = state.goals.reduce((a, g) => a + g.target, 0);

  return `
  <h1>Savings goals</h1>
  <p class="lede">Money with a job to do. ${money(totalSaved)} saved toward ${money(totalTarget)} across
  ${state.goals.length} goals — ${pct(totalSaved, totalTarget)}% of the way there.</p>

  <section class="goal-grid">
    ${state.goals.map((g) => {
      const p = pct(g.saved, g.target);
      const remaining = g.target - g.saved;
      return `<article class="card goal-card">
        <h2>${escapeHtml(g.name)}</h2>
        <p class="goal-numbers"><strong>${money(g.saved)}</strong> of ${money(g.target)}</p>
        ${goalBar(g.saved, g.target)}
        <p class="card-note">${p}% saved &middot; ${remaining > 0 ? `${money(remaining)} to go` : 'Goal reached!'}</p>
        ${g.note ? `<p>${escapeHtml(g.note)}</p>` : ''}
        <form class="form-inline" data-action="add-contribution" data-goal="${g.id}">
          <label>Add to this goal ($) <input type="number" name="amount" min="1" step="1" placeholder="100" required></label>
          <button class="btn btn-small" type="submit">Add</button>
        </form>
      </article>`;
    }).join('')}
  </section>

  <section class="card">
    <h2>Start a new goal</h2>
    <form class="form-grid" data-action="add-goal">
      <label>Goal name <input type="text" name="name" maxlength="60" placeholder="e.g. New bikes for the kids" required></label>
      <label>Target amount ($) <input type="number" name="target" min="1" step="1" placeholder="1000" required></label>
      <label>Already saved ($) <input type="number" name="saved" min="0" step="1" value="0"></label>
      <label>What is it for? <input type="text" name="note" maxlength="140" placeholder="A sentence about the goal"></label>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Create goal</button></div>
      <p class="form-msg" role="status"></p>
    </form>
    <p class="card-note">Tip: name the goal after the thing it buys, not the account it sits in.
    “Summer road trip” beats “Savings account 2” every time you are tempted to dip in.</p>
  </section>`;
}
