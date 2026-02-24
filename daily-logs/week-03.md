## Day 15 - February 20
**Project:** QR Code Generator
**Time Spent:** 4hrs

### What I Built
- Interactive CLI with 10 menu options
- Plain text to QR code
- URL QR code (auto-adds https://)
- WiFi QR code (SSID, password, encryption type)
- Email QR code (with optional subject and body)
- Phone number QR code
- SMS QR code (with optional pre-filled message)
- vCard QR code (contact card with name, phone, email)
- Terminal display (scan directly from terminal!)
- Examples viewer showing all QR formats

### What I Learned
- Using the qrcode npm library with TypeScript
- Different QR data formats (WIFI:, mailto:, tel:, sms:, BEGIN:VCARD)
- URI encoding with encodeURIComponent for special characters
- vCard 3.0 format for contact cards
- Error correction levels (L, M, Q, H)
- Chalk library for colored terminal output

### Challenges
None

### Tomorrow
Day 16: Joke API Fetcher


## Day 16 - February 16, 2026
**Project:** Joke API Fetcher
**Time Spent:** A lottttt of time (haha)

### What I Built
- Interactive CLI with 7 menu options
- Random joke fetcher from JokeAPI.dev
- Category filter (Programming, Misc, Dark, Pun, Spooky, Christmas)
- Dedicated programming jokes option
- Multiple jokes fetcher (1-10 at once)
- Safe mode for family-friendly jokes
- Two-part joke display with dramatic pause

### What I Learned
- Making HTTP requests with Node.js built-in https module
- Consuming a public REST API with TypeScript types
- Union types for different response shapes (SingleJoke | TwoPartJoke)
- Wrapping callback-based APIs in Promises

### Resources Used
- JokeAPI docs: https://v2.jokeapi.dev
- Node.js https module docs: https://nodejs.org/api/https.html
- Chalk v4 docs: https://github.com/chalk/chalk/tree/v4

### Tomorrow
Day 17 - Palindrome Checker

## Day 17 - February 22nd, 2026
**Project:** Palindrome Checker
**Time Spent:** 2hrs

### What I Built
- Single word/phrase palindrome checker
- Batch checker for multiple inputs with summary
- Number palindrome checker
- Break detection (shows exact position where it fails)
- Examples viewer with classic palindromes
- Smart string cleaning (ignores spaces, punctuation, casing)

### What I Learned
- String manipulation: split(), reverse(), join()
- Regex for stripping non-alphanumeric characters (/[^a-z0-9]/g)
- TypeScript interfaces for structured return types
- Batch processing arrays with .map() and .filter()

### Resources Used
- MDN String methods: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
- MDN Array.reverse(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse
- Regex tester: https://regex101.com

### Challenges

### Tomorrow
Day 18 - FizzBuzz with TypeScript Generics

## Day 18 - February 23rd, 2026
**Project:** FizzBuzz with TypeScript Generics
**Time Spent:** 2hours

### What I Built
- Classic FizzBuzz (1 to any number)
- Extended FizzBuzzBazz with 3 rules (3, 5, 7)
- Nigeria Edition (Naija, Lagos, Abuja)
- Emoji Edition (fire, water, lightning)
- Custom rule builder (up to 5 rules, your own divisors and labels)
- Match stats showing total, matched and plain numbers

### What I Learned
- TypeScript Generics with type parameter <T>
- Generic interfaces: FizzBuzzRule<T> and FizzBuzzResult<T>
- How generics let one function handle many different types
- Modulo operator (%) for divisibility checks
- Rule-based systems vs hardcoded if/else chains

### Resources Used
- TypeScript Generics docs: https://www.typescriptlang.org/docs/handbook/2/generics.html
- MDN Remainder operator: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
- Chalk v4 docs: https://github.com/chalk/chalk/tree/v4

### Challenges
None

### Tomorrow
Day 19 - Basic Chatbot with readline


## Day 19 - February 24, 2026
**Project:** Basic Chatbot with readline
**Time Spent:**3hours 30 minutes

### What I Built
- Rule-based chatbot (Cody) that responds to keyword triggers
- Personalised responses using the user's name
- Conversation history with timestamps (type "history")
- Topics: greetings, coding, Nigeria, jokes, time, date, help, bye
- Random response selection so replies vary each time
- Graceful exit detection for bye/goodbye/quit/exit
- Message counter tracking total messages in session

### What I Learned
- Building rule-based systems with keyword arrays and BotRule interface
- Managing session state (userName, messageCount, history array)
- TypeScript interfaces for Message and BotRule types
- Using Math.random() for varied responses
- Continuous async input loop with readline

### Resources Used
- Node.js readline docs: https://nodejs.org/api/readline.html
- MDN Math.random(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
- Chalk v4 docs: https://github.com/chalk/chalk/tree/v4

### Tomorrow
Day 20 - Recipe Randomizer
