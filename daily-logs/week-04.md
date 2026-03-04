## Day 21 - February 26
**Project:** TypeScript with Lodash for Arrays
**Time Spent:** 2hrs 33mins 

### What I Built
- Student data demo: orderBy, groupBy, meanBy, filter, maxBy, minBy, countBy, uniqBy
- Product data demo: partition, groupBy, mapValues, sumBy, orderBy, pick, chunk, sortBy
- Array utilities demo: uniq, intersection, difference, flatten, zip, shuffle, take, takeRight
- Nigerian themed datasets (students from Lagos/Abuja/Kano, products priced in Naira)

### What I Learned
- Over 20 Lodash methods and when to use each
- _.groupBy for categorising data into buckets
- _.partition for splitting arrays into two groups
- _.mapValues for transforming grouped data summaries
- _.chunk for pagination logic
- _.zip for pairing two separate arrays together
- When Lodash beats plain JavaScript (readability and chaining)

### Resources Used
- Lodash documentation: https://lodash.com/docs/4.17.15
- Lodash FP guide: https://github.com/lodash/lodash/wiki/FP-Guide
- @types/lodash: https://www.npmjs.com/package/@types/lodash



### Tomorrow
Day 22 - node-fetch for APIs

## Day 22 - February 27
**Project:** node-fetch for APIs
**Time Spent:** 2hours

### What I Built
- Generic typed fetch wrapper fetchJSON<T> for all API calls
- JSONPlaceholder integration: fetch posts with limit, fetch users, filter posts by user ID
- PokeAPI integration: search Pokemon by name or ID with stat bar chart
- CoinGecko integration: live BTC, ETH, SOL, ADA, DOGE prices with 24h change indicator
- JokeAPI integration: live programming jokes
- Full TypeScript interfaces for all API response shapes

### What I Learned
- Node.js 18+ has fetch built in — no extra library needed
- Generic typed fetch wrapper fetchJSON<T> for type-safe API responses
- Typing complex nested JSON responses with TypeScript interfaces
- Handling HTTP errors with response.ok and response.status
- Consuming multiple different APIs in a single project

### Resources Used
- Node.js fetch docs: https://nodejs.org/api/globals.html#fetch
- JSONPlaceholder API: https://jsonplaceholder.typicode.com
- PokeAPI docs: https://pokeapi.co/docs/v2
- CoinGecko API: https://www.coingecko.com/api/documentation
- JokeAPI docs: https://sv443.net/jokeapi/v2

### Tomorrow
Day 23 - Simple CSV Parser with PapaParse


## Day 23 - February 28
**Project:** Simple CSV Parser with PapaParse
**Time Spent:**2hrs

### What I Built
- CSV loader using PapaParse with header detection and dynamicTyping
- Formatted table display with dynamic column widths
- File stats: rows, columns, headers, numeric columns, empty values
- Filter by any column with partial string matching
- Sort by any column ascending or descending
- Column statistics: count, sum, average, median, min, max
- Export filtered or full data back to a new CSV file
- Auto-generated sample files: students.csv, products.csv, sales.csv

### What I Learned
- PapaParse for CSV parsing and unparsing in Node.js
- dynamicTyping option to auto-convert number strings to numbers
- Building aligned table output with padEnd for dynamic column widths
- Computing median from a sorted array
- Papa.unparse to write arrays of objects back to CSV format

