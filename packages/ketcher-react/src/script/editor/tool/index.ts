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
import { IMAGE_KEY } from 'ketcher-core';

import AtomTool from './atom';
import AttachTool from './attach';
import BondTool from './bond';
import ChainTool from './chain';
import ChargeTool from './charge';
import EraserTool from './eraser';
import HandTool from './hand';
import PasteTool from './paste';
import { CommonArrowTool } from './arrow/commonArrow';
import ReactionMapTool from './reactionmap';
import ReactionPlusTool from './reactionplus';
import ReactionUnmapTool from './reactionunmap';
import RotateTool from './rotate';
import SimpleObjectTool from './simpleobject';
import TemplateTool from './template';
import TextTool from './text';
import { ToolConstructorInterface } from './Tool';
import { ImageTool } from './image';
import { SelectCommonTool } from './select';
import FragmentSelectionTool from './fragmentSelection';

export const toolsMap: Record<string, ToolConstructorInterface> = {
  hand: HandTool,
  select: SelectCommonTool,
  fragmentSelection: FragmentSelectionTool,
  eraser: EraserTool,
  atom: AtomTool,
  bond: BondTool,
  chain: ChainTool,
  template: TemplateTool,
  charge: ChargeTool,
  attach: AttachTool,
  reactionarrow: CommonArrowTool,
  reactionplus: ReactionPlusTool,
  reactionmap: ReactionMapTool,
  reactionunmap: ReactionUnmapTool,
  paste: PasteTool,
  rotate: RotateTool,
  simpleobject: SimpleObjectTool,
  text: TextTool,
  [IMAGE_KEY]: ImageTool,
};
