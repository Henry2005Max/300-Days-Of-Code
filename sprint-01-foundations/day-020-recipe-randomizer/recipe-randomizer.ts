#!/usr/bin/env node

// Recipe Randomizer
// Day 20 of 300 Days of Code Challenge

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

interface Recipe {
  id: number;
  name: string;
  category: Category;
  cuisine: Cuisine;
  difficulty: Difficulty;
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  ingredients: string[];
  steps: string[];
  tags: string[];
}

type Category = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert' | 'Drink';
type Cuisine = 'Nigerian' | 'Italian' | 'Asian' | 'American' | 'Mediterranean' | 'Mexican';
type Difficulty = 'Easy' | 'Medium' | 'Hard';

// ─── Recipe Data ──────────────────────────────────────────

const recipes: Recipe[] = [
  {
    id: 1,
    name: 'Jollof Rice',
    category: 'Dinner',
    cuisine: 'Nigerian',
    difficulty: 'Medium',
    prepTime: 20,
    cookTime: 45,
    servings: 6,
    ingredients: [
      '3 cups long grain parboiled rice',
      '1 can (400g) crushed tomatoes',
      '3 red bell peppers',
      '2 scotch bonnet peppers',
      '1 large onion',
      '3 tbsp tomato paste',
      '3 cups chicken stock',
      '1/4 cup vegetable oil',
      'Salt, curry powder, thyme to taste',
    ],
    steps: [
      'Blend tomatoes, peppers and half the onion into a smooth paste.',
      'Heat oil in a pot, fry remaining sliced onion until golden.',
      'Add tomato paste, fry for 5 minutes until it darkens.',
      'Add blended pepper mix, cook on medium heat for 20 minutes.',
      'Add chicken stock, salt and spices, bring to a boil.',
      'Wash rice and add to the pot, stir well.',
      'Cover tightly and cook on low heat for 30 minutes.',
      'Fluff with a fork and serve hot.',
    ],
    tags: ['rice', 'tomato', 'spicy', 'classic', 'party'],
  },
  {
    id: 2,
    name: 'Egusi Soup',
    category: 'Dinner',
    cuisine: 'Nigerian',
    difficulty: 'Medium',
    prepTime: 30,
    cookTime: 60,
    servings: 8,
    ingredients: [
      '2 cups ground egusi (melon seeds)',
      '500g assorted meat (beef, tripe)',
      '200g stockfish',
      '3 cups palm oil',
      '2 cups blended pepper mix',
      '1 bunch leafy greens (ugu or spinach)',
      '2 stock cubes',
      'Salt and crayfish to taste',
    ],
    steps: [
      'Cook assorted meat with salt, onion and stock cubes until tender.',
      'Heat palm oil in a pot, add blended peppers, fry for 15 minutes.',
      'Mix egusi with water to form a thick paste.',
      'Drop spoonfuls of egusi paste into the pot, do not stir yet.',
      'Cover and cook for 10 minutes until egusi sets.',
      'Stir, add cooked meat and stockfish, add stock if needed.',
      'Cook for another 15 minutes, add leafy greens.',
      'Simmer for 5 minutes and serve with pounded yam or fufu.',
    ],
    tags: ['soup', 'palm oil', 'traditional', 'protein'],
  },
  {
    id: 3,
    name: 'Suya',
    category: 'Snack',
    cuisine: 'Nigerian',
    difficulty: 'Medium',
    prepTime: 40,
    cookTime: 20,
    servings: 4,
    ingredients: [
      '500g beef sirloin, thinly sliced',
      '3 tbsp ground peanuts',
      '1 tsp ground ginger',
      '1 tsp paprika',
      '1 tsp garlic powder',
      '1/2 tsp cayenne pepper',
      '1 tsp onion powder',
      'Salt to taste',
      'Vegetable oil for basting',
    ],
    steps: [
      'Mix all spices and ground peanuts together to make yaji spice.',
      'Coat beef slices generously with the spice mix.',
      'Marinate for at least 30 minutes (overnight is better).',
      'Thread beef onto skewers.',
      'Grill on high heat, turning every 3-4 minutes.',
      'Baste with oil while grilling.',
      'Cook until charred at edges but juicy inside.',
      'Serve with sliced onions, tomatoes and extra yaji.',
    ],
    tags: ['grilled', 'beef', 'spicy', 'street food', 'skewer'],
  },
  {
    id: 4,
    name: 'Spaghetti Aglio e Olio',
    category: 'Dinner',
    cuisine: 'Italian',
    difficulty: 'Easy',
    prepTime: 5,
    cookTime: 20,
    servings: 2,
    ingredients: [
      '200g spaghetti',
      '6 cloves garlic, thinly sliced',
      '1/2 cup olive oil',
      '1/2 tsp red chili flakes',
      'Large handful fresh parsley',
      'Salt and black pepper',
      'Parmesan cheese (optional)',
    ],
    steps: [
      'Cook spaghetti in heavily salted boiling water until al dente.',
      'Reserve 1 cup of pasta water before draining.',
      'Heat olive oil in a wide pan over medium heat.',
      'Add garlic slices, cook gently until golden (not brown).',
      'Add chili flakes, cook 30 seconds.',
      'Add drained pasta to the pan, toss well.',
      'Add pasta water gradually, tossing until silky.',
      'Finish with parsley, salt, pepper and parmesan.',
    ],
    tags: ['pasta', 'garlic', 'quick', 'simple', 'vegetarian'],
  },
  {
    id: 5,
    name: 'Fried Rice',
    category: 'Lunch',
    cuisine: 'Asian',
    difficulty: 'Easy',
    prepTime: 15,
    cookTime: 15,
    servings: 4,
    ingredients: [
      '3 cups cooked day-old rice',
      '3 eggs',
      '1 cup mixed vegetables (peas, carrots, corn)',
      '3 tbsp soy sauce',
      '2 tbsp sesame oil',
      '3 cloves garlic, minced',
      '2 spring onions, sliced',
      'Vegetable oil for frying',
    ],
    steps: [
      'Heat oil in a wok or large pan on very high heat.',
      'Add garlic, fry for 30 seconds.',
      'Push to side, scramble eggs in the center.',
      'Add mixed vegetables, stir fry for 2 minutes.',
      'Add cold rice, break up any clumps.',
      'Add soy sauce and sesame oil, toss everything together.',
      'Cook on high heat for 3-4 minutes until slightly crispy.',
      'Top with spring onions and serve immediately.',
    ],
    tags: ['rice', 'eggs', 'quick', 'leftover rice', 'wok'],
  },
  {
    id: 6,
    name: 'Pancakes',
    category: 'Breakfast',
    cuisine: 'American',
    difficulty: 'Easy',
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    ingredients: [
      '2 cups all-purpose flour',
      '2 tbsp sugar',
      '1 tsp baking powder',
      '1/2 tsp baking soda',
      '1/2 tsp salt',
      '2 cups buttermilk',
      '2 eggs',
      '3 tbsp melted butter',
      'Maple syrup and butter to serve',
    ],
    steps: [
      'Mix flour, sugar, baking powder, baking soda and salt in a bowl.',
      'In another bowl, whisk buttermilk, eggs and melted butter.',
      'Pour wet ingredients into dry, stir until just combined (lumps are fine).',
      'Let batter rest for 5 minutes.',
      'Heat a non-stick pan on medium heat, lightly butter it.',
      'Pour 1/4 cup batter per pancake.',
      'Cook until bubbles form and edges look set, about 2 minutes.',
      'Flip and cook another 1-2 minutes until golden.',
      'Serve with maple syrup and butter.',
    ],
    tags: ['breakfast', 'fluffy', 'sweet', 'morning', 'classic'],
  },
  {
    id: 7,
    name: 'Puff Puff',
    category: 'Snack',
    cuisine: 'Nigerian',
    difficulty: 'Easy',
    prepTime: 60,
    cookTime: 20,
    servings: 6,
    ingredients: [
      '3 cups all-purpose flour',
      '1/2 cup sugar',
      '1 tsp instant yeast',
      '1/2 tsp salt',
      '1/2 tsp nutmeg',
      '1.5 cups warm water',
      'Vegetable oil for deep frying',
    ],
    steps: [
      'Mix flour, sugar, yeast, salt and nutmeg in a bowl.',
      'Add warm water gradually, mix until smooth batter forms.',
      'Cover with cling wrap and leave to rise for 45-60 minutes.',
      'Heat vegetable oil in a deep pot to 180°C.',
      'Wet your hand or use a spoon to drop small balls of batter.',
      'Fry in batches, turning until golden brown all over.',
      'Drain on paper towels.',
      'Dust with powdered sugar if desired and serve warm.',
    ],
    tags: ['fried', 'dough', 'sweet', 'street food', 'Nigerian snack'],
  },
  {
    id: 8,
    name: 'Chocolate Mug Cake',
    category: 'Dessert',
    cuisine: 'American',
    difficulty: 'Easy',
    prepTime: 5,
    cookTime: 2,
    servings: 1,
    ingredients: [
      '4 tbsp all-purpose flour',
      '4 tbsp sugar',
      '2 tbsp cocoa powder',
      '1 egg',
      '3 tbsp milk',
      '3 tbsp vegetable oil',
      'Pinch of salt',
      'Splash of vanilla extract',
    ],
    steps: [
      'Add flour, sugar, cocoa and salt to a large mug, mix well.',
      'Add egg and mix into the dry ingredients.',
      'Add milk, oil and vanilla, stir until smooth.',
      'Microwave on high for 90 seconds.',
      'Check center — if still wet, microwave in 15-second bursts.',
      'Let cool for 1 minute (it will be very hot).',
      'Top with ice cream or whipped cream if desired.',
      'Eat straight from the mug!',
    ],
    tags: ['chocolate', 'quick', 'microwave', 'single serve', 'dessert'],
  },
  {
    id: 9,
    name: 'Chapman Drink',
    category: 'Drink',
    cuisine: 'Nigerian',
    difficulty: 'Easy',
    prepTime: 10,
    cookTime: 0,
    servings: 4,
    ingredients: [
      '1 bottle Fanta Orange',
      '1 bottle Sprite',
      '4 tbsp Ribena (blackcurrant drink)',
      '2 tbsp Angostura bitters',
      '1 cucumber, sliced',
      '1 orange, sliced',
      'Ice cubes',
      'Mint leaves (optional)',
    ],
    steps: [
      'Fill a large jug with plenty of ice.',
      'Add sliced cucumber and orange to the jug.',
      'Pour in Ribena and Angostura bitters.',
      'Add Fanta Orange and Sprite slowly to preserve fizz.',
      'Stir gently, taste and adjust Ribena for sweetness.',
      'Garnish with mint leaves.',
      'Serve immediately in glasses over ice.',
    ],
    tags: ['drink', 'refreshing', 'Nigerian classic', 'no alcohol', 'party'],
  },
  {
    id: 10,
    name: 'Tacos',
    category: 'Dinner',
    cuisine: 'Mexican',
    difficulty: 'Easy',
    prepTime: 15,
    cookTime: 15,
    servings: 4,
    ingredients: [
      '500g ground beef',
      '8 small corn or flour tortillas',
      '1 packet taco seasoning',
      '1 cup shredded lettuce',
      '1 cup diced tomatoes',
      '1 cup shredded cheese',
      '1/2 cup sour cream',
      '1 avocado, sliced',
      'Lime and hot sauce to serve',
    ],
    steps: [
      'Brown ground beef in a pan over medium-high heat, breaking it up.',
      'Drain excess fat, add taco seasoning and water per packet instructions.',
      'Simmer for 5 minutes until sauce thickens.',
      'Warm tortillas in a dry pan or microwave.',
      'Set up toppings: lettuce, tomatoes, cheese, sour cream, avocado.',
      'Fill each tortilla with beef and desired toppings.',
      'Squeeze lime over the top.',
      'Serve immediately with hot sauce on the side.',
    ],
    tags: ['beef', 'mexican', 'quick', 'customizable', 'family'],
  },
];

