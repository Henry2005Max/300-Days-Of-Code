import { Asset } from '../types';

export const ASSETS: Asset[] = [
    // Global tech stocks relevant to Nigerian developers and investors
    { symbol: 'AAPL',    name: 'Apple Inc.',              type: 'stock', currency: 'USD' },
    { symbol: 'MSFT',    name: 'Microsoft Corporation',   type: 'stock', currency: 'USD' },
    { symbol: 'GOOGL',   name: 'Alphabet Inc.',           type: 'stock', currency: 'USD' },
    { symbol: 'META',    name: 'Meta Platforms Inc.',     type: 'stock', currency: 'USD' },
    { symbol: 'AMZN',    name: 'Amazon.com Inc.',         type: 'stock', currency: 'USD' },

    // Forex pairs most relevant to Nigeria
    { symbol: 'USD/NGN', name: 'US Dollar / Naira',       type: 'forex', currency: 'NGN' },
    { symbol: 'GBP/NGN', name: 'British Pound / Naira',   type: 'forex', currency: 'NGN' },
    { symbol: 'EUR/NGN', name: 'Euro / Naira',            type: 'forex', currency: 'NGN' },
];