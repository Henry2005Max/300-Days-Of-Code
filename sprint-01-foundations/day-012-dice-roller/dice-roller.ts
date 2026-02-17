// Dice Roller
// Day 12 of 300 Days of Code Challenge

import * as readline from 'readline';
import * as crypto from 'crypto';
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

//  Dice Types 

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];

//  Secure Random Roll 

function rollDie(sides: number): number {
  const randomBuffer = crypto.randomBytes(4);
  const randomNumber = randomBuffer.readUInt32BE(0);
  return (randomNumber % sides) + 1;
}

//  Roll Multiple Dice 

function rollMultiple(count: number, sides: number): number[] {
  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(rollDie(sides));
  }
  return results;
}

//  Dice Visual 

function getDiceEmoji(value: number, sides: number): string {
  if (sides === 6) {
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return faces[value - 1];
  }
  return `[${value}]`;
}

function getResultColor(value: number, sides: number): string {
  if (value === sides) return chalk.bold.yellow(`${value} 🎉 CRITICAL!`);
  if (value === 1) return chalk.bold.red(`${value} 💀 CRITICAL FAIL!`);
  if (value >= Math.ceil(sides * 0.75)) return chalk.green(`${value}`);
  if (value <= Math.ceil(sides * 0.25)) return chalk.red(`${value}`);
  return chalk.white(`${value}`);
}

//  Display Roll Results 

function displayRollResults(results: number[], sides: number, modifier: number = 0): void {
  const total = results.reduce((sum, val) => sum + val, 0) + modifier;
  const count = results.length;

  console.log(chalk.gray('\n  ' + '─'.repeat(50)));
  console.log(chalk.bold.yellow(`\n  🎲 ROLLING ${count}d${sides}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}\n`));

  // Show each die
  results.forEach((result, index) => {
    const emoji = getDiceEmoji(result, sides);
    const colored = getResultColor(result, sides);
    console.log(`  Die ${index + 1}: ${emoji}  ${colored}`);
  });

  // Show total if multiple dice or modifier
  if (count > 1 || modifier !== 0) {
    console.log(chalk.gray('\n  ' + '─'.repeat(30)));

    if (modifier !== 0) {
      console.log(chalk.white(`  Dice Sum:  ${results.reduce((a, b) => a + b, 0)}`));
      console.log(chalk.white(`  Modifier:  ${modifier > 0 ? '+' : ''}${modifier}`));
    }

    console.log(chalk.bold.cyan(`  Total:     ${total}`));
    console.log(chalk.gray(`  Average:   ${(results.reduce((a, b) => a + b, 0) / count).toFixed(1)}`));
    console.log(chalk.gray(`  Min Roll:  ${Math.min(...results)}`));
    console.log(chalk.gray(`  Max Roll:  ${Math.max(...results)}`));
  }

  console.log(chalk.gray('\n  ' + '─'.repeat(50) + '\n'));
}

//  Statistics 

function showStats(results: number[], sides: number): void {
  const total = results.reduce((a, b) => a + b, 0);
  const avg = total / results.length;
  const min = Math.min(...results);
  const max = Math.max(...results);

  // Count frequencies
  const freq: { [key: number]: number } = {};
  results.forEach(r => { freq[r] = (freq[r] || 0) + 1; });

  console.log(chalk.bold.cyan('\n  📊 ROLL STATISTICS\n'));
  console.log(chalk.white(`  Total Rolls: ${results.length}`));
  console.log(chalk.white(`  Sum:         ${total}`));
  console.log(chalk.white(`  Average:     ${avg.toFixed(2)}`));
  console.log(chalk.white(`  Min:         ${min}`));
  console.log(chalk.white(`  Max:         ${max}`));

  console.log(chalk.bold.cyan('\n  📈 FREQUENCY\n'));
  Object.entries(freq)
    .sort(([a], [b]) => Number(a) - Number(b))
    .forEach(([val, count]) => {
      const bar = '█'.repeat(count);
      const pct = ((count / results.length) * 100).toFixed(1);
      console.log(chalk.white(`  ${String(val).padStart(3)}: `) + chalk.green(bar) + chalk.gray(` (${count}x, ${pct}%)`));
    });

  console.log('');
}

//  Preset Games 

