import { get, post, patch, del } from "@/lib/fetcher";

export const todosApi = {
  list: () => get("/todos"),
  create: (data) => post("/todos", data),
  update: (id, data) => patch(`/todos/${id}`, data),
  remove: (id) => del(`/todos/${id}`),
  clearCompleted: () => del("/todos?completed=true"),
  import: (list) => post("/todos/import", list),
};
