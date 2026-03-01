# Day 24: Basic Plots with Chart.js in Node

## Description

A TypeScript CLI tool that generates PNG chart images directly from Node.js using Chart.js and chartjs-node-canvas. No browser needed, charts are rendered server-side and saved as PNG files. Covers five chart types with Nigerian-themed data including monthly sales by region, website traffic, product category breakdown, users by city and a study hours vs grade scatter plot.

## Features

- **Bar Chart** - Monthly sales comparison between Lagos and Abuja regions
- **Line Chart** - Website visitors and conversions over 8 months with area fill
- **Pie Chart** - Product category sales breakdown by percentage
- **Doughnut Chart** - User distribution across Nigerian cities
- **Scatter Plot** - Study hours vs grade for Math and Science students
- **Generate All** - Creates all 5 charts in one go
- **PNG Output** - Each chart saved as a high-quality PNG file (800x500px)

## Technologies Used

- TypeScript
- Node.js
- Chart.js 4.x
- chartjs-node-canvas (server-side Chart.js rendering)
- Chalk (terminal colors)
- readline (built-in Node.js module)

## Installation

```bash
npm install
```

> Note: chartjs-node-canvas requires canvas which may need system dependencies.
> On Ubuntu/Debian: `sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`
> On Mac: `brew install pkg-config cairo pango libpng jpeg giflib librsvg`

## How to Run

```bash
npx ts-node chart-plots.ts
```

## Output Files

|File              |Chart Type|Data                         |
|------------------|----------|-----------------------------|
|bar-chart.png     |Bar       |Monthly sales Lagos vs Abuja |
|line-chart.png    |Line      |Website traffic & conversions|
|pie-chart.png     |Pie       |Sales by product category    |
|doughnut-chart.png|Doughnut  |Users by Nigerian city       |
|scatter-chart.png |Scatter   |Study hours vs grade         |

## Example Usage

```
Choose option: 6 (Generate ALL)

Generating all 5 charts...
All charts saved!

bar-chart.png
line-chart.png
pie-chart.png
doughnut-chart.png
scatter-chart.png
```

## What I Learned

- chartjs-node-canvas for server-side Chart.js rendering without a browser
- Chart.js configuration object structure (type, data, options)
- Different chart types and when to use each one
- renderToBuffer() to get PNG bytes and write to disk with fs.writeFileSync
- Customising titles, legends, axis labels and colors in Chart.js

## Challenge Info

**Day:** 24/300
**Sprint:** 1 - Foundations
**Previous Day:** [Day 23 - Simple CSV Parser with PapaParse](../day-023-csv-parser)
**Next Day:** Day 25 - Cron Job Scheduler with node-cron

-----

Part of my 300 Days of Code Challenge
