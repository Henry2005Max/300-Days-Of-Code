# Day 20: Recipe Randomizer

## Description
A TypeScript CLI tool that stores 10 recipes across multiple cuisines and lets you discover them by random selection, category, cuisine, difficulty, or tag search. Includes Nigerian classics like Jollof Rice, Egusi Soup, Suya, Puff Puff and Chapman alongside international dishes. Each recipe includes full ingredients, step-by-step instructions, prep and cook times, servings and tags.

## Features
- **Random Recipe** - Get a completely random recipe from all 10
- **Browse by Category** - Filter by Breakfast, Lunch, Dinner, Snack, Dessert, Drink
- **Browse by Cuisine** - Filter by Nigerian, Italian, Asian, American, Mexican
- **Browse by Difficulty** - Filter by Easy, Medium or Hard
- **Tag Search** - Search by ingredient or style (e.g. spicy, quick, rice, fried)
- **Full Recipe View** - Shows ingredients, numbered steps, times, servings and tags
- **Recipe List View** - Clean table showing name, cuisine, difficulty and total time

## Technologies Used
- TypeScript
- Node.js
- Chalk (terminal colors)
- readline (built-in Node.js module)
- TypeScript union types (Category, Cuisine, Difficulty)

## Installation

```bash
npm install
```

## How to Run

```bash
npx ts-node recipe-randomizer.ts
```

## Example Usage

### Random Recipe:
```
  JOLLOF RICE
  Category: Dinner   Cuisine: Nigerian
  Difficulty: Medium   Servings: 6 people
  Prep Time: 20 min   Cook Time: 45 min   Total: 65 min
  Tags: rice, tomato, spicy, classic, party

  INGREDIENTS:
    • 3 cups long grain parboiled rice
    • 1 can crushed tomatoes
    ...

  STEPS:
    1. Blend tomatoes, peppers and half the onion...
    2. Heat oil in a pot, fry remaining sliced onion...
```

### Browse by Cuisine (Nigerian):
```
  Found 5 recipe(s):

  1. Jollof Rice         Nigerian      Medium    65 min
  2. Egusi Soup          Nigerian      Medium    90 min
  3. Suya                Nigerian      Medium    60 min
  4. Puff Puff           Nigerian      Easy      80 min
  5. Chapman Drink       Nigerian      Easy      10 min
```

### Tag Search (quick):
```
  Search tag: quick

  Found 3 recipe(s):
  1. Spaghetti Aglio e Olio  Italian  Easy  25 min
  2. Fried Rice              Asian    Easy  30 min
  3. Tacos                   Mexican  Easy  30 min
```

## What I Learned
- Structuring data with TypeScript interfaces and union types
- Filtering arrays with multiple optional parameters
- Generic helper functions (getRandom<T>)
- Building a multi-filter search system
- Organizing a CLI app around a local data store

## Challenge Info
**Day:** 20/300
**Sprint:** 1 - Foundations
**Previous Day:** [Day 19 - Basic Chatbot with readline](../day-019-basic-chatbot)
**Next Day:** Day 21 - TS with Lodash for Arrays (Sprint 1 Week 4 begins!)

---
Part of my 300 Days of Code Challenge!
