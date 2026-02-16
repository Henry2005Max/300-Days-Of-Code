// Unit Converter
// Day 11 of 300 Days of Code Challenge

import * as readline from 'readline';
import chalk from 'chalk';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(answer.trim());
    });
  });
}

//  Conversion Types 

type ConversionMap = { [key: string]: { [key: string]: number } };

//  Length Conversions (base: meters) 

const LENGTH: ConversionMap = {
  meter: { meter: 1, kilometer: 0.001, mile: 0.000621371, yard: 1.09361, foot: 3.28084, inch: 39.3701, centimeter: 100, millimeter: 1000 },
  kilometer: { meter: 1000, kilometer: 1, mile: 0.621371, yard: 1093.61, foot: 3280.84, inch: 39370.1, centimeter: 100000, millimeter: 1000000 },
  mile: { meter: 1609.34, kilometer: 1.60934, mile: 1, yard: 1760, foot: 5280, inch: 63360, centimeter: 160934, millimeter: 1609340 },
  foot: { meter: 0.3048, kilometer: 0.0003048, mile: 0.000189394, yard: 0.333333, foot: 1, inch: 12, centimeter: 30.48, millimeter: 304.8 },
  inch: { meter: 0.0254, kilometer: 0.0000254, mile: 0.0000157828, yard: 0.0277778, foot: 0.0833333, inch: 1, centimeter: 2.54, millimeter: 25.4 },
  centimeter: { meter: 0.01, kilometer: 0.00001, mile: 0.00000621371, yard: 0.0109361, foot: 0.0328084, inch: 0.393701, centimeter: 1, millimeter: 10 },
  millimeter: { meter: 0.001, kilometer: 0.000001, mile: 0.000000621371, yard: 0.00109361, foot: 0.00328084, inch: 0.0393701, centimeter: 0.1, millimeter: 1 },
  yard: { meter: 0.9144, kilometer: 0.0009144, mile: 0.000568182, yard: 1, foot: 3, inch: 36, centimeter: 91.44, millimeter: 914.4 }
};

//  Weight Conversions (base: kg) 

const WEIGHT: ConversionMap = {
  kilogram: { kilogram: 1, gram: 1000, pound: 2.20462, ounce: 35.274, ton: 0.001, milligram: 1000000 },
  gram: { kilogram: 0.001, gram: 1, pound: 0.00220462, ounce: 0.035274, ton: 0.000001, milligram: 1000 },
  pound: { kilogram: 0.453592, gram: 453.592, pound: 1, ounce: 16, ton: 0.000453592, milligram: 453592 },
  ounce: { kilogram: 0.0283495, gram: 28.3495, pound: 0.0625, ounce: 1, ton: 0.0000283495, milligram: 28349.5 },
  ton: { kilogram: 1000, gram: 1000000, pound: 2204.62, ounce: 35274, ton: 1, milligram: 1000000000 },
  milligram: { kilogram: 0.000001, gram: 0.001, pound: 0.00000220462, ounce: 0.000035274, ton: 0.000000001, milligram: 1 }
};

//  Temperature Conversions 

function convertTemperature(value: number, from: string, to: string): number {
  // First convert to Celsius
  let celsius: number;
  switch (from) {
    case 'celsius': celsius = value; break;
    case 'fahrenheit': celsius = (value - 32) * 5 / 9; break;
    case 'kelvin': celsius = value - 273.15; break;
    default: throw new Error(`Unknown unit: ${from}`);
  }

  // Then convert to target
  switch (to) {
    case 'celsius': return celsius;
    case 'fahrenheit': return (celsius * 9 / 5) + 32;
    case 'kelvin': return celsius + 273.15;
    default: throw new Error(`Unknown unit: ${to}`);
  }
}

//  Speed Conversions (base: m/s) 

const SPEED: ConversionMap = {
  'meters/second': { 'meters/second': 1, 'kilometers/hour': 3.6, 'miles/hour': 2.23694, 'knots': 1.94384, 'feet/second': 3.28084 },
  'kilometers/hour': { 'meters/second': 0.277778, 'kilometers/hour': 1, 'miles/hour': 0.621371, 'knots': 0.539957, 'feet/second': 0.911344 },
  'miles/hour': { 'meters/second': 0.44704, 'kilometers/hour': 1.60934, 'miles/hour': 1, 'knots': 0.868976, 'feet/second': 1.46667 },
  'knots': { 'meters/second': 0.514444, 'kilometers/hour': 1.852, 'miles/hour': 1.15078, 'knots': 1, 'feet/second': 1.68781 },
  'feet/second': { 'meters/second': 0.3048, 'kilometers/hour': 1.09728, 'miles/hour': 0.681818, 'knots': 0.592484, 'feet/second': 1 }
};

