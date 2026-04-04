# Day 57: Kanban Board

## Description

A drag-and-drop Kanban board built with React and TypeScript using the native HTML5 Drag and Drop API — no external DnD library. Cards can be dragged between three columns (To Do, In Progress, Done), created via a modal form, edited in place, and deleted. All board state persists to localStorage. A progress bar and stat chips in the header track completion across the board.

## Features

- Three columns: To Do, In Progress, Done — each with a distinct colour accent
- HTML5 native drag and drop — no library, pure React drag event handlers
- Drag cards between columns with a drop highlight and dashed drop hint indicator
- Add card modal with title, description, priority (low/medium/high), and tag fields
- Edit any card by clicking the pencil button — opens the same modal pre-filled
- Delete any card with the ✕ button
- 7 tag types: Feature, Bug, Docs, Design, Research, DevOps, Testing — each with a distinct colour
- 3 priority levels with colour-coded badges: Low (green), Medium (amber), High (red)
- Live progress bar across the top showing percentage of done cards
- Header stat chips: total cards, done count, completion percentage
- localStorage persistence — board survives page refresh
- Pre-loaded with Nigerian developer themed default cards
- Animated card entry and modal entrance
- Plus Jakarta Sans body font, Familjen Grotesk display font
- Warm cream light theme with bold column accent dots
- Responsive: columns stack vertically on mobile

## Technologies Used

- React 18
- TypeScript
- Vite 5
- HTML5 Drag and Drop API (native browser, no library)

## Installation

```bash
cd Desktop
mkdir day-057-kanban-board
cd day-057-kanban-board
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

1. Open `http://localhost:5173` — board loads with 3 columns and pre-filled sample cards.
2. Drag a card from To Do and drop it onto In Progress — card moves columns instantly.
3. Drag a card from In Progress to Done — progress bar and done count update.
4. Click the **+** button in any column header — the Add Card modal opens.
5. Fill in the title, description, priority, and tag fields then click **Add card** — card appears in that column with animation.
6. Try to submit the form with an empty title — form does not submit.
7. Click the **✎** button on any card — the Edit modal opens pre-filled with that card's data.
8. Edit the title and click **Save changes** — card updates in place.
9. Click the **✕** button on a card — card is removed from the column.
10. Click **+ Add card** at the bottom of any column — same modal opens as the header + button.
11. Click the overlay outside the modal — modal closes without saving.
12. Refresh the page — all cards and column positions are restored from localStorage.
13. Add enough cards to Done that the progress bar reaches 100% — gradient fills completely.
14. Resize to mobile width — columns stack vertically and scroll independently.

## What I Learned

- The HTML5 Drag and Drop API requires `onDragOver` to call `e.preventDefault()` on the drop target before the browser will fire the `onDrop` event — without it, the drop is cancelled
- `e.dataTransfer.effectAllowed = "move"` on dragstart and `e.dataTransfer.dropEffect = "move"` on dragover sets the cursor correctly and signals intent to the browser
- Storing drag state in React state (which card is dragging, which column it came from) is cleaner than using `dataTransfer.setData` and avoids JSON serialisation issues
- `onDragLeave` must reset the `dragOver` state to remove drop highlight styling when the cursor exits a column — without this the highlight stays on the wrong column
- Wrapping card mutations in `setBoard(b => ({ ...b, ... }))` functional updates is safer than using the stale board value from closure, especially when drag events and modal saves can fire close together

## Challenge Info

| Field | Detail |
|-------|--------|
| Day | 57 |
| Sprint | 2 — React/TypeScript Web UIs (Days 31–60) |
| Date | 2025-01-31 |
| Previous | [Day 56 — Markdown Editor](../day-056-markdown-editor) |
| Next | [Day 58](../day-058) |

Part of my 300 Days of Code Challenge!
