import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

type Mode = "clock" | "stopwatch" | "countdown";

interface Lap {
  id: number;
  time: number;
  delta: number;
}

function pad(n: number) { return String(n).padStart(2, "0"); }

function formatMs(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
  return `${pad(m)}:${pad(s)}.${pad(cs)}`;
}

function formatTime(date: Date, use24: boolean) {
  let h = date.getHours();
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  if (use24) return `${pad(h)}:${m}:${s}`;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${pad(h)}:${m}:${s} ${ampm}`;
}

// ─── Clock ────────────────────────────────────────────────────────────────────

const Clock: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const [use24, setUse24] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div className="mode-panel">
      <div className="clock-display">
        <div className="clock-time">{formatTime(now, use24)}</div>
        <div className="clock-date">
          {days[now.getDay()]}, {months[now.getMonth()]} {now.getDate()}, {now.getFullYear()}
        </div>
        <button className="small-btn" onClick={() => setUse24(!use24)}>
          {use24 ? "Switch to 12h" : "Switch to 24h"}
        </button>
      </div>
      <div className="clock-info-grid">
        <div className="clock-info-item">
          <span className="info-label">Timezone</span>
          <span className="info-value">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
        </div>
        <div className="clock-info-item">
          <span className="info-label">UTC Offset</span>
          <span className="info-value">UTC{now.getTimezoneOffset() <= 0 ? "+" : "-"}{Math.abs(now.getTimezoneOffset() / 60)}</span>
        </div>
        <div className="clock-info-item">
          <span className="info-label">Unix Timestamp</span>
          <span className="info-value">{Math.floor(now.getTime() / 1000)}</span>
        </div>
        <div className="clock-info-item">
          <span className="info-label">Day of Year</span>
          <span className="info-value">
            {Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000)}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Stopwatch ────────────────────────────────────────────────────────────────

const Stopwatch: React.FC = () => {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const startRef = useRef<number>(0);
  const frameRef = useRef<number>(0);

  const tick = useCallback(() => {
    setElapsed(Date.now() - startRef.current);
    frameRef.current = requestAnimationFrame(tick);
  }, []);

  const start = () => {
    startRef.current = Date.now() - elapsed;
    setRunning(true);
    frameRef.current = requestAnimationFrame(tick);
  };

  const pause = () => {
    cancelAnimationFrame(frameRef.current);
    setRunning(false);
  };

  const reset = () => {
    cancelAnimationFrame(frameRef.current);
    setRunning(false);
    setElapsed(0);
    setLaps([]);
  };

  const lap = () => {
    if (!running) return;
    const prev = laps.length > 0 ? laps[laps.length - 1].time : 0;
    setLaps((l) => [...l, { id: l.length + 1, time: elapsed, delta: elapsed - prev }]);
  };

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const fastest = laps.length > 1 ? Math.min(...laps.map((l) => l.delta)) : null;
  const slowest = laps.length > 1 ? Math.max(...laps.map((l) => l.delta)) : null;

  return (
    <div className="mode-panel">
      <div className="timer-display">{formatMs(elapsed)}</div>
      <div className="controls">
        {!running ? (
          <button className="ctrl-btn green" onClick={start}>{elapsed === 0 ? "Start" : "Resume"}</button>
        ) : (
          <button className="ctrl-btn yellow" onClick={pause}>Pause</button>
        )}
        <button className="ctrl-btn ghost" onClick={lap} disabled={!running}>Lap</button>
        <button className="ctrl-btn ghost" onClick={reset}>Reset</button>
      </div>
      {laps.length > 0 && (
        <div className="laps-panel">
          <div className="laps-header"><span>Lap</span><span>Split</span><span>Total</span></div>
          <div className="laps-list">
            {[...laps].reverse().map((l) => (
              <div key={l.id} className={`lap-row ${fastest !== null && l.delta === fastest ? "best" : slowest !== null && l.delta === slowest ? "worst" : ""}`}>
                <span>#{l.id}</span>
                <span>{formatMs(l.delta)}</span>
                <span>{formatMs(l.time)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Countdown ────────────────────────────────────────────────────────────────

const PRESETS = [
  { label: "1 min", ms: 60000 },
  { label: "5 min", ms: 300000 },
  { label: "10 min", ms: 600000 },
  { label: "25 min", ms: 1500000 },
  { label: "1 hr", ms: 3600000 },
];

const Countdown: React.FC = () => {
  const [total, setTotal] = useState(300000);
  const [remaining, setRemaining] = useState(300000);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [customH, setCustomH] = useState("0");
  const [customM, setCustomM] = useState("5");
  const [customS, setCustomS] = useState("0");
  const endRef = useRef<number>(0);
  const frameRef = useRef<number>(0);

  const tick = useCallback(() => {
    const left = endRef.current - Date.now();
    if (left <= 0) {
      setRemaining(0);
      setRunning(false);
      setFinished(true);
      return;
    }
    setRemaining(left);
    frameRef.current = requestAnimationFrame(tick);
  }, []);

  const start = () => {
    endRef.current = Date.now() + remaining;
    setRunning(true);
    setFinished(false);
    frameRef.current = requestAnimationFrame(tick);
  };

  const pause = () => { cancelAnimationFrame(frameRef.current); setRunning(false); };

  const reset = () => {
    cancelAnimationFrame(frameRef.current);
    setRunning(false);
    setFinished(false);
    setRemaining(total);
  };

  const applyPreset = (ms: number) => {
    cancelAnimationFrame(frameRef.current);
    setRunning(false);
    setFinished(false);
    setTotal(ms);
    setRemaining(ms);
  };

  const applyCustom = () => {
    const ms =
      (parseInt(customH) || 0) * 3600000 +
      (parseInt(customM) || 0) * 60000 +
      (parseInt(customS) || 0) * 1000;
    if (ms > 0) applyPreset(ms);
  };

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const progress = total > 0 ? (remaining / total) * 100 : 0;
  const isLow = progress < 20 && remaining > 0;

  return (
    <div className="mode-panel">
      <div className={`timer-display ${isLow ? "low" : ""} ${finished ? "done" : ""}`}>
        {finished ? "Done!" : formatMs(remaining)}
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-track">
          <div
            className={`progress-bar-fill ${isLow ? "low" : ""}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="presets">
        {PRESETS.map((p) => (
          <button
            key={p.ms}
            className={`preset-btn ${total === p.ms ? "active" : ""}`}
            onClick={() => applyPreset(p.ms)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="custom-input">
        <input className="time-input" value={customH} onChange={(e) => setCustomH(e.target.value)} placeholder="0" />
        <span className="time-sep">h</span>
        <input className="time-input" value={customM} onChange={(e) => setCustomM(e.target.value)} placeholder="5" />
        <span className="time-sep">m</span>
        <input className="time-input" value={customS} onChange={(e) => setCustomS(e.target.value)} placeholder="0" />
        <span className="time-sep">s</span>
        <button className="small-btn" onClick={applyCustom}>Set</button>
      </div>

      <div className="controls">
        {!running ? (
          <button className="ctrl-btn green" onClick={start} disabled={remaining === 0}>
            {remaining === total ? "Start" : "Resume"}
          </button>
        ) : (
          <button className="ctrl-btn yellow" onClick={pause}>Pause</button>
        )}
        <button className="ctrl-btn ghost" onClick={reset}>Reset</button>
      </div>

      {finished && (
        <div className="finished-banner">Time is up! Hit Reset to go again.</div>
      )}
    </div>
  );
};

// ─── App ─────────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>("clock");

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="header-day">Day 36</span>
          <h1 className="header-title">Clock / Timer</h1>
          <span className="header-sprint">Sprint 2 — Web Basics</span>
        </div>
      </header>

      <main className="main">
        <div className="tabs">
          {(["clock", "stopwatch", "countdown"] as Mode[]).map((m) => (
            <button
              key={m}
              className={`tab ${mode === m ? "active" : ""}`}
              onClick={() => setMode(m)}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        <div className="panel-wrap">
          {mode === "clock" && <Clock />}
          {mode === "stopwatch" && <Stopwatch />}
          {mode === "countdown" && <Countdown />}
        </div>
      </main>
    </div>
  );
};

export default App;
