const initState = {
	errors: {},
	valid: true,
	stateForm: {
		primary: false,
		secondary: false
	}
};

const dumbActions = [
	'UPDATE_ATTACH_POINTS_FORM'
];

export default function attachPointsReducer(state = initState, action) {

	if (dumbActions.includes(action.type)) {
		console.log('attachPointsReducer', action);
		return Object.assign({}, state, action.payload);
	}

	return state;
}
