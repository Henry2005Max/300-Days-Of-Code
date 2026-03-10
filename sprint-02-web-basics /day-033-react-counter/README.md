# Day 33: React Counter with Hooks

## Description
A feature-rich counter app built with React and TypeScript, demonstrating five core React hooks in a single project. Goes well beyond a basic counter — includes a reducer-based state machine, undo history, configurable step sizes, localStorage persistence, keyboard shortcuts, live stats, and a scrollable history panel.

## Features
- useState for input field and theme management
- useReducer for counter state machine with INCREMENT, DECREMENT, RESET, UNDO, SET actions
- useEffect for localStorage persistence and keyboard shortcut registration
- useCallback for memoized localStorage setter via custom hook
- useRef for auto-scrolling the history panel to the latest entry
- Custom useLocalStorage hook that persists count across page refreshes
- Undo system — step back through full history with Ctrl+Z or the Undo button
- Configurable step sizes — 1, 5, 10, 25, 100
- Set any value directly via input field
- Keyboard shortcuts — Arrow Up/Down, R to reset, Ctrl+Z to undo
- Live stats — total changes, current step, highest and lowest values reached
- Color-coded display — green for positive, red for negative, indigo for zero
- Progress bar tracking distance from zero toward 100
- Scrollable history panel showing every state the counter has been in

## Technologies Used
- React 18
- TypeScript
- Vite
- CSS (custom properties, grid, flexbox)
- Google Fonts (Syne, JetBrains Mono)
- localStorage API

## Installation

```bash
npm install
```

## How to Run

```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

## Build for Production

```bash
npm run build
npm run preview
```

## Testing — Step by Step

Step 1 — Click the green "+ 1" button a few times. Watch the number grow, the color stay green, and each value appear in the History panel on the right.

Step 2 — Click a step size (try 10). Click "+ 10" — the counter jumps by 10 each time.

Step 3 — Click "Undo" or press Ctrl+Z. Watch the counter revert to the previous value.

Step 4 — Type any number in the "Set any value" input and press Enter or click Set. The counter jumps to that number.

Step 5 — Press Arrow Up and Arrow Down on your keyboard. The counter increments and decrements without clicking.

Step 6 — Click Reset or press R. Counter goes back to 0.

Step 7 — Refresh the page. Your last count is restored from localStorage.

Step 8 — Watch the Stats panel — Highest and Lowest update as you go up and down.

## Example Output

```
[ Day 33 ]   Counter with Hooks   Sprint 2 — Web Basics

                    42
                 positive

[===========            ] 42% of 100

Step   [1]  [5]  [10]  [25]  [100]

[ − 1 ]    [ Reset ]    [ + 1 ]

                              History
                              #1   0
                              #2   1
                              #3   11
                              #4   42   current

                              Stats
                              42        1
                         Highest   Step
                              0        4
                         Lowest   Changes
```

## What I Learned
- useReducer is better than useState for complex state with multiple action types
- How to build a typed reducer with discriminated union actions in TypeScript
- Custom hooks encapsulate reusable logic like localStorage read/write
- useEffect cleanup is essential for removing event listeners on unmount
- useCallback prevents unnecessary re-renders when passing functions as dependencies
- useRef enables imperative DOM access without triggering re-renders

## Challenge Info
**Day:** 33/300
**Sprint:** 2 - Web Basics
**Date:** TUE, MAR 10
**Previous Day:** [Day 32 - Styled-Components Landing](../day-032-styled-landing)
**Next Day:** [Day 34 - Form Validator with React Hook Form](../day-034-form-validator)

---

Part of my 300 Days of Code Challenge!
