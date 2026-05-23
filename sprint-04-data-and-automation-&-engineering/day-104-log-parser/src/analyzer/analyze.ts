import {
    LogEntry, LogLevel, EndpointStat, HourlyBucket,
    StatusDist, AnalysisReport,
} from '../types';

function percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
}

function buildEndpointStats(entries: LogEntry[], topN: number): EndpointStat[] {
    const map = new Map<string, LogEntry[]>();

    for (const e of entries) {
        const key = `${e.method} ${e.endpoint}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(e);
    }

    const stats: EndpointStat[] = [];

    for (const [key, rows] of map) {
        const [method, ...rest] = key.split(' ');
        const endpoint    = rest.join(' ');
        const times       = rows.map((r) => r.responseMs).sort((a, b) => a - b);
        const errorCount  = rows.filter((r) => r.statusCode >= 400).length;

        stats.push({
            endpoint,
            method,
            requestCount: rows.length,
            errorCount,
            errorRate:    parseFloat(((errorCount / rows.length) * 100).toFixed(1)),
            avgMs:        parseFloat((times.reduce((s, t) => s + t, 0) / times.length).toFixed(1)),
            p50Ms:        percentile(times, 50),
            p95Ms:        percentile(times, 95),
            p99Ms:        percentile(times, 99),
            minMs:        times[0] ?? 0,
            maxMs:        times[times.length - 1] ?? 0,
        });
    }

    return stats
        .sort((a, b) => b.requestCount - a.requestCount)
        .slice(0, topN);
}

function buildHourlyTraffic(entries: LogEntry[]): HourlyBucket[] {
    const map = new Map<string, LogEntry[]>();

    for (const e of entries) {
        const hour = e.timestamp.toISOString().slice(0, 13) + ':00';
        if (!map.has(hour)) map.set(hour, []);
        map.get(hour)!.push(e);
    }

    return [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([hour, rows]) => ({
            hour,
            requestCount: rows.length,
            errorCount:   rows.filter((r) => r.statusCode >= 400).length,
            avgMs:        parseFloat((rows.reduce((s, r) => s + r.responseMs, 0) / rows.length).toFixed(1)),
        }));
}

function buildStatusDist(entries: LogEntry[]): StatusDist[] {
    const counts = new Map<number, number>();
    for (const e of entries) {
        counts.set(e.statusCode, (counts.get(e.statusCode) ?? 0) + 1);
    }
    const total = entries.length || 1;
    return [...counts.entries()]
        .sort(([a], [b]) => a - b)
        .map(([code, count]) => ({
            code,
            count,
            percent: parseFloat(((count / total) * 100).toFixed(1)),
        }));
}

export function analyze(
    entries:    LogEntry[],
    filePath:   string,
    totalLines: number,
    topN:       number
): AnalysisReport {
    const levelCounts: Record<LogLevel, number> = {
        ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0,
    };
    for (const e of entries) levelCounts[e.level]++;

    const allTimes   = entries.map((e) => e.responseMs).sort((a, b) => a - b);
    const totalMs    = allTimes.reduce((s, t) => s + t, 0);
    const errorCount = entries.filter((e) => e.statusCode >= 400).length;

    const timestamps = entries.map((e) => e.timestamp).sort((a, b) => a.getTime() - b.getTime());

    return {
        filePath,
        totalLines,
        parsedEntries:   entries.length,
        skippedLines:    totalLines - entries.length,
        timeRange:       entries.length > 0
            ? { from: timestamps[0], to: timestamps[timestamps.length - 1] }
            : null,
        levelCounts,
        statusDist:      buildStatusDist(entries),
        topEndpoints:    buildEndpointStats(entries, topN),
        slowestRequests: [...entries]
            .sort((a, b) => b.responseMs - a.responseMs)
            .slice(0, 5),
        hourlyTraffic:   buildHourlyTraffic(entries),
        overallAvgMs:    entries.length > 0
            ? parseFloat((totalMs / entries.length).toFixed(1))
            : 0,
        overallP95Ms:    percentile(allTimes, 95),
        errorRate:       entries.length > 0
            ? parseFloat(((errorCount / entries.length) * 100).toFixed(1))
            : 0,
    };
}