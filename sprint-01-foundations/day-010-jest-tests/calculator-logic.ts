// Calculator Logic - Extracted for testing
// Day 10 of 300 Days of Code Challenge

// ─── Basic Operations ────────────────────────────────────

export function add(a: bigint, b: bigint): bigint {
  return a + b;
}

export function subtract(a: bigint, b: bigint): bigint {
  return a - b;
}

export function multiply(a: bigint, b: bigint): bigint {
  return a * b;
}

export function divide(a: bigint, b: bigint): bigint {
  if (b === 0n) {
    throw new Error('Cannot divide by zero!');
  }
  return a / b;
}

export function modulo(a: bigint, b: bigint): bigint {
  if (b === 0n) {
    throw new Error('Cannot modulo by zero!');
  }
  return a % b;
}

export function power(a: bigint, b: bigint): bigint {
  if (b < 0n) {
    throw new Error('BigInt power does not support negative exponents!');
  }
  return a ** b;
}

// ─── Validation ──────────────────────────────────────────

export function isValidNumber(input: string): boolean {
  try {
    BigInt(input);
    return true;
  } catch {
    return false;
  }
}

export function isValidOperation(op: string): boolean {
  return ['+', '-', '*', '/', '%', '**'].includes(op);
}

// ─── Main Calculate Function ─────────────────────────────

export function calculate(a: bigint, b: bigint, operation: string): bigint {
  switch (operation) {
    case '+': return add(a, b);
    case '-': return subtract(a, b);
    case '*': return multiply(a, b);
    case '/': return divide(a, b);
    case '%': return modulo(a, b);
    case '**': return power(a, b);
    default:
      throw new Error(`Invalid operation: ${operation}`);
  }
}
