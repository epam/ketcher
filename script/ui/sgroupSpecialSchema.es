const radioButtonsSchema =  {
	enum: [
		"Absolute",
		"Relative",
		"Attached"
	],
	default: "Absolute"
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
					fieldName: {
						title: 'Field name',
						enum: ["MDLBG_FRAGMENT_STEREO"],
						default: "MDLBG_FRAGMENT_STEREO"
					},
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
					radiobuttons: radioButtonsSchema
				},
				required: ["fieldName", "fieldValue", "radiobuttons"]
			},
			{
				key: 'FRG_COEFF',
				title: 'MDLBG_FRAGMENT_COEFFICIENT',
				properties: {
					type: { enum: ["DAT"] },
					fieldName: {
						title: "Field name",
						enum: ["MDLBG_FRAGMENT_COEFFICIENT"],
						default: "MDLBG_FRAGMENT_COEFFICIENT"
					},
					fieldValue: {
						title: "Field value",
						type: "string",
						default: "",
						minLength: 1,
						invalidMessage: "Please, specify field name"
					},
					radiobuttons: radioButtonsSchema
				},
				required: ["fieldName", "fieldValue", "radiobuttons"]
			},
			{
				key: 'FRG_CHRG',
				title: 'MDLBG_FRAGMENT_CHARGE',
				properties: {
					type: { enum: ["DAT"] },
					fieldName: {
						title: 'Field name',
						enum: ["MDLBG_FRAGMENT_CHARGE"],
						default: "MDLBG_FRAGMENT_CHARGE"
					},
					fieldValue: {
						title: "Field value",
						type: "string",
						default: "",
						minLength: 1,
						invalidMessage: "Please, specify field name"
					},
					radiobuttons: radioButtonsSchema
				},
				required: ["fieldName", "fieldValue", "radiobuttons"]
			},
			{
				key: 'FRG_RAD',
				title: 'MDLBG_FRAGMENT_RADICALS',
				properties: {
					type: { enum: ["DAT"] },
					fieldName: {
						title: "Field name",
						enum: ["MDLBG_FRAGMENT_RADICALS"],
						default: "MDLBG_FRAGMENT_RADICALS"
					},
					fieldValue: {
						title: "Field value",
						type: "string",
						default: "",
						minLength: 1,
						invalidMessage: "Please, specify field name"
					},
					radiobuttons: radioButtonsSchema
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
					fieldName: {
						title: "Field name",
						enum: ["MDLBG_STEREO_KEY"],
						default: "MDLBG_STEREO_KEY"
					},
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
					radiobuttons: radioButtonsSchema
				},
				required: ["fieldName", "fieldValue", "radiobuttons"]
			},
			{
				key: 'SB_BND',
				title: 'MDLBG_BOND_KEY',
				properties: {
					type: { enum: ["DAT"] },
					fieldName: {
						title: "Field name",
						enum: ["MDLBG_BOND_KEY"],
						default: "MDLBG_BOND_KEY"
					},
					fieldValue: {
						title: "Field value",
						enum: [
							"Value=4"
						],
						default: "Value=4"
					},
					radiobuttons: radioButtonsSchema
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
					fieldName: {
						title: "Field name",
						enum: ["MDLBG_STEREO_KEY"],
						default: "MDLBG_STEREO_KEY"
					},
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
					radiobuttons: radioButtonsSchema
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
					fieldName: {
						title: "Field name",
						enum: ["MDLBG_STEREO_KEY"],
						default: "MDLBG_STEREO_KEY"
					},
					fieldValue: {
						title: "Field value",
						enum: [
							"cis",
							"trans"
						],
						default: "cis"
					},
					radiobuttons: radioButtonsSchema
				},
				required: ["fieldName", "fieldValue", "radiobuttons"]
			}
		]
	}
};
