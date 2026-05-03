import db from "./database";

type Stmts = ReturnType<typeof buildStatements>;
let _stmts: Stmts | null = null;

function buildStatements() {
    return {
        insertFile: db.prepare(`
      INSERT INTO uploaded_files
        (original_name, stored_name, mime_type, size_bytes, category, uploader, download_url)
      VALUES
        (@original_name, @stored_name, @mime_type, @size_bytes, @category, @uploader, @download_url)
    `),

        getFileById:    db.prepare("SELECT * FROM uploaded_files WHERE id = ?"),
        getFileByName:  db.prepare("SELECT * FROM uploaded_files WHERE stored_name = ?"),

        listFiles: db.prepare(`
      SELECT * FROM uploaded_files
      WHERE status = 'active'
        AND (@uploader IS NULL OR uploader = @uploader)
        AND (@category IS NULL OR category = @category)
        AND (@mime_type IS NULL OR mime_type = @mime_type)
      ORDER BY uploaded_at DESC
      LIMIT @limit OFFSET @offset
    `),

        countFiles: db.prepare(`
      SELECT COUNT(*) as count FROM uploaded_files
      WHERE status = 'active'
        AND (@uploader IS NULL OR uploader = @uploader)
        AND (@category IS NULL OR category = @category)
        AND (@mime_type IS NULL OR mime_type = @mime_type)
    `),

        softDelete: db.prepare(`
      UPDATE uploaded_files
      SET status = 'deleted', deleted_at = datetime('now')
      WHERE id = ? AND status = 'active'
    `),

        // Stats queries
        statsTotals: db.prepare(`
      SELECT COUNT(*) as total_files, COALESCE(SUM(size_bytes), 0) as total_size_bytes
      FROM uploaded_files WHERE status = 'active'
    `),
        statsByCategory: db.prepare(`
      SELECT category, COUNT(*) as count, SUM(size_bytes) as size_bytes
      FROM uploaded_files WHERE status = 'active'
      GROUP BY category ORDER BY count DESC
    `),
        statsByMime: db.prepare(`
      SELECT mime_type, COUNT(*) as count
      FROM uploaded_files WHERE status = 'active'
      GROUP BY mime_type ORDER BY count DESC
    `),
        recentUploads: db.prepare(`
      SELECT * FROM uploaded_files WHERE status = 'active'
      ORDER BY uploaded_at DESC LIMIT 5
    `),
    };
}

export function initStatements(): void {
    _stmts = buildStatements();
    console.log("[db] Prepared statements compiled");
}

export const stmts = new Proxy({} as Stmts, {
    get(_target, prop: string) {
        if (!_stmts) throw new Error("initStatements() must be called after runMigrations()");
        return (_stmts as any)[prop];
    },
});