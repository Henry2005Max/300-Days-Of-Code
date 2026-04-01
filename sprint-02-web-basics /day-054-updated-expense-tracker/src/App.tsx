import React, { useState, useMemo, useCallback } from "react";
import "./App.css";

// Types
type Category = "Food" | "Transport" | "Housing" | "Shopping" | "Health" | "Entertainment" | "Savings" | "Other";
type TxType = "expense" | "income";

interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  category: Category;
  description: string;
  date: string;
}

// Constants
const CATEGORIES: Category[] = ["Food", "Transport", "Housing", "Shopping", "Health", "Entertainment", "Savings", "Other"];

const CAT_COLORS: Record<Category, string> = {
  Food: "#f97316", Transport: "#3b82f6", Housing: "#8b5cf6",
  Shopping: "#ec4899", Health: "#22c55e", Entertainment: "#f59e0b",
  Savings: "#06b6d4", Other: "#6b7280",
};

const CAT_ICONS: Record<Category, string> = {
  Food: "🍔", Transport: "🚌", Housing: "🏠", Shopping: "🛍",
  Health: "💊", Entertainment: "🎬", Savings: "💰", Other: "📦",
};

// Seed data — Nigerian context
const SEED: Transaction[] = [
  { id: "1", type: "income",  amount: 450000, category: "Other",         description: "Monthly salary",         date: "2025-03-01" },
  { id: "2", type: "expense", amount: 85000,  category: "Housing",       description: "Rent — Lagos Island",    date: "2025-03-02" },
  { id: "3", type: "expense", amount: 12500,  category: "Food",          description: "Shoprite groceries",     date: "2025-03-05" },
  { id: "4", type: "expense", amount: 8000,   category: "Transport",     description: "Uber rides (weekly)",    date: "2025-03-06" },
  { id: "5", type: "income",  amount: 75000,  category: "Other",         description: "Freelance web project",  date: "2025-03-08" },
  { id: "6", type: "expense", amount: 22000,  category: "Shopping",      description: "New clothing — Balogun", date: "2025-03-10" },
  { id: "7", type: "expense", amount: 5500,   category: "Entertainment", description: "Cinema — Silverbird",    date: "2025-03-12" },
  { id: "8", type: "expense", amount: 15000,  category: "Health",        description: "Pharmacy — Reddington",  date: "2025-03-14" },
  { id: "9", type: "expense", amount: 50000,  category: "Savings",       description: "Kuda savings deposit",   date: "2025-03-15" },
  { id: "10",type: "expense", amount: 9000,   category: "Food",          description: "Suya spot — Abuja",      date: "2025-03-18" },
  { id: "11",type: "expense", amount: 6200,   category: "Transport",     description: "Danfo fares (week)",     date: "2025-03-20" },
  { id: "12",type: "income",  amount: 30000,  category: "Other",         description: "Side hustle — designs",  date: "2025-03-22" },
];

// Helpers
function formatNaira(n: number): string {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

// Mini donut chart using SVG
const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;
  const r = 60, cx = 70, cy = 70, stroke = 22;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={140} height={140} viewBox="0 0 140 140">
      {data.map((d, i) => {
        const pct = d.value / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={d.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
        offset += dash;
        return el;
      })}
      <circle cx={cx} cy={cy} r={r - stroke / 2 - 2} fill="#17171d" />
    </svg>
  );
};

