import React, { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import "./App.css";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Quote {
  id: number;
  content: string;
  author: string;
  tags: string[];
  length: number;
}

interface QuoteState {
  data: Quote | null;
  loading: boolean;
  error: string | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: "All", tag: "" },
  { label: "Motivational", tag: "motivational" },
  { label: "Wisdom", tag: "wisdom" },
  { label: "Success", tag: "success" },
  { label: "Life", tag: "life" },
  { label: "Happiness", tag: "happiness" },
  { label: "Technology", tag: "technology" },
];

const FALLBACK_QUOTES: Quote[] = [
  {
    id: 1,
    content: "Consistency is the foundation of virtue.",
    author: "Francis Bacon",
    tags: ["motivational"],
    length: 43,
  },
  {
    id: 2,
    content: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
    tags: ["success"],
    length: 47,
  },
  {
    id: 3,
    content: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
    tags: ["motivational"],
    length: 43,
  },
  {
    id: 4,
    content: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House",
    tags: ["technology"],
    length: 58,
  },
  {
    id: 5,
    content: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
    tags: ["technology"],
    length: 47,
  },
  {
    id: 6,
    content: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    tags: ["success"],
    length: 53,
  },
];

// ─── Axios Instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: "https://api.quotable.io",
  timeout: 5000,
});

// ─── Components ───────────────────────────────────────────────────────────────

const Skeleton: React.FC = () => (
  <div className="skeleton-wrap">
    <div className="skeleton skeleton-line long" />
    <div className="skeleton skeleton-line long" />
    <div className="skeleton skeleton-line medium" />
    <div className="skeleton skeleton-author" />
  </div>
);

const TagBadge: React.FC<{ tag: string }> = ({ tag }) => (
  <span className="tag">{tag}</span>
);

const QuoteCard: React.FC<{
  quote: Quote;
  isFavorite: boolean;
  onFavorite: () => void;
  isFallback: boolean;
}> = ({ quote, isFavorite, onFavorite, isFallback }) => (
  <div className="quote-card">
    {isFallback && (
      <div className="fallback-banner">Offline — showing saved quote</div>
    )}
    <div className="quote-marks">"</div>
    <blockquote className="quote-text">{quote.content}</blockquote>
    <div className="quote-footer">
      <div className="quote-meta">
        <span className="quote-author">— {quote.author}</span>
        <span className="quote-length">{quote.length} chars</span>
      </div>
      <div className="quote-tags">
        {quote.tags.map((t) => (
          <TagBadge key={t} tag={t} />
        ))}
      </div>
    </div>
    <button
      className={`favorite-btn ${isFavorite ? "favorited" : ""}`}
      onClick={onFavorite}
      title={isFavorite ? "Remove from favorites" : "Save to favorites"}
    >
      {isFavorite ? "♥ Saved" : "♡ Save"}
    </button>
  </div>
);

