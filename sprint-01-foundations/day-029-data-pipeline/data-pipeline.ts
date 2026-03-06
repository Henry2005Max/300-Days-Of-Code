import * as chalk from "chalk";
import * as Papa from "papaparse";
import * as _ from "lodash";
import fetch from "node-fetch";
import * as fs from "fs";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Student {
  name: string;
  score: number;
  subject: string;
  city: string;
}

interface SubjectSummary {
  subject: string;
  count: number;
  average: number;
  highest: number;
  lowest: number;
}

interface JokeResponse {
  setup: string;
  punchline: string;
}

// ─── Sample Data ─────────────────────────────────────────────────────────────

const SAMPLE_CSV = `name,score,subject,city
Chidi Okeke,85,Math,Lagos
Amaka Obi,92,English,Abuja
Emeka Nwosu,78,Math,Lagos
Ngozi Eze,95,Science,Enugu
Tunde Bello,60,English,Lagos
Kemi Adeyemi,88,Science,Abuja
Biodun Okafor,72,Math,Ibadan
Chisom Agu,91,English,Enugu
Femi Adeleke,65,Science,Lagos
Yetunde Osei,83,Math,Abuja
Damilola Okon,77,English,Ibadan
Seun Afolabi,69,Science,Lagos
Ify Okonkwo,94,Math,Enugu
Bola Adewale,58,English,Abuja
Rotimi Coker,81,Science,Lagos`;

// ─── Step 1: Generate CSV ────────────────────────────────────────────────────

function generateCSV(): void {
  fs.writeFileSync("students.csv", SAMPLE_CSV);
  console.log(chalk.green("  [1] CSV file created: students.csv"));
}

// ─── Step 2: Parse CSV ───────────────────────────────────────────────────────

function parseCSV(filePath: string): Student[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const result = Papa.parse(content, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    console.log(chalk.red("  Parse errors:"), result.errors);
  }

  const students = result.data as Student[];
  console.log(
    chalk.green(`  [2] CSV parsed successfully — ${students.length} records loaded`)
  );
  return students;
}

// ─── Step 3: Transform with Lodash ───────────────────────────────────────────

function transformData(students: Student[]): void {
  console.log(chalk.cyan("\n  --- Subject Breakdown ---"));

  const bySubject = _.groupBy(students, "subject") as Record<string, Student[]>;

  const summaries: SubjectSummary[] = Object.entries(bySubject).map(
    ([subject, group]) => {
      const scores = group.map((s) => s.score);
      return {
        subject,
        count: group.length,
        average: _.round(_.mean(scores), 1),
        highest: _.max(scores) ?? 0,
        lowest: _.min(scores) ?? 0,
      };
    }
  );

  summaries.forEach((s) => {
    console.log(chalk.white(`\n  ${chalk.bold(s.subject)}`));
    console.log(`    Students : ${s.count}`);
    console.log(`    Average  : ${chalk.yellow(s.average)}`);
    console.log(`    Highest  : ${chalk.green(s.highest)}`);
    console.log(`    Lowest   : ${chalk.red(s.lowest)}`);
  });

  // Top 5 students
  console.log(chalk.cyan("\n  --- Top 5 Students ---"));
  const top5 = _.orderBy(students, ["score"], ["desc"]).slice(0, 5);
  top5.forEach((s, i) => {
    console.log(
      `  ${i + 1}. ${chalk.white(s.name.padEnd(18))} ${chalk.green(s.score)}  ${s.subject} — ${s.city}`
    );
  });

  // City averages
  console.log(chalk.cyan("\n  --- City Averages ---"));
  const byCity = _.groupBy(students, "city") as Record<string, Student[]>;
  const cityStats = _.orderBy(
    Object.entries(byCity).map(([city, group]) => ({
      city,
      count: group.length,
      avg: _.round(_.mean(group.map((s) => s.score)), 1),
    })),
    ["avg"],
    ["desc"]
  );
  cityStats.forEach((c) => {
    console.log(
      `  ${c.city.padEnd(10)}  ${c.count} students  avg: ${chalk.yellow(c.avg)}`
    );
  });

  // Pass / Fail
  const passed = _.filter(students, (s) => s.score >= 75).length;
  const failed = students.length - passed;
  console.log(chalk.cyan("\n  --- Pass / Fail ---"));
  console.log(`  Passed (>= 75) : ${chalk.green(passed)}`);
  console.log(`  Failed  (< 75) : ${chalk.red(failed)}`);
  console.log(
    `  Pass rate      : ${chalk.yellow(_.round((passed / students.length) * 100, 1))}%`
  );
}

// ─── Step 4: Fetch from API ───────────────────────────────────────────────────

async function fetchJoke(): Promise<void> {
  console.log(chalk.cyan("\n  --- Fetching a Programming Joke ---"));
  try {
    const res = await fetch(
      "https://official-joke-api.appspot.com/jokes/programming/random"
    );
    const data = (await res.json()) as JokeResponse[];
    const joke = data[0];
    console.log(`  ${chalk.white(joke.setup)}`);
    console.log(`  ${chalk.yellow(joke.punchline)}`);
  } catch {
    console.log(chalk.red("  Could not fetch joke — check your connection."));
  }
}

// ─── Step 5: Save Summary JSON ────────────────────────────────────────────────

function saveSummary(students: Student[]): void {
  const bySubject = _.groupBy(students, "subject") as Record<string, Student[]>;
  const summary = {
    totalStudents: students.length,
    generatedAt: new Date().toISOString(),
    subjectSummaries: Object.entries(bySubject).map(([subject, group]) => {
      const scores = group.map((s) => s.score);
      return {
        subject,
        count: group.length,
        average: _.round(_.mean(scores), 1),
        highest: _.max(scores),
        lowest: _.min(scores),
      };
    }),
    topStudent: _.maxBy(students, "score"),
    passRate:
      _.round(
        (_.filter(students, (s) => s.score >= 75).length / students.length) * 100,
        1
      ) + "%",
  };

  fs.writeFileSync("pipeline-summary.json", JSON.stringify(summary, null, 2));
  console.log(chalk.green("\n  [5] Summary saved to: pipeline-summary.json"));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(chalk.bold.cyan("\n================================"));
  console.log(chalk.bold.cyan("   Day 29 — Data Pipeline CLI"));
  console.log(chalk.bold.cyan("================================\n"));

  console.log(chalk.bold.white("Phase 1: Building the pipeline...\n"));
  generateCSV();
  const students = parseCSV("students.csv");

  console.log(chalk.bold.white("\nPhase 2: Analyzing data...\n"));
  transformData(students);

  console.log(chalk.bold.white("\nPhase 3: Fetching from API...\n"));
  await fetchJoke();

  console.log(chalk.bold.white("\nPhase 4: Saving output...\n"));
  saveSummary(students);

  console.log(chalk.bold.green("\n================================"));
  console.log(chalk.bold.green("   Pipeline complete!"));
  console.log(chalk.bold.green("================================\n"));
}

main();