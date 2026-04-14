export interface ScrapeResult<T> {
  url: string;
  scrapedAt: string;
  fromCache: boolean;
  data: T;
}

export interface HackerNewsItem {
  rank: number;
  title: string;
  url: string;
  points: number;
  author: string;
  comments: number;
}

export interface Quote {
  text: string;
  author: string;
  tags: string[];
}

export interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
}