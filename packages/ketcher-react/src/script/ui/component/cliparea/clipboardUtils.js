/**
 *
 * Legacy browser API doesn't support async operations, so it is not possible
 * to call indigo, when copy/cut/paste
 */
export function isClipboardAPIAvailable() {
  return (
    typeof navigator?.clipboard?.writeText === 'function' &&
    typeof navigator?.clipboard?.read === 'function'
  );
}

export function notifyCopyCut() {
  const event = new Event('copyOrCutComplete');
  window.dispatchEvent(event);
}
