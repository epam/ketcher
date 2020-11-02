/****************************************************************************
 * Copyright 2018 EPAM Systems
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

import RGroupAtomTool from './rgroupatom';
import SelectTool from './select';
import SGroupTool from './sgroup';
import EraserTool from './eraser';
import AtomTool from './atom';
import BondTool from './bond';
import ChainTool from './chain';
import ChiralFlagTool from './chiral-flag';
import TemplateTool from './template';
import ChargeTool from './charge';
import RGroupFragmentTool from './rgroupfragment';
import APointTool from './apoint';
import AttachTool from './attach';
import ReactionArrowTool from './reactionarrow';
import ReactionPlusTool from './reactionplus';
import ReactionMapTool from './reactionmap';
import ReactionUnmapTool from './reactionunmap';
import PasteTool from './paste';
import RotateTool from './rotate';

export default {
	rgroupatom: RGroupAtomTool,
	select: SelectTool,
	sgroup: SGroupTool,
	eraser: EraserTool,
	atom: AtomTool,
	bond: BondTool,
	chain: ChainTool,
	chiralFlag: ChiralFlagTool,
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
	rotate: RotateTool
};
