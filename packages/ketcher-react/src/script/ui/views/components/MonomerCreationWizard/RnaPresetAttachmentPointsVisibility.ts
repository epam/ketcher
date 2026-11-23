import {
  type RnaPresetComponentKey,
  type Struct,
  AttachmentPointName,
} from 'ketcher-core';

import type { RnaPresetWizardState } from './MonomerCreationWizard.types';
import {
  type PhosphatePosition,
  getRequiredAttachmentPointsForPhosphatePosition,
} from './RnaPresetAttachmentPointValidation';
import { findBondBetweenRnaPresetComponents } from './RnaPresetStructureValidation';

type AttachmentPointMap = Map<AttachmentPointName, [number, number]>;
type ComponentAttachmentPointNames = Record<
  RnaPresetComponentKey,
  AttachmentPointName[]
>;

const RNA_COMPONENT_KEYS: RnaPresetComponentKey[] = [
  'base',
  'sugar',
  'phosphate',
];

const getEmptyComponentAttachmentPointNames =
  (): ComponentAttachmentPointNames => ({
    base: [],
    sugar: [],
    phosphate: [],
  });

const addComponentAttachmentPoint = (
  attachmentPoints: ComponentAttachmentPointNames,
  componentKey: RnaPresetComponentKey,
  attachmentPointName: AttachmentPointName,
) => {
  if (!attachmentPoints[componentKey].includes(attachmentPointName)) {
    attachmentPoints[componentKey].push(attachmentPointName);
  }
};

const getAtomToComponentMap = (wizardState: RnaPresetWizardState) => {
  const atomToComponentMap = new Map<number, RnaPresetComponentKey>();

  RNA_COMPONENT_KEYS.forEach((componentKey) => {
    wizardState[componentKey].structure?.atoms?.forEach((atomId) => {
      atomToComponentMap.set(atomId, componentKey);
    });
  });

  return atomToComponentMap;
};

export const getAttachmentPointsForRnaPresetComponent = (
  assignedAttachmentPoints: AttachmentPointMap,
  wizardState: RnaPresetWizardState,
  componentKey: RnaPresetComponentKey,
): AttachmentPointMap => {
  const componentAtomIds = new Set(
    wizardState[componentKey].structure?.atoms ?? [],
  );

  return new Map(
    [...assignedAttachmentPoints.entries()].filter(([, [attachmentAtomId]]) =>
      componentAtomIds.has(attachmentAtomId),
    ),
  );
};

export const getConnectionAttachmentPointsForRnaPreset = (
  wizardState: RnaPresetWizardState,
  struct: Struct,
  phosphatePosition?: PhosphatePosition,
): ComponentAttachmentPointNames => {
  const connectionAttachmentPoints = getEmptyComponentAttachmentPointNames();
  const baseAtoms = wizardState.base.structure?.atoms ?? [];
  const sugarAtoms = wizardState.sugar.structure?.atoms ?? [];
  const phosphateAtoms = wizardState.phosphate.structure?.atoms ?? [];

  if (
    sugarAtoms.length > 0 &&
    baseAtoms.length > 0 &&
    findBondBetweenRnaPresetComponents(struct, sugarAtoms, baseAtoms)
  ) {
    addComponentAttachmentPoint(
      connectionAttachmentPoints,
      'sugar',
      AttachmentPointName.R3,
    );
    addComponentAttachmentPoint(
      connectionAttachmentPoints,
      'base',
      AttachmentPointName.R1,
    );
  }

  if (
    phosphatePosition &&
    sugarAtoms.length > 0 &&
    phosphateAtoms.length > 0 &&
    findBondBetweenRnaPresetComponents(struct, sugarAtoms, phosphateAtoms)
  ) {
    const requiredAttachmentPoints =
      getRequiredAttachmentPointsForPhosphatePosition(phosphatePosition);

    addComponentAttachmentPoint(
      connectionAttachmentPoints,
      'sugar',
      requiredAttachmentPoints.sugar,
    );
    addComponentAttachmentPoint(
      connectionAttachmentPoints,
      'phosphate',
      requiredAttachmentPoints.phosphate,
    );
  }

  return connectionAttachmentPoints;
};

export const getConnectionAttachmentPointsForRnaPresetComponent = (
  wizardState: RnaPresetWizardState,
  struct: Struct,
  componentKey: RnaPresetComponentKey,
  phosphatePosition?: PhosphatePosition,
): AttachmentPointName[] => {
  return getConnectionAttachmentPointsForRnaPreset(
    wizardState,
    struct,
    phosphatePosition,
  )[componentKey];
};

/**
 * Returns all inter-component connection atom IDs for the RNA preset.
 * Each boundary atom is included so both ends of every connection are visible.
 */
