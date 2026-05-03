// Multer configuration.
//
// What Multer does:
//   Multer is an Express middleware that parses multipart/form-data requests
//   (the encoding used for file uploads). It reads the file stream from the
//   request, writes the bytes to disk (or memory), and populates req.file
//   (single upload) or req.files (multiple uploads) with metadata.
//
// Storage strategy — DiskStorage vs MemoryStorage:
//   - MemoryStorage keeps the file as a Buffer in RAM — fast but dangerous for
//     large files (exhausts memory) and you must write to disk yourself.
//   - DiskStorage writes directly to disk — safer for large files; Multer
//     handles the stream. We use DiskStorage here.
//
// Filename hashing:
//   We generate a content-addressed filename using crypto.randomBytes(16) as
//   a unique prefix + the original extension. This achieves three things:
//     1. Prevents filename collisions (two uploads of "photo.jpg" don't clash)
//     2. Prevents path traversal attacks (e.g. "../../etc/passwd" as filename)
//     3. Avoids exposing the original filename in the URL
//
// File filter:
//   Multer's fileFilter callback runs BEFORE the file is written to disk.
//   If we call cb(null, false) the file is rejected and nothing is stored.
//   We check the MIME type against the ALLOWED_MIME_TYPES env list here.
//   Note: MIME type from the client can be spoofed — for production, also
//   check the file's magic bytes (first few bytes) with a library like `file-type`.

import multer, { StorageEngine, FileFilterCallback } from "multer";
import path from "path";
import crypto from "crypto";
import { Request } from "express";

const UPLOAD_DIR      = process.env.UPLOAD_DIR           || "uploads";
const MAX_SIZE        = Number(process.env.MAX_FILE_SIZE_BYTES)     || 10 * 1024 * 1024;
const MAX_FILES       = Number(process.env.MAX_FILES_PER_REQUEST)   || 10;
const ALLOWED_TYPES   = (process.env.ALLOWED_MIME_TYPES  || "image/jpeg,image/png,application/pdf")
    .split(",").map((t) => t.trim().toLowerCase());

// ── Storage ───────────────────────────────────────────────────────────────────

const storage: StorageEngine = multer.diskStorage({
    destination(_req, _file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename(_req, file, cb) {
        // e.g. "a3f9bc1200e4f812.jpg" — random hex prefix + sanitised extension
        const ext    = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, "");
        const prefix = crypto.randomBytes(8).toString("hex");
        cb(null, `${prefix}${ext}`);
    },
});

// ── File filter ───────────────────────────────────────────────────────────────

function fileFilter(
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
): void {
    const mime = file.mimetype.toLowerCase();
    if (ALLOWED_TYPES.includes(mime)) {
        cb(null, true);
    } else {
        // Passing an Error as first arg triggers Multer's error handler
        cb(new Error(`File type "${mime}" is not allowed. Allowed types: ${ALLOWED_TYPES.join(", ")}`));
    }
}

// ── Multer instances ──────────────────────────────────────────────────────────

const baseConfig = { storage, fileFilter, limits: { fileSize: MAX_SIZE } };

// Single file — field name "file"
export const uploadSingle = multer(baseConfig).single("file");

// Multiple files — field name "files", up to MAX_FILES
export const uploadMultiple = multer(baseConfig).array("files", MAX_FILES);

// ── Multer error handler ──────────────────────────────────────────────────────
// Multer errors bypass Express's normal error handler — we must intercept them
// and convert to our standard ApiResponse shape.

import { Response, NextFunction } from "express";
import { ApiResponse } from "../types";

export function handleMulterError(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (err instanceof multer.MulterError) {
        const msg =
            err.code === "LIMIT_FILE_SIZE"  ? `File too large. Maximum size is ${MAX_SIZE / 1024 / 1024} MB` :
                err.code === "LIMIT_FILE_COUNT" ? `Too many files. Maximum is ${MAX_FILES} per request` :
                    err.code === "LIMIT_UNEXPECTED_FILE" ? `Unexpected field. Use "file" for single uploads, "files" for multiple` :
                        err.message;

        const response: ApiResponse<never> = { success: false, error: msg };
        res.status(400).json(response);
        return;
    }
    if (err?.message?.includes("not allowed")) {
        res.status(400).json({ success: false, error: err.message });
        return;
    }
    next(err);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getAllowedTypes(): string[] { return ALLOWED_TYPES; }
export function getMaxSizeBytes(): number  { return MAX_SIZE; }
export function getMaxFiles(): number      { return MAX_FILES; }