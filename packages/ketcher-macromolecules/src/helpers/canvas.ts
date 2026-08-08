export function blurActiveElement() {
  (document.activeElement as HTMLElement | null)?.blur();
}
