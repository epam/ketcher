import { BaseMonomer } from 'domain/entities/BaseMonomer';

export const HELM_ALIAS_FORMAT_ERROR_MESSAGE =
  'The HELM alias must consist only of uppercase and lowercase letters, numbers, underscores (_), asterisks (*), square brackets ([]), parentheses (()), dots (.), and hyphens (-), spaces prohibited.';

export const IDT_ALIAS_SLASH_ERROR_MESSAGE =
  'The slashes (`/`) can only be the first and last character of an IDT alias.';

export const IDT_ALIAS_MAX_LENGTH_WITHOUT_SLASHES = 10;

export const IDT_ALIAS_LENGTH_ERROR_MESSAGE = `The maximum number of characters of an IDT alias without slashes (/) is ${IDT_ALIAS_MAX_LENGTH_WITHOUT_SLASHES}.`;

const HELM_ALIAS_REGEX = /^(?!.*\s)[A-Za-z0-9_*.[\]()-]+$/;

/**
 * Validates that slashes in an IDT alias only appear as the first
 * and/or last character. Slashes in the middle are not allowed.
 */
export function isValidIdtAlias(alias: string): boolean {
  if (!alias) return true;
  const inner = alias.slice(1, -1);
  return !inner.includes('/');
}

/**
 * Validates that an IDT alias does not exceed the maximum allowed length,
 *except for the slash-wrapped modification form (`/alias/`).
 */

export function isIdtAliasLengthValid(alias: string): boolean {
  if (!alias) return true;
  const hasLeadingSlash = alias.startsWith('/');
  const hasTrailingSlash = alias.endsWith('/');
  if (hasLeadingSlash && hasTrailingSlash) return true;
  if (hasLeadingSlash || hasTrailingSlash) return false;
  return alias.length <= IDT_ALIAS_MAX_LENGTH_WITHOUT_SLASHES;
}

export function isValidHelmAlias(alias: string) {
  return HELM_ALIAS_REGEX.test(alias);
}

export function isMonomerSgroupWithAttachmentPoints(monomer: BaseMonomer) {
  const sgroups = monomer.monomerItem.struct.sgroups;

  return (
    monomer.monomerItem.props.isMicromoleculeFragment &&
    sgroups.some((sgroup) => sgroup.isSuperatomWithoutLabel)
  );
}
