#!/usr/bin/env node
import * as chalk from 'chalk';
import { createUser, listUsers, getUserById } from './models/userModel';
import { createCategory, listCategories, getCategoryById } from './models/categoryModel';
import { createTransaction, listTransactionsWithBalance } from './models/transactionModel';
import { createRecurring, listRecurring } from './models/recurringModel';
import { processRecurring } from './services/recurringProcessor';
import { getMonthlySummary } from './services/summaryService';
import { exportTransactionsToCsv } from './services/exportService';
import { seedDemoData } from './seed';
import {
  printUsers,
  printCategories,
  printTransactions,
  printRecurring,
  printSummary,
  printProcessResults,
  formatNaira,
} from './utils/display';
import { TransactionType, Frequency } from './types';

const VALID_TYPES: TransactionType[] = ['income', 'expense'];
const VALID_FREQUENCIES: Frequency[] = ['daily', 'weekly', 'monthly', 'yearly'];

function today(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Splits CLI args into positional arguments and --key=value flags.
 */
function parseFlags(args: string[]): { positional: string[]; flags: Record<string, string> } {
  const positional: string[] = [];
  const flags: Record<string, string> = {};

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      flags[key] = value ?? 'true';
    } else {
      positional.push(arg);
    }
  }

  return { positional, flags };
}

function printHelp(): void {
  console.log(chalk.bold('\nBudget Tracker v2 - Multi-User CLI\n'));
  console.log('Commands:');
  console.log('  add-user <name> <email>');
  console.log('  list-users');
  console.log('  add-category <userId> <name> <income|expense>');
  console.log('  list-categories <userId>');
  console.log('  add-transaction <userId> <categoryId> <amount> <income|expense> <description> [date]');
  console.log('  add-recurring <userId> <categoryId> <amount> <income|expense> <description> <daily|weekly|monthly|yearly> <startDate> [endDate]');
  console.log('  list-recurring <userId>');
  console.log('  process-recurring [asOfDate]');
  console.log('  list-transactions <userId> [--from=YYYY-MM-DD] [--to=YYYY-MM-DD]');
  console.log('  summary <userId> <YYYY-MM>');
  console.log('  export-csv <userId> <filename>');
  console.log('  seed');
  console.log('');
  console.log(chalk.gray('  Dates use YYYY-MM-DD format. Amounts are in Naira (₦).'));
  console.log('');
}

function requireUser(userId: number): void {
  if (Number.isNaN(userId) || !getUserById(userId)) {
    console.log(chalk.red(`Error: user ${Number.isNaN(userId) ? '(missing)' : userId} not found.`));
    process.exit(1);
  }
}

function requireCategory(categoryId: number): void {
  if (Number.isNaN(categoryId) || !getCategoryById(categoryId)) {
    console.log(chalk.red(`Error: category ${Number.isNaN(categoryId) ? '(missing)' : categoryId} not found.`));
    process.exit(1);
  }
}

function requireType(type: string): TransactionType {
  if (!VALID_TYPES.includes(type as TransactionType)) {
    console.log(chalk.red(`Error: type must be 'income' or 'expense', got "${type}".`));
    process.exit(1);
  }
  return type as TransactionType;
}

function requireFrequency(frequency: string): Frequency {
  if (!VALID_FREQUENCIES.includes(frequency as Frequency)) {
    console.log(chalk.red(`Error: frequency must be one of ${VALID_FREQUENCIES.join(', ')}, got "${frequency}".`));
    process.exit(1);
  }
  return frequency as Frequency;
}

function requirePositiveAmount(amount: number): void {
  if (Number.isNaN(amount) || amount <= 0) {
    console.log(chalk.red('Error: amount must be a positive number.'));
    process.exit(1);
  }
}

