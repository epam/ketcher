/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { useState, useEffect } from 'react';
import { isClipboardAPIAvailable } from 'ketcher-core';

/**
 * Hook to monitor clipboard state and determine if paste should be enabled.
 *
 * This hook:
 * 1. Checks clipboard content on component mount
 * 2. Listens for copy/cut events to track when clipboard has content
 * 3. Returns false when clipboard is empty, disabling paste operations
 *
 * Note: If clipboard API is unavailable or permissions are denied,
 * defaults to true to avoid blocking paste functionality.
 *
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
