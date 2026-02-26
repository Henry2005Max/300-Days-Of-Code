# Day 21: TypeScript with Lodash for Arrays

## Description
A TypeScript CLI tool that demonstrates powerful array operations using the Lodash library. Uses two real-world datasets, Nigerian students and products with Naira prices, to showcase over 20 Lodash methods including groupBy, orderBy, partition, meanBy, sumBy, chunk, zip, shuffle and more.

## Features
- **Student Operations** - groupBy subject, orderBy grade, meanBy, countBy city, filter by city, maxBy, minBy, uniqBy
- **Product Operations** - partition by stock, groupBy category, mapValues, sumBy, orderBy rating, pick, chunk, sortBy
- **Array Utilities** - uniq, intersection, difference, flatten, zip, shuffle, take, takeRight
- **Run All** - Execute all three demos back to back
- **Nigerian Data** - Students from Lagos, Abuja, Kano, Ibadan, Port Harcourt. Products priced in Naira

## Technologies Used
- TypeScript
- Node.js
- Lodash 4.x
- Chalk (terminal colors)
- readline (built-in Node.js module)

## Installation

```bash
npm install
```

## How to Run

```bash
npx ts-node lodash-arrays.ts
```

## Example Usage

### Student Operations:
```
1. Top 3 Students by Grade (_.orderBy):
   1. Amaka      Grade: 95
   2. Bola       Grade: 91
   3. Fatima     Grade: 90

2. Students Grouped by Subject (_.groupBy):
   Math      : Henry, Emeka, Ngozi, Kemi
   Science   : Amaka, Chidi, Bola
   English   : Fatima, Uche, Tunde

3. Average Grade (_.meanBy):
   80.10

6. Students per City (_.countBy):
   Lagos          : 5
   Abuja          : 2
   Kano           : 1
```

### Product Operations:
```
3. Total Value of In-Stock Items (_.sumBy):
   ₦858,500

4. Top 3 Rated Products (_.orderBy):
   1. Rice (50kg)   ⭐ 4.8
   2. Sneakers      ⭐ 4.6
   3. Laptop        ⭐ 4.5
```

### Array Utilities:
```
2. Common elements between two arrays (_.intersection):
   A: [1, 2, 3, 4, 5]  B: [3, 4, 5, 6, 7]
   Common: [3, 4, 5]

6. Shuffle an array (_.shuffle):
   [7, 3, 1, 9, 4, 6, 2, 8, 5, 10]
```

## What I Learned
- Lodash methods for grouping, sorting, filtering and aggregating arrays
- _.groupBy and _.mapValues for building summary reports
- _.partition for splitting arrays into two groups by condition
- _.chunk for pagination logic
- _.zip for pairing two arrays together
- Difference between _.orderBy (multi-field) and _.sortBy

## Challenge Info
**Day:** 21/300
**Sprint:** 01 - Foundations
**Previous Day:** [Day 20 - Recipe Randomizer](../day-020-recipe-randomizer)
**Next Day:** Day 22 - node-fetch for APIs

---
Part of my 300 Days of Code Challenge!
