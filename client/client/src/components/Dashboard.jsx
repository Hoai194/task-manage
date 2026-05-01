import AppFooter from "./layout/AppFooter";
import AppHeader from "./layout/AppHeader";
import Sidebar from "./Sidebar";
import TaskBoard from "./TaskBoard";
import TaskComposer from "./TaskComposer";
import TaskToolbar from "./TaskToolbar";

export default function Dashboard(props) {
  return (
    <div className="app-shell">
      <AppHeader
        user={props.user}
        onLogout={props.onLogout}
        onUpdateProfile={props.onUpdateProfile}
        onRemoveAccount={props.onRemoveAccount}
        onError={props.onError}
      />

      <main className="container-fluid px-0">
        <div className="row g-4">
          <aside className="col-12 col-xl-3">
            <Sidebar {...props} />
          </aside>

          <section className="col-12 col-xl-9">
            <TaskComposer
              projects={props.projects}
              tags={props.tags}
              selectedProjectId={props.selectedProjectId}
              onCreateTask={props.onCreateTask}
              onError={props.onError}
            />
            <TaskToolbar
              query={props.query}
              statusFilter={props.statusFilter}
              sortBy={props.sortBy}
              sortDirection={props.sortDirection}
              allVisibleCount={props.allVisibleCount}
              onQueryChange={props.onQueryChange}
              onStatusFilterChange={props.onStatusFilterChange}
              onSortByChange={props.onSortByChange}
              onSortDirectionChange={props.onSortDirectionChange}
            />
            <TaskBoard {...props} />
          </section>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
