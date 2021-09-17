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
  | 'text'

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
  | 'copy-image'
  | 'copy-mol'
  | 'copy-ket'
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
  | 'bond-dative'
  | 'bond-stereo'
  | 'bond-up'
  | 'bond-down'
  | 'bond-updown'
  | 'bond-crossed'
  | 'bond-query'
  | 'bond-special'
  | 'bond-any'
  | 'bond-hydrogen'
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
  // reaction
  //plus
  | 'reaction-plus'
  // arrows
  | 'reaction-arrows'
  | 'reaction-arrow-open-angle'
  | 'reaction-arrow-filled-triangle'
  | 'reaction-arrow-filled-bow'
  | 'reaction-arrow-dashed-open-angle'
  | 'reaction-arrow-failed'
  | 'reaction-arrow-both-ends-filled-triangle'
  | 'reaction-arrow-equilibrium-filled-half-bow'
  | 'reaction-arrow-equilibrium-filled-triangle'
  | 'reaction-arrow-equilibrium-open-angle'
  | 'reaction-arrow-unbalanced-equilibrium-filled-half-bow'
  | 'reaction-arrow-unbalanced-equilibrium-open-half-angle'
  | 'reaction-arrow-unbalanced-equilibrium-large-filled-half-bow'
  | 'reaction-arrow-unbalanced-equilibrium-fille-half-triangle'
  //mapping
  | 'reaction-mapping-tools'
  | 'reaction-automap'
  | 'reaction-map'
  | 'reaction-unmap'
  // rgroup group
  | 'rgroup'
  | 'rgroup-label'
  | 'rgroup-fragment'
  | 'rgroup-attpoints'
  // shape group
  | 'shape'
  | 'shape-ellipse'
  | 'shape-rectangle'
  | 'shape-line'
  // text group
  | 'text'

type BottomToolbarItemVariant =
  | 'template-common'
  | 'template-lib'
  | 'enhanced-stereo'

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
