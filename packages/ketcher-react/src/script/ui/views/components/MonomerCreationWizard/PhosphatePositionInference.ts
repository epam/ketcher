import { AttachmentPointName } from 'ketcher-core';

type PhosphatePosition = '3' | '5';

const inferPhosphatePositionFromSugar = (
  externalAttachmentPoints: AttachmentPointName[],
): PhosphatePosition | undefined => {
  const hasR1 = externalAttachmentPoints.includes(AttachmentPointName.R1);
  const hasR2 = externalAttachmentPoints.includes(AttachmentPointName.R2);

  if (hasR1 === hasR2) {
    return undefined;
  }

  return hasR1 ? '3' : '5';
};

const inferPhosphatePositionFromPhosphate = (
  externalAttachmentPoints: AttachmentPointName[],
): PhosphatePosition | undefined => {
  const hasR1 = externalAttachmentPoints.includes(AttachmentPointName.R1);
  const hasR2 = externalAttachmentPoints.includes(AttachmentPointName.R2);

  if (hasR1 === hasR2) {
    return undefined;
  }

  return hasR1 ? '5' : '3';
};

export const inferPhosphatePosition = (
  sugarAttachmentPoints: Map<AttachmentPointName, [number, number]>,
  phosphateAttachmentPoints: Map<AttachmentPointName, [number, number]>,
): PhosphatePosition => {
  const positionFromSugar = inferPhosphatePositionFromSugar([
    ...sugarAttachmentPoints.keys(),
  ]);
  const positionFromPhosphate = inferPhosphatePositionFromPhosphate([
    ...phosphateAttachmentPoints.keys(),
  ]);

  if (positionFromSugar && positionFromPhosphate) {
    return positionFromSugar === positionFromPhosphate
      ? positionFromSugar
      : '3';
  }

  return positionFromSugar ?? positionFromPhosphate ?? '3';
};
