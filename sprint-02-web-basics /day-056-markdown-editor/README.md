# Day 56: Markdown Editor

## Description

A live split-pane Markdown editor built with React, TypeScript, and the marked library. Write Markdown on the left and see formatted HTML on the right in real time. Supports a full toolbar for inserting formatting, keyboard shortcuts, word/character/line count, read time estimate, auto-save to localStorage, and export as .md or .html.

https://56markdown-editor.netlify.app/

## Features

- Live split-pane preview — editor and rendered output side by side
- Three view modes: split, editor-only, preview-only
- Toolbar with 12 formatting actions: Bold, Italic, Strikethrough, H1–H3, inline code, code block, blockquote, horizontal rule, task item, link
- Keyboard shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+S (manual save), Tab (2-space indent)
- Wraps selected text in formatting when text is highlighted before clicking a toolbar button
- Real-time stats bar: word count, character count, line count, estimated read time
- Auto-save to localStorage with 800ms debounce — content persists on refresh
- Manual save with Ctrl+S — shows "Saved" badge confirmation
- Export as .md — downloads raw Markdown file
- Export as .html — downloads styled standalone HTML file
- Copy HTML — copies rendered HTML to clipboard
- Clear button with confirmation prompt
- GFM (GitHub Flavored Markdown): tables, strikethrough, task lists, fenced code blocks
- JetBrains Mono editor font, Sora UI font
- Dark terminal aesthetic: near-black background, teal accent, amber code color
- Responsive: split pane stacks vertically on mobile

## Technologies Used

- React 18
- TypeScript
- Vite 5
- marked v11 (Markdown parser with GFM and line break support)

## Installation

```bash
cd Desktop
mkdir day-056-markdown-editor
cd day-056-markdown-editor
```

Copy all project files into this folder, then:

```bash
npm install
```

## How to Run

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## Testing Step by Step

1. Open `http://localhost:5173` — editor loads with default content and live preview side by side.
2. Type in the editor — preview updates instantly with every keystroke.
3. Click the **B** toolbar button — `**bold text**` inserts at the cursor.
4. Highlight a word in the editor then click **I** — the selected word wraps in `_underscores_`.
5. Press Ctrl+B — bold formatting inserts at cursor.
6. Press Ctrl+S — "Saved" badge flashes in the header.
7. Press Tab — two spaces insert at cursor position.
8. Click the **```** toolbar button — a fenced code block inserts.
9. Click **split / editor / preview** tabs — layout switches between the three modes.
10. Click **.md** button — a `document.md` file downloads with the raw Markdown.
11. Click **.html** button — a styled `document.html` file downloads.
12. Click **Copy HTML** — rendered HTML is copied to clipboard (button briefly shows "Copied!").
13. Refresh the page — the editor reloads with your last content from localStorage.
14. Click **Clear** and confirm — editor empties.

## What I Learned

- How to insert text at the textarea cursor position using `selectionStart` and `selectionEnd`, and how to restore focus and caret position with `requestAnimationFrame` after a React state update
- How to wrap selected text in a formatting pair by reading `selectionStart`/`selectionEnd` before the state update and re-computing the new cursor position after insertion
- How `onMouseDown` with `e.preventDefault()` on toolbar buttons prevents the textarea from losing focus before the selection can be read — using `onClick` would fire after blur and lose the selection range
- How to debounce localStorage writes with `setTimeout` inside `useEffect` and clear the timer on cleanup to avoid writing on every single keystroke
- How `marked.setOptions({ gfm: true, breaks: true })` enables GitHub Flavored Markdown including tables, task lists, strikethrough, and fenced code blocks
- How to generate a styled standalone HTML file for export using a Blob URL and a programmatically clicked anchor element

## Challenge Info

| Field | Detail |
|-------|--------|
| Day | 56 |
| Sprint | 2 — React/TypeScript Web UIs (Days 31–60) |
| Date | 2025-01-30 |
| Previous | [Day 55](../day-055) |
| Next | [Day 57](../day-057) |

Part of my 300 Days of Code Challenge!
