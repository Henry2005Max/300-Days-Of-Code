# Day 25: Cron Job Scheduler with node-cron

## Description
A TypeScript CLI tool that creates, manages and monitors scheduled cron jobs using the node-cron library. Supports five built-in job types — system check, greeting, backup simulation, random quotes and a counter — each schedulable via presets or custom cron expressions. All jobs log their output to a cron-log.txt file and the app supports starting, stopping and monitoring multiple concurrent jobs.

## Features
- **System Check Job** - Logs memory usage and process uptime on schedule
- **Greeting Job** - Prints time-aware greeting (morning/afternoon/evening)
- **Backup Simulation** - Creates timestamped backup files to simulate real backups
- **Random Quote Job** - Prints a random programming quote on schedule
- **Counter Job** - Tracks and displays how many times a job has run
- **Schedule Presets** - 7 preset schedules from every 5 seconds to daily at 8am
- **Custom Cron** - Enter any valid cron expression with built-in validation
- **Job Registry** - View all jobs with status, run count and last run time
- **Start / Stop** - Start and stop individual jobs or all jobs at once
- **Log File** - All job output appended to cron-log.txt automatically
- **Cron Help** - Built-in cron expression reference guide

## Technologies Used
- TypeScript
- Node.js
- node-cron 3.x
- Chalk (terminal colors)
- readline (built-in Node.js module)
- fs (built-in Node.js module)

## Installation

```bash
npm install
```

## How to Run

```bash
npx ts-node cron-scheduler.ts
```

## Example Usage

### Add a system check job every 5 seconds:
```
Option 1 → System Check
Preset 1 → Every 5 seconds

Started: "System Check" [*/5 * * * * *]

  [CRON] 10:45:05 — System Check — Memory: 24.5MB | Uptime: 5s
  [CRON] 10:45:10 — System Check — Memory: 24.6MB | Uptime: 10s
  [CRON] 10:45:15 — System Check — Memory: 24.6MB | Uptime: 15s
```

### View all running jobs:
```
  [job-1] System Check   RUNNING
    Schedule  : */5 * * * * * (Runs every 5 seconds)
    Run count : 6
    Last run  : 02/03/2026, 10:45:30
    Created   : 02/03/2026, 10:45:00
```

### Custom cron expression:
```
Preset 8 → Custom
Enter: */15 * * * * *
→ Runs every 15 seconds
```

## What I Learned
- node-cron for scheduling tasks in Node.js
- Cron expression syntax: second, minute, hour, day, month, weekday
- cron.validate() to check expressions before scheduling
- Managing multiple concurrent scheduled tasks with a Map registry
- Stopping tasks cleanly with scheduledTask.stop()
- Appending logs to a file with fs.appendFileSync

## Challenge Info
**Day:** 25/300
**Sprint:** 1 - Foundations
**Previous Day:** [Day 24 - Basic Plots with Chart.js in Node](../day-024-chartjs-plots)
**Next Day:** Day 26 - Sprint 1 Review and Data Handling begins

---
Part of my 300 Days of Code Challenge!
