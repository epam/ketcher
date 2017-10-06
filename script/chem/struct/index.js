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
var Pool = require('../../util/pool');
var Set = require('../../util/set');
var Vec2 = require('../../util/vec2');

var element = require('../element');

var Atom = require('./atom');
var AtomList = require('./atomlist');
var Bond = require('./bond');
var SGroup = require('./sgroup');
var RGroup = require('./rgroup');
var SGroupForest = require('./sgforest');

function Struct() {
	this.atoms = new Pool();
	this.bonds = new Pool();
	this.sgroups = new Pool();
	this.halfBonds = new Map();
	this.loops = new Pool();
	this.isChiral = false;
	this.isReaction = false;
	this.rxnArrows = new Pool();
	this.rxnPluses = new Pool();
	this.frags = new Pool();
	this.rgroups = new Map();
	this.name = '';
	this.sGroupForest = new SGroupForest(this);
}

Struct.prototype.hasRxnProps = function () {
	return this.atoms.find(function (aid, atom) {
		return atom.hasRxnProps();
	}, this) >= 0 || this.bonds.find(function (bid, bond) {
		return bond.hasRxnProps();
	}, this) >= 0;
};

Struct.prototype.hasRxnArrow = function () {
	return this.rxnArrows.count() > 0;
};

// returns a list of id's of s-groups, which contain only atoms in the given list
Struct.prototype.getSGroupsInAtomSet = function (atoms/* Array*/) {
	var sgCounts = {};

	atoms.forEach(function (aid) {
		var sg = Set.list(this.atoms.get(aid).sgs);

		sg.forEach(function (sid) {
			sgCounts[sid] = sgCounts[sid] ? (sgCounts[sid] + 1) : 1;
		}, this);
	}, this);

	var sgroupList = [];
	for (var key in sgCounts) {
		var sid = parseInt(key, 10);
		var sgroup = this.sgroups.get(sid);
		var sgAtoms = SGroup.getAtoms(this, sgroup);
		if (sgCounts[key] === sgAtoms.length)
			sgroupList.push(sid);
	}
	return sgroupList;
};

Struct.prototype.isBlank = function () {
	return this.atoms.count() === 0 &&
	this.rxnArrows.count() === 0 &&
	this.rxnPluses.count() === 0 && !this.isChiral;
};

Struct.prototype.toLists = function () {
	var aidMap = {};
	var atomList = [];
	this.atoms.each(function (aid, atom) {
		aidMap[aid] = atomList.length;
		atomList.push(atom);
	});

	var bondList = [];
	this.bonds.each(function (bid, bond) {
		var b = new Bond(bond);
		b.begin = aidMap[bond.begin];
		b.end = aidMap[bond.end];
		bondList.push(b);
	});

	return {
		atoms: atomList,
		bonds: bondList
	};
};

Struct.prototype.clone = function (atomSet, bondSet, dropRxnSymbols, aidMap) {
	var cp = new Struct();
	return this.mergeInto(cp, atomSet, bondSet, dropRxnSymbols, false, aidMap);
};

Struct.prototype.getScaffold = function () {
	var atomSet = Set.empty();
	this.atoms.each(function (aid) {
		Set.add(atomSet, aid);
	}, this);
	this.rgroups.each(function (rgid, rg) {
		rg.frags.each(function (fnum, fid) {
			this.atoms.each(function (aid, atom) {
				if (atom.fragment === fid)
					Set.remove(atomSet, aid);
			}, this);
		}, this);
	}, this);
	return this.clone(atomSet);
};

Struct.prototype.getFragmentIds = function (fid) {
	var atomSet = Set.empty();
	this.atoms.each(function (aid, atom) {
		if (atom.fragment === fid)
			Set.add(atomSet, aid);
	}, this);
	return atomSet;
};

Struct.prototype.getFragment = function (fid) {
	return this.clone(this.getFragmentIds(fid));
};

