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
