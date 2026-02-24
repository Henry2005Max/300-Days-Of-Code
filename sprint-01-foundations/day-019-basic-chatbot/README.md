# Day 19: Basic Chatbot with readline

## Description
A rule-based chatbot CLI built with TypeScript and Node.js readline. The bot named Mayo responds to keywords, remembers your name, tracks conversation history with timestamps, tells jokes, shares the current time and date, and handles topics like coding, Nigeria, and general conversation.

## Features
- **Keyword Matching** - Responds intelligently to topics like greetings, coding, Nigeria, jokes, time, date
- **Personalised Responses** - Remembers your name throughout the conversation
- **Conversation History** - Type "history" to see full chat log with timestamps
- **Random Responses** - Multiple responses per topic so it never feels repetitive
- **Fallback Handling** - Smart fallback messages when input is not recognised
- **Message Counter** - Tracks how many messages were sent in the session
- **Exit Detection** - Detects bye/goodbye/exit/quit to end the conversation gracefully

## Technologies Used
- TypeScript
- Node.js
- readline (built-in Node.js module)
- Chalk (terminal colors)

## Installation

```bash
npm install
```

## How to Run

```bash
npx ts-node chatbot.ts
```

## Example Usage

### Greeting:
```
What's your name? Henry

Mayo: Hey Henry! I'm Mayo, your TypeScript chatbot.
Mayo: Type "help" to see what I can do.

Henry: hello
Mayo: Hey Henry! What's good?
```

### Joke:
```
Henry: tell me a joke
Mayo: Why do Java developers wear glasses? Because they don't C#!
```

### Time and Date:
```
Henry: what time is it?
Mayo: The current time is 10:45:32 AM.

Henry: what day is today?
Mayo: Today is Wednesday, February 26, 2026.
```

### History:
```
Henry: history

Conversation History:
[10:44:01] You: hello
[10:44:01] Mayo: Hey Henry! What's good?
[10:44:15] You: tell me a joke
[10:44:15] Mayo: Why do Java developers wear glasses?...
```

## What I Learned
- Building rule-based systems with keyword arrays
- Managing application state (userName, messageCount, history)
- Storing structured data with TypeScript interfaces (Message, BotRule)
- Using Math.random() for varied responses
- Continuous input loops with readline in async/await style

## Challenge Info
**Day:** 19/300
**Sprint:** 1 - Foundations
**Previous Day:** [Day 18 - FizzBuzz with TypeScript Generics](../day-018-fizzbuzz-generics)
**Next Day:** Day 20 - Recipe Randomizer

---
Part of my 300 Days of Code Challenge
