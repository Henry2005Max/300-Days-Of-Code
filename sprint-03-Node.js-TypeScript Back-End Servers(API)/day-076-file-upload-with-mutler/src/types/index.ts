export interface UploadRow {
    id: number;
    original_name: string;
    stored_name: string;
    mime_type: string;
    size_bytes: number;
    category: string;       /* "avatar" | "document" */
    uploader_ip: string;
    uploaded_at: string;
}

export interface Upload {
    id: number;
    originalName: string;
    storedName: string;
    mimeType: string;
    sizeBytes: number;
    sizeFormatted: string;
    category: string;
    uploaderIp: string;
    uploadedAt: string;
    url: string;
}

export function toUpload(row: UploadRow, baseUrl: string): Upload {
    const dir = row.category === "avatar" ? "avatars" : "documents";
    return {
        id:            row.id,
        originalName:  row.original_name,
        storedName:    row.stored_name,
        mimeType:      row.mime_type,
        sizeBytes:     row.size_bytes,
        sizeFormatted: formatBytes(row.size_bytes),
        category:      row.category,
        uploaderIp:    row.uploader_ip,
        uploadedAt:    row.uploaded_at,
        url:           `${baseUrl}/uploads/${dir}/${row.stored_name}`,
    };
}

export function formatBytes(bytes: number): string {
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}