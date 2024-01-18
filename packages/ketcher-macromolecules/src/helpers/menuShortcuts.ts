import { hotkeysConfiguration, shortcutStr } from 'ketcher-core';

type Shortcuts = {
  [key in keyof typeof hotkeysConfiguration]: string;
};

export const shortcuts = Object.keys(hotkeysConfiguration).reduce(
  (acc, key) => {
    if (hotkeysConfiguration[key]?.shortcut) {
      const shortcut = hotkeysConfiguration[key].shortcut;
      const processedShortcut = shortcutStr(shortcut);
      acc[key] = processedShortcut;
    }
    return acc;
  },
  {},
) as Shortcuts;
