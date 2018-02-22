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

import { bond as bondSchema } from '../data/schema/struct-schema';
import { toBondType } from '../data/convert/structconv';

const toolActions = {
	'select-lasso': {
		title: 'Lasso Selection',
		shortcut: 'Escape',
		action: { tool: 'select', opts: 'lasso' }
	},
	'select-rectangle': {
		title: 'Rectangle Selection',
		shortcut: 'Escape',
		action: { tool: 'select', opts: 'rectangle' }
	},
	'select-fragment': {
		title: 'Fragment Selection',
		shortcut: 'Escape',
		action: { tool: 'select', opts: 'fragment' }
	},
	erase: {
		title: 'Erase',
		shortcut: ['Delete', 'Backspace'],
		action: { tool: 'eraser', opts: 1 } // TODO last selector mode is better
	},
	chain: {
		title: 'Chain',
		action: { tool: 'chain' }
	},
	'chiral-flag': {
		title: 'Chiral Flag',
		action: { tool: 'chiralFlag' },
		selected: editor => editor.struct().isChiral
	},
	'charge-plus': {
		shortcut: '5',
		title: 'Charge Plus',
		action: { tool: 'charge', opts: 1 }
	},
	'charge-minus': {
		shortcut: '5',
		title: 'Charge Minus',
		action: { tool: 'charge', opts: -1 }
	},
	'transform-rotate': {
		shortcut: 'Alt+r',
		title: 'Rotate Tool',
		action: { tool: 'rotate' }
	},
	'transform-flip-h': {
		shortcut: 'Alt+h',
		title: 'Horizontal Flip',
		action: { tool: 'rotate', opts: 'horizontal' }
	},
	'transform-flip-v': {
		shortcut: 'Alt+v',
		title: 'Vertical Flip',
		action: { tool: 'rotate', opts: 'vertical' }
	},
	sgroup: {
		shortcut: 'Mod+g',
		title: 'S-Group',
		action: { tool: 'sgroup' }
	},
	'sgroup-data': {
		shortcut: 'Mod+g',
		title: 'Data S-Group',
		action: { tool: 'sgroup', opts: 'DAT' }
	},
	'reaction-arrow': {
		title: 'Reaction Arrow Tool',
		action: { tool: 'reactionarrow' }
	},
	'reaction-plus': {
		title: 'Reaction Plus Tool',
		action: { tool: 'reactionplus' }
	},
	'reaction-map': {
		title: 'Reaction Mapping Tool',
		action: { tool: 'reactionmap' }
	},
	'reaction-unmap': {
		title: 'Reaction Unmapping Tool',
		action: { tool: 'reactionunmap' }
	},
	'rgroup-label': {
		shortcut: 'Mod+r',
		title: 'R-Group Label Tool',
		action: { tool: 'rgroupatom' }
	},
	'rgroup-fragment': {
		shortcut: ['Mod+Shift+r', 'Mod+r'],
		title: 'R-Group Fragment Tool',
		action: { tool: 'rgroupfragment' }
	},
	'rgroup-attpoints': {
		shortcut: 'Mod+r',
		title: 'Attachment Point Tool',
		action: { tool: 'apoint' }
	}
};

const bondCuts = {
	single: '1',
	double: '2',
	triple: '3',
	up: '1',
	down: '1',
	updown: '1',
	crossed: '2',
	any: '0',
	aromatic: '4'
};

const typeSchema = bondSchema.properties.type;

export default typeSchema.enum.reduce((res, type, i) => {
	res[`bond-${type}`] = {
		title: `${typeSchema.enumNames[i]} Bond`,
		shortcut: bondCuts[type],
		action: {
			tool: 'bond',
			opts: toBondType(type)
		}
	};
	return res;
}, toolActions);
