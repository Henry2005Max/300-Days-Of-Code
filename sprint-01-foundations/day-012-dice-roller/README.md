# Day 12: Dice Roller

##  Description
A feature-rich dice roller with cryptographically secure randomness! Roll standard tabletop dice, play poker dice, generate D&D character stats, and run stress tests with frequency analysis.

##  Features
-  🎲**Single Die** - Roll any standard die (d4, d6, d8, d10, d12, d20, d100)
- 🎲🎲 **Multiple Dice** - Roll up to 20 dice at once
-  **Modifiers** - Roll with bonus/penalty (e.g. 2d6+3)
-  **Stress Test** - Roll 100 times and see frequency analysis
-  **D&D Mode** - Generate character stats (4d6 drop lowest)
-  **Poker Dice** - 5d6 with poker hand detection
-  **Crypto Secure** - Uses crypto.randomBytes() not Math.random()
-  **Color Coded** - Critical hits in gold, critical fails in red

##  Technologies Used
- TypeScript
- Node.js
- crypto module (secure randomness)
- Chalk (terminal colors)

##  Installation

```bash
npm install
```

##  How to Run

```bash
npx ts-node dice-roller.ts
```

## Example Output

### Rolling 3d6:
```
 ROLLING 3d6

  Die 1: ⚄  5
  Die 2: ⚂  3
  Die 3: ⚅  6  CRITICAL!

  ──────────────────────────────
  Total:     14
  Average:   4.7
  Min Roll:  3
  Max Roll:  6
```

### D&D Character Stats:
```
⚔️  DUNGEON & DRAGONS MODE

  Strength
  Rolled: [3, 5, 6, 4] → dropped 3 → kept [4, 5, 6]
  Score: 15

  Dexterity
  Rolled: [2, 4, 4, 6] → dropped 2 → kept [4, 4, 6]
  Score: 14
```

### Poker Dice:
```
 POKER DICE
  Your dice: ⚄ ⚄ ⚁ ⚄ ⚂
  Result:  THREE OF A KIND!
```

### Stress Test (100 rolls):
```
ROLL STATISTICS
  Total Rolls: 100
  Average:     3.52
  Min:         1
  Max:         6

FREQUENCY
    1: ████████████████ (16x, 16.0%)
    2: ██████████████████ (18x, 18.0%)
    3: ██████████████ (14x, 14.0%)
    4: ████████████████████ (20x, 20.0%)
    5: ██████████████████ (18x, 18.0%)
    6: ██████████████ (14x, 14.0%)
```

##  Color Coding

- 🟡 **Yellow/Bold** - Critical hit (maximum roll)
- 🔴 **Red/Bold** - Critical fail (rolled a 1)
- 🟢 **Green** - High roll (top 25%)
- 🔴 **Red** - Low roll (bottom 25%)
- ⚪ **White** - Average roll

## 🎓 What I Learned
- Using crypto.randomBytes() for secure random numbers
- Array methods (reduce, sort, filter, map)
- Object frequency counting
- Statistical analysis (avg, min, max)
- Sorting and grouping data
- Fun game logic (poker hands, D&D rules)
- Visual progress bars with characters
- setTimeout for dramatic effect

## 📅 Challenge Info
**Day:** 12/300  
**Sprint:** 1 - Foundations  
**Date:** Feb 17 2026
**Previous Day:** [Day 11 - Unit Converter](../day-011-unit-converter)  
**Next Day:** [Day 13 - Markdown Parser](../day-013-markdown-parser)  

---

Part of my 300 Days of Code Challenge! 🚀
