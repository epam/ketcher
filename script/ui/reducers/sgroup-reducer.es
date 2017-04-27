const initState = {
	errors: {},
	valid: true,
	stateForm: {
		type: 'GEN'
	}
};

export default function sgroupReducer(state = initState, action) {
	if (action.type === 'UPDATE_SGROUP_FORM') {
		return Object.assign({}, state, action.payload);
	}

	return state;
}
