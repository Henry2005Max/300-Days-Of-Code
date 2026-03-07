import * as chalk from "chalk";
import * as _ from "lodash";
import * as Papa from "papaparse";
import fetch from "node-fetch";
import * as cron from "node-cron";
import * as fs from "fs";
import * as readline from "readline";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Project {
  day: number;
  name: string;
  tech: string;
  category: string;
  difficulty: string;
}

interface ApiQuote {
  content: string;
  author: string;
}

// ─── Sprint 1 Data ────────────────────────────────────────────────────────────

const SPRINT_CSV = `day,name,tech,category,difficulty
1,TS CLI Calculator,TypeScript,CLI,Easy
2,Password Generator,Node crypto,CLI,Easy
3,File Renamer,fs/promises,CLI,Easy
4,Weather API Fetch,node-fetch,API,Medium
5,Todo List CLI,commander,CLI,Medium
6,Random Quote Fetcher,node-fetch,API,Easy
7,BMI Calculator,TypeScript,CLI,Easy
8,Currency Converter,axios,API,Medium
9,TS Encryption,crypto,CLI,Medium
10,Jest Tests,Jest,Testing,Medium
11,Unit Converter,TypeScript,CLI,Easy
12,Dice Roller,TypeScript,CLI,Easy
13,Markdown Parser,marked,CLI,Medium
14,Email Validator,TypeScript,CLI,Easy
15,QR Generator,qrcode,CLI,Medium
16,Joke API Fetcher,node-fetch,API,Easy
17,Palindrome Checker,TypeScript,CLI,Easy
18,FizzBuzz Generics,TypeScript,CLI,Medium
19,Basic Chatbot,readline,CLI,Medium
20,Recipe Randomizer,node-fetch,API,Easy
21,Lodash Arrays,lodash,Data,Medium
22,node-fetch APIs,node-fetch,API,Medium
23,CSV Parser,papaparse,Data,Medium
24,Basic Plots,chart.js,Data,Hard
25,Cron Scheduler,node-cron,Automation,Medium
26,QR Code Generator,qrcode,CLI,Medium
27,Cron Examples,node-cron,Automation,Hard
28,GitHub Action CLI,GitHub Actions,DevOps,Hard
29,Data Pipeline,papaparse+lodash,Data,Hard
30,Sprint 1 Review,Everything,Review,Hard`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function printDivider(): void {
  console.log(chalk.cyan("  " + "═".repeat(52)));
}

function printHeader(title: string): void {
  printDivider();
  console.log(chalk.bold(chalk.cyan(`  ${title}`)));
  printDivider();
}

// ─── Feature 1: Load & Parse Sprint Data ─────────────────────────────────────

