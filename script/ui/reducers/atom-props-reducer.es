const initState = {
	stateForm: {}
};

const dumbActions = [
	'UPDATE_ATOM_FORM'
];

export default function atomReducer(state = initState, action) {
	console.log('atomReducer', action);

	if (dumbActions.includes(action.type))
		return Object.assign({}, state, action.payload);

	return state;
}
