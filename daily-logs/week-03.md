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
