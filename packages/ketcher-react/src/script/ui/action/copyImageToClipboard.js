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

import {
  FormatterFactory,
  defaultBondThickness,
  KetcherLogger,
} from 'ketcher-core';

async function copyImageToClipboard() {
  const state = global.currentState;
  const { editor, server, options } = state;
  const struct = editor.structSelected();
  const errorHandler = editor.errorHandler;

  if (!struct) {
    errorHandler('No structure selected');
    return;
  }

  try {
    const factory = new FormatterFactory(server);
    const service = factory.create('ket', options);
    const structStr = await service.getStructureFromStructAsync(struct);

    const base64 = await server.generateImageAsBase64(structStr, {
      outputFormat: 'png',
      backgroundColor: '255, 255, 255',
      bondThickness: options.settings.bondThickness || defaultBondThickness,
    });

    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const image = new Blob([byteArray], { type: 'image/png' });

    if (!image || !image.type) {
      errorHandler('Failed to generate image');
      return;
    }

    try {
      const item = new ClipboardItem({ [image.type]: image });
      await navigator.clipboard.write([item]);
    } catch (clipboardError) {
      KetcherLogger.warn(
        'Modern clipboard API failed, falling back to legacy method',
        clipboardError,
      );

      await new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        img.onload = () => {
          try {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob from canvas'));
                return;
              }
              const div = document.createElement('div');
              div.contentEditable = 'true';
              div.style.position = 'absolute';
              div.style.left = '-9999px';
              document.body.appendChild(div);
              const reader = new FileReader();
              reader.onerror = () => {
                document.body.removeChild(div);
                reject(new Error('Failed to read blob data'));
              };
              reader.onload = (e) => {
                try {
                  const img = new Image();
                  img.src = e.target.result;
                  div.appendChild(img);

                  setTimeout(() => {
                    try {
                      const range = document.createRange();
                      range.selectNode(div);
                      window.getSelection().removeAllRanges();
                      window.getSelection().addRange(range);
                      const success = document.execCommand('copy');
                      document.body.removeChild(div);
                      if (success) {
                        resolve();
                      } else {
                        reject(new Error('execCommand copy returned false'));
                      }
                    } catch (e) {
                      document.body.removeChild(div);
                      reject(e);
                    }
                  }, 100);
                } catch (e) {
                  document.body.removeChild(div);
                  reject(e);
                }
              };
              reader.readAsDataURL(blob);
            }, image.type);
          } catch (e) {
            reject(e);
          }
        };
        img.src = URL.createObjectURL(image);
      });
    }
  } catch (e) {
    KetcherLogger.error('copyImageToClipboard.js::copyImageToClipboard', e);
    errorHandler('This feature is not available in your browser');
    if (e.message) {
      errorHandler(`Failed to copy image: ${e.message}`);
    } else {
      errorHandler('Failed to copy image to clipboard');
    }
  }
}

export default copyImageToClipboard;
