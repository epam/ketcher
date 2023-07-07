import { Vec2 } from 'ketcher-core';

export const rotatePoint = (
  centerPoint: Vec2,
  startPoint: Vec2,
  angle: number
) => {
  const oCenter = centerPoint;
  const oStart = startPoint;

  const centerStart = oStart.sub(oCenter);
  const centerEnd = centerStart.rotate(angle);

  const oEnd = oCenter.add(centerEnd);
  return oEnd;
};

export const getDifference = (
  currentDegree: number,
  structRotateDegree: number
) => {
  let abs = 0;

  // HACK: https://github.com/epam/ketcher/pull/2574#issuecomment-1539509046
  if (structRotateDegree > 90) {
    const positiveCurrentDegree =
      currentDegree < 0 ? currentDegree + 360 : currentDegree;
    abs = Math.abs(positiveCurrentDegree - structRotateDegree);
  } else if (structRotateDegree < -90) {
    const negativeCurrentDegree =
      currentDegree > 0 ? currentDegree - 360 : currentDegree;
    abs = Math.abs(negativeCurrentDegree - structRotateDegree);
  } else {
    abs = Math.abs(currentDegree - structRotateDegree);
  }

  return abs;
};
