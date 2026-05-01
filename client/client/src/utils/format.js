export const formatDate = (value) => {
  if (!value) return "No date";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

export const statusLabel = (value) => value.replace("_", " ");
