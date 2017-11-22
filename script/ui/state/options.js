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
import { SERVER_OPTIONS, getDefaultOptions, validation } from '../data/options-schema';
import { storage } from '../utils';

export const optionsState = {
	app: {
		server: false,
		templates: false
	},
	analyse: {
		values: null,
		roundWeight: 3,
		roundMass: 3
	},
	recognize: {
		file: null,
		structStr: null,
		fragment: false
	},
	settings: Object.assign(getDefaultOptions(), validation(storage.getItem("ketcher-opts"))),
	getServerSettings: function() {
		return pick(SERVER_OPTIONS, this.settings);
	}
};

export function appUpdate(data) {
	return dispatch => {
		dispatch({ type: 'APP_OPTIONS', data });
		dispatch({ type: 'UPDATE' });
	};
}

/* SETTINGS */
export function saveSettings(newSettings) {
	storage.setItem("ketcher-opts", newSettings);
	return {
		type: 'SAVE_SETTINGS',
		data: newSettings
	};
}

/* ANALYZE */
export function changeRound(roundName, value) {
	return {
		type: 'CHANGE_ANALYSE',
		data: { [roundName]: value }
	};
}

/* RECOGNIZE */
const recognizeActions = [
	'SET_RECOGNIZE_STRUCT',
	'CHANGE_RECOGNIZE_FILE',
	'IS_FRAGMENT_RECOGNIZE'
];

export function setStruct(str) {
	return {
		type: 'SET_RECOGNIZE_STRUCT',
		data: { structStr: str }
	};
}

export function changeImage(file) {
	return {
		type: 'CHANGE_RECOGNIZE_FILE',
		data: {
			file: file,
			structStr: null
		}
	};
}

export function shouldFragment(isFrag) {
	return {
		type: 'IS_FRAGMENT_RECOGNIZE',
		data: { fragment: isFrag }
	};
}

export function optionsReducer(state = {}, action) {
	let { type, data } = action;

	if (type === 'APP_OPTIONS')
		return { ...state, app: { ...state.app, ...data } };

	if (type === 'SAVE_SETTINGS')
		return { ...state, settings: data };

	if (type === 'CHANGE_ANALYSE')
		return { ...state, analyse: { ...state.analyse, ...data } };

	if (recognizeActions.includes(type))
		return { ...state, recognize: { ...state.recognize, ...data } };

	return state;
}
