# Day 60: Sprint 2 Review — Portfolio Dashboard

## Description

A shareable portfolio dashboard showcasing all 30 projects built during Sprint 2 of the 300 Days of Code challenge. Features a bold editorial hero section, a stats strip, tag filtering, and a search bar. Every project from Day 31 to Day 60 is listed with its description and tech stack tags. Highlighted projects (Days 50, 56, 57, 58, 59, 60) are marked with a red left border and accent dot.

## Features

- All 30 Sprint 2 projects displayed in a responsive card grid
- Hero section with sprint stats: projects built, sprint number, days coded, sprint theme
- Sticky filter bar with tag filtering across 15+ tech tags (React, TypeScript, Axios, Canvas API, etc.)
- Live search filtering by project title or description
- Project count updates dynamically as filters change
- Highlighted projects marked with red border and accent pip
- Live Netlify link on Day 32 (deployed project)
- Playfair Display editorial serif headings paired with Karla body font
- Dark hero and footer with warm off-white card grid in between
- Large background "S2" typographic decoration in the hero
- Responsive: stats grid collapses to 2 columns, project grid to single column on mobile
- useMemo for efficient filtering without re-computing on every render

## Technologies Used

- React 18
- TypeScript
- Vite 5

## Installation

```bash
cd Desktop
mkdir day-060-portfolio-dashboard
cd day-060-portfolio-dashboard
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

1. Open `http://localhost:5173` — hero loads with title, stats strip, and all 30 project cards below.
2. Scroll down — filter bar sticks to the top as you scroll past it.
3. Click any tag button (e.g. "Axios") — grid filters to only projects using that technology.
4. Click "All" — all 30 projects return.
5. Type "canvas" in the search box — only canvas-related projects show.
6. Combine search and tag filter — both apply simultaneously.
7. Click the "Live ↗" link on Day 32 — opens the Netlify deployment in a new tab.
8. Confirm highlighted projects (Days 50, 56, 57, 58, 59, 60) have a red left border and dot.
9. Resize to mobile — stats grid goes to 2 columns, project cards stack to single column.

## What I Learned

- `useMemo` with a dependency array of `[activeTag, search]` ensures the filtered array is only recomputed when the filter state actually changes, not on every render
- A sticky filter bar requires `position: sticky; top: 0; z-index: 50` — the z-index is critical to prevent project cards from rendering on top of it during scroll
- CSS `overflow-x: auto` with `-webkit-scrollbar: none` on the tag row creates a horizontally scrollable pill strip on mobile without a visible scrollbar
- `clamp(36px, 6vw, 72px)` on the hero title creates fluid typography that scales smoothly between viewport sizes without media query breakpoints
- Organising filter logic with `useMemo` rather than `useEffect` + `useState` is cleaner for derived data — the filtered array is a pure computation from existing state, not a side effect

## Challenge Info

| Field | Detail |
|-------|--------|
| Day | 60 |
| Sprint | 2 — React/TypeScript Web UIs (Days 31–60) — COMPLETE |
| Date | April 7, 2025 |
| Previous | [Day 59 — Habit Tracker](../day-059-habit-tracker) |
| Next | [Day 61 — Sprint 3: Node.js Hello World Server](../day-061-node-server) |

Part of my 300 Days of Code Challenge!
