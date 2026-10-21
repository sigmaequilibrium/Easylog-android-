export function formatDuration(durationSeconds) {
  const t = Math.floor(durationSeconds / 3600);
  const s = Math.floor((durationSeconds % 3600) / 60);
  const o = Math.floor(durationSeconds % 60);
  const a = (d) => d.toString().padStart(2, "0");
  if (t > 0) {
    return `${t}:${a(s)}:${a(o)}`;
  }
  return `${a(s)}:${a(o)}`;
}
