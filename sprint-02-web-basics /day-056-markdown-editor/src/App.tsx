import React, { useState, useEffect, useRef, useCallback } from "react";
import { marked } from "marked";

/* ── Types ── */
interface Stats {
  words: number;
  chars: number;
  lines: number; 
  readTime: string;
}

type ViewMode = "split" | "editor" | "preview";

/* ── Marked config ── */
marked.setOptions({ breaks: true, gfm: true });

/* ── Default content ── */
const DEFAULT_MD = `# Welcome to MarkPad

A **clean**, distraction-free Markdown editor built for Day 56 of the 300 Days of Code challenge.

## Features

- Live **split-pane** preview
- Toolbar shortcuts for formatting
- Word count, character count, read time
- Auto-save to localStorage
- Export as **.md** or **.html**
- Keyboard shortcuts

## Code Example

\`\`\`typescript
const greet = (name: string): string => {
  return \`Hello, \${name}! Welcome to MarkPad.\`;
};

console.log(greet("Henry"));
\`\`\`

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Bold | Ctrl + B |
| Italic | Ctrl + I |
| Save | Ctrl + S |

## Blockquote

> "The best way to get started is to quit talking and begin doing."
> — Walt Disney

## Task List

- [x] Build the editor pane
- [x] Add live preview
- [x] Implement toolbar
- [ ] Deploy to Netlify

---

*Happy writing! 🇳🇬*
`;

/* ── Compute stats ── */
function computeStats(text: string): Stats {
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const chars = text.length;
  const lines = text.split("\n").length;
  const mins = Math.max(1, Math.ceil(words / 200));
  const readTime = `${mins} min read`;
  return { words, chars, lines, readTime };
}

/* ── Toolbar button data ── */
interface ToolbarItem {
  label: string;
  title: string;
  action: (sel: string) => { text: string; offset: number };
}

const TOOLBAR: ToolbarItem[] = [
  {
    label: "B",
    title: "Bold (Ctrl+B)",
    action: (s) => ({ text: `**${s || "bold text"}**`, offset: 2 }),
  },
  {
    label: "I",
    title: "Italic (Ctrl+I)",
    action: (s) => ({ text: `_${s || "italic text"}_`, offset: 1 }),
  },
  {
    label: "S",
    title: "Strikethrough",
    action: (s) => ({ text: `~~${s || "strikethrough"}~~`, offset: 2 }),
  },
  {
    label: "H1",
    title: "Heading 1",
    action: (s) => ({ text: `# ${s || "Heading 1"}`, offset: 2 }),
  },
  {
    label: "H2",
    title: "Heading 2",
    action: (s) => ({ text: `## ${s || "Heading 2"}`, offset: 3 }),
  },
  {
    label: "H3",
    title: "Heading 3",
    action: (s) => ({ text: `### ${s || "Heading 3"}`, offset: 4 }),
  },
  {
    label: "{ }",
    title: "Inline code",
    action: (s) => ({ text: `\`${s || "code"}\``, offset: 1 }),
  },
  {
    label: "```",
    title: "Code block",
    action: (s) => ({
      text: `\`\`\`\n${s || "// code here"}\n\`\`\``,
      offset: 4,
    }),
  },
  {
    label: ">",
    title: "Blockquote",
    action: (s) => ({ text: `> ${s || "quote"}`, offset: 2 }),
  },
  {
    label: "—",
    title: "Horizontal rule",
    action: () => ({ text: "\n---\n", offset: 5 }),
  },
  {
    label: "[ ]",
    title: "Task item",
    action: (s) => ({ text: `- [ ] ${s || "task"}`, offset: 6 }),
  },
  {
    label: "🔗",
    title: "Link",
    action: (s) => ({
      text: `[${s || "link text"}](https://example.com)`,
      offset: 1,
    }),
  },
];

