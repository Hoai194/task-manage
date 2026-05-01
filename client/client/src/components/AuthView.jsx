import { useState } from "react";

export default function AuthView({ onSubmit, onError }) {
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(form);

    setBusy(true);
    try {
      await onSubmit(values, mode);
    } catch (error) {
      onError(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="hero-panel">
        <p className="eyebrow">Personal Task Manager</p>
        <h1>Capture tasks before they scatter.</h1>
        <p className="lead-copy">
          A Google Keep inspired workspace with projects, notes, tags, subtasks,
          priorities, due dates, sorting, and responsive layouts.
        </p>
        <div className="feature-strip">
          <span>React components</span>
          <span>Bootstrap grid</span>
          <span>JWT auth</span>
          <span>REST client</span>
        </div>
      </section>

      <section className="auth-card" aria-label="Authentication form">
        <div className="btn-group w-100 mb-4" role="group" aria-label="Authentication mode">
          <button
            className={`btn ${mode === "login" ? "btn-dark" : "btn-outline-dark"}`}
            type="button"
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={`btn ${mode === "register" ? "btn-dark" : "btn-outline-dark"}`}
            type="button"
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form className="vstack gap-3" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label className="form-label">
              Name
              <input className="form-control form-control-lg mt-2" name="name" required />
            </label>
          )}
          <label className="form-label">
            Email
            <input className="form-control form-control-lg mt-2" name="email" type="email" required />
          </label>
          <label className="form-label">
            Password
            <input className="form-control form-control-lg mt-2" name="password" type="password" minLength="6" required />
          </label>
          <button className="btn btn-warning btn-lg fw-bold" disabled={busy} type="submit">
            {busy ? "Working..." : mode === "login" ? "Enter workspace" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}
