// Currency utilities — Nigerian Naira focus

export function formatNaira(amount: number): string {
    if (typeof amount !== 'number' || isNaN(amount)) {
        throw new TypeError(`Expected a number, got ${typeof amount}`);
    }
    return `₦${amount.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export function convertUsdToNgn(usd: number, rate: number): number {
    if (usd < 0)   throw new RangeError('USD amount cannot be negative');
    if (rate <= 0) throw new RangeError('Exchange rate must be positive');
    return parseFloat((usd * rate).toFixed(2));
}

export function applyDiscount(price: number, discountPct: number): number {
    if (discountPct < 0 || discountPct > 100) {
        throw new RangeError('Discount must be between 0 and 100');
    }
    return parseFloat((price * (1 - discountPct / 100)).toFixed(2));
}

export function parseNaira(input: string): number {
    const cleaned = input.replace(/[₦,\s]/g, '');
    const value   = parseFloat(cleaned);
    if (isNaN(value)) throw new TypeError(`Cannot parse "${input}" as a Naira amount`);
    return value;
}