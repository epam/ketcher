import {
  type ImageValidationError,
  type Vec2,
  imageHalfSizePx,
  validateImageDimensions,
  validateImageMimeType,
} from 'ketcher-core';

export type ImageFileReadResult =
  | { dataUrl: string; halfSizePx: Vec2 }
  | { error: ImageValidationError; cause?: unknown };

function loadDataUrl(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      image.src = reader.result as string;
    });
    image.onload = () => resolve(image);
    image.onerror = (event) => reject(event);

    reader.readAsDataURL(file);
  });
}

export async function readImageFile(file: File): Promise<ImageFileReadResult> {
  const typeError = validateImageMimeType(file.type);
  if (typeError) {
    return { error: typeError };
  }

  let image: HTMLImageElement;
  try {
    image = await loadDataUrl(file);
  } catch (cause) {
    return { error: 'cannotLoad', cause };
  }

  const dimensions = {
    widthPx: image.width,
    heightPx: image.height,
    dataUrlLength: image.src.length,
  };
  const sizeError = validateImageDimensions(dimensions);
  if (sizeError) {
    return { error: sizeError };
  }

  return { dataUrl: image.src, halfSizePx: imageHalfSizePx(dimensions) };
}
