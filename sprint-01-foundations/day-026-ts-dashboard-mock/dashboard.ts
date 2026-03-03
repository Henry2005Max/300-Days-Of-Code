#!/usr/bin/env node

// TypeScript Dashboard Mock
// Day 26 of 300 Days of Code Challenge

import * as readline from 'readline';
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

interface SalesData {
  month: string;
  revenue: number;
  orders: number;
  customers: number;
  region: string;
}

interface ProductData {
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  rating: number;
  stock: number;
}

interface UserData {
  id: number;
  name: string;
  city: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  active: boolean;
}

interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  revenueGrowth: number;
  activeUsers: number;
}

// ─── Mock Data ────────────────────────────────────────────

const salesData: SalesData[] = [
  { month: 'Jan', revenue: 5400000,  orders: 120, customers: 98,  region: 'South West' },
  { month: 'Feb', revenue: 3800000,  orders: 89,  customers: 74,  region: 'South West' },
  { month: 'Mar', revenue: 9200000,  orders: 210, customers: 180, region: 'South West' },
  { month: 'Apr', revenue: 7600000,  orders: 175, customers: 150, region: 'North Central' },
  { month: 'May', revenue: 11400000, orders: 260, customers: 220, region: 'South West' },
  { month: 'Jun', revenue: 8900000,  orders: 198, customers: 170, region: 'South East' },
  { month: 'Jul', revenue: 13200000, orders: 310, customers: 265, region: 'South West' },
  { month: 'Aug', revenue: 10500000, orders: 245, customers: 210, region: 'North West' },
  { month: 'Sep', revenue: 14800000, orders: 340, customers: 290, region: 'South West' },
  { month: 'Oct', revenue: 12100000, orders: 280, customers: 240, region: 'South East' },
  { month: 'Nov', revenue: 18600000, orders: 430, customers: 370, region: 'South West' },
  { month: 'Dec', revenue: 22400000, orders: 520, customers: 445, region: 'South West' },
];

const productData: ProductData[] = [
  { name: 'Laptop Pro',     category: 'Electronics', unitsSold: 145, revenue: 65250000, rating: 4.5, stock: 32 },
  { name: 'Smartphone X',  category: 'Electronics', unitsSold: 320, revenue: 57600000, rating: 4.3, stock: 78 },
  { name: 'Wireless Buds', category: 'Electronics', unitsSold: 510, revenue: 12750000, rating: 4.1, stock: 145 },
  { name: 'Rice 50kg',     category: 'Food',        unitsSold: 890, revenue: 40050000, rating: 4.8, stock: 220 },
  { name: 'Cooking Oil',   category: 'Food',        unitsSold: 640, revenue: 5440000,  rating: 4.3, stock: 310 },
  { name: 'Sneakers Pro',  category: 'Clothing',    unitsSold: 230, revenue: 8050000,  rating: 4.6, stock: 55 },
  { name: 'Classic Tee',   category: 'Clothing',    unitsSold: 780, revenue: 3900000,  rating: 3.9, stock: 420 },
  { name: 'Blender 2000',  category: 'Appliances',  unitsSold: 175, revenue: 3850000,  rating: 4.1, stock: 40 },
  { name: 'Stand Fan',     category: 'Appliances',  unitsSold: 260, revenue: 4680000,  rating: 3.8, stock: 88 },
  { name: 'Tablet Mini',   category: 'Electronics', unitsSold: 195, revenue: 23400000, rating: 4.4, stock: 62 },
];

