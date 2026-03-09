# Day 32: Styled-Components Themed Landing Page

## Description
A full themed landing page built with React, TypeScript, and styled-components. Features a dark/light theme toggle powered by ThemeProvider, keyframe animations, a sticky nav, hero section with stats, features grid, testimonial block, CTA section, and footer — all as typed styled components.

## Features
- Dark/Light theme toggle with ThemeProvider — every component adapts instantly
- Sticky frosted-glass navbar with smooth scroll links
- Hero section with animated title, badge, CTA buttons, stats grid, and skill progress bars
- Features grid with 6 cards and hover lift effect
- Testimonial/quote section with editorial typography
- Full-width CTA section with contrasting accent background
- Keyframe animations: fadeUp on load, slideIn on badge, pulse on CTA button
- Fully responsive — collapses gracefully on mobile
- TypeScript typed theme object passed through all styled components

## Technologies Used
- React 18
- TypeScript
- styled-components v6
- Vite
- Google Fonts (Playfair Display, Libre Baskerville, Jost)

- ## Live Demo

https://henry-day032.netlify.app

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

## Example Output

### Light Mode (default):
```
[Henry.dev]   Features  About  Contact  [moon icon]

  300 DAYS OF CODE — SPRINT 2

  Build things that
  actually matter.

  A themed landing page built with React, TypeScript,
  and styled-components...

  [View Features]   [GitHub]          31  |  269
                                     Days |  Days Left
                                     Done |
```

### Dark Mode (after clicking moon icon):
```
Background switches from warm cream (#f2ede4) to near-black (#0e0c09)
All text, borders, surfaces, and cards adapt — no flash or glitch
Accent orange stays consistent across both themes
```

### Features Grid:
```
[Blazing Fast]     [Fully Themed]    [Responsive]
Vite + React 18    ThemeProvider     CSS Grid layouts

[Type Safe]        [Animated]        [Component Driven]
TypeScript props   Keyframes + hover Self-contained blocks
```

## Live Demo

https://henry-day032.netlify.app

## What I Learned
- How styled-components ThemeProvider passes theme to every component in the tree
- Defining TypeScript types for theme objects and using them in styled component props
- Using keyframes from styled-components for CSS animations
- createGlobalStyle for resetting and setting global body/font styles
- How to build a complete multi-section landing page as a single component file
- The difference between styled-components v5 and v6 API changes

## Challenge Info
**Day:** 32/300
**Sprint:** 2 - Web Basics
**Date:** MON, MAR 09
**Previous Day:** [Day 31 - React/TS Static Resume](../day-031-react-resume)
**Next Day:** [Day 33 - React Counter with Hooks](../day-033-react-counter)

---

Part of my 300 Days of Code Challenge!
