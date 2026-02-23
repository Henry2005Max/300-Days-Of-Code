 Day 18: FizzBuzz with TypeScript Generics

## Description
A TypeScript CLI tool that takes the classic FizzBuzz problem and supercharges it with generics. Instead of hardcoding "Fizz" and "Buzz", the core function works with any label type — strings, emojis, or custom words. Includes classic mode, extended FizzBuzzBazz, a Nigeria Edition, emoji mode, and a fully custom rule builder.

## Features
- **Classic FizzBuzz** - The original: Fizz for 3, Buzz for 5, FizzBuzz for 15
- **FizzBuzzBazz** - Extended with a third rule: Bazz for 7
- **Nigeria Edition** - Naija, Lagos, Abuja as labels
- **Emoji Edition** - Fire, water, lightning as labels
- **Custom Rules** - Build your own divisors and labels (up to 5 rules)
- **TypeScript Generics** - Core function works with any label type T
- **Match Stats** - Shows total numbers, matched count, plain count

## Technologies Used
- TypeScript
- Node.js
- Chalk (terminal colors)
- readline (built-in Node.js module)
- TypeScript Generics (FizzBuzzRule<T>, FizzBuzzResult<T>)

## Installation

```bash
npm install
```

## How to Run

```bash
npx ts-node fizzbuzz.ts
```

## Example Usage

### Classic FizzBuzz (1-20):
```
   1 → 1
   2 → 2
   3 → Fizz
   4 → 4
   5 → Buzz
   6 → Fizz
  15 → FizzBuzz
  
Total: 20 numbers | 8 matched | 12 plain numbers
```

### Nigeria Edition:
```
   3 → Naija
   5 → Lagos
  15 → NaijaLagos
  21 → NaijaAbuja
  35 → LagosAbuja
 105 → NaijaLagosAbuja
```

### Custom Rules:
```
Divisor: 4   Label: Boom
Divisor: 6   Label: Zap

   4 → Boom
   6 → Zap
  12 → BoomZap
  24 → BoomZap
```

## What I Learned
- TypeScript Generics with type parameter T
- Generic interfaces (FizzBuzzRule<T>, FizzBuzzResult<T>)
- How generics make one function work for many types
- Modulo operator (%) for divisibility checks
- Building rule-based systems instead of hardcoded if/else

## Challenge Info
**Day:** 18/300
**Date** Feb 23
**Sprint:** 1 - Foundations
**Previous Day:** [Day 17 - Palindrome Checker](../day-017-palindrome-checker)
**Next Day:** Day 19 - Basic Chatbot with readline

---
Part of my 300 Days of Code Challenge!
