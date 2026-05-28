import dotenv from 'dotenv';
dotenv.config();

const BASE = `http://localhost:${process.env.PORT || 3000}/api`;

interface TestResult {
    route:     string;
    algorithm: string;
    total:     number;
    allowed:   number;
    blocked:   number;
    statuses:  Record<number, number>;
}

async function hit(url: string): Promise<{ status: number; retryAfter?: string; remaining?: string }> {
    try {
        const res = await fetch(url);
        return {
            status:     res.status,
            retryAfter: res.headers.get('Retry-After')    || undefined,
            remaining:  res.headers.get('X-RateLimit-Remaining') || undefined,
        };
    } catch {
        return { status: 0 };
    }
}

async function runTest(
    route:     string,
    algorithm: string,
    requests:  number,
    delayMs:   number
): Promise<TestResult> {
    const url      = `${BASE}/${route}`;
    const statuses: Record<number, number> = {};
    let   allowed  = 0;
    let   blocked  = 0;

    process.stdout.write(`  Testing /${route} (${requests} requests, ${delayMs}ms delay)... `);

    for (let i = 0; i < requests; i++) {
        const result = await hit(url);
        statuses[result.status] = (statuses[result.status] || 0) + 1;
        if (result.status === 200) allowed++;
        else if (result.status === 429) blocked++;

        if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
    }

    console.log(`done. ✓ ${allowed}  ✗ ${blocked}`);
    return { route, algorithm, total: requests, allowed, blocked, statuses };
}

async function printResults(results: TestResult[]): Promise<void> {
    console.log('\n' + '═'.repeat(64));
    console.log('  LOAD TEST RESULTS');
    console.log('═'.repeat(64));
    console.log(
        `  ${'Route'.padEnd(12)} ${'Algorithm'.padEnd(16)} ${'Total'.padStart(6)} ${'Allowed'.padStart(8)} ${'Blocked'.padStart(8)} ${'Block%'.padStart(8)}`
    );
    console.log('  ' + '─'.repeat(62));

    for (const r of results) {
        const blockPct = ((r.blocked / r.total) * 100).toFixed(1);
        console.log(
            `  ${r.route.padEnd(12)} ${r.algorithm.padEnd(16)} ${String(r.total).padStart(6)} ${String(r.allowed).padStart(8)} \x1b[31m${String(r.blocked).padStart(8)}\x1b[0m ${(blockPct + '%').padStart(8)}`
        );
    }

    console.log('\n  INTERPRETATION');
    console.log('  ' + '─'.repeat(62));
    for (const r of results) {
        if (r.blocked > 0) {
            console.log(`  /${r.route}: rate limiting is WORKING — ${r.blocked}/${r.total} requests blocked`);
        } else {
            console.log(`  /${r.route}: no requests blocked (limit not reached with this test config)`);
        }
    }
    console.log('');
}

async function main(): Promise<void> {
    console.log('\n[Load Test] Checking server is up...');
    const health = await hit(`http://localhost:${process.env.PORT || 3000}/health`);
    if (health.status !== 200) {
        console.error(`[Load Test] Server not responding (status ${health.status}). Run "npm run server" first.`);
        process.exit(1);
    }
    console.log('[Load Test] Server OK. Starting tests...\n');

    const results: TestResult[] = [];

    // Test 1 — strict route: 3 req/10s — fire 8 rapid requests, expect 5 blocked
    results.push(await runTest('strict', 'sliding_window', 8, 50));

    // Test 2 — fixed route: 5 req/30s — fire 8 requests, expect 3 blocked
    results.push(await runTest('fixed', 'fixed_window', 8, 50));

    // Test 3 — token bucket: 8 req/min — fire 12 requests, expect 4 blocked
    results.push(await runTest('token', 'token_bucket', 12, 50));

    // Test 4 — sliding: 10 req/min — fire 15 requests, expect 5 blocked
    results.push(await runTest('sliding', 'sliding_window', 15, 50));

    await printResults(results);

    // Fetch final stats
    const statsRes = await fetch(`${BASE}/stats`);
    const stats = await statsRes.json() as { recentRequests: number; denied: number; allowRate: string };
    console.log(`[Stats] Total logged: ${stats.recentRequests}  Denied: ${stats.denied}  Allow rate: ${stats.allowRate}\n`);
}

main().catch((err) => {
    console.error('[Error]', err.message);
    process.exit(1);
});