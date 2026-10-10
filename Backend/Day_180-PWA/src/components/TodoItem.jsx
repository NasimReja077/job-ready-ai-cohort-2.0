import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FiCalendar, FiEdit2, FiTrash2, FiList } from "react-icons/fi";
import { openForm } from "@/store/uiSlice";
import { useTodoActions } from "@/hooks/useTodoActions";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn, PRIORITIES, dueState, formatDue } from "@/lib/utils";

const dueColor = { overdue: "text-red-300", today: "text-amber-300", soon: "text-cyan-300", later: "text-muted-foreground" };

export default function TodoItem({ todo }) {
  const dispatch = useDispatch();
  const { toggle, remove } = useTodoActions();
  const state = dueState(todo.dueDate, todo.completed);
  const doneSubs = todo.subtasks.filter((s) => s.done).length;
  const p = PRIORITIES[todo.priority];

  return (
    <li className="glass glass-hover animate-fade-up group flex items-start gap-3 rounded-2xl p-4">
      <Checkbox checked={todo.completed} onCheckedChange={() => toggle(todo)} className="mt-0.5" aria-label={`Mark "${todo.title}" complete`} />

      <div className="min-w-0 flex-1">
        <Link to={`/tasks/${todo.id}`} className={cn("block truncate font-medium transition", todo.completed && "text-muted-foreground line-through")}>
          {todo.title}
        </Link>
        {todo.description && <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{todo.description}</p>}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge className={p.color}>{p.label}</Badge>
          <Badge>{todo.category}</Badge>
          {todo.dueDate && (
            <span className={cn("inline-flex items-center gap-1 text-xs font-medium", state ? dueColor[state] : "text-muted-foreground")}>
              <FiCalendar className="size-3" /> {state === "overdue" && "Overdue · "}{formatDue(todo.dueDate)}
            </span>
          )}
          {todo.subtasks.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><FiList className="size-3" /> {doneSubs}/{todo.subtasks.length}</span>
          )}
          {todo.tags.map((t) => <span key={t} className="text-xs text-violet-300/80">#{t}</span>)}
        </div>
      </div>

      <div className="flex shrink-0 gap-0.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        <button aria-label="Edit task" onClick={() => dispatch(openForm(todo.id))} className="rounded-lg p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground"><FiEdit2 className="size-4" /></button>
        <button aria-label="Delete task" onClick={() => remove(todo)} className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/15 hover:text-red-300"><FiTrash2 className="size-4" /></button>
      </div>
    </li>
  );
}
