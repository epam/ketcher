import acts from '../acts';
import { isEqual, isEmpty, pickBy } from 'lodash/fp';

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
	else if (actObj.action && actObj.action.tool)
		return isEqual(activeTool, actObj.action);
	return false;
}

function disabled(actObj, { editor, server }) {
	if (typeof actObj.disabled == 'function')
		return actObj.disabled(editor, server);
	return false;
}

function status(key, activeTool, params) {
	let actObj = acts[key];
	return pickBy(x => x, {
		selected: selected(actObj, activeTool, params),
		disabled: disabled(actObj, params)
	});
}

export default function (state, { action, ...params }) {
	var activeTool = execute(state.activeTool, action, params);
	var res = Object.keys(acts).reduce((res, key) => {
		var value = status(key, activeTool, params);
		if (!isEmpty(value))
			res[key] = value;
		return res;
	}, { activeTool });
	return res;
}
