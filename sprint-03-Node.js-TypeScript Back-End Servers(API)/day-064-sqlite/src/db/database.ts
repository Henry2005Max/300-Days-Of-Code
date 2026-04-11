import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

/* ── What is this file? ──────────────────────────────────────────────
   This file does three things:
   1. Opens (or creates) the SQLite database file
   2. Runs migrations — creates tables if they don't exist yet
   3. Seeds initial data if the table is empty

   Everything in here runs ONCE when the server starts.
   After that, the db object is exported and used by route handlers
   to run queries.
────────────────────────────────────────────────────────────────────── */

const DB_PATH = process.env.DB_FILE || "./data/students.db";

/* Ensure the directory exists before creating the database file */
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

/* ── Open the database ───────────────────────────────────────────────
   new Database(path) opens an existing file or creates a new one.
   The second argument { verbose: console.log } prints every SQL
   query to the terminal — great for learning, remove in production.
────────────────────────────────────────────────────────────────────── */
export const db = new Database(DB_PATH, {
  verbose: process.env.NODE_ENV === "development"
    ? (sql: string) => console.log(`\x1b[36m[SQL]\x1b[0m ${sql}`)
    : undefined,
});

/* ── Enable WAL mode ─────────────────────────────────────────────────
   WAL (Write-Ahead Logging) is a performance setting for SQLite.
   It allows reads and writes to happen at the same time without
   blocking each other. Always enable it for web servers.
────────────────────────────────────────────────────────────────────── */
db.pragma("journal_mode = WAL");

/* ── Migration — create the students table ───────────────────────────
   CREATE TABLE IF NOT EXISTS means:
   "Create this table, but only if it doesn't already exist."
   This is safe to run every time the server starts — it won't
   destroy your existing data if the table is already there.

   Column types in SQLite:
   INTEGER  → whole numbers (also used for booleans: 0 = false, 1 = true)
   TEXT     → strings
   REAL     → decimal numbers
   NOT NULL → this column cannot be empty
   DEFAULT  → value used if you don't provide one
   UNIQUE   → no two rows can have the same value in this column

   PRIMARY KEY AUTOINCREMENT → SQLite automatically assigns
   a unique incrementing ID to every new row.
────────────────────────────────────────────────────────────────────── */
export function runMigrations(): void {
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

  console.log("[DB] Migrations complete — students table ready");
}

/* ── Seed data ───────────────────────────────────────────────────────
   Only inserts data if the table is empty.
   We check the count first — if it's already populated, we skip.
   This prevents duplicate data on every server restart.
────────────────────────────────────────────────────────────────────── */
export function seedData(): void {
  const count = (db.prepare("SELECT COUNT(*) as count FROM students").get() as { count: number }).count;

  if (count > 0) {
    console.log(`[DB] Seed skipped — ${count} students already in database`);
    return;
  }

  /* ── db.transaction() ────────────────────────────────────────────
     A transaction groups multiple SQL operations together.
     Either ALL of them succeed, or NONE of them do.
     If one INSERT fails halfway through, all previous inserts
     in the same transaction are rolled back automatically.
     This keeps your data consistent.
  ────────────────────────────────────────────────────────────────── */
  const insertStudent = db.prepare(`
    INSERT INTO students (name, email, age, track, level, city, gdg_member, enrolled_at)
    VALUES (@name, @email, @age, @track, @level, @city, @gdgMember, @enrolledAt)
  `);

  const seedMany = db.transaction((rows: any[]) => {
    for (const row of rows) insertStudent.run(row);
  });

  seedMany([
    { name: "Chidi Okeke",   email: "chidi@example.com",  age: 22, track: "Web",    level: "Intermediate", city: "Lagos",         gdgMember: 1, enrolledAt: "2025-01-10" },
    { name: "Amaka Nwosu",   email: "amaka@example.com",  age: 24, track: "Mobile", level: "Beginner",     city: "Enugu",         gdgMember: 1, enrolledAt: "2025-01-12" },
    { name: "Tunde Adeleke", email: "tunde@example.com",  age: 26, track: "Data",   level: "Advanced",     city: "Ibadan",        gdgMember: 0, enrolledAt: "2025-01-15" },
    { name: "Fatima Bello",  email: "fatima@example.com", age: 21, track: "UI/UX",  level: "Beginner",     city: "Abuja",         gdgMember: 1, enrolledAt: "2025-01-18" },
    { name: "Emeka Okafor",  email: "emeka@example.com",  age: 23, track: "Web",    level: "Advanced",     city: "Port Harcourt", gdgMember: 0, enrolledAt: "2025-01-20" },
    { name: "Ngozi Eze",     email: "ngozi@example.com",  age: 25, track: "DevOps", level: "Intermediate", city: "Aba",           gdgMember: 1, enrolledAt: "2025-01-22" },
    { name: "Uche Obi",      email: "uche@example.com",   age: 28, track: "Mobile", level: "Advanced",     city: "Lagos",         gdgMember: 1, enrolledAt: "2025-01-25" },
    { name: "Halima Musa",   email: "halima@example.com", age: 20, track: "Web",    level: "Beginner",     city: "Kano",          gdgMember: 0, enrolledAt: "2025-01-28" },
    { name: "Seun Adeyemi",  email: "seun@example.com",   age: 27, track: "Data",   level: "Intermediate", city: "Abeokuta",      gdgMember: 1, enrolledAt: "2025-02-01" },
    { name: "Kemi Ogundimu", email: "kemi@example.com",   age: 22, track: "UI/UX",  level: "Advanced",     city: "Lagos",         gdgMember: 0, enrolledAt: "2025-02-05" },
  ]);

  console.log("[DB] Seed complete — 10 students inserted");
}