const userData: UserData[] = [
  { id: 1,  name: 'Henry Adewale',   city: 'Lagos',          plan: 'Pro',        joinDate: '2024-01-15', totalOrders: 24, totalSpent: 2400000, active: true },
  { id: 2,  name: 'Amaka Obi',       city: 'Abuja',          plan: 'Enterprise', joinDate: '2024-02-08', totalOrders: 56, totalSpent: 8900000, active: true },
  { id: 3,  name: 'Emeka Eze',       city: 'Lagos',          plan: 'Free',       joinDate: '2024-03-22', totalOrders: 8,  totalSpent: 320000,  active: true },
  { id: 4,  name: 'Fatima Musa',     city: 'Kano',           plan: 'Pro',        joinDate: '2024-01-30', totalOrders: 31, totalSpent: 4100000, active: false },
  { id: 5,  name: 'Chidi Nwosu',     city: 'Abuja',          plan: 'Free',       joinDate: '2024-04-10', totalOrders: 5,  totalSpent: 180000,  active: true },
  { id: 6,  name: 'Ngozi Okafor',    city: 'Lagos',          plan: 'Enterprise', joinDate: '2023-11-05', totalOrders: 88, totalSpent: 15600000,active: true },
  { id: 7,  name: 'Uche Duru',       city: 'Port Harcourt',  plan: 'Pro',        joinDate: '2024-05-18', totalOrders: 19, totalSpent: 1900000, active: true },
  { id: 8,  name: 'Bola Afolabi',    city: 'Lagos',          plan: 'Free',       joinDate: '2024-06-01', totalOrders: 3,  totalSpent: 95000,   active: false },
  { id: 9,  name: 'Kemi Adeyemi',    city: 'Ibadan',         plan: 'Pro',        joinDate: '2024-02-14', totalOrders: 42, totalSpent: 5600000, active: true },
  { id: 10, name: 'Tunde Bakare',    city: 'Lagos',          plan: 'Enterprise', joinDate: '2023-12-20', totalOrders: 120, totalSpent: 24000000,active: true },
];

// ─── Metric Calculations ──────────────────────────────────

function calcMetrics(): DashboardMetrics {
  const totalRevenue = salesData.reduce((sum, s) => sum + s.revenue, 0);
  const totalOrders = salesData.reduce((sum, s) => sum + s.orders, 0);
  const totalCustomers = salesData.reduce((sum, s) => sum + s.customers, 0);
  const avgOrderValue = totalRevenue / totalOrders;

  const lastMonth = salesData[salesData.length - 1].revenue;
  const prevMonth = salesData[salesData.length - 2].revenue;
  const revenueGrowth = ((lastMonth - prevMonth) / prevMonth) * 100;

  const activeUsers = userData.filter(u => u.active).length;

  return { totalRevenue, totalOrders, totalCustomers, avgOrderValue, revenueGrowth, activeUsers };
}

// ─── Bar Chart in Terminal ────────────────────────────────

function terminalBarChart(
  title: string,
  data: { label: string; value: number }[],
  maxBarWidth: number = 35
): void {
  const maxVal = Math.max(...data.map(d => d.value));
  console.log(chalk.bold.cyan(`\n  ${title}\n`));
  data.forEach(({ label, value }) => {
    const barLen = Math.round((value / maxVal) * maxBarWidth);
    const bar = '█'.repeat(barLen);
    const formatted = value >= 1000000
      ? `₦${(value / 1000000).toFixed(1)}M`
      : value.toLocaleString();
    console.log(
      chalk.white(`  ${label.padEnd(6)} `) +
      chalk.green(bar.padEnd(maxBarWidth + 1)) +
      chalk.yellow(formatted)
    );
  });
  console.log('');
}

// ─── Dashboard Sections ───────────────────────────────────

function showOverview(): void {
  const m = calcMetrics();

  console.log(chalk.bold.white('\n  ╔' + '═'.repeat(51) + '╗'));
  console.log(chalk.bold.white('  ║') + chalk.bold.cyan('         NAIJA STORE — DASHBOARD OVERVIEW        ') + chalk.bold.white('║'));
  console.log(chalk.bold.white('  ╚' + '═'.repeat(51) + '╝\n'));

  // KPI Cards
  const growth = m.revenueGrowth >= 0
    ? chalk.green(`▲ ${m.revenueGrowth.toFixed(1)}%`)
    : chalk.red(`▼ ${Math.abs(m.revenueGrowth).toFixed(1)}%`);

  console.log(chalk.bold.yellow('  KEY METRICS\n'));
  console.log(
    chalk.cyan('  Total Revenue   : ') + chalk.white(`₦${(m.totalRevenue / 1000000).toFixed(1)}M`) +
    chalk.gray('   (Dec vs Nov: ') + growth + chalk.gray(')')
  );
  console.log(chalk.cyan('  Total Orders    : ') + chalk.white(m.totalOrders.toLocaleString()));
  console.log(chalk.cyan('  Total Customers : ') + chalk.white(m.totalCustomers.toLocaleString()));
  console.log(chalk.cyan('  Avg Order Value : ') + chalk.white(`₦${Math.round(m.avgOrderValue).toLocaleString()}`));
  console.log(chalk.cyan('  Active Users    : ') + chalk.white(`${m.activeUsers} / ${userData.length}`));

  // Revenue bar chart
  terminalBarChart(
    'Monthly Revenue (Jan — Dec)',
    salesData.map(s => ({ label: s.month, value: s.revenue }))
  );
}

