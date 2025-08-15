import { useEffect } from 'react';

export function useMacromoleculesHotkeys() {
  useEffect(() => {
    const HELP_LINK = (process.env.HELP_LINK as string) || 'master';
    const helpUrl = `https://github.com/epam/ketcher/blob/${HELP_LINK}/documentation/help.md#ketcher-macromolecules-mode`;

    const handler = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;

      const target = e.target as HTMLElement | null;
      const isEditableTarget = !!(
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.closest('[contenteditable="true"]'))
      );

      if (isEditableTarget) return;

      const isQuestionHotkey = e.key === '?' || (e.key === '/' && e.shiftKey);
      if (isQuestionHotkey && !e.repeat) {
        e.preventDefault();
        window.open(helpUrl, '_blank')?.focus?.();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