Struct.prototype.mergeInto = function (cp, atomSet, bondSet, dropRxnSymbols, keepAllRGroups, aidMap) { // eslint-disable-line max-params, max-statements
	atomSet = atomSet || Set.keySetInt(this.atoms);
	bondSet = bondSet || Set.keySetInt(this.bonds);
	bondSet = Set.filter(bondSet, function (bid) {
		var bond = this.bonds.get(bid);
		return Set.contains(atomSet, bond.begin) && Set.contains(atomSet, bond.end);
	}, this);

	var fidMask = {};
	this.atoms.each(function (aid, atom) {
		if (Set.contains(atomSet, aid))
			fidMask[atom.fragment] = 1;
	});
	var fidMap = {};
	this.frags.each(function (fid, frag) {
		if (fidMask[fid])
			fidMap[fid] = cp.frags.add(Object.assign({}, frag));
	});

	var rgroupsIds = [];
	this.rgroups.each(function (rgid, rgroup) {
		var keepGroup = keepAllRGroups;
		if (!keepGroup) {
			rgroup.frags.each(function (fnum, fid) {
				rgroupsIds.push(fid);
				if (fidMask[fid])
					keepGroup = true;
			});
			if (!keepGroup)
				return;
		}
		var rg = cp.rgroups.get(rgid);
		if (rg) {
			rgroup.frags.each(function (fnum, fid) {
				rgroupsIds.push(fid);
				if (fidMask[fid])
					rg.frags.add(fidMap[fid]);
			});
		} else {
			cp.rgroups.set(rgid, rgroup.clone(fidMap));
		}
	});

	if (typeof aidMap === 'undefined' || aidMap === null)
		aidMap = {};
	// atoms in not RGroup
	this.atoms.each(function (aid, atom) {
		if (Set.contains(atomSet, aid) && rgroupsIds.indexOf(atom.fragment) === -1)
			aidMap[aid] = cp.atoms.add(atom.clone(fidMap));
	});
	// atoms in RGroup
	this.atoms.each(function (aid, atom) {
		if (Set.contains(atomSet, aid) && rgroupsIds.indexOf(atom.fragment) !== -1)
			aidMap[aid] = cp.atoms.add(atom.clone(fidMap));
	});

	var bidMap = {};
	this.bonds.each(function (bid, bond) {
		if (Set.contains(bondSet, bid))
			bidMap[bid] = cp.bonds.add(bond.clone(aidMap));
	});

	this.sgroups.each(function (sid, sg) {
		var i;
		for (i = 0; i < sg.atoms.length; ++i) {
			if (!Set.contains(atomSet, sg.atoms[i]))
				return;
		}
		sg = SGroup.clone(sg, aidMap, bidMap);
		var id = cp.sgroups.add(sg);
		sg.id = id;
		for (i = 0; i < sg.atoms.length; ++i)
			Set.add(cp.atoms.get(sg.atoms[i]).sgs, id);

		if (sg.type === 'DAT')
			cp.sGroupForest.insert(sg.id, -1, []);
		else
			cp.sGroupForest.insert(sg.id);
	});
	cp.isChiral = this.isChiral;
	if (!dropRxnSymbols) {
		cp.isReaction = this.isReaction;
		this.rxnArrows.each(function (id, item) {
			cp.rxnArrows.add(item.clone());
		});
		this.rxnPluses.each(function (id, item) {
			cp.rxnPluses.add(item.clone());
		});
	}
	return cp;
};

Struct.prototype.findBondId = function (begin, end) {
	var id = -1;

	this.bonds.find(function (bid, bond) {
		if ((bond.begin === begin && bond.end === end) ||
		(bond.begin === end && bond.end === begin)) {
			id = bid;
			return true;
		}
		return false;
	}, this);

	return id;
};

