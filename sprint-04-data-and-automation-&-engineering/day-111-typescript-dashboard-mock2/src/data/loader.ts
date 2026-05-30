import fs   from 'fs';
import path from 'path';
import { DashboardData, Notification } from '../types';

const MOCK_NOTIFICATIONS: Notification[] = [
    { time: '08:01', level: 'ok',   message: 'Pipeline completed — 48,521 rows processed' },
    { time: '08:02', level: 'warn', message: 'Electronics revenue down 4% vs last month' },
    { time: '08:03', level: 'info', message: 'New record: Lagos ₦892M total revenue' },
    { time: '08:05', level: 'ok',   message: 'Backup to ./data/output/ successful' },
    { time: '08:07', level: 'warn', message: '1,479 invalid rows dropped during validation' },
    { time: '08:10', level: 'info', message: 'Q4 revenue outperformed Q3 by 18%' },
];

function buildMockData(): DashboardData {
    return {
        totalRevenue:  4_872_500_000,
        totalOrders:   48_521,
        validRows:     48_521,
        invalidRows:   1_479,
        categories: [
            { category: 'Electronics', totalRevenue: 2_385_000_000, orderCount: 18420, avgOrderValue: 129_480, topProduct: 'iPhone 15'       },
            { category: 'Furniture',   totalRevenue: 1_045_000_000, orderCount: 7_210, avgOrderValue: 144_938, topProduct: 'Sofa Set'         },
            { category: 'Fashion',     totalRevenue:   631_500_000, orderCount: 11_340, avgOrderValue:  55_689, topProduct: 'George Wrapper'   },
            { category: 'Food',        totalRevenue:   485_400_000, orderCount: 9_820, avgOrderValue:  49_430, topProduct: 'Rice 50kg'        },
            { category: 'Beauty',      totalRevenue:   276_400_000, orderCount: 8_100, avgOrderValue:  34_123, topProduct: 'MAC Makeup Set'   },
            { category: 'Sports',      totalRevenue:    49_200_000, orderCount: 3_631, avgOrderValue:  13_551, topProduct: 'Gym Dumbbell Set' },
        ],
        monthlyTotals: [
            { month: '2024-01', revenue: 380_000_000, orders: 3_800 },
            { month: '2024-02', revenue: 390_000_000, orders: 3_900 },
            { month: '2024-03', revenue: 410_000_000, orders: 4_100 },
            { month: '2024-04', revenue: 395_000_000, orders: 3_950 },
            { month: '2024-05', revenue: 420_000_000, orders: 4_200 },
            { month: '2024-06', revenue: 408_000_000, orders: 4_080 },
            { month: '2024-07', revenue: 415_000_000, orders: 4_150 },
            { month: '2024-08', revenue: 402_000_000, orders: 4_020 },
            { month: '2024-09', revenue: 425_000_000, orders: 4_250 },
            { month: '2024-10', revenue: 440_000_000, orders: 4_400 },
            { month: '2024-11', revenue: 460_000_000, orders: 4_600 },
            { month: '2024-12', revenue: 527_000_000, orders: 5_270 },
        ],
        topCities: [
            { city: 'Lagos',         revenue: 1_854_500_000 },
            { city: 'Abuja',         revenue: 1_010_000_000 },
            { city: 'Kano',          revenue:   617_000_000 },
            { city: 'Port Harcourt', revenue:   475_000_000 },
            { city: 'Ibadan',        revenue:   309_000_000 },
            { city: 'Kaduna',        revenue:   248_000_000 },
            { city: 'Enugu',         revenue:   198_000_000 },
            { city: 'Benin City',    revenue:   160_000_000 },
        ],
        notifications: MOCK_NOTIFICATIONS,
    };
}

export function loadData(): DashboardData {
    const jsonPath = path.resolve(process.env.SUMMARY_JSON || '../day-110-data-pipeline/data/output/summary.json');

    if (!fs.existsSync(jsonPath)) {
        return buildMockData();
    }

    try {
        const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

        // Inject live notifications
        const notifications: Notification[] = [
            {
                time:    new Date().toLocaleTimeString('en-NG', { timeZone: 'Africa/Lagos', hour12: false }).slice(0, 5),
                level:   'ok',
                message: `Pipeline done — ${(raw.validRows as number).toLocaleString()} valid rows`,
            },
            {
                time:    new Date().toLocaleTimeString('en-NG', { timeZone: 'Africa/Lagos', hour12: false }).slice(0, 5),
                level:   'warn',
                message: `${(raw.invalidRows as number).toLocaleString()} invalid rows dropped`,
            },
            ...MOCK_NOTIFICATIONS.slice(2),
        ];

        return {
            totalRevenue:  (raw.categories as { totalRevenue: number }[]).reduce((s, c) => s + c.totalRevenue, 0),
            totalOrders:   raw.validRows as number,
            validRows:     raw.validRows as number,
            invalidRows:   raw.invalidRows as number,
            categories:    raw.categories  as DashboardData['categories'],
            monthlyTotals: raw.monthlyTotals as DashboardData['monthlyTotals'],
            topCities:     raw.topCities as DashboardData['topCities'],
            notifications,
        };
    } catch {
        return buildMockData();
    }
}