import { difference } from 'lodash';
import type { TFunction } from 'i18next';
import { MonomerMicromolecule, type Bond, type Struct } from 'ketcher-core';
import { resolveTranslatableText } from 'src/script/ui/utils';

/**
 * Bond-type menu items only want the bare type name (e.g. "Single",
 * "Double") - a translation key shared with Bond.tsx's Type dropdown, not
 * the full "{type} Bond" sentence used for the toolbar action's own title.
 * Read it directly from titleParams instead of stripping a fixed-length
 * suffix off the resolved, translated string: that used to work by
 * coincidence in English (" Bond" is 5 characters) but corrupted the type
 * name in any locale where the translated suffix isn't also 5 characters
 * (e.g. zh-CN's "键" is 1 character).
 */
export const getBondTypeName = (
  action?: { titleParams?: Record<string, string> } | null,
  t?: TFunction,
) => resolveTranslatableText(action?.titleParams?.type ?? '', t);

/**
 * Get bond names from default export of `src/script/ui/action/tools.js`
 *
 * @returns `['bond-single', 'bond-up', 'bond-down', 'bond-updown', 'bond-double',
 * 'bond-crossed', 'bond-triple', 'bond-aromatic', 'bond-any', 'bond-hydrogen',
 * 'bond-singledouble', 'bond-singlearomatic', 'bond-doublearomatic', 'bond-dative']`
 */
export const getBondNames = (tools) => {
  return Object.keys(tools).filter((key) => key.startsWith('bond-'));
};

export const queryBondNames = [
  'bond-any',
  'bond-aromatic',
  'bond-singledouble',
  'bond-singlearomatic',
  'bond-doublearomatic',
];

export const MONOMER_WIZARD_DISALLOWED_BOND_TYPES = [
  'any',
  'singledouble',
  'singlearomatic',
  'doublearomatic',
];

export const monomerWizardDisallowedBondNames =
  MONOMER_WIZARD_DISALLOWED_BOND_TYPES.map((type) => `bond-${type}`);

/**
 * Get bond names except for query bonds
 *
 * @returns `['bond-single', 'bond-up', 'bond-down', 'bond-updown', 'bond-double',
 * 'bond-crossed', 'bond-triple', 'bond-aromatic', 'bond-hydrogen', 'bond-dative']`
 */
export const getNonQueryBondNames = (tools) => {
  const allBondNames = getBondNames(tools);
  return difference(allBondNames, queryBondNames);
};

/**
 * Check whether a bond connects two distinct monomers
 */
export const isBondBetweenMonomers = (
  bond: Bond | null | undefined,
  struct: Struct,
) => {
  if (!bond) {
    return false;
  }

  const beginAtomSgroup = struct.getGroupFromAtomId(bond.begin);
  const endAtomSgroup = struct.getGroupFromAtomId(bond.end);

  return (
    beginAtomSgroup instanceof MonomerMicromolecule &&
    endAtomSgroup instanceof MonomerMicromolecule &&
    beginAtomSgroup !== endAtomSgroup
  );
};

export const noOperation = () => null;

export function onlyHasProperty<T extends object>(
  checkedObject: T,
  key: keyof T,
  ignoredProps: string[] = [],
) {
  const props = Object.keys(checkedObject).filter(
    (key) => !ignoredProps.includes(key),
  );

  const numberOfProps = props.length;
  return numberOfProps === 1 && key in checkedObject;
}
