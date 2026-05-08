
## Day 86 - May 03

**Project:** File Upload API with Multer
**Time Spent:** 3 hours

### What I Built

Today I built a file upload API using Multer with single and multi-file support, MIME validation, hashed filenames, SQLite metadata tracking, and file serving with status checks. The most important design decision was using DiskStorage with a custom `filename` callback that generates `{8-byte-hex}{ext}` names — this solves three problems at once: collision prevention (random bytes), path traversal prevention (no user-supplied characters in the path), and URL opacity (the original filename is not exposed in the URL).

The Multer error handling required special attention. `MulterError` instances, thrown for oversized files, too many files, and unexpected field names — do not reach Express's standard `(err, req, res, next)` error handler unless explicitly forwarded. The pattern I used wraps the Multer call in a callback: `uploadSingle(req, res, (err) => { if (err) return handleMulterError(err, req, res, next); next(); })`. This intercepts Multer errors before they bypass the normal stack.

The file serving route (`GET /files/:filename`) first validates the filename with `path.basename()` to strip directory traversal attempts, then checks the SQLite record to confirm the file is active before calling `res.sendFile()`. This prevents serving soft-deleted files even if the physical file somehow still exists on disk. The `Content-Type` header is set from the stored MIME type (not inferred from the extension) so browsers handle the file correctly.

### What I Learned

- Multer's `fileFilter` callback fires before writing to disk — it is the correct place for MIME type validation, not an after-the-fact check on the written file
- `MulterError` requires its own intercept layer; it will silently swallow or crash if you assume it flows through Express's standard error middleware
- `crypto.randomBytes(8).toString("hex")` produces 16 hex characters — more than enough uniqueness for filenames while keeping URLs readable
- `path.basename(userInput)` is a one-line path traversal fix — it returns only the last component of any path string, so `../../etc/passwd` becomes `passwd`
- Soft-delete is the right pattern for file metadata — you lose the ability to audit uploads if you hard-delete the DB row, and you need the stored_name to clean up the physical file correctly
- Deriving `category` from MIME type (not from user input) keeps the field consistent — "image" always means `image/*`, never whatever string the client felt like sending

### Resources Used

- https://www.npmjs.com/package/multer
- https://github.com/expressjs/multer#readme
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
- https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- https://nodejs.org/api/crypto.html#cryptorandombytessize-callback

### Tomorrow

Day 87 — Advanced Notification Service: build on Day 77's Nodemailer foundation with queued delivery, retry with exponential backoff, notification preferences per user, and a webhook delivery channel alongside email.

## Day 87 - May 04

**Project:** Advanced Notification Service with Queue, Backoff, and Webhooks
**Time Spent:** 4 hours

### What I Built

Today I rebuilt Day 77's synchronous notification service into a proper queued system. The API returns `202 Accepted` immediately after inserting the job into SQLite. A background worker runs on a 5-second cron schedule, picks up due jobs (WHERE status IN ('pending','failed') AND next_attempt_at <= now), marks them processing, delivers them, and updates the status. If delivery fails the job gets status = 'failed' and a `next_attempt_at` timestamp computed as `BASE * 2^attempts` seconds in the future. After five failures the job becomes 'dead' — it stays in the database for inspection and can be manually retried via the API.

The dual-channel design (`email`, `webhook`, `both`) required careful success tracking. For a `both` job, I set two boolean flags (`emailOk`, `webhookOk`) and only mark the job sent if both are true. Each channel logs its attempt independently, so you can see exactly which channel failed at which attempt number without needing to parse error messages. The webhook delivery includes event metadata (event type, job ID, timestamp) and a `User-Agent` header for the receiver to identify the sender.

User preferences are checked at enqueue time, not at delivery. This means the API returns a clear 400 immediately if a user has opted out — no job is created, no worker cycle is wasted. If a preference record exists for the recipient email, the enqueue logic also picks up their preferred channel and webhook URL automatically, so callers don't have to pass those on every request.

### What I Learned

- `202 Accepted` (not 201 Created) is the semantically correct status for queued work — the resource has been accepted for processing but is not yet complete
- Marking jobs as 'processing' before delivery prevents double-delivery when two worker ticks overlap — it acts as a lightweight optimistic lock without needing database transactions or FOR UPDATE
- Exponential backoff grows quickly: with a 30s base, by the 4th failure the wait is 240s (4 minutes) — this is intentional, giving external services time to recover from outages
- Checking opt-outs at enqueue time (rather than silently dropping at delivery) is better UX — the caller gets an error immediately and can decide whether to override or respect the preference
- node-cron's `*/${N} * * * * *` syntax (with the seconds field enabled) allows sub-minute scheduling, which is essential for a 5-second poll interval

### Resources Used

- https://nodemailer.com/about/
- https://webhook.site (for testing outbound webhook delivery)
- https://www.npmjs.com/package/node-cron
- https://aws.amazon.com/sqs/ (design inspiration)
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/202

### Tomorrow

Day 88 — Advanced RSS Parser: build on Day 78's RSS foundation with feed discovery (find RSS URLs from a website URL), full-text content fetching, keyword filtering, and a digest endpoint that aggregates the latest unread items across all subscribed feeds.


## Day 88 - May 5

**Project:** Advanced RSS Parser with Feed Discovery, Keyword Filters, and Digest
**Time Spent:** 3.5 hours

### What I Built

