import {
  AttachmentPointName,
  RnaPresetComponentKey,
  Struct,
} from 'ketcher-core';

import { RnaPresetWizardState } from './MonomerCreationWizard.types';
import {
  PhosphatePosition,
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
    Array.from(assignedAttachmentPoints.entries()).filter(
      ([, [attachmentAtomId]]) => componentAtomIds.has(attachmentAtomId),
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

export const getVisibleAttachmentPointsForRnaPreset = (
  assignedAttachmentPoints: AttachmentPointMap,
  wizardState: RnaPresetWizardState,
  struct: Struct,
): AttachmentPointMap => {
  const atomToComponentMap = getAtomToComponentMap(wizardState);
  const occupiedAttachmentPoints = new Set<AttachmentPointName>();

  assignedAttachmentPoints.forEach(
    ([attachmentAtomId], attachmentPointName) => {
      const componentKey = atomToComponentMap.get(attachmentAtomId);

      if (!componentKey) {
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
    Array.from(assignedAttachmentPoints.entries()).filter(
      ([attachmentPointName]) =>
        !occupiedAttachmentPoints.has(attachmentPointName),
    ),
  );
};
