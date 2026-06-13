import * as chalk from 'chalk';

type CacheEventType = 'HIT' | 'MISS' | 'SET' | 'INVALIDATE' | 'ERROR';

/**
 * Logs a single cache event (hit, miss, set, invalidate, or error) with
 * a timestamp and a color matching the event type, so the terminal
 * makes it obvious at a glance whether requests are hitting the cache.
 */
export function logCacheEvent(type: CacheEventType, key: string, detail?: string): void {
  const timestamp = new Date().toISOString();

  let label: string;
  switch (type) {
    case 'HIT':
      label = chalk.green('[CACHE HIT]');
      break;
    case 'MISS':
      label = chalk.yellow('[CACHE MISS]');
      break;
    case 'SET':
      label = chalk.cyan('[CACHE SET]');
      break;
    case 'INVALIDATE':
      label = chalk.magenta('[CACHE INVALIDATE]');
      break;
    case 'ERROR':
      label = chalk.red('[CACHE ERROR]');
      break;
  }

  const suffix = detail ? chalk.gray(` (${detail})`) : '';
  console.log(`${chalk.gray(timestamp)} ${label} ${key}${suffix}`);
}

/**
 * Logs an incoming HTTP request once it finishes, with method, path,
 * status code (color-coded), and response time in milliseconds.
 */
export function logRequest(method: string, path: string, status: number, ms: number): void {
  const statusColor = status >= 500 ? chalk.red : status >= 400 ? chalk.yellow : chalk.green;
  console.log(
    `${chalk.gray(new Date().toISOString())} ${chalk.bold(method.padEnd(6))} ${path} ${statusColor(String(status))} ${ms}ms`
  );
}
