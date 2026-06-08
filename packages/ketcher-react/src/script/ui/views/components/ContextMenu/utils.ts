import { difference } from 'lodash';

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
 * Get bond names from default export of `src/script/ui/action/tools.js`,
 * excluding bond types that cannot be applied via "convert this bond to
 * type X" UI flows (J3: haptic requires a SuperAttachmentPoint endpoint
 * and so can't apply to an atom↔atom bond).
 */
const BOND_TYPE_SUBMENU_EXCLUDED = ['bond-haptic'];

export const getBondNames = (tools) => {
  return Object.keys(tools).filter(
    (key) =>
      key.startsWith('bond-') && !BOND_TYPE_SUBMENU_EXCLUDED.includes(key),
  );
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
