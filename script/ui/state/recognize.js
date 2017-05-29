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

export function setStruct(str) {
	return {
		type: 'SET_RECOGNIZE_STRUCT',
		payload: { structStr: str }
	};
}

export function changeImage(file) {
	return {
		type: 'CHANGE_RECOGNIZE_FILE',
		payload: {
			file: file,
			structStr: null
		}
	};
}

export function shouldFragment(isFrag) {
	return {
		type: 'IS_FRAGMENT_RECOGNIZE',
		payload: { fragment: isFrag }
	};
}

export default function recognizeReducer(state = initState, action) {

	if (dumbActions.includes(action.type)) {
		console.log('recognizeReducer', action);
		return Object.assign({}, state, action.payload)
	}

	return state;
}
