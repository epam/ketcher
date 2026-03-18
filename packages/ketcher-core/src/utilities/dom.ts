export function blurActiveElement(): void {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  document.activeElement?.blur();
}
