import type { Point } from 'ketcher-core';

const X_COORD_INDEX = 0;
const Y_COORD_INDEX = 1;

export const calculateMiddleCoordsForRect = (
  rectCoords: Array<Array<number>>,
): Array<Point> | [] => {
  if (!rectCoords) {
    return [];
  }

  const middleCoordForRectangleSides: Array<Point> = [];

  const previousPoint: Point = {
    x: rectCoords[0][X_COORD_INDEX],
    y: rectCoords[0][Y_COORD_INDEX],
  };

  for (let i = 1; i < rectCoords.length; i++) {
    if (!previousPoint.x || !previousPoint.y) {
      return [];
    }

    const middleX = (previousPoint.x + rectCoords[i][X_COORD_INDEX]) / 2;
    const middleY = (previousPoint.y + rectCoords[i][Y_COORD_INDEX]) / 2;
    middleCoordForRectangleSides.push({ x: middleX, y: middleY });
    previousPoint.x = rectCoords[i][X_COORD_INDEX];
    previousPoint.y = rectCoords[i][Y_COORD_INDEX];
  }

  return middleCoordForRectangleSides;
};

export const getSmoothScrollDelta = (delta: number, zoom: number) => {
  const SMOOTH_FACTOR = 0.4;
  return (delta / zoom) * SMOOTH_FACTOR;
};

export const isFileDrag = (dataTransfer: DataTransfer | null): boolean =>
  Array.from(dataTransfer?.types ?? []).includes('Files');

// Browsers may hide the MIME type of a dragged file until it is dropped
export const isImageFileDrag = (dataTransfer: DataTransfer | null): boolean => {
  if (!isFileDrag(dataTransfer)) {
    return false;
  }

  const firstFile = Array.from(dataTransfer?.items ?? []).find(
    (item) => item.kind === 'file',
  );
  return !firstFile?.type || firstFile.type.startsWith('image/');
};
