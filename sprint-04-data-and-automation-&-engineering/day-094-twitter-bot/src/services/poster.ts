import { getTwitterClient } from './twitterClient';
import { TweetPayload, PostResult } from '../types';

export async function postTweet(payload: TweetPayload, dryRun: boolean): Promise<PostResult> {
    if (dryRun) {
        console.log('\n[DRY RUN] Tweet would be posted:');
        console.log('─'.repeat(50));
        console.log(payload.text);
        console.log('─'.repeat(50));
        console.log(`[DRY RUN] Character count: ${payload.charCount}/280\n`);

        return {
            success:  true,
            dryRun:   true,
            text:     payload.text,
            tweetId:  'dry-run-no-id',
            tweetUrl: 'https://x.com (dry run — not posted)',
        };
    }

    try {
        const client   = getTwitterClient();
        const rwClient = client.readWrite;
        const tweet    = await rwClient.v2.tweet(payload.text);

        const tweetId  = tweet.data.id;
        const tweetUrl = `https://x.com/i/web/status/${tweetId}`;

        console.log(`[Bot] Tweet posted successfully.`);
        console.log(`[Bot] Tweet ID  : ${tweetId}`);
        console.log(`[Bot] Tweet URL : ${tweetUrl}`);

        return {
            success:  true,
            dryRun:   false,
            text:     payload.text,
            tweetId,
            tweetUrl,
        };
    } catch (err) {
        const message = (err as Error).message;
        console.error(`[Bot] Failed to post tweet: ${message}`);

        return {
            success: false,
            dryRun:  false,
            text:    payload.text,
            error:   message,
        };
    }
}