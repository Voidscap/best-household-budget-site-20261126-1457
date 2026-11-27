// Seed data for the NestEgg demo household: the Rivera family, November 2026.
// Every figure is invented sample data so the site opens with a real, working
// budget already in place. Amounts are stored in integer cents.

export const CATEGORIES = [
  { id: 'housing', label: 'Housing', color: '#1e4636' },
  { id: 'groceries', label: 'Groceries', color: '#2e7d5b' },
  { id: 'transport', label: 'Transport', color: '#d98e32' },
  { id: 'utilities', label: 'Utilities', color: '#5b8a9c' },
  { id: 'dining', label: 'Dining out', color: '#c65b39' },
  { id: 'entertainment', label: 'Entertainment', color: '#8a6fb8' },
  { id: 'health', label: 'Health', color: '#4a9e8f' },
  { id: 'clothing', label: 'Clothing', color: '#a8763e' },
  { id: 'kids', label: 'Kids', color: '#e07856' },
  { id: 'subscriptions', label: 'Subscriptions', color: '#6b7fa3' },
  { id: 'other', label: 'Other', color: '#8a8f98' },
];

export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Salary' },
  { id: 'side', label: 'Side income' },
  { id: 'refund', label: 'Refund' },
  { id: 'other-income', label: 'Other income' },
];

export const BUDGET_MONTH = { year: 2026, month: 11 };

