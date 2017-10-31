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

const Set = require('../util/set');
const Vec2 = require('../util/vec2');
const op = require('./op');
const utils = require('./tool/utils');

const Struct = require('../chem/struct');
const closest = require('./closest');
const { uniq, difference } = require('lodash');

//
// Undo/redo actions
//
function Action() {
	this.operations = [];
}

Action.prototype.addOp = function (operation, restruct) {
	if (!restruct || !operation.isDummy(restruct))
		this.operations.push(operation);

	return operation;
};

Action.prototype.mergeWith = function (action) {
	this.operations = this.operations.concat(action.operations);
	return this;
};

// Perform action and return inverted one
Action.prototype.perform = function (restruct) {
	const action = new Action();

	this.operations.forEach(function (operation) {
		action.addOp(operation.perform(restruct));
	});

	action.operations.reverse();
	return action;
};

Action.prototype.isDummy = function (restruct) {
	return this.operations.find(function (operation) {
		return restruct ? !operation.isDummy(restruct) : true; // TODO [RB] the condition is always true for op.* operations
	}) === undefined;
};

// Add action operation to remove atom from s-group if needed
function removeAtomFromSgroupIfNeeded(action, restruct, id) {
	var sgroups = atomGetSGroups(restruct, id);

	if (sgroups.length > 0) {
		sgroups.forEach(function (sid) {
			action.addOp(new op.SGroupAtomRemove(sid, id));
		});

		return true;
	}

	return false;
}

// Add action operations to remove whole s-group if needed
function removeSgroupIfNeeded(action, restruct, atoms) {
	var struct = restruct.molecule;
	var sgCounts = {};

	atoms.forEach(function (id) {
		var sgroups = atomGetSGroups(restruct, id);

		sgroups.forEach(function (sid) {
			sgCounts[sid] = sgCounts[sid] ? (sgCounts[sid] + 1) : 1;
		});
	});

	for (var key in sgCounts) {
		var sid = parseInt(key);
		var sG = restruct.sgroups.get(sid).item;
		var sgAtoms = Struct.SGroup.getAtoms(restruct.molecule, sG);

		if (sgAtoms.length === sgCounts[sid]) {
			// delete whole s-group
			var sgroup = struct.sgroups.get(sid);
			action.mergeWith(sGroupAttributeAction(sid, sgroup.getAttrs()));
			action.addOp(new op.SGroupRemoveFromHierarchy(sid));
			action.addOp(new op.SGroupDelete(sid));
		}
	}
}

function fromSgroupMove(restruct, selectedAtoms, d) {
	const action = new Action();

	const sgroups = restruct.molecule.sgroups.values()
		.filter(sg => !sg.data.attached && !sg.data.absolute);

	if (sgroups.length === 0)
		return action;

	return sgroups.reduce((acc, sg) => {
		if (difference(sg.atoms, selectedAtoms).length === 0)
			acc.addOp(new op.SGroupDataMove(sg.id, d));

		return acc;
	}, action);
}

function fromMultipleMove(restruct, lists, d) {
	d = new Vec2(d);

	const action = new Action();
	const struct = restruct.molecule;
	const loops = Set.empty();
	const atomsToInvalidate = Set.empty();

	if (lists.atoms) {
		const atomSet = Set.fromList(lists.atoms);
		const bondlist = [];

		restruct.bonds.each((bid, bond) => {
			if (Set.contains(atomSet, bond.b.begin) && Set.contains(atomSet, bond.b.end)) {
				bondlist.push(bid);
				// add all adjacent loops
				// those that are not completely inside the structure will get redrawn anyway
				['hb1', 'hb2'].forEach(hb => {
					const loop = struct.halfBonds.get(bond.b[hb]).loop;
					if (loop >= 0)
						Set.add(loops, loop);
				});
				return;
			}

			if (Set.contains(atomSet, bond.b.begin)) {
				Set.add(atomsToInvalidate, bond.b.begin);
				return;
			}

			if (Set.contains(atomSet, bond.b.end))
				Set.add(atomsToInvalidate, bond.b.end);
		}, this);

		bondlist.forEach(bond => action.addOp(new op.BondMove(bond, d)));

		Set.each(loops, loopId => {
			if (restruct.reloops.get(loopId) && restruct.reloops.get(loopId).visel) // hack
				action.addOp(new op.LoopMove(loopId, d));
		}, this);

		lists.atoms.forEach(aid => action.addOp(new op.AtomMove(aid, d, !Set.contains(atomsToInvalidate, aid))));

		if (lists.sgroupData.length === 0)
			action.mergeWith(fromSgroupMove(restruct, lists.atoms, d));
	}

	if (lists.rxnArrows)
		lists.rxnArrows.forEach(rxnArrow => action.addOp(new op.RxnArrowMove(rxnArrow, d, true)));

	if (lists.rxnPluses)
		lists.rxnPluses.forEach(rxnPulse => action.addOp(new op.RxnPlusMove(rxnPulse, d, true)));

	if (lists.sgroupData)
		lists.sgroupData.forEach(sgData => action.addOp(new op.SGroupDataMove(sgData, d)));

	if (lists.chiralFlags)
		lists.chiralFlags.forEach(() => action.addOp(new op.ChiralFlagMove(d)));

	return action.perform(restruct);
}

function fromAtomsAttrs(restruct, ids, attrs, reset) {
	var action = new Action();
	(typeof (ids) === 'number' ? [ids] : ids).forEach(function (id) {
		for (var key in Struct.Atom.attrlist) {
			var value;
			if (key in attrs)
				value = attrs[key];
			else if (reset)
				value = Struct.Atom.attrGetDefault(key);
			else
				continue; // eslint-disable-line no-continue
			action.addOp(new op.AtomAttr(id, key, value));
		}
		if (!reset && 'label' in attrs && attrs.label != null && attrs.label !== 'L#' && !attrs['atomList'])
			action.addOp(new op.AtomAttr(id, 'atomList', null));
	}, this);
	return action.perform(restruct);
}

function fromBondAttrs(restruct, id, attrs, flip, reset) { // eslint-disable-line max-params
	var action = new Action();

	for (var key in Struct.Bond.attrlist) {
		var value;
		if (key in attrs)
			value = attrs[key];
		else if (reset)
			value = Struct.Bond.attrGetDefault(key);
		else
			continue; // eslint-disable-line no-continue
		action.addOp(new op.BondAttr(id, key, value));
	}
	if (flip)
		action.mergeWith(toBondFlipping(restruct.molecule, id));
	return action.perform(restruct);
}

function fromAtomAddition(resctruct, pos, atom) {
	atom = Object.assign({}, atom);
	var action = new Action();
	atom.fragment = action.addOp(new op.FragmentAdd().perform(resctruct)).frid;
	action.addOp(new op.AtomAdd(atom, pos).perform(resctruct));
	return action;
}

