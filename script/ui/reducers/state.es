import { createStore, applyMiddleware } from 'redux';
import { logger } from 'redux-logger';

import formsState from './forms-state.es';
import formReducer from './index.es';
import actstate from './actstate';

function mainReducer(state, action) {
	let {type, data} = action;

	if (type.endsWith('FORM')) {
		let formState = formReducer(state.form, action);
		return { ...state, form: formState }
	}

	switch (type) {
	case 'UPDATE':
		return { ...state, ...data };
	case 'OPEN_DIALOG':
		return { ...state, ...data };
	case 'CLOSE_DIALOG':
		return { ...state, modal: null }
	case 'INIT':
		global._ui_editor = data.editor;
		return {...state, ...{
			editor: data.editor,
			actionState: actstate({}, {
				action: { tool: 'chain' },
				editor: data.editor,
				server: state.server
			})
		}}
	case 'ACTION':
		return {...state, ...{
			actionState: actstate(state.actionState, {
				action: data.action,
				editor: state.editor,
				server: state.server
			})
		}}
	}
	return state;
}

export default function(options, server) {
	// TODO: redux localStorage here
	var initState = {
		options,
		server: null, //server || Promise.reject("Standalone mode!"),
		freqAtoms: [],
		editor: null,
		modal: null,
		scope: 'editor',
		form: formsState
	};

	return createStore(mainReducer, initState,
					   applyMiddleware(logger));
};
