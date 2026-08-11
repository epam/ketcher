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

/**
 * Wraps an event handler so it only fires when the macromolecules (polymer) editor is active.
 *
 * Both micro and macro editors coexist in the DOM simultaneously (one is visually hidden).
 * Use this guard on any window- or document-level event handler registered by macromolecules
 * editor components to prevent them from intercepting events while the micromolecules editor
 * is active.
 *
 * @example
 * const handler = guardForMacromoleculesEditor((e: KeyboardEvent) => { ... });
 * window.addEventListener('keydown', handler);
 * // cleanup:
 * window.removeEventListener('keydown', handler);
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function guardForMacromoleculesEditor<T extends (...args: any[]) => any>(
  handler: T,
): T {
  return ((...args: Parameters<T>) => {
    if (window.isPolymerEditorTurnedOn) {
      return handler(...args);
    }
    return undefined;
  }) as unknown as T;
}

/**
 * Wraps an event handler so it only fires when the micromolecules (small molecule) editor is active.
 *
 * Both micro and macro editors coexist in the DOM simultaneously (one is visually hidden).
 * Use this guard on any window- or document-level event handler registered by micromolecules
 * editor components to prevent them from intercepting events while the macromolecules editor
 * is active.
 *
 * @example
 * const handler = guardForMicromoleculesEditor((e: KeyboardEvent) => { ... });
 * window.addEventListener('keydown', handler);
 * // cleanup:
 * window.removeEventListener('keydown', handler);
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function guardForMicromoleculesEditor<T extends (...args: any[]) => any>(
  handler: T,
): T {
  return ((...args: Parameters<T>) => {
    if (!window.isPolymerEditorTurnedOn) {
      return handler(...args);
    }
    return undefined;
  }) as unknown as T;
}
