# Day 29: Data Pipeline (CSV + Lodash + API)

## Description
A TypeScript data pipeline CLI that reads Nigerian student records from a CSV file, transforms and analyzes the data using Lodash, fetches a live joke from a public API, and saves a structured JSON summary — all in one automated pipeline run.

## Features
- **CSV Generation** - Auto-generates a sample CSV of 15 Nigerian student records
- **CSV Parsing** - Parses CSV using papaparse with full TypeScript typing
- **Subject Breakdown** - Groups students by subject with average, highest, and lowest scores
- **Top 5 Students** - Ranks students by score using Lodash orderBy
- **City Averages** - Groups and ranks cities by average student score
- **Pass/Fail Rate** - Filters students by pass threshold (75) and calculates pass rate
- **API Fetch** - Fetches a live programming joke from a public API
- **JSON Export** - Saves full pipeline summary to pipeline-summary.json
- **Color Coded** - Clean, readable terminal output with chalk

## Technologies Used
- TypeScript
- Node.js
- papaparse (CSV parsing)
- lodash (data transformation)
- node-fetch (API fetching)
- chalk@4.1.2 (terminal colors)
- Official Joke API (https://official-joke-api.appspot.com)

## Installation

```bash
npm install
```

## How to Run

```bash
npx ts-node data-pipeline.ts
```

## Example Output

### Phase 1 - CSV Generation & Parsing:
```
================================
   Day 29 — Data Pipeline CLI
================================

Phase 1: Building the pipeline...

  [1] CSV file created: students.csv
  [2] CSV parsed successfully — 15 records loaded
```

### Phase 2 - Data Analysis:
```
Phase 2: Analyzing data...

  --- Subject Breakdown ---

  Math
    Students : 5
    Average  : 82.6
    Highest  : 95
    Lowest   : 72

  English
    Students : 5
    Average  : 77.2
    Highest  : 92
    Lowest   : 58

  Science
    Students : 5
    Average  : 75.8
    Highest  : 95
    Lowest   : 60

  --- Top 5 Students ---
  1. Ngozi Eze           95  Science — Enugu
  2. Ify Okonkwo         94  Math — Enugu
  3. Amaka Obi           92  English — Abuja
  4. Chisom Agu          91  English — Enugu
  5. Kemi Adeyemi        88  Science — Abuja

  --- City Averages ---
  Enugu       3 students  avg: 93.3
  Abuja       4 students  avg: 80.5
  Ibadan      2 students  avg: 74.5
  Lagos       6 students  avg: 69.8

  --- Pass / Fail ---
  Passed (>= 75) : 11
  Failed  (< 75) : 4
  Pass rate      : 73.3%
```

### Phase 3 - API Fetch:
```
Phase 3: Fetching from API...

  --- Fetching a Programming Joke ---
  Why do programmers prefer dark mode?
  Because light attracts bugs!
```

### Phase 4 - JSON Export:
```
Phase 4: Saving output...

  [5] Summary saved to: pipeline-summary.json

================================
   Pipeline complete!
================================
```

## What I Learned
- How to use papaparse with TypeScript generics and dynamicTyping
- Chaining Lodash methods (groupBy, orderBy, filter, mean, max, min) on real datasets
- Building a multi-phase data pipeline combining sync and async operations
- Saving structured pipeline output to JSON for downstream use
- Combining CSV parsing, data transformation, and API fetching in one script

## Challenge Info
**Day:** 29/300
**Sprint:** 1 - Foundations
**Date:** FRI, MAR 06
**Previous Day:** [Day 28 - Terminal Dashboard](../day-028-github-action-for-CI)
**Next Day:** [Day 30 - Sprint 1 Review](../day-030-sprint-review)

---

Part of my 300 Days of Code Challenge!
