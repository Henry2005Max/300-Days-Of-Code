import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.DB_FILE || "./data/quotes.db";
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

export const db = new Database(DB_PATH, {
    verbose: process.env.NODE_ENV === "development"
        ? (sql: string) => console.log(`\x1b[36m[SQL]\x1b[0m ${sql}`)
        : undefined,
});

db.pragma("journal_mode = WAL");

export function runMigrations(): void {
    /* ── quotes table ── */
    db.exec(`
    CREATE TABLE IF NOT EXISTS quotes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      text       TEXT    NOT NULL,
      author     TEXT    NOT NULL,
      category   TEXT    NOT NULL,
      source     TEXT,
      view_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

    /* ── FTS5 virtual table ──────────────────────────────────────────────
       FTS5 (Full-Text Search version 5) creates an inverted index over
       the text and author columns of the quotes table.

       content='quotes' means it's a "content table" — it doesn't store
       copies of the text, it points back to the quotes table.
       content_rowid='id' maps FTS rowids to quote IDs.

       After inserting a quote, we must also insert into quotes_fts so
       the search index stays in sync with the main table.
    ────────────────────────────────────────────────────────────────────── */
    db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS quotes_fts
    USING fts5(text, author, content='quotes', content_rowid='id');
  `);

    /* ── Triggers to keep FTS index in sync ─────────────────────────────
       Whenever a quote is inserted, updated, or deleted in the main
       table, these triggers automatically update the FTS index.
       Without triggers you'd have to manually sync after every change.
    ────────────────────────────────────────────────────────────────────── */
    db.exec(`
    CREATE TRIGGER IF NOT EXISTS quotes_ai
    AFTER INSERT ON quotes BEGIN
      INSERT INTO quotes_fts(rowid, text, author)
      VALUES (new.id, new.text, new.author);
    END;
  `);

    db.exec(`
    CREATE TRIGGER IF NOT EXISTS quotes_ad
    AFTER DELETE ON quotes BEGIN
      INSERT INTO quotes_fts(quotes_fts, rowid, text, author)
      VALUES ('delete', old.id, old.text, old.author);
    END;
  `);

    db.exec(`
    CREATE TRIGGER IF NOT EXISTS quotes_au
    AFTER UPDATE ON quotes BEGIN
      INSERT INTO quotes_fts(quotes_fts, rowid, text, author)
      VALUES ('delete', old.id, old.text, old.author);
      INSERT INTO quotes_fts(rowid, text, author)
      VALUES (new.id, new.text, new.author);
    END;
  `);

    /* ── favourites table ────────────────────────────────────────────────
       Keyed by IP address — a simple proxy for "user".
       In a real app this would use a user_id from the auth system.
    ────────────────────────────────────────────────────────────────────── */
    db.exec(`
    CREATE TABLE IF NOT EXISTS favourites (
      ip         TEXT    NOT NULL,
      quote_id   INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (ip, quote_id)
    );
  `);

    console.log("[DB] Migrations complete");
}

