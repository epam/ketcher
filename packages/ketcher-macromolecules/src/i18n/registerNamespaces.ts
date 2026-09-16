import { i18n } from 'ketcher-react';

import macromoleculesEn from '../locales/en/macromolecules.json';
import macromoleculesDialogsEn from '../locales/en/macromoleculesDialogs.json';
import macromoleculesZhCN from '../locales/zh-CN/macromolecules.json';
import macromoleculesDialogsZhCN from '../locales/zh-CN/macromoleculesDialogs.json';

/**
 * ketcher-macromolecules renders inside ketcher-react's <I18nextProvider>
 * (see Editor.tsx), so it reuses that shared i18next instance instead of
 * standing up its own. Namespaces are merged in here via addResourceBundle
 * rather than added to ketcher-react's own i18n.ts, to avoid a reverse
 * ketcher-react -> ketcher-macromolecules source dependency (macromolecules
 * already depends on react, not the other way around).
 */
i18n.addResourceBundle('en', 'macromolecules', macromoleculesEn);
i18n.addResourceBundle('en', 'macromoleculesDialogs', macromoleculesDialogsEn);
i18n.addResourceBundle('zh-CN', 'macromolecules', macromoleculesZhCN);
i18n.addResourceBundle(
  'zh-CN',
  'macromoleculesDialogs',
  macromoleculesDialogsZhCN,
);
