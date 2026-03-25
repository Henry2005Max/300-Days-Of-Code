# Day 47: Currency UI

## Description
A currency converter UI built with React, TypeScript, and Axios. NGN-focused with 12 currencies including African currencies. Features live rate fetching from exchangerate-api.com, a NGN quick reference table, an all-rates panel, and conversion history. Works in demo mode without an API key.

## Features
- Live exchange rates from exchangerate-api.com via Axios (demo mode without key)
- 12 currencies: NGN, USD, EUR, GBP, GHS, KES, ZAR, CAD, JPY, CNY, AED, INR
- Currency swap button to flip from/to instantly
- Intl.NumberFormat for locale-aware currency formatting per currency code
- Rate display: both directions shown (1 NGN = x USD and 1 USD = x NGN)
- NGN Quick Reference table: 7 common Naira amounts converted to the target currency
- Click any NGN row to populate the converter with that amount
- All Rates vs NGN panel showing how much 1 of each currency costs in Naira
- Click any rate row to set it as the active conversion pair
- Conversion history — save up to 10 conversions, click to restore
- Fallback rates when no API key is set — labelled "Demo rates"
- Refresh button to manually refetch rates

## Technologies Used
- React 18
- TypeScript
- Axios
- Vite
- Intl.NumberFormat API
- CSS (custom properties, grid)
- Google Fonts (Inter, JetBrains Mono)
- exchangerate-api.com

## Installation

```bash
npm install
```

## How to Run

```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

## Adding Your API Key

1. Sign up free at https://www.exchangerate-api.com
2. Copy your API key from the dashboard
3. Open src/App.tsx and replace:
   ```
   const API_KEY = "REPLACE_WITH_YOUR_EXCHANGERATE_API_KEY";
   ```

## Testing — Step by Step

Step 1 — Page loads in demo mode. "Demo rates" badge shows in the header. NGN → USD is the default pair.

Step 2 — Change the amount to 50000. The result updates instantly. Rate line shows both conversion directions.

Step 3 — Click the ⇄ swap button. From/To flip, result recalculates.

Step 4 — Change "To" currency to GBP. NGN Quick Reference table updates to show NGN → GBP for common amounts.

Step 5 — Click any row in the NGN Quick Reference (e.g. ₦100,000). The converter populates with that amount.

Step 6 — Click "Save Conversion". It appears in the History card below the rates panel.

Step 7 — In the All Rates vs NGN panel, click KES. The converter switches to NGN → KES.

Step 8 — Click a saved conversion in History to restore it.

## What I Learned
- Cross-rate calculation: rates[to] / rates[from] converts any pair when all rates are relative to USD
- Intl.NumberFormat with style: "currency" formats amounts correctly per locale and currency code
- JPY and similar currencies need maximumFractionDigits: 0 — no cents
- Demo mode pattern: check for placeholder API key and skip the fetch entirely
- useMemo for rate and result prevents recalculation on unrelated state changes
- Axios GET with a URL string is simpler than fetch — no .json() call needed

## Challenge Info
**Day:** 47/300
**Sprint:** 2 - Web Basics
**Date:** TUE, MAR 24
**Previous Day:** [Day 46 - Quiz App](../day-046-quiz-app)
**Next Day:** [Day 48 - Rock Paper Scissors](../day-048-rock-paper-scissors)

---

Part of my 300 Days of Code Challenge!
