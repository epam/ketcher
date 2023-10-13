import { Vec2 } from 'domain/entities/vec2';

// eslint-disable-next-line camelcase
export function canvasToMonomerCoordinates(
  coordinatesOnCanvas,
  centerOFMonomer: { x: number; y: number },
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

export function findLabelPoint(pointOnBorder, angle, lineLength, lineOffset) {
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
  let rotatedVector;
  if (angle >= -200 && angle < -60) {
    rotatedVector = { x: -attachmentVector.y, y: attachmentVector.x }; // for angle -200 to -60
  } else {
    rotatedVector = { x: attachmentVector.y, y: -attachmentVector.x }; // for angle -0 to -270
  }

  // normalize vector
  const normalizedVector = {
    x: rotatedVector.x / lineLength,
    y: rotatedVector.y / lineLength,
  };

  // find vector for Label, using normalized vector and length

  let addedLabelOffset = 0;
  if (angle >= -225 && angle < -180) {
    addedLabelOffset = 5;
  } else if (angle >= -60 && angle <= 0) {
    addedLabelOffset = 5;
  }

  const labelVector = {
    x: normalizedVector.x * (lineOffset + addedLabelOffset),
    y: normalizedVector.y * (lineOffset + addedLabelOffset),
  };

  // add this vector to point of attachment

  const labelCoordinates = {
    x: pointOfAttachment.x + labelVector.x,
    y: pointOfAttachment.y + labelVector.y,
  };

  return [labelCoordinates, pointOfAttachment];
}

export function getSearchFunction(initialAngle, canvasOffset, monomer) {
  return function findPointOnMonomerBorder(
    coordStart,
    length,
    angle = initialAngle,
  ) {
    const angleRadians = Vec2.degrees_to_radians(angle);

    const secondPoint = Vec2.findSecondPoint(coordStart, length, angleRadians);

    const diff = Vec2.diff(
      new Vec2(coordStart.x, coordStart.y),
      new Vec2(secondPoint.x, secondPoint.y),
    );

    // exit recursion
    if (diff.length() < 1.2) {
      return secondPoint;
    }

    const newLength = Math.round(diff.length() / 2);
    const newCoordStart = { x: secondPoint.x, y: secondPoint.y };

    const newPointCoord = {
      x: Math.round(secondPoint.x) + canvasOffset.x,
      y: Math.round(secondPoint.y) + canvasOffset.y,
    };
    const newPoint = document.elementFromPoint(
      newPointCoord.x,
      newPointCoord.y,
    ) as Element;

    let newAngle;

    if (newPoint.__data__?.bodyElement === monomer.renderer.bodyElement) {
      newAngle = initialAngle;
    } else {
      newAngle = initialAngle - 180;
    }

    return findPointOnMonomerBorder(newCoordStart, newLength, newAngle);
  };
}