Today I extended Day 78's RSS reader with three new features: feed discovery, keyword filters, and a multi-feed digest endpoint. Feed discovery is the most interesting technically, given any website URL, the service fetches the HTML, uses Cheerio to find `<link rel="alternate" type="application/rss+xml">` tags in the `<head>`, and resolves any relative URLs against the site's origin. If no `<link>` tags are found, it probes 10 common paths using `axios.head()` (HEAD requests don't download bodies, keeping the fallback fast). The result is an array of discovered feed URLs the caller can choose to subscribe to.

Keyword filters are stored per-feed and checked against new items on every refresh — `itemMatchesKeyword` does a simple case-insensitive `includes()` on the concatenated title and description. When a new filter is added, it retroactively scans all existing items in that feed to find historical matches. All matches go into a `filter_matches` junction table using `INSERT OR IGNORE`, making the matching logic idempotent and safe to re-run.

The digest endpoint does a LEFT JOIN across all feeds simultaneously — one query, not N queries. It also enriches each row with the `matched_keywords` list by making one `matchesForItem` call per row (N+1, acceptable for the default limit of 50). The `?matched_only=true` variant uses a separate query that inner-joins on `filter_matches` so only flagged items come back. The `?refresh_stale=true` (default) option triggers concurrent feed refreshes before the query runs, using `Promise.allSettled` so one failing feed doesn't block the rest.

### What I Learned

- `<link rel="alternate" type="application/rss+xml">` in the HTML `<head>` is the standard way websites advertise their RSS feed — Cheerio's DOM traversal finds it reliably without regex
- `axios.head()` for path probing is the right approach — HEAD requests get headers without downloading the response body, making them roughly 10× faster than GET for existence checks
- Retroactive filter matching (scan existing items on filter creation) requires careful idempotent design — `INSERT OR IGNORE` on the `UNIQUE(item_id, filter_id)` constraint makes the scan safe to re-run
- The `filter_matches` table as an append-only junction effectively creates a "event log" of when each keyword was found — the original match timestamp is preserved even if you later remove and re-add the same filter
- A LEFT JOIN with `WHERE read_state IS NULL` across all feeds in one query is more efficient than N separate unread queries — the database can use the `idx_read_subscriber` index for the join and the `idx_items_feed_date` index for ordering

### Resources Used

- https://www.npmjs.com/package/cheerio
- https://www.rssboard.org/rss-specification (RSS spec, `<link rel="alternate">` reference)
- https://www.npmjs.com/package/rss-parser
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/HEAD
- https://www.sqlite.org/lang_insert.html (INSERT OR IGNORE)

### Tomorrow

Day 89 — Map API with Google Maps JS: build an Express backend that serves a single-page HTML app with an embedded Google Maps JavaScript API map showing geocoded Nigerian addresses, route drawing between points, and a marker cluster for Lagos landmarks.


## Day 89 - May 06

**Project:** Google Maps JS Full-Stack App — NaijaMap
**Time Spent:** 4 hours

### What I Built

Today I built a full-stack Express application that serves an interactive Nigerian landmarks map. The backend provides three REST endpoints — landmarks from SQLite, address geocoding with a 24-hour cache, and Directions API with cached polylines. The frontend is a single HTML file rendered server-side with the Google Maps API key injected at request time via `fs.readFileSync` and `String.replace`. This keeps the key out of version control while still making it available to the browser.

The map shows 20 seeded Nigerian landmarks across Lagos, Abuja, Port Harcourt, Kano, and Ibadan with colour-coded vector markers by category. Clicking a marker opens an info window with description text. The sidebar has category filter chips that filter both the list and the map markers in real time by rebuilding the markers array. Address geocoding drops a red arrow pin at the geocoded location, and the directions feature fetches an encoded polyline from Google's Directions API, decodes it in the browser using `google.maps.geometry.encoding.decodePath()`, and draws it as a green polyline on the map.

### What I Learned

- The Google Maps JavaScript API requires `callback=initMap` in the script URL — the function must be assigned to `window.initMap` before the script tag evaluates, not just defined as a regular function
- `&libraries=geometry` must be included in the Maps script URL to access `google.maps.geometry.encoding.decodePath()` — the geometry library is optional and not loaded by default
- Injecting an API key server-side via `fs.readFileSync` + `html.replace("__PLACEHOLDER__", key)` is a clean pattern that keeps secrets out of committed source files while still making them available to the rendered page
- An encoded polyline is a variable-length ASCII string — storing it as TEXT in SQLite and decoding it in the browser avoids the cost of storing and re-fetching all coordinate pairs
- `google.maps.LatLngBounds` + `map.fitBounds()` calculates the correct zoom and centre to show a full route automatically — no manual calculations needed
- `google.maps.SymbolPath.CIRCLE` with `fillColor` creates fully vector markers that scale at any zoom level and require no image files

### Resources Used

- https://developers.google.com/maps/documentation/javascript/overview
- https://developers.google.com/maps/documentation/javascript/reference/geometry
- https://developers.google.com/maps/documentation/directions/get-directions
- https://developers.google.com/maps/documentation/utilities/polylinealgorithm
- https://console.cloud.google.com (API key and quota management)

### Tomorrow

Day 90 — Sprint 3 Review and Deploy: the final day of Sprint 3. Deploy the Node.js User Registration API to production on Railway, add a comprehensive health endpoint with system and environment metadata, and write the Sprint 3 retrospective.

