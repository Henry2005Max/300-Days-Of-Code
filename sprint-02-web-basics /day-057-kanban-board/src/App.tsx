import React, { useState, useRef, useEffect } from "react";

/* ── Types ── */
type Priority = "low" | "medium" | "high";
type ColumnId = "todo" | "inprogress" | "done";

interface Card {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  tag: string;
  createdAt: number;
}

interface Column {
  id: ColumnId;
  label: string;
  accent: string;
}

/* ── Constants ── */
const COLUMNS: Column[] = [
  { id: "todo", label: "To Do", accent: "#6c6af6" },
  { id: "inprogress", label: "In Progress", accent: "#f0a500" },
  { id: "done", label: "Done", accent: "#22c97a" },
];

const TAGS = ["Feature", "Bug", "Docs", "Design", "Research", "DevOps", "Testing"];

const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const DEFAULT_BOARD: Record<ColumnId, Card[]> = {
  todo: [
    {
      id: "c1",
      title: "Set up Sprint 3 Node.js boilerplate",
      description: "Express + TypeScript base project with ts-node and nodemon",
      priority: "high",
      tag: "Feature",
      createdAt: Date.now() - 86400000,
    },
    {
      id: "c2",
      title: "Write GDG Week 5 lesson plan",
      description: "React Native core components — View, Text, Image, ScrollView",
      priority: "medium",
      tag: "Docs",
      createdAt: Date.now() - 43200000,
    },
    {
      id: "c3",
      title: "Push Day 50–56 to GitHub",
      description: "Upload remaining Sprint 2 projects and update progress tracker",
      priority: "low",
      tag: "DevOps",
      createdAt: Date.now() - 21600000,
    },
  ],
  inprogress: [
    {
      id: "c4",
      title: "Potio Beauty — email notifications",
      description: "Integrate Resend for order confirmation and shipping updates",
      priority: "high",
      tag: "Feature",
      createdAt: Date.now() - 7200000,
    },
    {
      id: "c5",
      title: "ESP32 OLED conflict fix",
      description: "Resolve SPI/I2C pin conflict between RFID RC522 and OLED display",
      priority: "medium",
      tag: "Bug",
      createdAt: Date.now() - 3600000,
    },
  ],
  done: [
    {
      id: "c6",
      title: "Day 56 — Markdown Editor",
      description: "Live split-pane MDX editor with toolbar, export, and localStorage",
      priority: "low",
      tag: "Feature",
      createdAt: Date.now() - 1800000,
    },
  ],
};

