import { difference } from 'lodash';
import {
  Bond,
  isAtomPartOfAttachmentGroup,
  MonomerMicromolecule,
  type Struct,
} from 'ketcher-core';
import type { Selection } from 'src/script/editor/Editor';
import { isStructureContinuous } from 'src/script/editor/utils/structureContinuity';

const ATTACHMENT_GROUP_SELECTION_IGNORED_KEYS = ['enhancedFlags'];

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

export const getBondNamesForSelectionContextMenu = (tools) =>
  getBondNames(tools).filter((name) => name !== 'bond-haptic');

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

const BOND_NAMES_EXCLUDED_FROM_CONTEXT_MENU = new Set(['bond-', 'bond-haptic']);

export const getBondNamesForContextMenu = (tools) =>
  getNonQueryBondNames(tools).filter(
    (name) => !BOND_NAMES_EXCLUDED_FROM_CONTEXT_MENU.has(name),
  );

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

export function getEditableAtomIds(struct: Struct, atomIds: number[]) {
  return atomIds.filter((atomId) => struct.atoms.has(atomId));
}

export function getEditableBondIds(struct: Struct, bondIds: number[]) {
  return bondIds.filter((bondId) => {
    const bond = struct.bonds.get(bondId);
    if (!bond || bond.type !== Bond.PATTERN.TYPE.HAPTIC) {
      return true;
    }

    return ![bond.begin, bond.end].some((endpointId) =>
      struct.attachmentGroups.has(endpointId),
    );
  });
}

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
): number[] {
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

  return isStructureContinuous(struct, {
    atoms: atomIds,
    bonds: bondIds,
  });
}

export function hasDisallowedAttachmentGroupSelectionElements(
  selection: Selection,
): boolean {
  const allowedKeys = new Set([
    'atoms',
    'bonds',
    ...ATTACHMENT_GROUP_SELECTION_IGNORED_KEYS,
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

export function isAttachmentGroupCreationSelectionValid(
  struct: Struct,
  selection: Selection | null,
): boolean {
  if (!selection?.atoms || selection.atoms.length < 2) {
    return false;
  }

  const atomIds = selection.atoms;
  const bondIds = getBondIdsConnectingSelectedAtoms(struct, atomIds);

  if (!isContinuousAtomSelection(struct, atomIds, bondIds)) {
    return false;
  }

  if (atomIds.some((atomId) => isAtomPartOfAttachmentGroup(struct, atomId))) {
    return false;
  }

  if (hasDisallowedAttachmentGroupSelectionElements(selection ?? {})) {
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
