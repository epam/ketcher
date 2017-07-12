const initState = {
	roundWeight: 3,
	roundMass: 3
};

const dumbActions = [
	'CHANGE_ANALYSE_ROUND'
];

export default function analyseReducer(state = initState, action) {

	if (dumbActions.includes(action.type)) {
		return Object.assign({}, state, action.payload);
	}

	return state;
}