export const getConnectionAttachmentPointAtomIdsForRnaPreset = (
  wizardState: RnaPresetWizardState,
  struct: Struct,
  phosphatePosition?: PhosphatePosition,
): Map<AttachmentPointName, [number, number]> => {
  const result = new Map<AttachmentPointName, [number, number]>();
  const seenAtomIds = new Set<number>();
  const fallbackApNames = [
    AttachmentPointName.R4,
    AttachmentPointName.R5,
    AttachmentPointName.R6,
    AttachmentPointName.R7,
  ];
  let fallbackIdx = 0;

  const addConnectionAtom = (
    apName: AttachmentPointName,
    atomIds: [number, number],
  ) => {
    const [atomId] = atomIds;
    if (seenAtomIds.has(atomId)) {
      return;
    }

    seenAtomIds.add(atomId);
    if (!result.has(apName)) {
      result.set(apName, atomIds);
      return;
    }

    const fallbackApName = fallbackApNames[fallbackIdx++];
    if (fallbackApName !== undefined) {
      result.set(fallbackApName, atomIds);
    }
  };
  const baseAtoms = wizardState.base.structure?.atoms ?? [];
  const sugarAtoms = wizardState.sugar.structure?.atoms ?? [];
  const phosphateAtoms = wizardState.phosphate.structure?.atoms ?? [];

  // Keep the existing preset-tab ordering when resolving duplicate AP names.
  if (sugarAtoms.length > 0 && baseAtoms.length > 0) {
    const bond = findBondBetweenRnaPresetComponents(
      struct,
      sugarAtoms,
      baseAtoms,
    );
    if (bond) {
      const sugarAtomId = sugarAtoms.includes(bond.begin)
        ? bond.begin
        : bond.end;
      const baseAtomId = baseAtoms.includes(bond.begin) ? bond.begin : bond.end;

      addConnectionAtom(AttachmentPointName.R1, [baseAtomId, sugarAtomId]);
      addConnectionAtom(AttachmentPointName.R3, [sugarAtomId, baseAtomId]);
    }
  }

  if (phosphatePosition && sugarAtoms.length > 0 && phosphateAtoms.length > 0) {
    const bond = findBondBetweenRnaPresetComponents(
      struct,
      sugarAtoms,
      phosphateAtoms,
    );
    if (bond) {
      const sugarAtomId = sugarAtoms.includes(bond.begin)
        ? bond.begin
        : bond.end;
      const phosphateAtomId = phosphateAtoms.includes(bond.begin)
        ? bond.begin
        : bond.end;

      const { sugar: sugarApName, phosphate: phosphateApName } =
        getRequiredAttachmentPointsForPhosphatePosition(phosphatePosition);

      addConnectionAtom(sugarApName, [sugarAtomId, phosphateAtomId]);
      addConnectionAtom(phosphateApName, [phosphateAtomId, sugarAtomId]);
    }
  }

  return result;
};

export const getVisibleAttachmentPointsForRnaPreset = (
  assignedAttachmentPoints: AttachmentPointMap,
  wizardState: RnaPresetWizardState,
  struct: Struct,
): AttachmentPointMap => {
  const atomToComponentMap = getAtomToComponentMap(wizardState);
  const occupiedAttachmentPoints = new Set<AttachmentPointName>();

  assignedAttachmentPoints.forEach(
    ([attachmentAtomId, leavingAtomId], attachmentPointName) => {
      const componentKey = atomToComponentMap.get(attachmentAtomId);

      if (!componentKey) {
        return;
      }

      // A genuine external attachment point keeps its leaving group within the
      // same component. Such an AP must stay visible on the preset tab even when
      // its attachment atom also forms an inter-component connection bond (e.g. a
      // phosphate atom that both connects to the sugar and carries its own
      // external leaving group). Only APs whose leaving atom is not part of the
      // component represent the internal connection and should be hidden.
      const leavingAtomComponentKey = atomToComponentMap.get(leavingAtomId);

      if (leavingAtomComponentKey === componentKey) {
        return;
      }

      const atom = struct.atoms.get(attachmentAtomId);

      if (!atom) {
        return;
      }

      const isOccupiedByPresetComponentConnection = atom.neighbors.some(
        (halfBondId) => {
          const halfBond = struct.halfBonds.get(halfBondId);

          if (!halfBond) {
            return false;
          }

          const neighbourAtomId =
            halfBond.begin === attachmentAtomId ? halfBond.end : halfBond.begin;
          const neighbourComponentKey = atomToComponentMap.get(neighbourAtomId);

          return Boolean(
            neighbourComponentKey && neighbourComponentKey !== componentKey,
          );
        },
      );

      if (isOccupiedByPresetComponentConnection) {
        occupiedAttachmentPoints.add(attachmentPointName);
      }
    },
  );

  return new Map(
    [...assignedAttachmentPoints.entries()].filter(
      ([attachmentPointName]) =>
        !occupiedAttachmentPoints.has(attachmentPointName),
    ),
  );
};
