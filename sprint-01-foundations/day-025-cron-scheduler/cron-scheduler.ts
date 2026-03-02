// Cron Job Scheduler with node-cron
// Day 25 of 300 Days of Code Challenge

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import cron from 'node-cron';
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

interface Job {
  id: string;
  name: string;
  schedule: string;
  description: string;
  task: () => void;
  scheduledTask?: cron.ScheduledTask;
  isRunning: boolean;
  runCount: number;
  lastRun?: string;
  createdAt: string;
}

//  Job Registry 

const jobs: Map<string, Job> = new Map();
let jobCounter = 1;

//  Built-in Task Definitions 

function logToFile(message: string, filename: string = 'cron-log.txt'): void {
  const timestamp = new Date().toLocaleString();
  const line = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(filename, line);
}

function taskSystemCheck(): void {
  const timestamp = new Date().toLocaleTimeString();
  const mem = process.memoryUsage();
  const memMB = (mem.heapUsed / 1024 / 1024).toFixed(2);
  const msg = `System Check — Memory: ${memMB}MB | Uptime: ${process.uptime().toFixed(0)}s`;
  console.log(chalk.blue(`\n  [CRON] ${timestamp} — ${msg}`));
  logToFile(msg);
}

function taskGreeting(): void {
  const timestamp = new Date().toLocaleTimeString();
  const hour = new Date().getHours();
  let greeting = 'Good day';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';
  else greeting = 'Good evening';
  const msg = `${greeting}! Time check — ${timestamp}`;
  console.log(chalk.green(`\n  [CRON] ${msg}`));
  logToFile(msg);
}

function taskBackup(): void {
  const timestamp = new Date().toLocaleTimeString();
  const backupName = `backup-${Date.now()}.txt`;
  const content = `Backup created at ${new Date().toLocaleString()}\nThis simulates a backup task.\n`;
  fs.writeFileSync(backupName, content);
  const msg = `Backup created: ${backupName}`;
  console.log(chalk.yellow(`\n  [CRON] ${timestamp} — ${msg}`));
  logToFile(msg);
}

function taskQuote(): void {
  const quotes = [
    'Code is like humor. When you have to explain it, it is bad.',
    'First, solve the problem. Then, write the code.',
    'Experience is the name everyone gives to their mistakes.',
    'In order to be irreplaceable, one must always be different.',
    'Java is to JavaScript what car is to carpet.',
    'Knowledge is power.',
    'The best error message is the one that never shows up.',
    'Simplicity is the soul of efficiency.',
  ];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  const timestamp = new Date().toLocaleTimeString();
  console.log(chalk.magenta(`\n  [CRON] ${timestamp} — Quote: "${quote}"`));
  logToFile(`Quote: ${quote}`);
}

function taskCounter(jobId: string): void {
  const job = jobs.get(jobId);
  if (!job) return;
  const timestamp = new Date().toLocaleTimeString();
  console.log(chalk.cyan(`\n  [CRON] ${timestamp} — "${job.name}" has run ${job.runCount + 1} time(s)`));
  logToFile(`Job "${job.name}" run #${job.runCount + 1}`);
}

//  Schedule Presets 

const schedulePresets: { label: string; cron: string; description: string }[] = [
  { label: 'Every 5 seconds',  cron: '*/5 * * * * *',  description: 'Runs every 5 seconds' },
  { label: 'Every 10 seconds', cron: '*/10 * * * * *', description: 'Runs every 10 seconds' },
  { label: 'Every 30 seconds', cron: '*/30 * * * * *', description: 'Runs every 30 seconds' },
  { label: 'Every minute',     cron: '* * * * *',      description: 'Runs every minute' },
  { label: 'Every 5 minutes',  cron: '*/5 * * * *',    description: 'Runs every 5 minutes' },
  { label: 'Every hour',       cron: '0 * * * *',      description: 'Runs at the top of every hour' },
  { label: 'Every day at 8am', cron: '0 8 * * *',      description: 'Runs daily at 8:00 AM' },
  { label: 'Custom',           cron: '',               description: 'Enter your own cron expression' },
];

