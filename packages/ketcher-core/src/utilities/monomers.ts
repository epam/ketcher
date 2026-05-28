import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { IKetIdtAliases } from 'application/formatters/types/ket';

export const HELM_ALIAS_FORMAT_ERROR_MESSAGE =
  'The HELM alias must consist only of uppercase and lowercase letters, numbers, underscores (_), asterisks (*), square brackets ([]), parentheses (()), dots (.), and hyphens (-), spaces prohibited.';

export const BILN_ALIAS_FORMAT_ERROR_MESSAGE =
  'The BILN alias must consist only of uppercase and lowercase letters, numbers, hyphens (`-`), underscores (`_`), and asterisks (`*`).';

export const HELM_ALIAS_MAX_LENGTH = 23;

export const HELM_ALIAS_LENGTH_ERROR_MESSAGE = `The HELM alias must be no more than ${HELM_ALIAS_MAX_LENGTH} symbols long.`;

export const IDT_ALIAS_SLASH_ERROR_MESSAGE =
  'The slashes (`/`) can only be the first and last character of an IDT alias.';

export const IDT_ALIAS_LENGTH_MAX = 10;

export const IDT_ALIAS_LENGTH_ERROR_MESSAGE = `The maximum number of characters of an IDT alias without slashes (/) is ${IDT_ALIAS_LENGTH_MAX}.`;

export const MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH = 200;

export const MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH_ERROR_MESSAGE = `The monomer group template name must not exceed ${MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH} characters.`;

const HELM_ALIAS_REGEX = /^(?!.*\s)[A-Za-z0-9_*.[\]()-]+$/;
const BILN_ALIAS_REGEX = /^[A-Za-z0-9_*-]+$/;

/**
 * Validates that slashes in an IDT alias only appear as the first
 * and/or last character. Slashes in the middle are not allowed.
 */
export function isValidIdtAlias(alias: string): boolean {
  if (!alias) return true;
  const inner = alias.slice(1, -1);
  return !inner.includes('/');
}

export function isValidIdtAliasLength(alias: string): boolean {
  if (!alias) return true;
  const withoutSlashes = alias.replace(/^\//, '').replace(/\/$/, '');
  return withoutSlashes.length <= IDT_ALIAS_LENGTH_MAX;
}

export function getTooLongIdtAliasEntries(
  idtAliases: IKetIdtAliases,
): { alias: string; value: string }[] {
  const { base, modifications } = idtAliases;
  return [
    { alias: 'base', value: base },
    { alias: 'endpoint3', value: modifications?.endpoint3 },
    { alias: 'endpoint5', value: modifications?.endpoint5 },
    { alias: 'internal', value: modifications?.internal },
  ]
    .filter((entry): entry is { alias: string; value: string } =>
      Boolean(entry.value),
    )
    .filter(({ value }) => !isValidIdtAliasLength(value));
}

export function isValidHelmAlias(alias: string) {
  return HELM_ALIAS_REGEX.test(alias);
}

export function isValidBilnAlias(alias: string) {
  return BILN_ALIAS_REGEX.test(alias);
}

export function isValidHelmAliasLength(alias: string) {
  return alias.length <= HELM_ALIAS_MAX_LENGTH;
}

export function isMonomerSgroupWithAttachmentPoints(monomer: BaseMonomer) {
  const sgroups = monomer.monomerItem.struct.sgroups;

  return (
    monomer.monomerItem.props.isMicromoleculeFragment &&
    sgroups.some((sgroup) => sgroup.isSuperatomWithoutLabel)
  );
}
