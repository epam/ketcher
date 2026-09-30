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

import type Editor from '../../../editor/Editor';
import type { UiActionAction } from '../../action/action.types';
import type { Struct } from 'ketcher-core';

/** The slice of Redux store state accessed by initEditor. */
export interface EditorInitState {
  editor: Editor;
  actionState?: {
    activeTool?: UiActionAction | null;
  };
  toolbar: {
    visibleTools: {
      select: string;
    };
  };
  options: {
    settings: {
      resetToSelect: boolean | 'paste';
    };
    getServerSettings(): Record<string, unknown>;
  };
  server: unknown;
}

/** Parameter shape for the onRgroupEdit callback. */
export interface RGroupEditParams {
  fragId: number;
  label: number;
  range?: string;
  [key: string]: unknown;
}

/** Payload shape for the onShowInfo callback. */
export interface ShowInfoPayload {
  groupStruct: Struct | null;
  event: unknown;
  sGroup: unknown;
}
