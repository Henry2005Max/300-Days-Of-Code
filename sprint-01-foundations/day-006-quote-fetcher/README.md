# Day 6: Random Quote Fetcher (API Call)

##  Description
A beautiful command-line application that fetches inspiring quotes from the Quotable API. Browse random quotes, search by category or author, save your favorites, and get daily inspiration!

##  Features
-  **Random Quotes** - Get random inspiring quotes
-  **Categories** - Browse quotes by category (wisdom, success, life, etc.)
-  **By Author** - Find quotes from specific authors
-  **Multiple Quotes** - Get 5 random quotes at once
-  **Quote of the Day** - Daily quote (same quote for the whole day)
-  **Motivational Quotes** - Get inspired with motivational content
-  **Favorites** - Save and manage your favorite quotes
-  **Beautiful Display** - Color-coded output with Chalk
- **Persistent Storage** - Favorites saved to JSON file

##  Technologies Used
- TypeScript
- Node.js
- Axios (HTTP requests)
- Chalk (terminal colors)
- Quotable API (free, no API key needed!)
- fs/promises (file storage)

##  API Information

This project uses the **Quotable API** (https://api.quotable.io)
- ✅ **FREE** - No API key required
- ✅ **No rate limits** for reasonable use
- ✅ **Extensive collection** - Thousands of quotes
- ✅ **Multiple endpoints** - Random, by author, by tag, etc.

##  Installation

1. Make sure you have Node.js installed
2. Install dependencies:
   ```bash
   npm install
   ```

##  How to Run

### Quick Run (with ts-node):
```bash
ts-node quote-fetcher.ts
```

### Build and Run:
```bash
npm run build
npm start
```

### Development Mode:
```bash
npm run dev
```

##  Example Usage

### Getting a Random Quote:
```
Choose an option: 1

═══════════════════════════════════════════════════════════════════════════════

"The only way to do great work is to love what you do."

— Steve Jobs
 Category: wisdom, famous-quotes

═══════════════════════════════════════════════════════════════════════════════

Save to favorites? yes
 Quote added to favorites!
```

### Browsing by Category:
```
Choose an option: 2

 POPULAR QUOTE CATEGORIES

   • wisdom
   • inspiration
   • success
   • life
   • happiness
   • love

Enter category: success

═══════════════════════════════════════════════════════════════════════════════

"Success is not final, failure is not fatal: it is the courage to continue that counts."

— Winston Churchill
 Category: success, courage

═══════════════════════════════════════════════════════════════════════════════
```

### Viewing Favorites:
```
Choose an option: 7

 YOUR FAVORITE QUOTES 

1. "The only way to do great work is to love what you do."
   — Steve Jobs

2. "Success is not final, failure is not fatal..."
   — Winston Churchill

Total favorites: 2
```

##  Menu Options

1. **Random quote** - Get a random quote from the entire collection
2. **Quote by category** - Browse quotes by specific categories
3. **Quote by author** - Search quotes from specific authors
4. **Get 5 random quotes** - Fetch multiple quotes at once
5. **Quote of the day** - Same quote for the whole day
6. **Motivational quote** - Get inspiring motivational content
7. **View favorite quotes** - See and manage your saved quotes
8. **Show categories** - List all available categories
9. **Exit** - Close the application

##  Available Categories

- wisdom
- inspiration
- success
- life
- happiness
- love
- friendship
- science
- technology
- education
- humor
- history
- philosophy
- famous-quotes
- And many more!

##  What I Learned
- Making API calls without authentication
- Working with public APIs
- Using the same API in different ways (random, by category, by author)
- Saving and loading data from JSON files
- Building interactive CLI menus
- Color-coded terminal output
- Error handling for API calls
- Managing favorites/bookmarks feature
- Date-based seeding for consistent daily content

## 🔍 How It Works

### API Endpoints Used:

```typescript
// Random quote
GET https://api.quotable.io/random

// Quote by category
GET https://api.quotable.io/random?tags=wisdom

// Quote by author
GET https://api.quotable.io/random?author=Steve Jobs

// Quote of the day (seeded by date)
GET https://api.quotable.io/random?seed=2024-02-11
```

### Response Format:
```json
{
  "content": "The only way to do great work is to love what you do.",
  "author": "Steve Jobs",
  "tags": ["wisdom", "famous-quotes"],
  "length": 52
}
```

### Favorites Storage:
```json
[
  {
    "text": "Quote text here",
    "author": "Author name",
    "category": "wisdom, inspiration"
  }
]
```

##  Color Scheme

-  **Magenta** - Headers and branding
-  **Cyan** - Menu options and prompts
-  **White** - Quote text
-  **Yellow** - Author names and important info
-  **Green** - Success messages
-  **Red** - Errors
-  **Gray** - Borders and decorative elements

##  Future Improvements
- Export favorites to PDF or text file
- Share quotes on social media
- Daily email with quote of the day
- Search quotes by keywords
- Rate and review quotes
- Random quote as wallpaper
- Integration with calendar apps
- Quote of the week/month
- Custom categories
- Translation to other languages

##  Data Flow

```
User selects option
    ↓
Build API URL based on option
    ↓
Send GET request with Axios
    ↓
Receive JSON response
    ↓
Parse and format data
    ↓
Display with Chalk colors
    ↓
Optional: Save to favorites
    ↓
Store in JSON file
```

##  File Structure

```
day-006-quote-fetcher/
├── quote-fetcher.ts
├── package.json
├── favorite-quotes.json    ← Created automatically
└── README.md
```

## Troubleshooting

**Problem:** "Cannot find module 'axios'"
- **Solution:** Run `npm install`

**Problem:** "Error fetching quote"
- **Solution:** Check internet connection

**Problem:** "No quotes found for category"
- **Solution:** Use valid category from the list (option 8)

**Problem:** "No quotes found by author"
- **Solution:** Check spelling, try different author name

**Problem:** Favorites not saving
- **Solution:** Check write permissions in the directory

##  Quick Tips

- Press Enter to use default options
- Type "no" or "n" for quick responses
- Use option 8 to see all categories before searching
- Quote of the day is same for everyone worldwide
- Motivational quotes come from inspiration/success categories

##  Use Cases

✅ **Daily Inspiration** - Start your day with wisdom  
✅ **Writing** - Find quotes for articles/presentations  
✅ **Social Media** - Share inspiring content  
✅ **Learning** - Discover wisdom from great minds  
✅ **Motivation** - Get pumped for your 300-day challenge!  
✅ **Collection** - Build your personal quote library  

##  Challenge Info
**Day:** 6/300  
**Sprint:** 1 - Foundations  
**Date:** WED FEB 11
**Previous Day:** [Day 5 - Todo CLI](../day-005-todo-cli)  
**Next Day:** [Day 7 - BMI Calculator](../day-007-bmi-calculator)  

---

Part of my 300 Days of Code Challenge! 
