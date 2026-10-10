import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiCheckCircle, FiAlertTriangle, FiSun, FiTrendingUp, FiPlus } from "react-icons/fi";
import { selectAllTodos, selectStats } from "@/store/todosSlice";
import { openForm } from "@/store/uiSlice";
import { Button } from "@/components/ui/button";
import TodoItem from "@/components/TodoItem";
import EmptyState from "@/components/EmptyState";
import { dueState } from "@/lib/utils";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className={`mb-3 grid size-9 place-items-center rounded-xl ${tone}`}><Icon className="size-4" /></div>
      <div className="font-display text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const stats = useSelector(selectStats);
  const todos = useSelector(selectAllTodos);
  const focus = todos
    .filter((t) => !t.completed && ["overdue", "today"].includes(dueState(t.dueDate, t.completed)))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-300/80">
            {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">{greeting()}, <span className="text-gradient">let's get it done.</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">A clear mind starts with a clear plan.</p>
        </div>
        <Button className="mb-1 hidden shrink-0 sm:inline-flex" onClick={() => dispatch(openForm())}>
          <FiPlus /> Add a task
        </Button>
      </header>

      <div className="glass relative overflow-hidden rounded-3xl p-5 sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-20 size-56 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="mb-2 flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Overall progress</p>
            <p className="font-display mt-1 text-3xl font-extrabold">{stats.rate}<span className="ml-0.5 text-lg text-muted-foreground">%</span></p>
          </div>
          <p className="pb-1 text-sm text-muted-foreground">{stats.done} of {stats.total} done</p>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-700" style={{ width: `${stats.rate}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={FiTrendingUp} label="Active" value={stats.active} tone="bg-violet-500/20 text-violet-300" />
        <Stat icon={FiSun} label="Due today" value={stats.today} tone="bg-amber-500/20 text-amber-300" />
        <Stat icon={FiAlertTriangle} label="Overdue" value={stats.overdue} tone="bg-red-500/20 text-red-300" />
        <Stat icon={FiCheckCircle} label="Completed" value={stats.done} tone="bg-emerald-500/20 text-emerald-300" />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Today's focus</h2>
          <Link to="/tasks" className="text-sm text-violet-300 hover:underline">View all</Link>
        </div>
        {focus.length ? (
          <ul className="space-y-2.5">{focus.map((t) => <TodoItem key={t.id} todo={t} />)}</ul>
        ) : (
          <EmptyState title="You're all clear" hint="Nothing due today or overdue. Add a task to plan ahead.">
            <Button onClick={() => dispatch(openForm())}><FiPlus /> New task</Button>
          </EmptyState>
        )}
      </section>
    </div>
  );
}
