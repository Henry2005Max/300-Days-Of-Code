import React, { useState, useMemo } from "react";
import "./App.css";

// Types
interface Split {
  people: number;
  perPerson: number;
  tipPerPerson: number;
  totalPerPerson: number;
}

interface SavedBill {
  id: string;
  bill: number;
  tip: number;
  people: number;
  total: number;
  date: string;
  label: string;
}

// Constants
const PRESETS = [10, 15, 18, 20, 25, 30];

const NIGERIAN_VENUES = [
  "Chicken Republic", "Mr Bigg's", "Mama Cass", "Yellow Chilli",
  "Nok by Alara", "Rhapsody's", "The Place", "Terra Kulture",
];

// Helpers
function formatNaira(val: number): string {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(val);
}

// App
const App: React.FC = () => {
  const [bill, setBill] = useState("");
  const [tipPct, setTipPct] = useState(15);
  const [customTip, setCustomTip] = useState("");
  const [people, setPeople] = useState(1);
  const [label, setLabel] = useState("");
  const [saved, setSaved] = useState<SavedBill[]>([]);
  const [roundUp, setRoundUp] = useState(false);

  const billVal = parseFloat(bill) || 0;
  const activeTip = customTip !== "" ? parseFloat(customTip) || 0 : tipPct;

  const calc = useMemo(() => {
    const tipAmount = billVal * (activeTip / 100);
    const total = billVal + tipAmount;
    const roundedTotal = roundUp ? Math.ceil(total / 100) * 100 : total;
    const roundedTip = roundedTotal - billVal;
    const perPerson = roundedTotal / people;
    const tipPerPerson = roundedTip / people;
    return { tipAmount: roundedTip, total: roundedTotal, perPerson, tipPerPerson };
  }, [billVal, activeTip, people, roundUp]);

  const saveBill = () => {
    if (!billVal) return;
    const venue = label || NIGERIAN_VENUES[Math.floor(Math.random() * NIGERIAN_VENUES.length)];
    setSaved((prev) => [{
      id: Date.now().toString(),
      bill: billVal, tip: activeTip, people,
      total: calc.total,
      date: new Date().toLocaleDateString(),
      label: venue,
    }, ...prev].slice(0, 8));
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="header-day">Day 49</span>
          <h1 className="header-title">Tip Calculator</h1>
          <span className="header-sprint">Sprint 2 — Web Basics</span>
        </div>
      </header>

      <main className="main">
        <div className="layout">

          {/* Left — Inputs */}
          <div className="left-col">
            <div className="card">
              <h2 className="card-title">Bill Details</h2>

              {/* Bill amount */}
              <div className="field">
                <label className="field-label">Bill Amount (₦)</label>
                <div className="input-wrap">
                  <span className="input-prefix">₦</span>
                  <input className="field-input" type="number" placeholder="0"
                    value={bill} onChange={(e) => setBill(e.target.value)} min={0} />
                </div>
              </div>

              {/* Tip presets */}
              <div className="field">
                <label className="field-label">Tip Percentage</label>
                <div className="presets-grid">
                  {PRESETS.map((p) => (
                    <button key={p}
                      className={`preset-btn ${activeTip === p && customTip === "" ? "active" : ""}`}
                      onClick={() => { setTipPct(p); setCustomTip(""); }}>
                      {p}%
                    </button>
                  ))}
                </div>
                <input className="field-input custom-tip" type="number" placeholder="Custom %"
                  value={customTip} onChange={(e) => setCustomTip(e.target.value)} min={0} max={100} />
              </div>

              {/* People */}
              <div className="field">
                <label className="field-label">Split Between</label>
                <div className="people-row">
                  <button className="people-btn" onClick={() => setPeople((p) => Math.max(1, p - 1))}>−</button>
                  <span className="people-val">{people} {people === 1 ? "person" : "people"}</span>
                  <button className="people-btn" onClick={() => setPeople((p) => p + 1)}>+</button>
                </div>
              </div>

              {/* Round up */}
              <label className="round-label">
                <input type="checkbox" checked={roundUp} onChange={(e) => setRoundUp(e.target.checked)} />
                Round up total to nearest ₦100
              </label>

              {/* Venue label */}
              <div className="field">
                <label className="field-label">Venue / Label (optional)</label>
                <input className="field-input" type="text" placeholder="e.g. Chicken Republic, Lagos"
                  value={label} onChange={(e) => setLabel(e.target.value)} />
              </div>

              <button className="save-btn" onClick={saveBill} disabled={!billVal}>Save Bill</button>
            </div>
          </div>

          {/* Right — Result */}
          <div className="right-col">
            <div className="result-card">
              <h2 className="card-title">Summary</h2>

              <div className="result-rows">
                <div className="result-row">
                  <span className="rr-label">Bill</span>
                  <span className="rr-val">{formatNaira(billVal)}</span>
                </div>
                <div className="result-row">
                  <span className="rr-label">Tip ({activeTip}%)</span>
                  <span className="rr-val tip-val">{formatNaira(calc.tipAmount)}</span>
                </div>
                {roundUp && (
                  <div className="result-row">
                    <span className="rr-label">Rounded up</span>
                    <span className="rr-val">{formatNaira(calc.total)}</span>
                  </div>
                )}
                <div className="result-row total-row">
                  <span className="rr-label">Total</span>
                  <span className="rr-val total-val">{formatNaira(calc.total)}</span>
                </div>
              </div>

              {people > 1 && (
                <div className="split-block">
                  <div className="split-header">Split {people} ways</div>
                  <div className="split-grid">
                    <div className="split-item">
                      <span className="split-val">{formatNaira(calc.perPerson)}</span>
                      <span className="split-lbl">Per Person</span>
                    </div>
                    <div className="split-item">
                      <span className="split-val tip-val">{formatNaira(calc.tipPerPerson)}</span>
                      <span className="split-lbl">Tip / Person</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tip guide */}
              <div className="tip-guide">
                <h3 className="guide-title">Nigerian Tipping Guide</h3>
                {[
                  { label: "Fast food / takeaway", pct: "0–5%",  note: "Optional" },
                  { label: "Casual restaurant",    pct: "5–10%", note: "Common" },
                  { label: "Mid-range dining",     pct: "10–15%",note: "Expected" },
                  { label: "Fine dining",          pct: "15–20%",note: "Standard" },
                  { label: "Exceptional service",  pct: "20%+",  note: "Generous" },
                ].map((g) => (
                  <div key={g.label} className="guide-row">
                    <span className="guide-label">{g.label}</span>
                    <span className="guide-pct">{g.pct}</span>
                    <span className="guide-note">{g.note}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved bills */}
            {saved.length > 0 && (
              <div className="card">
                <div className="card-head">
                  <h3 className="card-title">Saved Bills</h3>
                  <button className="clear-btn" onClick={() => setSaved([])}>Clear</button>
                </div>
                <div className="saved-list">
                  {saved.map((s) => (
                    <div key={s.id} className="saved-row" onClick={() => { setBill(String(s.bill)); setTipPct(s.tip); setCustomTip(""); setPeople(s.people); setLabel(s.label); }}>
                      <div className="saved-info">
                        <span className="saved-label">{s.label}</span>
                        <span className="saved-meta">{s.people}p · {s.tip}% tip · {s.date}</span>
                      </div>
                      <span className="saved-total">{formatNaira(s.total)}</span>
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