export function seedState() {
  return {
    household: { name: 'The Rivera household', members: 'Maya & Jordan', payday: 1 },
    budgets: {
      housing: 145000,
      groceries: 65000,
      transport: 32000,
      utilities: 28000,
      dining: 24000,
      entertainment: 12000,
      health: 15000,
      clothing: 10000,
      kids: 18000,
      subscriptions: 6500,
      other: 10000,
    },
    goals: [
      { id: 'g1', name: 'Emergency fund', target: 1000000, saved: 600000, note: 'Six months of essentials, kept in a high-yield savings account.' },
      { id: 'g2', name: 'Summer road trip', target: 300000, saved: 185000, note: 'Two weeks down the coast, including gas, stays and food.' },
      { id: 'g3', name: 'Replace the sedan', target: 1200000, saved: 420000, note: 'Saving for a reliable used car before the old one gives up.' },
    ],
    bills: [
      { id: 'b1', name: 'Rent', amount: 145000, dueDay: 1, paid: true, note: 'Maple Court apartment' },
      { id: 'b2', name: 'Electric', amount: 13200, dueDay: 12, paid: true, note: 'City Power, metered' },
      { id: 'b3', name: 'Internet', amount: 7900, dueDay: 15, paid: false, note: 'Fiber 300 Mbps' },
      { id: 'b4', name: 'Water', amount: 6400, dueDay: 18, paid: false, note: 'City Water' },
      { id: 'b5', name: 'Phone — Maya', amount: 5500, dueDay: 20, paid: false, note: 'Mobile plan' },
      { id: 'b6', name: 'Phone — Jordan', amount: 5500, dueDay: 20, paid: false, note: 'Mobile plan' },
      { id: 'b7', name: 'Car insurance', amount: 18700, dueDay: 25, paid: false, note: 'Full coverage, sedan' },
      { id: 'b8', name: 'Gym', amount: 4500, dueDay: 5, paid: true, note: 'Family membership' },
      { id: 'b9', name: 'Streaming bundle', amount: 1600, dueDay: 8, paid: true, note: 'Two services, shared plan' },
    ],
    // Six months of history for the reports charts (income and spending, cents).
    history: [
      { year: 2026, month: 6, income: 612000, spending: 398500 },
      { year: 2026, month: 7, income: 617000, spending: 421000 },
      { year: 2026, month: 8, income: 609000, spending: 387500 },
      { year: 2026, month: 9, income: 625000, spending: 443000 },
      { year: 2026, month: 10, income: 618000, spending: 402000 },
      { year: 2026, month: 11, income: 617000, spending: 0 },
    ],
    transactions: [
      { id: 't01', date: '2026-11-01', kind: 'income', category: 'salary', note: 'Payday — Maya', amount: 325000 },
      { id: 't02', date: '2026-11-01', kind: 'income', category: 'salary', note: 'Payday — Jordan', amount: 260000 },
      { id: 't03', date: '2026-11-01', kind: 'expense', category: 'housing', note: 'Rent — Maple Court', amount: 145000 },
      { id: 't04', date: '2026-11-02', kind: 'expense', category: 'groceries', note: 'Green Market weekly shop', amount: 14250 },
      { id: 't05', date: '2026-11-03', kind: 'expense', category: 'transport', note: 'Gas — Shell station', amount: 4800 },
      { id: 't06', date: '2026-11-04', kind: 'expense', category: 'dining', note: 'Taco night with the kids', amount: 3850 },
      { id: 't07', date: '2026-11-05', kind: 'expense', category: 'subscriptions', note: 'Streaming bundle', amount: 1600 },
      { id: 't08', date: '2026-11-05', kind: 'expense', category: 'kids', note: 'School lunch money', amount: 6000 },
      { id: 't09', date: '2026-11-06', kind: 'expense', category: 'groceries', note: 'Bakery and fruit stand', amount: 4120 },
      { id: 't10', date: '2026-11-07', kind: 'expense', category: 'entertainment', note: 'Movie night tickets', amount: 5400 },
      { id: 't11', date: '2026-11-08', kind: 'expense', category: 'transport', note: 'Bus passes — both kids', amount: 7000 },
      { id: 't12', date: '2026-11-09', kind: 'expense', category: 'groceries', note: 'Green Market weekly shop', amount: 12875 },
      { id: 't13', date: '2026-11-10', kind: 'expense', category: 'health', note: 'Pharmacy — flu shots', amount: 4500 },
      { id: 't14', date: '2026-11-11', kind: 'expense', category: 'dining', note: 'Pizza Friday', amount: 3200 },
      { id: 't15', date: '2026-11-12', kind: 'expense', category: 'utilities', note: 'Electric bill', amount: 13200 },
      { id: 't16', date: '2026-11-13', kind: 'expense', category: 'clothing', note: 'Winter coats for the kids', amount: 8900 },
      { id: 't17', date: '2026-11-14', kind: 'expense', category: 'entertainment', note: 'Board game — family night', amount: 3400 },
      { id: 't18', date: '2026-11-15', kind: 'expense', category: 'groceries', note: 'Green Market weekly shop', amount: 13540 },
      { id: 't19', date: '2026-11-15', kind: 'income', category: 'side', note: 'Weekend market stall', amount: 32000 },
      { id: 't20', date: '2026-11-16', kind: 'expense', category: 'transport', note: 'Gas — Shell station', amount: 5100 },
      { id: 't21', date: '2026-11-17', kind: 'expense', category: 'kids', note: 'Soccer cleats', amount: 7200 },
      { id: 't22', date: '2026-11-18', kind: 'expense', category: 'dining', note: 'Lunch with coworkers', amount: 1850 },
      { id: 't23', date: '2026-11-19', kind: 'expense', category: 'health', note: 'Dentist checkup — Jordan', amount: 9500 },
      { id: 't24', date: '2026-11-20', kind: 'expense', category: 'groceries', note: 'Thanksgiving prep shop', amount: 9640 },
      { id: 't25', date: '2026-11-21', kind: 'expense', category: 'other', note: 'Household supplies', amount: 4100 },
      { id: 't26', date: '2026-11-22', kind: 'expense', category: 'transport', note: 'Parking — downtown', amount: 1200 },
      { id: 't27', date: '2026-11-23', kind: 'expense', category: 'dining', note: 'Coffee and pastries', amount: 2400 },
      { id: 't28', date: '2026-11-24', kind: 'expense', category: 'subscriptions', note: 'Cloud storage plan', amount: 200 },
      { id: 't29', date: '2026-11-25', kind: 'expense', category: 'utilities', note: 'Water bill', amount: 6400 },
      { id: 't30', date: '2026-11-26', kind: 'expense', category: 'kids', note: 'School field trip', amount: 3500 },
    ],
  };
}
