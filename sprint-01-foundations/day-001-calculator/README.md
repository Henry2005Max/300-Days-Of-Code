
# Day 1: TypeScript CLI Calculator with BigInt Support

##  Description
A command-line calculator built with TypeScript that supports very large numbers using JavaScript's BigInt type.

##  Features
- ➕ Addition
- ➖ Subtraction
- ✖️ Multiplication
- ➗ Division
- 📐 Modulo
- 🔢 Power (exponentiation)
- 🚀 Supports extremely large numbers (BigInt)
- ✅ Error handling for division by zero
- 🔄 Continuous calculation mode

##  Technologies Used
- TypeScript
- Node.js
- Readline (for user input)

##  Installation

1. Make sure you have Node.js installed
2. Clone this repository or download the files
3. Install dependencies:
   ```bash
   npm install
   ```

##  How to Run

### Method 1: Compile and Run
```bash
npx tsc calculator.ts
node calculator.js
```

### Method 2: Run with ts-node (easier)
```bash
npm install -g ts-node
ts-node calculator.ts
```

##  Example Usage

```
Enter first number: 999999999999999999
Enter operation (+, -, *, /, %, **): *
Enter second number: 888888888888888888

 Result: 888888888888888887111111111111111112
```

##  What I Learned
- How to use TypeScript for CLI applications
- Working with BigInt for large number calculations
- Using readline for interactive command-line input
- Async/await with Promises
- Error handling in TypeScript
- Switch statements for multiple operations

##  Future Improvements
- Add more operations (square root, factorial, etc.)
- Add calculation history
- Support decimal numbers
- Add color to the output
- Save calculations to a file

##  Challenge Info
**Day:** 1/300  
**Sprint:** 1 - Foundations  
**Date:** Feb 6, 2026

---

Part of my 300 Days of Code Challenge! 
