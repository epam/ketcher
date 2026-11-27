import { Vec2 } from 'domain/entities/vec2';

export const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/png',
  'image/svg+xml',
] as const;

export const MIN_IMAGE_DIMENSION_PX = 16;

const MIN_SIZELESS_IMAGE_SRC_LENGTH = 320;

export type ImageValidationError =
  'unsupportedType' | 'tooSmall' | 'cannotLoad';

export const IMAGE_VALIDATION_MESSAGES: Record<ImageValidationError, string> = {
  unsupportedType: 'Unsupported image type',
  tooSmall: `Image should be at least ${MIN_IMAGE_DIMENSION_PX}x${MIN_IMAGE_DIMENSION_PX} pixels`,
  cannotLoad: 'Cannot load image',
};

export interface ImageDimensions {
  readonly widthPx: number;
  readonly heightPx: number;
  readonly dataUrlLength: number;
}

export function validateImageMimeType(
  mimeType: string | undefined,
): ImageValidationError | null {
  const isSupported = (
    SUPPORTED_IMAGE_MIME_TYPES as ReadonlyArray<string>
  ).includes(mimeType ?? '');
  return isSupported ? null : 'unsupportedType';
}

function isSizelessImage(dimensions: ImageDimensions): boolean {
  return (
    dimensions.widthPx === 0 &&
    dimensions.heightPx === 0 &&
    dimensions.dataUrlLength >= MIN_SIZELESS_IMAGE_SRC_LENGTH
  );
}

export function validateImageDimensions(
  dimensions: ImageDimensions,
): ImageValidationError | null {
  const isLargeEnough =
    dimensions.widthPx >= MIN_IMAGE_DIMENSION_PX &&
    dimensions.heightPx >= MIN_IMAGE_DIMENSION_PX;

  return isLargeEnough || isSizelessImage(dimensions) ? null : 'tooSmall';
}

export function imageHalfSizePx(dimensions: ImageDimensions): Vec2 {
  return isSizelessImage(dimensions)
    ? new Vec2(MIN_IMAGE_DIMENSION_PX, MIN_IMAGE_DIMENSION_PX)
    : new Vec2(dimensions.widthPx / 2, dimensions.heightPx / 2);
}
