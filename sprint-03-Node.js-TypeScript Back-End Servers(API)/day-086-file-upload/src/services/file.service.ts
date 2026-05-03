// FileService: persists metadata after Multer writes the file to disk,
// serves files by ID, handles soft-delete (removes physical file, marks DB row),
// and aggregates upload statistics.
//
// Category derivation:
//   Rather than storing a user-supplied category (which can be anything),
//   we derive it deterministically from the MIME type. This keeps the category
//   field clean and consistent without trusting client input.

import fs from "fs";
import path from "path";
import { stmts } from "../db/statements";
import { UploadedFile, MulterFile, UploadStats } from "../types";
import { NotFoundError, ForbiddenError } from "../middleware/errorHandler";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
const BASE_URL   = process.env.BASE_URL   || "http://localhost:3000";

// ── Category derivation ───────────────────────────────────────────────────────

function deriveCategory(mimeType: string): string {
    if (mimeType.startsWith("image/"))       return "image";
    if (mimeType.startsWith("video/"))       return "video";
    if (mimeType.startsWith("audio/"))       return "audio";
    if (mimeType === "application/pdf")      return "document";
    if (mimeType.startsWith("text/"))        return "text";
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "spreadsheet";
    if (mimeType.includes("word") || mimeType.includes("document"))     return "document";
    return "other";
}

// ── Persist after upload ──────────────────────────────────────────────────────

export function persistFile(
    multerFile: MulterFile,
    uploader: string = "anonymous"
): UploadedFile {
    const category     = deriveCategory(multerFile.mimetype);
    const download_url = `${BASE_URL}/files/${multerFile.filename}`;

    const result = stmts.insertFile.run({
        original_name: sanitiseName(multerFile.originalname),
        stored_name:   multerFile.filename,
        mime_type:     multerFile.mimetype,
        size_bytes:    multerFile.size,
        category,
        uploader,
        download_url,
    });

    return stmts.getFileById.get(result.lastInsertRowid) as UploadedFile;
}

export function persistFiles(
    multerFiles: MulterFile[],
    uploader: string = "anonymous"
): UploadedFile[] {
    return multerFiles.map((f) => persistFile(f, uploader));
}

// ── Retrieve ──────────────────────────────────────────────────────────────────

export function getFileRecord(id: number): UploadedFile {
    const file = stmts.getFileById.get(id) as UploadedFile | undefined;
    if (!file || file.status === "deleted") throw new NotFoundError("File", id);
    return file;
}

export function listFiles(opts: {
    uploader?: string;
    category?: string;
    mime_type?: string;
    limit: number;
    offset: number;
}): { rows: UploadedFile[]; total: number } {
    const params = {
        uploader:  opts.uploader  ?? null,
        category:  opts.category  ?? null,
        mime_type: opts.mime_type ?? null,
        limit:     opts.limit,
        offset:    opts.offset,
    };

    const rows  = stmts.listFiles.all(params) as UploadedFile[];
    const total = (stmts.countFiles.get(params) as { count: number }).count;
    return { rows, total };
}

// ── Delete ────────────────────────────────────────────────────────────────────

export function deleteFile(id: number, requestingUploader?: string): UploadedFile {
    const file = getFileRecord(id);

    // If a uploader is specified, only allow them to delete their own files
    if (requestingUploader && file.uploader !== requestingUploader && requestingUploader !== "admin") {
        throw new ForbiddenError("You can only delete your own files");
    }

    // Remove physical file from disk
    const filePath = path.join(UPLOAD_DIR, file.stored_name);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    // Soft-delete in DB
    stmts.softDelete.run(id);

    return { ...file, status: "deleted" };
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export function getStats(): UploadStats {
    const totals = stmts.statsTotals.get() as { total_files: number; total_size_bytes: number };

    return {
        total_files:      totals.total_files,
        total_size_bytes: totals.total_size_bytes,
        total_size_mb:    Math.round((totals.total_size_bytes / 1024 / 1024) * 100) / 100,
        by_category:      stmts.statsByCategory.all() as any[],
        by_mime:          stmts.statsByMime.all()     as any[],
        recent_uploads:   stmts.recentUploads.all()   as UploadedFile[],
    };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Strip path separators and null bytes from original filename for safe storage
function sanitiseName(name: string): string {
    return path.basename(name).replace(/[^\w\s.\-]/g, "_").slice(0, 255);
}