function HalfBond(/* num*/begin, /* num*/end, /* num*/bid) { // eslint-disable-line max-params, max-statements
	console.assert(arguments.length === 3, 'Invalid parameter number!');

	this.begin = begin - 0;
	this.end = end - 0;
	this.bid = bid - 0;

	// rendering properties
	this.dir = new Vec2(); // direction
	this.norm = new Vec2(); // left normal
	this.ang = 0; // angle to (1,0), used for sorting the bonds
	this.p = new Vec2(); // corrected origin position
	this.loop = -1; // left loop id if the half-bond is in a loop, otherwise -1
	this.contra = -1; // the half bond contrary to this one
	this.next = -1; // the half-bond next ot this one in CCW order
	this.leftSin = 0;
	this.leftCos = 0;
	this.leftNeighbor = 0;
	this.rightSin = 0;
	this.rightCos = 0;
	this.rightNeighbor = 0;
}

Struct.prototype.initNeighbors = function () {
	this.atoms.each(function (aid, atom) {
		atom.neighbors = [];
	});
	this.bonds.each(function (bid, bond) {
		var a1 = this.atoms.get(bond.begin);
		var a2 = this.atoms.get(bond.end);
		a1.neighbors.push(bond.hb1);
		a2.neighbors.push(bond.hb2);
	}, this);
};

Struct.prototype.bondInitHalfBonds = function (bid, /* opt*/ bond) {
	bond = bond || this.bonds.get(bid);
	bond.hb1 = 2 * bid;
	bond.hb2 = 2 * bid + 1; // eslint-disable-line no-mixed-operators
	this.halfBonds.set(bond.hb1, new HalfBond(bond.begin, bond.end, bid));
	this.halfBonds.set(bond.hb2, new HalfBond(bond.end, bond.begin, bid));
	var hb1 = this.halfBonds.get(bond.hb1);
	var hb2 = this.halfBonds.get(bond.hb2);
	hb1.contra = bond.hb2;
	hb2.contra = bond.hb1;
};

Struct.prototype.halfBondUpdate = function (hbid) {
	var hb = this.halfBonds.get(hbid);
	var p1 = this.atoms.get(hb.begin).pp;
	var p2 = this.atoms.get(hb.end).pp;
	var d = Vec2.diff(p2, p1).normalized();
	hb.dir = Vec2.dist(p2, p1) > 1e-4 ? d : new Vec2(1, 0);
	hb.norm = hb.dir.turnLeft();
	hb.ang = hb.dir.oxAngle();
	if (hb.loop < 0)
		hb.loop = -1;
};

Struct.prototype.initHalfBonds = function () {
	this.halfBonds.clear();
	this.bonds.each(this.bondInitHalfBonds, this);
};

Struct.prototype.setHbNext = function (hbid, next) {
	this.halfBonds.get(this.halfBonds.get(hbid).contra).next = next;
};

Struct.prototype.halfBondSetAngle = function (hbid, left) {
	var hb = this.halfBonds.get(hbid);
	var hbl = this.halfBonds.get(left);
	hbl.rightCos = hb.leftCos = Vec2.dot(hbl.dir, hb.dir);
	hbl.rightSin = hb.leftSin = Vec2.cross(hbl.dir, hb.dir);
	hb.leftNeighbor = left;
	hbl.rightNeighbor = hbid;
};

Struct.prototype.atomAddNeighbor = function (hbid) {
	var hb = this.halfBonds.get(hbid);
	var atom = this.atoms.get(hb.begin);
	var i = 0;
	for (i = 0; i < atom.neighbors.length; ++i) {
		if (this.halfBonds.get(atom.neighbors[i]).ang > hb.ang)
			break;
	}
	atom.neighbors.splice(i, 0, hbid);
	var ir = atom.neighbors[(i + 1) % atom.neighbors.length];
	var il = atom.neighbors[(i + atom.neighbors.length - 1) %
		atom.neighbors.length];
	this.setHbNext(il, hbid);
	this.setHbNext(hbid, ir);
	this.halfBondSetAngle(hbid, il);
	this.halfBondSetAngle(ir, hbid);
};

