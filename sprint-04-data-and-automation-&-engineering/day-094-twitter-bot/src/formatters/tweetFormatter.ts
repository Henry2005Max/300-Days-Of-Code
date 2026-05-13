import { ForexSnapshot, TweetPayload } from '../types';

const MAX_TWEET_LENGTH = 280;

function formatRate(rate: number): string {
    return rate.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-NG', {
        weekday: 'long',
        day:     'numeric',
        month:   'long',
        year:    'numeric',
        timeZone: 'Africa/Lagos',
    });
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-NG', {
        hour:     '2-digit',
        minute:   '2-digit',
        timeZone: 'Africa/Lagos',
        timeZoneName: 'short',
    });
}

export function buildTweet(snapshot: ForexSnapshot): TweetPayload {
    const date = formatDate(snapshot.timestamp);
    const time = formatTime(snapshot.timestamp);

    const lines: string[] = [
        `🇳🇬 Naira Exchange Rates — ${date}`,
        ``,
    ];

    for (const rate of snapshot.rates) {
        lines.push(`${rate.flag} 1 ${rate.currency} = ₦${formatRate(rate.rateToNGN)}`);
    }

    lines.push(``);
    lines.push(`⏰ Updated: ${time}`);
    lines.push(`#Naira #NGN #Nigeria #Forex #ExchangeRate`);

    const text = lines.join('\n');

    // Trim hashtags if over limit
    if (text.length > MAX_TWEET_LENGTH) {
        const trimmed = lines.slice(0, lines.length - 1).join('\n');
        return {
            text:      trimmed.slice(0, MAX_TWEET_LENGTH),
            charCount: trimmed.length,
        };
    }

    return { text, charCount: text.length };
}

export function validateTweet(payload: TweetPayload): void {
    if (payload.charCount > MAX_TWEET_LENGTH) {
        throw new Error(
            `Tweet exceeds ${MAX_TWEET_LENGTH} characters (got ${payload.charCount}). Shorten the content.`
        );
    }
    if (payload.charCount === 0) {
        throw new Error('Tweet text cannot be empty.');
    }
}