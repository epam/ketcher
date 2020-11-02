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

import Pool from '../../util/pool';
import Pile from '../../util/pile';

function SGroupForest(molecule) {
	this.parent = new Pool(); // child id -> parent id
	this.children = new Pool(); // parent id -> list of child ids
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

/**
 * @returns { Map< number, Pile<number> > }
 */
SGroupForest.prototype.getAtomSets = function () {
	const map = new Map();
	this.molecule.sgroups.forEach((sg, sgid) => {
		map.set(sgid, new Pile(sg.atoms));
	});
	return map;
};

/**
 * @param newId { number }
 * @param atoms { Pile<number> }
 * @returns { { children, parent: number } }
 */
SGroupForest.prototype.getAtomSetRelations = function (newId, atoms) {
	// find the lowest superset in the hierarchy
	const isStrictSuperset = new Map();
	const isSubset = new Map();
	const atomSets = this.getAtomSets();

	atomSets.delete(newId);

	atomSets.forEach((atomSet, id) => {
		isSubset.set(id, atomSet.isSuperset(atoms));
		isStrictSuperset.set(id, atoms.isSuperset(atomSet) && !atomSet.equals(atoms));
	});

	const parents = Array.from(atomSets.keys())
		.filter((sgid) => {
			if (!isSubset.get(sgid))
				return false;
			return this.children.get(sgid).findIndex(childId => isSubset.get(childId)) < 0;
		});

	const children = Array.from(atomSets.keys())
		.filter(id => isStrictSuperset.get(id) && !isStrictSuperset.get(this.parent.get(id)));

	return {
		children,
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
	const atomSets = this.getAtomSets();

	this.molecule.sgroups.forEach((sg, sgid) => {
		this.getPathToRoot(sgid); // this will throw an exception if there is a loop in the path to root
	});

	let valid = true;
	// 1) child group's atom set is a subset of the parent one's
	this.parent.forEach((parentId, id) => {
		if (parentId >= 0 && !atomSets.get(parentId).isSuperset(atomSets.get(id)))
			valid = false;
	});

	// 2) siblings have disjoint atom sets
	this.children.forEach((list) => {
		for (let i = 0; i < list.length; ++i) {
			for (let j = i + 1; j < list.length; ++j) {
				const id1 = list[i];
				const id2 = list[j];
				const sg1 = this.molecule.sgroups.get(id1);
				const sg2 = this.molecule.sgroups.get(id2);

				if (atomSets.get(id1).intersection(atomSets.get(id2)).size !== 0 && sg1.type !== 'DAT' && sg2.type !== 'DAT')
					valid = false;
			}
		}
	});
	return valid;
};

SGroupForest.prototype.insert = function (id, parent /* int, optional */, children /* [int], optional */) {
	console.assert(!this.parent.has(id), 'sgid already present in the forest');
	console.assert(!this.children.has(id), 'sgid already present in the forest');
	console.assert(this.validate(), 's-group forest invalid');

	var atoms = new Pile(this.molecule.sgroups.get(id).atoms);
	if (!parent || !children) { // if these are not provided, deduce automatically
		var guess = this.getAtomSetRelations(id, atoms);
		parent = guess.parent;
		children = guess.children;
	}

	// TODO: make children Map<int, Pile> instead of Map<int, []>?
	children.forEach((childId) => { // reset parent links
		var childs = this.children.get(this.parent.get(childId));
		var i = childs.indexOf(childId);
		console.assert(i >= 0 && childs.indexOf(childId, i + 1) < 0, 'Assertion failed'); // one element
		childs.splice(i, 1);
		this.parent.set(childId, id);
	});
	this.children.set(id, children);
	this.parent.set(id, parent);
	this.children.get(parent).push(id);
	console.assert(this.validate(), 's-group forest invalid');
	return { parent, children };
};

SGroupForest.prototype.remove = function (id) {
	console.assert(this.parent.has(id), 'sgid is not in the forest');
	console.assert(this.children.has(id), 'sgid is not in the forest');
	console.assert(this.validate(), 's-group forest invalid');

	var parentId = this.parent.get(id);
	this.children.get(id).forEach((childId) => { // reset parent links
		this.parent.set(childId, parentId);
		this.children.get(parentId).push(childId);
	});

	var childs = this.children.get(parentId);
	var i = childs.indexOf(id);
	console.assert(i >= 0 && childs.indexOf(id, i + 1) < 0, 'Assertion failed'); // one element
	childs.splice(i, 1);

	this.children.delete(id);
	this.parent.delete(id);
	console.assert(this.validate(), 's-group forest invalid');
};

export default SGroupForest;
