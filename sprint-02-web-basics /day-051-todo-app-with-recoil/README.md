# Day 51: Todo App with Recoil

## Description

A todo app built with React, TypeScript, and Recoil — Facebook’s experimental state management library. Demonstrates atoms for individual state pieces, selectors for derived data, and the key differences between Recoil and Redux Toolkit. Includes a built-in Recoil vs Redux comparison panel.

## Features

- 4 atoms: todosAtom, filterAtom, searchAtom, activeCategoryAtom
- 3 selectors: filteredTodosSelector, statsSelector, categoryCountsSelector
- RecoilRoot wrapping the app — no store configuration needed
- useRecoilState for read + write, useRecoilValue for read-only, useSetRecoilState for write-only
- Add tasks with priority and category options on form expand
- Toggle, delete, and double-click inline edit per task
- Category sidebar with live counts from categoryCountsSelector
- Filter bar: All, Active, Completed
- Live search across task text
- Stats panel: total, active, done, high-priority counts + progress bar
- Clear Completed button
- Recoil vs Redux Toolkit comparison table at the bottom

## Technologies Used

- React 18
- TypeScript
- Recoil v0.7
- Vite
- CSS (custom properties, grid)
- Google Fonts (Inter, JetBrains Mono)

## Project Structure

```
day-051-todo-recoil/
├── src/
│   ├── atoms.ts     # All Recoil atoms and selectors
│   ├── App.tsx      # Components consuming atoms
│   ├── App.css
│   └── main.tsx
```

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

Step 1 — Five pre-loaded tasks appear. Check stats panel shows correct totals.

Step 2 — Click any checkbox. Task gets strikethrough, Done count increments, progress bar moves.

Step 3 — Click the add input. Form expands to show priority and category. Add a task.

Step 4 — Click “Coding” in the sidebar — only Coding tasks show. Count updates from categoryCountsSelector.

Step 5 — Type in the search input — tasks filter live from filteredTodosSelector.

Step 6 — Double-click any task text to edit inline. Press Enter to save.

Step 7 — Click Clear completed to remove all done tasks.

Step 8 — Scroll to the bottom — read the Recoil vs Redux comparison table.

## What I Learned

- Recoil atoms are independent state units — each component subscribes only to what it needs
- Selectors are pure derived state — automatically recompute when upstream atoms change
- useRecoilState = useState equivalent, useSetRecoilState = setter only (no re-render on read)
- RecoilRoot replaces configureStore + Provider — much less setup than Redux
- The key Recoil advantage: fine-grained subscriptions — a component reading one atom doesn’t re-render when a different atom changes
- The key Redux advantage: explicit action log, time-travel debugging, better DevTools

## Challenge Info

**Day:** 51/300
**Sprint:** 2 - Web Basics
**Date:** SAT, MAR 28
**Previous Day:** [Day 50 - Blog Template with MDX](../day-050-blog-template)
**Next Day:** [Day 52 - Color Picker Extended](../day-052-color-picker-extended)

-----

Part of my 300 Days of Code Challenge!
