# Week 1 - Days 1-7

Day 1 - February 6, 2026
**Project:** TypeScript CLI Calculator with BigInt  
**Time Spent:** 45Mins

### What I Built
- A command-line calculator that works with very large numbers
- Supports addition, subtraction, multiplication, division, modulo, and power operations
- Has error handling for division by zero

### What I Learned
- How to set up a TypeScript project from scratch
- Using BigInt for handling very large numbers
- Working with readline for user input in Node.js
- Async/await patterns in TypeScript

### Challenges
- None

### Resources Used
- TypeScript documentation
- Node.js readline docs

### Tomorrow's Plan
- Day 2: Password Generator with crypto module

---

## Day 2 - February 7, 2026
**Project:** Secure Password Generator with Crypto Module  
**Time Spent:** 2 hours

### What I Built
- Cryptographically secure password generator
- Customizable length and character types
- Password strength analyzer
- Fisher-Yates shuffle for randomness

### What I Learned
- Crypto module vs Math.random()
- Fisher-Yates shuffle algorithm
- Password strength calculation
- Character set management

### Challenges
- Understanding cryptographic randomness
- Implementing the shuffle algorithm

### Resources Used
- Node.js crypto documentation
- Fisher-Yates algorithm explanation

### Tomorrow's Plan
- Day 3: File Renamer using fs/promises


---

## Day 3 - February 8, 2026
**Project:** File Renamer using fs/promises  
**Time Spent:** 3 hours

### What I Built
- Command-line file renaming utility
- 5 different rename operations (single, batch, spaces, extensions, lowercase)
- Test file creator for safe testing
- Interactive menu system with safety confirmations

### What I Learned
- Using fs/promises for async file operations
- Path module for cross-platform file paths
- Reading and filtering directories
- Safety checks before file operations
- Building practical CLI tools that actually work on real files

### Challenges
- Understanding async file operations
- Making sure not to overwrite existing files
- Testing safely without messing up real files
- Implementing batch rename logic with sequential numbers

### Resources Used
- Node.js fs/promises documentation
- Path module docs
- TypeScript async/await patterns

### Tomorrow's Plan
- Day 4: Weather API Fetcher (fetch data from internet!)

## Day 4 - February 9, 2026
**Project:** Weather API Fetcher with Axios  
**Time Spent:** 2 hours

### What I Built
- Real-time weather application using OpenWeatherMap API
- Weather search by city name or GPS coordinates
- City comparison feature
- Popular cities quick view
- Support for Celsius, Fahrenheit, and Kelvin
- Detailed weather info with emojis

### What I Learned
- Making HTTP requests with Axios
- Working with REST APIs
- Getting and using API keys
- Handling JSON responses
- Error handling for network requests (404, 401, etc.)
- TypeScript interfaces for API data
- Async/await for API calls
- Temperature conversion formulas
- Promise.all for concurrent requests

### Challenges
- Understanding API authentication with keys
- Parsing complex JSON responses
- Handling different error types (city not found, invalid key, network errors)
- Waiting for API key activation
- Formatting weather data nicely

### Resources Used
- OpenWeatherMap API documentation
- Axios documentation
- TypeScript interfaces guide
- HTTP status codes reference

### Tomorrow's Plan
- Day 5: Todo List CLI with Commander library

---

## Day 5 - February 10, 2026
**Project:** Todo List CLI with Commander  
**Time Spent:** 3 hours

### What I Built
- Professional CLI todo list manager
- Add, complete, delete, and update tasks
- Color-coded priorities (high/medium/low)
- Beautiful terminal output with Chalk
- Statistics and progress tracking
- Filter by status (completed/pending)
- Data persistence with JSON file storage

### What I Learned
- Using Commander.js framework for CLI apps
- Command arguments, options, and flags
- Terminal colors and styling with Chalk
- Building professional command-line interfaces
- CRUD operations (Create, Read, Update, Delete)
- File-based data persistence
- Progress bars and visual feedback
- CLI best practices and UX
- Command aliases and shortcuts

### Challenges
- Understanding Commander's command structure
- Managing todo IDs correctly
- Implementing color-coded priorities
- Creating visual progress bars
- Ensuring data persists correctly
- Handling edge cases (invalid IDs, empty lists)

### Resources Used
- Commander.js documentation
- Chalk documentation
- CLI design best practices
- TypeScript interfaces for data structures

### Tomorrow's Plan
- Day 6: Random Quote Fetcher (API calls)

---

## Day 6 - February 11, 2026
**Project:** Random Quote Fetcher (API Call)  
**Time Spent:** 2.5 hours

### What I Built
- Quote fetcher using Quotable API (free, no key needed)
- Random quotes from thousands of sources
- Search by category (wisdom, success, inspiration, etc.)
- Search by author (Einstein, Jobs, Churchill, etc.)
- Quote of the day feature
- Motivational quotes
- Save favorite quotes to JSON file
- Beautiful colored terminal output

### What I Learned
- Using free public APIs without authentication
- Multiple API endpoints with query parameters
- Different ways to use same API (random, by tag, by author, seeded)
- Managing favorites with JSON storage
- Preventing duplicate entries
- Beautiful CLI formatting with Chalk
- Interactive menu systems
- Error handling for API calls

### Challenges
- Understanding API query parameters
- Implementing favorites system
- Preventing duplicate saves
- Formatting quotes beautifully in terminal
- Managing user interaction flow

### Resources Used
- Quotable API documentation (api.quotable.io)
- Axios documentation
- Chalk documentation for colors
- TypeScript interfaces

### Tomorrow's Plan
- Day 7: BMI Calculator in TypeScript
- 

---

## Day 7 - February 12, 2026
**Project:** BMI Calculator in TypeScript  
**Time Spent:** 3 hours

### What I Built
- BMI calculator supporting both metric and imperial units
- Visual BMI scale showing where you fall
- Color-coded health categories
- Healthy weight range calculator
- Personalized health advice
- Input validation that rejects bad values

### What I Learned
- Input validation with while loops
- Unit conversion formulas (feet to meters, lbs to kg)
- TypeScript interfaces for structured data
- Building visual scales in terminal
- Color-coded output based on calculated values
- Fixed tsconfig.json issues for ALL projects

### Challenges
- tsconfig.json errors (fixed for all projects now!)
- Understanding verbatimModuleSyntax setting
- Getting colors to work correctly based on BMI value

### Resources Used
- TypeScript tsconfig documentation
- BMI formula reference
- Chalk documentation
- Node.js readline docs

### Tomorrow's Plan
- Day 8: Currency Converter (NGN focus, API)



## Week 1 Summary
**Total Projects:** 7  
**Total Hours:** 16 hours  
**Biggest Win:** Fixed the tsconfig.json issue and went back to make ALL 7 projects work correctly. Shows real problem-solving skill, not just building forward but going back to fix what's broken!

**Biggest Challenge:** The tsconfig.json and ts-node permission errors. Took time to understand TypeScript configuration, module systems, and Mac permissions, but now it's solved for ALL future days!

**Next Week's Focus (Days 8-14):** Continue Sprint 1 CLI projects - Currency Converter, Encryption, Tests with Jest, Unit Converter, Dice Roller, and Markdown Parser. Focus on getting projects running smoothly from Day 1 using the correct tsconfig.json every time
