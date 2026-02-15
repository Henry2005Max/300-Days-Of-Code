

// Currency Converter with NGN Focus
// Day 8 of 300 Days of Code Challenge

import axios from 'axios';
import * as readline from 'readline';
import chalk from 'chalk';

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask questions
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Supported currencies with names
const CURRENCIES: { [key: string]: string } = {
  NGN: '🇳🇬 Nigerian Naira',
  USD: '🇺🇸 US Dollar',
  EUR: '🇪🇺 Euro',
  GBP: '🇬🇧 British Pound',
  CAD: '🇨🇦 Canadian Dollar',
  AUD: '🇦🇺 Australian Dollar',
  JPY: '🇯🇵 Japanese Yen',
  CNY: '🇨🇳 Chinese Yuan',
  GHS: '🇬🇭 Ghanaian Cedi',
  KES: '🇰🇪 Kenyan Shilling',
  ZAR: '🇿🇦 South African Rand',
  EGP: '🇪🇬 Egyptian Pound',
};

// Fallback rates (in case API is unavailable)
// Rates relative to 1 USD (approximate)
const FALLBACK_RATES: { [key: string]: number } = {
  NGN: 1580,
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.53,
  JPY: 149.5,
  CNY: 7.24,
  GHS: 12.5,
  KES: 129.5,
  ZAR: 18.63,
  EGP: 30.9,
};

// Interface for exchange rates
interface ExchangeRates {
  base: string;
  rates: { [key: string]: number };
  source: 'api' | 'fallback';
  timestamp?: string;
}

