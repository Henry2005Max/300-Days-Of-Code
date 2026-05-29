import dotenv from 'dotenv';
dotenv.config();

import path            from 'path';
import fs              from 'fs';
import { runPipeline } from './pipeline/runner';
import { printReport } from './display/printer';

async function main(): Promise<void> {
    const inputFile   = path.resolve(process.env.INPUT_FILE    || './data/input/sales.csv');
    const outputCsv   = path.resolve(process.env.OUTPUT_CSV    || './data/output/cleaned.csv');
    const outputJson  = path.resolve(process.env.OUTPUT_JSON   || './data/output/summary.json');
    const outputReport = path.resolve(process.env.OUTPUT_REPORT || './data/output/report.txt');
    const skipInvalid = process.env.SKIP_INVALID !== 'false';
    const logEvery    = parseInt(process.env.LOG_EVERY || '1000', 10);

    if (!fs.existsSync(inputFile)) {
        console.error(`[Pipeline] Input file not found: ${inputFile}`);
        console.error(`[Pipeline] Run "npm run generate" first.\n`);
        process.exit(1);
    }

    const fileSizeKb = Math.round(fs.statSync(inputFile).size / 1024);
    console.log(`\n[Pipeline] Starting ETL pipeline`);
    console.log(`[Pipeline] Input  : ${inputFile}  (${fileSizeKb.toLocaleString()} KB)`);
    console.log(`[Pipeline] Output : ${outputCsv}`);
    console.log(`[Pipeline] Stages : csv-parse → validate → enrich → aggregate → csv-stringify\n`);

    try {
        const summary = await runPipeline({
            inputFile, outputCsv, outputJson, skipInvalid, logEvery,
        });

        printReport(summary, outputReport);

        console.log(`[Pipeline] Outputs:`);
        console.log(`  Cleaned CSV : ${outputCsv}`);
        console.log(`  JSON summary: ${outputJson}`);
        console.log(`  Text report : ${outputReport}`);
        console.log(`\n[Pipeline] Done in ${summary.durationMs.toLocaleString()}ms.\n`);
    } catch (err) {
        console.error('\n[Pipeline] Error:', (err as Error).message);
        process.exit(1);
    }
}

main();