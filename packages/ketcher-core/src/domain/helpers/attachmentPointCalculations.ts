import { Coordinates as CoordinatesTool } from 'application/editor/shared/coordinates';
import { BaseMonomer } from 'domain/entities';
import { Vec2 } from 'domain/entities/vec2';
import { AttachmentPointName } from 'domain/types';

export type Coordinates = { x: number; y: number };

// eslint-disable-next-line camelcase
export function canvasToMonomerCoordinates(
  coordinatesOnCanvas: Coordinates,
  centerOFMonomer: Coordinates,
  monomerWidth: number,
  monomerHeight: number,
) {
  const zeroPointCoord = {
    x: centerOFMonomer.x - monomerWidth / 2,
    y: centerOFMonomer.y - monomerHeight / 2,
  };

  const monomerCoord = {
    x: coordinatesOnCanvas.x - zeroPointCoord.x,
    y: coordinatesOnCanvas.y - zeroPointCoord.y,
  };

  return monomerCoord;
}

export function findLabelPoint(
  pointOnBorder: Coordinates,
  angle: number,
  lineLength: number,
  lineOffset: number,
  labelSize: { x: number; y: number },
  isUsed: boolean,
) {
  // based on https://ru.stackoverflow.com/a/1442905

  const angleRadians = Vec2.degrees_to_radians(angle);

  const pointOfAttachment = Vec2.findSecondPoint(
    pointOnBorder,
    lineLength,
    angleRadians,
  );

  // find vector between pointOnBorder and pointOfAttachment

  const attachmentVector = {
    x: pointOfAttachment.x - pointOnBorder.x,
    y: pointOfAttachment.y - pointOnBorder.y,
  };

  // rotate this vector at 90 degrees - change x and y, then make one negative
  const rotatedVector = { x: -attachmentVector.y, y: attachmentVector.x };

  // normalize vector
  const normalizedVector = {
    x: rotatedVector.x / lineLength,
    y: rotatedVector.y / lineLength,
  };

  const normalizedAttachmentVector = {
    x: attachmentVector.x / lineLength,
    y: attachmentVector.y / lineLength,
  };

  // find vector for Label, using normalized vector and length

  let addedOrtogonalOffset = 0;
  const addedParallelOffset =
    lineOffset + Math.max(labelSize.x, labelSize.y) + 1;
  if (isUsed) {
    if (angle >= -270 && angle <= 0) {
      addedOrtogonalOffset = 5;
    } else if (angle >= -360 && angle < -270) {
      addedOrtogonalOffset = -5;
    }
  }

  const ortogonalOffset = {
    x: normalizedVector.x * addedOrtogonalOffset,
    y: normalizedVector.y * addedOrtogonalOffset,
  };

  const parallelOffset = {
    x: normalizedAttachmentVector.x * addedParallelOffset,
    y: normalizedAttachmentVector.y * addedParallelOffset,
  };

  // add this vector to point of attachment
  const labelCoordinates = {
    x: pointOfAttachment.x + ortogonalOffset.x + parallelOffset.x - labelSize.x,
    y: pointOfAttachment.y + ortogonalOffset.y + parallelOffset.y + labelSize.y,
  };

  return [labelCoordinates, pointOfAttachment];
}

export function getSearchFunction(
  initialAngle: number,
  canvasOffset: Coordinates,
  monomer: BaseMonomer,
) {
  return function findPointOnMonomerBorder(
    coordStart: Coordinates,
    length: number,
    applyZoomForPositionCalculation: boolean,
    angle = initialAngle,
  ) {
    const angleRadians = Vec2.degrees_to_radians(angle);

    const secondPoint = Vec2.findSecondPoint(coordStart, length, angleRadians);

    const diff = Vec2.diff(
      new Vec2(coordStart.x, coordStart.y),
      new Vec2(secondPoint.x, secondPoint.y),
    );

    // exit recursion
    if (diff.length() < 1.01) {
      return secondPoint;
    }

    const newLength = Math.round(diff.length() / 1.4);
    const newCoordStart = { x: secondPoint.x, y: secondPoint.y };

    const zoomedCoordinateOfSecondPoint = applyZoomForPositionCalculation
      ? CoordinatesTool.canvasToView(new Vec2(secondPoint))
      : new Vec2(secondPoint);

    const newPointCoord = {
      x: Math.round(zoomedCoordinateOfSecondPoint.x) + canvasOffset.x,
      y: Math.round(zoomedCoordinateOfSecondPoint.y) + canvasOffset.y,
    };

    const elementsAtPoint = document.elementsFromPoint(
      newPointCoord.x,
      newPointCoord.y,
    );

    const isCurrentMonomerAtNewPoint = elementsAtPoint.some(
      (element) => element === monomer.renderer?.bodyElement?.node(),
    );

    let newAngle: number;
    if (isCurrentMonomerAtNewPoint) {
      newAngle = initialAngle;
    } else {
      newAngle = initialAngle - 180;
    }

    return findPointOnMonomerBorder(
      newCoordStart,
      newLength,
      applyZoomForPositionCalculation,
      newAngle,
    );
  };
}

export const anglesToSector = {
  '45': {
    min: 23,
    max: 68,
    center: 45,
  },
  '90': {
    min: 68,
    max: 113,
    center: 90,
  },
  '135': {
    min: 113,
    max: 148,
    center: 135,
  },
  '180': {
    min: 148,
    max: 203,
    center: 180,
  },
  '225': {
    min: 203,
    max: 248,
    center: 225,
  },
  '270': {
    min: 248,
    max: 293,
    center: 270,
  },
  '315': {
    min: 293,
    max: 228,
    center: 315,
  },
  '360': {
    min: 338,
    max: 360,
    center: 360,
  },
  '0': {
    min: 0,
    max: 23,
    center: 0,
  },
};

export enum attachmentPointNumberToAngle {
  'R1' = 0,
  'R2' = 180,
  'R3' = 90,
  'R4' = 270,
  'R5' = 45,
  'R6' = 135,
  'R7' = 315,
  'R8' = 225,
}

export const sectorsList = [45, 90, 135, 180, 225, 270, 315, 0, 360];

export function checkFor0and360(sectorsList: number[]) {
  if (!sectorsList.includes(0) && sectorsList.includes(360)) {
    return sectorsList.filter((item) => item !== 360);
  }
  if (!sectorsList.includes(360) && sectorsList.includes(0)) {
    return sectorsList.filter((item) => item !== 0);
  }
  return sectorsList;
}

/* attachmentPointName - R1, R2, ...
 * returns number of attachment point with left binary shift:
 * [attachmentPointNumber]: [binaryShiftedAttachmentPointNumber]
 * 1: 1
 * 2: 2
 * 3: 4
 * 4: 8
 * 5: 16
 * 6: 32
 * It needs for conversion of attachment points to rglabels (just for same view in monomer preview)
 * rglabel 3 means that atom has two r-group attachment points
 * */
export function getAttachmentPointLabelWithBinaryShift(
  attachmentPointNumber: number,
) {
  let attachmentPointLabel = '';
  for (let rgi = 0; rgi < 32; rgi++) {
    if (attachmentPointNumber & (1 << rgi)) {
      attachmentPointLabel += getAttachmentPointLabel(rgi + 1);
    }
  }
  return attachmentPointLabel;
}

export function getAttachmentPointLabel(attachmentPointNumber: number) {
  return `R${attachmentPointNumber}` as AttachmentPointName;
}

export function getAttachmentPointNumberFromLabel(
  attachmentPointLabel: AttachmentPointName,
) {
  return Number(attachmentPointLabel.replace('R', ''));
}