//  Area Conversions (base: sq meters) 

const AREA: ConversionMap = {
  'square meter': { 'square meter': 1, 'square kilometer': 0.000001, 'square mile': 3.861e-7, 'square foot': 10.7639, 'acre': 0.000247105, 'hectare': 0.0001 },
  'square kilometer': { 'square meter': 1000000, 'square kilometer': 1, 'square mile': 0.386102, 'square foot': 10763900, 'acre': 247.105, 'hectare': 100 },
  'square foot': { 'square meter': 0.092903, 'square kilometer': 9.2903e-8, 'square mile': 3.587e-8, 'square foot': 1, 'acre': 0.0000229568, 'hectare': 0.0000092903 },
  'acre': { 'square meter': 4046.86, 'square kilometer': 0.00404686, 'square mile': 0.0015625, 'square foot': 43560, 'acre': 1, 'hectare': 0.404686 },
  'hectare': { 'square meter': 10000, 'square kilometer': 0.01, 'square mile': 0.00386102, 'square foot': 107639, 'acre': 2.47105, 'hectare': 1 },
  'square mile': { 'square meter': 2589988, 'square kilometer': 2.58999, 'square mile': 1, 'square foot': 27878400, 'acre': 640, 'hectare': 258.999 }
};

//  Generic Converter 

function convert(value: number, from: string, to: string, conversionMap: ConversionMap): number {
  const fromUnit = conversionMap[from];
  if (!fromUnit) throw new Error(`Unknown unit: ${from}`);
  const rate = fromUnit[to];
  if (rate === undefined) throw new Error(`Cannot convert to: ${to}`);
  return value * rate;
}

//  Display Functions 

function displayResult(value: number, from: string, result: number, to: string): void {
  console.log(chalk.gray('\n  ' + '─'.repeat(50)));
  console.log(chalk.bold.green('\n  ✅ CONVERSION RESULT\n'));
  console.log(
    chalk.yellow(`  ${value} ${from}`) +
    chalk.white(' = ') +
    chalk.bold.green(`${parseFloat(result.toFixed(6))} ${to}`)
  );
  console.log(chalk.gray('\n  ' + '─'.repeat(50) + '\n'));
}

function showUnits(units: string[], category: string): void {
  console.log(chalk.bold.cyan(`\n  📏 ${category.toUpperCase()} UNITS\n`));
  units.forEach((unit, i) => {
    console.log(chalk.white(`   ${i + 1}. ${unit}`));
  });
  console.log('');
}

//  Quick Reference Tables 

function showLengthReference(): void {
  console.log(chalk.bold.cyan('\n  📏 QUICK LENGTH REFERENCE\n'));
  console.log(chalk.gray('  ' + '─'.repeat(45)));
  const refs = [
    ['1 kilometer', '0.621 miles', '1000 meters'],
    ['1 mile', '1.609 km', '5280 feet'],
    ['1 meter', '3.281 feet', '39.37 inches'],
    ['1 foot', '30.48 cm', '12 inches'],
    ['1 inch', '2.54 cm', '25.4 mm'],
  ];
  refs.forEach(([a, b, c]) => {
    console.log(chalk.white(`  ${a.padEnd(15)}`) + chalk.yellow(`${b.padEnd(15)}`) + chalk.green(c));
  });
  console.log(chalk.gray('  ' + '─'.repeat(45) + '\n'));
}

function showWeightReference(): void {
  console.log(chalk.bold.cyan('\n  ⚖️  QUICK WEIGHT REFERENCE\n'));
  console.log(chalk.gray('  ' + '─'.repeat(45)));
  const refs = [
    ['1 kilogram', '2.205 pounds', '1000 grams'],
    ['1 pound', '0.454 kg', '16 ounces'],
    ['1 ounce', '28.35 grams', '0.0625 lbs'],
    ['1 ton', '1000 kg', '2204.6 lbs'],
  ];
  refs.forEach(([a, b, c]) => {
    console.log(chalk.white(`  ${a.padEnd(15)}`) + chalk.yellow(`${b.padEnd(15)}`) + chalk.green(c));
  });
  console.log(chalk.gray('  ' + '─'.repeat(45) + '\n'));
}

//  Main Application 

