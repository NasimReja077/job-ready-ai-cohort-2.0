import { useSelector } from "react-redux";
import { selectStats } from "@/store/todosSlice";
import { PRIORITIES } from "@/lib/utils";

function Ring({ value }) {
  const r = 52, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 120 120" className="size-40">
      <defs><linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8b5cf6" /><stop offset="1" stopColor="#22d3ee" /></linearGradient></defs>
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
      <circle cx="60" cy="60" r={r} fill="none" stroke="url(#ring)" strokeWidth="10" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform="rotate(-90 60 60)" style={{ transition: "stroke-dashoffset .8s ease" }} />
      <text x="60" y="66" textAnchor="middle" fill="#f4f4f8" fontSize="24" fontWeight="800" fontFamily="Plus Jakarta Sans">{value}%</text>
    </svg>
  );
}

export default function Stats() {
  const s = useSelector(selectStats);
  const max = Math.max(1, ...s.week.map((d) => d.count));
  const cats = Object.entries(s.byCategory).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold">Stats</h1>
        <p className="text-sm text-muted-foreground">Your productivity at a glance.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="glass flex items-center gap-6 rounded-3xl p-6">
          <Ring value={s.rate} />
          <div>
            <p className="font-display text-xl font-bold">Completion rate</p>
            <p className="text-sm text-muted-foreground">{s.done} done · {s.active} remaining</p>
          </div>
        </section>

        <section className="glass rounded-3xl p-6">
          <h2 className="mb-4 font-bold">Active by priority</h2>
          <div className="space-y-3">
            {Object.entries(PRIORITIES).map(([k, p]) => (
              <div key={k}>
                <div className="mb-1 flex justify-between text-sm"><span>{p.label}</span><span className="text-muted-foreground">{s.byPriority[k]}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full rounded-full ${k === "high" ? "bg-red-400" : k === "medium" ? "bg-amber-400" : "bg-emerald-400"}`}
                    style={{ width: `${s.active ? (s.byPriority[k] / s.active) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="glass rounded-3xl p-6">
        <h2 className="mb-5 font-bold">Completed — last 7 days</h2>
        <div className="flex h-40 items-end gap-3">
          {s.week.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs text-muted-foreground">{d.count}</span>
              <div className="flex w-full flex-1 items-end">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-cyan-400 transition-all duration-700"
                  style={{ height: `${Math.max(4, (d.count / max) * 100)}%`, opacity: d.count ? 1 : 0.25 }} />
              </div>
              <span className="text-xs text-muted-foreground">{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="glass rounded-3xl p-6">
        <h2 className="mb-4 font-bold">By category</h2>
        {cats.length ? (
          <div className="flex flex-wrap gap-2">
            {cats.map(([c, n]) => (
              <span key={c} className="rounded-full border border-border bg-white/5 px-3 py-1.5 text-sm">{c} <b className="ml-1 text-violet-300">{n}</b></span>
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground">No data yet.</p>}
      </section>
    </div>
  );
}
