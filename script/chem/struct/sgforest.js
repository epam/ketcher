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

var Map = require('../../util/map');

function SGroupForest(molecule) {
	this.parent = new Map(); // child id -> parent id
	this.children = new Map(); // parent id -> list of child ids
	this.children.set(-1, []); // extra root node
	this.molecule = molecule;
}

// returns an array or s-group ids in the order of breadth-first search
SGroupForest.prototype.getSGroupsBFS = function () {
	var order = [];
	var id = -1;
	var queue = [].slice.call(this.children.get(-1));
	while (queue.length > 0) {
		id = queue.shift();
		queue = queue.concat(this.children.get(id));
		order.push(id);
	}
	return order;
};

SGroupForest.prototype.getAtomSets = function () {
	return Array.from(this.molecule.sgroups, (sgid, sgroup) => new Set(sgroup.atoms));
};

/**
 * @param newId { number }
 * @param atoms { Set<number> }
 * @returns { { children, parent: number } }
 */
SGroupForest.prototype.getAtomSetRelations = function (newId, atoms) {
	// find the lowest superset in the hierarchy
	var isStrictSuperset = new Map();
	var isSubset = new Map();
	var atomSets = this.getAtomSets();

	console.error('atomset', atomSets);

	atomSets.unset(newId);

	atomSets.each((id, atomSet) => {
		isSubset.set(id, atomSet.isSuperset(atoms));
		isStrictSuperset.set(id, atoms.isSuperset(atomSet) && !atomSet.equals(atoms));
	});

	var parents = atomSets.findAll((id) => {
		if (!isSubset.get(id))
			return false;

		if (this.children.get(id).findIndex(childId => isSubset.get(childId)) >= 0)
			return false;

		return true;
	});

	console.assert(parents.length <= 1, "We are here"); // there should be only one parent

	var children = atomSets
		.findAll(id => isStrictSuperset.get(id) && !isStrictSuperset.get(this.parent.get(id)));

	return {
		children: children,
		parent: parents.length === 0 ? -1 : parents[0]
	};
};

SGroupForest.prototype.getPathToRoot = function (sgid) {
	var path = [];
	for (var id = sgid; id >= 0; id = this.parent.get(id)) {
		console.assert(path.indexOf(id) < 0, 'SGroupForest: loop detected');
		path.push(id);
	}
	return path;
};

SGroupForest.prototype.validate = function () {
	var atomSets = this.getAtomSets();
	this.molecule.sgroups.each(function (id) {
		this.getPathToRoot(id); // this will throw an exception if there is a loop in the path to root
	}, this);

	var valid = true;
	// 1) child group's atom set is a subset of the parent one's
	this.parent.each(function (id, parentId) {
		if (parentId >= 0 && !atomSets.get(parentId).isSuperset(atomSets.get(id)))
			valid = false;
	}, this);

	// 2) siblings have disjoint atom sets
	this.children.each(function (parentId) {
		var list = this.children.get(parentId);
		for (var i = 0; i < list.length; ++i) {
			for (var j = i + 1; j < list.length; ++j) {
				var id1 = list[i];
				var id2 = list[j];
				var sg1 = this.molecule.sgroups.get(id1);
				var sg2 = this.molecule.sgroups.get(id2);
				if (atomSets.get(id1).intersection(atomSets.get(id2)).size !== 0 && sg1.type !== 'DAT' && sg2.type !== 'DAT')
					valid = false;
			}
		}
	}, this);
	return valid;
};

SGroupForest.prototype.insert = function (id, parent /* int, optional */, children /* [int], optional */) {
	console.assert(!this.parent.has(id), 'sgid already present in the forest');
	console.assert(!this.children.has(id), 'sgid already present in the forest');
	console.assert(this.validate(), 's-group forest invalid');

	var atomSets = this.getAtomSets();
	var atoms = new Set(this.molecule.sgroups.get(id).atoms);
	if (!parent || !children) { // if these are not provided, deduce automatically
		var guess = this.getAtomSetRelations(id, atoms, atomSets);
		parent = guess.parent;
		children = guess.children;
	}

	// TODO: make children Map<int, Set> instead of Map<int, []>?
	children.forEach(function (childId) { // reset parent links
		var childs = this.children.get(this.parent.get(childId));
		var i = childs.indexOf(childId);
		console.assert(i >= 0 && childs.indexOf(childId, i + 1) < 0, 'Assertion failed'); // one element
		childs.splice(i, 1);
		this.parent.set(childId, id);
	}, this);
	this.children.set(id, children);
	this.parent.set(id, parent);
	this.children.get(parent).push(id);
	console.assert(this.validate(), 's-group forest invalid');
	return { parent: parent, children: children };
};

SGroupForest.prototype.remove = function (id) {
	console.assert(this.parent.has(id), 'sgid is not in the forest');
	console.assert(this.children.has(id), 'sgid is not in the forest');
	console.assert(this.validate(), 's-group forest invalid');

	var parentId = this.parent.get(id);
	this.children.get(id).forEach(function (childId) { // reset parent links
		this.parent.set(childId, parentId);
		this.children.get(parentId).push(childId);
	}, this);

	var childs = this.children.get(parentId);
	var i = childs.indexOf(id);
	console.assert(i >= 0 && childs.indexOf(id, i + 1) < 0, 'Assertion failed'); // one element
	childs.splice(i, 1);

	this.children.unset(id);
	this.parent.unset(id);
	console.assert(this.validate(), 's-group forest invalid');
};

module.exports = SGroupForest;
