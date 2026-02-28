#!/usr/bin/env node

// Simple CSV Parser with PapaParse
// Day 23 of 300 Days of Code Challenge

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';
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

interface ParsedRow {
  [key: string]: string | number;
}

interface CSVStats {
  totalRows: number;
  totalColumns: number;
  headers: string[];
  numericColumns: string[];
  emptyValues: number;
}

// ─── Sample CSV Files (created on startup) ───────────────

function createSampleFiles(): void {
  const studentsCSV = `name,age,subject,grade,city
Henry,20,Math,88,Lagos
Amaka,22,Science,95,Abuja
Emeka,19,Math,72,Lagos
Fatima,21,English,90,Kano
Chidi,23,Science,65,Abuja
Ngozi,20,Math,78,Lagos
Uche,22,English,85,Port Harcourt
Bola,19,Science,91,Lagos
Kemi,21,Math,55,Ibadan
Tunde,24,English,82,Lagos`;

  const productsCSV = `name,category,price,in_stock,rating
Laptop,Electronics,450000,true,4.5
Phone,Electronics,180000,true,4.2
Headphones,Electronics,25000,false,4.0
Rice 50kg,Food,45000,true,4.8
Cooking Oil,Food,8500,true,4.3
T-Shirt,Clothing,5000,true,3.9
Sneakers,Clothing,35000,false,4.6
Blender,Appliances,22000,true,4.1
Fan,Appliances,18000,true,3.8
Tablet,Electronics,120000,true,4.4`;

  const salesCSV = `month,product,units_sold,revenue,region
January,Laptop,12,5400000,South West
January,Phone,45,8100000,South West
February,Laptop,8,3600000,North Central
February,Phone,60,10800000,South East
March,Laptop,20,9000000,South West
March,Tablet,30,3600000,Lagos
April,Phone,55,9900000,North West
April,Laptop,15,6750000,South West
May,Tablet,40,4800000,South East
May,Phone,70,12600000,Lagos`;

  fs.writeFileSync('students.csv', studentsCSV);
  fs.writeFileSync('products.csv', productsCSV);
  fs.writeFileSync('sales.csv', salesCSV);
}

// ─── Core Parser Functions ────────────────────────────────

function parseCSV(filePath: string): ParsedRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const result = Papa.parse<ParsedRow>(content, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  return result.data;
}

function getStats(rows: ParsedRow[]): CSVStats {
  if (rows.length === 0) return { totalRows: 0, totalColumns: 0, headers: [], numericColumns: [], emptyValues: 0 };

  const headers = Object.keys(rows[0]);
  let emptyValues = 0;

  const numericColumns = headers.filter(h => {
    return rows.every(row => {
      const val = row[h];
      if (val === null || val === '') { emptyValues++; return false; }
      return typeof val === 'number';
    });
  });

  return {
    totalRows: rows.length,
    totalColumns: headers.length,
    headers,
    numericColumns,
    emptyValues,
  };
}

function filterRows(rows: ParsedRow[], column: string, value: string): ParsedRow[] {
  return rows.filter(row =>
    String(row[column]).toLowerCase().includes(value.toLowerCase())
  );
}

function sortRows(rows: ParsedRow[], column: string, order: 'asc' | 'desc'): ParsedRow[] {
  return [...rows].sort((a, b) => {
    const aVal = a[column];
    const bVal = b[column];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return order === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });
}

function getColumnStats(rows: ParsedRow[], column: string): void {
  const values = rows.map(r => r[column]).filter(v => typeof v === 'number') as number[];
  if (values.length === 0) {
    console.log(chalk.red(`\n  "${column}" is not a numeric column.\n`));
    return;
  }

  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  console.log(chalk.bold.cyan(`\n  Stats for column "${column}":\n`));
  console.log(chalk.cyan('  Count  : ') + chalk.white(values.length));
  console.log(chalk.cyan('  Sum    : ') + chalk.white(sum.toLocaleString()));
  console.log(chalk.cyan('  Average: ') + chalk.white(avg.toFixed(2)));
  console.log(chalk.cyan('  Median : ') + chalk.white(median.toFixed(2)));
  console.log(chalk.cyan('  Min    : ') + chalk.white(min.toLocaleString()));
  console.log(chalk.cyan('  Max    : ') + chalk.white(max.toLocaleString()));
  console.log('');
}