// Fetch live exchange rates
async function fetchExchangeRates(baseCurrency: string): Promise<ExchangeRates> {
  try {
    // Using exchangerate-api.com (free tier)
    const response = await axios.get(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`,
      { timeout: 5000 }
    );

    return {
      base: baseCurrency,
      rates: response.data.rates,
      source: 'api',
      timestamp: new Date().toLocaleString()
    };
  } catch (error) {
    console.log(chalk.yellow('\n  ⚠️  Could not fetch live rates. Using fallback rates.\n'));

    // Convert fallback rates to be relative to base currency
    const baseRate = FALLBACK_RATES[baseCurrency] || 1;
    const convertedRates: { [key: string]: number } = {};

    for (const [currency, rate] of Object.entries(FALLBACK_RATES)) {
      convertedRates[currency] = rate / baseRate;
    }

    return {
      base: baseCurrency,
      rates: convertedRates,
      source: 'fallback'
    };
  }
}

// Convert currency
function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: ExchangeRates
): number {
  // If base is from currency, direct conversion
  if (rates.base === fromCurrency) {
    return amount * (rates.rates[toCurrency] || 0);
  }

  // Convert through base currency
  const toBase = 1 / (rates.rates[fromCurrency] || 1);
  const fromBase = rates.rates[toCurrency] || 0;
  return amount * toBase * fromBase;
}

// Format currency amount
function formatAmount(amount: number, currency: string): string {
  if (currency === 'JPY') {
    return Math.round(amount).toLocaleString();
  }
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Display conversion result
function displayResult(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  result: number,
  rates: ExchangeRates
): void {
  const fromName = CURRENCIES[fromCurrency] || fromCurrency;
  const toName = CURRENCIES[toCurrency] || toCurrency;
  const rate = convertCurrency(1, fromCurrency, toCurrency, rates);

  console.log(chalk.gray('\n' + '═'.repeat(55)));
  console.log(chalk.bold.green('\n  💱 CONVERSION RESULT\n'));

  console.log(
    chalk.white('  ') +
    chalk.bold.yellow(`${formatAmount(amount, fromCurrency)} ${fromCurrency}`) +
    chalk.white(' → ') +
    chalk.bold.green(`${formatAmount(result, toCurrency)} ${toCurrency}`)
  );

  console.log(chalk.gray(`\n  ${fromName}`));
  console.log(chalk.gray(`  ${toName}`));

  console.log(chalk.cyan(`\n  Exchange Rate: 1 ${fromCurrency} = ${formatAmount(rate, toCurrency)} ${toCurrency}`));

  if (rates.source === 'api') {
    console.log(chalk.green(`  ✅ Live rate as of ${rates.timestamp}`));
  } else {
    console.log(chalk.yellow('  ⚠️  Using approximate fallback rates'));
  }

  console.log(chalk.gray('\n' + '═'.repeat(55)));
}

// Display NGN focused rates
async function displayNGNRates(): Promise<void> {
  console.log(chalk.cyan('\n  🔍 Fetching NGN rates...\n'));

  const rates = await fetchExchangeRates('NGN');

  console.log(chalk.bold.green('═'.repeat(55)));
  console.log(chalk.bold.yellow('  🇳🇬 NGN EXCHANGE RATES\n'));

  const targetCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'GHS', 'KES', 'ZAR'];

  for (const currency of targetCurrencies) {
    if (rates.rates[currency]) {
      const rate = rates.rates[currency];
      const name = CURRENCIES[currency] || currency;
      const formattedRate = formatAmount(rate, currency);

      console.log(
        chalk.white('  1 NGN = ') +
        chalk.bold.yellow(`${formattedRate} ${currency}`) +
        chalk.gray(` (${name.split(' ').slice(1).join(' ')})`)
      );
    }
  }

  // Also show how much 1 USD = NGN
  const usdToNgn = convertCurrency(1, 'USD', 'NGN', rates);
  console.log(chalk.gray('\n  ' + '─'.repeat(40)));
  console.log(
    chalk.white('  1 USD = ') +
    chalk.bold.green(`${formatAmount(usdToNgn, 'NGN')} NGN`)
  );

  if (rates.source === 'api') {
    console.log(chalk.green(`\n  ✅ Live rates as of ${rates.timestamp}`));
  } else {
    console.log(chalk.yellow('\n  ⚠️  Using approximate fallback rates'));
  }

  console.log(chalk.bold.green('═'.repeat(55)));
}

// Display all supported currencies
function displayCurrencies(): void {
  console.log(chalk.bold.cyan('\n  💴 SUPPORTED CURRENCIES\n'));

  Object.entries(CURRENCIES).forEach(([code, name]) => {
    console.log(chalk.white(`  ${code.padEnd(6)} ${name}`));
  });

  console.log('');
}

// Quick convert multiple amounts
async function quickConvertNGN(): Promise<void> {
  console.log(chalk.bold.cyan('\n  ⚡ QUICK NGN CONVERTER\n'));

  const rates = await fetchExchangeRates('NGN');
  const amounts = [1000, 5000, 10000, 50000, 100000, 500000, 1000000];
  const targetCurrency = 'USD';

  console.log(chalk.bold.yellow(`  NGN → USD Quick Reference:\n`));
  console.log(chalk.gray('  ' + '─'.repeat(35)));

  for (const amount of amounts) {
    const result = convertCurrency(amount, 'NGN', targetCurrency, rates);
    console.log(
      chalk.white(`  ₦${amount.toLocaleString().padEnd(12)}`) +
      chalk.bold.green(`$${formatAmount(result, targetCurrency)}`)
    );
  }

  console.log(chalk.gray('  ' + '─'.repeat(35)));

  if (rates.source === 'api') {
    console.log(chalk.green(`\n  ✅ Live rates as of ${rates.timestamp}\n`));
  } else {
    console.log(chalk.yellow('\n  ⚠️  Using approximate fallback rates\n'));
  }
}

// Main application
async function runCurrencyConverter() {
  console.clear();
  console.log(chalk.bold.green('═'.repeat(55)));
  console.log(chalk.bold.green('        💱 CURRENCY CONVERTER 💱'));
  console.log(chalk.bold.yellow('          🇳🇬 NGN FOCUSED 🇳🇬'));
  console.log(chalk.bold.green('═'.repeat(55)));
  console.log(chalk.white('\n   Convert between world currencies easily!\n'));
  console.log(chalk.bold.green('═'.repeat(55)));

  let continueRunning = true;

  while (continueRunning) {
    try {
      console.log(chalk.bold.cyan('\n📋 MAIN MENU\n'));
      console.log(chalk.white('   1. Convert any currency'));
      console.log(chalk.white('   2. View NGN exchange rates'));
      console.log(chalk.white('   3. Quick NGN → USD reference'));
      console.log(chalk.white('   4. View supported currencies'));
      console.log(chalk.white('   5. Exit\n'));

      const choice = await askQuestion(chalk.cyan('Choose an option (1-5): '));

      if (choice === '5') {
        console.log(chalk.green('\n👋 Happy converting! Goodbye!\n'));
        continueRunning = false;
        break;
      }

      switch (choice) {
        case '1': {
          // Convert any currency
          displayCurrencies();

          const fromCurrency = (await askQuestion(chalk.cyan('  From currency (e.g., NGN): '))).toUpperCase();

          if (!CURRENCIES[fromCurrency]) {
            console.log(chalk.red(`\n  ❌ Currency "${fromCurrency}" not supported!`));
            break;
          }

          const toCurrency = (await askQuestion(chalk.cyan('  To currency (e.g., USD): '))).toUpperCase();

          if (!CURRENCIES[toCurrency]) {
            console.log(chalk.red(`\n  ❌ Currency "${toCurrency}" not supported!`));
            break;
          }

          const amountInput = await askQuestion(chalk.cyan(`  Amount in ${fromCurrency}: `));
          const amount = parseFloat(amountInput);

          if (isNaN(amount) || amount <= 0) {
            console.log(chalk.red('\n  ❌ Please enter a valid amount!'));
            break;
          }

          console.log(chalk.cyan('\n  🔍 Fetching exchange rates...'));
          const rates = await fetchExchangeRates(fromCurrency);
          const result = convertCurrency(amount, fromCurrency, toCurrency, rates);

          displayResult(amount, fromCurrency, toCurrency, result, rates);
          break;
        }

        case '2': {
          // NGN rates
          await displayNGNRates();
          break;
        }

        case '3': {
          // Quick NGN reference
          await quickConvertNGN();
          break;
        }

        case '4': {
          // Show currencies
          displayCurrencies();
          break;
        }

        default:
          console.log(chalk.red('\n  ❌ Invalid option! Please choose 1-5.'));
      }

      const again = await askQuestion(chalk.cyan('\nConvert again? (yes/no): '));
      if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
        console.log(chalk.green('\n👋 Happy converting! Goodbye!\n'));
        continueRunning = false;
      }

    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
      }
    }
  }

  rl.close();
}

// Run the application
runCurrencyConverter();
