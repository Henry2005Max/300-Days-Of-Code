# Day 121: Finance Tracker Mobile App

## Description

A personal finance tracker mobile app built with React Native (Expo SDK 56)
and Expo Router. Tracks income and expense transactions stored locally in
SQLite via expo-sqlite's async API, with three tabs — Dashboard, Transactions,
and Analytics — and a modal sheet for adding entries. All data lives on
device; no backend required.

## Features

- 💰 Track income and expense transactions with category, amount, note, and date
- 🏠 Dashboard tab with monthly summary card (income / expenses / balance)
- 📋 Transactions tab with all/income/expense filter chips and pull-to-refresh
- 📊 Analytics tab: savings rate, category expense bar chart, 6-month history
- ➕ Add Transaction modal with type toggle, category chip grid, and amount input
- 🗑️ Swipe-to-delete (long-press delete with confirmation alert)
- 💾 Local SQLite storage via expo-sqlite async API
- 🎨 Consistent design tokens (colors, spacing, typography, radius)
- 🇳🇬 Naira (₦) currency formatting throughout

## Technologies Used

- **React Native** + **TypeScript**
- **Expo SDK 56**
- **Expo Router** — file-based navigation (tabs + modal)
- **expo-sqlite** — local SQLite async API
- **@expo/vector-icons** — Ionicons
- **react-native-safe-area-context** — notch/home indicator padding
- **react-native-screens** — native navigation optimization

## Folder Structure

```
day-121-finance-tracker/
├── app/
│   ├── _layout.tsx                  # Root Stack (tabs + modal)
│   ├── (tabs)/
│   │   ├── _layout.tsx              # Tab bar configuration
│   │   ├── index.tsx                # Dashboard screen
│   │   ├── transactions.tsx         # Transactions list
│   │   └── analytics.tsx            # Analytics / charts
│   └── (modals)/
│       └── add-transaction.tsx      # Add transaction modal
├── src/
│   ├── types/index.ts               # Transaction, Category, MonthlySummary
│   ├── db/database.ts               # expo-sqlite CRUD + analytics queries
│   ├── hooks/useTransactions.ts     # State management hook
│   ├── components/
│   │   ├── SummaryCard.tsx          # Monthly KPI card
│   │   ├── TransactionItem.tsx      # Single transaction row
│   │   └── CategoryBreakdownChart.tsx # Horizontal bar chart
│   └── utils/
│       ├── theme.ts                 # Design tokens
│       └── format.ts                # Naira formatter, date helpers
├── daily-logs/week-20.md
├── app.json
├── tsconfig.json
└── package.json
```

## Installation

```bash
cd ~/Desktop/300-Days-Of-Code/sprint-05-mobile/day-121-finance-tracker
npm install
```

## How to Run

```bash
# Start Expo development server
npx expo start

# Then press:
#   i — open iOS Simulator
#   a — open Android emulator
#   w — open in web browser
#   Scan QR code in Expo Go app on your phone
```

## Testing Step by Step

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the dev server**

   ```bash
   npx expo start
   ```

3. **Open in simulator or Expo Go**

   Press `i` for iOS Simulator, `a` for Android emulator, or scan
   the QR code with the Expo Go app on your phone.

4. **Add an income transaction**

   Tap "Add Transaction" on the Dashboard. Toggle to "Income", set
   amount to `350000`, select category "Salary", add note "June salary",
   then tap "Save Transaction". The Dashboard should update immediately.

5. **Add several expense transactions**

   Repeat for a few expenses (Food & Dining, Transport, Bills & Utilities)
   with realistic Naira amounts like `8500`, `45000`, `15000`.

6. **Check the Transactions tab**

   Switch to Transactions. All entries appear newest-first. Try the
   "Income" and "Expenses" filter chips. Pull down to refresh.

7. **Check the Analytics tab**

   Switch to Analytics. The savings rate percentage should reflect your
   income vs total expenses. The expense breakdown bar chart shows each
   category's share. The "Last 6 Months" table shows only the current
   month (add more entries across different months to populate it).

8. **Delete a transaction**

   On either the Dashboard or Transactions screen, tap the trash icon on
   any transaction. Confirm the alert. The list and summary update instantly.

9. **Kill and reopen the app**

   Force-close the app and reopen it. All transactions should persist —
   they're stored in SQLite on device.

## What I Learned

- expo-sqlite SDK 56 async API: `openDatabaseAsync`, `execAsync`,
  `runAsync`, `getAllAsync`, `getFirstAsync` — the synchronous `openDatabase`
  was removed in SDK 52+.
- Expo Router file-based navigation: `(tabs)/` group for the tab bar,
  `(modals)/` group for modal sheets, `_layout.tsx` at each level.
- `useSafeAreaInsets()` for padding content below notches and above
  home indicators without hard-coding pixel values.
- `KeyboardAvoidingView` with `behavior="padding"` on iOS and
  `keyboardShouldPersistTaps="handled"` on ScrollView to stop the
  keyboard from hiding the form.
- Custom hooks (`useTransactions`) as the right abstraction boundary
  in React Native: screens become thin shells over hooks; the hook owns
  all async database calls and derived state.
- Design token pattern: one `theme.ts` file with `Colors`, `Spacing`,
  `FontSize`, `Radius` exports used everywhere prevents style drift as
  the app grows.

## Challenge Info

| Field | Value |
|-------|-------|
| Day | 121 |
| Sprint | 5 — Mobile Apps (React Native / Expo) |
| Date | June 20, 2025 |
| Previous | [Day 120 - Sprint 4 Capstone](../../sprint-04-data/day-120-sprint4-capstone) |
| Next | Day 122 — Habit Tracker with streaks and expo-notifications |

Part of my 300 Days of Code Challenge!
