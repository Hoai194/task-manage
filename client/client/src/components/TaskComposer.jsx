import { useState } from "react";

const initialForm = {
  title: "",
  description: "",
  project_id: "",
  priority: "medium",
  status: "todo",
  start_date: "",
  due_date: "",
  tags: [],
};

export default function TaskComposer({ projects, tags, selectedProjectId, onCreateTask, onError }) {
  const [form, setForm] = useState(initialForm);
  const [busy, setBusy] = useState(false);
  const hasProjects = projects.length > 0;

  const defaultProjectId = selectedProjectId !== "all" ? selectedProjectId : projects[0]?._id || "";
  const selectedProject = form.project_id || defaultProjectId;

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const toggleTag = (tagId) => {
    setForm((current) => ({
      ...current,
      tags: current.tags.includes(tagId)
        ? current.tags.filter((id) => id !== tagId)
        : [...current.tags, tagId],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setBusy(true);
    try {
      const body = {
        ...form,
        project_id: selectedProject,
      };

      if (!body.start_date) delete body.start_date;
      if (!body.due_date) delete body.due_date;

      await onCreateTask(body);
      setForm(initialForm);
    } catch (error) {
      onError(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="composer-card">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <p className="eyebrow mb-1">Quick capture</p>
          <h2 className="section-title mb-0">Create a task note</h2>
        </div>
        {!hasProjects && <span className="badge text-bg-warning">Create a project first</span>}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <label className="col-12">
            <span className="form-label">Task title</span>
            <input className="form-control form-control-lg" value={form.title} onChange={(event) => update("title", event.target.value)} required />
          </label>
          <label className="col-12">
            <span className="form-label">Description</span>
            <textarea className="form-control" rows="3" value={form.description} onChange={(event) => update("description", event.target.value)} />
          </label>
          <label className="col-12 col-md-6 col-lg-4">
            <span className="form-label">Project</span>
            <select className="form-select" value={selectedProject} onChange={(event) => update("project_id", event.target.value)} disabled={!hasProjects} required>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label className="col-6 col-lg-2">
            <span className="form-label">Priority</span>
            <select className="form-select" value={form.priority} onChange={(event) => update("priority", event.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="col-6 col-lg-2">
            <span className="form-label">Status</span>
            <select className="form-select" value={form.status} onChange={(event) => update("status", event.target.value)}>
              <option value="todo">Todo</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </label>
          <label className="col-6 col-lg-2">
            <span className="form-label">Start</span>
            <input className="form-control" type="date" value={form.start_date} onChange={(event) => update("start_date", event.target.value)} />
          </label>
          <label className="col-6 col-lg-2">
            <span className="form-label">Due</span>
            <input className="form-control" type="date" value={form.due_date} onChange={(event) => update("due_date", event.target.value)} />
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

        <div className="d-flex justify-content-end mt-4">
          <button className="btn btn-warning btn-lg fw-bold" disabled={!hasProjects || busy} type="submit">
            {busy ? "Adding..." : "Add task"}
          </button>
        </div>
      </form>
    </section>
  );
}