Struct.prototype.atomSortNeighbors = function (aid) {
	var atom = this.atoms.get(aid);
	var halfBonds = this.halfBonds;
	atom.neighbors = atom.neighbors.sort(function (nei, nei2) {
		return halfBonds.get(nei).ang < halfBonds.get(nei2).ang;
	});

	var i;
	for (i = 0; i < atom.neighbors.length; ++i) {
		this.halfBonds.get(this.halfBonds.get(atom.neighbors[i]).contra).next =
			atom.neighbors[(i + 1) % atom.neighbors.length];
	}
	for (i = 0; i < atom.neighbors.length; ++i) {
		this.halfBondSetAngle(atom.neighbors[(i + 1) % atom.neighbors.length],
			atom.neighbors[i]);
	}
};

Struct.prototype.sortNeighbors = function (list) {
	function f(aid) {
		this.atomSortNeighbors(aid);
	}
	if (!list)
		this.atoms.each(f, this);
	else
		list.forEach(f, this);
};

Struct.prototype.atomUpdateHalfBonds = function (aid) {
	var nei = this.atoms.get(aid).neighbors;
	for (var i = 0; i < nei.length; ++i) {
		var hbid = nei[i];
		this.halfBondUpdate(hbid);
		this.halfBondUpdate(this.halfBonds.get(hbid).contra);
	}
};

Struct.prototype.updateHalfBonds = function (list) {
	function f(aid) {
		this.atomUpdateHalfBonds(aid);
	}
	if (!list)
		this.atoms.each(f, this);
	else
		list.forEach(f, this);
};

Struct.prototype.sGroupsRecalcCrossBonds = function () {
	this.sgroups.each(function (sgid, sg) {
		sg.xBonds = [];
		sg.neiAtoms = [];
	}, this);
	this.bonds.each(function (bid, bond) {
		var a1 = this.atoms.get(bond.begin);
		var a2 = this.atoms.get(bond.end);
		Set.each(a1.sgs, function (sgid) {
			if (!Set.contains(a2.sgs, sgid)) {
				var sg = this.sgroups.get(sgid);
				sg.xBonds.push(bid);
				arrayAddIfMissing(sg.neiAtoms, bond.end);
			}
		}, this);
		Set.each(a2.sgs, function (sgid) {
			if (!Set.contains(a1.sgs, sgid)) {
				var sg = this.sgroups.get(sgid);
				sg.xBonds.push(bid);
				arrayAddIfMissing(sg.neiAtoms, bond.begin);
			}
		}, this);
	}, this);
};

Struct.prototype.sGroupDelete = function (sgid) {
	var sg = this.sgroups.get(sgid);
	for (var i = 0; i < sg.atoms.length; ++i)
		Set.remove(this.atoms.get(sg.atoms[i]).sgs, sgid);
	this.sGroupForest.remove(sgid);
	this.sgroups.remove(sgid);
};

Struct.prototype.atomSetPos = function (id, pp) {
	var itemId = this['atoms'].get(id);
	itemId.pp = pp;
};

Struct.prototype.rxnPlusSetPos = function (id, pp) {
	var itemId = this['rxnPluses'].get(id);
	itemId.pp = pp;
};

Struct.prototype.rxnArrowSetPos = function (id, pp) {
	var itemId = this['rxnArrows'].get(id);
	itemId.pp = pp;
};

Struct.prototype.getCoordBoundingBox = function (atomSet) {
	var bb = null;
	function extend(pp) {
		if (!bb) {
			bb = {
				min: pp,
				max: pp
			};
		} else {
			bb.min = Vec2.min(bb.min, pp);
			bb.max = Vec2.max(bb.max, pp);
		}
	}

	var global = typeof (atomSet) === 'undefined';

	this.atoms.each(function (aid, atom) {
		if (global || Set.contains(atomSet, aid))
			extend(atom.pp);
	});
	if (global) {
		this.rxnPluses.each(function (id, item) {
			extend(item.pp);
		});
		this.rxnArrows.each(function (id, item) {
			extend(item.pp);
		});
	}
	if (!bb && global) {
		bb = {
			min: new Vec2(0, 0),
			max: new Vec2(1, 1)
		};
	}
	return bb;
};

