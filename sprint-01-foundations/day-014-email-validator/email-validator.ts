#!/usr/bin/env node

// Email Validator
// Day 14 of 300 Days of Code Challenge

import * as readline from 'readline';
import * as fs from 'fs/promises';
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

// ─── Email Validation Regex ──────────────────────────────

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// ─── Validation Functions ─────────────────────────────────

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

function validateEmailDetailed(email: string): {
  valid: boolean;
  reasons: string[];
  parts?: { localPart: string; domain: string; tld: string };
} {
  const reasons: string[] = [];

  // Check basic format
  if (!email.includes('@')) {
    reasons.push('Missing @ symbol');
    return { valid: false, reasons };
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    reasons.push('Multiple @ symbols found');
    return { valid: false, reasons };
  }

  const [localPart, domainPart] = parts;

  // Validate local part (before @)
  if (!localPart || localPart.length === 0) {
    reasons.push('Empty local part (before @)');
  }
  if (localPart.length > 64) {
    reasons.push('Local part too long (max 64 characters)');
  }
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    reasons.push('Local part cannot start or end with a dot');
  }
  if (localPart.includes('..')) {
    reasons.push('Local part cannot have consecutive dots');
  }

  // Validate domain part (after @)
  if (!domainPart || domainPart.length === 0) {
    reasons.push('Empty domain part (after @)');
    return { valid: false, reasons };
  }

  if (!domainPart.includes('.')) {
    reasons.push('Domain must contain at least one dot');
  }

  const domainParts = domainPart.split('.');
  const tld = domainParts[domainParts.length - 1];

  if (tld.length < 2) {
    reasons.push('Top-level domain too short (min 2 characters)');
  }

  if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
    reasons.push('Domain cannot start or end with a dot');
  }

  if (domainPart.startsWith('-') || domainPart.endsWith('-')) {
    reasons.push('Domain cannot start or end with a hyphen');
  }

  // Check for invalid characters
  if (!/^[a-zA-Z0-9._%+-]+$/.test(localPart)) {
    reasons.push('Local part contains invalid characters');
  }

  if (!/^[a-zA-Z0-9.-]+$/.test(domainPart)) {
    reasons.push('Domain contains invalid characters');
  }

  const valid = reasons.length === 0;

  return {
    valid,
    reasons,
    parts: valid ? { localPart, domain: domainPart, tld } : undefined
  };
}

// ─── Batch Validation ─────────────────────────────────────

async function validateEmailsFromFile(filePath: string): Promise<{
  valid: string[];
  invalid: string[];
}> {
  const content = await fs.readFile(filePath, 'utf-8');
  const emails = content.split('\n').map(e => e.trim()).filter(e => e.length > 0);

  const valid: string[] = [];
  const invalid: string[] = [];

  for (const email of emails) {
    if (isValidEmail(email)) {
      valid.push(email);
    } else {
      invalid.push(email);
    }
  }

  return { valid, invalid };
}

// ─── Common Email Providers ───────────────────────────────

const COMMON_PROVIDERS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'protonmail.com',
  'aol.com',
  'mail.com',
  'zoho.com'
];

function getEmailProvider(email: string): string | null {
  if (!isValidEmail(email)) return null;

  const domain = email.split('@')[1].toLowerCase();
  return domain;
}

function isCommonProvider(email: string): boolean {
  const provider = getEmailProvider(email);
  if (!provider) return false;
  return COMMON_PROVIDERS.includes(provider);
}

// ─── Display Functions ────────────────────────────────────

function displayValidationResult(email: string): void {
  const result = validateEmailDetailed(email);

  console.log(chalk.gray('\n  ' + '─'.repeat(50)));

  if (result.valid) {
    console.log(chalk.bold.green('\n  ✅ VALID EMAIL\n'));
    console.log(chalk.white(`  Email:       ${email}`));
    if (result.parts) {
      console.log(chalk.cyan(`  Local Part:  ${result.parts.localPart}`));
      console.log(chalk.cyan(`  Domain:      ${result.parts.domain}`));
      console.log(chalk.cyan(`  TLD:         ${result.parts.tld}`));

      const provider = getEmailProvider(email);
      if (provider && isCommonProvider(email)) {
        console.log(chalk.yellow(`  Provider:    ${provider} (Common)`));
      } else {
        console.log(chalk.gray(`  Provider:    ${provider} (Custom/Business)`));
      }
    }
  } else {
    console.log(chalk.bold.red('\n  ❌ INVALID EMAIL\n'));
    console.log(chalk.white(`  Email:       ${email}`));
    console.log(chalk.red('\n  Issues:\n'));
    result.reasons.forEach(reason => {
      console.log(chalk.red(`    • ${reason}`));
    });
  }

  console.log(chalk.gray('\n  ' + '─'.repeat(50) + '\n'));
}

