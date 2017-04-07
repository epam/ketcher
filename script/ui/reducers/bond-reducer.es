const initState = {
	stateForm: {
		type: 'single',
		topology: 0,
		center: 0
	}
};

const dumbActions = [
	'UPDATE_BOND_FORM'
];

export default function bondReducer(state = initState, action) {

	if (dumbActions.includes(action.type)) {
		console.log('bondReducer', action);
		return Object.assign({}, state, action.payload);
	}

	return state;
}
