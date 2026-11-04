// AUTO-GENERATED — do not edit by hand.
// Regenerate with: npm run i18n:generate (also runs automatically before build/test).
// Source: packages/ketcher-react/scripts/generate-locale-resources.mjs
// Adding or removing a language is just adding/removing its src/locales/<code>/ directory
// (with all six namespace files) and regenerating — no manual edit of this file or i18n.ts.

import common from '../locales/en/common.json';
import toolbar from '../locales/en/toolbar.json';
import toolbars from '../locales/en/toolbars.json';
import dialogs from '../locales/en/dialogs.json';
import components from '../locales/en/components.json';
import settings from '../locales/en/settings.json';

import common_es from '../locales/es/common.json';
import toolbar_es from '../locales/es/toolbar.json';
import toolbars_es from '../locales/es/toolbars.json';
import dialogs_es from '../locales/es/dialogs.json';
import components_es from '../locales/es/components.json';
import settings_es from '../locales/es/settings.json';

import common_zh_CN from '../locales/zh-CN/common.json';
import toolbar_zh_CN from '../locales/zh-CN/toolbar.json';
import toolbars_zh_CN from '../locales/zh-CN/toolbars.json';
import dialogs_zh_CN from '../locales/zh-CN/dialogs.json';
import components_zh_CN from '../locales/zh-CN/components.json';
import settings_zh_CN from '../locales/zh-CN/settings.json';

export const BASE_RESOURCES = {
  common,
  toolbar,
  toolbars,
  dialogs,
  components,
  settings,
};

export const EXTRA_LOCALE_RESOURCES = {
  es: {
    common: common_es,
    toolbar: toolbar_es,
    toolbars: toolbars_es,
    dialogs: dialogs_es,
    components: components_es,
    settings: settings_es,
  },
  'zh-CN': {
    common: common_zh_CN,
    toolbar: toolbar_zh_CN,
    toolbars: toolbars_zh_CN,
    dialogs: dialogs_zh_CN,
    components: components_zh_CN,
    settings: settings_zh_CN,
  },
} as const satisfies Record<string, typeof BASE_RESOURCES>;
