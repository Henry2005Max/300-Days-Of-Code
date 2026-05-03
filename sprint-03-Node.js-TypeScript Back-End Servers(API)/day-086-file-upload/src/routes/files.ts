import { Router, Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { asyncHandler, NotFoundError } from "../middleware/errorHandler";
import {
    uploadSingle,
    uploadMultiple,
    handleMulterError,
    getAllowedTypes,
    getMaxSizeBytes,
    getMaxFiles,
} from "../middleware/upload";
import {
    persistFile,
    persistFiles,
    getFileRecord,
    listFiles,
    deleteFile,
    getStats,
} from "../services/file.service";

const router     = Router();
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";

// ── Upload info ───────────────────────────────────────────────────────────────

// GET /files/info — what the server accepts (useful before attempting an upload)
router.get("/files/info", (_req: Request, res: Response) => {
    res.json({
        success: true,
        data: {
            allowed_types:      getAllowedTypes(),
            max_file_size_bytes: getMaxSizeBytes(),
            max_file_size_mb:   Math.round(getMaxSizeBytes() / 1024 / 1024 * 10) / 10,
            max_files_per_request: getMaxFiles(),
            single_upload_field:   "file",
            multiple_upload_field: "files",
        },
    });
});

// GET /files/stats — aggregate statistics
router.get("/files/stats", asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: getStats() });
}));

// ── Single file upload ────────────────────────────────────────────────────────

// POST /files/upload — upload one file (field name: "file")
router.post(
    "/files/upload",
    (req: Request, res: Response, next: NextFunction) => {
        uploadSingle(req, res, (err) => {
            if (err) return handleMulterError(err, req, res, next);
            next();
        });
    },
    asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file provided. Send a multipart/form-data request with field name "file"',
            });
        }

        const uploader = (req.query.uploader as string) || "anonymous";
        const record   = persistFile(req.file as any, uploader);

        res.status(201).json({ success: true, data: record });
    })
);

// ── Multiple file upload ──────────────────────────────────────────────────────

// POST /files/upload-many — upload up to MAX_FILES files (field name: "files")
router.post(
    "/files/upload-many",
    (req: Request, res: Response, next: NextFunction) => {
        uploadMultiple(req, res, (err) => {
            if (err) return handleMulterError(err, req, res, next);
            next();
        });
    },
    asyncHandler(async (req: Request, res: Response) => {
        const files = req.files as Express.Multer.File[] | undefined;
        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files provided. Send a multipart/form-data request with field name "files"',
            });
        }

        const uploader = (req.query.uploader as string) || "anonymous";
        const records  = persistFiles(files as any[], uploader);

        res.status(201).json({
            success: true,
            data:    records,
            meta:    { total: records.length, count: records.length },
        });
    })
);

// ── List ──────────────────────────────────────────────────────────────────────

// GET /files — list uploaded files with optional filters
router.get("/files", asyncHandler(async (req: Request, res: Response) => {
    const limit    = Math.min(Number(req.query.limit)  || 20, 100);
    const offset   = Number(req.query.offset) || 0;
    const uploader = req.query.uploader  as string | undefined;
    const category = req.query.category  as string | undefined;
    const mime     = req.query.mime_type as string | undefined;

    const { rows, total } = listFiles({ uploader, category, mime_type: mime, limit, offset });
    res.json({ success: true, data: rows, meta: { total, count: rows.length } });
}));

// ── Single file operations ────────────────────────────────────────────────────

// GET /files/:id — file metadata by DB id
router.get("/files/:id", asyncHandler(async (req: Request, res: Response) => {
    const id   = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new NotFoundError("File", req.params.id);
    const file = getFileRecord(id);
    res.json({ success: true, data: file });
}));

// DELETE /files/:id — soft-delete file record + remove physical file
router.delete("/files/:id", asyncHandler(async (req: Request, res: Response) => {
    const id       = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new NotFoundError("File", req.params.id);
    const uploader = req.query.uploader as string | undefined;
    const record   = deleteFile(id, uploader);
    res.json({ success: true, data: { message: `File "${record.original_name}" deleted`, record } });
}));

// ── Static file serving ───────────────────────────────────────────────────────

// GET /files/:filename — serve the actual file bytes
// This route uses the stored filename (hashed) not the DB id.
// We check the DB to ensure the file is active before serving.
router.get(
    "/files/:filename",
    asyncHandler(async (req: Request, res: Response) => {
        const { filename } = req.params;

        // Prevent path traversal — basename strips directory components
        const safe = path.basename(filename);
        if (safe !== filename) throw new NotFoundError("File");

        const record = stmts_getByName(safe);
        if (!record || record.status === "deleted") throw new NotFoundError("File");

        const filePath = path.join(UPLOAD_DIR, safe);
        if (!fs.existsSync(filePath)) throw new NotFoundError("File");

        res.setHeader("Content-Type",        record.mime_type);
        res.setHeader("Content-Disposition", `inline; filename="${record.original_name}"`);
        res.setHeader("Content-Length",      record.size_bytes);
        res.sendFile(path.resolve(filePath));
    })
);

// ── Internal helper — avoids circular import with service layer ───────────────
import { stmts } from "../db/statements";
function stmts_getByName(name: string) {
    return stmts.getFileByName.get(name) as any;
}

export default router;