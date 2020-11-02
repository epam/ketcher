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
import Vec2 from '../../util/vec2';
import Box2Abs from '../../util/box2abs';

import element from '../element';

import Atom, { radicalElectrons } from './atom';
import AtomList from './atomlist';
import Bond from './bond';
import SGroup from './sgroup';
import RGroup from './rgroup';
import SGroupForest from './sgforest';

function Struct() {
	this.atoms = new Pool();
	this.bonds = new Pool();
	this.sgroups = new Pool();
	this.halfBonds = new Pool();
	this.loops = new Pool();
	this.isChiral = false;
	this.isReaction = false;
	this.rxnArrows = new Pool();
	this.rxnPluses = new Pool();
	this.frags = new Pool();
	this.rgroups = new Pool();
	this.name = '';
	this.sGroupForest = new SGroupForest(this);
}

Struct.prototype.hasRxnProps = function () {
	return this.atoms.find((aid, atom) => atom.hasRxnProps()) ||
		this.bonds.find((bid, bond) => bond.hasRxnProps());
};

Struct.prototype.hasRxnArrow = function () {
	return this.rxnArrows.size > 0;
};

Struct.prototype.isBlank = function () {
	return this.atoms.size === 0 &&
	this.rxnArrows.size === 0 &&
	this.rxnPluses.size === 0 && !this.isChiral;
};

/**
 * @param atomSet { Pile<number>? }
 * @param bondSet { Pile<number>? }
 * @param dropRxnSymbols { boolean? }
 * @param aidMap { Map<number, number>? }
 * @returns { Struct }
 */
Struct.prototype.clone = function (atomSet, bondSet, dropRxnSymbols, aidMap) {
	return this.mergeInto(new Struct(), atomSet, bondSet, dropRxnSymbols, false, aidMap);
};

Struct.prototype.getScaffold = function () {
	const atomSet = new Pile();
	this.atoms.forEach((atom, aid) => { atomSet.add(aid); });

	this.rgroups.forEach((rg) => {
		rg.frags.forEach((fnum, fid) => {
			this.atoms.forEach((atom, aid) => {
				if (atom.fragment === fid)
					atomSet.delete(aid);
			});
		});
	});

	return this.clone(atomSet);
};

Struct.prototype.getFragmentIds = function (fid) {
	const atomSet = new Pile();

	this.atoms.forEach((atom, aid) => {
		if (atom.fragment === fid)
			atomSet.add(aid);
	});

	return atomSet;
};

Struct.prototype.getFragment = function (fid) {
	return this.clone(this.getFragmentIds(fid));
};

/**
 * @param cp { Struct } - container for merging
 * @param atomSet { Pile<number>? }
 * @param bondSet { Pile<number>? }
 * @param dropRxnSymbols { boolean? }
 * @param keepAllRGroups { boolean? }
 * @param aidMap { Map<number, number>? }
 * @returns { Struct }
 */
