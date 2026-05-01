import ProjectPanel from "./panels/ProjectPanel";
import TagPanel from "./panels/TagPanel";

export default function Sidebar(props) {
  return (
    <div className="sidebar-stack">
      <ProjectPanel
        projects={props.projects}
        tasks={props.tasks}
        selectedProjectId={props.selectedProjectId}
        onSelectProject={props.onSelectProject}
        onCreateProject={props.onCreateProject}
        onUpdateProject={props.onUpdateProject}
        onDeleteProject={props.onDeleteProject}
        onError={props.onError}
      />
      <TagPanel
        tags={props.tags}
        onCreateTag={props.onCreateTag}
        onUpdateTag={props.onUpdateTag}
        onDeleteTag={props.onDeleteTag}
        onError={props.onError}
      />
    </div>
  );
}
