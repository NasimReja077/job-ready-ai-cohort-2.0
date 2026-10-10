import { Form, Link, useLoaderData, useNavigation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiArrowLeft, FiEdit2, FiTrash2, FiCalendar, FiClock } from "react-icons/fi";
import { selectTodoById } from "@/store/todosSlice";
import { openForm } from "@/store/uiSlice";
import { useTodoActions } from "@/hooks/useTodoActions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn, PRIORITIES, formatDue, dueState } from "@/lib/utils";

export default function TaskDetail() {
  const { id } = useLoaderData();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const todo = useSelector((s) => selectTodoById(s, id));
  const { toggle, save } = useTodoActions();
  if (!todo) return null; // deleted — router action is redirecting

  const toggleSub = (sid) =>
    save(todo.id, { subtasks: todo.subtasks.map((s) => (s.id === sid ? { ...s, done: !s.done } : s)) });
  const p = PRIORITIES[todo.priority];
  const done = todo.subtasks.filter((s) => s.done).length;

  return (
    <div className="space-y-5">
      <Link to="/tasks" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><FiArrowLeft /> Back to tasks</Link>

      <article className="glass space-y-5 rounded-3xl p-6">
        <div className="flex items-start gap-3">
          <Checkbox checked={todo.completed} onCheckedChange={() => toggle(todo)} className="mt-1.5 size-6" />
          <h1 className={cn("flex-1 text-2xl font-extrabold sm:text-3xl", todo.completed && "text-muted-foreground line-through")}>{todo.title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className={p.color}>{p.label} priority</Badge>
          <Badge>{todo.category}</Badge>
          {todo.dueDate && (
            <Badge className={dueState(todo.dueDate, todo.completed) === "overdue" ? "border-red-500/30 text-red-300" : ""}>
              <FiCalendar /> {formatDue(todo.dueDate)}
            </Badge>
          )}
          {todo.tags.map((t) => <span key={t} className="text-sm text-violet-300/80">#{t}</span>)}
        </div>

        {todo.description && <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">{todo.description}</p>}

        {todo.subtasks.length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Subtasks</h2>
              <span className="text-xs text-muted-foreground">{done}/{todo.subtasks.length}</span>
            </div>
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all" style={{ width: `${(done / todo.subtasks.length) * 100}%` }} />
            </div>
            <ul className="space-y-1.5">
              {todo.subtasks.map((s) => (
                <li key={s.id} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
                  <Checkbox checked={s.done} onCheckedChange={() => toggleSub(s.id)} />
                  <span className={cn("text-sm", s.done && "text-muted-foreground line-through")}>{s.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FiClock /> Created {new Date(todo.createdAt).toLocaleString()}
        </p>

        <div className="flex gap-2 border-t border-border pt-4">
          <Button variant="secondary" onClick={() => dispatch(openForm(todo.id))}><FiEdit2 /> Edit</Button>
          {/* Data-router action handles the delete + redirect */}
          <Form method="post" onSubmit={(e) => !confirm("Delete this task?") && e.preventDefault()}>
            <input type="hidden" name="intent" value="delete" />
            <Button type="submit" variant="destructive" disabled={navigation.state === "submitting"}><FiTrash2 /> Delete</Button>
          </Form>
        </div>
      </article>
    </div>
  );
}
