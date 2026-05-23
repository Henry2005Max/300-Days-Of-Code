export type LogLevel  = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
export type LogFormat = 'json' | 'combined' | 'common' | 'unknown';

// Parsed log entry — normalised from any format
export interface LogEntry {
    timestamp:    Date;
    level:        LogLevel;
    method:       string;
    endpoint:     string;
    statusCode:   number;
    responseMs:   number;
    ip:           string;
    userAgent:    string;
    message:      string;
    raw:          string;
}

// Per-endpoint stats
export interface EndpointStat {
    endpoint:     string;
    method:       string;
    requestCount: number;
    errorCount:   number;
    errorRate:    number;
    avgMs:        number;
    p50Ms:        number;
    p95Ms:        number;
    p99Ms:        number;
    minMs:        number;
    maxMs:        number;
}

// Per-hour bucket
export interface HourlyBucket {
    hour:         string;   // 'YYYY-MM-DD HH:00'
    requestCount: number;
    errorCount:   number;
    avgMs:        number;
}

// Status code distribution
export interface StatusDist {
    code:    number;
    count:   number;
    percent: number;
}

// Full analysis report
export interface AnalysisReport {
    filePath:        string;
    totalLines:      number;
    parsedEntries:   number;
    skippedLines:    number;
    timeRange:       { from: Date; to: Date } | null;
    levelCounts:     Record<LogLevel, number>;
    statusDist:      StatusDist[];
    topEndpoints:    EndpointStat[];
    slowestRequests: LogEntry[];
    hourlyTraffic:   HourlyBucket[];
    overallAvgMs:    number;
    overallP95Ms:    number;
    errorRate:       number;
}

export interface ParseConfig {
    logFile:      string;
    levelFilter:  string;
    hoursFilter:  number;
    topN:         number;
}