#!/usr/bin/env node

// node-fetch for APIs
// Day 22 of 300 Days of Code Challenge

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

// ─── Types ────────────────────────────────────────────────

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: { name: string };
  address: { city: string; street: string };
}

interface Pokemon {
  name: string;
  id: number;
  height: number;
  weight: number;
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { ability: { name: string } }[];
}

interface CryptoPrice {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

interface JokeResponse {
  setup?: string;
  delivery?: string;
  joke?: string;
  type: string;
}

// ─── Fetch Wrapper ────────────────────────────────────────

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

// ─── API Functions ────────────────────────────────────────

async function fetchPosts(limit: number = 5): Promise<Post[]> {
  const posts = await fetchJSON<Post[]>('https://jsonplaceholder.typicode.com/posts');
  return posts.slice(0, limit);
}

async function fetchUsers(): Promise<User[]> {
  return fetchJSON<User[]>('https://jsonplaceholder.typicode.com/users');
}

async function fetchPostsByUser(userId: number): Promise<Post[]> {
  return fetchJSON<Post[]>(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
}

async function fetchPokemon(nameOrId: string): Promise<Pokemon> {
  return fetchJSON<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${nameOrId.toLowerCase()}`);
}

async function fetchCryptoPrices(): Promise<CryptoPrice[]> {
  return fetchJSON<CryptoPrice[]>(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,cardano,dogecoin&order=market_cap_desc'
  );
}

async function fetchJoke(): Promise<JokeResponse> {
  return fetchJSON<JokeResponse>('https://v2.jokeapi.dev/joke/Programming');
}

// ─── Display Functions ────────────────────────────────────

function displayPosts(posts: Post[]): void {
  console.log(chalk.bold.cyan(`\n  Posts from JSONPlaceholder API:\n`));
  posts.forEach(post => {
    console.log(chalk.yellow(`  #${post.id} — `) + chalk.white(post.title));
    console.log(chalk.gray(`       User ID: ${post.userId}\n`));
  });
}

function displayUsers(users: User[]): void {
  console.log(chalk.bold.cyan(`\n  Users from JSONPlaceholder API:\n`));
  users.forEach(user => {
    console.log(chalk.yellow(`  ${user.id}. ${user.name}`));
    console.log(chalk.gray(`     Username : @${user.username}`));
    console.log(chalk.gray(`     Email    : ${user.email}`));
    console.log(chalk.gray(`     Company  : ${user.company.name}`));
    console.log(chalk.gray(`     City     : ${user.address.city}\n`));
  });
}

function displayPokemon(p: Pokemon): void {
  console.log(chalk.bold.yellow(`\n  #${p.id} — ${p.name.toUpperCase()}\n`));
  console.log(chalk.cyan('  Types   : ') + chalk.white(p.types.map(t => t.type.name).join(', ')));
  console.log(chalk.cyan('  Height  : ') + chalk.white(`${p.height / 10}m`));
  console.log(chalk.cyan('  Weight  : ') + chalk.white(`${p.weight / 10}kg`));
  console.log(chalk.cyan('  Abilities: ') + chalk.white(p.abilities.map(a => a.ability.name).join(', ')));
  console.log(chalk.cyan('\n  Base Stats:'));
  p.stats.forEach(s => {
    const bar = '█'.repeat(Math.floor(s.base_stat / 10));
    console.log(chalk.gray(`    ${s.stat.name.padEnd(18)} `) + chalk.green(`${String(s.base_stat).padStart(3)} `) + chalk.blue(bar));
  });
  console.log('');
}

function displayCrypto(coins: CryptoPrice[]): void {
  console.log(chalk.bold.cyan(`\n  Crypto Prices (USD) — CoinGecko API:\n`));
  coins.forEach(coin => {
    const change = coin.price_change_percentage_24h;
    const changeColor = change >= 0 ? chalk.green : chalk.red;
    const arrow = change >= 0 ? '▲' : '▼';

    console.log(
      chalk.yellow(`  ${coin.name.padEnd(12)}`) +
      chalk.gray(`${coin.symbol.toUpperCase().padEnd(6)}`) +
      chalk.white(`$${coin.current_price.toLocaleString().padEnd(14)}`) +
      changeColor(`${arrow} ${Math.abs(change).toFixed(2)}%`)
    );
  });
  console.log('');
}

