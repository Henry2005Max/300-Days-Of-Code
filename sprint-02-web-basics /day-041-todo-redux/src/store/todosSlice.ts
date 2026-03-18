import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Priority = "low" | "medium" | "high";
export type Filter = "all" | "active" | "completed";

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: string;
  createdAt: number;
  dueDate?: string;
}

interface TodosState {
  items: Todo[];
  filter: Filter;
  search: string;
  activeCategory: string;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: TodosState = {
  items: [
    { id: "1", text: "Complete Day 41 Redux todo app", completed: false, priority: "high", category: "Coding", createdAt: Date.now() - 86400000 },
    { id: "2", text: "Push all sprint 2 projects to GitHub", completed: false, priority: "high", category: "Coding", createdAt: Date.now() - 72000000 },
    { id: "3", text: "Review Tailwind CSS documentation", completed: true, priority: "medium", category: "Learning", createdAt: Date.now() - 50000000 },
    { id: "4", text: "Buy groceries at Lagos Island market", completed: false, priority: "medium", category: "Personal", createdAt: Date.now() - 36000000 },
    { id: "5", text: "Call Emeka about the freelance project", completed: false, priority: "low", category: "Work", createdAt: Date.now() - 18000000 },
    { id: "6", text: "Read React docs on useReducer", completed: true, priority: "low", category: "Learning", createdAt: Date.now() - 7200000 },
  ],
  filter: "all",
  search: "",
  activeCategory: "All",
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    addTodo: (state, action: PayloadAction<{ text: string; priority: Priority; category: string; dueDate?: string }>) => {
      state.items.push({
        id: Date.now().toString(),
        text: action.payload.text,
        completed: false,
        priority: action.payload.priority,
        category: action.payload.category,
        dueDate: action.payload.dueDate,
        createdAt: Date.now(),
      });
    },
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.items.find((t) => t.id === action.payload);
      if (todo) todo.completed = !todo.completed;
    },
    deleteTodo: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
    editTodo: (state, action: PayloadAction<{ id: string; text: string }>) => {
      const todo = state.items.find((t) => t.id === action.payload.id);
      if (todo) todo.text = action.payload.text;
    },
    setPriority: (state, action: PayloadAction<{ id: string; priority: Priority }>) => {
      const todo = state.items.find((t) => t.id === action.payload.id);
      if (todo) todo.priority = action.payload.priority;
    },
    setFilter: (state, action: PayloadAction<Filter>) => {
      state.filter = action.payload;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setActiveCategory: (state, action: PayloadAction<string>) => {
      state.activeCategory = action.payload;
    },
    clearCompleted: (state) => {
      state.items = state.items.filter((t) => !t.completed);
    },
    reorderTodo: (state, action: PayloadAction<{ from: number; to: number }>) => {
      const { from, to } = action.payload;
      const [moved] = state.items.splice(from, 1);
      state.items.splice(to, 0, moved);
    },
  },
});

export const {
  addTodo, toggleTodo, deleteTodo, editTodo, setPriority,
  setFilter, setSearch, setActiveCategory, clearCompleted, reorderTodo,
} = todosSlice.actions;

export default todosSlice.reducer;