import multer, { FileFilterCallback } from "multer";
import path from "path";
import crypto from "crypto";
import { Request } from "express";

/* ── Allowed MIME types ──────────────────────────────────────────────
   We whitelist allowed types explicitly rather than blacklisting.
   Blacklisting is fragile — there are always new types to block.
   Whitelisting means unknown types are rejected by default.
────────────────────────────────────────────────────────────────────── */
const AVATAR_TYPES    = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const DOCUMENT_TYPES  = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const AVATAR_MAX   = Number(process.env.AVATAR_MAX_SIZE)   || 2 * 1024 * 1024; /* 2MB */
const DOCUMENT_MAX = Number(process.env.DOCUMENT_MAX_SIZE) || 5 * 1024 * 1024; /* 5MB */
const MAX_FILES    = Number(process.env.MAX_FILES)          || 5;

/* ── Generate unique filename ────────────────────────────────────────
   Why not keep the original filename?
   1. Two users might upload "photo.jpg" — one would overwrite the other
   2. Filenames can contain path traversal attacks: "../../etc/passwd"
   3. Special characters in filenames cause issues on some OSes

   We generate: <timestamp>-<8 random hex chars><extension>
   Example: 1714000000000-a3f8b2c1.jpg
────────────────────────────────────────────────────────────────────── */
function generateFilename(originalname: string): string {
    const ext      = path.extname(originalname).toLowerCase();
    const random   = crypto.randomBytes(4).toString("hex");
    return `${Date.now()}-${random}${ext}`;
}

/* ── Avatar storage — saves to uploads/avatars/ ── */
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.AVATAR_DIR || "./uploads/avatars");
    },
    filename: (req, file, cb) => {
        cb(null, generateFilename(file.originalname));
    },
});

/* ── Document storage — saves to uploads/documents/ ── */
const documentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.DOCUMENT_DIR || "./uploads/documents");
    },
    filename: (req, file, cb) => {
        cb(null, generateFilename(file.originalname));
    },
});

/* ── File filter factory ─────────────────────────────────────────────
   Multer calls this function for each file.
   Call cb(null, true)  → accept the file
   Call cb(null, false) → silently reject (Multer ignores it)
   Call cb(error)       → reject with an error

   We pass an error so the client gets a meaningful 400 message.
   The error is caught in our route handler.
────────────────────────────────────────────────────────────────────── */
function makeFileFilter(allowed: string[]) {
    return (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(
                `File type "${file.mimetype}" is not allowed. Allowed: ${allowed.join(", ")}`
            ));
        }
    };
}

/* ── Exported multer instances ── */
export const avatarUpload = multer({
    storage:    avatarStorage,
    limits:     { fileSize: AVATAR_MAX },
    fileFilter: makeFileFilter(AVATAR_TYPES),
});

export const documentUpload = multer({
    storage:    documentStorage,
    limits:     { fileSize: DOCUMENT_MAX, files: MAX_FILES },
    fileFilter: makeFileFilter(DOCUMENT_TYPES),
});

/* ── Allowed type info (for API docs) ── */
export const uploadInfo = {
    avatar:   { allowedTypes: AVATAR_TYPES,   maxSize: AVATAR_MAX,   maxFiles: 1 },
    document: { allowedTypes: DOCUMENT_TYPES, maxSize: DOCUMENT_MAX, maxFiles: MAX_FILES },
};