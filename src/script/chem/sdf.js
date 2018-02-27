/****************************************************************************
 * Copyright 2018 EPAM Systems
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

import molfile from './molfile';

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
			item.props = propChunks.reduce((props, pc) => {
				var m = pc.match(/^> [ \d]*<(\S+)>/);
				if (m) {
					var field = m[1];
					var value = pc.split('\n')[1].trim();
					props[field] = isFinite(value) ? +value : value; // eslint-disable-line
				}
				return props;
			}, {});

			result.push(item);
		}
	}
	return result;
}

function stringify(items, options) {
	return items.reduce((res, item) => {
		res += molfile.stringify(item.struct, options);

		Object.keys(item.props).forEach((prop) => {
			res += '> <' + prop + '>\n';
			res += item.props[prop] + '\n\n';
		});

		return res + '\$\$\$\$';
	}, '');
}

export default {
	stringify,
	parse
};
