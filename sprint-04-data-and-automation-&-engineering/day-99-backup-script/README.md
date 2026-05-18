# Day 99: Backup Script with Node.js fs

An automated file backup tool built entirely with Node.js built-in modules — no third-party archiver dependencies. Copies configured source directories into timestamped `.tar.gz` archives using native `zlib` and a hand-built TAR serializer, tracks every backup run in a structured JSON log, supports restore from any logged backup ID, and prunes old backups automatically.

## What's New

First pure-`fs` project in the challenge. Introduces manual TAR archive construction using Node.js `Buffer`, gzip compression via `zlib.gzipSync`, recursive directory walking with `fs.readdirSync`, and a JSON-based backup history log — all without any external archiving library. Four CLI commands: `backup`, `restore`, `list`, `clean`.

## Features

- Backs up multiple source directories in a single run
- Creates `.tar.gz` archive per source using native `zlib` gzip compression
- Hand-built TAR serializer — header blocks, checksum, data padding, end-of-archive marker
- Timestamped backup ID per run — `backup-2025-01-13T08-30-00`
- JSON backup log tracking: ID, timestamp, source paths, file count, raw size, compressed size, duration
- Restore any backup by ID — extracts archives to `./backups/restored/<id>/`
- Auto-prune — removes oldest backup directories when `MAX_BACKUPS` limit is exceeded
- Compression ratio reported after each backup run
- `list` command shows full backup history with status badges
- `clean` command wipes all backup directories and the log file
- No database required — everything is file-based

## Technologies Used

- Node.js + TypeScript
- `fs` — file read/write, recursive directory walk, directory creation
- `zlib` — gzip compression and decompression (native Node.js)
- `path` — cross-platform path resolution
- `dotenv` — environment configuration
- `tsx` — TypeScript execution

## Folder Structure

```
day-099-backup-script/
├── backups/                        # Generated backup archives (git-ignored)
│   ├── backup-log.json             # Backup history log
│   └── backup-YYYY-MM-DDTHH-MM-SS/
│       ├── project-a.tar.gz
│       └── project-b.tar.gz
├── sample-data/                    # Test source directories
│   ├── project-a/
│   │   ├── src/index.ts
│   │   ├── src/utils.ts
│   │   └── package.json
│   └── project-b/
│       ├── assets/logo.txt
│       ├── assets/config.json
│       └── README.md
├── src/
│   ├── config/
│   │   └── config.ts               # .env loader
│   ├── display/
│   │   └── printer.ts              # Backup result and list formatter
│   ├── services/
│   │   ├── archiver.ts             # TAR builder, gzip compress/decompress
│   │   ├── backup.ts               # Backup runner — orchestrates archive + log
│   │   ├── logger.ts               # JSON log read/write/prune
│   │   └── restore.ts             # Restore runner — extracts archives by ID
│   ├── types/
│   │   └── index.ts                # Interfaces
│   └── index.ts                    # CLI router: backup | restore | list | clean
├── .env
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd day-099-backup-script
npm install
```

## How to Run

```bash
# Run a full backup of all configured sources
npm run backup

# List all backups in the log
npm run list

# Restore a specific backup (set RESTORE_ID in .env first)
npm run restore

# Remove all backup archives and the log
npm run clean
```

## Testing Step by Step

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run your first backup** (uses `./sample-data/` by default):
   ```bash
   npm run backup
   ```
   You should see archive creation logs and a summary table with file count, raw size, and compressed size.

3. **List backups:**
   ```bash
   npm run list
   ```
   Copy the backup ID shown (e.g. `backup-2025-01-13T08-30-00`).

4. **Restore a backup:**
    - Open `.env` and set `RESTORE_ID=backup-2025-01-13T08-30-00`
    - Run:
   ```bash
   npm run restore
   ```
   Restored files appear under `./backups/restored/<id>/`.

5. **Verify restored files:**
   ```bash
   ls ./backups/restored/
   ```

6. **Run backup again** to test auto-pruning — after 5 runs the oldest is removed automatically (configurable via `MAX_BACKUPS` in `.env`).

7. **Back up your own directories** — update `.env`:
   ```
   BACKUP_SOURCES=/path/to/your/project,/another/path
   ```

8. **Change max backups retained:**
   ```
   MAX_BACKUPS=10
   ```

9. **Clean everything** and start fresh:
   ```bash
   npm run clean
   ```

10. **Inspect the raw log:**
    ```bash
    cat ./backups/backup-log.json
    ```

## What I Learned

- TAR format uses 512-byte fixed-size header blocks — file name, size (octal), mod time, type flag, and a checksum computed as the sum of all header bytes
- TAR file data must be padded to the nearest 512-byte boundary after each file block — `512 - (size % 512)` gives the padding needed, with a special case when `size % 512 === 0`
- `zlib.gzipSync(buffer, { level: 6 })` compresses a `Buffer` synchronously — no streams needed for moderate-size backups
- `zlib.gunzipSync(buffer)` decompresses back to the original tar buffer for extraction — the entire round-trip is synchronous and in-memory
- `fs.readdirSync(dir, { withFileTypes: true })` returns `Dirent` objects with `.isDirectory()` — cleaner than calling `fs.statSync` separately for every entry
- TAR checksums are computed with the checksum field treated as 8 ASCII spaces (0x20), not zeros — getting this wrong causes some tar implementations to reject the archive
- `fs.rmSync(dir, { recursive: true, force: true })` is the Node.js 14.14+ way to do `rm -rf` — no need for a recursive delete implementation
- Storing backup metadata in a JSON log file instead of a database keeps the tool fully self-contained and portable

## Challenge Info

| Field    | Detail                                      |
|----------|---------------------------------------------|
| Day      | 99                                          |
| Sprint   | 4 — Data Engineering & Databases            |
| Date     | 2025-01-13                                  |
| Previous | [Day 98](../day-098-sentiment-analyzer)     |
| Next     | [Day 100](../day-100-review)                |

Part of my 300 Days of Code Challenge!
