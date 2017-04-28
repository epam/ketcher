import { defaultOpts } from '../actions/settings-action.es';
const initState = {
	errors: {},
	valid: true,
	stateForm: JSON.parse(localStorage.getItem("ketcher-opts")) || defaultOpts()
};

const dumbActions = [
	'SET_DEFAULT_SETTINGS',
	'UPDATE_SETTINGS_FORM',
	'CANCEL_SETTINGS'
];

export default function settingsReducer(state = initState, action) {

	if (dumbActions.includes(action.type)) {
		console.log('settingsReducer', action);
		return Object.assign({}, state, action.payload);
	}

	return state;
}
