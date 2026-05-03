export default function AppHeader({ user, onLogout, onUpdateProfile, onRemoveAccount, onError }) {
  const renameProfile = async () => {
    if (!user) return;
    const name = window.prompt("Profile name", user?.name || "");
    if (!name) return;

    try {
      await onUpdateProfile({ name, email: user.email });
    } catch (error) {
      onError(error.message);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Delete this account permanently?")) return;

    try {
      await onRemoveAccount();
    } catch (error) {
      onError(error.message);
    }
  };

  return (
    <header className="app-header">
      <div>
        <p className="eyebrow mb-1">Workspace</p>
        <h1>Task board</h1>
      </div>
      <div className="header-actions">
        <span className="profile-chip">{user?.name || "Loading..."}</span>
        <button className="btn btn-outline-dark" type="button" onClick={renameProfile}>
          Edit profile
        </button>
        <button className="btn btn-outline-danger" type="button" onClick={deleteAccount}>
          Delete account
        </button>
        <button className="btn btn-dark" type="button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
