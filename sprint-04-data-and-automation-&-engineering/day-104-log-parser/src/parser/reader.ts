import fs       from 'fs';
import readline from 'readline';

export async function readLines(filePath: string): Promise<string[]> {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Log file not found: ${filePath}`);
    }

    const lines: string[] = [];
    const rl = readline.createInterface({
        input:     fs.createReadStream(filePath, { encoding: 'utf-8' }),
        crlfDelay: Infinity,
    });

    for await (const line of rl) {
        const trimmed = line.trim();
        if (trimmed) lines.push(trimmed);
    }

    return lines;
}