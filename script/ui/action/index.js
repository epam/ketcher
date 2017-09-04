/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
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
		shortcut: "Mod+n",
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