Struct.prototype.mergeInto = function (cp, atomSet, bondSet, dropRxnSymbols, keepAllRGroups, aidMap) { // eslint-disable-line max-params, max-statements
	atomSet = atomSet || new Pile(this.atoms.keys());
	bondSet = bondSet || new Pile(this.bonds.keys());
	aidMap = aidMap || new Map();

	bondSet = bondSet.filter((bid) => {
		const bond = this.bonds.get(bid);
		return atomSet.has(bond.begin) && atomSet.has(bond.end);
	});

	const fidMask = new Pile();

	this.atoms.forEach((atom, aid) => {
		if (atomSet.has(aid))
			fidMask.add(atom.fragment);
	});

	const fidMap = new Map();
	this.frags.forEach((frag, fid) => {
		if (fidMask.has(fid))
			fidMap.set(fid, cp.frags.add(Object.assign({}, frag)));
	});

	const rgroupsIds = [];
	this.rgroups.forEach((rgroup, rgid) => {
		let keepGroup = keepAllRGroups;
		if (!keepGroup) {
			rgroup.frags.forEach((fnum, fid) => {
				rgroupsIds.push(fid);
				if (fidMask.has(fid))
					keepGroup = true;
			});

			if (!keepGroup)
				return;
		}

		const rg = cp.rgroups.get(rgid);
		if (rg) {
			rgroup.frags.forEach((fnum, fid) => {
				rgroupsIds.push(fid);
				if (fidMask.has(fid))
					rg.frags.add(fidMap.get(fid));
			});
		} else {
			cp.rgroups.set(rgid, rgroup.clone(fidMap));
		}
	});

	// atoms in not RGroup
	this.atoms.forEach((atom, aid) => {
		if (atomSet.has(aid) && rgroupsIds.indexOf(atom.fragment) === -1)
			aidMap.set(aid, cp.atoms.add(atom.clone(fidMap)));
	});
	// atoms in RGroup
	this.atoms.forEach((atom, aid) => {
		if (atomSet.has(aid) && rgroupsIds.indexOf(atom.fragment) !== -1)
			aidMap.set(aid, cp.atoms.add(atom.clone(fidMap)));
	});

	const bidMap = new Map();
	this.bonds.forEach((bond, bid) => {
		if (bondSet.has(bid))
			bidMap.set(bid, cp.bonds.add(bond.clone(aidMap)));
	});

	this.sgroups.forEach((sg) => {
		if (sg.atoms.some(aid => !atomSet.has(aid)))
			return;

		sg = SGroup.clone(sg, aidMap);
		const id = cp.sgroups.add(sg);
		sg.id = id;

		sg.atoms.forEach((aid) => {
			cp.atoms.get(aid).sgs.add(id);
		});

		if (sg.type === 'DAT')
			cp.sGroupForest.insert(sg.id, -1, []);
		else
			cp.sGroupForest.insert(sg.id);
	});

	cp.isChiral = cp.isChiral || this.isChiral;

	if (!dropRxnSymbols) {
		cp.isReaction = this.isReaction;
		this.rxnArrows.forEach((item) => {
			cp.rxnArrows.add(item.clone());
		});
		this.rxnPluses.forEach((item) => {
			cp.rxnPluses.add(item.clone());
		});
	}

	return cp;
};

/**
 * @param begin { number }
 * @param end { number }
 * @return { number|null }
 */
Struct.prototype.findBondId = function (begin, end) {
	return this.bonds.find((bid, bond) =>
		(bond.begin === begin && bond.end === end) || (bond.begin === end && bond.end === begin));
};

/**
 * @param begin [ number }
 * @param end { number }
 * @param bid { number }
 * @constructor
 */
