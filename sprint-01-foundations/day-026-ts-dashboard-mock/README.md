# Day 26: TypeScript Dashboard Mock

## Description

A fully terminal-based business dashboard built in TypeScript with no external data libraries. Uses three rich mock datasets — 12 months of sales data, 10 products and 10 Nigerian users — to render KPI cards, formatted tables, terminal bar charts and alerts all from the command line. Inspired by real e-commerce dashboards but entirely in the terminal.

## Features

- **Overview** - KPI cards showing total revenue, orders, customers, avg order value, growth percentage and active users with a monthly revenue bar chart
- **Sales Report** - Full 12-month table with revenue, orders and customers per month plus yearly totals
- **Top Products** - Products ranked by revenue with units sold, rating, stock level and a category breakdown bar chart
- **User Report** - Plan breakdown (Free/Pro/Enterprise), top 5 spenders table, users by city bar chart with active/inactive indicators
- **Low Stock Alert** - Products below 100 units sorted by urgency with red highlighting under 50
- **Full Dashboard** - All five sections rendered back to back
- **Terminal Bar Charts** - ASCII bar charts built from scratch using block characters

## Technologies Used

- TypeScript
- Node.js
- Chalk (terminal colors)
- readline (built-in Node.js module)

## Installation

```bash
npm install
```

## How to Run

```bash
npx ts-node dashboard.ts
```

## Example Output

### Overview KPIs:

```
  Total Revenue   : ₦137.9M   (Dec vs Nov: ▲ 20.4%)
  Total Orders    : 3,177
  Total Customers : 2,712
  Avg Order Value : ₦43,405
  Active Users    : 8 / 10
```

### Terminal Bar Chart:

```
  Jan   █████                          ₦5.4M
  Feb   ███                            ₦3.8M
  Mar   ████████                       ₦9.2M
  Dec   ███████████████████████████    ₦22.4M
```

### Low Stock Alert:

```
  Blender 2000   Appliances    40      ₦3.9M
  Sneakers Pro   Clothing      55      ₦8.1M
```

## What I Learned

- Designing a multi-section terminal dashboard with structured TypeScript data
- Building ASCII bar charts with padEnd and block characters
- Calculating business KPIs (growth %, avg order value) from raw data
- Using TypeScript union types for plan tiers (Free | Pro | Enterprise)
- Sorting, filtering and aggregating multiple datasets for display

## Challenge Info

**Day:** 26/300
**Sprint:** 1 - Foundations
**Previous Day:** [Day 25 - Cron Job Scheduler with node-cron](../day-025-cron-scheduler)
**Next Day:** Day 27 - Cron Examples

-----

Part of my 300 Days of Code Challenge