function mergeFragments(action, restruct, frid, frid2) {
	var struct = restruct.molecule;
	if (frid2 != frid && (typeof frid2 === 'number')) {
		var rgid = Struct.RGroup.findRGroupByFragment(struct.rgroups, frid2);
		if (!(typeof rgid === 'undefined'))
			action.mergeWith(fromRGroupFragment(restruct, null, frid2));

		struct.atoms.each(function (aid, atom) {
			if (atom.fragment == frid2)
				action.addOp(new op.AtomAttr(aid, 'fragment', frid).perform(restruct));
		});
		action.addOp(new op.FragmentDelete(frid2).perform(restruct));
	}
}

// Get new atom id/label and pos for bond being added to existing atom
function atomForNewBond(restruct, id) { // eslint-disable-line max-statements
	var neighbours = [];
	var pos = atomGetPos(restruct, id);

	atomGetNeighbors(restruct, id).forEach(function (nei) {
		var neiPos = atomGetPos(restruct, nei.aid);

		if (Vec2.dist(pos, neiPos) < 0.1)
			return;

		neighbours.push({ id: nei.aid, v: Vec2.diff(neiPos, pos) });
	});

	neighbours.sort(function (nei1, nei2) {
		return Math.atan2(nei1.v.y, nei1.v.x) - Math.atan2(nei2.v.y, nei2.v.x);
	});

	var i;
	var maxI = 0;
	var angle;
	var maxAngle = 0;

	// TODO: impove layout: tree, ...

	for (i = 0; i < neighbours.length; i++) {
		angle = Vec2.angle(neighbours[i].v, neighbours[(i + 1) % neighbours.length].v);

		if (angle < 0)
			angle += 2 * Math.PI;

		if (angle > maxAngle) {
			maxI = i;
			maxAngle = angle;
		}
	}

	var v = new Vec2(1, 0);

	if (neighbours.length > 0) {
		if (neighbours.length == 1) {
			maxAngle = -(4 * Math.PI / 3);

			// zig-zag
			var nei = atomGetNeighbors(restruct, id)[0];
			if (atomGetDegree(restruct, nei.aid) > 1) {
				var neiNeighbours = [];
				var neiPos = atomGetPos(restruct, nei.aid);
				var neiV = Vec2.diff(pos, neiPos);
				var neiAngle = Math.atan2(neiV.y, neiV.x);

				atomGetNeighbors(restruct, nei.aid).forEach(function (neiNei) {
					var neiNeiPos = atomGetPos(restruct, neiNei.aid);

					if (neiNei.bid == nei.bid || Vec2.dist(neiPos, neiNeiPos) < 0.1)
						return;

					var vDiff = Vec2.diff(neiNeiPos, neiPos);
					var ang = Math.atan2(vDiff.y, vDiff.x) - neiAngle;

					if (ang < 0)
						ang += 2 * Math.PI;

					neiNeighbours.push(ang);
				});
				neiNeighbours.sort(function (nei1, nei2) {
					return nei1 - nei2;
				});

				if (neiNeighbours[0] <= Math.PI * 1.01 && neiNeighbours[neiNeighbours.length - 1] <= 1.01 * Math.PI)
					maxAngle *= -1;
			}
		}

		angle = (maxAngle / 2) + Math.atan2(neighbours[maxI].v.y, neighbours[maxI].v.x);

		v = v.rotate(angle);
	}

	v.add_(pos); // eslint-disable-line no-underscore-dangle

	var a = closest.atom(restruct, v, null, 0.1);

	if (a == null)
		a = { label: 'C' };
	else
		a = a.id;

	return { atom: a, pos: v };
}

function fromBondAddition(restruct, bond, begin, end, pos, pos2) { // eslint-disable-line max-params, max-statements
	if (end === undefined) {
		var atom = atomForNewBond(restruct, begin);
		end = atom.atom;
		pos = atom.pos;
	}
	var action = new Action();

	var frid = null;

	if (!(typeof begin === "number")) {
		if (typeof end === "number")
			frid = atomGetAttr(restruct, end, 'fragment');
	} else {
		frid = atomGetAttr(restruct, begin, 'fragment');
		if (typeof end === "number") {
			var frid2 = atomGetAttr(restruct, end, 'fragment');
			mergeFragments(action, restruct, frid, frid2);
		}
	}

	if (frid == null)
		frid = action.addOp(new op.FragmentAdd().perform(restruct)).frid;

	if (!(typeof begin === "number")) {
		begin.fragment = frid;
		begin = action.addOp(new op.AtomAdd(begin, pos).perform(restruct)).data.aid;

		pos = pos2;
	} else if (atomGetAttr(restruct, begin, 'label') === '*') {
		action.addOp(new op.AtomAttr(begin, 'label', 'C').perform(restruct));
	}


	if (!(typeof end === "number")) {
		end.fragment = frid;
		// TODO: <op>.data.aid here is a hack, need a better way to access the id of a newly created atom
		end = action.addOp(new op.AtomAdd(end, pos).perform(restruct)).data.aid;
		if (typeof begin === "number") {
			atomGetSGroups(restruct, begin).forEach(function (sid) {
				action.addOp(new op.SGroupAtomAdd(sid, end).perform(restruct));
			}, this);
		}
	} else if (atomGetAttr(restruct, end, 'label') === '*') {
		action.addOp(new op.AtomAttr(end, 'label', 'C').perform(restruct));
	}

	var bid = action.addOp(new op.BondAdd(begin, end, bond).perform(restruct)).data.bid;

	action.operations.reverse();

	return [action, begin, end, bid];
}

function fromArrowAddition(restruct, pos) {
	var action = new Action();
	if (restruct.molecule.rxnArrows.count() < 1)
		action.addOp(new op.RxnArrowAdd(pos).perform(restruct));
	return action;
}

function fromArrowDeletion(restruct, id) {
	var action = new Action();
	action.addOp(new op.RxnArrowDelete(id));
	return action.perform(restruct);
}

function fromChiralFlagAddition(restruct, pos) {  // eslint-disable-line no-unused-vars
	var action = new Action();
	var struct = restruct.molecule;
	if (restruct.chiralFlags.count() < 1) {
		if (!pos) {
			var bb = struct.getCoordBoundingBox();
			var posY = !struct.isBlank() ? bb.min.y - 1 : bb.min.y + 1;
			pos = new Vec2(bb.max.x, posY);
		}
		action.addOp(new op.ChiralFlagAdd(pos).perform(restruct));
	}
	return action;
}

function fromChiralFlagDeletion(restruct) {
	var action = new Action();
	action.addOp(new op.ChiralFlagDelete());
	return action.perform(restruct);
}

function fromPlusAddition(restruct, pos) {
	var action = new Action();
	action.addOp(new op.RxnPlusAdd(pos).perform(restruct));
	return action;
}

function fromPlusDeletion(restruct, id) {
	var action = new Action();
	action.addOp(new op.RxnPlusDelete(id));
	return action.perform(restruct);
}

