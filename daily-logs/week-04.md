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

## Day 22 - [Today's Date]
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
