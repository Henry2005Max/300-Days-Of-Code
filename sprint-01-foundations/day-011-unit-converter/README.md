# Day 11: Unit Converter

##  Description
A comprehensive unit converter supporting 5 categories - Length, Weight, Temperature, Speed and Area. Built with TypeScript and features quick reference tables for common conversions!

##  Features
-  **Length** - meter, kilometer, mile, yard, foot, inch, cm, mm
-  **Weight** - kilogram, gram, pound, ounce, ton, milligram
-  **Temperature** - Celsius, Fahrenheit, Kelvin
-  **Speed** - meters/second, km/h, mph, knots, feet/second
-  **Area** - square meter, km, mile, foot, acre, hectare
-  **Quick Reference Tables** - Common conversions at a glance
-  **Input Validation** - Catches invalid units and numbers
-  **Color Coded Output** - Beautiful terminal display

## 🛠️ Technologies Used
- TypeScript
- Node.js
- Chalk (terminal colors)
- Readline (user input)

##  Installation

```bash
npm install
```

##  How to Run

```bash
npx ts-node unit-converter.ts
```

##  Example Usage

### Length:
```
From unit: kilometer
To unit: mile
Value: 10

10 kilometer = 6.21371 mile
```

### Temperature:
```
From unit: celsius
To unit: fahrenheit
Value: 100

100 celsius = 212 fahrenheit
```

### Weight:
```
From unit: kilogram
To unit: pound
Value: 70

70 kilogram = 154.324 pound
```

##  What I Learned
- TypeScript mapped types (ConversionMap)
- Organizing large data structures
- Temperature conversion formulas (special case)
- Generic conversion functions
- Input validation strategies
- Building reference tables

## Challenge Info
**Day:** 11/300  
**Sprint:** 1 - Foundations  
**Date:** Mon FEB 16
**Previous Day:** [Day 10 - Jest Tests](../day-010-jest-tests)  
**Next Day:** [Day 12 - Dice Roller](../day-012-dice-roller)  

---

Part of my 300 Days of Code Challenge! 🚀
