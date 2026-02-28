# Day 23: Simple CSV Parser with PapaParse

## Description
A TypeScript CLI tool that parses, filters, sorts and analyses CSV files using the PapaParse library. Auto-generates three sample CSV files on startup (students, products, sales) with Nigerian-themed data. Supports viewing data as a formatted table, computing column statistics, filtering by any column value, sorting ascending or descending, and exporting filtered results to a new CSV file.

## Features
- **Load Any CSV** - Parse any CSV file from disk with header detection and auto typing
- **Table View** - Display data as a formatted table with adjustable row limit
- **File Stats** - Total rows, columns, headers, numeric columns and empty value count
- **Filter Rows** - Filter by any column with partial string matching
- **Sort Rows** - Sort by any column ascending or descending (handles numbers and strings)
- **Column Statistics** - Count, sum, average, median, min and max for numeric columns
- **Export** - Export all or filtered rows to a new CSV file using PapaParse unparse
- **Sample Files** - Auto-creates students.csv, products.csv and sales.csv on startup

## Technologies Used
- TypeScript
- Node.js
- PapaParse 5.x
- Chalk (terminal colors)
- readline (built-in Node.js module)
- fs (built-in Node.js module)

## Installation

```bash
npm install
```

## How to Run

```bash
npx ts-node csv-parser.ts
```

## Example Usage

### Load and View:
```
Load: students.csv
Loaded 10 rows from students.csv

name        age  subject  grade  city
─────────   ───  ───────  ─────  ─────────────
Henry       20   Math     88     Lagos
Amaka       22   Science  95     Abuja
Emeka       19   Math     72     Lagos
```

### Filter:
```
Filter column: city
Filter value: Lagos
Found 5 matching rows
```

### Column Stats (grade):
```
Stats for column "grade":
Count  : 10
Sum    : 801
Average: 80.10
Median : 83.00
Min    : 55
Max    : 95
```

### Sort:
```
Sort by: grade
Order  : desc
→ Shows students from highest to lowest grade
```

## What I Learned
- Using PapaParse for CSV parsing and unparsing in Node.js
- dynamicTyping option to auto-convert numbers from strings
- Building a formatted table display with dynamic column widths
- Computing median, average, min, max manually from arrays
- Writing filtered data back to CSV with Papa.unparse

## Challenge Info
**Day:** 23/300
**Sprint:** 1 - Foundations
**Previous Day:** [Day 22 - node-fetch for APIs](../day-022-node-fetch-apis)
**Next Day:** Day 24 - Basic Plots with Chart.js in Node

---
Part of my 300 Days of Code Challenge
