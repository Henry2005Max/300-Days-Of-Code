// Joke API Fetcher
// Day 16 of 300 Days of Code Challenge

import * as https from 'https';
import * as readline from 'readline';
import chalk from 'chalk';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(answer.trim());
    });
  });
}

//  Types 

interface SingleJoke {
  type: 'single';
  joke: string;
  category: string;
  id: number;
  safe: boolean;
}

interface TwoPartJoke {
  type: 'twopart';
  setup: string;
  delivery: string;
  category: string;
  id: number;
  safe: boolean;
}

type Joke = SingleJoke | TwoPartJoke;

interface JokeAPIResponse {
  error: boolean;
  amount?: number;
  jokes?: Joke[];
  type?: string;
  joke?: string;
  setup?: string;
  delivery?: string;
  category?: string;
  id?: number;
  safe?: boolean;
}

type Category = 'Any' | 'Programming' | 'Misc' | 'Dark' | 'Pun' | 'Spooky' | 'Christmas';

//  API Fetcher 

function fetchFromAPI(url: string): Promise<JokeAPIResponse> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error('Failed to parse API response'));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`Network error: ${err.message}`));
    });
  });
}

//  Fetch Functions 

async function fetchSingleJoke(category: Category = 'Any', safe: boolean = false): Promise<Joke | null> {
  const safeFlag = safe ? '?safe-mode' : '';
  const url = `https://v2.jokeapi.dev/joke/${category}${safeFlag}`;

  const data = await fetchFromAPI(url);
  if (data.error) return null;

  if (data.type === 'single') {
    return {
      type: 'single',
      joke: data.joke!,
      category: data.category!,
      id: data.id!,
      safe: data.safe!
    };
  } else {
    return {
      type: 'twopart',
      setup: data.setup!,
      delivery: data.delivery!,
      category: data.category!,
      id: data.id!,
      safe: data.safe!
    };
  }
}

async function fetchMultipleJokes(amount: number, category: Category = 'Any', safe: boolean = false): Promise<Joke[]> {
  const safeFlag = safe ? '&safe-mode' : '';
  const url = `https://v2.jokeapi.dev/joke/${category}?amount=${amount}${safeFlag}`;

  const data = await fetchFromAPI(url);
  if (data.error || !data.jokes) return [];

  return data.jokes;
}

async function fetchProgrammingJoke(): Promise<Joke | null> {
  return fetchSingleJoke('Programming');
}

// ─── Display Functions ────────────────────────────────────

function displayJoke(joke: Joke, index?: number): void {
  const label = index !== undefined ? `Joke #${index + 1}` : 'Joke';
  const categoryColor = getCategoryColor(joke.category);

  console.log(chalk.bold.cyan(`\n  ${label}`));
  console.log(chalk.gray(`  Category: `) + categoryColor(joke.category) + chalk.gray(` | ID: ${joke.id}`) + (joke.safe ? chalk.green(' | Safe') : chalk.yellow(' | May contain adult content')));
  console.log(chalk.gray('  ' + '─'.repeat(50)));

  if (joke.type === 'single') {
    console.log(chalk.white(`\n  ${joke.joke}\n`));
  } else {
    console.log(chalk.white(`\n  ${joke.setup}`));
    console.log(chalk.yellow(`\n  ... 🥁\n`));
    console.log(chalk.green(`  ${joke.delivery}\n`));
  }
}

function getCategoryColor(category: string): chalk.Chalk {
  const colors: Record<string, chalk.Chalk> = {
    Programming: chalk.blue,
    Misc: chalk.magenta,
    Dark: chalk.red,
    Pun: chalk.yellow,
    Spooky: chalk.gray,
    Christmas: chalk.green,
    Any: chalk.cyan
  };
  return colors[category] || chalk.white;
}

function showCategories(): void {
  console.log(chalk.bold.cyan('\n  Available Categories:\n'));
  const categories = [
    { name: 'Any', desc: 'Random from all categories' },
    { name: 'Programming', desc: 'Coding & tech jokes' },
    { name: 'Misc', desc: 'General jokes' },
    { name: 'Dark', desc: 'Dark humor (not safe)' },
    { name: 'Pun', desc: 'Puns and wordplay' },
    { name: 'Spooky', desc: 'Halloween themed' },
    { name: 'Christmas', desc: 'Holiday jokes' },
  ];

  categories.forEach(({ name, desc }) => {
    const color = getCategoryColor(name);
    console.log(`  ${color(name.padEnd(15))} ${chalk.gray(desc)}`);
  });
  console.log('');
}

// ─── Main Application ─────────────────────────────────────

