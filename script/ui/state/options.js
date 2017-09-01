/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

import { pick } from 'lodash/fp';
import settingsSchema, { SERVER_OPTIONS } from '../data/options-schema';

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
	settings: Object.assign(defaultOpts(), JSON.parse(localStorage.getItem("ketcher-opts"))),
	getServerSettings: function() {
		return pick(SERVER_OPTIONS, this.settings);
	}
};

export function appUpdate(data) {
	return dispatch => {
		dispatch({ type: 'APP_OPTIONS', data });
		dispatch({ type: 'UPDATE' })
	}
}

/* SETTINGS */
export function defaultOpts() {
	return Object.keys(settingsSchema.properties).reduce((res, prop) => {
		res[prop] = settingsSchema.properties[prop].default;
		return res;
	}, {});
}

export function saveSettings(newSettings) {
	return dispatch => {
		localStorage.setItem("ketcher-opts", JSON.stringify(newSettings));
		dispatch({ type: 'SAVE_SETTINGS', data: newSettings });
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
		return {...state, app: { ...state.app, ...data }};

	if (type === 'SAVE_SETTINGS')
		return {...state, settings: data};

	if (type === 'CHANGE_ANALYSE')
		return {...state, analyse: { ...state.analyse, ...data }};

	if (recognizeActions.includes(type)) {
		return {...state, recognize: { ...state.recognize, ...data }}
	}

	return state;
}
