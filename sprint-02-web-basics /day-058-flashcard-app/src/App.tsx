import React, { useState, useCallback } from "react";

/* ── Types ── */
interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface Deck {
  id: string;
  name: string;
  emoji: string;
  color: string;
  cards: Flashcard[];
}

type Screen = "home" | "study" | "result";
type Answer = "correct" | "incorrect" | null;

/* ── Decks ── */
const DECKS: Deck[] = [
  {
    id: "naija-geo",
    name: "Nigerian Geography",
    emoji: "🗺️",
    color: "#008751",
    cards: [
      { id: "ng1", question: "What is the capital city of Nigeria?", answer: "Abuja" },
      { id: "ng2", question: "Which state is known as the Centre of Excellence?", answer: "Lagos State" },
      { id: "ng3", question: "What is the longest river in Nigeria?", answer: "River Niger" },
      { id: "ng4", question: "Which Nigerian city is known as the Ancient City?", answer: "Kano" },
      { id: "ng5", question: "What is the highest mountain in Nigeria?", answer: "Chappal Waddi (2,419m) in Taraba State" },
      { id: "ng6", question: "How many states does Nigeria have?", answer: "36 states and the FCT Abuja" },
      { id: "ng7", question: "Which geopolitical zone is Port Harcourt in?", answer: "South-South (Niger Delta)" },
      { id: "ng8", question: "What body of water borders Nigeria to the south?", answer: "The Atlantic Ocean / Gulf of Guinea" },
    ],
  },
  {
    id: "react",
    name: "React Concepts",
    emoji: "⚛️",
    color: "#61dafb",
    cards: [
      { id: "r1", question: "What hook do you use to manage local component state?", answer: "useState" },
      { id: "r2", question: "What hook runs side effects after render?", answer: "useEffect" },
      { id: "r3", question: "What hook memoises a function reference?", answer: "useCallback" },
      { id: "r4", question: "What hook memoises a computed value?", answer: "useMemo" },
      { id: "r5", question: "What is the purpose of the React key prop in lists?", answer: "It helps React identify which items changed, were added, or removed during reconciliation" },
      { id: "r6", question: "What does lifting state up mean?", answer: "Moving shared state to the closest common ancestor component so multiple children can access and update it" },
      { id: "r7", question: "What is the difference between controlled and uncontrolled inputs?", answer: "Controlled inputs are driven by React state. Uncontrolled inputs manage their own state through the DOM ref" },
      { id: "r8", question: "What does the React Context API solve?", answer: "Prop drilling — it lets you pass data to deeply nested components without passing props at every level" },
    ],
  },
  {
    id: "typescript",
    name: "TypeScript",
    emoji: "📘",
    color: "#3178c6",
    cards: [
      { id: "ts1", question: "What is the difference between interface and type in TypeScript?", answer: "Both define shapes. Interfaces are extendable via declaration merging. Types can represent unions, intersections, and primitives" },
      { id: "ts2", question: "What does the keyof operator do?", answer: "Returns a union of all keys of a given type — e.g. keyof { name: string; age: number } is 'name' | 'age'" },
      { id: "ts3", question: "What is a generic in TypeScript?", answer: "A placeholder type that lets you write reusable functions and components that work with any type while staying type-safe" },
      { id: "ts4", question: "What does the Partial<T> utility type do?", answer: "Makes all properties of T optional" },
      { id: "ts5", question: "What is the never type used for?", answer: "Represents values that never occur — used in exhaustive checks and functions that always throw or never return" },
      { id: "ts6", question: "What is the difference between any and unknown?", answer: "any disables type checking entirely. unknown requires you to narrow the type before using the value" },
    ],
  },
  {
    id: "naija-history",
    name: "Nigerian History",
    emoji: "📜",
    color: "#c8963e",
    cards: [
      { id: "nh1", question: "In what year did Nigeria gain independence?", answer: "October 1, 1960" },
      { id: "nh2", question: "Who was Nigeria's first Prime Minister?", answer: "Abubakar Tafawa Balewa" },
      { id: "nh3", question: "What was Nigeria called before independence?", answer: "The Protectorate of Nigeria (Northern and Southern Protectorates merged in 1914 by Frederick Lugard)" },
      { id: "nh4", question: "In what year did Nigeria become a republic?", answer: "1963" },
      { id: "nh5", question: "What was the Nigerian Civil War also known as?", answer: "The Biafran War (1967–1970)" },
      { id: "nh6", question: "Who was the first military head of state of Nigeria?", answer: "Major General Johnson Aguiyi-Ironsi (1966)" },
      { id: "nh7", question: "In what year did Nigeria return to civilian rule after military dictatorship?", answer: "1999 — with Olusegun Obasanjo as President" },
    ],
  },
    {
    id: "geology",
    name: "Geology",
    emoji: "🪨",
    color: "#a16207",
    cards: [
      { id: "geo1", question: "What are the three main types of rocks?", answer: "Igneous, Sedimentary, and Metamorphic" },
      { id: "geo2", question: "How are igneous rocks formed?", answer: "By the cooling and solidification of magma or lava" },
      { id: "geo3", question: "What is the difference between magma and lava?", answer: "Magma is molten rock beneath the Earth's surface. Lava is magma that has reached the surface through a volcanic eruption" },
      { id: "geo4", question: "How are sedimentary rocks formed?", answer: "By the compaction and cementation of sediment (fragments of rock, minerals, or organic material) over time" },
      { id: "geo5", question: "How are metamorphic rocks formed?", answer: "When existing rocks are transformed by intense heat, pressure, or chemically active fluids without melting" },
      { id: "geo6", question: "What is an aquifer?", answer: "An underground layer of permeable rock, sediment, or soil that stores and transmits groundwater" },
      { id: "geo7", question: "What is the difference between a confined and unconfined aquifer?", answer: "An unconfined aquifer has its water table exposed to the atmosphere. A confined aquifer is trapped between two impermeable layers (aquitards) under pressure" },
      { id: "geo8", question: "What is porosity in geology?", answer: "The percentage of a rock or sediment's volume that consists of open pore spaces capable of holding fluid" },
      { id: "geo9", question: "What is permeability?", answer: "The ability of a rock or sediment to allow fluids to flow through its connected pore spaces" },
      { id: "geo10", question: "What is the rock cycle?", answer: "The continuous process by which rocks are formed, broken down, and reformed — cycling between igneous, sedimentary, and metamorphic states over geological time" },
      { id: "geo11", question: "What is the Mohs hardness scale?", answer: "A scale from 1 to 10 that measures a mineral's resistance to scratching. Talc is 1 (softest) and diamond is 10 (hardest)" },
      { id: "geo12", question: "What is the difference between a mineral and a rock?", answer: "A mineral is a naturally occurring, inorganic solid with a defined chemical composition and crystal structure. A rock is an aggregate of one or more minerals" },
      { id: "geo13", question: "What is weathering?", answer: "The breakdown of rocks at or near the Earth's surface through physical (mechanical) or chemical processes without the material being transported" },
      { id: "geo14", question: "What is erosion?", answer: "The process by which weathered rock and soil material is transported away by water, wind, ice, or gravity" },
      { id: "geo15", question: "What is a fault in geology?", answer: "A fracture or zone of fractures in the Earth's crust along which blocks of rock have moved relative to each other" },
      { id: "geo16", question: "What is the difference between a syncline and an anticline?", answer: "An anticline is a fold where rock layers arch upward. A syncline is a fold where rock layers dip downward forming a trough" },
      { id: "geo17", question: "What is stratigraphy?", answer: "The branch of geology that studies rock layers (strata) and their sequence, composition, and age to interpret Earth's history" },
      { id: "geo18", question: "What is the law of superposition?", answer: "In an undisturbed sequence of sedimentary rocks, the oldest layers are at the bottom and the youngest are at the top" },
      { id: "geo19", question: "Name three common sedimentary rocks.", answer: "Limestone, sandstone, and shale" },
      { id: "geo20", question: "What mineral is limestone primarily composed of?", answer: "Calcite (calcium carbonate, CaCO₃)" },
    ],
  },
  {
    id: "nursing",
    name: "Nursing",
    emoji: "🏥",
    color: "#e11d48",
    cards: [
      { id: "nur1", question: "What are the five rights of medication administration?", answer: "Right patient, right drug, right dose, right route, and right time" },
      { id: "nur2", question: "What is the normal resting heart rate for an adult?", answer: "60–100 beats per minute" },
      { id: "nur3", question: "What is the normal blood pressure range for a healthy adult?", answer: "Systolic 90–120 mmHg and diastolic 60–80 mmHg" },
      { id: "nur4", question: "What does the Glasgow Coma Scale measure?", answer: "Level of consciousness — it assesses eye opening, verbal response, and motor response. Scores range from 3 (deep unconsciousness) to 15 (fully alert)" },
      { id: "nur5", question: "What is tachycardia?", answer: "A resting heart rate above 100 beats per minute" },
      { id: "nur6", question: "What is the difference between systolic and diastolic blood pressure?", answer: "Systolic is the pressure when the heart contracts and pumps blood. Diastolic is the pressure when the heart is at rest between beats" },
      { id: "nur7", question: "What does NPO mean and when is it used?", answer: "NPO means Nil Per Os (nothing by mouth). It is used before surgery or procedures requiring anaesthesia to prevent aspiration" },
      { id: "nur8", question: "What is a normal adult respiratory rate?", answer: "12–20 breaths per minute" },
      { id: "nur9", question: "What is the purpose of the SBAR communication tool?", answer: "SBAR (Situation, Background, Assessment, Recommendation) is a structured framework for clear and concise handover communication between healthcare providers" },
      { id: "nur10", question: "What is the difference between antiseptic and disinfectant?", answer: "Antiseptics are applied to living tissue to reduce infection risk (e.g. skin before injection). Disinfectants are applied to non-living surfaces and instruments" },
    ],
  },

];

