const initState = {
	stateForm: {
		type: 'DAT'
	}
};

const dumbActions = [
	'UPDATE_SGROUPSPEC_FORM'
];

export default function sgroupSpecialReducer(state = initState, action) {

	if (dumbActions.includes(action.type)) {
		return Object.assign({}, state, action.payload);
	}

	return state;
}