//  Job Management 

function createJob(name: string, schedule: string, description: string, taskFn: () => void): Job {
  const id = `job-${jobCounter++}`;
  const job: Job = {
    id,
    name,
    schedule,
    description,
    task: taskFn,
    isRunning: false,
    runCount: 0,
    createdAt: new Date().toLocaleString(),
  };
  jobs.set(id, job);
  return job;
}

function startJob(job: Job): void {
  if (job.isRunning) {
    console.log(chalk.yellow(`\n  "${job.name}" is already running.\n`));
    return;
  }

  job.scheduledTask = cron.schedule(job.schedule, () => {
    job.runCount++;
    job.lastRun = new Date().toLocaleString();
    job.task();
  });

  job.isRunning = true;
  console.log(chalk.green(`\n  Started: "${job.name}" [${job.schedule}]\n`));
}

function stopJob(job: Job): void {
  if (!job.isRunning) {
    console.log(chalk.yellow(`\n  "${job.name}" is not running.\n`));
    return;
  }
  job.scheduledTask?.stop();
  job.isRunning = false;
  console.log(chalk.red(`\n  Stopped: "${job.name}" after ${job.runCount} run(s)\n`));
}

function stopAllJobs(): void {
  jobs.forEach(job => {
    if (job.isRunning) {
      job.scheduledTask?.stop();
      job.isRunning = false;
    }
  });
  console.log(chalk.red('\n  All jobs stopped.\n'));
}

// ─── Display Functions ────────────────────────────────────

function displayJobs(): void {
  if (jobs.size === 0) {
    console.log(chalk.gray('\n  No jobs created yet.\n'));
    return;
  }

  console.log(chalk.bold.cyan('\n  Active Jobs:\n'));
  console.log(chalk.gray('  ' + '─'.repeat(65)));

  jobs.forEach(job => {
    const status = job.isRunning
      ? chalk.green('  RUNNING')
      : chalk.red('  STOPPED');

    console.log(
      chalk.yellow(`\n  [${job.id}]`) + ` ${job.name}` + status
    );
    console.log(chalk.gray(`    Schedule  : ${job.schedule} (${job.description})`));
    console.log(chalk.gray(`    Run count : ${job.runCount}`));
    console.log(chalk.gray(`    Last run  : ${job.lastRun || 'Never'}`));
    console.log(chalk.gray(`    Created   : ${job.createdAt}`));
  });

  console.log('');
}

function displayPresets(): void {
  console.log(chalk.bold.cyan('\n  Schedule Presets:\n'));
  schedulePresets.forEach((p, i) => {
    console.log(
      chalk.white(`  ${String(i + 1).padEnd(3)}`) +
      chalk.yellow(p.label.padEnd(20)) +
      chalk.gray(p.cron.padEnd(18)) +
      chalk.gray(p.description)
    );
  });
  console.log('');
}

function displayCronHelp(): void {
  console.log(chalk.bold.cyan('\n  Cron Expression Format:\n'));
  console.log(chalk.white('  ┌─── Second (0-59)    [optional]'));
  console.log(chalk.white('  │ ┌─── Minute (0-59)'));
  console.log(chalk.white('  │ │ ┌─── Hour (0-23)'));
  console.log(chalk.white('  │ │ │ ┌─── Day of month (1-31)'));
  console.log(chalk.white('  │ │ │ │ ┌─── Month (1-12)'));
  console.log(chalk.white('  │ │ │ │ │ ┌─── Day of week (0-7)'));
  console.log(chalk.white('  * * * * * *\n'));
  console.log(chalk.gray('  Examples:'));
  console.log(chalk.gray('  */5 * * * * *   Every 5 seconds'));
  console.log(chalk.gray('  0 * * * *       Every hour'));
  console.log(chalk.gray('  0 9 * * 1       Every Monday at 9am'));
  console.log(chalk.gray('  0 0 1 * *       First day of every month\n'));
}

//  Main Application 

