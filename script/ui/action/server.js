import { serverTransform } from '../state/server';

export default {
	"layout": {
		shortcut: "Mod+l",
		title: "Layout",
		action: {
			thunk: serverTransform('layout')
		},
		disabled: (editor, server, options) => !options.app.server
	},
	"clean": {
		shortcut: "Mod+Shift+l",
		title: "Clean Up",
		action: {
			thunk: serverTransform('clean')
		},
		disabled: (editor, server, options) => !options.app.server
	},
	"arom": {
		title: "Aromatize",
		action: {
			thunk: serverTransform('aromatize')
		},
		disabled: (editor, server, options) => !options.app.server
	},
	"dearom": {
		title: "Dearomatize",
		action: {
			thunk: serverTransform('dearomatize')
		},
		disabled: (editor, server, options) => !options.app.server
	},
	"cip": {
		shortcut: "Mod+p",
		title: "Calculate CIP",
		action: {
			thunk: serverTransform('calculateCip')
		},
		disabled: (editor, server, options) => !options.app.server
	}
};
