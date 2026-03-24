# Day 46: Quiz App

## Description
A full-featured quiz app built with React and TypeScript. Three screens — setup, quiz, and results. 20 questions across four categories (Tech, Science, Nigeria, General) with per-question timers, answer reveal with explanations, a live score sidebar, and a detailed results review with grade.

## Features
- 3 screens managed with a single screen state: Setup, Quiz, Results
- 20 questions across 4 categories: Tech, Science, Nigeria, General
- Difficulty filter: Easy, Medium, Hard
- Configurable question count and time per question via sliders
- Questions shuffled randomly on each quiz start
- Per-question countdown timer with colour transition (green → amber → red)
- Timer auto-submits as wrong if time runs out
- Answer reveal: correct option turns green, wrong selection turns red, others dim
- Explanation shown after each answer reveal
- Live score sidebar showing correct/wrong counts and coloured dot history
- Results screen: grade circle (A–F), score percentage, average response time
- Full review list showing every question, your answer, correct answer, and explanation
- Retry Same and New Quiz buttons on results screen

## Technologies Used
- React 18
- TypeScript
- Vite
- CSS (custom properties, grid)
- Google Fonts (Nunito, JetBrains Mono)

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

Step 1 — Setup screen loads. Select "Nigeria" category and "Easy" difficulty. Slider shows available questions. Click Start Quiz.

Step 2 — First question appears with a countdown timer in green. Answer correctly — the option turns green and an explanation appears.

Step 3 — Click "Next Question". Timer resets for the next question.

Step 4 — Let the timer run out on a question — it auto-submits as wrong, explanation appears.

Step 5 — Watch the mini dot sidebar update — green for correct, red for wrong.

Step 6 — Complete all questions. Results screen shows your grade circle, score, and average time.

Step 7 — Scroll through the review list — each question shows what you answered vs the correct answer and the explanation.

Step 8 — Click "Retry Same" to redo the same questions. Click "New Quiz" to go back to setup.

## What I Learned
- Managing multiple UI screens with a single string state variable
- useEffect for the countdown timer with cleanup on question change
- Auto-submitting on timer expiry by treating -1 as a "timed out" selection
- getOptionClass function centralises all button state logic in one place
- Shuffling questions on start with a simple sort(() => Math.random() - 0.5)
- Tracking response time per question using Date.now() difference

## Challenge Info
**Day:** 46/300
**Sprint:** 2 - Web Basics
**Date:** MON, MAR 23
**Previous Day:** [Day 45 - Password Strength Meter](../day-045-password-meter)
**Next Day:** [Day 47 - Currency UI](../day-047-currency-ui)

---

Part of my 300 Days of Code Challenge!
