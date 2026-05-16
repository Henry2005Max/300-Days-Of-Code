import dotenv from 'dotenv';
dotenv.config();

import { runMigrations }    from './db/migrations';
import { closePool }        from './db/pool';
import { upsertAsset, insertPricePoint, buildPriceReports } from './db/repository';
import { ASSETS }           from './services/assets';
import { fetchPricePoint }  from './services/fetcher';
import { printFetchResults, printReport } from './display/printer';
import { FetchResult }      from './types';

const REPORT_ONLY = process.env.REPORT_ONLY === 'true';

async function main(): Promise<void> {
    console.log('[App] Stock Fetcher — Alpha Vantage + PostgreSQL');
    console.log(`[App] Mode: ${REPORT_ONLY ? 'REPORT ONLY' : 'FETCH + REPORT'}\n`);

    try {
        await runMigrations();

        if (!REPORT_ONLY) {
            console.log(`[Fetcher] Fetching ${ASSETS.length} assets...\n`);

            const results: FetchResult[] = [];

            for (const asset of ASSETS) {
                await upsertAsset(asset);

                try {
                    const point   = await fetchPricePoint(asset);
                    const stored  = await insertPricePoint(point);
                    results.push({ symbol: asset.symbol, success: true, points: stored ? 1 : 0 });
                } catch (err) {
                    results.push({
                        symbol:  asset.symbol,
                        success: false,
                        points:  0,
                        error:   (err as Error).message,
                    });
                }
            }

            printFetchResults(results);
        }

        console.log('\n[Report] Building market report from database...');
        const reports = await buildPriceReports();

        if (reports.length === 0) {
            console.log('[Report] No data found. Run without REPORT_ONLY=true to fetch first.\n');
        } else {
            printReport(reports);
        }

        console.log('[App] Done.\n');
    } catch (err) {
        console.error('[App] Fatal error:', (err as Error).message);
        process.exit(1);
    } finally {
        await closePool();
    }
}

main();