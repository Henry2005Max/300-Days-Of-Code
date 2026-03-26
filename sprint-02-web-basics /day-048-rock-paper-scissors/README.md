# Day 48: Rock Paper Scissors

## Description

A feature-rich Rock Paper Scissors game built with React and TypeScript. Three game modes — Free Play, Best of 3, and Best of 5. The CPU choice reveals after a 600ms shake animation, random taunts appear per result, and a full stats panel tracks wins, losses, draws, streaks, win rate, and favourite choice.

## Features

- Three modes: Free Play (unlimited), Best of 3, Best of 5
- Series progress dots showing wins per side in Best of 3/5 modes
- 600ms CPU reveal animation — emoji shakes before the choice appears
- Arena background tints green on win, red on loss
- Random taunts per result (5 per outcome)
- Keyboard shortcuts: 1 Rock, 2 Paper, 3 Scissors
- Scoreboard: wins, losses, draws, current win streak
- Stats panel: total rounds, win rate %, best streak, favourite choice
- Stacked win/draw/loss bar chart
- Round history — last 15 rounds with emoji and W/L/D badge
- Reset All button clears everything
- Series result screen with Play Again on Best of 3/5 completion

## Technologies Used

- React 18
- TypeScript
- Vite
- CSS (custom properties, grid, keyframe animations)
- Google Fonts (Righteous, Nunito)

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

Step 1 — Click Rock, Paper, or Scissors. CPU choice shakes for 600ms then reveals. Arena turns green or red.

Step 2 — Win 3 rounds in a row — the streak counter appears in the scoreboard.

Step 3 — Switch to Best of 3. Series dots appear at the top. Play until one side gets 2 wins.

Step 4 — Series result screen appears with the winner and score. Click Play Again to restart the series.

Step 5 — Use keyboard: press 1 for Rock, 2 for Paper, 3 for Scissors.

Step 6 — Check the Stats panel — win rate and favourite choice update as you play.

Step 7 — Watch the stacked bar chart update with each round result.

Step 8 — Click Reset All to clear scores and history.

## What I Learned

- Game logic modelled as pure functions: getResult, randomChoice, randomTaunt — easy to test
- setTimeout inside a play handler creates the reveal delay without blocking React
- useCallback for play function prevents stale closure issues with keyboard event listeners
- useEffect checking seriesWins against target detects series completion reactively
- Deriving favourite choice from history array inside JSX using an IIFE keeps state minimal
- CSS animation keyframes (shake, pop) add game feel without a library

## Challenge Info

**Day:** 48/300
**Sprint:** 2 - Web Basics
**Date:** WED, MAR 25
**Previous Day:** [Day 47 - Currency UI](../day-047-currency-ui)
**Next Day:** [Day 49 - Tip Calculator](../day-049-tip-calculator)

-----

Part of my 300 Days of Code Challenge!