async function runJokeFetcher(): Promise<void> {
  console.clear();
  console.log(chalk.bold.yellow('═'.repeat(55)));
  console.log(chalk.bold.yellow('           😂 JOKE API FETCHER 😂'));
  console.log(chalk.bold.yellow('═'.repeat(55)));
  console.log(chalk.white('\n   Fetching jokes from JokeAPI.dev\n'));
  console.log(chalk.bold.yellow('═'.repeat(55)));

  let continueRunning = true;

  while (continueRunning) {
    console.log(chalk.bold.cyan('\n  MENU\n'));
    console.log(chalk.white('   1. Get a random joke'));
    console.log(chalk.white('   2. Get a joke by category'));
    console.log(chalk.white('   3. Get a programming joke'));
    console.log(chalk.white('   4. Get multiple jokes'));
    console.log(chalk.white('   5. Safe mode joke (family friendly)'));
    console.log(chalk.white('   6. Show categories'));
    console.log(chalk.white('   7. Exit\n'));

    const choice = await askQuestion(chalk.cyan('  Choose an option (1-7): '));

    if (choice === '7') {
      console.log(chalk.yellow('\n  Why did the programmer quit? Because he did not get arrays! 👋\n'));
      break;
    }

    try {
      switch (choice) {

        // ── Option 1: Random Joke ────────────────────────
        case '1': {
          console.log(chalk.cyan('\n  Fetching joke...'));
          const joke = await fetchSingleJoke();
          if (joke) {
            displayJoke(joke);
          } else {
            console.log(chalk.red('\n  Could not fetch joke. Check your connection.\n'));
          }
          break;
        }

        // ── Option 2: By Category ────────────────────────
        case '2': {
          showCategories();
          const categoryInput = await askQuestion(chalk.cyan('  Enter category: '));
          const category = categoryInput as Category;
          const validCategories: Category[] = ['Any', 'Programming', 'Misc', 'Dark', 'Pun', 'Spooky', 'Christmas'];

          if (!validCategories.includes(category)) {
            console.log(chalk.red('\n  Invalid category!\n'));
            break;
          }

          console.log(chalk.cyan('\n  Fetching joke...'));
          const joke = await fetchSingleJoke(category);
          if (joke) {
            displayJoke(joke);
          } else {
            console.log(chalk.red('\n  Could not fetch joke.\n'));
          }
          break;
        }

        // ── Option 3: Programming Joke ───────────────────
        case '3': {
          console.log(chalk.cyan('\n  Fetching programming joke...'));
          const joke = await fetchProgrammingJoke();
          if (joke) {
            displayJoke(joke);
          } else {
            console.log(chalk.red('\n  Could not fetch joke.\n'));
          }
          break;
        }

        // ── Option 4: Multiple Jokes ─────────────────────
        case '4': {
          const amountInput = await askQuestion(chalk.cyan('\n  How many jokes? (1-10): '));
          const amount = Math.min(Math.max(parseInt(amountInput) || 1, 1), 10);

          showCategories();
          const categoryInput = await askQuestion(chalk.cyan('  Category (press Enter for Any): ')) || 'Any';
          const category = categoryInput as Category;

          console.log(chalk.cyan(`\n  Fetching ${amount} jokes...`));
          const jokes = await fetchMultipleJokes(amount, category);

          if (jokes.length === 0) {
            console.log(chalk.red('\n  Could not fetch jokes.\n'));
            break;
          }

          jokes.forEach((joke, index) => displayJoke(joke, index));
          console.log(chalk.green(`\n  Fetched ${jokes.length} jokes!\n`));
          break;
        }

        // ── Option 5: Safe Mode ──────────────────────────
        case '5': {
          console.log(chalk.cyan('\n  Fetching family-friendly joke...'));
          const joke = await fetchSingleJoke('Any', true);
          if (joke) {
            displayJoke(joke);
          } else {
            console.log(chalk.red('\n  Could not fetch joke.\n'));
          }
          break;
        }

        //  Option 6: Show Categories 
        case '6': {
          showCategories();
          break;
        }

        default:
          console.log(chalk.red('\n  Invalid option! Please choose 1-7.\n'));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red(`\n  Error: ${error.message}`));
        console.log(chalk.yellow('  Make sure you have an internet connection!\n'));
      }
    }

    const again = await askQuestion(chalk.cyan('  Get another joke? (yes/no): '));
    if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
      console.log(chalk.yellow('\n  Why do Java developers wear glasses? Because they do not C#! 👋\n'));
      continueRunning = false;
    }
  }

  rl.close();
}

runJokeFetcher();
