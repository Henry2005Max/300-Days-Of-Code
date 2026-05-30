import { DashboardData }        from '../types';
import { A, c, naira, hbar }   from '../renderer/ansi';

const MEDALS = ['🥇','🥈','🥉','  4','  5','  6'];

export function leaderboardPanel(data: DashboardData): string[] {
    const { categories } = data;
    const maxRev = Math.max(...categories.map((c) => c.totalRevenue), 1);
    const lines: string[] = [''];

    lines.push(`  ${c(A.dim + A.underline, 'CATEGORIES')}`);
    lines.push('');

    categories.forEach((cat, i) => {
        const medal = MEDALS[i] || `  ${i + 1}`;
        const bar   = hbar(cat.totalRevenue, maxRev, 10);
        lines.push(
            `  ${medal}  ${c(A.brightWhite, cat.category.padEnd(12))}  ${bar}  ${c(A.yellow, naira(cat.totalRevenue).padStart(9))}`
        );
        lines.push(
            `       ${c(A.dim, `${cat.orderCount.toLocaleString()} orders  avg: ${naira(cat.avgOrderValue)}  top: ${cat.topProduct.slice(0, 18)}`)}`
        );
    });

    lines.push('');
    lines.push(`  ${c(A.dim + A.underline, 'TOP CITIES')}`);
    lines.push('');

    const maxCity = Math.max(...data.topCities.map((c) => c.revenue), 1);
    data.topCities.slice(0, 6).forEach((city, i) => {
        const bar = hbar(city.revenue, maxCity, 10);
        lines.push(
            `  ${MEDALS[i] || `  ${i + 1}`}  ${c(A.brightCyan, city.city.padEnd(14))}  ${bar}  ${c(A.yellow, naira(city.revenue).padStart(9))}`
        );
    });

    lines.push('');
    return lines;
}

// re-export for import convenience
import { A as _A } from '../renderer/ansi';
const { underline: _u, ..._ } = _A;