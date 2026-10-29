import { useEffect } from 'react';
import { guardForMacromoleculesEditor } from 'ketcher-core';

export function useMacromoleculesHotkeys() {
  useEffect(() => {
    const HELP_LINK = (import.meta.env.HELP_LINK as string) || 'master';
    const helpUrl = `https://github.com/epam/ketcher/blob/${HELP_LINK}/documentation/help.md#ketcher-macromolecules-mode`;

    const handler = guardForMacromoleculesEditor((event_: KeyboardEvent) => {
      if (event_.defaultPrevented) return;

      const target = event_.target as HTMLElement | null;
      const isEditableTarget = !!(
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.closest('[contenteditable="true"]'))
      );

      if (isEditableTarget) return;

      const isQuestionHotkey =
        event_.key === '?' || (event_.key === '/' && event_.shiftKey);
      if (isQuestionHotkey && !event_.repeat) {
        event_.preventDefault();
        window.open(helpUrl, '_blank')?.focus?.();
      }
    });

    globalThis.addEventListener('keydown', handler);
    return () => globalThis.removeEventListener('keydown', handler);
  }, []);
}
