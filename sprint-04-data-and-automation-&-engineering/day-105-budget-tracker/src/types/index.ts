export type TransactionType = 'income' | 'expense';

export interface Transaction {
    id:          number;
    type:        TransactionType;
    amount:      number;
    category:    string;
    description: string;
    date:        string;   // YYYY-MM-DD
    createdAt:   string;
}

export interface Budget {
    id:        number;
    category:  string;
    monthYear: string;   // YYYY-MM
    limit:     number;
    createdAt: string;
}

export interface MonthlySummary {
    monthYear:    string;
    totalIncome:  number;
    totalExpense: number;
    netBalance:   number;
    byCategory:   CategorySummary[];
}

export interface CategorySummary {
    category:    string;
    type:        TransactionType;
    total:       number;
    count:       number;
    budgetLimit: number | null;
    budgetUsed:  number | null;   // percentage
}

export interface RunningBalance {
    date:       string;
    amount:     number;
    type:       TransactionType;
    category:   string;
    description: string;
    balance:    number;
}

export type Command =
    | 'add'
    | 'list'
    | 'summary'
    | 'budget'
    | 'export'
    | 'delete'
    | 'seed'
    | 'help';