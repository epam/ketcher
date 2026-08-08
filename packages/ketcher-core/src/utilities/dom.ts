export function blurActiveElement(): void {
  const activeElement = document.activeElement;
  if (
    activeElement instanceof HTMLElement ||
    activeElement instanceof SVGElement
  ) {
    activeElement.blur();
  }
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
