import dotenv from 'dotenv';
dotenv.config();

import fs   from 'fs';
import path from 'path';
import { loadData }        from './data/loader';
import { renderDashboard } from './renderer/dashboard';
import { A }               from './renderer/ansi';

const REFRESH_MS  = parseInt(process.env.REFRESH_MS || '2000', 10);
const SUMMARY_PATH = path.resolve(process.env.SUMMARY_JSON || '../day-110-data-pipeline/data/output/summary.json');
const SOURCE      = fs.existsSync(SUMMARY_PATH) ? 'Day 110 pipeline' : 'mock data';

let tick = 0;

function render(): void {
    const data = loadData();
    renderDashboard(data, tick++, SOURCE);
}

process.stdout.write(A.hideCursor + A.clear);

render();
const timer = setInterval(render, REFRESH_MS);

const cleanup = () => {
    clearInterval(timer);
    process.stdout.write(A.showCursor + '\n');
    process.exit(0);
};

process.on('SIGINT',  cleanup);
process.on('SIGTERM', cleanup);