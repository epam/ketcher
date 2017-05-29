export const defaultOpts = {
	'atom': {
		errors: {},
		valid: true,
		stateForm: {
			label: '',
			charge: 0,
			explicitValence: -1,
			hCount: 0,
			invRet: 0,
			isotope: 0,
			radical: 0,
			ringBondCount: 0,
			substitutionCount: 0
		}
	} ,
	'attach-points': {
		errors: {},
		valid: true,
		stateForm: {
			primary: false,
			secondary: false
		}
	},
	automap: {
		errors: {},
		valid: true,
		stateForm: {
			mode: "discard"
		}
	},
	bond: {
		errors: {},
		valid: true,
		stateForm: {
			type: 'single',
			topology: 0,
			center: 0
		}
	},
	check: {
		errors: {},
		moleculeErrors: {},
		stateForm: {
			checkOptions: ['valence', 'radicals', 'pseudoatoms', 'stereo', 'query', 'overlapping_atoms',
				'overlapping_bonds', 'rgroups', 'chiral', '3d']
		}
	},
	'label-edit': {
		errors: {},
		valid: true,
		stateForm: {
			label: '',
		}
	},
	'rgroup-logic': {
		errors: {},
		valid: true,
		stateForm: {
			ifthen: 0,
			range: '>0',
			resth: false
		}
	},
	settings: {
		errors: {},
		valid: true,
		stateForm: JSON.parse(localStorage.getItem("ketcher-opts")) || defaultOpts()
	},
	sgroup: {
		errors: {},
		valid: true,
		stateForm: {
			type: 'GEN'
		}
	}
}

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


export function createNamedFormReducer(storeName = '') {
	return function formReducer(state = {}, action) {

		if (action.type !== `UPDATE_${storeName.toUpperCase()}_FORM`) {
			return state;
		}

		return Object.assign({}, state, action.payload);
	}
}
