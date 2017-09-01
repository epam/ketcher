/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

var molfile = require('./molfile');

function parse(str, options) {
	var regexp = /^[^]+?\$\$\$\$$/gm;
	var m, chunk;
	var result = [];
	while ((m = regexp.exec(str)) !== null) {
		chunk = m[0].replace(/\r/g, ''); // TODO: normalize newline?
		chunk = chunk.trim();
		var end = chunk.indexOf('M  END');
		if (end !== -1) {
			var item = {};
			var propChunks = chunk.substr(end + 7).trim().split(/^$\n?/m);

			item.struct = molfile.parse(chunk.substring(0, end + 6), options);
			item.props = propChunks.reduce(function (props, pc) {
				var m = pc.match(/^> [ \d]*<(\S+)>/);
				if (m) {
					var field = m[1];
					var value = pc.split('\n')[1].trim();
					props[field] = value;
				}
				return props;
			}, {});

			result.push(item);
		}
	}
	return result;
}

function stringify(items, options) {
	return items.reduce(function (res, item) {
		res += molfile.stringify(item.struct, options);

		for (var prop in item.props) {
			res += "> <" + prop + ">\n";
			res += item.props[prop] + "\n\n";
		}

		return res + '\$\$\$\$';
	}, '');
}

module.exports = {
	stringify: stringify,
	parse: parse
};
