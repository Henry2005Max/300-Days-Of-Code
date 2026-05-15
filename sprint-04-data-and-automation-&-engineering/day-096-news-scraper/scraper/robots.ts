const robotsCache = new Map<string, string>();

export async function fetchRobotsTxt(baseUrl: string): Promise<string> {
    if (robotsCache.has(baseUrl)) return robotsCache.get(baseUrl)!;

    try {
        const res = await fetch(`${baseUrl}/robots.txt`, {
            headers: { 'User-Agent': 'NewsDigestBot/1.0 (+educational-project)' },
            signal: AbortSignal.timeout(5000),
        });
        const text = res.ok ? await res.text() : '';
        robotsCache.set(baseUrl, text);
        return text;
    } catch {
        robotsCache.set(baseUrl, '');
        return '';
    }
}

export function isAllowed(robotsTxt: string, path: string): boolean {
    if (!robotsTxt) return true;

    const lines      = robotsTxt.split('\n').map((l) => l.trim());
    let   inOurBlock = false;
    const disallowed: string[] = [];

    for (const line of lines) {
        if (line.toLowerCase().startsWith('user-agent:')) {
            const agent = line.split(':')[1].trim();
            inOurBlock  = agent === '*' || agent.toLowerCase().includes('newsdigest');
        }
        if (inOurBlock && line.toLowerCase().startsWith('disallow:')) {
            const p = line.split(':')[1]?.trim();
            if (p) disallowed.push(p);
        }
    }

    return !disallowed.some((d) => d !== '' && path.startsWith(d));
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}