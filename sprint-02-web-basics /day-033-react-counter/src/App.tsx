import React, { useState, useReducer, useCallback, useEffect, useRef } from "react";
import "./App.css";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CounterState {
  count: number;
  history: number[];
  step: number;
}

type CounterAction =
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "RESET" }
  | { type: "SET_STEP"; payload: number }
  | { type: "UNDO" }
  | { type: "SET"; payload: number };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case "INCREMENT":
      return {
        ...state,
        count: state.count + state.step,
        history: [...state.history, state.count],
      };
    case "DECREMENT":
      return {
        ...state,
        count: state.count - state.step,
        history: [...state.history, state.count],
      };
    case "RESET":
      return { ...state, count: 0, history: [...state.history, state.count] };
    case "SET_STEP":
      return { ...state, step: action.payload };
    case "UNDO":
      if (state.history.length === 0) return state;
      return {
        ...state,
        count: state.history[state.history.length - 1],
        history: state.history.slice(0, -1),
      };
    case "SET":
      return {
        ...state,
        count: action.payload,
        history: [...state.history, state.count],
      };
    default:
      return state;
  }
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useLocalStorage(key: string, initial: number): [number, (v: number) => void] {
  const [value, setValue] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });

  const setAndStore = useCallback(
    (v: number) => {
      setValue(v);
      localStorage.setItem(key, JSON.stringify(v));
    },
    [key]
  );

  return [value, setAndStore];
}

// ─── Components ───────────────────────────────────────────────────────────────

const CountDisplay: React.FC<{ count: number }> = ({ count }) => {
  const isPositive = count > 0;
  const isNegative = count < 0;

  return (
    <div className={`count-display ${isPositive ? "positive" : isNegative ? "negative" : "zero"}`}>
      <span className="count-number">{count}</span>
      <span className="count-label">
        {isPositive ? "positive" : isNegative ? "negative" : "zero"}
      </span>
    </div>
  );
};

const StepSelector: React.FC<{
  step: number;
  onChange: (s: number) => void;
}> = ({ step, onChange }) => {
  const steps = [1, 5, 10, 25, 100];
  return (
    <div className="step-selector">
      <span className="step-label">Step</span>
      <div className="step-buttons">
        {steps.map((s) => (
          <button
            key={s}
            className={`step-btn ${step === s ? "active" : ""}`}
            onClick={() => onChange(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

const HistoryPanel: React.FC<{ history: number[]; current: number }> = ({
  history,
  current,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [history]);

  const all = [...history, current];

  return (
    <div className="history-panel">
      <h3 className="history-title">History</h3>
      <div className="history-list" ref={ref}>
        {all.length === 1 && history.length === 0 ? (
          <span className="history-empty">No changes yet</span>
        ) : (
          all.map((v, i) => (
            <div
              key={i}
              className={`history-item ${i === all.length - 1 ? "current" : ""}`}
            >
              <span className="history-index">#{i + 1}</span>
              <span className="history-value">{v}</span>
              {i === all.length - 1 && (
                <span className="history-badge">current</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ─── App ─────────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  const [savedCount, setSavedCount] = useLocalStorage("day33-counter", 0);

  const [state, dispatch] = useReducer(counterReducer, {
    count: savedCount,
    history: [],
    step: 1,
  });

  const [inputVal, setInputVal] = useState("");

  // Persist count to localStorage whenever it changes
  useEffect(() => {
    setSavedCount(state.count);
  }, [state.count, setSavedCount]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") dispatch({ type: "INCREMENT" });
      if (e.key === "ArrowDown") dispatch({ type: "DECREMENT" });
      if (e.key === "r") dispatch({ type: "RESET" });
      if (e.key === "z" && (e.metaKey || e.ctrlKey)) dispatch({ type: "UNDO" });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSetValue = () => {
    const parsed = parseInt(inputVal, 10);
    if (!isNaN(parsed)) {
      dispatch({ type: "SET", payload: parsed });
      setInputVal("");
    }
  };

  const progress = Math.min(Math.abs(state.count) / 100, 1);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <span className="header-day">Day 33</span>
          <h1 className="header-title">Counter with Hooks</h1>
          <span className="header-sprint">Sprint 2 — Web Basics</span>
        </div>
      </header>

      <main className="main">
        <div className="counter-layout">

          {/* Left — Counter */}
          <div className="counter-panel">

            {/* Display */}
            <CountDisplay count={state.count} />

            {/* Progress bar */}
            <div className="progress-wrap">
              <div className="progress-track">
                <div
                  className={`progress-fill ${state.count >= 0 ? "pos" : "neg"}`}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <span className="progress-label">{Math.round(progress * 100)}% of 100</span>
            </div>

            {/* Step Selector */}
            <StepSelector
              step={state.step}
              onChange={(s) => dispatch({ type: "SET_STEP", payload: s })}
            />

            {/* Main Controls */}
            <div className="controls">
              <button
                className="ctrl-btn decrement"
                onClick={() => dispatch({ type: "DECREMENT" })}
                title="Arrow Down"
              >
                − {state.step}
              </button>
              <button
                className="ctrl-btn reset"
                onClick={() => dispatch({ type: "RESET" })}
                title="R"
              >
                Reset
              </button>
              <button
                className="ctrl-btn increment"
                onClick={() => dispatch({ type: "INCREMENT" })}
                title="Arrow Up"
              >
                + {state.step}
              </button>
            </div>

            {/* Secondary Controls */}
            <div className="secondary-controls">
              <button
                className="sec-btn"
                onClick={() => dispatch({ type: "UNDO" })}
                disabled={state.history.length === 0}
                title="Ctrl+Z"
              >
                Undo
              </button>
            </div>

            {/* Set Value */}
            <div className="set-value">
              <input
                type="number"
                className="set-input"
                placeholder="Set any value..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSetValue()}
              />
              <button className="set-btn" onClick={handleSetValue}>
                Set
              </button>
            </div>

            {/* Keyboard shortcuts */}
            <div className="shortcuts">
              <span className="shortcut-title">Keyboard Shortcuts</span>
              <div className="shortcut-list">
                <span><kbd>↑</kbd> Increment</span>
                <span><kbd>↓</kbd> Decrement</span>
                <span><kbd>R</kbd> Reset</span>
                <span><kbd>Ctrl+Z</kbd> Undo</span>
              </div>
            </div>
          </div>

          {/* Right — History + Stats */}
          <div className="side-panel">
            <HistoryPanel history={state.history} current={state.count} />

            <div className="stats-panel">
              <h3 className="stats-title">Stats</h3>
              <div className="stats-grid">
                <div className="stat">
                  <span className="stat-value">{state.history.length}</span>
                  <span className="stat-label">Total Changes</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{state.step}</span>
                  <span className="stat-label">Current Step</span>
                </div>
                <div className="stat">
                  <span className="stat-value">
                    {state.history.length > 0 ? Math.max(...state.history, state.count) : state.count}
                  </span>
                  <span className="stat-label">Highest</span>
                </div>
                <div className="stat">
                  <span className="stat-value">
                    {state.history.length > 0 ? Math.min(...state.history, state.count) : state.count}
                  </span>
                  <span className="stat-label">Lowest</span>
                </div>
              </div>
            </div>

            <div className="persist-note">
              Count is saved to localStorage — refreshing the page keeps your value.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
