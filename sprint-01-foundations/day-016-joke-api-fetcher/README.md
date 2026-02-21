# Day 16: Joke API Fetcher

## Description
A TypeScript CLI tool that fetches jokes from the JokeAPI.dev API. Get random jokes, filter by category, fetch programming jokes, or grab multiple jokes at once — all from your terminal with colored output.

## Features
- **Random Joke** - Fetch a random joke from any category
- **Joke by Category** - Choose from Programming, Misc, Dark, Pun, Spooky, Christmas
- **Programming Jokes** - Dedicated option for coding and tech humor
- **Multiple Jokes** - Fetch 1-10 jokes in one request
- **Safe Mode** - Family-friendly jokes only
- **Two-Part Jokes** - Setup and punchline with dramatic pause
- **Category Colors** - Each category has its own color in terminal
- **Error Handling** - Clear messages when network is unavailable

## Technologies Used
- TypeScript
- Node.js
- https (built-in Node.js module)
- JokeAPI v2 (https://v2.jokeapi.dev)
- Chalk (terminal colors)

## Installation

```bash
npm install
```

## How to Run

```bash
npx ts-node joke-fetcher.ts
```

## Example Usage

### Random Joke:
```
Category: Programming | ID: 23 | Safe

Why do Java developers wear glasses?
... 
Because they don't C#!
```

### Multiple Jokes (3):
```
Joke #1
Category: Pun | ID: 45

Joke #2
Category: Misc | ID: 102

Joke #3
Category: Programming | ID: 7
```

### Safe Mode:
```
Category: Any | ID: 198 | Safe

I told my wife she was drawing her eyebrows too high.
She looked surprised.
```

## What I Learned
- Making HTTP requests with Node.js built-in https module (no axios/fetch needed)
- Consuming a public REST API with TypeScript types
- Handling different response shapes with union types (SingleJoke | TwoPartJoke)
- Type guards and narrowing with discriminated unions
- Async/await with Promise wrappers around callback-based APIs

## Challenge Info
**Day:** 16/300
**Sprint:** 1 - Foundations
**Previous Day:** [Day 15 - QR Code Generator](../day-015-qr-generator)
**Next Day:** Day 17 - Palindrome Checker

---
Part of my 300 Days of Code Challenge!
