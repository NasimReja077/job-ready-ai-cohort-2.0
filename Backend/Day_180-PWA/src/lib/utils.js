import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

export const PRIORITIES = {
  high: { label: "High", rank: 3, color: "text-red-300 bg-red-500/15 border-red-500/30" },
  medium: { label: "Medium", rank: 2, color: "text-amber-300 bg-amber-500/15 border-amber-500/30" },
  low: { label: "Low", rank: 1, color: "text-emerald-300 bg-emerald-500/15 border-emerald-500/30" },
};

export const CATEGORIES = ["Personal", "Work", "Study", "Health", "Shopping", "Other"];

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function dueState(dueDate, completed) {
  if (!dueDate || completed) return null;
  const diff = Math.round((startOfDay(new Date(dueDate)) - startOfDay(new Date())) / 86400000);
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff <= 7) return "soon";
  return "later";
}

export function formatDue(dueDate) {
  if (!dueDate) return "";
  const diff = Math.round((startOfDay(new Date(dueDate)) - startOfDay(new Date())) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return new Date(dueDate).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function downloadFile(filename, text, type = "application/json") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}
