const initState = {
	errors: {},
	valid: false,
	stateForm: {
		label: '',
	}
};

const dumbActions = [
	'UPDATE_LABEL_EDIT_FORM'
];

export default function labelEditReducer(state = initState, action) {

	if (dumbActions.includes(action.type)) {
		return Object.assign({}, state, action.payload);
	}

	return state;
}
