/****************************************************************************
 * Copyright 2017 EPAM Systems
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

import tools from './tools';
import atoms from './atoms';
import zoom from './zoom';
import server from './server';
import debug from './debug';
import templates from './templates';
import { exec } from '../component/cliparea';
import { miewAction } from '../state/miew';

export default {
	"new": {
		shortcut: "Mod+Delete",
		title: "Clear Canvas",
		action: {
			thunk: (dispatch, getState) => {
				let editor = getState().editor;
				if (!editor.struct().isBlank())
					editor.struct(null);
				dispatch({ type: 'ACTION', action: tools['select-lasso'].action });
			}
		}
	},
	"open": {
		shortcut: "Mod+o",
		title: "Open…",
		action: { dialog: 'open' }
	},
	"save": {
		shortcut: "Mod+s",
		title: "Save As…",
		action: { dialog: 'save' }
	},
	"undo": {
		shortcut: "Mod+z",
		title: "Undo",
		action: editor => {
			editor.undo();
		},
		disabled: editor => (
			editor.historySize().undo === 0
		)
	},
	"redo": {
		shortcut: ["Mod+Shift+z", "Mod+y"],
		title: "Redo",
		action: editor => {
			editor.redo();
		},
		disabled: editor => (
			editor.historySize().redo === 0
		)
	},
	"cut": {
		shortcut: "Mod+x",
		title: "Cut",
		action: () => {
			exec('cut') || dontClipMessage('Cut');
		},
		disabled: editor => !hasSelection(editor)
	},
	"copy": {
		shortcut: "Mod+c",
		title: "Copy",
		action: () => {
			exec('copy') || dontClipMessage('Copy');
		},
		disabled: editor => !hasSelection(editor)
	},
	"paste": {
		shortcut: "Mod+v",
		title: "Paste",
		action: () => {
			exec('paste') || dontClipMessage('Paste')
		},
		selected: ({ actions }) => (
			actions && // TMP
				actions.active && actions.active.tool === 'paste'
		)
	},
	"check": {
		title: "Check Structure",
		action: { dialog: 'check' },
		disabled: (editor, server, options) => !options.app.server
	},
	"analyse": {
		title: "Calculated Values",
		action: { dialog: 'analyse' },
		disabled: (editor, server, options) => !options.app.server
	},
	"recognize": {
		title: "Recognize Molecule",
		action: { dialog: 'recognize' },
		disabled: (editor, server, options) => !options.app.server
	},
	"miew": {
		title: "3D Viewer",
		action: { thunk: miewAction	},
		disabled: (editor, server, options) => !options.app.server || !options.app.miewPath
	},
	"settings": {
		title: "Settings",
		action: { dialog: 'settings' }
	},
	"help": {
		shortcut: ["?", "Shift+/"],
		title: "Help",
		action: { dialog: 'help' }
	},
	"about": {
		title: "About",
		action: { dialog: 'about' }
	},
	"reaction-automap": {
		title: "Reaction Auto-Mapping Tool",
		action: { dialog: 'automap' },
		disabled: (editor, server, options) => !options.app.server || !editor.struct().hasRxnArrow()
	},
	"period-table": {
		title: "Periodic Table",
		action: { dialog: 'period-table' }
	},
	"select-all": {
		title: "Select All",
		shortcut: "Mod+a",
		action: {
			thunk: (dispatch, getState) => {
				getState().editor.selection('all');
				dispatch({ type: 'ACTION', action: tools['select-lasso'].action });
			}
		}
	},
	"deselect-all": {
		title: "Deselect All",
		shortcut: "Mod+Shift+a",
		action: editor => {
			editor.selection(null);
		}
	},
	"select-descriptors": {
		title: "Select descriptors",
		shortcut: "Mod+d",
		action: {
			thunk: (dispatch, getState) => {
				getState().editor.selection('descriptors');
				dispatch({ type: 'ACTION', action: tools['select-lasso'].action });
			}
		}
	},
	...server,
	...debug,
	...tools,
	...atoms,
	...zoom,
	...templates
};

function hasSelection(editor) {
	let selection = editor.selection();
	return selection &&  // if not only sgroupData selected
		(Object.keys(selection).length > 1 || !selection.sgroupData);
}

function dontClipMessage(title) {
	alert('These action is unavailble via menu.\n' +
		'Instead, use shortcut to ' + title + '.');
}
