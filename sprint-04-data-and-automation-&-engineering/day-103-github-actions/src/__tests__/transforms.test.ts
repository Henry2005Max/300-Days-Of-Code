import { groupBy, sumBy, sortByDesc, paginate, chunkArray } from '../transforms';

const SALES = [
    { product: 'iPhone 15',   category: 'Electronics', revenue: 950000 },
    { product: 'HP Laptop',   category: 'Electronics', revenue: 480000 },
    { product: 'Office Chair',category: 'Furniture',   revenue: 85000  },
    { product: 'Ankara Fabric',category: 'Fashion',    revenue: 42500  },
    { product: 'Sofa Set',    category: 'Furniture',   revenue: 280000 },
];

describe('groupBy', () => {
    it('groups items by a string key', () => {
        const grouped = groupBy(SALES, 'category');
        expect(Object.keys(grouped)).toContain('Electronics');
        expect(grouped['Electronics']).toHaveLength(2);
        expect(grouped['Furniture']).toHaveLength(2);
    });

    it('returns an empty object for an empty array', () => {
        expect(groupBy([], 'category')).toEqual({});
    });
});

describe('sumBy', () => {
    it('sums a numeric key correctly', () => {
        expect(sumBy(SALES, 'revenue')).toBe(1837500);
    });

    it('returns 0 for an empty array', () => {
        expect(sumBy([], 'revenue')).toBe(0);
    });
});

describe('sortByDesc', () => {
    it('sorts items from highest to lowest', () => {
        const sorted = sortByDesc(SALES, 'revenue');
        expect(sorted[0].revenue).toBe(950000);
        expect(sorted[sorted.length - 1].revenue).toBe(42500);
    });

    it('does not mutate the original array', () => {
        const original = [...SALES];
        sortByDesc(SALES, 'revenue');
        expect(SALES).toEqual(original);
    });
});

describe('paginate', () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

    it('returns the correct page slice', () => {
        const result = paginate(items, 2, 10);
        expect(result.data).toHaveLength(10);
        expect(result.data[0].id).toBe(11);
    });

    it('calculates totalPages correctly', () => {
        expect(paginate(items, 1, 10).totalPages).toBe(3);
    });

    it('last page has remaining items', () => {
        const result = paginate(items, 3, 10);
        expect(result.data).toHaveLength(5);
    });

    it('throws for invalid page number', () => {
        expect(() => paginate(items, 0, 10)).toThrow(RangeError);
    });

    it('throws for invalid pageSize', () => {
        expect(() => paginate(items, 1, 0)).toThrow(RangeError);
    });
});

describe('chunkArray', () => {
    it('splits an array into equal chunks', () => {
        const chunks = chunkArray([1, 2, 3, 4, 5, 6], 2);
        expect(chunks).toHaveLength(3);
        expect(chunks[0]).toEqual([1, 2]);
    });

    it('last chunk contains remaining items', () => {
        const chunks = chunkArray([1, 2, 3, 4, 5], 2);
        expect(chunks[chunks.length - 1]).toEqual([5]);
    });

    it('returns an empty array for an empty input', () => {
        expect(chunkArray([], 3)).toEqual([]);
    });

    it('throws for chunk size less than 1', () => {
        expect(() => chunkArray([1, 2, 3], 0)).toThrow(RangeError);
    });
});