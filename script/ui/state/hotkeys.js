import { isEqual } from 'lodash/fp';

import molfile from '../../chem/molfile';
import keyNorm from '../keynorm';
import actions from '../action';

import clipArea from '../cliparea';
import * as structFormat from '../structformat';
import { onAction, openDialog, load } from './';

export function initKeydownListener(element) {
	return function (dispatch, getState) {

		const hotKeys = initHotKeys();
		element.on('keydown', (event) => keyHandle(dispatch, getState, hotKeys, event));

		initClipboard(dispatch, getState, element);
	}
}

function keyHandle(dispatch, getState, hotKeys, event) {
	let editor = getState().editor;
	let actionTool = getState().actionState.activeTool;

	let key = keyNorm(event);
	let atomsSelected = editor.selection() && editor.selection().atoms;
	let group;

	if (key.length === 1 && atomsSelected && key.match(/\w/)) {
		console.assert(atomsSelected.length > 0);
		openDialog(dispatch, 'labelEdit', { letter: key }).then(res => {
			dispatch(onAction({ tool: 'atom', opts: res }));
		});
		event.preventDefault();

	} else if (group = keyNorm.lookup(hotKeys, event)) {
		let index = checkGroupOnTool(group, actionTool); // index currentTool in group || -1
		index = (index + 1) % group.length;

		let newAction = actions[group[index]].action;
		if (newAction && clipArea.actions.indexOf(newAction) === -1) {
			dispatch(onAction(newAction));
			event.preventDefault();
		} else if (window.clipboardData) // IE support
			clipArea.exec(event);
	}
}

function initHotKeys() {
	let hotKeys = {};
	let act;

	function setHotKey(key, actName) {
		if (Array.isArray(hotKeys[key]))
			hotKeys[key].push(actName);
		else
			hotKeys[key] = [actName];
	}

	for (let actName in actions) {
		act = actions[actName];
		if (!act.shortcut) continue;

		if (Array.isArray(act.shortcut))
			act.shortcut.forEach(key => setHotKey(key, actName));
		else
			setHotKey(act.shortcut, actName);
	}

	return keyNorm(hotKeys);
}

function checkGroupOnTool(group, actionTool) {
	let index = group.indexOf(actionTool.tool);

	group.forEach((actName, i) => {
		if (isEqual(actions[actName].action, actionTool)) index = i;
	});
	return index;
}

function initClipboard(dispatch, getState, element) {
	const formats = Object.keys(structFormat.map).map(function (fmt) {
		return structFormat.map[fmt].mime;
	});
	return clipArea(element, {
		formats: formats,
		focused: function () {
			return !getState().modal;
		},
		onCut: function () {
			let data = clipData(getState().editor);
			dispatch(onAction({ tool: 'eraser', opts: 1 }));
			return data;
		},
		onCopy: function () {
			let editor = getState().editor;
			let data = clipData(editor);
			editor.selection(null);
			return data;
		},
		onPaste: function (data) {
			var structStr = data['chemical/x-mdl-molfile'] ||
				data['chemical/x-mdl-rxnfile'] ||
				data['text/plain'];
			if (structStr)
				dispatch( load(structStr, { fragment: true }) );
		}
	});
}

function clipData(editor) {
	let res = {};
	let struct = editor.structSelected();
	if (struct.isBlank())
		return null;
	let type = struct.isReaction ?
		'chemical/x-mdl-molfile' : 'chemical/x-mdl-rxnfile';
	res['text/plain'] = res[type] = molfile.stringify(struct);
	// res['chemical/x-daylight-smiles'] =
	// smiles.stringify(struct);
	return res;
}
