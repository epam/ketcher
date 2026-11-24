import type { ImageReferenceName } from 'domain/entities/image';

export const IMAGE_KEY = 'images';
export const IMAGE_SERIALIZE_KEY = 'image';

// Shown instead of an image whose bitmap the browser cannot decode
const BROKEN_IMAGE_PLACEHOLDER_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
  '<rect x="0.5" y="0.5" width="23" height="23" fill="#f3f5f7" stroke="#b4b9c6"/>' +
  '<path d="M5 5h9l-2 4 3 3-2 3 2 4H5z" fill="none" stroke="#7c8594" stroke-linejoin="round"/>' +
  '<path d="M16 5h3v14h-2l-1.5-3 2-3-3-3z" fill="none" stroke="#7c8594" stroke-linejoin="round"/>' +
  '<circle cx="8.5" cy="9" r="1.5" fill="#7c8594"/>' +
  '<path d="M5 17l3-4 2 2" fill="none" stroke="#7c8594" stroke-linejoin="round"/>' +
  '</svg>';

export const BROKEN_IMAGE_PLACEHOLDER = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  BROKEN_IMAGE_PLACEHOLDER_SVG,
)}`;

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
