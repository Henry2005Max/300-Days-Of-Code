import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import "./App.css";

// Types
interface Rates {
  [key: string]: number;
}

interface ConversionRecord {
  id: string;
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  date: string;
}

// Constants
const CURRENCIES = [
  { code: "NGN", name: "Nigerian Naira",     flag: "🇳🇬" },
  { code: "USD", name: "US Dollar",           flag: "🇺🇸" },
  { code: "EUR", name: "Euro",                flag: "🇪🇺" },
  { code: "GBP", name: "British Pound",       flag: "🇬🇧" },
  { code: "GHS", name: "Ghanaian Cedi",       flag: "🇬🇭" },
  { code: "KES", name: "Kenyan Shilling",     flag: "🇰🇪" },
  { code: "ZAR", name: "South African Rand",  flag: "🇿🇦" },
  { code: "CAD", name: "Canadian Dollar",     flag: "🇨🇦" },
  { code: "JPY", name: "Japanese Yen",        flag: "🇯🇵" },
  { code: "CNY", name: "Chinese Yuan",        flag: "🇨🇳" },
  { code: "AED", name: "UAE Dirham",          flag: "🇦🇪" },
  { code: "INR", name: "Indian Rupee",        flag: "🇮🇳" },
];

// Fallback rates relative to USD (approximate)
const FALLBACK_RATES: Rates = {
  NGN: 1580, USD: 1, EUR: 0.92, GBP: 0.79,
  GHS: 15.2, KES: 129, ZAR: 18.6, CAD: 1.36,
  JPY: 149, CNY: 7.24, AED: 3.67, INR: 83.1,
};

const NGN_AMOUNTS = [1000, 5000, 10000, 50000, 100000, 500000, 1000000];
const API_KEY = "REPLACE_WITH_YOUR_EXCHANGERATE_API_KEY";

function formatAmount(val: number, code: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: code,
    minimumFractionDigits: code === "JPY" ? 0 : 2,
    maximumFractionDigits: code === "JPY" ? 0 : 4,
  }).format(val);
}

function getCurrencyInfo(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? { code, name: code, flag: "💱" };
}