Struct.prototype.getCoordBoundingBoxObj = function () {
	var bb = null;
	function extend(pp) {
		if (!bb) {
			bb = {
				min: new Vec2(pp),
				max: new Vec2(pp)
			};
		} else {
			bb.min = Vec2.min(bb.min, pp);
			bb.max = Vec2.max(bb.max, pp);
		}
	}

	this.atoms.each(function (aid, atom) {
		extend(atom.pp);
	});
	return bb;
};

Struct.prototype.getBondLengthData = function () {
	var totalLength = 0;
	var cnt = 0;
	this.bonds.each(function (bid, bond) {
		totalLength += Vec2.dist(
			this.atoms.get(bond.begin).pp,
			this.atoms.get(bond.end).pp);
		cnt++;
	}, this);
	return { cnt: cnt, totalLength: totalLength };
};

Struct.prototype.getAvgBondLength = function () {
	var bld = this.getBondLengthData();
	return bld.cnt > 0 ? bld.totalLength / bld.cnt : -1;
};

Struct.prototype.getAvgClosestAtomDistance = function () {
	var totalDist = 0;
	var minDist;
	var dist = 0;
	var keys = this.atoms.keys();
	var k;
	var j;
	for (k = 0; k < keys.length; ++k) {
		minDist = -1;
		for (j = 0; j < keys.length; ++j) {
			if (j == k)
				continue; // eslint-disable-line no-continue
			dist = Vec2.dist(this.atoms.get(keys[j]).pp, this.atoms.get(keys[k]).pp);
			if (minDist < 0 || minDist > dist)
				minDist = dist;
		}
		totalDist += minDist;
	}

	return keys.length > 0 ? totalDist / keys.length : -1;
};

Struct.prototype.checkBondExists = function (begin, end) {
	var bondExists = false;
	this.bonds.each(function (bid, bond) {
		if ((bond.begin == begin && bond.end == end) ||
		(bond.end == begin && bond.begin == end))
			bondExists = true;
	}, this);
	return bondExists;
};

function Loop(/* Array of num*/hbs, /* Struct*/struct, /* bool*/convex) {
	this.hbs = hbs; // set of half-bonds involved
	this.dblBonds = 0; // number of double bonds in the loop
	this.aromatic = true;
	this.convex = convex || false;

	hbs.forEach(function (hb) {
		var bond = struct.bonds.get(struct.halfBonds.get(hb).bid);
		if (bond.type != Bond.PATTERN.TYPE.AROMATIC)
			this.aromatic = false;
		if (bond.type == Bond.PATTERN.TYPE.DOUBLE)
			this.dblBonds++;
	}, this);
}

Struct.prototype.findConnectedComponent = function (aid) {
	var map = {};
	var list = [aid];
	var ids = Set.empty();
	while (list.length > 0) {
		(function () {
			var aid = list.pop();
			map[aid] = 1;
			Set.add(ids, aid);
			var atom = this.atoms.get(aid);
			for (var i = 0; i < atom.neighbors.length; ++i) {
				var neiId = this.halfBonds.get(atom.neighbors[i]).end;
				if (!Set.contains(ids, neiId))
					list.push(neiId);
			}
		}).apply(this);
	}
	return ids;
};

Struct.prototype.findConnectedComponents = function (discardExistingFragments) {
	// NB: this is a hack
	// TODO: need to maintain half-bond and neighbor structure permanently
	if (!this.halfBonds.count()) {
		this.initHalfBonds();
		this.initNeighbors();
		this.updateHalfBonds(this.atoms.keys());
		this.sortNeighbors(this.atoms.keys());
	}

	var map = {};
	this.atoms.each(function (aid) {
		map[aid] = -1;
	}, this);
	var components = [];
	this.atoms.each(function (aid, atom) {
		if ((discardExistingFragments || atom.fragment < 0) && map[aid] < 0) {
			var component = this.findConnectedComponent(aid);
			components.push(component);
			Set.each(component, function (aid) {
				map[aid] = 1;
			}, this);
		}
	}, this);
	return components;
};

Struct.prototype.markFragment = function (ids) {
	var frag = {};
	var fid = this.frags.add(frag);
	Set.each(ids, function (aid) {
		this.atoms.get(aid).fragment = fid;
	}, this);
};

