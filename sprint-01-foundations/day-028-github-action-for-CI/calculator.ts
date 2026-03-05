// calculator.ts — The module being tested and built by CI
// Day 28 of 300 Days of Code Challenge

export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function divide(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
}

export function power(base: number, exp: number): number {
  return Math.pow(base, exp);
}

export function percentage(value: number, total: number): number {
  if (total === 0) throw new Error('Total cannot be zero');
  return (value / total) * 100;
}