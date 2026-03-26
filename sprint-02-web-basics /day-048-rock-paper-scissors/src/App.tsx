import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

// Types
type Choice = "rock" | "paper" | "scissors";
type Result = "win" | "lose" | "draw";
type Mode = "human" | "best-of-3" | "best-of-5";

interface Round {
  player: Choice;
  computer: Choice;
  result: Result;
}

// Constants
const CHOICES: Choice[] = ["rock", "paper", "scissors"];

const EMOJIS: Record<Choice, string> = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
};

const BEATS: Record<Choice, Choice> = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

const TAUNTS: Record<Result, string[]> = {
  win: ["Nice one!", "You got lucky!", "Beginner's luck?", "Well played!", "Okay okay..."],
  lose: ["Ha! Too easy.", "Better luck next time.", "The computer never loses!", "Predictable!", "Try again!"],
  draw: ["Great minds think alike.", "Same wavelength!", "Are you copying me?", "Jinx!", "It's a draw!"],
};

// Helpers
function getResult(player: Choice, computer: Choice): Result {
  if (player === computer) return "draw";
  return BEATS[player] === computer ? "win" : "lose";
}

function randomChoice(): Choice {
  return CHOICES[Math.floor(Math.random() * 3)];
}

function randomTaunt(result: Result): string {
  const arr = TAUNTS[result];
  return arr[Math.floor(Math.random() * arr.length)];
}

// Animated choice display
const ChoiceDisplay: React.FC<{ choice: Choice | null; label: string; revealing: boolean }> = ({ choice, label, revealing }) => (
  <div className="choice-display">
    <span className="cd-label">{label}</span>
    <div className={`cd-emoji ${revealing ? "revealing" : ""} ${choice ? "shown" : "waiting"}`}>
      {revealing ? "❓" : choice ? EMOJIS[choice] : "❓"}
    </div>
    <span className="cd-name">{choice && !revealing ? choice : "—"}</span>
  </div>
);

// Score board
const ScoreBoard: React.FC<{ wins: number; losses: number; draws: number; streak: number }> = ({ wins, losses, draws, streak }) => (
  <div className="scoreboard">
    <div className="score-item">
      <span className="score-val win-val">{wins}</span>
      <span className="score-lbl">Wins</span>
    </div>
    <div className="score-item">
      <span className="score-val draw-val">{draws}</span>
      <span className="score-lbl">Draws</span>
    </div>
    <div className="score-item">
      <span className="score-val loss-val">{losses}</span>
      <span className="score-lbl">Losses</span>
    </div>
    {streak > 1 && (
      <div className="score-item streak-item">
        <span className="score-val streak-val">🔥 {streak}</span>
        <span className="score-lbl">Streak</span>
      </div>
    )}
  </div>
);