Struct.prototype.markFragmentByAtomId = function (aid) {
	this.markFragment(this.findConnectedComponent(aid));
};

Struct.prototype.markFragments = function () {
	var components = this.findConnectedComponents();
	for (var i = 0; i < components.length; ++i)
		this.markFragment(components[i]);
};

Struct.prototype.scale = function (scale) {
	if (scale != 1) {
		this.atoms.each(function (aid, atom) {
			atom.pp = atom.pp.scaled(scale);
		}, this);
		this.rxnPluses.each(function (id, item) {
			item.pp = item.pp.scaled(scale);
		}, this);
		this.rxnArrows.each(function (id, item) {
			item.pp = item.pp.scaled(scale);
		}, this);
		this.sgroups.each(function (id, item) {
			item.pp = item.pp ? item.pp.scaled(scale) : null;
		}, this);
	}
};

Struct.prototype.rescale = function () {
	var avg = this.getAvgBondLength();
	if (avg < 0 && !this.isReaction) // TODO [MK] this doesn't work well for reactions as the distances between
		// the atoms in different components are generally larger than those between atoms of a single component
		// (KETCHER-341)
		avg = this.getAvgClosestAtomDistance();
	if (avg < 1e-3)
		avg = 1;
	var scale = 1 / avg;
	this.scale(scale);
};

Struct.prototype.loopHasSelfIntersections = function (hbs) {
	for (var i = 0; i < hbs.length; ++i) {
		var hbi = this.halfBonds.get(hbs[i]);
		var ai = this.atoms.get(hbi.begin).pp;
		var bi = this.atoms.get(hbi.end).pp;
		var set = Set.fromList([hbi.begin, hbi.end]);
		for (var j = i + 2; j < hbs.length; ++j) {
			var hbj = this.halfBonds.get(hbs[j]);
			if (Set.contains(set, hbj.begin) || Set.contains(set, hbj.end))
				/* eslint-disable no-continue*/
				continue; // skip edges sharing an atom
				/* eslint-enable no-continue*/
			var aj = this.atoms.get(hbj.begin).pp;
			var bj = this.atoms.get(hbj.end).pp;
			if (Vec2.segmentIntersection(ai, bi, aj, bj))
				return true;
		}
	}
	return false;
};

// partition a cycle into simple cycles
// TODO: [MK] rewrite the detection algorithm to only find simple ones right away?
Struct.prototype.partitionLoop = function (loop) { // eslint-disable-line max-statements
	var subloops = [];
	var continueFlag = true;
	search: while (continueFlag) { // eslint-disable-line no-restricted-syntax
		var atomToHalfBond = {}; // map from every atom in the loop to the index of the first half-bond starting from that atom in the uniqHb array
		for (var l = 0; l < loop.length; ++l) {
			var hbid = loop[l];
			var aid1 = this.halfBonds.get(hbid).begin;
			var aid2 = this.halfBonds.get(hbid).end;
			if (aid2 in atomToHalfBond) { // subloop found
				var s = atomToHalfBond[aid2]; // where the subloop begins
				var subloop = loop.slice(s, l + 1);
				subloops.push(subloop);
				if (l < loop.length) // remove half-bonds corresponding to the subloop
					loop.splice(s, l - s + 1);
				continue search; // eslint-disable-line no-continue
			}
			atomToHalfBond[aid1] = l;
		}
		continueFlag = false; // we're done, no more subloops found
		subloops.push(loop);
	}
	return subloops;
};

Struct.prototype.halfBondAngle = function (hbid1, hbid2) {
	var hba = this.halfBonds.get(hbid1);
	var hbb = this.halfBonds.get(hbid2);
	return Math.atan2(
	Vec2.cross(hba.dir, hbb.dir),
	Vec2.dot(hba.dir, hbb.dir));
};

Struct.prototype.loopIsConvex = function (loop) {
	for (var k = 0; k < loop.length; ++k) {
		var angle = this.halfBondAngle(loop[k], loop[(k + 1) % loop.length]);
		if (angle > 0)
			return false;
	}
	return true;
};

