#!/usr/bin/env node

// FizzBuzz with TypeScript Generics
// Day 18 of 300 Days of Code Challenge

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

// ─── Types ────────────────────────────────────────────────

interface FizzBuzzRule<T> {
  divisor: number;
  label: T;
}

interface FizzBuzzResult<T> {
  number: number;
  output: T | number;
  matched: boolean;
}

// ─── Core Generic Logic ───────────────────────────────────

// Generic FizzBuzz — works with ANY label type (string, number, object, etc.)
function fizzBuzz<T>(
  n: number,
  rules: FizzBuzzRule<T>[]
): FizzBuzzResult<T>[] {
  const results: FizzBuzzResult<T>[] = [];

  for (let i = 1; i <= n; i++) {
    const matchedLabels: T[] = [];

    for (const rule of rules) {
      if (i % rule.divisor === 0) {
        matchedLabels.push(rule.label);
      }
    }

    if (matchedLabels.length > 0) {
      // Join matched labels if they are strings, else return array
      const output =
        typeof matchedLabels[0] === 'string'
          ? (matchedLabels.join('') as unknown as T)
          : matchedLabels[0];

      results.push({ number: i, output, matched: true });
    } else {
      results.push({ number: i, output: i, matched: false });
    }
  }

  return results;
}

// ─── Preset Rule Sets ─────────────────────────────────────

const classicRules: FizzBuzzRule<string>[] = [
  { divisor: 3, label: 'Fizz' },
  { divisor: 5, label: 'Buzz' },
];

const extendedRules: FizzBuzzRule<string>[] = [
  { divisor: 3, label: 'Fizz' },
  { divisor: 5, label: 'Buzz' },
  { divisor: 7, label: 'Bazz' },
];

const nigeriaRules: FizzBuzzRule<string>[] = [
  { divisor: 3, label: 'Naija' },
  { divisor: 5, label: 'Lagos' },
  { divisor: 7, label: 'Abuja' },
];

const emojiRules: FizzBuzzRule<string>[] = [
  { divisor: 3, label: '🔥' },
  { divisor: 5, label: '💧' },
  { divisor: 7, label: '⚡' },
];

// ─── Display Functions ────────────────────────────────────

function displayResults<T>(results: FizzBuzzResult<T>[], limit?: number): void {
  const toShow = limit ? results.slice(0, limit) : results;

  console.log('');
  toShow.forEach((result) => {
    if (result.matched) {
      console.log(
        chalk.gray(`  ${String(result.number).padStart(4)} → `) +
        chalk.bold.yellow(String(result.output))
      );
    } else {
      console.log(
        chalk.gray(`  ${String(result.number).padStart(4)} → `) +
        chalk.white(String(result.output))
      );
    }
  });

  const matchCount = results.filter(r => r.matched).length;
  console.log(chalk.gray(`\n  Total: ${results.length} numbers | ${matchCount} matched | ${results.length - matchCount} plain numbers\n`));
}

function displayCustomResult(results: FizzBuzzResult<string>[]): void {
  console.log('');
  results.forEach((result) => {
    if (result.matched) {
      console.log(
        chalk.gray(`  ${String(result.number).padStart(4)} → `) +
        chalk.bold.cyan(String(result.output))
      );
    } else {
      console.log(
        chalk.gray(`  ${String(result.number).padStart(4)} → `) +
        chalk.white(String(result.output))
      );
    }
  });

  const matchCount = results.filter(r => r.matched).length;
  console.log(chalk.gray(`\n  Total: ${results.length} numbers | ${matchCount} matched\n`));
}

// ─── Main Application ─────────────────────────────────────

