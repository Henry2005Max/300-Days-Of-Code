export type BackupStatus = 'success' | 'failed' | 'partial';
export type Command      = 'backup' | 'restore' | 'list' | 'clean';

export interface BackupEntry {
    id:           string;       // e.g. "backup-2025-01-13T08-30-00"
    timestamp:    string;       // ISO 8601
    sources:      string[];     // original source paths
    archives:     ArchiveEntry[];
    status:       BackupStatus;
    totalFiles:   number;
    totalBytes:   number;
    durationMs:   number;
}

export interface ArchiveEntry {
    source:      string;   // original source path
    archivePath: string;   // path to .tar.gz file
    files:       number;
    bytes:       number;
    compressed:  number;   // compressed size in bytes
}

export interface BackupLog {
    version:  number;
    entries:  BackupEntry[];
}

export interface BackupConfig {
    sources:    string[];
    dest:       string;
    logPath:    string;
    maxBackups: number;
    restoreId:  string;
}

export interface FileStats {
    path:  string;
    size:  number;
    isDir: boolean;
}