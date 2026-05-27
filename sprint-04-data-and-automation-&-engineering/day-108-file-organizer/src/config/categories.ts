import path from 'path';
import { OrganizerConfig, CategoryRule } from '../types';

export const CATEGORY_RULES: CategoryRule[] = [
    {
        name:       'Images',
        folder:     'Images',
        extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.bmp', '.tiff', '.heic', '.avif'],
    },
    {
        name:       'Videos',
        folder:     'Videos',
        extensions: ['.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.m4v', '.webm', '.3gp'],
    },
    {
        name:       'Audio',
        folder:     'Audio',
        extensions: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma', '.opus'],
    },
    {
        name:       'Documents',
        folder:     'Documents',
        extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp', '.txt', '.rtf'],
    },
    {
        name:       'Code',
        folder:     'Code',
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp', '.h', '.cs', '.go', '.rs', '.rb', '.php', '.swift', '.kt', '.sh', '.bash', '.zsh', '.sql', '.html', '.css', '.scss', '.json', '.yaml', '.yml', '.toml', '.xml', '.env', '.md', '.mdx'],
    },
    {
        name:       'Archives',
        folder:     'Archives',
        extensions: ['.zip', '.tar', '.gz', '.bz2', '.7z', '.rar', '.xz', '.tgz'],
    },
    {
        name:       'Fonts',
        folder:     'Fonts',
        extensions: ['.ttf', '.otf', '.woff', '.woff2', '.eot'],
    },
    {
        name:       'Data',
        folder:     'Data',
        extensions: ['.csv', '.tsv', '.db', '.sqlite', '.sqlite3', '.parquet', '.avro'],
    },
    {
        name:       'Executables',
        folder:     'Executables',
        extensions: ['.exe', '.dmg', '.pkg', '.deb', '.rpm', '.msi', '.app', '.apk'],
    },
];

// Build a fast ext → folder lookup map
export const EXT_MAP = new Map<string, string>(
    CATEGORY_RULES.flatMap((rule) =>
        rule.extensions.map((ext) => [ext, rule.folder])
    )
);

export function categoryForExt(ext: string): string {
    return EXT_MAP.get(ext.toLowerCase()) ?? 'Misc';
}

export function loadConfig(): OrganizerConfig {
    return {
        targetDir:   path.resolve(process.env.TARGET_DIR   || './sample-dir/mixed'),
        outputDir:   path.resolve(process.env.OUTPUT_DIR   || './sample-dir/organized'),
        operation:   (process.env.OPERATION                || 'move') as 'move' | 'copy',
        historyFile: path.resolve(process.env.HISTORY_FILE || './data/organizer-history.json'),
        skipHidden:  process.env.SKIP_HIDDEN !== 'false',
        conflict:    (process.env.CONFLICT                 || 'rename') as 'skip' | 'overwrite' | 'rename',
    };
}