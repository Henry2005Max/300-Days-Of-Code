import React, { useState, useMemo } from "react";

/* ── Types ── */
interface Project {
  day: number;
  title: string;
  description: string;
  tags: string[];
  highlight?: boolean;
  netlify?: string;
}

/* ── All 30 Sprint 2 Projects ── */
const PROJECTS: Project[] = [
  { day: 31, title: "Static Resume", description: "Responsive resume page built with React, TypeScript, and CSS Grid. Clean typographic layout.", tags: ["React", "TypeScript", "CSS Grid"] },
  { day: 32, title: "Themed Landing Page", description: "Styled-components ThemeProvider with dark/light toggle. Deployed to Netlify.", tags: ["React", "Styled-Components", "Dark Mode"], netlify: "https://henry-day032.netlify.app" },
  { day: 33, title: "Counter with Hooks", description: "useReducer, useEffect, useCallback, useRef, and a custom hook — all in one project.", tags: ["React", "Hooks", "useReducer"] },
  { day: 34, title: "Form Validator", description: "9-field form with React Hook Form, password strength meter, and real-time validation.", tags: ["React", "React Hook Form", "Validation"] },
  { day: 35, title: "Quote Display", description: "Axios-powered quote fetcher with category filter, favorites, session history, shimmer skeleton.", tags: ["React", "Axios", "API"] },
  { day: 36, title: "Clock & Timer", description: "requestAnimationFrame stopwatch, countdown with presets. Pixel-accurate timing.", tags: ["React", "Animation", "requestAnimationFrame"] },
  { day: 37, title: "Image Gallery", description: "IntersectionObserver lazy loading, masonry layout, and lightbox. Zero dependencies.", tags: ["React", "IntersectionObserver", "Masonry"] },
  { day: 38, title: "Dark Mode with Context", description: "createContext + useContext with CSS data-theme tokens. Persisted to localStorage.", tags: ["React", "Context API", "Dark Mode"] },
  { day: 39, title: "Weather App UI", description: "OpenWeatherMap API, Promise.all for multi-city fetch, dynamic backgrounds. Nigerian cities.", tags: ["React", "API", "Axios"] },
  { day: 40, title: "Tailwind Resume", description: "Rebuilt Day 31 resume entirely with Tailwind utility classes. Review day.", tags: ["React", "Tailwind CSS", "Review"] },
  { day: 41, title: "Todo App with Redux", description: "Redux Toolkit createSlice with 10 actions, typed hooks, and localStorage persistence.", tags: ["React", "Redux Toolkit", "State"] },
  { day: 42, title: "Color Picker", description: "HSL sliders, harmony generation, shade palettes, clipboard copy, and saved palette history.", tags: ["React", "HSL", "Canvas"] },
  { day: 43, title: "Meme Generator", description: "Canvas API text layers with word wrap, adjustable font size, and PNG download.", tags: ["React", "Canvas API", "TypeScript"] },
  { day: 44, title: "BMI Calculator", description: "Metric and imperial modes, animated gauge needle, ideal weight range, and session history.", tags: ["React", "TypeScript", "Animation"] },
  { day: 45, title: "Password Strength Meter", description: "Weighted checks, entropy calculation, estimated crack time, and password generator.", tags: ["React", "TypeScript", "Security"] },
  { day: 46, title: "Quiz App", description: "3-screen quiz with 20 questions, countdown timer per question, and results review.", tags: ["React", "TypeScript", "State"] },
  { day: 47, title: "Currency UI", description: "Live exchange rates via Axios. NGN-focused with 12 currencies and quick reference table.", tags: ["React", "Axios", "API"] },
  { day: 48, title: "Rock Paper Scissors", description: "Best of 3/5 mode, 600ms reveal animation, win streaks, and full game history.", tags: ["React", "Animation", "TypeScript"] },
  { day: 49, title: "Tip Calculator", description: "Naira formatting, bill splitting, round-up mode, Nigerian venue presets, saved bills.", tags: ["React", "TypeScript", "Naira"] },
  { day: 50, title: "Blog Template with MDX", description: "Vite + @mdx-js/rollup, rehype plugins, live TOC with IntersectionObserver, reading progress bar.", tags: ["React", "MDX", "Vite"], highlight: true },
  { day: 51, title: "Pomodoro Timer", description: "Focus/break cycles, session counter, sound notification, custom durations, task label.", tags: ["React", "TypeScript", "Hooks"] },
  { day: 52, title: "Expense Tracker", description: "Income and expense entries, category tags, running balance, monthly summary, Naira.", tags: ["React", "TypeScript", "Naira"] },
  { day: 53, title: "Data Dashboard", description: "Chart.js bar, line, and doughnut charts with a responsive grid layout and live data.", tags: ["React", "Chart.js", "TypeScript"] },
  { day: 54, title: "Drag & Drop List", description: "HTML5 Drag and Drop API — sortable list with keyboard support and localStorage.", tags: ["React", "Drag & Drop", "TypeScript"] },
  { day: 55, title: "Multi-Step Form", description: "Step progress indicator, field validation per step, review screen, animated transitions.", tags: ["React", "Hooks", "Animation"] },
  { day: 56, title: "Markdown Editor", description: "Live split-pane preview with marked, 12-button toolbar, keyboard shortcuts, export to .md/.html.", tags: ["React", "MDX", "TypeScript"], highlight: true },
  { day: 57, title: "Kanban Board", description: "Native HTML5 drag and drop across 3 columns. Add, edit, delete cards. localStorage.", tags: ["React", "Drag & Drop", "TypeScript"], highlight: true },
  { day: 58, title: "Flashcard App", description: "CSS 3D flip animation, 6 decks including MCQ geology. Score tracking, retry missed cards.", tags: ["React", "Animation", "TypeScript"], highlight: true },
  { day: 59, title: "Habit Tracker", description: "7-day weekly dot grid, 28-day grid view, streak counters, custom habits with emoji + colour.", tags: ["React", "TypeScript", "localStorage"], highlight: true },
  { day: 60, title: "Portfolio Dashboard", description: "This page. A shareable showcase of all 30 Sprint 2 projects with stats and tag filtering.", tags: ["React", "TypeScript", "Review"], highlight: true },
];

