// AUTO-GENERATED — do not edit by hand.
// Regenerate with: npm run i18n:generate (also runs automatically before build/test).
// Source: packages/ketcher-macromolecules/scripts/generate-locale-resources.mjs
// Adding or removing a language is just adding/removing its src/locales/<code>/ directory
// (with both namespace files) and regenerating — no manual edit of this file or registerNamespaces.ts.

import macromolecules from '../locales/en/macromolecules.json';
import macromoleculesDialogs from '../locales/en/macromoleculesDialogs.json';

import macromolecules_zh_CN from '../locales/zh-CN/macromolecules.json';
import macromoleculesDialogs_zh_CN from '../locales/zh-CN/macromoleculesDialogs.json';

export const BASE_RESOURCES = { macromolecules, macromoleculesDialogs };

export const EXTRA_LOCALE_RESOURCES = {
  'zh-CN': {
    macromolecules: macromolecules_zh_CN,
    macromoleculesDialogs: macromoleculesDialogs_zh_CN,
  },
} as const satisfies Record<string, typeof BASE_RESOURCES>;
