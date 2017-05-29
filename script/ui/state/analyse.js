const initState = {
	roundWeight: 3,
	roundMass: 3
};

const dumbActions = [
	'CHANGE_ANALYSE_ROUND'
];

export function changeRound(roundName, value) {
	return {
		type: 'CHANGE_ANALYSE_ROUND',
		payload: { [roundName]: value }
	};
}

export default function analyseReducer(state = initState, action) {

	if (dumbActions.includes(action.type)) {
		console.log('analyseReducer', action);
		return Object.assign({}, state, action.payload);
	}

	return state;
}
