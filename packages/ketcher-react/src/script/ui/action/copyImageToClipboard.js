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
  defaultBondThickness,
  KetcherLogger,
  ketcherProvider,
  KetSerializer,
} from 'ketcher-core';

async function copyImageToClipboard() {
  const state = global.currentState;
  const editor = state.editor;
  const options = state.options;
  const struct = editor.structSelected();
  const errorHandler = editor.errorHandler;
  const bondThickness =
    options?.settings?.bondThickness ?? defaultBondThickness;
  try {
    const ketcher = ketcherProvider.getKetcher(editor.ketcherId);
    const ketSerializer = new KetSerializer();
    const structStr = ketSerializer.serialize(struct);
    const image = await ketcher.generateImage(structStr, {
      outputFormat: 'png',
      backgroundColor: '255, 255, 255',
      bondThickness,
    });
    const item = new ClipboardItem({ [image.type]: image }); // eslint-disable-line no-undef
    await navigator.clipboard.write([item]);
  } catch (e) {
    KetcherLogger.error('copyImageToClipboard.js::copyImageToClipboard', e);
    errorHandler('This feature is not available in your browser');
  }
}

export default copyImageToClipboard;
