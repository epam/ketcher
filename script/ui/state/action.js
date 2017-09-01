/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

import acts from '../action';
import { isEqual, isEmpty, pickBy } from 'lodash/fp';

function execute(activeTool, { action, editor, server, options }) {
	if (action.tool) {
		if (editor.tool(action.tool, action.opts))
			return action;
	}
	else if (typeof action === 'function')
		action(editor, server, options);
	else
		console.info('no action');
	return activeTool;
}

function selected(actObj, activeTool, { editor, server }) {
	if (typeof actObj.selected === 'function')
		return actObj.selected(editor, server);
	else if (actObj.action && actObj.action.tool)
		return isEqual(activeTool, actObj.action);
	return false;
}

function disabled(actObj, { editor, server, options }) {
	if (typeof actObj.disabled === 'function')
		return actObj.disabled(editor, server, options);
	return false;
}

function status(key, activeTool, params) {
	let actObj = acts[key];
	return pickBy(x => x, {
		selected: selected(actObj, activeTool, params),
		disabled: disabled(actObj, params)
	});
}

export default function (state=null, { type, action, ...params }) {
	switch(type) {
	case 'INIT':
		action = acts['select-lasso'].action;
	case 'ACTION':
		const activeTool = execute(state && state.activeTool, {
			...params, action
		});
	case 'UPDATE':
		return Object.keys(acts).reduce((res, key) => {
			const value = status(key, res.activeTool, params);
			if (!isEmpty(value))
				res[key] = value;
			return res;
		}, { activeTool: activeTool || state.activeTool });
	default:
		return state;
	}
}
