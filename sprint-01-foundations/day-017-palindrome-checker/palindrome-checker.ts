#!/usr/bin/env node

// Palindrome Checker
// Day 17 of 300 Days of Code Challenge

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

//  Types 

interface PalindromeResult {
  original: string;
  cleaned: string;
  isPalindrome: boolean;
  reversed: string;
  length: number;
  wordCount: number;
}

// ─── Core Logic ───────────────────────────────────────────

function cleanString(input: string): string {
  // Remove spaces, punctuation, convert to lowercase
  return input.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function reverseString(input: string): string {
  return input.split('').reverse().join('');
}

function checkPalindrome(input: string): PalindromeResult {
  const cleaned = cleanString(input);
  const reversed = reverseString(cleaned);
  const isPalindrome = cleaned === reversed && cleaned.length > 0;
  const wordCount = input.trim().split(/\s+/).filter(w => w.length > 0).length;

  return {
    original: input,
    cleaned,
    isPalindrome,
    reversed,
    length: cleaned.length,
    wordCount
  };
}

function checkMultiple(inputs: string[]): PalindromeResult[] {
  return inputs.map(checkPalindrome);
}

// ─── Display Functions ────────────────────────────────────

function displayResult(result: PalindromeResult): void {
  console.log(chalk.gray('\n  ' + '─'.repeat(50)));

  if (result.isPalindrome) {
    console.log(chalk.bold.green('\n  YES! It is a palindrome!'));
  } else {
    console.log(chalk.bold.red('\n  No, it is not a palindrome.'));
  }

  console.log(chalk.cyan('\n  Original : ') + chalk.white(`"${result.original}"`));
  console.log(chalk.cyan('  Cleaned  : ') + chalk.white(`"${result.cleaned}"`));
  console.log(chalk.cyan('  Reversed : ') + chalk.white(`"${result.reversed}"`));
  console.log(chalk.cyan('  Length   : ') + chalk.white(`${result.length} characters`));

  if (result.wordCount > 1) {
    console.log(chalk.cyan('  Words    : ') + chalk.white(`${result.wordCount} words`));
  }

  if (!result.isPalindrome && result.cleaned.length > 0) {
    // Show where it breaks
    const half = Math.floor(result.cleaned.length / 2);
    const leftHalf = result.cleaned.slice(0, half);
    const rightHalf = result.cleaned.slice(-half).split('').reverse().join('');

    let firstDiff = -1;
    for (let i = 0; i < half; i++) {
      if (leftHalf[i] !== rightHalf[i]) {
        firstDiff = i;
        break;
      }
    }

    if (firstDiff !== -1) {
      console.log(chalk.yellow(`\n  Breaks at position ${firstDiff + 1}: '${leftHalf[firstDiff]}' vs '${rightHalf[firstDiff]}'`));
    }
  }

  console.log('');
}

function displayMultipleResults(results: PalindromeResult[]): void {
  const palindromes = results.filter(r => r.isPalindrome);
  const notPalindromes = results.filter(r => !r.isPalindrome);

  console.log(chalk.bold.cyan(`\n  Results: ${results.length} checked\n`));
  console.log(chalk.green(`  Palindromes     : ${palindromes.length}`));
  console.log(chalk.red(`  Not Palindromes : ${notPalindromes.length}\n`));

  results.forEach((result, index) => {
    const icon = result.isPalindrome ? chalk.green('YES') : chalk.red('NO ');
    console.log(`  ${icon}  "${result.original}"`);
  });
  console.log('');
}

function showExamples(): void {
  console.log(chalk.bold.cyan('\n  Classic Palindrome Examples:\n'));

  const examples = [
    { text: 'racecar', type: 'Single word' },
    { text: 'level', type: 'Single word' },
    { text: 'madam', type: 'Single word' },
    { text: 'A man a plan a canal Panama', type: 'Phrase' },
    { text: 'Was it a car or a cat I saw', type: 'Phrase' },
    { text: 'Never odd or even', type: 'Phrase' },
    { text: '12321', type: 'Number' },
    { text: 'hello', type: 'Not a palindrome' },
  ];

  examples.forEach(({ text, type }) => {
    const result = checkPalindrome(text);
    const icon = result.isPalindrome ? chalk.green('✓') : chalk.red('✗');
    console.log(`  ${icon}  ${chalk.white(text.padEnd(35))} ${chalk.gray(type)}`);
  });
  console.log('');
}

// ─── Main Application ─────────────────────────────────────

async function runPalindromeChecker(): Promise<void> {
  console.clear();
  console.log(chalk.bold.green('═'.repeat(55)));
  console.log(chalk.bold.green('          PALINDROME CHECKER'));
  console.log(chalk.bold.green('═'.repeat(55)));
  console.log(chalk.white('\n   Check words, phrases, sentences & numbers!\n'));
  console.log(chalk.bold.green('═'.repeat(55)));

  let continueRunning = true;

  while (continueRunning) {
    console.log(chalk.bold.cyan('\n  MENU\n'));
    console.log(chalk.white('   1. Check a single word or phrase'));
    console.log(chalk.white('   2. Check multiple inputs at once'));
    console.log(chalk.white('   3. Check a number'));
    console.log(chalk.white('   4. See examples'));
    console.log(chalk.white('   5. Exit\n'));

    const choice = await askQuestion(chalk.cyan('  Choose an option (1-5): '));

    if (choice === '5') {
      console.log(chalk.green('\n  Was it a car or a cat I saw? Goodbye! 👋\n'));
      break;
    }

    try {
      switch (choice) {

        // ── Option 1: Single Check ───────────────────────
        case '1': {
          const input = await askQuestion(chalk.cyan('\n  Enter a word or phrase: '));
          if (!input) {
            console.log(chalk.red('\n  Please enter something!\n'));
            break;
          }
          const result = checkPalindrome(input);
          displayResult(result);
          break;
        }

        // ── Option 2: Multiple Checks ────────────────────
        case '2': {
          console.log(chalk.cyan('\n  Enter words/phrases one per line.'));
          console.log(chalk.gray('  Type "done" when finished.\n'));

          const inputs: string[] = [];
          while (true) {
            const input = await askQuestion(chalk.cyan(`  Entry ${inputs.length + 1}: `));
            if (input.toLowerCase() === 'done') break;
            if (input) inputs.push(input);
          }

          if (inputs.length === 0) {
            console.log(chalk.red('\n  No entries provided!\n'));
            break;
          }

          const results = checkMultiple(inputs);
          displayMultipleResults(results);
          break;
        }

        // ── Option 3: Number Check ───────────────────────
        case '3': {
          const input = await askQuestion(chalk.cyan('\n  Enter a number: '));
          if (!input || isNaN(Number(input))) {
            console.log(chalk.red('\n  Please enter a valid number!\n'));
            break;
          }
          const result = checkPalindrome(input);
          displayResult(result);
          break;
        }

        // ── Option 4: Examples ───────────────────────────
        case '4': {
          showExamples();
          break;
        }

        default:
          console.log(chalk.red('\n  Invalid option! Please choose 1-5.\n'));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red(`\n  Error: ${error.message}\n`));
      }
    }

    const again = await askQuestion(chalk.cyan('  Check another? (yes/no): '));
    if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
      console.log(chalk.green('\n  Level up! See you tomorrow! 👋\n'));
      continueRunning = false;
    }
  }

  rl.close();
}

runPalindromeChecker();
