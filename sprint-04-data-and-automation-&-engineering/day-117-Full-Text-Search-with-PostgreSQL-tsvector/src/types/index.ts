export interface Article {
  id: number;
  title: string;
  body: string;
  author: string;
  category: string;
  tags: string[];
  published_at: string;
}

export interface SearchResult extends Article {
  rank: number;
  headline: string;
}

export interface SearchOptions {
  query: string;
  category?: string;
  author?: string;
  language?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  query: string;
  total: number;
  limit: number;
  offset: number;
  results: SearchResult[];
}

export interface SuggestResult {
  word: string;
}

export interface StatsRow {
  category: string;
  article_count: number;
  avg_rank: number | null;
}
