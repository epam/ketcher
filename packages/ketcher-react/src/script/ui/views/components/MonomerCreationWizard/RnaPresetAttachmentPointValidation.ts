import { AtomLabel, AttachmentPointName, KetMonomerClass } from 'ketcher-core';

export type PhosphatePosition = '3' | '5';

type AttachmentPointMap = Map<AttachmentPointName, [number, number]>;

/**
 * Gets the leaving atom used for RNA preset connection attachment points.
 * - Base R1 uses H
 * - Sugar R3 uses O (representing OH)
 * - Sugar R1/R2 use H
 * - Phosphate R1/R2 use O (representing OH)
 */
export const getLeavingAtomForAttachmentPoint = (
  componentType: KetMonomerClass,
  attachmentPointName: AttachmentPointName,
): AtomLabel => {
  switch (componentType) {
    case KetMonomerClass.Base:
      return AtomLabel.H;
    case KetMonomerClass.Sugar:
      return attachmentPointName === AttachmentPointName.R3
        ? AtomLabel.O
        : AtomLabel.H;
    case KetMonomerClass.Phosphate:
      return AtomLabel.O;
    default:
      return AtomLabel.H;
  }
};

export const getRequiredAttachmentPointsForPhosphatePosition = (
  phosphatePosition: PhosphatePosition,
): {
  sugar: AttachmentPointName;
  phosphate: AttachmentPointName;
} => {
  return phosphatePosition === '5'
    ? {
        sugar: AttachmentPointName.R1,
        phosphate: AttachmentPointName.R2,
      }
    : {
        sugar: AttachmentPointName.R2,
        phosphate: AttachmentPointName.R1,
      };
};

export const hasPhosphatePositionAttachmentPointConflict = (
  phosphatePosition: PhosphatePosition,
  sugarAttachmentPoints?: AttachmentPointMap,
  phosphateAttachmentPoints?: AttachmentPointMap,
): boolean => {
  const requiredAttachmentPoints =
    getRequiredAttachmentPointsForPhosphatePosition(phosphatePosition);

  return Boolean(
    sugarAttachmentPoints?.has(requiredAttachmentPoints.sugar) ||
      phosphateAttachmentPoints?.has(requiredAttachmentPoints.phosphate),
  );
};
