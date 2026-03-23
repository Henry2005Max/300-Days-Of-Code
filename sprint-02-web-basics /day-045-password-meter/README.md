# Day 45: Password Strength Meter

## Description

A password strength analyzer and generator built with React and TypeScript. Evaluates passwords against 8 weighted security checks, shows a 5-segment strength bar, estimates crack time based on charset size and password length, calculates entropy in bits, and includes a configurable password generator with recent history.

## Features

- 8 weighted security checks: length ≥8, length ≥12, uppercase, lowercase, number, symbol, not a common password, no leading/trailing spaces
- Weighted scoring: symbols and length ≥12 worth 2 pts each — max 11 points
- 5-level strength: Very Weak → Weak → Fair → Strong → Very Strong
- Animated 5-segment strength bar with colour transition per level
- Crack time estimate based on charset size and 10 billion attempts/sec (GPU speed)
- Password entropy in bits: length × log₂(charset_size)
- Show/hide password toggle
- Copy to clipboard with confirmation flash
- Password generator: configurable length (8–64), toggle uppercase/lowercase/numbers/symbols
- Generator ensures at least one character from each enabled character set
- Recent generated passwords history — click any to restore it
- Strength legend panel with current level highlighted

## Technologies Used

- React 18
- TypeScript
- Vite
- CSS (custom properties, grid)
- Google Fonts (Sora, JetBrains Mono)

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

Step 1 — Type “password” in the input. It shows Very Weak and the “Not a common password” check fails.

Step 2 — Type “Password1”. Strength improves — uppercase, lowercase, number all pass. Still Weak without a symbol.

Step 3 — Type “Password1!”. Jumps to Strong. All checks pass except length ≥12.

Step 4 — Type “Password1!Word”. Very Strong — all checks pass, entropy increases, crack time shows centuries.

Step 5 — Click the eye icon to show/hide the password as plain text.

Step 6 — Click the copy icon — it flashes green with a checkmark.

Step 7 — Scroll to the generator. Set length to 24, make sure all options are checked. Click Generate Password.

Step 8 — The generated password appears in the input and strength updates immediately. Generate a few more — they appear in the Recent history below.

Step 9 — Click any recent password to restore it in the input.

## What I Learned

- Weighted scoring gives more nuance than pass/fail counts — symbols matter more than just length
- Password entropy formula: bits = length × log₂(charset_size)
- Crack time estimate: calculate total combinations (charset^length), divide by brute-force rate
- Fisher-Yates style shuffle via sort(() => Math.random() - 0.5) for generator character mixing
- Ensuring at least one char from each enabled charset prevents “all lowercase” generated passwords
- All heavy computations wrapped in useMemo — only recalculate when password changes

## Challenge Info

**Day:** 45/300
**Sprint:** 2 - Web Basics
**Date:** SUN, MAR 22
**Previous Day:** [Day 44 - BMI Calculator Form](../day-044-bmi-calculator)
**Next Day:** [Day 46 - Quiz App](../day-046-quiz-app)

-----

Part of my 300 Days of Code Challenge!
