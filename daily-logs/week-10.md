## Day 64 - April 11

**Project:** SQLite with better-sqlite3 — Persistent Student Records API
**Time Spent:** 3.5 hours

### What I Built

Rebuilt the Day 63 Student Records API with a real SQLite database replacing the in-memory array. The database file is created automatically at ./data/students.db on first run. runMigrations() creates the students table using CREATE TABLE IF NOT EXISTS — safe to run every startup. seedData() wraps 10 inserts in a db.transaction() and only runs if the table is empty. Route handlers now run SQL queries with named prepared statements. A toStudent() helper converts snake_case database rows to the camelCase API shape, including converting the SQLite INTEGER 0/1 to a real boolean for gdgMember.

### What I Learned

- SQLite creates a single .db file on disk — no database server to install or configure. The file can be opened in DB Browser for SQLite to inspect data visually
- CREATE TABLE IF NOT EXISTS is idempotent — safe to run every time the server starts without risking data loss
- Prepared statements with named parameters (@name, @email) are the only safe way to include user input in SQL — string concatenation opens SQL injection vulnerabilities
- db.transaction() is a function that wraps multiple operations — if any step throws, all previous operations in the transaction are rolled back automatically
- SQLite has no native BOOLEAN type — it uses INTEGER 0 and 1. This requires explicit conversion both on write (boolean → 0/1) and read (0/1 → boolean)
- better-sqlite3 is synchronous unlike most Node.js database libraries — no async/await needed for queries, which simplifies the code significantly
- result.lastInsertRowid after an INSERT gives the auto-generated primary key of the new row
- Catching err.code === “SQLITE_CONSTRAINT_UNIQUE” lets you handle duplicate key violations cleanly without exposing a raw 500 error to the client

### Resources Used

- https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md
- https://www.sqlite.org/datatype3.html
- https://www.sqlite.org/lang_createtable.html
- https://www.sqlite.org/wal.html

### Tomorrow

Day 65 — JWT Authentication. Adding login, register, and protected routes using JSON Web Tokens.
