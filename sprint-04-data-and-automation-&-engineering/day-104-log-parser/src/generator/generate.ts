import fs   from 'fs';
import path from 'path';

const ENDPOINTS = [
    { method: 'GET',    path: '/api/products',        weight: 20 },
    { method: 'GET',    path: '/api/products/:id',    weight: 15 },
    { method: 'POST',   path: '/api/orders',          weight: 12 },
    { method: 'GET',    path: '/api/orders/:id',      weight: 10 },
    { method: 'GET',    path: '/api/users/profile',   weight: 10 },
    { method: 'PUT',    path: '/api/users/profile',   weight: 5  },
    { method: 'POST',   path: '/api/auth/login',      weight: 8  },
    { method: 'POST',   path: '/api/auth/logout',     weight: 4  },
    { method: 'GET',    path: '/api/categories',      weight: 8  },
    { method: 'DELETE', path: '/api/cart/:id',        weight: 3  },
    { method: 'GET',    path: '/health',              weight: 5  },
];

const IPS = [
    '197.210.55.1', '105.112.98.3', '41.190.30.7',
    '102.89.45.12', '196.201.219.8', '165.56.74.2',
];

const LEVELS = ['INFO', 'INFO', 'INFO', 'WARN', 'ERROR', 'DEBUG'];

function weightedPick<T extends { weight: number }>(items: T[]): T {
    const total  = items.reduce((s, i) => s + i.weight, 0);
    let   rand   = Math.random() * total;
    for (const item of items) {
        rand -= item.weight;
        if (rand <= 0) return item;
    }
    return items[items.length - 1];
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEntry(baseTime: Date, offsetMs: number): string {
    const ts       = new Date(baseTime.getTime() + offsetMs);
    const endpoint = weightedPick(ENDPOINTS);
    const isError  = Math.random() < 0.08;
    const isWarn   = !isError && Math.random() < 0.05;

    const statusCode = isError
        ? [400, 401, 403, 404, 500, 502, 503][randomInt(0, 6)]
        : isWarn ? 429 : [200, 200, 200, 201, 204][randomInt(0, 4)];

    const responseMs = isError
        ? randomInt(200, 3000)
        : endpoint.path === '/health' ? randomInt(1, 10) : randomInt(20, 800);

    const level = isError ? 'ERROR' : isWarn ? 'WARN' : 'INFO';

    const entry = {
        timestamp:    ts.toISOString(),
        level,
        method:       endpoint.method,
        endpoint:     endpoint.path.replace(':id', String(randomInt(1, 999))),
        statusCode,
        responseTime: responseMs,
        ip:           IPS[randomInt(0, IPS.length - 1)],
        message:      `${endpoint.method} ${endpoint.path} ${statusCode} ${responseMs}ms`,
        requestId:    Math.random().toString(36).slice(2, 10),
    };

    return JSON.stringify(entry);
}

function generate(): void {
    const outPath  = path.resolve('./logs/app.log');
    const lines: string[] = [];

    // Generate 6 hours of traffic with ~50 req/min average
    const now        = new Date();
    const startTime  = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    const totalMs    = 6 * 60 * 60 * 1000;
    const totalReqs  = 18000; // ~50/min over 6 hours

    for (let i = 0; i < totalReqs; i++) {
        const offsetMs = Math.random() * totalMs;
        lines.push(generateEntry(startTime, offsetMs));
    }

    // Sort by timestamp
    lines.sort((a, b) => {
        const ta = JSON.parse(a).timestamp as string;
        const tb = JSON.parse(b).timestamp as string;
        return ta.localeCompare(tb);
    });

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf-8');
    console.log(`Generated ${lines.length} log entries → ${outPath}`);
}

generate();