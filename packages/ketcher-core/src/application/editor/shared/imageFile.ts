export const SUPPORTED_IMAGE_MIME_TYPES = ['png', 'svg+xml'];

export const MIN_IMAGE_DIMENSION = 16;
export const MIN_SIZELESS_IMAGE_SRC_LENGTH = 320;

const IMAGE_TYPE_PATTERN = new RegExp(
  `^image/(${SUPPORTED_IMAGE_MIME_TYPES.map((type) =>
    type.replace('+', String.raw`\+`),
  ).join('|')})$`,
);

export interface LoadedImageFile {
  src: string;
  width: number;
  height: number;
}

export function isSupportedImageType(type: string): boolean {
  return IMAGE_TYPE_PATTERN.test(type);
}

export function getSupportedImageAccept(): string {
  return SUPPORTED_IMAGE_MIME_TYPES.map((type) => `image/${type}`).join(',');
}

export function isImageSizeValid({ src, width, height }: LoadedImageFile) {
  const isValidSize =
    width >= MIN_IMAGE_DIMENSION && height >= MIN_IMAGE_DIMENSION;
  const isValidSizeless =
    width === 0 && height === 0 && src.length >= MIN_SIZELESS_IMAGE_SRC_LENGTH;

  return isValidSize || isValidSizeless;
}

export function readImageFile(file: File): Promise<LoadedImageFile> {
  return new Promise((resolve, reject) => {
    if (!file.type || !isSupportedImageType(file.type)) {
      reject(new Error('Unsupported image type'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const image = new Image();
      image.onload = () =>
        resolve({ src, width: image.width, height: image.height });
      image.onerror = () => reject(new Error('Cannot load image'));
      image.src = src;
    };
    reader.onerror = () => reject(new Error('Cannot load image'));
    reader.readAsDataURL(file);
  });
}