// Components
const CurrencySelect: React.FC<{
  value: string;
  onChange: (v: string) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  const info = getCurrencyInfo(value);
  return (
    <div className="cur-select-wrap">
      <label className="field-label">{label}</label>
      <div className="cur-select-inner">
        <span className="cur-flag">{info.flag}</span>
        <select className="cur-select" value={value} onChange={(e) => onChange(e.target.value)}>
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

// App
const App: React.FC = () => {
  const [from, setFrom] = useState("NGN");
  const [to, setTo] = useState("USD");
  const [amount, setAmount] = useState("1000");
  const [rates, setRates] = useState<Rates>(FALLBACK_RATES);
  const [loading, setLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [history, setHistory] = useState<ConversionRecord[]>([]);

  // Fetch rates
  const fetchRates = useCallback(async () => {
    if (API_KEY === "REPLACE_WITH_YOUR_EXCHANGERATE_API_KEY") return;
    setLoading(true);
    try {
      const res = await axios.get(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`);
      setRates(res.data.conversion_rates);
      setLastUpdated(new Date().toLocaleTimeString());
      setIsFallback(false);
    } catch {
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  // Conversion math
  const rate = useMemo(() => {
    if (!rates[from] || !rates[to]) return 1;
    return rates[to] / rates[from];
  }, [rates, from, to]);

  const result = useMemo(() => {
    const n = parseFloat(amount);
    if (isNaN(n) || n <= 0) return 0;
    return n * rate;
  }, [amount, rate]);

  const swap = () => { setFrom(to); setTo(from); };

  const saveConversion = () => {
    const n = parseFloat(amount);
    if (isNaN(n) || n <= 0 || !result) return;
    const record: ConversionRecord = {
      id: Date.now().toString(),
      from, to, amount: n, result,
      rate, date: new Date().toLocaleString(),
    };
    setHistory((prev) => [record, ...prev].slice(0, 10));
  };

  // NGN quick reference table
  const ngnTable = useMemo(() => {
    if (!rates[to] || !rates.NGN) return [];
    const rateNgnToTo = rates[to] / rates.NGN;
    return NGN_AMOUNTS.map((a) => ({ ngn: a, converted: a * rateNgnToTo }));
  }, [rates, to]);

  const fromInfo = getCurrencyInfo(from);
  const toInfo = getCurrencyInfo(to);

  // All rates vs NGN for the rates table
  const ratesVsNgn = useMemo(() => {
    return CURRENCIES.filter((c) => c.code !== "NGN").map((c) => ({
      ...c,
      rate: rates[c.code] / rates.NGN,
      inverse: rates.NGN / rates[c.code],
    }));
  }, [rates]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="header-day">Day 47</span>
          <h1 className="header-title">Currency UI</h1>
          <div className="header-right">
            {isFallback && <span className="fallback-badge">Demo rates</span>}
            {!isFallback && <span className="live-badge">Live · {lastUpdated}</span>}
            <button className="refresh-btn" onClick={fetchRates} disabled={loading}>
              {loading ? "..." : "↻"}
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="layout">

          {/* Left */}
          <div className="left-col">

            {/* Converter */}
            <div className="card">
              <h2 className="card-title">Converter</h2>

              <div className="converter-grid">
                <CurrencySelect value={from} onChange={setFrom} label="From" />
                <button className="swap-btn" onClick={swap} title="Swap currencies">⇄</button>
                <CurrencySelect value={to} onChange={setTo} label="To" />
              </div>

              <div className="field">
                <label className="field-label">Amount ({from})</label>
                <input className="amount-input" type="number" value={amount}
                  onChange={(e) => setAmount(e.target.value)} min={0} placeholder="Enter amount" />
              </div>

              {/* Result */}
              <div className="result-block">
                <div className="result-from">
                  <span className="result-flag">{fromInfo.flag}</span>
                  <span className="result-amount">{formatAmount(parseFloat(amount) || 0, from)}</span>
                </div>
                <div className="result-arrow">→</div>
                <div className="result-to">
                  <span className="result-flag">{toInfo.flag}</span>
                  <span className="result-amount result-val">{formatAmount(result, to)}</span>
                </div>
              </div>

              <div className="rate-line">
                1 {from} = <strong>{rate.toFixed(6)}</strong> {to}
                &nbsp;·&nbsp;
                1 {to} = <strong>{(1 / rate).toFixed(6)}</strong> {from}
              </div>

              <button className="save-btn" onClick={saveConversion} disabled={!result}>
                Save Conversion
              </button>
            </div>

            {/* NGN Quick Reference */}
            <div className="card">
              <h3 className="card-title">NGN → {to} Quick Reference</h3>
              <div className="ngn-table">
                <div className="ngn-row ngn-header">
                  <span>Nigerian Naira (₦)</span>
                  <span>{toInfo.flag} {to}</span>
                </div>
                {ngnTable.map(({ ngn, converted }) => (
                  <div key={ngn} className="ngn-row" onClick={() => { setFrom("NGN"); setTo(to); setAmount(String(ngn)); }}>
                    <span className="ngn-amount">₦{ngn.toLocaleString()}</span>
                    <span className="ngn-converted">{formatAmount(converted, to)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="right-col">

            {/* Rates vs NGN */}
            <div className="card">
              <h3 className="card-title">All Rates vs NGN</h3>
              <div className="rates-table">
                {ratesVsNgn.map((c) => (
                  <div key={c.code} className="rate-row" onClick={() => { setFrom("NGN"); setTo(c.code); }}>
                    <span className="rate-flag">{c.flag}</span>
                    <div className="rate-info">
                      <span className="rate-code">{c.code}</span>
                      <span className="rate-name">{c.name}</span>
                    </div>
                    <div className="rate-vals">
                      <span className="rate-main">₦{(1 / c.rate).toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
                      <span className="rate-sub">= 1 {c.code}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="card">
                <div className="card-head">
                  <h3 className="card-title">History</h3>
                  <button className="clear-btn" onClick={() => setHistory([])}>Clear</button>
                </div>
                <div className="history-list">
                  {history.map((h) => (
                    <div key={h.id} className="history-row" onClick={() => { setFrom(h.from); setTo(h.to); setAmount(String(h.amount)); }}>
                      <div className="h-flags">
                        {getCurrencyInfo(h.from).flag}{getCurrencyInfo(h.to).flag}
                      </div>
                      <div className="h-info">
                        <span className="h-main">{formatAmount(h.amount, h.from)} → {formatAmount(h.result, h.to)}</span>
                        <span className="h-meta">{h.from}/{h.to} · {h.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;