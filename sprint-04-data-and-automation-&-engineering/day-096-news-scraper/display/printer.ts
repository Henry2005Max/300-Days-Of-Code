import { DigestSection, ScrapeResult } from '../types';

const LINE  = (len = 70) => '─'.repeat(len);
const DLINE = (len = 70) => '═'.repeat(len);

export function printScrapeResults(results: ScrapeResult[], totalInDb: number): void {
    console.log('\n' + DLINE());
    console.log('  SCRAPE SUMMARY');
    console.log(DLINE());
    console.log(
        `  ${'Source'.padEnd(25)} ${'Fetched'.padStart(8)} ${'Inserted'.padStart(9)} ${'Skipped'.padStart(8)} ${'Errors'.padStart(7)}`
    );
    console.log('  ' + LINE());

    for (const r of results) {
        console.log(
            `  ${r.source.padEnd(25)} ${String(r.fetched).padStart(8)} ${String(r.inserted).padStart(9)} ${String(r.skipped).padStart(8)} ${String(r.errors).padStart(7)}`
        );
    }

    console.log('  ' + LINE());
    const totals = results.reduce(
        (acc, r) => ({
            fetched:  acc.fetched  + r.fetched,
            inserted: acc.inserted + r.inserted,
            skipped:  acc.skipped  + r.skipped,
            errors:   acc.errors   + r.errors,
        }),
        { fetched: 0, inserted: 0, skipped: 0, errors: 0 }
    );

    console.log(
        `  ${'TOTAL'.padEnd(25)} ${String(totals.fetched).padStart(8)} ${String(totals.inserted).padStart(9)} ${String(totals.skipped).padStart(8)} ${String(totals.errors).padStart(7)}`
    );
    console.log(`\n  Total articles in database: ${totalInDb}`);
}

export function printDigest(sections: DigestSection[]): void {
    console.log('\n' + DLINE());
    console.log('  NIGERIAN NEWS DIGEST');
    console.log(DLINE());

    if (sections.length === 0) {
        console.log('\n  No articles found. Run without DIGEST_ONLY=true to scrape first.\n');
        return;
    }

    for (const section of sections) {
        console.log(`\n  ▶  ${section.category.toUpperCase()}`);
        console.log('  ' + LINE());

        for (const article of section.articles) {
            const time = new Date(article.scrapedAt).toLocaleTimeString('en-NG', {
                hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos',
            });

            console.log(`\n  ${article.title.slice(0, 72)}`);
            console.log(`  ${('─').repeat(Math.min(article.title.length, 72))}`);

            if (article.summary && article.summary !== 'No summary available.') {
                const words   = article.summary.split(' ');
                const maxLine = 68;
                let   line    = '  ';
                for (const word of words) {
                    if ((line + word).length > maxLine) {
                        console.log(line);
                        line = `  ${word} `;
                    } else {
                        line += `${word} `;
                    }
                }
                if (line.trim()) console.log(line);
            }

            console.log(`  Source: ${article.source}  |  ${time} WAT  |  ${article.url}`);
        }
    }

    console.log('\n' + DLINE() + '\n');
}