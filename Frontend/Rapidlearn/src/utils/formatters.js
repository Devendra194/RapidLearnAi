// frontend/src/utils/formatters.js
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate?.() || new Date(timestamp);
  return date.toLocaleDateString();
};

export const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};