import React, { useState, useEffect } from "react";

/* ── Types ── */
interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  completedDates: string[]; /* ISO date strings "YYYY-MM-DD" */
  createdAt: string;
}

/* ── Constants ── */
const COLORS = [
  "#e85d3a", "#f0a500", "#22c97a", "#3b82f6",
  "#a855f7", "#ec4899", "#14b8a6", "#f97316",
];

const EMOJIS = ["💪", "📚", "🏃", "💧", "🧘", "✍️", "🎯", "🍎", "😴", "🎸", "🧹", "💊"];

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DEFAULT_HABITS: Habit[] = [
  { id: "h1", name: "Code for 1 hour", emoji: "💻", color: "#3b82f6", completedDates: [], createdAt: today() },
  { id: "h2", name: "Read 20 pages", emoji: "📚", color: "#a855f7", completedDates: [], createdAt: today() },
  { id: "h3", name: "Morning run", emoji: "🏃", color: "#22c97a", completedDates: [], createdAt: today() },
  { id: "h4", name: "Drink 2L water", emoji: "💧", color: "#14b8a6", completedDates: [], createdAt: today() },
];

/* ── Date helpers ── */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getPast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return formatDate(d);
  });
}

function getPast28Days(): string[] {
  return Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    return formatDate(d);
  });
}

function getStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;
  const sorted = [...completedDates].sort().reverse();
  const todayStr = today();
  /* streak counts today or yesterday as the start */
  let streak = 0;
  let cursor = new Date();
  /* if today not done, check from yesterday */
  if (!completedDates.includes(todayStr)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (true) {
    const dateStr = formatDate(cursor);
    if (sorted.includes(dateStr)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function getLongestStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;
  const sorted = [...completedDates].sort();
  let max = 1, cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) { cur++; max = Math.max(max, cur); }
    else { cur = 1; }
  }
  return max;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/* ── Load / Save ── */
function loadHabits(): Habit[] {
  try {
    const saved = localStorage.getItem("habits-v1");
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_HABITS;
}

function saveHabits(habits: Habit[]) {
  localStorage.setItem("habits-v1", JSON.stringify(habits));
}

/* ── Add Habit Modal ── */
interface AddModalProps {
  onAdd: (name: string, emoji: string, color: string) => void;
  onClose: () => void;
}

function AddModal({ onAdd, onClose }: AddModalProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [color, setColor] = useState(COLORS[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), emoji, color);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>New Habit</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="add-form">
          <label className="form-label">
            Habit name
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Meditate for 10 mins"
              autoFocus
              required
            />
          </label>

          <div className="form-label">
            Icon
            <div className="emoji-grid">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`emoji-btn ${emoji === e ? "emoji-selected" : ""}`}
                  onClick={() => setEmoji(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="form-label">
            Colour
            <div className="color-row">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-dot ${color === c ? "color-selected" : ""}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-add">Add habit</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Habit Row ── */
interface HabitRowProps {
  habit: Habit;
  past7: string[];
  onToggle: (date: string) => void;
  onDelete: () => void;
}

function HabitRow({ habit, past7, onToggle, onDelete }: HabitRowProps) {
  const streak = getStreak(habit.completedDates);
  const todayDone = habit.completedDates.includes(today());

  return (
    <div className="habit-row" style={{ "--hcolor": habit.color } as React.CSSProperties}>
      <div className="habit-left">
        <span className="habit-emoji">{habit.emoji}</span>
        <div className="habit-info">
          <span className="habit-name">{habit.name}</span>
          <span className="habit-streak">
            {streak > 0 ? `🔥 ${streak} day streak` : "No streak yet"}
          </span>
        </div>
      </div>

      <div className="habit-week">
        {past7.map((date) => {
          const done = habit.completedDates.includes(date);
          const isToday = date === today();
          const dayLabel = DAYS_SHORT[new Date(date + "T12:00:00").getDay()];
          return (
            <div key={date} className="day-col">
              <span className={`day-label ${isToday ? "day-label-today" : ""}`}>{dayLabel}</span>
              <button
                className={`day-dot ${done ? "day-done" : ""} ${isToday ? "day-today" : ""}`}
                onClick={() => onToggle(date)}
                title={date}
              >
                {done ? "✓" : ""}
              </button>
            </div>
          );
        })}
      </div>

      <div className="habit-right">
        {todayDone && <span className="done-chip">Done today</span>}
        <button className="delete-btn" onClick={onDelete} title="Delete habit">✕</button>
      </div>
    </div>
  );
}

/* ── Monthly Grid (28 days) ── */
interface MonthGridProps {
  habit: Habit;
  days: string[];
}

function MonthGrid({ habit, days }: MonthGridProps) {
  return (
    <div className="month-grid-wrap">
      <div className="month-grid-header">
        <span className="month-grid-name">{habit.emoji} {habit.name}</span>
        <span className="month-grid-stats">
          {habit.completedDates.filter((d) => days.includes(d)).length} / {days.length} days
          &nbsp;·&nbsp; longest streak: {getLongestStreak(habit.completedDates)}
        </span>
      </div>
      <div className="month-grid">
        {days.map((date) => {
          const done = habit.completedDates.includes(date);
          const isToday = date === today();
          return (
            <div
              key={date}
              className={`grid-cell ${done ? "grid-done" : ""} ${isToday ? "grid-today" : ""}`}
              style={{ "--hcolor": habit.color } as React.CSSProperties}
              title={date}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ── Main App ── */
export default function App() {
  const [habits, setHabits] = useState<Habit[]>(loadHabits);
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState<"today" | "grid">("today");

  const past7 = getPast7Days();
  const past28 = getPast28Days();

  useEffect(() => saveHabits(habits), [habits]);

  /* Toggle a date for a habit */
  function toggleDate(habitId: string, date: string) {
    setHabits((hs) =>
      hs.map((h) => {
        if (h.id !== habitId) return h;
        const already = h.completedDates.includes(date);
        return {
          ...h,
          completedDates: already
            ? h.completedDates.filter((d) => d !== date)
            : [...h.completedDates, date],
        };
      })
    );
  }

  /* Add habit */
  function addHabit(name: string, emoji: string, color: string) {
    const h: Habit = {
      id: uid(),
      name,
      emoji,
      color,
      completedDates: [],
      createdAt: today(),
    };
    setHabits((hs) => [...hs, h]);
    setShowAdd(false);
  }

  /* Delete habit */
  function deleteHabit(id: string) {
    if (!confirm("Delete this habit?")) return;
    setHabits((hs) => hs.filter((h) => h.id !== id));
  }

  /* Summary stats */
  const totalToday = habits.filter((h) => h.completedDates.includes(today())).length;
  const totalHabits = habits.length;
  const completionPct = totalHabits > 0 ? Math.round((totalToday / totalHabits) * 100) : 0;
  const bestStreak = habits.reduce((max, h) => Math.max(max, getStreak(h.completedDates)), 0);

  /* Date display */
  const todayDisplay = new Date().toLocaleDateString("en-NG", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1 className="logo">Streaks</h1>
          <span className="today-label">{todayDisplay}</span>
        </div>
        <div className="header-right">
          <div className="view-toggle">
            <button
              className={`view-btn ${view === "today" ? "active" : ""}`}
              onClick={() => setView("today")}
            >
              Today
            </button>
            <button
              className={`view-btn ${view === "grid" ? "active" : ""}`}
              onClick={() => setView("grid")}
            >
              Grid
            </button>
          </div>
          <button className="add-btn" onClick={() => setShowAdd(true)}>+ Add habit</button>
        </div>
      </header>

      {/* Summary bar */}
      <div className="summary-bar">
        <div className="summary-item">
          <span className="summary-num">{totalToday}/{totalHabits}</span>
          <span className="summary-label">Done today</span>
        </div>
        <div className="summary-progress-wrap">
          <div className="summary-track">
            <div className="summary-fill" style={{ width: `${completionPct}%` }} />
          </div>
          <span className="summary-pct">{completionPct}%</span>
        </div>
        <div className="summary-item">
          <span className="summary-num">🔥 {bestStreak}</span>
          <span className="summary-label">Best streak</span>
        </div>
      </div>

      {/* Main content */}
      <main className="main">
        {habits.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">No habits yet</p>
            <p className="empty-sub">Click "+ Add habit" to start tracking</p>
          </div>
        ) : view === "today" ? (
          <div className="habits-list">
            {habits.map((habit) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                past7={past7}
                onToggle={(date) => toggleDate(habit.id, date)}
                onDelete={() => deleteHabit(habit.id)}
              />
            ))}
          </div>
        ) : (
          <div className="grid-view">
            {habits.map((habit) => (
              <MonthGrid key={habit.id} habit={habit} days={past28} />
            ))}
          </div>
        )}
      </main>

      {/* Status bar */}
      <footer className="statusbar">
        <span>Day 59 · 300 Days of Code · Lagos, Nigeria 🇳🇬</span>
        <span>Click any day dot to toggle · Switch to Grid for 28-day view</span>
      </footer>

      {showAdd && (
        <AddModal onAdd={addHabit} onClose={() => setShowAdd(false)} />
      )}
    </div>
  );
}