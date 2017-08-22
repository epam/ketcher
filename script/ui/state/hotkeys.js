import { isEqual } from 'lodash/fp';

import keyNorm from '../keynorm';
import actions from '../action';

import clipArea from '../cliparea';
import { onAction, openDialog } from './';

export function initKeydownListener(element) {
	return function (dispatch, getState) {
		const hotKeys = initHotKeys();

		element.on('keydown', (event) => keyHandle(dispatch, getState, hotKeys, event));
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
		if (clipArea.actions.indexOf(newAction) === -1) {
			dispatch(onAction(newAction));
			event.preventDefault();
		} // else delegate to cliparea
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
