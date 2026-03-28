import React, { useState, useMemo } from "react";
import "./App.css";

// Types
interface Post {
  id: string;
  title: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  readTime: number;
  excerpt: string;
  content: string;
  featured: boolean;
}

// Mock blog data (simulates MDX content)
const POSTS: Post[] = [
  {
    id: "1",
    title: "30 Days of TypeScript: What I Learned in Sprint 1",
    date: "2025-03-01",
    author: "Henry Ehindero",
    category: "Coding",
    tags: ["TypeScript", "Node.js", "CLI", "Learning"],
    readTime: 2,
    excerpt: "I just completed 30 consecutive days of building TypeScript CLI tools. Here's everything I learned , the wins, the frustrations, and why chalk@4.1.2 matters more than you think.",
    content: `## The Challenge

Thirty days. Thirty projects. One TypeScript CLI per day.

Sprint 1 of my 300 Days of Code challenge focused entirely on Node.js and TypeScript fundamentals , calculators, API clients, CSV parsers, cron jobs, and data pipelines.

## What Surprised Me Most

The biggest surprise wasn't the code , it was **consistency**. Showing up every single day, regardless of energy level, is a skill in itself. By day 15 I had a rhythm. By day 25 I was looking forward to it.

## Key Technical Lessons

**1. tsconfig.json matters more than you think.** The default \`npx tsc --init\` config caused errors. I now have a battle-tested config I copy into every project.

**2. chalk must be pinned to v4.** chalk v5 is ESM-only. CommonJS projects break silently. Pin to \`^4.1.2\` and move on.

**3. Import syntax differs by package.** Some packages need \`import * as x from "x"\`, others use default imports. TypeScript will tell you , listen to it.

## Favourite Projects

- **Day 25** , Cron Job Scheduler: first time seeing real-world async patterns
- **Day 29** , Data Pipeline: papaparse + lodash + node-fetch all working together felt powerful
- **Day 30** , Sprint Review CLI: tying everything together was deeply satisfying

## What's Next

Sprint 2: React UIs. The shift from terminal output to browser components is massive. I'm excited.`,
    featured: true,
  },
  {
    id: "2",
    title: "Building a Weather App: Promise.all and Why It Matters",
    date: "2025-03-16",
    author: "Henry Ehindero",
    category: "Tutorial",
    tags: ["React", "Axios", "API", "JavaScript"],
    readTime: 1,
    excerpt: "Day 39 taught me one of the most practical patterns in async JavaScript , running multiple API calls at the same time instead of one after another.",
    content: `## The Problem

My weather app needed two API calls: current weather and a 5-day forecast. My first instinct was:

\`\`\`js
const weather = await fetchWeather(city);
const forecast = await fetchForecast(city);
\`\`\`

This works , but it's slow. The forecast waits for weather to finish before even starting.

## The Solution: Promise.all

\`\`\`js
const [weatherRes, forecastRes] = await Promise.all([
  fetchWeather(city),
  fetchForecast(city)
]);
\`\`\`

Both requests fire simultaneously. Total time = the slower of the two, not the sum of both.

## When to Use It

Use \`Promise.all\` when your requests are **independent** , neither result depends on the other. If request B needs data from request A, you still need to await them sequentially.

## Real-World Impact

On a fast connection the difference is small. On a slow Nigerian mobile network, cutting 400ms from a 1s load time is genuinely noticeable.`,
    featured: false,
  },
  {
    id: "3",
    title: "Context API vs Redux: Which Should You Use?",
    date: "2025-03-18",
    author: "Henry Ehindero",
    category: "Opinion",
    tags: ["React", "Redux", "Context API", "State Management"],
    readTime: 2,
    excerpt: "I built dark mode with Context API on Day 38 and a full todo app with Redux Toolkit on Day 41. Here's when I'd reach for each one.",
    content: `## Context API

Context is built into React. No extra dependency. Perfect for **low-frequency, global state** , theme, user preferences, locale, current user.

The key word is *low-frequency*. Context re-renders every consumer when the value changes. For a theme toggle that fires twice a day, that's fine. For a counter that updates 60 times per second, it's a problem.

## Redux Toolkit

Redux is for **complex, high-frequency state** with many actions and derived views. The \`createSlice\` API eliminates almost all the boilerplate people complained about in classic Redux.

The DevTools alone are worth it for anything non-trivial , time travel debugging is genuinely useful.

## My Rule of Thumb

| Use Case | Pick |
|---|---|
| Theme / dark mode | Context |
| Auth / current user | Context |
| Form state | Local useState |
| Complex todo / kanban | Redux Toolkit |
| Shopping cart | Redux Toolkit |
| Server data / cache | React Query |

## The Answer

It depends. But if you're asking , start with Context. Reach for Redux when Context starts to hurt.`,
    featured: true,
  },
  {
    id: "4",
    title: "Why Nigerian Developers Should Learn TypeScript First",
    date: "2025-03-20",
    author: "Henry Ehindero",
    category: "Opinion",
    tags: ["TypeScript", "Nigeria", "Career", "Beginners"],
    readTime: 3,
    excerpt: "The Nigerian tech job market is growing fast. Here's why TypeScript , not plain JavaScript , gives you a stronger starting position.",
    content: `## The Market Reality

Lagos, Abuja, and Port Harcourt are home to a growing number of startups, fintechs, and tech hubs. Companies like Paystack, Flutterwave, and Kuda have raised the bar for what "production-ready" code means.

These companies use TypeScript.

## Why TypeScript Wins

**Catches bugs before runtime.** In a codebase shared across a team in Lagos and a remote team in London, TypeScript errors in your editor are worth more than runtime crashes in production.

**Self-documenting code.** When you return to code you wrote 3 months ago, types tell you exactly what a function expects. No guessing.

**Better tooling.** Autocomplete, refactoring, go-to-definition , all work better with types.

## The Counter-Argument

TypeScript has a learning curve. For a quick freelance site, plain JS is faster. That's fine.

But for anything you want to grow , a startup, an open-source project, a career , TypeScript pays back the investment quickly.

## Start Here

The 300 Days of Code Sprint 1 curriculum is entirely TypeScript. 30 projects, zero assumptions. It worked for me.`,
    featured: false,
  },
  {
    id: "5",
    title: "Canvas API: Building the Meme Generator from Scratch",
    date: "2025-03-20",
    author: "Henry Ehindero",
    category: "Tutorial",
    tags: ["Canvas", "React", "JavaScript", "Tutorial"],
    readTime: 2,
    excerpt: "Day 43 introduced me to the Canvas API. Drawing images and text programmatically felt like a superpower , here's how it works.",
    content: `## What is the Canvas API?

Canvas is an HTML element that gives you a 2D pixel surface to draw on. Unlike the DOM , where you position elements with CSS , canvas is imperative: you call functions to draw shapes, images, and text.

## The Key Functions

\`\`\`js
// Draw an image
ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

// Draw text with outline (classic meme style)
ctx.strokeStyle = "#000";
ctx.fillStyle = "#fff";
ctx.strokeText("TOP TEXT", x, y);
ctx.fillText("TOP TEXT", x, y);
\`\`\`

The trick for meme text is calling \`strokeText\` first, then \`fillText\` on the same position. The stroke paints slightly outside the glyph, the fill paints the interior on top.

## The CORS Trap

Drawing an external image URL taints the canvas , browser security blocks \`toDataURL()\`. Fix:

\`\`\`js
const img = new Image();
img.crossOrigin = "anonymous";
img.src = url;
\`\`\`

## Word Wrap

Canvas has no built-in word wrap. You measure each word with \`ctx.measureText()\`, accumulate words into lines, and break when a line exceeds your max width.

## Download

\`\`\`js
const link = document.createElement("a");
link.download = "meme.png";
link.href = canvas.toDataURL("image/png");
link.click();
\`\`\`

One call converts the entire canvas to a base64 PNG.`,
    featured: false,
  },
  {
    id: "6",
    title: "300 Days of Code: Halfway Reflection at Day 50",
    date: "2025-03-26",
    author: "Henry Ehindero",
    category: "Reflection",
    tags: ["300DaysOfCode", "Learning", "Nigeria", "Growth"],
    readTime: 4,
    excerpt: "Day 50. One sixth of the way through. Here's what the first 50 days of consistent daily coding has taught me about learning, consistency, and building in public.",
    content: `## The Numbers

- **50 projects** shipped
- **2 sprints** completed (Sprint 1: CLI tools, Sprint 2: React UIs)
- **1 deployed site** (henry-day032.netlify.app)
- **0 days missed**

## What Changed

When I started, a TypeScript error felt like a crisis. Now it's information. That mental shift , from "something broke" to "the compiler is helping me" , is the biggest thing 50 days of daily practice gave me.

## The Consistency Paradox

Starting is hard. Day 2 is harder than Day 1. Day 15 is easier than Day 5. By Day 30 it's automatic.

The advice you hear , "just start" , is incomplete. The real work is showing up on the days when you don't feel like it. Those are the days that matter most.

## What's Ahead

Sprint 3 covers Node.js backends with Express and Fastify. Sprint 4 covers data and automation. Sprint 5 is React Native mobile apps.

250 more days. Let's go.`,
    featured: true,
  },
];

