export type Algorithm = 'sliding_window' | 'fixed_window' | 'token_bucket';

export interface RateLimitConfig {
    windowMs:    number;   // time window in milliseconds
    maxRequests: number;   // max requests per window
    algorithm:   Algorithm;
    keyPrefix?:  string;   // namespaces the key in storage
    message?:    string;   // custom 429 message
    skipIf?:     (ip: string) => boolean;  // whitelist function
}

export interface RateLimitState {
    key:         string;
    requests:    number;
    windowStart: number;  // epoch ms
    tokens:      number;  // for token bucket
    lastRefill:  number;  // epoch ms for token bucket
}

export interface RateLimitResult {
    allowed:     boolean;
    remaining:   number;
    resetMs:     number;   // ms until window resets
    retryAfter:  number;   // seconds
    limit:       number;
    current:     number;
}

export interface RequestLog {
    id:         number;
    ip:         string;
    path:       string;
    method:     string;
    status:     number;
    allowed:    boolean;
    algorithm:  string;
    timestamp:  string;
}