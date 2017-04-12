const initState = {
	stateForm: {
		label: '',
	}
};

const dumbActions = [
	'UPDATE_LABEL_EDIT_FORM'
];

export default function labelEditReducer(state = initState, action) {

	if (dumbActions.includes(action.type)) {
		console.log('labelEditReducer', action);
		return {
			...state,
			stateForm: Object.assign({}, state.stateForm, action.payload)
		}
	}

	return state;
}
