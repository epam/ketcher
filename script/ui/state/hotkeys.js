/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

import { isEqual, debounce } from 'lodash/fp';

import molfile from '../../chem/molfile';
import keyNorm from '../keynorm';
import actions from '../action';

import clipArea from '../cliparea';
import * as structFormat from '../structformat';
import { onAction, openDialog, load } from './';

export function initKeydownListener(element) {
	return function (dispatch, getState) {
		const hotKeys = initHotKeys();
		element.addEventListener('keydown', (event) => keyHandle(dispatch, getState, hotKeys, event));

		initClipboard(dispatch, getState, element);
	}
}

function keyHandle(dispatch, getState, hotKeys, event) {
	const editor = getState().editor;
	const actionState = getState().actionState;
	const actionTool = actionState.activeTool;

	const key = keyNorm(event);
	const atomsSelected = editor.selection() && editor.selection().atoms;

	let group = null;

	if (key.length === 1 && atomsSelected && key.match(/\w/)) {
		console.assert(atomsSelected.length > 0);
		openDialog(dispatch, 'labelEdit', { letter: key }).then(res => {
			dispatch(onAction({ tool: 'atom', opts: res }));
		});
		event.preventDefault();
	} else if (group = keyNorm.lookup(hotKeys, event)) {
		let index = checkGroupOnTool(group, actionTool); // index currentTool in group || -1
		index = (index + 1) % group.length;

		let actName = group[index];
		if (actionState[actName] && actionState[actName].disabled === true)
			return event.preventDefault();

		if (clipArea.actions.indexOf(actName) === -1) {
			let newAction = actions[actName].action;
			dispatch(onAction(newAction));
			event.preventDefault();
		} else if (window.clipboardData) // IE support
			clipArea.exec(event);
	}
}

function setHotKey(key, actName, hotKeys) {
	if (Array.isArray(hotKeys[key]))
		hotKeys[key].push(actName);
	else
		hotKeys[key] = [actName];
}

function initHotKeys() {
	const hotKeys = {};
	let act;

	for (let actName in actions) {
		act = actions[actName];
		if (!act.shortcut) continue;

		if (Array.isArray(act.shortcut))
			act.shortcut.forEach(key => setHotKey(key, actName, hotKeys));
		else
			setHotKey(act.shortcut, actName, hotKeys);
	}

	return keyNorm(hotKeys);
}

function checkGroupOnTool(group, actionTool) {
	let index = group.indexOf(actionTool.tool);

	group.forEach((actName, i) => {
		if (isEqual(actions[actName].action, actionTool))
			index = i;
	});

	return index;
}

function initClipboard(dispatch, getState, element) {
	const formats = Object.keys(structFormat.map).map(function (fmt) {
		return structFormat.map[fmt].mime;
	});

	const debAction  = debounce(0, (action) => dispatch( onAction(action) ));
	const loadStruct = debounce(0, (structStr, opts) => dispatch( load(structStr, opts) ));

	return clipArea(element, {
		formats: formats,
		focused: function () {
			return !getState().modal;
		},
		onCut: function () {
			let data = clipData(getState().editor);
			debAction({ tool: 'eraser', opts: 1 });
			return data;
		},
		onCopy: function () {
			let editor = getState().editor;
			let data = clipData(editor);
			editor.selection(null);
			return data;
		},
		onPaste: function (data) {
			const structStr = data['chemical/x-mdl-molfile'] ||
				data['chemical/x-mdl-rxnfile'] ||
				data['text/plain'];

			if (structStr)
				loadStruct(structStr, { fragment: true });
		}
	});
}

function clipData(editor) {
	const res = {};
	const struct = editor.structSelected();

	if (struct.isBlank())
		return null;

	const type = struct.isReaction ?
		'chemical/x-mdl-molfile' : 'chemical/x-mdl-rxnfile';

	res['text/plain'] = res[type] = molfile.stringify(struct);
	// res['chemical/x-daylight-smiles'] =
	// smiles.stringify(struct);
	return res;
}
