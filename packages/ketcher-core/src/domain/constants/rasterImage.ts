import type { RasterImageReferenceName } from 'domain/entities';

export const RASTER_IMAGE_KEY = 'rasterImages';
export const RASTER_IMAGE_SERIALIZE_KEY = 'rasterImage';

const CURSOR_DIAGONAL_NWSE = 'nwse-resize';
const CURSOR_DIAGONAL_NESW = 'nesw-resize';
const CURSOR_VERTICAL = 'ns-resize';
const CURSOR_HORIZONTAL = 'ew-resize';

export const rasterImageReferencePositionToCursor: Record<
  RasterImageReferenceName,
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
