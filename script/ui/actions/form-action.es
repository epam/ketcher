const dumpTypes = {
	'attach-points': 'UPDATE_ATTACH_POINTS_FORM',
	atom: 'UPDATE_ATOM_FORM',
	automap: 'UPDATE_AUTOMAP_FORM',
	bond: 'UPDATE_BOND_FORM',
	check: 'UPDATE_CHECK_FORM',
	'label-edit': 'UPDATE_LABEL_EDIT_FORM',
	'rgroup-logic': 'UPDATE_RGROUP_LOGIC_FORM',
	settings: 'UPDATE_SETTINGS_FORM',
	sgroup: 'UPDATE_SGROUP_FORM',
	sgroupSpecial: 'UPDATE_SGROUPSPEC_FORM'
};

export function setInitState(data) {
	return {
		type: 'SET_SGROUPSPEC_INIT_STATE',
		payload: data
	}
}

export function updateFormState(storeName, data) {
	console.info('upate!!!');
	return {
		type: dumpTypes[storeName],
		payload: data
	};
}
