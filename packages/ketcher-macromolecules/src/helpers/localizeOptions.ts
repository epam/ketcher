import type { TFunction } from 'i18next';
import type { Option } from 'components/shared/dropDown/dropDown';

/**
 * Returns a copy of the options where every entry that declares a `labelKey`
 * gets its `label` replaced by the translation. Entries without a `labelKey`
 * are returned as is, so the English `label` remains their fallback.
 */
export const localizeOptions = <T extends Option>(
  options: Array<T>,
  t: TFunction,
): Array<T> =>
  options.map((option): T =>
    option.labelKey ? { ...option, label: t(option.labelKey) } : option,
  );
