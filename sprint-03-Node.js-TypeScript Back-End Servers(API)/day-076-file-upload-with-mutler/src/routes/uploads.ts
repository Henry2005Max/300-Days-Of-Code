import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { db } from "../db/database";
import { avatarUpload, documentUpload, uploadInfo } from "../middleware/upload";
import { UploadRow, toUpload, formatBytes } from "../types";

const router = Router();

/* ── Helper — get base URL for building file URLs ── */
function baseUrl(req: Request): string {
    return `${req.protocol}://${req.get("host")}`;
}

/* ── Helper — record a successful upload in DB ── */
function recordUpload(
    file: Express.Multer.File,
    category: string,
    ip: string
): UploadRow {
    const result = db.prepare(`
    INSERT INTO uploads (original_name, stored_name, mime_type, size_bytes, category, uploader_ip)
    VALUES (@originalName, @storedName, @mimeType, @sizeBytes, @category, @uploaderIp)
  `).run({
        originalName: file.originalname,
        storedName:   file.filename,
        mimeType:     file.mimetype,
        sizeBytes:    file.size,
        category,
        uploaderIp:   ip,
    });

    return db.prepare("SELECT * FROM uploads WHERE id = ?")
        .get(result.lastInsertRowid) as UploadRow;
}

/* ── POST /uploads/avatar ────────────────────────────────────────────
   Single file upload. Field name must be "avatar".
   avatarUpload middleware parses the multipart body, validates type
   and size, saves the file to disk, and puts metadata in req.file.

   If multer rejects the file (wrong type or too large), it calls
   next(error) which our error handler catches.
────────────────────────────────────────────────────────────────────── */
router.post("/avatar", (req: Request, res: Response) => {
    avatarUpload.single("avatar")(req, res, (err) => {
        if (err) {
            /* ── Multer error handling ───────────────────────────────────
               MulterError codes we handle:
               LIMIT_FILE_SIZE   → file too large
               LIMIT_UNEXPECTED_FILE → wrong field name
               Other errors      → file type rejection from our fileFilter
            ─────────────────────────────────────────────────────────────── */
            const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
            const message = err.code === "LIMIT_FILE_SIZE"
                ? `File too large — max size is ${formatBytes(uploadInfo.avatar.maxSize)}`
                : err.message;
            res.status(status).json({ success: false, error: message });
            return;
        }

        if (!req.file) {
            res.status(400).json({
                success: false,
                error:   "No file uploaded",
                hint:    'Send a multipart/form-data request with field name "avatar"',
            });
            return;
        }

        const row    = recordUpload(req.file, "avatar", req.ip || "unknown");
        const upload = toUpload(row, baseUrl(req));

        console.log(`[UPLOAD] Avatar: ${req.file.originalname} → ${req.file.filename} (${formatBytes(req.file.size)})`);

        res.status(201).json({
            success: true,
            message: "Avatar uploaded successfully",
            data:    upload,
        });
    });
});

/* ── POST /uploads/documents ─────────────────────────────────────────
   Multiple file upload. Field name must be "documents".
   Up to MAX_FILES files per request.
────────────────────────────────────────────────────────────────────── */
router.post("/documents", (req: Request, res: Response) => {
    documentUpload.array("documents", Number(process.env.MAX_FILES) || 5)(req, res, (err) => {
        if (err) {
            const status = err.code === "LIMIT_FILE_SIZE"  ? 413
                : err.code === "LIMIT_FILE_COUNT" ? 400
                    : 400;
            const message = err.code === "LIMIT_FILE_SIZE"
                ? `File too large — max size is ${formatBytes(uploadInfo.document.maxSize)}`
                : err.code === "LIMIT_FILE_COUNT"
                    ? `Too many files — max ${process.env.MAX_FILES || 5} files per upload`
                    : err.message;
            res.status(status).json({ success: false, error: message });
            return;
        }

        const files = req.files as Express.Multer.File[] | undefined;
        if (!files || files.length === 0) {
            res.status(400).json({
                success: false,
                error:   "No files uploaded",
                hint:    'Send a multipart/form-data request with field name "documents"',
            });
            return;
        }

        const ip      = req.ip || "unknown";
        const uploads = files.map((file) => {
            const row = recordUpload(file, "document", ip);
            console.log(`[UPLOAD] Document: ${file.originalname} → ${file.filename} (${formatBytes(file.size)})`);
            return toUpload(row, baseUrl(req));
        });

        res.status(201).json({
            success: true,
            message: `${uploads.length} file(s) uploaded successfully`,
            data:    uploads,
            meta:    { count: uploads.length },
        });
    });
});

