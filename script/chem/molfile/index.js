/****************************************************************************
 * Copyright 2017 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
