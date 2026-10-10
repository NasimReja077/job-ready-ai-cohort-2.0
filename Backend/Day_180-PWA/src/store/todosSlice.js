import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from "@reduxjs/toolkit";
import { todosApi } from "@/api/todosApi";
import { PRIORITIES, dueState } from "@/lib/utils";

const adapter = createEntityAdapter();

export const fetchTodos = createAsyncThunk("todos/fetch", () => todosApi.list(), {
  condition: (_, { getState }) => getState().todos.status !== "loading",
});
export const addTodo = createAsyncThunk("todos/add", (data, { rejectWithValue }) =>
  todosApi.create(data).catch(rejectWithValue)
);
export const updateTodo = createAsyncThunk("todos/update", ({ id, changes }, { rejectWithValue }) =>
  todosApi.update(id, changes).catch(rejectWithValue)
);
export const deleteTodo = createAsyncThunk("todos/delete", (id, { rejectWithValue }) =>
  todosApi.remove(id).catch(rejectWithValue)
);
export const clearCompleted = createAsyncThunk("todos/clearCompleted", () => todosApi.clearCompleted());
export const importTodos = createAsyncThunk("todos/import", (list) => todosApi.import(list));

const initialFilters = { query: "", status: "all", priority: "all", category: "all", sort: "smart" };

const slice = createSlice({
  name: "todos",
  initialState: adapter.getInitialState({ status: "idle", error: null, filters: initialFilters }),
  reducers: {
    setFilter(state, { payload }) {
      state.filters = { ...state.filters, ...payload };
    },
    resetFilters(state) {
      state.filters = initialFilters;
    },
    // optimistic toggle for instant UI
    toggleLocal(state, { payload: id }) {
      const t = state.entities[id];
      if (t) t.completed = !t.completed;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchTodos.pending, (s) => { s.status = "loading"; })
      .addCase(fetchTodos.fulfilled, (s, { payload }) => { s.status = "ready"; adapter.setAll(s, payload); })
      .addCase(fetchTodos.rejected, (s, a) => { s.status = "failed"; s.error = a.error.message; })
      .addCase(addTodo.fulfilled, adapter.addOne)
      .addCase(updateTodo.fulfilled, (s, { payload }) => adapter.setOne(s, payload))
      .addCase(deleteTodo.fulfilled, (s, { payload }) => adapter.removeOne(s, payload.id))
      .addCase(clearCompleted.fulfilled, (s) => {
        adapter.removeMany(s, s.ids.filter((id) => s.entities[id].completed));
      })
      .addCase(importTodos.fulfilled, (s, { payload }) => adapter.setAll(s, payload));
  },
});

export const { setFilter, resetFilters, toggleLocal } = slice.actions;
export default slice.reducer;

// ---------- selectors ----------
export const { selectAll: selectAllTodos, selectById: selectTodoById } = adapter.getSelectors((s) => s.todos);
export const selectFilters = (s) => s.todos.filters;
export const selectStatus = (s) => s.todos.status;

export const selectVisibleTodos = createSelector([selectAllTodos, selectFilters], (todos, f) => {
  const q = f.query.trim().toLowerCase();
  let list = todos.filter((t) => {
    if (f.status === "active" && t.completed) return false;
    if (f.status === "completed" && !t.completed) return false;
    if (f.status === "overdue" && dueState(t.dueDate, t.completed) !== "overdue") return false;
    if (f.priority !== "all" && t.priority !== f.priority) return false;
    if (f.category !== "all" && t.category !== f.category) return false;
    if (q && !`${t.title} ${t.description} ${t.tags.join(" ")}`.toLowerCase().includes(q)) return false;
    return true;
  });
  const byDue = (a, b) => (a.dueDate || "9999") .localeCompare(b.dueDate || "9999");
  const sorters = {
    smart: (a, b) =>
      Number(a.completed) - Number(b.completed) ||
      PRIORITIES[b.priority].rank - PRIORITIES[a.priority].rank ||
      byDue(a, b),
    due: (a, b) => Number(a.completed) - Number(b.completed) || byDue(a, b),
    priority: (a, b) => PRIORITIES[b.priority].rank - PRIORITIES[a.priority].rank,
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    title: (a, b) => a.title.localeCompare(b.title),
  };
  return [...list].sort(sorters[f.sort] || sorters.smart);
});

export const selectStats = createSelector([selectAllTodos], (todos) => {
  const total = todos.length;
  const done = todos.filter((t) => t.completed).length;
  const overdue = todos.filter((t) => dueState(t.dueDate, t.completed) === "overdue").length;
  const today = todos.filter((t) => dueState(t.dueDate, t.completed) === "today").length;
  const byCategory = {};
  const byPriority = { high: 0, medium: 0, low: 0 };
  todos.forEach((t) => {
    byCategory[t.category] = (byCategory[t.category] || 0) + 1;
    if (!t.completed) byPriority[t.priority]++;
  });
  // completions over last 7 days
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      key,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      count: todos.filter((t) => t.completedAt?.slice(0, 10) === key).length,
    };
  });
  return { total, done, active: total - done, overdue, today, rate: total ? Math.round((done / total) * 100) : 0, byCategory, byPriority, week };
});
