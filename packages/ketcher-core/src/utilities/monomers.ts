import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { IKetIdtAliases } from 'application/formatters/types/ket';

export const HELM_ALIAS_FORMAT_ERROR_MESSAGE =
  'The HELM alias must consist only of uppercase and lowercase letters, numbers, underscores (_), asterisks (*), square brackets ([]), parentheses (()), dots (.), and hyphens (-), spaces prohibited.';

export const BILN_ALIAS_FORMAT_ERROR_MESSAGE =
  'The BILN alias must consist only of uppercase and lowercase letters, numbers, hyphens (`-`), underscores (`_`), and asterisks (`*`).';

export const AXOLABS_ALIAS_FORMAT_ERROR_MESSAGE =
  'The AxoLabs alias must consist of uppercase and lowercase letters, numbers, and brackets (`(` and `)`) (spaces prohibited).';

export const AXOLABS_ALIAS_BRACKET_ERROR_MESSAGE =
  'The open bracket (`(`) can only be the first and the closed bracket (`)`) last character of an AxoLabs alias.';

export const AXOLABS_ALIAS_MAX_LENGTH = 6;

export const AXOLABS_ALIAS_LENGTH_ERROR_MESSAGE = `The maximum number of characters of an AxoLabs alias without brackets is ${AXOLABS_ALIAS_MAX_LENGTH}.`;

export const AXOLABS_ALIAS_NOT_UNIQUE_ERROR_MESSAGE =
  'The AxoLabs alias for every position must be unique.';

export const HELM_ALIAS_MAX_LENGTH = 23;

export const HELM_ALIAS_LENGTH_ERROR_MESSAGE = `The HELM alias must be no more than ${HELM_ALIAS_MAX_LENGTH} symbols long.`;

export const IDT_ALIAS_SLASH_ERROR_MESSAGE =
  'The slashes (`/`) can only be the first and last character of an IDT alias.';

export const IDT_ALIAS_LENGTH_MAX = 10;

export const IDT_ALIAS_LENGTH_ERROR_MESSAGE = `The maximum number of characters of an IDT alias without slashes (/) is ${IDT_ALIAS_LENGTH_MAX}.`;

export const MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH = 200;

export const MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH_ERROR_MESSAGE = `The monomer group template name must not exceed ${MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH} characters.`;

export const MODIFICATION_TYPES_MAX_LENGTH = 200;

export const MODIFICATION_TYPES_EMPTY_ERROR_MESSAGE =
  "The modificationTypes couldn't be empty";

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
Returns the modification types of a monomer that are not allowed in the
library (unknown / ambiguous / molecule markers). Returns an empty array when
the monomer has no modification types or all of them are allowed.

`modificationTypes` originates from parsed, untrusted library JSON, so it may
not actually be an array at runtime (e.g. a caller passing a bare string).
The `Array.isArray` guard turns such malformed input into an empty result
instead of a `TypeError`, which would otherwise escape the per-monomer loop
in `Editor.updateMonomersLibrary` and abort the whole chunk.
*/
export function getDisallowedModificationTypes(
  modificationTypes?: string[],
): string[] {
  return !Array.isArray(modificationTypes)
    ? []
    : modificationTypes.filter((type) =>
        disallowedModificationTypesSet.has(type),
      );
}

const HELM_ALIAS_REGEX = /^(?!.*\s)[A-Za-z0-9_*.[\]()-]+$/;
const AXOLABS_ALIAS_REGEX = /^[A-Za-z0-9()]+$/;
const BILN_ALIAS_REGEX = /^[A-Za-z0-9_*-]+$/;

/**
Validates that slashes in an IDT alias only appear as the first
and/or last character. Slashes in the middle are not allowed.
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

export type AxoLabsAliasFormatError = 'characters' | 'brackets' | 'length';

export function stripAxoLabsAliasBrackets(alias: string) {
  return alias.replace(/^\(/, '').replace(/\)$/, '');
}

export function wrapAxoLabsAlias(alias: string) {
  return `(${stripAxoLabsAliasBrackets(alias)})`;
}

export function getAxoLabsAliasFormatError(
  alias: string,
): AxoLabsAliasFormatError | undefined {
  if (alias === '') {
    return undefined;
  }
  if (!AXOLABS_ALIAS_REGEX.test(alias)) {
    return 'characters';
  }
  const withoutBrackets = stripAxoLabsAliasBrackets(alias);
  if (/[()]/.test(withoutBrackets)) {
    return 'brackets';
  }
  if (
    withoutBrackets.length === 0 ||
    withoutBrackets.length > AXOLABS_ALIAS_MAX_LENGTH
  ) {
    return 'length';
  }
  return undefined;
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

/**
Validates the modificationTypes value according to the format requirements:
- Optional field
- Max length 200 characters (total sum of all elements)
- Any symbol except formatting ones (tabs, newlines, etc.)
- Spaces allowed
- An empty array is valid (no modification types)
- Cannot contain only whitespace/formatting characters

@param modificationTypes - The value to validate (can be string[] or undefined)
@returns true if valid, false if invalid
*/
export function isValidModificationTypes(
  modificationTypes?: string[],
): boolean {
  // If modificationTypes is not provided or is not an array, it's valid (optional field)
  if (!modificationTypes || !Array.isArray(modificationTypes)) {
    return true;
  }

  if (modificationTypes.length === 0) {
    return true;
  }

  // Trim spaces from all elements before validation
  const trimmedTypes = modificationTypes.map((type) => type.trim());

  // Check if all elements are empty after trimming
  const hasNonEmptyContent = trimmedTypes.some((type) => type.length > 0);
  if (!hasNonEmptyContent) {
    return false;
  }

  // Check total length of all trimmed elements combined
  const totalLength = trimmedTypes.reduce((sum, type) => sum + type.length, 0);
  if (totalLength > MODIFICATION_TYPES_MAX_LENGTH) {
    return false;
  }

  return true;
}
