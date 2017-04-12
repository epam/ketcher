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
		return {
        	...state,
        	stateForm: Object.assign({}, state.stateForm, action.payload)
        }
	}

	return state;
}
