# Day 35: Quote Display with Axios

## Description
A quote browsing app built with React, TypeScript, and Axios. Fetches live quotes from the Quotable API with category filtering, a shimmer skeleton loading state, favorites system, session history navigation, live stats, and graceful fallback quotes when offline.

## Features
- Axios instance with baseURL and timeout configured
- Fetches random quotes from Quotable API (https://api.quotable.io)
- 7 category filters: All, Motivational, Wisdom, Success, Life, Happiness, Technology
- Shimmer skeleton loading animation while fetching
- Graceful fallback to 6 local quotes on API error or timeout
- Save/unsave quotes to a favorites list
- Click any favorite to jump back to that quote
- Session history — navigate back and forward through every quote you've seen
- Live stats: total fetched, total saved, average quote length, top saved tag
- Fade-in animation on each new quote
- Keyboard shortcuts: N (new), S (save), Arrow Left/Right (history)
- Fully responsive layout

## Technologies Used
- React 18
- TypeScript
- Axios v1
- Vite
- CSS (custom properties, grid, flexbox, keyframe animations)
- Google Fonts (Cormorant Garamond, Outfit)
- Quotable API (https://api.quotable.io)

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

Step 1 — Page loads and immediately fetches a quote. Watch the shimmer skeleton appear for a moment, then the quote fades in.

Step 2 — Click "New Quote". A new quote fetches with skeleton loading, then fades in. The Fetched count in the Stats panel increases.

Step 3 — Click a category like "Technology". The next quote will be tagged with that category. Active category highlights in orange.

Step 4 — Click "Save" on a quote. It appears in the Saved Quotes panel on the right. The Saved count in Stats updates.

Step 5 — Save a few more quotes from different categories. Watch the Top Tag stat update to show your most-saved category.

Step 6 — Click a saved quote in the Saved Quotes panel. The main quote area jumps to that quote.

Step 7 — Click the ← Previous button to go back through your session history. Click → Next to go forward.

Step 8 — Press N on your keyboard to fetch a new quote. Press S to save the current one. Press Arrow Left/Right to navigate history.

Step 9 — Turn off your internet and click New Quote. A fallback quote appears with an "Offline" banner at the top of the card.

## Example Output

```
[ Day 35 ]  Quote Display  Sprint 2 — Web Basics

[All] [Motivational] [Wisdom] [Success] [Life] [Happiness] [Technology]

"The secret of getting ahead                Stats
 is getting started."                       12    3
                                         Fetched  Saved
— Mark Twain                               47    motivational
                              47 chars  Avg Len   Top Tag

[motivational]
                                            Saved Quotes (3)
[ ♥ Saved ]
                                            "The secret of getting..."
[← Previous]  [ New Quote ]  [Next →]      — Mark Twain

[N] New quote [S] Save [←] Previous [→] Next
```

## What I Learned
- How to create a custom Axios instance with baseURL and timeout
- Difference between Axios and fetch: automatic JSON parsing, better error objects, interceptors
- Handling AxiosError type correctly in TypeScript catch blocks
- Building a session history system using an array and an index pointer
- Shimmer skeleton animation using CSS linear-gradient and background-position
- useCallback for stable fetch function references used across effects
- Graceful degradation with fallback data when an API fails

## Challenge Info
**Day:** 35/300
**Sprint:** 2 - Web Basics
**Date:** THU, MAR 12
**Previous Day:** [Day 34 - Form Validator](../day-034-form-validator)
**Next Day:** [Day 36 - Clock/Timer Component](../day-036-clock-timer)

---

Part of my 300 Days of Code Challenge!
