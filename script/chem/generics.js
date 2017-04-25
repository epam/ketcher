var generics = {
	atom: {
		'any': {
			labels: ['A', 'AH']
		},
		'no-carbon': {
			labels: ['Q', 'QH']
		},
		'metal': {
			labels: ['M', 'MH']
		},
		'halogen': {
			labels: ['X', 'XH']
		}
	},
	group: {
		labels: ['G', 'GH', 'G*', 'GH*'],
		acyclic: {
			labels: ['ACY', 'ACH'],
			carbo: {
				labels: ['ABC', 'ABH'],
				alkynyl: {
					labels: ['AYL', 'AYH']
				},
				alkyl: {
					labels: ['ALK', 'ALH']
				},
				alkenyl: {
					labels: ['AEL', 'AEH']
				}
			},
			hetero: {
				labels: ['AHC', 'AHH'],
				alkoxy: {
					labels: ['AOX', 'AOH']
				}
			}
		},
		cyclic: {
			'labels': ['CYC', 'CYH'],
			'no-carbon': {
				labels: ['CXX', 'CXH']
			},
			'carbo': {
				labels: ['CBC', 'CBH'],
				aryl: {
					labels: ['ARY', 'ARH']
				},
				cycloalkyl: {
					labels: ['CAL', 'CAH']
				},
				cycloalkenyl: {
					labels: ['CEL', 'CEH']
				}
			},
			'hetero': {
				labels: ['CHC', 'CHH'],
				aryl: {
					labels: ['HAR', 'HAH']
				}
			}
		}
	},
	special: {
		labels: ['H+', 'D', 'T', 'R', 'Pol']
	}
};

function mapify(tree, path, res) {
	return Object.keys(tree).reduce(function (res, key) {
		if (key == 'labels') {
			return tree.labels.reduce(function (res, label) {
				res[label] = path || true;
				return res;
			}, res);
		}
		return mapify(tree[key],
		              path ? path.concat(key) : [key], res);
	}, res || {});
}

function traverse(tree, path) {
	return path.reduce(function (res, cur) {
		return (res && res[cur]) || null;
	}, tree);
}

generics.map = mapify(generics);
generics.map['*'] = generics.map['A']; // alias
generics.get = function (path) {
	return mapify(traverse(path));
};

module.exports = generics;
