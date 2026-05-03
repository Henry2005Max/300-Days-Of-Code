# Day 86: File Upload with Multer

## Description

A REST API for uploading, serving, and managing files. Supports single and multiple file uploads via multipart/form-data, validates MIME type and file size before writing to disk, generates random hashed filenames to prevent collisions and path traversal attacks, records full metadata in SQLite, serves files back through a route that checks active status before sending bytes, and soft-deletes (removes physical file, marks DB row deleted).

## What's New

Day 86 introduces Multer — the standard Express middleware for handling multipart/form-data. New concepts: DiskStorage vs MemoryStorage trade-offs, the `fileFilter` callback for pre-write MIME validation, Multer's separate error class (`MulterError`) that must be caught before Express's error handler, hashed filenames for security, category derivation from MIME type, and soft-delete patterns for file records. The static serve route also demonstrates checking DB status before streaming bytes, preventing serving of deleted files.

## Features

- Single upload: POST /files/upload (field name: `file`)
- Multiple upload: POST /files/upload-many (field name: `files`, up to 10)
- MIME type whitelist enforced in Multer's fileFilter (before file touches disk)
- Max file size configurable via env (default 10 MB)
- Hashed filenames: `{8-byte-hex}{ext}` — no collisions, no path traversal
- SQLite metadata: original name, stored name, MIME, size, category, uploader, URL
- Category auto-derived from MIME type (image / document / text / video / other)
- GET /files/:filename — serves file bytes with correct Content-Type, checks DB first
- Soft-delete: physical file removed from disk, DB row marked deleted
- List with filters: uploader, category, mime_type
- Stats: total count/size, breakdown by category and MIME type, 5 most recent uploads
- GET /files/info — shows allowed types and limits before attempting upload

## Technologies Used

- Node.js + TypeScript
- Express 4
- Multer 1
- better-sqlite3
- Zod
- dotenv
- tsx (dev runner)

## Folder Structure

```
sprint-03-backend/day-086-file-upload/
├── src/
│   ├── db/
│   │   ├── database.ts       # Migrations + upload dir creation
│   │   └── statements.ts     # Lazy prepared statements
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   ├── logger.ts
│   │   └── upload.ts         # Multer config, fileFilter, MulterError handler
│   ├── routes/
│   │   └── files.ts
│   ├── services/
│   │   └── file.service.ts   # Persist, list, delete, stats
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── uploads/                  # Created automatically on first run
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
mkdir day-086-file-upload
cd day-086-file-upload
mkdir -p src/routes src/middleware src/db src/types src/services
```

Copy all files into the structure above, then:

```bash
npm install
```

## How to Run

```bash
npm run dev
```

The `uploads/` directory is created automatically on first run.

## Testing Step by Step

### Step 1: Confirm the server is running

```bash
curl http://localhost:3000/health
```

### Step 2: Check what the server accepts

```bash
curl http://localhost:3000/files/info
```

### Step 3: Upload a single image

Create a small test image first (or use any JPG/PNG you have):

```bash
curl -X POST http://localhost:3000/files/upload \
  -F "file=@/path/to/your/image.jpg" \
  -G -d "uploader=chidi_lagos"
```

Expected response includes `id`, `stored_name`, `download_url`, `category: "image"`.

### Step 4: Upload a PDF

```bash
curl -X POST http://localhost:3000/files/upload \
  -F "file=@/path/to/document.pdf" \
  -G -d "uploader=amaka"
```

### Step 5: Upload multiple files at once

```bash
curl -X POST http://localhost:3000/files/upload-many \
  -F "files=@/path/to/file1.jpg" \
  -F "files=@/path/to/file2.png" \
  -G -d "uploader=tunde"
```

### Step 6: List all uploaded files

```bash
curl http://localhost:3000/files
```

### Step 7: Filter by category

```bash
curl "http://localhost:3000/files?category=image"
curl "http://localhost:3000/files?category=document"
```

### Step 8: Filter by uploader

```bash
curl "http://localhost:3000/files?uploader=chidi_lagos"
```

### Step 9: Get metadata for a specific file

```bash
curl http://localhost:3000/files/1
```

### Step 10: Serve the file (open in browser or use curl)

Copy the `download_url` from any response and open it, or:

```bash
curl http://localhost:3000/files/PASTE_STORED_NAME_HERE --output downloaded.jpg
```

### Step 11: View upload statistics

```bash
curl http://localhost:3000/files/stats
```

Expected — total count, total MB, breakdown by category and MIME type, 5 most recent uploads.

### Step 12: Delete a file

```bash
curl -X DELETE "http://localhost:3000/files/1?uploader=chidi_lagos"
```

The physical file is removed from disk. Attempting to serve it again returns 404.

### Step 13: Test MIME type rejection

```bash
# Create a fake executable and try to upload it
echo "#!/bin/bash" > test.sh
curl -X POST http://localhost:3000/files/upload \
  -F "file=@test.sh"
```

Expected 400: `File type "application/x-sh" is not allowed.`

### Step 14: Test file size rejection

Set `MAX_FILE_SIZE_BYTES=1000` in `.env`, restart, then try uploading a large file. Expected 400: `File too large.`

## What I Learned

- Multer's `fileFilter` runs before the file is written to disk — returning `cb(null, false)` or `cb(new Error(...))` rejects the file cleanly without touching the filesystem
- `MulterError` is a separate class from `Error` and must be caught separately — it does not flow through Express's normal `(err, req, res, next)` error handler unless you explicitly forward it
- DiskStorage's `filename` callback is where you generate safe filenames — using `crypto.randomBytes` instead of the original name prevents both collisions and path traversal attacks like `../../etc/passwd`
- `path.basename(filename)` strips any directory components from a user-supplied filename — a one-liner that neutralises path traversal before you even check if the file exists
- Soft-delete (mark deleted in DB, remove physical file) gives you an audit trail of what was uploaded and when it was removed, which is impossible with hard-delete
- Category derivation from MIME type (instead of trusting client input) ensures the `category` field is always consistent and meaningful without any user-supplied data

## Challenge Info

| Field    | Value |
|----------|-------|
| Day      | 86 |
| Sprint   | 3 — Node.js Back-End Servers |
| Date     | May 03, 2026 |
| Previous | [Day 85 — User Registration with bcrypt](../day-085-user-registration/) |
| Next     | [Day 87 — Notification Service (Advanced)](../day-087-notifications/) |

Part of my 300 Days of Code Challenge!
