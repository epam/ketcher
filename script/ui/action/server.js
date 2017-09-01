/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

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
