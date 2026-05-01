import { useState } from "react";

export default function QuickCreateForm({ placeholder, onSubmit, onError }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!value.trim()) return;

    setBusy(true);
    try {
      await onSubmit(value.trim());
      setValue("");
    } catch (error) {
      onError(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="input-group mb-3" onSubmit={handleSubmit}>
      <input
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button className="btn btn-dark" disabled={busy} type="submit">
        Add
      </button>
    </form>
  );
}
