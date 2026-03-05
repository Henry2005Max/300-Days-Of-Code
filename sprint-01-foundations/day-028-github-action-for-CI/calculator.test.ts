// calculator.test.ts — Jest tests for the calculator module
// Day 28 of 300 Days of Code Challenge

import { add, subtract, multiply, divide, power, percentage } from './calculator';

describe('Calculator — add()', () => {
  test('adds two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
  test('adds negative numbers', () => {
    expect(add(-5, 3)).toBe(-2);
  });
  test('adds zeros', () => {
    expect(add(0, 0)).toBe(0);
  });
  test('adds large numbers', () => {
    expect(add(1000000, 2000000)).toBe(3000000);
  });
});

describe('Calculator — subtract()', () => {
  test('subtracts two numbers', () => {
    expect(subtract(10, 4)).toBe(6);
  });
  test('subtracts resulting in negative', () => {
    expect(subtract(3, 10)).toBe(-7);
  });
  test('subtracts zero', () => {
    expect(subtract(5, 0)).toBe(5);
  });
});

describe('Calculator — multiply()', () => {
  test('multiplies two positive numbers', () => {
    expect(multiply(4, 5)).toBe(20);
  });
  test('multiplies by zero', () => {
    expect(multiply(99, 0)).toBe(0);
  });
  test('multiplies two negatives', () => {
    expect(multiply(-3, -4)).toBe(12);
  });
  test('multiplies positive and negative', () => {
    expect(multiply(6, -3)).toBe(-18);
  });
});

describe('Calculator — divide()', () => {
  test('divides two numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });
  test('divides resulting in decimal', () => {
    expect(divide(7, 2)).toBe(3.5);
  });
  test('throws on division by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });
  test('divides negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5);
  });
});

describe('Calculator — power()', () => {
  test('raises to power', () => {
    expect(power(2, 10)).toBe(1024);
  });
  test('raises to power of zero', () => {
    expect(power(5, 0)).toBe(1);
  });
  test('raises to power of one', () => {
    expect(power(7, 1)).toBe(7);
  });
});

describe('Calculator — percentage()', () => {
  test('calculates percentage', () => {
    expect(percentage(50, 200)).toBe(25);
  });
  test('calculates 100 percent', () => {
    expect(percentage(100, 100)).toBe(100);
  });
  test('throws when total is zero', () => {
    expect(() => percentage(10, 0)).toThrow('Total cannot be zero');
  });
});