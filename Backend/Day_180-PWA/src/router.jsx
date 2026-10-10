import { createBrowserRouter, redirect } from "react-router-dom";
import toast from "react-hot-toast";
import { store } from "@/store";
import { fetchTodos, deleteTodo, selectTodoById } from "@/store/todosSlice";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import TaskDetail from "@/pages/TaskDetail";
import Stats from "@/pages/Stats";
import Settings from "@/pages/Settings";
import ErrorPage from "@/pages/ErrorPage";

// Root loader: make sure todos are in the store before any child route renders.
async function rootLoader() {
  if (store.getState().todos.status === "idle") await store.dispatch(fetchTodos());
  return null;
}

async function taskLoader({ params }) {
  const todo = selectTodoById(store.getState(), params.id);
  if (!todo) throw new Response("Task not found", { status: 404 });
  return { id: todo.id };
}

// Delete via <Form method="post"> on the detail page.
async function taskAction({ params, request }) {
  const form = await request.formData();
  if (form.get("intent") === "delete") {
    try {
      await store.dispatch(deleteTodo(params.id)).unwrap();
      toast.success("Task deleted");
    } catch (e) {
      toast.error(e.message || "Could not delete");
      return null;
    }
    return redirect("/tasks");
  }
  return null;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    loader: rootLoader,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "tasks", element: <Tasks /> },
      { path: "tasks/:id", element: <TaskDetail />, loader: taskLoader, action: taskAction },
      { path: "stats", element: <Stats /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]);
