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

export const IDT_ALIAS_FORMAT_ERROR_MESSAGE =
  'The IDT alias must consist of uppercase and lowercase letters, numbers, hyphens (-), underscores (_), and slashes (/) (spaces prohibited).';

export const IDT_ALIAS_CHARSET_REGEX = /^[A-Za-z0-9_/-]+$/;

export const MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH = 200;

export const MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH_ERROR_MESSAGE = `The monomer group template name must not exceed ${MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH} characters.`;

// Modification types that mark a monomer as unknown, ambiguous, or a plain
// molecule. Such monomers must not be added to or shown in the library (#8133).
export const DISALLOWED_MONOMER_MODIFICATION_TYPES = [
  'Ambiguous mixed peptide',
  'Unknown peptide',
  'Ambiguous alternative sugar',
  'Ambiguous mixed sugar',
  'Unknown sugar',
  'Ambiguous mixed DNA base',
  'Ambiguous mixed RNA base',
  'Ambiguous mixed base',
  'Unknown base',
  'Ambiguous alternative phosphate',
  'Ambiguous mixed phosphate',
  'Unknown phosphate',
  'Unknown unsplit nucleotide',
  'Ambiguous alternative CHEM',
  'Ambiguous mixed CHEM',
  'Unknown CHEM',
  'Unknown monomer',
  'Molecule',
  'Micromolecule',
] as const;

export const DISALLOWED_MODIFICATION_TYPE_ERROR_MESSAGE =
  'Monomers with an unknown, ambiguous, or molecule modification type cannot be added to the library.';

const disallowedModificationTypesSet = new Set<string>(
  DISALLOWED_MONOMER_MODIFICATION_TYPES,
);

/**
 * Returns the modification types of a monomer that are not allowed in the
 * library (unknown / ambiguous / molecule markers). Returns an empty array when
 * the monomer has no modification types or all of them are allowed.
 *
 * `modificationTypes` originates from parsed, untrusted library JSON, so it may
 * not actually be an array at runtime (e.g. a caller passing a bare string).
 * The `Array.isArray` guard turns such malformed input into an empty result
 * instead of a `TypeError`, which would otherwise escape the per-monomer loop
 * in `Editor.updateMonomersLibrary` and abort the whole chunk.
 */
export function getDisallowedModificationTypes(
  modificationTypes?: string[],
): string[] {
  if (!Array.isArray(modificationTypes)) {
    return [];
  }

  return modificationTypes.filter((type) =>
    disallowedModificationTypesSet.has(type),
  );
}

const HELM_ALIAS_REGEX = /^(?!.*\s)[A-Za-z0-9_*.[\]()-]+$/;
const BILN_ALIAS_REGEX = /^[A-Za-z0-9_*-]+$/;

/**
 * Validates that an IDT alias uses only the allowed character set
 * (letters, digits, hyphens, underscores, and slashes; no spaces).
 */
export function isValidIdtAliasFormat(alias: string): boolean {
  if (!alias) return true;
  return IDT_ALIAS_CHARSET_REGEX.test(alias);
}

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

const stripTerminalSlashes = (value: string): string =>
  value.replace(/^\//, '').replace(/\/$/, '');

const stripPositionIndicator = (
  core: string,
  indicator: '5' | 'i' | '3',
): string =>
  core.startsWith(indicator) && core.length > 1 ? core.slice(1) : core;

/**
 * Builds a canonical `IKetIdtAliases` from the three wizard IDT inputs.
 * Collapses matching 5′/internal/3′ indicator forms to `{ base }` when possible;
 * otherwise stores a `base` plus per-position slash-wrapped modifications.
 */
export function buildIdtAliasesFromWizardInputs(
  idt5?: string,
  idtInternal?: string,
  idt3?: string,
): IKetIdtAliases | undefined {
  const endpoint5 = idt5?.trim() || undefined;
  const internal = idtInternal?.trim() || undefined;
  const endpoint3 = idt3?.trim() || undefined;

  if (!endpoint5 && !internal && !endpoint3) {
    return undefined;
  }

  const core5 = endpoint5 ? stripTerminalSlashes(endpoint5) : undefined;
  const coreInternal = internal ? stripTerminalSlashes(internal) : undefined;
  const core3 = endpoint3 ? stripTerminalSlashes(endpoint3) : undefined;

  if (
    core5 &&
    coreInternal &&
    core3 &&
    core5.startsWith('5') &&
    coreInternal.startsWith('i') &&
    core3.startsWith('3') &&
    core5.slice(1).length > 0 &&
    core5.slice(1) === coreInternal.slice(1) &&
    coreInternal.slice(1) === core3.slice(1)
  ) {
    return { base: core5.slice(1) };
  }

  let base: string;
  if (core5) {
    base = stripPositionIndicator(core5, '5');
  } else if (coreInternal) {
    base = stripPositionIndicator(coreInternal, 'i');
  } else if (core3) {
    base = stripPositionIndicator(core3, '3');
  } else {
    // Unreachable: at least one position is defined above.
    return undefined;
  }

  const modifications: NonNullable<IKetIdtAliases['modifications']> = {};
  if (core5) {
    modifications.endpoint5 = `/${core5}/`;
  }
  if (coreInternal) {
    modifications.internal = `/${coreInternal}/`;
  }
  if (core3) {
    modifications.endpoint3 = `/${core3}/`;
  }

  return { base, modifications };
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
