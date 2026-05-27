export function blurActiveElement(): void {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  document.activeElement?.blur();
}

export function isEditableInputTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  // The cliparea is a hidden textarea used to capture copy/paste events,
  // so hotkeys must still fire when it is focused.
  if (target.hasAttribute('data-cliparea')) return false;
  return (
    target.nodeName === 'INPUT' ||
    target.nodeName === 'TEXTAREA' ||
    target.isContentEditable
  );
}
