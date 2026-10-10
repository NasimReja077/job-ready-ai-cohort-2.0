import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FiHome, FiCheckSquare, FiBarChart2, FiSettings, FiPlus, FiWifiOff } from "react-icons/fi";
import { openForm } from "@/store/uiSlice";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import TodoFormDialog from "./TodoFormDialog";
import InstallPrompt from "./InstallPrompt";

const links = [
  { to: "/", label: "Dashboard", icon: FiHome, end: true },
  { to: "/tasks", label: "Tasks", icon: FiCheckSquare },
  { to: "/stats", label: "Stats", icon: FiBarChart2 },
  { to: "/settings", label: "Settings", icon: FiSettings },
];

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return online;
}

export default function Layout() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const online = useOnline();

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl gap-6 px-4 sm:px-6 lg:px-8">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col py-6 md:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <img src="/favicon.svg" alt="" className="size-9 rounded-xl" />
          <div>
            <span className="block font-display text-xl font-extrabold tracking-tight">TaskFlow</span>
            <span className="text-[11px] text-muted-foreground">Make room for what matters</span>
          </div>
        </div>

        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">Workspace</p>
        <nav aria-label="Main navigation" className="glass flex flex-col gap-1 rounded-2xl p-2">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                cn("group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  isActive ? "bg-accent text-accent-foreground shadow-sm shadow-black/10" : "text-muted-foreground hover:bg-white/5 hover:text-foreground")}>
              <Icon className="size-4 transition-transform group-hover:scale-110" /> {label}
            </NavLink>
          ))}
        </nav>
        <Button className="mt-4" onClick={() => dispatch(openForm())}>
          <FiPlus /> New task
        </Button>
        <div className="mt-auto space-y-4">
          <div className="rounded-2xl border border-border/70 bg-white/[0.025] p-4">
            <p className="text-xs font-semibold">A calmer way to get things done</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Plan your day, keep your focus, and make progress at your own pace.</p>
          </div>
          <InstallPrompt />
        </div>
      </aside>

      <main className="min-w-0 flex-1 pb-28 pt-5 md:pb-10 md:pt-8">
        {/* Mobile header */}
        <div className="mb-6 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" className="size-8 rounded-lg" />
            <span className="font-display text-lg font-extrabold">TaskFlow</span>
          </div>
          <InstallPrompt compact />
        </div>

        {!online && (
          <div className="glass mb-4 flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-amber-300">
            <FiWifiOff /> You're offline — changes are saved on this device.
          </div>
        )}
        {navigation.state === "loading" && <div className="fixed inset-x-0 top-0 z-50 h-0.5 animate-pulse bg-gradient-to-r from-violet-500 to-cyan-400" />}
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav aria-label="Mobile navigation" className="glass-strong safe-bottom fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl px-2 pt-2 md:hidden">
        {links.slice(0, 2).map((l) => <MobileLink key={l.to} {...l} />)}
        <button onClick={() => dispatch(openForm())} aria-label="New task"
          className="-mt-7 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 text-white shadow-xl shadow-violet-500/40 active:scale-95">
          <FiPlus className="size-6" />
        </button>
        {links.slice(2).map((l) => <MobileLink key={l.to} {...l} />)}
      </nav>

      <TodoFormDialog />
    </div>
  );
}

function MobileLink({ to, label, icon: Icon, end }) {
  return (
    <NavLink to={to} end={end}
      className={({ isActive }) => cn("flex w-16 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium", isActive ? "text-violet-300" : "text-muted-foreground")}>
      <Icon className="size-5" /> {label}
    </NavLink>
  );
}
