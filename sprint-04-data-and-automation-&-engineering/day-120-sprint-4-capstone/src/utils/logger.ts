import * as chalk from 'chalk';

export function logRequest(method: string, path: string, status: number, ms: number): void {
  const col = status >= 500 ? chalk.red : status >= 400 ? chalk.yellow : chalk.green;
  console.log(`${chalk.gray(new Date().toISOString())} ${chalk.bold(method.padEnd(6))} ${path} ${col(String(status))} ${ms}ms`);
}
