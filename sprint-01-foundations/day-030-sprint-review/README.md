# Day 30: Sprint 1 Review CLI 

## Description

The Sprint 1 finale! An interactive CLI that celebrates all 30 projects built during the Foundations sprint. Browse stats, explore every project, fetch a motivational quote, watch a live progress ticker powered by cron, and save a full sprint summary to JSON — all powered by the exact tools used throughout Sprint 1.

## Features

- 📊 **Sprint Statistics** - Category and difficulty breakdowns with bar charts using Lodash
- 📋 **Project Browser** - All 30 projects listed by category with difficulty ratings
- 💬 **Motivational Quote** - Fetches a live quote from the Quotable API with node-fetch
- ⏱️ **Live Progress Ticker** - Cron job cycling through all 30 projects every 3 seconds
- 💾 **JSON Export** - Saves a full sprint summary to sprint-01-summary.json
- 🎨 **Color Coded** - Easy (green), Medium (yellow), Hard (red) difficulty indicators
- 📁 **CSV Powered** - Sprint data stored and parsed from CSV using papaparse
- 🔁 **Interactive Menu** - Clean readline menu tying all features together

## Technologies Used

- TypeScript
- Node.js
- lodash (groupBy, countBy, orderBy, filter, sampleSize, mapValues)
- papaparse (CSV parsing)
- node-fetch (API fetching)
- node-cron (live ticker)
- chalk@4.1.2 (terminal colors)
- readline (interactive menu)
- Quotable API (https://api.quotable.io)

## Installation

```bash
npm install
```

## How to Run

```bash
npx ts-node sprint-review.ts
```

## Example Output

### Main Menu:

```
  ╔══════════════════════════════════════╗
  ║     Day 30 — Sprint 1 Review CLI     ║
  ║       300 Days of Code — Finale      ║
  ╚══════════════════════════════════════╝

  Loaded 30 projects from sprint-01-projects.csv

  What would you like to do?

  1. View Sprint 1 Statistics
  2. Browse All 30 Projects
  3. Fetch Motivational Quote
  4. Start Live Progress Ticker
  5. Save Sprint Summary to JSON
  6. Exit
```

### Sprint Statistics (Option 1):

```
  ════════════════════════════════════════════════════════
    SPRINT 1 STATISTICS
  ════════════════════════════════════════════════════════

  Total Projects : 30

  Projects by Category:
    CLI          ████████████ 12
    API          ███████ 7
    Data         ████ 4
    Automation   ██ 2
    Testing      █ 1
    DevOps       █ 1
    Review       █ 1

  Projects by Difficulty:
    Easy     : 11 projects
    Medium   : 13 projects
    Hard     : 6 projects

  Most Used Technologies:
    1. node-fetch — 6x
    2. TypeScript — 5x
    3. node-cron — 2x
```

### Live Progress Ticker (Option 4):

```
  ════════════════════════════════════════════════════════
    LIVE PROGRESS TICKER  (runs every 3s — press Enter to stop)
  ════════════════════════════════════════════════════════

  [10:45:03] Day 15 — QR Generator [Medium]
  [10:45:06] Day 03 — File Renamer [Easy]
  [10:45:09] Day 29 — Data Pipeline [Hard]
  [10:45:12] Day 08 — Currency Converter [Medium]
```

### Exit:

```
  ════════════════════════════════════════════════════════
  Sprint 1 Complete! 30 days. 30 projects.
  Onwards to Sprint 2 — Web Basics!
  ════════════════════════════════════════════════════════
```

## What I Learned

- How to combine every major Sprint 1 technology into one cohesive tool
- Using Lodash countBy and mapValues for summary statistics
- Running cron jobs inside an interactive readline menu without blocking input
- Structuring a multi-feature CLI with a clean menu loop
- Reflecting on 30 days of consistent building

## Challenge Info

**Day:** 30/300
**Sprint:** 1 - Foundations
**Date:** SAT, MAR 07
**Previous Day:** [Day 29 - Data Pipeline](../day-029-data-pipeline)
**Next Day:** [Day 31 - React/TS Static Resume Page](../day-031-react-resume)

-----

Part of my 300 Days of Code Challenge!
