import { TwitterApi } from 'twitter-api-v2';

let client: TwitterApi | null = null;

export function getTwitterClient(): TwitterApi {
    if (!client) {
        const apiKey       = process.env.TWITTER_API_KEY;
        const apiSecret    = process.env.TWITTER_API_SECRET;
        const accessToken  = process.env.TWITTER_ACCESS_TOKEN;
        const accessSecret = process.env.TWITTER_ACCESS_SECRET;

        if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
            throw new Error(
                'Missing Twitter credentials. Set TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET in .env'
            );
        }

        client = new TwitterApi({
            appKey:            apiKey,
            appSecret:         apiSecret,
            accessToken:       accessToken,
            accessSecret:      accessSecret,
        });
    }

    return client;
}