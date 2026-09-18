import { i18n } from 'ketcher-react';

import macromoleculesEn from '../locales/en/macromolecules.json';
import macromoleculesDialogsEn from '../locales/en/macromoleculesDialogs.json';

// Imported unconditionally (ES module imports can't be conditional), but
// referenced only inside the `!SINGLE_LANGUAGE_BUILD` branch below - mirrors
// ketcher-react/src/i18n/i18n.ts's identical comment/pattern for the same
// customer requirement. Once @rollup/plugin-replace substitutes
// KETCHER_SINGLE_LANGUAGE_BUILD with a literal, Rollup's tree-shaking removes
// the unreachable branch and, with it, these imports and the JSON modules
// they pull in.
import macromoleculesZhCN from '../locales/zh-CN/macromolecules.json';
import macromoleculesDialogsZhCN from '../locales/zh-CN/macromoleculesDialogs.json';

const SINGLE_LANGUAGE_BUILD =
  process.env.KETCHER_SINGLE_LANGUAGE_BUILD === 'true';

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

if (!SINGLE_LANGUAGE_BUILD) {
  i18n.addResourceBundle('zh-CN', 'macromolecules', macromoleculesZhCN);
  i18n.addResourceBundle(
    'zh-CN',
    'macromoleculesDialogs',
    macromoleculesDialogsZhCN,
  );
}