const FavoritesPanel: React.FC<{
  favorites: Quote[];
  onSelect: (q: Quote) => void;
  onRemove: (id: number) => void;
}> = ({ favorites, onSelect, onRemove }) => (
  <div className="favorites-panel">
    <h3 className="panel-title">Saved Quotes <span className="panel-count">{favorites.length}</span></h3>
    {favorites.length === 0 ? (
      <p className="panel-empty">No saved quotes yet. Hit the Save button on any quote.</p>
    ) : (
      <div className="favorites-list">
        {favorites.map((q) => (
          <div key={q.id} className="fav-item">
            <p className="fav-text" onClick={() => onSelect(q)}>
              "{q.content.slice(0, 72)}{q.content.length > 72 ? "…" : ""}"
            </p>
            <div className="fav-footer">
              <span className="fav-author">— {q.author}</span>
              <button className="fav-remove" onClick={() => onRemove(q.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const StatsPanel: React.FC<{ favorites: Quote[]; fetchCount: number }> = ({
  favorites,
  fetchCount,
}) => {
  const avgLength =
    favorites.length > 0
      ? Math.round(favorites.reduce((s, q) => s + q.length, 0) / favorites.length)
      : 0;

  const topTag =
    favorites.length > 0
      ? Object.entries(
          favorites.flatMap((q) => q.tags).reduce((acc: Record<string, number>, t) => {
            acc[t] = (acc[t] || 0) + 1;
            return acc;
          }, {})
        ).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"
      : "—";

  return (
    <div className="stats-panel">
      <h3 className="panel-title">Stats</h3>
      <div className="stats-grid">
        <div className="stat">
          <span className="stat-value">{fetchCount}</span>
          <span className="stat-label">Fetched</span>
        </div>
        <div className="stat">
          <span className="stat-value">{favorites.length}</span>
          <span className="stat-label">Saved</span>
        </div>
        <div className="stat">
          <span className="stat-value">{avgLength || "—"}</span>
          <span className="stat-label">Avg Length</span>
        </div>
        <div className="stat">
          <span className="stat-value" style={{ fontSize: "13px" }}>{topTag}</span>
          <span className="stat-label">Top Tag</span>
        </div>
      </div>
    </div>
  );
};

// ─── App ─────────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  const [quote, setQuote] = useState<QuoteState>({
    data: null,
    loading: false,
    error: null,
  });
  const [activeTag, setActiveTag] = useState("");
  const [favorites, setFavorites] = useState<Quote[]>([]);
  const [fetchCount, setFetchCount] = useState(0);
  const [isFallback, setIsFallback] = useState(false);
  const [history, setHistory] = useState<Quote[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const fetchQuote = useCallback(
    async (tag: string = activeTag) => {
      setQuote({ data: null, loading: true, error: null });
      setIsFallback(false);

      try {
        const params: Record<string, string> = { limit: "1" };
        if (tag) params.tags = tag;

        const res = await api.get<{ results: Quote[] }>("/quotes/random", { params });
        const fetched = res.data as unknown as Quote;

        setQuote({ data: fetched, loading: false, error: null });
        setFetchCount((c) => c + 1);
        setHistory((prev) => {
          const next = [...prev.slice(0, historyIndex + 1), fetched];
          setHistoryIndex(next.length - 1);
          return next;
        });
      } catch (err) {
        const axiosErr = err as AxiosError;
        const fallback =
          FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
        setIsFallback(true);
        setQuote({ data: fallback, loading: false, error: null });

        console.warn("API error, using fallback:", axiosErr.message);
      }
    },
    [activeTag, historyIndex]
  );

  // Fetch on mount
  useEffect(() => {
    fetchQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "n" && !e.metaKey && !e.ctrlKey) fetchQuote();
      if (e.key === "s") toggleFavorite();
      if (e.key === "ArrowLeft") navigateHistory("back");
      if (e.key === "ArrowRight") navigateHistory("forward");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchQuote, quote.data, favorites]);

  const toggleFavorite = () => {
    if (!quote.data) return;
    setFavorites((prev) =>
      prev.find((q) => q.id === quote.data!.id)
        ? prev.filter((q) => q.id !== quote.data!.id)
        : [...prev, quote.data!]
    );
  };

  const navigateHistory = (dir: "back" | "forward") => {
    const newIndex = dir === "back" ? historyIndex - 1 : historyIndex + 1;
    if (newIndex < 0 || newIndex >= history.length) return;
    setHistoryIndex(newIndex);
    setQuote({ data: history[newIndex], loading: false, error: null });
  };

  const handleTagChange = (tag: string) => {
    setActiveTag(tag);
    fetchQuote(tag);
  };

  const isFavorite = quote.data
    ? !!favorites.find((q) => q.id === quote.data!.id)
    : false;

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <span className="header-day">Day 35</span>
          <h1 className="header-title">Quote Display</h1>
          <span className="header-sprint">Sprint 2 — Web Basics</span>
        </div>
      </header>

      <main className="main">
        <div className="layout">

          {/* Left Column */}
          <div className="left-col">

            {/* Category Filter */}
            <div className="categories">
              {CATEGORIES.map((c) => (
                <button
                  key={c.tag}
                  className={`cat-btn ${activeTag === c.tag ? "active" : ""}`}
                  onClick={() => handleTagChange(c.tag)}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Quote Area */}
            <div className="quote-area">
              {quote.loading && <Skeleton />}

              {!quote.loading && quote.data && (
                <QuoteCard
                  quote={quote.data}
                  isFavorite={isFavorite}
                  onFavorite={toggleFavorite}
                  isFallback={isFallback}
                />
              )}

              {quote.error && (
                <div className="error-state">
                  <p>{quote.error}</p>
                  <button className="new-btn" onClick={() => fetchQuote()}>Try Again</button>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="controls">
              <button
                className="nav-btn"
                onClick={() => navigateHistory("back")}
                disabled={historyIndex <= 0}
                title="Arrow Left"
              >
                ← Previous
              </button>
              <button
                className="new-btn"
                onClick={() => fetchQuote()}
                disabled={quote.loading}
                title="N"
              >
                {quote.loading ? "Loading..." : "New Quote"}
              </button>
              <button
                className="nav-btn"
                onClick={() => navigateHistory("forward")}
                disabled={historyIndex >= history.length - 1}
                title="Arrow Right"
              >
                Next →
              </button>
            </div>

            {/* Shortcuts */}
            <div className="shortcuts">
              <kbd>N</kbd> New quote
              <kbd>S</kbd> Save
              <kbd>←</kbd> Previous
              <kbd>→</kbd> Next
            </div>
          </div>

          {/* Right Column */}
          <div className="right-col">
            <StatsPanel favorites={favorites} fetchCount={fetchCount} />
            <FavoritesPanel
              favorites={favorites}
              onSelect={(q) => setQuote({ data: q, loading: false, error: null })}
              onRemove={(id) => setFavorites((prev) => prev.filter((q) => q.id !== id))}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;