import { FiInbox } from "react-icons/fi";

export default function EmptyState({ title = "Nothing here", hint, children }) {
  return (
    <div className="glass flex flex-col items-center rounded-3xl px-6 py-14 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground"><FiInbox className="size-6" /></div>
      <h3 className="text-lg font-bold">{title}</h3>
      {hint && <p className="mt-1 max-w-xs text-sm text-muted-foreground">{hint}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
