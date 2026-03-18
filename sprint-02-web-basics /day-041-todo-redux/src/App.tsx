import React, { useState } from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  addTodo, toggleTodo, deleteTodo, editTodo,
  setFilter, setSearch, setActiveCategory, clearCompleted,
  Todo, Priority, Filter,
} from "./store/todosSlice";
import "./App.css";

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = ["All", "Coding", "Learning", "Work", "Personal", "Health"];
const PRIORITIES: Priority[] = ["high", "medium", "low"];

// ─── Add Todo Form ────────────────────────────────────────────────────────────

const AddTodoForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState("Coding");
  const [dueDate, setDueDate] = useState("");
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    dispatch(addTodo({ text: text.trim(), priority, category, dueDate: dueDate || undefined }));
    setText("");
    setDueDate("");
    setExpanded(false);
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <div className="add-row">
        <input
          className="add-input"
          placeholder="Add a new task..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setExpanded(true)}
        />
        <button type="submit" className="add-btn" disabled={!text.trim()}>Add</button>
      </div>
      {expanded && (
        <div className="add-options">
          <div className="option-group">
            <label className="option-label">Priority</label>
            <div className="priority-btns">
              {PRIORITIES.map((p) => (
                <button key={p} type="button"
                  className={`priority-btn priority-${p} ${priority === p ? "active" : ""}`}
                  onClick={() => setPriority(p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="option-group">
            <label className="option-label">Category</label>
            <select className="option-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="option-group">
            <label className="option-label">Due Date</label>
            <input type="date" className="option-select" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
      )}
    </form>
  );
};

// ─── Todo Item ────────────────────────────────────────────────────────────────

const TodoItem: React.FC<{ todo: Todo }> = ({ todo }) => {
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const saveEdit = () => {
    if (editText.trim()) dispatch(editTodo({ id: todo.id, text: editText.trim() }));
    setEditing(false);
  };

  const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date();

  return (
    <div className={`todo-item ${todo.completed ? "completed" : ""} priority-border-${todo.priority}`}>
      <button className={`todo-check ${todo.completed ? "checked" : ""}`} onClick={() => dispatch(toggleTodo(todo.id))}>
        {todo.completed && <span>✓</span>}
      </button>

      <div className="todo-body">
        {editing ? (
          <input
            className="edit-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(false); }}
            autoFocus
          />
        ) : (
          <span className="todo-text" onDoubleClick={() => setEditing(true)}>{todo.text}</span>
        )}

        <div className="todo-meta">
          <span className={`todo-category`}>{todo.category}</span>
          <span className={`todo-priority priority-tag-${todo.priority}`}>{todo.priority}</span>
          {todo.dueDate && (
            <span className={`todo-due ${isOverdue ? "overdue" : ""}`}>
              {isOverdue ? "⚠ " : ""}Due {todo.dueDate}
            </span>
          )}
        </div>
      </div>

      <div className="todo-actions">
        <button className="action-btn edit-btn" onClick={() => setEditing(true)} title="Edit">✎</button>
        <button className="action-btn delete-btn" onClick={() => dispatch(deleteTodo(todo.id))} title="Delete">✕</button>
      </div>
    </div>
  );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────

const StatsBar: React.FC = () => {
  const items = useAppSelector((s) => s.todos.items);
  const total = items.length;
  const completed = items.filter((t) => t.completed).length;
  const active = total - completed;
  const high = items.filter((t) => t.priority === "high" && !t.completed).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="stats-bar">
      <div className="stats-row">
        <div className="stat"><span className="stat-val">{total}</span><span className="stat-lbl">Total</span></div>
        <div className="stat"><span className="stat-val active-val">{active}</span><span className="stat-lbl">Active</span></div>
        <div className="stat"><span className="stat-val done-val">{completed}</span><span className="stat-lbl">Done</span></div>
        <div className="stat"><span className="stat-val high-val">{high}</span><span className="stat-lbl">High Priority</span></div>
      </div>
      <div className="progress-wrap">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-label">{progress}% complete</span>
      </div>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────

const TodoApp: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, filter, search, activeCategory } = useAppSelector((s) => s.todos);

  const filtered = items.filter((t) => {
    const matchFilter = filter === "all" || (filter === "active" ? !t.completed : t.completed);
    const matchCat = activeCategory === "All" || t.category === activeCategory;
    const matchSearch = t.text.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchCat && matchSearch;
  });

  const completedCount = items.filter((t) => t.completed).length;

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="header-day">Day 41</span>
          <h1 className="header-title">Todo — Redux Toolkit</h1>
          <span className="header-sprint">Sprint 2 — Web Basics</span>
        </div>
      </header>

      <main className="main">
        <div className="layout">
          {/* Left — Sidebar */}
          <aside className="sidebar">
            <StatsBar />

            <div className="sidebar-section">
              <h3 className="sidebar-heading">Categories</h3>
              {CATEGORIES.map((cat) => {
                const count = cat === "All" ? items.length : items.filter((t) => t.category === cat).length;
                return (
                  <button key={cat}
                    className={`cat-btn ${activeCategory === cat ? "active" : ""}`}
                    onClick={() => dispatch(setActiveCategory(cat))}>
                    <span>{cat}</span>
                    <span className="cat-count">{count}</span>
                  </button>
                );
              })}
            </div>

            {completedCount > 0 && (
              <button className="clear-btn" onClick={() => dispatch(clearCompleted())}>
                Clear {completedCount} completed
              </button>
            )}
          </aside>

          {/* Right — Todos */}
          <div className="todos-panel">
            <AddTodoForm />

            {/* Search + Filter */}
            <div className="toolbar">
              <input
                className="search-input"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => dispatch(setSearch(e.target.value))}
              />
              <div className="filter-btns">
                {(["all", "active", "completed"] as Filter[]).map((f) => (
                  <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`}
                    onClick={() => dispatch(setFilter(f))}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="todos-list">
              {filtered.length === 0 ? (
                <div className="empty-state">
                  {search ? `No tasks matching "${search}"` : "No tasks here. Add one above!"}
                </div>
              ) : (
                filtered.map((todo) => <TodoItem key={todo.id} todo={todo} />)
              )}
            </div>

            <div className="list-footer">
              {filtered.length} task{filtered.length !== 1 ? "s" : ""} shown
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <Provider store={store}>
    <TodoApp />
  </Provider>
);

export default App;