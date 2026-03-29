import React, { useState } from "react";
import { RecoilRoot, useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  todosAtom, filterAtom, searchAtom, activeCategoryAtom,
  filteredTodosSelector, statsSelector, categoryCountsSelector,
  Todo, Priority, Filter,
} from "./atoms";
import "./App.css";

const CATEGORIES = ["All", "Coding", "Learning", "Work", "Personal", "Health"];
const PRIORITIES: Priority[] = ["high", "medium", "low"];

// Add Form
const AddForm: React.FC = () => {
  const setTodos = useSetRecoilState(todosAtom);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState("Coding");
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setTodos((prev) => [...prev, {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false,
      priority,
      category,
      createdAt: Date.now(),
    }]);
    setText("");
    setExpanded(false);
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <div className="add-row">
        <input className="add-input" placeholder="Add a new task..."
          value={text} onChange={(e) => setText(e.target.value)}
          onFocus={() => setExpanded(true)} />
        <button type="submit" className="add-btn" disabled={!text.trim()}>Add</button>
      </div>
      {expanded && (
        <div className="add-options">
          <div className="opt-group">
            <label className="opt-label">Priority</label>
            <div className="priority-btns">
              {PRIORITIES.map((p) => (
                <button key={p} type="button"
                  className={`pri-btn pri-${p} ${priority === p ? "active" : ""}`}
                  onClick={() => setPriority(p)}>{p}</button>
              ))}
            </div>
          </div>
          <div className="opt-group">
            <label className="opt-label">Category</label>
            <select className="opt-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}
    </form>
  );
};

// Todo Item
const TodoItem: React.FC<{ todo: Todo }> = ({ todo }) => {
  const setTodos = useSetRecoilState(todosAtom);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const toggle = () => setTodos((prev) => prev.map((t) => t.id === todo.id ? { ...t, completed: !t.completed } : t));
  const remove = () => setTodos((prev) => prev.filter((t) => t.id !== todo.id));
  const save = () => {
    if (editText.trim()) setTodos((prev) => prev.map((t) => t.id === todo.id ? { ...t, text: editText.trim() } : t));
    setEditing(false);
  };

  return (
    <div className={`todo-item pri-border-${todo.priority} ${todo.completed ? "completed" : ""}`}>
      <button className={`check-btn ${todo.completed ? "checked" : ""}`} onClick={toggle}>
        {todo.completed && "✓"}
      </button>
      <div className="todo-body">
        {editing ? (
          <input className="edit-input" value={editText} autoFocus
            onChange={(e) => setEditText(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }} />
        ) : (
          <span className="todo-text" onDoubleClick={() => setEditing(true)}>{todo.text}</span>
        )}
        <div className="todo-meta">
          <span className="meta-cat">{todo.category}</span>
          <span className={`meta-pri pri-tag-${todo.priority}`}>{todo.priority}</span>
        </div>
      </div>
      <div className="todo-actions">
        <button className="act-btn edit" onClick={() => setEditing(true)}>✎</button>
        <button className="act-btn del" onClick={remove}>✕</button>
      </div>
    </div>
  );
};

// Stats Bar
const StatsBar: React.FC = () => {
  const stats = useRecoilValue(statsSelector);
  return (
    <div className="stats-bar">
      <div className="stats-row">
        <div className="stat"><span className="stat-v">{stats.total}</span><span className="stat-l">Total</span></div>
        <div className="stat"><span className="stat-v act-v">{stats.active}</span><span className="stat-l">Active</span></div>
        <div className="stat"><span className="stat-v done-v">{stats.completed}</span><span className="stat-l">Done</span></div>
        <div className="stat"><span className="stat-v high-v">{stats.high}</span><span className="stat-l">High</span></div>
      </div>
      <div className="progress-wrap">
        <div className="progress-track"><div className="progress-fill" style={{ width: `${stats.progress}%` }} /></div>
        <span className="progress-lbl">{stats.progress}%</span>
      </div>
    </div>
  );
};

// Category Sidebar
const CategorySidebar: React.FC = () => {
  const [activeCategory, setActiveCategory] = useRecoilState(activeCategoryAtom);
  const counts = useRecoilValue(categoryCountsSelector);
  const setTodos = useSetRecoilState(todosAtom);
  const stats = useRecoilValue(statsSelector);

  return (
    <aside className="sidebar">
      <StatsBar />
      <div className="sidebar-section">
        <h3 className="sidebar-heading">Categories</h3>
        {CATEGORIES.map((cat) => (
          <button key={cat} className={`cat-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}>
            <span>{cat}</span>
            <span className="cat-count">{counts[cat] ?? 0}</span>
          </button>
        ))}
      </div>
      {stats.completed > 0 && (
        <button className="clear-btn"
          onClick={() => setTodos((prev) => prev.filter((t) => !t.completed))}>
          Clear {stats.completed} completed
        </button>
      )}
    </aside>
  );
};

// Recoil vs Redux comparison panel
const RecoilInfo: React.FC = () => (
  <div className="info-panel">
    <h3 className="info-title">Recoil vs Redux Toolkit</h3>
    <div className="info-rows">
      {[
        ["Setup", "Just RecoilRoot", "configureStore + Provider"],
        ["State unit", "Atom (per item)", "Slice (grouped)"],
        ["Derived state", "Selector", "createSelector"],
        ["Updates", "useSetRecoilState", "dispatch(action)"],
        ["DevTools", "Recoil DevTools", "Redux DevTools"],
        ["Best for", "Scattered atom state", "Complex action flows"],
      ].map(([topic, recoil, redux]) => (
        <div key={topic} className="info-row">
          <span className="info-topic">{topic}</span>
          <span className="info-recoil">{recoil}</span>
          <span className="info-redux">{redux}</span>
        </div>
      ))}
    </div>
  </div>
);

// Main App
const TodoApp: React.FC = () => {
  const [filter, setFilter] = useRecoilState(filterAtom);
  const [search, setSearch] = useRecoilState(searchAtom);
  const filtered = useRecoilValue(filteredTodosSelector);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="header-day">Day 51</span>
          <h1 className="header-title">Todo — Recoil</h1>
          <span className="header-sprint">Sprint 2 — Web Basics</span>
        </div>
      </header>

      <main className="main">
        <div className="layout">
          <CategorySidebar />

          <div className="todos-col">
            <AddForm />

            <div className="toolbar">
              <input className="search-input" placeholder="Search tasks..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
              <div className="filter-btns">
                {(["all", "active", "completed"] as Filter[]).map((f) => (
                  <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`}
                    onClick={() => setFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="todos-list">
              {filtered.length === 0 ? (
                <div className="empty">No tasks here.</div>
              ) : (
                filtered.map((t) => <TodoItem key={t.id} todo={t} />)
              )}
            </div>
            <div className="list-footer">{filtered.length} task{filtered.length !== 1 ? "s" : ""} shown</div>

            <RecoilInfo />
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <RecoilRoot>
    <TodoApp />
  </RecoilRoot>
);

export default App;