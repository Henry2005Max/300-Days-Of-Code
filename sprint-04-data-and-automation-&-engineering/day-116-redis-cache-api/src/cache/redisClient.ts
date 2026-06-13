import { createClient, RedisClientType } from 'redis';
import * as dotenv from 'dotenv';
import * as chalk from 'chalk';

dotenv.config();

let client: RedisClientType | null = null;
let connectionAttempted = false;

/**
 * Returns a connected Redis client, or null if Redis is unreachable.
 *
 * The connection is attempted only once, lazily, on first call - never
 * at module load time. If the connection fails (e.g. Redis isn't
 * running locally), every subsequent caller gets null and the cache
 * middleware simply skips itself, so the API keeps working without a
 * cache layer instead of crashing.
 */
export async function getRedisClient(): Promise<RedisClientType | null> {
  if (connectionAttempted) {
    return client;
  }
  connectionAttempted = true;

  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const newClient: RedisClientType = createClient({ url });

  newClient.on('error', (err: Error) => {
    console.error(chalk.red(`[redis] connection error: ${err.message}`));
  });

  try {
    await newClient.connect();
    client = newClient;
    console.log(chalk.green(`[redis] connected to ${url}`));
  } catch (err) {
    client = null;
    console.warn(chalk.yellow(`[redis] unavailable (${(err as Error).message}) - running without cache.`));
  }

  return client;
}

export async function closeRedisClient(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
    connectionAttempted = false;
  }
}
