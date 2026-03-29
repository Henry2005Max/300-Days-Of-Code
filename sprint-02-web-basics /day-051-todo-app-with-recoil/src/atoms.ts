import { atom, selector } from "recoil";

export type Priority = "low" | "medium" | "high";
export type Filter = "all" | "active" | "completed";

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: string;
  createdAt: number;
}

// Atoms
export const todosAtom = atom<Todo[]>({
  key: "todosAtom",
  default: [
    { id: "1", text: "Complete Day 51 Recoil todo app", completed: false, priority: "high", category: "Coding", createdAt: Date.now() - 86400000 },
    { id: "2", text: "Push sprint 2 projects to GitHub", completed: false, priority: "high", category: "Coding", createdAt: Date.now() - 72000000 },
    { id: "3", text: "Review Recoil docs and selectors", completed: true, priority: "medium", category: "Learning", createdAt: Date.now() - 50000000 },
    { id: "4", text: "Buy suya at Abuja market", completed: false, priority: "low", category: "Personal", createdAt: Date.now() - 36000000 },
    { id: "5", text: "Call Ngozi about the project brief", completed: false, priority: "medium", category: "Work", createdAt: Date.now() - 18000000 },
  ],
});

export const filterAtom = atom<Filter>({
  key: "filterAtom",
  default: "all",
});

export const searchAtom = atom<string>({
  key: "searchAtom",
  default: "",
});

export const activeCategoryAtom = atom<string>({
  key: "activeCategoryAtom",
  default: "All",
});

// Selectors
export const filteredTodosSelector = selector<Todo[]>({
  key: "filteredTodosSelector",
  get: ({ get }) => {
    const todos = get(todosAtom);
    const filter = get(filterAtom);
    const search = get(searchAtom);
    const category = get(activeCategoryAtom);

    return todos.filter((t) => {
      const matchFilter = filter === "all" || (filter === "active" ? !t.completed : t.completed);
      const matchCat = category === "All" || t.category === category;
      const matchSearch = t.text.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchCat && matchSearch;
    });
  },
});

export const statsSelector = selector({
  key: "statsSelector",
  get: ({ get }) => {
    const todos = get(todosAtom);
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const active = total - completed;
    const high = todos.filter((t) => t.priority === "high" && !t.completed).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, active, high, progress };
  },
});

export const categoryCountsSelector = selector<Record<string, number>>({
  key: "categoryCountsSelector",
  get: ({ get }) => {
    const todos = get(todosAtom);
    const counts: Record<string, number> = { All: todos.length };
    todos.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  },
});