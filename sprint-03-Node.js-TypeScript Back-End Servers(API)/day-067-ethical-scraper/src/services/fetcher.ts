import axios from "axios";

/* ── Per-domain rate limiter ─────────────────────────────────────────
   Tracks the last time we made a request to each domain.
   Before every request we check how long ago the last one was.
   If not enough time has passed, we wait (sleep) before proceeding.
   This prevents hammering a single server with rapid requests.
────────────────────────────────────────────────────────────────────── */
const lastRequestTime = new Map<string, number>();
const DELAY_MS = Number(process.env.REQUEST_DELAY_MS) || 1000;
const USER_AGENT = process.env.USER_AGENT || "Day67Scraper/1.0";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getDomain(url: string): string {
  return new URL(url).hostname;
}

async function rateLimitedFetch(url: string): Promise<string> {
  const domain = getDomain(url);
  const last = lastRequestTime.get(domain) || 0;
  const elapsed = Date.now() - last;

  if (elapsed < DELAY_MS) {
    const wait = DELAY_MS - elapsed;
    console.log(`[SCRAPER] Rate limit — waiting ${wait}ms before requesting ${domain}`);
    await sleep(wait);
  }

  lastRequestTime.set(domain, Date.now());

  const response = await axios.get(url, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    timeout: 10_000,
  });

  return response.data as string;
}

/* ── robots.txt checker ──────────────────────────────────────────────
   robots.txt is a file at the root of every website that tells bots
   what they are and aren't allowed to scrape.

   Format:
     User-agent: *
     Disallow: /private/
     Allow: /public/

   We fetch the file, look for rules that apply to all bots (*),
   and check if our target path is disallowed.
   This is a simplified parser — a production scraper would be more
   thorough, but this covers the most common cases.
────────────────────────────────────────────────────────────────────── */
export async function isAllowedByRobots(url: string): Promise<boolean> {
  try {
    const parsed = new URL(url);
    const robotsUrl = `${parsed.protocol}//${parsed.hostname}/robots.txt`;

    const robotsTxt = await axios.get(robotsUrl, {
      headers: { "User-Agent": USER_AGENT },
      timeout: 5000,
    }).then((r) => r.data as string);

    const path = parsed.pathname;
    const lines = robotsTxt.split("\n").map((l) => l.trim());

    let inRelevantBlock = false;
    const disallowedPaths: string[] = [];

    for (const line of lines) {
      if (line.toLowerCase().startsWith("user-agent:")) {
        const agent = line.split(":")[1].trim();
        inRelevantBlock = agent === "*" || agent.toLowerCase().includes("scraper");
      }
      if (inRelevantBlock && line.toLowerCase().startsWith("disallow:")) {
        const disallowed = line.split(":")[1].trim();
        if (disallowed) disallowedPaths.push(disallowed);
      }
    }

    /* Check if our path starts with any disallowed path */
    const isDisallowed = disallowedPaths.some(
      (d) => d !== "" && path.startsWith(d)
    );

    if (isDisallowed) {
      console.warn(`[SCRAPER] robots.txt disallows scraping: ${url}`);
    }

    return !isDisallowed;
  } catch {
    /* If robots.txt doesn't exist or can't be fetched, assume allowed */
    return true;
  }
}

export { rateLimitedFetch };