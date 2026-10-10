/**
 * Offline "server": a custom axios adapter that answers REST-style calls from
 * localStorage. Same shapes a real backend would return.
 *
 *   GET    /todos            → Todo[]
 *   POST   /todos            → Todo
 *   PATCH  /todos/:id        → Todo
 *   DELETE /todos/:id        → { id }
 *   DELETE /todos?completed  → { removed: number }
 *   POST   /todos/import     → Todo[]
 */
import { uid } from "./utils";

const KEY = "taskflow:todos";

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? seed();
  } catch {
    return seed();
  }
};
const write = (todos) => localStorage.setItem(KEY, JSON.stringify(todos));

function seed() {
  const now = new Date();
  const day = (n) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + n); // local date, not UTC
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const mk = (title, extra = {}) => ({
    id: uid(),
    title,
    description: "",
    completed: false,
    priority: "medium",
    category: "Personal",
    dueDate: null,
    tags: [],
    subtasks: [],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    completedAt: null,
    ...extra,
  });
  const todos = [
    mk("Welcome to TaskFlow 👋", {
      description: "Tap the circle to complete a task. Open a task to edit subtasks, tags and more.",
      priority: "high",
      dueDate: day(0),
      tags: ["welcome"],
      subtasks: [
        { id: uid(), title: "Create your first task", done: false },
        { id: uid(), title: "Install the app (Add to Home Screen)", done: false },
      ],
    }),
    mk("Finish Data Structures assignment", { category: "Study", priority: "high", dueDate: day(2), tags: ["dsa"] }),
    mk("Plan the week", { category: "Work", dueDate: day(-1) }),
    mk("Evening walk", { category: "Health", priority: "low", dueDate: day(1) }),
  ];
  write(todos);
  return todos;
}

const respond = (config, status, data) => ({
  data,
  status,
  statusText: status < 400 ? "OK" : "Error",
  headers: {},
  config,
  request: {},
});

const fail = (config, status, message) => {
  const response = respond(config, status, { message });
  return Promise.reject(Object.assign(new Error(message), { config, response, isAxiosError: true }));
};

export async function mockAdapter(config) {
  await new Promise((r) => setTimeout(r, 120)); // feel like a network
  const path = (config.url || "").replace(/^\/?api/, "");
  const method = (config.method || "get").toLowerCase();
  const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data || {};
  const [route, query = ""] = path.split("?");
  const parts = route.split("/").filter(Boolean); // ["todos", ":id"?]
  if (parts[0] !== "todos") return fail(config, 404, "Not found");

  const todos = read();
  const id = parts[1];

  if (method === "get" && !id) return respond(config, 200, todos);

  if (method === "post" && id === "import") {
    const list = Array.isArray(body) ? body : [];
    const merged = [...list.map((t) => ({ ...t, id: t.id || uid() })), ...todos.filter((t) => !list.some((i) => i.id === t.id))];
    write(merged);
    return respond(config, 200, merged);
  }

  if (method === "post" && !id) {
    const now = new Date().toISOString();
    const todo = {
      description: "", completed: false, priority: "medium", category: "Personal",
      dueDate: null, tags: [], subtasks: [], completedAt: null,
      ...body, id: uid(), createdAt: now, updatedAt: now,
    };
    write([todo, ...todos]);
    return respond(config, 201, todo);
  }

  if (method === "patch" && id) {
    const i = todos.findIndex((t) => t.id === id);
    if (i < 0) return fail(config, 404, "Task not found");
    const prev = todos[i];
    const next = { ...prev, ...body, id, updatedAt: new Date().toISOString() };
    if (body.completed !== undefined && body.completed !== prev.completed) {
      next.completedAt = body.completed ? new Date().toISOString() : null;
    }
    todos[i] = next;
    write(todos);
    return respond(config, 200, next);
  }

  if (method === "delete" && id) {
    if (!todos.some((t) => t.id === id)) return fail(config, 404, "Task not found");
    write(todos.filter((t) => t.id !== id));
    return respond(config, 200, { id });
  }

  if (method === "delete" && !id && query.includes("completed")) {
    const keep = todos.filter((t) => !t.completed);
    write(keep);
    return respond(config, 200, { removed: todos.length - keep.length });
  }

  return fail(config, 405, "Method not allowed");
}
