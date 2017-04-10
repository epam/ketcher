const initState = {
	file: null,
	structStr: null,
	fragment: false
};

const dumbActions = [
	'SET_RECOGNIZE_STRUCT',
	'CHANGE_RECOGNIZE_FILE',
	'IS_FRAGMENT_RECOGNIZE'
];

export default function recognizeReducer(state = initState, action) {

	if (dumbActions.includes(action.type)) {
		console.log('recognizeReducer', action);
		return Object.assign({}, state, action.payload);
	}

	return state;
}