async function runFizzBuzz(): Promise<void> {
  console.clear();
  console.log(chalk.bold.magenta('═'.repeat(55)));
  console.log(chalk.bold.magenta('       FIZZBUZZ WITH TYPESCRIPT GENERICS'));
  console.log(chalk.bold.magenta('═'.repeat(55)));
  console.log(chalk.white('\n   Not just FizzBuzz — generic, customizable!\n'));
  console.log(chalk.bold.magenta('═'.repeat(55)));

  let continueRunning = true;

  while (continueRunning) {
    console.log(chalk.bold.cyan('\n  MENU\n'));
    console.log(chalk.white('   1. Classic FizzBuzz (1-100)'));
    console.log(chalk.white('   2. Extended FizzBuzzBazz (divisible by 3, 5, 7)'));
    console.log(chalk.white('   3. Nigeria Edition (Naija, Lagos, Abuja)'));
    console.log(chalk.white('   4. Emoji Edition'));
    console.log(chalk.white('   5. Custom — your own rules'));
    console.log(chalk.white('   6. Exit\n'));

    const choice = await askQuestion(chalk.cyan('  Choose an option (1-6): '));

    if (choice === '6') {
      console.log(chalk.magenta('\n  FizzBuzz complete! Keep coding! 👋\n'));
      break;
    }

    try {
      switch (choice) {

        // ── Option 1: Classic ────────────────────────────
        case '1': {
          const limitInput = await askQuestion(chalk.cyan('\n  How far? (default: 100): '));
          const limit = parseInt(limitInput) || 100;

          console.log(chalk.cyan(`\n  Classic FizzBuzz — 1 to ${limit}:`));
          const results = fizzBuzz<string>(limit, classicRules);
          displayResults(results);
          break;
        }

        // ── Option 2: Extended ───────────────────────────
        case '2': {
          const limitInput = await askQuestion(chalk.cyan('\n  How far? (default: 100): '));
          const limit = parseInt(limitInput) || 100;

          console.log(chalk.cyan(`\n  FizzBuzzBazz — 1 to ${limit}:`));
          console.log(chalk.gray('  (Fizz=3, Buzz=5, Bazz=7)\n'));
          const results = fizzBuzz<string>(limit, extendedRules);
          displayResults(results);
          break;
        }

        // ── Option 3: Nigeria Edition ────────────────────
        case '3': {
          const limitInput = await askQuestion(chalk.cyan('\n  How far? (default: 100): '));
          const limit = parseInt(limitInput) || 100;

          console.log(chalk.cyan(`\n  Nigeria Edition — 1 to ${limit}:`));
          console.log(chalk.gray('  (Naija=3, Lagos=5, Abuja=7)\n'));
          const results = fizzBuzz<string>(limit, nigeriaRules);
          displayResults(results);
          break;
        }

        // ── Option 4: Emoji Edition ──────────────────────
        case '4': {
          const limitInput = await askQuestion(chalk.cyan('\n  How far? (default: 50): '));
          const limit = parseInt(limitInput) || 50;

          console.log(chalk.cyan(`\n  Emoji Edition — 1 to ${limit}:`));
          console.log(chalk.gray('  (🔥=3, 💧=5, ⚡=7)\n'));
          const results = fizzBuzz<string>(limit, emojiRules);
          displayResults(results);
          break;
        }

        // ── Option 5: Custom Rules ───────────────────────
        case '5': {
          console.log(chalk.cyan('\n  Build your own FizzBuzz rules!\n'));

          const limitInput = await askQuestion(chalk.cyan('  How far? (default: 50): '));
          const limit = parseInt(limitInput) || 50;

          const rulesCountInput = await askQuestion(chalk.cyan('  How many rules? (1-5): '));
          const rulesCount = Math.min(Math.max(parseInt(rulesCountInput) || 1, 1), 5);

          const customRules: FizzBuzzRule<string>[] = [];

          for (let i = 0; i < rulesCount; i++) {
            console.log(chalk.gray(`\n  Rule ${i + 1}:`));
            const divisorInput = await askQuestion(chalk.cyan('    Divisor: '));
            const label = await askQuestion(chalk.cyan('    Label (word to show): '));

            const divisor = parseInt(divisorInput);
            if (isNaN(divisor) || divisor < 1) {
              console.log(chalk.red('    Invalid divisor, skipping...\n'));
              continue;
            }

            customRules.push({ divisor, label: label || `Rule${i + 1}` });
          }

          if (customRules.length === 0) {
            console.log(chalk.red('\n  No valid rules provided!\n'));
            break;
          }

          console.log(chalk.cyan(`\n  Your Custom FizzBuzz — 1 to ${limit}:`));
          customRules.forEach(r => {
            console.log(chalk.gray(`  Divisible by ${r.divisor} → "${r.label}"`));
          });

          const results = fizzBuzz<string>(limit, customRules);
          displayCustomResult(results);
          break;
        }

        default:
          console.log(chalk.red('\n  Invalid option! Please choose 1-6.\n'));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red(`\n  Error: ${error.message}\n`));
      }
    }

    const again = await askQuestion(chalk.cyan('  Try another? (yes/no): '));
    if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
      console.log(chalk.magenta('\n  FizzBuzz complete! Keep coding! 👋\n'));
      continueRunning = false;
    }
  }

  rl.close();
}

runFizzBuzz();
