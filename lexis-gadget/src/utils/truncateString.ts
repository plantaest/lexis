export function truncateString(str) {
  const limit = 50;
  if (str.length > limit) {
    return str.slice(0, limit) + '...';
  }
  return str;
}