### Resources Used
- PapaParse docs: https://www.papaparse.com/docs
- @types/papaparse: https://www.npmjs.com/package/@types/papaparse
- MDN Array.sort(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort

### Tomorrow
Day 24 - Basic Plots with Chart.js in Node

## Day 24 - March 1st
**Project:** Basic Plots with Chart.js in Node
**Time Spent:**3-4 hrs

### What I Built
- Bar chart: monthly sales comparison Lagos vs Abuja (6 months)
- Line chart: website visitors and conversions with area fill (8 months)
- Pie chart: product category sales breakdown (5 categories)
- Doughnut chart: user distribution across 5 Nigerian cities
- Scatter plot: study hours vs grade for Math and Science students
- Generate all option to create all 5 charts at once
- All charts saved as 800x500px PNG files

### What I Learned
- chartjs-node-canvas renders Chart.js server-side without a browser
- Chart.js configuration object: type, data (labels + datasets), options
- renderToBuffer() returns PNG bytes to write to disk with fs.writeFileSync
- Different chart types and when each one is appropriate
- Customising titles, legends, axis labels, colors and tension in Chart.js

### Resources Used
- chartjs-node-canvas docs: https://github.com/SeanSobey/ChartjsNodeCanvas
- Chart.js docs: https://www.chartjs.org/docs/latest
- Chart.js configuration: https://www.chartjs.org/docs/latest/configuration



### Tomorrow
Day 25 - Cron Job Scheduler with node-cron

## Day 25 - 2nd March, 2026
**Project:** Cron Job Scheduler with node-cron
**Time Spent:**

### What I Built
- System check job: logs memory usage and process uptime
- Greeting job: time-aware morning/afternoon/evening message
- Backup simulation: creates timestamped backup files
- Random quote job: prints a programming quote from a list
- Counter job: tracks and displays total run count per job
- Seven schedule presets (every 5 seconds to daily at 8am)
- Custom cron expression input with validation
- Job registry with start, stop, view and stop-all controls
- Automatic logging to cron-log.txt with fs.appendFileSync

### What I Learned
- node-cron for scheduling tasks in Node.js
- Cron expression syntax: second, minute, hour, day of month, month, day of week
- cron.validate() to check expressions before scheduling
- Managing multiple concurrent jobs with a Map registry
- Stopping tasks cleanly with scheduledTask.stop()
- process.exit(0) needed to terminate when cron keeps process alive

### Resources Used
- node-cron docs: https://github.com/node-cron/node-cron
- Cron expression guide: https://crontab.guru
- @types/node-cron: https://www.npmjs.com/package/@types/node-cron


### Tomorrow
Day 26 - Sprint 1 Data Handling: TS Dashboard Mock

## Day 26 - March 3rd
**Project:** TypeScript Dashboard Mock
**Time Spent:** 3hrs

### What I Built
- Overview section: 6 KPI cards with revenue growth indicator and yearly bar chart
- Sales report: 12-month table with revenue, orders, customers and annual totals
- Top products: revenue-ranked table with stock alerts and category bar chart
- User report: plan breakdown, top 5 spenders, active status, city distribution
- Low stock alert: items under 100 units with red highlighting under 50
- Full dashboard: all sections in one run
- Terminal ASCII bar charts built from scratch with block characters

### What I Learned
- Designing multi-section CLI dashboards with structured TypeScript data
- Building ASCII bar charts using padEnd and block characters proportionally
- Calculating business KPIs: growth %, avg order value, active user rate
- TypeScript union types for constrained values (Free | Pro | Enterprise)
- Sorting, filtering and aggregating across multiple typed datasets

### Resources Used
- TypeScript interfaces: https://www.typescriptlang.org/docs/handbook/2/objects.html
- Chalk docs: https://github.com/chalk/chalk/tree/v4
- Unicode block characters: https://unicode-table.com/en/blocks/block-elements


### Tomorrow
Day 27 - Cron Examples

## Day 27 - March 4th, 2026
**Project:** Cron Examples
**Time Spent:** 3hourrs

### What I Built
- Health monitor: memory, uptime, CPU tracking saved to metrics-history.json
- Report generator: timestamped sales report .txt files on schedule
- Data cleanup: simulated stale file scanning with storage freed calculation
- News ticker: 8 Nigerian headlines cycling every 6 seconds
- Rate limiter: API call accumulation with quota check and reset per window
- Shared structured log file with INFO/WARN/ERROR/SUCCESS levels
- Map registry for named task management and clean stop control
- Metrics history viewer showing last 8 snapshots in a table

### What I Learned
- Real-world cron patterns used in production: monitoring, reporting, cleanup
- Writing structured log entries with log levels to a shared file
- Persisting growing data to JSON with fs.writeFileSync on every update
- Rate limiter window pattern: accumulate calls → check → reset
- Running 5+ concurrent jobs at different intervals simultaneously
- Named Map registry for cleaner task management vs anonymous arrays

### Resources Used
- node-cron docs: https://github.com/node-cron/node-cron
- Node.js fs.appendFileSync: https://nodejs.org/api/fs.html#fsappendfilesyncpath-data-options
- Rate limiting patterns: https://developer.mozilla.org/en-US/docs/Glossary/Rate_limit


### Tomorrow
Day 28 - GitHub Action for CI
