# Day 10: Review - Jest Tests for Calculator

##  Description
Day 10 is a review day! Instead of building something new, we went back to Day 1's calculator and added proper Jest tests. This is how real developers work - writing tests to make sure code works correctly and doesn't break when you make changes!

##  Features
-  **40+ Tests** - Comprehensive test coverage
-  **All Operations Tested** - add, subtract, multiply, divide, modulo, power
-  **Edge Cases** - Zero, negatives, large numbers
-  **Error Testing** - Division by zero, invalid operators
-  **Validation Tests** - Input and operation validation
-  **Coverage Reports** - See exactly what's tested
-  **Watch Mode** - Auto re-run tests on file changes

## Technologies Used
- TypeScript
- Jest (testing framework)
- ts-jest (TypeScript + Jest integration)
- @types/jest (TypeScript types for Jest)

##  Installation

```bash
npm install
```

##  How to Run Tests

### Run all tests once:
```bash
npm test
```

### Watch mode (re-runs on save):
```bash
npm run test:watch
```

### With coverage report:
```bash
npm run test:coverage
```

##  Expected Output

```
PASS  calculator.test.ts

  add()
    ✓ adds two positive numbers (2ms)
    ✓ adds positive and negative number (1ms)
    ✓ adds two negative numbers
    ✓ adds zero
    ✓ adds very large numbers (BigInt)

  subtract()
    ✓ subtracts two numbers
    ✓ subtracts to get negative result
    ✓ subtracts zero
    ✓ subtracts same number gives zero

  multiply()
    ✓ multiplies two positive numbers
    ✓ multiplies by zero gives zero
    ✓ multiplies by one gives same number
    ✓ multiplies two negative numbers gives positive
    ✓ multiplies positive and negative gives negative
    ✓ multiplies large numbers correctly

  divide()
    ✓ divides evenly
    ✓ divides with truncation
    ✓ throws on divide by zero
    ✓ divides negative numbers
    ✓ divides one gives same number

  modulo()
    ✓ gets remainder correctly
    ✓ even number has zero remainder
    ✓ throws on modulo by zero
    ✓ modulo of smaller number

  power()
    ✓ calculates power correctly
    ✓ power of zero gives one
    ✓ power of one gives same number
    ✓ throws on negative exponent
    ✓ calculates very large power

  calculate()
    ✓ handles + operator
    ✓ handles - operator
    ✓ handles * operator
    ✓ handles / operator
    ✓ handles % operator
    ✓ handles ** operator
    ✓ throws on invalid operator

  isValidNumber()
    ✓ valid integer returns true
    ✓ negative integer returns true
    ✓ very large number returns true
    ✓ decimal returns false
    ✓ text returns false
    ✓ empty string returns false

  isValidOperation()
    ✓ + is valid
    ✓ - is valid
    ✓ * is valid
    ✓ / is valid
    ✓ % is valid
    ✓ ** is valid
    ✓ ? is invalid
    ✓ empty string is invalid

Tests: 45 passed, 45 total
```

##  What I Learned
- How to write unit tests with Jest
- describe() blocks for grouping related tests
- test() and expect() functions
- toBe() matcher for exact equality
- toThrow() matcher for expected errors
- ts-jest for running TypeScript tests
- Test coverage reports
- Watch mode for TDD workflow
- Why testing matters in real projects
- Separating logic from UI for testability

##  Test Structure

```typescript
// Group related tests
describe('functionName()', () => {

  // Individual test case
  test('describes what it should do', () => {

    // Arrange, Act, Assert
    expect(add(2n, 3n)).toBe(5n);

  });

  // Test for errors
  test('throws on bad input', () => {
    expect(() => divide(10n, 0n)).toThrow('Cannot divide by zero!');
  });

});
```

##  Why Testing Matters

### Without Tests:
- You change code and don't know if it broke
- Manual testing takes forever
- Bugs reach production

### With Tests:
- Change code confidently
- Tests catch bugs instantly
- Automatic verification
- Documentation of expected behavior

##  Future Improvements
- Add integration tests
- Test the CLI interface
- Add performance tests
- Test edge cases for very large BigInts
- Add snapshot testing
- CI/CD pipeline integration

##  Challenge Info
**Day:** 10/300  
**Sprint:** 1 - Foundations  
**Date:** Sun Feb 15 
**Previous Day:** [Day 9 - Encryption](../day-009-encryption)  
**Next Day:** [Day 11 - Unit Converter](../day-011-unit-converter)  

---

Part of my 300 Days of Code Challenge! 
