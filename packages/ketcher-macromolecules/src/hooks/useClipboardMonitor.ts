import { useState, useEffect } from 'react';
import { isClipboardAPIAvailable } from 'ketcher-core';

/**
 * Hook to monitor clipboard state and determine if paste should be enabled
 * @returns boolean indicating if clipboard has content that can be pasted
 */
export const useClipboardMonitor = (): boolean => {
  const [hasClipboardContent, setHasClipboardContent] = useState(false);

  useEffect(() => {
    // Listen for copy/cut events to know when clipboard has content
    const handleCopyOrCut = () => {
      setHasClipboardContent(true);
    };

    // Check clipboard on mount if API is available
    const checkClipboardOnMount = async () => {
      if (!isClipboardAPIAvailable()) {
        // If clipboard API is not available, assume clipboard might have content
        // to avoid blocking paste functionality
        setHasClipboardContent(true);
        return;
      }

      try {
        const clipboardItems = await navigator.clipboard.read();
        if (clipboardItems && clipboardItems.length > 0) {
          const item = clipboardItems[0];
          // Check if clipboard has any text content
          for (const type of item.types) {
            if (type.includes('text') || type.includes('chemical')) {
              const blob = await item.getType(type);
              const text = await blob.text();
              if (text && text.trim()) {
                setHasClipboardContent(true);
                return;
              }
            }
          }
        }
        setHasClipboardContent(false);
      } catch (error) {
        // If we can't read clipboard (permission denied, etc.),
        // assume it might have content to avoid blocking functionality
        setHasClipboardContent(true);
      }
    };

    // Add event listeners
    window.addEventListener('copyOrCutComplete', handleCopyOrCut);
    window.addEventListener('copy', handleCopyOrCut);
    window.addEventListener('cut', handleCopyOrCut);

    // Check clipboard state on mount
    checkClipboardOnMount();

    // Cleanup
    return () => {
      window.removeEventListener('copyOrCutComplete', handleCopyOrCut);
      window.removeEventListener('copy', handleCopyOrCut);
      window.removeEventListener('cut', handleCopyOrCut);
    };
  }, []);

  return hasClipboardContent;
};
