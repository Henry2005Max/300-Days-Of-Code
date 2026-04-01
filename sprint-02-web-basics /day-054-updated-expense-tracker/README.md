# Day 54: Expense Tracker

## Description
A personal finance tracker built with React and TypeScript. Track income and expenses in Nigerian Naira across 8 categories. Features summary cards, a hand-built SVG donut chart, a horizontal bar breakdown, filtering by month/type/category/search, and add/delete transactions.

## Features
- Income, expense, balance, and savings rate summary cards
- Month picker filters all data and charts to the selected month
- SVG donut chart built from scratch using strokeDasharray on circles
- Horizontal bar breakdown of top 5 spending categories
- 8 categories: Food, Transport, Housing, Shopping, Health, Entertainment, Savings, Other
- Each category has a colour and emoji icon
- Add transaction form: type toggle (income/expense), amount, date, category, description
- Delete any transaction with a hover-reveal ✕ button
- Filter by type (all/income/expense), category, search text
- Sort by date or amount
- 12 seed transactions with Nigerian context (Lagos, Abuja, Kano references)
- Intl.NumberFormat NGN formatting throughout

## Technologies Used
- React 18
- TypeScript
- Vite
- SVG (custom donut chart)
- Intl.NumberFormat API
- CSS (custom properties, grid)
- Google Fonts (Inter, JetBrains Mono)

## Installation

```bash
npm install
```

## How to Run

```bash
npm run dev
```

Then open http://localhost:5173

## Testing — Step by Step

Step 1 — Page loads with March 2025 data. Summary shows ₦555,000 income, expenses, balance, and savings rate.

Step 2 — Check the donut chart on the right — each category segment proportional to its spending.

Step 3 — Click "+ Add". Form opens. Set type to Income, enter 50000, description "Bonus payment", click Save.

Step 4 — Watch the Income and Balance summary cards update immediately.

Step 5 — Filter by category — select "Food" in the dropdown. Only food transactions show.

Step 6 — Search "Uber" — only the Uber transaction appears.

Step 7 — Hover any transaction row — the ✕ delete button appears on the right. Click it.

Step 8 — Change the month picker to a different month — all data clears (no transactions for that month).

## What I Learned
- SVG donut chart: use strokeDasharray on a circle — stroke-dasharray="dash gap" where dash = pct * circumference
- Accumulate offset across segments so each segment starts where the previous ended
- rotate(-90) transform starts the first segment at 12 o'clock position
- useMemo for both filtered transactions and category breakdown — prevent re-sorting on every render
- Intl.NumberFormat NGN shows ₦ symbol automatically with correct thousands separators
- Savings rate = (income - expenses) / income — clamped to 0 if negative

## Challenge Info
**Day:** 54/300
**Sprint:** 2 - Web Basics
**Date:** TUE, APR 01
**Previous Day:** [Day 53 - Weather Dashboard](../day-053-weather-dashboard)
**Next Day:** [Day 55 - Pomodoro Timer](../day-055-pomodoro-timer)

---

Part of my 300 Days of Code Challenge!
