# Day 50: Blog Template with MDX

## Description
A full blog template built with React and TypeScript simulating MDX-style content. 6 posts across 4 categories covering TypeScript, React, Canvas API, and reflections on the 300 Days of Code journey. Features a list view with category filtering and tag filtering, a sidebar with featured posts and tag cloud, and a full post reading view with rendered markdown , headings, code blocks, tables, and bold text.

## Features
- 6 blog posts stored as typed TypeScript objects (simulating MDX content)
- Post list with category filter: All, Coding, Tutorial, Opinion, Reflection
- Tag cloud sidebar , click any tag to filter posts by it
- Live search filtering by title and excerpt
- Post cards with featured badge, category, date, read time, excerpt, and tags
- Full post reading view with back navigation
- Markdown-style content renderer: h2 headings, paragraphs, code blocks, tables, bold text
- Featured posts sidebar with quick links
- Author bio block with avatar initials
- Posts sorted by date descending
- Responsive two-column layout

## Technologies Used
- React 18
- TypeScript
- Vite
- CSS (custom properties, grid)
- Google Fonts (Lora serif, Inter, JetBrains Mono)

## Installation

```bash
npm install
```

## How to Run

```bash
npm run dev
```

Then open http://localhost:5173

## Testing , Step by Step

Step 1 , Blog list loads with 6 posts. Featured posts have an orange left border.

Step 2 , Click "Tutorial" category. Only tutorial posts show. Count updates.

Step 3 , Type "TypeScript" in the search bar. Posts filter live.

Step 4 , Click a tag in the Tags sidebar or on a post card. Active tag banner appears with a clear button.

Step 5 , Click any post card. Full post view opens with rendered markdown content including code blocks.

Step 6 , Click "← Back to Blog" to return to the list.

Step 7 , Click a featured post in the sidebar to open it directly.

## What I Learned
- Simulating MDX by storing post content as markdown strings and rendering them with a custom parser
- Building a line-by-line markdown renderer in React without a library
- useMemo for filtered posts , only recalculates when category, tag, or search changes
- Sticky sidebar positioning with top offset accounting for sticky nav height
- Editorial CSS: Lora serif for titles and excerpts, Inter for UI, JetBrains Mono for code

## Challenge Info
**Day:** 50/300
**Sprint:** 2 - Web Basics
**Date:** FRI, MAR 27
**Previous Day:** [Day 49 - Tip Calculator](../day-049-tip-calculator)
**Next Day:** [Day 51 - Todo App with Recoil](../day-051-todo-recoil)

---

Part of my 300 Days of Code Challenge!
