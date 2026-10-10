import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { addTodo, updateTodo, deleteTodo, toggleLocal } from "@/store/todosSlice";

export function useTodoActions() {
  const dispatch = useDispatch();

  const toggle = async (todo) => {
    dispatch(toggleLocal(todo.id)); // optimistic
    try {
      await dispatch(updateTodo({ id: todo.id, changes: { completed: !todo.completed } })).unwrap();
      if (!todo.completed) toast.success("Nice! Task completed 🎉", { id: `done-${todo.id}` });
    } catch (e) {
      dispatch(toggleLocal(todo.id)); // rollback
      toast.error(e.message || "Could not update task");
    }
  };

  const remove = async (todo) => {
    try {
      await dispatch(deleteTodo(todo.id)).unwrap();
      toast((t) => (
        <span className="flex items-center gap-3">
          Task deleted
          <button
            className="font-semibold text-violet-300 underline-offset-2 hover:underline"
            onClick={async () => {
              toast.dismiss(t.id);
              const { id, createdAt, updatedAt, ...rest } = todo;
              await dispatch(addTodo(rest));
              toast.success("Restored");
            }}
          >
            Undo
          </button>
        </span>
      ));
    } catch (e) {
      toast.error(e.message || "Could not delete task");
    }
  };

  const save = async (id, changes) => {
    try {
      const action = id ? updateTodo({ id, changes }) : addTodo(changes);
      const saved = await dispatch(action).unwrap();
      toast.success(id ? "Task updated" : "Task added");
      return saved;
    } catch (e) {
      toast.error(e.message || "Could not save task");
      return null;
    }
  };

  return { toggle, remove, save };
}
