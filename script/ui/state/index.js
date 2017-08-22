import { pick } from 'lodash/fp';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'
import { logger } from 'redux-logger';

import { formsState, formReducer } from './form';
import { optionsState, optionsReducer } from './options';
import { initTmplState, templatesReducer } from './templates';

import action from './action';
import toolbar from './toolbar';

function modal(state = null, action) {
	let { type, data } = action;

	if (type === 'UPDATE_FORM') {
		let formState = formReducer(state.form, action, state.name);
		return { ...state, form: formState }
	}

	switch (type) {
	case 'MODAL_CLOSE':
		return null;
	case 'MODAL_OPEN':
		return {
			name: data.name,
			form: formsState[data.name] || null,
			prop: data.prop || null
		}
	}
	return state;
}

const shared = combineReducers({
	actionState: action,
	toolbar,
	modal,
	server: (store=null) => store,
	editor: (store=null) => store,
	options: optionsReducer,
	templates: templatesReducer
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

export function openDialog(dispatch, dialogName, props) {
	return new Promise(function (resolve, reject) {
		dispatch({
			type: 'MODAL_OPEN',
			data: {
				name: dialogName,
				prop: {
					...props,
					onResult: (res) => resolve(res),
					onCancel: () => reject()
				}
			}
		})
	});
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
		...pick(['editor', 'server', 'options'], state)
	});
	return (sh === state.shared) ? state : {
		...state, ...sh
	};
}

export default function(options, server) {
	// TODO: redux localStorage here
	var initState = {
		actionState: null,
		options: Object.assign(optionsState, { app: options }),
		server: server || Promise.reject("Standalone mode!"),
		editor: null,
		modal: null,
		templates: initTmplState
	};

	const middleware = [ thunk ];
	if (process.env.NODE_ENV !== 'production')
		middleware.push(logger);

	return createStore(root, initState, applyMiddleware(...middleware));
};
