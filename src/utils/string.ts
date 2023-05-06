export function plural(count: number, word: string, customPlural?: string): string {
  if (count === 1) {
    return word
  }

  if (customPlural) {
    return customPlural
  }

  return `${word}s`
}
