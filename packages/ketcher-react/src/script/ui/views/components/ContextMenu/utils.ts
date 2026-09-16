import { difference } from 'lodash';
import { MonomerMicromolecule, type Bond, type Struct } from 'ketcher-core';

/**
 * Remove the word `bond` out of the title
 *
 * @example
 * formatTitle('Single Bond') === 'Single'
 */
export const formatTitle = (title: string) => {
  return title.slice(0, -5);
};

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
