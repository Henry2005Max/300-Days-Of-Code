export type SentimentLabel = 'positive' | 'negative' | 'neutral';
export type TextCategory   = 'news' | 'review' | 'social' | 'finance';

export interface InputText {
    id:       string;
    text:     string;
    source:   string;
    category: TextCategory;
}

export interface Entity {
    text:  string;
    type:  'person' | 'place' | 'organization' | 'topic';
}

export interface SentimentResult {
    inputId:    string;
    text:       string;
    source:     string;
    category:   TextCategory;
    label:      SentimentLabel;
    score:      number;          // -1.0 to +1.0
    magnitude:  number;          // 0.0 to 1.0 — strength of sentiment
    entities:   Entity[];
    keywords:   string[];
    wordCount:  number;
    analyzedAt: Date;
}

export interface AggregateReport {
    totalAnalyzed:    number;
    positiveCount:    number;
    negativeCount:    number;
    neutralCount:     number;
    avgScore:         number;
    avgMagnitude:     number;
    topKeywords:      { keyword: string; count: number }[];
    topEntities:      { text: string; type: string; count: number }[];
    categoryBreakdown: { category: string; avgScore: number; count: number }[];
}