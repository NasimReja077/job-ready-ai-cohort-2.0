import { useDispatch, useSelector } from "react-redux";
import { FiSearch, FiRotateCcw } from "react-icons/fi";
import { selectFilters, setFilter, resetFilters } from "@/store/todosSlice";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORIES, cn } from "@/lib/utils";

const tabs = [
  ["all", "All"], ["active", "Active"], ["overdue", "Overdue"], ["completed", "Done"],
];

export default function TodoFilters() {
  const dispatch = useDispatch();
  const f = useSelector(selectFilters);
  const set = (k) => (e) => dispatch(setFilter({ [k]: e.target.value }));

  return (
    <div className="glass space-y-3 rounded-2xl p-3">
      <div className="relative">
        <FiSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={f.query} onChange={set("query")} placeholder="Search tasks, notes, tags…" className="pl-9" aria-label="Search tasks" />
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl bg-black/20 p-1">
        {tabs.map(([v, label]) => (
          <button key={v} onClick={() => dispatch(setFilter({ status: v }))}
            className={cn("flex-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition",
              f.status === v ? "bg-accent text-accent-foreground shadow" : "text-muted-foreground hover:text-foreground")}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Select value={f.priority} onChange={set("priority")} aria-label="Priority">
          <option value="all">Any priority</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
        </Select>
        <Select value={f.category} onChange={set("category")} aria-label="Category">
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </Select>
        <Select value={f.sort} onChange={set("sort")} aria-label="Sort by">
          <option value="smart">Smart sort</option><option value="due">Due date</option><option value="priority">Priority</option>
          <option value="newest">Newest</option><option value="title">A → Z</option>
        </Select>
        <Button variant="secondary" onClick={() => dispatch(resetFilters())}><FiRotateCcw /> Reset</Button>
      </div>
    </div>
  );
}
