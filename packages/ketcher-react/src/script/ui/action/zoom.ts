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
import type { UiAction, ActionStateEditor } from './action.types';

export const zoomList: number[] = [
  0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 2,
  2.5, 3, 3.5, 4,
];

type ZoomStepAction = Omit<UiAction, 'action'> & {
  action: (event?: WheelEvent) => (editor: ActionStateEditor) => void;
};

interface ZoomActions {
  zoom: UiAction;
  'zoom-out': ZoomStepAction;
  'zoom-in': ZoomStepAction;
  'zoom-list': Omit<UiAction, 'action'>;
}

const refreshToolHover = (editor: ActionStateEditor) => {
  if (editor.lastEvent) editor.tool()?.mousemove?.(editor.lastEvent);
};

const zoom: ZoomActions = {
  zoom: {
    shortcut: ['Mod+0'],
    enabledInViewOnly: true,
    selected: (editor) => editor.zoom() === 1,
    action: (editor) => {
      editor.zoom(1);
      refreshToolHover(editor);
    },
    hidden: (options) => isHidden(options, 'zoom'),
  },
  'zoom-out': {
    shortcut: ['Mod+Minus', 'Mod+NumpadSubtract'],
    title: 'toolbar:zoom.out',
    enabledInViewOnly: true,
    disabled: (editor) => editor.zoom() <= zoomList[0],
    action: (event) => (editor) => {
      const zoom = editor.zoom();
      const i = findLastIndex((z) => z <= zoom, zoomList);
      editor.zoom(zoomList[zoomList[i] === zoom && i > 0 ? i - 1 : i], event);
      refreshToolHover(editor);
    },
    hidden: (options) => isHidden(options, 'zoom-out'),
  },
  'zoom-in': {
    shortcut: ['Mod+Equal', 'Mod+NumpadAdd'],
    title: 'toolbar:zoom.in',
    enabledInViewOnly: true,
    disabled: (editor) => zoomList[zoomList.length - 1] <= editor.zoom(),
    action: (event) => (editor) => {
      const zoom = editor.zoom();
      const i = findIndex((z) => z >= zoom, zoomList);
      editor.zoom(
        zoomList[zoomList[i] === zoom && i < zoomList.length - 1 ? i + 1 : i],
        event,
      );
      refreshToolHover(editor);
    },
    hidden: (options) => isHidden(options, 'zoom-in'),
  },
  'zoom-list': {
    enabledInViewOnly: true,
    hidden: (options) => isHidden(options, 'zoom-list'),
  },
};

export default zoom;
