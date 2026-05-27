import fs   from 'fs';
import path from 'path';
import { FileEntry, OrganizerConfig } from '../types';
import { categoryForExt }             from '../config/categories';

function resolveDestName(
    destDir:   string,
    baseName:  string,
    ext:       string,
    conflict:  string
): string {
    const candidate = path.join(destDir, baseName + ext);
    if (!fs.existsSync(candidate) || conflict === 'overwrite') {
        return baseName + ext;
    }
    if (conflict === 'skip') {
        return baseName + ext; // caller checks conflict mode
    }
    // rename: append _1, _2, ...
    let i = 1;
    while (fs.existsSync(path.join(destDir, `${baseName}_${i}${ext}`))) {
        i++;
    }
    return `${baseName}_${i}${ext}`;
}

export function scanDirectory(config: OrganizerConfig): FileEntry[] {
    if (!fs.existsSync(config.targetDir)) {
        throw new Error(`Target directory not found: ${config.targetDir}`);
    }

    const entries   = fs.readdirSync(config.targetDir, { withFileTypes: true });
    const files: FileEntry[] = [];

    for (const dirent of entries) {
        // Only files — no subdirectories
        if (!dirent.isFile()) continue;

        // Skip hidden files
        if (config.skipHidden && dirent.name.startsWith('.')) continue;

        const name     = dirent.name;
        const ext      = path.extname(name).toLowerCase();
        const base     = path.basename(name, ext);
        const category = categoryForExt(ext);
        const srcPath  = path.join(config.targetDir, name);
        const destDir  = path.join(config.outputDir, category);
        const stat     = fs.statSync(srcPath);
        const destName = resolveDestName(destDir, base, ext, config.conflict);

        files.push({
            name,
            ext,
            size:     stat.size,
            category,
            srcPath,
            destPath: path.join(destDir, destName),
            destName,
        });
    }

    return files.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}