export type Operation   = 'move' | 'copy';
export type ConflictMode = 'skip' | 'overwrite' | 'rename';
export type FileStatus  = 'moved' | 'copied' | 'skipped' | 'error';

export interface FileEntry {
    name:      string;
    ext:       string;
    size:      number;
    category:  string;
    srcPath:   string;
    destPath:  string;
    destName:  string;
}

export interface OrganizerConfig {
    targetDir:    string;
    outputDir:    string;
    operation:    Operation;
    historyFile:  string;
    skipHidden:   boolean;
    conflict:     ConflictMode;
}

export interface FileResult {
    entry:   FileEntry;
    status:  FileStatus;
    error?:  string;
}

export interface OrganizerRun {
    id:          string;
    timestamp:   string;
    targetDir:   string;
    outputDir:   string;
    operation:   Operation;
    dryRun:      boolean;
    totalFiles:  number;
    moved:       number;
    copied:      number;
    skipped:     number;
    errors:      number;
    results:     FileResult[];
}

export interface CategoryRule {
    name:        string;
    folder:      string;
    extensions:  string[];
}