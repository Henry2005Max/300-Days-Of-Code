# Day 111: TypeScript Terminal Dashboard v2

An enhanced terminal dashboard that builds on Day 101 with four new features: a sparkline trend chart above the monthly revenue bars, a medal-ranked leaderboard for categories and cities, a live notification feed that cycles through pipeline events, and a pulsing uptime counter. Reads from the Day 110 pipeline's `summary.json` output — falls back to realistic mock data if the file isn't present.

## What's New vs Day 101

| Feature | Day 101 | Day 111 |
|---------|---------|---------|
| Panels | 4 (summary, products, categories, trend) | 4 redesigned (summary+uptime, trend+sparkline, leaderboard, notifications) |
| Sparkline | None | Unicode block sparkline above trend bars |
| Leaderboard | None | Medal-ranked categories + cities with bars |
| Notifications | None | Cycling feed of pipeline events |
| Uptime | None | Live MM:SS counter with pulse indicator |
| Data source | PostgreSQL | Day 110 JSON or mock — no DB needed |
| Layout | Single column | Two-column top row + full-width bottom rows |

## Features

- Sparkline built from Unicode block characters (`▁▂▃▄▅▆▇█`) scaled to data range
- Two-column layout for summary and notifications side by side
- Medal emojis (🥇🥈🥉) in leaderboard for top 3 positions
- Notification feed slowly cycles entries — looks live without real events
- Pulsing heartbeat (`●`/`○`) in summary panel tied to tick counter
- Naira formatting auto-scales: `₦1.2B`, `₦450M`, `₦12K`
- Reads `SUMMARY_JSON` from `.env` — point at any Day 110 output
- `visPad` / `visLen` helpers strip ANSI codes before padding for correct column alignment
- Flicker-free render via cursor home + overwrite (same pattern as Day 101)

## Technologies Used

- Node.js + TypeScript
- ANSI escape codes — all rendering, no external TUI library
- `dotenv` — environment configuration
- `tsx` — TypeScript execution

## Folder Structure

```
day-111-ts-dashboard-2/
├── src/
│   ├── data/
│   │   └── loader.ts           # Reads Day 110 JSON or returns mock data
│   ├── panels/
│   │   ├── leaderboardPanel.ts # Medal-ranked categories and cities
│   │   ├── notificationPanel.ts# Cycling notification feed
│   │   ├── statusBar.ts        # Clock, refresh, source, quit hint
│   │   ├── summaryPanel.ts     # Key metrics + uptime + pulse
│   │   └── trendPanel.ts       # Sparkline + monthly bar chart
│   ├── renderer/
│   │   ├── ansi.ts             # ANSI codes, sparkline, hbar, visLen, visPad
│   │   ├── box.ts              # Bordered panel renderer
│   │   └── dashboard.ts        # Assembles all panels, writes to stdout
│   ├── types/
│   │   └── index.ts            # Interfaces
│   └── index.ts                # Main loop with tick counter
├── .env
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd day-111-ts-dashboard-2
npm install
```

## How to Run

```bash
# Run with mock data (no setup needed)
npm run dashboard

# Run with Day 110 pipeline output (run Day 110 first)
# The .env already points to ../day-110-data-pipeline/data/output/summary.json
npm run dashboard
```

## Testing Step by Step

1. **Install:**
   ```bash
   npm install
   ```

2. **Run immediately with mock data:**
   ```bash
   npm run dashboard
   ```
   You should see a two-column layout with summary + notifications on top, trend sparkline in the middle, and leaderboard at the bottom.

3. **Observe the sparkline** — the trend panel shows a `▁▂▃▄▅▆▇█` chart above the monthly bars. The shape follows the revenue curve across all 12 months.

4. **Watch the pulse** — the `●`/`○` indicator in the summary panel toggles every 2 seconds.

5. **Watch the notification feed** — entries cycle slowly, creating the appearance of a live event stream.

6. **Connect to real Day 110 data:**
   - Run Day 110 first: `cd ../day-110-data-pipeline && npm run generate && npm run pipeline`
   - The status bar will show `Source: Day 110 pipeline` instead of `Source: mock data`

7. **Change refresh rate** in `.env`:
   ```
   REFRESH_MS=1000
   ```

8. **Press Ctrl+C** — cursor reappears cleanly.

## What I Learned

- Sparklines using Unicode block characters require mapping values to 8 levels (`▁` through `█`) by normalising to `[0, 7]` with `Math.floor((v - min) / range * 7)`
- ANSI codes inflate `str.length` — `visLen` strips them with `/\x1b\[[0-9;]*m/g` before measuring; `visPad` uses that length for correct padding
- A two-column layout in a terminal is just two independently rendered box arrays joined on the same output line — no special grid system needed
- Auto-scaling number formatting (`₦1.2B` vs `₦450M` vs `₦12K`) makes dashboards readable across wildly different value ranges without manual tuning
- A `tick` counter passed to each panel render function enables time-based animations (pulse, cycling list) without any shared mutable state
- Reading from a JSON file on every refresh cycle is fast enough for 2-second intervals and means the dashboard automatically reflects updated pipeline output

## Challenge Info

| Field    | Detail                                      |
|----------|---------------------------------------------|
| Day      | 111                                         |
| Sprint   | 5 — Mobile Apps (React Native / Expo)       |
| Date     | 2025-01-25                                  |
| Previous | [Day 110](../day-110-data-pipeline)         |
| Next     | [Day 112](../day-112-cron-examples-2)       |

Part of my 300 Days of Code Challenge!
