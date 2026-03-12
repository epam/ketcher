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

import { Dispatch } from 'redux';
import Editor from '../../editor/Editor';

type ToolVariant =
  | 'any-atom'
  | 'about'
  | 'analyse'
  | 'arom'
  | 'atom-props'
  | 'bond-any'
  | 'bond-hydrogen'
  | 'bond-aromatic'
  | 'bond-crossed'
  | 'bond-dative'
  | 'bond-double'
  | 'bond-doublearomatic'
  | 'bond-down'
  | 'bond-props'
  | 'bond-single'
  | 'bond-singlearomatic'
  | 'bond-singledouble'
  | 'bond-triple'
  | 'bond-up'
  | 'bond-updown'
  | 'copies'
  | 'copy-mol'
  | 'copy-ket'
  | 'chain'
  | 'charge-minus'
  | 'charge-plus'
  | 'check'
  | 'chiral-flag'
  | 'cip'
  | 'clean'
  | 'copy'
  | 'copy-image'
  | 'cut'
  | 'dearom'
  | 'dropdown'
  | 'deselect-all'
  | 'enhanced-stereo'
  | 'erase'
  | 'extended-table'
  | 'fullscreen'
  | 'functional-groups'
  | 'generic-groups'
  | 'help'
  | 'info-modal'
  | 'layout'
  | 'logo'
  | 'miew'
  | 'clear'
  | 'open'
  | 'paste'
  | 'period-table'
  | 'reaction-arrow'
  | 'reaction-automap'
  | 'reaction-map'
  | 'reaction-plus'
  | 'reaction-unmap'
  | 'recognize'
  | 'redo'
  | 'rgroup-attpoints'
  | 'rgroup-fragment'
  | 'rgroup-label'
  | 'save'
  | 'select-structure'
  | 'select-fragment'
  | 'select-lasso'
  | 'select-rectangle'
  | 'select-all'
  | 'select-descriptors'
  | 'settings'
  | 'sgroup'
  | 'template-0'
  | 'template-1'
  | 'template-2'
  | 'template-3'
  | 'template-4'
  | 'template-5'
  | 'template-6'
  | 'template-7'
  | 'template-lib'
  | 'text'
  | 'transform-flip-h'
  | 'transform-flip-v'
  | 'transform-rotate'
  | 'zoom-in'
  | 'zoom-out'
  | 'shape-circle'
  | 'shape-rectangle'
  | 'shape-polyline'
  | 'shape-line'
  | 'undo';

type ActionStateEditor = Editor & {
  actions?: {
    active?: {
      tool?: string;
    };
  };
  struct(value?: unknown | null): {
    isBlank(): boolean;
    hasRxnArrow(): boolean;
  };
};

type ActionStateOptions = {
  app: {
    server?: unknown;
    templates?: unknown;
    functionalGroups?: unknown;
  };
  buttons?: Record<string, { hidden?: boolean }>;
};

type ActionThunkState = {
  editor: ActionStateEditor;
  toolbar: {
    visibleTools: {
      select: ToolVariant;
    };
  };
};

// todo: find out types
type ActionObj = {
  tool?: string;
  opts?: unknown;
  dialog?: string;
  thunk?: (dispatch: Dispatch, getState: () => ActionThunkState) => void;
};
type ActionFn = (editor: ActionStateEditor) => void;
// todo: come up with better name
type UiActionAction = ActionObj | ActionFn;

// todo: come up with better name
type GetSelectedState = (
  editor: ActionStateEditor,
  server?: unknown,
) => boolean;
type GetDisabledState = (
  editor: ActionStateEditor,
  server: unknown,
  options: ActionStateOptions,
) => boolean;
type GetHiddenState = (options: ActionStateOptions) => boolean;

export type GetActionState =
  | GetSelectedState
  | GetDisabledState
  | GetHiddenState;

type IsSelectedState = boolean | GetSelectedState;
type IsDisabledState = boolean | GetDisabledState;
type IsHiddenState = boolean | GetHiddenState;

interface UiAction {
  title?: string;
  shortcut?: string | Array<string>;
  enabledInViewOnly?: true;
  action: UiActionAction;
  selected?: IsSelectedState;
  disabled?: IsDisabledState;
  hidden?: IsHiddenState;
  onAction?: (action: UiActionAction) => void;
}

type Tools = {
  [key in ToolVariant]: UiAction;
};

export type { Tools, UiAction, UiActionAction };