function HalfBond(begin, end, bid) {
	console.assert(arguments.length === 3, 'Invalid parameter number!');

	this.begin = begin;
	this.end = end;
	this.bid = bid;

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
	this.atoms.forEach((atom) => {
		atom.neighbors = [];
	});

	this.bonds.forEach((bond) => {
		const a1 = this.atoms.get(bond.begin);
		const a2 = this.atoms.get(bond.end);
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
	const hb1 = this.halfBonds.get(bond.hb1);
	const hb2 = this.halfBonds.get(bond.hb2);
	hb1.contra = bond.hb2;
	hb2.contra = bond.hb1;
};

Struct.prototype.halfBondUpdate = function (hbid) {
	const hb = this.halfBonds.get(hbid);
	const p1 = this.atoms.get(hb.begin).pp;
	const p2 = this.atoms.get(hb.end).pp;
	const d = Vec2.diff(p2, p1).normalized();
	hb.dir = Vec2.dist(p2, p1) > 1e-4 ? d : new Vec2(1, 0);
	hb.norm = hb.dir.turnLeft();
	hb.ang = hb.dir.oxAngle();
	if (hb.loop < 0)
		hb.loop = -1;
};

Struct.prototype.initHalfBonds = function () {
	this.halfBonds.clear();
	this.bonds.forEach((bond, bid) => {
		this.bondInitHalfBonds(bid, bond);
	});
};

Struct.prototype.setHbNext = function (hbid, next) {
	this.halfBonds.get(this.halfBonds.get(hbid).contra).next = next;
};

Struct.prototype.halfBondSetAngle = function (hbid, left) {
	const hb = this.halfBonds.get(hbid);
	const hbl = this.halfBonds.get(left);

	hbl.rightCos = Vec2.dot(hbl.dir, hb.dir);
	hb.leftCos = Vec2.dot(hbl.dir, hb.dir);

	hbl.rightSin = Vec2.cross(hbl.dir, hb.dir);
	hb.leftSin = Vec2.cross(hbl.dir, hb.dir);

	hb.leftNeighbor = left;
	hbl.rightNeighbor = hbid;
};

Struct.prototype.atomAddNeighbor = function (hbid) {
	const hb = this.halfBonds.get(hbid);
	const atom = this.atoms.get(hb.begin);

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
	const atom = this.atoms.get(aid);
	const halfBonds = this.halfBonds;

	atom.neighbors
		.sort((nei, nei2) => halfBonds.get(nei).ang - halfBonds.get(nei2).ang)
		.forEach((nei, i) => {
			const nextNei = atom.neighbors[(i + 1) % atom.neighbors.length];
			this.halfBonds.get(this.halfBonds.get(nei).contra).next = nextNei;
			this.halfBondSetAngle(nextNei, nei);
		});
};

Struct.prototype.sortNeighbors = function (list) {
	if (!list) {
		this.atoms.forEach((atom, aid) => {
			this.atomSortNeighbors(aid);
		});
	} else {
		list.forEach((aid) => {
			this.atomSortNeighbors(aid);
		});
	}
};

Struct.prototype.atomUpdateHalfBonds = function (aid) {
	this.atoms.get(aid).neighbors.forEach((hbid) => {
		this.halfBondUpdate(hbid);
		this.halfBondUpdate(this.halfBonds.get(hbid).contra);
	});
};

Struct.prototype.updateHalfBonds = function (list) {
	if (!list) {
		this.atoms.forEach((atom, aid) => {
			this.atomUpdateHalfBonds(aid);
		});
	} else {
		list.forEach((aid) => {
			this.atomUpdateHalfBonds(aid);
		});
	}
};

Struct.prototype.sGroupsRecalcCrossBonds = function () {
	this.sgroups.forEach((sg) => {
		sg.xBonds = [];
		sg.neiAtoms = [];
	});

	this.bonds.forEach((bond, bid) => {
		const a1 = this.atoms.get(bond.begin);
		const a2 = this.atoms.get(bond.end);

		a1.sgs.forEach((sgid) => {
			if (!a2.sgs.has(sgid)) {
				const sg = this.sgroups.get(sgid);
				sg.xBonds.push(bid);
				arrayAddIfMissing(sg.neiAtoms, bond.end);
			}
		});

		a2.sgs.forEach((sgid) => {
			if (!a1.sgs.has(sgid)) {
				const sg = this.sgroups.get(sgid);
				sg.xBonds.push(bid);
				arrayAddIfMissing(sg.neiAtoms, bond.begin);
			}
		});
	});
};

Struct.prototype.sGroupDelete = function (sgid) {
	this.sgroups.get(sgid).atoms.forEach((atom) => {
		this.atoms.get(atom).sgs.delete(sgid);
	});

	this.sGroupForest.remove(sgid);
	this.sgroups.delete(sgid);
};

Struct.prototype.atomSetPos = function (id, pp) {
	const item = this.atoms.get(id);
	item.pp = pp;
};

Struct.prototype.rxnPlusSetPos = function (id, pp) {
	const item = this.rxnPluses.get(id);
	item.pp = pp;
};

Struct.prototype.rxnArrowSetPos = function (id, pp) {
	const item = this.rxnArrows.get(id);
	item.pp = pp;
};

/**
 * @param atomSet { Pile<number> }
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

	this.atoms.forEach((atom, aid) => {
		if (global || atomSet.has(aid))
			extend(atom.pp);
	});
	if (global) {
		this.rxnPluses.forEach((item) => {
			extend(item.pp);
		});
		this.rxnArrows.forEach((item) => {
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

	this.atoms.forEach((atom) => {
		extend(atom.pp);
	});
	return bb;
};

Struct.prototype.getBondLengthData = function () {
	let totalLength = 0;
	let cnt = 0;
	this.bonds.forEach((bond) => {
		totalLength += Vec2.dist(
			this.atoms.get(bond.begin).pp,
			this.atoms.get(bond.end).pp
		);
		cnt++;
	});
	return { cnt, totalLength };
};

Struct.prototype.getAvgBondLength = function () {
	const bld = this.getBondLengthData();
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
	const key = this.bonds.find((bid, bond) =>
		(bond.begin === begin && bond.end === end) ||
		(bond.end === begin && bond.begin === end));

	return key !== undefined;
};

/**
 * @param hbs { Array<number> }
 * @param struct < Struct }
 * @param isConvex { boolean }
 * @constructor
 */
function Loop(hbs, struct, isConvex) {
	this.hbs = hbs; // set of half-bonds involved
	this.dblBonds = 0; // number of double bonds in the loop
	this.aromatic = true;
	this.convex = isConvex || false;

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
 * @returns { Pile<number> }
 */
Struct.prototype.findConnectedComponent = function (firstaid) {
	const list = [firstaid];
	const ids = new Pile();
	while (list.length > 0) {
		const aid = list.pop();
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
	if (!this.halfBonds.size) {
		this.initHalfBonds();
		this.initNeighbors();
		this.updateHalfBonds(Array.from(this.atoms.keys()));
		this.sortNeighbors(Array.from(this.atoms.keys()));
	}

	let addedAtoms = new Pile();

	const components = [];
	this.atoms.forEach((atom, aid) => {
		if ((discardExistingFragments || atom.fragment < 0) && !addedAtoms.has(aid)) {
			const component = this.findConnectedComponent(aid);
			components.push(component);
			addedAtoms = addedAtoms.union(component);
		}
	});

	return components;
};

/**
 * @param idSet { Pile<number> }
 */
Struct.prototype.markFragment = function (idSet) {
	const frag = {};
	const fid = this.frags.add(frag);

	idSet.forEach((aid) => {
		this.atoms.get(aid).fragment = fid;
	});
};

Struct.prototype.markFragments = function () {
	const components = this.findConnectedComponents();
	components.forEach((comp) => {
		this.markFragment(comp);
	});
};

Struct.prototype.scale = function (scale) {
	if (scale === 1)
		return;

	this.atoms.forEach((atom) => {
		atom.pp = atom.pp.scaled(scale);
	});

	this.rxnPluses.forEach((item) => {
		item.pp = item.pp.scaled(scale);
	});

	this.rxnArrows.forEach((item) => {
		item.pp = item.pp.scaled(scale);
	});

	this.sgroups.forEach((item) => {
		item.pp = item.pp ? item.pp.scaled(scale) : null;
	});
};

Struct.prototype.rescale = function () {
	let avg = this.getAvgBondLength();
	if (avg < 0 && !this.isReaction) // TODO [MK] this doesn't work well for reactions as the distances between
		// the atoms in different components are generally larger than those between atoms of a single component
		// (KETCHER-341)
		avg = this.getAvgClosestAtomDistance();
	if (avg < 1e-3)
		avg = 1;

	const scale = 1 / avg;
	this.scale(scale);
};

Struct.prototype.loopHasSelfIntersections = function (hbs) {
	for (let i = 0; i < hbs.length; ++i) {
		const hbi = this.halfBonds.get(hbs[i]);
		const ai = this.atoms.get(hbi.begin).pp;
		const bi = this.atoms.get(hbi.end).pp;
		const set = new Pile([hbi.begin, hbi.end]);

		for (let j = i + 2; j < hbs.length; ++j) {
			const hbj = this.halfBonds.get(hbs[j]);
			if (set.has(hbj.begin) || set.has(hbj.end))
				continue; // skip edges sharing an atom

			const aj = this.atoms.get(hbj.begin).pp;
			const bj = this.atoms.get(hbj.end).pp;

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

/**
 * @returns { {
 * 		newLoops: Array <number>,
 * 		bondsToMark: Array<number>
 *   } }
 */
Struct.prototype.findLoops = function () {
	const newLoops = [];
	const bondsToMark = new Pile();

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
	this.halfBonds.forEach((hb, hbId) => {
		if (hb.loop !== -1)
			return;

		for (hbIdNext = hbId, c = 0, loop = []; c <= this.halfBonds.size; hbIdNext = this.halfBonds.get(hbIdNext).next, ++c) {
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
	this.updateHalfBonds(Array.from(this.atoms.keys()));
	this.sortNeighbors(Array.from(this.atoms.keys()));
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

Struct.prototype.calcConn = function (atom) {
	let conn = 0;
	for (let i = 0; i < atom.neighbors.length; ++i) {
		const hb = this.halfBonds.get(atom.neighbors[i]);
		const bond = this.bonds.get(hb.bid);
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
			if (atom.neighbors.length === 1) return [-1, true];
			return [atom.neighbors.length, true];
		default:
			return [-1, false];
		}
	}
	return [conn, false];
};

Struct.prototype.calcImplicitHydrogen = function (aid) {
	const atom = this.atoms.get(aid);
	const [conn, isAromatic] = this.calcConn(atom);
	let correctConn = conn;
	atom.badConn = false;

	if (isAromatic) {
		if (atom.label === 'C' && atom.charge === 0) {
			if (conn === 3) {
				atom.implicitH = -radicalElectrons(atom.radical);
				return;
			}
			if (conn === 2) {
				atom.implicitH = 1 - radicalElectrons(atom.radical);
				return;
			}
		} else if (
			(atom.label === 'O' && atom.charge === 0) ||
			(atom.label === 'N' && atom.charge === 0 && conn === 3) ||
			(atom.label === 'N' && atom.charge === 1 && conn === 3) ||
			(atom.label === 'S' && atom.charge === 0 && conn === 3)
		) {
			atom.implicitH = 0;
			return;
		} else if (!atom.hasImplicitH) {
			correctConn++;
		}
	}

	if (correctConn < 0 || atom.isQuery()) {
		atom.implicitH = 0;
		return;
	}

	if (atom.explicitValence >= 0) {
		const elem = element.map[atom.label];
		atom.implicitH = elem !== null ? atom.explicitValence - atom.calcValenceMinusHyd(correctConn) : 0;
		if (atom.implicitH < 0) {
			atom.implicitH = 0;
			atom.badConn = true;
		}
	} else {
		atom.calcValence(correctConn);
	}
};

Struct.prototype.setImplicitHydrogen = function (list) {
	this.sgroups.forEach((item) => {
		if (item.data.fieldName === 'MRV_IMPLICIT_H')
			this.atoms.get(item.atoms[0]).hasImplicitH = true;
	});

	if (!list) {
		this.atoms.forEach((atom, aid) => {
			this.calcImplicitHydrogen(aid);
		});
	} else {
		list.forEach((aid) => {
			this.calcImplicitHydrogen(aid);
		});
	}
};

/**
 * @return {{reactants: Array<Pile<number>>, products: Array<Pile<number>>}}
 */
Struct.prototype.getComponents = function () { // eslint-disable-line max-statements
	/* saver */
	const connectedComponents = this.findConnectedComponents(true);
	const barriers = [];
	let arrowPos = null;

	this.rxnArrows.forEach((item) => { // there's just one arrow
		arrowPos = item.pp.x;
	});

	this.rxnPluses.forEach((item) => {
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

		components[j] = components[j] || new Pile();
		components[j] = components[j].union(component);
	});

	const submolTexts = [];
	const reactants = [];
	const products = [];

	components.forEach((component) => {
		if (!component) {
			submolTexts.push('');
			return;
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
 * @param atomset { Pile<number> }
 * @param arrowpos { number }
 * @returns { number }
 */
Struct.prototype.defineRxnFragmentTypeForAtomset = function (atomset, arrowpos) {
	const bb = this.getCoordBoundingBox(atomset);
	const c = Vec2.lc2(bb.min, 0.5, bb.max, 0.5);
	return c.x < arrowpos ? 1 : 2;
};

/**
 * @param bid { number }
 * @returns { number }
 */
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

export default Struct;
export {
	Atom,
	AtomList,
	Bond,
	SGroup,
	RGroup,
	RxnPlus,
	RxnArrow
};