async function runCronScheduler(): Promise<void> {
  console.clear();
  console.log(chalk.bold.green('═'.repeat(55)));
  console.log(chalk.bold.green('       CRON JOB SCHEDULER — NODE-CRON'));
  console.log(chalk.bold.green('═'.repeat(55)));
  console.log(chalk.white('\n   Schedule, run and manage cron jobs!\n'));
  console.log(chalk.bold.green('═'.repeat(55)));

  let continueRunning = true;

  while (continueRunning) {
    console.log(chalk.bold.cyan('\n  MENU\n'));
    console.log(chalk.white('   1. Add a system check job'));
    console.log(chalk.white('   2. Add a greeting job'));
    console.log(chalk.white('   3. Add a backup simulation job'));
    console.log(chalk.white('   4. Add a random quote job'));
    console.log(chalk.white('   5. Add a custom counter job'));
    console.log(chalk.white('   6. View all jobs'));
    console.log(chalk.white('   7. Stop a job'));
    console.log(chalk.white('   8. Stop all jobs'));
    console.log(chalk.white('   9. Cron expression help'));
    console.log(chalk.white('   10. Exit\n'));

    const choice = await askQuestion(chalk.cyan('  Choose an option (1-10): '));

    if (choice === '10') {
      stopAllJobs();
      console.log(chalk.green('\n  Cron mastered! Day 25 done! 👋\n'));
      break;
    }

    try {
      switch (choice) {

        //  Options 1-5: Add Jobs 
        case '1':
        case '2':
        case '3':
        case '4':
        case '5': {
          displayPresets();
          const presetInput = await askQuestion(chalk.cyan('  Choose preset (1-8): '));
          const presetIndex = parseInt(presetInput) - 1;

          if (isNaN(presetIndex) || presetIndex < 0 || presetIndex > 7) {
            console.log(chalk.red('\n  Invalid preset!\n'));
            break;
          }

          let schedule = schedulePresets[presetIndex].cron;
          let description = schedulePresets[presetIndex].description;

          if (presetIndex === 7) {
            displayCronHelp();
            schedule = await askQuestion(chalk.cyan('  Enter cron expression: '));
            if (!cron.validate(schedule)) {
              console.log(chalk.red('\n  Invalid cron expression!\n'));
              break;
            }
            description = 'Custom schedule';
          }

          let job: Job;

          if (choice === '1') {
            job = createJob('System Check', schedule, description, taskSystemCheck);
          } else if (choice === '2') {
            job = createJob('Greeting', schedule, description, taskGreeting);
          } else if (choice === '3') {
            job = createJob('Backup Simulation', schedule, description, taskBackup);
          } else if (choice === '4') {
            job = createJob('Random Quote', schedule, description, taskQuote);
          } else {
            const tempId = `job-${jobCounter}`;
            job = createJob('Counter Job', schedule, description, () => taskCounter(tempId));
          }

          startJob(job);
          console.log(chalk.gray('  Watch for output above as the job fires...\n'));
          break;
        }

        //  Option 6: View Jobs 
        case '6': {
          displayJobs();
          break;
        }

        //  Option 7: Stop a Job 
        case '7': {
          displayJobs();
          if (jobs.size === 0) break;
          const idInput = await askQuestion(chalk.cyan('  Enter job ID to stop (e.g. job-1): '));
          const job = jobs.get(idInput);
          if (!job) {
            console.log(chalk.red('\n  Job not found!\n'));
            break;
          }
          stopJob(job);
          break;
        }

        //  Option 8: Stop All 
        case '8': {
          stopAllJobs();
          break;
        }

        //  Option 9: Cron Help 
        case '9': {
          displayCronHelp();
          break;
        }

        default:
          console.log(chalk.red('\n  Invalid option! Please choose 1-10.\n'));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red(`\n  Error: ${error.message}\n`));
      }
    }

    const again = await askQuestion(chalk.cyan('  Continue? (yes/no): '));
    if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
      stopAllJobs();
      console.log(chalk.green('\n  Cron mastered! Day 25 done! 👋\n'));
      continueRunning = false;
    }
  }

  rl.close();
  process.exit(0);
}

runCronScheduler();