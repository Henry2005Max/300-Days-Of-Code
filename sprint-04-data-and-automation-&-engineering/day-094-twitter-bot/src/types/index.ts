export interface ForexRate {
    currency: string;
    symbol: string;
    rateToNGN: number;
    flag: string;
}

export interface ForexSnapshot {
    base: string;
    timestamp: Date;
    rates: ForexRate[];
}

export interface TweetPayload {
    text: string;
    charCount: number;
}

export interface PostResult {
    success: boolean;
    tweetId?: string;
    tweetUrl?: string;
    dryRun: boolean;
    text: string;
    error?: string;
}

export interface BotConfig {
    dryRun: boolean;
    scheduled: boolean;
    cronSchedule: string;
}