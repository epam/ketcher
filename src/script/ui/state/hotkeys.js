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

import { isEqual, debounce } from 'lodash/fp';

import molfile from '../../chem/molfile';
import keyNorm from '../data/convert/keynorm';
import actions from '../action';

import * as clipArea from '../component/cliparea';
import * as structFormat from '../data/convert/structformat';
import { openDialog } from './modal';
import { onAction, load } from './shared';

export function initKeydownListener(element) {
	return function (dispatch, getState) {
		const hotKeys = initHotKeys();
		element.addEventListener('keydown', event => keyHandle(dispatch, getState, hotKeys, event));
	};
}

/* HotKeys */
function keyHandle(dispatch, getState, hotKeys, event) {
	const state = getState();
	if (state.modal) return;

	const editor = state.editor;
	const actionState = state.actionState;
	const actionTool = actionState.activeTool;

	const key = keyNorm(event);
	const atomsSelected = editor.selection() && editor.selection().atoms;

	let group = null;

	if (key && key.length === 1 && atomsSelected && key.match(/\w/)) {
		console.assert(atomsSelected.length > 0);
		openDialog(dispatch, 'labelEdit', { letter: key }).then((res) => {
			dispatch(onAction({ tool: 'atom', opts: res }));
		}).catch(() => null);
		event.preventDefault();
	} else if ((group = keyNorm.lookup(hotKeys, event)) !== undefined) {
		let index = checkGroupOnTool(group, actionTool); // index currentTool in group || -1
		index = (index + 1) % group.length;

		const actName = group[index];
		if (actionState[actName] && actionState[actName].disabled === true) {
			event.preventDefault();
			return;
		}
		if (clipArea.actions.indexOf(actName) === -1) {
			const newAction = actions[actName].action;
			dispatch(onAction(newAction));
			event.preventDefault();
		} else if (window.clipboardData) { // IE support
			clipArea.exec(event);
		}
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

	Object.keys(actions).forEach((actName) => {
		act = actions[actName];
		if (!act.shortcut) return;

		if (Array.isArray(act.shortcut)) {
			act.shortcut.forEach((key) => {
				setHotKey(key, actName, hotKeys);
			});
		} else {
			setHotKey(act.shortcut, actName, hotKeys);
		}
	});

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

const rxnTextPlain = /\$RXN\n+\s+0\s+0\s+0\n*/;

/* ClipArea */
export function initClipboard(dispatch, getState) {
	const formats = Object.keys(structFormat.map).map(fmt => structFormat.map[fmt].mime);

	const debAction = debounce(0, action => dispatch(onAction(action)));
	const loadStruct = debounce(0, (structStr, opts) => dispatch(load(structStr, opts)));

	return {
		formats,
		focused() {
			return !getState().modal;
		},
		onCut() {
			const editor = getState().editor;
			const data = clipData(editor);
			if (data) debAction({ tool: 'eraser', opts: 1 });
			else editor.selection(null);
			return data;
		},
		onCopy() {
			const editor = getState().editor;
			const data = clipData(editor);
			editor.selection(null);
			return data;
		},
		onPaste(data) {
			const structStr = data['chemical/x-mdl-molfile'] ||
				data['chemical/x-mdl-rxnfile'] ||
				data['text/plain'];

			const struct = getState().editor.render.ctab.molecule;

			if (structStr && (!struct.hasRxnArrow() || !rxnTextPlain.test(data['text/plain'])))
				loadStruct(structStr, { fragment: true });
		}
	};
}

function clipData(editor) {
	const res = {};
	const struct = editor.structSelected();

	if (struct.isBlank())
		return null;

	const type = struct.isReaction ?
		'chemical/x-mdl-molfile' : 'chemical/x-mdl-rxnfile';

	try {
		const data = molfile.stringify(struct);
		res['text/plain'] = data;
		res[type] = data;
		// res['chemical/x-daylight-smiles'] =
		// smiles.stringify(struct);
		return res;
	} catch (ex) {
		alert(ex.message); // eslint-disable-line no-undef
	}

	return null;
}
