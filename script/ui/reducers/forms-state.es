import { defaultOpts } from '../actions/settings-action.es';

export default {
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
};
