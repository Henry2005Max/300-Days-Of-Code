# Day 41: Todo App with Redux Toolkit

## Description
A full-featured todo app built with React, TypeScript, and Redux Toolkit. State is managed entirely through a Redux store with a typed slice, typed hooks, and multiple actions. Features category filtering, priority levels, inline editing, search, progress tracking, and overdue date detection.

## Features
- Redux Toolkit createSlice with 10 actions: add, toggle, delete, edit, setPriority, setFilter, setSearch, setActiveCategory, clearCompleted, reorder
- Typed store with RootState and AppDispatch exported for use with typed hooks
- Custom useAppDispatch and useAppSelector typed hooks — no casting needed anywhere
- Priority system: high (red), medium (amber), low (green) — shown as left border color and tag
- Category sidebar: All, Coding, Learning, Work, Personal, Health with live counts
- Add form expands on focus to reveal priority, category, and due date options
- Inline editing: double-click any task text to edit in place
- Overdue detection: tasks with past due dates show a warning indicator
- Filter bar: All, Active, Completed
- Live search across all task text
- Progress bar tracking completion percentage
- Stats panel: total, active, done, high-priority counts
- Clear Completed button removes all done tasks at once
- Hover to reveal Edit and Delete action buttons

## Technologies Used
- React 18
- TypeScript
- Redux Toolkit v2
- React Redux v9
- Vite
- CSS (custom properties, grid, flexbox)
- Google Fonts (Inter, JetBrains Mono)

## Project Structure

```
day-041-todo-redux/
├── src/
│   ├── store/
│   │   ├── todosSlice.ts   # createSlice with all actions and state
│   │   ├── store.ts        # configureStore, RootState, AppDispatch
│   │   └── hooks.ts        # useAppDispatch, useAppSelector
│   ├── App.tsx             # All components consuming the store
│   ├── App.css
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

Step 1 — Six pre-loaded tasks appear. Check the stats panel: total, active, done, and high-priority counts.

Step 2 — Click the checkbox on any task. It turns green, the task gets a strikethrough, and stats update instantly.

Step 3 — Click into the "Add a new task" field. The form expands revealing priority, category, and due date options. Add a task.

Step 4 — Click the "Coding" category in the sidebar. Only Coding tasks show. Count updates.

Step 5 — Type in the search box. Tasks filter live as you type.

Step 6 — Click "Active" in the filter bar — only uncompleted tasks show. Click "Completed" — only done tasks show.

Step 7 — Double-click any task text. It becomes an editable input. Press Enter to save or Escape to cancel.

Step 8 — Hover a task. Edit and Delete buttons appear on the right. Click Delete to remove.

Step 9 — Click "Clear completed" in the sidebar. All completed tasks are removed at once.

Step 10 — Watch the progress bar update as you complete tasks.

## What I Learned
- Redux Toolkit's createSlice eliminates boilerplate: actions and reducers in one place
- Immer is built into RTK — you can mutate state directly in reducers (it handles immutability)
- configureStore wires the reducer and enables Redux DevTools automatically
- Typed hooks (useAppSelector, useAppDispatch) prevent casting and give full autocomplete
- Provider wraps the whole app so every component can access the store via hooks
- Selector functions in useAppSelector run on every state change — keep them simple

## Challenge Info
**Day:** 41/300
**Sprint:** 2 - Web Basics
**Date:** WED, MAR 18
**Previous Day:** [Day 40 - Tailwind Resume Review](../day-040-tailwind-resume)
**Next Day:** [Day 42 - Color Picker](../day-042-color-picker)

---

Part of my 300 Days of Code Challenge!
