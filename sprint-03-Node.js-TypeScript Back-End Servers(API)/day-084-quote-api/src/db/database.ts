// Five tables:
//   quotes         — the main quotes table
//   quotes_fts     — FTS5 virtual table mirroring quotes (text + author)
//   tags           — tag dictionary
//   quote_tags     — many-to-many junction
//   favourites     — per-user saved quotes
//
// FTS5 (Full-Text Search version 5) is SQLite's built-in search engine.
// We create a CONTENT table that reads from `quotes` — this means we do
// not store the text twice. SQLite keeps the FTS index in sync via triggers
// that we create manually (SQLite does not auto-sync content FTS tables).
//
// Why FTS5 over LIKE '%query%'?
//   LIKE requires a full table scan — O(n). FTS5 uses an inverted index
//   and returns results in relevance order (rank) — O(log n) for lookups.

import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "quotes.db");
const db      = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

export function runMigrations(): void {
    db.exec(`
    -- Main quotes table
    CREATE TABLE IF NOT EXISTS quotes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      text        TEXT    NOT NULL,
      author      TEXT    NOT NULL,
      origin      TEXT    NOT NULL DEFAULT 'Unknown',
      category    TEXT    NOT NULL DEFAULT 'general',
      view_count  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- FTS5 virtual table — content= tells SQLite to read from quotes
    CREATE VIRTUAL TABLE IF NOT EXISTS quotes_fts
      USING fts5(text, author, content=quotes, content_rowid=id);

    -- Triggers to keep the FTS index in sync with the quotes table
    CREATE TRIGGER IF NOT EXISTS quotes_ai AFTER INSERT ON quotes BEGIN
      INSERT INTO quotes_fts(rowid, text, author) VALUES (new.id, new.text, new.author);
    END;

    CREATE TRIGGER IF NOT EXISTS quotes_ad AFTER DELETE ON quotes BEGIN
      INSERT INTO quotes_fts(quotes_fts, rowid, text, author)
        VALUES ('delete', old.id, old.text, old.author);
    END;

    CREATE TRIGGER IF NOT EXISTS quotes_au AFTER UPDATE ON quotes BEGIN
      INSERT INTO quotes_fts(quotes_fts, rowid, text, author)
        VALUES ('delete', old.id, old.text, old.author);
      INSERT INTO quotes_fts(rowid, text, author) VALUES (new.id, new.text, new.author);
    END;

    -- Tags
    CREATE TABLE IF NOT EXISTS tags (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT    NOT NULL UNIQUE
    );

    -- Many-to-many: quotes ↔ tags
    CREATE TABLE IF NOT EXISTS quote_tags (
      quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
      tag_id   INTEGER NOT NULL REFERENCES tags(id)   ON DELETE CASCADE,
      PRIMARY KEY (quote_id, tag_id)
    );

    CREATE INDEX IF NOT EXISTS idx_quote_tags_tag
      ON quote_tags (tag_id);

    -- Per-user favourites (username = plain string, no auth required)
    CREATE TABLE IF NOT EXISTS favourites (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      username  TEXT    NOT NULL,
      quote_id  INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
      saved_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(username, quote_id)
    );

    CREATE INDEX IF NOT EXISTS idx_favourites_user
      ON favourites (username);
  `);

    seedIfEmpty();
    console.log("[db] Migrations complete. Database ready at:", DB_PATH);
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED_QUOTES = [
    // Nigerian proverbs & figures
    { text: "Until the lion learns to write, every story will glorify the hunter.", author: "Chinua Achebe", origin: "Nigeria", category: "wisdom", tags: ["proverb", "storytelling", "empowerment"] },
    { text: "The wise do not sit and wait for fate. They rise and shape it.", author: "Wole Soyinka", origin: "Nigeria", category: "wisdom", tags: ["action", "wisdom", "motivation"] },
    { text: "A child who is not embraced by the village will burn it down to feel its warmth.", author: "African Proverb", origin: "Pan-African", category: "community", tags: ["proverb", "community", "youth"] },
    { text: "If you want to go fast, go alone. If you want to go far, go together.", author: "African Proverb", origin: "Pan-African", category: "leadership", tags: ["proverb", "teamwork", "leadership"] },
    { text: "Rain does not fall on one roof alone.", author: "African Proverb", origin: "Pan-African", category: "community", tags: ["proverb", "community", "shared struggle"] },
    { text: "The axe forgets, but the tree remembers.", author: "African Proverb", origin: "Pan-African", category: "resilience", tags: ["proverb", "memory", "resilience"] },
    { text: "Education is the most powerful weapon you can use to change the world.", author: "Nelson Mandela", origin: "South Africa", category: "education", tags: ["education", "empowerment", "change"] },
    { text: "I am not a saint, unless you think of a saint as a sinner who keeps on trying.", author: "Nelson Mandela", origin: "South Africa", category: "resilience", tags: ["resilience", "perseverance", "humility"] },
    { text: "There is no passion to be found in settling for a life that is less than the one you are capable of living.", author: "Nelson Mandela", origin: "South Africa", category: "motivation", tags: ["motivation", "ambition", "purpose"] },
    { text: "The function of education is to teach one to think intensively and to think critically.", author: "Kwame Nkrumah", origin: "Ghana", category: "education", tags: ["education", "critical thinking"] },
    { text: "We face neither east nor west; we face forward.", author: "Kwame Nkrumah", origin: "Ghana", category: "leadership", tags: ["leadership", "independence", "Africa"] },
    { text: "Seek ye first the political kingdom and all other things shall be added unto you.", author: "Kwame Nkrumah", origin: "Ghana", category: "politics", tags: ["politics", "leadership", "Africa"] },
    { text: "The most common way people give up their power is by thinking they don't have any.", author: "Alice Walker", origin: "United States", category: "empowerment", tags: ["empowerment", "power", "self-belief"] },
    { text: "I am deliberate and afraid of nothing.", author: "Audre Lorde", origin: "United States", category: "courage", tags: ["courage", "boldness", "identity"] },
    { text: "When I dare to be powerful — to use my strength in the service of my vision — it becomes less important whether I am afraid.", author: "Audre Lorde", origin: "United States", category: "courage", tags: ["courage", "strength", "vision"] },
    { text: "A woman who walks in purpose does not chase people. She attracts them.", author: "African Proverb", origin: "Pan-African", category: "wisdom", tags: ["proverb", "purpose", "women"] },
    { text: "The strength of a nation is derived from the integrity of its homes.", author: "Confucius", origin: "China", category: "leadership", tags: ["integrity", "leadership", "family"] },
    { text: "Knowledge is like a garden: if it is not cultivated, it cannot be harvested.", author: "African Proverb", origin: "Pan-African", category: "education", tags: ["proverb", "education", "growth"] },
    { text: "An elder who does not correct a child is raising a thief.", author: "Yoruba Proverb", origin: "Nigeria", category: "community", tags: ["proverb", "parenting", "responsibility"] },
    { text: "He who learns, teaches.", author: "Ethiopian Proverb", origin: "Ethiopia", category: "education", tags: ["proverb", "education", "mentorship"] },
    { text: "A person is a person through other persons.", author: "Ubuntu Philosophy", origin: "Pan-African", category: "community", tags: ["ubuntu", "community", "humanity"] },
    { text: "Until there is peace, there can be no development.", author: "Ngozi Okonjo-Iweala", origin: "Nigeria", category: "leadership", tags: ["peace", "development", "Nigeria"] },
    { text: "Corruption is a cancer that steals from the poor, eats away at governance and moral fibre.", author: "Joe Biden", origin: "United States", category: "politics", tags: ["corruption", "governance", "politics"] },
    { text: "Every great dream begins with a dreamer.", author: "Harriet Tubman", origin: "United States", category: "motivation", tags: ["dreams", "motivation", "courage"] },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain", origin: "United States", category: "motivation", tags: ["motivation", "action", "productivity"] },
    { text: "Do not go where the path may lead; go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson", origin: "United States", category: "motivation", tags: ["motivation", "innovation", "leadership"] },
    { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein", origin: "Germany", category: "resilience", tags: ["resilience", "opportunity", "problem-solving"] },
    { text: "The best time to plant a tree was twenty years ago. The second best time is now.", author: "Chinese Proverb", origin: "China", category: "wisdom", tags: ["proverb", "action", "timing"] },
    { text: "Smooth seas do not make skillful sailors.", author: "African Proverb", origin: "Pan-African", category: "resilience", tags: ["proverb", "resilience", "challenge"] },
    { text: "A tree is straightened while it is young.", author: "Hausa Proverb", origin: "Nigeria", category: "wisdom", tags: ["proverb", "youth", "discipline"] },
];

function seedIfEmpty(): void {
    const count = (db.prepare("SELECT COUNT(*) as c FROM quotes").get() as { c: number }).c;
    if (count > 0) return;

    const insertQuote = db.prepare(
        "INSERT INTO quotes (text, author, origin, category) VALUES (@text, @author, @origin, @category)"
    );
    const insertTag = db.prepare("INSERT OR IGNORE INTO tags (name) VALUES (@name)");
    const getTag    = db.prepare("SELECT id FROM tags WHERE name = @name");
    const insertQT  = db.prepare("INSERT OR IGNORE INTO quote_tags (quote_id, tag_id) VALUES (@quote_id, @tag_id)");

    const seedAll = db.transaction(() => {
        for (const q of SEED_QUOTES) {
            const result  = insertQuote.run({ text: q.text, author: q.author, origin: q.origin, category: q.category });
            const quoteId = result.lastInsertRowid as number;

            for (const tagName of q.tags) {
                insertTag.run({ name: tagName });
                const tag = getTag.get({ name: tagName }) as { id: number };
                insertQT.run({ quote_id: quoteId, tag_id: tag.id });
            }
        }
    });

    seedAll();
    console.log(`[db] Seeded ${SEED_QUOTES.length} quotes with tags`);
}

export default db;