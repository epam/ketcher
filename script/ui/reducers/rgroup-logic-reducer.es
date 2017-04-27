const initState = {
	errors: {},
	valid: true,
	stateForm: {
		ifthen: 0,
		range: '>0',
		resth: false
	}
};

const dumbActions = [
	'UPDATE_RGROUP_LOGIC_FORM'
];

export default function rgroupLodicReducer(state = initState, action) {

	if (dumbActions.includes(action.type)) {
		console.log('rgroupLodicReducer', action);
		return Object.assign({}, state, action.payload);
	}

	return state;
}
