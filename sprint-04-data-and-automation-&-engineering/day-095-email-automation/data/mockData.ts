import { SalesReport, StockAlert, WelcomeData } from '../types';

export function getMockSalesReport(): SalesReport {
    return {
        date: new Date().toLocaleDateString('en-NG', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            timeZone: 'Africa/Lagos',
        }),
        totalRevenue: 4_872_500,
        totalOrders:  50,
        topProducts: [
            { product: 'iPhone 15',         category: 'Electronics', quantity: 1,  revenue: 950000, city: 'Lagos' },
            { product: 'HP Laptop 15',      category: 'Electronics', quantity: 1,  revenue: 480000, city: 'Abuja' },
            { product: 'Sofa Set 3-Seater', category: 'Furniture',   quantity: 1,  revenue: 280000, city: 'Abuja' },
            { product: 'Dining Table Set',  category: 'Furniture',   quantity: 1,  revenue: 195000, city: 'Port Harcourt' },
            { product: 'Tecno Camon 20',    category: 'Electronics', quantity: 3,  revenue: 555000, city: 'Kano' },
        ],
        categoryBreakdown: [
            { category: 'Electronics', revenue: 2_385_000, orders: 18 },
            { category: 'Furniture',   revenue: 1_045_000, orders: 7  },
            { category: 'Fashion',     revenue: 631_500,   orders: 11 },
            { category: 'Food & Grocery', revenue: 485_400, orders: 9 },
            { category: 'Beauty',      revenue: 276_400,   orders: 8  },
            { category: 'Sports',      revenue: 49_200,    orders: 3  },
        ],
        topCities: [
            { city: 'Lagos',         revenue: 1_854_500 },
            { city: 'Abuja',         revenue: 1_010_000 },
            { city: 'Kano',          revenue: 617_000   },
            { city: 'Port Harcourt', revenue: 475_000   },
            { city: 'Ibadan',        revenue: 309_000   },
        ],
    };
}

export function getMockStockAlerts(): StockAlert[] {
    return [
        { product: 'iPhone 15',        category: 'Electronics', stock: 8,  price: 950000 },
        { product: 'Sofa Set 3-Seater',category: 'Furniture',   stock: 6,  price: 280000 },
        { product: 'Dining Table Set', category: 'Furniture',   stock: 8,  price: 195000 },
        { product: 'MAC Makeup Set',   category: 'Beauty',      stock: 12, price: 85000  },
        { product: 'Standing Desk',    category: 'Furniture',   stock: 10, price: 145000 },
    ];
}

export function getMockWelcomeData(): WelcomeData {
    return {
        name:     'Adebayo Okafor',
        email:    'adebayo.okafor@gmail.com',
        city:     'Lagos',
        joinDate: new Date().toLocaleDateString('en-NG', {
            day: 'numeric', month: 'long', year: 'numeric',
            timeZone: 'Africa/Lagos',
        }),
    };
}