function exportFiltered(rows: ParsedRow[], filename: string): void {
  const csv = Papa.unparse(rows);
  fs.writeFileSync(filename, csv);
  console.log(chalk.green(`\n  Exported ${rows.length} rows to ${filename}\n`));
}

// ─── Display Functions ────────────────────────────────────

function displayTable(rows: ParsedRow[], limit: number = 10): void {
  if (rows.length === 0) {
    console.log(chalk.red('\n  No rows to display.\n'));
    return;
  }

  const headers = Object.keys(rows[0]);
  const toShow = rows.slice(0, limit);

  // Calculate column widths
  const widths = headers.map(h =>
    Math.max(h.length, ...toShow.map(r => String(r[h] ?? '').length))
  );

  // Header row
  console.log('');
  const headerRow = headers.map((h, i) => h.padEnd(widths[i])).join('  ');
  console.log(chalk.bold.yellow('  ' + headerRow));
  console.log(chalk.gray('  ' + widths.map(w => '─'.repeat(w)).join('  ')));

  // Data rows
  toShow.forEach(row => {
    const line = headers.map((h, i) => String(row[h] ?? '').padEnd(widths[i])).join('  ');
    console.log(chalk.white('  ' + line));
  });

  if (rows.length > limit) {
    console.log(chalk.gray(`\n  ... and ${rows.length - limit} more rows`));
  }
  console.log('');
}

function displayStats(stats: CSVStats, filename: string): void {
  console.log(chalk.bold.cyan(`\n  File: ${filename}\n`));
  console.log(chalk.cyan('  Rows          : ') + chalk.white(stats.totalRows));
  console.log(chalk.cyan('  Columns       : ') + chalk.white(stats.totalColumns));
  console.log(chalk.cyan('  Headers       : ') + chalk.white(stats.headers.join(', ')));
  console.log(chalk.cyan('  Numeric cols  : ') + chalk.white(stats.numericColumns.length > 0 ? stats.numericColumns.join(', ') : 'none'));
  console.log(chalk.cyan('  Empty values  : ') + chalk.white(stats.emptyValues));
  console.log('');
}

// ─── Main Application ─────────────────────────────────────