function showSalesReport(): void {
  console.log(chalk.bold.cyan('\n  MONTHLY SALES REPORT\n'));
  console.log(
    chalk.bold.white('  Month   Revenue          Orders   Customers')
  );
  console.log(chalk.gray('  ' + '─'.repeat(50)));

  salesData.forEach(s => {
    const rev = `₦${(s.revenue / 1000000).toFixed(1)}M`;
    console.log(
      chalk.white(`  ${s.month.padEnd(7)} `) +
      chalk.yellow(rev.padEnd(17)) +
      chalk.white(String(s.orders).padEnd(9)) +
      chalk.white(String(s.customers))
    );
  });

  const totRevenue = salesData.reduce((a, b) => a + b.revenue, 0);
  const totOrders = salesData.reduce((a, b) => a + b.orders, 0);
  const totCustomers = salesData.reduce((a, b) => a + b.customers, 0);

  console.log(chalk.gray('  ' + '─'.repeat(50)));
  console.log(
    chalk.bold.white(`  TOTAL   `) +
    chalk.bold.yellow(`₦${(totRevenue / 1000000).toFixed(1)}M`.padEnd(17)) +
    chalk.bold.white(String(totOrders).padEnd(9)) +
    chalk.bold.white(String(totCustomers))
  );
  console.log('');
}

function showTopProducts(): void {
  const sorted = [...productData].sort((a, b) => b.revenue - a.revenue);

  console.log(chalk.bold.cyan('\n  TOP PRODUCTS BY REVENUE\n'));
  console.log(
    chalk.bold.white('  #   Product          Category      Units    Revenue       Rating  Stock')
  );
  console.log(chalk.gray('  ' + '─'.repeat(72)));

  sorted.forEach((p, i) => {
    const lowStock = p.stock < 50 ? chalk.red(String(p.stock)) : chalk.white(String(p.stock));
    const rev = `₦${(p.revenue / 1000000).toFixed(1)}M`;
    console.log(
      chalk.yellow(`  ${String(i + 1).padEnd(4)}`) +
      chalk.white(p.name.padEnd(17)) +
      chalk.gray(p.category.padEnd(14)) +
      chalk.white(String(p.unitsSold).padEnd(9)) +
      chalk.green(rev.padEnd(14)) +
      chalk.yellow(`⭐${p.rating}`.padEnd(8)) +
      lowStock
    );
  });
  console.log(chalk.gray('\n  Red stock numbers = below 50 units\n'));

  // Category breakdown chart
  const categories: Record<string, number> = {};
  productData.forEach(p => {
    categories[p.category] = (categories[p.category] || 0) + p.revenue;
  });

  terminalBarChart(
    'Revenue by Category',
    Object.entries(categories).map(([label, value]) => ({ label, value }))
  );
}

