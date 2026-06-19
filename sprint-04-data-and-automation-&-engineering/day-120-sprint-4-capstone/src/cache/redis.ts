import { createClient, RedisClientType } from 'redis';
import * as dotenv from 'dotenv';
import * as chalk from 'chalk';
dotenv.config();

let client: RedisClientType | null = null;
let attempted = false;

export async function getRedis(): Promise<RedisClientType | null> {
  if (attempted) return client;
  attempted = true;

  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const c = createClient({ url }) as RedisClientType;
  c.on('error', (err: Error) => console.error(chalk.red(`[redis] ${err.message}`)));

  try {
    await c.connect();
    client = c;
    console.log(chalk.green(`[redis] connected to ${url}`));
  } catch (err) {
    console.warn(chalk.yellow(`[redis] unavailable — running without cache. (${(err as Error).message})`));
    client = null;
  }
  return client;
}

export async function closeRedis(): Promise<void> {
  if (client) { await client.quit(); client = null; attempted = false; }
}
