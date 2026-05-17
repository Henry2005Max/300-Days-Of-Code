import { SentimentResult, AggregateReport } from '../types';

const LINE  = (len = 72) => '─'.repeat(len);
const DLINE = (len = 72) => '═'.repeat(len);

function sentimentBadge(label: string): string {
    if (label === 'positive') return '[+] POSITIVE';
    if (label === 'negative') return '[-] NEGATIVE';
    return '[~] NEUTRAL ';
}

function scoreBar(score: number): string {
    // Map -1..+1 to a 20-char bar
    const filled  = Math.round(((score + 1) / 2) * 20);
    const bar     = '█'.repeat(filled) + '░'.repeat(20 - filled);
    return `[${bar}] ${score >= 0 ? '+' : ''}${score.toFixed(4)}`;
}

function wrap(text: string, width = 68, indent = '  '): string {
    const words  = text.split(' ');
    const lines: string[] = [];
    let   line   = indent;

    for (const word of words) {
        if ((line + word).length > width) {
            lines.push(line.trimEnd());
            line = indent + word + ' ';
        } else {
            line += word + ' ';
        }
    }
    if (line.trim()) lines.push(line.trimEnd());
    return lines.join('\n');
}

export function printResults(results: SentimentResult[]): void {
    console.log('\n' + DLINE());
    console.log('  INDIVIDUAL ANALYSIS RESULTS');
    console.log(DLINE());

    for (const r of results) {
        console.log(`\n  ${sentimentBadge(r.label)}  |  ${r.source}  |  ${r.category.toUpperCase()}`);
        console.log('  ' + LINE());
        console.log(wrap(r.text));
        console.log(`\n  Score     : ${scoreBar(r.score)}`);
        console.log(`  Magnitude : ${r.magnitude.toFixed(4)}   Words: ${r.wordCount}`);

        if (r.entities.length > 0) {
            const byType: Record<string, string[]> = {};
            for (const e of r.entities) {
                if (!byType[e.type]) byType[e.type] = [];
                byType[e.type].push(e.text);
            }
            const entStr = Object.entries(byType)
                .map(([type, vals]) => `${type}: ${vals.join(', ')}`)
                .join('  |  ');
            console.log(`  Entities  : ${entStr}`);
        }

        if (r.keywords.length > 0) {
            console.log(`  Keywords  : ${r.keywords.join(', ')}`);
        }
    }
}

export function printAggregate(report: AggregateReport): void {
    const total = report.totalAnalyzed || 1;
    const posPct = ((report.positiveCount / total) * 100).toFixed(1);
    const negPct = ((report.negativeCount / total) * 100).toFixed(1);
    const neuPct = ((report.neutralCount  / total) * 100).toFixed(1);

    console.log('\n' + DLINE());
    console.log('  AGGREGATE REPORT');
    console.log(DLINE());

    console.log(`\n  Total Analyzed : ${report.totalAnalyzed}`);
    console.log(`  Avg Score      : ${report.avgScore >= 0 ? '+' : ''}${report.avgScore.toFixed(4)}`);
    console.log(`  Avg Magnitude  : ${report.avgMagnitude.toFixed(4)}`);
    console.log('');
    console.log(`  Positive : ${String(report.positiveCount).padStart(3)}  (${posPct}%)  ${'▓'.repeat(Math.round(Number(posPct) / 5))}`);
    console.log(`  Negative : ${String(report.negativeCount).padStart(3)}  (${negPct}%)  ${'▓'.repeat(Math.round(Number(negPct) / 5))}`);
    console.log(`  Neutral  : ${String(report.neutralCount).padStart(3)}  (${neuPct}%)  ${'▓'.repeat(Math.round(Number(neuPct) / 5))}`);

    if (report.categoryBreakdown.length > 0) {
        console.log('\n  BY CATEGORY');
        console.log('  ' + LINE(40));
        for (const c of report.categoryBreakdown) {
            const avg  = c.avgScore >= 0 ? `+${c.avgScore.toFixed(4)}` : c.avgScore.toFixed(4);
            console.log(`  ${c.category.padEnd(12)} ${String(c.count).padStart(3)} texts   avg score: ${avg}`);
        }
    }

    if (report.topKeywords.length > 0) {
        console.log('\n  TOP KEYWORDS');
        console.log('  ' + LINE(40));
        report.topKeywords.forEach((k, i) => {
            console.log(`  ${String(i + 1).padStart(2)}. ${k.keyword.padEnd(20)} ×${k.count}`);
        });
    }

    if (report.topEntities.length > 0) {
        console.log('\n  TOP ENTITIES');
        console.log('  ' + LINE(40));
        report.topEntities.forEach((e, i) => {
            console.log(`  ${String(i + 1).padStart(2)}. ${e.text.padEnd(22)} [${e.type}]  ×${e.count}`);
        });
    }

    console.log('\n' + DLINE() + '\n');
}