## Day 29 - March 6

**Project:** Data Pipeline (CSV + Lodash + API)
**Time Spent:** 2hrs

### What I Built

- CSV generator: auto-creates 15 Nigerian student records written to students.csv
- CSV parser: papaparse with TypeScript generics and dynamicTyping for typed data
- Subject breakdown: groupBy subject with average, highest, and lowest scores per group
- Top 5 ranking: orderBy score descending, sliced to top 5 students
- City averages: groupBy city, mean score per city, ranked descending
- Pass/fail filter: filter by score >= 75 threshold, calculates pass rate percentage
- API fetch: live programming joke from official-joke-api with node-fetch
- JSON export: full pipeline summary saved to pipeline-summary.json

### What I Learned

- How papaparse dynamicTyping automatically converts CSV strings to numbers
- Using Lodash groupBy, orderBy, filter, mean, max, min together on a real dataset
- How to structure a multi-phase pipeline combining synchronous and async operations
- Why saving pipeline output to JSON matters for downstream processing
- How TypeScript interfaces make CSV data safer to work with

### Resources Used

- papaparse docs: https://www.papaparse.com/docs
- lodash docs: https://lodash.com/docs/4.17.15
- node-fetch docs: https://github.com/node-fetch/node-fetch
- Official Joke API: https://official-joke-api.appspot.com

### Tomorrow

Day 30 - Sprint 1 Review
