// Basic Plots with Chart.js in Node
// Day 24 of 300 Days of Code Challenge

import * as readline from 'readline';
import * as fs from 'fs';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
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

// ─── Types ────────────────────────────────────────────────

interface ChartConfig {
  title: string;
  filename: string;
  width?: number;
  height?: number;
}

// ─── Canvas Setup ─────────────────────────────────────────

function getCanvas(width: number = 800, height: number = 500) {
  return new ChartJSNodeCanvas({ width, height, backgroundColour: 'white' });
}

// ─── Chart Functions ──────────────────────────────────────

async function generateBarChart(config: ChartConfig): Promise<void> {
  const canvas = getCanvas(config.width, config.height);

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Lagos Sales (₦ millions)',
        data: [5.4, 3.6, 9.0, 6.75, 4.8, 7.2],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
      },
      {
        label: 'Abuja Sales (₦ millions)',
        data: [3.1, 4.2, 5.5, 3.8, 6.1, 4.9],
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
      },
    ],
  };

  const configuration: any = {
    type: 'bar',
    data,
    options: {
      plugins: {
        title: {
          display: true,
          text: config.title,
          font: { size: 18, weight: 'bold' },
        },
        legend: { position: 'top' },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: '₦ Millions' },
        },
        x: {
          title: { display: true, text: 'Month' },
        },
      },
    },
  };

  const buffer = await canvas.renderToBuffer(configuration);
  fs.writeFileSync(config.filename, buffer);
}

async function generateLineChart(config: ChartConfig): Promise<void> {
  const canvas = getCanvas(config.width, config.height);

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'Website Visitors',
        data: [1200, 1900, 1500, 2400, 2200, 3100, 2800, 3500],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Conversions',
        data: [120, 200, 160, 280, 240, 370, 310, 420],
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const configuration: any = {
    type: 'line',
    data,
    options: {
      plugins: {
        title: {
          display: true,
          text: config.title,
          font: { size: 18, weight: 'bold' },
        },
        legend: { position: 'top' },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Count' },
        },
        x: {
          title: { display: true, text: 'Month' },
        },
      },
    },
  };

  const buffer = await canvas.renderToBuffer(configuration);
  fs.writeFileSync(config.filename, buffer);
}

