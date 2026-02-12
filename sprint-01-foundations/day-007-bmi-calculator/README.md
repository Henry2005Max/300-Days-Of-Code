# Day 7: BMI Calculator in TypeScript

##  Description
A beautiful command-line BMI (Body Mass Index) calculator built with TypeScript. Supports both metric and imperial units, displays a visual BMI scale, provides healthy weight ranges, and gives personalized health advice!

##  Features
-  **Metric Support** - Calculate with kg and cm
-  **Imperial Support** - Calculate with lbs and feet/inches
-  **Visual BMI Scale** - See where you fall on the scale
-  **Health Categories** - Underweight to Obese Class III
-  **Healthy Weight Range** - Know your ideal weight range
-  **Personalized Advice** - Get health recommendations
-  **Input Validation** - Catches invalid entries
-  **Color Coded** - Green for healthy, red for concerning
-  **Categories Reference** - View all BMI categories

##  Technologies Used
- TypeScript
- Node.js
- Chalk (terminal colors)
- Readline (user input)

##  Installation

1. Make sure you have Node.js installed
2. Install dependencies:
   ```bash
   npm install
   ```

##  How to Run

### Quick Run:
```bash
ts-node bmi-calculator.ts
```

### Build and Run:
```bash
npm run build
npm start
```

##  Example Usage

### Metric Example:
```
Enter your name: Henry
Enter height in cm: 175
Enter weight in kg: 70

 BMI RESULTS FOR HENRY

  BMI Score:    22.9
  Category:     ✅ Normal Weight

   BMI SCALE:
  ───────────────▼────────────────────────
  |-------|---------|---------|---------|
  0      18.5      25        30        40

    HEALTHY WEIGHT RANGE:
  For your height: 56.6 kg - 76.3 kg

   ADVICE:
  Great job! Keep maintaining your healthy lifestyle.
```

### Imperial Example:
```
Enter your name: Henry
Enter feet: 5
Enter inches: 9
Enter weight in pounds: 154

(Same beautiful output!)
```

##  BMI Categories

| Category | BMI Range | Color |
|----------|-----------|-------|
| Underweight | < 18.5 | 🔵 Blue |
| Normal Weight | 18.5 - 24.9 | 🟢 Green |
| Overweight | 25.0 - 29.9 | 🟡 Yellow |
| Obese Class I | 30.0 - 34.9 | 🔴 Red |
| Obese Class II | 35.0 - 39.9 | 🔴 Red |
| Obese Class III | ≥ 40.0 | 🔴 Red |

##  BMI Formula

```
BMI = weight (kg) / height (m)²

Example:
Weight: 70 kg
Height: 1.75 m
BMI = 70 / (1.75 × 1.75) = 22.86
```

##  Unit Conversions

```
Feet/Inches → Meters:
Total inches = (feet × 12) + inches
Meters = total inches × 0.0254

Pounds → Kilograms:
kg = pounds × 0.453592
```

##  What I Learned
- Input validation and error handling
- Unit conversion formulas
- TypeScript interfaces for structured data
- Building visual indicators in terminal
- Color-coded output based on values
- Mathematical calculations in TypeScript
- While loops for input retry
- Organizing code into small functions

##  Important Note

BMI is a general screening tool and has limitations:
- Does not account for muscle mass
- May not be accurate for athletes
- Age and gender can affect interpretation
- Always consult a healthcare professional

##  Future Improvements
- Add age and gender for more accurate results
- Calculate ideal body weight
- Track BMI history over time
- Add waist circumference calculator
- Include body fat percentage estimation
- Generate health report PDF
- Add target weight calculator

##  Challenge Info
**Day:** 7/300  
**Sprint:** 1 - Foundations  
**Date:** THU FEB 12
**Previous Day:** [Day 6 - Quote Fetcher](../day-006-quote-fetcher)  
**Next Day:** [Day 8 - Currency Converter](../day-008-currency-converter)  

---

Part of my 300 Days of Code Challenge! 
