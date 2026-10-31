const PNG_MIME_TYPE = 'image/png';
const SVG_MIME_TYPE = 'image/svg+xml';
const DEFAULT_BACKGROUND_COLOR = '#ffffff';

/**
 * Rasterizes an SVG document into a PNG blob.
 *
 * @param svg serialized SVG document with explicit width and height
 * @param scale pixel density of the result (e.g. 2 for retina displays)
 */
export const convertSvgToPng = (svg: string, scale = 1): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([svg], { type: SVG_MIME_TYPE }));
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(image.width * scale);
      canvas.height = Math.ceil(image.height * scale);

      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Cannot create canvas context to render the image'));
        return;
      }

      context.fillStyle = DEFAULT_BACKGROUND_COLOR;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Cannot convert the image to PNG'));
        }
      }, PNG_MIME_TYPE);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Cannot load the SVG image'));
    };

    image.src = url;
  });
