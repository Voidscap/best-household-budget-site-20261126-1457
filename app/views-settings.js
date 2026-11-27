// Settings: the household's name and payday, plus a way to start over
// with the sample data. Everything here is stored only in this browser.

import { escapeHtml } from './format.js';

export function settings(state) {
  return `
  <h1>Settings</h1>
  <p class="lede">Your household, your rules. Everything on this site lives in this browser only —
  there is no account, no server, and nothing is ever sent anywhere.</p>

  <section class="card">
    <h2>Household</h2>
    <form class="form-grid" data-action="save-household">
      <label>Household name <input type="text" name="name" maxlength="60" value="${escapeHtml(state.household.name)}" required></label>
      <label>Members <input type="text" name="members" maxlength="60" value="${escapeHtml(state.household.members)}" placeholder="e.g. Maya &amp; Jordan"></label>
      <label>Payday (day of month) <input type="number" name="payday" min="1" max="28" value="${state.household.payday}" required></label>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Save settings</button></div>
      <p class="form-msg" role="status"></p>
    </form>
  </section>

  <section class="card">
    <h2>Your data</h2>
    <p>Transactions, budgets, goals and bills are saved in this browser's local storage.
    Clearing your browser data clears them too — so export a CSV from the
    <a href="#/reports">reports page</a> if you want a copy.</p>
    <p><button class="btn" data-action="reset-demo">Reset to the sample household</button>
    <span class="card-note">Restores the original November 2026 sample data and discards your changes.</span></p>
  </section>

  <section class="card">
    <h2>About NestEgg</h2>
    <p>NestEgg is a household budget planner that runs entirely from its own files — no account,
    no tracking, no network requests. Add transactions, set budgets, track savings goals and
    never miss a bill. Made as an entry for the make.fun “best household budget site” competition.</p>
    <p class="card-note">All figures shown are sample data for a fictional household, so you can try every feature right away.</p>
  </section>`;
}
