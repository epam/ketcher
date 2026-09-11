import i18n from 'i18next';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';

import common from '../locales/en/common.json';
import toolbar from '../locales/en/toolbar.json';
import toolbars from '../locales/en/toolbars.json';
import dialogs from '../locales/en/dialogs.json';
import components from '../locales/en/components.json';
import settings from '../locales/en/settings.json';

import commonZhCN from '../locales/zh-CN/common.json';
import toolbarZhCN from '../locales/zh-CN/toolbar.json';
import toolbarsZhCN from '../locales/zh-CN/toolbars.json';
import dialogsZhCN from '../locales/zh-CN/dialogs.json';
import componentsZhCN from '../locales/zh-CN/components.json';
import settingsZhCN from '../locales/zh-CN/settings.json';

export const defaultNS = 'common';

export const resources = {
  en: {
    common,
    toolbar,
    toolbars,
    dialogs,
    components,
    settings,
  },
  'zh-CN': {
    common: commonZhCN,
    toolbar: toolbarZhCN,
    toolbars: toolbarsZhCN,
    dialogs: dialogsZhCN,
    components: componentsZhCN,
    settings: settingsZhCN,
  },
} as const;

export interface SupportedLanguage {
  code: keyof typeof resources;
  label: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
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
              // eslint-disable-next-line no-console
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