function displayBatchResults(valid: string[], invalid: string[]): void {
  const total = valid.length + invalid.length;
  const validPercent = ((valid.length / total) * 100).toFixed(1);

  console.log(chalk.bold.cyan('\n  📊 BATCH VALIDATION RESULTS\n'));
  console.log(chalk.white(`  Total Emails:     ${total}`));
  console.log(chalk.green(`  ✅ Valid:         ${valid.length} (${validPercent}%)`));
  console.log(chalk.red(`  ❌ Invalid:       ${invalid.length} (${100 - Number(validPercent)}%)`));

  if (valid.length > 0) {
    console.log(chalk.bold.green('\n  Valid Emails:\n'));
    valid.forEach(email => console.log(chalk.green(`    ✓ ${email}`)));
  }

  if (invalid.length > 0) {
    console.log(chalk.bold.red('\n  Invalid Emails:\n'));
    invalid.forEach(email => console.log(chalk.red(`    ✗ ${email}`)));
  }

  console.log('');
}

// ─── Example Emails ───────────────────────────────────────

function showExamples(): void {
  console.log(chalk.bold.cyan('\n  📧 VALID EMAIL EXAMPLES\n'));
  const validExamples = [
    'user@example.com',
    'john.doe@company.co.uk',
    'test+tag@gmail.com',
    'first_last@sub.domain.com',
    '123@numbers.org'
  ];
  validExamples.forEach(email => console.log(chalk.green(`    ✓ ${email}`)));

  console.log(chalk.bold.red('\n  ❌ INVALID EMAIL EXAMPLES\n'));
  const invalidExamples = [
    'missing-at-sign.com',
    'double@@example.com',
    '@no-local-part.com',
    'no-domain@.com',
    'spaces in@email.com',
    'ends-with-dot@example.com.',
    'consecutive..dots@example.com'
  ];
  invalidExamples.forEach(email => console.log(chalk.red(`    ✗ ${email}`)));

  console.log('');
}

// ─── Main Application ─────────────────────────────────────

async function runEmailValidator() {
  console.clear();
  console.log(chalk.bold.blue('═'.repeat(55)));
  console.log(chalk.bold.blue('           📧 EMAIL VALIDATOR 📧'));
  console.log(chalk.bold.blue('═'.repeat(55)));
  console.log(chalk.white('\n   Validate email addresses with detailed feedback!\n'));
  console.log(chalk.bold.blue('═'.repeat(55)));

  let continueRunning = true;

  while (continueRunning) {
    console.log(chalk.bold.cyan('\n📋 MENU\n'));
    console.log(chalk.white('   1. Validate single email'));
    console.log(chalk.white('   2. Validate multiple emails from file'));
    console.log(chalk.white('   3. Test common providers'));
    console.log(chalk.white('   4. Show examples (valid & invalid)'));
    console.log(chalk.white('   5. Exit\n'));

    const choice = await askQuestion(chalk.cyan('Choose an option (1-5): '));

    if (choice === '5') {
      console.log(chalk.blue('\n👋 Stay validated! Goodbye!\n'));
      break;
    }

    try {
      switch (choice) {
        case '1': {
          const email = await askQuestion(chalk.cyan('\n  Enter email address: '));

          if (!email) {
            console.log(chalk.red('\n  ❌ Please enter an email!\n'));
            break;
          }

          displayValidationResult(email);
          break;
        }

        case '2': {
          const filePath = await askQuestion(chalk.cyan('\n  Enter file path (one email per line): '));

          if (!filePath) {
            console.log(chalk.red('\n  ❌ Please provide a file path!\n'));
            break;
          }

          console.log(chalk.cyan('\n  📖 Reading file...'));
          const results = await validateEmailsFromFile(filePath);
          displayBatchResults(results.valid, results.invalid);
          break;
        }

        case '3': {
          console.log(chalk.bold.yellow('\n  📮 COMMON EMAIL PROVIDERS\n'));
          COMMON_PROVIDERS.forEach((provider, i) => {
            console.log(chalk.white(`    ${i + 1}. ${provider}`));
          });

          const testEmail = await askQuestion(chalk.cyan('\n  Enter email to check provider: '));

          if (!testEmail) break;

          const provider = getEmailProvider(testEmail);
          const isCommon = isCommonProvider(testEmail);

          if (provider) {
            console.log(chalk.cyan(`\n  Provider: ${provider}`));
            console.log(isCommon
              ? chalk.green(`  ✓ Common provider`)
              : chalk.yellow(`  ⚠️  Custom/Business email`));
          } else {
            console.log(chalk.red('\n  ❌ Invalid email format'));
          }
          console.log('');
          break;
        }

        case '4': {
          showExamples();
          break;
        }

        default:
          console.log(chalk.red('\n  ❌ Invalid option! Please choose 1-5.\n'));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red(`\n  ❌ Error: ${error.message}\n`));
      }
    }

    const again = await askQuestion(chalk.cyan('Continue? (yes/no): '));
    if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
      console.log(chalk.blue('\n👋 Stay validated! Goodbye!\n'));
      continueRunning = false;
    }
  }

  rl.close();
}

runEmailValidator();
