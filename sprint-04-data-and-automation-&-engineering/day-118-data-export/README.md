# Day 118: Data Export Pipeline (CSV + Excel + PDF)

## Description

A sales reporting API that generates three different export formats —
CSV, Excel (.xlsx), and PDF — from the same PostgreSQL dataset. All three
share one data layer (`fetchSalesReport`) that runs four queries: raw
transaction rows, totals, regional breakdown, and category breakdown. Each
exporter then shapes that data into its native format. The reports support
optional date range, region, and category filters applied at the query level
before any formatting happens.

## What's New

- **Multi-format export pipeline** — one Express handler dispatches to
  three different exporters based on `/:format` (csv, excel, pdf).
- **csv-stringify** used in synchronous mode to build a multi-section CSV:
  a summary block (totals → by region → by category) followed by all
  transaction rows, returned as a downloadable file.
- **ExcelJS** produces a three-sheet workbook (Summary, By Rep,
  Transactions) with styled headers (brand green fill, white bold text),
  alternating row shading, frozen header rows, per-column number formats
  (`₦#,##0.00`), and auto-fitted column widths.
- **PDFKit** generates a styled A4 report with a brand-colored cover
  block, three KPI cards, and manually drawn tables (header rectangles,
  alternating row fills, automatic page breaks mid-table). The report
  covers regional breakdown, category breakdown, top 10 reps, and a
  full transaction listing.
- **PostgreSQL `GENERATED ALWAYS AS ... STORED`** column for `revenue =
  units * unit_price` — the database maintains the derived column with
  no application code.
- All three formats respect the same `?from=&to=&region=&category=`
  query filters, which are pushed into the SQL `WHERE` clause before
  any data is fetched.

## Features

- 📊 JSON preview endpoint (`/api/export/preview`) for testing filters
- 📄 CSV export — multi-section with summary header + full transaction rows
- 📗 Excel export — 3 sheets, styled headers, alternating rows, ₦ format
- 📕 PDF export — branded A4 report with cover, KPI cards, and tables
- 🔍 Filters: `?from=YYYY-MM-DD&to=YYYY-MM-DD&region=...&category=...`
- 📐 `revenue` as a `GENERATED ALWAYS AS` PostgreSQL computed column
- 🇳🇬 200 seed rows: 10 Nigerian sales reps, 5 product categories,
  6 months of data (Jan–Jun 2025)

## Technologies Used

- **Node.js** + **TypeScript**
- **Express 4** — REST API
- **pg** (node-postgres) — PostgreSQL driver
- **csv-stringify** — CSV generation
- **ExcelJS** — Excel (.xlsx) generation
- **PDFKit** — PDF generation
- **zod** — query parameter validation
- **chalk** — colored request logs
- **dotenv** — environment configuration
- **tsx** — TypeScript dev runner

## Folder Structure

```
day-118-data-export/
├── .env
├── tsconfig.json
├── package.json
├── exports/                      (optional: save files locally)
└── src/
    ├── index.ts                   # Express app, runs migrations at startup
    ├── types/index.ts             # Shared interfaces
    ├── db/
    │   ├── pool.ts                # Lazy pg connection pool
    │   ├── migrations.ts          # CREATE TABLE (GENERATED ALWAYS AS)
    │   └── salesQueries.ts        # fetchSalesReport — all four queries
    ├── exporters/
    │   ├── csvExporter.ts         # csv-stringify multi-section CSV
    │   ├── excelExporter.ts       # ExcelJS 3-sheet styled workbook
    │   └── pdfExporter.ts         # PDFKit A4 report with tables
    ├── routes/
    │   └── exportRoutes.ts        # GET /api/export/:format + /preview
    ├── utils/
    │   └── logger.ts
    └── seed/
        └── index.ts               # 200-row Nigerian sales dataset
```

## Installation

```bash
cd ~/Desktop/300-Days-Of-Code/sprint-04-data/day-118-data-export
npm install
```

Create the database:

```bash
psql -U postgres -c "CREATE DATABASE sales_export;"
```

Update `DATABASE_URL` in `.env` if your credentials differ.

## How to Run

```bash
# Seed 200 sales rows (run once)
npm run seed

# Development server
npm run dev

# Production
npm run build && npm start
```

Server runs on `http://localhost:4002`.

## Testing Step by Step

1. **Create the database and install dependencies**

   ```bash
   psql -U postgres -c "CREATE DATABASE sales_export;"
   npm install
   ```

2. **Seed the dataset**

   ```bash
   npm run seed
   ```

   Expect: `Seeded 200 sales rows across 10 reps, 5 categories, 6 months.`