// ─── Helper Functions ─────────────────────────────────────

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomRecipe(): Recipe {
  return getRandom(recipes);
}

function filterRecipes(
  category?: Category,
  cuisine?: Cuisine,
  difficulty?: Difficulty
): Recipe[] {
  return recipes.filter(r => {
    if (category && r.category !== category) return false;
    if (cuisine && r.cuisine !== cuisine) return false;
    if (difficulty && r.difficulty !== difficulty) return false;
    return true;
  });
}

function searchByTag(tag: string): Recipe[] {
  return recipes.filter(r =>
    r.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
}

// ─── Display Functions ────────────────────────────────────

function displayRecipe(recipe: Recipe): void {
  const totalTime = recipe.prepTime + recipe.cookTime;

  console.log(chalk.bold.yellow('\n  ═'.repeat(28)));
  console.log(chalk.bold.yellow(`\n  ${recipe.name.toUpperCase()}`));
  console.log(chalk.bold.yellow('  ═'.repeat(28)));

  console.log(
    chalk.cyan('\n  Category  : ') + chalk.white(recipe.category) +
    chalk.cyan('   Cuisine : ') + chalk.white(recipe.cuisine)
  );
  console.log(
    chalk.cyan('  Difficulty: ') + chalk.white(recipe.difficulty) +
    chalk.cyan('   Servings: ') + chalk.white(`${recipe.servings} people`)
  );
  console.log(
    chalk.cyan('  Prep Time : ') + chalk.white(`${recipe.prepTime} min`) +
    chalk.cyan('   Cook Time: ') + chalk.white(`${recipe.cookTime} min`) +
    chalk.cyan('   Total: ') + chalk.white(`${totalTime} min`)
  );
  console.log(chalk.cyan('  Tags      : ') + chalk.gray(recipe.tags.join(', ')));

  console.log(chalk.bold.cyan('\n  INGREDIENTS:\n'));
  recipe.ingredients.forEach(ing => {
    console.log(chalk.white(`    • ${ing}`));
  });

  console.log(chalk.bold.cyan('\n  STEPS:\n'));
  recipe.steps.forEach((step, i) => {
    console.log(chalk.yellow(`    ${i + 1}. `) + chalk.white(step));
  });

  console.log('');
}

function displayRecipeList(recipeList: Recipe[]): void {
  if (recipeList.length === 0) {
    console.log(chalk.red('\n  No recipes found matching your filters.\n'));
    return;
  }

  console.log(chalk.bold.cyan(`\n  Found ${recipeList.length} recipe(s):\n`));
  recipeList.forEach((r, i) => {
    const time = r.prepTime + r.cookTime;
    console.log(
      chalk.white(`  ${i + 1}. `) +
      chalk.yellow(r.name.padEnd(25)) +
      chalk.gray(`${r.cuisine.padEnd(14)}`) +
      chalk.green(r.difficulty.padEnd(8)) +
      chalk.cyan(`${time} min`)
    );
  });
  console.log('');
}

// ─── Main Application ─────────────────────────────────────

async function runRecipeRandomizer(): Promise<void> {
  console.clear();
  console.log(chalk.bold.red('═'.repeat(55)));
  console.log(chalk.bold.red('            RECIPE RANDOMIZER'));
  console.log(chalk.bold.red('═'.repeat(55)));
  console.log(chalk.white('\n   10 recipes — Nigerian, Italian, Asian & more!\n'));
  console.log(chalk.bold.red('═'.repeat(55)));

  let continueRunning = true;

  while (continueRunning) {
    console.log(chalk.bold.cyan('\n  MENU\n'));
    console.log(chalk.white('   1. Get a random recipe'));
    console.log(chalk.white('   2. Browse by category'));
    console.log(chalk.white('   3. Browse by cuisine'));
    console.log(chalk.white('   4. Browse by difficulty'));
    console.log(chalk.white('   5. Search by tag'));
    console.log(chalk.white('   6. See all recipes'));
    console.log(chalk.white('   7. Exit\n'));

    const choice = await askQuestion(chalk.cyan('  Choose an option (1-7): '));

    if (choice === '7') {
      console.log(chalk.red('\n  Happy cooking! 👨‍🍳 Goodbye!\n'));
      break;
    }

    try {
      switch (choice) {

        // ── Option 1: Random Recipe ──────────────────────
        case '1': {
          const recipe = getRandomRecipe();
          displayRecipe(recipe);
          break;
        }

        // ── Option 2: By Category ────────────────────────
        case '2': {
          const categories: Category[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Drink'];
          console.log(chalk.cyan('\n  Categories: ') + chalk.white(categories.join(', ')));
          const input = await askQuestion(chalk.cyan('  Enter category: '));
          const match = categories.find(c => c.toLowerCase() === input.toLowerCase());

          if (!match) {
            console.log(chalk.red('\n  Invalid category!\n'));
            break;
          }

          const filtered = filterRecipes(match);
          displayRecipeList(filtered);

          if (filtered.length > 0) {
            const pick = await askQuestion(chalk.cyan('  Enter number to see full recipe (or press Enter to skip): '));
            const index = parseInt(pick) - 1;
            if (!isNaN(index) && filtered[index]) {
              displayRecipe(filtered[index]);
            }
          }
          break;
        }

        // ── Option 3: By Cuisine ─────────────────────────
        case '3': {
          const cuisines: Cuisine[] = ['Nigerian', 'Italian', 'Asian', 'American', 'Mediterranean', 'Mexican'];
          console.log(chalk.cyan('\n  Cuisines: ') + chalk.white(cuisines.join(', ')));
          const input = await askQuestion(chalk.cyan('  Enter cuisine: '));
          const match = cuisines.find(c => c.toLowerCase() === input.toLowerCase());

          if (!match) {
            console.log(chalk.red('\n  Invalid cuisine!\n'));
            break;
          }

          const filtered = filterRecipes(undefined, match);
          displayRecipeList(filtered);

          if (filtered.length > 0) {
            const pick = await askQuestion(chalk.cyan('  Enter number to see full recipe (or press Enter to skip): '));
            const index = parseInt(pick) - 1;
            if (!isNaN(index) && filtered[index]) {
              displayRecipe(filtered[index]);
            }
          }
          break;
        }

        // ── Option 4: By Difficulty ──────────────────────
        case '4': {
          const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];
          console.log(chalk.cyan('\n  Difficulties: ') + chalk.white(difficulties.join(', ')));
          const input = await askQuestion(chalk.cyan('  Enter difficulty: '));
          const match = difficulties.find(d => d.toLowerCase() === input.toLowerCase());

          if (!match) {
            console.log(chalk.red('\n  Invalid difficulty!\n'));
            break;
          }

          const filtered = filterRecipes(undefined, undefined, match);
          displayRecipeList(filtered);

          if (filtered.length > 0) {
            const pick = await askQuestion(chalk.cyan('  Enter number to see full recipe (or press Enter to skip): '));
            const index = parseInt(pick) - 1;
            if (!isNaN(index) && filtered[index]) {
              displayRecipe(filtered[index]);
            }
          }
          break;
        }

        // ── Option 5: Search by Tag ──────────────────────
        case '5': {
          const input = await askQuestion(chalk.cyan('\n  Search tag (e.g. spicy, quick, rice): '));
          if (!input) {
            console.log(chalk.red('\n  Please enter a tag!\n'));
            break;
          }

          const results = searchByTag(input);
          displayRecipeList(results);

          if (results.length > 0) {
            const pick = await askQuestion(chalk.cyan('  Enter number to see full recipe (or press Enter to skip): '));
            const index = parseInt(pick) - 1;
            if (!isNaN(index) && results[index]) {
              displayRecipe(results[index]);
            }
          }
          break;
        }

        // ── Option 6: All Recipes ────────────────────────
        case '6': {
          displayRecipeList(recipes);
          const pick = await askQuestion(chalk.cyan('  Enter number to see full recipe (or press Enter to skip): '));
          const index = parseInt(pick) - 1;
          if (!isNaN(index) && recipes[index]) {
            displayRecipe(recipes[index]);
          }
          break;
        }

        default:
          console.log(chalk.red('\n  Invalid option! Please choose 1-7.\n'));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red(`\n  Error: ${error.message}\n`));
      }
    }

    const again = await askQuestion(chalk.cyan('  Browse more recipes? (yes/no): '));
    if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
      console.log(chalk.red('\n  Happy cooking! 👨‍🍳 Goodbye!\n'));
      continueRunning = false;
    }
  }

  rl.close();
}

runRecipeRandomizer();