// App
const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(SEED);
  const [filterType, setFilterType] = useState<"all" | TxType>("all");
  const [filterCat, setFilterCat] = useState<Category | "All">("All");
  const [filterMonth, setFilterMonth] = useState("2025-03");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [form, setForm] = useState({ type: "expense" as TxType, amount: "", category: "Food" as Category, description: "", date: new Date().toISOString().slice(0, 10) });

  const filtered = useMemo(() => {
    return transactions
      .filter(t => {
        const matchType = filterType === "all" || t.type === filterType;
        const matchCat = filterCat === "All" || t.category === filterCat;
        const matchMonth = !filterMonth || t.date.startsWith(filterMonth);
        const matchSearch = !search || t.description.toLowerCase().includes(search.toLowerCase());
        return matchType && matchCat && matchMonth && matchSearch;
      })
      .sort((a, b) => sortBy === "date"
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : b.amount - a.amount
      );
  }, [transactions, filterType, filterCat, filterMonth, search, sortBy]);

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === "income" && t.date.startsWith(filterMonth)).reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === "expense" && t.date.startsWith(filterMonth)).reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense, savingsRate: income > 0 ? Math.round(((income - expense) / income) * 100) : 0 };
  }, [transactions, filterMonth]);

  const catBreakdown = useMemo(() => {
    const totals: Partial<Record<Category, number>> = {};
    transactions.filter(t => t.type === "expense" && t.date.startsWith(filterMonth))
      .forEach(t => { totals[t.category] = (totals[t.category] ?? 0) + t.amount; });
    return Object.entries(totals)
      .map(([cat, val]) => ({ label: cat as Category, value: val!, color: CAT_COLORS[cat as Category] }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, filterMonth]);

  const addTransaction = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(form.amount);
    if (!n || !form.description.trim()) return;
    setTransactions(prev => [{
      id: Date.now().toString(),
      type: form.type, amount: n,
      category: form.category,
      description: form.description.trim(),
      date: form.date,
    }, ...prev]);
    setForm(f => ({ ...f, amount: "", description: "" }));
    setShowForm(false);
  }, [form]);

  const remove = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="header-day">Day 54</span>
          <h1 className="header-title">Expense Tracker</h1>
          <input type="month" className="month-input" value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)} />
        </div>
      </header>

      <main className="main">

        {/* Summary cards */}
        <div className="summary-grid">
          <div className="summary-card income-card">
            <span className="sum-label">Income</span>
            <span className="sum-val">{formatNaira(stats.income)}</span>
          </div>
          <div className="summary-card expense-card">
            <span className="sum-label">Expenses</span>
            <span className="sum-val">{formatNaira(stats.expense)}</span>
          </div>
          <div className={`summary-card balance-card ${stats.balance >= 0 ? "pos" : "neg"}`}>
            <span className="sum-label">Balance</span>
            <span className="sum-val">{formatNaira(stats.balance)}</span>
          </div>
          <div className="summary-card rate-card">
            <span className="sum-label">Savings Rate</span>
            <span className="sum-val">{stats.savingsRate}%</span>
            <div className="rate-bar"><div className="rate-fill" style={{ width: `${Math.max(0, stats.savingsRate)}%` }} /></div>
          </div>
        </div>

        <div className="layout">
          {/* Left — transactions */}
          <div className="left-col">

            {/* Toolbar */}
            <div className="toolbar">
              <input className="search-input" placeholder="Search transactions..." value={search}
                onChange={e => setSearch(e.target.value)} />
              <select className="select-input" value={filterType} onChange={e => setFilterType(e.target.value as any)}>
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <select className="select-input" value={filterCat} onChange={e => setFilterCat(e.target.value as any)}>
                <option value="All">All Categories</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select className="select-input" value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
                <option value="date">Sort: Date</option>
                <option value="amount">Sort: Amount</option>
              </select>
              <button className="add-btn" onClick={() => setShowForm(v => !v)}>
                {showForm ? "✕ Cancel" : "+ Add"}
              </button>
            </div>

            {/* Add form */}
            {showForm && (
              <form className="add-form" onSubmit={addTransaction}>
                <div className="form-row">
                  <div className="type-toggle">
                    <button type="button" className={`type-btn ${form.type === "income" ? "income-active" : ""}`}
                      onClick={() => setForm(f => ({ ...f, type: "income" }))}>Income</button>
                    <button type="button" className={`type-btn ${form.type === "expense" ? "expense-active" : ""}`}
                      onClick={() => setForm(f => ({ ...f, type: "expense" }))}>Expense</button>
                  </div>
                  <input className="form-input" type="number" placeholder="Amount (₦)"
                    value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required min={1} />
                  <input className="form-input" type="date" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="form-row">
                  <select className="form-input" value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input className="form-input flex-1" type="text" placeholder="Description..."
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
                  <button type="submit" className="submit-btn">Save</button>
                </div>
              </form>
            )}

            {/* Transaction list */}
            <div className="tx-list">
              {filtered.length === 0 ? (
                <div className="empty">No transactions found.</div>
              ) : (
                filtered.map(t => (
                  <div key={t.id} className={`tx-row ${t.type}`}>
                    <div className="tx-icon" style={{ background: CAT_COLORS[t.category] + "22", color: CAT_COLORS[t.category] }}>
                      {CAT_ICONS[t.category]}
                    </div>
                    <div className="tx-info">
                      <span className="tx-desc">{t.description}</span>
                      <span className="tx-meta">{t.category} · {formatDate(t.date)}</span>
                    </div>
                    <span className={`tx-amount ${t.type === "income" ? "income-val" : "expense-val"}`}>
                      {t.type === "income" ? "+" : "−"}{formatNaira(t.amount)}
                    </span>
                    <button className="del-btn" onClick={() => remove(t.id)}>✕</button>
                  </div>
                ))
              )}
            </div>
            <div className="list-footer">{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</div>
          </div>

          {/* Right — charts */}
          <div className="right-col">

            {/* Donut */}
            <div className="chart-card">
              <h3 className="card-title">Spending by Category</h3>
              {catBreakdown.length > 0 ? (
                <div className="donut-wrap">
                  <DonutChart data={catBreakdown} />
                  <div className="donut-legend">
                    {catBreakdown.map(d => (
                      <div key={d.label} className="legend-row">
                        <div className="legend-dot" style={{ background: d.color }} />
                        <span className="legend-label">{CAT_ICONS[d.label]} {d.label}</span>
                        <span className="legend-val">{formatNaira(d.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="empty-note">No expense data for this month.</p>
              )}
            </div>

            {/* Top expenses */}
            <div className="chart-card">
              <h3 className="card-title">Top Expenses</h3>
              <div className="top-list">
                {catBreakdown.slice(0, 5).map(d => {
                  const totalExp = catBreakdown.reduce((s, x) => s + x.value, 0);
                  const pct = totalExp > 0 ? (d.value / totalExp) * 100 : 0;
                  return (
                    <div key={d.label} className="top-row">
                      <span className="top-icon">{CAT_ICONS[d.label]}</span>
                      <div className="top-bar-wrap">
                        <div className="top-bar-track">
                          <div className="top-bar-fill" style={{ width: `${pct}%`, background: d.color }} />
                        </div>
                        <div className="top-bar-labels">
                          <span>{d.label}</span>
                          <span className="top-pct">{pct.toFixed(0)}%</span>
                        </div>
                      </div>
                      <span className="top-val">{formatNaira(d.value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;