// App
const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>("human");
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [taunt, setTaunt] = useState("");
  const [revealing, setRevealing] = useState(false);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [draws, setDraws] = useState(0);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState<Round[]>([]);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [seriesWins, setSeriesWins] = useState({ player: 0, computer: 0 });
  const [seriesDone, setSeriesDone] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const target = mode === "best-of-3" ? 2 : mode === "best-of-5" ? 3 : null;

  const resetSeries = useCallback(() => {
    setSeriesWins({ player: 0, computer: 0 });
    setSeriesDone(false);
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setTaunt("");
    setRoundsPlayed(0);
  }, []);

  const play = useCallback((choice: Choice) => {
    if (revealing || seriesDone) return;

    setPlayerChoice(choice);
    setRevealing(true);
    setResult(null);
    setTaunt("");

    // Reveal after 600ms
    setTimeout(() => {
      const comp = randomChoice();
      const res = getResult(choice, comp);

      setComputerChoice(comp);
      setRevealing(false);
      setResult(res);
      setTaunt(randomTaunt(res));
      setRoundsPlayed((r) => r + 1);

      // Update totals
      if (res === "win") {
        setWins((w) => w + 1);
        setStreak((s) => s + 1);
        setSeriesWins((sw) => ({ ...sw, player: sw.player + 1 }));
      } else if (res === "lose") {
        setLosses((l) => l + 1);
        setStreak(0);
        setSeriesWins((sw) => ({ ...sw, computer: sw.computer + 1 }));
      } else {
        setDraws((d) => d + 1);
      }

      setHistory((prev) => [{ player: choice, computer: comp, result: res }, ...prev].slice(0, 15));
    }, 600);
  }, [revealing, seriesDone]);

  // Check series completion
  useEffect(() => {
    if (!target) return;
    if (seriesWins.player >= target || seriesWins.computer >= target) {
      setSeriesDone(true);
    }
  }, [seriesWins, target]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "1") play("rock");
      if (e.key === "2") play("paper");
      if (e.key === "3") play("scissors");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [play]);

  const total = wins + losses + draws;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const seriesLeader = seriesWins.player > seriesWins.computer ? "You lead" : seriesWins.computer > seriesWins.player ? "CPU leads" : "Tied";

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="header-day">Day 48</span>
          <h1 className="header-title">Rock Paper Scissors</h1>
          <span className="header-sprint">Sprint 2 — Web Basics</span>
        </div>
      </header>

      <main className="main">
        <div className="layout">

          {/* Left — Game */}
          <div className="left-col">

            {/* Mode selector */}
            <div className="mode-row">
              {(["human", "best-of-3", "best-of-5"] as Mode[]).map((m) => (
                <button key={m} className={`mode-btn ${mode === m ? "active" : ""}`}
                  onClick={() => { setMode(m); resetSeries(); }}>
                  {m === "human" ? "Free Play" : m === "best-of-3" ? "Best of 3" : "Best of 5"}
                </button>
              ))}
            </div>

            {/* Series progress */}
            {mode !== "human" && (
              <div className="series-bar">
                <div className="series-side">
                  <span className="series-label">You</span>
                  <div className="series-dots">
                    {Array.from({ length: target! }).map((_, i) => (
                      <div key={i} className={`series-dot ${i < seriesWins.player ? "dot-win" : ""}`} />
                    ))}
                  </div>
                </div>
                <span className="series-leader">{seriesLeader}</span>
                <div className="series-side series-right">
                  <div className="series-dots">
                    {Array.from({ length: target! }).map((_, i) => (
                      <div key={i} className={`series-dot ${i < seriesWins.computer ? "dot-loss" : ""}`} />
                    ))}
                  </div>
                  <span className="series-label">CPU</span>
                </div>
              </div>
            )}

            {/* Arena */}
            <div className={`arena ${result ? `arena-${result}` : ""}`}>
              <ChoiceDisplay choice={playerChoice} label="You" revealing={false} />
              <div className="vs-col">
                {result ? (
                  <>
                    <span className={`result-badge badge-${result}`}>
                      {result === "win" ? "YOU WIN" : result === "lose" ? "YOU LOSE" : "DRAW"}
                    </span>
                    <span className="taunt">{taunt}</span>
                  </>
                ) : (
                  <span className="vs-text">VS</span>
                )}
              </div>
              <ChoiceDisplay choice={computerChoice} label="CPU" revealing={revealing} />
            </div>

            {/* Choices */}
            {!seriesDone ? (
              <div className="choices-row">
                {CHOICES.map((c, i) => (
                  <button key={c} className={`choice-btn ${playerChoice === c && result ? "chosen" : ""} ${revealing ? "disabled" : ""}`}
                    onClick={() => play(c)} disabled={revealing}>
                    <span className="choice-emoji">{EMOJIS[c]}</span>
                    <span className="choice-name">{c}</span>
                    <span className="choice-key">{i + 1}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="series-result">
                <p className="series-winner">
                  {seriesWins.player > seriesWins.computer ? "🎉 You won the series!" : "💻 CPU won the series!"}
                </p>
                <p className="series-score">{seriesWins.player} — {seriesWins.computer}</p>
                <button className="rematch-btn" onClick={resetSeries}>Play Again</button>
              </div>
            )}

            {/* Shortcuts hint */}
            <div className="shortcuts">
              <kbd>1</kbd> Rock &nbsp; <kbd>2</kbd> Paper &nbsp; <kbd>3</kbd> Scissors
            </div>
          </div>

          {/* Right — Stats + History */}
          <div className="right-col">
            <ScoreBoard wins={wins} losses={losses} draws={draws} streak={streak} />

            <div className="stats-card">
              <h3 className="card-title">Stats</h3>
              <div className="stat-rows">
                <div className="stat-row"><span>Total Rounds</span><span className="stat-r-val">{total}</span></div>
                <div className="stat-row"><span>Win Rate</span><span className="stat-r-val">{winRate}%</span></div>
                <div className="stat-row"><span>Best Streak</span><span className="stat-r-val">{streak > 0 ? `🔥 ${streak}` : "—"}</span></div>
                <div className="stat-row">
                  <span>Fav Choice</span>
                  <span className="stat-r-val">
                    {history.length > 0
                      ? (() => {
                          const counts = { rock: 0, paper: 0, scissors: 0 };
                          history.forEach((r) => counts[r.player]++);
                          const fav = (Object.keys(counts) as Choice[]).reduce((a, b) => counts[a] >= counts[b] ? a : b);
                          return `${EMOJIS[fav]} ${fav}`;
                        })()
                      : "—"}
                  </span>
                </div>
              </div>

              {total > 0 && (
                <div className="win-bar-wrap">
                  <div className="win-bar">
                    <div className="win-seg seg-win" style={{ width: `${(wins / total) * 100}%` }} />
                    <div className="win-seg seg-draw" style={{ width: `${(draws / total) * 100}%` }} />
                    <div className="win-seg seg-loss" style={{ width: `${(losses / total) * 100}%` }} />
                  </div>
                  <div className="win-bar-labels">
                    <span className="wbl-win">W {wins}</span>
                    <span className="wbl-draw">D {draws}</span>
                    <span className="wbl-loss">L {losses}</span>
                  </div>
                </div>
              )}

              {total > 0 && (
                <button className="reset-btn" onClick={() => { setWins(0); setLosses(0); setDraws(0); setStreak(0); setHistory([]); setPlayerChoice(null); setComputerChoice(null); setResult(null); resetSeries(); }}>
                  Reset All
                </button>
              )}
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="history-card">
                <h3 className="card-title">Round History</h3>
                <div className="history-list">
                  {history.map((r, i) => (
                    <div key={i} className={`history-row hr-${r.result}`}>
                      <span className="hr-icon">{EMOJIS[r.player]}</span>
                      <span className="hr-vs">vs</span>
                      <span className="hr-icon">{EMOJIS[r.computer]}</span>
                      <span className={`hr-result hr-${r.result}`}>
                        {r.result === "win" ? "W" : r.result === "lose" ? "L" : "D"}
                      </span>
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