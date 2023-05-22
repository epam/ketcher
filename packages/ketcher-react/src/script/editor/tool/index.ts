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

import APointTool from './apoint'
import AtomTool from './atom'
import AttachTool from './attach'
import BondTool from './bond'
import ChainTool from './chain'
import ChargeTool from './charge'
import EnhancedStereoTool from './enhanced-stereo'
import EraserTool from './eraser'
import HandTool from './hand'
import PasteTool from './paste'
import RGroupAtomTool from './rgroupatom'
import RGroupFragmentTool from './rgroupfragment'
import ReactionArrowTool from './reactionarrow'
import ReactionMapTool from './reactionmap'
import ReactionPlusTool from './reactionplus'
import ReactionUnmapTool from './reactionunmap'
import RotateTool from './rotate'
import SGroupTool from './sgroup'
import SelectTool from './select'
import SimpleObjectTool from './simpleobject'
import TemplateTool from './template'
import TextTool from './text'
import { ToolConstructorInterface } from './AbstractTool'

export const toolsMap: Record<string, ToolConstructorInterface> = {
  hand: HandTool,
  rgroupatom: RGroupAtomTool,
  select: SelectTool,
  sgroup: SGroupTool,
  eraser: EraserTool,
  atom: AtomTool,
  bond: BondTool,
  chain: ChainTool,
  template: TemplateTool,
  charge: ChargeTool,
  rgroupfragment: RGroupFragmentTool,
  apoint: APointTool,
  attach: AttachTool,
  reactionarrow: ReactionArrowTool,
  reactionplus: ReactionPlusTool,
  reactionmap: ReactionMapTool,
  reactionunmap: ReactionUnmapTool,
  paste: PasteTool,
  rotate: RotateTool,
  enhancedStereo: EnhancedStereoTool,
  simpleobject: SimpleObjectTool,
  text: TextTool
}
