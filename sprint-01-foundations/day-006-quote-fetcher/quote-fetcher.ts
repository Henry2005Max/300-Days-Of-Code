

// Random Quote Fetcher
// Day 6 of 300 Days of Code Challenge

import axios from 'axios';
import * as readline from 'readline';
import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// File to store favorite quotes
const FAVORITES_FILE = path.join(process.cwd(), 'favorite-quotes.json');

// Interface for Quote
interface Quote {
  text: string;
  author: string;
  category?: string;
}

// Function to ask questions
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Fetch random quote from API
async function fetchRandomQuote(): Promise<Quote | null> {
  try {
    console.log(chalk.cyan('\n🔍 Fetching a random quote...\n'));
    
    // Using quotable.io API (free, no key needed)
    const response = await axios.get('https://api.quotable.io/random');
    
    return {
      text: response.data.content,
      author: response.data.author,
      category: response.data.tags?.join(', ')
    };
  } catch (error) {
    console.log(chalk.red('❌ Error fetching quote. Please try again.'));
    return null;
  }
}

// Fetch quote by category
async function fetchQuoteByCategory(category: string): Promise<Quote | null> {
  try {
    console.log(chalk.cyan(`\n🔍 Fetching a ${category} quote...\n`));
    
    const response = await axios.get(`https://api.quotable.io/random?tags=${category}`);
    
    return {
      text: response.data.content,
      author: response.data.author,
      category: response.data.tags?.join(', ')
    };
  } catch (error) {
    console.log(chalk.red(`❌ No quotes found for category: ${category}`));
    return null;
  }
}

// Fetch quote by author
async function fetchQuoteByAuthor(author: string): Promise<Quote | null> {
  try {
    console.log(chalk.cyan(`\n🔍 Fetching a quote by ${author}...\n`));
    
    const response = await axios.get(`https://api.quotable.io/random?author=${author}`);
    
    return {
      text: response.data.content,
      author: response.data.author,
      category: response.data.tags?.join(', ')
    };
  } catch (error) {
    console.log(chalk.red(`❌ No quotes found by author: ${author}`));
    return null;
  }
}

// Fetch multiple quotes
async function fetchMultipleQuotes(count: number): Promise<Quote[]> {
  console.log(chalk.cyan(`\n🔍 Fetching ${count} random quotes...\n`));
  
  const quotes: Quote[] = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const response = await axios.get('https://api.quotable.io/random');
      quotes.push({
        text: response.data.content,
        author: response.data.author,
        category: response.data.tags?.join(', ')
      });
    } catch (error) {
      // Continue even if one fails
    }
  }
  
  return quotes;
}

// Display a quote beautifully
function displayQuote(quote: Quote, index?: number): void {
  const border = '═'.repeat(80);
  const prefix = index !== undefined ? `${index}. ` : '';
  
  console.log(chalk.gray(border));
  console.log(chalk.white.bold(`\n${prefix}"${quote.text}"\n`));
  console.log(chalk.yellow(`— ${quote.author}`));
  
  if (quote.category) {
    console.log(chalk.cyan(`📚 Category: ${quote.category}`));
  }
  
  console.log(chalk.gray(border));
}