/* ── Shuffle helper ── */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── Score bar ── */
function ScoreBar({ correct, incorrect, total }: { correct: number; incorrect: number; total: number }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <div className="score-bar">
      <span className="score-correct">✓ {correct}</span>
      <div className="score-track">
        <div className="score-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="score-incorrect">✗ {incorrect}</span>
    </div>
  );
}

/* ── Main App ── */
export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [answered, setAnswered] = useState<Answer>(null);
  const [missedCards, setMissedCards] = useState<Flashcard[]>([]);

  const currentCard = cards[index];
  const isLast = index === cards.length - 1;

  /* Start deck */
  function startDeck(deck: Deck) {
    setActiveDeck(deck);
    setCards(shuffle(deck.cards));
    setIndex(0);
    setFlipped(false);
    setCorrect(0);
    setIncorrect(0);
    setAnswered(null);
    setMissedCards([]);
    setScreen("study");
  }

  /* Flip card */
  const flipCard = useCallback(() => {
    if (isFlipping) return;
    setIsFlipping(true);
    setFlipped((f) => !f);
    setTimeout(() => setIsFlipping(false), 400);
  }, [isFlipping]);

  /* Mark answer */
  function mark(result: "correct" | "incorrect") {
    if (answered) return;
    setAnswered(result);
    if (result === "correct") {
      setCorrect((c) => c + 1);
    } else {
      setIncorrect((i) => i + 1);
      setMissedCards((m) => [...m, currentCard]);
    }
  }

  /* Next card */
  function nextCard() {
    if (!answered) return;
    if (isLast) {
      setScreen("result");
      return;
    }
    setIndex((i) => i + 1);
    setFlipped(false);
    setAnswered(null);
  }

  /* Retry missed */
  function retryMissed() {
    setCards(shuffle(missedCards));
    setIndex(0);
    setFlipped(false);
    setCorrect(0);
    setIncorrect(0);
    setAnswered(null);
    setMissedCards([]);
    setScreen("study");
  }

  /* ── HOME ── */
  if (screen === "home") {
    return (
      <div className="app">
        <header className="header">
          <div className="logo">
            <span className="logo-icon">FC</span>
            <span>FlipCard</span>
          </div>
          <p className="header-sub">Pick a deck and start studying</p>
        </header>

        <main className="home-grid">
          {DECKS.map((deck, i) => (
            <button
              key={deck.id}
              className="deck-card"
              style={{ "--deck-color": deck.color, animationDelay: `${i * 80}ms` } as React.CSSProperties}
              onClick={() => startDeck(deck)}
            >
              <span className="deck-emoji">{deck.emoji}</span>
              <span className="deck-name">{deck.name}</span>
              <span className="deck-count">{deck.cards.length} cards</span>
              <span className="deck-arrow">→</span>
            </button>
          ))}
        </main>

        <footer className="statusbar">
          <span>Day 58 · 300 Days of Code · Lagos, Nigeria 🇳🇬</span>
          <span>{DECKS.reduce((s, d) => s + d.cards.length, 0)} cards across {DECKS.length} decks</span>
        </footer>
      </div>
    );
  }

  /* ── RESULT ── */
  if (screen === "result") {
    const total = correct + incorrect;
    const pct = Math.round((correct / total) * 100);
    const grade = pct === 100 ? "Perfect!" : pct >= 80 ? "Excellent" : pct >= 60 ? "Good job" : pct >= 40 ? "Keep going" : "Keep practicing";

    return (
      <div className="app">
        <header className="header">
          <div className="logo">
            <span className="logo-icon">FC</span>
            <span>FlipCard</span>
          </div>
        </header>

        <main className="result-screen">
          <div className="result-card">
            <p className="result-deck">{activeDeck?.emoji} {activeDeck?.name}</p>
            <h1 className="result-grade">{grade}</h1>
            <div className="result-pct" style={{ "--deck-color": activeDeck?.color } as React.CSSProperties}>
              {pct}%
            </div>
            <div className="result-counts">
              <div className="result-stat correct-stat">
                <span className="result-stat-num">{correct}</span>
                <span className="result-stat-label">Correct</span>
              </div>
              <div className="result-divider" />
              <div className="result-stat incorrect-stat">
                <span className="result-stat-num">{incorrect}</span>
                <span className="result-stat-label">Incorrect</span>
              </div>
            </div>

            <div className="result-actions">
              {missedCards.length > 0 && (
                <button className="btn-retry" onClick={retryMissed}>
                  Retry {missedCards.length} missed
                </button>
              )}
              <button className="btn-restart" onClick={() => startDeck(activeDeck!)}>
                Restart deck
              </button>
              <button className="btn-home" onClick={() => setScreen("home")}>
                All decks
              </button>
            </div>
          </div>
        </main>

        <footer className="statusbar">
          <span>Day 58 · 300 Days of Code · Lagos, Nigeria 🇳🇬</span>
        </footer>
      </div>
    );
  }

  /* ── STUDY ── */
  return (
    <div className="app">
      <header className="header">
        <button className="back-btn" onClick={() => setScreen("home")}>← Decks</button>
        <div className="study-title">
          {activeDeck?.emoji} {activeDeck?.name}
        </div>
        <span className="card-counter">{index + 1} / {cards.length}</span>
      </header>

      <ScoreBar correct={correct} incorrect={incorrect} total={index + (answered ? 1 : 0)} />

      <main className="study-main">
        {/* Progress dots */}
        <div className="progress-dots">
          {cards.map((_, i) => (
            <span
              key={i}
              className={`dot ${i < index ? "dot-past" : i === index ? "dot-active" : "dot-future"}`}
            />
          ))}
        </div>

        {/* Flip card */}
        <div
          className={`card-scene ${answered === "correct" ? "card-correct" : answered === "incorrect" ? "card-incorrect" : ""}`}
          onClick={!answered ? flipCard : undefined}
          style={{ cursor: answered ? "default" : "pointer" }}
        >
          <div className={`card-inner ${flipped ? "flipped" : ""}`}>
            {/* Front */}
            <div className="card-face card-front">
              <span className="card-face-label">Question</span>
              <p className="card-text">{currentCard?.question}</p>
              {!flipped && (
                <span className="flip-hint">Click to reveal answer</span>
              )}
            </div>
            {/* Back */}
            <div className="card-face card-back" style={{ "--deck-color": activeDeck?.color } as React.CSSProperties}>
              <span className="card-face-label">Answer</span>
              <p className="card-text">{currentCard?.answer}</p>
            </div>
          </div>
        </div>

        {/* Mark buttons — only shown after flip */}
        {flipped && !answered && (
          <div className="mark-row">
            <button className="mark-btn mark-incorrect" onClick={() => mark("incorrect")}>
              ✗ Incorrect
            </button>
            <button className="mark-btn mark-correct" onClick={() => mark("correct")}>
              ✓ Correct
            </button>
          </div>
        )}

        {/* Next button — only shown after answering */}
        {answered && (
          <button className="next-btn" onClick={nextCard}>
            {isLast ? "See results →" : "Next card →"}
          </button>
        )}

        {/* Hint when card is on front and not yet flipped */}
        {!flipped && !answered && (
          <p className="study-hint">Tap the card to flip it</p>
        )}
      </main>

      <footer className="statusbar">
        <span>Day 58 · 300 Days of Code · Lagos, Nigeria 🇳🇬</span>
        <span>Tap card to flip · Mark correct or incorrect · Track your score</span>
      </footer>
    </div>
  );
}