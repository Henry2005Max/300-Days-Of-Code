import { fetchForexRates } from '../services/forexFetcher';
import { buildTweet, validateTweet } from '../formatters/tweetFormatter';
import { postTweet } from '../services/poster';
import { PostResult } from '../types';

export async function runBot(dryRun: boolean): Promise<PostResult> {
    console.log(`[Bot] Running at ${new Date().toISOString()} | dry-run: ${dryRun}`);

    const snapshot = await fetchForexRates();
    console.log(`[Bot] Fetched ${snapshot.rates.length} forex rates.`);

    const payload = buildTweet(snapshot);
    validateTweet(payload);
    console.log(`[Bot] Tweet built. ${payload.charCount}/280 chars.`);

    const result = await postTweet(payload, dryRun);
    return result;
}