function main(): void {
  const [command, ...args] = process.argv.slice(2);
  const { positional, flags } = parseFlags(args);

  switch (command) {
    case 'add-user': {
      const [name, email] = positional;
      if (!name || !email) {
        console.log(chalk.red('Usage: add-user <name> <email>'));
        process.exit(1);
      }
      const user = createUser(name, email);
      console.log(chalk.green(`Created user [${user.id}] ${user.name} <${user.email}>`));
      break;
    }

    case 'list-users': {
      printUsers(listUsers());
      break;
    }

    case 'add-category': {
      const [userIdStr, name, type] = positional;
      const userId = Number(userIdStr);
      requireUser(userId);
      if (!name || !type) {
        console.log(chalk.red('Usage: add-category <userId> <name> <income|expense>'));
        process.exit(1);
      }
      const validType = requireType(type);
      const category = createCategory(userId, name, validType);
      console.log(chalk.green(`Created category [${category.id}] ${category.name} (${category.type})`));
      break;
    }

    case 'list-categories': {
      const userId = Number(positional[0]);
      requireUser(userId);
      printCategories(listCategories(userId));
      break;
    }

    case 'add-transaction': {
      const [userIdStr, categoryIdStr, amountStr, type, description, date] = positional;
      const userId = Number(userIdStr);
      const categoryId = Number(categoryIdStr);
      const amount = Number(amountStr);

      requireUser(userId);
      requireCategory(categoryId);
      const validType = requireType(type);
      requirePositiveAmount(amount);

      const txn = createTransaction({
        userId,
        categoryId,
        amount,
        type: validType,
        description: description || '',
        date: date || today(),
      });

      const sign = txn.type === 'income' ? '+' : '-';
      console.log(chalk.green(`Created transaction [${txn.id}] ${txn.type} ${sign}${formatNaira(txn.amount)} on ${txn.date}`));
      break;
    }

    case 'add-recurring': {
      const [userIdStr, categoryIdStr, amountStr, type, description, frequency, startDate, endDate] = positional;
      const userId = Number(userIdStr);
      const categoryId = Number(categoryIdStr);
      const amount = Number(amountStr);

      requireUser(userId);
      requireCategory(categoryId);
      const validType = requireType(type);
      const validFrequency = requireFrequency(frequency);
      requirePositiveAmount(amount);

      if (!startDate) {
        console.log(chalk.red('Error: startDate is required (YYYY-MM-DD).'));
        process.exit(1);
      }

      const recurring = createRecurring({
        userId,
        categoryId,
        amount,
        type: validType,
        description: description || '',
        frequency: validFrequency,
        startDate,
        endDate,
      });

      console.log(chalk.green(`Created recurring transaction [${recurring.id}] "${recurring.description}" every ${recurring.frequency}, starting ${recurring.start_date}`));
      break;
    }

    case 'list-recurring': {
      const userId = Number(positional[0]);
      requireUser(userId);
      printRecurring(listRecurring(userId));
      break;
    }

    case 'process-recurring': {
      const asOfDate = positional[0] || today();
      const results = processRecurring(asOfDate);
      console.log(chalk.bold(`\nProcessing recurring transactions as of ${asOfDate}...`));
      printProcessResults(results);
      break;
    }

    case 'list-transactions': {
      const userId = Number(positional[0]);
      requireUser(userId);
      printTransactions(listTransactionsWithBalance(userId, { from: flags.from, to: flags.to }));
      break;
    }

    case 'summary': {
      const userId = Number(positional[0]);
      const month = positional[1];
      requireUser(userId);

      if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        console.log(chalk.red('Error: month must be in YYYY-MM format, e.g. 2025-05.'));
        process.exit(1);
      }

      printSummary(getMonthlySummary(userId, month));
      break;
    }

    case 'export-csv': {
      const userId = Number(positional[0]);
      const filename = positional[1];
      requireUser(userId);

      if (!filename) {
        console.log(chalk.red('Usage: export-csv <userId> <filename>'));
        process.exit(1);
      }

      const fullPath = exportTransactionsToCsv(userId, filename);
      console.log(chalk.green(`Exported transactions to ${fullPath}`));
      break;
    }

    case 'seed': {
      seedDemoData();
      console.log(chalk.green('Seeded demo data: Chidinma Okafor and Tunde Balogun, with categories, transactions, and recurring entries.'));
      break;
    }

    default:
      printHelp();
      break;
  }
}

main();