/* ── Stats ── */
const STATS = [
  { label: "Projects built", value: "30" },
  { label: "Sprint", value: "2 of 10" },
  { label: "Days coded", value: "60" },
  { label: "Sprint theme", value: "React / TS" },
];

/* ── All unique tags ── */
function getAllTags(projects: Project[]): string[] {
  const set = new Set<string>();
  projects.forEach((p) => p.tags.forEach((t) => set.add(t)));
  return ["All", ...Array.from(set).sort()];
}

/* ── Project Card ── */
function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article
      className={`project-card ${project.highlight ? "card-highlight" : ""}`}
      style={{ animationDelay: `${(index % 10) * 50}ms` }}
    >
      <div className="card-top">
        <span className="day-badge">Day {project.day}</span>
        {project.highlight && <span className="highlight-pip" title="Highlighted project" />}
      </div>
      <h3 className="card-title">{project.title}</h3>
      <p className="card-desc">{project.description}</p>
      <div className="card-footer">
        <div className="card-tags">
          {project.tags.map((t) => (
            <span key={t} className="card-tag">{t}</span>
          ))}
        </div>
        {project.netlify && (
          <a
            href={project.netlify}
            target="_blank"
            rel="noreferrer"
            className="live-link"
          >
            Live ↗
          </a>
        )}
      </div>
    </article>
  );
}

/* ── Main App ── */
export default function App() {
  const [activeTag, setActiveTag] = useState("All");
  const [search, setSearch] = useState("");

  const allTags = useMemo(() => getAllTags(PROJECTS), []);

  const filtered = useMemo(() => {
    return PROJECTS.filter((p) => {
      const tagMatch = activeTag === "All" || p.tags.includes(activeTag);
      const searchMatch =
        search === "" ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return tagMatch && searchMatch;
    });
  }, [activeTag, search]);

  return (
    <div className="app">
      {/* Hero */}
      <header className="hero">
        <div className="hero-bg-text" aria-hidden="true">S2</div>
        <div className="hero-content">
          <p className="hero-eyebrow">300 Days of Code · Sprint 2 Complete</p>
          <h1 className="hero-title">
            30 React projects.<br />
            <em>60 days of shipping.</em>
          </h1>
          <p className="hero-sub">
            Henry Ehindero · Nigeria 🇳🇬 · GDG Mobile Development Lead · Final Year Computer Science
          </p>
          <a
            href="https://github.com/Henry2005Max/300-Days-Of-Code"
            target="_blank"
            rel="noreferrer"
            className="hero-cta"
          >
            View on GitHub ↗
          </a>
        </div>

        {/* Stats strip */}
        <div className="stats-strip">
          {STATS.map((s) => (
            <div key={s.label} className="stat">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </header>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-inner">
          <input
            className="search-input"
            type="text"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="tag-scroll">
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`tag-btn ${activeTag === tag ? "tag-active" : ""}`}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <span className="filter-count">{filtered.length} projects</span>
      </div>

      {/* Project grid */}
      <main className="grid-section">
        <div className="project-grid">
          {filtered.map((p, i) => (
            <ProjectCard key={p.day} project={p} index={i} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="no-results">No projects match your filter.</p>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <p className="footer-title">Sprint 2 — Complete ✓</p>
          <p className="footer-sub">
            Next: Sprint 3 · Node.js + TypeScript Back-End Servers · Days 61–90
          </p>
          <p className="footer-credit">
            Built with React 18 + TypeScript + Vite · Day 60 · #300DaysOfCode · #BuildInPublic
          </p>
        </div>
      </footer>
    </div>
  );
}