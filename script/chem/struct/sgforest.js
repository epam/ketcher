var Map = require('../../util/map');
var Set = require('../../util/set');
var util = require('../../util');

function SGroupForest(molecule) {
	this.parent = new Map(); // child id -> parent id
	this.children = new Map(); // parent id -> list of child ids
	this.children.set(-1, []); // extra root node
	this.molecule = molecule;
}

// returns an array or s-group ids in the order of breadth-first search
SGroupForest.prototype.getSGroupsBFS = function () {
	var order = [];
	var queue = [];
	var id = -1;
	queue = [].slice.call(this.children.get(-1));
	while (queue.length > 0) {
		id = queue.shift();
		queue = queue.concat(this.children.get(id));
		order.push(id);
	}
	return order;
};

SGroupForest.prototype.getAtomSets = function () {
	return this.molecule.sgroups.map(function (sgid, sgroup) {
		return Set.fromList(sgroup.atoms);
	});
};

SGroupForest.prototype.getAtomSetRelations = function (newId, atoms /* Set */) {
	// find the lowest superset in the hierarchy
	var isStrictSuperset = new Map();
	var isSubset = new Map();
	var atomSets = this.getAtomSets();
	atomSets.unset(newId);
	atomSets.each(function (id, atomSet) {
		isSubset.set(id, Set.subset(atoms, atomSet));
		isStrictSuperset.set(id, Set.subset(atomSet, atoms) && !Set.eq(atomSet, atoms));
	}, this);
	var parents = atomSets.findAll(function (id) {
		if (!isSubset.get(id))
			return false;
		if (this.children.get(id).findIndex(function (childId) {
			return isSubset.get(childId);
		}, this) >= 0)
			return false;
		return true;
	}, this);
	util.assert(parents.length <= 1); // there should be only one parent
	var children = atomSets.findAll(function (id) {
		return isStrictSuperset.get(id) && !isStrictSuperset.get(this.parent.get(id));
	}, this);
	return {
		children: children,
		parent: parents.length === 0 ? -1 : parents[0]
	};
};

SGroupForest.prototype.getPathToRoot = function (sgid) {
	var path = [];
	for (var id = sgid; id >= 0; id = this.parent.get(id)) {
		util.assert(path.indexOf(id) < 0, 'SGroupForest: loop detected');
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
		if (parentId >= 0 && !Set.subset(atomSets.get(id), atomSets.get(parentId)))
			valid = false;
	}, this);

	// 2) siblings have disjoint atom sets
	this.children.each(function (parentId) {
		var list = this.children.get(parentId);
		for (var i = 0; i < list.length; ++i) {
			for (var j = i + 1; j < list.length; ++j) {
				if (!Set.disjoint(atomSets.get(list[i]), atomSets.get(list[j])))
					valid = false;
			}
		}
	}, this);
	return valid;
};

SGroupForest.prototype.insert = function (id, parent /* int, optional */, children /* [int], optional */) {
	util.assert(!this.parent.has(id), 'sgid already present in the forest');
	util.assert(!this.children.has(id), 'sgid already present in the forest');

	util.assert(this.validate(), 's-group forest invalid');
	var atomSets = this.getAtomSets();
	var atoms = Set.fromList(this.molecule.sgroups.get(id).atoms);
	if (util.isUndefined(parent) || util.isUndefined(children)) { // if these are not provided, deduce automatically
		var guess = this.getAtomSetRelations(id, atoms, atomSets);
		parent = guess.parent;
		children = guess.children;
	}

	// TODO: make children Map<int, Set> instead of Map<int, []>?
	children.forEach(function (childId) { // reset parent links
		var childs = this.children.get(this.parent.get(childId));
		var i = childs.indexOf(childId);
		util.assert(i >= 0 && childs.indexOf(childId, i + 1) < 0); // one element
		childs.splice(i, 1);
		this.parent.set(childId, id);
	}, this);
	this.children.set(id, children);
	this.parent.set(id, parent);
	this.children.get(parent).push(id);
	util.assert(this.validate(), 's-group forest invalid');
	return { parent: parent, children: children };
};

SGroupForest.prototype.remove = function (id) {
	util.assert(this.parent.has(id), 'sgid is not in the forest');
	util.assert(this.children.has(id), 'sgid is not in the forest');

	util.assert(this.validate(), 's-group forest invalid');
	var parentId = this.parent.get(id);
	this.children.get(id).forEach(function (childId) { // reset parent links
		this.parent.set(childId, parentId);
		this.children.get(parentId).push(childId);
	}, this);

	var childs = this.children.get(parentId);
	var i = childs.indexOf(id);
	util.assert(i >= 0 && childs.indexOf(id, i + 1) < 0); // one element
	childs.splice(i, 1);

	this.children.unset(id);
	this.parent.unset(id);
	util.assert(this.validate(), 's-group forest invalid');
};

module.exports = SGroupForest;
