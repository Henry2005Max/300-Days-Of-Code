// Cron Examples — Real World Patterns
// Day 27 of 300 Days of Code Challenge

import * as readline from 'readline';
import * as fs from 'fs';
import cron, { ScheduledTask } from 'node-cron';
import chalk from 'chalk';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(answer.trim());
    });
  });
}

//  Types 

interface LogEntry {
  timestamp: string;
  job: string;
  message: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
}

interface MetricSnapshot {
  timestamp: string;
  memoryMB: number;
  uptimeSeconds: number;
  cpuLoad: number;
}

interface NewsItem {
  title: string;
  source: string;
  time: string;
}

//  Logger 

const logFile = 'cron-examples-log.txt';
const metricsFile = 'metrics-history.json';
const metricsHistory: MetricSnapshot[] = [];

function log(job: string, message: string, level: LogEntry['level'] = 'INFO'): void {
  const timestamp = new Date().toLocaleString();
  const entry: LogEntry = { timestamp, job, message, level };

  const colors: Record<string, chalk.Chalk> = {
    INFO:    chalk.cyan,
    WARN:    chalk.yellow,
    ERROR:   chalk.red,
    SUCCESS: chalk.green,
  };

  const color = colors[level] || chalk.white;
  console.log(color(`\n  [${level}] [${timestamp}] ${job}: ${message}`));

  const line = `[${level}] [${timestamp}] ${job}: ${message}\n`;
  fs.appendFileSync(logFile, line);
}

//  Example 1: Health Monitor 
// Simulates a server health check running every few seconds

let healthCheckTask: ScheduledTask | null = null;
let healthCheckCount = 0;

function runHealthCheck(): void {
  healthCheckCount++;
  const mem = process.memoryUsage();
  const memMB = (mem.heapUsed / 1024 / 1024).toFixed(2);
  const uptime = process.uptime().toFixed(0);
  const cpuLoad = (Math.random() * 30 + 10).toFixed(1); // simulated

  const snapshot: MetricSnapshot = {
    timestamp: new Date().toLocaleString(),
    memoryMB: parseFloat(memMB),
    uptimeSeconds: parseFloat(uptime),
    cpuLoad: parseFloat(cpuLoad),
  };

  metricsHistory.push(snapshot);
  fs.writeFileSync(metricsFile, JSON.stringify(metricsHistory, null, 2));

  const memWarn = parseFloat(memMB) > 100;
  const level = memWarn ? 'WARN' : 'SUCCESS';
  log('HealthMonitor', `Memory: ${memMB}MB | Uptime: ${uptime}s | CPU: ${cpuLoad}% | Check #${healthCheckCount}`, level);
}

// ─── Example 2: Report Generator ──────────────────────────
// Simulates generating a daily sales report

let reportTask: ScheduledTask | null = null;
let reportCount = 0;

const mockSales = [
  { product: 'Laptop Pro',    units: 12, revenue: 5400000 },
  { product: 'Smartphone X',  units: 28, revenue: 5040000 },
  { product: 'Rice 50kg',     units: 45, revenue: 2025000 },
  { product: 'Sneakers Pro',  units: 15, revenue:  525000 },
  { product: 'Blender 2000',  units: 8,  revenue:  176000 },
];

function generateReport(): void {
  reportCount++;
  const timestamp = new Date().toLocaleString();
  const totalRevenue = mockSales.reduce((a, b) => a + b.revenue, 0);
  const totalUnits = mockSales.reduce((a, b) => a + b.units, 0);

  const reportName = `report-${Date.now()}.txt`;
  let content = `SALES REPORT — Generated: ${timestamp}\n`;
  content += '='.repeat(50) + '\n\n';
  mockSales.forEach(s => {
    content += `${s.product.padEnd(20)} Units: ${s.units}   Revenue: ₦${s.revenue.toLocaleString()}\n`;
  });
  content += '\n' + '-'.repeat(50) + '\n';
  content += `TOTAL UNITS  : ${totalUnits}\n`;
  content += `TOTAL REVENUE: ₦${totalRevenue.toLocaleString()}\n`;

  fs.writeFileSync(reportName, content);
  log('ReportGenerator', `Report #${reportCount} saved → ${reportName} | Revenue: ₦${(totalRevenue / 1000000).toFixed(1)}M`, 'SUCCESS');
}

// ─── Example 3: Data Cleanup ───────────────────────────────
// Simulates cleaning old temp files on a schedule

let cleanupTask: ScheduledTask | null = null;
let cleanupCount = 0;

function runDataCleanup(): void {
  cleanupCount++;

  // Simulate finding and removing old files
  const fakeOldFiles = [
    'temp-20240101.txt',
    'cache-20240215.json',
    'session-20240310.dat',
    'log-20240401.txt',
  ];

  const toDelete = fakeOldFiles.slice(0, Math.floor(Math.random() * 3) + 1);
  log('DataCleanup', `Scan #${cleanupCount} — Found ${toDelete.length} stale file(s): ${toDelete.join(', ')}`, 'INFO');
  log('DataCleanup', `Removed ${toDelete.length} file(s). Storage freed: ${(toDelete.length * 1.4).toFixed(1)}MB`, 'SUCCESS');
}

