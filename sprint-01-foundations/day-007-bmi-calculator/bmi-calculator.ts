

// BMI Calculator in TypeScript
// Day 7 of 300 Days of Code Challenge

import * as readline from 'readline';
import chalk from 'chalk';

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask questions
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// BMI Categories interface
interface BMIResult {
  bmi: number;
  category: string;
  emoji: string;
  color: Function;
  advice: string;
  healthyWeightRange: { min: number; max: number };
}

// Calculate BMI
function calculateBMI(weightKg: number, heightM: number): number {
  return weightKg / (heightM * heightM);
}

// Get BMI category and details
function getBMIResult(bmi: number, heightM: number): BMIResult {
  const minHealthyWeight = 18.5 * heightM * heightM;
  const maxHealthyWeight = 24.9 * heightM * heightM;

  if (bmi < 18.5) {
    return {
      bmi,
      category: 'Underweight',
      emoji: '⚠️',
      color: chalk.blue,
      advice: 'Consider eating more nutritious foods and consulting a doctor.',
      healthyWeightRange: { min: minHealthyWeight, max: maxHealthyWeight }
    };
  } else if (bmi < 25) {
    return {
      bmi,
      category: 'Normal Weight',
      emoji: '✅',
      color: chalk.green,
      advice: 'Great job! Keep maintaining your healthy lifestyle.',
      healthyWeightRange: { min: minHealthyWeight, max: maxHealthyWeight }
    };
  } else if (bmi < 30) {
    return {
      bmi,
      category: 'Overweight',
      emoji: '⚠️',
      color: chalk.yellow,
      advice: 'Consider a balanced diet and regular exercise.',
      healthyWeightRange: { min: minHealthyWeight, max: maxHealthyWeight }
    };
  } else if (bmi < 35) {
    return {
      bmi,
      category: 'Obese (Class I)',
      emoji: '🔴',
      color: chalk.red,
      advice: 'Please consult a healthcare professional for guidance.',
      healthyWeightRange: { min: minHealthyWeight, max: maxHealthyWeight }
    };
  } else if (bmi < 40) {
    return {
      bmi,
      category: 'Obese (Class II)',
      emoji: '🔴',
      color: chalk.red,
      advice: 'Please consult a healthcare professional immediately.',
      healthyWeightRange: { min: minHealthyWeight, max: maxHealthyWeight }
    };
  } else {
    return {
      bmi,
      category: 'Obese (Class III)',
      emoji: '🔴',
      color: chalk.red,
      advice: 'Please seek medical attention as soon as possible.',
      healthyWeightRange: { min: minHealthyWeight, max: maxHealthyWeight }
    };
  }
}

// Convert height from feet/inches to meters
function feetToMeters(feet: number, inches: number): number {
  const totalInches = feet * 12 + inches;
  return totalInches * 0.0254;
}

// Convert weight from pounds to kg
function poundsToKg(pounds: number): number {
  return pounds * 0.453592;
}

// Display BMI result beautifully
function displayResult(result: BMIResult, name: string): void {
  console.log(chalk.gray('\n' + '═'.repeat(55)));
  console.log(chalk.bold.cyan(`\n📊 BMI RESULTS FOR ${name.toUpperCase()}\n`));

  // BMI Score
  console.log(chalk.white('  BMI Score:    ') + result.color(chalk.bold(result.bmi.toFixed(1))));
  console.log(chalk.white('  Category:     ') + result.color(chalk.bold(`${result.emoji} ${result.category}`)));

  // Visual BMI scale
  console.log(chalk.bold('\n  📏 BMI SCALE:\n'));
  const scale = buildBMIScale(result.bmi);
  console.log('  ' + scale);
  console.log(chalk.gray('  |-------|---------|---------|---------|'));
  console.log(chalk.gray('  0     18.5      25       30       40'));
  console.log(chalk.blue('  Under') + chalk.gray(' | ') + chalk.green('Normal') + chalk.gray(' | ') + chalk.yellow('Over') + chalk.gray(' | ') + chalk.red('Obese'));

  // Healthy weight range
  console.log(chalk.bold('\n  ⚖️  HEALTHY WEIGHT RANGE:\n'));
  console.log(chalk.white(`  For your height: `) + chalk.green(`${result.healthyWeightRange.min.toFixed(1)} kg - ${result.healthyWeightRange.max.toFixed(1)} kg`));

  // Advice
  console.log(chalk.bold('\n  💡 ADVICE:\n'));
  console.log(chalk.white(`  ${result.advice}`));

  console.log(chalk.gray('\n' + '═'.repeat(55)));
  console.log(chalk.gray('\n  ⚠️  Note: BMI is a general guideline only.'));
  console.log(chalk.gray('  Always consult a healthcare professional.\n'));
}

// Build a simple visual BMI scale
function buildBMIScale(bmi: number): string {
  const maxBMI = 40;
  const scaleLength = 40;
  const position = Math.min(Math.round((bmi / maxBMI) * scaleLength), scaleLength);

  let scale = '';
  for (let i = 0; i < scaleLength; i++) {
    if (i === position) {
      scale += chalk.bold.white('▼');
    } else if (i < 7) {
      scale += chalk.blue('─');
    } else if (i < 10) {
      scale += chalk.green('─');
    } else if (i < 12) {
      scale += chalk.yellow('─');
    } else {
      scale += chalk.red('─');
    }
  }

  return scale;
}

