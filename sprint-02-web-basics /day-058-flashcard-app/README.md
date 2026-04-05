# Day 58: Flashcard App

## Description

A flashcard study app built with React and TypeScript. Cards flip with a CSS 3D transform animation to reveal the answer. Four themed decks are included: Nigerian Geography, React Concepts, TypeScript, and Nigerian History. Each study session tracks correct and incorrect answers, lets you retry only the cards you missed, and shows a results screen with your score percentage at the end.
https://day58flashcard-app.netlify.app
## Features

- CSS 3D flip animation using `rotateY(180deg)` and `preserve-3d` — no library
- 4 decks: Nigerian Geography (8 cards), React Concepts (8 cards), TypeScript (6 cards), Nigerian History (7 cards)
- Cards shuffle on every session start using Fisher-Yates algorithm
- Mark each card as Correct or Incorrect after flipping — buttons only appear after the answer is revealed
- Live score bar showing correct vs incorrect ratio updates after each card
- Progress dots strip showing past (green), current (active), and future cards
- Results screen showing grade label, percentage, correct/incorrect counts
- Retry missed cards button — reshuffles only the cards you got wrong
- Restart deck and return to all decks options on the result screen
- Deck colour accent applied to card back, result percentage, and deck card hover border
- Drop shadow glow on the card scene: green for correct, red for incorrect
- Anybody display font, Chivo body font
- Dark theme: near-black background with high-contrast text
- Responsive: card height and font scale down on mobile

## Technologies Used

- React 18
- TypeScript
- Vite 5
- CSS 3D Transforms (native browser, no animation library)

## Installation

```bash
cd Desktop
mkdir day-058-flashcard-app
cd day-058-flashcard-app
mkdir src
```

Copy all files into the folder, then:

```bash
npm install
```

## How to Run

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## Testing Step by Step

1. Open `http://localhost:5173` — home screen shows 4 deck cards with colour accent top borders.
2. Click any deck — study screen opens, card counter shows 1/N, progress dots appear.
3. Click the card — it flips with a 3D animation revealing the answer on the back.
4. Click **Correct** or **Incorrect** — score bar updates and a glow appears on the card.
5. Click **Next card** — moves to the next card, card flips back to the question side.
6. Try clicking the mark buttons before flipping — they should not be visible yet.
7. Try clicking Next before marking — button should not be visible yet.
8. Complete all cards — results screen appears with grade, percentage, and counts.
9. If you got any wrong, click **Retry X missed** — reshuffled session of only those cards starts.
10. Click **Restart deck** — full deck reshuffles and session starts fresh.
11. Click **All decks** — returns to the home screen.
12. Start a new deck — cards are in a different order than the first time (shuffle verified).

## What I Learned

- CSS 3D card flip requires three things together: `perspective` on the scene container, `transform-style: preserve-3d` on the inner wrapper, and `backface-visibility: hidden` on both faces — removing any one of these breaks the effect
- The back face must be pre-rotated with `transform: rotateY(180deg)` so that when the wrapper rotates 180 degrees, the back face appears right-way-up
- `-webkit-backface-visibility: hidden` is still needed alongside the standard property for Safari compatibility
- Fisher-Yates shuffle (`for i from length-1 to 1, swap arr[i] with arr[random 0..i]`) produces a uniformly random permutation and is O(n) — simpler shuffle methods like sort with `Math.random() - 0.5` are biased
- CSS custom properties (`--deck-color`) passed via inline `style` props in React work cleanly for per-component theming without needing styled-components or CSS Modules

## Challenge Info

| Field | Detail |
|-------|--------|
| Day | 58 |
| Sprint | 2 — React/TypeScript Web UIs (Days 31–60) |
| Date | April 5, 2025 |
| Previous | [Day 57 — Kanban Board](../day-057-kanban-board) |
| Next | [Day 59](../day-059) |

Part of my 300 Days of Code Challenge!
