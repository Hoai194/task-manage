import { useState } from "react";
import QuickCreateForm from "../shared/QuickCreateForm";

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="confirm-sheet" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-msg">{message}</p>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button className="btn btn-outline-dark" type="button" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger fw-bold" type="button" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectPanel({
  projects,
  tasks,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onError,
  projectPage,
  projectTotalPages,
  onProjectPageChange,
}) {
  const [pendingDelete, setPendingDelete] = useState(null);

  const counts = tasks.reduce((acc, task) => {
    const key = String(task.project_id?._id || task.project_id);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const handleCreate = async (name) => {
    await onCreateProject({ name });
  };

  const renameProject = async (project) => {
    const name = window.prompt("Project name", project.name);
    if (!name) return;
    await onUpdateProject(project._id, { name, description: project.description || "" });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await onDeleteProject(pendingDelete._id);
    } catch (error) {
      onError(error.message);
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <>
      <section className="panel-card">
        <div className="panel-heading">
          <h2>Projects</h2>
          <span>{projects.length}</span>
        </div>

        <QuickCreateForm placeholder="New project" onSubmit={handleCreate} onError={onError} />

        <div className="vstack gap-2">
          <button
            className={`project-row ${selectedProjectId === "all" ? "active" : ""}`}
            type="button"
            onClick={() => onSelectProject("all").catch((error) => onError(error.message))}
          >
            <span>
              <strong>All notes</strong>
              <small>Everything active</small>
            </span>
            <b>{tasks.length}</b>
          </button>

          {projects.map((project) => (
            <div className="project-row-wrap" key={project._id}>
              <button
                className={`project-row ${selectedProjectId === project._id ? "active" : ""}`}
                type="button"
                onClick={() => onSelectProject(project._id).catch((error) => onError(error.message))}
              >
                <span>
                  <strong>{project.name}</strong>
                  <small>{project.description || "Project"}</small>
                </span>
                <b>{counts[project._id] || 0}</b>
              </button>
              <div className="row-actions">
                <button
                  className="btn btn-sm btn-outline-dark"
                  type="button"
                  onClick={() => renameProject(project).catch((error) => onError(error.message))}
                >
                  Rename
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  type="button"
                  onClick={() => setPendingDelete(project)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {!projects.length && <div className="empty-mini">Create a project to start adding tasks.</div>}
        </div>

        {projectTotalPages > 1 && (
          <div className="panel-pagination">
            <button
              className="btn btn-outline-dark btn-sm"
              disabled={projectPage === 1}
              onClick={() => onProjectPageChange(projectPage - 1)}
            >‹</button>
            <span>{projectPage} / {projectTotalPages}</span>
            <button
              className="btn btn-outline-dark btn-sm"
              disabled={projectPage === projectTotalPages}
              onClick={() => onProjectPageChange(projectPage + 1)}
            >›</button>
          </div>
        )}
      </section>

      {pendingDelete && (
        <ConfirmModal
          message={`Delete project "${pendingDelete.name}"? This cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