function displayJoke(joke: JokeResponse): void {
  console.log(chalk.bold.cyan('\n  Programming Joke — JokeAPI:\n'));
  if (joke.type === 'twopart') {
    console.log(chalk.white(`  ${joke.setup}`));
    console.log(chalk.yellow('\n  ... 🥁\n'));
    console.log(chalk.green(`  ${joke.delivery}\n`));
  } else {
    console.log(chalk.white(`  ${joke.joke}\n`));
  }
}

// ─── Main Application ─────────────────────────────────────

async function runNodeFetch(): Promise<void> {
  console.clear();
  console.log(chalk.bold.green('═'.repeat(55)));
  console.log(chalk.bold.green('           NODE-FETCH FOR APIS — DAY 22'));
  console.log(chalk.bold.green('═'.repeat(55)));
  console.log(chalk.white('\n   Fetching real data from multiple public APIs!\n'));
  console.log(chalk.bold.green('═'.repeat(55)));

  let continueRunning = true;

  while (continueRunning) {
    console.log(chalk.bold.cyan('\n  MENU\n'));
    console.log(chalk.white('   1. Fetch posts       (JSONPlaceholder API)'));
    console.log(chalk.white('   2. Fetch users       (JSONPlaceholder API)'));
    console.log(chalk.white('   3. Fetch user posts  (JSONPlaceholder API)'));
    console.log(chalk.white('   4. Fetch a Pokemon   (PokeAPI)'));
    console.log(chalk.white('   5. Crypto prices     (CoinGecko API)'));
    console.log(chalk.white('   6. Programming joke  (JokeAPI)'));
    console.log(chalk.white('   7. Exit\n'));

    const choice = await askQuestion(chalk.cyan('  Choose an option (1-7): '));

    if (choice === '7') {
      console.log(chalk.green('\n  APIs mastered! Day 22 done! 👋\n'));
      break;
    }

    try {
      switch (choice) {

        // ── Option 1: Fetch Posts ────────────────────────
        case '1': {
          const limitInput = await askQuestion(chalk.cyan('\n  How many posts? (default: 5): '));
          const limit = parseInt(limitInput) || 5;
          console.log(chalk.cyan('\n  Fetching posts...'));
          const posts = await fetchPosts(limit);
          displayPosts(posts);
          break;
        }

        // ── Option 2: Fetch Users ────────────────────────
        case '2': {
          console.log(chalk.cyan('\n  Fetching users...'));
          const users = await fetchUsers();
          displayUsers(users);
          break;
        }

        // ── Option 3: Posts by User ──────────────────────
        case '3': {
          const userInput = await askQuestion(chalk.cyan('\n  Enter user ID (1-10): '));
          const userId = parseInt(userInput);
          if (isNaN(userId) || userId < 1 || userId > 10) {
            console.log(chalk.red('\n  Invalid user ID! Enter a number between 1-10.\n'));
            break;
          }
          console.log(chalk.cyan(`\n  Fetching posts for user ${userId}...`));
          const posts = await fetchPostsByUser(userId);
          console.log(chalk.bold.cyan(`\n  Posts by User ${userId} (${posts.length} total):\n`));
          posts.forEach(post => {
            console.log(chalk.yellow(`  #${post.id} — `) + chalk.white(post.title));
          });
          console.log('');
          break;
        }

        // ── Option 4: Pokemon ────────────────────────────
        case '4': {
          const input = await askQuestion(chalk.cyan('\n  Enter Pokemon name or ID (e.g. pikachu, 25): '));
          if (!input) {
            console.log(chalk.red('\n  Please enter a name or ID!\n'));
            break;
          }
          console.log(chalk.cyan(`\n  Fetching ${input}...`));
          const pokemon = await fetchPokemon(input);
          displayPokemon(pokemon);
          break;
        }

        // ── Option 5: Crypto ─────────────────────────────
        case '5': {
          console.log(chalk.cyan('\n  Fetching crypto prices...'));
          console.log(chalk.gray('  (Bitcoin, Ethereum, Solana, Cardano, Dogecoin)\n'));
          const coins = await fetchCryptoPrices();
          displayCrypto(coins);
          break;
        }

        // ── Option 6: Joke ───────────────────────────────
        case '6': {
          console.log(chalk.cyan('\n  Fetching programming joke...'));
          const joke = await fetchJoke();
          displayJoke(joke);
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

    const again = await askQuestion(chalk.cyan('  Fetch more data? (yes/no): '));
    if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
      console.log(chalk.green('\n  APIs mastered! Day 22 done! 👋\n'));
      continueRunning = false;
    }
  }

  rl.close();
}

runNodeFetch();
