/****************************************************************************
 * Copyright 2018 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { getDefaultOptions } from '../../data/schema/options-schema';
import { initSdata, sdataReducer } from './sdata';

export const formsState = { // TODO: create from schema.{smth}.defaultValue
	atomProps: {
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
	},
	attachmentPoints: {
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
			mode: 'discard'
		}
	},
	bondProps: {
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
		moleculeErrors: {}
	},
	labelEdit: {
		errors: {},
		valid: true,
		result: {
			label: ''
		}
	},
	rgroup: {
		errors: {},
		valid: true,
		result: {
			values: []
		}
	},
	rgroupLogic: {
		errors: {},
		valid: true,
		result: {
			ifthen: 0,
			range: '>0',
			resth: false
		}
	},
	save: {
		errors: {},
		valid: true,
		result: {
			filename: 'ketcher',
			format: 'mol'
		}
	},
	settings: {
		errors: {},
		valid: true,
		result: getDefaultOptions()
	},
	sgroup: {
		errors: {},
		valid: true,
		result: {
			type: 'GEN'
		}
	},
	sdata: initSdata()
};

export function updateFormState(data) {
	return {
		type: 'UPDATE_FORM',
		data
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
			result: getDefaultOptions(),
			valid: true,
			errors: {}
		}
	};
}

export function formReducer(state, action, formName) {
	if (formName === 'sdata')
		return sdataReducer(state, action);

	return Object.assign({}, state, action.data);
}
