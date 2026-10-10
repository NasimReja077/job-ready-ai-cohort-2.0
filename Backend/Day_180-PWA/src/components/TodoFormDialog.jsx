import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiPlus, FiX } from "react-icons/fi";
import { closeForm } from "@/store/uiSlice";
import { selectTodoById } from "@/store/todosSlice";
import { useTodoActions } from "@/hooks/useTodoActions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES, uid } from "@/lib/utils";

const empty = { title: "", description: "", priority: "medium", category: "Personal", dueDate: "", tags: [], subtasks: [] };

export default function TodoFormDialog() {
  const dispatch = useDispatch();
  const { formOpen, editingId } = useSelector((s) => s.ui);
  const editing = useSelector((s) => (editingId ? selectTodoById(s, editingId) : null));
  const { save } = useTodoActions();
  const [form, setForm] = useState(empty);
  const [tagInput, setTagInput] = useState("");
  const [subInput, setSubInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (formOpen) setForm(editing ? { ...empty, ...editing, dueDate: editing.dueDate || "" } : empty);
    setTagInput(""); setSubInput("");
  }, [formOpen, editing]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, "").toLowerCase();
    if (t && !form.tags.includes(t)) setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    setTagInput("");
  };
  const addSub = () => {
    const t = subInput.trim();
    if (t) setForm((f) => ({ ...f, subtasks: [...f.subtasks, { id: uid(), title: t, done: false }] }));
    setSubInput("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const { id, createdAt, updatedAt, completedAt, ...changes } = form;
    const saved = await save(editingId, { ...changes, title: form.title.trim(), dueDate: form.dueDate || null });
    setSaving(false);
    if (saved) dispatch(closeForm());
  };

  return (
    <Dialog open={formOpen} onOpenChange={(o) => !o && dispatch(closeForm())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>{editing ? "Update the details below." : "What do you need to get done?"}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-4 overflow-y-auto px-6 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" autoFocus value={form.title} onChange={set("title")} placeholder="e.g. Revise linked lists" maxLength={120} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Notes</Label>
              <Textarea id="desc" value={form.description} onChange={set("description")} placeholder="Optional details…" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="priority">Priority</Label>
                <Select id="priority" value={form.priority} onChange={set("priority")}>
                  <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cat">Category</Label>
                <Select id="cat" value={form.category} onChange={set("category")}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="due">Due date</Label>
              <Input id="due" type="date" value={form.dueDate} onChange={set("dueDate")} className="[color-scheme:dark]" />
            </div>

            <div className="space-y-1.5">
              <Label>Subtasks</Label>
              {form.subtasks.map((s) => (
                <div key={s.id} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-sm">
                  <span className="flex-1 truncate">{s.title}</span>
                  <button type="button" aria-label="Remove subtask" className="text-muted-foreground hover:text-red-300"
                    onClick={() => setForm((f) => ({ ...f, subtasks: f.subtasks.filter((x) => x.id !== s.id) }))}><FiX /></button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input value={subInput} onChange={(e) => setSubInput(e.target.value)} placeholder="Add a subtask"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSub())} />
                <Button type="button" variant="secondary" size="icon" className="size-10" onClick={addSub} aria-label="Add subtask"><FiPlus /></Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map((t) => (
                  <button type="button" key={t} onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }))}
                    className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground">
                    #{t} <FiX className="size-3" />
                  </button>
                ))}
              </div>
              <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Type a tag and press Enter"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} onBlur={addTag} />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
            <Button type="button" variant="ghost" onClick={() => dispatch(closeForm())}>Cancel</Button>
            <Button type="submit" disabled={saving || !form.title.trim()}>{saving ? "Saving…" : editing ? "Save changes" : "Add task"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
