export interface Article {
    id?: number;
    title: string;
    summary: string;
    url: string;
    source: string;
    category: string;
    scrapedAt: Date;
}

export interface ScrapeTarget {
    name: string;
    baseUrl: string;
    articleSelector: string;
    titleSelector: string;
    summarySelector: string;
    linkSelector: string;
    category: string;
}

export interface ScrapeResult {
    source: string;
    fetched: number;
    inserted: number;
    skipped: number;
    errors: number;
}

export interface DigestSection {
    category: string;
    articles: Article[];
}