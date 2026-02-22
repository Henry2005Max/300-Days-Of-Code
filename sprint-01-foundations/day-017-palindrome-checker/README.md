# Day 17: Palindrome Checker

## Description
A TypeScript CLI tool that checks whether words, phrases, sentences, and numbers are palindromes. Ignores spaces, punctuation, and casing so classic phrases like "A man a plan a canal Panama" are correctly identified. Also shows where a non-palindrome breaks and supports batch checking multiple inputs at once.

## Features
- **Single Check** - Check any word or phrase instantly
- **Batch Check** - Check multiple inputs at once with a summary
- **Number Check** - Check if a number reads the same forwards and backwards
- **Break Detection** - Shows exactly where a non-palindrome fails
- **Examples Viewer** - See classic palindromes with pass/fail display
- **Smart Cleaning** - Ignores spaces, punctuation and casing automatically
- **Word Count** - Shows number of words for phrase palindromes

## Technologies Used
- TypeScript
- Node.js
- Chalk (terminal colors)
- readline (built-in Node.js module)

## Installation

```bash
npm install
```

## How to Run

```bash
npx ts-node palindrome-checker.ts
```

## Example Usage

### Single Word:
```
Enter a word or phrase: racecar

YES! It is a palindrome!
Original : "racecar"
Cleaned  : "racecar"
Reversed : "racecar"
Length   : 7 characters
```

### Phrase:
```
Enter a word or phrase: A man a plan a canal Panama

YES! It is a palindrome!
Original : "A man a plan a canal Panama"
Cleaned  : "amanaplanacanalpanama"
Reversed : "amanaplanacanalpanama"
Length   : 21 characters
Words    : 6 words
```

### Not a Palindrome:
```
Enter a word or phrase: hello

No, it is not a palindrome.
Original : "hello"
Cleaned  : "hello"
Reversed : "olleh"
Breaks at position 1: 'h' vs 'o'
```

### Batch Check:
```
Entry 1: racecar
Entry 2: hello
Entry 3: level
Entry 4: done

Results: 3 checked
Palindromes     : 2
Not Palindromes : 1

YES  "racecar"
NO   "hello"
YES  "level"
```

## What I Learned
- String manipulation with split, reverse, join
- Regex for cleaning strings (removing non-alphanumeric characters)
- TypeScript interfaces for structured return types
- Discriminated logic with detailed result objects
- Batch processing with array methods

## Challenge Info
**Day:** 17/300
**Date:** Feb 22
**Sprint:** 1 - Foundations
**Previous Day:** [Day 16 - Joke API Fetcher](../day-016-joke-api-fetcher)
**Next Day:** Day 18 - FizzBuzz with TypeScript Generics

---
Part of my 300 Days of Code Challenge!
