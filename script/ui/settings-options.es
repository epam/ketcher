export const settings = {
	title: "Settings",
	type: "object",
	required: [],
	properties: {
		resetToSelect: {
			title: "Reset to Select Tool",
			type: "boolean",
			default: false
		},
		// Render
		showValenceWarnings: {
			title: "Show valence warnings",
			type: "boolean",
			default: true
		},
		atomColoring: {
			title: "Atom coloring",
			type: "boolean",
			default: true
		},
		hideChiralFlag: {
			title: "Do not show the Chiral flag",
			type: "boolean",
			default: false
		},
		font: {
			title: "Font",
			type: "string",
			default: '30px Arial'
		},
		fontsz: {
			title: "Font size",
			type: "integer",
			default: 13,
			minimum: 0,
			maximum: 96
		},
		fontszsub: {
			title: "Sub font size",
			type: "integer",
			default: 13,
			minimum: 0,
			maximum: 96
		},
		// Atom
		carbonExplicitly: {
			title: "Display carbon explicitly",
			type: "boolean",
			default: false
		},
		showCharge: {
			title: "Display charge",
			type: "boolean",
			default: true
		},
		showValence: {
			title: "Display valence",
			type: "boolean",
			default: true
		},
		showHydrogenLabels: {
			title: "Show hydrogen labels",
			enum: ['off', 'Hetero', 'Terminal', 'Terminal and Hetero', 'on'],
			default: 'on',
		},
		// Bonds
		aromaticCircle: {
			title: "Aromatic Bonds as circle",
			type: "boolean",
			default: true
		},
		doubleBondWidth: {
			title: "Double bond width",
			type: "integer",
			default: 6,
			minimum: 0,
			maximum: 96
		},
		bondThickness: {
			title: "Bond thickness",
			type: "integer",
			default: 2,
			minimum: 0,
			maximum: 96
		},
		stereoBondWidth: {
			title: "Stereo (Wedge) bond width",
			type: "integer",
			default: 6,
			minimum: 0,
			maximum: 96
		},
		// 3D View
		miewMode: {
			title: "Display mode",
			enum: ['lines', 'balls and sticks', 'licorice'],
			enumNames: ['Lines', 'Balls and Sticks', 'Licorice'],
			default: 'lines'
		},
		miewTheme: {
			title: "Background color",
			enum: ['light', 'dark'],
			enumNames: ['Light', 'Dark'],
			default: 'light'
		},
		miewAtomLabel: {
			title: "Label coloring",
			enum: ['no', 'bright', 'inverse', 'black and white', 'black'],
			enumNames: ['no', 'Bright', 'Inverse', 'Black and White', 'Black'],
			default: 'bright'
		},
		// Debug
		showAtomIds: {
			title: "Show atom Ids",
			type: "boolean",
			default: false
		},
		showBondIds: {
			title: "Show bonds Ids",
			type: "boolean",
			default: false
		},
		showHalfBondIds: {
			title: "Show half bonds Ids",
			type: "boolean",
			default: false
		},
		showLoopIds: {
			title: "Show loop Ids",
			type: "boolean",
			default: false
		},
	}
};
