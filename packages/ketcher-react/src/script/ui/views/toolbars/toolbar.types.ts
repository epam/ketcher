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
type TopGroup = 'document' | 'edit' | 'zoom' | 'process' | 'meta'

type LeftGroup =
  | 'select'
  | 'bond'
  | 'charge'
  | 'transform'
  | 'sgroup'
  | 'rgroup'
  | 'shape'

type BottomGroup = 'template-common' | 'template-lib'

type RightGroup = 'atom' | 'period-table'

type ToolbarGroupVariant = TopGroup | LeftGroup | BottomGroup | RightGroup

type TopToolbarItemVariant =
  | 'new'
  | 'open'
  | 'save'
  | 'undo'
  | 'redo'
  | 'cut'
  | 'copy'
  | 'paste'
  | 'zoom-in'
  | 'zoom-out'
  | 'zoom-list'
  | 'layout'
  | 'clean'
  | 'arom'
  | 'dearom'
  | 'cip'
  | 'check'
  | 'analyse'
  | 'recognize'
  | 'miew'
  | 'settings'
  | 'help'
  | 'about'

type LeftToolbarItemVariant =
  // select group
  | 'select'
  | 'select-lasso'
  | 'select-rectangle'
  | 'select-fragment'
  | 'erase'
  // bond group
  | 'bond-common'
  | 'bond-single'
  | 'bond-double'
  | 'bond-triple'
  | 'bond-stereo'
  | 'bond-up'
  | 'bond-down'
  | 'bond-updown'
  | 'bond-crossed'
  | 'bond-query'
  | 'bond-any'
  | 'bond-aromatic'
  | 'bond-singledouble'
  | 'bond-singlearomatic'
  | 'bond-doublearomatic'
  | 'chain'
  // charge group
  | 'charge-plus'
  | 'charge-minus'
  // transform group
  | 'transform-rotate'
  | 'transform-flip-h'
  | 'transform-flip-v'
  // sgroup group
  | 'sgroup'
  | 'sgroup-data'
  | 'reaction'
  | 'reaction-arrow'
  | 'reaction-arrow-equilibrium'
  | 'reaction-plus'
  | 'reaction-automap'
  | 'reaction-map'
  | 'reaction-unmap'
  // rgroup group
  | 'rgroup-label'
  | 'rgroup-fragment'
  | 'rgroup-attpoints'
  // shape group
  | 'shape-ellipse'
  | 'shape-rectangle'
  | 'shape-line'

type BottomToolbarItemVariant = 'template-common' | 'template-lib'

type RightToolbarItemVariant = 'atom' | 'freq-atoms' | 'period-table'

type ToolbarItemVariant =
  | TopToolbarItemVariant
  | LeftToolbarItemVariant
  | BottomToolbarItemVariant
  | RightToolbarItemVariant

interface ToolbarItem {
  id: ToolbarItemVariant
  options?: ToolbarItem[]
}

export type { ToolbarGroupVariant }

export type {
  BottomToolbarItemVariant,
  LeftToolbarItemVariant,
  RightToolbarItemVariant,
  TopToolbarItemVariant,
  ToolbarItemVariant
}

export type { ToolbarItem }
