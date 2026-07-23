/**
 * Safely sends a postMessage to parent window with proper error handling
 * @param message - The message to send
 * @param fallbackOrigin - Fallback origin if parent origin is not available
 */
export const safePostMessage = (
  message: Record<string, unknown>,
  fallbackOrigin: string = window.location.origin,
): void => {
  if (window.parent === window) return;

  let parentOrigin = fallbackOrigin;
  try {
    parentOrigin = window.parent.location.origin || fallbackOrigin;
  } catch {}

  if (
    !parentOrigin ||
    parentOrigin === 'null' ||
    parentOrigin === 'undefined'
  ) {
    parentOrigin = fallbackOrigin;
  }

  window.parent.postMessage(message, parentOrigin);
};
