import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./App.css";

// Types
type Mode = "work" | "short" | "long";

interface Session {
  id: string;
  mode: Mode;
  duration: number;
  completedAt: string;
  task: string;
}

interface Settings {
  work: number;
  short: number;
  long: number;
  longAfter: number;
  autoStart: boolean;
  sound: boolean;
}

// Constants
const MODE_LABELS: Record<Mode, string> = {
  work: "Focus",
  short: "Short Break",
  long: "Long Break",
};

const MODE_COLORS: Record<Mode, string> = {
  work: "#ef4444",
  short: "#22c55e",
  long: "#3b82f6",
};

const DEFAULT_SETTINGS: Settings = {
  work: 25, short: 5, long: 15, longAfter: 4, autoStart: false, sound: true,
};

// Helpers
function pad(n: number) { return String(n).padStart(2, "0"); }
function formatDuration(s: number) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }
function formatTime(str: string) { return new Date(str).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }

// Sound (web audio)
function playBeep(ctx: AudioContext, type: "start" | "end" | "tick") {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g);
  g.connect(ctx.destination);
  if (type === "end") {
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    o.start(); o.stop(ctx.currentTime + 0.8);
  } else if (type === "start") {
    o.frequency.value = 440;
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o.start(); o.stop(ctx.currentTime + 0.3);
  } else {
    o.frequency.value = 330;
    g.gain.setValueAtTime(0.05, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    o.start(); o.stop(ctx.currentTime + 0.1);
  }
}

// SVG ring progress
const RingProgress: React.FC<{ pct: number; color: string; size: number; stroke: number }> = ({ pct, color, size, stroke }) => {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);
  return (
    <svg width={size} height={size} className="ring-svg">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e1e2e" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: "stroke-dashoffset 1s linear" }} />
    </svg>
  );
};

// Task input
const TaskInput: React.FC<{ task: string; onChange: (t: string) => void }> = ({ task, onChange }) => (
  <div className="task-wrap">
    <input className="task-input" placeholder="What are you working on?" value={task}
      onChange={e => onChange(e.target.value)} maxLength={60} />
  </div>
);

// Settings panel
const SettingsPanel: React.FC<{ settings: Settings; onChange: (s: Settings) => void; onClose: () => void }> = ({ settings, onChange, onClose }) => {
  const [local, setLocal] = useState(settings);
  const set = (k: keyof Settings, v: number | boolean) => setLocal(s => ({ ...s, [k]: v }));
  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="settings-head">
          <h3 className="settings-title">Settings</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="settings-body">
          <div className="settings-section">
            <h4 className="settings-section-title">Timer (minutes)</h4>
            {([["work","Focus"], ["short","Short Break"], ["long","Long Break"]] as [keyof Settings, string][]).map(([k, label]) => (
              <div key={k} className="settings-row">
                <label className="settings-label">{label}</label>
                <input type="number" className="settings-num" min={1} max={90}
                  value={local[k] as number}
                  onChange={e => set(k, Number(e.target.value))} />
              </div>
            ))}
            <div className="settings-row">
              <label className="settings-label">Long break after</label>
              <input type="number" className="settings-num" min={1} max={10}
                value={local.longAfter}
                onChange={e => set("longAfter", Number(e.target.value))} />
            </div>
          </div>
          <div className="settings-section">
            <h4 className="settings-section-title">Behaviour</h4>
            <div className="settings-row">
              <label className="settings-label">Auto-start next timer</label>
              <input type="checkbox" checked={local.autoStart}
                onChange={e => set("autoStart", e.target.checked)} />
            </div>
            <div className="settings-row">
              <label className="settings-label">Sound effects</label>
              <input type="checkbox" checked={local.sound}
                onChange={e => set("sound", e.target.checked)} />
            </div>
          </div>
        </div>
        <button className="settings-save" onClick={() => { onChange(local); onClose(); }}>Save Settings</button>
      </div>
    </div>
  );
};

