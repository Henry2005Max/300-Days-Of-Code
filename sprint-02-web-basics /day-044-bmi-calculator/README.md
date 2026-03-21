# Day 44: BMI Calculator Form

## Description

A full-featured BMI calculator built with React and TypeScript. Supports metric and imperial units, shows a visual gauge with a needle, calculates ideal weight range, logs calculation history, and includes a Nigerian city BMI reference chart.

## Features

- Metric mode: weight in kg, height in cm
- Imperial mode: weight in lbs, height in ft/in split inputs
- BMI formula applied correctly per unit system
- Visual gauge with colour-coded segments and animated needle
- Category highlighting in the BMI table matches current result
- Ideal weight range calculated for the “Normal” BMI band
- Optional age and gender fields shown in result details
- Health advice message per category (Underweight/Normal/Overweight/Obese)
- Calculation history log — last 10 results with date, weight, height, and category
- Nigerian city BMI reference bar chart (Lagos, Abuja, Kano, Port Harcourt, Ibadan)
- useMemo for BMI recalculation only when inputs change

## Technologies Used

- React 18
- TypeScript
- Vite
- CSS (custom properties, grid, flexbox)
- Google Fonts (Plus Jakarta Sans, JetBrains Mono)

## Installation

```bash
npm install
```

## How to Run

```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

## Testing — Step by Step

Step 1 — Enter weight 70 and height 175 in metric mode. Click Calculate. The result card shows BMI ~22.9, category “Normal weight” in green.

Step 2 — Watch the gauge needle animate to the Normal segment.

Step 3 — Check the ideal weight range in the result details — it shows the kg range for your height.

Step 4 — Switch to Imperial. Enter 154 lbs, 5ft 9in. Click Calculate. BMI should be close to the metric result.

Step 5 — Calculate a few times with different values. The History card appears below the result showing all calculations.

Step 6 — Enter an underweight value (e.g. 45kg, 175cm). The badge turns blue, advice changes.

Step 7 — Enter an overweight value. Badge turns amber. Enter an obese value — badge turns red.

Step 8 — Click Clear in the History card to wipe the log.

## What I Learned

- BMI formula differs by unit: metric = kg/m², imperial = 703 × lbs/in²
- useMemo prevents recalculating BMI on every render — only runs when weight or height change
- Controlled inputs for ft and inches combined into total inches via useMemo
- Gauge needle position calculated as percentage along a 10–40 BMI range
- Ideal weight range derived by back-calculating weight from BMI bounds (18.5 and 24.9)
- Keeping history in state as an array of typed records — slice to cap at 10

## Challenge Info

**Day:** 44/300
**Sprint:** 2 - Web Basics
**Date:** SAT, MAR 21
**Previous Day:** [Day 43 - Meme Generator with Canvas](../day-043-meme-generator)
**Next Day:** [Day 45 - Password Strength Meter](../day-045-password-meter)

-----

Part of my 300 Days of Code Challenge!
