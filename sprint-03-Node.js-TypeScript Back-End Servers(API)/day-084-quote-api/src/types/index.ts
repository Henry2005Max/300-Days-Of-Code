// All shared types for the Quote API

export interface Quote {
    id: number;
    text: string;
    author: string;
    origin: string;       // e.g. "Nigeria", "Ghana", "Pan-African"
    category: string;     // e.g. "wisdom", "leadership", "resilience"
    view_count: number;
    created_at: string;
}

// A tag row — quotes and tags have a many-to-many relationship
export interface Tag {
    id: number;
    name: string;         // e.g. "proverb", "motivational", "politics"
}

// Junction row (not returned directly — used internally)
export interface QuoteTag {
    quote_id: number;
    tag_id: number;
}

// A quote enriched with its tags — what the API returns
export interface QuoteWithTags extends Quote {
    tags: string[];
}

// A favourited quote (per username — no auth, just a string identifier)
export interface Favourite {
    id: number;
    username: string;
    quote_id: number;
    saved_at: string;
}

// FTS5 search result — adds a `rank` field from the virtual table
export interface SearchResult extends QuoteWithTags {
    rank: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    errors?: { field: string; message: string }[];
    meta?: { total: number; count: number; page?: number; pages?: number };
}