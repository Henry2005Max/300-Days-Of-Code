# Day 108: File Organizer CLI

A CLI tool that scans a directory, categorises files by extension into typed folders (Images, Videos, Audio, Documents, Code, Archives, Data, Fonts, Executables, Misc), previews the plan as a dry-run, executes the move or copy, logs every run to JSON history, and supports undo for the last move operation.

## What's New

First pure-`fs` organisation tool in the challenge. Introduces a flat extension-to-category map for O(1) lookups, conflict resolution strategies (skip/overwrite/rename with auto-numbering), cross-filesystem fallback for `renameSync` (copy+delete when move fails across volumes), and a JSON run history with undo support.

## Features

- Categorises files into 10 folders: Images, Videos, Audio, Documents, Code, Archives, Data, Fonts, Executables, Misc
- `preview` command — dry-run showing every file's destination grouped by category
- `organize` command — executes move or copy, logs the run to JSON history
- `history` command — prints all past runs with file counts and operation types
- `undo` command — reverses the last `move` run by moving files back to their source paths
- Conflict resolution: `skip` (leave existing), `overwrite` (replace), `rename` (auto-append `_1`, `_2`...)
- Skips hidden files (configurable)
- Cross-filesystem move fallback — `renameSync` → `copyFileSync + unlinkSync`
- Run history capped at 50 entries, newest first
- Seed script creates 28 sample files of mixed types for testing
- Zero external dependencies — pure Node.js `fs` and `path`

## Technologies Used

- Node.js + TypeScript
- `fs` — file operations (rename, copy, mkdir, stat, readdir)
- `path` — cross-platform path handling
- `dotenv` — environment configuration
- `tsx` — TypeScript execution

## Folder Structure

```
day-108-file-organizer/
├── data/
│   └── organizer-history.json  # JSON run log (created on first organize)
├── sample-dir/
│   ├── mixed/                  # Source: seeded with 28 sample files
│   └── organized/              # Destination: created by organizer
│       ├── Images/
│       ├── Videos/
│       ├── Audio/
│       ├── Documents/
│       ├── Code/
│       ├── Archives/
│       ├── Data/
│       ├── Fonts/
│       └── Misc/
├── src/
│   ├── config/
│   │   └── categories.ts       # 10 category rules, ext map, config loader
│   ├── display/
│   │   └── printer.ts          # Preview table, summary, history printer
│   ├── history/
│   │   └── history.ts          # JSON run log read/write
│   ├── organizer/
│   │   └── mover.ts            # File move/copy with cross-fs fallback
│   ├── scanner/
│   │   ├── scanner.ts          # Directory scanner, conflict resolver
│   │   └── seed.ts             # Sample file generator
│   ├── types/
│   │   └── index.ts            # Interfaces
│   └── index.ts                # CLI router
├── .env
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd day-108-file-organizer
npm install
```

## How to Run

```bash
# Create 28 sample files for testing
npm run seed

# Preview what will happen (dry-run — no files moved)
npm run preview

# Execute the organization (moves files)
npm run organize

# View run history
npm run history

# Undo the last move run
npm run undo
```

## Testing Step by Step

1. **Install:**
   ```bash
   npm install
   ```

2. **Seed sample files:**
   ```bash
   npm run seed
   ```
   Creates 28 files (images, documents, code, audio, etc.) in `./sample-dir/mixed/`.

3. **Preview the plan:**
   ```bash
   npm run preview
   ```
   Shows all 28 files grouped by their destination category. Nothing is moved.

4. **Run the organizer:**
   ```bash
   npm run organize
   ```
   Moves all files to categorised folders under `./sample-dir/organized/`.

5. **Verify the result:**
   ```bash
   ls ./sample-dir/organized/
   ls ./sample-dir/organized/Images/
   ls ./sample-dir/organized/Code/
   ```

6. **Check history:**
   ```bash
   npm run history
   ```

7. **Undo the move:**
   ```bash
   npm run undo
   ```
   All files are moved back to `./sample-dir/mixed/`.

8. **Test conflict resolution — rename mode (default):**
   - Re-seed: `npm run seed`
   - Organize: `npm run organize`
   - Re-seed again (recreates the same filenames)
   - Organize again — files will be renamed `photo_lagos_beach_1.jpg` etc.

9. **Test copy mode** — change `.env`:
   ```
   OPERATION=copy
   ```
   Source files remain, copies appear in organized folders.

10. **Organise your own directory:**
    ```
    TARGET_DIR=/path/to/your/downloads
    OUTPUT_DIR=/path/to/your/downloads/organized
    ```

## What I Learned

- `fs.renameSync` fails with `EXDEV` when source and destination are on different filesystems (e.g., moving from a USB drive to the main disk) — the correct fallback is `copyFileSync` + `unlinkSync`
- `fs.readdirSync(dir, { withFileTypes: true })` returns `Dirent` objects with `.isFile()` and `.isDirectory()` — more efficient than calling `statSync` per entry just to check type
- Building an extension → folder `Map` at startup makes category lookups O(1) regardless of the number of rules — faster than iterating `CATEGORY_RULES` for each file
- Auto-renaming conflicts with a counter loop (`_1`, `_2`...) needs to check each candidate against the real filesystem, not just increment blindly — another process might have created files in between
- JSON run history with `unshift` (newest first) and a fixed cap (`slice(0, 50)`) is a clean, zero-dependency audit log pattern
- `path.extname(filename)` returns the extension including the dot (`.jpg`) — always `toLowerCase()` it before lookup to handle `.JPG` and `.jpg` as the same

## Challenge Info

| Field    | Detail                                      |
|----------|---------------------------------------------|
| Day      | 108                                         |
| Sprint   | 4 — Data Engineering & Databases            |
| Date     | 2025-01-22                                  |
| Previous | [Day 107](../day-107-weather-alert)         |
| Next     | [Day 109](../day-109-api-limiter)           |

Part of my 300 Days of Code Challenge!
