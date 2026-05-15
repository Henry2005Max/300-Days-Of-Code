import dotenv from 'dotenv';
dotenv.config();

import { runMigrations } from './db/migrations';
import { closePool }     from './db/pool';
import { getDigestSections, getTotalCount } from './db/repository';
import { SCRAPE_TARGETS } from './scraper/targets';
import { scrapeTarget }  from './scraper/scraper';
import { printScrapeResults, printDigest } from './display/printer';
import { ScrapeResult } from './types';

const DIGEST_ONLY = process.env.DIGEST_ONLY === 'true';

async function main(): Promise<void> {
    console.log('[App] Nigerian News Scraper');
    console.log(`[App] Mode: ${DIGEST_ONLY ? 'DIGEST ONLY' : 'SCRAPE + DIGEST'}\n`);

    try {
        await runMigrations();

        if (!DIGEST_ONLY) {
            const results: ScrapeResult[] = [];

            for (const target of SCRAPE_TARGETS) {
                const result = await scrapeTarget(target);
                results.push(result);
            }

            const total = await getTotalCount();
            printScrapeResults(results, total);
        }

        console.log('\n[App] Building digest from database...');
        const sections = await getDigestSections();
        printDigest(sections);

        console.log('[App] Done.\n');
    } catch (err) {
        console.error('[App] Fatal error:', (err as Error).message);
        process.exit(1);
    } finally {
        await closePool();
    }
}

main();