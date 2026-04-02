# Day 55: Pomodoro Timer

## Description
A full Pomodoro productivity timer built with React and TypeScript. Features a smooth SVG ring progress indicator, Web Audio API sound effects, configurable durations via a settings panel, session history log, today's stats, auto-start between sessions, and dynamic colour theming per mode.

## Features
- Three modes: Focus (red), Short Break (green), Long Break (blue)
- SVG ring countdown with smooth stroke-dashoffset animation
- JetBrains Mono monospace timer display
- Web Audio API beeps — start tone, completion tone, no external audio files needed
- Task label input — name what you're working on
- Pomo dots showing progress toward the next long break
- Session log — every completed focus session recorded with task name and time
- Today's stats: sessions count, total minutes, focus time, total pomodoros
- Settings panel: customise all timer durations, long break interval, auto-start, sound toggle
- Auto-start option automatically starts the next timer after each session completes
- Page title updates to show remaining time when running
- Dynamic CSS variable --mode-color themes the whole UI per active mode
- Technique reference panel explaining the Pomodoro method

## Technologies Used
- React 18
- TypeScript
- Vite
- Web Audio API (no sound files)
- SVG (ring progress)
- CSS custom properties (dynamic mode theming)
- Google Fonts (Rubik, JetBrains Mono)

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

Step 1 — Type a task like "Build Day 55 project" in the input field.

Step 2 — Click Start. The ring begins depleting, the tab title shows the countdown.

Step 3 — Click Pause. Timer freezes. Click Start again to resume.

Step 4 — Click ↺ reset to restart the current session.

Step 5 — Click ⏭ skip to jump to the next mode (work → short break).

Step 6 — Click ⚙ Settings. Change focus time to 1 minute and enable Auto-start. Save.

Step 7 — Start the 1-minute timer. When it completes, you hear a beep and it switches to Short Break automatically.

Step 8 — After completing 4 focus sessions, the app switches to Long Break instead of Short Break.

Step 9 — Check the Session Log on the right — each completed focus session appears with task name and time.

## What I Learned
- SVG ring animation: stroke-dashoffset decreases as time passes, CSS transition makes it smooth
- Web Audio API: create an OscillatorNode, connect to GainNode, use exponentialRampToValueAtTime for natural fade-out
- AudioContext must be created after a user gesture — lazy initialisation with useRef solves this
- CSS custom property --mode-color on the root element themes multiple components at once
- useEffect cleanup for setInterval is critical — without it, multiple intervals stack up on re-renders
- handleComplete in a useCallback with all dependencies prevents stale closures in the interval callback
- document.title update in useEffect gives native OS notifications feel

## Challenge Info
**Day:** 55/300
**Sprint:** 2 - Web Basics
**Date:** WED, APR 02
**Previous Day:** [Day 54 - Expense Tracker](../day-054-expense-tracker)
**Next Day:** [Day 56 - Markdown Editor](../day-056-markdown-editor)

---

Part of my 300 Days of Code Challenge!
