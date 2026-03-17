# Day 40: Review — Resume with Tailwind CSS

## Description

Day 31’s static resume page rebuilt using Tailwind CSS utility classes instead of a custom CSS file. The goal of this review day is to understand how Tailwind handles responsive layouts, spacing, typography, and component states — and compare the workflow to writing CSS from scratch.

## What Changed from Day 31

|Day 31                      |Day 40                                  |
|----------------------------|----------------------------------------|
|Custom CSS file (App.css)   |Tailwind utility classes only           |
|CSS Grid with sticky sidebar|lg:grid-cols-[280px_1fr] responsive grid|
|Manual media queries        |sm: and lg: Tailwind breakpoint prefixes|
|Custom color variables      |Tailwind stone, orange, gray palette    |
|Hover written in CSS        |hover:border-l-gray-900 hover: prefix   |
|Flexbox written manually    |flex items-center gap-4 utilities       |

## Features

- Tailwind CSS utility-first styling — no separate CSS file
- lg:grid-cols-[280px_1fr] — two-column layout on large screens
- Sidebar stacks above main content on mobile automatically
- sm:flex-row — experience/education rows wrap on small screens
- Responsive typography with text-sm, text-xs, text-base
- Hover transitions on project cards: hover:border-l-gray-900 transition-all
- Google Fonts via index.css (DM Serif Display + DM Sans)
- Tailwind showcase note at the bottom explaining every responsive decision

## Technologies Used

- React 18
- TypeScript
- Tailwind CSS v3
- Vite
- PostCSS + Autoprefixer
- Google Fonts (DM Serif Display, DM Sans)

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

Step 1 — Page loads as a two-column layout on desktop. Dark sidebar on the left, main content on the right.

Step 2 — Resize the browser window to below 1024px. The sidebar moves above the main content — single column layout.

Step 3 — Resize to below 640px (mobile). The experience section date/company row stacks vertically.

Step 4 — Hover over a project card. The left border transitions from orange to dark gray.

Step 5 — Scroll to the bottom of the page. Read the “What Changed from Day 31” comparison block.

## What I Learned

- Tailwind utility classes replace custom CSS — write styles directly in JSX className
- Responsive prefixes (sm:, lg:) apply styles at that breakpoint and above
- Arbitrary values like grid-cols-[280px_1fr] let you break out of the default scale
- Tailwind’s JIT compiler only includes the classes you actually use — no bloat
- hover:, focus:, and transition- utilities replace pseudo-class CSS
- PostCSS + tailwind.config.js is the required setup with Vite

## Challenge Info

**Day:** 40/300
**Sprint:** 2 - Web Basics
**Date:** TUE, MAR 17
**Previous Day:** [Day 39 - Weather App UI](../day-039-weather-app)
**Next Day:** [Day 41 - Todo App with Recoil/Redux](../day-041-todo-app)

-----

Part of my 300 Days of Code Challenge!
