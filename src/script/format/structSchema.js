const header = {
	title: 'Header',
	type: 'object',
	properties: {
		moleculeName: {
			title: 'Molecule name',
			type: 'string'
		},
		creatorProgram: {
			title: 'Creator program',
			type: 'string'
		},
		comment: {
			title: 'Comment',
			type: 'string'
		}
	}
};

const atom = {
	title: "Atom",
	type: "object",
	required: ["label", 'location'],
	properties: {
		label: {
			title: "Label",
			type: "string",
			maxLength: 3
		},
		mapping: {
			title: 'Atom-atom mapping',
			type: 'integer'
		},
		location: {
			title: 'Location',
			type: 'array',
			items: {
				type: 'float',
				precision: 1
			}
		},
		rgroups: {
			title: 'Rgroups',
			type: 'array',
			items: {
				type: 'integer',
			}
		},
		alias: {
			title: "Alias",
			type: "string"
		},
		charge: {
			title: "Charge",
			type: "integer",
			minimum: -1000,
			maximum: 1000,
			default: 0
		},
		stereoParity: {
			title: "Stereo parity configuration",
			enum: [0, 1, 2, 3],
			enumNames: [
				'none',
				'odd parity',
				'even parity',
				'either parity'
			],
			default: 0
		},
		weight: {
			title: "Atomic weight",
			type: "integer",
			default: 0
		},
		explicitValence: {
			title: "Valence",
			enum: [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
			enumNames: [
				'Not specified', "0", "I", "II", "III",
				"IV", "V", "VI", "VII", "VIII",
				"IX", "X", "XI", "XII"
			],
			default: -1
		},
		isotope: {
			title: "Isotope",
			type: "integer",
			minimum: 0,
			default: 0
		},
		radical: {
			title: "Radical",
			enum: [0, 2, 1, 3],
			enumNames: [
				'Not specified',
				"Monoradical",
				"Diradical (singlet)",
				"Diradical (triplet)"
			],
			default: 0
		},
		ringBondCount: {
			title: "Ring bond count",
			enum: [0, -2, -1, 2, 3, 4],
			enumNames: [
				'', "As drawn",
				"0", "2", "3", "4"
			],
			default: 0
		},
		hCount: {
			title: "H count",
			enum: [-1, 0, 1, 2, 3, 4, 5],
			enumNames: [
				"Zero", 'Not specified', "H0", "H1", "H2", "H3", "H4"
			],
			default: 0
		},
		substitutionCount: {
			title: "Substitution count",
			enum: [0, -2, -1, 1, 2, 3, 4, 5, 6],
			enumNames: [
				'Not specified', "As drawn",
				"0", "1", "2", "3", "4", "5", "6"
			],
			default: 0
		},
		unsaturatedAtom: {
			title: "Unsaturated",
			type: "boolean",
			default: false
		},
		invRet: {
			title: "Inversion",
			enum: [0, 1, 2],
			enumNames: [
				'',
				"Inverts",
				"Retains"
			],
			default: 0
		},
		exactChangeFlag: {
			title: "Exact change",
			type: "boolean",
			default: false
		},
		attachmentPoints: {
			title: "Rgroup attachment points",
			enum: [-1, 1, 2],
			enumNames: [
				'First and second site',
				'First site only',
				'Second site only'
			],
			default: -1
		}
	}
};

const bond = {
	title: "Bond",
	type: "object",
	required: ['atoms'],
	properties: {
		type: {
			title: "Type",
			enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
			enumNames: [
				"Single",
				"Single Up",
				"Single Down",
				"Single Up/Down",
				"Double",
				"Double Cis/Trans",
				"Triple",
				"Aromatic",
				"Any",
				"Single/Double",
				"Single/Aromatic",
				"Double/Aromatic"
			],
			default: 1
		},
		atoms: {
			title: 'Atoms',
			type: 'array',
			minItems: 2,
			maxItems: 2,
			items: {
				type: 'integer'
			}
		},
		stereo: {
			title: 'Bond stereo configuration',
			enum: [0, 1, 2, 3],
			enumNames: ['None', 'Up', 'Either', 'Down'],
			default: 0
		},
		topology: {
			title: "Topology",
			enum: [0, 1, 2],
			enumNames: ["Either", "Ring", "Chain"],
			default: 0
		},
		center: {
			title: "Reacting Center",
			enum: [0, -1, 1, 2, 4, 8, 12], // 5, 9, 13
			enumNames: [
				"Unmarked",
				"Not center",
				"Center",
				"No change",
				"Made/broken",
				"Order changes",
				"Made/broken and changes"
			], // "Order changes" x 3
			default: 0
		},
		stereobox: {
			title: 'Stereo box',
			enum: [0, 1],
			default: 0
		}
	}
};

const structSchema = {
	title: 'Struct',
	type: 'object',
	allOf: [
		{ $ref: '#/header' },
		{
			properties: {
				atoms: {
					title: 'Atoms',
					type: 'array',
					items: { $ref: '#/atom' }
				},
				bonds: {
					title: 'Bonds',
					type: 'array',
					items: { $ref: '#/bond' }
				}
			},
		}
	],

	header: header,
	atom: atom,
	bond: bond
};

module.exports = structSchema;
