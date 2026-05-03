// All shared types for the File Upload service

export type FileStatus = "active" | "deleted";

// Metadata row stored in SQLite for every uploaded file
export interface UploadedFile {
    id: number;
    original_name: string;      // original filename from the client (sanitised)
    stored_name: string;        // hashed filename on disk e.g. "a3f9bc12...jpg"
    mime_type: string;          // e.g. "image/jpeg"
    size_bytes: number;
    category: string;           // "image" | "document" | "text" | "other"
    uploader: string;           // username or "anonymous"
    download_url: string;       // full URL to retrieve the file
    status: FileStatus;
    uploaded_at: string;
    deleted_at: string | null;
}

// What Multer gives us after processing a file
export interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number;
}

// Upload stats returned by GET /files/stats
export interface UploadStats {
    total_files: number;
    total_size_bytes: number;
    total_size_mb: number;
    by_category: { category: string; count: number; size_bytes: number }[];
    by_mime: { mime_type: string; count: number }[];
    recent_uploads: UploadedFile[];
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    errors?: { field: string; message: string }[];
    meta?: { total: number; count: number };
}