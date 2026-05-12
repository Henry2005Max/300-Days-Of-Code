[README.md](https://github.com/user-attachments/files/27649999/README.md)
# Day 93: Data Visualization with Chart.js in Node.js

A Node.js + TypeScript CLI that pulls aggregate sales data from PostgreSQL and generates five PNG chart files using Chart.js and `chartjs-node-canvas` — no browser, no frontend. Charts are rendered server-side and saved directly to disk.

## What's New

First data visualization project in the challenge. Introduces `chartjs-node-canvas`, a Node.js adapter that runs Chart.js on a server-side canvas via the `canvas` package. Covers bar charts, horizontal bar charts, line charts with dual Y-axes, and pie charts — all rendered to PNG files from live PostgreSQL data.

## Features

- Pulls live data from the Day 91 PostgreSQL database (`csv_analyzer`)
- Five parallel data queries: category revenue, monthly trend, top products, city revenue, stock levels
- Five chart types rendered to PNG: vertical bar, line (dual Y-axis), pie, horizontal bar, grouped bar
- All charts saved to `./output/` with descriptive filenames
- Terminal summary table printed alongside the chart files
- Lazy `pg.Pool` singleton — pool created on first query, never at module load
- All five charts rendered in parallel via `Promise.all`
- Green palette throughout for visual consistency

## Technologies Used

- Node.js + TypeScript
- `chart.js` — chart definitions and configuration
- `chartjs-node-canvas` — server-side canvas renderer for Chart.js
- `pg` — PostgreSQL connection pool
- `dotenv` — environment configuration
- `tsx` — TypeScript execution

## Folder Structure

```
day-093-data-viz/
├── output/                         # Generated PNG chart files (git-ignored)
│   ├── chart-01-category-revenue.png
│   ├── chart-02-monthly-trend.png
│   ├── chart-03-category-pie.png
│   ├── chart-04-top-products.png
│   └── chart-05-city-revenue.png
├── src/
│   ├── charts/
│   │   └── renderer.ts             # All five chart render functions
│   ├── db/
│   │   └── pool.ts                 # Lazy pg.Pool singleton
│   ├── queries/
│   │   └── dataQueries.ts          # Aggregate SQL queries
│   ├── services/
│   │   └── printer.ts              # Terminal summary output
│   ├── types/
│   │   └── index.ts                # Interfaces
│   └── index.ts                    # Entry point — fetch, render, save
├── .env
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd day-093-data-viz
npm install
```

Requires the `csv_analyzer` PostgreSQL database from Day 91 to be running and populated.

## How to Run

```bash
npm run generate
```

Charts are saved to `./output/`. Open them in Finder or any image viewer.

## Testing Step by Step

1. **Confirm the Day 91 database is running and has data:**
   ```bash
   psql -U postgres -d csv_analyzer -c "SELECT COUNT(*) FROM sales_records;"
   ```
   Should return 50.

2. **Set your connection string in `.env`:**
   ```
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/csv_analyzer
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the generator:**
   ```bash
   npm run generate
   ```

5. **Check terminal output** — you should see:
    - Category revenue summary table
    - Monthly trend table
    - Top products list
    - Top cities list
    - File paths for all five charts

6. **Open the output folder to view charts:**
   ```bash
   open ./output
   ```

7. **Adjust chart dimensions** in `.env`:
   ```
   CHART_WIDTH=1200
   CHART_HEIGHT=600
   ```
   Re-run to generate larger charts.

8. **Change output directory** in `.env`:
   ```
   OUTPUT_DIR=./charts
   ```
   The folder is created automatically if it doesn't exist.

9. **Test with different data** — add more rows to `data/sales.csv` from Day 91, re-run the Day 91 analyzer to reload the DB, then re-run this tool to see updated charts.

10. **Verify chart files exist:**
    ```bash
    ls -lh ./output/
    ```

## What I Learned

- `chartjs-node-canvas` wraps Chart.js in a Node.js-compatible canvas — the Chart.js config is identical to browser usage, only the render step differs
- `ChartJSNodeCanvas.renderToBuffer()` returns a `Promise<Buffer>` — write it directly with `fs.writeFileSync()`
- Dual Y-axes in Chart.js use `yAxisID` on each dataset and `position: 'left'`/`'right'` on the scale definitions
- Horizontal bar charts are just `type: 'bar'` with `indexAxis: 'y'` — no separate chart type needed
- `backgroundColour` on `ChartJSNodeCanvas` sets the canvas background — without it charts are transparent PNG which looks bad on white backgrounds
- All five chart renders can be fired in parallel with `Promise.all` since they each use an independent canvas instance
- `canvas` (the native dependency of `chartjs-node-canvas`) may need Xcode command-line tools on macOS: `xcode-select --install`
- Chart.js v4 requires all plugin options (title, legend) to be nested under `options.plugins` — the v2/v3 flat structure no longer works

## Challenge Info

| Field    | Detail                                  |
|----------|-----------------------------------------|
| Day      | 93                                      |
| Sprint   | 4 — Data Engineering & Databases        |
| Date     | 2025-01-07                              |
| Previous | [Day 92](../day-092-prisma-orm)         |
| Next     | [Day 94](../day-094-x-bot)             |

Part of my 300 Days of Code Challenge!
