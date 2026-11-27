// NestEgg router and actions. Hash routes, one view per section, every control
// wired by delegation so a re-render never loses a handler.
//
//   #/                dashboard
//   #/transactions    ledger (filters via ?kind=&cat=&q=)
//   #/budgets         category budgets
//   #/goals           savings goals
//   #/bills           bills and reminders
//   #/reports         reports and CSV export
//   #/guide           budgeting guide
//   #/settings        household settings
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { loadState, saveState, resetState, addTransaction, deleteTransaction, setBudget, addGoalContribution, addGoal, toggleBillPaid, addBill, toCsv } from './store.js';
import { CATEGORIES, INCOME_CATEGORIES } from './data.js';
import { dashboard } from './views-dashboard.js';
import { ledger } from './views-ledger.js';
import { budgets } from './views-budgets.js';
import { goals } from './views-goals.js';
import { bills } from './views-bills.js';
import { reports } from './views-reports.js';
import { guide } from './views-guide.js';
import { settings } from './views-settings.js';

const app = document.getElementById('app');
let state = loadState();

const ROUTES = {
  '': dashboard,
  transactions: ledger,
  budgets,
  goals,
  bills,
  reports,
  guide,
  settings,
};

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, queryString] = raw.split('?');
  return { path: path || '', query: new URLSearchParams(queryString || '') };
}

function render() {
  window.__shotReady = false;
  const { path, query } = parseHash();
  const view = ROUTES[path] || null;
  if (view) {
    document.title = `${view === dashboard ? 'NestEgg' : `${cap(path)} | NestEgg`} — Household Budget Planner`;
    app.innerHTML = view(state, query);
  } else {
    document.title = 'Not found | NestEgg';
    app.innerHTML = `<h1>Not found</h1><p>There is no page at this address. <a href="#/">Back to the dashboard</a>.</p>`;
  }
  document.querySelectorAll('.nav-link').forEach((a) => {
    const target = a.getAttribute('href').replace(/^#\/?/, '').split('?')[0];
    a.classList.toggle('nav-active', target === path);
  });
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formData(form) {
  const data = {};
  new FormData(form).forEach((v, k) => {
    data[k] = typeof v === 'string' ? v : '';
  });
  return data;
}

function say(form, text) {
  const msg = form.querySelector('.form-msg');
  if (msg) msg.textContent = text;
}

function downloadCsv() {
  const blob = new Blob([toCsv(state)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'nestegg-november-2026.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

app.addEventListener('submit', (event) => {
  const form = event.target;
  const action = form.dataset.action;
  if (!action) return;
  event.preventDefault();

  if (action === 'filter') {
    const fields = formData(form);
    const q = (fields.q || '').trim();
    const { query } = parseHash();
    const params = new URLSearchParams();
    if (query.get('kind')) params.set('kind', query.get('kind'));
    if (query.get('cat')) params.set('cat', query.get('cat'));
    if (q) params.set('q', q);
    const suffix = params.toString();
    location.hash = `#/transactions${suffix ? `?${suffix}` : ''}`;
    // Same hash, same view: re-render so the new search applies at once.
    if (location.hash === `#/transactions${suffix ? `?${suffix}` : ''}`) render();
  }

  if (action === 'add-transaction') {
    const fields = formData(form);
    const t = addTransaction(state, fields);
    if (t) {
      say(form, `Added ${t.kind === 'income' ? 'income' : 'spending'} of $${(t.amount / 100).toFixed(2)} — ${t.note}.`);
      form.reset();
      setTimeout(render, 600);
    } else {
      say(form, 'Please fill in a description, a date and an amount over $0.');
    }
  }

  if (action === 'set-budget') {
    const fields = formData(form);
    if (setBudget(state, form.dataset.category, fields.limit)) {
      render();
    }
  }

  if (action === 'add-contribution') {
    const fields = formData(form);
    if (addGoalContribution(state, form.dataset.goal, fields.amount)) {
      render();
    }
  }

  if (action === 'add-goal') {
    const fields = formData(form);
    const g = addGoal(state, fields);
    if (g) {
      say(form, `Goal “${g.name}” created.`);
      form.reset();
      setTimeout(render, 600);
    } else {
      say(form, 'Give the goal a name and a target over $0.');
    }
  }

  if (action === 'add-bill') {
    const fields = formData(form);
    const b = addBill(state, fields);
    if (b) {
      say(form, `Bill “${b.name}” added, due day ${b.dueDay}.`);
      form.reset();
      setTimeout(render, 600);
    } else {
      say(form, 'Give the bill a name, an amount over $0 and a due day from 1 to 31.');
    }
  }

  if (action === 'save-household') {
    const fields = formData(form);
    const payday = Number(fields.payday);
    state.household.name = fields.name.trim().slice(0, 60) || state.household.name;
    state.household.members = fields.members.trim().slice(0, 60);
    state.household.payday = Number.isInteger(payday) && payday >= 1 && payday <= 28 ? payday : state.household.payday;
    saveState(state);
    say(form, 'Settings saved.');
    setTimeout(render, 600);
  }
});

app.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;

  if (action === 'delete-transaction') {
    if (deleteTransaction(state, button.dataset.id)) render();
  }
  if (action === 'toggle-bill') {
    if (toggleBillPaid(state, button.dataset.id)) render();
  }
  if (action === 'export-csv') {
    downloadCsv();
  }
  if (action === 'reset-demo') {
    state = resetState();
    render();
  }
});

// The ledger's category list follows the chosen type: income shows income
// categories, spending shows spending categories.
app.addEventListener('change', (event) => {
  if (event.target.id !== 'kind-select') return;
  const select = document.getElementById('category-select');
  if (!select) return;
  const list = event.target.value === 'income' ? INCOME_CATEGORIES : CATEGORIES;
  select.innerHTML = list.map((c) => `<option value="${c.id}">${c.label}</option>`).join('');
});

window.addEventListener('hashchange', render);
render();
