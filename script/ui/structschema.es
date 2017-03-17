export const atom = {
	title: "Atom",
	type: "object",
	required: "label",
	properties: {
		label: {
			title: "Label",
			type: "string",     // TODO:should really be enum of elements
			maxLength: 3
		},
		alias: {
			title: "Alias",
			type: "string"
		},
		charge: {
			title: "Charge",
			type: "integer",
			minimum: -1000,
			maximum: 1000
		},
		explicitValence: {
			title: "Valency",
			enum: ['', 0, 1, 2, 3, 4, 5, 6, 7, 8],
			enumNames: [
				'', "0", "I", "II", "III",
				"IV", "V", "VI", "VII", "VIII"
			]
		},
		isotope: {
			title: "Isotope",
			type: "string",
			maxLength: 3
		},
		radical: {
			title: "Radical",
			enum: [0, 2, 1, 3],
			enumNames: [
				'',
				"Monoradical",
				"Diradical (singlet)",
				"Diradical (triplet)"
			]
		},
		ringBondCount: {
			title: "Ring bond count",
			enum: [0, -2, -1, 2, 3, 4],
			enumNames: [
				'', "As drawn",
				"0", "2", "3", "4"
			]
		},
		hCount: {
			title: "H count",
			enum: [0, 1, 2, 3, 4, 5],
			enumNames: [
				'', "0", "1", "2", "3", "4"
			]
		},
		substitutionCount: {
			title: "Substitution count",
			enum: [0, -2, -1, 1, 2, 3, 4, 5, 6],
			enumNames: [
				'', "As drawn",
				"0", "1", "2", "3", "4", "5", "6"
			]
		},
		unsaturatedAtom: {
			title: "Unsaturated",
			type: "boolean"
		},
		invRet: {
			title: "Inversion",
			enum: [0, 1, 2],
			enumNames: [
				'',
				"Inverts",
				"Retains"
			]
		},
		exactChangeFlag: {
			title: "Exact change",
			type: "boolean"
		}
	}
};

export const attachmentPoints = {
	title: "Attachment Points",
	type: "object",
	properties: {
		primary: {
			title: "Primary attachment point",
			type: "boolean"
		},
		secondary: {
			title: "Secondary attachment point",
			type: "boolean"
		}
	}
};

export const bond = {
	title: "Bond",
	type: "object",
	required: ["type"],
	properties: {
		type: {
			title: "Type",
			enum: [ "single", "up", "down",
			        "updown", "double", "crossed",
			        "triple", "aromatic", "any",
			        "singledouble", "singlearomatic",
			        "doublearomatic"],
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
			]
		},
		topology: {
			title: "Topology",
			enum: [0, 1, 2],
			enumNames: ["Either", "Ring", "Chain"]
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
			] // "Order changes" x 3
		}
	}
};

export const sgroup = {
	title: "SGroup",
	type: "object",
	required: ["type"],
	oneOf: [
		{
			title: "Generic",
			properties: {
				type: { enum: [ 'GEN' ] }
			}
		},
		{
			title: "Multiple group",
			type: "object",
			properties: {
				type: { enum: [ "MUL" ] },
				mul: {
					title: "Repeat count",
					type: "integer",
					default: 1,
					minimum: 1,
					maximum: 1000
				}
			},
			required: ["mul"]
		},
		{
			title: "SRU polymer",
			properties: {
				type: { enum: [ "SRU" ] },
				subscript: {
					title: "Polymer label",
					type: "string",
					default: "n",
					pattern: "^[a-zA-Z]$",
					invalidMessage: "SRU subscript should consist of a single letter"
				},
				connectivity: {
					type: "string",
					enum: ["ht", "hh", "eu"],
					enumNames: [
						'Head-to-tail',
						'Head-to-head',
						'Either unknown'
					],
					default: "ht"
				}
			},
			required: ["subscript", "connectivity"]
		},
		{
			title: 'Superatom',
			properties: {
				type: { enum: [ "SUP" ] },
				name: {
					title: "Name",
					type: "string",
					default: "",
					minLength: 1,
					invalidMessage: "Please, provide a name for the superatom"
				}
			}
		},
		{
			title: "Data",
			properties: {
				type: { enum: [ "DAT" ] },
				fieldName: {
					type: "string",
					default: "",
					minLength: 1,
					invalidMessage: "Please, specify field name"
				},
				fieldValue: {
					type: "string",
					default: "",
					minLength: 1,
					invalidMessage: "Please, specify field value"
				},
				attached: {
					type: "boolean",
					default: false
				},
				absolute: {
					type: "boolean",
					default: true
				}
			},
			required: ["fieldName", "fieldValue",
			           "attached", "absolute"]
		}
	]
};

export const rgroup = {
	title: "R-Group",
	type: "object",
	properties: {
		range: {
			title: "Occurrence",
			type: "string",
			maxLength: 50
		},
		resth: {
			title: "RestH",
			type: "boolean"
		},
		ifthen: {
			title: "Condition",
			type: "integer",
			minium: 0
		}
	}
};