function showUserReport(): void {
  console.log(chalk.bold.cyan('\n  USER REPORT\n'));

  // Plan breakdown
  const plans: Record<string, number> = { Free: 0, Pro: 0, Enterprise: 0 };
  userData.forEach(u => plans[u.plan]++);

  console.log(chalk.bold.yellow('  Plan Breakdown:\n'));
  console.log(chalk.white(`  Free       : ${plans['Free']} users`));
  console.log(chalk.white(`  Pro        : ${plans['Pro']} users`));
  console.log(chalk.white(`  Enterprise : ${plans['Enterprise']} users\n`));

  // Top spenders
  const topSpenders = [...userData].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
  console.log(chalk.bold.yellow('  Top 5 Spenders:\n'));
  console.log(chalk.bold.white('  Name                  City            Plan         Orders   Spent'));
  console.log(chalk.gray('  ' + '─'.repeat(68)));
  topSpenders.forEach(u => {
    const planColor = u.plan === 'Enterprise' ? chalk.magenta : u.plan === 'Pro' ? chalk.cyan : chalk.gray;
    const status = u.active ? chalk.green('●') : chalk.red('●');
    console.log(
      status + ' ' +
      chalk.white(u.name.padEnd(22)) +
      chalk.gray(u.city.padEnd(16)) +
      planColor(u.plan.padEnd(13)) +
      chalk.white(String(u.totalOrders).padEnd(9)) +
      chalk.yellow(`₦${(u.totalSpent / 1000000).toFixed(1)}M`)
    );
  });

  // City breakdown
  const cities: Record<string, number> = {};
  userData.forEach(u => cities[u.city] = (cities[u.city] || 0) + 1);

  console.log(chalk.bold.yellow('\n  Users by City:\n'));
  Object.entries(cities).sort((a, b) => b[1] - a[1]).forEach(([city, count]) => {
    const bar = '█'.repeat(count * 3);
    console.log(chalk.white(`  ${city.padEnd(16)} `) + chalk.blue(bar) + chalk.gray(` ${count}`));
  });
  console.log('');
}

function showLowStock(): void {
  const lowStock = productData.filter(p => p.stock < 100).sort((a, b) => a.stock - b.stock);

  console.log(chalk.bold.red('\n  LOW STOCK ALERT\n'));
  console.log(chalk.bold.white('  Product          Category      Stock   Revenue'));
  console.log(chalk.gray('  ' + '─'.repeat(52)));

  lowStock.forEach(p => {
    const stockColor = p.stock < 50 ? chalk.red : chalk.yellow;
    console.log(
      chalk.white(p.name.padEnd(17)) +
      chalk.gray(p.category.padEnd(14)) +
      stockColor(String(p.stock).padEnd(8)) +
      chalk.green(`₦${(p.revenue / 1000000).toFixed(1)}M`)
    );
  });
  console.log(chalk.gray('\n  Restock these items soon!\n'));
}

// ─── Main Application ─────────────────────────────────────

async function runDashboard(): Promise<void> {
  console.clear();
  console.log(chalk.bold.green('═'.repeat(55)));
  console.log(chalk.bold.green('        TS DASHBOARD MOCK — DAY 26'));
  console.log(chalk.bold.green('═'.repeat(55)));
  console.log(chalk.white('\n   A full terminal business dashboard in TypeScript!\n'));
  console.log(chalk.bold.green('═'.repeat(55)));

  let continueRunning = true;

  while (continueRunning) {
    console.log(chalk.bold.cyan('\n  MENU\n'));
    console.log(chalk.white('   1. Overview          — KPIs + revenue chart'));
    console.log(chalk.white('   2. Sales Report      — Monthly breakdown table'));
    console.log(chalk.white('   3. Top Products      — Revenue by product + category'));
    console.log(chalk.white('   4. User Report       — Plans, top spenders, city breakdown'));
    console.log(chalk.white('   5. Low Stock Alert   — Items needing restock'));
    console.log(chalk.white('   6. Full Dashboard    — All sections at once'));
    console.log(chalk.white('   7. Exit\n'));

    const choice = await askQuestion(chalk.cyan('  Choose an option (1-7): '));

    if (choice === '7') {
      console.log(chalk.green('\n  Dashboard mastered! Day 26 done! 👋\n'));
      break;
    }

    try {
      switch (choice) {
        case '1': showOverview(); break;
        case '2': showSalesReport(); break;
        case '3': showTopProducts(); break;
        case '4': showUserReport(); break;
        case '5': showLowStock(); break;
        case '6':
          showOverview();
          showSalesReport();
          showTopProducts();
          showUserReport();
          showLowStock();
          break;
        default:
          console.log(chalk.red('\n  Invalid option! Please choose 1-7.\n'));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red(`\n  Error: ${error.message}\n`));
      }
    }

    const again = await askQuestion(chalk.cyan('  View more? (yes/no): '));
    if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
      console.log(chalk.green('\n  Dashboard mastered! Day 26 done! 👋\n'));
      continueRunning = false;
    }
  }

  rl.close();
}

runDashboard();