function loadSprintData(): Project[] {
  fs.writeFileSync("sprint-01-projects.csv", SPRINT_CSV);
  const result = Papa.parse(SPRINT_CSV, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  return result.data as Project[];
}

// ─── Feature 2: Sprint Stats with Lodash ─────────────────────────────────────

function showSprintStats(projects: Project[]): void {
  printHeader("  SPRINT 1 STATISTICS");

  console.log(`\n  Total Projects : ${chalk.green(projects.length)}`);

  // By category
  const byCategory = _.groupBy(projects, "category") as Record<string, Project[]>;
  console.log(chalk.yellow("\n  Projects by Category:"));
  _.orderBy(
    Object.entries(byCategory).map(([cat, group]) => ({
      cat,
      count: group.length,
    })),
    ["count"],
    ["desc"]
  ).forEach((c) => {
    const bar = "█".repeat(c.count);
    console.log(`    ${c.cat.padEnd(12)} ${chalk.green(bar)} ${c.count}`);
  });

  // By difficulty
  const byDifficulty = _.groupBy(projects, "difficulty") as Record<string, Project[]>;
  console.log(chalk.yellow("\n  Projects by Difficulty:"));
  ["Easy", "Medium", "Hard"].forEach((level) => {
    const group = byDifficulty[level] ?? [];
    const color =
      level === "Easy"
        ? chalk.green
        : level === "Medium"
        ? chalk.yellow
        : chalk.red;
    console.log(`    ${level.padEnd(8)} : ${color(group.length)} projects`);
  });

  // Most used tech
  const allTech = projects.map((p) => p.tech);
  const techCount = _.countBy(allTech);
  const topTech = _.orderBy(
    Object.entries(techCount).map(([tech, count]) => ({ tech, count })),
    ["count"],
    ["desc"]
  ).slice(0, 3);
  console.log(chalk.yellow("\n  Most Used Technologies:"));
  topTech.forEach((t, i) => {
    console.log(`    ${i + 1}. ${chalk.white(t.tech)} — ${t.count}x`);
  });
}

// ─── Feature 3: Project List ─────────────────────────────────────────────────

function showProjectList(projects: Project[]): void {
  printHeader("  ALL 30 PROJECTS — SPRINT 1");
  console.log();

  const byCategory = _.groupBy(projects, "category") as Record<string, Project[]>;
  Object.entries(byCategory).forEach(([cat, group]) => {
    console.log(chalk.yellow(`  ${cat}:`));
    group.forEach((p) => {
      const diff =
        p.difficulty === "Easy"
          ? chalk.green(p.difficulty)
          : p.difficulty === "Medium"
          ? chalk.yellow(p.difficulty)
          : chalk.red(p.difficulty);
      console.log(
        `    Day ${String(p.day).padStart(2, "0")} — ${chalk.white(p.name.padEnd(22))} [${diff}]`
      );
    });
    console.log();
  });
}

// ─── Feature 4: Fetch Motivational Quote ─────────────────────────────────────

async function fetchMotivationalQuote(): Promise<void> {
  printHeader("  MOTIVATIONAL QUOTE");
  console.log();
  try {
    const res = await fetch("https://api.quotable.io/random?tags=motivational");
    const data = (await res.json()) as ApiQuote;
    console.log(`  "${chalk.white(data.content)}"`);
    console.log(`   ${chalk.yellow("— " + data.author)}`);
  } catch {
    console.log(chalk.yellow(`  "Consistency is the key to mastery. Keep going!"`));
    console.log(chalk.yellow("   — 300 Days of Code"));
  }
  console.log();
}

// ─── Feature 5: Cron Live Progress Ticker ────────────────────────────────────

function startProgressTicker(projects: Project[]): cron.ScheduledTask {
  let tick = 0;
  const sample = _.sampleSize(projects, projects.length);

  printHeader("  LIVE PROGRESS TICKER  (runs every 3s — press Enter to stop)");
  console.log();

  const task = cron.schedule("*/3 * * * * *", () => {
    const p = sample[tick % sample.length];
    const diff =
      p.difficulty === "Easy"
        ? chalk.green(p.difficulty)
        : p.difficulty === "Medium"
        ? chalk.yellow(p.difficulty)
        : chalk.red(p.difficulty);
    console.log(
      `  ${chalk.cyan("[" + new Date().toLocaleTimeString() + "]")} Day ${String(p.day).padStart(2, "0")} — ${chalk.white(p.name)} [${diff}]`
    );
    tick++;
  });

  return task;
}

// ─── Feature 6: Save Sprint Summary JSON ─────────────────────────────────────

function saveSummary(projects: Project[]): void {
  const byCategory = _.groupBy(projects, "category") as Record<string, Project[]>;
  const byDifficulty = _.groupBy(projects, "difficulty") as Record<string, Project[]>;

  const summary = {
    sprint: 1,
    title: "Foundations",
    totalProjects: projects.length,
    completedAt: new Date().toISOString(),
    categories: _.mapValues(byCategory, (g) => g.length),
    difficulties: {
      Easy: (byDifficulty["Easy"] ?? []).length,
      Medium: (byDifficulty["Medium"] ?? []).length,
      Hard: (byDifficulty["Hard"] ?? []).length,
    },
    hardestProjects: _.filter(projects, { difficulty: "Hard" }).map((p) => p.name),
    projects: projects.map((p) => ({
      day: p.day,
      name: p.name,
      tech: p.tech,
      category: p.category,
      difficulty: p.difficulty,
    })),
  };

  fs.writeFileSync("sprint-01-summary.json", JSON.stringify(summary, null, 2));
  console.log(chalk.green("  Summary saved to: sprint-01-summary.json"));
}

// ─── Main Menu ────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(chalk.bold(chalk.cyan("\n  ╔══════════════════════════════════════╗")));
  console.log(chalk.bold(chalk.cyan("  ║     Day 30 — Sprint 1 Review CLI     ║")));
  console.log(chalk.bold(chalk.cyan("  ║       300 Days of Code — Finale      ║")));
  console.log(chalk.bold(chalk.cyan("  ╚══════════════════════════════════════╝\n")));

  const projects = loadSprintData();
  console.log(chalk.green(`  Loaded ${projects.length} projects from sprint-01-projects.csv\n`));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (): void => {
    console.log(chalk.bold(chalk.white("\n  What would you like to do?\n")));
    console.log("  1. View Sprint 1 Statistics");
    console.log("  2. Browse All 30 Projects");
    console.log("  3. Fetch Motivational Quote");
    console.log("  4. Start Live Progress Ticker");
    console.log("  5. Save Sprint Summary to JSON");
    console.log("  6. Exit\n");

    rl.question(chalk.cyan("  Choose an option (1-6): "), async (input) => {
      const choice = input.trim();
      console.log();

      if (choice === "1") {
        showSprintStats(projects);
        ask();
      } else if (choice === "2") {
        showProjectList(projects);
        ask();
      } else if (choice === "3") {
        await fetchMotivationalQuote();
        ask();
      } else if (choice === "4") {
        const task = startProgressTicker(projects);
        rl.once("line", () => {
          task.stop();
          console.log(chalk.yellow("\n  Ticker stopped.\n"));
          ask();
        });
      } else if (choice === "5") {
        saveSummary(projects);
        ask();
      } else if (choice === "6") {
        printDivider();
        console.log(chalk.bold(chalk.green("\n  Sprint 1 Complete! 30 days. 30 projects.")));
        console.log(chalk.bold(chalk.green("  Onwards to Sprint 2 — Web Basics!\n")));
        printDivider();
        rl.close();
        process.exit(0);
      } else {
        console.log(chalk.red("  Invalid option. Choose 1-6."));
        ask();
      }
    });
  };

  ask();
}

main();