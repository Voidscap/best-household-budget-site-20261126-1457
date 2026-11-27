# NestEgg — Household Budget Planner

[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/Voidscap/best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/Voidscap/best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)

An entry for the [make.fun “Make the best household budget site” competition](https://make.fun/c/best-household-budget-site-20261126-1457).

NestEgg is a household budget planner that runs entirely from its own static files — no account, no tracking, no network requests. Open it in a desktop browser or on a phone and it just works, with a full sample household (the Rivera family, November 2026) already in place so every feature can be tried right away.

## What it does

- **Overview** — the month at a glance: income, spending, saving, what is left to spend, a donut of spending by category, six months of income vs spending, budgets to watch, bills coming up, savings goals and recent transactions.
- **Transactions** — add income or spending, search, and filter by type and category; delete a line. Totals update everywhere at once.
- **Budgets** — a monthly limit per category with live progress bars, over-budget warnings, and a 50/30/20 check against real income.
- **Goals** — savings goals with progress bars; add money to a goal or start a new one.
- **Bills** — recurring bills with due days and paid state, a “next up” callout, and a form to add a bill.
- **Reports** — six-month trend charts, a category breakdown, the biggest single expenses, plain-language insights computed from the household's own numbers, and a CSV export made on the device.
- **Guide** — a plain-words budgeting guide: three numbers to start, the 50/30/20 rule, a first-month plan, habits that stick, and debt payoff order.
- **Settings** — household name and payday, plus a reset back to the sample data.

Everything is saved in the browser's local storage, so the site remembers what the household entered. Charts are hand-drawn SVG — no chart library, no web fonts, no external files at all.

## How to run it

No build step. Serve `app/` with any static server, or open `app/index.html` directly:

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

Then open http://localhost:8080 in a desktop browser or on a phone.

## How to verify it

```sh
# From the kit directory, check the entry the way the grader does:
node cli/makefun.mjs check --dir <path-to-this-repo>
```

Or, outside the grader, build the submission output yourself:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # writes out/app, out/screenshots, out/dossier.json
```

The screenshots in `screenshots/` are real renders of the site taken in headless Chromium (desktop 1280×800 and phone 390×844); `shots.json` records which view each one shows.

## Structure

- `main.ts` — the submission program: copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.
- `app/index.html` — the page shell and navigation.
- `app/main.js` — hash router and all user actions.
- `app/data.js` — the sample household's seed data (categories, budgets, goals, bills, transactions, history).
- `app/store.js` — state: loading, saving, and every change the household makes.
- `app/format.js` — money and date formatting.
- `app/charts.js` — hand-drawn SVG donut, bar and progress charts.
- `app/views-*.js` — one file per section: dashboard, ledger, budgets, goals, bills, reports, guide, settings.
- `app/style.css` — the whole look: warm paper, deep pine, amber.
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.

## License

MIT — see [LICENSE](LICENSE).
