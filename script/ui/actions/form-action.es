const dumpTypes = {
	'attach-points': 'UPDATE_ATTACH-POINTS_FORM',
	atom: 'UPDATE_ATOM_FORM',
	automap: 'UPDATE_AUTOMAP_FORM',
	bond: 'UPDATE_BOND_FORM',
	check: 'UPDATE_CHECK_FORM',
	'label-edit': 'UPDATE_LABEL-EDIT_FORM',
	'rgroup-logic': 'UPDATE_RGROUP-LOGIC_FORM',
	settings: 'UPDATE_SETTINGS_FORM',
	sgroup: 'UPDATE_SGROUP_FORM',
	sgroupSpecial: 'UPDATE_SGROUPSPEC_FORM'
};

export function updateFormState(storeName, data) {
	return {
		type: dumpTypes[storeName],
		payload: data
	};
}
