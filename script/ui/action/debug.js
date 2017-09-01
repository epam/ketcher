/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

import molfile from '../../chem/molfile';

export default {
	// original: for dev purposes
	"force-update": {
		shortcut: "Ctrl+Shift+r",
		action: editor => {
			editor.update(true);
		}
	},
	"qs-serialize": {
		shortcut: "Alt+Shift+r",
		action: editor => {
			const molStr = molfile.stringify(editor.struct());
			const molQs = 'mol=' + encodeURIComponent(molStr).replace(/%20/g, '+');
			const qs = document.location.search;
			document.location.search = !qs ? '?' + molQs :
				qs.search('mol=') === -1 ? qs + '&' + molQs :
				qs.replace(/mol=[^&$]*/, molQs);
		}
	}
}
