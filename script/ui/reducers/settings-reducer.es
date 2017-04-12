const initState = {
	stateForm: JSON.parse(localStorage.getItem("ketcher-opts")) || {}
};

const dumbActions = [
	'SET_DEFAULT_SETTINGS',
	'UPDATE_SETTINGS_FORM',
	'CANCEL_SETTINGS'
];

export default function settingsReducer(state = initState, action) {

	if (dumbActions.includes(action.type)) {
		console.log('settingsReducer', action);
		return {
			...state,
			stateForm: Object.assign({}, state.stateForm, action.payload)
		}
	}

	return state;
}
