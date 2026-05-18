import { BaseMonomer } from 'domain/entities/BaseMonomer';
import {
  IKetIdtAliases,
  KetMonomerGroupTemplateClass,
} from 'application/formatters/types/ket';

export const HELM_ALIAS_FORMAT_ERROR_MESSAGE =
  'The HELM alias must consist only of uppercase and lowercase letters, numbers, underscores (_), asterisks (*), square brackets ([]), parentheses (()), dots (.), and hyphens (-), spaces prohibited.';

export const BILN_ALIAS_FORMAT_ERROR_MESSAGE =
  'The BILN alias must consist only of uppercase and lowercase letters, numbers, hyphens (`-`), underscores (`_`), and asterisks (`*`).';

export const IDT_ALIAS_SLASH_ERROR_MESSAGE =
  'The slashes (`/`) can only be the first and last character of an IDT alias.';

export const IDT_ALIAS_LENGTH_MAX = 12;

export const IDT_ALIAS_LENGTH_ERROR_MESSAGE = `IDT alias length must not exceed ${IDT_ALIAS_LENGTH_MAX} characters (including slashes).`;

export const MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH = 200;

export const MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH_ERROR_MESSAGE = `The monomer group template name must not exceed ${MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH} characters.`;

export const MONOMER_GROUP_TEMPLATE_VALID_CLASSES = Object.values(
  KetMonomerGroupTemplateClass,
);

export const MONOMER_GROUP_TEMPLATE_CLASS_INVALID_ERROR_MESSAGE = `The monomer group template class must be one of: ${MONOMER_GROUP_TEMPLATE_VALID_CLASSES.join(
  ', ',
)}.`;

/**
 * Returns true when `value` is one of the valid monomer group template
 * classes. Note: an absent (`undefined`) class is NOT handled here — the
 * call site decides whether a missing class is acceptable.
 */
export function isValidMonomerGroupTemplateClass(
  value: unknown,
): value is KetMonomerGroupTemplateClass {
  return MONOMER_GROUP_TEMPLATE_VALID_CLASSES.includes(
    value as KetMonomerGroupTemplateClass,
  );
}

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
  return alias.length <= IDT_ALIAS_LENGTH_MAX;
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

export function isMonomerSgroupWithAttachmentPoints(monomer: BaseMonomer) {
  const sgroups = monomer.monomerItem.struct.sgroups;

  return (
    monomer.monomerItem.props.isMicromoleculeFragment &&
    sgroups.some((sgroup) => sgroup.isSuperatomWithoutLabel)
  );
}
