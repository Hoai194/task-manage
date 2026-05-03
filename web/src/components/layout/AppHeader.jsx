import { useEffect, useState } from "react";

function EditProfileModal({ user, onSave, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) setForm({ name: user.name || "", email: user.email || "", password: "", confirmPassword: "" });
  }, [user]);

  const update = (field, value) => {
    setError("");
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const body = { name: form.name, email: form.email };
      if (form.password) body.password = form.password;
      await onSave(body);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <p className="eyebrow mb-1">Account</p>
            <h2 className="section-title mb-0">Edit profile</h2>
          </div>
          <button className="btn btn-outline-dark btn-sm" type="button" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <label className="col-12">
              <span className="form-label">Display name</span>
              <input
                className="form-control"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </label>
            <label className="col-12">
              <span className="form-label">Email</span>
              <input
                className="form-control"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
            </label>
            <label className="col-12">
              <span className="form-label">New password <span style={{ fontWeight: 400, color: "var(--muted)" }}>(leave blank to keep current)</span></span>
              <input
                className="form-control"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
            </label>
            {form.password && (
              <label className="col-12">
                <span className="form-label">Confirm password</span>
                <input
                  className="form-control"
                  type="password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                />
              </label>
            )}
          </div>

          {error && <p className="text-danger mt-3 mb-0" style={{ fontSize: "0.85rem" }}>{error}</p>}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button className="btn btn-outline-dark" type="button" onClick={onClose} disabled={busy}>Cancel</button>
            <button className="btn btn-warning fw-bold" type="submit" disabled={busy}>
              {busy ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AppHeader({ user, activeView, onViewChange, onLogout, onUpdateProfile, onError }) {
  const [showEditProfile, setShowEditProfile] = useState(false);

  return (
    <>
      <header className="app-header">
        <div className="d-flex align-items-center gap-4 flex-wrap">
          <div>
            <p className="eyebrow mb-1">Workspace</p>
            <h1>Task board</h1>
          </div>
          <nav className="header-nav">
            <button
              className={`nav-tab ${activeView === "board" ? "active" : ""}`}
              type="button"
              onClick={() => onViewChange("board")}
            >
              Board
            </button>
            <button
              className={`nav-tab ${activeView === "calendar" ? "active" : ""}`}
              type="button"
              onClick={() => onViewChange("calendar")}
            >
              Calendar
            </button>
          </nav>
        </div>
        <div className="header-actions">
          <button className="profile-chip" type="button" onClick={() => setShowEditProfile(true)}>
            {user?.name || "Loading..."}
          </button>
          <button className="btn btn-outline-dark" type="button" onClick={() => setShowEditProfile(true)}>
            Edit profile
          </button>
          <button className="btn btn-dark" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {showEditProfile && (
        <EditProfileModal
          user={user}
          onSave={onUpdateProfile}
          onClose={() => setShowEditProfile(false)}
        />
      )}
    </>
  );
}
