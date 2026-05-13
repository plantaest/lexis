export function extractUniqueCode(dictionaryId: string) {
  return dictionaryId.substring(dictionaryId.lastIndexOf('.') + 1);
}
