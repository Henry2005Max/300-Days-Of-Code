import React, { useState, useMemo } from "react";
import "./App.css";

// Types
type Unit = "metric" | "imperial";

interface BMIRecord {
  id: string;
  bmi: number;
  category: string;
  weight: string;
  height: string;
  unit: Unit;
  date: string;
}

// Helpers
function calcBMI(weight: number, height: number, unit: Unit): number {
  if (unit === "metric") {
    const hm = height / 100;
    return weight / (hm * hm);
  } else {
    return (703 * weight) / (height * height);
  }
}

function getCategory(bmi: number): { label: string; key: string } {
  if (bmi < 18.5) return { label: "Underweight", key: "under" };
  if (bmi < 25)   return { label: "Normal weight", key: "normal" };
  if (bmi < 30)   return { label: "Overweight", key: "over" };
  return              { label: "Obese", key: "obese" };
}

function idealWeightRange(height: number, unit: Unit): string {
  if (!height) return "—";
  if (unit === "metric") {
    const hm = height / 100;
    const low = (18.5 * hm * hm).toFixed(1);
    const high = (24.9 * hm * hm).toFixed(1);
    return `${low} – ${high} kg`;
  } else {
    const low = ((18.5 * height * height) / 703).toFixed(1);
    const high = ((24.9 * height * height) / 703).toFixed(1);
    return `${low} – ${high} lbs`;
  }
}

// Nigerian city BMI averages (illustrative)
const CITY_AVGS = [
  { city: "Lagos",         avg: 25.4 },
  { city: "Abuja",         avg: 24.8 },
  { city: "Kano",          avg: 22.1 },
  { city: "Port Harcourt", avg: 26.2 },
  { city: "Ibadan",        avg: 23.7 },
];

const CATEGORIES = [
  { key: "under",  label: "Underweight", range: "< 18.5",      color: "#3b82f6" },
  { key: "normal", label: "Normal",      range: "18.5 – 24.9", color: "#22c55e" },
  { key: "over",   label: "Overweight",  range: "25 – 29.9",   color: "#f59e0b" },
  { key: "obese",  label: "Obese",       range: "≥ 30",        color: "#ef4444" },
];

// Gauge component
const BMIGauge: React.FC<{ bmi: number }> = ({ bmi }) => {
  const clamped = Math.min(Math.max(bmi, 10), 40);
  const pct = ((clamped - 10) / 30) * 100;

  return (
    <div className="gauge-wrap">
      <div className="gauge-track">
        <div className="gauge-segment seg-under" />
        <div className="gauge-segment seg-normal" />
        <div className="gauge-segment seg-over" />
        <div className="gauge-segment seg-obese" />
        <div className="gauge-needle" style={{ left: `${pct}%` }} />
      </div>
      <div className="gauge-labels">
        <span>10</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
      </div>
    </div>
  );
};

