# Day 22: node-fetch for APIs

## Description

A TypeScript CLI tool that uses the built-in Node.js fetch API to pull real data from five different public APIs. Covers posts, users, Pokemon stats, live crypto prices and programming jokes — all typed with TypeScript interfaces and displayed cleanly in the terminal.

## Features

- **JSONPlaceholder API** - Fetch posts with limit control and filter posts by user ID
- **Users API** - Fetch all 10 users with name, email, company and city
- **PokeAPI** - Search any Pokemon by name or ID, shows types, stats with bar chart, abilities
- **CoinGecko API** - Live crypto prices for BTC, ETH, SOL, ADA, DOGE with 24h change
- **JokeAPI** - Fresh programming jokes fetched live
- **Generic Fetch Wrapper** - One typed fetchJSON<T> function handles all API calls
- **Error Handling** - HTTP status errors and network failures handled cleanly

## Technologies Used

- TypeScript
- Node.js built-in fetch (Node 18+)
- Chalk (terminal colors)
- readline (built-in Node.js module)
- JSONPlaceholder API, PokeAPI, CoinGecko API, JokeAPI

## Installation

```bash
npm install
```

## How to Run

```bash
npx ts-node node-fetch-apis.ts
```

## Example Usage

### Fetch Posts:

```
How many posts? 3

  #1 — sunt aut facere repellat provident occaecati
       User ID: 1

  #2 — qui est esse
       User ID: 1
```

### Pokemon Search:

```
Enter Pokemon name or ID: charizard

  #6 — CHARIZARD

  Types    : fire, flying
  Height   : 1.7m
  Weight   : 90.5kg

  Base Stats:
    hp                  78 ███████
    attack             104 ██████████
    defense             78 ███████
    speed             100 ██████████
```

### Crypto Prices:

```
  Bitcoin     BTC   $67,432.00      ▲ 2.14%
  Ethereum    ETH   $3,521.00       ▲ 1.87%
  Solana      SOL   $178.00         ▼ 0.43%
```

## What I Learned

- Using Node.js built-in fetch (no extra library needed in Node 18+)
- Generic typed fetch wrapper fetchJSON<T> for type-safe responses
- Typing complex nested API responses with TypeScript interfaces
- Handling HTTP errors with response.ok and status codes
- Consuming multiple different APIs in one project

## Challenge Info
**Day:** 22/300
**Sprint:** 1 - Foundations
**Previous Day:** [Day 21 - TypeScript with Lodash for Arrays](../day-021-lodash-arrays)
**Next Day:** Day 23 - Simple CSV Parser with PapaParse

-----

Part of my 300 Days of Code Challenge!
