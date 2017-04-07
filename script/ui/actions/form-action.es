const dumpTypes = {
	'attach-points': 'UPDATE_ATTACH_POINTS_FORM',
	atom: 'UPDATE_ATOM_FORM',
	automap: 'UPDATE_AUTOMAP_FORM',
	bond: 'UPDATE_BOND_FORM',
	check: 'UPDATE_CHECK_FORM',
	'rgroup-logic': 'UPDATE_RGROUP_LOGIC_FORM',
	settings: 'UPDATE_SETTINGS_FORM',
	sgroup: 'UPDATE_SGROUP_FORM'
};

export function updateFormState(storeName, data) {
	return {
		type: dumpTypes[storeName],
		payload: {
			stateForm: data
		}
	};
}
