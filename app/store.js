// Household state: loads the seed data on first visit, then keeps every change
// in localStorage so the site remembers what the household entered. Works in a
// browser; in Node it falls back to memory so the logic can be tested there.

import { seedState, BUDGET_MONTH } from './data.js';

const KEY = 'nestegg-state-v1';

let memoryState = null;

function storageAvailable() {
  try {
    return typeof localStorage !== 'undefined' && localStorage !== null;
  } catch {
    return false;
  }
}

export function loadState() {
  if (storageAvailable()) {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // Corrupt saved state: fall through to a fresh seed.
    }
  } else if (memoryState) {
    return memoryState;
  }
  const fresh = seedState();
  saveState(fresh);
  return fresh;
}

export function saveState(state) {
  if (storageAvailable()) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return;
    } catch {
      // Storage full or blocked: keep going in memory only.
    }
  }
  memoryState = state;
}

export function resetState() {
  const fresh = seedState();
  saveState(fresh);
  return fresh;
}

let idCounter = 1000;
export function nextId(prefix) {
  idCounter += 1;
  return `${prefix}${Date.now().toString(36)}${idCounter}`;
}

export function monthTransactions(state, year, month) {
  const prefix = `${year}-${String(month).padStart(2, '0')}-`;
  return state.transactions.filter((t) => t.date.startsWith(prefix));
}

export function monthTotals(state, year = BUDGET_MONTH.year, month = BUDGET_MONTH.month) {
  const list = monthTransactions(state, year, month);
  let income = 0;
  let spending = 0;
  const byCategory = {};
  for (const t of list) {
    if (t.kind === 'income') income += t.amount;
    else {
      spending += t.amount;
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    }
  }
  return { income, spending, saved: income - spending, byCategory, count: list.length };
}

export function budgetTotal(state) {
  return Object.values(state.budgets).reduce((a, b) => a + b, 0);
}

export function upcomingBills(state, todayDay = 26) {
  return [...state.bills]
    .filter((b) => !b.paid)
    .sort((a, b) => a.dueDay - b.dueDay)
    .map((b) => ({ ...b, daysAway: b.dueDay >= todayDay ? b.dueDay - todayDay : b.dueDay + 30 - todayDay }));
}

export function addTransaction(state, fields) {
  const amount = Math.round(Number(fields.amount) * 100);
  if (!fields.note || !fields.date || !Number.isFinite(amount) || amount <= 0) return null;
  const t = {
    id: nextId('t'),
    date: fields.date,
    kind: fields.kind === 'income' ? 'income' : 'expense',
    category: fields.category,
    note: fields.note.trim().slice(0, 80),
    amount,
  };
  state.transactions.push(t);
  state.transactions.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  saveState(state);
  return t;
}

export function deleteTransaction(state, id) {
  const before = state.transactions.length;
  state.transactions = state.transactions.filter((t) => t.id !== id);
  if (state.transactions.length !== before) saveState(state);
  return state.transactions.length !== before;
}

export function setBudget(state, category, dollars) {
  const cents = Math.round(Number(dollars) * 100);
  if (!Number.isFinite(cents) || cents < 0) return false;
  state.budgets[category] = cents;
  saveState(state);
  return true;
}

export function addGoalContribution(state, goalId, dollars) {
  const cents = Math.round(Number(dollars) * 100);
  const goal = state.goals.find((g) => g.id === goalId);
  if (!goal || !Number.isFinite(cents) || cents <= 0) return false;
  goal.saved = Math.min(goal.target, goal.saved + cents);
  saveState(state);
  return true;
}

export function addGoal(state, fields) {
  const target = Math.round(Number(fields.target) * 100);
  const saved = Math.round(Number(fields.saved || 0) * 100);
  if (!fields.name || !Number.isFinite(target) || target <= 0) return null;
  const goal = {
    id: nextId('g'),
    name: fields.name.trim().slice(0, 60),
    target,
    saved: Math.max(0, Math.min(target, saved)),
    note: (fields.note || '').trim().slice(0, 140),
  };
  state.goals.push(goal);
  saveState(state);
  return goal;
}

export function toggleBillPaid(state, billId) {
  const bill = state.bills.find((b) => b.id === billId);
  if (!bill) return false;
  bill.paid = !bill.paid;
  saveState(state);
  return true;
}

export function addBill(state, fields) {
  const amount = Math.round(Number(fields.amount) * 100);
  const dueDay = Number(fields.dueDay);
  if (!fields.name || !Number.isFinite(amount) || amount <= 0 || !Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) return null;
  const bill = {
    id: nextId('b'),
    name: fields.name.trim().slice(0, 60),
    amount,
    dueDay,
    paid: false,
    note: (fields.note || '').trim().slice(0, 80),
  };
  state.bills.push(bill);
  saveState(state);
  return bill;
}

export function toCsv(state) {
  const rows = [['Date', 'Type', 'Category', 'Note', 'Amount (USD)']];
  const sorted = [...state.transactions].sort((a, b) => (a.date < b.date ? -1 : 1));
  for (const t of sorted) {
    const safe = t.note.replace(/"/g, '""');
    rows.push([t.date, t.kind, t.category, `"${safe}"`, (t.amount / 100).toFixed(2)]);
  }
  return rows.map((r) => r.join(',')).join('\n');
}
