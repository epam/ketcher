/****************************************************************************
 * Copyright 2017 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { pick } from 'lodash/fp';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { logger } from 'redux-logger';

import * as structFormat from '../structformat';
import { formsState, formReducer } from './form';
import { optionsState, optionsReducer } from './options';
import { initTmplState, templatesReducer } from './templates';

import actionState from './action';
import toolbar from './toolbar';

function modal(state = null, action) {
	const { type, data } = action;

	if (type === 'UPDATE_FORM') {
		const formState = formReducer(state.form, action, state.name);
		return { ...state, form: formState };
	}

	switch (type) {
	case 'MODAL_CLOSE':
		return null;
	case 'MODAL_OPEN':
		return {
			name: data.name,
			form: formsState[data.name] || null,
			prop: data.prop || null
		};
	default:
		return state;
	}
}

const shared = combineReducers({
	actionState,
	toolbar,
	modal,
	server: (store = null) => store,
	editor: (store = null) => store,
	options: optionsReducer,
	templates: templatesReducer
});

export function onAction(action) {
	if (action && action.dialog) {
		return {
			type: 'MODAL_OPEN',
			data: { name: action.dialog }
		};
	}
	if (action && action.thunk)
		return action.thunk;

	return {
		type: 'ACTION',
		action
	};
}

export function openDialog(dispatch, dialogName, props) {
	return new Promise((resolve, reject) => {
		dispatch({
			type: 'MODAL_OPEN',
			data: {
				name: dialogName,
				prop: {
					...props,
					onResult: resolve,
					onCancel: reject
				}
			}
		});
	});
}

export function load(structStr, options) {
	return (dispatch, getState) => {
		const state = getState();
		const editor = state.editor;
		const server = state.server;

		options = options || {};
		// TODO: check if structStr is parsed already
		// utils.loading('show');
		const parsed = structFormat.fromString(structStr, options, server);

		parsed.catch(() => {
			// utils.loading('hide');
			alert('Can\'t parse molecule!'); // eslint-disable-line no-undef
		});

		return parsed.then((struct) => {
			// utils.loading('hide');
			console.assert(struct, 'No molecule to update');
			if (options.rescale)
				struct.rescale(); // TODO: move out parsing?

			if (options.fragment && !struct.isBlank())
				dispatch(onAction({ tool: 'paste', opts: struct }));
			else
				editor.struct(struct);

			return struct;
		}, (err) => {
			alert(err.message); // eslint-disable-line no-undef
			// TODO: notification
		});
	};
}

function root(state, action) {
	switch (action.type) { // eslint-disable-line default-case
	case 'INIT':
		global._ui_editor = action.editor;
	case 'UPDATE': // eslint-disable-line no-case-declarations
		const { type, ...data } = action;
		if (data)
			state = { ...state, ...data };
	}

	const sh = shared(state, {
		...action,
		...pick(['editor', 'server', 'options'], state)
	});

	return (sh === state.shared) ? state : {
		...state, ...sh
	};
}

export default function (options, server) {
	// TODO: redux localStorage here
	const initState = {
		actionState: null,
		options: Object.assign(optionsState, { app: options }),
		server: server || Promise.reject('Standalone mode!'),
		editor: null,
		modal: null,
		templates: initTmplState
	};

	const middleware = [thunk];

	if (process.env.NODE_ENV !== 'production')
		middleware.push(logger);

	return createStore(root, initState, applyMiddleware(...middleware));
}
