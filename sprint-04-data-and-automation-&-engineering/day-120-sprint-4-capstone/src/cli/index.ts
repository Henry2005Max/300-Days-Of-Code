#!/usr/bin/env node
import * as dotenv from 'dotenv';
dotenv.config();

import * as chalk from 'chalk';
import { getDashboardReport } from '../analytics/queries';
import { searchProducts } from '../search/engine';
import { buildCsv } from '../exporters/csvExporter';
import { FilterOptions } from '../types';
import * as fs from 'fs';
import * as path from 'path';

function naira(n: number): string {
  return chalk.green(`₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
}

function bar(value: number, max: number, width = 24): string {
  const filled = Math.round((value / max) * width);
  return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(width - filled));
}

function printHelp(): void {
  console.log(chalk.bold('\nSprint 4 Capstone CLI\n'));
  console.log('  summary [--from=DATE] [--to=DATE] [--category=X] [--city=X]');
  console.log('  search <query>');
  console.log('  export <csv|excel|pdf> [--from=DATE] [--to=DATE]');
  console.log('');
}

function parseArgs(args: string[]): { positional: string[]; flags: Record<string, string> } {
  const positional: string[] = [];
  const flags: Record<string, string> = {};
  for (const a of args) {
    if (a.startsWith('--')) { const [k, v] = a.slice(2).split('='); flags[k] = v ?? 'true'; }
    else positional.push(a);
  }
  return { positional, flags };
}

async function cmdSummary(opts: FilterOptions): Promise<void> {
  console.log(chalk.bold('\nFetching dashboard report...\n'));
  const report = await getDashboardReport(opts);

  // Header
  console.log(chalk.bgGreen.white.bold(` E-Commerce Dashboard — ${report.period.from} → ${report.period.to} `));
  console.log('');

  // KPIs
  console.log(`  Total Revenue   : ${naira(report.totalRevenue)}`);
  console.log(`  Total Orders    : ${chalk.cyan(String(report.totalOrders))}`);
  console.log(`  Total Customers : ${chalk.cyan(String(report.totalCustomers))}`);
  console.log('');

  // Categories
  console.log(chalk.bold('  Revenue by Category'));
  console.log(chalk.gray('  ' + '─'.repeat(58)));
  const maxRev = Math.max(...report.categoryBreakdown.map((c) => c.total_revenue));
  for (const c of report.categoryBreakdown) {
    const mom = c.mom_change_pct != null
      ? (c.mom_change_pct >= 0 ? chalk.green(`+${c.mom_change_pct}%`) : chalk.red(`${c.mom_change_pct}%`))
      : chalk.gray('—');
    console.log(`  ${c.category.padEnd(26)} ${bar(c.total_revenue, maxRev)} ${naira(c.total_revenue).padStart(18)} MoM ${mom}`);
  }
  console.log('');

  // Top 5 products
  console.log(chalk.bold('  Top 5 Products'));
  console.log(chalk.gray('  ' + '─'.repeat(58)));
  for (const p of report.topProducts.slice(0, 5)) {
    console.log(`  ${String(p.rank_overall).padStart(2)}. ${p.product_name.padEnd(30)} ${naira(p.total_revenue).padStart(16)} [${p.category}]`);
  }
  console.log('');

  // Top 5 customers
  console.log(chalk.bold('  Top 5 Customers by LTV'));
  console.log(chalk.gray('  ' + '─'.repeat(58)));
  for (const c of report.topCustomers.slice(0, 5)) {
    const band = c.ltv_band === 'Platinum' ? chalk.magenta(c.ltv_band)
               : c.ltv_band === 'Gold'     ? chalk.yellow(c.ltv_band)
               : c.ltv_band === 'Silver'   ? chalk.cyan(c.ltv_band)
               :                             chalk.gray(c.ltv_band);
    console.log(`  ${c.customer_name.padEnd(24)} ${c.city.padEnd(16)} ${naira(c.total_spent).padStart(16)} ${band}`);
  }
  console.log('');
}

async function cmdSearch(query: string): Promise<void> {
  if (!query) { console.log(chalk.red('Provide a search query.')); return; }
  console.log(chalk.bold(`\nSearching products for: "${query}"\n`));
  const results = await searchProducts(query, 8);
  if (!results.length) { console.log(chalk.gray('  No results found.')); return; }
  for (const r of results) {
    console.log(`  ${chalk.cyan(r.name)} — ${chalk.gray(r.category)} — ${naira(r.price)}`);
    const snippet = r.headline.replace(/<b>/g, chalk.bold('')).replace(/<\/b>/g, chalk.reset(''));
    console.log(`    ${chalk.gray(snippet)}`);
    console.log('');
  }
}

async function cmdExport(fmt: string, opts: FilterOptions): Promise<void> {
  if (!['csv', 'excel', 'pdf'].includes(fmt)) {
    console.log(chalk.red('Format must be csv, excel, or pdf')); return;
  }
  console.log(chalk.bold(`\nGenerating ${fmt.toUpperCase()} export...\n`));
  const report = await getDashboardReport(opts);
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const exportDir = process.env.EXPORT_DIR || './exports';
  if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

  if (fmt === 'csv') {
    const buf = buildCsv(report);
    const filePath = path.join(exportDir, `dashboard-${ts}.csv`);
    fs.writeFileSync(filePath, buf);
    console.log(chalk.green(`Saved: ${filePath}`));
    return;
  }

  // excel / pdf need dynamic import of heavy exporters
  if (fmt === 'excel') {
    const { buildExcel } = await import('../exporters/excelExporter');
    const buf = await buildExcel(report);
    const filePath = path.join(exportDir, `dashboard-${ts}.xlsx`);
    fs.writeFileSync(filePath, buf);
    console.log(chalk.green(`Saved: ${filePath}`));
    return;
  }

  const { buildPdf } = await import('../exporters/pdfExporter');
  const buf = await buildPdf(report);
  const filePath = path.join(exportDir, `dashboard-${ts}.pdf`);
  fs.writeFileSync(filePath, buf);
  console.log(chalk.green(`Saved: ${filePath}`));
}

async function main(): Promise<void> {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const [command, ...rest] = positional;

  const opts: FilterOptions = {
    from: flags.from,
    to: flags.to,
    category: flags.category,
    city: flags.city,
  };

  switch (command) {
    case 'summary': await cmdSummary(opts); break;
    case 'search':  await cmdSearch(rest.join(' ')); break;
    case 'export':  await cmdExport(rest[0] || flags.format || '', opts); break;
    default:        printHelp(); break;
  }

  process.exit(0);
}

main().catch((err) => { console.error(chalk.red(err.message)); process.exit(1); });
