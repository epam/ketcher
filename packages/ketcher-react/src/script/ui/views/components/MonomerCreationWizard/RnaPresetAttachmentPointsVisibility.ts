import {
  AttachmentPointName,
  RnaPresetComponentKey,
  Struct,
} from 'ketcher-core';

import { RnaPresetWizardState } from './MonomerCreationWizard.types';

type AttachmentPointMap = Map<AttachmentPointName, [number, number]>;

const RNA_COMPONENT_KEYS: RnaPresetComponentKey[] = [
  'base',
  'sugar',
  'phosphate',
];

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