function fromAtomDeletion(restruct, id) {
	var action = new Action();
	var atomsToRemove = [];

	var frid = restruct.molecule.atoms.get(id).fragment;

	atomGetNeighbors(restruct, id).forEach(function (nei) {
		action.addOp(new op.BondDelete(nei.bid));// [RB] !!
		if (atomGetDegree(restruct, nei.aid) == 1) {
			if (removeAtomFromSgroupIfNeeded(action, restruct, nei.aid))
				atomsToRemove.push(nei.aid);

			action.addOp(new op.AtomDelete(nei.aid));
		}
	}, this);

	if (removeAtomFromSgroupIfNeeded(action, restruct, id))
		atomsToRemove.push(id);

	action.addOp(new op.AtomDelete(id));

	removeSgroupIfNeeded(action, restruct, atomsToRemove);

	action = action.perform(restruct);

	action.mergeWith(new FromFragmentSplit(restruct, frid));

	return action;
}

function fromBondDeletion(restruct, id) {
	var action = new Action();
	var bond = restruct.molecule.bonds.get(id);
	var frid = restruct.molecule.atoms.get(bond.begin).fragment;
	var atomsToRemove = [];

	action.addOp(new op.BondDelete(id));

	if (atomGetDegree(restruct, bond.begin) == 1) {
		if (removeAtomFromSgroupIfNeeded(action, restruct, bond.begin))
			atomsToRemove.push(bond.begin);

		action.addOp(new op.AtomDelete(bond.begin));
	}

	if (atomGetDegree(restruct, bond.end) == 1) {
		if (removeAtomFromSgroupIfNeeded(action, restruct, bond.end))
			atomsToRemove.push(bond.end);

		action.addOp(new op.AtomDelete(bond.end));
	}

	removeSgroupIfNeeded(action, restruct, atomsToRemove);

	action = action.perform(restruct);

	action.mergeWith(new FromFragmentSplit(restruct, frid));

	return action;
}

function FromFragmentSplit(restruct, frid) { // TODO [RB] the thing is too tricky :) need something else in future
	var action = new Action();
	var rgid = Struct.RGroup.findRGroupByFragment(restruct.molecule.rgroups, frid);

	restruct.molecule.atoms.each(function (aid, atom) {
		if (atom.fragment === frid) {
			var newfrid = action.addOp(new op.FragmentAdd().perform(restruct)).frid;
			var processAtom = function (aid1) { // eslint-disable-line func-style
				action.addOp(new op.AtomAttr(aid1, 'fragment', newfrid).perform(restruct));
				atomGetNeighbors(restruct, aid1).forEach(function (nei) {
					if (restruct.molecule.atoms.get(nei.aid).fragment === frid)
						processAtom(nei.aid);
				});
			};
			processAtom(aid);
			if (rgid)
				action.mergeWith(fromRGroupFragment(restruct, rgid, newfrid));
		}
	});

	if (frid !== -1) {
		action.mergeWith(fromRGroupFragment(restruct, 0, frid));
		action.addOp(new op.FragmentDelete(frid).perform(restruct));
		action.mergeWith(fromUpdateIfThen(restruct, 0, rgid));
	}

	return action;
}

function fromFragmentDeletion(restruct, selection) { // eslint-disable-line max-statements
	console.assert(!!selection);
	var action = new Action();
	var atomsToRemove = [];
	var frids = [];
	selection = {               // TODO: refactor me
		atoms: selection.atoms || [],
		bonds: selection.bonds || [],
		rxnPluses: selection.rxnPluses || [],
		rxnArrows: selection.rxnArrows || [],
		sgroupData: selection.sgroupData || [],
		chiralFlags: selection.chiralFlags || []
	};

	var actionRemoveDataSGroups = new Action();
	selection.sgroupData.forEach(function (id) {
		actionRemoveDataSGroups.mergeWith(fromSgroupDeletion(restruct, id));
	}, this);

	selection.atoms.forEach(function (aid) {
		atomGetNeighbors(restruct, aid).forEach(function (nei) {
			if (selection.bonds.indexOf(nei.bid) == -1)
				selection.bonds = selection.bonds.concat([nei.bid]);
		}, this);
	}, this);

	selection.bonds.forEach(function (bid) {
		action.addOp(new op.BondDelete(bid));

		var bond = restruct.molecule.bonds.get(bid);
		var frid = restruct.molecule.atoms.get(bond.begin).fragment;
		if (frids.indexOf(frid) < 0)
			frids.push(frid);

		if (selection.atoms.indexOf(bond.begin) == -1 && atomGetDegree(restruct, bond.begin) == 1) {
			if (removeAtomFromSgroupIfNeeded(action, restruct, bond.begin))
				atomsToRemove.push(bond.begin);

			action.addOp(new op.AtomDelete(bond.begin));
		}
		if (selection.atoms.indexOf(bond.end) == -1 && atomGetDegree(restruct, bond.end) == 1) {
			if (removeAtomFromSgroupIfNeeded(action, restruct, bond.end))
				atomsToRemove.push(bond.end);

			action.addOp(new op.AtomDelete(bond.end));
		}
	}, this);


	selection.atoms.forEach(function (aid) {
		var frid3 = restruct.molecule.atoms.get(aid).fragment;
		if (frids.indexOf(frid3) < 0)
			frids.push(frid3);

		if (removeAtomFromSgroupIfNeeded(action, restruct, aid))
			atomsToRemove.push(aid);

		action.addOp(new op.AtomDelete(aid));
	}, this);

	removeSgroupIfNeeded(action, restruct, atomsToRemove);

	selection.rxnArrows.forEach(function (id) {
		action.addOp(new op.RxnArrowDelete(id));
	}, this);

	selection.rxnPluses.forEach(function (id) {
		action.addOp(new op.RxnPlusDelete(id));
	}, this);

	selection.chiralFlags.forEach(function (id) {
		action.addOp(new op.ChiralFlagDelete(id));
	}, this);

	action = action.perform(restruct);

	while (frids.length > 0)
		action.mergeWith(new FromFragmentSplit(restruct, frids.pop()));

	action.mergeWith(actionRemoveDataSGroups);

	return action;
}

