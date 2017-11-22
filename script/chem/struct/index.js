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
var Vec2 = require('../../util/vec2');
var Box2Abs = require('../../util/box2abs');

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
	return this.atoms.find((aid, atom) => atom.hasRxnProps(), this) >= 0 || this.bonds.find((bid, bond) => bond.hasRxnProps(), this) >= 0;
};

Struct.prototype.hasRxnArrow = function () {
	return this.rxnArrows.count() > 0;
};

/**
 * Returns a list of id's of s-groups, which contain only atoms in the given list
 * @param atoms { Array<number> }
 * @returns { Array<number> }
 */
Struct.prototype.getSGroupsInAtomSet = function (atoms) {
	var sgCounts = {};

	atoms.forEach(function (aid) {
		var sg = Array.from(this.atoms.get(aid).sgs);

		sg.forEach((sid) => {
			sgCounts[sid] = sgCounts[sid] ? (sgCounts[sid] + 1) : 1;
		}, this);
	}, this);

	var sgroupList = [];
	Object.keys(sgCounts).forEach((key) => {
		var sid = parseInt(key, 10);
		var sgroup = this.sgroups.get(sid);
		var sgAtoms = SGroup.getAtoms(this, sgroup);
		if (sgCounts[key] === sgAtoms.length)
			sgroupList.push(sid);
	});
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
	this.atoms.each((aid, atom) => {
		aidMap[aid] = atomList.length;
		atomList.push(atom);
	});

	var bondList = [];
	this.bonds.each((bid, bond) => {
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
	var atomSet = new Set();
	this.atoms.each((aid) => { atomSet.add(aid); });

	this.rgroups.each((rgid, rg) => {
		rg.frags.each((fnum, fid) => {
			this.atoms.each((aid, atom) => {
				if (atom.fragment === fid)
					atomSet.delete(aid);
			});
		});
	});

	return this.clone(atomSet);
};

Struct.prototype.getFragmentIds = function (fid) {
	const atomSet = new Set();

	this.atoms.each((aid, atom) => {
		if (atom.fragment === fid)
			atomSet.add(aid);
	});

	return atomSet;
};

Struct.prototype.getFragment = function (fid) {
	return this.clone(this.getFragmentIds(fid));
};

Struct.prototype.mergeInto = function (cp, atomSet, bondSet, dropRxnSymbols, keepAllRGroups, aidMap) { // eslint-disable-line max-params, max-statements
	atomSet = atomSet || new Set(this.atoms.keys().map(key => parseInt(key, 10)));
	bondSet = bondSet || new Set(this.bonds.keys().map(key => parseInt(key, 10)));
	bondSet = bondSet.filter((bid) => {
		var bond = this.bonds.get(bid);
		return atomSet.has(bond.begin) && atomSet.has(bond.end);
	});

	var fidMask = {};
	this.atoms.each((aid, atom) => {
		if (atomSet.has(aid))
			fidMask[atom.fragment] = 1;
	});
	var fidMap = {};
	this.frags.each((fid, frag) => {
		if (fidMask[fid])
			fidMap[fid] = cp.frags.add(Object.assign({}, frag));
	});

	var rgroupsIds = [];
	this.rgroups.each((rgid, rgroup) => {
		var keepGroup = keepAllRGroups;
		if (!keepGroup) {
			rgroup.frags.each((fnum, fid) => {
				rgroupsIds.push(fid);
				if (fidMask[fid])
					keepGroup = true;
			});
			if (!keepGroup)
				return;
		}
		var rg = cp.rgroups.get(rgid);
		if (rg) {
			rgroup.frags.each((fnum, fid) => {
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
	this.atoms.each((aid, atom) => {
		if (atomSet.has(aid) && rgroupsIds.indexOf(atom.fragment) === -1)
			aidMap[aid] = cp.atoms.add(atom.clone(fidMap));
	});
	// atoms in RGroup
	this.atoms.each((aid, atom) => {
		if (atomSet.has(aid) && rgroupsIds.indexOf(atom.fragment) !== -1)
			aidMap[aid] = cp.atoms.add(atom.clone(fidMap));
	});

	var bidMap = {};
	this.bonds.each((bid, bond) => {
		if (bondSet.has(bid))
			bidMap[bid] = cp.bonds.add(bond.clone(aidMap));
	});

	this.sgroups.each((sid, sg) => {
		var i;
		for (i = 0; i < sg.atoms.length; ++i) {
			if (!atomSet.has(sg.atoms[i]))
				return;
		}
		sg = SGroup.clone(sg, aidMap, bidMap);
		var id = cp.sgroups.add(sg);
		sg.id = id;
		for (i = 0; i < sg.atoms.length; ++i)
			cp.atoms.get(sg.atoms[i]).sgs.add(id);

		if (sg.type === 'DAT')
			cp.sGroupForest.insert(sg.id, -1, []);
		else
			cp.sGroupForest.insert(sg.id);
	});
	cp.isChiral = this.isChiral;
	if (!dropRxnSymbols) {
		cp.isReaction = this.isReaction;
		this.rxnArrows.each((id, item) => {
			cp.rxnArrows.add(item.clone());
		});
		this.rxnPluses.each((id, item) => {
			cp.rxnPluses.add(item.clone());
		});
	}
	return cp;
};

Struct.prototype.findBondId = function (begin, end) {
	return Array.from(this.bonds.entries()).find((bid, bond) =>
		(bond.begin === begin && bond.end === end) || (bond.begin === end && bond.end === begin)
	);
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
	this.atoms.each((aid, atom) => {
		atom.neighbors = [];
	});

	this.bonds.each((bid, bond) => {
		var a1 = this.atoms.get(bond.begin);
		var a2 = this.atoms.get(bond.end);
		a1.neighbors.push(bond.hb1);
		a2.neighbors.push(bond.hb2);
	});
};

Struct.prototype.bondInitHalfBonds = function (bid, bond) {
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
	this.bonds.each((bid, bond) => this.bondInitHalfBonds(bid, bond));
};

Struct.prototype.setHbNext = function (hbid, next) {
	this.halfBonds.get(this.halfBonds.get(hbid).contra).next = next;
};

Struct.prototype.halfBondSetAngle = function (hbid, left) {
	var hb = this.halfBonds.get(hbid);
	var hbl = this.halfBonds.get(left);
	hbl.rightCos = Vec2.dot(hbl.dir, hb.dir);
	hbl.rightSin = Vec2.cross(hbl.dir, hb.dir);
	hb.leftCos = Vec2.dot(hbl.dir, hb.dir);
	hb.leftSin = Vec2.cross(hbl.dir, hb.dir);
	hb.leftNeighbor = left;
	hbl.rightNeighbor = hbid;
};

Struct.prototype.atomAddNeighbor = function (hbid) {
	var hb = this.halfBonds.get(hbid);
	var atom = this.atoms.get(hb.begin);
	for (var i = 0; i < atom.neighbors.length; ++i) {
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
	atom.neighbors = atom.neighbors.sort((nei, nei2) => halfBonds.get(nei).ang - halfBonds.get(nei2).ang);

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
	if (!list)
		this.atoms.each(aid => this.atomSortNeighbors(aid), this);
	else
		list.forEach(aid => this.atomSortNeighbors(aid), this);
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
	if (!list)
		this.atoms.each(aid => this.atomUpdateHalfBonds(aid), this);
	else
		list.forEach(aid => this.atomUpdateHalfBonds(aid), this);
};

Struct.prototype.sGroupsRecalcCrossBonds = function () {
	this.sgroups.each((sgid, sg) => {
		sg.xBonds = [];
		sg.neiAtoms = [];
	});

	this.bonds.each((bid, bond) => {
		var a1 = this.atoms.get(bond.begin);
		var a2 = this.atoms.get(bond.end);

		a1.sgs.forEach((sgid) => {
			if (!a2.sgs.has(sgid)) {
				var sg = this.sgroups.get(sgid);
				sg.xBonds.push(bid);
				arrayAddIfMissing(sg.neiAtoms, bond.end);
			}
		});

		a2.sgs.forEach((sgid) => {
			if (!a1.sgs.has(sgid)) {
				var sg = this.sgroups.get(sgid);
				sg.xBonds.push(bid);
				arrayAddIfMissing(sg.neiAtoms, bond.begin);
			}
		});
	});
};

Struct.prototype.sGroupDelete = function (sgid) {
	var sg = this.sgroups.get(sgid);
	for (var i = 0; i < sg.atoms.length; ++i)
		this.atoms.get(sg.atoms[i]).sgs.delete(sgid);
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

/**
 * @param atomSet { Set<number> }
 * @returns {*}
 */
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

	var global = !atomSet || atomSet.size === 0;

	this.atoms.each((aid, atom) => {
		if (global || atomSet.has(aid))
			extend(atom.pp);
	});
	if (global) {
		this.rxnPluses.each((id, item) => {
			extend(item.pp);
		});
		this.rxnArrows.each((id, item) => {
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

	this.atoms.each((aid, atom) => {
		extend(atom.pp);
	});
	return bb;
};

Struct.prototype.getBondLengthData = function () {
	var totalLength = 0;
	var cnt = 0;
	this.bonds.each((bid, bond) => {
		totalLength += Vec2.dist(
			this.atoms.get(bond.begin).pp,
			this.atoms.get(bond.end).pp);
		cnt++;
	}, this);
	return { cnt, totalLength };
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
	this.bonds.each((bid, bond) => {
		if ((bond.begin == begin && bond.end == end) ||
		(bond.end == begin && bond.begin == end))
			bondExists = true;
	});
	return bondExists;
};

function Loop(/* Array of num*/hbs, /* Struct*/struct, /* bool*/convex) {
	this.hbs = hbs; // set of half-bonds involved
	this.dblBonds = 0; // number of double bonds in the loop
	this.aromatic = true;
	this.convex = convex || false;

	hbs.forEach((hb) => {
		const bond = struct.bonds.get(struct.halfBonds.get(hb).bid);
		if (bond.type !== Bond.PATTERN.TYPE.AROMATIC)
			this.aromatic = false;
		if (bond.type === Bond.PATTERN.TYPE.DOUBLE)
			this.dblBonds++;
	});
}

/**
 * @param firstaid { number }
 * @returns { Set<number> }
 */
Struct.prototype.findConnectedComponent = function (firstaid) {
	const map = {};
	const list = [firstaid];
	const ids = new Set();
	while (list.length > 0) {
		const aid = list.pop();
		map[aid] = 1;
		ids.add(aid);
		const atom = this.atoms.get(aid);
		atom.neighbors.forEach((nei) => {
			const neiId = this.halfBonds.get(nei).end;
			if (!ids.has(neiId))
				list.push(neiId);
		});
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
	this.atoms.each((aid) => { map[aid] = -1; });

	var components = [];
	this.atoms.each((aid, atom) => {
		if ((discardExistingFragments || atom.fragment < 0) && map[aid] < 0) {
			var component = this.findConnectedComponent(aid);
			components.push(component);
			component.forEach((aid) => {
				map[aid] = 1;
			});
		}
	});

	return components;
};

/**
 * @param idSet { Set<number> }
 */
Struct.prototype.markFragment = function (idSet) {
	var frag = {};
	var fid = this.frags.add(frag);
	idSet.forEach((aid) => {
		this.atoms.get(aid).fragment = fid;
	});
};

/**
 * @param aid { number }
 */
Struct.prototype.markFragmentByAtomId = function (aid) {
	this.markFragment(this.findConnectedComponent(aid));
};

Struct.prototype.markFragments = function () {
	const components = this.findConnectedComponents();
	components.forEach(comp => this.markFragment(comp));
};

Struct.prototype.scale = function (scale) {
	if (scale !== 1) {
		this.atoms.each((aid, atom) => {
			atom.pp = atom.pp.scaled(scale);
		});

		this.rxnPluses.each((id, item) => {
			item.pp = item.pp.scaled(scale);
		});

		this.rxnArrows.each((id, item) => {
			item.pp = item.pp.scaled(scale);
		});

		this.sgroups.each((id, item) => {
			item.pp = item.pp ? item.pp.scaled(scale) : null;
		});
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
		var set = new Set([hbi.begin, hbi.end]);
		for (var j = i + 2; j < hbs.length; ++j) {
			var hbj = this.halfBonds.get(hbs[j]);
			if (set.has(hbj.begin) || set.has(hbj.end))
				/* eslint-disable no-continue*/
				continue; // skip edges sharing an atom
				/* eslint-enable no-continue*/
			var aj = this.atoms.get(hbj.begin).pp;
			var bj = this.atoms.get(hbj.end).pp;
			if (Box2Abs.segmentIntersection(ai, bi, aj, bj))
				return true;
		}
	}
	return false;
};

// partition a cycle into simple cycles
// TODO: [MK] rewrite the detection algorithm to only find simple ones right away?
Struct.prototype.partitionLoop = function (loop) { // eslint-disable-line max-statements
	const subloops = [];
	let continueFlag = true;
	while (continueFlag) {
		const atomToHalfBond = {}; // map from every atom in the loop to the index of the first half-bond starting from that atom in the uniqHb array
		continueFlag = false;

		for (let l = 0; l < loop.length; ++l) {
			const hbid = loop[l];
			const aid1 = this.halfBonds.get(hbid).begin;
			const aid2 = this.halfBonds.get(hbid).end;
			if (aid2 in atomToHalfBond) { // subloop found
				const s = atomToHalfBond[aid2]; // where the subloop begins
				const subloop = loop.slice(s, l + 1);
				subloops.push(subloop);
				if (l < loop.length) // remove half-bonds corresponding to the subloop
					loop.splice(s, l - s + 1);
				continueFlag = true;
				break;
			}
			atomToHalfBond[aid1] = l;
		}
		if (!continueFlag) subloops.push(loop); // we're done, no more subloops found
	}
	return subloops;
};

Struct.prototype.halfBondAngle = function (hbid1, hbid2) {
	const hba = this.halfBonds.get(hbid1);
	const hbb = this.halfBonds.get(hbid2);
	return Math.atan2(
		Vec2.cross(hba.dir, hbb.dir),
		Vec2.dot(hba.dir, hbb.dir)
	);
};

Struct.prototype.loopIsConvex = function (loop) {
	return loop.every((item, k, loopArr) => {
		const angle = this.halfBondAngle(item, loopArr[(k + 1) % loopArr.length]);
		return angle <= 0;
	});
};

// check whether a loop is on the inner or outer side of the polygon
//  by measuring the total angle between bonds
Struct.prototype.loopIsInner = function (loop) {
	let totalAngle = 2 * Math.PI;
	loop.forEach((hbida, k, loopArr) => {
		const hbidb = loopArr[(k + 1) % loopArr.length];
		const hbb = this.halfBonds.get(hbidb);
		const angle = this.halfBondAngle(hbida, hbidb);
		totalAngle += (hbb.contra === hbida) ? Math.PI : angle; // back and forth along the same edge
	});
	return Math.abs(totalAngle) < Math.PI;
};

Struct.prototype.findLoops = function () {
	const newLoops = [];
	const bondsToMark = new Set();

	/*
	 	Starting from each half-bond not known to be in a loop yet,
	 	follow the 'next' links until the initial half-bond is reached or
	 	the length of the sequence exceeds the number of half-bonds available.
	 	In a planar graph, as long as every bond is a part of some "loop" -
	 	either an outer or an inner one - every iteration either yields a loop
	 	or doesn't start at all. Thus this has linear complexity in the number
	 	of bonds for planar graphs.
	 */

	let hbIdNext, c, loop, loopId;
	this.halfBonds.each((hbId, hb) => {
		if (hb.loop !== -1)
			return;

		for (hbIdNext = hbId, c = 0, loop = []; c <= this.halfBonds.count(); hbIdNext = this.halfBonds.get(hbIdNext).next, ++c) {
			if (!(c > 0 && hbIdNext === hbId)) {
				loop.push(hbIdNext);
				continue; // eslint-disable-line no-continue
			}

			// loop found
			const subloops = this.partitionLoop(loop);
			subloops.forEach((loop) => {
				if (this.loopIsInner(loop) && !this.loopHasSelfIntersections(loop)) {
					/*
                        loop is internal
                        use lowest half-bond id in the loop as the loop id
                        this ensures that the loop gets the same id if it is discarded and then recreated,
                        which in turn is required to enable redrawing while dragging, as actions store item id's
                     */
					loopId = Math.min(...loop);
					this.loops.set(loopId, new Loop(loop, this, this.loopIsConvex(loop)));
				} else {
					loopId = -2;
				}

				loop.forEach((hbid) => {
					this.halfBonds.get(hbid).loop = loopId;
					bondsToMark.add(this.halfBonds.get(hbid).bid);
				});

				if (loopId >= 0)
					newLoops.push(loopId);
			});
			break;
		}
	});

	return {
		newLoops,
		bondsToMark: Array.from(bondsToMark)
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

/**
 * @param sgid { number }
 * @param aid { number }
 */
Struct.prototype.atomAddToSGroup = function (sgid, aid) {
	// TODO: [MK] make sure the addition does not break the hierarchy?
	SGroup.addAtom(this.sgroups.get(sgid), aid);
	this.atoms.get(aid).sgs.add(sgid);
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
			this.loops.each((id, item) => {
				if (item.hbs.includes(atom.neighbors[i]) && item.hbs.length % 2 === 1)
					oddLoop = true;
			});
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
	const conn = this.calcConn(aid);
	const atom = this.atoms.get(aid);
	atom.badConn = false;
	if (conn < 0 || atom.isQuery()) {
		atom.implicitH = 0;
		return;
	}
	if (atom.explicitValence >= 0) {
		const elem = element.map[atom.label];
		atom.implicitH = elem !== null ? atom.explicitValence - atom.calcValenceMinusHyd(conn) : 0;
		if (atom.implicitH < 0) {
			atom.implicitH = 0;
			atom.badConn = true;
		}
	} else {
		atom.calcValence(conn);
	}
};

Struct.prototype.setImplicitHydrogen = function (list) {
	this.sgroups.each((id, item) => {
		if (item.data.fieldName === 'MRV_IMPLICIT_H')
			this.atoms.get(item.atoms[0]).hasImplicitH = true;
	});

	if (!list)
		this.atoms.each(aid => this.calcImplicitHydrogen(aid), this);
	else
		list.forEach(aid => this.calcImplicitHydrogen(aid));
};

Struct.prototype.getComponents = function () { // eslint-disable-line max-statements
	/* saver */
	const connectedComponents = this.findConnectedComponents(true);
	const barriers = [];
	let arrowPos = null;

	this.rxnArrows.each((id, item) => { // there's just one arrow
		arrowPos = item.pp.x;
	});

	this.rxnPluses.each((id, item) => {
		barriers.push(item.pp.x);
	});

	if (arrowPos !== null)
		barriers.push(arrowPos);

	barriers.sort((a, b) => a - b);

	const components = [];

	connectedComponents.forEach((component) => {
		const bb = this.getCoordBoundingBox(component);
		const c = Vec2.lc2(bb.min, 0.5, bb.max, 0.5);
		let j = 0;

		while (c.x > barriers[j])
			++j;

		components[j] = components[j] || new Set();
		components[j].union(component);
	});

	const submolTexts = [];
	const reactants = [];
	const products = [];

	components.forEach((component) => {
		if (!component) {
			submolTexts.push('');
			return; // eslint-disable-line no-continue
		}

		const rxnFragmentType = this.defineRxnFragmentTypeForAtomset(component, arrowPos);

		if (rxnFragmentType === 1)
			reactants.push(component);
		else
			products.push(component);
	});

	return {
		reactants,
		products
	};
};

/**
 * @param atomset { Set<number> }
 * @param arrowpos { number }
 * @returns { number }
 */
Struct.prototype.defineRxnFragmentTypeForAtomset = function (atomset, arrowpos) {
	const bb = this.getCoordBoundingBox(atomset);
	const c = Vec2.lc2(bb.min, 0.5, bb.max, 0.5);
	return c.x < arrowpos ? 1 : 2;
};

Struct.prototype.getBondFragment = function (bid) {
	const aid = this.bonds.get(bid).begin;
	return this.atoms.get(aid).fragment;
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
	Atom,
	AtomList,
	Bond,
	SGroup,
	RGroup,
	RxnPlus,
	RxnArrow
});
