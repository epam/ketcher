const initState = {
	stateForm: {
		type: 'GEN'
	}
};

const dumbActions = [
	'UPDATE_SGROUP_FORM',
	'UPDATE_SGROUPSPEC_FORM'
];

export default function sgroupReducer(state = initState, action) {

	if (dumbActions.includes(action.type)) {
		console.log('sgroupReducer', action);
		return Object.assign({}, state, action.payload);
	}

	return state;
}
