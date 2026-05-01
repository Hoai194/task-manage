const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const request = async (path, options = {}, token) => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.message || "Request failed");
  }

  return payload;
};
