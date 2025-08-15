/**
 * Safely sends a postMessage to parent window with proper error handling
 * @param message - The message to send
 * @param fallbackOrigin - Fallback origin if parent origin is not available
 */
export const safePostMessage = (
  message: Record<string, unknown>,
  fallbackOrigin: string = window.location.origin,
): void => {
  try {
    const isInIframe = window.parent !== window;
    const hasOpener = window.opener !== null;

    console.log('isInIframe', isInIframe);
    console.log('hasOpener', hasOpener);
    console.log('window.parent', window.parent);
    console.log('window.opener', window.opener);

    if (isInIframe) {
      console.log('Iframe mode: sending message to parent window');
    } else if (hasOpener) {
      const isPopup = window.location.pathname.includes('popup');
      if (isPopup) {
        console.log('Popup mode: sending message to opener window');
      } else {
        console.log('Standalone in parent window: sending message to opener');
      }
    } else {
      console.log(
        'Standalone mode: skipping postMessage (no parent/opener window)',
      );
      return;
    }

    let parentOrigin: string;
    try {
      if (isInIframe) {
        parentOrigin = window.parent.location.origin;
      } else if (hasOpener) {
        parentOrigin = window.opener?.location.origin || fallbackOrigin;
      } else {
        return;
      }
    } catch (error) {
      console.warn(
        'Cannot access parent/opener origin due to same-origin policy, using fallback:',
        fallbackOrigin,
      );
      parentOrigin = fallbackOrigin;
    }

    if (
      !parentOrigin ||
      parentOrigin === 'null' ||
      parentOrigin === 'undefined'
    ) {
      console.warn('Invalid parent origin, using fallback:', fallbackOrigin);
      parentOrigin = fallbackOrigin;
    }

    console.log('parentOrigin', parentOrigin);
    const targetWindow = isInIframe ? window.parent : window.opener;
    if (targetWindow) {
      targetWindow.postMessage(message, parentOrigin);
      console.log('Message sent successfully to:', parentOrigin);
    } else {
      console.warn('No target window available for postMessage');
    }
  } catch (error) {
    console.error('Failed to send postMessage:', error);
  }
};
