
## Day 86 - May 03

**Project:** File Upload API with Multer
**Time Spent:** 3 hours

### What I Built

Today I built a file upload API using Multer with single and multi-file support, MIME validation, hashed filenames, SQLite metadata tracking, and file serving with status checks. The most important design decision was using DiskStorage with a custom `filename` callback that generates `{8-byte-hex}{ext}` names — this solves three problems at once: collision prevention (random bytes), path traversal prevention (no user-supplied characters in the path), and URL opacity (the original filename is not exposed in the URL).

The Multer error handling required special attention. `MulterError` instances — thrown for oversized files, too many files, and unexpected field names — do not reach Express's standard `(err, req, res, next)` error handler unless explicitly forwarded. The pattern I used wraps the Multer call in a callback: `uploadSingle(req, res, (err) => { if (err) return handleMulterError(err, req, res, next); next(); })`. This intercepts Multer errors before they bypass the normal stack.

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
