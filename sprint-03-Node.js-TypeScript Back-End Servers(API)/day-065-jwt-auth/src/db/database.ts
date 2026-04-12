import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.DB_FILE || "./data/app.db";

const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

export const db = new Database(DB_PATH, {
  verbose: process.env.NODE_ENV === "development"
    ? (sql: string) => console.log(`\x1b[36m[SQL]\x1b[0m ${sql}`)
    : undefined,
});

db.pragma("journal_mode = WAL");

export function runMigrations(): void {
  /* ── Users table ───────────────────────────────────────────────────
     password_hash stores the bcrypt hash, NEVER the plain password.
     UNIQUE on email — one account per email address.
  ────────────────────────────────────────────────────────────────────*/
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      email         TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      role          TEXT    NOT NULL DEFAULT 'user',
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  /* ── Students table (same as Day 64) ── */
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      email       TEXT    NOT NULL UNIQUE,
      age         INTEGER NOT NULL,
      track       TEXT    NOT NULL,
      level       TEXT    NOT NULL,
      city        TEXT,
      gdg_member  INTEGER NOT NULL DEFAULT 0,
      enrolled_at TEXT    NOT NULL DEFAULT (date('now'))
    );
  `);

  console.log("[DB] Migrations complete");
}

export function seedData(): void {
  const count = (db.prepare("SELECT COUNT(*) as count FROM students").get() as any).count;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO students (name, email, age, track, level, city, gdg_member, enrolled_at)
    VALUES (@name, @email, @age, @track, @level, @city, @gdgMember, @enrolledAt)
  `);

  const seedMany = db.transaction((rows: any[]) => {
    for (const row of rows) insert.run(row);
  });

  seedMany([
    { name: "Chidi Okeke",   email: "chidi@example.com",  age: 22, track: "Web",    level: "Intermediate", city: "Lagos",         gdgMember: 1, enrolledAt: "2025-01-10" },
    { name: "Amaka Nwosu",   email: "amaka@example.com",  age: 24, track: "Mobile", level: "Beginner",     city: "Enugu",         gdgMember: 1, enrolledAt: "2025-01-12" },
    { name: "Tunde Adeleke", email: "tunde@example.com",  age: 26, track: "Data",   level: "Advanced",     city: "Ibadan",        gdgMember: 0, enrolledAt: "2025-01-15" },
    { name: "Fatima Bello",  email: "fatima@example.com", age: 21, track: "UI/UX",  level: "Beginner",     city: "Abuja",         gdgMember: 1, enrolledAt: "2025-01-18" },
    { name: "Emeka Okafor",  email: "emeka@example.com",  age: 23, track: "Web",    level: "Advanced",     city: "Port Harcourt", gdgMember: 0, enrolledAt: "2025-01-20" },
  ]);

  console.log("[DB] Seed complete — 5 students inserted");
}