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

export default function TagPanel({
  tags,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  onError,
  tagPage,
  tagTotalPages,
  tagTotal,
  onTagPageChange,
}) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const handleCreate = async (name) => {
    await onCreateTag({ name });
  };

  const startEditing = (tag) => {
    setEditingTagId(tag._id);
    setEditingName(tag.name);
  };

  const saveRename = async (tag) => {
    const trimmed = editingName.trim();
    if (!trimmed || trimmed === tag.name) {
      setEditingTagId(null);
      return;
    }
    try {
      await onUpdateTag(tag._id, { name: trimmed });
    } catch (error) {
      onError(error.message);
    } finally {
      setEditingTagId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await onDeleteTag(pendingDelete._id);
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
          <h2>Tags</h2>
        </div>

        <QuickCreateForm placeholder="New tag" onSubmit={handleCreate} onError={onError} />

        <div className="tag-cloud">
          {tags.map((tag) => (
            <span className="tag-pill" key={tag._id}>
              {editingTagId === tag._id ? (
                <input
                  autoFocus
                  className="form-control form-control-sm d-inline-block"
                  style={{ width: "80px", height: "24px", padding: "2px 4px", fontSize: "0.75rem" }}
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => saveRename(tag)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveRename(tag);
                    if (e.key === "Escape") setEditingTagId(null);
                  }}
                />
              ) : (
                <>#{tag.name}</>
              )}
              <button
                className="pill-button"
                type="button"
                onClick={() => startEditing(tag)}
              >
                edit
              </button>
              <button className="pill-button danger" type="button" onClick={() => setPendingDelete(tag)}>
                x
              </button>
            </span>
          ))}
          {!tags.length && <div className="empty-mini">No tags yet.</div>}
        </div>

        {tagTotalPages > 1 && (
          <div className="panel-pagination">
            <button
              className="btn btn-outline-dark btn-sm"
              disabled={tagPage === 1}
              onClick={() => onTagPageChange(tagPage - 1)}
            >‹</button>
            <span>{tagPage} / {tagTotalPages}</span>
            <button
              className="btn btn-outline-dark btn-sm"
              disabled={tagPage === tagTotalPages}
              onClick={() => onTagPageChange(tagPage + 1)}
            >›</button>
          </div>
        )}
      </section>

      {pendingDelete && (
        <ConfirmModal
          message={`Delete tag "#${pendingDelete.name}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
