import i18n from 'i18next';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';

import common from '../locales/en/common.json';
import toolbar from '../locales/en/toolbar.json';
import toolbars from '../locales/en/toolbars.json';
import dialogs from '../locales/en/dialogs.json';
import components from '../locales/en/components.json';
import settings from '../locales/en/settings.json';

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
} as const;

if (!i18n.isInitialized) {
  i18n
    .use(ICU)
    .use(initReactI18next)
    .init({
      resources,
      lng: 'en',
      fallbackLng: 'en',
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
}

export default i18n;
