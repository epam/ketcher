import type { TFunction } from 'i18next';

/**
 * Group titles are either namespace-qualified i18n keys
 * ("macromolecules:library.noNaturalAnalogue") or literal codes ("A", "U").
 * Only the former are translated; translating a literal would log a spurious
 * missing-key warning.
 */
export const resolveLocalizedTitle = (
  title: string | undefined,
  t: TFunction,
): string | undefined =>
  title?.startsWith('macromolecules:') ? t(title) : title;
