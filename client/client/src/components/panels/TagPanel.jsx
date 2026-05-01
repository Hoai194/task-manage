import QuickCreateForm from "../shared/QuickCreateForm";

export default function TagPanel({ tags, onCreateTag, onUpdateTag, onDeleteTag, onError }) {
  const handleCreate = async (name) => {
    await onCreateTag({ name });
  };

  const renameTag = async (tag) => {
    const name = window.prompt("Tag name", tag.name);
    if (!name) return;
    await onUpdateTag(tag._id, { name });
  };

  const removeTag = async (tag) => {
    if (!window.confirm(`Delete tag "${tag.name}"?`)) return;
    await onDeleteTag(tag._id);
  };

  return (
    <section className="panel-card">
      <div className="panel-heading">
        <h2>Tags</h2>
        <span>{tags.length}</span>
      </div>

      <QuickCreateForm placeholder="New tag" onSubmit={handleCreate} onError={onError} />

      <div className="tag-cloud">
        {tags.map((tag) => (
          <span className="tag-pill" key={tag._id}>
            #{tag.name}
            <button className="pill-button" type="button" onClick={() => renameTag(tag).catch((error) => onError(error.message))}>
              edit
            </button>
            <button className="pill-button danger" type="button" onClick={() => removeTag(tag).catch((error) => onError(error.message))}>
              x
            </button>
          </span>
        ))}
        {!tags.length && <div className="empty-mini">No tags yet.</div>}
      </div>
    </section>
  );
}
