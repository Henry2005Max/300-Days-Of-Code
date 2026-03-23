import React, { useState, useMemo, useCallback } from "react";
import "./App.css";

// Types
interface Check {
  id: string;
  label: string;
  pass: boolean;
  weight: number;
}

interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

// Constants
const COMMON_PASSWORDS = ["password", "123456", "qwerty", "letmein", "admin", "welcome", "monkey", "dragon", "master", "abc123"];

const SYMBOL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const UPPER_CHARS  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER_CHARS  = "abcdefghijklmnopqrstuvwxyz";
const NUMBER_CHARS = "0123456789";

// Helpers
function getChecks(password: string): Check[] {
  return [
    { id: "len8",    label: "At least 8 characters",         pass: password.length >= 8,                  weight: 1 },
    { id: "len12",   label: "At least 12 characters",        pass: password.length >= 12,                 weight: 2 },
    { id: "upper",   label: "Uppercase letter (A–Z)",         pass: /[A-Z]/.test(password),               weight: 1 },
    { id: "lower",   label: "Lowercase letter (a–z)",         pass: /[a-z]/.test(password),               weight: 1 },
    { id: "number",  label: "Contains a number",              pass: /\d/.test(password),                  weight: 1 },
    { id: "symbol",  label: "Contains a symbol (!@#…)",       pass: /[^A-Za-z0-9]/.test(password),        weight: 2 },
    { id: "nocommon",label: "Not a common password",          pass: !COMMON_PASSWORDS.includes(password.toLowerCase()), weight: 2 },
    { id: "nospace", label: "No leading/trailing spaces",     pass: password === password.trim(),          weight: 1 },
  ];
}

function getScore(checks: Check[], password: string): number {
  if (!password) return 0;
  return checks.filter((c) => c.pass).reduce((acc, c) => acc + c.weight, 0);
}

function getStrength(score: number): { label: string; key: string; color: string } {
  if (score <= 2)  return { label: "Very Weak",  key: "very-weak",  color: "#ef4444" };
  if (score <= 4)  return { label: "Weak",        key: "weak",       color: "#f97316" };
  if (score <= 6)  return { label: "Fair",        key: "fair",       color: "#eab308" };
  if (score <= 8)  return { label: "Strong",      key: "strong",     color: "#22c55e" };
  return                   { label: "Very Strong", key: "very-strong",color: "#10b981" };
}

function estimateCrackTime(password: string, checks: Check[]): string {
  if (!password) return "—";
  let charset = 0;
  if (/[a-z]/.test(password)) charset += 26;
  if (/[A-Z]/.test(password)) charset += 26;
  if (/\d/.test(password))    charset += 10;
  if (/[^A-Za-z0-9]/.test(password)) charset += 32;
  if (charset === 0) return "instant";

  const combinations = Math.pow(charset, password.length);
  const attemptsPerSec = 1e10; // 10 billion/s (modern GPU)
  const seconds = combinations / attemptsPerSec;

  if (seconds < 1)         return "instantly";
  if (seconds < 60)        return `${Math.round(seconds)} seconds`;
  if (seconds < 3600)      return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400)     return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 2592000)   return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000)  return `${Math.round(seconds / 2592000)} months`;
  if (seconds < 3.15e9)    return `${Math.round(seconds / 31536000)} years`;
  return "centuries";
}

function generatePassword(opts: GeneratorOptions): string {
  const pool = [
    opts.uppercase ? UPPER_CHARS : "",
    opts.lowercase ? LOWER_CHARS : "",
    opts.numbers   ? NUMBER_CHARS : "",
    opts.symbols   ? SYMBOL_CHARS : "",
  ].join("");

  if (!pool) return "";

  // Ensure at least one char from each enabled set
  const required: string[] = [];
  if (opts.uppercase) required.push(UPPER_CHARS[Math.floor(Math.random() * UPPER_CHARS.length)]);
  if (opts.lowercase) required.push(LOWER_CHARS[Math.floor(Math.random() * LOWER_CHARS.length)]);
  if (opts.numbers)   required.push(NUMBER_CHARS[Math.floor(Math.random() * NUMBER_CHARS.length)]);
  if (opts.symbols)   required.push(SYMBOL_CHARS[Math.floor(Math.random() * SYMBOL_CHARS.length)]);

  const rest = Array.from({ length: opts.length - required.length }, () =>
    pool[Math.floor(Math.random() * pool.length)]
  );

  return [...required, ...rest]
    .sort(() => Math.random() - 0.5)
    .join("");
}

// Components
const StrengthBar: React.FC<{ score: number; maxScore: number; color: string }> = ({ score, maxScore, color }) => {
  const segments = 5;
  const filled = Math.ceil((score / maxScore) * segments);
  return (
    <div className="strength-bar">
      {Array.from({ length: segments }).map((_, i) => (
        <div key={i} className={`strength-seg ${i < filled ? "filled" : ""}`}
          style={i < filled ? { background: color } : {}} />
      ))}
    </div>
  );
};

const CheckItem: React.FC<{ check: Check }> = ({ check }) => (
  <div className={`check-item ${check.pass ? "pass" : "fail"}`}>
    <span className="check-icon">{check.pass ? "✓" : "✗"}</span>
    <span className="check-label">{check.label}</span>
    {check.weight > 1 && <span className="check-weight">+{check.weight}</span>}
  </div>
);

