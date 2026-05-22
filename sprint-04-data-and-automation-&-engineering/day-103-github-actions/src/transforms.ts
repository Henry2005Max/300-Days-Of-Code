export function groupBy<T>(
    items: T[],
    key: keyof T
): Record<string, T[]> {
    return items.reduce((acc, item) => {
        const group = String(item[key]);
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
    }, {} as Record<string, T[]>);
}

export function sumBy<T>(items: T[], key: keyof T): number {
    return items.reduce((sum, item) => sum + Number(item[key]), 0);
}

export function sortByDesc<T>(items: T[], key: keyof T): T[] {
    return [...items].sort((a, b) => Number(b[key]) - Number(a[key]));
}

export function paginate<T>(items: T[], page: number, pageSize: number): {
    data:       T[];
    page:       number;
    pageSize:   number;
    total:      number;
    totalPages: number;
} {
    if (page < 1)       throw new RangeError('page must be >= 1');
    if (pageSize < 1)   throw new RangeError('pageSize must be >= 1');

    const total      = items.length;
    const totalPages = Math.ceil(total / pageSize);
    const start      = (page - 1) * pageSize;
    const data       = items.slice(start, start + pageSize);

    return { data, page, pageSize, total, totalPages };
}

export function chunkArray<T>(arr: T[], size: number): T[][] {
    if (size < 1) throw new RangeError('chunk size must be >= 1');
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}