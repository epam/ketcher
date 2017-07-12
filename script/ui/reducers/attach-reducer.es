const initState = {
	name: '',
	atomid: 0,
	bondid: 0
};

const dumbActions = [
	'INIT_ATTACH',
	'SET_ATTACH_POINTS',
	'SET_TMPL_NAME'
];

export default function attachReducer(state = initState, action) {

	if (dumbActions.includes(action.type)) {
		return Object.assign({}, state, action.payload);
	}

	return state;
}
