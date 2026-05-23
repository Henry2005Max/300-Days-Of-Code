import { LogEntry, LogLevel } from '../types';

const LEVEL_RANK: Record<LogLevel, number> = {
    ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3,
};

export function applyFilters(
    entries:     LogEntry[],
    levelFilter: string,
    hoursFilter: number
): LogEntry[] {
    let result = entries;

    // Level filter
    if (levelFilter !== 'ALL') {
        const minRank = LEVEL_RANK[levelFilter as LogLevel] ?? 3;
        result = result.filter((e) => LEVEL_RANK[e.level] <= minRank);
    }

    // Time range filter
    if (hoursFilter > 0) {
        const cutoff = new Date(Date.now() - hoursFilter * 60 * 60 * 1000);
        result = result.filter((e) => e.timestamp >= cutoff);
    }

    return result;
}