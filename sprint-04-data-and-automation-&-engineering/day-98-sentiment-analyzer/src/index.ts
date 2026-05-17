import dotenv from 'dotenv';
dotenv.config();

import { runMigrations }                       from './db/migrations';
import { closePool }                           from './db/pool';
import { upsertResult, getAggregateReport, getAllResults } from './db/repository';
import { analyzeText }                         from './nlp/analyzer';
import { SAMPLE_TEXTS }                        from './data/sampleTexts';
import { printResults, printAggregate }        from './display/printer';

const REPORT_ONLY = process.env.REPORT_ONLY === 'true';

async function main(): Promise<void> {
    console.log('[App] Sentiment Analyzer — compromise NLP + PostgreSQL');
    console.log(`[App] Mode: ${REPORT_ONLY ? 'REPORT ONLY' : 'ANALYZE + REPORT'}\n`);

    try {
        await runMigrations();

        if (!REPORT_ONLY) {
            console.log(`[Analyzer] Processing ${SAMPLE_TEXTS.length} texts...\n`);

            for (const input of SAMPLE_TEXTS) {
                const result = analyzeText(input);
                await upsertResult(result);
                console.log(`  [${result.label.toUpperCase().padEnd(8)}] score: ${result.score >= 0 ? '+' : ''}${result.score.toFixed(4)}  — ${input.id}`);
            }

            console.log(`\n[Analyzer] Done. ${SAMPLE_TEXTS.length} texts analyzed and stored.`);
        }

        const [results, aggregate] = await Promise.all([
            getAllResults(),
            getAggregateReport(),
        ]);

        printResults(results);
        printAggregate(aggregate);

        console.log('[App] Done.\n');
    } catch (err) {
        console.error('[App] Fatal error:', (err as Error).message);
        process.exit(1);
    } finally {
        await closePool();
    }
}

main();