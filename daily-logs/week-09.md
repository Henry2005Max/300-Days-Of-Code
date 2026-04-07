## Day 57 - April 4th

**Project:** Kanban Board
**Time Spent:** 3 hours

### What I Built

A drag-and-drop Kanban board with three columns (To Do, In Progress, Done) using the native HTML5 Drag and Drop API — no external library. Cards can be dragged between columns, added via a modal form with title, description, priority, and tag fields, edited in place, and deleted. A progress bar and stat chips in the header track how many cards are done. All state persists to localStorage. Pre-loaded with Nigerian developer themed cards covering the 300 Days challenge, GDG lesson planning, Potio Beauty work, and the ESP32 project. Design uses a warm cream light theme with Plus Jakarta Sans and Familjen Grotesk fonts.

### What I Learned

- `onDragOver` must call `e.preventDefault()` on the drop target before the browser will fire the `onDrop` event — without preventDefault the drop is silently cancelled by the browser
- Setting `e.dataTransfer.effectAllowed = "move"` on dragstart and `e.dataTransfer.dropEffect = "move"` on dragover sets the drag cursor correctly across browsers
- Storing drag state (which card is dragging, source column) in React state is cleaner than using `dataTransfer.setData` because it avoids JSON serialisation round-trips and gives full TypeScript type safety
- `onDragLeave` on the column container must clear the dragOver state — without it the drop highlight stays frozen on the wrong column when the cursor exits
- Using functional updates `setBoard(b => ({ ...b }))` rather than reading the board from closure prevents stale state bugs when drop events and modal saves could fire in quick succession

### Resources Used

- https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
- https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/effectAllowed
- https://react.dev/reference/react-dom/components/common#drag-events

### Tomorrow

Day 58 — Flashcard App with flip animation, score tracking, and Nigerian-themed card decks. 

**
## Day 58 - April 05

**Project:** Flashcard App
**Time Spent:** 3+ hours

### What I Built

A flashcard study app with a CSS 3D flip animation, four themed decks (Nigerian Geography, React Concepts, TypeScript, Nigerian History), and a full study flow. Cards shuffle on every session. After flipping a card to reveal the answer, the user marks it correct or incorrect. A score bar and progress dot strip update live throughout the session. The results screen shows a grade label, percentage score, and correct/incorrect counts. Missed cards can be retried in a separate reshuffled session. Built entirely with React, TypeScript, and native CSS — no animation library.

### What I Learned

- CSS 3D flip requires all three of: `perspective` on the scene container, `transform-style: preserve-3d` on the inner element, and `backface-visibility: hidden` on both faces — the effect silently breaks if any one is missing
- The back face must be pre-rotated with `transform: rotateY(180deg)` so it appears right-way-up when the wrapper completes its 180-degree rotation
- `-webkit-backface-visibility: hidden` is still required alongside the unprefixed version for Safari support
- Fisher-Yates shuffle is O(n) and produces a truly uniform permutation — `Array.sort(() => Math.random() - 0.5)` is biased and unreliable
- Passing CSS custom properties via React inline style (`style={{ "--deck-color": color } as React.CSSProperties}`) is a clean pattern for per-instance theming without needing CSS Modules or styled-components

### Resources Used

- https://developer.mozilla.org/en-US/docs/Web/CSS/transform-style
- https://developer.mozilla.org/en-US/docs/Web/CSS/backface-visibility
- https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
- https://react.dev/learn/passing-props-to-a-component

### Tomorrow

Day 59 — Habit Tracker with daily check-ins, streak counter, and weekly grid view.

## Day 59 - April 06

**Project:** Habit Tracker

### What I Built

A daily habit tracker called Streaks with a 7-day weekly dot grid, per-habit streak counters, a daily completion progress bar, and a 28-day compact grid view. Each habit has a custom emoji, colour, and independent completion history stored in localStorage. Habits can be added through a modal with an emoji selector and colour picker, and deleted with a confirmation. Pre-loaded with four developer-life habits. Design uses DM Serif Display headings with Rubik body text on a warm cream background, with each habit's colour accent applied to its left border, weekly dots, and grid cells.

### What I Learned

- Streak calculation requires walking backwards day by day from today (or yesterday if today is not yet done) and stopping at the first missing date — sorting and checking consecutive index differences breaks when there are non-consecutive completion gaps
- `new Date(date + "T12:00:00")` is necessary when constructing Date objects from ISO date strings to prevent timezone offset from shifting the date to the previous day near midnight
- CSS `color-mix(in srgb, var(--hcolor) 15%, transparent)` derives tinted variants of a CSS variable without any JavaScript — this is supported in all modern browsers and avoids a lot of inline style computation
- `aspect-ratio: 1` on grid cells keeps them perfectly square regardless of container width without hardcoded pixel dimensions
- Per-instance CSS custom properties via `style={{ "--hcolor": color } as React.CSSProperties` is cleaner than prop drilling colour values into deeply nested CSS classes

### Resources Used

- https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix
- https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio
- https://react.dev/learn/passing-props-to-a-component
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date

### Tomorrow

Day 60 — Sprint 2 Review: Portfolio Dashboard showcasing all Sprint 2 projects. Last day of the sprint!


## Day 60 - April 07

**Project:** Sprint 2 Review — Portfolio Dashboard
**Time Spent:** 2.5 hours

### What I Built

A shareable portfolio dashboard for all 30 Sprint 2 projects. Bold editorial hero with a Playfair Display serif title, stats strip (projects, sprint, days, theme), sticky filter bar with 15+ tag buttons and a live search input, and a responsive card grid. Highlighted projects have a red left border. useMemo handles filtering so the array is only recomputed when tag or search state changes. This closes out Sprint 2 — 30 React/TypeScript projects in 30 days.

### What I Learned

- `useMemo` is the right tool for derived data (filtered arrays, computed values) — it avoids the pattern of useEffect + setState which adds an unnecessary extra render cycle
- `position: sticky; top: 0; z-index: 50` on the filter bar keeps it visible during scroll — forgetting z-index causes cards to render on top of it
- `clamp(min, preferred, max)` creates fluid typography that scales with the viewport without needing breakpoints for every size
- Horizontal scrolling tag rows need both `overflow-x: auto` and `::-webkit-scrollbar { display: none }` for a clean look on mobile

### Resources Used

- https://react.dev/reference/react/useMemo
- https://developer.mozilla.org/en-US/docs/Web/CSS/clamp
- https://developer.mozilla.org/en-US/docs/Web/CSS/position

### Tomorrow

Day 61 — Sprint 3 begins. Node.js + TypeScript Hello World server with Express. First time writing back-end code in the challenge.
