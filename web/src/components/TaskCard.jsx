import { useState } from "react";
import { formatDate, statusLabel } from "../utils/format";
import TaskEditModal from "./TaskEditModal";

export default function TaskCard({
  task,
  projects,
  tags,
  onUpdateTask,
  onToggleTask,
  onDeleteTask,
  onCreateSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onError,
}) {
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  const run = async (operation) => {
    setBusy(true);
    try {
      await operation();
    } catch (error) {
      onError(error.message);
    } finally {
      setBusy(false);
    }
  };

  const addSubtask = (event) => {
    event.preventDefault();
    const title = subtaskTitle.trim();
    if (!title) return;
    run(async () => {
      await onCreateSubtask(task._id, title);
      setSubtaskTitle("");
    });
  };

  return (
    <>
      <article className={`task-card priority-${task.priority} ${task.status === "done" ? "is-done" : ""}`}>
        <div className="d-flex flex-wrap gap-2">
          <span className={`status-badge ${task.priority}`}>{task.priority}</span>
          <span className="status-badge">{statusLabel(task.status)}</span>
          <span className="status-badge">Due {formatDate(task.due_date)}</span>
        </div>

        <h3>{task.title}</h3>
        {task.description && <p>{task.description}</p>}

        <div className="tag-cloud mb-3">
          {(task.tags || []).map((tag) => (
            <span className="tag-pill compact" key={tag._id || tag}>
              #{tag.name || tag}
            </span>
          ))}
        </div>

        <div className="subtask-stack">
          {(task.subtasks || []).map((subtask) => (
            <div className={`subtask-row ${subtask.is_done ? "done" : ""}`} key={subtask._id}>
              <input
                type="checkbox"
                className="form-check-input"
                checked={subtask.is_done}
                disabled={busy || task.status === "done"}
                onChange={() => run(() => onToggleSubtask(task._id, subtask._id))}
              />
              <span style={{ marginLeft: "8px", flex: 1 }}>{subtask.title}</span>
              <button
                className="btn btn-sm btn-outline-danger"
                disabled={busy || task.status === "done"}
                type="button"
                onClick={() => run(() => onDeleteSubtask(task._id, subtask._id))}
              >
                x
              </button>
            </div>
          ))}
        </div>

        <form className="input-group input-group-sm mt-3" onSubmit={addSubtask}>
          <input
            className="form-control"
            placeholder={task.status === "done" ? "Task is completed" : "Add subtask"}
            value={subtaskTitle}
            disabled={busy || task.status === "done"}
            onChange={(event) => setSubtaskTitle(event.target.value)}
          />
          <button className="btn btn-outline-dark" disabled={busy || task.status === "done"} type="submit">
            Add
          </button>
        </form>

        <div className="task-actions">
          <select
            className="form-select form-select-sm"
            disabled={busy || task.status === "done"}
            value={task.status}
            onChange={(event) => run(() => onUpdateTask(task._id, { status: event.target.value }))}
          >
            <option value="todo">Todo</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
          <button
            className="btn btn-sm btn-outline-dark"
            disabled={busy || task.status === "done"}
            type="button"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
          <button className="btn btn-sm btn-warning fw-bold" disabled={busy} type="button" onClick={() => run(() => onToggleTask(task._id))}>
            {task.status === "done" ? "Reopen" : "Complete"}
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            disabled={busy || task.status === "done"}
            type="button"
            onClick={() => run(() => onDeleteTask(task._id))}
          >
            Delete
          </button>
        </div>
      </article>

      {editing && (
        <TaskEditModal
          task={task}
          projects={projects}
          tags={tags}
          onSave={onUpdateTask}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}
