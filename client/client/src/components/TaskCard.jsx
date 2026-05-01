import { useState } from "react";
import { formatDate, statusLabel } from "../utils/format";

export default function TaskCard({
  task,
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

  const editTask = () =>
    run(async () => {
      const title = window.prompt("Task title", task.title);
      if (!title) return;
      const description = window.prompt("Task description", task.description || "") || "";
      await onUpdateTask(task._id, { title, description });
    });

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
            <button
              className="btn btn-sm btn-outline-dark"
              disabled={busy}
              type="button"
              onClick={() => run(() => onToggleSubtask(task._id, subtask._id))}
            >
              {subtask.is_done ? "Undo" : "Done"}
            </button>
            <span>{subtask.title}</span>
            <button
              className="btn btn-sm btn-outline-danger"
              disabled={busy}
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
          placeholder="Add subtask"
          value={subtaskTitle}
          onChange={(event) => setSubtaskTitle(event.target.value)}
        />
        <button className="btn btn-outline-dark" disabled={busy} type="submit">
          Add
        </button>
      </form>

      <div className="task-actions">
        <select
          className="form-select form-select-sm"
          disabled={busy}
          value={task.status}
          onChange={(event) => run(() => onUpdateTask(task._id, { status: event.target.value }))}
        >
          <option value="todo">Todo</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
        <button className="btn btn-sm btn-outline-dark" disabled={busy} type="button" onClick={editTask}>
          Edit
        </button>
        <button className="btn btn-sm btn-warning fw-bold" disabled={busy} type="button" onClick={() => run(() => onToggleTask(task._id))}>
          {task.status === "done" ? "Reopen" : "Complete"}
        </button>
        <button className="btn btn-sm btn-outline-danger" disabled={busy} type="button" onClick={() => run(() => onDeleteTask(task._id))}>
          Delete
        </button>
      </div>
    </article>
  );
}
