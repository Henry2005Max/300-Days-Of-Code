#!/usr/bin/env node

// Basic Chatbot with readline
// Day 19 of 300 Days of Code Challenge

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

interface Message {
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface BotRule {
  keywords: string[];
  responses: string[];
}

// ─── Bot State ────────────────────────────────────────────

let userName: string = 'Friend';
let messageCount: number = 0;
const conversationHistory: Message[] = [];

// ─── Response Rules ───────────────────────────────────────

const rules: BotRule[] = [
  {
    keywords: ['hello', 'hi', 'hey', 'howdy', 'sup', 'yo'],
    responses: [
      `Hey ${userName}! What's good?`,
      'Hello! How can I help you today?',
      'Hey! Great to hear from you!',
    ],
  },
  {
    keywords: ['how are you', 'how are u', 'how do you feel', 'you ok', 'you good'],
    responses: [
      "I'm just a bot but I'm doing great! How about you?",
      'Running at 100%! What about yourself?',
      'All good on my end! How are you doing?',
    ],
  },
  {
    keywords: ['what is your name', 'your name', 'who are you', 'what are you'],
    responses: [
      "I'm Mayo, your Day 19 chatbot! Built with TypeScript and readline.",
      "They call me Mayo! A simple but smart TypeScript chatbot.",
      "I'm Mayo — nice to meet you!",
    ],
  },
  {
    keywords: ['time', 'what time', 'current time'],
    responses: [`The current time is ${new Date().toLocaleTimeString()}.`],
  },
  {
    keywords: ['date', 'what date', 'today', 'what day'],
    responses: [`Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`],
  },
  {
    keywords: ['nigeria', 'naija', 'lagos', 'abuja'],
    responses: [
      'Nigeria! The giant of Africa. Lagos is the hustle capital!',
      'Naija no dey carry last! Great country.',
      'Lagos traffic or Abuja life? Which do you prefer?',
    ],
  },
  {
    keywords: ['code', 'coding', 'programming', 'typescript', 'javascript', 'developer'],
    responses: [
      'Coding is life! TypeScript is amazing for type safety.',
      "300 days of code? That's dedication. Keep pushing!",
      'JavaScript runs the world, TypeScript makes it safer!',
    ],
  },
  {
    keywords: ['joke', 'funny', 'laugh', 'humor'],
    responses: [
      'Why do Java developers wear glasses? Because they don\'t C#! 😄',
      'Why did the programmer quit? Because he didn\'t get arrays! 😂',
      'What\'s a computer\'s favorite snack? Microchips! 🍟',
    ],
  },
  {
    keywords: ['help', 'what can you do', 'commands', 'features'],
    responses: [
      'I can chat, tell jokes, share the time/date, talk about Nigeria and coding! Just type anything.',
      'Try asking me: the time, a joke, about Nigeria, about coding, or just say hello!',
    ],
  },
  {
    keywords: ['bye', 'goodbye', 'see you', 'later', 'exit', 'quit'],
    responses: [
      'Goodbye! Keep coding! 👋',
      'See you later! Stay sharp! 🚀',
      'Bye! Come back anytime!',
    ],
  },
  {
    keywords: ['thank', 'thanks', 'thank you', 'appreciate'],
    responses: [
      "You're welcome! Anytime!",
      'Happy to help!',
      'No problem at all!',
    ],
  },
  {
    keywords: ['weather'],
    responses: [
      "I wish I could check the weather! Try Day 4's weather API project for that 😄",
      "No weather data here, but Day 4 of this challenge covers weather APIs!",
    ],
  },
];

// ─── Fallback Responses ───────────────────────────────────

const fallbacks: string[] = [
  "Hmm, I'm not sure about that one. Try asking something else!",
  "That's interesting! I'm still learning though.",
  "I didn't quite catch that. Ask me about coding, Nigeria, or tell me to tell a joke!",
  "Good question! I don't have an answer for that yet.",
  "I'm a simple bot — try asking me the time, a joke, or about TypeScript!",
];

// ─── Bot Logic ────────────────────────────────────────────

function getResponse(input: string): string {
  const lower = input.toLowerCase();

  // Check rules
  for (const rule of rules) {
    const matched = rule.keywords.some(keyword => lower.includes(keyword));
    if (matched) {
      const responses = rule.responses.map(r => r.replace('${userName}', userName));
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // Personalised fallback
  if (messageCount > 5) {
    return `${userName}, ${fallbacks[Math.floor(Math.random() * fallbacks.length)]}`;
  }

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

function addToHistory(role: 'user' | 'bot', text: string): void {
  conversationHistory.push({ role, text, timestamp: new Date() });
}

function showHistory(): void {
  if (conversationHistory.length === 0) {
    console.log(chalk.gray('\n  No conversation history yet.\n'));
    return;
  }

  console.log(chalk.bold.cyan('\n  Conversation History:\n'));
  conversationHistory.forEach((msg) => {
    const time = msg.timestamp.toLocaleTimeString();
    if (msg.role === 'user') {
      console.log(chalk.gray(`  [${time}] `) + chalk.green(`You: `) + chalk.white(msg.text));
    } else {
      console.log(chalk.gray(`  [${time}] `) + chalk.yellow(`Mayo: `) + chalk.white(msg.text));
    }
  });
  console.log('');
}

// ─── Main Application ─────────────────────────────────────

async function runChatbot(): Promise<void> {
  console.clear();
  console.log(chalk.bold.blue('═'.repeat(55)));
  console.log(chalk.bold.blue('              Mayo - BASIC CHATBOT'));
  console.log(chalk.bold.blue('═'.repeat(55)));
  console.log(chalk.white('\n   A rule-based chatbot built with TypeScript!\n'));
  console.log(chalk.bold.blue('═'.repeat(55)));

  // Get user name
  const nameInput = await askQuestion(chalk.cyan('\n  What\'s your name? '));
  userName = nameInput || 'Friend';

  console.log(chalk.yellow(`\n  Mayo: Hey ${userName}! I'm Mayo, your TypeScript chatbot.`));
  console.log(chalk.yellow(`  Mayo: Type "help" to see what I can do, or "history" to see our chat.`));
  console.log(chalk.yellow(`  Mayo: Type "bye" to exit.\n`));

  let running = true;

  while (running) {
    const input = await askQuestion(chalk.green(`  ${userName}: `));

    if (!input) continue;

    messageCount++;
    addToHistory('user', input);

    // Special commands
    if (input.toLowerCase() === 'history') {
      showHistory();
      continue;
    }

    // Check for exit
    const isExit = ['bye', 'goodbye', 'exit', 'quit', 'see you', 'later'].some(
      word => input.toLowerCase().includes(word)
    );

    const response = getResponse(input);
    addToHistory('bot', response);

    console.log(chalk.yellow(`\n  Mayo: ${response}\n`));

    if (isExit) {
      running = false;
    }
  }

  console.log(chalk.gray(`\n  Chat ended. Total messages: ${messageCount}\n`));
  rl.close();
}

runChatbot();
