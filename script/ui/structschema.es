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
			maximum: 1000,
			default: 0
		},
		explicitValence: {
			title: "Valence",
			enum: [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8],
			enumNames: [
				'', "0", "I", "II", "III",
				"IV", "V", "VI", "VII", "VIII"
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
				'',
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
			enum: [0, 1, 2, 3, 4, 5],
			enumNames: [
				'', "0", "1", "2", "3", "4"
			],
			default: 0
		},
		substitutionCount: {
			title: "Substitution count",
			enum: [0, -2, -1, 1, 2, 3, 4, 5, 6],
			enumNames: [
				'', "As drawn",
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
			enum: ["single", "up", "down",
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
			],
			default: "single"
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
		}
	}
};

export const sgroup = {
	title: "SGroup",
	type: "object",
	required: ["type"],
	oneOf: [
		{
			key: 'GEN',
			title: "Generic",
			properties: {
				type: { enum: ['GEN'] }
			}
		},
		{
			key: 'MUL',
			title: "Multiple group",
			type: "object",
			properties: {
				type: { enum: ["MUL"] },
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
			key: 'SRU',
			title: "SRU polymer",
			properties: {
				type: { enum: ["SRU"] },
				subscript: {
					title: "Polymer label",
					type: "string",
					default: "n",
					pattern: "^[a-zA-Z]$",
					invalidMessage: "SRU subscript should consist of a single letter"
				},
				connectivity: {
					title: 'Repeat Pattern',
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
			key: 'SUP',
			title: 'Superatom',
			properties: {
				type: { enum: ["SUP"] },
				name: {
					title: "Name",
					type: "string",
					default: "",
					minLength: 1,
					invalidMessage: "Please, provide a name for the superatom"
				}
			}
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

export const sgroupSpecial = {
	Fragment: {
		title: 'Context',
		type: 'Object',
		oneOf: [
			{
				key: 'FRG_STR',
				title: 'MDLBG_FRAGMENT_STEREO',
				properties: {
					type: { enum: ["DAT"] },
					fieldName: { enum: ["MDLBG_FRAGMENT_STEREO"] },
					fieldValue: {
						title: "Field value",
						enum: [
							"abs",
							"(+)-enantiomer",
							"(-)-enantiomer",
							"racemate",
							"steric",
							"rel",
							"R(a)",
							"S(a)",
							"R(p)",
							"S(p)"
						],
						default: "abs"
					},
					radiobuttons: {
						enum: [
							"Absolute",
							"Relative",
							"Attached"
						],
						default: "Absolute"
					}
				},
				required: ["fieldName", "fieldValue", "radiobuttons"]
			},
			{
				key: 'FRG_COEFF',
				title: 'MDLBG_FRAGMENT_COEFFICIENT',
				properties: {
					type: { enum: ["DAT"] },
					fieldName: { enum: ["MDLBG_FRAGMENT_COEFFICIENT"] },
					fieldValue: {
						title: "Field value",
						type: "string",
						minLength: 1,
						default: ""
					},
					radiobuttons: {
						enum: [
							"Absolute",
							"Relative",
							"Attached"
						],
						default: "Absolute"
					}
				},
				required: ["fieldName", "fieldValue", "radiobuttons"]
			},
			{
				key: 'FRG_CHRG',
				title: 'MDLBG_FRAGMENT_CHARGE',
				properties: {
					type: { enum: ["DAT"] },
					fieldName: { enum: ["MDLBG_FRAGMENT_CHARGE"] },
					fieldValue: {
						title: "Field value",
						type: "string",
						minLength: 1,
						default: ""
					},
					radiobuttons: {
						enum: [
							"Absolute",
							"Relative",
							"Attached"
						],
						default: "Absolute"
					}
				},
				required: ["fieldName", "fieldValue", "radiobuttons"]
			},
			{
				key: 'FRG_RAD',
				title: 'MDLBG_FRAGMENT_RADICALS',
				properties: {
					type: { enum: ["DAT"] },
					fieldName: { enum: ["MDLBG_FRAGMENT_RADICALS"] },
					fieldValue: {
						title: "Field value",
						type: "string",
						minLength: 1,
						default: ""
					},
					radiobuttons: {
						enum: [
							"Absolute",
							"Relative",
							"Attached"
						],
						default: "Absolute"
					}
				},
				required: ["fieldName", "fieldValue", "radiobuttons"]
			},
		]
	},
	"Single Bond": {
		title: 'Context',
		type: 'Object',
		oneOf: [
			{
				key: 'SB_STR',
				title: 'MDLBG_STEREO_KEY',
				properties: {
					type: { enum: ["DAT"] },
					fieldName: { enum: ["MDLBG_STEREO_KEY"] },
					fieldValue: {
						title: "Field value",
						enum: [
							"erythro",
							"threo",
							"alpha",
							"beta",
							"endo",
							"exo",
							"anti",
							"syn",
							"ECL",
							"STG"
						],
						default: "erythro"
					},
					radiobuttons: {
						enum: [
							"Absolute",
							"Relative",
							"Attached"
						],
						default: "Absolute"
					}
				},
				required: ["fieldName", "fieldValue", "radiobuttons"]
			},
			{
				key: 'SB_BND',
				title: 'MDLBG_BOND_KEY',
				properties: {
					type: { enum: ["DAT"] },
					fieldName: { enum: ["MDLBG_BOND_KEY"] },
					fieldValue: {
						title: "Field value",
						enum: [
							"Value=4"
						],
						default: "Value=4"
					},
					radiobuttons: {
						enum: [
							"Absolute",
							"Relative",
							"Attached"
						],
						default: "Absolute"
					}
				},
				required: ["fieldName", "fieldValue", "radiobuttons"]
			}
		]
	},
	Atom: {
		title: 'Context',
		type: 'Object',
		oneOf: [
			{
				key: 'AT_STR',
				title: 'MDLBG_STEREO_KEY',
				properties: {
					type: { enum: ["DAT"] },
					fieldName: { enum: ["MDLBG_STEREO_KEY"] },
					fieldValue: {
						title: "Field value",
						enum: [
							"RS",
							"SR",
							"P-3",
							"P-3-PI",
							"SP-4",
							"SP-4-PI",
							"T-4",
							"T-4-PI",
							"SP-5",
							"SP-5-PI",
							"TB-5",
							"TB-5-PI",
							"OC-6",
							"TP-6",
							"PB-7",
							"CU-8",
							"SA-8",
							"DD-8",
							"HB-9",
							"TPS-9"
						],
						default: "RS"
					},
					radiobuttons: {
						enum: [
							"Absolute",
							"Relative",
							"Attached"
						],
						default: "Absolute"
					}
				},
				required: ["fieldName", "fieldValue", "radiobuttons"]
			}
		]
	},
	Group: {
		title: 'Context',
		type: 'Object',
		oneOf: [
			{
				key: 'GRP_STR',
				title: 'MDLBG_STEREO_KEY',
				properties: {
					type: { enum: ["DAT"] },
					fieldName: { enum: ["MDLBG_STEREO_KEY"] },
					fieldValue: {
						title: "Field value",
						enum: [
							"cis",
							"trans"
						],
						default: "cis"
					},
					radiobuttons: {
						enum: [
							"Absolute",
							"Relative",
							"Attached"
						],
						default: "Absolute"
					}
				},
				required: ["fieldName", "fieldValue", "radiobuttons"]
			}
		]
	}
};
