import { useEffect, useMemo, useState } from "react";
import { request } from "./api/client";
import AuthView from "./components/AuthView";
import Dashboard from "./components/Dashboard";
import Toast from "./components/Toast";

const TOKEN_KEY = "ptm_token";
const PAGE_SIZE = 6;

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const notify = (message) => setToast(message);
  const authedRequest = (path, options = {}) => request(path, options, token);

  const loadTasks = async (projectId = selectedProjectId) => {
    const searchParams = new URLSearchParams();
    if (projectId !== "all") searchParams.set("project_id", projectId);

    const payload = await authedRequest(`/api/task${searchParams.toString() ? `?${searchParams}` : ""}`);
    setTasks(payload.data);
  };

  const loadWorkspace = async (projectIdForTasks = selectedProjectId) => {
    setLoading(true);
    try {
      const [profilePayload, projectPayload, tagPayload] = await Promise.all([
        authedRequest("/api/user/me"),
        authedRequest("/api/project"),
        authedRequest("/api/tag"),
      ]);

      setUser(profilePayload.data);
      setProjects(projectPayload.data);
      setTags(tagPayload.data);
      await loadTasks(projectIdForTasks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    loadWorkspace().catch((error) => {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      notify(error.message === "jwt expired" ? "Session expired. Please login again." : error.message);
    });
  }, [token]);

  useEffect(() => {
    setPage(1);
  }, [query, selectedProjectId, sortBy, sortDirection, statusFilter]);

  const visibleTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...tasks]
      .filter((task) => {
        const matchesStatus = statusFilter === "all" || task.status === statusFilter;
        const searchableText = `${task.title} ${task.description || ""}`.toLowerCase();
        return matchesStatus && (!normalizedQuery || searchableText.includes(normalizedQuery));
      })
      .sort((a, b) => {
        const first = a[sortBy] || "";
        const second = b[sortBy] || "";
        const value = String(first).localeCompare(String(second));
        return sortDirection === "asc" ? value : -value;
      });
  }, [query, sortBy, sortDirection, statusFilter, tasks]);

  const totalPages = Math.max(1, Math.ceil(visibleTasks.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedTasks = visibleTasks.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const login = async (values, mode) => {
    const payload = await request(`/api/user/${mode}`, {
      method: "POST",
      body: JSON.stringify(values),
    });

    localStorage.setItem(TOKEN_KEY, payload.token);
    setToken(payload.token);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setProjects([]);
    setTags([]);
    setTasks([]);
  };

  const updateProfile = async (values) => {
    const payload = await authedRequest("/api/user/me", {
      method: "PUT",
      body: JSON.stringify(values),
    });
    setUser(payload.data);
  };

  const removeAccount = async () => {
    await authedRequest("/api/user/me", { method: "DELETE" });
    logout();
  };

  const createProject = async (values) => {
    await authedRequest("/api/project", {
      method: "POST",
      body: JSON.stringify(values),
    });
    await loadWorkspace();
  };

  const updateProject = async (projectId, values) => {
    await authedRequest(`/api/project/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(values),
    });
    await loadWorkspace();
  };

  const deleteProject = async (projectId) => {
    await authedRequest(`/api/project/${projectId}`, { method: "DELETE" });
    const nextSelectedProjectId = selectedProjectId === projectId ? "all" : selectedProjectId;
    setSelectedProjectId(nextSelectedProjectId);
    await loadWorkspace(nextSelectedProjectId);
  };

  const createTag = async (values) => {
    await authedRequest("/api/tag", {
      method: "POST",
      body: JSON.stringify(values),
    });
    await loadWorkspace();
  };

  const updateTag = async (tagId, values) => {
    await authedRequest(`/api/tag/${tagId}`, {
      method: "PUT",
      body: JSON.stringify(values),
    });
    await loadWorkspace();
  };

  const deleteTag = async (tagId) => {
    await authedRequest(`/api/tag/${tagId}`, { method: "DELETE" });
    await loadWorkspace();
  };

  const createTask = async (values) => {
    await authedRequest("/api/task", {
      method: "POST",
      body: JSON.stringify(values),
    });
    await loadTasks();
  };

  const updateTask = async (taskId, values) => {
    await authedRequest(`/api/task/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(values),
    });
    await loadTasks();
  };

  const toggleTask = async (taskId) => {
    await authedRequest(`/api/task/${taskId}/toggle`, { method: "PATCH" });
    await loadTasks();
  };

  const deleteTask = async (taskId) => {
    await authedRequest(`/api/task/${taskId}`, { method: "DELETE" });
    await loadTasks();
  };

  const createSubtask = async (taskId, title) => {
    await authedRequest(`/api/task/${taskId}/subtasks`, {
      method: "POST",
      body: JSON.stringify({ title }),
    });
    await loadTasks();
  };

  const toggleSubtask = async (taskId, subtaskId) => {
    await authedRequest(`/api/task/${taskId}/subtasks/${subtaskId}/toggle`, { method: "PATCH" });
    await loadTasks();
  };

  const deleteSubtask = async (taskId, subtaskId) => {
    await authedRequest(`/api/task/${taskId}/subtasks/${subtaskId}`, { method: "DELETE" });
    await loadTasks();
  };

  const selectProject = async (projectId) => {
    setSelectedProjectId(projectId);
    await loadTasks(projectId);
  };

  if (!token) {
    return (
      <>
        <AuthView onSubmit={login} onError={notify} />
        <Toast message={toast} onClose={() => setToast("")} />
      </>
    );
  }

  return (
    <>
      <Dashboard
        user={user}
        projects={projects}
        tags={tags}
        tasks={tasks}
        visibleTasks={paginatedTasks}
        allVisibleCount={visibleTasks.length}
        page={safePage}
        totalPages={totalPages}
        selectedProjectId={selectedProjectId}
        statusFilter={statusFilter}
        query={query}
        sortBy={sortBy}
        sortDirection={sortDirection}
        loading={loading}
        onLogout={logout}
        onUpdateProfile={updateProfile}
        onRemoveAccount={removeAccount}
        onCreateProject={createProject}
        onUpdateProject={updateProject}
        onDeleteProject={deleteProject}
        onCreateTag={createTag}
        onUpdateTag={updateTag}
        onDeleteTag={deleteTag}
        onCreateTask={createTask}
        onUpdateTask={updateTask}
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask}
        onCreateSubtask={createSubtask}
        onToggleSubtask={toggleSubtask}
        onDeleteSubtask={deleteSubtask}
        onSelectProject={selectProject}
        onStatusFilterChange={setStatusFilter}
        onQueryChange={setQuery}
        onSortByChange={setSortBy}
        onSortDirectionChange={setSortDirection}
        onPageChange={setPage}
        onError={notify}
      />
      <Toast message={toast} onClose={() => setToast("")} />
    </>
  );
}
