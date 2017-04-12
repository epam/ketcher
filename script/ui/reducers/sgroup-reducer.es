const initState = {
	stateForm: {
		type: 'GEN'
	}
};

export default function sgroupReducer(state = initState, action) {
	if (action.type === 'UPDATE_SGROUP_FORM') {
		return {
			...state,
			stateForm: Object.assign({}, state.stateForm, action.payload)
		}
	}

	return state;
}
