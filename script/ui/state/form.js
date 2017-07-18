import { defaultOpts } from './options';
import { initSdata, sgroupSpecialReducer } from './sdata';

export const formsState = {
	'atom': {
		errors: {},
		valid: true,
		result: {
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
		result: {
			primary: false,
			secondary: false
		}
	},
	automap: {
		errors: {},
		valid: true,
		result: {
			mode: "discard"
		}
	},
	bond: {
		errors: {},
		valid: true,
		result: {
			type: 'single',
			topology: 0,
			center: 0
		}
	},
	check: {
		errors: {},
		moleculeErrors: {},
		result: {
			checkOptions: ['valence', 'radicals', 'pseudoatoms', 'stereo', 'query', 'overlapping_atoms',
				'overlapping_bonds', 'rgroups', 'chiral', '3d']
		}
	},
	'label-edit': {
		errors: {},
		valid: true,
		result: {
			label: '',
		}
	},
	'rgroup-logic': {
		errors: {},
		valid: true,
		result: {
			ifthen: 0,
			range: '>0',
			resth: false
		}
	},
	settings: {
		errors: {},
		valid: true,
		result: Object.assign(defaultOpts(), JSON.parse(localStorage.getItem("ketcher-opts")))
	},
	sgroup: {
		errors: {},
		valid: true,
		result: {
			type: 'GEN'
		}
	},
	'sgroup-data': initSdata()
};

export function updateFormState(data) {
	return {
		type: 'UPDATE_FORM',
		data: data
	};
}

export function checkErrors(errors) {
	return {
		type: 'UPDATE_FORM',
		data: { moleculeErrors: errors }
	};
}

export function setDefaultSettings() {
	return {
		type: 'UPDATE_FORM',
		data: {
			result: defaultOpts(),
			valid: true,
			errors: {}
		}
	};
}

export function formReducer(state, action, formName) {

	if (formName === 'sgroup-data')
		return sgroupSpecialReducer(state, action);

	return Object.assign({}, state, action.data);
}
