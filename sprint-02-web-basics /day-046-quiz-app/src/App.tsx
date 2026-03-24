import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./App.css";

// Types
type Category = "all" | "tech" | "science" | "nigeria" | "general";
type Difficulty = "all" | "easy" | "medium" | "hard";

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: number;
  category: "tech" | "science" | "nigeria" | "general";
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
}

interface Result {
  questionId: number;
  selected: number;
  correct: boolean;
  timeMs: number;
}

// Questions
const ALL_QUESTIONS: Question[] = [
  { id: 1, question: "What does HTML stand for?", options: ["HyperText Markup Language", "HighText Machine Language", "HyperText and Links", "Hyper Transfer Markup Language"], answer: 0, category: "tech", difficulty: "easy", explanation: "HTML stands for HyperText Markup Language — the standard language for building web pages." },
  { id: 2, question: "Which company created TypeScript?", options: ["Google", "Facebook", "Microsoft", "Apple"], answer: 2, category: "tech", difficulty: "easy", explanation: "TypeScript was created by Microsoft and first released in 2012." },
  { id: 3, question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], answer: 1, category: "tech", difficulty: "medium", explanation: "Binary search halves the search space on each step, giving O(log n) time complexity." },
  { id: 4, question: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Syntax", "Coded Style System"], answer: 1, category: "tech", difficulty: "easy", explanation: "CSS stands for Cascading Style Sheets — used to style HTML documents." },
  { id: 5, question: "Which hook replaces componentDidMount in React?", options: ["useState", "useRef", "useEffect", "useReducer"], answer: 2, category: "tech", difficulty: "medium", explanation: "useEffect with an empty dependency array runs once after mount, replacing componentDidMount." },
  { id: 6, question: "What does REST stand for?", options: ["Remote Execution State Transfer", "Representational State Transfer", "Real-time Event Streaming Technology", "Rapid Endpoint Service Tool"], answer: 1, category: "tech", difficulty: "medium", explanation: "REST stands for Representational State Transfer — an architectural style for APIs." },
  { id: 7, question: "What is the capital of Nigeria?", options: ["Lagos", "Kano", "Abuja", "Ibadan"], answer: 2, category: "nigeria", difficulty: "easy", explanation: "Abuja has been Nigeria's capital since 1991, replacing Lagos." },
  { id: 8, question: "In what year did Nigeria gain independence?", options: ["1957", "1963", "1960", "1955"], answer: 2, category: "nigeria", difficulty: "easy", explanation: "Nigeria gained independence from Britain on October 1, 1960." },
  { id: 9, question: "What is the largest city by population in Nigeria?", options: ["Abuja", "Kano", "Ibadan", "Lagos"], answer: 3, category: "nigeria", difficulty: "easy", explanation: "Lagos is the largest city in Nigeria and one of the largest in Africa." },
  { id: 10, question: "What is Nigeria's national currency?", options: ["Cedi", "Naira", "Franc", "Shilling"], answer: 1, category: "nigeria", difficulty: "easy", explanation: "The Nigerian Naira (₦) has been the official currency since 1973." },
  { id: 11, question: "How many states does Nigeria have?", options: ["30", "34", "36", "40"], answer: 2, category: "nigeria", difficulty: "medium", explanation: "Nigeria has 36 states plus the Federal Capital Territory (Abuja)." },
  { id: 12, question: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], answer: 2, category: "science", difficulty: "easy", explanation: "Au comes from the Latin word 'Aurum', the original name for gold." },
  { id: 13, question: "How many bones are in the adult human body?", options: ["196", "206", "216", "226"], answer: 1, category: "science", difficulty: "medium", explanation: "The adult human body has 206 bones. Babies have around 270–300 which fuse over time." },
  { id: 14, question: "What planet is closest to the Sun?", options: ["Venus", "Earth", "Mars", "Mercury"], answer: 3, category: "science", difficulty: "easy", explanation: "Mercury is the closest planet to the Sun and the smallest in our solar system." },
  { id: 15, question: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], answer: 2, category: "science", difficulty: "easy", explanation: "The mitochondria produces ATP energy for the cell through cellular respiration." },
  { id: 16, question: "What is the speed of light in a vacuum (approx)?", options: ["300,000 km/s", "150,000 km/s", "3,000,000 km/s", "30,000 km/s"], answer: 0, category: "science", difficulty: "medium", explanation: "Light travels at approximately 299,792 km/s in a vacuum — roughly 300,000 km/s." },
  { id: 17, question: "How many continents are there on Earth?", options: ["5", "6", "7", "8"], answer: 2, category: "general", difficulty: "easy", explanation: "There are 7 continents: Africa, Antarctica, Asia, Australia, Europe, North America, South America." },
  { id: 18, question: "What is the longest river in the world?", options: ["Amazon", "Congo", "Mississippi", "Nile"], answer: 3, category: "general", difficulty: "easy", explanation: "The Nile River in Africa is approximately 6,650 km long — the longest in the world." },
  { id: 19, question: "What year was the first iPhone released?", options: ["2005", "2006", "2007", "2008"], answer: 2, category: "general", difficulty: "medium", explanation: "The first iPhone was announced by Steve Jobs on January 9, 2007 and released June 29, 2007." },
  { id: 20, question: "Which country has the largest population?", options: ["USA", "India", "China", "Indonesia"], answer: 1, category: "general", difficulty: "easy", explanation: "India surpassed China in 2023 to become the world's most populous country." },
];

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "tech", label: "Tech" },
  { value: "science", label: "Science" },
  { value: "nigeria", label: "Nigeria" },
  { value: "general", label: "General" },
];

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "all", label: "All" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Timer component
const Timer: React.FC<{ seconds: number; max: number }> = ({ seconds, max }) => {
  const pct = (seconds / max) * 100;
  const color = seconds <= 5 ? "#ef4444" : seconds <= 10 ? "#f59e0b" : "#22c55e";
  return (
    <div className="timer-wrap">
      <div className="timer-track">
        <div className="timer-fill" style={{ width: `${pct}%`, background: color, transition: "width 1s linear, background 0.3s" }} />
      </div>
      <span className="timer-val" style={{ color }}>{seconds}s</span>
    </div>
  );
};

