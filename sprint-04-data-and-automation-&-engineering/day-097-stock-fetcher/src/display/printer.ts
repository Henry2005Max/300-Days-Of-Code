import { PriceReport, FetchResult } from '../types';

const LINE  = (len = 74) => '─'.repeat(len);
const DLINE = (len = 74) => '═'.repeat(len);

function arrow(changePct: number): string {
    if (changePct > 0)  return '▲';
    if (changePct < 0)  return '▼';
    return '◆';
}

function formatPrice(price: number, currency: string): string {
    if (currency === 'NGN') {
        return `₦${price.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatChange(change: number, changePct: number, currency: string): string {
    const sign   = change >= 0 ? '+' : '';
    const sym    = currency === 'NGN' ? '₦' : '$';
    const pct    = `${change >= 0 ? '+' : ''}${changePct.toFixed(2)}%`;
    const abs    = `${sign}${sym}${Math.abs(change).toFixed(2)}`;
    return `${abs}  (${pct})`;
}

function formatVolume(volume: number | null): string {
    if (!volume) return 'N/A';
    if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(2)}M`;
    if (volume >= 1_000)     return `${(volume / 1_000).toFixed(1)}K`;
    return String(volume);
}

export function printFetchResults(results: FetchResult[]): void {
    console.log('\n' + DLINE());
    console.log('  FETCH SUMMARY');
    console.log(DLINE());

    for (const r of results) {
        const status = r.success ? ' OK ' : 'FAIL';
        const pts    = r.success ? `${r.points} point(s) stored` : r.error || 'unknown error';
        console.log(`  [${status}] ${r.symbol.padEnd(10)} — ${pts}`);
    }
}

export function printReport(reports: PriceReport[]): void {
    const stocks = reports.filter((r) => r.type === 'stock');
    const forex  = reports.filter((r) => r.type === 'forex');

    const updatedAt = reports[0]
        ? new Date(reports[0].recordedAt).toLocaleString('en-NG', {
            timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short',
        })
        : 'N/A';

    console.log('\n' + DLINE());
    console.log('  MARKET REPORT — Nigerian Investor Edition');
    console.log(`  Updated: ${updatedAt} WAT`);
    console.log(DLINE());

    if (stocks.length > 0) {
        console.log('\n  STOCKS (USD)\n');
        console.log(
            `  ${'Symbol'.padEnd(8)} ${'Name'.padEnd(26)} ${'Price'.padStart(10)} ${'Change'.padStart(22)} ${'Volume'.padStart(10)}`
        );
        console.log('  ' + LINE());

        for (const s of stocks) {
            const dir     = arrow(s.changePct);
            const price   = formatPrice(s.latestPrice, 'USD');
            const change  = formatChange(s.change, s.changePct, 'USD');
            const vol     = formatVolume(s.volume);
            console.log(
                `  ${s.symbol.padEnd(8)} ${s.name.padEnd(26)} ${price.padStart(10)} ${dir} ${change.padStart(20)} ${vol.padStart(10)}`
            );
            console.log(
                `  ${''.padEnd(8)} ${'Day Range:'.padEnd(14)} Lo: $${s.low.toFixed(2)}  Hi: $${s.high.toFixed(2)}  Open: $${s.open.toFixed(2)}`
            );
            console.log('');
        }
    }

    if (forex.length > 0) {
        console.log('  FOREX — NGN RATES\n');
        console.log(
            `  ${'Pair'.padEnd(12)} ${'Name'.padEnd(28)} ${'Rate'.padStart(14)} ${'Change'.padStart(24)}`
        );
        console.log('  ' + LINE());

        for (const f of forex) {
            const dir    = arrow(f.changePct);
            const price  = formatPrice(f.latestPrice, 'NGN');
            const change = formatChange(f.change, f.changePct, 'NGN');
            console.log(
                `  ${f.symbol.padEnd(12)} ${f.name.padEnd(28)} ${price.padStart(14)} ${dir} ${change.padStart(22)}`
            );
            console.log(
                `  ${''.padEnd(12)} ${'Day Range:'.padEnd(14)} Lo: ₦${f.low.toFixed(2)}  Hi: ₦${f.high.toFixed(2)}`
            );
            console.log('');
        }
    }

    console.log(DLINE() + '\n');
}