// App
const App: React.FC = () => {
  const [unit, setUnit] = useState<Unit>("metric");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("prefer-not");
  const [history, setHistory] = useState<BMIRecord[]>([]);
  const [calculated, setCalculated] = useState(false);

  const heightInches = useMemo(() => {
    const ft = parseFloat(heightFt) || 0;
    const inches = parseFloat(heightIn) || 0;
    return ft * 12 + inches;
  }, [heightFt, heightIn]);

  const heightVal = unit === "metric" ? parseFloat(height) : heightInches;
  const weightVal = parseFloat(weight);

  const bmi = useMemo(() => {
    if (!weightVal || !heightVal) return null;
    return calcBMI(weightVal, heightVal, unit);
  }, [weightVal, heightVal, unit]);

  const category = bmi ? getCategory(bmi) : null;
  const ideal = idealWeightRange(heightVal, unit);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bmi || !category) return;
    setCalculated(true);
    const record: BMIRecord = {
      id: Date.now().toString(),
      bmi: parseFloat(bmi.toFixed(1)),
      category: category.label,
      weight: `${weight}${unit === "metric" ? " kg" : " lbs"}`,
      height: unit === "metric" ? `${height} cm` : `${heightFt}ft ${heightIn}in`,
      unit,
      date: new Date().toLocaleDateString(),
    };
    setHistory((prev) => [record, ...prev].slice(0, 10));
  };

  const switchUnit = (u: Unit) => {
    setUnit(u);
    setWeight("");
    setHeight("");
    setHeightFt("");
    setHeightIn("");
    setCalculated(false);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="header-day">Day 44</span>
          <h1 className="header-title">BMI Calculator</h1>
          <span className="header-sprint">Sprint 2 — Web Basics</span>
        </div>
      </header>

      <main className="main">
        <div className="layout">

          {/* Left — Form */}
          <div className="left-col">
            <div className="card">
              <div className="card-head">
                <h2 className="card-title">Calculate Your BMI</h2>
                <div className="unit-toggle">
                  <button className={`unit-btn ${unit === "metric" ? "active" : ""}`} onClick={() => switchUnit("metric")}>Metric</button>
                  <button className={`unit-btn ${unit === "imperial" ? "active" : ""}`} onClick={() => switchUnit("imperial")}>Imperial</button>
                </div>
              </div>

              <form onSubmit={handleCalculate} className="form">
                {/* Weight */}
                <div className="field">
                  <label className="field-label">Weight ({unit === "metric" ? "kg" : "lbs"})</label>
                  <input className="field-input" type="number" placeholder={unit === "metric" ? "e.g. 70" : "e.g. 154"}
                    value={weight} onChange={(e) => setWeight(e.target.value)} min={1} required />
                </div>

                {/* Height */}
                <div className="field">
                  <label className="field-label">Height ({unit === "metric" ? "cm" : "ft / in"})</label>
                  {unit === "metric" ? (
                    <input className="field-input" type="number" placeholder="e.g. 175"
                      value={height} onChange={(e) => setHeight(e.target.value)} min={1} required />
                  ) : (
                    <div className="height-imperial">
                      <input className="field-input" type="number" placeholder="ft" value={heightFt}
                        onChange={(e) => setHeightFt(e.target.value)} min={0} required />
                      <input className="field-input" type="number" placeholder="in" value={heightIn}
                        onChange={(e) => setHeightIn(e.target.value)} min={0} max={11} />
                    </div>
                  )}
                </div>

                {/* Age + Gender */}
                <div className="two-col">
                  <div className="field">
                    <label className="field-label">Age (optional)</label>
                    <input className="field-input" type="number" placeholder="e.g. 28"
                      value={age} onChange={(e) => setAge(e.target.value)} min={1} max={120} />
                  </div>
                  <div className="field">
                    <label className="field-label">Gender (optional)</label>
                    <select className="field-input" value={gender} onChange={(e) => setGender(e.target.value)}>
                      <option value="prefer-not">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <button className="calc-btn" type="submit" disabled={!weightVal || !heightVal}>
                  Calculate BMI
                </button>
              </form>
            </div>

            {/* BMI Table */}
            <div className="card">
              <h3 className="card-title">BMI Categories</h3>
              <div className="cat-table">
                {CATEGORIES.map((c) => (
                  <div key={c.key} className={`cat-row ${calculated && category?.key === c.key ? "highlighted" : ""}`}>
                    <div className="cat-dot" style={{ background: c.color }} />
                    <span className="cat-label">{c.label}</span>
                    <span className="cat-range">{c.range}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nigerian City Averages */}
            <div className="card">
              <h3 className="card-title">Nigerian City Averages</h3>
              <p className="card-note">Illustrative reference values</p>
              <div className="city-list">
                {CITY_AVGS.map((c) => {
                  const cat = getCategory(c.avg);
                  const pct = ((Math.min(c.avg, 40) - 10) / 30) * 100;
                  return (
                    <div key={c.city} className="city-row">
                      <span className="city-name">{c.city}</span>
                      <div className="city-bar-wrap">
                        <div className="city-bar" style={{ width: `${pct}%`, background: CATEGORIES.find(x => x.key === cat.key)?.color }} />
                      </div>
                      <span className="city-avg">{c.avg}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right — Result */}
          <div className="right-col">
            {calculated && bmi && category ? (
              <div className="result-card">
                <div className={`result-badge badge-${category.key}`}>{category.label}</div>
                <div className="result-bmi">{bmi.toFixed(1)}</div>
                <div className="result-label">Body Mass Index</div>

                <BMIGauge bmi={bmi} />

                <div className="result-details">
                  <div className="detail-row">
                    <span className="detail-key">Ideal weight range</span>
                    <span className="detail-val">{ideal}</span>
                  </div>
                  {age && (
                    <div className="detail-row">
                      <span className="detail-key">Age</span>
                      <span className="detail-val">{age} years</span>
                    </div>
                  )}
                  {gender !== "prefer-not" && (
                    <div className="detail-row">
                      <span className="detail-key">Gender</span>
                      <span className="detail-val" style={{ textTransform: "capitalize" }}>{gender}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-key">Weight</span>
                    <span className="detail-val">{weight} {unit === "metric" ? "kg" : "lbs"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-key">Height</span>
                    <span className="detail-val">
                      {unit === "metric" ? `${height} cm` : `${heightFt}ft ${heightIn}in`}
                    </span>
                  </div>
                </div>

                <div className={`result-advice advice-${category.key}`}>
                  {category.key === "under" && "Consider consulting a nutritionist to reach a healthy weight."}
                  {category.key === "normal" && "Great work! Maintain your healthy lifestyle with balanced diet and exercise."}
                  {category.key === "over" && "Small lifestyle changes — more movement and mindful eating — can make a big difference."}
                  {category.key === "obese" && "Consider speaking with a healthcare professional for personalised guidance."}
                </div>
              </div>
            ) : (
              <div className="result-empty">
                <div className="empty-icon">⚖</div>
                <p>Enter your weight and height then click Calculate to see your BMI.</p>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div className="card history-card">
                <div className="card-head">
                  <h3 className="card-title">History</h3>
                  <button className="clear-btn" onClick={() => setHistory([])}>Clear</button>
                </div>
                <div className="history-list">
                  {history.map((r) => (
                    <div key={r.id} className="history-row">
                      <div className={`h-dot badge-${getCategory(r.bmi).key}`} />
                      <div className="h-info">
                        <span className="h-bmi">{r.bmi} — {r.category}</span>
                        <span className="h-meta">{r.weight} · {r.height} · {r.date}</span>
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