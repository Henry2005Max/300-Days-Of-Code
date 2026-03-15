# Day 38: Dark Mode with Context API

## Description
A full UI demo page implementing dark mode using React Context API. A single ThemeProvider wraps the entire app — every component reads from the same context via a custom useTheme hook. No prop drilling. Theme persists in localStorage and respects the system preference on first visit.

## Features
- ThemeProvider using createContext and useContext
- Custom useTheme hook consumed by every component in the tree
- Theme persists across page refreshes via localStorage
- Reads system prefers-color-scheme on first load
- CSS custom properties (--bg, --ink, --accent etc.) on :root and [data-theme="dark"]
- Smooth 0.3s transition on all color changes
- Animated toggle switch in the navbar
- Full page demo: Navbar, Hero, Components section, Cards section, Form section, Footer
- Components section shows Buttons, Badges, Alerts, and live theme info
- Fully responsive layout

## Technologies Used
- React 18
- TypeScript
- Vite
- CSS custom properties with data-theme attribute switching
- Google Fonts (Manrope, Fira Code)

## Project Structure

```
day-038-dark-mode/
├── src/
│   ├── ThemeContext.tsx   # createContext, ThemeProvider, useTheme hook
│   ├── App.tsx            # All page components consuming useTheme
│   ├── App.css            # CSS tokens for light + dark via data-theme
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

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

Step 1 — Page loads in light mode (or dark if your system prefers it). Check the "Light mode" label in the navbar.

Step 2 — Click the toggle switch in the top-right navbar. The entire page transitions to dark mode in 0.3s — background, text, cards, inputs, badges, everything.

Step 3 — Refresh the page. The theme is restored from localStorage — no flash back to light.

Step 4 — Open DevTools → Application → Local Storage. You will see the key day38-theme set to "dark" or "light".

Step 5 — Scroll to the Components section. Check the "Current Theme" info block — it shows the active mode, the context source, persistence method, and your system preference.

Step 6 — Hover over the cards in the "How It Works" section. They highlight with an accent border on hover.

Step 7 — Click into any form input. The border changes to the accent color on focus — in both light and dark mode.

## What I Learned
- createContext + useContext is the standard React pattern for global state without a library
- Separating context into its own file (ThemeContext.tsx) keeps App.tsx clean
- CSS custom properties on [data-theme="dark"] make theming a single-file CSS concern
- document.documentElement.setAttribute sets the data-theme on the html element, cascading to all children
- Reading localStorage in the useState initializer function runs once on mount with the correct value
- window.matchMedia("prefers-color-scheme: dark") reads the OS-level preference

## Challenge Info
**Day:** 38/300
**Sprint:** 2 - Web Basics
**Date:** SUN, MAR 15
**Previous Day:** [Day 37 - Image Gallery with Lazy Load](../day-037-image-gallery)
**Next Day:** [Day 39 - Weather App UI](../day-039-weather-app)

---

Part of my 300 Days of Code Challenge!
