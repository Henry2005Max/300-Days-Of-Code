import { formatNaira, convertUsdToNgn, applyDiscount, parseNaira } from '../currency';

describe('formatNaira', () => {
    it('formats a whole number correctly', () => {
        expect(formatNaira(1000)).toMatch(/₦1,000\.00/);
    });

    it('formats a decimal correctly', () => {
        expect(formatNaira(1580.50)).toMatch(/₦1,580\.50/);
    });

    it('formats zero', () => {
        expect(formatNaira(0)).toMatch(/₦0\.00/);
    });

    it('formats large amounts with commas', () => {
        expect(formatNaira(1_000_000)).toMatch(/₦1,000,000\.00/);
    });

    it('throws TypeError for non-number input', () => {
        expect(() => formatNaira(NaN)).toThrow(TypeError);
    });
});

describe('convertUsdToNgn', () => {
    const RATE = 1582.50;

    it('converts 1 USD correctly', () => {
        expect(convertUsdToNgn(1, RATE)).toBe(1582.50);
    });

    it('converts 0 USD to 0 NGN', () => {
        expect(convertUsdToNgn(0, RATE)).toBe(0);
    });

    it('rounds to 2 decimal places', () => {
        expect(convertUsdToNgn(1, 1582.333)).toBe(1582.33);
    });

    it('throws for negative USD', () => {
        expect(() => convertUsdToNgn(-1, RATE)).toThrow(RangeError);
    });

    it('throws for zero or negative rate', () => {
        expect(() => convertUsdToNgn(100, 0)).toThrow(RangeError);
        expect(() => convertUsdToNgn(100, -1)).toThrow(RangeError);
    });
});

describe('applyDiscount', () => {
    it('applies a 10% discount correctly', () => {
        expect(applyDiscount(10000, 10)).toBe(9000);
    });

    it('applies 0% discount — price unchanged', () => {
        expect(applyDiscount(5000, 0)).toBe(5000);
    });

    it('applies 100% discount — price is 0', () => {
        expect(applyDiscount(5000, 100)).toBe(0);
    });

    it('throws for discount below 0', () => {
        expect(() => applyDiscount(5000, -5)).toThrow(RangeError);
    });

    it('throws for discount above 100', () => {
        expect(() => applyDiscount(5000, 101)).toThrow(RangeError);
    });
});

describe('parseNaira', () => {
    it('parses a plain number string', () => {
        expect(parseNaira('1500')).toBe(1500);
    });

    it('parses with Naira symbol', () => {
        expect(parseNaira('₦1,500.00')).toBe(1500);
    });

    it('parses with commas', () => {
        expect(parseNaira('1,000,000')).toBe(1000000);
    });

    it('throws for invalid input', () => {
        expect(() => parseNaira('abc')).toThrow(TypeError);
    });
});