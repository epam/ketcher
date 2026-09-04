import type { TFunction } from 'i18next';
import type { UiAction } from './action.types';

/**
 * UiAction.title is either a translation key ("namespace:key.path") or,
 * for entries sourced from external data (e.g. template names in
 * templates.js), already-resolved display text with no namespace prefix.
 * Only the former should be passed through t().
 */
export function resolveActionTitle(
  t: TFunction,
  action?: Pick<UiAction, 'title' | 'titleParams'>,
): string {
  if (!action?.title) {
    return '';
  }
  return action.title.includes(':')
    ? t(action.title, action.titleParams)
    : action.title;
}
