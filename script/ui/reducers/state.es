import { createStore, applyMiddleware } from 'redux';
import { logger } from 'redux-logger';

import formsState from './forms-state.es';
import formReducer from './index.es';

function mainReducer(state, action) {
	if (action.type.endsWith('FORM')) {
		let formState = formReducer(state.form, action);
		return { ...state, form: formState }
	}

	switch (action.type) {
	case 'UPDATE':
		return { ...state, ...action.data };
	}
	return state;
}

export default function(options, server) {
	// TODO: redux localStorage here
	var initState = {
		options,
		server: server || Promise.reject("Standalone mode!"),
		active: { tool: 'chain' }, //{ name: 'select', opts: 'lasso' },
		freqAtoms: [],
		editor: null,
		modal: null,
		scope: 'editor',
		form: formsState
	};

	return createStore(mainReducer, initState,
					   applyMiddleware(logger));
};
