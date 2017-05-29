import { pick } from 'lodash/fp';

import { createStore, combineReducers,
         applyMiddleware } from 'redux';
import { logger } from 'redux-logger';

import formsState from './form.es';
import formReducer from './index.es';
import action from './action';
import toolbar from './toolbar';

function modal(state = null, { type, data }) {
	if (type.endsWith('FORM')) {
		let formState = formReducer(state.form, action);
		return { ...state, form: formState }
	}

	switch (type) {
	case 'MODAL_CLOSE':
		return null;
	case 'MODAL_OPEN':
		return { name: data.name }
	}
	return state;
}

const shared = combineReducers({
	actionState: action,
	toolbar,
	modal
});

export function onAction(action) {
	if (action && action.dialog)
		return {
			type: 'MODAL_OPEN',
			data: { name: action.dialog }
		};
	return {
		type: 'ACTION',
		action
	};
}

function root(state, action) {
	switch (action.type) {
	case 'INIT':
		global._ui_editor = action.editor;
	case 'UPDATE':
		let {type, ...data} = action;
		if (data)
			state = { ...state, ...data };
	}

	let sh = shared(state, {
		...action,
		...pick(['editor', 'server'], state)
	});
	return (sh === state.shared) ? state : {
		...state, ...sh
	};
}

export default function(options, server) {
	// TODO: redux localStorage here
	var initState = {
		options,
		server: null, //server || Promise.reject("Standalone mode!"),
		editor: null,
		modal: null,
		form: formsState
	};

	return createStore(root, initState,
					   applyMiddleware(logger));
};
