# Day 2: Secure Password Generator with Crypto Module

## 📝 Description
A command-line password generator that creates cryptographically secure passwords using Node.js's built-in crypto module. Includes customizable options and password strength analysis.

## ✨ Features
- 🔐 Cryptographically secure random generation (uses `crypto.randomBytes`)
- 📏 Customizable password length (8-128 characters)
- 🔤 Option to include/exclude:
  - Uppercase letters (A-Z)
  - Lowercase letters (a-z)
  - Numbers (0-9)
  - Symbols (!@#$%^&*...)
- 💪 Real-time password strength analyzer
- 🎲 Fisher-Yates shuffle algorithm for randomness
- ✅ Ensures at least one character from each selected type
- 💡 Security tips included

## 🛠️ Technologies Used
- TypeScript
- Node.js
- Crypto module (built-in)
- Readline (for user input)

## 🔒 Security Features
- Uses `crypto.randomBytes()` instead of `Math.random()` for true randomness
- Implements cryptographically secure random number generation
- Fisher-Yates shuffle prevents predictable patterns
- Guarantees character type diversity

## 📦 Installation

1. Make sure you have Node.js installed
2. Install dependencies:
   ```bash
   npm install
   ```

## 🚀 How to Run

### Quick Run (with ts-node):
```bash
ts-node password-generator.ts
```

### Build and Run:
```bash
npm run build
npm start
```

### Development Mode:
```bash
npm run dev
```

## 💡 Example Usage

```
Password length (8-128): 16
Include UPPERCASE letters? (yes/no): yes
Include lowercase letters? (yes/no): yes
Include numbers (0-9)? (yes/no): yes
Include symbols (!@#$...)? (yes/no): yes

🎉 YOUR GENERATED PASSWORD:
Xp9#mK2@bN7$qL4!

Length: 16 characters
Strength: 🟢🟢 VERY STRONG (Score: 7/7)
```

## 🎯 Password Strength Scoring

The generator analyzes password strength based on:
- **Length**: Longer = Stronger
  - 8+ characters: +1 point
  - 12+ characters: +2 points
  - 16+ characters: +3 points
- **Character Diversity**:
  - Lowercase letters: +1 point
  - Uppercase letters: +1 point
  - Numbers: +1 point
  - Symbols: +1 point

**Strength Levels:**
- 0-2 points: 🔴 WEAK
- 3-4 points: 🟡 MEDIUM
- 5-6 points: 🟢 STRONG
- 7 points: 🟢🟢 VERY STRONG

## 🎓 What I Learned
- Using Node.js `crypto` module for secure randomness
- Difference between `Math.random()` and `crypto.randomBytes()`
- Implementing Fisher-Yates shuffle algorithm
- Password strength calculation algorithms
- Array manipulation and shuffling in TypeScript
- User input validation
- Building interactive CLI applications

## 🔍 How It Works

1. **User Configuration**: Asks for length and character type preferences
2. **Character Pool**: Builds a pool from selected character types
3. **Guaranteed Diversity**: Ensures at least one character from each type
4. **Secure Generation**: Uses crypto module for true randomness
5. **Shuffling**: Fisher-Yates algorithm prevents predictable patterns
6. **Strength Analysis**: Calculates and displays password strength
7. **Security Tips**: Provides best practices for password management

## 🚀 Future Improvements
- Add password complexity rules (no repeating characters, etc.)
- Save generated passwords to encrypted file
- Add pronounceable password option
- Include password history to avoid duplicates
- Add copy-to-clipboard functionality
- Create multiple passwords at once
- Add entropy calculation
- Integrate with password managers

## 💡 Security Best Practices Implemented
✅ Cryptographically secure random generation  
✅ No predictable patterns  
✅ Character type diversity enforcement  
✅ Strength validation  
✅ User education (security tips)  

## 📅 Challenge Info
**Day:** 2/300  
**Sprint:** 1 - Foundations  
**Date:** [Add your date]  
**Previous Day:** [Day 1 - CLI Calculator](../day-001-calculator)  
**Next Day:** [Day 3 - File Renamer](../day-003-file-renamer)  

---

Part of my 300 Days of Code Challenge! 🚀
