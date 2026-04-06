# Day 59: Habit Tracker

## Description

A daily habit tracker built with React and TypeScript. Track habits with a 7-day weekly dot grid showing which days were completed, live streak counters, a daily completion summary bar, and a 28-day grid view for a monthly overview. Add custom habits with an emoji and colour picker. All data persists to localStorage.

## Features

- Weekly view: 7-day dot grid per habit — click any dot to toggle that day's completion
- 28-day grid view: compact colour-coded calendar showing the last 4 weeks per habit
- Live streak counter per habit calculated from consecutive completed days
- Best streak tracker across all habits shown in the summary bar
- Daily progress bar showing how many habits are done today as a percentage
- Add habit modal with name input, emoji selector (12 options), and colour picker (8 colours)
- Delete habit with confirmation prompt
- "Done today" green chip appears on habits completed today
- Today's dot is highlighted with a ring in the habit's colour
- localStorage persistence — habits and completion history survive page refresh
- Pre-loaded with 4 sample habits: Code for 1 hour, Read 20 pages, Morning run, Drink 2L water
- DM Serif Display heading font paired with Rubik body font
- Warm cream and off-white light theme with per-habit colour accents
- Left border on each habit row tinted with the habit's colour
- Responsive: weekly dots wrap below habit name on mobile, grid columns reduce on small screens

## Technologies Used

- React 18
- TypeScript
- Vite 5

## Installation

```bash
cd Desktop
mkdir day-059-habit-tracker
cd day-059-habit-tracker
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

1. Open `http://localhost:5173` — four default habits load with a 7-day dot grid each.
2. Click any dot in the weekly row — it fills with the habit's colour and shows a tick.
3. Click the same dot again — it toggles back to empty (un-complete).
4. Complete all habits for today — the summary bar progress fills to 100%.
5. Click **+ Add habit** — the modal opens with name, emoji, and colour fields.
6. Type a name, pick an emoji and colour, click **Add habit** — new row appears with animation.
7. Click **Grid** in the view toggle — switches to the 28-day compact grid view per habit.
8. Click **Today** — switches back to the weekly dot view.
9. Click the **✕** on any habit row and confirm — habit is removed.
10. Refresh the page — all habits and completed dates are restored from localStorage.
11. Complete a habit for several consecutive days — the streak counter updates correctly.
12. Resize to mobile width — weekly dots wrap below the habit name, layout stays usable.

## What I Learned

- Computing a streak requires walking backwards from today (or yesterday if today is not yet completed) and counting consecutive dates — a simple sort-and-reverse approach fails when there are gaps
- CSS `color-mix(in srgb, var(--hcolor) 15%, transparent)` lets you derive tinted backgrounds directly from a CSS custom property without needing JavaScript to compute the colour
- Passing per-instance CSS variables via React's inline `style` prop (`style={{ "--hcolor": habit.color } as React.CSSProperties`) is a clean pattern for theming repeated components without prop drilling or CSS Modules
- `aspect-ratio: 1` on the 28-day grid cells makes them perfectly square regardless of the container width, eliminating the need to hardcode dimensions
- Using `new Date(date + "T12:00:00")` instead of `new Date(date)` when constructing dates from ISO strings prevents timezone offset issues where dates near midnight shift to the previous day

## Challenge Info

| Field | Detail |
|-------|--------|
| Day | 59 |
| Sprint | 2 — React/TypeScript Web UIs (Days 31–60) |
| Date | April 6, 2025 |
| Previous | [Day 58 — Flashcard App](../day-058-flashcard-app) |
| Next | [Day 60 — Sprint 2 Review](../day-060) |

Part of my 300 Days of Code Challenge!
