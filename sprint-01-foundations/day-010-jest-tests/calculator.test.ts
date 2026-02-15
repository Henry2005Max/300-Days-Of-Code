import {
  add,
  subtract,
  multiply,
  divide,
  modulo,
  power,
  calculate,
  isValidNumber,
  isValidOperation
} from './calculator-logic';

//  Addition Tests

describe('add()', () => {
  test('adds two positive numbers', () => {
    expect(add(2n, 3n)).toBe(5n);
  });

  test('adds positive and negative number', () => {
    expect(add(10n, -3n)).toBe(7n);
  });

  test('adds two negative numbers', () => {
    expect(add(-5n, -5n)).toBe(-10n);
  });

  test('adds zero', () => {
    expect(add(100n, 0n)).toBe(100n);
  });

  test('adds very large numbers (BigInt)', () => {
    expect(add(999999999999999999n, 1n)).toBe(1000000000000000000n);
  });
});

// Subtraction Tests 

describe('subtract()', () => {
  test('subtracts two numbers', () => {
    expect(subtract(10n, 3n)).toBe(7n);
  });

  test('subtracts to get negative result', () => {
    expect(subtract(3n, 10n)).toBe(-7n);
  });

  test('subtracts zero', () => {
    expect(subtract(50n, 0n)).toBe(50n);
  });

  test('subtracts same number gives zero', () => {
    expect(subtract(25n, 25n)).toBe(0n);
  });
});

// Multiplication Tests 

describe('multiply()', () => {
  test('multiplies two positive numbers', () => {
    expect(multiply(4n, 5n)).toBe(20n);
  });

  test('multiplies by zero gives zero', () => {
    expect(multiply(100n, 0n)).toBe(0n);
  });

  test('multiplies by one gives same number', () => {
    expect(multiply(77n, 1n)).toBe(77n);
  });

  test('multiplies two negative numbers gives positive', () => {
    expect(multiply(-4n, -5n)).toBe(20n);
  });

  test('multiplies positive and negative gives negative', () => {
    expect(multiply(4n, -5n)).toBe(-20n);
  });

  test('multiplies large numbers correctly', () => {
    expect(multiply(1000000n, 1000000n)).toBe(1000000000000n);
  });
});

// Division Tests 

describe('divide()', () => {
  test('divides evenly', () => {
    expect(divide(10n, 2n)).toBe(5n);
  });

  test('divides with truncation (BigInt floors toward zero)', () => {
    expect(divide(7n, 2n)).toBe(3n);
  });

  test('throws on divide by zero', () => {
    expect(() => divide(10n, 0n)).toThrow('Cannot divide by zero!');
  });

  test('divides negative numbers', () => {
    expect(divide(-10n, 2n)).toBe(-5n);
  });

  test('divides one gives same number', () => {
    expect(divide(99n, 1n)).toBe(99n);
  });
});

//  Modulo Tests 

describe('modulo()', () => {
  test('gets remainder correctly', () => {
    expect(modulo(10n, 3n)).toBe(1n);
  });

  test('even number has zero remainder', () => {
    expect(modulo(10n, 2n)).toBe(0n);
  });

  test('throws on modulo by zero', () => {
    expect(() => modulo(10n, 0n)).toThrow('Cannot modulo by zero!');
  });

  test('modulo of smaller number', () => {
    expect(modulo(3n, 10n)).toBe(3n);
  });
});

//  Power Tests 

describe('power()', () => {
  test('calculates power correctly', () => {
    expect(power(2n, 10n)).toBe(1024n);
  });

  test('power of zero gives one', () => {
    expect(power(5n, 0n)).toBe(1n);
  });

  test('power of one gives same number', () => {
    expect(power(7n, 1n)).toBe(7n);
  });

  test('throws on negative exponent', () => {
    expect(() => power(2n, -1n)).toThrow('BigInt power does not support negative exponents!');
  });

  test('calculates very large power', () => {
    expect(power(2n, 64n)).toBe(18446744073709551616n);
  });
});

// Calculate Function Tests 

describe('calculate()', () => {
  test('handles + operator', () => {
    expect(calculate(5n, 3n, '+')).toBe(8n);
  });

  test('handles - operator', () => {
    expect(calculate(5n, 3n, '-')).toBe(2n);
  });

  test('handles * operator', () => {
    expect(calculate(5n, 3n, '*')).toBe(15n);
  });

  test('handles / operator', () => {
    expect(calculate(6n, 3n, '/')).toBe(2n);
  });

  test('handles % operator', () => {
    expect(calculate(7n, 3n, '%')).toBe(1n);
  });

  test('handles ** operator', () => {
    expect(calculate(2n, 8n, '**')).toBe(256n);
  });

  test('throws on invalid operator', () => {
    expect(() => calculate(5n, 3n, '?')).toThrow('Invalid operation: ?');
  });
});

// Validation Tests 

describe('isValidNumber()', () => {
  test('valid integer returns true', () => {
    expect(isValidNumber('123')).toBe(true);
  });

  test('negative integer returns true', () => {
    expect(isValidNumber('-456')).toBe(true);
  });

  test('very large number returns true', () => {
    expect(isValidNumber('99999999999999999999')).toBe(true);
  });

  test('decimal returns false', () => {
    expect(isValidNumber('12.5')).toBe(false);
  });

  test('text returns false', () => {
    expect(isValidNumber('hello')).toBe(false);
  });

  test('empty string returns false', () => {
    expect(isValidNumber('')).toBe(false);
  });
});

describe('isValidOperation()', () => {
  test('+ is valid', () => {
    expect(isValidOperation('+')).toBe(true);
  });

  test('- is valid', () => {
    expect(isValidOperation('-')).toBe(true);
  });

  test('* is valid', () => {
    expect(isValidOperation('*')).toBe(true);
  });

  test('/ is valid', () => {
    expect(isValidOperation('/')).toBe(true);
  });

  test('% is valid', () => {
    expect(isValidOperation('%')).toBe(true);
  });

  test('** is valid', () => {
    expect(isValidOperation('**')).toBe(true);
  });

  test('? is invalid', () => {
    expect(isValidOperation('?')).toBe(false);
  });

  test('empty string is invalid', () => {
    expect(isValidOperation('')).toBe(false);
  });
});
