import { JobDefinition, JobStats } from '../types';
import {
    getRawStats, getLastRun, computeStreak, getHistory,
} from '../db/store';

const ANSI = {
    reset:   '\x1b[0m',
    bold:    '\x1b[1m',
    dim:     '\x1b[2m',
    green:   '\x1b[32m',
    red:     '\x1b[31m',
    yellow:  '\x1b[33m',
    cyan:    '\x1b[36m',
    white:   '\x1b[37m',
    home:    '\x1b[H',
    clear:   '\x1b[2J',
};

function c(code: string, text: string): string {
    return `${code}${text}${ANSI.reset}`;
}

function statusBadge(status: string | null): string {
    if (status === 'success') return c(ANSI.green,  '● OK    ');
    if (status === 'failed')  return c(ANSI.red,    '● FAIL  ');
    if (status === 'running') return c(ANSI.yellow, '● RUN   ');
    return c(ANSI.dim, '○ NEVER ');
}

function relativeTime(isoStr: string | null): string {
    if (!isoStr) return c(ANSI.dim, 'never');
    const diff = Math.round((Date.now() - new Date(isoStr).getTime()) / 1000);
    if (diff < 60)   return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
}

function streakLabel(n: number): string {
    if (n === 0) return c(ANSI.dim, '—');
    if (n >= 5)  return c(ANSI.green, `${n} ★`);
    return c(ANSI.yellow, String(n));
}

export function buildStats(jobs: JobDefinition[]): JobStats[] {
    return jobs.map((job) => {
        const raw     = getRawStats(job.id);
        const lastRun = getLastRun(job.id);
        const streak  = computeStreak(job.id);

        return {
            jobId:         job.id,
            jobName:       job.name,
            schedule:      job.schedule,
            description:   job.description,
            totalRuns:     raw?.totalRuns    ?? 0,
            successRuns:   raw?.successRuns  ?? 0,
            failedRuns:    raw?.failedRuns   ?? 0,
            lastStatus:    lastRun?.status   ?? null,
            lastRun:       lastRun?.startedAt ?? null,
            lastMessage:   lastRun?.message  ?? null,
            avgDurationMs: raw?.avgDurationMs ?? null,
            streak,
        };
    });
}

const LINE  = '─'.repeat(74);
const DLINE = '═'.repeat(74);

export function printStatusTable(jobs: JobDefinition[]): void {
    const stats = buildStats(jobs);
    const now   = new Date().toLocaleTimeString('en-NG', {
        timeZone: 'Africa/Lagos', hour12: false,
    });

    process.stdout.write(ANSI.home);
    console.log('');
    console.log(c(ANSI.bold + ANSI.cyan, '  CRON SCHEDULER — JOB STATUS'));
    console.log(c(ANSI.dim, `  Updated: ${now} WAT    Press Ctrl+C to exit`));
    console.log('  ' + DLINE);
    console.log(
        `  ${'Job'.padEnd(22)} ${'Schedule'.padEnd(18)} ${'Status'.padEnd(10)} ${'Last Run'.padEnd(10)} ${'Runs'.padStart(5)}  ${'Streak'.padStart(6)}`
    );
    console.log('  ' + LINE);

    for (const s of stats) {
        const badge    = statusBadge(s.lastStatus);
        const lastRun  = relativeTime(s.lastRun);
        const avg      = s.avgDurationMs ? `${Math.round(s.avgDurationMs)}ms` : '—';

        console.log(
            `  ${s.jobName.slice(0, 22).padEnd(22)} ${s.schedule.padEnd(18)} ${badge} ${lastRun.padEnd(10)} ${String(s.totalRuns).padStart(5)}  ${streakLabel(s.streak).padEnd(6)}`
        );
        console.log(
            c(ANSI.dim, `  ${''.padEnd(22)} ${s.description.slice(0, 42).padEnd(42)}  avg: ${avg}`)
        );
        if (s.lastMessage) {
            console.log(
                c(ANSI.dim, `  ${''.padEnd(22)} └─ ${s.lastMessage.slice(0, 55)}`)
            );
        }
        console.log('');
    }

    console.log('  ' + LINE);
}

export function printHistory(limit = 20): void {
    const runs = getHistory(limit);

    console.log('\n' + '═'.repeat(74));
    console.log('  JOB HISTORY (last 20 runs)');
    console.log('═'.repeat(74));
    console.log(
        `  ${'Job'.padEnd(22)} ${'Status'.padEnd(10)} ${'Duration'.padStart(9)}  ${'Started'.padEnd(26)}  Message`
    );
    console.log('  ' + LINE);

    for (const r of runs) {
        const badge    = statusBadge(r.status);
        const duration = r.durationMs != null ? `${r.durationMs}ms` : '—';
        const started  = new Date(r.startedAt).toLocaleString('en-NG', {
            timeZone: 'Africa/Lagos', dateStyle: 'short', timeStyle: 'medium',
        });
        const msg = (r.message || '').slice(0, 35);
        console.log(
            `  ${r.jobName.slice(0, 22).padEnd(22)} ${badge} ${duration.padStart(9)}  ${started.padEnd(26)}  ${c(ANSI.dim, msg)}`
        );
    }

    if (runs.length === 0) {
        console.log(c(ANSI.dim, '\n  No runs recorded yet. Start the scheduler first.\n'));
    }

    console.log('');
}