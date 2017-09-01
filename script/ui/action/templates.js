/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

import templates from '../data/templates';

const templateLib = {
	"template-lib": {
		shortcut: "Shift+t",
		title: "Custom Templates",
		action: { dialog: 'templates' },
		disabled: (editor, server, options) => !options.app.templates
	}
};

export default templates.reduce((res, struct, i) => {
	res[`template-${i}`] = {
		title: `${struct.name}`,
		shortcut: 't',
		action: {
			tool: 'template',
			opts: { struct }
		}
	};
	return res;
}, templateLib);