// App
const App: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.work * 60);
  const [running, setRunning] = useState(false);
  const [completedPomos, setCompletedPomos] = useState(0);
  const [task, setTask] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [totalFocusToday, setTotalFocusToday] = useState(0);

  const audioCtx = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalTime = settings[mode] * 60;
  const pct = timeLeft / totalTime;
  const color = MODE_COLORS[mode];

  const getAudioCtx = useCallback(() => {
    if (!audioCtx.current) audioCtx.current = new AudioContext();
    return audioCtx.current;
  }, []);

  const sound = useCallback((type: "start" | "end" | "tick") => {
    if (!settings.sound) return;
    try { playBeep(getAudioCtx(), type); } catch {}
  }, [settings.sound, getAudioCtx]);

  const switchMode = useCallback((m: Mode, s: Settings = settings) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setMode(m);
    setTimeLeft(s[m] * 60);
  }, [settings]);

  const handleComplete = useCallback(() => {
    sound("end");
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);

    if (mode === "work") {
      const newPomos = completedPomos + 1;
      setCompletedPomos(newPomos);
      setTotalFocusToday(t => t + settings.work);
      setSessions(prev => [{
        id: Date.now().toString(),
        mode: "work",
        duration: settings.work,
        completedAt: new Date().toISOString(),
        task: task || "Focus session",
      }, ...prev].slice(0, 20));

      const nextMode: Mode = newPomos % settings.longAfter === 0 ? "long" : "short";
      if (settings.autoStart) {
        switchMode(nextMode);
        setTimeout(() => setRunning(true), 500);
      } else {
        switchMode(nextMode);
      }
    } else {
      if (settings.autoStart) {
        switchMode("work");
        setTimeout(() => setRunning(true), 500);
      } else {
        switchMode("work");
      }
    }
  }, [mode, completedPomos, settings, task, sound, switchMode]);

  // Timer tick
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleComplete(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, handleComplete]);

  const start = () => { sound("start"); setRunning(true); };
  const pause = () => { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false); };
  const reset = () => { pause(); setTimeLeft(settings[mode] * 60); };

  const applySettings = (s: Settings) => {
    setSettings(s);
    switchMode(mode, s);
  };

  const pomoDots = Array.from({ length: settings.longAfter }, (_, i) => i < (completedPomos % settings.longAfter));

  const todayStats = useMemo(() => {
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(s => new Date(s.completedAt).toDateString() === today);
    return {
      sessions: todaySessions.length,
      minutes: todaySessions.reduce((sum, s) => sum + s.duration, 0),
    };
  }, [sessions]);

  // Update page title
  useEffect(() => {
    document.title = running ? `${formatDuration(timeLeft)} — ${MODE_LABELS[mode]}` : "Pomodoro Timer";
  }, [timeLeft, running, mode]);

  return (
    <div className="app" style={{ "--mode-color": color } as React.CSSProperties}>
      <header className="header">
        <div className="header-inner">
          <span className="header-day">Day 55</span>
          <h1 className="header-title">Pomodoro Timer</h1>
          <button className="settings-btn" onClick={() => setShowSettings(true)}>⚙ Settings</button>
        </div>
      </header>

      <main className="main">
        <div className="layout">
          <div className="center-col">

            {/* Mode tabs */}
            <div className="mode-tabs">
              {(["work","short","long"] as Mode[]).map(m => (
                <button key={m} className={`mode-tab ${mode === m ? "active" : ""}`}
                  style={mode === m ? { borderColor: MODE_COLORS[m], color: MODE_COLORS[m] } : {}}
                  onClick={() => switchMode(m)}>
                  {MODE_LABELS[m]}
                </button>
              ))}
            </div>

            {/* Ring + timer */}
            <div className="timer-wrap">
              <RingProgress pct={pct} color={color} size={280} stroke={12} />
              <div className="timer-center">
                <div className="timer-display">{formatDuration(timeLeft)}</div>
                <div className="timer-mode" style={{ color }}>{MODE_LABELS[mode]}</div>
              </div>
            </div>

            {/* Pomo dots */}
            <div className="pomo-dots">
              {pomoDots.map((filled, i) => (
                <div key={i} className={`pomo-dot ${filled ? "filled" : ""}`}
                  style={filled ? { background: color } : {}} />
              ))}
              <span className="pomo-count">{completedPomos} completed today</span>
            </div>

            {/* Task */}
            <TaskInput task={task} onChange={setTask} />

            {/* Controls */}
            <div className="controls">
              <button className="ctrl-btn secondary" onClick={reset}>↺</button>
              {!running ? (
                <button className="ctrl-btn primary" style={{ background: color }} onClick={start}>Start</button>
              ) : (
                <button className="ctrl-btn primary" style={{ background: color }} onClick={pause}>Pause</button>
              )}
              <button className="ctrl-btn secondary" onClick={() => switchMode(mode === "work" ? "short" : "work")}>⏭</button>
            </div>
          </div>

          {/* Right — stats + history */}
          <div className="right-col">

            {/* Today stats */}
            <div className="stats-card">
              <h3 className="card-title">Today</h3>
              <div className="stats-grid">
                <div className="stat"><span className="stat-v">{todayStats.sessions}</span><span className="stat-l">Sessions</span></div>
                <div className="stat"><span className="stat-v">{todayStats.minutes}</span><span className="stat-l">Minutes</span></div>
                <div className="stat"><span className="stat-v">{Math.floor(todayStats.minutes / 60)}h {todayStats.minutes % 60}m</span><span className="stat-l">Focus time</span></div>
                <div className="stat"><span className="stat-v">{completedPomos}</span><span className="stat-l">Pomodoros</span></div>
              </div>
            </div>

            {/* Session history */}
            <div className="history-card">
              <h3 className="card-title">Session Log</h3>
              {sessions.length === 0 ? (
                <p className="empty-note">No sessions yet. Start your first Pomodoro!</p>
              ) : (
                <div className="session-list">
                  {sessions.map(s => (
                    <div key={s.id} className="session-row">
                      <div className="session-dot" style={{ background: MODE_COLORS[s.mode] }} />
                      <div className="session-info">
                        <span className="session-task">{s.task}</span>
                        <span className="session-meta">{s.duration}min · {formatTime(s.completedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="tips-card">
              <h3 className="card-title">Pomodoro Technique</h3>
              <ol className="tips-list">
                <li>Choose a task to work on</li>
                <li>Work for 25 minutes (one Pomodoro)</li>
                <li>Take a 5-minute short break</li>
                <li>After 4 Pomodoros, take a long break</li>
                <li>Repeat until the task is done</li>
              </ol>
            </div>
          </div>
        </div>
      </main>

      {showSettings && (
        <SettingsPanel settings={settings} onChange={applySettings} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default App;