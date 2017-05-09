import { createStore, applyMiddleware } from 'redux';
import { logger } from 'redux-logger';

function mainReducer(state, action) {
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
		scope: 'editor'
	};

	return createStore(mainReducer, initState,
					   applyMiddleware(logger));
};
