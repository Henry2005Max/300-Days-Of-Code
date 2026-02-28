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

### Challenges

### Tomorrow
Day 24 - Basic Plots with Chart.js in Node
