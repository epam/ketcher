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

/* eslint-env node */

var fs = require('fs');
var path = require('path');

var minimist = require('minimist');

var options = minimist(process.argv.slice(2), {
	string: ['fixtures'],
	default: {
		fixtures: 'fixtures'
	}
});

function collect(items, base) {
	var res = [];
	var structfiles = [];
	for (var fn of items) {
		var fpath = path.join(base || '', fn);
		if (fs.statSync(fpath).isDirectory())
			res = res.concat(collect(fs.readdirSync(fpath), fpath));
		else if (path.extname(fn) == '.sdf')
			res.push(sdfCollect(fpath));
		else if (!!base && ['.mol', '.rxn'].indexOf(path.extname(fn)) != -1)
			structfiles.push(fn);
	}
	if (structfiles.length > 0) {
		res.push({
			name: path.basename(base),
			path: base,
			type: 'folder',
			files: structfiles
		});
	}
	return res;
}

function sdfCollect(fpath) {
	var data = fs.readFileSync(fpath, 'utf8');
	return {
		name: path.basename(fpath),
		path: fpath,
		type: 'sdf',
		count: data.split(/\$\$\$\$/).length
	};
}

function* iterate(col) {
	if (col.type == 'folder') {
		for (var fn of col.files) {
			yield {
				name: fn,
				data: fs.readFileSync(path.join(col.path, fn), 'utf8')
			};
		}
	} else {
		var sdf = fs.readFileSync(col.path, 'utf8');
		var re = /^\$\$\$\$\n/gm;
		for (var m, i, num = 0; i = re.lastIndex, m = re.exec(sdf); num++) {
			yield {
				name: num,
				data: sdf.slice(i, m.index)
			};
		}
	}
}

function range(n, start) {
	start = start || 0;
	return Array.apply(null, {
		length: n - start
	}).map((_, i) => i + start);
}

function collection(collections, name) {
	var col = collections.find(c => c.name == name);
	return Object.assign(iterate(col), col.type == 'folder' ? {
		names: () => col.files,
		fixture: id => fs.readFileSync(path.join(col.path, id), 'utf8')
	} : {
		names: () => range(col.count - 1),
		fixture: id => {
			var data = fs.readFileSync(col.path, 'utf8');
			return data.split(/\$\$\$\$/m, id + 1)[id - 0].trim();
		}
	});
}

module.exports = function (colPath) {
	if (!colPath) colPath = path.join('test/', options.fixtures);
	var cols = collect(Array.isArray(colPath) ? colPath : [colPath]);
	return Object.assign(collection.bind(null, cols), {
		names: () => cols.map(c => c.name)
	});
};
