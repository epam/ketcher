const initState = {
	stateForm: {
		valence: true,
		radicals: true,
		pseudoatoms: true,
		stereo: true,
		query: true,
		overlapping_atoms: true,
		overlapping_bonds: true,
		rgroups: true,
		chiral: true,
		'3d': true
	}
};

const dumbActions = [
	'UPDATE_CHECK_FORM'
];

export default function checkReducer(state = initState, action) {

	if (dumbActions.includes(action.type)) {
		console.log('checkReducer', action);
		return {
			...state,
			stateForm: Object.assign({}, state.stateForm, action.payload)
		}
	}

	return state;
}