/* ── Helpers ── */
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function loadBoard(): Record<ColumnId, Card[]> {
  try {
    const saved = localStorage.getItem("kanban-board");
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_BOARD;
}

function saveBoard(board: Record<ColumnId, Card[]>) {
  localStorage.setItem("kanban-board", JSON.stringify(board));
}

/* ── Card Form Modal ── */
interface CardFormProps {
  initial?: Partial<Card>;
  onSave: (card: Omit<Card, "id" | "createdAt">) => void;
  onClose: () => void;
}

function CardForm({ initial, onSave, onClose }: CardFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "medium");
  const [tag, setTag] = useState(initial?.tag ?? "Feature");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim(), priority, tag });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initial?.title ? "Edit Card" : "New Card"}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="card-form">
          <label className="form-label">
            Title
            <input
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              required
            />
          </label>
          <label className="form-label">
            Description
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details..."
              rows={3}
            />
          </label>
          <div className="form-row">
            <label className="form-label">
              Priority
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label className="form-label">
              Tag
              <select
                className="form-select"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              >
                {TAGS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">
              {initial?.title ? "Save changes" : "Add card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── KanbanCard ── */
interface KanbanCardProps {
  card: Card;
  columnId: ColumnId;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  isDragging: boolean;
}

function KanbanCard({ card, onEdit, onDelete, onDragStart, isDragging }: KanbanCardProps) {
  return (
    <div
      className={`card ${isDragging ? "card-dragging" : ""}`}
      draggable
      onDragStart={onDragStart}
    >
      <div className="card-top">
        <span className={`card-tag tag-${card.tag.toLowerCase().replace(/\s/g, "")}`}>
          {card.tag}
        </span>
        <span className={`card-priority priority-${card.priority}`}>
          {PRIORITY_LABEL[card.priority]}
        </span>
      </div>
      <p className="card-title">{card.title}</p>
      {card.description && (
        <p className="card-desc">{card.description}</p>
      )}
      <div className="card-footer">
        <button className="card-btn" onClick={onEdit} title="Edit">✎</button>
        <button className="card-btn card-btn-delete" onClick={onDelete} title="Delete">✕</button>
      </div>
    </div>
  );
}

/* ── Main App ── */
export default function App() {
  const [board, setBoard] = useState<Record<ColumnId, Card[]>>(loadBoard);
  const [addingTo, setAddingTo] = useState<ColumnId | null>(null);
  const [editing, setEditing] = useState<{ colId: ColumnId; card: Card } | null>(null);
  const [dragCard, setDragCard] = useState<{ cardId: string; fromCol: ColumnId } | null>(null);
  const [dragOver, setDragOver] = useState<ColumnId | null>(null);

  useEffect(() => saveBoard(board), [board]);

  /* Total counts */
  const total = Object.values(board).reduce((s, col) => s + col.length, 0);
  const doneCount = board.done.length;

  /* Add card */
  function addCard(colId: ColumnId, data: Omit<Card, "id" | "createdAt">) {
    const card: Card = { ...data, id: uid(), createdAt: Date.now() };
    setBoard((b) => ({ ...b, [colId]: [...b[colId], card] }));
    setAddingTo(null);
  }

  /* Edit card */
  function updateCard(colId: ColumnId, cardId: string, data: Omit<Card, "id" | "createdAt">) {
    setBoard((b) => ({
      ...b,
      [colId]: b[colId].map((c) => (c.id === cardId ? { ...c, ...data } : c)),
    }));
    setEditing(null);
  }

  /* Delete card */
  function deleteCard(colId: ColumnId, cardId: string) {
    setBoard((b) => ({ ...b, [colId]: b[colId].filter((c) => c.id !== cardId) }));
  }

  /* Drag handlers */
  function handleDragStart(e: React.DragEvent, cardId: string, fromCol: ColumnId) {
    setDragCard({ cardId, fromCol });
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, colId: ColumnId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(colId);
  }

  function handleDrop(e: React.DragEvent, toCol: ColumnId) {
    e.preventDefault();
    if (!dragCard || dragCard.fromCol === toCol) {
      setDragCard(null);
      setDragOver(null);
      return;
    }
    const { cardId, fromCol } = dragCard;
    setBoard((b) => {
      const card = b[fromCol].find((c) => c.id === cardId);
      if (!card) return b;
      return {
        ...b,
        [fromCol]: b[fromCol].filter((c) => c.id !== cardId),
        [toCol]: [...b[toCol], card],
      };
    });
    setDragCard(null);
    setDragOver(null);
  }

  function handleDragEnd() {
    setDragCard(null);
    setDragOver(null);
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <span className="logo">⬛ Taskflow</span>
          <span className="header-sub">Sprint Board</span>
        </div>
        <div className="header-stats">
          <span className="stat-chip">{total} cards</span>
          <span className="stat-chip done-chip">{doneCount} done</span>
          {total > 0 && (
            <span className="stat-chip progress-chip">
              {Math.round((doneCount / total) * 100)}%
            </span>
          )}
        </div>
      </header>

      {/* Progress bar */}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: total > 0 ? `${(doneCount / total) * 100}%` : "0%" }}
        />
      </div>

      {/* Board */}
      <div className="board">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className={`column ${dragOver === col.id ? "column-dragover" : ""}`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragLeave={() => setDragOver(null)}
          >
            {/* Column header */}
            <div className="col-header">
              <div className="col-title-row">
                <span className="col-dot" style={{ background: col.accent }} />
                <span className="col-title">{col.label}</span>
                <span className="col-count">{board[col.id].length}</span>
              </div>
              <button
                className="col-add-btn"
                onClick={() => setAddingTo(col.id)}
                title="Add card"
              >
                +
              </button>
            </div>

            {/* Drop hint */}
            {dragOver === col.id && dragCard?.fromCol !== col.id && (
              <div className="drop-hint">Drop here</div>
            )}

            {/* Cards */}
            <div className="cards-list">
              {board[col.id].length === 0 && dragOver !== col.id && (
                <div className="empty-col">No cards yet</div>
              )}
              {board[col.id].map((card) => (
                <KanbanCard
                  key={card.id}
                  card={card}
                  columnId={col.id}
                  isDragging={dragCard?.cardId === card.id}
                  onDragStart={(e) => handleDragStart(e, card.id, col.id)}
                  onEdit={() => setEditing({ colId: col.id, card })}
                  onDelete={() => deleteCard(col.id, card.id)}
                />
              ))}
            </div>

            {/* Inline add shortcut */}
            <button className="col-footer-btn" onClick={() => setAddingTo(col.id)}>
              + Add card
            </button>
          </div>
        ))}
      </div>

      {/* Status bar */}
      <footer className="statusbar">
        <span>Day 57 · 300 Days of Code · Lagos, Nigeria 🇳🇬</span>
        <span>Drag cards between columns · Click ✎ to edit · Click ✕ to delete</span>
      </footer>

      {/* Add modal */}
      {addingTo && (
        <CardForm
          onSave={(data) => addCard(addingTo, data)}
          onClose={() => setAddingTo(null)}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <CardForm
          initial={editing.card}
          onSave={(data) => updateCard(editing.colId, editing.card.id, data)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}