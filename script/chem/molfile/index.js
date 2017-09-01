/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

var Molfile = require('./molfile');

// TODO: reconstruct molfile string instead parsing multiple times
//       merge to bottom
function parseCTFile(str, options) {
	var molfile = new Molfile();
	var lines = str.split(/\r\n|[\n\r]/g);
	try {
		return molfile.parseCTFile(lines);
	} catch (ex) {
		if (options.badHeaderRecover) {
			try {
				// check whether there's an extra empty line on top
				// this often happens when molfile text is pasted into the dialog window
				return molfile.parseCTFile(lines.slice(1));
			} catch (ex1) {	//
			}
			try {
				// check for a missing first line
				// this sometimes happens when pasting
				return molfile.parseCTFile([''].concat(lines));
			} catch (ex2) {	//
			}
		}
		throw ex;
	}
}

module.exports = {
	stringify: function (struct, options) {
		var opts = options || {};
		return new Molfile(opts.v3000).saveMolecule(struct, opts.ignoreErrors,
			opts.noRgroups, opts.preserveIndigoDesc);
	},
	parse: function (str, options) {
		return parseCTFile(str, options || {});
	}
};
