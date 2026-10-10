import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiDownload, FiUpload, FiTrash2 } from "react-icons/fi";
import { selectAllTodos, clearCompleted, importTodos } from "@/store/todosSlice";
import { Button } from "@/components/ui/button";
import { downloadFile } from "@/lib/utils";

function Row({ title, hint, children }) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="font-medium">{title}</p><p className="text-sm text-muted-foreground">{hint}</p></div>
      {children}
    </div>
  );
}

export default function Settings() {
  const dispatch = useDispatch();
  const todos = useSelector(selectAllTodos);
  const fileRef = useRef(null);

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const list = JSON.parse(await file.text());
      if (!Array.isArray(list)) throw new Error("File must contain a list of tasks");
      await dispatch(importTodos(list)).unwrap();
      toast.success(`Imported ${list.length} tasks`);
    } catch (err) {
      toast.error(err.message || "Invalid file");
    }
    e.target.value = "";
  };

  const onClear = async () => {
    const n = todos.filter((t) => t.completed).length;
    if (!n) return toast("No completed tasks to clear");
    if (!confirm(`Delete ${n} completed task${n > 1 ? "s" : ""}?`)) return;
    await dispatch(clearCompleted()).unwrap();
    toast.success("Completed tasks cleared");
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold">Settings</h1>
        <p className="text-sm text-muted-foreground">Your data lives on this device and works offline.</p>
      </header>

      <section className="glass divide-y divide-border rounded-3xl px-6">
        <Row title="Export tasks" hint={`Download all ${todos.length} tasks as a JSON backup.`}>
          <Button variant="secondary" onClick={() => downloadFile(`taskflow-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(todos, null, 2))}>
            <FiDownload /> Export
          </Button>
        </Row>
        <Row title="Import tasks" hint="Restore from a JSON backup. Existing tasks are kept.">
          <>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={onImport} />
            <Button variant="secondary" onClick={() => fileRef.current?.click()}><FiUpload /> Import</Button>
          </>
        </Row>
        <Row title="Clear completed" hint="Permanently remove all finished tasks.">
          <Button variant="destructive" onClick={onClear}><FiTrash2 /> Clear</Button>
        </Row>
      </section>

      <p className="text-center text-xs text-muted-foreground">TaskFlow · built with React, Redux Toolkit &amp; Tailwind</p>
    </div>
  );
}
