const initState = {
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
		return {
			...state,
			stateForm: Object.assign({}, state.stateForm, action.payload)
		}
	}

	return state;
}
