import { useEffect, useState } from "react";

export default function TaskEditModal({ task, projects, tags, onSave, onClose }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    project_id: "",
    priority: "medium",
    status: "todo",
    start_date: "",
    due_date: "",
    tags: [],
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!task) return;
    setForm({
      title: task.title || "",
      description: task.description || "",
      project_id: task.project_id?._id || task.project_id || "",
      priority: task.priority || "medium",
      status: task.status || "todo",
      start_date: task.start_date ? task.start_date.slice(0, 10) : "",
      due_date: task.due_date ? task.due_date.slice(0, 10) : "",
      tags: (task.tags || []).map((t) => t._id || t),
    });
  }, [task]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleTag = (tagId) =>
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tagId) ? f.tags.filter((id) => id !== tagId) : [...f.tags, tagId],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...form };
      if (!body.start_date) delete body.start_date;
      if (!body.due_date) delete body.due_date;
      await onSave(task._id, body);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  if (!task) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <p className="eyebrow mb-1">Edit task</p>
            <h2 className="section-title mb-0">Update task info</h2>
          </div>
          <button className="btn btn-outline-dark btn-sm" type="button" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <label className="col-12">
              <span className="form-label">Task title</span>
              <input
                className="form-control form-control-lg"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                required
              />
            </label>
            <label className="col-12">
              <span className="form-label">Description</span>
              <textarea
                className="form-control"
                rows="3"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </label>
            <label className="col-12 col-md-6">
              <span className="form-label">Project</span>
              <select
                className="form-select"
                value={form.project_id}
                onChange={(e) => update("project_id", e.target.value)}
                required
              >
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label className="col-6 col-md-3">
              <span className="form-label">Priority</span>
              <select className="form-select" value={form.priority} onChange={(e) => update("priority", e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label className="col-6 col-md-3">
              <span className="form-label">Status</span>
              <select className="form-select" value={form.status} onChange={(e) => update("status", e.target.value)}>
                <option value="todo">Todo</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </label>
            <label className="col-6">
              <span className="form-label">Start date</span>
              <input className="form-control" type="date" value={form.start_date} onChange={(e) => update("start_date", e.target.value)} />
            </label>
            <label className="col-6">
              <span className="form-label">Due date</span>
              <input className="form-control" type="date" value={form.due_date} onChange={(e) => update("due_date", e.target.value)} />
            </label>
          </div>

          <div className="tag-selector mt-3">
            {tags.map((tag) => (
              <button
                className={`tag-choice ${form.tags.includes(tag._id) ? "active" : ""}`}
                key={tag._id}
                type="button"
                onClick={() => toggleTag(tag._id)}
              >
                #{tag.name}
              </button>
            ))}
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button className="btn btn-outline-dark" type="button" onClick={onClose} disabled={busy}>Cancel</button>
            <button className="btn btn-warning fw-bold" type="submit" disabled={busy}>
              {busy ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
