
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
