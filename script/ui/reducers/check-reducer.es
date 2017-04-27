const initState = {
	errors: {},
	moleculeErrors: {},
	stateForm: {
		checkOptions: ['valence', 'radicals', 'pseudoatoms', 'stereo', 'query', 'overlapping_atoms',
			'overlapping_bonds', 'rgroups', 'chiral', '3d']
	}
};

const dumbActions = [
	'UPDATE_CHECK_FORM',
	'CHECK_ERRORS'
];

export default function checkReducer(state = initState, action) {

	if (dumbActions.includes(action.type)) {
		console.log('checkReducer', action);
		return Object.assign({}, state, action.payload);
	}

	return state;
}
