import React from "react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import "./App.css";

// ─── Toggle Button ────────────────────────────────────────────────────────────

const ThemeToggle: React.FC = () => {
  const { isDark, toggle, theme } = useTheme();
  return (
    <button className="toggle-btn" onClick={toggle} aria-label="Toggle theme">
      <div className={`toggle-track ${isDark ? "dark" : "light"}`}>
        <span className="toggle-icon">{isDark ? "🌙" : "☀️"}</span>
        <div className="toggle-thumb" />
      </div>
      <span className="toggle-label">{theme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
};

// ─── Navbar ───────────────────────────────────────────────────────────────────

const Navbar: React.FC = () => {
  const { isDark } = useTheme();
  return (
    <nav className="navbar">
      <div className="nav-inner">
        <span className="nav-logo">Context<span className="logo-accent">UI</span></span>
        <div className="nav-links">
          <a href="#components" className="nav-link">Components</a>
          <a href="#cards" className="nav-link">Cards</a>
          <a href="#forms" className="nav-link">Forms</a>
        </div>
        <div className="nav-right">
          <span className="theme-badge">{isDark ? "Dark mode" : "Light mode"}</span>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero: React.FC = () => {
  const { isDark } = useTheme();
  return (
    <section className="hero">
      <div className="hero-inner">
        <span className="hero-badge">Day 38 — Sprint 2</span>
        <h1 className="hero-title">
          Dark mode powered<br />by <span className="title-accent">Context API</span>
        </h1>
        <p className="hero-sub">
          A complete UI demo showing how React Context distributes theme state
          to every component in the tree — no prop drilling, no external library.
        </p>
        <div className="hero-actions">
          <button className="btn-primary">Get Started</button>
          <button className="btn-secondary">View Source</button>
        </div>
        <div className="hero-info">
          <div className="info-chip">
            <span className="chip-dot" />
            Theme persists across refreshes via localStorage
          </div>
          <div className="info-chip">
            <span className="chip-dot" />
            Respects system preference on first load
          </div>
        </div>
      </div>
      <div className="hero-visual">
        <div className="visual-card">
          <div className="vc-header">
            <div className="vc-dot red" /><div className="vc-dot yellow" /><div className="vc-dot green" />
          </div>
          <div className="vc-line long" />
          <div className="vc-line medium" />
          <div className="vc-line short" />
          <div className="vc-accent-line" />
          <div className="vc-line medium" />
          <div className="vc-line long" />
        </div>
        <div className={`visual-label ${isDark ? "dark" : "light"}`}>
          {isDark ? "🌙 Dark" : "☀️ Light"}
        </div>
      </div>
    </section>
  );
};

// ─── Components Section ───────────────────────────────────────────────────────

const ComponentsSection: React.FC = () => {
  const { isDark } = useTheme();
  return (
    <section id="components" className="section">
      <div className="section-label">UI Components</div>
      <h2 className="section-title">Everything adapts automatically</h2>
      <p className="section-sub">
        Every component below reads from the same ThemeContext. Toggle once — everything updates.
      </p>

      <div className="components-grid">
        {/* Buttons */}
        <div className="component-block">
          <h3 className="block-title">Buttons</h3>
          <div className="btn-row">
            <button className="btn-primary">Primary</button>
            <button className="btn-secondary">Secondary</button>
            <button className="btn-ghost">Ghost</button>
            <button className="btn-danger">Danger</button>
          </div>
        </div>

        {/* Badges */}
        <div className="component-block">
          <h3 className="block-title">Badges</h3>
          <div className="badge-row">
            <span className="badge badge-green">Success</span>
            <span className="badge badge-yellow">Warning</span>
            <span className="badge badge-red">Error</span>
            <span className="badge badge-blue">Info</span>
            <span className="badge badge-neutral">Neutral</span>
          </div>
        </div>

        {/* Alert */}
        <div className="component-block">
          <h3 className="block-title">Alerts</h3>
          <div className="alert alert-info">
            <span className="alert-icon">ℹ</span>
            <span>Theme state is provided via <code>ThemeContext</code> — accessible anywhere.</span>
          </div>
          <div className="alert alert-success" style={{ marginTop: 10 }}>
            <span className="alert-icon">✓</span>
            <span>Dark mode active. localStorage key: <code>day38-theme</code></span>
          </div>
        </div>

        {/* Toggle showcase */}
        <div className="component-block">
          <h3 className="block-title">Current Theme</h3>
          <div className="theme-info-block">
            <div className="theme-info-row">
              <span className="ti-key">mode</span>
              <span className="ti-val">{isDark ? "dark" : "light"}</span>
            </div>
            <div className="theme-info-row">
              <span className="ti-key">source</span>
              <span className="ti-val">React Context API</span>
            </div>
            <div className="theme-info-row">
              <span className="ti-key">persistence</span>
              <span className="ti-val">localStorage</span>
            </div>
            <div className="theme-info-row">
              <span className="ti-key">system pref</span>
              <span className="ti-val">{window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Cards Section ────────────────────────────────────────────────────────────

const cards = [
  { title: "createContext", desc: "Creates a Context object. When React renders a component that subscribes to this, it reads the current context value from the nearest matching Provider.", tag: "Core API" },
  { title: "useContext", desc: "Reads and subscribes to context. Any component calling useTheme() re-renders whenever the theme value changes — automatically.", tag: "Hook" },
  { title: "Context.Provider", desc: "Wraps the component tree. Every child — no matter how deeply nested — can access the context value without any props being passed.", tag: "Component" },
];

const CardsSection: React.FC = () => (
  <section id="cards" className="section alt-bg">
    <div className="section-label">How It Works</div>
    <h2 className="section-title">Three pieces, one pattern</h2>
    <div className="cards-grid">
      {cards.map((c) => (
        <div key={c.title} className="info-card">
          <span className="card-tag">{c.tag}</span>
          <h3 className="card-title"><code>{c.title}</code></h3>
          <p className="card-desc">{c.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

// ─── Form Section ─────────────────────────────────────────────────────────────

const FormSection: React.FC = () => (
  <section id="forms" className="section">
    <div className="section-label">Form Elements</div>
    <h2 className="section-title">Inputs, selects, everything</h2>
    <div className="form-demo">
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Full Name</label>
          <input className="form-input" placeholder="Chidi Okeke" />
        </div>
        <div className="form-field">
          <label className="form-label">Email</label>
          <input className="form-input" placeholder="chidi@example.com" type="email" />
        </div>
      </div>
      <div className="form-field">
        <label className="form-label">Theme preference</label>
        <select className="form-input">
          <option>System default</option>
          <option>Always dark</option>
          <option>Always light</option>
        </select>
      </div>
      <div className="form-field">
        <label className="form-label">Notes</label>
        <textarea className="form-input form-textarea" placeholder="Context API makes theming effortless..." />
      </div>
      <button className="btn-primary">Save preferences</button>
    </div>
  </section>
);

// ─── Footer ───────────────────────────────────────────────────────────────────

const Footer: React.FC = () => (
  <footer className="footer">
    <span>Day 38 — 300 Days of Code</span>
    <span>Dark Mode with Context API</span>
  </footer>
);

// ─── Root App ─────────────────────────────────────────────────────────────────

const AppInner: React.FC = () => (
  <div className="app">
    <Navbar />
    <Hero />
    <ComponentsSection />
    <CardsSection />
    <FormSection />
    <Footer />
  </div>
);

const App: React.FC = () => (
  <ThemeProvider>
    <AppInner />
  </ThemeProvider>
);

export default App;