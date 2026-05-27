import fs   from 'fs';
import path from 'path';
import { OrganizerRun } from '../types';

export function loadHistory(historyFile: string): OrganizerRun[] {
    if (!fs.existsSync(historyFile)) return [];
    try {
        return JSON.parse(fs.readFileSync(historyFile, 'utf-8')) as OrganizerRun[];
    } catch {
        return [];
    }
}

export function saveRun(historyFile: string, run: OrganizerRun): void {
    const history = loadHistory(historyFile);
    history.unshift(run); // newest first
    // Keep last 50 runs
    const trimmed = history.slice(0, 50);
    fs.mkdirSync(path.dirname(historyFile), { recursive: true });
    fs.writeFileSync(historyFile, JSON.stringify(trimmed, null, 2), 'utf-8');
}

export function generateRunId(): string {
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return `run-${ts}`;
}