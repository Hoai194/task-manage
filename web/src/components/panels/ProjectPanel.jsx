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
  projectTotal,
  onProjectPageChange,
}) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const handleCreate = async (name) => {
    await onCreateProject({ name });
  };

  const startEditing = (project) => {
    setEditingProjectId(project._id);
    setEditingName(project.name);
  };

  const saveRename = async (project) => {
    const trimmed = editingName.trim();
    if (!trimmed || trimmed === project.name) {
      setEditingProjectId(null);
      return;
    }
    try {
      await onUpdateProject(project._id, { name: trimmed, description: project.description || "" });
    } catch (error) {
      onError(error.message);
    } finally {
      setEditingProjectId(null);
    }
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
        </div>

        <QuickCreateForm placeholder="New project" onSubmit={handleCreate} onError={onError} />

        <div className="vstack gap-2">
          {projects.map((project) => (
            <div className="project-row-wrap" key={project._id}>
              <button
                className={`project-row ${selectedProjectId === project._id ? "active" : ""}`}
                type="button"
                onClick={() => onSelectProject(project._id).catch((error) => onError(error.message))}
              >
                <span>
                  {editingProjectId === project._id ? (
                    <input
                      autoFocus
                      className="form-control form-control-sm"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => saveRename(project)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveRename(project);
                        if (e.key === "Escape") setEditingProjectId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <strong>{project.name}</strong>
                  )}
                </span>
                <b>{project.task_count || 0}</b>
              </button>
              <div className="row-actions">
                <button
                  className="btn btn-icon-sm"
                  type="button"
                  title="Rename"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(project);
                  }}
                >
                  ✎
                </button>
                <button
                  className="btn btn-icon-sm danger"
                  type="button"
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingDelete(project);
                  }}
                >
                  ✕
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
