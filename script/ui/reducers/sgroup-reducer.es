const initState = {
	stateForm: {
		type: 'GEN'
	}
};

const dumbActions = [
];

export default function sgroupReducer(state = initState, action) {

	if (action.type === 'UPDATE_SGROUP_FORM') {
		return {
			...state,
			stateForm: Object.assign({}, state.stateForm, action.payload.stateForm)
		}
	}

	if (dumbActions.includes(action.type)) {
		return Object.assign({}, state, action.payload);
	}

	return state;
}
