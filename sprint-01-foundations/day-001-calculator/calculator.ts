#!/usr/bin/env node

// TypeScript CLI Calculator with BigInt Support
// Day 1 of 300 Days of Code Challenge

import * as readline from 'readline';

// Create interface for reading user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask questions and get user input
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to perform calculations
function calculate(num1: bigint, num2: bigint, operation: string): bigint | string {
  switch (operation) {
    case '+':
    case 'add':
      return num1 + num2;
    
    case '-':
    case 'subtract':
      return num1 - num2;
    
    case '*':
    case 'multiply':
      return num1 * num2;
    
    case '/':
    case 'divide':
      if (num2 === 0n) {
        return 'Error: Cannot divide by zero!';
      }
      return num1 / num2;
    
    case '%':
    case 'modulo':
      if (num2 === 0n) {
        return 'Error: Cannot modulo by zero!';
      }
      return num1 % num2;
    
    case '**':
    case 'power':
      // BigInt power only works with BigInt exponents
      return num1 ** num2;
    
    default:
      return 'Error: Invalid operation!';
  }
}

// Main calculator function
async function runCalculator() {
  console.log('='.repeat(50));
  console.log('🧮 TYPESCRIPT CLI CALCULATOR WITH BIGINT SUPPORT 🧮');
  console.log('='.repeat(50));
  console.log('\nSupports very large numbers!\n');
  console.log('Operations: +, -, *, /, %, ** (power)');
  console.log('Type "exit" to quit\n');
  console.log('='.repeat(50));
  
  let continueCalculating = true;
  
  while (continueCalculating) {
    try {
      // Get first number
      const input1 = await askQuestion('\nEnter first number (or "exit" to quit): ');
      
      if (input1.toLowerCase() === 'exit') {
        console.log('\n👋 Thanks for using the calculator! Goodbye!\n');
        continueCalculating = false;
        break;
      }
      
      // Convert to BigInt
      const num1 = BigInt(input1);
      
      // Get operation
      const operation = await askQuestion('Enter operation (+, -, *, /, %, **): ');
      
      // Get second number
      const input2 = await askQuestion('Enter second number: ');
      const num2 = BigInt(input2);
      
      // Calculate result
      const result = calculate(num1, num2, operation);
      
      // Display result
      console.log('\n' + '-'.repeat(50));
      console.log(`📊 Result: ${result}`);
      console.log('-'.repeat(50));
      
      // Ask if user wants to continue
      const again = await askQuestion('\nCalculate again? (yes/no): ');
      
      if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
        console.log('\n👋 Thanks for using the calculator! Goodbye!\n');
        continueCalculating = false;
      }
      
    } catch (error) {
      if (error instanceof Error) {
        console.log(`\n❌ Error: ${error.message}`);
        console.log('Please enter valid numbers!\n');
      }
    }
  }
  
  rl.close();
}

// Run the calculator
runCalculator();
