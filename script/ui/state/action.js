import acts from '../action';
import { isEqual, isEmpty, pickBy } from 'lodash/fp';

function execute(activeTool, { action, editor, server, options }) {
	if (action.tool) {
		if (editor.tool(action.tool, action.opts))
			return action;
	}
	else if (typeof action == 'function')
		action(editor, server, options);
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

function disabled(actObj, { editor, server, options }) {
	if (typeof actObj.disabled == 'function')
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
		var activeTool = execute(state && state.activeTool, {
			...params, action
		});
	case 'UPDATE':
		var res = Object.keys(acts).reduce((res, key) => {
			var value = status(key, res.activeTool, params);
			if (!isEmpty(value))
				res[key] = value;
			return res;
		}, { activeTool: activeTool || state.activeTool });
		return res;
	default:
		return state;
	}
}
