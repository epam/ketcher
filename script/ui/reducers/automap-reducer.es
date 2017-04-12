const initState = {
	stateForm: {
		mode: "discard"
	}
};

const dumbActions = [
	'UPDATE_AUTOMAP_FORM'
];

export default function automapReducer(state = initState, action) {

	if (dumbActions.includes(action.type)) {
		console.log('automapReducer', action);
		return {
			...state,
			stateForm: Object.assign({}, state.stateForm, action.payload)
		}
	}

	return state;
}