// Display BMI categories reference
function displayCategories(): void {
  console.log(chalk.bold.cyan('\n  📋 BMI CATEGORIES REFERENCE\n'));
  console.log(chalk.blue('  Underweight:      BMI < 18.5'));
  console.log(chalk.green('  Normal Weight:    BMI 18.5 - 24.9'));
  console.log(chalk.yellow('  Overweight:       BMI 25.0 - 29.9'));
  console.log(chalk.red('  Obese Class I:    BMI 30.0 - 34.9'));
  console.log(chalk.red('  Obese Class II:   BMI 35.0 - 39.9'));
  console.log(chalk.red('  Obese Class III:  BMI ≥ 40.0'));
}

// Get height in metric
async function getHeightMetric(): Promise<number> {
  while (true) {
    const input = await askQuestion(chalk.cyan('  Enter height in cm (e.g., 175): '));
    const cm = parseFloat(input);

    if (isNaN(cm) || cm < 50 || cm > 300) {
      console.log(chalk.red('  ❌ Please enter a valid height (50-300 cm)'));
      continue;
    }

    return cm / 100; // Convert to meters
  }
}

// Get height in imperial
async function getHeightImperial(): Promise<number> {
  while (true) {
    const feetInput = await askQuestion(chalk.cyan('  Enter feet (e.g., 5): '));
    const inchesInput = await askQuestion(chalk.cyan('  Enter inches (e.g., 10): '));

    const feet = parseFloat(feetInput);
    const inches = parseFloat(inchesInput);

    if (isNaN(feet) || isNaN(inches) || feet < 1 || feet > 9 || inches < 0 || inches > 11) {
      console.log(chalk.red('  ❌ Please enter valid height (feet: 1-9, inches: 0-11)'));
      continue;
    }

    return feetToMeters(feet, inches);
  }
}

// Get weight in metric
async function getWeightMetric(): Promise<number> {
  while (true) {
    const input = await askQuestion(chalk.cyan('  Enter weight in kg (e.g., 70): '));
    const kg = parseFloat(input);

    if (isNaN(kg) || kg < 10 || kg > 500) {
      console.log(chalk.red('  ❌ Please enter a valid weight (10-500 kg)'));
      continue;
    }

    return kg;
  }
}

// Get weight in imperial
async function getWeightImperial(): Promise<number> {
  while (true) {
    const input = await askQuestion(chalk.cyan('  Enter weight in pounds (e.g., 154): '));
    const lbs = parseFloat(input);

    if (isNaN(lbs) || lbs < 22 || lbs > 1100) {
      console.log(chalk.red('  ❌ Please enter a valid weight (22-1100 lbs)'));
      continue;
    }

    return poundsToKg(lbs);
  }
}

// Main application
async function runBMICalculator() {
  console.clear();
  console.log(chalk.bold.green('═'.repeat(55)));
  console.log(chalk.bold.green('          ⚖️  BMI CALCULATOR ⚖️'));
  console.log(chalk.bold.green('═'.repeat(55)));
  console.log(chalk.white('\n   Calculate your Body Mass Index easily!\n'));
  console.log(chalk.bold.green('═'.repeat(55)));

  let continueRunning = true;

  while (continueRunning) {
    try {
      console.log(chalk.bold.cyan('\n📋 MAIN MENU\n'));
      console.log(chalk.white('   1. Calculate BMI (Metric - kg/cm)'));
      console.log(chalk.white('   2. Calculate BMI (Imperial - lbs/ft)'));
      console.log(chalk.white('   3. View BMI categories'));
      console.log(chalk.white('   4. Exit\n'));

      const choice = await askQuestion(chalk.cyan('Choose an option (1-4): '));

      if (choice === '4') {
        console.log(chalk.green('\n👋 Stay healthy! Goodbye!\n'));
        continueRunning = false;
        break;
      }

      switch (choice) {
        case '1': {
          // Metric calculation
          console.log(chalk.bold.cyan('\n📏 METRIC CALCULATION (kg/cm)\n'));

          const name = await askQuestion(chalk.cyan('  Enter your name: '));
          const heightM = await getHeightMetric();
          const weightKg = await getWeightMetric();

          const bmi = calculateBMI(weightKg, heightM);
          const result = getBMIResult(bmi, heightM);

          displayResult(result, name);
          break;
        }

        case '2': {
          // Imperial calculation
          console.log(chalk.bold.cyan('\n📏 IMPERIAL CALCULATION (lbs/ft)\n'));

          const name = await askQuestion(chalk.cyan('  Enter your name: '));
          const heightM = await getHeightImperial();
          const weightKg = await getWeightImperial();

          const bmi = calculateBMI(weightKg, heightM);
          const result = getBMIResult(bmi, heightM);

          displayResult(result, name);
          break;
        }

        case '3': {
          // Show categories
          displayCategories();
          break;
        }

        default:
          console.log(chalk.red('\n❌ Invalid option! Please choose 1-4.'));
      }

      // Ask to continue
      const again = await askQuestion(chalk.cyan('\nCalculate again? (yes/no): '));
      if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
        console.log(chalk.green('\n👋 Stay healthy! Goodbye!\n'));
        continueRunning = false;
      }

    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
      }
    }
  }

  rl.close();
}

// Run the application
runBMICalculator();
