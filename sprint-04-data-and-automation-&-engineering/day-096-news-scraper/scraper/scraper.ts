import * as cheerio from 'cheerio';
import { ScrapeTarget, Article, ScrapeResult } from '../types';
import { insertArticle } from '../db/repository';
import { fetchRobotsTxt, isAllowed, sleep } from './robots';

const DELAY    = parseInt(process.env.REQUEST_DELAY_MS || '2000', 10);
const MAX_ART  = parseInt(process.env.MAX_ARTICLES     || '50',   10);
const UA       = 'NewsDigestBot/1.0 (+educational-project)';

async function fetchHtml(url: string): Promise<string> {
    const res = await fetch(url, {
        headers: { 'User-Agent': UA, 'Accept': 'text/html' },
        signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
    return res.text();
}

function cleanText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
}

function resolveUrl(href: string, baseUrl: string): string {
    if (!href) return '';
    if (href.startsWith('http')) return href;
    if (href.startsWith('/')) return `${baseUrl}${href}`;
    return `${baseUrl}/${href}`;
}

export async function scrapeTarget(target: ScrapeTarget): Promise<ScrapeResult> {
    const result: ScrapeResult = {
        source: target.name, fetched: 0, inserted: 0, skipped: 0, errors: 0,
    };

    console.log(`\n[Scraper] Checking robots.txt for ${target.name}...`);
    const robotsTxt = await fetchRobotsTxt(target.baseUrl);
    if (!isAllowed(robotsTxt, '/')) {
        console.log(`[Scraper] Scraping disallowed by robots.txt for ${target.name}. Skipping.`);
        return result;
    }

    console.log(`[Scraper] Fetching ${target.baseUrl}...`);

    let html: string;
    try {
        html = await fetchHtml(target.baseUrl);
    } catch (err) {
        console.error(`[Scraper] Failed to fetch ${target.baseUrl}: ${(err as Error).message}`);
        result.errors++;
        return result;
    }

    const $        = cheerio.load(html);
    const articles = $(target.articleSelector);
    console.log(`[Scraper] Found ${articles.length} article elements on ${target.name}.`);

    let processed = 0;

    for (let i = 0; i < articles.length && processed < MAX_ART; i++) {
        const el = articles.eq(i);

        const titleEl = el.find(target.titleSelector).first();
        const title   = cleanText(titleEl.text());
        if (!title || title.length < 10) continue;

        const rawHref = titleEl.attr('href') || el.find(target.linkSelector).first().attr('href') || '';
        const url     = resolveUrl(rawHref, target.baseUrl);
        if (!url) continue;

        const summary = cleanText(el.find(target.summarySelector).first().text()).slice(0, 300);

        const article: Article = {
            title,
            summary:   summary || 'No summary available.',
            url,
            source:    target.name,
            category:  target.category,
            scrapedAt: new Date(),
        };

        result.fetched++;
        processed++;

        try {
            const inserted = await insertArticle(article);
            if (inserted) {
                result.inserted++;
                console.log(`  [+] ${title.slice(0, 70)}`);
            } else {
                result.skipped++;
                console.log(`  [=] Duplicate: ${title.slice(0, 70)}`);
            }
        } catch (err) {
            result.errors++;
            console.error(`  [!] DB error: ${(err as Error).message}`);
        }
    }

    await sleep(DELAY);
    return result;
}