const CATEGORIES = ["All", "Coding", "Tutorial", "Opinion", "Reflection"];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" });
}

// Components
const TagBadge: React.FC<{ tag: string; onClick?: () => void }> = ({ tag, onClick }) => (
  <span className="tag" onClick={onClick} style={onClick ? { cursor: "pointer" } : {}}>{tag}</span>
);

const PostCard: React.FC<{ post: Post; onOpen: () => void }> = ({ post, onOpen }) => (
  <article className={`post-card ${post.featured ? "featured" : ""}`} onClick={onOpen}>
    {post.featured && <span className="featured-badge">Featured</span>}
    <div className="post-meta">
      <span className="post-category">{post.category}</span>
      <span className="post-dot">·</span>
      <span className="post-date">{formatDate(post.date)}</span>
      <span className="post-dot">·</span>
      <span className="post-read">{post.readTime} min read</span>
    </div>
    <h2 className="post-title">{post.title}</h2>
    <p className="post-excerpt">{post.excerpt}</p>
    <div className="post-footer">
      <div className="post-tags">
        {post.tags.slice(0, 3).map((t) => <TagBadge key={t} tag={t} />)}
      </div>
      <span className="read-more">Read more →</span>
    </div>
  </article>
);

const PostView: React.FC<{ post: Post; onBack: () => void }> = ({ post, onBack }) => {
  // Render markdown-like content
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      if (line.startsWith("## ")) {
        elements.push(<h2 key={i} className="prose-h2">{line.slice(3)}</h2>);
      } else if (line.startsWith("**") && line.endsWith("**")) {
        elements.push(<p key={i} className="prose-p"><strong>{line.slice(2, -2)}</strong></p>);
      } else if (line.startsWith("```")) {
        // Code block
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push(<pre key={i} className="prose-pre"><code>{codeLines.join("\n")}</code></pre>);
      } else if (line.startsWith("|")) {
        // Table
        const tableLines: string[] = [line];
        i++;
        while (i < lines.length && lines[i].startsWith("|")) {
          tableLines.push(lines[i]);
          i++;
        }
        const rows = tableLines.filter((r) => !r.match(/^\|[-\s|]+\|$/));
        elements.push(
          <table key={i} className="prose-table">
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {row.split("|").filter(Boolean).map((cell, ci) => (
                    ri === 0 ? <th key={ci}>{cell.trim()}</th> : <td key={ci}>{cell.trim()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
        continue;
      } else if (line.trim() === "") {
        // skip
      } else {
        // Handle inline bold
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        elements.push(
          <p key={i} className="prose-p">
            {parts.map((part, pi) =>
              part.startsWith("**") && part.endsWith("**")
                ? <strong key={pi}>{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        );
      }
      i++;
    }
    return elements;
  };

  return (
    <div className="post-view">
      <button className="back-btn" onClick={onBack}>← Back to Blog</button>
      <div className="post-view-header">
        <div className="post-meta">
          <span className="post-category">{post.category}</span>
          <span className="post-dot">·</span>
          <span className="post-date">{formatDate(post.date)}</span>
          <span className="post-dot">·</span>
          <span className="post-read">{post.readTime} min read</span>
        </div>
        <h1 className="post-view-title">{post.title}</h1>
        <p className="post-view-excerpt">{post.excerpt}</p>
        <div className="post-view-author">
          <div className="author-avatar">{post.author.split(" ").map(n => n[0]).join("")}</div>
          <span className="author-name">{post.author}</span>
        </div>
        <div className="post-tags">
          {post.tags.map((t) => <TagBadge key={t} tag={t} />)}
        </div>
      </div>
      <div className="prose">{renderContent(post.content)}</div>
    </div>
  );
};

// App
const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [openPost, setOpenPost] = useState<Post | null>(null);

  const filtered = useMemo(() => POSTS.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchTag = !activeTag || p.tags.includes(activeTag);
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchTag && matchSearch;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [activeCategory, search, activeTag]);

  const allTags = useMemo(() => Array.from(new Set(POSTS.flatMap((p) => p.tags))).sort(), []);
  const featured = POSTS.filter((p) => p.featured);

  if (openPost) return (
    <div className="app">
      <nav className="nav"><div className="nav-inner"><span className="nav-logo">Henry.dev</span><span className="nav-sub">Blog</span></div></nav>
      <main className="main"><PostView post={openPost} onBack={() => setOpenPost(null)} /></main>
    </div>
  );

  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-inner">
          <span className="nav-logo">Henry.dev</span>
          <span className="nav-sub">Blog</span>
          <span className="nav-count">{POSTS.length} posts</span>
        </div>
      </nav>

      <div className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">Thoughts on Code,<br />Building, and Nigeria</h1>
          <p className="hero-sub">Documenting 300 days of daily coding , TypeScript, React, Node.js, and everything in between.</p>
          <input className="hero-search" placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <main className="main">
        <div className="layout">
          <div className="posts-col">
            <div className="cat-row">
              {CATEGORIES.map((c) => (
                <button key={c} className={`cat-btn ${activeCategory === c ? "active" : ""}`}
                  onClick={() => { setActiveCategory(c); setActiveTag(""); }}>
                  {c}
                  <span className="cat-count">{c === "All" ? POSTS.length : POSTS.filter(p => p.category === c).length}</span>
                </button>
              ))}
            </div>

            {activeTag && (
              <div className="active-tag-bar">
                Filtered by tag: <strong>{activeTag}</strong>
                <button onClick={() => setActiveTag("")}>✕</button>
              </div>
            )}

            <div className="posts-list">
              {filtered.length === 0 ? (
                <div className="empty">No posts found.</div>
              ) : (
                filtered.map((p) => <PostCard key={p.id} post={p} onOpen={() => setOpenPost(p)} />)
              )}
            </div>
          </div>

          <aside className="sidebar">
            <div className="sidebar-block">
              <h3 className="sidebar-title">Featured</h3>
              {featured.map((p) => (
                <button key={p.id} className="featured-link" onClick={() => setOpenPost(p)}>
                  <span className="fl-title">{p.title}</span>
                  <span className="fl-date">{formatDate(p.date)}</span>
                </button>
              ))}
            </div>
            <div className="sidebar-block">
              <h3 className="sidebar-title">Tags</h3>
              <div className="tags-cloud">
                {allTags.map((t) => (
                  <TagBadge key={t} tag={t} onClick={() => { setActiveTag(t); setActiveCategory("All"); }} />
                ))}
              </div>
            </div>
            <div className="sidebar-block about-block">
              <div className="about-avatar">HE</div>
              <h3 className="about-name">Henry Ehindero</h3>
              <p className="about-bio">Building in public , 300 days, 300 projects. Nigeria.</p>
              <a className="about-link" href="https://github.com/Henry2005Max" target="_blank" rel="noreferrer">github.com/Henry2005Max</a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default App;