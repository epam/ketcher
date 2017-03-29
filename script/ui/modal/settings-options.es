export const settings = {
	title: "Settings",
	type: "object",
	required: [],
	properties: {
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
		// 3D View
		miewMode: {
			title: "Display mode",
			enum: ['lines', 'balls and sticks', 'licorice'],
			enumNames: ['Lines', 'Balls and Sticks', 'Licorice'],
			default: 'lines'
		}
	}
};
