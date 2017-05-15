export function createNamedFormReducer(storeName = '') {
	return function formReducer(state = {}, action) {

		if (action.type !== `UPDATE_${storeName.toUpperCase()}_FORM`) {
			return state;
		}

		return Object.assign({}, state, action.payload);
	}
}
