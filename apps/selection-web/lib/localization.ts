export function bilingualName(
  english: string | null | undefined,
  chinese?: string | null,
): string {
  const normalizedEnglish = typeof english === "string" ? english.trim() : "";
  const normalizedChinese = typeof chinese === "string" ? chinese.trim() : "";
  if (!normalizedEnglish) return normalizedChinese;
  if (!normalizedChinese || normalizedEnglish.includes(`（${normalizedChinese}）`)) {
    return normalizedEnglish;
  }
  return `${normalizedEnglish}（${normalizedChinese}）`;
}
