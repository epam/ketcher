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

import { KetcherLogger, KetSerializer, MolSerializer } from 'ketcher-core';
import i18n from '../../../i18n/i18n';
import type { CurrentAppState } from '../state/store.types';
import type { SerializationType, StructSerializer } from '../../../types';

/**
 * Copies the selected structure to clipboard in the specified format (MOL or KET).
 * Simple objects and text objects are not supported in MOL format.
 *
 * @param type - The serialization format: 'mol' for MOL format or 'ket' for KET format
 */
export default function copyAs(type: SerializationType): void {
  const { editor } = (
    globalThis as typeof globalThis & { currentState: CurrentAppState }
  ).currentState;

  if (!editor) {
    KetcherLogger.error('copyAs.ts::copyAs', 'Editor is not initialized');
    return;
  }

  const struct = editor.structSelected();
  const errorHandler = editor.errorHandler;

  let serializer: StructSerializer;

  try {
    switch (type) {
      case 'mol': {
        serializer = new MolSerializer();
        break;
      }
      case 'ket': {
        serializer = new KetSerializer();
        break;
      }
      default: {
        const exhaustiveCheck: never = type;
        KetcherLogger.error(
          'copyAs.ts::copyAs',
          `Unknown serialization type: ${exhaustiveCheck}`,
        );
        return;
      }
    }

    const hasSimpleObjectsOrTexts = Boolean(
      struct.simpleObjects.size > 0 || struct.texts.size > 0,
    );

    // MOL format doesn't support simple objects and text objects
    if (hasSimpleObjectsOrTexts && serializer instanceof MolSerializer) {
      errorHandler?.(i18n.t('toolbar:copy.notAvailableForSimpleObjects'));
      return;
    }

    const structData = serializer.serialize(struct);

    const { clipboardData } = globalThis as typeof globalThis & {
      clipboardData?: DataTransfer;
    };
    if (clipboardData) {
      clipboardData.setData('text', structData);
    } else {
      navigator.clipboard.writeText(structData);
    }
  } catch (error) {
    KetcherLogger.error('copyAs.ts::copyAs', error);
    errorHandler?.(i18n.t('common:errors.featureNotAvailableInBrowser'));
  }
}