function fromAtomMerge(restruct, srcId, dstId, skipBondsDel = [], skipAtomDel) {
	if (srcId === dstId) return new Action();
	var fragAction = new Action();
	var srcFrid = atomGetAttr(restruct, srcId, 'fragment');
	var dstFrid = atomGetAttr(restruct, dstId, 'fragment');
	if (srcFrid !== dstFrid)
		mergeFragments(fragAction, restruct, srcFrid, dstFrid);

	var action = new Action();

	atomGetNeighbors(restruct, srcId).forEach(function (nei) {
		var bond = restruct.molecule.bonds.get(nei.bid);
		var begin, end;

		if (bond.begin === nei.aid) {
			begin = nei.aid;
			end = dstId;
		} else {
			begin = dstId;
			end = nei.aid;
		}
		if (dstId !== bond.begin && dstId !== bond.end && restruct.molecule.findBondId(begin, end) === -1) // TODO: improve this {
			action.addOp(new op.BondAdd(begin, end, bond));

		if (!skipBondsDel.includes('' + nei.bid))
			action.addOp(new op.BondDelete(nei.bid));
	}, this);

	var attrs = Struct.Atom.getAttrHash(restruct.molecule.atoms.get(srcId));
	if (atomGetDegree(restruct, srcId) === 1 && attrs['label'] === '*')
		attrs['label'] = 'C';
	for (var key in attrs)
		if (attrs.hasOwnProperty(key)) action.addOp(new op.AtomAttr(dstId, key, attrs[key]));

	var sgChanged = removeAtomFromSgroupIfNeeded(action, restruct, srcId);

	if (!skipAtomDel) action.addOp(new op.AtomDelete(srcId));

	if (sgChanged)
		removeSgroupIfNeeded(action, restruct, [srcId]);

	return action.perform(restruct).mergeWith(fragAction);
}

function fromBondsMerge(restruct, /* { srcId: dstId, ... } */ mergeMap) {
	let action = new Action();
	const atomsToDelete = [];
	const srcBonds = Object.keys(mergeMap);

	Object.entries(mergeMap).forEach(([srcId, dstId]) => {
		const bond = restruct.molecule.bonds.get(+srcId);
		const bondCI = restruct.molecule.bonds.get(+dstId);

		// copy bond src attr and delete
		let bondAttrAction = new Action();
		const params = utils.mergeBondsParams(restruct, bond, bondCI);
		if (!params) return;

		const attrs = Struct.Bond.getAttrHash(bond);
		for (let key in attrs) {
			if (attrs.hasOwnProperty(key))
				bondAttrAction.addOp(new op.BondAttr(dstId, key, attrs[key]));
		}
		bondAttrAction.addOp(new op.BondDelete(+srcId));
		bondAttrAction = bondAttrAction.perform(restruct);

		// old src atoms
		if (!atomsToDelete.includes(bond.begin)) atomsToDelete.push(bond.begin);
		if (!atomsToDelete.includes(bond.end)) atomsToDelete.push(bond.end);

		action = fromAtomMerge(restruct, bond.begin, !params.cross ? bondCI.begin : bondCI.end, srcBonds, true)
			.mergeWith(fromAtomMerge(restruct, bond.end, !params.cross ? bondCI.end : bondCI.begin, srcBonds, true))
			.mergeWith(bondAttrAction)
			.mergeWith(action);
	});

	// delete atoms
	let delAtomsAction = new Action();
	atomsToDelete.forEach(aid => delAtomsAction.addOp(new op.AtomDelete(aid)));
	delAtomsAction = delAtomsAction.perform(restruct);

	return delAtomsAction.mergeWith(action);
}

function toBondFlipping(struct, id) {
	var bond = struct.bonds.get(id);

	var action = new Action();
	action.addOp(new op.BondDelete(id));
	action.addOp(new op.BondAdd(bond.end, bond.begin, bond)).data.bid = id;
	return action;
}

function fromBondFlipping(restruct, bid) {
	return toBondFlipping(restruct.molecule, bid).perform(restruct);
}

function fromTemplateOnCanvas(restruct, pos, angle, template) {
	const action = new Action();
	const frag = template.molecule;
	const fragAction = new op.FragmentAdd().perform(restruct);
	const map = {};

	// Only template atom label matters for now
	frag.atoms.each((aid, atom) => {
		const attrs = Struct.Atom.getAttrHash(atom);
		attrs.fragment = fragAction.frid;

		const operation = new op.AtomAdd(attrs, Vec2.diff(atom.pp, template.xy0).rotate(angle).add(pos))
			.perform(restruct);

		action.addOp(operation);

		map[aid] = operation.data.aid;
	});

	frag.bonds.each((bid, bond) =>
		action.addOp(new op.BondAdd(map[bond.begin], map[bond.end], bond).perform(restruct))
	);

	frag.sgroups.each((sgid, sg) => {
		const newsgid = restruct.molecule.sgroups.newId();
		const sgAction = fromSgroupAddition(restruct, sg.type, sg.atoms, sg.data, newsgid, Vec2.diff(sg.pp, template.xy0).add(pos));
		sgAction.operations.reverse().forEach(op => action.addOp(op));
	});

	//TODO: add rgroups

	// reaction arrows
	frag.rxnArrows.values()
		.forEach(rxnArrow => action.addOp(new op.RxnArrowAdd(Vec2.diff(rxnArrow.pp, template.xy0).add(pos)).perform(restruct)));

	// reaction pluses
	frag.rxnPluses.values()
		.forEach(plus => action.addOp(new op.RxnPlusAdd(Vec2.diff(plus.pp, template.xy0).add(pos)).perform(restruct)));

	// chiral flag
	if (frag.isChiral) {
		const bb = frag.getCoordBoundingBox();
		const pp = Vec2.diff(new Vec2(bb.max.x, bb.min.y - 1), template.xy0).add(pos);
		action.mergeWith(fromChiralFlagAddition(restruct, pp));
	}

	action.operations.reverse();
	action.addOp(fragAction);

	return action;
}

function atomAddToSGroups(restruct, sgroups, aid) {
	var action = new Action();
	sgroups.forEach(function (sid) {
		action.addOp(new op.SGroupAtomAdd(sid, aid).perform(restruct));
	}, this);
	return action;
}

function fromTemplateOnAtom(restruct, aid, angle, extraBond, template) { // eslint-disable-line max-statements, max-params
	var action = new Action();
	var frag = template.molecule;
	var struct = restruct.molecule;
	var atom = struct.atoms.get(aid);
	var aid0 = aid; // the atom that was clicked on
	var aid1 = null; // the atom on the other end of the extra bond, if any
	var sgroups = atomGetSGroups(restruct, aid);

	var frid = atomGetAttr(restruct, aid, 'fragment');

	var map = {};
	var xy0 = frag.atoms.get(template.aid).pp;

	if (extraBond) {
		// create extra bond after click on atom
		if (angle == null) {
			var middleAtom = atomForNewBond(restruct, aid);
			var actionRes = fromBondAddition(restruct, { type: 1 }, aid, middleAtom.atom, middleAtom.pos.get_xy0());
			action = actionRes[0];
			action.operations.reverse();
			aid1 = aid = actionRes[2];
		} else {
			var operation;

			action.addOp(
				operation = new op.AtomAdd(
				{ label: 'C', fragment: frid },
				(new Vec2(1, 0)).rotate(angle).add(atom.pp).get_xy0()
				).perform(restruct)
			);

			action.addOp(
			new op.BondAdd(
				aid,
				operation.data.aid,
			{ type: 1 }
			).perform(restruct)
			);

			aid1 = aid = operation.data.aid;
			action.mergeWith(atomAddToSGroups(restruct, sgroups, aid));
		}

		var atom0 = atom;
		atom = struct.atoms.get(aid);
		var delta = utils.calcAngle(atom0.pp, atom.pp) - template.angle0;
	} else {
		if (angle == null) {
			middleAtom = atomForNewBond(restruct, aid);
			angle = utils.calcAngle(atom.pp, middleAtom.pos);
		}
		delta = angle - template.angle0;
	}

	frag.atoms.each(function (id, a) {
		var attrs = Struct.Atom.getAttrHash(a);
		attrs.fragment = frid;
		if (id == template.aid) {
			action.mergeWith(fromAtomsAttrs(restruct, aid, attrs, true));
			map[id] = aid;
		} else {
			var v;

			v = Vec2.diff(a.pp, xy0).rotate(delta).add(atom.pp);

			action.addOp(
				operation = new op.AtomAdd(
					attrs,
					v.get_xy0()
				).perform(restruct)
			);
			map[id] = operation.data.aid;
		}
		if (map[id] - 0 !== aid0 - 0 && map[id] - 0 !== aid1 - 0)
			action.mergeWith(atomAddToSGroups(restruct, sgroups, map[id]));
	});

	frag.bonds.each(function (bid, bond) {
		action.addOp(
		new op.BondAdd(
			map[bond.begin],
			map[bond.end],
			bond
		).perform(restruct)
		);
	});

	action.operations.reverse();

	return action;
}