/* ── GET /uploads — list all uploads ── */
router.get("/", (req: Request, res: Response) => {
    const category = req.query.category as string | undefined;
    const limit    = Math.min(50, Number(req.query.limit) || 20);

    const where  = category ? "WHERE category = ?" : "";
    const params = category ? [category, limit] : [limit];

    const rows = db.prepare(
        `SELECT * FROM uploads ${where} ORDER BY uploaded_at DESC LIMIT ?`
    ).all(...params) as UploadRow[];

    const total = (db.prepare(
        `SELECT COUNT(*) as c FROM uploads ${where}`
    ).get(...(category ? [category] : [])) as any).c;

    res.json({
        success: true,
        data:    rows.map((r) => toUpload(r, baseUrl(req))),
        meta:    { total, count: rows.length },
    });
});

/* ── GET /uploads/stats ── */
router.get("/stats", (req: Request, res: Response) => {
    const total      = (db.prepare("SELECT COUNT(*) as c FROM uploads").get() as any).c;
    const totalSize  = (db.prepare("SELECT SUM(size_bytes) as s FROM uploads").get() as any).s || 0;
    const byCategory = db.prepare(
        "SELECT category, COUNT(*) as count, SUM(size_bytes) as totalSize FROM uploads GROUP BY category"
    ).all() as any[];

    res.json({
        success: true,
        data: {
            totalFiles:      total,
            totalSize:       formatBytes(totalSize),
            totalSizeBytes:  totalSize,
            byCategory: byCategory.map((r) => ({
                category:   r.category,
                count:      r.count,
                totalSize:  formatBytes(r.totalSize),
            })),
        },
    });
});

/* ── GET /uploads/:id — single upload record ── */
router.get("/:id", (req: Request, res: Response) => {
    const id  = Number(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ success: false, error: "ID must be a number" });
        return;
    }

    const row = db.prepare("SELECT * FROM uploads WHERE id = ?").get(id) as UploadRow | undefined;
    if (!row) {
        res.status(404).json({ success: false, error: `Upload with ID ${id} not found` });
        return;
    }

    res.json({ success: true, data: toUpload(row, baseUrl(req)) });
});

/* ── DELETE /uploads/:id ─────────────────────────────────────────────
   Deletes both the DB record AND the file from disk.
   Order matters: delete DB record first so if fs.unlink fails,
   we can still retry. If we deleted the file first and the DB
   delete failed, we'd have an orphaned DB record with no file.
────────────────────────────────────────────────────────────────────── */
router.delete("/:id", (req: Request, res: Response) => {
    const id  = Number(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ success: false, error: "ID must be a number" });
        return;
    }

    const row = db.prepare("SELECT * FROM uploads WHERE id = ?").get(id) as UploadRow | undefined;
    if (!row) {
        res.status(404).json({ success: false, error: `Upload with ID ${id} not found` });
        return;
    }

    /* Delete DB record first */
    db.prepare("DELETE FROM uploads WHERE id = ?").run(id);

    /* Then delete file from disk */
    const dir      = row.category === "avatar" ? process.env.AVATAR_DIR : process.env.DOCUMENT_DIR;
    const filePath = path.join(dir || "./uploads", row.stored_name);

    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[UPLOAD] Deleted file: ${filePath}`);
        }
    } catch (err: any) {
        console.error(`[UPLOAD] Could not delete file ${filePath}: ${err.message}`);
        /* Don't fail the request — DB record is already deleted */
    }

    res.json({
        success:     true,
        message:     "File deleted",
        deletedFile: row.original_name,
    });
});

export default router;