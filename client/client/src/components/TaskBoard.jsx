import PaginationControls from "./shared/PaginationControls";
import TaskCard from "./TaskCard";

export default function TaskBoard({
  visibleTasks,
  page,
  totalPages,
  loading,
  onPageChange,
  onUpdateTask,
  onToggleTask,
  onDeleteTask,
  onCreateSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onError,
}) {
  if (loading) {
    return <div className="empty-state">Loading workspace...</div>;
  }

  if (!visibleTasks.length) {
    return <div className="empty-state">No tasks match the current project, search, or status filter.</div>;
  }

  return (
    <section>
      <div className="task-grid">
        {visibleTasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onUpdateTask={onUpdateTask}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
            onCreateSubtask={onCreateSubtask}
            onToggleSubtask={onToggleSubtask}
            onDeleteSubtask={onDeleteSubtask}
            onError={onError}
          />
        ))}
      </div>
      <PaginationControls page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </section>
  );
}
