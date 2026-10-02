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

import { findIndex, findLastIndex } from 'lodash/fp';
import isHidden from './isHidden';
import type {
  UiAction,
  ActionStateEditor,
  ActionStateOptions,
} from './action.types';

export const zoomList: number[] = [
  0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 2,
  2.5, 3, 3.5, 4,
];

type CurriedEditorAction = (
  event: unknown,
) => (editor: ActionStateEditor) => void;

interface ZoomActions {
  zoom: UiAction;
  'zoom-out': UiAction;
  'zoom-in': UiAction;
  'zoom-list': UiAction;
}

// Helper function to safely call tool mousemove
const callToolMousemove = (
  editor: ActionStateEditor,
  event: Event | null,
): void => {
  const tool = editor.tool();
  if (tool && tool.mousemove && event) {
    tool.mousemove(event);
  }
};

const zoom: ZoomActions = {
  zoom: {
    shortcut: ['Mod+0'],
    enabledInViewOnly: true,
    selected: (editor: ActionStateEditor): boolean => editor.zoom() === 1,
    action: (editor: ActionStateEditor): void => {
      editor.zoom(1);
      callToolMousemove(editor, editor.lastEvent);
    },
    hidden: (options: ActionStateOptions): boolean => isHidden(options, 'zoom'),
  },
  'zoom-out': {
    shortcut: ['Mod+Minus', 'Mod+NumpadSubtract'],
    title: 'Zoom Out',
    enabledInViewOnly: true,
    disabled: (editor: ActionStateEditor): boolean =>
      editor.zoom() <= zoomList[0],
    action: ((event: unknown): ((editor: ActionStateEditor) => void) => {
      return (editor: ActionStateEditor): void => {
        const currentZoom: number = editor.zoom();
        const i: number = findLastIndex(
          (z: number) => z <= currentZoom,
          zoomList,
        );
        editor.zoom(
          zoomList[zoomList[i] === currentZoom && i > 0 ? i - 1 : i],
          event as WheelEvent | undefined,
        );
        callToolMousemove(editor, editor.lastEvent);
      };
    }) as unknown as CurriedEditorAction,
    hidden: (options: ActionStateOptions): boolean =>
      isHidden(options, 'zoom-out'),
  },
  'zoom-in': {
    shortcut: ['Mod+Equal', 'Mod+NumpadAdd'],
    title: 'Zoom In',
    enabledInViewOnly: true,
    disabled: (editor: ActionStateEditor): boolean =>
      zoomList[zoomList.length - 1] <= editor.zoom(),
    action: ((event: unknown): ((editor: ActionStateEditor) => void) => {
      return (editor: ActionStateEditor): void => {
        const currentZoom: number = editor.zoom();
        const i: number = findIndex((z: number) => z >= currentZoom, zoomList);
        editor.zoom(
          zoomList[
            zoomList[i] === currentZoom && i < zoomList.length - 1 ? i + 1 : i
          ],
          event as WheelEvent | undefined,
        );
        callToolMousemove(editor, editor.lastEvent);
      };
    }) as unknown as CurriedEditorAction,
    hidden: (options: ActionStateOptions): boolean =>
      isHidden(options, 'zoom-in'),
  },
  'zoom-list': {
    enabledInViewOnly: true,
    action: (_editor: ActionStateEditor): void => {
      // zoom-list is a UI component for selecting zoom levels, no action needed
    },
    hidden: (options: ActionStateOptions): boolean =>
      isHidden(options, 'zoom-list'),
  },
};

export default zoom;
