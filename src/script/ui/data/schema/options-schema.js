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

import jsonschema from 'jsonschema';

const editor = {
	resetToSelect: {
		title: 'Reset to Select Tool',
		enum: [true, 'paste', false],
		enumNames: ['on', 'After Paste', 'off'],
		default: 'paste'
	},
	rotationStep: {
		title: 'Rotation Step, º',
		type: 'integer',
		minimum: 1,
		maximum: 90,
		default: 15
	}
};

const render = {
	showValenceWarnings: {
		title: 'Show valence warnings',
		type: 'boolean',
		default: true
	},
	atomColoring: {
		title: 'Atom coloring',
		type: 'boolean',
		default: true
	},
	hideChiralFlag: {
		title: 'Do not show the Chiral flag',
		type: 'boolean',
		default: false
	},
	font: {
		title: 'Font',
		type: 'string',
		default: '30px Arial'
	},
	fontsz: {
		title: 'Font size',
		type: 'integer',
		default: 13,
		minimum: 1,
		maximum: 96
	},
	fontszsub: {
		title: 'Sub font size',
		type: 'integer',
		default: 13,
		minimum: 1,
		maximum: 96
	},
	// Atom
	carbonExplicitly: {
		title: 'Display carbon explicitly',
		type: 'boolean',
		default: false
	},
	showCharge: {
		title: 'Display charge',
		type: 'boolean',
		default: true
	},
	showValence: {
		title: 'Display valence',
		type: 'boolean',
		default: true
	},
	showHydrogenLabels: {
		title: 'Show hydrogen labels',
		enum: ['off', 'Hetero', 'Terminal', 'Terminal and Hetero', 'on'],
		default: 'on'
	},
	// Bonds
	aromaticCircle: {
		title: 'Aromatic Bonds as circle',
		type: 'boolean',
		default: true
	},
	doubleBondWidth: {
		title: 'Double bond width',
		type: 'integer',
		default: 6,
		minimum: 1,
		maximum: 96
	},
	bondThickness: {
		title: 'Bond thickness',
		type: 'integer',
		default: 2,
		minimum: 1,
		maximum: 96
	},
	stereoBondWidth: {
		title: 'Stereo (Wedge) bond width',
		type: 'integer',
		default: 6,
		minimum: 1,
		maximum: 96
	}
};

const server = {
	'smart-layout': {
		title: 'Smart-layout',
		type: 'boolean',
		default: true
	},
	'ignore-stereochemistry-errors': {
		title: 'Ignore stereochemistry errors',
		type: 'boolean',
		default: true
	},
	'mass-skip-error-on-pseudoatoms': {
		title: 'Ignore pseudoatoms at mass',
		type: 'boolean',
		default: false
	},
	'gross-formula-add-rsites': {
		title: 'Add Rsites at mass calculation',
		type: 'boolean',
		default: true
	},
	'gross-formula-add-isotopes': {
		title: 'Add Isotopes at mass calculation',
		type: 'boolean',
		default: true
	}
};

export const SERVER_OPTIONS = Object.keys(server);

const debug = {
	showAtomIds: {
		title: 'Show atom Ids',
		type: 'boolean',
		default: false
	},
	showBondIds: {
		title: 'Show bonds Ids',
		type: 'boolean',
		default: false
	},
	showHalfBondIds: {
		title: 'Show half bonds Ids',
		type: 'boolean',
		default: false
	},
	showLoopIds: {
		title: 'Show loop Ids',
		type: 'boolean',
		default: false
	}
};

const miew = {
	miewMode: {
		title: 'Display mode',
		enum: ['LN', 'BS', 'LC'],
		enumNames: ['Lines', 'Balls and Sticks', 'Licorice'],
		default: 'LN'
	},
	miewTheme: {
		title: 'Background color',
		enum: ['light', 'dark'],
		enumNames: ['Light', 'Dark'],
		default: 'light'
	},
	miewAtomLabel: {
		title: 'Label coloring',
		enum: ['no', 'bright', 'blackAndWhite', 'black'],
		enumNames: ['No', 'Bright', 'Black and White', 'Black'],
		default: 'bright'
	}
};

export const MIEW_OPTIONS = Object.keys(miew);

const optionsSchema = {
	title: 'Settings',
	type: 'object',
	required: [],
	properties: {
		...editor,
		...render,
		...server,
		...debug,
		...miew
	}
};

export default optionsSchema;

export function getDefaultOptions() {
	return Object.keys(optionsSchema.properties).reduce((res, prop) => {
		res[prop] = optionsSchema.properties[prop].default;
		return res;
	}, {});
}

export function validation(settings) {
	if (typeof settings !== 'object' || settings === null) return null;

	const v = new jsonschema.Validator();
	const { errors } = v.validate(settings, optionsSchema);
	const errProps = errors.map(err => err.property.split('.')[1]);

	return Object.keys(settings).reduce((res, prop) => {
		if (optionsSchema.properties[prop] && errProps.indexOf(prop) === -1)
			res[prop] = settings[prop];
		return res;
	}, {});
}
