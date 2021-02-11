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
import { Dispatch } from 'redux'

type ToolVariant =
  | 'about'
  | 'analyse'
  | 'arom'
  | 'bond-any'
  | 'bond-aromatic'
  | 'bond-crossed'
  | 'bond-double'
  | 'bond-doublearomatic'
  | 'bond-down'
  | 'bond-single'
  | 'bond-singlearomatic'
  | 'bond-singledouble'
  | 'bond-triple'
  | 'bond-up'
  | 'bond-updown'
  | 'chain'
  | 'charge-minus'
  | 'charge-plus'
  | 'check'
  | 'chiral-flag'
  | 'cip'
  | 'clean'
  | 'copy'
  | 'cut'
  | 'dearom'
  | 'dropdown'
  | 'enhanced-stereo'
  | 'erase'
  | 'generic-groups'
  | 'help'
  | 'layout'
  | 'logo'
  | 'miew'
  | 'new'
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
  | 'select-fragment'
  | 'select-lasso'
  | 'select-rectangle'
  | 'settings'
  | 'sgroup'
  | 'sgroup-data'
  | 'template-0'
  | 'template-1'
  | 'template-2'
  | 'template-3'
  | 'template-4'
  | 'template-5'
  | 'template-6'
  | 'template-7'
  | 'template-lib'
  | 'transform-flip-h'
  | 'transform-flip-v'
  | 'transform-rotate'
  | 'zoom-in'
  | 'zoom-out'
  | 'shape-circle'
  | 'shape-rectangle'
  | 'shape-polyline'
  | 'shape-line'
  | 'undo'

// todo: find out types
type Editor = any
type Server = any
type Options = any
type ReduxState = any

type ActionObj = {
  tool?: string
  opts?: any
  dialog?: string
  thunk?: (dispatch: Dispatch, getState: () => ReduxState) => void
}
type ActionFn = (editor: Editor) => void
// todo: imagine better name
type UiActionAction = ActionObj | ActionFn

// todo: imagine better name
type GetActionState = (
  editor: Editor,
  server?: Server,
  options?: Options
) => boolean

type IsActionState = boolean | GetActionState

interface UiAction {
  title?: string
  shortcut?: string
  action: UiActionAction
  selected?: IsActionState
  disabled?: IsActionState
  hidden?: IsActionState
  onAction?: (action: UiActionAction) => void
}

type Tools = {
  [ket in keyof ToolVariant]?: UiAction
}

export type {
  Tools,
  UiAction,
  UiActionAction,
  ActionObj,
  ActionFn,
  IsActionState
}
