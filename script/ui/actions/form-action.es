const dumpTypes = {
	atom: 'UPDATE_ATOM_FORM'
};

export function updateFormState(storeName, data) {
	return {
		type: dumpTypes[storeName],
		payload: {
			stateForm: data
		}
	};
}