function fromTemplateOnBond(restruct, bid, template, flip) { // eslint-disable-line max-statements
	var action = new Action();
	var frag = template.molecule;
	var struct = restruct.molecule;

	var bond = struct.bonds.get(bid);
	var begin = struct.atoms.get(bond.begin);
	var end = struct.atoms.get(bond.end);
	var sgroups = Set.list(Set.intersection(
	Set.fromList(atomGetSGroups(restruct, bond.begin)),
	Set.fromList(atomGetSGroups(restruct, bond.end))));

	var frBond = frag.bonds.get(template.bid);
	var frBegin;
	var frEnd;

	var frid = atomGetAttr(restruct, bond.begin, 'fragment');

	var map = {};

	if (flip) {
		frBegin = frag.atoms.get(frBond.end);
		frEnd = frag.atoms.get(frBond.begin);
		map[frBond.end] = bond.begin;
		map[frBond.begin] = bond.end;
	} else {
		frBegin = frag.atoms.get(frBond.begin);
		frEnd = frag.atoms.get(frBond.end);
		map[frBond.begin] = bond.begin;
		map[frBond.end] = bond.end;
	}

	// calc angle
	var angle = utils.calcAngle(begin.pp, end.pp) - utils.calcAngle(frBegin.pp, frEnd.pp);
	var scale = Vec2.dist(begin.pp, end.pp) / Vec2.dist(frBegin.pp, frEnd.pp);

	frag.atoms.each(function (id, a) {
		var attrs = Struct.Atom.getAttrHash(a);
		attrs.fragment = frid;
		if (id == frBond.begin || id == frBond.end) {
			action.mergeWith(fromAtomsAttrs(restruct, map[id], attrs, true));
			return;
		}

		var v;

		v = Vec2.diff(a.pp, frBegin.pp).rotate(angle).scaled(scale).add(begin.pp);

		var mergeA = closest.atom(restruct, v, null, 0.1);

		if (mergeA == null) {
			var operation;
			action.addOp(
				operation = new op.AtomAdd(
					attrs,
					v
				).perform(restruct)
			);

			map[id] = operation.data.aid;
			action.mergeWith(atomAddToSGroups(restruct, sgroups, map[id]));
		} else {
			map[id] = mergeA.id;
			action.mergeWith(fromAtomsAttrs(restruct, map[id], attrs, true));
			// TODO [RB] need to merge fragments?
		}
	});

	frag.bonds.each(function (id, bond) {
		var existId = struct.findBondId(map[bond.begin], map[bond.end]);
		if (existId == -1) {
			action.addOp(
			new op.BondAdd(
				map[bond.begin],
				map[bond.end],
				bond
			).perform(restruct));
		} else {
			action.mergeWith(fromBondAttrs(restruct, existId, frBond, false, true));
		}
	});

	action.operations.reverse();

	return action;
}

function fromChain(restruct, p0, v, nSect, atomId) { // eslint-disable-line max-params
	var dx = Math.cos(Math.PI / 6);
	var dy = Math.sin(Math.PI / 6);

	var action = new Action();

	var frid;
	if (atomId != null)
		frid = atomGetAttr(restruct, atomId, 'fragment');
	else
		frid = action.addOp(new op.FragmentAdd().perform(restruct)).frid;

	var id0 = -1;
	if (atomId != null)
		id0 = atomId;
	else
		id0 = action.addOp(new op.AtomAdd({ label: 'C', fragment: frid }, p0).perform(restruct)).data.aid;

	action.operations.reverse();

	for (var i = 0; i < nSect; i++) {
		var pos = new Vec2(dx * (i + 1), i & 1 ? 0 : dy).rotate(v).add(p0);

		var a = closest.atom(restruct, pos, null, 0.1);
		var ret = fromBondAddition(restruct, {}, id0, a ? a.id : {}, pos);
		action = ret[0].mergeWith(action);
		id0 = ret[2];
	}

	return action;
}

function fromNewCanvas(restruct, struct) {
	var action = new Action();

	action.addOp(new op.CanvasLoad(struct));
	return action.perform(restruct);
}

function fromSgroupType(restruct, id, type) {
	var sg = restruct.sgroups.get(id).item;
	var curType = sg.type;
	if (type && type != curType) {
		var atoms = [].slice.call(Struct.SGroup.getAtoms(restruct.molecule, sg));
		var attrs = sg.getAttrs();
		var actionDeletion = fromSgroupDeletion(restruct, id); // [MK] order of execution is important, first delete then recreate
		var actionAddition = fromSgroupAddition(restruct, type, atoms, attrs, id);
		return actionAddition.mergeWith(actionDeletion); // the actions are already performed and reversed, so we merge them backwards
	}
	return new Action();
}

function fromSeveralSgroupAddition(restruct, type, atoms, attrs) {
	const descriptors = attrs.fieldValue;

	if (typeof descriptors === 'string' || type !== 'DAT')
		return Action.fromSgroupAddition(restruct, type, atoms, attrs, restruct.molecule.sgroups.newId());

	return descriptors.reduce((acc, fValue) => {
		const localAttrs = Object.assign({}, attrs);
		localAttrs.fieldValue = fValue;

		return acc
			.mergeWith(Action.fromSgroupAddition(restruct, type, atoms, localAttrs, restruct.molecule.sgroups.newId()));
	}, new Action());
}

function fromSgroupAttrs(restruct, id, attrs) {
	const action = new Action();

	Object.keys(attrs)
		.forEach(key => action.addOp(new op.SGroupAttr(id, key, attrs[key])));

	return action.perform(restruct);
}

function sGroupAttributeAction(id, attrs) {
	const action = new Action();

	Object.keys(attrs)
		.forEach(key => action.addOp(new op.SGroupAttr(id, key, attrs[key])));

	return action;
}

