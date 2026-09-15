/* eslint-disable no-empty */
/**
 * Safely sends a postMessage to parent window with proper error handling
 * @param message - The message to send
 * @param fallbackOrigin - Fallback origin if parent origin is not available
 */
export const safePostMessage = (
  message: Record<string, unknown>,
  fallbackOrigin: string = globalThis.location.origin,
): void => {
  if (globalThis.parent === (globalThis as unknown as Window)) return;

  let parentOrigin = fallbackOrigin;
  try {
    parentOrigin = globalThis.parent.location.origin || fallbackOrigin;
  } catch {}

  if (
    !parentOrigin ||
    parentOrigin === 'null' ||
    parentOrigin === 'undefined'
  ) {
    parentOrigin = fallbackOrigin;
  }

  globalThis.parent.postMessage(message, parentOrigin);
};
