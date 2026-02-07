#!/usr/bin/env node

// Password Generator with Crypto Module
// Day 2 of 300 Days of Code Challenge

import * as crypto from 'crypto';
import * as readline from 'readline';

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Character sets for password generation
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Function to ask questions
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to generate a secure random number
function getRandomInt(max: number): number {
  const randomBuffer = crypto.randomBytes(4);
  const randomNumber = randomBuffer.readUInt32BE(0);
  return randomNumber % max;
}

// Function to shuffle array (Fisher-Yates algorithm)
function shuffleArray(array: string[]): string[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Main password generation function
function generatePassword(
  length: number,
  includeUppercase: boolean,
  includeLowercase: boolean,
  includeNumbers: boolean,
  includeSymbols: boolean
): string {
  // Build character set based on options
  let charset = '';
  const required: string[] = [];

  if (includeUppercase) {
    charset += UPPERCASE;
    required.push(UPPERCASE[getRandomInt(UPPERCASE.length)]);
  }
  if (includeLowercase) {
    charset += LOWERCASE;
    required.push(LOWERCASE[getRandomInt(LOWERCASE.length)]);
  }
  if (includeNumbers) {
    charset += NUMBERS;
    required.push(NUMBERS[getRandomInt(NUMBERS.length)]);
  }
  if (includeSymbols) {
    charset += SYMBOLS;
    required.push(SYMBOLS[getRandomInt(SYMBOLS.length)]);
  }

  // If no character types selected, use all
  if (charset === '') {
    charset = UPPERCASE + LOWERCASE + NUMBERS + SYMBOLS;
  }

  // Generate password
  const passwordArray: string[] = [...required];

  // Fill remaining length with random characters
  for (let i = required.length; i < length; i++) {
    const randomIndex = getRandomInt(charset.length);
    passwordArray.push(charset[randomIndex]);
  }

  // Shuffle to avoid predictable pattern
  const shuffledPassword = shuffleArray(passwordArray);

  return shuffledPassword.join('');
}

// Function to calculate password strength
function calculateStrength(password: string): { score: number; strength: string; color: string } {
  let score = 0;

  // Length bonus
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety bonus
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  // Determine strength
  let strength: string;
  let color: string;

  if (score <= 2) {
    strength = 'WEAK';
    color = '🔴';
  } else if (score <= 4) {
    strength = 'MEDIUM';
    color = '🟡';
  } else if (score <= 6) {
    strength = 'STRONG';
    color = '🟢';
  } else {
    strength = 'VERY STRONG';
    color = '🟢🟢';
  }

  return { score, strength, color };
}

// Main application
async function runPasswordGenerator() {
  console.clear();
  console.log('='.repeat(60));
  console.log('🔐 SECURE PASSWORD GENERATOR 🔐');
  console.log('='.repeat(60));
  console.log('\nGenerate strong, cryptographically secure passwords!\n');
  console.log('='.repeat(60));

  let continueGenerating = true;

  while (continueGenerating) {
    try {
      console.log('\n📝 PASSWORD CONFIGURATION\n');

      // Get password length
      const lengthInput = await askQuestion('Password length (8-128): ');
      const length = parseInt(lengthInput);

      if (isNaN(length) || length < 8 || length > 128) {
        console.log('\n❌ Please enter a valid length between 8 and 128!\n');
        continue;
      }

      // Get character type preferences
      const uppercaseInput = await askQuestion('Include UPPERCASE letters? (yes/no): ');
      const includeUppercase = uppercaseInput.toLowerCase() === 'yes' || uppercaseInput.toLowerCase() === 'y';

      const lowercaseInput = await askQuestion('Include lowercase letters? (yes/no): ');
      const includeLowercase = lowercaseInput.toLowerCase() === 'yes' || lowercaseInput.toLowerCase() === 'y';

      const numbersInput = await askQuestion('Include numbers (0-9)? (yes/no): ');
      const includeNumbers = numbersInput.toLowerCase() === 'yes' || numbersInput.toLowerCase() === 'y';

      const symbolsInput = await askQuestion('Include symbols (!@#$...)? (yes/no): ');
      const includeSymbols = symbolsInput.toLowerCase() === 'yes' || symbolsInput.toLowerCase() === 'y';

      // Generate password
      const password = generatePassword(
        length,
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSymbols
      );

      // Calculate strength
      const strength = calculateStrength(password);

      // Display result
      console.log('\n' + '='.repeat(60));
      console.log('🎉 YOUR GENERATED PASSWORD:');
      console.log('='.repeat(60));
      console.log(`\n${password}\n`);
      console.log('-'.repeat(60));
      console.log(`Length: ${password.length} characters`);
      console.log(`Strength: ${strength.color} ${strength.strength} (Score: ${strength.score}/7)`);
      console.log('-'.repeat(60));

      // Password tips
      console.log('\n💡 PASSWORD TIPS:');
      console.log('   • Never reuse passwords across different sites');
      console.log('   • Store passwords in a password manager');
      console.log('   • Change passwords regularly');
      console.log('   • Enable two-factor authentication when available\n');

      // Ask to generate another
      const again = await askQuestion('Generate another password? (yes/no): ');

      if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
        console.log('\n👋 Stay secure! Goodbye!\n');
        continueGenerating = false;
      }

    } catch (error) {
      if (error instanceof Error) {
        console.log(`\n❌ Error: ${error.message}\n`);
      }
    }
  }

  rl.close();
}

// Run the application
runPasswordGenerator();