function fromSgroupDeletion(restruct, id) {
	let action = new Action();
	const struct = restruct.molecule;

	const sG = restruct.sgroups.get(id).item;

	if (sG.type === 'SRU') {
		struct.sGroupsRecalcCrossBonds();

		sG.neiAtoms.forEach(aid => {
			if (atomGetAttr(restruct, aid, 'label') === '*')
				action.addOp(new op.AtomAttr(aid, 'label', 'C'));
		});
	}

	const sg = struct.sgroups.get(id);
	const atoms = Struct.SGroup.getAtoms(struct, sg);
	const attrs = sg.getAttrs();

	action.addOp(new op.SGroupRemoveFromHierarchy(id));

	atoms.forEach(atom => action.addOp(new op.SGroupAtomRemove(id, atom)));

	action.addOp(new op.SGroupDelete(id));

	action = action.perform(restruct);

	action.mergeWith(sGroupAttributeAction(id, attrs));

	return action;
}

function fromSgroupAddition(restruct, type, atoms, attrs, sgid, pp) { // eslint-disable-line max-params, max-statements
	let action = new Action();

	// TODO: shoud the id be generated when OpSGroupCreate is executed?
	//      if yes, how to pass it to the following operations?
	sgid = sgid - 0 === sgid ? sgid : restruct.molecule.sgroups.newId();

	action.addOp(new op.SGroupCreate(sgid, type, pp));

	atoms.forEach(atom => action.addOp(new op.SGroupAtomAdd(sgid, atom)));

	action.addOp(
		type !== 'DAT' ?
			new op.SGroupAddToHierarchy(sgid) :
			new op.SGroupAddToHierarchy(sgid, -1, [])
	);

	action = action.perform(restruct);

	if (type === 'SRU') {
		restruct.molecule.sGroupsRecalcCrossBonds();
		let asteriskAction = new Action();

		restruct.sgroups.get(sgid).item.neiAtoms.forEach(aid => {
			const plainCarbon = restruct.atoms.get(aid).a.isPlainCarbon();

			if (atomGetDegree(restruct, aid) === 1 && plainCarbon)
				asteriskAction.addOp(new op.AtomAttr(aid, 'label', '*'));
		});

		asteriskAction = asteriskAction.perform(restruct);
		asteriskAction.mergeWith(action);
		action = asteriskAction;
	}

	return fromSgroupAttrs(restruct, sgid, attrs).mergeWith(action);
}

function fromRGroupAttrs(restruct, id, attrs) {
	const action = new Action();

	Object.keys(attrs)
		.forEach(key => action.addOp(new op.RGroupAttr(id, key, attrs[key])));

	return action.perform(restruct);
}

function fromRGroupFragment(restruct, rgidNew, frid) {
	const action = new Action();
	action.addOp(new op.RGroupFragment(rgidNew, frid));
	return action.perform(restruct);
}

function fromUpdateIfThen(restruct, rgidNew, rgidOld) {
	const action = new Action();

	if (!restruct.molecule.rgroups.get(rgidOld))
		action.addOp(new op.UpdateIfThen(rgidNew, rgidOld));

	return action.perform(restruct);
}

// Should it be named structCenter?
function getAnchorPosition(clipboard) {
	if (clipboard.atoms.length) {
		var xmin = 1e50;
		var ymin = xmin;
		var xmax = -xmin;
		var ymax = -ymin;
		for (var i = 0; i < clipboard.atoms.length; i++) {
			xmin = Math.min(xmin, clipboard.atoms[i].pp.x);
			ymin = Math.min(ymin, clipboard.atoms[i].pp.y);
			xmax = Math.max(xmax, clipboard.atoms[i].pp.x);
			ymax = Math.max(ymax, clipboard.atoms[i].pp.y);
		}
		return new Vec2((xmin + xmax) / 2, (ymin + ymax) / 2); // TODO: check
	} else if (clipboard.rxnArrows.length) {
		return clipboard.rxnArrows[0].pp;
	} else if (clipboard.rxnPluses.length) {
		return clipboard.rxnPluses[0].pp;
	} else if (clipboard.chiralFlags.length) {
		return clipboard.chiralFlags[0].pp;
	} else { // eslint-disable-line no-else-return
		return null;
	}
}

// TODO: merge to bellow
function struct2Clipboard(struct) { // eslint-disable-line max-statements
	console.assert(!struct.isBlank(), 'Empty struct');

	var selection = structSelection(struct);

	var clipboard = {
		atoms: [],
		bonds: [],
		sgroups: [],
		rxnArrows: [],
		rxnPluses: [],
		chiralFlags: [],
		rgmap: {},
		rgroups: {}
	};

	var mapping = {};
	selection.atoms.forEach(function (id) {
		var newAtom = new Struct.Atom(struct.atoms.get(id));
		newAtom.pos = newAtom.pp;
		mapping[id] = clipboard.atoms.push(new Struct.Atom(newAtom)) - 1;
	});

	selection.bonds.forEach(function (id) {
		var newBond = new Struct.Bond(struct.bonds.get(id));
		newBond.begin = mapping[newBond.begin];
		newBond.end = mapping[newBond.end];
		clipboard.bonds.push(new Struct.Bond(newBond));
	});

	var sgroupList = struct.getSGroupsInAtomSet(selection.atoms);

	sgroupList.forEach(function (sid) {
		var sgroup = struct.sgroups.get(sid);
		var sgAtoms = Struct.SGroup.getAtoms(struct, sgroup);
		var sgroupInfo = {
			type: sgroup.type,
			attrs: sgroup.getAttrs(),
			atoms: [].slice.call(sgAtoms),
			pp: sgroup.pp
		};

		for (var i = 0; i < sgroupInfo.atoms.length; i++)
			sgroupInfo.atoms[i] = mapping[sgroupInfo.atoms[i]];

		clipboard.sgroups.push(sgroupInfo);
	}, this);

	selection.rxnArrows.forEach(function (id) {
		var arrow = new Struct.RxnArrow(struct.rxnArrows.get(id));
		arrow.pos = arrow.pp;
		clipboard.rxnArrows.push(arrow);
	});

	selection.rxnPluses.forEach(function (id) {
		var plus = new Struct.RxnPlus(struct.rxnPluses.get(id));
		plus.pos = plus.pp;
		clipboard.rxnPluses.push(plus);
	});

	// r-groups
	var atomFragments = {};
	var fragments = Set.empty();
	selection.atoms.forEach(function (id) {
		var atom = struct.atoms.get(id);
		var frag = atom.fragment;
		atomFragments[id] = frag;
		Set.add(fragments, frag);
	});

	var rgids = Set.empty();
	Set.each(fragments, function (frid) {
		var atoms = getFragmentAtoms(struct, frid);
		for (var i = 0; i < atoms.length; ++i) {
			if (!Set.contains(atomFragments, atoms[i]))
				return;
		}
		var rgid = Struct.RGroup.findRGroupByFragment(struct.rgroups, frid);
		clipboard.rgmap[frid] = rgid;
		Set.add(rgids, rgid);
	}, this);

	Set.each(rgids, function (id) {
		clipboard.rgroups[id] = struct.rgroups.get(id).getAttrs();
	}, this);

	return clipboard;
}

