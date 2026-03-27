# Day 49: Tip Calculator

## Description
A Nigerian Naira tip calculator built with React and TypeScript. Enter a bill amount, pick a tip percentage from presets or type a custom one, split between multiple people, optionally round up to the nearest ₦100, and save bills with venue labels. Includes a Nigerian tipping guide.

## Features
- Bill input in Nigerian Naira with ₦ prefix
- 6 tip presets: 10%, 15%, 18%, 20%, 25%, 30%
- Custom tip percentage input
- People splitter with +/− buttons
- Per-person breakdown: total per person and tip per person
- Round up to nearest ₦100 toggle
- Intl.NumberFormat for proper ₦ formatting
- Save bills with venue label (auto-assigns Nigerian venue name if blank)
- Saved bills history — click any to restore inputs
- Nigerian tipping guide: fast food to fine dining
- useMemo for all calculations

## Technologies Used
- React 18
- TypeScript
- Vite
- Intl.NumberFormat API
- CSS (custom properties, grid)
- Google Fonts (DM Sans, DM Mono)

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

Step 1 — Enter 15000 as the bill. Select 15% tip. Summary shows ₦2,250 tip and ₦17,250 total.

Step 2 — Click the + button to add people. Set to 4. Per-person amounts appear showing ₦4,312.50 each.

Step 3 — Toggle "Round up to nearest ₦100". Total rounds up to ₦17,300, split recalculates.

Step 4 — Type 12 in the custom tip field. Active preset deselects, calculation updates.

Step 5 — Type a venue name like "Yellow Chilli, VI". Click Save Bill — it appears in Saved Bills.

Step 6 — Save a few more. Click any saved bill to restore those inputs.

## What I Learned
- Intl.NumberFormat with currency: "NGN" formats with the ₦ symbol automatically
- Round up formula: Math.ceil(total / 100) * 100 rounds to the nearest 100
- Custom tip overrides preset — tracking both as separate state, deriving activeTip from them
- useMemo with all relevant inputs as dependencies keeps calculations cheap
- Restoring saved state by setting all controlled inputs from a saved record

## Challenge Info
**Day:** 49/300
**Sprint:** 2 - Web Basics
**Date:** THU, MAR 26
**Previous Day:** [Day 48 - Rock Paper Scissors](../day-048-rock-paper-scissors)
**Next Day:** [Day 50 - Blog Template with MDX](../day-050-blog-template)

---

Part of my 300 Days of Code Challenge!
