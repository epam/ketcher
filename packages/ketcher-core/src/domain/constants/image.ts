import type { ImageReferenceName } from 'domain/entities';

export const IMAGE_KEY = 'images';
export const IMAGE_SERIALIZE_KEY = 'image';

const CURSOR_DIAGONAL_NWSE = 'nwse-resize';
const CURSOR_DIAGONAL_NESW = 'nesw-resize';
const CURSOR_VERTICAL = 'ns-resize';
const CURSOR_HORIZONTAL = 'ew-resize';

export const imageReferencePositionToCursor: Record<
  ImageReferenceName,
  string
> = {
  topLeftPosition: CURSOR_DIAGONAL_NWSE,
  topMiddlePosition: CURSOR_VERTICAL,
  topRightPosition: CURSOR_DIAGONAL_NESW,
  rightMiddlePosition: CURSOR_HORIZONTAL,
  bottomRightPosition: CURSOR_DIAGONAL_NWSE,
  bottomMiddlePosition: CURSOR_VERTICAL,
  bottomLeftPosition: CURSOR_DIAGONAL_NESW,
  leftMiddlePosition: CURSOR_HORIZONTAL,
};
