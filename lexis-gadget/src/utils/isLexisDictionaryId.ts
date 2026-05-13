export function isLexisDictionaryId(id: string) {
  return /^Lexis\.Dict\.(Public|Private)\.[A-Z0-9]+-[A-Z0-9]+$/.test(id);
}
