import type { TFunction } from 'i18next';
import type { UiAction } from './action.types';

/**
 * UiAction.title is either a translation key ("namespace:key.path") or,
 * for entries sourced from external data (e.g. template names in
 * templates.js), already-resolved display text with no namespace prefix.
 * Only the former should be passed through t().
 *
 * The match must anchor the whole string — a plain-text title that merely
 * contains a punctuation colon (e.g. a label ending in "...:") would
 * otherwise be misidentified as a key and sent through t(), which can't
 * resolve it and logs a spurious missing-key warning.
 */
const TRANSLATION_KEY_RE =
  /^(?:common|toolbar|toolbars|dialogs|components|settings):[A-Za-z0-9_.-]+$/;

export function resolveActionTitle(
  t: TFunction,
  action?: Pick<UiAction, 'title' | 'titleParams'>,
): string {
  if (!action?.title) {
    return '';
  }
  return TRANSLATION_KEY_RE.test(action.title)
    ? t(action.title, action.titleParams)
    : action.title;
}
