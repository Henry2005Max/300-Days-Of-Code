export interface QuoteRow {
    id: number;
    text: string;
    author: string;
    category: string;
    source?: string;
    view_count: number;
    created_at: string;
}

export interface Quote {
    id: number;
    text: string;
    author: string;
    category: string;
    source?: string;
    viewCount: number;
    createdAt: string;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PagedResponse<T> {
    success: boolean;
    data: T[];
    meta: PaginationMeta;
}

export function toQuote(row: QuoteRow): Quote {
    return {
        id:        row.id,
        text:      row.text,
        author:    row.author,
        category:  row.category,
        source:    row.source,
        viewCount: row.view_count,
        createdAt: row.created_at,
    };
}