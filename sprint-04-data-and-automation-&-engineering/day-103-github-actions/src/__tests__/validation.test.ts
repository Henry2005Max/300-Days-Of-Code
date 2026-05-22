import { validateOrder, isValidEmail, isValidNigerianPhone, sanitizeInput } from '../validation';

describe('validateOrder', () => {
    const validOrder = {
        orderId:      'ORD-001',
        customerName: 'Adebayo Okafor',
        product:      'Samsung Galaxy A54',
        quantity:     2,
        unitPrice:    195000,
        city:         'Lagos',
    };

    it('accepts a valid order', () => {
        expect(() => validateOrder(validOrder)).not.toThrow();
    });

    it('returns a typed order object', () => {
        const result = validateOrder(validOrder);
        expect(result.orderId).toBe('ORD-001');
        expect(result.quantity).toBe(2);
    });

    it('rejects a missing orderId', () => {
        expect(() => validateOrder({ ...validOrder, orderId: '' })).toThrow();
    });

    it('rejects a negative quantity', () => {
        expect(() => validateOrder({ ...validOrder, quantity: -1 })).toThrow();
    });

    it('rejects a zero unitPrice', () => {
        expect(() => validateOrder({ ...validOrder, unitPrice: 0 })).toThrow();
    });

    it('rejects non-integer quantity', () => {
        expect(() => validateOrder({ ...validOrder, quantity: 1.5 })).toThrow();
    });
});

describe('isValidEmail', () => {
    it('accepts a valid email', () => {
        expect(isValidEmail('henry@gmail.com')).toBe(true);
    });

    it('accepts email with subdomain', () => {
        expect(isValidEmail('user@mail.example.com')).toBe(true);
    });

    it('rejects email without @', () => {
        expect(isValidEmail('invalidemail.com')).toBe(false);
    });

    it('rejects email without domain', () => {
        expect(isValidEmail('user@')).toBe(false);
    });

    it('rejects empty string', () => {
        expect(isValidEmail('')).toBe(false);
    });
});

describe('isValidNigerianPhone', () => {
    it('accepts a valid MTN number', () => {
        expect(isValidNigerianPhone('08012345678')).toBe(true);
    });

    it('accepts with country code prefix', () => {
        expect(isValidNigerianPhone('+2348012345678')).toBe(true);
    });

    it('accepts 234 prefix without +', () => {
        expect(isValidNigerianPhone('2348012345678')).toBe(true);
    });

    it('rejects a number that is too short', () => {
        expect(isValidNigerianPhone('0801234')).toBe(false);
    });

    it('rejects a non-Nigerian prefix', () => {
        expect(isValidNigerianPhone('07712345678')).toBe(false);
    });
});

describe('sanitizeInput', () => {
    it('trims whitespace', () => {
        expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('removes < and > characters', () => {
        expect(sanitizeInput('<script>')).toBe('script');
    });

    it('removes single and double quotes', () => {
        expect(sanitizeInput(`it's a "test"`)).toBe('its a test');
    });

    it('leaves clean input unchanged', () => {
        expect(sanitizeInput('Adebayo Okafor')).toBe('Adebayo Okafor');
    });
});