// check whether a loop is on the inner or outer side of the polygon
//  by measuring the total angle between bonds
Struct.prototype.loopIsInner = function (loop) {
	var totalAngle = 2 * Math.PI;
	for (var k = 0; k < loop.length; ++k) {
		var hbida = loop[k];
		var hbidb = loop[(k + 1) % loop.length];
		var hbb = this.halfBonds.get(hbidb);
		var angle = this.halfBondAngle(hbida, hbidb);
		if (hbb.contra == loop[k]) // back and forth along the same edge
			totalAngle += Math.PI;
		else
			totalAngle += angle;
	}
	return Math.abs(totalAngle) < Math.PI;
};

Struct.prototype.findLoops = function () {
	var newLoops = [];
	var bondsToMark = Set.empty();

	/*
	 	Starting from each half-bond not known to be in a loop yet,
	 	follow the 'next' links until the initial half-bond is reached or
	 	the length of the sequence exceeds the number of half-bonds available.
	 	In a planar graph, as long as every bond is a part of some "loop" -
	 	either an outer or an inner one - every iteration either yields a loop
	 	or doesn't start at all. Thus this has linear complexity in the number
	 	of bonds for planar graphs.
	 */

	var hbIdNext, c, loop, loopId;
	this.halfBonds.each(function (hbId, hb) {
		if (hb.loop !== -1)
			return;

		for (hbIdNext = hbId, c = 0, loop = []; c <= this.halfBonds.count(); hbIdNext = this.halfBonds.get(hbIdNext).next, ++c) {
			if (!(c > 0 && hbIdNext === hbId)) {
				loop.push(hbIdNext);
				continue;
			}

			// loop found
			var subloops = this.partitionLoop(loop);
			subloops.forEach(function (loop) {
				if (this.loopIsInner(loop) && !this.loopHasSelfIntersections(loop)) {
					/*
                        loop is internal
                        use lowest half-bond id in the loop as the loop id
                        this ensures that the loop gets the same id if it is discarded and then recreated,
                        which in turn is required to enable redrawing while dragging, as actions store item id's
                     */
					loopId = Math.min.apply(Math, loop);
					this.loops.set(loopId, new Loop(loop, this, this.loopIsConvex(loop)));
				} else {
					loopId = -2;
				}

				loop.forEach(function (hbid) {
					this.halfBonds.get(hbid).loop = loopId;
					Set.add(bondsToMark, this.halfBonds.get(hbid).bid);
				}, this);

				if (loopId >= 0)
					newLoops.push(loopId);
			}, this);
			break;
		}
	}, this);

	return {
		newLoops: newLoops,
		bondsToMark: Set.list(bondsToMark)
	};
};

// NB: this updates the structure without modifying the corresponding ReStruct.
//  To be applied to standalone structures only.
Struct.prototype.prepareLoopStructure = function () {
	this.initHalfBonds();
	this.initNeighbors();
	this.updateHalfBonds(this.atoms.keys());
	this.sortNeighbors(this.atoms.keys());
	this.findLoops();
};

Struct.prototype.atomAddToSGroup = function (sgid, aid) {
	// TODO: [MK] make sure the addition does not break the hierarchy?
	SGroup.addAtom(this.sgroups.get(sgid), aid);
	Set.add(this.atoms.get(aid).sgs, sgid);
};

Struct.prototype.calcConn = function (aid) {
	var conn = 0;
	var atom = this.atoms.get(aid);
	var oddLoop = false;
	var hasAromatic = false;
	for (var i = 0; i < atom.neighbors.length; ++i) {
		var hb = this.halfBonds.get(atom.neighbors[i]);
		var bond = this.bonds.get(hb.bid);
		switch (bond.type) {
		case Bond.PATTERN.TYPE.SINGLE:
			conn += 1;
			break;
		case Bond.PATTERN.TYPE.DOUBLE:
			conn += 2;
			break;
		case Bond.PATTERN.TYPE.TRIPLE:
			conn += 3;
			break;
		case Bond.PATTERN.TYPE.AROMATIC:
			conn += 1;
			hasAromatic = true;
			this.loops.each(function (id, item) {
				if (item.hbs.indexOf(atom.neighbors[i]) != -1 && item.hbs.length % 2 == 1)
					oddLoop = true;
			}, this);
			break;
		default:
			return -1;
		}
	}
	if (hasAromatic && !atom.hasImplicitH && !oddLoop)
		conn += 1;
	return conn;
};

