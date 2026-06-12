import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { initSchema } from './schema';

dotenv.config();

let db: Database.Database | null = null;

/**
 * Returns the singleton database connection, creating it (and the
 * data directory + schema) on first use. Never call this at module
 * load time - only inside functions that actually need the DB.
 */
export function getDb(): Database.Database {
  if (!db) {
    const dbPath = process.env.DB_PATH || './data/budget.db';
    const resolvedPath = path.resolve(process.cwd(), dbPath);
    const dir = path.dirname(resolvedPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(resolvedPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }

  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
