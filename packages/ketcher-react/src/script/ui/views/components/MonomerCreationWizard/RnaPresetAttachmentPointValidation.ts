import { AttachmentPointName } from 'ketcher-core';

export type PhosphatePosition = '3' | '5';

type AttachmentPointMap = Map<AttachmentPointName, [number, number]>;

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