Struct.prototype.calcImplicitHydrogen = function (aid) {
	var conn = this.calcConn(aid);
	var atom = this.atoms.get(aid);
	atom.badConn = false;
	if (conn < 0 || atom.isQuery()) {
		atom.implicitH = 0;
		return;
	}
	if (atom.explicitValence >= 0) {
		var elem = element.map[atom.label];
		atom.implicitH = 0;
		if (elem != null) {
			atom.implicitH = atom.explicitValence - atom.calcValenceMinusHyd(conn);
			if (atom.implicitH < 0) {
				atom.implicitH = 0;
				atom.badConn = true;
			}
		}
	} else {
		atom.calcValence(conn);
	}
};

Struct.prototype.setImplicitHydrogen = function (list) {
	this.sgroups.each(function (id, item) {
		if (item.data.fieldName === "MRV_IMPLICIT_H")
			this.atoms.get(item.atoms[0]).hasImplicitH = true;
	}, this);
	function f(aid) {
		this.calcImplicitHydrogen(aid);
	}
	if (!list)
		this.atoms.each(f, this);
	else
		list.forEach(f, this);
};

Struct.prototype.getComponents = function () { // eslint-disable-line max-statements
	/* saver */
	var ccs = this.findConnectedComponents(true);
	var barriers = [];
	var arrowPos = null;
	this.rxnArrows.each(function (id, item) { // there's just one arrow
		arrowPos = item.pp.x;
	});
	this.rxnPluses.each(function (id, item) {
		barriers.push(item.pp.x);
	});
	if (arrowPos != null)
		barriers.push(arrowPos);
	barriers.sort(function (a, b) {
		return a - b;
	});
	var components = [];

	var i;
	for (i = 0; i < ccs.length; ++i) {
		var bb = this.getCoordBoundingBox(ccs[i]);
		var c = Vec2.lc2(bb.min, 0.5, bb.max, 0.5);
		var j = 0;
		while (c.x > barriers[j])
			++j;
		components[j] = components[j] || {};
		Set.mergeIn(components[j], ccs[i]);
	}
	var submolTexts = [];
	var reactants = [];
	var products = [];
	for (i = 0; i < components.length; ++i) {
		if (!components[i]) {
			submolTexts.push('');
			continue; // eslint-disable-line no-continue
		}
		bb = this.getCoordBoundingBox(components[i]);
		c = Vec2.lc2(bb.min, 0.5, bb.max, 0.5);
		if (c.x < arrowPos)
			reactants.push(components[i]);
		else
			products.push(components[i]);
	}

	return {
		reactants: reactants,
		products: products
	};
};

// Other struct objects

function RxnPlus(params) {
	params = params || {};
	this.pp = params.pp ? new Vec2(params.pp) : new Vec2();
}

RxnPlus.prototype.clone = function () {
	return new RxnPlus(this);
};

function RxnArrow(params) {
	params = params || {};
	this.pp = params.pp ? new Vec2(params.pp) : new Vec2();
}

RxnArrow.prototype.clone = function () {
	return new RxnArrow(this);
};

function arrayAddIfMissing(array, item) {
	for (var i = 0; i < array.length; ++i) {
		if (array[i] === item)
			return false;
	}
	array.push(item);
	return true;
}


module.exports = Object.assign(Struct, {
	Atom: Atom,
	AtomList: AtomList,
	Bond: Bond,
	SGroup: SGroup,
	RGroup: RGroup,
	RxnPlus: RxnPlus,
	RxnArrow: RxnArrow
});