/* ── Main App ── */
export default function App() {
  const [markdown, setMarkdown] = useState<string>(() => {
    return localStorage.getItem("markpad-content") || DEFAULT_MD;
  });
  const [view, setView] = useState<ViewMode>("split");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const stats = computeStats(markdown);
  const html = marked(markdown) as string;

  /* Auto-save */
  useEffect(() => {
    const id = setTimeout(() => {
      localStorage.setItem("markpad-content", markdown);
    }, 800);
    return () => clearTimeout(id);
  }, [markdown]);

  /* Insert formatting at cursor */
  const insertFormat = useCallback((item: ToolbarItem) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.slice(start, end);
    const { text, offset } = item.action(selected);

    const newVal =
      ta.value.slice(0, start) + text + ta.value.slice(end);
    setMarkdown(newVal);

    requestAnimationFrame(() => {
      ta.focus();
      const cursor = start + offset + (selected.length || (text.length - offset * 2));
      ta.setSelectionRange(cursor, cursor);
    });
  }, []);

  /* Keyboard shortcuts */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "b") {
          e.preventDefault();
          insertFormat(TOOLBAR[0]);
        } else if (e.key === "i") {
          e.preventDefault();
          insertFormat(TOOLBAR[1]);
        } else if (e.key === "s") {
          e.preventDefault();
          localStorage.setItem("markpad-content", markdown);
          setSaved(true);
          setTimeout(() => setSaved(false), 1800);
        }
      }
      /* Tab → indent */
      if (e.key === "Tab") {
        e.preventDefault();
        const ta = e.currentTarget;
        const s = ta.selectionStart;
        const newVal = ta.value.slice(0, s) + "  " + ta.value.slice(s);
        setMarkdown(newVal);
        requestAnimationFrame(() => ta.setSelectionRange(s + 2, s + 2));
      }
    },
    [insertFormat, markdown]
  );

  /* Export .md */
  function exportMd() {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "document.md";
    a.click();
  }

  /* Export .html */
  function exportHtml() {
    const full = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Exported Document</title>
<style>
  body { font-family: Georgia, serif; max-width: 720px; margin: 60px auto; line-height: 1.7; color: #1a1a1a; }
  pre { background: #f4f4f4; padding: 16px; border-radius: 8px; overflow-x: auto; }
  code { font-family: monospace; font-size: 14px; }
  blockquote { border-left: 3px solid #00d9a6; margin: 0; padding: 8px 20px; background: #f0fdfb; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #e0e0e0; padding: 8px 14px; }
  th { background: #f8f8f8; }
</style>
</head>
<body>${html}</body>
</html>`;
    const blob = new Blob([full], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "document.html";
    a.click();
  }

  /* Copy HTML */
  async function copyHtml() {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  /* Clear */
  function clearDoc() {
    if (confirm("Clear the editor? This cannot be undone.")) {
      setMarkdown("");
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <span className="logo">
            <span className="logo-icon">M↓</span>
            MarkPad
          </span>
          <span className={`save-badge ${saved ? "visible" : ""}`}>Saved</span>
        </div>

        <div className="view-tabs">
          {(["editor", "split", "preview"] as ViewMode[]).map((v) => (
            <button
              key={v}
              className={`view-tab ${view === v ? "active" : ""}`}
              onClick={() => setView(v)}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="header-right">
          <button className="action-btn" onClick={copyHtml} title="Copy HTML">
            {copied ? "Copied!" : "Copy HTML"}
          </button>
          <button className="action-btn" onClick={exportMd} title="Export .md">
            .md
          </button>
          <button className="action-btn accent" onClick={exportHtml} title="Export .html">
            .html
          </button>
          <button className="action-btn danger" onClick={clearDoc} title="Clear">
            Clear
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="toolbar">
        {TOOLBAR.map((item) => (
          <button
            key={item.label}
            className="toolbar-btn"
            title={item.title}
            onMouseDown={(e) => {
              e.preventDefault();
              insertFormat(item);
            }}
          >
            {item.label}
          </button>
        ))}
        <div className="toolbar-sep" />
        <span className="stats-inline">
          {stats.words}w · {stats.chars}ch · {stats.lines}L · {stats.readTime}
        </span>
      </div>

      {/* Panes */}
      <div className={`panes panes-${view}`}>
        {view !== "preview" && (
          <div className="pane editor-pane">
            <div className="pane-label">MARKDOWN</div>
            <textarea
              ref={textareaRef}
              className="editor"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              placeholder="Start writing..."
            />
          </div>
        )}

        {view !== "editor" && (
          <div className="pane preview-pane">
            <div className="pane-label">PREVIEW</div>
            <div
              className="preview"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}
      </div>

      {/* Status bar */}
      <footer className="statusbar">
        <span>Day 56 · 300 Days of Code ·Ehindero Henry, Ibadan, Nigeria 🇳🇬</span>
        <span>Ctrl+B Bold · Ctrl+I Italic · Ctrl+S Save · Tab Indent</span>
      </footer>
    </div>
  );
}