async function generatePieChart(config: ChartConfig): Promise<void> {
  const canvas = getCanvas(config.width, config.height);

  const data = {
    labels: ['Electronics', 'Food', 'Clothing', 'Appliances', 'Other'],
    datasets: [
      {
        data: [42, 25, 18, 10, 5],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const configuration: any = {
    type: 'pie',
    data,
    options: {
      plugins: {
        title: {
          display: true,
          text: config.title,
          font: { size: 18, weight: 'bold' },
        },
        legend: { position: 'right' },
      },
    },
  };

  const buffer = await canvas.renderToBuffer(configuration);
  fs.writeFileSync(config.filename, buffer);
}

async function generateDoughnutChart(config: ChartConfig): Promise<void> {
  const canvas = getCanvas(config.width, config.height);

  const data = {
    labels: ['Lagos', 'Abuja', 'Kano', 'Port Harcourt', 'Ibadan'],
    datasets: [
      {
        data: [35, 25, 18, 14, 8],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const configuration: any = {
    type: 'doughnut',
    data,
    options: {
      plugins: {
        title: {
          display: true,
          text: config.title,
          font: { size: 18, weight: 'bold' },
        },
        legend: { position: 'right' },
      },
    },
  };

  const buffer = await canvas.renderToBuffer(configuration);
  fs.writeFileSync(config.filename, buffer);
}

async function generateScatterChart(config: ChartConfig): Promise<void> {
  const canvas = getCanvas(config.width, config.height);

  // Study hours vs grades
  const data = {
    datasets: [
      {
        label: 'Math Students',
        data: [
          { x: 2, y: 55 }, { x: 3, y: 65 }, { x: 4, y: 72 },
          { x: 5, y: 78 }, { x: 6, y: 84 }, { x: 7, y: 88 },
          { x: 8, y: 92 }, { x: 9, y: 95 },
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        pointRadius: 8,
      },
      {
        label: 'Science Students',
        data: [
          { x: 1, y: 50 }, { x: 3, y: 62 }, { x: 4, y: 70 },
          { x: 5, y: 75 }, { x: 6, y: 80 }, { x: 8, y: 90 },
          { x: 9, y: 93 }, { x: 10, y: 97 },
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        pointRadius: 8,
      },
    ],
  };

  const configuration: any = {
    type: 'scatter',
    data,
    options: {
      plugins: {
        title: {
          display: true,
          text: config.title,
          font: { size: 18, weight: 'bold' },
        },
        legend: { position: 'top' },
      },
      scales: {
        x: {
          title: { display: true, text: 'Study Hours Per Day' },
          beginAtZero: true,
        },
        y: {
          title: { display: true, text: 'Grade (%)' },
          beginAtZero: false,
          min: 40,
          max: 100,
        },
      },
    },
  };

  const buffer = await canvas.renderToBuffer(configuration);
  fs.writeFileSync(config.filename, buffer);
}

async function generateAllCharts(): Promise<void> {
  await generateBarChart({ title: 'Monthly Sales by Region', filename: 'bar-chart.png' });
  await generateLineChart({ title: 'Website Traffic & Conversions', filename: 'line-chart.png' });
  await generatePieChart({ title: 'Sales by Product Category (%)', filename: 'pie-chart.png' });
  await generateDoughnutChart({ title: 'Users by Nigerian City (%)', filename: 'doughnut-chart.png' });
  await generateScatterChart({ title: 'Study Hours vs Grade', filename: 'scatter-chart.png' });
}

// ─── Main Application ─────────────────────────────────────

async function runChartPlots(): Promise<void> {
  console.clear();
  console.log(chalk.bold.cyan('═'.repeat(55)));
  console.log(chalk.bold.cyan('       BASIC PLOTS WITH CHART.JS IN NODE'));
  console.log(chalk.bold.cyan('═'.repeat(55)));
  console.log(chalk.white('\n   Generate PNG charts from Node.js with Chart.js!\n'));
  console.log(chalk.bold.cyan('═'.repeat(55)));

  let continueRunning = true;

  while (continueRunning) {
    console.log(chalk.bold.cyan('\n  MENU\n'));
    console.log(chalk.white('   1. Bar chart    — Monthly sales by region'));
    console.log(chalk.white('   2. Line chart   — Website traffic & conversions'));
    console.log(chalk.white('   3. Pie chart    — Sales by product category'));
    console.log(chalk.white('   4. Doughnut     — Users by Nigerian city'));
    console.log(chalk.white('   5. Scatter plot — Study hours vs grade'));
    console.log(chalk.white('   6. Generate ALL charts'));
    console.log(chalk.white('   7. Exit\n'));

    const choice = await askQuestion(chalk.cyan('  Choose an option (1-7): '));

    if (choice === '7') {
      console.log(chalk.cyan('\n  Charts mastered! Day 24 done! 👋\n'));
      break;
    }

    try {
      switch (choice) {

        case '1': {
          console.log(chalk.cyan('\n  Generating bar chart...'));
          await generateBarChart({ title: 'Monthly Sales by Region', filename: 'bar-chart.png' });
          console.log(chalk.green('  Saved: bar-chart.png\n'));
          break;
        }

        case '2': {
          console.log(chalk.cyan('\n  Generating line chart...'));
          await generateLineChart({ title: 'Website Traffic & Conversions', filename: 'line-chart.png' });
          console.log(chalk.green('  Saved: line-chart.png\n'));
          break;
        }

        case '3': {
          console.log(chalk.cyan('\n  Generating pie chart...'));
          await generatePieChart({ title: 'Sales by Product Category (%)', filename: 'pie-chart.png' });
          console.log(chalk.green('  Saved: pie-chart.png\n'));
          break;
        }

        case '4': {
          console.log(chalk.cyan('\n  Generating doughnut chart...'));
          await generateDoughnutChart({ title: 'Users by Nigerian City (%)', filename: 'doughnut-chart.png' });
          console.log(chalk.green('  Saved: doughnut-chart.png\n'));
          break;
        }

        case '5': {
          console.log(chalk.cyan('\n  Generating scatter plot...'));
          await generateScatterChart({ title: 'Study Hours vs Grade', filename: 'scatter-chart.png' });
          console.log(chalk.green('  Saved: scatter-chart.png\n'));
          break;
        }

        case '6': {
          console.log(chalk.cyan('\n  Generating all 5 charts...'));
          await generateAllCharts();
          console.log(chalk.green('  All charts saved!\n'));
          console.log(chalk.white('  bar-chart.png'));
          console.log(chalk.white('  line-chart.png'));
          console.log(chalk.white('  pie-chart.png'));
          console.log(chalk.white('  doughnut-chart.png'));
          console.log(chalk.white('  scatter-chart.png\n'));
          break;
        }

        default:
          console.log(chalk.red('\n  Invalid option! Please choose 1-7.\n'));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red(`\n  Error: ${error.message}\n`));
      }
    }

    const again = await askQuestion(chalk.cyan('  Generate more charts? (yes/no): '));
    if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
      console.log(chalk.cyan('\n  Charts mastered! Day 24 done! 👋\n'));
      continueRunning = false;
    }
  }

  rl.close();
}

runChartPlots();
