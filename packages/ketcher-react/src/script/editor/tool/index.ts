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
import { CREATE_MONOMER_TOOL_NAME, IMAGE_KEY } from 'ketcher-core';

import APointTool from './apoint';
import AtomTool from './atom';
import AttachTool from './attach';
import BondTool from './bond';
import ChainTool from './chain';
import ChargeTool from './charge';
import EnhancedStereoTool from './enhanced-stereo';
import EraserTool from './eraser';
import HandTool from './hand';
import PasteTool from './paste';
import RGroupAtomTool from './rgroupatom';
import RGroupFragmentTool from './rgroupfragment';
import { CommonArrowTool } from './arrow/commonArrow';
import ReactionMapTool from './reactionmap';
import ReactionPlusTool from './reactionplus';
import ReactionUnmapTool from './reactionunmap';
import RotateTool from './rotate';
import SGroupTool from './sgroup';
import SimpleObjectTool from './simpleobject';
import TemplateTool from './template';
import TextTool from './text';
import type { ToolConstructorInterface } from './Tool';
import { ImageTool } from './image';
import { SelectCommonTool } from './select';
import CreateMonomerTool from './create-monomer';
import FragmentSelectionTool from './fragmentSelection';

export const toolsMap: Record<string, ToolConstructorInterface> = {
  hand: HandTool,
  rgroupatom: RGroupAtomTool,
  select: SelectCommonTool,
  fragmentSelection: FragmentSelectionTool,
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
  // Cast to ToolConstructorInterface: constructor param types are narrower
  // than `unknown[]`, but toolsMap only ever calls these with the correct args.
  reactionarrow: CommonArrowTool as unknown as ToolConstructorInterface,
  reactionplus: ReactionPlusTool,
  reactionmap: ReactionMapTool,
  reactionunmap: ReactionUnmapTool,
  paste: PasteTool,
  // Cast to ToolConstructorInterface: constructor param types are narrower
  // than `unknown[]`, but toolsMap only ever calls these with the correct args.
  rotate: RotateTool as unknown as ToolConstructorInterface,
  enhancedStereo: EnhancedStereoTool,
  // Cast to ToolConstructorInterface: constructor param types are narrower
  // than `unknown[]`, but toolsMap only ever calls these with the correct args.
  simpleobject: SimpleObjectTool as unknown as ToolConstructorInterface,
  text: TextTool,
  [IMAGE_KEY]: ImageTool,
  [CREATE_MONOMER_TOOL_NAME]: CreateMonomerTool,
};
