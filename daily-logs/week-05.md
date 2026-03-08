## Day 29 - March 6

**Project:** Data Pipeline (CSV + Lodash + API)
**Time Spent:** 2hrs

### What I Built

- CSV generator: auto-creates 15 Nigerian student records written to students.csv
- CSV parser: papaparse with TypeScript generics and dynamicTyping for typed data
- Subject breakdown: groupBy subject with average, highest, and lowest scores per group
- Top 5 ranking: orderBy score descending, sliced to top 5 students
- City averages: groupBy city, mean score per city, ranked descending
- Pass/fail filter: filter by score >= 75 threshold, calculates pass rate percentage
- API fetch: live programming joke from official-joke-api with node-fetch
- JSON export: full pipeline summary saved to pipeline-summary.json

### What I Learned

- How papaparse dynamicTyping automatically converts CSV strings to numbers
- Using Lodash groupBy, orderBy, filter, mean, max, min together on a real dataset
- How to structure a multi-phase pipeline combining synchronous and async operations
- Why saving pipeline output to JSON matters for downstream processing
- How TypeScript interfaces make CSV data safer to work with

### Resources Used

- papaparse docs: https://www.papaparse.com/docs
- lodash docs: https://lodash.com/docs/4.17.15
- node-fetch docs: https://github.com/node-fetch/node-fetch
- Official Joke API: https://official-joke-api.appspot.com

### Tomorrow

Day 30 - Sprint 1 Review

## Day 30 - March 07

**Project:** Sprint 1 Review CLI
**Time Spent:** 2

### What I Built

- Interactive menu CLI tying together all Sprint 1 technologies
- Sprint statistics: category and difficulty breakdowns with ASCII bar charts using Lodash
- Project browser: all 30 projects grouped by category with difficulty color coding
- Motivational quote fetcher: live API call to Quotable API with node-fetch
- Live progress ticker: cron job cycling through all 30 projects every 3 seconds
- JSON exporter: full sprint summary saved to sprint-01-summary.json
- CSV data layer: sprint project data stored and parsed with papaparse

### What I Learned

- How to run a cron job inside a readline interactive menu without blocking input
- Using Lodash countBy, mapValues, and sampleSize together for rich data summaries
- How combining multiple tools (lodash + papaparse + node-fetch + node-cron) in one project shows how far the sprint has come
- Structuring a multi-feature CLI with a clean reusable menu loop
- The value of review days for consolidating and reflecting on what was built

### Resources Used

- Lodash docs: https://lodash.com/docs/4.17.15
- papaparse docs: https://www.papaparse.com/docs
- node-cron docs: https://github.com/node-cron/node-cron
- node-fetch docs: https://github.com/node-fetch/node-fetch
- Quotable API: https://api.quotable.io

### Tomorrow

Day 31 - React/TS Static Resume Page (Sprint 2 begins!)

## Day 31 - March 8

**Project:** React/TS Static Resume Page
**Time Spent:** 2hr30

### What I Built

- Two-column resume layout with sticky dark sidebar and scrollable main panel
- Typed resume data object using TypeScript interfaces for all sections
- Sidebar with avatar initials, contact details, and grouped skill tags
- Main panel with Summary, Experience, Projects, and Education sections
- Project cards with accent border-left, tech label, and hover effect
- Responsive layout that collapses to single column on mobile
- CSS custom properties theme system with DM Serif Display + DM Sans fonts

### What I Learned

- How to set up a React + TypeScript project with Vite from scratch
- Using TypeScript interfaces to type nested structured data
- CSS Grid for sticky sidebar layouts without JavaScript
- How to break a page into reusable Section components with typed props
- CSS custom properties for managing a consistent design theme
- The difference between Sprint 1 (Node.js CLI) and Sprint 2 (React UI) workflows

### Resources Used

- React docs: https://react.dev
- Vite docs: https://vitejs.dev/guide
- TypeScript handbook: https://www.typescriptlang.org/docs
- DM Serif Display font: https://fonts.google.com/specimen/DM+Serif+Display
- CSS Grid guide: https://css-tricks.com/snippets/css/complete-guide-grid

### Tomorrow

Day 32 - Styled-Components Themed Landing Page
