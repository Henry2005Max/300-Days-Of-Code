import { LogEntry, LogLevel, LogFormat } from '../types';

// Detect format from first non-empty line
export function detectFormat(line: string): LogFormat {
    if (line.startsWith('{')) return 'json';
    // Combined: IP - - [timestamp] "METHOD /path HTTP/1.1" status bytes "ref" "ua"
    if (/^\d{1,3}\.\d{1,3}/.test(line) && line.includes('"')) return 'combined';
    return 'unknown';
}

function statusToLevel(code: number): LogLevel {
    if (code >= 500) return 'ERROR';
    if (code >= 400) return 'WARN';
    return 'INFO';
}

// Parse JSON log line (structured logging format)
function parseJsonLine(raw: string): LogEntry | null {
    try {
        const obj = JSON.parse(raw) as Record<string, unknown>;

        const timestamp  = obj.timestamp || obj.time || obj.date || obj['@timestamp'];
        const level      = String(obj.level || obj.severity || 'INFO').toUpperCase() as LogLevel;
        const method     = String(obj.method || obj.httpMethod || 'GET');
        const endpoint   = String(obj.endpoint || obj.path || obj.url || obj.uri || '/');
        const statusCode = parseInt(String(obj.statusCode || obj.status || obj.code || '200'), 10);
        const responseMs = parseFloat(String(obj.responseTime || obj.duration || obj.ms || obj.latency || '0'));
        const ip         = String(obj.ip || obj.remoteAddr || obj.clientIp || '-');
        const userAgent  = String(obj.userAgent || obj.ua || '-');
        const message    = String(obj.message || obj.msg || '');

        if (!timestamp) return null;

        return {
            timestamp:  new Date(String(timestamp)),
            level:      (['ERROR','WARN','INFO','DEBUG'].includes(level) ? level : 'INFO') as LogLevel,
            method:     method.toUpperCase(),
            endpoint:   endpoint.split('?')[0],  // strip query string
            statusCode: isNaN(statusCode) ? 200 : statusCode,
            responseMs: isNaN(responseMs) ? 0   : responseMs,
            ip,
            userAgent,
            message,
            raw,
        };
    } catch {
        return null;
    }
}

// Parse Combined Log Format (Apache / Nginx)
// 127.0.0.1 - - [10/Jan/2025:08:30:00 +0100] "GET /api/users HTTP/1.1" 200 1234 "-" "Mozilla/5.0"
const COMBINED_RE = /^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"(\w+)\s+(\S+)\s+\S+"\s+(\d+)\s+\S+(?:\s+"[^"]*"\s+"([^"]*)")?(?:\s+(\d+))?/;

function parseCombinedLine(raw: string): LogEntry | null {
    const m = COMBINED_RE.exec(raw);
    if (!m) return null;

    const [, ip, dateStr, method, path, statusStr,, msStr] = m;

    // Parse Apache date: 10/Jan/2025:08:30:00 +0100
    const cleanDate  = dateStr.replace(/(\d+)\/(\w+)\/(\d+):(\d+:\d+:\d+)\s+([+-]\d+)/, '$2 $1 $3 $4 $5');
    const timestamp  = new Date(cleanDate);
    if (isNaN(timestamp.getTime())) return null;

    const statusCode = parseInt(statusStr, 10);
    const responseMs = msStr ? parseInt(msStr, 10) : 0;

    return {
        timestamp,
        level:      statusToLevel(statusCode),
        method:     method.toUpperCase(),
        endpoint:   path.split('?')[0],
        statusCode,
        responseMs,
        ip,
        userAgent:  '-',
        message:    `${method} ${path} ${statusCode}`,
        raw,
    };
}

export function parseLine(raw: string, format: LogFormat): LogEntry | null {
    if (format === 'json')     return parseJsonLine(raw);
    if (format === 'combined') return parseCombinedLine(raw);

    // Try JSON first, then combined as fallback
    return parseJsonLine(raw) ?? parseCombinedLine(raw);
}