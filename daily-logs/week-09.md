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