// Load favorite quotes
async function loadFavorites(): Promise<Quote[]> {
  try {
    const data = await fs.readFile(FAVORITES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Save favorite quotes
async function saveFavorites(favorites: Quote[]): Promise<void> {
  await fs.writeFile(FAVORITES_FILE, JSON.stringify(favorites, null, 2));
}

// Add quote to favorites
async function addToFavorites(quote: Quote): Promise<void> {
  const favorites = await loadFavorites();
  
  // Check if already exists
  const exists = favorites.some(
    fav => fav.text === quote.text && fav.author === quote.author
  );
  
  if (exists) {
    console.log(chalk.yellow('\n⚠️  This quote is already in your favorites!'));
    return;
  }
  
  favorites.push(quote);
  await saveFavorites(favorites);
  
  console.log(chalk.green('\n💾 Quote added to favorites!'));
}

// Show favorite quotes
async function showFavorites(): Promise<void> {
  const favorites = await loadFavorites();
  
  if (favorites.length === 0) {
    console.log(chalk.yellow('\n📝 No favorite quotes yet! Add some while browsing.'));
    return;
  }
  
  console.log(chalk.bold.cyan('\n⭐ YOUR FAVORITE QUOTES ⭐\n'));
  
  favorites.forEach((quote, index) => {
    displayQuote(quote, index + 1);
    console.log('');
  });
  
  console.log(chalk.gray(`Total favorites: ${favorites.length}\n`));
}

// Delete a favorite
async function deleteFavorite(index: number): Promise<void> {
  const favorites = await loadFavorites();
  
  if (index < 1 || index > favorites.length) {
    console.log(chalk.red('\n❌ Invalid favorite number!'));
    return;
  }
  
  const deleted = favorites.splice(index - 1, 1)[0];
  await saveFavorites(favorites);
  
  console.log(chalk.green('\n🗑️  Favorite removed!'));
  console.log(chalk.gray(`"${deleted.text}" — ${deleted.author}`));
}

// Get quote of the day
async function getQuoteOfTheDay(): Promise<Quote | null> {
  try {
    console.log(chalk.cyan('\n🌅 Fetching Quote of the Day...\n'));
    
    // Use a specific endpoint or just random with seed based on date
    const today = new Date().toISOString().split('T')[0];
    const response = await axios.get(`https://api.quotable.io/random?seed=${today}`);
    
    return {
      text: response.data.content,
      author: response.data.author,
      category: response.data.tags?.join(', ')
    };
  } catch (error) {
    console.log(chalk.red('❌ Error fetching quote of the day.'));
    return null;
  }
}

// List available categories
function showCategories(): void {
  console.log(chalk.bold.cyan('\n📚 POPULAR QUOTE CATEGORIES\n'));
  
  const categories = [
    'wisdom', 'inspiration', 'success', 'life', 'happiness',
    'love', 'friendship', 'science', 'technology', 'education',
    'humor', 'history', 'philosophy', 'famous-quotes'
  ];
  
  categories.forEach((cat, index) => {
    const color = index % 3 === 0 ? chalk.yellow : index % 3 === 1 ? chalk.green : chalk.blue;
    console.log(color(`   • ${cat}`));
  });
  
  console.log('');
}

// Get random motivational quote
async function getMotivationalQuote(): Promise<Quote | null> {
  const categories = ['inspiration', 'success', 'wisdom', 'famous-quotes'];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  
  return fetchQuoteByCategory(randomCategory);
}

// Main application
async function runQuoteFetcher() {
  console.clear();
  console.log(chalk.bold.magenta('═'.repeat(80)));
  console.log(chalk.bold.magenta('                    💬 RANDOM QUOTE FETCHER 💬'));
  console.log(chalk.bold.magenta('═'.repeat(80)));
  console.log(chalk.white('\n         Get inspired with quotes from great minds!\n'));
  console.log(chalk.bold.magenta('═'.repeat(80)));
  
  let continueRunning = true;

  while (continueRunning) {
    try {
      console.log(chalk.bold.cyan('\n📋 MAIN MENU\n'));
      console.log(chalk.white('   1. Random quote'));
      console.log(chalk.white('   2. Quote by category'));
      console.log(chalk.white('   3. Quote by author'));
      console.log(chalk.white('   4. Get 5 random quotes'));
      console.log(chalk.white('   5. Quote of the day'));
      console.log(chalk.white('   6. Motivational quote'));
      console.log(chalk.white('   7. View favorite quotes'));
      console.log(chalk.white('   8. Show categories'));
      console.log(chalk.white('   9. Exit\n'));

      const choice = await askQuestion(chalk.cyan('Choose an option (1-9): '));

      if (choice === '9') {
        console.log(chalk.magenta('\n👋 Stay inspired! Goodbye!\n'));
        continueRunning = false;
        break;
      }

      let quote: Quote | null = null;
      let quotes: Quote[] = [];

      switch (choice) {
        case '1': {
          // Random quote
          quote = await fetchRandomQuote();
          if (quote) {
            displayQuote(quote);
            
            const save = await askQuestion(chalk.yellow('\nSave to favorites? (yes/no): '));
            if (save.toLowerCase() === 'yes' || save.toLowerCase() === 'y') {
              await addToFavorites(quote);
            }
          }
          break;
        }

        case '2': {
          // Quote by category
          showCategories();
          const category = await askQuestion(chalk.cyan('\nEnter category: '));
          quote = await fetchQuoteByCategory(category.toLowerCase());
          
          if (quote) {
            displayQuote(quote);
            
            const save = await askQuestion(chalk.yellow('\nSave to favorites? (yes/no): '));
            if (save.toLowerCase() === 'yes' || save.toLowerCase() === 'y') {
              await addToFavorites(quote);
            }
          }
          break;
        }

        case '3': {
          // Quote by author
          const author = await askQuestion(chalk.cyan('\nEnter author name: '));
          quote = await fetchQuoteByAuthor(author);
          
          if (quote) {
            displayQuote(quote);
            
            const save = await askQuestion(chalk.yellow('\nSave to favorites? (yes/no): '));
            if (save.toLowerCase() === 'yes' || save.toLowerCase() === 'y') {
              await addToFavorites(quote);
            }
          }
          break;
        }

        case '4': {
          // Multiple quotes
          quotes = await fetchMultipleQuotes(5);
          
          if (quotes.length > 0) {
            console.log(chalk.bold.green(`\n📚 ${quotes.length} RANDOM QUOTES:\n`));
            quotes.forEach((q, i) => {
              displayQuote(q, i + 1);
              console.log('');
            });
          }
          break;
        }

        case '5': {
          // Quote of the day
          quote = await getQuoteOfTheDay();
          if (quote) {
            console.log(chalk.bold.yellow('\n🌅 QUOTE OF THE DAY 🌅\n'));
            displayQuote(quote);
            
            const save = await askQuestion(chalk.yellow('\nSave to favorites? (yes/no): '));
            if (save.toLowerCase() === 'yes' || save.toLowerCase() === 'y') {
              await addToFavorites(quote);
            }
          }
          break;
        }

        case '6': {
          // Motivational quote
          quote = await getMotivationalQuote();
          if (quote) {
            console.log(chalk.bold.green('\n💪 MOTIVATIONAL QUOTE 💪\n'));
            displayQuote(quote);
            
            const save = await askQuestion(chalk.yellow('\nSave to favorites? (yes/no): '));
            if (save.toLowerCase() === 'yes' || save.toLowerCase() === 'y') {
              await addToFavorites(quote);
            }
          }
          break;
        }

        case '7': {
          // View favorites
          await showFavorites();
          
          const favorites = await loadFavorites();
          if (favorites.length > 0) {
            const deletePrompt = await askQuestion(chalk.yellow('Delete a favorite? (enter number or "no"): '));
            
            if (deletePrompt.toLowerCase() !== 'no' && deletePrompt.toLowerCase() !== 'n') {
              const deleteIndex = parseInt(deletePrompt);
              if (!isNaN(deleteIndex)) {
                await deleteFavorite(deleteIndex);
              }
            }
          }
          break;
        }

        case '8': {
          // Show categories
          showCategories();
          break;
        }

        default:
          console.log(chalk.red('\n❌ Invalid option! Please choose 1-9.'));
      }

      // Ask to continue
      if (choice !== '7' && choice !== '8') {
        const again = await askQuestion(chalk.cyan('\nGet another quote? (yes/no): '));
        if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
          console.log(chalk.magenta('\n👋 Stay inspired! Goodbye!\n'));
          continueRunning = false;
        }
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
runQuoteFetcher();
