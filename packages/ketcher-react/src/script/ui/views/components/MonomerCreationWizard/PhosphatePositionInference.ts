import { AttachmentPointName, Struct } from 'ketcher-core';

import { Selection } from '../../../../editor/Editor';

type PhosphatePosition = '3' | '5';

const getExternalAttachmentPoints = (
  structure: Struct,
  componentStructure: Selection | undefined,
  componentAttachmentPoints: Map<AttachmentPointName, [number, number]>,
) => {
  const externalAttachmentPoints = new Set<AttachmentPointName>();
  const componentAtomIds = new Set(componentStructure?.atoms ?? []);

  componentAttachmentPoints.forEach(
    ([attachmentAtomId], attachmentPointName) => {
      if (!componentAtomIds.has(attachmentAtomId)) {
        return;
      }

      let hasExternalBond = false;
      structure.bonds.forEach((bond) => {
        const isAttachmentAtom =
          bond.begin === attachmentAtomId || bond.end === attachmentAtomId;
        if (!isAttachmentAtom) {
          return;
        }

        const connectedAtomId =
          bond.begin === attachmentAtomId ? bond.end : bond.begin;

        if (!componentAtomIds.has(connectedAtomId)) {
          hasExternalBond = true;
        }
      });

      if (hasExternalBond) {
        externalAttachmentPoints.add(attachmentPointName);
      }
    },
  );

  return externalAttachmentPoints;
};

const inferPhosphatePositionFromSugar = (
  externalAttachmentPoints: Set<AttachmentPointName>,
): PhosphatePosition | undefined => {
  const hasR1 = externalAttachmentPoints.has(AttachmentPointName.R1);
  const hasR2 = externalAttachmentPoints.has(AttachmentPointName.R2);

  if (hasR1 === hasR2) {
    return undefined;
  }

  return hasR1 ? '3' : '5';
};

const inferPhosphatePositionFromPhosphate = (
  externalAttachmentPoints: Set<AttachmentPointName>,
): PhosphatePosition | undefined => {
  const hasR1 = externalAttachmentPoints.has(AttachmentPointName.R1);
  const hasR2 = externalAttachmentPoints.has(AttachmentPointName.R2);

  if (hasR1 === hasR2) {
    return undefined;
  }

  return hasR1 ? '5' : '3';
};

export const inferPhosphatePosition = (
  structure: Struct,
  sugarStructure: Selection | undefined,
  sugarAttachmentPoints: Map<AttachmentPointName, [number, number]>,
  phosphateStructure: Selection | undefined,
  phosphateAttachmentPoints: Map<AttachmentPointName, [number, number]>,
): PhosphatePosition => {
  const sugarExternalAttachmentPoints = getExternalAttachmentPoints(
    structure,
    sugarStructure,
    sugarAttachmentPoints,
  );
  const phosphateExternalAttachmentPoints = getExternalAttachmentPoints(
    structure,
    phosphateStructure,
    phosphateAttachmentPoints,
  );
  const positionFromSugar = inferPhosphatePositionFromSugar(
    sugarExternalAttachmentPoints,
  );
  const positionFromPhosphate = inferPhosphatePositionFromPhosphate(
    phosphateExternalAttachmentPoints,
  );

  if (positionFromSugar && positionFromPhosphate) {
    return positionFromSugar === positionFromPhosphate
      ? positionFromSugar
      : '3';
  }

  return positionFromSugar ?? positionFromPhosphate ?? '3';
};
