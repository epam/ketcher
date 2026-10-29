/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
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
import i18n from '../../../i18n/i18n';
<<<<<<< HEAD:packages/ketcher-react/src/script/ui/action/copyImageToClipboard.js

async function copyImageToClipboard() {
  const state = globalThis.currentState;
  const editor = state.editor;
  const options = state.options;
=======

async function copyImageToClipboard(): Promise<void> {
  const { editor, options } = (globalThis as typeof globalThis & Window)
    .currentState;

  if (!editor) {
    KetcherLogger.error(
      'copyImageToClipboard.ts::copyImageToClipboard',
      'Editor is not initialized',
    );
    return;
  }

>>>>>>> origin/master:packages/ketcher-react/src/script/ui/action/copyImageToClipboard.ts
  const struct = editor.structSelected();
  const errorHandler = editor.errorHandler;

  try {
    const ketcher = ketcherProvider.getKetcher(editor.ketcherId);
    const ketSerializer = new KetSerializer();
    const structStr = ketSerializer.serialize(struct);

    const image = await ketcher.generateImage(structStr, {
      outputFormat: 'png',
      backgroundColor: '255, 255, 255',
      bondThickness: options.settings.bondThickness || defaultBondThickness,
    });
<<<<<<< HEAD:packages/ketcher-react/src/script/ui/action/copyImageToClipboard.js
    const item = new globalThis.ClipboardItem({ [image.type]: image });
    await globalThis.navigator.clipboard.write([item]);
  } catch (e) {
    KetcherLogger.error('copyImageToClipboard.js::copyImageToClipboard', e);
    errorHandler(i18n.t('common:errors.featureNotAvailableInBrowser'));
=======

    const item = new ClipboardItem({ [image.type]: image });
    await globalThis.navigator.clipboard.write([item]);
  } catch (error) {
    KetcherLogger.error('copyImageToClipboard.ts::copyImageToClipboard', error);

    if (errorHandler) {
      errorHandler(i18n.t('common:errors.featureNotAvailableInBrowser'));
    }
>>>>>>> origin/master:packages/ketcher-react/src/script/ui/action/copyImageToClipboard.ts
  }
}

export default copyImageToClipboard;