function fromPaste(restruct, pstruct, point) {
	const clipboard = struct2Clipboard(pstruct);
	const offset = point ? Vec2.diff(point, getAnchorPosition(clipboard)) : new Vec2();
	const action = new Action();

	const amap = {};
	const fmap = {};

	// atoms
	clipboard.atoms.forEach((atom, aid) => {
		if (!(atom.fragment in fmap))
			fmap[atom.fragment] = action.addOp(new op.FragmentAdd().perform(restruct)).frid;

		atom.fragment = fmap[atom.fragment];
		amap[aid] = action.addOp(new op.AtomAdd(atom, atom.pp.add(offset)).perform(restruct)).data.aid;
	});

	// assign fragments to r-groups
	Object.keys(clipboard.rgmap)
		.forEach(frid => action.addOp(new op.RGroupFragment(clipboard.rgmap[frid], fmap[frid]).perform(restruct)));

	Object.keys(clipboard.rgroups)
		.filter(rgid => !restruct.molecule.rgroups.has(rgid))
		.forEach(rg => action.mergeWith(fromRGroupAttrs(restruct, rg, clipboard.rgroups[rg])));

	// bonds
	clipboard.bonds
		.forEach(bond => action.addOp(new op.BondAdd(amap[bond.begin], amap[bond.end], bond).perform(restruct)));

	// sgroups
	clipboard.sgroups.forEach(sgroupInfo => {
		const sgatoms = sgroupInfo.atoms.map(atom => amap[atom]);
		const newsgid = restruct.molecule.sgroups.newId();

		const sgAction = fromSgroupAddition(restruct, sgroupInfo.type, sgatoms, sgroupInfo.attrs, newsgid, sgroupInfo.pp ? sgroupInfo.pp.add(offset) : null);
		sgAction.operations.reverse().forEach(op => action.addOp(op));
	});

	// reaction arrows
	if (restruct.rxnArrows.count() < 1)
		clipboard.rxnArrows.forEach(rxnArrow => action.addOp(new op.RxnArrowAdd(rxnArrow.pp.add(offset)).perform(restruct)));

	// reaction pluses
	clipboard.rxnPluses.forEach(plus => action.addOp(new op.RxnPlusAdd(plus.pp.add(offset)).perform(restruct)));

	// chiral flag
	if (pstruct.isChiral) {
		const bb = pstruct.getCoordBoundingBox();
		const pp = new Vec2(bb.max.x, bb.min.y - 1);
		action.mergeWith(fromChiralFlagAddition(restruct, pp.add(offset)));
	}

	// thats all
	action.operations.reverse();
	return action;
}

function fromFlip(restruct, selection, dir) { // eslint-disable-line max-statements
	const struct = restruct.molecule;

	const action = new Action();

	if (!selection)
		selection = structSelection(struct);

	if (!selection.atoms)
		return action.perform(restruct);

	const fids = selection.atoms.reduce((acc, aid) => {
		const atom = struct.atoms.get(aid);

		if (!acc[atom.fragment])
			acc[atom.fragment] = [];

		acc[atom.fragment].push(aid);
		return acc;
	}, {});

	const isFragFound = Object.keys(fids).find(frag => {
		frag = parseInt(frag, 10);
		return !Set.eq(struct.getFragmentIds(frag), Set.fromList(fids[frag]));
	});

	if (isFragFound)
		return action; // empty action

	Object.keys(fids).forEach(frag => {
		const fragment = Set.fromList(fids[frag]);

		const bbox = struct.getCoordBoundingBox(fragment);

		Set.each(fragment, aid => {
			const atom = struct.atoms.get(aid);
			const d = new Vec2();

			/* eslint-disable no-mixed-operators*/
			if (dir === 'horizontal')
				d.x = bbox.min.x + bbox.max.x - 2 * atom.pp.x;
			else // 'vertical'
				d.y = bbox.min.y + bbox.max.y - 2 * atom.pp.y;
			/* eslint-enable no-mixed-operators*/

			action.addOp(new op.AtomMove(aid, d));
		});
	});

	if (selection.bonds) {
		selection.bonds.forEach(bid => {
			const bond = struct.bonds.get(bid);

			if (bond.type !== Struct.Bond.PATTERN.TYPE.SINGLE)
				return;

			if (bond.stereo === Struct.Bond.PATTERN.STEREO.UP) {
				action.addOp(new op.BondAttr(bid, 'stereo', Struct.Bond.PATTERN.STEREO.DOWN));
				return;
			}

			if (bond.stereo === Struct.Bond.PATTERN.STEREO.DOWN)
				action.addOp(new op.BondAttr(bid, 'stereo', Struct.Bond.PATTERN.STEREO.UP));
		});
	}

	return action.perform(restruct);
}

function fromRotate(restruct, selection, pos, angle) { // eslint-disable-line max-statements
	const struct = restruct.molecule;

	const action = new Action();

	if (!selection)
		selection = structSelection(struct);

	if (selection.atoms) {
		selection.atoms.forEach(aid => {
			const atom = struct.atoms.get(aid);
			action.addOp(new op.AtomMove(aid, rotateDelta(atom.pp, pos, angle)));
		});
	}

	if (selection.rxnArrows) {
		selection.rxnArrows.forEach(function (aid) {
			var arrow = struct.rxnArrows.get(aid);
			action.addOp(new op.RxnArrowMove(aid, rotateDelta(arrow.pp, pos, angle)));
		});
	}

	if (selection.rxnPluses) {
		selection.rxnPluses.forEach(function (pid) {
			var plus = struct.rxnPluses.get(pid);
			action.addOp(new op.RxnPlusMove(pid, rotateDelta(plus.pp, pos, angle)));
		});
	}

	if (selection.sgroupData) {
		selection.sgroupData.forEach(function (did) {
			var data = struct.sgroups.get(did);
			action.addOp(new op.SGroupDataMove(did, rotateDelta(data.pp, pos, angle)));
		});
	}

	if (selection.chiralFlags) {
		selection.chiralFlags.forEach(function (fid) {
			var flag = restruct.chiralFlags.get(fid);
			action.addOp(new op.ChiralFlagMove(rotateDelta(flag.pp, pos, angle)));
		});
	}

	return action.perform(restruct);
}

function fromBondAlign(restruct, bid, dir) {
	var struct = restruct.molecule;
	var bond = struct.bonds.get(bid);
	var begin = struct.atoms.get(bond.begin);
	var end = struct.atoms.get(bond.end);

	var center = begin.pp.add(end.pp).scaled(0.5);
	var angle = utils.calcAngle(begin.pp, end.pp);
	var atoms = getFragmentAtoms(struct, begin.fragment);
	angle = (dir === 'horizontal') ? -angle : ((Math.PI / 2) - angle);

	// TODO: choose minimal angle
	// console.info('single bond', utils.degrees(angle), atoms, dir);
	return fromRotate(restruct, { atoms: atoms }, center, angle);
}

