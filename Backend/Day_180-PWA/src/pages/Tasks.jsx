import { useDispatch, useSelector } from "react-redux";
import { FiPlus } from "react-icons/fi";
import { selectVisibleTodos, selectAllTodos, selectStatus } from "@/store/todosSlice";
import { openForm } from "@/store/uiSlice";
import { Button } from "@/components/ui/button";
import TodoItem from "@/components/TodoItem";
import TodoFilters from "@/components/TodoFilters";
import EmptyState from "@/components/EmptyState";

export default function Tasks() {
  const dispatch = useDispatch();
  const todos = useSelector(selectVisibleTodos);
  const all = useSelector(selectAllTodos);
  const status = useSelector(selectStatus);

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Tasks</h1>
          <p className="text-sm text-muted-foreground">{todos.length} shown · {all.length} total</p>
        </div>
        <Button className="hidden sm:inline-flex" onClick={() => dispatch(openForm())}><FiPlus /> New task</Button>
      </header>

      <TodoFilters />

      {status === "loading" && all.length === 0 ? (
        <ul className="space-y-2.5">{[1, 2, 3].map((i) => <li key={i} className="glass h-20 animate-pulse rounded-2xl" />)}</ul>
      ) : todos.length ? (
        <ul className="space-y-2.5">{todos.map((t) => <TodoItem key={t.id} todo={t} />)}</ul>
      ) : (
        <EmptyState title={all.length ? "No matching tasks" : "No tasks yet"} hint={all.length ? "Try changing or resetting your filters." : "Create your first task to get started."}>
          {!all.length && <Button onClick={() => dispatch(openForm())}><FiPlus /> New task</Button>}
        </EmptyState>
      )}
    </div>
  );
}
