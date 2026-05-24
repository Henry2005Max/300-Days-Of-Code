import Database from 'better-sqlite3';
import fs       from 'fs';
import path     from 'path';
import dotenv   from 'dotenv';
dotenv.config();

let db: Database.Database | null = null;

function buildStatements(d: Database.Database) {
    return {
        insertTransaction: d.prepare(`
      INSERT INTO transactions (type, amount, category, description, date)
      VALUES (@type, @amount, @category, @description, @date)
    `),
        deleteTransaction: d.prepare(`DELETE FROM transactions WHERE id = @id`),
        getTransactions: d.prepare(`
      SELECT * FROM transactions
      WHERE (@type   IS NULL OR type     = @type)
        AND (@month  IS NULL OR strftime('%Y-%m', date) = @month)
        AND (@category IS NULL OR category = @category)
      ORDER BY date DESC, id DESC
      LIMIT @limit OFFSET @offset
    `),
        countTransactions: d.prepare(`
      SELECT COUNT(*) AS count FROM transactions
      WHERE (@type   IS NULL OR type     = @type)
        AND (@month  IS NULL OR strftime('%Y-%m', date) = @month)
        AND (@category IS NULL OR category = @category)
    `),
        getMonthlySummary: d.prepare(`
      SELECT
        strftime('%Y-%m', date) AS monthYear,
        SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS totalIncome,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS totalExpense
      FROM transactions
      WHERE (@month IS NULL OR strftime('%Y-%m', date) = @month)
      GROUP BY monthYear
      ORDER BY monthYear DESC
    `),
        getCategoryTotals: d.prepare(`
      SELECT
        category, type,
        SUM(amount) AS total,
        COUNT(*)    AS count
      FROM transactions
      WHERE strftime('%Y-%m', date) = @month
      GROUP BY category, type
      ORDER BY total DESC
    `),
        getRunningBalance: d.prepare(`
      SELECT
        date, amount, type, category, description,
        SUM(CASE WHEN type='income' THEN amount ELSE -amount END)
          OVER (ORDER BY date, id) AS balance
      FROM transactions
      WHERE (@month IS NULL OR strftime('%Y-%m', date) = @month)
      ORDER BY date, id
    `),
        upsertBudget: d.prepare(`
      INSERT INTO budgets (category, month_year, limit_amount)
      VALUES (@category, @monthYear, @limit)
      ON CONFLICT (category, month_year) DO UPDATE SET limit_amount = @limit
    `),
        getBudgets: d.prepare(`
      SELECT id, category, month_year AS monthYear, limit_amount AS 'limit', created_at AS createdAt
      FROM budgets
      WHERE month_year = @monthYear
    `),
        getAllTransactions: d.prepare(`SELECT * FROM transactions ORDER BY date DESC, id DESC`),
    };
}

let stmts: ReturnType<typeof buildStatements> | null = null;

function initDb(): void {
    if (db) return;
    const dbPath = path.resolve(process.env.DB_PATH || './data/budget.db');
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');

    db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      amount      REAL NOT NULL CHECK (amount > 0),
      category    TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      date        TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_txn_date     ON transactions (date DESC);
    CREATE INDEX IF NOT EXISTS idx_txn_type     ON transactions (type);
    CREATE INDEX IF NOT EXISTS idx_txn_category ON transactions (category);

    CREATE TABLE IF NOT EXISTS budgets (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      category     TEXT NOT NULL,
      month_year   TEXT NOT NULL,
      limit_amount REAL NOT NULL CHECK (limit_amount > 0),
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (category, month_year)
    );
  `);

    stmts = buildStatements(db);
}

function S(): ReturnType<typeof buildStatements> {
    if (!stmts) initDb();
    return stmts!;
}

// ── Transaction CRUD ──────────────────────────────────────────────────────

export function addTransaction(
    type: string, amount: number, category: string,
    description: string, date: string
): number {
    const result = S().insertTransaction.run({ type, amount, category, description, date });
    return result.lastInsertRowid as number;
}

export function deleteTransaction(id: number): boolean {
    const result = S().deleteTransaction.run({ id });
    return result.changes > 0;
}

export function getTransactions(opts: {
    type?: string; month?: string; category?: string; limit?: number; offset?: number;
}) {
    return S().getTransactions.all({
        type:     opts.type     ?? null,
        month:    opts.month    ?? null,
        category: opts.category ?? null,
        limit:    opts.limit    ?? 50,
        offset:   opts.offset   ?? 0,
    });
}

export function getAllTransactions() {
    return S().getAllTransactions.all();
}

// ── Summary queries ───────────────────────────────────────────────────────

export function getMonthlySummary(month: string | null) {
    return S().getMonthlySummary.all({ month }) as {
        monthYear: string; totalIncome: number; totalExpense: number;
    }[];
}

export function getCategoryTotals(month: string) {
    return S().getCategoryTotals.all({ month }) as {
        category: string; type: string; total: number; count: number;
    }[];
}

export function getRunningBalance(month: string | null) {
    return S().getRunningBalance.all({ month }) as {
        date: string; amount: number; type: string;
        category: string; description: string; balance: number;
    }[];
}

// ── Budget CRUD ───────────────────────────────────────────────────────────

export function upsertBudget(category: string, monthYear: string, limit: number): void {
    S().upsertBudget.run({ category, monthYear, limit });
}

export function getBudgets(monthYear: string) {
    return S().getBudgets.all({ monthYear }) as {
        id: number; category: string; monthYear: string; limit: number; createdAt: string;
    }[];
}

export function closeDb(): void {
    if (db) { db.close(); db = null; stmts = null; }
}