async function runCSVParser(): Promise<void> {
  console.clear();
  console.log(chalk.bold.magenta('═'.repeat(55)));
  console.log(chalk.bold.magenta('        SIMPLE CSV PARSER — PAPAPARSE'));
  console.log(chalk.bold.magenta('═'.repeat(55)));
  console.log(chalk.white('\n   Parse, filter, sort and analyse CSV files!\n'));
  console.log(chalk.bold.magenta('═'.repeat(55)));

  // Create sample files
  createSampleFiles();
  console.log(chalk.green('\n  Sample files created: students.csv, products.csv, sales.csv\n'));

  let currentFile = '';
  let currentRows: ParsedRow[] = [];
  let continueRunning = true;

  while (continueRunning) {
    console.log(chalk.bold.cyan('\n  MENU\n'));
    console.log(chalk.white('   1. Load a CSV file'));
    console.log(chalk.white('   2. View data (table)'));
    console.log(chalk.white('   3. File stats'));
    console.log(chalk.white('   4. Filter rows'));
    console.log(chalk.white('   5. Sort rows'));
    console.log(chalk.white('   6. Column statistics'));
    console.log(chalk.white('   7. Export filtered data'));
    console.log(chalk.white('   8. Exit\n'));

    if (currentFile) {
      console.log(chalk.gray(`  Current file: ${currentFile} (${currentRows.length} rows)\n`));
    }

    const choice = await askQuestion(chalk.cyan('  Choose an option (1-8): '));

    if (choice === '8') {
      console.log(chalk.magenta('\n  CSV mastered! Day 23 done! 👋\n'));
      break;
    }

    try {
      switch (choice) {

        // ── Option 1: Load File ──────────────────────────
        case '1': {
          console.log(chalk.cyan('\n  Available sample files: students.csv, products.csv, sales.csv'));
          const filename = await askQuestion(chalk.cyan('  Enter filename: '));
          if (!fs.existsSync(filename)) {
            console.log(chalk.red(`\n  File not found: ${filename}\n`));
            break;
          }
          currentRows = parseCSV(filename);
          currentFile = filename;
          console.log(chalk.green(`\n  Loaded ${currentRows.length} rows from ${filename}\n`));
          displayTable(currentRows, 5);
          break;
        }

        // ── Option 2: View Data ──────────────────────────
        case '2': {
          if (!currentFile) { console.log(chalk.red('\n  Load a file first!\n')); break; }
          const limitInput = await askQuestion(chalk.cyan('\n  How many rows to show? (default: 10): '));
          const limit = parseInt(limitInput) || 10;
          displayTable(currentRows, limit);
          break;
        }

        // ── Option 3: Stats ──────────────────────────────
        case '3': {
          if (!currentFile) { console.log(chalk.red('\n  Load a file first!\n')); break; }
          const stats = getStats(currentRows);
          displayStats(stats, currentFile);
          break;
        }

        // ── Option 4: Filter ─────────────────────────────
        case '4': {
          if (!currentFile) { console.log(chalk.red('\n  Load a file first!\n')); break; }
          const stats = getStats(currentRows);
          console.log(chalk.cyan('\n  Columns: ') + chalk.white(stats.headers.join(', ')));
          const column = await askQuestion(chalk.cyan('  Filter by column: '));
          if (!stats.headers.includes(column)) { console.log(chalk.red('\n  Invalid column!\n')); break; }
          const value = await askQuestion(chalk.cyan('  Filter value: '));
          const filtered = filterRows(currentRows, column, value);
          console.log(chalk.green(`\n  Found ${filtered.length} matching rows:\n`));
          displayTable(filtered);
          break;
        }

        // ── Option 5: Sort ───────────────────────────────
        case '5': {
          if (!currentFile) { console.log(chalk.red('\n  Load a file first!\n')); break; }
          const stats = getStats(currentRows);
          console.log(chalk.cyan('\n  Columns: ') + chalk.white(stats.headers.join(', ')));
          const column = await askQuestion(chalk.cyan('  Sort by column: '));
          if (!stats.headers.includes(column)) { console.log(chalk.red('\n  Invalid column!\n')); break; }
          const order = await askQuestion(chalk.cyan('  Order (asc/desc): '));
          const sorted = sortRows(currentRows, column, order === 'desc' ? 'desc' : 'asc');
          console.log(chalk.green(`\n  Sorted by ${column} (${order}):\n`));
          displayTable(sorted);
          break;
        }

        // ── Option 6: Column Stats ───────────────────────
        case '6': {
          if (!currentFile) { console.log(chalk.red('\n  Load a file first!\n')); break; }
          const stats = getStats(currentRows);
          console.log(chalk.cyan('\n  Numeric columns: ') + chalk.white(stats.numericColumns.join(', ') || 'none'));
          const column = await askQuestion(chalk.cyan('  Enter column name: '));
          getColumnStats(currentRows, column);
          break;
        }

        // ── Option 7: Export ─────────────────────────────
        case '7': {
          if (!currentFile) { console.log(chalk.red('\n  Load a file first!\n')); break; }
          const stats = getStats(currentRows);
          console.log(chalk.cyan('\n  Columns: ') + chalk.white(stats.headers.join(', ')));
          const column = await askQuestion(chalk.cyan('  Filter column (press Enter to export all): '));

          let toExport = currentRows;
          if (column && stats.headers.includes(column)) {
            const value = await askQuestion(chalk.cyan('  Filter value: '));
            toExport = filterRows(currentRows, column, value);
          }

          const outFile = await askQuestion(chalk.cyan('  Output filename (e.g. output.csv): '));
          exportFiltered(toExport, outFile || 'output.csv');
          break;
        }

        default:
          console.log(chalk.red('\n  Invalid option! Please choose 1-8.\n'));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red(`\n  Error: ${error.message}\n`));
      }
    }

    const again = await askQuestion(chalk.cyan('  Continue? (yes/no): '));
    if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
      console.log(chalk.magenta('\n  CSV mastered! Day 23 done! 👋\n'));
      continueRunning = false;
    }
  }

  rl.close();
}

runCSVParser();