// ─── Example 4: News Ticker ────────────────────────────────
// Simulates fetching and displaying news headlines on a cycle

let newsTask: ScheduledTask | null = null;
let newsIndex = 0;

const mockNews: NewsItem[] = [
  { title: 'CBN Raises Interest Rates to 22.75%',              source: 'Punch',       time: '08:15' },
  { title: 'Lagos-Ibadan Expressway Expansion Begins Q2',      source: 'Vanguard',    time: '09:30' },
  { title: 'Nigeria Tech Startups Raise $200M in Q1 2026',     source: 'TechCabal',   time: '10:00' },
  { title: 'NNPC Records Highest Output in 5 Years',           source: 'Thisday',     time: '11:45' },
  { title: 'Dangote Refinery Hits Full Capacity',              source: 'BusinessDay', time: '12:30' },
  { title: 'Super Eagles Qualify for AFCON 2027',              source: 'Guardian',    time: '13:00' },
  { title: 'Naira Strengthens to ₦1,480 per Dollar',          source: 'Nairametrics', time: '14:15' },
  { title: 'New Broadband Policy to Cover 95% of Nigeria',     source: 'NCC',         time: '15:00' },
];

function showNextHeadline(): void {
  const item = mockNews[newsIndex % mockNews.length];
  newsIndex++;
  log('NewsTicker', `[${item.source}] ${item.title}`, 'INFO');
}

//  Example 5: Rate Limiter Monitor 
// Simulates tracking API calls and resetting quota every window

let rateLimitTask: ScheduledTask | null = null;
let apiCallCount = 0;
const API_LIMIT = 10;
let windowCount = 0;

function simulateApiCall(): void {
  apiCallCount += Math.floor(Math.random() * 4) + 1;
}

function checkRateLimit(): void {
  windowCount++;
  const usage = Math.min(apiCallCount, API_LIMIT);
  const pct = ((usage / API_LIMIT) * 100).toFixed(0);
  const level = usage >= API_LIMIT ? 'WARN' : usage > API_LIMIT * 0.7 ? 'INFO' : 'SUCCESS';

  log(
    'RateLimiter',
    `Window #${windowCount} — Calls: ${usage}/${API_LIMIT} (${pct}%) ${usage >= API_LIMIT ? '⚠ LIMIT HIT' : '✓ OK'}`,
    level
  );

  apiCallCount = 0; // Reset for next window
}

//  Active Tasks Registry 

const activeTasks: Map<string, ScheduledTask> = new Map();

function stopAllTasks(): void {
  activeTasks.forEach((task, name) => {
    task.stop();
  });
  activeTasks.clear();
}

//  Display Functions 

function showExampleInfo(): void {
  console.log(chalk.bold.cyan('\n  REAL WORLD CRON PATTERNS:\n'));

  const examples = [
    { num: '1', name: 'Health Monitor',     desc: 'Tracks memory, uptime, CPU — saves to metrics-history.json',     schedule: 'Every 5s'  },
    { num: '2', name: 'Report Generator',   desc: 'Generates a timestamped sales report .txt file on schedule',      schedule: 'Every 10s' },
    { num: '3', name: 'Data Cleanup',       desc: 'Scans for stale files and removes them — simulates disk cleanup', schedule: 'Every 8s'  },
    { num: '4', name: 'News Ticker',        desc: 'Cycles through Nigerian news headlines one by one',               schedule: 'Every 6s'  },
    { num: '5', name: 'Rate Limiter',       desc: 'Tracks API call quota per window and resets on schedule',         schedule: 'Every 7s'  },
  ];

  examples.forEach(e => {
    console.log(chalk.yellow(`  ${e.num}. ${e.name}`) + chalk.gray(` [${e.schedule}]`));
    console.log(chalk.white(`     ${e.desc}\n`));
  });
}

function showMetricsHistory(): void {
  if (metricsHistory.length === 0) {
    console.log(chalk.gray('\n  No metrics collected yet. Run the Health Monitor first.\n'));
    return;
  }

  console.log(chalk.bold.cyan('\n  Metrics History:\n'));
  console.log(chalk.bold.white('  Timestamp              Memory(MB)   Uptime(s)   CPU%'));
  console.log(chalk.gray('  ' + '─'.repeat(55)));

  metricsHistory.slice(-8).forEach(m => {
    const memColor = m.memoryMB > 100 ? chalk.red : chalk.green;
    console.log(
      chalk.white(`  ${m.timestamp.padEnd(23)}`) +
      memColor(String(m.memoryMB).padEnd(13)) +
      chalk.white(String(m.uptimeSeconds).padEnd(12)) +
      chalk.yellow(`${m.cpuLoad}%`)
    );
  });
  console.log('');
}

//  Main Application 

