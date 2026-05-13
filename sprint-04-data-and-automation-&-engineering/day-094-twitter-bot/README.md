# Day 94: X Bot Poster with twitter-api-v2

An automated X (Twitter) bot that fetches live Nigerian forex exchange rates, formats them into a tweet, and posts on a configurable `node-cron` schedule. Supports dry-run mode for testing without posting, graceful API fallback to mock data, and single-run or scheduled execution.

## What's New

First bot project in the challenge. Introduces `twitter-api-v2` for OAuth 1.0a tweet posting, `node-cron` for WAT-aware scheduling, and a clean separation between data fetching, formatting, and posting. The bot is fully config-driven via `.env` with no hardcoded values.

## Features

- Fetches live NGN exchange rates for USD, GBP, EUR, CAD, AED, and CNY
- Falls back to realistic mock rates when no API key is configured — safe for dry runs
- Formats a well-structured tweet with flag emojis, currency names, and rates
- Enforces the 280-character limit with automatic hashtag trimming if needed
- Dry-run mode prints the tweet to the terminal without posting
- Single-run mode — post once and exit
- Scheduled mode — runs on a cron schedule (default: 08:00 WAT daily) and stays alive
- All credentials and schedule live in `.env` — zero hardcoded values
- Lazy Twitter client instantiation — client created only when needed

## Technologies Used

- Node.js + TypeScript
- `twitter-api-v2` — Twitter/X API v2 client with OAuth 1.0a
- `node-cron` — cron-based task scheduler with timezone support
- `dotenv` — environment configuration
- `zod` — runtime config validation
- `tsx` — TypeScript execution

## Folder Structure

```
day-094-x-bot/
├── src/
│   ├── config/
│   │   └── config.ts           # Loads and validates bot config from .env
│   ├── formatters/
│   │   └── tweetFormatter.ts   # Builds tweet text from forex snapshot
│   ├── scheduler/
│   │   └── scheduler.ts        # node-cron wrapper with WAT timezone
│   ├── services/
│   │   ├── botRunner.ts        # Single run pipeline: fetch → format → post
│   │   ├── forexFetcher.ts     # Fetches forex rates with mock fallback
│   │   ├── poster.ts           # Posts tweet or prints dry-run output
│   │   └── twitterClient.ts    # Lazy TwitterApi singleton
│   ├── types/
│   │   └── index.ts            # Interfaces
│   └── index.ts                # Entry point — single run or scheduler
├── .env
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd day-094-x-bot
npm install
```

## How to Run

```bash
# Test the bot without posting (uses mock forex rates if no API key set)
npm run dry-run

# Post once immediately (requires Twitter credentials in .env)
npm run post

# Run on a cron schedule — stays alive, posts daily at 08:00 WAT
npm run schedule
```

## Testing Step by Step

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Test dry-run with mock data** (no credentials needed):
   ```bash
   npm run dry-run
   ```
   You should see the formatted tweet printed to the terminal with a character count.

3. **Get Twitter/X API credentials:**
    - Go to [developer.twitter.com](https://developer.twitter.com/en/portal/projects-and-apps)
    - Create a project and app
    - Enable OAuth 1.0a with Read and Write permissions
    - Generate Access Token and Secret under "Keys and Tokens"
    - Copy all four values into `.env`

4. **Get a free exchange rate API key:**
    - Sign up at [exchangerate-api.com](https://www.exchangerate-api.com) (free tier: 1500 requests/month)
    - Copy your API key into `.env` as `EXCHANGE_RATE_API_KEY`

5. **Update `.env` with real credentials and test dry-run again:**
   ```bash
   npm run dry-run
   ```
   This time it will fetch live rates but still not post.

6. **Post a real tweet:**
   ```bash
   npm run post
   ```
   Check the terminal for the tweet ID and URL.

7. **Test the scheduler** — runs once immediately then waits for cron:
   ```bash
   npm run schedule
   ```

8. **Change the schedule** in `.env`:
   ```
   CRON_SCHEDULE=0 12 * * *
   ```
   This posts at 12:00 WAT every day. The scheduler uses `Africa/Lagos` timezone.

9. **Test character limit** — the formatter enforces 280 chars. If the tweet is over limit, hashtags are trimmed automatically. You can verify by temporarily adding more currencies in `forexFetcher.ts`.

10. **Verify tweet was posted** — open the URL printed in the terminal or check your X profile.

## What I Learned

- `twitter-api-v2` uses OAuth 1.0a for user-context posting (writing tweets) — the bearer token alone is read-only and cannot post
- `client.readWrite.v2.tweet()` is the correct method for posting in v2 of the API — `client.v2.tweet()` without `readWrite` throws a permissions error
- `node-cron` accepts a `timezone` option that handles DST and UTC offset automatically — no manual offset math needed
- The X API free tier allows 1 tweet per 15 minutes and 17 tweets per 24 hours — worth knowing before building a high-frequency bot
- Tweet character counting in the API counts URLs as 23 characters regardless of actual length — plain text tweets can use a simple `.length` check
- Separating the bot into fetch → format → post steps makes each part independently testable and the dry-run mode trivial to implement
- Falling back to mock data when no API key is set makes the entire project runnable for anyone without any credentials

## Challenge Info

| Field    | Detail                                  |
|----------|-----------------------------------------|
| Day      | 94                                      |
| Sprint   | 4 — Data Engineering & Databases        |
| Date     | 2025-01-08                              |
| Previous | [Day 93](../day-093-data-viz)           |
| Next     | [Day 95](../day-095-email-automation)   |

Part of my 300 Days of Code Challenge!
