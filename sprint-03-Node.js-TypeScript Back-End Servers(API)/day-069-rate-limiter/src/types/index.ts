export interface RateLimitOptions {
  windowMs: number;    /* time window in milliseconds */
  max: number;         /* max requests per window */
  message?: string;    /* custom message when limit is hit */
  keyGenerator?: (req: any) => string; /* how to identify clients */
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: number;     /* Unix timestamp when oldest request expires */
  retryAfterSeconds: number;
}

export interface ClientRecord {
  timestamps: number[]; /* list of request timestamps in the window */
}