# Day 28: GitHub Action for CI

## Description
A TypeScript project that sets up a real Continuous Integration (CI) pipeline using GitHub Actions. Includes a calculator module with six functions, a full Jest test suite with 20 tests across 6 describe blocks, and a GitHub Actions workflow that automatically runs TypeScript type checking, all tests and a production build on every push and pull request to main — tested across Node.js 18 and 20.

## Features
- **Calculator Module** - Six typed functions: add, subtract, multiply, divide, power, percentage
- **Jest Test Suite** - 20 tests across 6 describe blocks covering edge cases and error throwing
- **GitHub Actions Workflow** - CI pipeline that triggers on push and pull request to main
- **Matrix Testing** - Runs the full pipeline on Node.js 18.x and 20.x simultaneously
- **TypeScript Type Check** - `tsc --noEmit` runs before tests to catch type errors early
- **Build Step** - Compiles TypeScript to JavaScript in the dist/ folder
- **Artifact Upload** - Compiled dist/ folder saved as a downloadable artifact for 7 days
- **npm ci** - Uses `npm ci` instead of `npm install` for clean, reproducible installs in CI
- **Coverage** - Run `npm run test:coverage` locally to see test coverage report

## Technologies Used
- TypeScript
- Node.js
- Jest 29.x
- ts-jest (TypeScript preprocessor for Jest)
- GitHub Actions

## Installation

```bash
npm install
```

## How to Run Tests Locally

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# TypeScript type check only
npm run typecheck

# Build to dist/
npm run build
```

## CI Pipeline Steps

```
On push or PR to main:
  ├── Node 18.x                    ├── Node 20.x
  │   1. Checkout code             │   1. Checkout code
  │   2. Set up Node 18            │   2. Set up Node 20
  │   3. npm ci                    │   3. npm ci
  │   4. tsc --noEmit (typecheck)  │   4. tsc --noEmit (typecheck)
  │   5. npm test (Jest)           │   5. npm test (Jest)
  │   6. npm run build             │   6. npm run build
  │   7. Upload dist artifact      │   7. Upload dist artifact
```

## Test Results

```
PASS  calculator.test.ts
  Calculator — add()
    ✓ adds two positive numbers
    ✓ adds negative numbers
    ✓ adds zeros
    ✓ adds large numbers
  Calculator — subtract()
    ✓ subtracts two numbers
    ✓ subtracts resulting in negative
    ✓ subtracts zero
  Calculator — multiply()
    ✓ multiplies two positive numbers
    ✓ multiplies by zero
    ✓ multiplies two negatives
    ✓ multiplies positive and negative
  Calculator — divide()
    ✓ divides two numbers
    ✓ divides resulting in decimal
    ✓ throws on division by zero
    ✓ divides negative numbers
  Calculator — power()
    ✓ raises to power
    ✓ raises to power of zero
    ✓ raises to power of one
  Calculator — percentage()
    ✓ calculates percentage
    ✓ calculates 100 percent
    ✓ throws when total is zero

Test Suites: 1 passed, 1 total
Tests:       20 passed, 20 total
```

## What I Learned
- Writing a GitHub Actions workflow YAML from scratch
- Matrix strategy to test across multiple Node.js versions simultaneously
- Difference between npm install and npm ci (clean installs for CI)
- tsc --noEmit for type checking without generating output files
- ts-jest for running TypeScript test files directly without pre-compiling
- Uploading build artifacts with actions/upload-artifact
- Writing thorough Jest tests including error throwing cases with toThrow()

## Challenge Info
**Day:** 28/300
**Sprint:** 1 - Foundations
**Previous Day:** [Day 27 - Cron Examples](../day-027-cron-examples)
**Next Day:** Day 29 - Log Parser

---
Part of my 300 Days of Code Challenge!
