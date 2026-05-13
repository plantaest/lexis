export function getNowDate() {
  return new Date().toISOString().split('.')[0] + 'Z';
}
