export default function TaskToolbar({
  query,
  statusFilter,
  sortBy,
  sortDirection,
  allVisibleCount,
  onQueryChange,
  onStatusFilterChange,
  onSortByChange,
  onSortDirectionChange,
}) {
  return (
    <section className="toolbar-card">
      <div>
        <p className="eyebrow mb-1">Browse</p>
        <h2 className="section-title mb-0">{allVisibleCount} visible tasks</h2>
      </div>
      <div className="toolbar-controls">
        <input
          className="form-control"
          placeholder="Search title or description"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <select className="form-select" value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
        <select className="form-select" value={sortBy} onChange={(event) => onSortByChange(event.target.value)}>
          <option value="created_at">Created date</option>
          <option value="due_date">Due date</option>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
          <option value="status">Status</option>
        </select>
        <select className="form-select" value={sortDirection} onChange={(event) => onSortDirectionChange(event.target.value)}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
    </section>
  );
}
