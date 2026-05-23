import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { readLines }    from './parser/reader';
import { detectFormat, parseLine } from './parser/lineParser';
import { applyFilters } from './parser/filter';
import { analyze }      from './analyzer/analyze';
import { printReport }  from './display/printer';
import { ParseConfig }  from './types';

function loadConfig(): ParseConfig {
    return {
        logFile:     path.resolve(process.env.LOG_FILE     || './logs/app.log'),
        levelFilter: (process.env.LOG_LEVEL_FILTER         || 'ALL').toUpperCase(),
        hoursFilter: parseInt(process.env.HOURS_FILTER     || '0', 10),
        topN:        parseInt(process.env.TOP_N            || '10', 10),
    };
}

async function main(): Promise<void> {
    const config = loadConfig();

    console.log('[Parser] Log Parser & Analyzer');
    console.log(`[Parser] File   : ${config.logFile}`);
    console.log(`[Parser] Level  : ${config.levelFilter}`);
    console.log(`[Parser] Hours  : ${config.hoursFilter === 0 ? 'all' : `last ${config.hoursFilter}h`}`);
    console.log(`[Parser] Top N  : ${config.topN}\n`);

    // Read all lines
    const lines = await readLines(config.logFile);
    console.log(`[Parser] Read ${lines.length.toLocaleString()} lines.`);

    // Detect format from first line
    const format = detectFormat(lines[0] || '');
    console.log(`[Parser] Detected format: ${format}`);

    // Parse lines into entries
    const entries = lines
        .map((line) => parseLine(line, format))
        .filter((e): e is NonNullable<typeof e> => e !== null);

    console.log(`[Parser] Parsed ${entries.length.toLocaleString()} entries (${lines.length - entries.length} skipped).`);

    // Apply filters
    const filtered = applyFilters(entries, config.levelFilter, config.hoursFilter);
    console.log(`[Parser] After filters: ${filtered.length.toLocaleString()} entries.\n`);

    // Analyze and print
    const report = analyze(filtered, config.logFile, lines.length, config.topN);
    printReport(report);
}

main().catch((err) => {
    console.error('[Error]', (err as Error).message);
    process.exit(1);
});