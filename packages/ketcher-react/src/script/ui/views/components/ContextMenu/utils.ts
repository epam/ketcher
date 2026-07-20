import { difference } from 'lodash';
import { isAtomPartOfSuperAttachmentPoint, type Struct } from 'ketcher-core';
import type { Selection } from 'src/script/editor/Editor';
import Editor from 'src/script/editor';

const SUPER_ATTACHMENT_POINT_SELECTION_IGNORED_KEYS = ['enhancedFlags'];

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

export function getBondIdsConnectingSelectedAtoms(
  struct: Struct,
  atomIds: number[],
  selectedBondIds: number[] = [],
): number[] {
  if (selectedBondIds.length > 0) {
    return selectedBondIds;
  }

  const atomIdSet = new Set(atomIds);
  const bondIds: number[] = [];

  struct.bonds.forEach((bond, bondId) => {
    if (atomIdSet.has(bond.begin) && atomIdSet.has(bond.end)) {
      bondIds.push(bondId);
    }
  });

  return bondIds;
}

export function isContinuousAtomSelection(
  struct: Struct,
  atomIds: number[],
  bondIds: number[],
): boolean {
  if (atomIds.length < 2) {
    return false;
  }

  return Editor.isStructureContinuous(struct, {
    atoms: atomIds,
    bonds: bondIds,
  });
}

export function hasDisallowedSuperAttachmentPointSelectionElements(
  selection: Selection,
): boolean {
  const allowedKeys = new Set([
    'atoms',
    'bonds',
    ...SUPER_ATTACHMENT_POINT_SELECTION_IGNORED_KEYS,
  ]);

  return Object.keys(selection).some((key) => {
    if (allowedKeys.has(key)) {
      return false;
    }

    const value = selection[key as keyof Selection];
    return Array.isArray(value) && value.length > 0;
  });
}

export function areSelectedBondsAttachedToSelectedAtoms(
  struct: Struct,
  atomIds: number[],
  bondIds: number[],
): boolean {
  if (bondIds.length === 0) {
    return true;
  }

  const atomIdSet = new Set(atomIds);

  return bondIds.every((bondId) => {
    const bond = struct.bonds.get(bondId);
    return bond && (atomIdSet.has(bond.begin) || atomIdSet.has(bond.end));
  });
}

export function isSuperAttachmentPointCreationSelectionVisible(
  struct: Struct,
  selection: Selection | null,
): boolean {
  if (!selection?.atoms || selection.atoms.length < 2) {
    return false;
  }

  const bondIds = getBondIdsConnectingSelectedAtoms(
    struct,
    selection.atoms,
    selection.bonds,
  );

  return isContinuousAtomSelection(struct, selection.atoms, bondIds);
}

export function isSuperAttachmentPointCreationSelectionValid(
  struct: Struct,
  selection: Selection | null,
): boolean {
  if (!isSuperAttachmentPointCreationSelectionVisible(struct, selection)) {
    return false;
  }

  const atomIds = selection?.atoms ?? [];

  if (
    atomIds.some((atomId) => isAtomPartOfSuperAttachmentPoint(struct, atomId))
  ) {
    return false;
  }

  if (hasDisallowedSuperAttachmentPointSelectionElements(selection ?? {})) {
    return false;
  }

  if (
    !areSelectedBondsAttachedToSelectedAtoms(
      struct,
      atomIds,
      selection?.bonds ?? [],
    )
  ) {
    return false;
  }

  return true;
}
