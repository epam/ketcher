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

/* eslint-disable no-undef */

import { KetcherLogger, KetSerializer, MolSerializer } from 'ketcher-core';
import type { SerializationType, StructSerializer } from './copyAs.types';

/**
 * Copies the selected structure to clipboard in the specified format (MOL or KET).
 * Simple objects and text objects are not supported in MOL format.
 *
 * @param type - The serialization format: 'mol' for MOL format or 'ket' for KET format
 * @throws Logs error to KetcherLogger if operation fails
 */
export default function copyAs(type: SerializationType): string | null {
  const state = global.currentState;

  if (!state || !state.editor) {
    KetcherLogger.error(
      'copyAs.ts::copyAs',
      'Global state or editor is not available',
    );
    return null;
  }

  const editor = state.editor;
  const struct = editor.structSelected();
  const errorHandler = editor.errorHandler;

  let serializer: StructSerializer;

  try {
    // Select and instantiate the appropriate serializer
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
        return null;
      }
    }

    // Check if structure contains simple objects or text objects
    const hasSimpleObjectsOrTexts = Boolean(
      struct.simpleObjects.size || struct.texts.size,
    );

    // MOL format doesn't support simple objects and text objects
    if (hasSimpleObjectsOrTexts && serializer instanceof MolSerializer) {
      errorHandler(
        'This feature is not available for Simple objects and Text objects',
      );
      return null;
    }

    // Serialize the structure
    const structData = serializer.serialize(struct);

    // Attempt to copy to clipboard using the appropriate API
    const legacyWindow = window as unknown as {
      clipboardData?: { setData: (type: string, data: string) => void };
    };
    if (legacyWindow.clipboardData) {
      // Legacy IE support
      legacyWindow.clipboardData.setData('text', structData);
    } else {
      // Modern browsers using Clipboard API
      navigator.clipboard.writeText(structData);
    }

    return structData;
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    KetcherLogger.error('copyAs.ts::copyAs', error);
    errorHandler('This feature is not available in your browser');
    return null;
  }
}