3. **Start the server**

   ```bash
   npm run dev
   ```

   Expect: `[db] Migrations complete.` then `Server running at http://localhost:4002`.

4. **Preview the full report as JSON**

   ```bash
   curl http://localhost:4002/api/export/preview | json_pp
   ```

   Check the `totals`, `byRegion`, `byCategory`, and `byRep` blocks, plus
   the raw `rows` array.

5. **Preview with filters**

   ```bash
   curl "http://localhost:4002/api/export/preview?from=2025-03-01&to=2025-03-31&category=Groceries" | json_pp
   ```

   Should return only Groceries transactions from March 2025.

6. **Download the CSV**

   ```bash
   curl -o report.csv http://localhost:4002/api/export/csv
   open report.csv   # or: cat report.csv
   ```

   The CSV has a summary block at the top (totals, by-region, by-category)
   followed by all transaction rows. Open in Numbers or Excel to verify.

7. **Download a filtered CSV (South West region only)**

   ```bash
   curl -o sw-report.csv "http://localhost:4002/api/export/csv?region=South%20West"
   ```

8. **Download the Excel file**

   ```bash
   curl -o report.xlsx http://localhost:4002/api/export/excel
   open report.xlsx
   ```

   Open in Excel or Numbers. You should see three sheets: Summary (with
   styled green headers and a totals block), By Rep, and Transactions.
   Column widths should be auto-fitted and revenue cells formatted as `₦`.

9. **Download a date-filtered Excel report**

   ```bash
   curl -o q1.xlsx "http://localhost:4002/api/export/excel?from=2025-01-01&to=2025-03-31"
   ```

   Only Q1 2025 data. Verify the totals on the Summary sheet reflect the
   filtered period.

10. **Download the PDF**

    ```bash
    curl -o report.pdf http://localhost:4002/api/export/pdf
    open report.pdf
    ```

    The PDF should open to a branded A4 document with:
    - A dark green cover header (title + period + timestamp)
    - Three KPI cards (Total Revenue, Units Sold, Total Deals)
    - Revenue by Region table with alternating row shading
    - Revenue by Category table
    - Top 10 Sales Reps table
    - Full transaction listing (may span multiple pages)
    - Page numbers in the footer

11. **Download a filtered PDF**

    ```bash
    curl -o north.pdf "http://localhost:4002/api/export/pdf?region=North%20West"
    open north.pdf
    ```

12. **Combine filters across formats**

    ```bash
    curl -o combo.xlsx "http://localhost:4002/api/export/excel?from=2025-04-01&to=2025-06-13&category=Phones%20%26%20Tablets"
    ```

    All three formats accept the same four query parameters — the filtering
    logic lives in the SQL query, not in any exporter.

## What I Learned

- Separating **data fetching** from **format rendering**: `fetchSalesReport`
  returns a `SalesReport` object that all three exporters consume, so
  filter logic lives in one place (the SQL `WHERE` clause) and each
  exporter just shapes data.
- Using PostgreSQL's `GENERATED ALWAYS AS (expr) STORED` to maintain a
  derived column (`revenue = units * unit_price`) at the database level,
  with no trigger or application code needed.
- **csv-stringify sync mode** for building multi-section CSV files: each
  section is serialized separately, then joined with newlines, making it
  easy to add summary blocks above the data rows.
- **ExcelJS** API patterns: `wb.addWorksheet()`, `ws.addRow()`,
  applying fills/fonts/number formats to cells individually, frozen header
  rows via `ws.views`, and `wb.xlsx.writeBuffer()` to get a `Buffer` to
  stream back.
- **PDFKit** is lower-level than ExcelJS — there is no built-in table
  widget, so tables are drawn with `doc.rect().fill()` for backgrounds
  and `doc.text()` with explicit x/y coordinates per cell. Managing
  `doc.y` manually and inserting `doc.addPage()` when the remaining
  height is less than one row height.
- Collecting PDFKit's streaming output into a `Buffer` with `doc.on('data')`
  / `doc.on('end')` wrapped in a `Promise`, so the async Express handler
  can `await` it before sending.
- Using `doc.switchToPage(i)` after `doc.end()` to add a footer to
  every page — PDFKit doesn't have a built-in header/footer mechanism.
- Setting correct `Content-Type` and `Content-Disposition: attachment`
  headers so browsers prompt a file download instead of trying to render
  the response inline.

## Challenge Info

| Field | Value |
|-------|-------|
| Day | 118 |
| Sprint | 4 — Data Engineering & Databases |
| Date | June 13, 2025 |
| Previous | [Day 117 - Full-Text Search](../day-117-pg-fts) |
| Next | Day 119 — Time-series data with PostgreSQL window functions |

Part of my 300 Days of Code Challenge!