async function runCronExamples(): Promise<void> {
  console.clear();
  console.log(chalk.bold.magenta('═'.repeat(55)));
  console.log(chalk.bold.magenta('        CRON EXAMPLES — DAY 27'));
  console.log(chalk.bold.magenta('═'.repeat(55)));
  console.log(chalk.white('\n   Real-world cron patterns with node-cron!\n'));
  console.log(chalk.bold.magenta('═'.repeat(55)));

  showExampleInfo();

  let continueRunning = true;

  while (continueRunning) {
    console.log(chalk.bold.cyan('\n  MENU\n'));
    console.log(chalk.white('   1. Start Health Monitor'));
    console.log(chalk.white('   2. Start Report Generator'));
    console.log(chalk.white('   3. Start Data Cleanup'));
    console.log(chalk.white('   4. Start News Ticker'));
    console.log(chalk.white('   5. Start Rate Limiter Monitor'));
    console.log(chalk.white('   6. Start ALL examples'));
    console.log(chalk.white('   7. View metrics history'));
    console.log(chalk.white('   8. Stop all jobs'));
    console.log(chalk.white('   9. Exit\n'));

    if (activeTasks.size > 0) {
      console.log(chalk.green(`  Running jobs: ${activeTasks.size} active\n`));
    }

    const choice = await askQuestion(chalk.cyan('  Choose an option (1-9): '));

    if (choice === '9') {
      stopAllTasks();
      console.log(chalk.magenta('\n  Cron examples done! Day 27 complete! 👋\n'));
      break;
    }

    try {
      switch (choice) {

        case '1': {
          if (activeTasks.has('health')) {
            console.log(chalk.yellow('\n  Health Monitor already running!\n'));
            break;
          }
          const task = cron.schedule('*/5 * * * * *', runHealthCheck);
          activeTasks.set('health', task);
          log('HealthMonitor', 'Started — runs every 5 seconds', 'SUCCESS');
          break;
        }

        case '2': {
          if (activeTasks.has('report')) {
            console.log(chalk.yellow('\n  Report Generator already running!\n'));
            break;
          }
          const task = cron.schedule('*/10 * * * * *', generateReport);
          activeTasks.set('report', task);
          log('ReportGenerator', 'Started — generates report every 10 seconds', 'SUCCESS');
          break;
        }

        case '3': {
          if (activeTasks.has('cleanup')) {
            console.log(chalk.yellow('\n  Data Cleanup already running!\n'));
            break;
          }
          const task = cron.schedule('*/8 * * * * *', runDataCleanup);
          activeTasks.set('cleanup', task);
          log('DataCleanup', 'Started — scans every 8 seconds', 'SUCCESS');
          break;
        }

        case '4': {
          if (activeTasks.has('news')) {
            console.log(chalk.yellow('\n  News Ticker already running!\n'));
            break;
          }
          const task = cron.schedule('*/6 * * * * *', showNextHeadline);
          activeTasks.set('news', task);
          log('NewsTicker', 'Started — new headline every 6 seconds', 'SUCCESS');
          break;
        }

        case '5': {
          if (activeTasks.has('ratelimit')) {
            console.log(chalk.yellow('\n  Rate Limiter already running!\n'));
            break;
          }
          // Simulate API calls coming in
          const apiSim = cron.schedule('*/2 * * * * *', simulateApiCall);
          const rateTask = cron.schedule('*/7 * * * * *', checkRateLimit);
          activeTasks.set('ratelimit', rateTask);
          activeTasks.set('apisim', apiSim);
          log('RateLimiter', 'Started — checks quota every 7 seconds', 'SUCCESS');
          break;
        }

        case '6': {
          const tasks = [
            { key: 'health',    schedule: '*/5 * * * * *', fn: runHealthCheck,   name: 'HealthMonitor'    },
            { key: 'report',    schedule: '*/10 * * * * *', fn: generateReport,  name: 'ReportGenerator'  },
            { key: 'cleanup',   schedule: '*/8 * * * * *', fn: runDataCleanup,   name: 'DataCleanup'      },
            { key: 'news',      schedule: '*/6 * * * * *', fn: showNextHeadline, name: 'NewsTicker'       },
            { key: 'ratelimit', schedule: '*/7 * * * * *', fn: checkRateLimit,   name: 'RateLimiter'      },
            { key: 'apisim',    schedule: '*/2 * * * * *', fn: simulateApiCall,  name: 'ApiSim'           },
          ];

          tasks.forEach(t => {
            if (!activeTasks.has(t.key)) {
              const task = cron.schedule(t.schedule, t.fn);
              activeTasks.set(t.key, task);
            }
          });

          console.log(chalk.green('\n  All 5 cron examples started!\n'));
          console.log(chalk.gray('  Watch the log output above as each job fires...\n'));
          break;
        }

        case '7': {
          showMetricsHistory();
          break;
        }

        case '8': {
          stopAllTasks();
          console.log(chalk.red('\n  All jobs stopped.\n'));
          break;
        }

        default:
          console.log(chalk.red('\n  Invalid option! Choose 1-9.\n'));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red(`\n  Error: ${error.message}\n`));
      }
    }

    const again = await askQuestion(chalk.cyan('  Continue? (yes/no): '));
    if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
      stopAllTasks();
      console.log(chalk.magenta('\n  Cron examples done! Day 27 complete! 👋\n'));
      continueRunning = false;
    }
  }

  rl.close();
  process.exit(0);
}

runCronExamples();