# Week 2 - Days 8-14

## Day 8 - February 13, 2026
**Project:** Currency Converter (NGN Focus + API)
**Time Spent:** 3 Hours

### What I Built
- NGN focused currency converter with live rates
- Supports 12 currencies including African ones (GHS, KES, ZAR)
- Live rates from exchangerate-api.com
- Fallback rates when API unavailable
- Quick NGN → USD reference table
- Convert any supported currency pair

### What I Learned
- Fetching live financial data from APIs
- Building fallback systems for when API fails
- Currency conversion mathematics
- Formatting numbers for currencies (JPY has no decimals!)
- Timeout handling for API calls
- African currency codes
- Building reference tables in terminal

### Challenges
- Understanding currency conversion through base rates
- Formatting different currencies correctly
- Building the fallback rate system
- Remembering tsconfig.json from the start

### Resources Used
- exchangerate-api.com documentation
- Currency codes reference (ISO 4217)
- Axios timeout documentation

### Tomorrow's Plan
- Day 9: TypeScript Encryption (crypto module)

---

## Day 9 - February 14, 2026
**Project:** TypeScript Encryption (crypto module)
**Time Spent:** 5 hours

### What I Built
- Hashing tool (MD5, SHA1, SHA256, SHA512)
- AES-256 encryption and decryption
- Base64 encoder and decoder
- Caesar cipher (encrypt and decrypt)
- Secure random token generator
- UUID generator

### What I Learned
- Difference between hashing and encryption
- AES-256-CBC algorithm with IV
- Key derivation with scrypt
- Base64 is encoding not encryption
- Caesar cipher logic with shift
- Cryptographically secure random generation
- When to use each security method

### Challenges
- Understanding IV (Initialization Vector) in AES
- Key derivation from passwords
- Caesar cipher shift logic for both directions

### Resources Used
- Node.js crypto documentation
- AES encryption guide
- Crypto best practices

### Tomorrow's Plan
- Day 10: Review - Add Jest tests to Day 1 Calculator
---

## Day 10 - Febraury 15, 2026
**Project:** Review - Jest Tests for Day 1 Calculator
**Time Spent:** 3 hours

### What I Built
- 45 unit tests for the Day 1 calculator
- Separated calculator logic into testable functions
- Tests for all 6 operations (+, -, *, /, %, **)
- Edge case tests (zero, negatives, large numbers)
- Error tests (division by zero, invalid operators)
- Validation tests for inputs and operations

### What I Learned
- How to write unit tests with Jest
- describe() for grouping, test() for individual cases
- toBe() for equality, toThrow() for errors
- ts-jest for TypeScript + Jest integration
- Why separating logic from UI matters for testing
- Test coverage reports
- Watch mode for development
- TDD mindset - test everything!

### Challenges
- Separating calculator logic from CLI code
- Understanding how toThrow() works
- Setting up ts-jest correctly
- Understanding test coverage reports

### Resources Used
- Jest documentation
- ts-jest documentation
- Unit testing best practices

### Tomorrow's Plan
- Day 11: Unit Converter

## Day 11 - February 16
**Project:** Unit Converter
**Time Spent:** 2 hours

### What I Built
- Unit converter with 5 categories
- Length: meter, km, mile, yard, foot, inch, cm, mm
- Weight: kg, gram, pound, ounce, ton, milligram
- Temperature: Celsius, Fahrenheit, Kelvin
- Speed: m/s, km/h, mph, knots, feet/second
- Area: sq meter, km, mile, foot, acre, hectare
- Quick reference tables for common conversions

### What I Learned
- TypeScript mapped types for conversion tables
- Generic functions that work with different data
- Temperature needs special formula (not just multiply)
- Organizing large data structures cleanly
- Input validation for unit names

### Challenges
- Temperature conversion is different from others
- Keeping conversion tables organized
- Error messages when user types wrong unit name

### Resources Used
- Unit conversion formulas reference
- TypeScript mapped types documentation

### Tomorrow's Plan
- Day 12: Dice Roller

## Day 12 - February 17
**Project:** Dice Roller
**Time Spent:** 3hrs

### What I Built
- Cryptographically secure dice roller
- Single die and multiple dice rolling
- Roll with modifiers (e.g. 2d6+3)
- Stress test with 100 rolls and frequency chart
- D&D character stat generator (4d6 drop lowest)
- Poker dice with hand detection
- Color coded results (critical hits, fails)
- Statistical analysis (avg, min, max)

### What I Learned
- crypto.randomBytes() for secure random numbers
- Array methods: reduce, sort, filter, map
- Frequency counting with objects
- Statistical calculations
- Poker hand detection logic
- D&D dice rolling rules (4d6 drop lowest)
- Visual bar charts in terminal

### Challenges
- Poker hand detection logic
- D&D 4d6 drop lowest implementation
- Making the frequency bar chart look good(chheck screenshot)
- Color coding based on roll percentage

### Resources Used
- Node.js crypto documentation
- D&D dice rolling rules
- Poker hand rankings

### Tomorrow's Plan
- Day 13: Markdown Parser (marked library)

## Day 13 - February 18, 2026
**Project:** Markdown Parser (marked library)
**Time Spent:**2 hoursa

### What I Built
- Markdown to HTML parser using marked library
- Parse .md files or direct text input
- Sample markdown file generator
- Statistics counter (lines, words, headings, links, code blocks)
- Automatic HTML generation with styled CSS
- File I/O operations

### What I Learned
- Using external npm libraries (marked)
- Markdown syntax elements
- Generating complete HTML documents with CSS
- Multi-line input handling in terminal
- Regex patterns for counting markdown elements
- Template literals for HTML generation

### Challenges
- Multi-line input (solved with "END" marker)
- Embedding CSS in generated HTML

### Resources Used
- marked library documentation
- Markdown syntax guide
- Regex for markdown patterns

### Tomorrow's Plan
- Day 14: Email Validator



**🏆 Biggest Win:**


**😤 Biggest Challenge:**


**🎯 Next Week's Focus (Days 15-21):**

