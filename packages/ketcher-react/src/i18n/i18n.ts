import i18n from 'i18next';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';

import common from '../locales/en/common.json';
import toolbar from '../locales/en/toolbar.json';
import toolbars from '../locales/en/toolbars.json';
import dialogs from '../locales/en/dialogs.json';
import components from '../locales/en/components.json';
import settings from '../locales/en/settings.json';

// Imported unconditionally (ES module imports can't be conditional), but
// referenced only inside the `!SINGLE_LANGUAGE_BUILD` branch below. Once
// @rollup/plugin-replace substitutes KETCHER_SINGLE_LANGUAGE_BUILD with a
// literal, Rollup's tree-shaking removes the now-unreachable branch and,
// with it, these imports and the JSON modules they pull in — this is the
// same "shrink the bundle via NODE_ENV" pattern plugin-replace's own docs
// use as their example. Verified empirically (see design.md's Section 9
// bundle-verification note), not just assumed from the pattern.
import commonZhCN from '../locales/zh-CN/common.json';
import toolbarZhCN from '../locales/zh-CN/toolbar.json';
import toolbarsZhCN from '../locales/zh-CN/toolbars.json';
import dialogsZhCN from '../locales/zh-CN/dialogs.json';
import componentsZhCN from '../locales/zh-CN/components.json';
import settingsZhCN from '../locales/zh-CN/settings.json';

export const defaultNS = 'common';

// Customer build-time requirement: a flag that strips every non-English
// locale payload out of the shipped bundle, leaving only English. Read once
// as a plain boolean so every branch below folds to a literal after
// @rollup/plugin-replace substitutes the env var at build time.
const SINGLE_LANGUAGE_BUILD =
  process.env.KETCHER_SINGLE_LANGUAGE_BUILD === 'true';

type LocaleResources = {
  common: typeof common;
  toolbar: typeof toolbar;
  toolbars: typeof toolbars;
  dialogs: typeof dialogs;
  components: typeof components;
  settings: typeof settings;
};

// Typed as if both locales are always present, even though the 'zh-CN' key
// is genuinely absent at runtime in a single-language build — the type only
// needs to describe the full (non-flagged) shape so SupportedLanguage/
// isSupportedLanguage keep working unchanged across both build variants.
export const resources: { en: LocaleResources; 'zh-CN': LocaleResources } =
  SINGLE_LANGUAGE_BUILD
    ? ({
        en: { common, toolbar, toolbars, dialogs, components, settings },
      } as { en: LocaleResources; 'zh-CN': LocaleResources })
    : {
        en: { common, toolbar, toolbars, dialogs, components, settings },
        'zh-CN': {
          common: commonZhCN,
          toolbar: toolbarZhCN,
          toolbars: toolbarsZhCN,
          dialogs: dialogsZhCN,
          components: componentsZhCN,
          settings: settingsZhCN,
        },
      };

export interface SupportedLanguage {
  code: keyof typeof resources;
  label: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = SINGLE_LANGUAGE_BUILD
  ? [{ code: 'en', label: 'English' }]
  : [
      { code: 'en', label: 'English' },
      { code: 'zh-CN', label: '简体中文' },
    ];

const DEFAULT_LANGUAGE = 'en';
const LANGUAGE_STORAGE_KEY = 'ketcher-language';

function isSupportedLanguage(value: unknown): value is keyof typeof resources {
  return SUPPORTED_LANGUAGES.some((language) => language.code === value);
}

function getStoredLanguage(): keyof typeof resources {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isSupportedLanguage(stored) ? stored : DEFAULT_LANGUAGE;
}

if (!i18n.isInitialized) {
  i18n
    .use(ICU)
    .use(initReactI18next)
    .init({
      resources,
      lng: getStoredLanguage(),
      fallbackLng: DEFAULT_LANGUAGE,
      defaultNS,
      ns: Object.keys(resources.en),
      interpolation: {
        escapeValue: false,
      },
      returnEmptyString: false,
      saveMissing: process.env.NODE_ENV === 'development',
      missingKeyHandler:
        process.env.NODE_ENV === 'development'
          ? (_lngs, ns, key) => {
              console.warn(`[i18n] Missing key "${key}" in namespace "${ns}"`);
            }
          : undefined,
    });

  if (typeof window !== 'undefined') {
    i18n.on('languageChanged', (lng) => {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    });
  }
}

export default i18n;
