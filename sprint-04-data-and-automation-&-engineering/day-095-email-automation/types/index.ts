export interface SalesRecord {
    product: string;
    category: string;
    quantity: number;
    revenue: number;
    city: string;
}

export interface SalesReport {
    date: string;
    totalRevenue: number;
    totalOrders: number;
    topProducts: SalesRecord[];
    categoryBreakdown: { category: string; revenue: number; orders: number }[];
    topCities: { city: string; revenue: number }[];
}

export interface StockAlert {
    product: string;
    category: string;
    stock: number;
    price: number;
}

export interface WelcomeData {
    name: string;
    email: string;
    city: string;
    joinDate: string;
}

export interface EmailPayload {
    to: string | string[];
    subject: string;
    html: string;
    text: string;
    attachments?: EmailAttachment[];
}

export interface EmailAttachment {
    filename: string;
    content: string;
    contentType: string;
}

export interface SendResult {
    success: boolean;
    messageId?: string;
    recipient: string;
    subject: string;
    dryRun: boolean;
    outputFile?: string;
    error?: string;
}