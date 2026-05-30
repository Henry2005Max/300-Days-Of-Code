## Day 111 - May 30

**Project:** TypeScript Terminal Dashboard v2
**Time Spent:** 3 hours

### What I Built

Built an enhanced terminal dashboard that improves on Day 101 with four additions: a Unicode sparkline trend chart, a medal-ranked leaderboard panel, a live-cycling notification feed, and a pulsing uptime counter. The layout now uses a two-column top row (summary + notifications side by side) followed by two full-width rows (trend with sparkline, leaderboard). All rendering still uses pure ANSI escape codes with no external TUI library.

The sparkline maps an array of monthly revenue values to 8 Unicode block characters (`▁` through `█`) by normalising each value to `[0, 7]` — `Math.floor((v - min) / range * 7)`. This produces a compact visual trend above the bar chart that shows the shape of the revenue curve at a glance. The notification panel takes a static list and cycles through it using a `Math.floor(tick / 5) % length` offset so entries rotate every 10 seconds, creating the appearance of a live feed without any real event system. The pulse indicator in the summary panel toggles between `●` and `○` based on `tick % 2` — a simple way to show the dashboard is alive.

The `visLen` and `visPad` helpers from the ANSI module strip escape codes before measuring string length — essential for correct column alignment when mixing coloured and plain text in the same row. Auto-scaling Naira formatting (`₦1.2B`, `₦450M`, `₦12K`) keeps all monetary values readable regardless of magnitude without any manual padding decisions. The data loader checks for the Day 110 pipeline's `summary.json` and falls back to realistic mock data — making the dashboard runnable with zero setup.

### What I Learned

- Sparklines map values to Unicode blocks by normalising to `[0, 7]` with `Math.floor((v - min) / range * 7)` — the same 8-step quantisation used by most terminal sparkline libraries
- ANSI colour codes must be stripped before measuring string length — `visLen` using `/\x1b\[[0-9;]*m/g` regex is required for correct column padding when mixing coloured and plain text
- A two-column terminal layout is just two box arrays rendered side by side on each line — no grid library needed, just padding each box to a fixed width
- Cycling a list with `Math.floor(tick / N) % length` controls how many render ticks pass between each rotation step — `N = 5` at 2s refresh means 10 seconds per step
- A `tick` counter passed to panel render functions enables time-based animations without any shared mutable state between panels
- Auto-scaling number formatting with explicit magnitude thresholds (B/M/K) is more readable on dashboards than fixed decimal places

### Resources Used

- [Unicode block elements](https://en.wikipedia.org/wiki/Block_Elements)
- [ANSI escape code reference](https://en.wikipedia.org/wiki/ANSI_escape_code)
- [Terminal sparkline techniques](https://github.com/holman/spark)
- Day 101 source code — extended and improved