// App
const App: React.FC = () => {
  const [screen, setScreen] = useState<"setup" | "quiz" | "result">("setup");
  const [category, setCategory] = useState<Category>("all");
  const [difficulty, setDifficulty] = useState<Difficulty>("all");
  const [questionCount, setQuestionCount] = useState(10);
  const [timePerQ, setTimePerQ] = useState(20);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const currentQ = questions[current];
  const score = results.filter((r) => r.correct).length;

  // Timer
  useEffect(() => {
    if (screen !== "quiz" || revealed) return;
    setTimeLeft(timePerQ);
    setStartTime(Date.now());
  }, [current, screen, revealed, timePerQ]);

  useEffect(() => {
    if (screen !== "quiz" || revealed || timeLeft <= 0) return;
    if (timeLeft === 0) { handleReveal(-1); return; }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, screen, revealed]);

  const startQuiz = () => {
    let pool = ALL_QUESTIONS;
    if (category !== "all") pool = pool.filter((q) => q.category === category);
    if (difficulty !== "all") pool = pool.filter((q) => q.difficulty === difficulty);
    const picked = shuffle(pool).slice(0, Math.min(questionCount, pool.length));
    setQuestions(picked);
    setCurrent(0);
    setResults([]);
    setSelected(null);
    setRevealed(false);
    setScreen("quiz");
  };

  const handleReveal = useCallback((sel: number) => {
    if (revealed) return;
    setSelected(sel);
    setRevealed(true);
  }, [revealed]);

  const handleSelect = (idx: number) => {
    if (revealed) return;
    handleReveal(idx);
  };

  useEffect(() => {
    if (!revealed || !currentQ) return;
    const elapsed = Date.now() - startTime;
    const result: Result = {
      questionId: currentQ.id,
      selected: selected ?? -1,
      correct: selected === currentQ.answer,
      timeMs: elapsed,
    };
    setResults((prev) => [...prev, result]);
  }, [revealed]);

  const nextQuestion = () => {
    if (current + 1 >= questions.length) {
      setScreen("result");
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  const getOptionClass = (idx: number) => {
    if (!revealed) return selected === idx ? "option selected" : "option";
    if (idx === currentQ.answer) return "option correct";
    if (idx === selected && selected !== currentQ.answer) return "option wrong";
    return "option dimmed";
  };

  const pct = questions.length > 0 ? Math.round(((current + (revealed ? 1 : 0)) / questions.length) * 100) : 0;
  const avgTime = results.length > 0 ? Math.round(results.reduce((a, r) => a + r.timeMs, 0) / results.length / 1000) : 0;

  // Setup screen
  if (screen === "setup") {
    const availableCount = ALL_QUESTIONS.filter((q) =>
      (category === "all" || q.category === category) &&
      (difficulty === "all" || q.difficulty === difficulty)
    ).length;

    return (
      <div className="app">
        <header className="header">
          <div className="header-inner">
            <span className="header-day">Day 46</span>
            <h1 className="header-title">Quiz App</h1>
            <span className="header-sprint">Sprint 2 — Web Basics</span>
          </div>
        </header>
        <main className="main setup-main">
          <div className="setup-card">
            <h2 className="setup-title">Configure Your Quiz</h2>

            <div className="setup-section">
              <label className="setup-label">Category</label>
              <div className="pill-row">
                {CATEGORIES.map((c) => (
                  <button key={c.value} className={`pill ${category === c.value ? "active" : ""}`} onClick={() => setCategory(c.value)}>{c.label}</button>
                ))}
              </div>
            </div>

            <div className="setup-section">
              <label className="setup-label">Difficulty</label>
              <div className="pill-row">
                {DIFFICULTIES.map((d) => (
                  <button key={d.value} className={`pill ${difficulty === d.value ? "active" : ""}`} onClick={() => setDifficulty(d.value)}>{d.label}</button>
                ))}
              </div>
            </div>

            <div className="setup-section">
              <label className="setup-label">Questions: {Math.min(questionCount, availableCount)} / {availableCount} available</label>
              <input type="range" min={3} max={Math.max(availableCount, 3)} value={Math.min(questionCount, availableCount)}
                onChange={(e) => setQuestionCount(Number(e.target.value))} />
            </div>

            <div className="setup-section">
              <label className="setup-label">Time per question: {timePerQ}s</label>
              <input type="range" min={5} max={60} step={5} value={timePerQ}
                onChange={(e) => setTimePerQ(Number(e.target.value))} />
            </div>

            <button className="start-btn" onClick={startQuiz} disabled={availableCount === 0}>
              {availableCount === 0 ? "No questions available" : `Start Quiz (${Math.min(questionCount, availableCount)} questions)`}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Result screen
  if (screen === "result") {
    const pctScore = Math.round((score / questions.length) * 100);
    const grade = pctScore >= 90 ? "A" : pctScore >= 75 ? "B" : pctScore >= 60 ? "C" : pctScore >= 40 ? "D" : "F";
    const gradeColor = pctScore >= 75 ? "#22c55e" : pctScore >= 60 ? "#f59e0b" : "#ef4444";

    return (
      <div className="app">
        <header className="header">
          <div className="header-inner">
            <span className="header-day">Day 46</span>
            <h1 className="header-title">Quiz App</h1>
            <span className="header-sprint">Sprint 2 — Web Basics</span>
          </div>
        </header>
        <main className="main result-main">
          <div className="result-card">
            <div className="grade-circle" style={{ borderColor: gradeColor, color: gradeColor }}>{grade}</div>
            <h2 className="result-title">{pctScore >= 75 ? "Great work!" : pctScore >= 50 ? "Not bad!" : "Keep practising!"}</h2>
            <div className="result-stats">
              <div className="r-stat"><span className="r-val">{score}/{questions.length}</span><span className="r-lbl">Correct</span></div>
              <div className="r-stat"><span className="r-val">{pctScore}%</span><span className="r-lbl">Score</span></div>
              <div className="r-stat"><span className="r-val">{avgTime}s</span><span className="r-lbl">Avg Time</span></div>
            </div>

            <div className="review-list">
              {questions.map((q, i) => {
                const r = results[i];
                return (
                  <div key={q.id} className={`review-item ${r?.correct ? "review-correct" : "review-wrong"}`}>
                    <span className="review-icon">{r?.correct ? "✓" : "✗"}</span>
                    <div className="review-body">
                      <p className="review-q">{q.question}</p>
                      <p className="review-a">
                        {!r?.correct && r?.selected !== -1 && <span className="wrong-ans">You: {q.options[r.selected]} · </span>}
                        {!r?.correct && r?.selected === -1 && <span className="wrong-ans">Timed out · </span>}
                        <span className="correct-ans">Answer: {q.options[q.answer]}</span>
                      </p>
                      <p className="review-exp">{q.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="result-actions">
              <button className="start-btn" onClick={() => setScreen("setup")}>New Quiz</button>
              <button className="retry-btn" onClick={() => { setCurrent(0); setResults([]); setSelected(null); setRevealed(false); setScreen("quiz"); }}>Retry Same</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Quiz screen
  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="header-day">Day 46</span>
          <h1 className="header-title">Quiz App</h1>
          <span className="header-sprint">Sprint 2 — Web Basics</span>
        </div>
      </header>
      <main className="main quiz-main">
        <div className="quiz-card">
          <div className="quiz-meta">
            <span className="q-counter">{current + 1} / {questions.length}</span>
            <span className={`q-badge badge-${currentQ.category}`}>{currentQ.category}</span>
            <span className={`q-badge badge-diff-${currentQ.difficulty}`}>{currentQ.difficulty}</span>
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>

          <Timer seconds={timeLeft} max={timePerQ} />

          <p className="question-text">{currentQ.question}</p>

          <div className="options-grid">
            {currentQ.options.map((opt, idx) => (
              <button key={idx} className={getOptionClass(idx)} onClick={() => handleSelect(idx)}>
                <span className="opt-letter">{String.fromCharCode(65 + idx)}</span>
                <span className="opt-text">{opt}</span>
              </button>
            ))}
          </div>

          {revealed && (
            <div className="explanation">
              <span className="exp-icon">{selected === currentQ.answer ? "✓" : "✗"}</span>
              <p>{currentQ.explanation}</p>
            </div>
          )}

          {revealed && (
            <button className="next-btn" onClick={nextQuestion}>
              {current + 1 >= questions.length ? "See Results" : "Next Question →"}
            </button>
          )}
        </div>

        <div className="score-sidebar">
          <div className="score-box">
            <span className="score-val">{score}</span>
            <span className="score-lbl">Correct</span>
          </div>
          <div className="score-box">
            <span className="score-val wrong-val">{results.filter((r) => !r.correct).length}</span>
            <span className="score-lbl">Wrong</span>
          </div>
          <div className="mini-results">
            {results.map((r, i) => (
              <div key={i} className={`mini-dot ${r.correct ? "mini-correct" : "mini-wrong"}`} title={`Q${i + 1}`} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;