/* ── 60 seeded quotes across 5 categories ── */
const QUOTES = [
    /* Nigerian proverbs */
    { text: "Until the lion learns to write, every story will glorify the hunter.", author: "African Proverb", category: "nigerian-proverbs", source: "Igbo tradition" },
    { text: "Rain does not fall on one roof alone.", author: "African Proverb", category: "nigerian-proverbs" },
    { text: "However long the night, the dawn will break.", author: "African Proverb", category: "nigerian-proverbs" },
    { text: "A child who is not embraced by the village will burn it down to feel its warmth.", author: "African Proverb", category: "nigerian-proverbs" },
    { text: "When the music changes, so does the dance.", author: "Hausa Proverb", category: "nigerian-proverbs" },
    { text: "Knowledge is like a garden: if it is not cultivated, it cannot be harvested.", author: "Fulani Proverb", category: "nigerian-proverbs" },
    { text: "The axe forgets, but the tree remembers.", author: "Yoruba Proverb", category: "nigerian-proverbs" },
    { text: "Speak softly and carry a big stick; you will go far.", author: "West African Proverb", category: "nigerian-proverbs" },
    { text: "If you want to go fast, go alone. If you want to go far, go together.", author: "African Proverb", category: "nigerian-proverbs" },
    { text: "A tree is straightened while it is young.", author: "Igbo Proverb", category: "nigerian-proverbs" },
    { text: "No matter how long a log floats in the river, it will never become a crocodile.", author: "Yoruba Proverb", category: "nigerian-proverbs" },
    { text: "The forest would be silent if no bird sang except the one that sang best.", author: "Ijaw Proverb", category: "nigerian-proverbs" },

    /* Tech */
    { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler", category: "tech" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson", category: "tech" },
    { text: "Premature optimization is the root of all evil.", author: "Donald Knuth", category: "tech" },
    { text: "Make it work, make it right, make it fast.", author: "Kent Beck", category: "tech" },
    { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House", category: "tech" },
    { text: "The best code is no code at all.", author: "Jeff Atwood", category: "tech" },
    { text: "Programming is the art of telling another human being what one wants the computer to do.", author: "Donald Knuth", category: "tech" },
    { text: "Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live.", author: "John Woods", category: "tech" },
    { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman", category: "tech" },
    { text: "Software is eating the world.", author: "Marc Andreessen", category: "tech" },
    { text: "Move fast and break things. Unless you are breaking stuff, you are not moving fast enough.", author: "Mark Zuckerberg", category: "tech" },
    { text: "The most disastrous thing that you can ever learn is your first programming language.", author: "Alan Kay", category: "tech" },

    /* Motivation */
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "motivation" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "motivation" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "motivation" },
    { text: "Believe you can and you are halfway there.", author: "Theodore Roosevelt", category: "motivation" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "motivation" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs", category: "motivation" },
    { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein", category: "motivation" },
    { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison", category: "motivation" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "motivation" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "motivation" },
    { text: "Opportunities don't happen. You create them.", author: "Chris Grosser", category: "motivation" },
    { text: "Try not to become a man of success, but rather try to become a man of value.", author: "Albert Einstein", category: "motivation" },

    /* Philosophy */
    { text: "The unexamined life is not worth living.", author: "Socrates", category: "philosophy" },
    { text: "I think, therefore I am.", author: "René Descartes", category: "philosophy" },
    { text: "Man is condemned to be free.", author: "Jean-Paul Sartre", category: "philosophy" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle", category: "philosophy" },
    { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates", category: "philosophy" },
    { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "philosophy" },
    { text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", author: "Ralph Waldo Emerson", category: "philosophy" },
    { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche", category: "philosophy" },
    { text: "That which does not kill us makes us stronger.", author: "Friedrich Nietzsche", category: "philosophy" },
    { text: "The measure of intelligence is the ability to change.", author: "Albert Einstein", category: "philosophy" },
    { text: "Life must be understood backwards; but it must be lived forwards.", author: "Søren Kierkegaard", category: "philosophy" },
    { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius", category: "philosophy" },

    /* Leadership */
    { text: "A leader is one who knows the way, goes the way, and shows the way.", author: "John C. Maxwell", category: "leadership" },
    { text: "The greatest leader is not necessarily the one who does the greatest things. He is the one that gets the people to do the greatest things.", author: "Ronald Reagan", category: "leadership" },
    { text: "Leadership is not about being in charge. It is about taking care of those in your charge.", author: "Simon Sinek", category: "leadership" },
    { text: "Before you are a leader, success is all about growing yourself. When you become a leader, success is all about growing others.", author: "Jack Welch", category: "leadership" },
    { text: "The function of leadership is to produce more leaders, not more followers.", author: "Ralph Nader", category: "leadership" },
    { text: "Do not follow where the path may lead. Go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson", category: "leadership" },
    { text: "Management is doing things right; leadership is doing the right things.", author: "Peter Drucker", category: "leadership" },
    { text: "The key to successful leadership today is influence, not authority.", author: "Kenneth Blanchard", category: "leadership" },
    { text: "A good leader takes a little more than his share of the blame, a little less than his share of the credit.", author: "Arnold H. Glasow", category: "leadership" },
    { text: "People ask the difference between a leader and a boss. The leader leads, and the boss drives.", author: "Theodore Roosevelt", category: "leadership" },
    { text: "Leadership is the capacity to translate vision into reality.", author: "Warren Bennis", category: "leadership" },
    { text: "You don't have to hold a position in order to be a leader.", author: "Henry Ford", category: "leadership" },
];

export function seedQuotes(): void {
    const count = (db.prepare("SELECT COUNT(*) as c FROM quotes").get() as any).c;
    if (count > 0) {
        console.log(`[DB] Seed skipped — ${count} quotes already present`);
        return;
    }

    const insert = db.prepare(`
    INSERT INTO quotes (text, author, category, source)
    VALUES (@text, @author, @category, @source)
  `);

    const seedAll = db.transaction((quotes: typeof QUOTES) => {
        for (const q of quotes) insert.run({ text: q.text, author: q.author, category: q.category, source: (q as any).source ?? null });
    });

    seedAll(QUOTES);
    console.log(`[DB] Seeded ${QUOTES.length} quotes across 5 categories`);
}