// App
const App: React.FC = () => {
  const [password, setPassword]   = useState("");
  const [visible, setVisible]     = useState(false);
  const [copied, setCopied]       = useState(false);
  const [history, setHistory]     = useState<string[]>([]);
  const [genOpts, setGenOpts]     = useState<GeneratorOptions>({
    length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true,
  });

  const checks    = useMemo(() => getChecks(password), [password]);
  const score     = useMemo(() => getScore(checks, password), [checks, password]);
  const maxScore  = useMemo(() => checks.reduce((a, c) => a + c.weight, 0), [checks]);
  const strength  = useMemo(() => getStrength(score), [score]);
  const crackTime = useMemo(() => estimateCrackTime(password, checks), [password, checks]);
  const entropy   = useMemo(() => {
    if (!password) return 0;
    let charset = 0;
    if (/[a-z]/.test(password)) charset += 26;
    if (/[A-Z]/.test(password)) charset += 26;
    if (/\d/.test(password))    charset += 10;
    if (/[^A-Za-z0-9]/.test(password)) charset += 32;
    return Math.round(password.length * Math.log2(charset || 1));
  }, [password]);

  const copy = useCallback(() => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [password]);

  const generate = useCallback(() => {
    const pwd = generatePassword(genOpts);
    setPassword(pwd);
    setHistory((prev) => [pwd, ...prev.filter((p) => p !== pwd)].slice(0, 8));
  }, [genOpts]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="header-day">Day 45</span>
          <h1 className="header-title">Password Strength Meter</h1>
          <span className="header-sprint">Sprint 2 — Web Basics</span>
        </div>
      </header>

      <main className="main">
        <div className="layout">

          {/* Left */}
          <div className="left-col">

            {/* Input */}
            <div className="card">
              <h2 className="card-title">Test a Password</h2>
              <div className="input-row">
                <input
                  className="pwd-input"
                  type={visible ? "text" : "password"}
                  placeholder="Type or paste a password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button className="icon-btn" onClick={() => setVisible((v) => !v)} title="Toggle visibility">
                  {visible ? "🙈" : "👁"}
                </button>
                <button className={`icon-btn ${copied ? "copied" : ""}`} onClick={copy} title="Copy">
                  {copied ? "✓" : "⎘"}
                </button>
              </div>

              {/* Strength display */}
              {password && (
                <div className="strength-display">
                  <div className="strength-row">
                    <span className="strength-label" style={{ color: strength.color }}>{strength.label}</span>
                    <span className="strength-score">{score}/{maxScore} pts</span>
                  </div>
                  <StrengthBar score={score} maxScore={maxScore} color={strength.color} />
                </div>
              )}
            </div>

            {/* Checks */}
            <div className="card">
              <h3 className="card-title">Security Checks</h3>
              <div className="checks-list">
                {checks.map((c) => <CheckItem key={c.id} check={c} />)}
              </div>
            </div>

            {/* Generator */}
            <div className="card">
              <h3 className="card-title">Password Generator</h3>

              <div className="gen-opt">
                <label className="opt-label">Length: {genOpts.length}</label>
                <input type="range" min={8} max={64} value={genOpts.length}
                  onChange={(e) => setGenOpts((o) => ({ ...o, length: Number(e.target.value) }))} />
              </div>

              <div className="gen-toggles">
                {(["uppercase", "lowercase", "numbers", "symbols"] as const).map((k) => (
                  <label key={k} className="toggle-label">
                    <input type="checkbox" checked={genOpts[k]}
                      onChange={(e) => setGenOpts((o) => ({ ...o, [k]: e.target.checked }))} />
                    {k.charAt(0).toUpperCase() + k.slice(1)}
                  </label>
                ))}
              </div>

              <button className="gen-btn" onClick={generate}>Generate Password</button>

              {/* History */}
              {history.length > 0 && (
                <div className="gen-history">
                  <span className="history-label">Recent</span>
                  {history.map((p, i) => (
                    <button key={i} className="history-item" onClick={() => setPassword(p)} title="Use this password">
                      <span className="history-pwd">{p}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="right-col">
            <div className="info-card">
              <div className="info-top" style={{ borderColor: strength.color + "44", background: strength.color + "11" }}>
                <div className="info-strength" style={{ color: strength.color }}>{password ? strength.label : "—"}</div>
                <div className="info-sublabel">Strength</div>
              </div>

              <div className="info-stats">
                <div className="info-stat">
                  <span className="stat-val">{password.length || "—"}</span>
                  <span className="stat-lbl">Length</span>
                </div>
                <div className="info-stat">
                  <span className="stat-val">{entropy || "—"}</span>
                  <span className="stat-lbl">Entropy (bits)</span>
                </div>
                <div className="info-stat">
                  <span className="stat-val crack-time" style={{ color: password ? strength.color : undefined }}>
                    {crackTime}
                  </span>
                  <span className="stat-lbl">Est. crack time</span>
                </div>
              </div>

              <div className="tip-block">
                <h4 className="tip-title">Tips for a strong password</h4>
                <ul className="tip-list">
                  <li>Use 12+ characters minimum</li>
                  <li>Mix uppercase, lowercase, numbers, symbols</li>
                  <li>Avoid real words or names</li>
                  <li>Never reuse passwords across sites</li>
                  <li>Use a password manager to store them</li>
                </ul>
              </div>

              <div className="legend">
                {[
                  { key: "very-weak",   label: "Very Weak",   color: "#ef4444", range: "0–2 pts" },
                  { key: "weak",        label: "Weak",         color: "#f97316", range: "3–4 pts" },
                  { key: "fair",        label: "Fair",         color: "#eab308", range: "5–6 pts" },
                  { key: "strong",      label: "Strong",       color: "#22c55e", range: "7–8 pts" },
                  { key: "very-strong", label: "Very Strong",  color: "#10b981", range: "9–11 pts" },
                ].map((l) => (
                  <div key={l.key} className={`legend-row ${strength.key === l.key && password ? "active" : ""}`}>
                    <div className="legend-dot" style={{ background: l.color }} />
                    <span className="legend-label">{l.label}</span>
                    <span className="legend-range">{l.range}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;