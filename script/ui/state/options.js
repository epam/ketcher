import { settings as settingsSchema } from '../data/options-schema';

export const optionsState = {

	analyse: {
		roundWeight: 3,
		roundMass: 3
	},
	recognize: {
		file: null,
		structStr: null,
		fragment: false
	},
	settings: Object.assign(defaultOpts(), JSON.parse(localStorage.getItem("ketcher-opts")))
};

/* SETTINGS */
export function defaultOpts() {
	return Object.keys(settingsSchema.properties).reduce((res, prop) => {
		res[prop] = settingsSchema.properties[prop].default;
		return res;
	}, {});
}

export function saveSettings(newSettings) {
	localStorage.setItem("ketcher-opts", JSON.stringify(newSettings));
	return {
		type: 'SAVE_SETTINGS',
		data: newSettings
	};
}

/* ANALYZE */
export function changeRound(roundName, value) {
	return {
		type: 'CHANGE_ANALYSE_ROUND',
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

	if (type === 'SAVE_SETTINGS')
		return {...state, settings: data};

	if (type === 'CHANGE_ANALYSE_ROUND')
		return {...state, analyse: { ...state.analyse, ...data }};

	if (recognizeActions.includes(type)) {
		return {...state, recognize: { ...state.recognize, ...data }}
	}

	return state;
}
