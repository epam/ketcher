/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

/**
 * Converts an SVG data URL to a PNG Blob using Canvas API.
 * This is used when we need to export PNG with filtered/modified SVG content
 * (e.g., hiding charge symbols while preserving chemical structure).
 *
 * @param svgDataUrl - SVG data URL (data:image/svg+xml;base64,...)
 * @param scale - Scale factor for PNG resolution (default: 2 for better quality)
 * @returns Promise that resolves to PNG Blob
 */
export async function svgToPng(
  svgDataUrl: string,
  scale: number = 2,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        // Create canvas with scaled dimensions for better quality
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas 2D context'));
          return;
        }

        // Scale context for high-resolution rendering
        ctx.scale(scale, scale);

        // Draw SVG image onto canvas
        ctx.drawImage(img, 0, 0);

        // Convert canvas to PNG blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert canvas to blob'));
            }
          },
          'image/png',
          1.0, // Maximum quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load SVG image'));
    };

    // Load SVG data URL into image element
    img.src = svgDataUrl;
  });
}
