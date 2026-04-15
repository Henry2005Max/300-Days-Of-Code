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

## Day 65 - April 12

**Project:** JWT Authentication
**Time Spent:** 3.5 hours

### What I Built

Added full authentication to the Express + SQLite API. Users register and login via POST routes that return a JWT. Protected routes verify the token using an authenticate middleware that reads the Authorization: Bearer header, calls jwt.verify(), and attaches the decoded payload to req.user. Passwords are hashed with bcrypt at 10 salt rounds before storage — never stored in plain text. A requireRole() middleware factory adds role-based access control. All student routes are protected by applying router.use(authenticate) once at the top of the students router.

### What I Learned

- bcrypt.hash() is a one-way function — you can never reverse it to get the original password. When a user logs in you re-hash their input with the same salt and compare the results
- jwt.sign() base64-encodes the payload — it is NOT encrypted. Anyone can decode the payload without the secret. The secret only proves the token was created by your server. Never put passwords or sensitive data in the JWT payload.
- jwt.verify() throws two specific error types: TokenExpiredError when the token has passed its expiry time, and JsonWebTokenError when the signature is wrong or the token is malformed. Catching them separately gives better error messages to clients.
- Extending Express's Request interface with `declare global { namespace Express { interface Request { user?: JwtPayload } } }` tells TypeScript about req.user so there's no need to cast it in every handler
- Returning the same 401 error for wrong email and wrong password prevents attackers from discovering which email addresses have registered accounts — this is called preventing email enumeration
- router.use(authenticate) applies the middleware to every subsequent route on that router — cleaner and safer than adding the middleware to each route one by one

### Resources Used

- https://jwt.io/introduction
- https://www.npmjs.com/package/jsonwebtoken
- https://www.npmjs.com/package/bcryptjs
- https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

### Tomorrow

Day 66 — Webhook Handler. Building an endpoint that receives and processes incoming webhook events.

## Day 66 - April 13

**Project:** Webhook Handler
**Time Spent:** 3 hours

### What I Built

A webhook receiver that handles incoming POST requests from GitHub and Paystack with HMAC-SHA256 signature verification. The key insight is that webhook routes use express.raw() instead of express.json() to preserve raw body bytes — HMAC verification must run against the exact bytes received from the network, not a re-serialised JSON object. verifyGitHubSignature() and verifyPaystackSignature() each compute the expected HMAC and compare using crypto.timingSafeEqual(). Event routing via switch handles push, pull_request, ping for GitHub and charge.success, charge.failed, transfer.success for Paystack. A /webhooks/test endpoint with no signature check makes Postman testing easy. All received webhooks are logged in memory with source, event type, summary, and full payload.

### What I Learned

- Webhooks are push-based HTTP — instead of polling an API repeatedly, providers POST to your server the moment an event occurs. This is more efficient and real-time.
- HMAC verification requires raw body bytes — if you parse JSON first and re-stringify it, whitespace differences break the hash comparison. express.raw() captures the original network bytes.
- express.raw() must be registered before express.json() for the same path — Express applies middleware in registration order and the first matching middleware wins
- crypto.timingSafeEqual() takes a constant amount of time regardless of where the mismatch occurs — regular string comparison short-circuits at the first differing character, leaking timing info
- Webhook handlers must respond 200 as fast as possible — providers like GitHub retry delivery if they don't receive a response within seconds. Heavy processing should be offloaded to a queue or async function after sending the response
- GitHub signs with prefix "sha256=<hex>" while Paystack sends just "<hex>" — every provider has different header names and signature formats

### Resources Used

- https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
- https://paystack.com/docs/payments/webhooks/
- https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b
- https://expressjs.com/en/4x/api.html#express.raw

### Tomorrow

Day 67 — Ethical Web Scraper using cheerio.

## Day 67 - April 14

**Project:** Ethical Web Scraper

### What I Built

A web scraping API with Express, Axios, and Cheerio. Two scrapers: Hacker News front page (extracts rank, title, URL, points, author, comments from tr.athing rows) and quotes.toscrape.com (extracts quote text, author, tags from div.quote elements with pagination). Three ethical practices built in: robots.txt parser that checks Disallow rules before scraping, per-domain rate limiter using a Map to track last request time per hostname, and in-memory TTL cache that returns stored results without hitting the network if still fresh. A utility endpoint checks any URL against its robots.txt.

### What I Learned

- Cheerio loads HTML and gives a jQuery-like $() API — CSS selectors, .text(), .attr(), .each(), .find(), .next() all work the same as in browser jQuery. It only parses static HTML and cannot run JavaScript.
- The .next() method on a Cheerio element gets the immediately following sibling — used here to get the subtext row (points, author, comments) that follows each Hacker News story row
- robots.txt must be fetched and parsed manually in Node.js — there is no automatic enforcement. The format uses User-agent and Disallow lines. We look for User-agent: * blocks and check if our path starts with any disallowed path.
- Per-domain rate limiting is more polite than global limiting — each domain gets its own timer so one slow site doesn’t block requests to a different fast site
- An in-memory Map with timestamps is sufficient for simple TTL caching — check if the entry exists and if Date.now() is still before expiresAt
- Cheerio Unicode curly quotes (\u201c and \u201d) appear in quote text and must be stripped manually since the site uses them as decorative opening/closing marks

### Resources Used

- https://cheerio.js.org/docs/intro
- https://www.robotstxt.org/robotstxt.html
- https://quotes.toscrape.com
- https://news.ycombinator.com

### Tomorrow

Day 68 — API Proxy. Building a server that forwards requests to external APIs, adding auth headers and caching on the server side.

## Day 68 - April 15

**Project:** API Proxy
**Time Spent:** 3 hours

### What I Built

A proxy server wrapping three public APIs — Open-Meteo for weather, REST Countries for country data, and ExchangeRate for currency rates. All three routes check the cache before hitting upstream, set different TTLs appropriate to how often that data changes (10 min for weather, 24 hours for countries, 1 hour for exchange rates), and transform the raw upstream responses into clean minimal shapes. ProxyResponse<T> wraps every response with source, cached flag, cachedAt timestamp, and expiresInSeconds. A WMO code mapping file converts Open-Meteo's integer weather codes into human-readable descriptions. 502 Bad Gateway is returned on upstream failures rather than leaking raw upstream errors.

### What I Learned

- A proxy server is a middleman — the client calls your server, your server calls the external API, and you control everything in between including keys, caching, and response shape
- 502 Bad Gateway is the correct HTTP status when your server is healthy but an upstream dependency failed — 500 is for when your own code crashes
- Per-route TTL caching is more granular and efficient than a single global TTL — weather data needs refreshing every 10 minutes while country data can be cached for a full day
- Response transformation is one of the most valuable things a proxy can do — external APIs often return massive objects with dozens of fields. Stripping to only what the client needs reduces payload size and simplifies frontend code
- res.redirect() in Express sends a 302 response pointing the client to another URL — useful for default route aliases like /proxy/exchange → /proxy/exchange/USD
- WMO (World Meteorological Organization) codes are the standard integer-based weather condition system. Without a code→description mapping, weather APIs return numbers with no meaning to end users.

### Resources Used

- https://open-meteo.com/en/docs
- https://restcountries.com/#endpoints-name
- https://www.exchangerate-api.com/docs/free
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/502

### Tomorrow

Day 69 — Rate Limiter Middleware. Building a configurable rate limiter from scratch using the sliding window algorithm.