async function dungeonMode(): Promise<void> {
  console.log(chalk.bold.magenta('\n  ⚔️  DUNGEON & DRAGONS MODE\n'));
  console.log(chalk.white('  Roll for your character stats!\n'));

  const stats = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];

  for (const stat of stats) {
    // Roll 4d6, drop lowest
    const rolls = rollMultiple(4, 6);
    const sorted = [...rolls].sort((a, b) => a - b);
    const dropped = sorted[0];
    const kept = sorted.slice(1);
    const total = kept.reduce((a, b) => a + b, 0);

    console.log(chalk.cyan(`  ${stat.padEnd(15)}`));
    console.log(chalk.gray(`  Rolled: [${rolls.join(', ')}] → dropped ${dropped} → kept [${kept.join(', ')}]`));
    console.log(chalk.bold.yellow(`  Score: ${total}\n`));

    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

async function pokerDice(): Promise<void> {
  console.log(chalk.bold.yellow('\n  🃏 POKER DICE\n'));

  const rolls = rollMultiple(5, 6);
  console.log(chalk.white('  Your dice: ') + rolls.map(r => getDiceEmoji(r, 6)).join(' '));

  // Count frequencies
  const freq: { [key: number]: number } = {};
  rolls.forEach(r => { freq[r] = (freq[r] || 0) + 1; });
  const counts = Object.values(freq).sort((a, b) => b - a);

  let hand = '';
  if (counts[0] === 5) hand = '🎯 FIVE OF A KIND!';
  else if (counts[0] === 4) hand = '🔥 FOUR OF A KIND!';
  else if (counts[0] === 3 && counts[1] === 2) hand = '🏠 FULL HOUSE!';
  else if (counts[0] === 3) hand = '✨ THREE OF A KIND!';
  else if (counts[0] === 2 && counts[1] === 2) hand = '👥 TWO PAIR!';
  else if (counts[0] === 2) hand = '👤 ONE PAIR!';
  else hand = '😢 HIGH CARD';

  console.log(chalk.bold.yellow(`\n  Result: ${hand}\n`));
}

//  Main Application 

async function runDiceRoller() {
  console.clear();
  console.log(chalk.bold.red('═'.repeat(55)));
  console.log(chalk.bold.red('              🎲 DICE ROLLER 🎲'));
  console.log(chalk.bold.red('═'.repeat(55)));
  console.log(chalk.white('\n   Cryptographically secure dice rolling!\n'));
  console.log(chalk.bold.red('═'.repeat(55)));

  const rollHistory: number[] = [];
  let lastSides = 6;

  let continueRunning = true;

  while (continueRunning) {
    console.log(chalk.bold.cyan('\n📋 MENU\n'));
    console.log(chalk.white('   1. Roll a single die'));
    console.log(chalk.white('   2. Roll multiple dice'));
    console.log(chalk.white('   3. Roll with modifier (e.g. 2d6+3)'));
    console.log(chalk.white('   4. Stress test (roll 100 times + stats)'));
    console.log(chalk.white('   5. D&D character stats'));
    console.log(chalk.white('   6. Poker dice'));
    console.log(chalk.white('   7. Exit\n'));

    const choice = await askQuestion(chalk.cyan('Choose an option (1-7): '));

    if (choice === '7') {
      console.log(chalk.red('\n👋 May your rolls always be natural 20s! Goodbye!\n'));
      break;
    }

    try {
      switch (choice) {
        case '1': {
          console.log(chalk.cyan('\n  Available dice: d4, d6, d8, d10, d12, d20, d100\n'));
          const sidesInput = await askQuestion(chalk.cyan('  Number of sides (e.g. 6 for d6): '));
          const sides = parseInt(sidesInput);

          if (!DICE_TYPES.includes(sides)) {
            console.log(chalk.red(`\n  ❌ Invalid die! Choose from: ${DICE_TYPES.map(d => `d${d}`).join(', ')}\n`));
            break;
          }

          const result = rollDie(sides);
          lastSides = sides;
          rollHistory.push(result);
          displayRollResults([result], sides);
          break;
        }

        case '2': {
          console.log(chalk.cyan('\n  Available dice: d4, d6, d8, d10, d12, d20, d100\n'));
          const sidesInput = await askQuestion(chalk.cyan('  Number of sides (e.g. 6 for d6): '));
          const countInput = await askQuestion(chalk.cyan('  How many dice? (1-20): '));

          const sides = parseInt(sidesInput);
          const count = parseInt(countInput);

          if (!DICE_TYPES.includes(sides)) {
            console.log(chalk.red(`\n  ❌ Invalid die! Choose from: ${DICE_TYPES.map(d => `d${d}`).join(', ')}\n`));
            break;
          }

          if (isNaN(count) || count < 1 || count > 20) {
            console.log(chalk.red('\n  ❌ Count must be between 1 and 20!\n'));
            break;
          }

          const results = rollMultiple(count, sides);
          lastSides = sides;
          rollHistory.push(...results);
          displayRollResults(results, sides);
          break;
        }

        case '3': {
          console.log(chalk.gray('\n  Format: e.g. type "6" for sides, "2" for count, "3" for modifier\n'));
          const sidesInput = await askQuestion(chalk.cyan('  Die sides (e.g. 6): '));
          const countInput = await askQuestion(chalk.cyan('  Number of dice (e.g. 2): '));
          const modInput = await askQuestion(chalk.cyan('  Modifier (e.g. 3 or -1): '));

          const sides = parseInt(sidesInput);
          const count = parseInt(countInput);
          const modifier = parseInt(modInput) || 0;

          if (!DICE_TYPES.includes(sides)) {
            console.log(chalk.red(`\n  ❌ Invalid die!\n`));
            break;
          }

          const results = rollMultiple(count, sides);
          lastSides = sides;
          rollHistory.push(...results);
          displayRollResults(results, sides, modifier);
          break;
        }

        case '4': {
          console.log(chalk.cyan('\n  Available dice: d4, d6, d8, d10, d12, d20, d100\n'));
          const sidesInput = await askQuestion(chalk.cyan('  Which die to stress test? (e.g. 6): '));
          const sides = parseInt(sidesInput);

          if (!DICE_TYPES.includes(sides)) {
            console.log(chalk.red(`\n  ❌ Invalid die!\n`));
            break;
          }

          console.log(chalk.cyan(`\n  🔄 Rolling d${sides} 100 times...\n`));
          const results = rollMultiple(100, sides);
          showStats(results, sides);
          break;
        }

        case '5': {
          await dungeonMode();
          break;
        }

        case '6': {
          await pokerDice();
          break;
        }

        default:
          console.log(chalk.red('\n  ❌ Invalid option! Please choose 1-7.\n'));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red(`\n  ❌ Error: ${error.message}\n`));
      }
    }

    const again = await askQuestion(chalk.cyan('Roll again? (yes/no): '));
    if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
      console.log(chalk.red('\n👋 May your rolls always be natural 20s! Goodbye!\n'));
      continueRunning = false;
    }
  }

  rl.close();
}

runDiceRoller();
