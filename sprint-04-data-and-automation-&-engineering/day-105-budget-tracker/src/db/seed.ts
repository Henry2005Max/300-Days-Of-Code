import dotenv from 'dotenv';
dotenv.config();

import { addTransaction, upsertBudget, closeDb } from './store';

const CURRENT_MONTH = new Date().toISOString().slice(0, 7);
const LAST_MONTH    = new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toISOString().slice(0, 7);

function date(month: string, day: number): string {
    return `${month}-${String(day).padStart(2, '0')}`;
}

const transactions = [
    // --- Current month ---
    // Income
    { type: 'income',  amount: 350000,  category: 'Salary',        description: 'Monthly salary',              date: date(CURRENT_MONTH, 1)  },
    { type: 'income',  amount: 85000,   category: 'Freelance',     description: 'Web development contract',    date: date(CURRENT_MONTH, 5)  },
    { type: 'income',  amount: 15000,   category: 'Side Income',   description: 'Tutoring sessions',          date: date(CURRENT_MONTH, 12) },
    // Expenses
    { type: 'expense', amount: 80000,   category: 'Rent',          description: 'Monthly rent',               date: date(CURRENT_MONTH, 1)  },
    { type: 'expense', amount: 45000,   category: 'Food',          description: 'Grocery shopping - Shoprite', date: date(CURRENT_MONTH, 3) },
    { type: 'expense', amount: 12000,   category: 'Food',          description: 'Suya and pepper soup',        date: date(CURRENT_MONTH, 8) },
    { type: 'expense', amount: 25000,   category: 'Transport',     description: 'Uber rides this week',        date: date(CURRENT_MONTH, 9) },
    { type: 'expense', amount: 8500,    category: 'Transport',     description: 'BRT bus card top-up',         date: date(CURRENT_MONTH, 4) },
    { type: 'expense', amount: 15000,   category: 'Utilities',     description: 'PHCN prepaid token',          date: date(CURRENT_MONTH, 2) },
    { type: 'expense', amount: 6000,    category: 'Utilities',     description: 'Water bill',                  date: date(CURRENT_MONTH, 5) },
    { type: 'expense', amount: 22000,   category: 'Internet',      description: 'MTN 5G monthly plan',         date: date(CURRENT_MONTH, 1) },
    { type: 'expense', amount: 18000,   category: 'Health',        description: 'HMO premium',                 date: date(CURRENT_MONTH, 1) },
    { type: 'expense', amount: 9500,    category: 'Health',        description: 'Pharmacy — malaria drugs',    date: date(CURRENT_MONTH, 10) },
    { type: 'expense', amount: 35000,   category: 'Clothing',      description: 'Ankara fabric and tailoring', date: date(CURRENT_MONTH, 7) },
    { type: 'expense', amount: 4500,    category: 'Entertainment', description: 'Netflix subscription',        date: date(CURRENT_MONTH, 1) },
    { type: 'expense', amount: 12000,   category: 'Entertainment', description: 'Cinema with family',          date: date(CURRENT_MONTH, 14) },
    { type: 'expense', amount: 20000,   category: 'Savings',       description: 'Emergency fund contribution', date: date(CURRENT_MONTH, 1) },
    { type: 'expense', amount: 30000,   category: 'Family',        description: 'Sending to parents',          date: date(CURRENT_MONTH, 5) },
    { type: 'expense', amount: 7000,    category: 'Airtime',       description: 'MTN and Glo recharge',        date: date(CURRENT_MONTH, 6) },

    // --- Last month ---
    { type: 'income',  amount: 350000,  category: 'Salary',        description: 'Monthly salary',              date: date(LAST_MONTH, 1)  },
    { type: 'income',  amount: 50000,   category: 'Freelance',     description: 'Logo design project',         date: date(LAST_MONTH, 18) },
    { type: 'expense', amount: 80000,   category: 'Rent',          description: 'Monthly rent',               date: date(LAST_MONTH, 1)  },
    { type: 'expense', amount: 52000,   category: 'Food',          description: 'Market shopping',             date: date(LAST_MONTH, 4)  },
    { type: 'expense', amount: 30000,   category: 'Transport',     description: 'Uber and fuel',              date: date(LAST_MONTH, 10) },
    { type: 'expense', amount: 15000,   category: 'Utilities',     description: 'PHCN and water',             date: date(LAST_MONTH, 3)  },
    { type: 'expense', amount: 22000,   category: 'Internet',      description: 'MTN 5G monthly plan',         date: date(LAST_MONTH, 1)  },
    { type: 'expense', amount: 18000,   category: 'Health',        description: 'HMO premium',                 date: date(LAST_MONTH, 1)  },
    { type: 'expense', amount: 4500,    category: 'Entertainment', description: 'Netflix subscription',        date: date(LAST_MONTH, 1)  },
    { type: 'expense', amount: 20000,   category: 'Savings',       description: 'Emergency fund contribution', date: date(LAST_MONTH, 1)  },
    { type: 'expense', amount: 30000,   category: 'Family',        description: 'Sending to parents',          date: date(LAST_MONTH, 5)  },
];

// Budget limits for current month
const budgets = [
    { category: 'Food',          limit: 65000  },
    { category: 'Transport',     limit: 35000  },
    { category: 'Entertainment', limit: 15000  },
    { category: 'Clothing',      limit: 25000  },
    { category: 'Utilities',     limit: 25000  },
    { category: 'Health',        limit: 30000  },
    { category: 'Airtime',       limit: 8000   },
    { category: 'Family',        limit: 30000  },
];

function seed(): void {
    console.log('[Seed] Inserting transactions...');
    for (const t of transactions) {
        addTransaction(t.type, t.amount, t.category, t.description, t.date);
    }
    console.log(`[Seed] ${transactions.length} transactions inserted.`);

    console.log('[Seed] Setting budgets...');
    for (const b of budgets) {
        upsertBudget(b.category, CURRENT_MONTH, b.limit);
    }
    console.log(`[Seed] ${budgets.length} budgets set.`);

    closeDb();
    console.log('[Seed] Done.');
}

seed();