# Day 36: Clock / Timer Component

## Description

A three-mode time component built with React and TypeScript. Includes a live clock with timezone info, a high-precision stopwatch with lap tracking, and a countdown timer with presets and custom input. All three modes run via requestAnimationFrame for smooth, accurate updates.

## Features

- Three modes: Clock, Stopwatch, Countdown — switching tabs preserves each mode’s state
- Clock: live time updating every second, 12h/24h toggle, timezone, UTC offset, Unix timestamp, day of year
- Stopwatch: requestAnimationFrame for smooth centisecond display, lap recording, fastest lap (green) and slowest lap (red) highlighted automatically
- Countdown: 5 presets (1m, 5m, 10m, 25m, 1hr), custom h/m/s input, progress bar, red display when under 20%, “Done!” banner on completion
- All timers use Date.now() arithmetic — accurate even when tab is backgrounded
- Fully responsive single-column layout

## Technologies Used

- React 18
- TypeScript
- Vite
- CSS (custom properties, grid, flexbox)
- Google Fonts (Space Grotesk, Space Mono)
- requestAnimationFrame API
- Intl.DateTimeFormat API

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

Step 1 — Clock tab is active by default. Watch the time tick every second. Click “Switch to 12h” to toggle format. Check your timezone, UTC offset, and Unix timestamp in the info grid.

Step 2 — Click the Stopwatch tab. Click Start. Watch the centiseconds update smoothly. Click Lap several times. The fastest split turns green and the slowest turns red in the lap list.

Step 3 — Click Pause. Timer freezes. Click Resume. Timer continues from where it stopped. Click Reset to clear everything.

Step 4 — Click the Countdown tab. A 5-minute timer is pre-loaded. Click Start and watch it count down. The progress bar shrinks as time passes.

Step 5 — When under 20% remaining, the display turns red. Let it hit zero — “Done!” appears in green with a banner.

Step 6 — Click a different preset (e.g. 25 min). Timer resets to that duration. Click Set after typing custom values like 0h 1m 30s to set a custom countdown.

## What I Learned

- requestAnimationFrame is smoother and more accurate than setInterval for timers
- Storing start time as Date.now() and computing elapsed on each frame prevents drift
- useRef for mutable values (startRef, frameRef) that should not trigger re-renders
- cancelAnimationFrame in the useEffect cleanup prevents memory leaks
- Intl.DateTimeFormat API for reading the browser timezone without a library
- Tab-based component switching that preserves state in each child component

## Challenge Info

**Day:** 36/300
**Sprint:** 2 - Web Basics
**Date:** FRI, MAR 13
**Previous Day:** [Day 35 - Quote Display with Axios](../day-035-quote-display)
**Next Day:** [Day 37 - Image Gallery with Lazy Load](../day-037-image-gallery)

-----

Part of my 300 Days of Code Challenge!
