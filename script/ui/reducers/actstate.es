import acts from '../acts';
import { isEqual } from 'lodash/fp';

function execute(activeTool, action, { editor, server }) {
	if (action.tool) {
		if (editor.tool(action.tool, action.opts))
			return action;
	}
	else if (typeof action == 'function')
		action(editor, server);
	else
		console.info('no action');
	return activeTool;
}

function selected(actObj, activeTool, { editor, server }) {
	if (typeof actObj.selected == 'function')
		return actObj.selected(editor, server);
	else if (actObj.action.tool)
		return isEqual(activeTool, actObj.action);
	return null;
}

function disabled(actObj, { editor, server }) {
	if (typeof actObj.disabled == 'function')
		return actObj.disabled(editor, server);
	return null;
}

function status(key, activeTool, params) {
	let actObj = acts[key];
	let selected = selected(actObj, activeTool, params);
	let disabled = disabled(actObj, params);
	return (selected == null && disabled == null) ? null : {
		selected,
		disabled
	};
}

export default function (state, { action, ...params }) {
	var activeTool = execute(state.activeTool, action, params);
	var res = Object.keys(acts).reduce((res, key) => {
		var st = status(key, activeTool, params);
		if (st)
			res[key] = st;
		return res;
	}, { activeTool });
	return res;
}