function structSelection(struct) {
	return ['atoms', 'bonds', 'frags', 'sgroups', 'rgroups', 'rxnArrows', 'rxnPluses'].reduce(function (res, key) {
		res[key] = struct[key].keys();
		return res;
	}, {});
}

function getFragmentAtoms(struct, frid) {
	var atoms = [];
	struct.atoms.each(function (aid, atom) {
		if (atom.fragment == frid)
			atoms.push(aid);
	});
	return atoms;
}

function rotateDelta(v, pos, angle) {
	var v1 = v.sub(pos);
	v1 = v1.rotate(angle);
	v1.add_(pos); // eslint-disable-line no-underscore-dangle
	return v1.sub(v);
}

function atomGetAttr(restruct, aid, name) {
	return restruct.molecule.atoms.get(aid)[name];
}

function atomGetDegree(restruct, aid) {
	return restruct.atoms.get(aid).a.neighbors.length;
}

function atomGetNeighbors(restruct, aid) {
	var atom = restruct.atoms.get(aid);
	var neiAtoms = [];
	for (var i = 0; i < atom.a.neighbors.length; ++i) {
		var hb = restruct.molecule.halfBonds.get(atom.a.neighbors[i]);
		neiAtoms.push({
			aid: hb.end - 0,
			bid: hb.bid - 0
		});
	}
	return neiAtoms;
}

function atomGetSGroups(restruct, aid) {
	var atom = restruct.atoms.get(aid);
	return Set.list(atom.a.sgs);
}

function atomGetPos(restruct, id) {
	return restruct.molecule.atoms.get(id).pp;
}

function fromAtomAction(restruct, newSg, sourceAtoms) {
	return sourceAtoms.reduce(function (acc, atom) {
		acc.action = acc.action.mergeWith(
			fromSeveralSgroupAddition(restruct, newSg.type, [atom], newSg.attrs)
		);
		return acc;
	}, {
		action: new Action(),
		selection: {
			atoms: sourceAtoms,
			bonds: []
		}
	});
}

function fromGroupAction(restruct, newSg, sourceAtoms, targetAtoms) {
	const fragIds = Object.keys(
		sourceAtoms.reduce((acc, aid) => {
			const fragId = restruct.atoms.get(aid).a.fragment;
			acc[fragId] = true;
			return acc;
		}, {})
	)
		.map(Number);

	return fragIds.reduce((acc, fragId) => {
		const atoms = targetAtoms
			.filter(aid => {
				const atom = restruct.atoms.get(aid).a;
				return fragId === atom.fragment;
			})
			.map(Number);

		const bonds = getAtomsBondIds(restruct.molecule, atoms);

		acc.action = acc.action.mergeWith(
			fromSeveralSgroupAddition(restruct, newSg.type, atoms, newSg.attrs)
		);

		acc.selection.atoms = acc.selection.atoms.concat(atoms);
		acc.selection.bonds = acc.selection.bonds.concat(bonds);

		return acc;
	}, {
		action: new Action(),
		selection: {
			atoms: [],
			bonds: []
		}
	});
}

function fromBondAction(restruct, newSg, sourceAtoms, currSelection) {
	var struct = restruct.molecule;
	var bonds = getAtomsBondIds(struct, sourceAtoms);

	if (currSelection.bonds)
		bonds = uniq(bonds.concat(currSelection.bonds));

	return bonds.reduce(function (acc, bondid) {
		var bond = struct.bonds.get(bondid);

		acc.action = acc.action
			.mergeWith(
				fromSeveralSgroupAddition(restruct, newSg.type, [bond.begin, bond.end], newSg.attrs)
			);
		acc.selection.bonds.push(bondid);

		return acc;
	}, {
		action: new Action(),
		selection: {
			atoms: sourceAtoms,
			bonds: []
		}
	});
}

function fromMultiFragmentAction(restruct, newSg, atoms) {
	const bonds = getAtomsBondIds(restruct.molecule, atoms);
	return {
		action: fromSeveralSgroupAddition(restruct, newSg.type, atoms, newSg.attrs),
		selection: {
			atoms,
			bonds
		}
	};
}

function fromDescriptorsAlign(restruct) {
	const action = new Action();
	action.addOp(new op.AlignDescriptors(restruct));
	return action.perform(restruct);
}

function getAtomsBondIds(struct, atoms) {
	return struct.bonds.keys()
		.reduce(function (acc, bondid) {
			var bond = struct.bonds.get(bondid);

			if (atoms.includes(bond.begin) && atoms.includes(bond.end))
				acc.push(parseInt(bondid));

			return acc;
		}, []);
}

module.exports = Object.assign(Action, {
	fromMultipleMove: fromMultipleMove,
	fromAtomAddition: fromAtomAddition,
	fromArrowAddition: fromArrowAddition,
	fromArrowDeletion: fromArrowDeletion,
	fromChiralFlagAddition: fromChiralFlagAddition,
	fromChiralFlagDeletion: fromChiralFlagDeletion,
	fromPlusAddition: fromPlusAddition,
	fromPlusDeletion: fromPlusDeletion,
	fromAtomDeletion: fromAtomDeletion,
	fromBondDeletion: fromBondDeletion,
	fromFragmentDeletion: fromFragmentDeletion,
	fromAtomMerge: fromAtomMerge,
	fromBondsMerge: fromBondsMerge,
	fromBondFlipping: fromBondFlipping,
	fromTemplateOnCanvas: fromTemplateOnCanvas,
	fromTemplateOnAtom: fromTemplateOnAtom,
	fromTemplateOnBond: fromTemplateOnBond,
	fromAtomsAttrs: fromAtomsAttrs,
	fromBondAttrs: fromBondAttrs,
	fromChain: fromChain,
	fromBondAddition: fromBondAddition,
	fromNewCanvas: fromNewCanvas,
	fromSgroupType: fromSgroupType,
	fromSgroupDeletion: fromSgroupDeletion,
	fromSgroupAttrs: fromSgroupAttrs,
	fromRGroupFragment: fromRGroupFragment,
	fromPaste: fromPaste,
	fromRGroupAttrs: fromRGroupAttrs,
	fromSgroupAddition: fromSgroupAddition,
	fromFlip: fromFlip,
	fromRotate: fromRotate,
	fromBondAlign: fromBondAlign,
	fromAtomAction: fromAtomAction,
	fromGroupAction: fromGroupAction,
	fromBondAction: fromBondAction,
	fromSeveralSgroupAddition: fromSeveralSgroupAddition,
	fromUpdateIfThen: fromUpdateIfThen,
	fromMultiFragmentAction: fromMultiFragmentAction,
	fromDescriptorsAlign: fromDescriptorsAlign
});
