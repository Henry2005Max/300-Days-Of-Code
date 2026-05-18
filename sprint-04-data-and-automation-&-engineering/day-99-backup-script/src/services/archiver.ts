import fs      from 'fs';
import path    from 'path';
import zlib    from 'zlib';
import crypto  from 'crypto';
import { ArchiveEntry } from '../types';

// Recursively collect all files under a directory
function walkDir(dir: string): string[] {
    const results: string[] = [];
    if (!fs.existsSync(dir)) return results;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...walkDir(full));
        } else {
            results.push(full);
        }
    }
    return results;
}

function formatSize(bytes: number): string {
    if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(2)} MB`;
    if (bytes >= 1_024)     return `${(bytes / 1_024).toFixed(1)} KB`;
    return `${bytes} B`;
}

// Write a simple tar-like archive:
// Each file entry: [header 512 bytes][data padded to 512-byte blocks]
// Then compressed with gzip via zlib
function buildTarBuffer(sourceDir: string, files: string[]): Buffer {
    const blocks: Buffer[] = [];

    for (const filePath of files) {
        const relative = path.relative(sourceDir, filePath);
        const stat     = fs.statSync(filePath);
        const content  = fs.readFileSync(filePath);

        // TAR header — 512 bytes
        const header   = Buffer.alloc(512, 0);
        // File name (100 bytes)
        header.write(relative.slice(0, 99), 0, 'utf-8');
        // File mode (8 bytes)
        header.write('0000644\0', 100, 'utf-8');
        // File size in octal (12 bytes)
        header.write(stat.size.toString(8).padStart(11, '0') + '\0', 124, 'utf-8');
        // Modification time in octal (12 bytes)
        header.write(Math.floor(stat.mtimeMs / 1000).toString(8).padStart(11, '0') + '\0', 136, 'utf-8');
        // Type flag — '0' = regular file
        header.write('0', 156, 'utf-8');
        // UStar magic
        header.write('ustar  \0', 257, 'utf-8');

        // Checksum — sum of all header bytes with checksum field as spaces
        header.fill(0x20, 148, 156);
        let checksum = 0;
        for (let i = 0; i < 512; i++) checksum += header[i];
        header.write(checksum.toString(8).padStart(6, '0') + '\0 ', 148, 'utf-8');

        blocks.push(header);

        // File data padded to 512-byte boundary
        const padSize  = 512 - (content.length % 512 || 512);
        const padded   = Buffer.concat([content, Buffer.alloc(padSize === 512 ? 0 : padSize, 0)]);
        blocks.push(padded);
    }

    // Two 512-byte zero blocks as end-of-archive marker
    blocks.push(Buffer.alloc(1024, 0));
    return Buffer.concat(blocks);
}

export async function createArchive(sourceDir: string, destPath: string): Promise<ArchiveEntry> {
    const files      = walkDir(sourceDir);
    const totalBytes = files.reduce((sum, f) => sum + fs.statSync(f).size, 0);

    const tarBuffer  = buildTarBuffer(sourceDir, files);
    const compressed = zlib.gzipSync(tarBuffer, { level: 6 });

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, compressed);

    console.log(`  [Archive] ${path.basename(sourceDir)} → ${path.basename(destPath)}`);
    console.log(`            ${files.length} files, ${formatSize(totalBytes)} → ${formatSize(compressed.length)} compressed`);

    return {
        source:      sourceDir,
        archivePath: destPath,
        files:       files.length,
        bytes:       totalBytes,
        compressed:  compressed.length,
    };
}

export function extractArchive(archivePath: string, destDir: string): number {
    if (!fs.existsSync(archivePath)) {
        throw new Error(`Archive not found: ${archivePath}`);
    }

    const compressed = fs.readFileSync(archivePath);
    const tarBuffer  = zlib.gunzipSync(compressed);

    fs.mkdirSync(destDir, { recursive: true });

    let offset     = 0;
    let filesCount = 0;

    while (offset < tarBuffer.length - 1024) {
        // Read header
        const header = tarBuffer.slice(offset, offset + 512);

        // Check for end-of-archive (two zero blocks)
        if (header.every((b) => b === 0)) break;

        const fileName = header.slice(0, 100).toString('utf-8').replace(/\0/g, '').trim();
        const fileSize = parseInt(header.slice(124, 136).toString('utf-8').replace(/\0/g, '').trim(), 8);

        if (!fileName || isNaN(fileSize)) { offset += 512; continue; }

        offset += 512;

        const fileData  = tarBuffer.slice(offset, offset + fileSize);
        const outPath   = path.join(destDir, fileName);

        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, fileData);
        filesCount++;

        // Advance past padded blocks
        const padSize = 512 - (fileSize % 512 || 512);
        offset += fileSize + (padSize === 512 ? 0 : padSize);
    }

    return filesCount;
}

export function generateBackupId(): string {
    const now = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return `backup-${now}`;
}

export function formatSize(bytes: number): string {
    if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(2)} MB`;
    if (bytes >= 1_024)     return `${(bytes / 1_024).toFixed(1)} KB`;
    return `${bytes} B`;
}