import {
  Image as StructImage,
  KetcherLogger,
  Scale,
  Struct,
  Vec2,
} from 'ketcher-core';

const TAG = 'tool/imageFile.ts';

export const SUPPORTED_IMAGE_MIMES = ['image/png', 'image/svg+xml'];
export const MIN_DIMENSION_SIZE = 16;
const MIN_SIZELESS_IMAGE_SRC_LENGTH = 320;

type ScaleOptions = Parameters<typeof Scale.canvasToModel>[1];

export interface LoadedImage {
  src: string;
  halfSize: Vec2;
}

export function isSupportedImageType(type: string): boolean {
  return SUPPORTED_IMAGE_MIMES.includes(type);
}

function fail(source: string, message: string, details?: unknown): Error {
  KetcherLogger.error(`${TAG}:${source}`, message, details);
  return new Error(message);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string));
    reader.addEventListener('error', (event) =>
      reject(fail('readAsDataUrl', 'Cannot load image', event)),
    );
    reader.readAsDataURL(file);
  });
}

function decodeImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = (event) =>
      reject(fail('onerror', 'Cannot load image', event));
    image.src = src;
  });
}

/**
 * Validates an image file and returns its data URL together with the half
 * size in model units. Rejects with the user-facing error message.
 */
export async function readImageFile(
  file: File,
  scaleOptions: ScaleOptions,
): Promise<LoadedImage> {
  if (!file.type || !isSupportedImageType(file.type)) {
    throw fail('readImageFile', 'Unsupported image type');
  }

  const image = await decodeImage(await readAsDataUrl(file));

  const isValidSize =
    image.width >= MIN_DIMENSION_SIZE && image.height >= MIN_DIMENSION_SIZE;
  const isValidSizeless =
    image.width === 0 &&
    image.height === 0 &&
    image.src.length >= MIN_SIZELESS_IMAGE_SRC_LENGTH;

  if (!isValidSize && !isValidSizeless) {
    throw fail('onLoad', 'Image should be at least 16x16 pixels');
  }

  const halfSize = isValidSizeless
    ? new Vec2(MIN_DIMENSION_SIZE, MIN_DIMENSION_SIZE)
    : new Vec2(image.width / 2, image.height / 2);

  return {
    src: image.src,
    halfSize: Scale.canvasToModel(halfSize, scaleOptions),
  };
}

export function createStructWithImage({ src, halfSize }: LoadedImage): Struct {
  const struct = new Struct();
  struct.images.add(new StructImage(src, new Vec2(), halfSize));
  return struct;
}
