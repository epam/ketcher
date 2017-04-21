const initState = {
	valid: false,
	stateForm: {
		label: '',
		charge: 0,
		explicitValence: -1,
		hCount: 0,
		invRet: 0,
		isotope: 0,
		radical: 0,
		ringBondCount: 0,
		substitutionCount: 0
	}
};

const dumbActions = [
	'UPDATE_ATOM_FORM'
];

export default function atomReducer(state = initState, action) {

	if (dumbActions.includes(action.type)) {
		console.log('atomReducer', action);
		return Object.assign({}, state, action.payload);
	}

	return state;
}