async function runUnitConverter() {
  console.clear();
  console.log(chalk.bold.blue('═'.repeat(55)));
  console.log(chalk.bold.blue('           📐 UNIT CONVERTER 📐'));
  console.log(chalk.bold.blue('═'.repeat(55)));
  console.log(chalk.white('\n   Convert between any units easily!\n'));
  console.log(chalk.bold.blue('═'.repeat(55)));

  let continueRunning = true;

  while (continueRunning) {
    console.log(chalk.bold.cyan('\n📋 CATEGORIES\n'));
    console.log(chalk.white('   1. Length (km, miles, feet, inches...)'));
    console.log(chalk.white('   2. Weight (kg, pounds, ounces...)'));
    console.log(chalk.white('   3. Temperature (Celsius, Fahrenheit, Kelvin)'));
    console.log(chalk.white('   4. Speed (km/h, mph, knots...)'));
    console.log(chalk.white('   5. Area (sq meters, acres, hectares...)'));
    console.log(chalk.white('   6. Quick reference tables'));
    console.log(chalk.white('   7. Exit\n'));

    const choice = await askQuestion(chalk.cyan('Choose a category (1-7): '));

    if (choice === '7') {
      console.log(chalk.blue('\n👋 Happy converting! Goodbye!\n'));
      break;
    }

    try {
      switch (choice) {
        case '1': {
          const units = Object.keys(LENGTH);
          showUnits(units, 'Length');

          const from = (await askQuestion(chalk.cyan('  From unit: '))).toLowerCase();
          const to = (await askQuestion(chalk.cyan('  To unit: '))).toLowerCase();
          const valueInput = await askQuestion(chalk.cyan(`  Value in ${from}: `));
          const value = parseFloat(valueInput);

          if (isNaN(value)) {
            console.log(chalk.red('\n  ❌ Invalid number!\n'));
            break;
          }

          const result = convert(value, from, to, LENGTH);
          displayResult(value, from, result, to);
          break;
        }

        case '2': {
          const units = Object.keys(WEIGHT);
          showUnits(units, 'Weight');

          const from = (await askQuestion(chalk.cyan('  From unit: '))).toLowerCase();
          const to = (await askQuestion(chalk.cyan('  To unit: '))).toLowerCase();
          const valueInput = await askQuestion(chalk.cyan(`  Value in ${from}: `));
          const value = parseFloat(valueInput);

          if (isNaN(value)) {
            console.log(chalk.red('\n  ❌ Invalid number!\n'));
            break;
          }

          const result = convert(value, from, to, WEIGHT);
          displayResult(value, from, result, to);
          break;
        }

        case '3': {
          const units = ['celsius', 'fahrenheit', 'kelvin'];
          showUnits(units, 'Temperature');

          const from = (await askQuestion(chalk.cyan('  From unit: '))).toLowerCase();
          const to = (await askQuestion(chalk.cyan('  To unit: '))).toLowerCase();
          const valueInput = await askQuestion(chalk.cyan(`  Value in ${from}: `));
          const value = parseFloat(valueInput);

          if (isNaN(value)) {
            console.log(chalk.red('\n  ❌ Invalid number!\n'));
            break;
          }

          const result = convertTemperature(value, from, to);
          displayResult(value, from, result, to);
          break;
        }

        case '4': {
          const units = Object.keys(SPEED);
          showUnits(units, 'Speed');

          const from = (await askQuestion(chalk.cyan('  From unit: '))).toLowerCase();
          const to = (await askQuestion(chalk.cyan('  To unit: '))).toLowerCase();
          const valueInput = await askQuestion(chalk.cyan(`  Value in ${from}: `));
          const value = parseFloat(valueInput);

          if (isNaN(value)) {
            console.log(chalk.red('\n  ❌ Invalid number!\n'));
            break;
          }

          const result = convert(value, from, to, SPEED);
          displayResult(value, from, result, to);
          break;
        }

        case '5': {
          const units = Object.keys(AREA);
          showUnits(units, 'Area');

          const from = (await askQuestion(chalk.cyan('  From unit: '))).toLowerCase();
          const to = (await askQuestion(chalk.cyan('  To unit: '))).toLowerCase();
          const valueInput = await askQuestion(chalk.cyan(`  Value in ${from}: `));
          const value = parseFloat(valueInput);

          if (isNaN(value)) {
            console.log(chalk.red('\n  ❌ Invalid number!\n'));
            break;
          }

          const result = convert(value, from, to, AREA);
          displayResult(value, from, result, to);
          break;
        }

        case '6': {
          showLengthReference();
          showWeightReference();
          break;
        }

        default:
          console.log(chalk.red('\n  ❌ Invalid option! Please choose 1-7.\n'));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red(`\n  ❌ Error: ${error.message}\n`));
      }
    }

    const again = await askQuestion(chalk.cyan('Convert again? (yes/no): '));
    if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
      console.log(chalk.blue('\n👋 Happy converting! Goodbye!\n'));
      continueRunning = false;
    }
  }

  rl.close();
}

runUnitConverter();



