export function ensureString(value: string | JSON): string {
  return typeof value === 'string' ? value : JSON.stringify(value);
}
