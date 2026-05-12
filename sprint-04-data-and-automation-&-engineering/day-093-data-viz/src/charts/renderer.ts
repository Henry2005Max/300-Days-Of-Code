import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';
import fs from 'fs';
import path from 'path';

const WIDTH  = parseInt(process.env.CHART_WIDTH  || '900', 10);
const HEIGHT = parseInt(process.env.CHART_HEIGHT || '500', 10);

const canvas = new ChartJSNodeCanvas({ width: WIDTH, height: HEIGHT, backgroundColour: '#ffffff' });

const PALETTE = [
    '#2D6A4F', '#40916C', '#52B788', '#74C69D',
    '#95D5B2', '#B7E4C7', '#D8F3DC', '#1B4332',
];

const NAIRA = (n: number) =>
    `NGN ${(n / 1000).toFixed(0)}k`;

async function save(buffer: Buffer, filename: string, outputDir: string): Promise<string> {
    const dir = path.resolve(outputDir);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, buffer);
    return filePath;
}

// Bar chart — category revenue
export async function renderCategoryBar(
    labels: string[],
    values: number[],
    outputDir: string
): Promise<string> {
    const config: ChartConfiguration = {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Revenue (NGN)',
                data: values,
                backgroundColor: PALETTE,
                borderColor: PALETTE.map((c) => c + 'cc'),
                borderWidth: 1,
                borderRadius: 6,
            }],
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Revenue by Category',
                    font: { size: 18, weight: 'bold' },
                    padding: { bottom: 20 },
                },
                legend: { display: false },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (v) => NAIRA(Number(v)),
                    },
                    grid: { color: '#e5e7eb' },
                },
                x: { grid: { display: false } },
            },
        },
    };

    const buffer = await canvas.renderToBuffer(config);
    return save(buffer, 'chart-01-category-revenue.png', outputDir);
}

// Line chart — monthly revenue trend
export async function renderMonthlyLine(
    labels: string[],
    revenues: number[],
    orderCounts: number[],
    outputDir: string
): Promise<string> {
    const config: ChartConfiguration = {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Revenue (NGN)',
                    data: revenues,
                    borderColor: '#2D6A4F',
                    backgroundColor: '#2D6A4F22',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#2D6A4F',
                    pointRadius: 5,
                    yAxisID: 'y',
                },
                {
                    label: 'Order Count',
                    data: orderCounts,
                    borderColor: '#52B788',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [6, 3],
                    tension: 0.4,
                    pointBackgroundColor: '#52B788',
                    pointRadius: 5,
                    yAxisID: 'y1',
                },
            ],
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Revenue Trend',
                    font: { size: 18, weight: 'bold' },
                    padding: { bottom: 20 },
                },
                legend: { display: true },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    ticks: { callback: (v) => NAIRA(Number(v)) },
                    grid: { color: '#e5e7eb' },
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    grid: { display: false },
                },
                x: { grid: { display: false } },
            },
        },
    };

    const buffer = await canvas.renderToBuffer(config);
    return save(buffer, 'chart-02-monthly-trend.png', outputDir);
}

// Pie chart — category revenue share
export async function renderCategoryPie(
    labels: string[],
    values: number[],
    outputDir: string
): Promise<string> {
    const config: ChartConfiguration = {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: PALETTE,
                borderColor: '#ffffff',
                borderWidth: 2,
            }],
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Revenue Share by Category',
                    font: { size: 18, weight: 'bold' },
                    padding: { bottom: 20 },
                },
                legend: {
                    display: true,
                    position: 'right',
                },
            },
        },
    };

    const buffer = await canvas.renderToBuffer(config);
    return save(buffer, 'chart-03-category-pie.png', outputDir);
}

// Horizontal bar — top products
export async function renderTopProductsBar(
    labels: string[],
    values: number[],
    outputDir: string
): Promise<string> {
    const config: ChartConfiguration = {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Revenue (NGN)',
                data: values,
                backgroundColor: '#40916C',
                borderColor: '#2D6A4F',
                borderWidth: 1,
                borderRadius: 4,
            }],
        },
        options: {
            indexAxis: 'y',
            plugins: {
                title: {
                    display: true,
                    text: 'Top 8 Products by Revenue',
                    font: { size: 18, weight: 'bold' },
                    padding: { bottom: 20 },
                },
                legend: { display: false },
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { callback: (v) => NAIRA(Number(v)) },
                    grid: { color: '#e5e7eb' },
                },
                y: { grid: { display: false } },
            },
        },
    };

    const buffer = await canvas.renderToBuffer(config);
    return save(buffer, 'chart-04-top-products.png', outputDir);
}

// Bar chart — revenue by city
export async function renderCityBar(
    labels: string[],
    values: number[],
    outputDir: string
): Promise<string> {
    const config: ChartConfiguration = {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Revenue (NGN)',
                data: values,
                backgroundColor: PALETTE.slice(0, labels.length),
                borderWidth: 1,
                borderRadius: 6,
            }],
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Top Cities by Revenue',
                    font: { size: 18, weight: 'bold' },
                    padding: { bottom: 20 },
                },
                legend: { display: false },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: (v) => NAIRA(Number(v)) },
                    grid: { color: '#e5e7eb' },
                },
                x: { grid: { display: false } },
            },
        },
    };

    const buffer = await canvas.renderToBuffer(config);
    return save(buffer, 'chart-05-city-revenue.png', outputDir);
}