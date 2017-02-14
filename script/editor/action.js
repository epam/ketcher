var Set = require('../util/set');
var Vec2 = require('../util/vec2');
var op = require('./op');
var utils = require('./tool/utils');

var Struct = require('../chem/struct');
var closest = require('./closest');

var ui = global.ui;

//
// Undo/redo actions
//
function Action() {
	this.operations = [];
}

Action.prototype.addOp = function (operation) {
	if (!operation.isDummy(ui.editor))
		this.operations.push(operation);
	return operation;
};

Action.prototype.mergeWith = function (action) {
	this.operations = this.operations.concat(action.operations);
	return this;
};

// Perform action and return inverted one
Action.prototype.perform = function () {
	var action = new Action();

	this.operations.each(function (operation) {
		action.addOp(operation.perform(ui.editor));
	}, this);

	action.operations.reverse();
	return action;
};

Action.prototype.isDummy = function () {
	return this.operations.find(function (operation) {
		return !operation.isDummy(ui.editor); // TODO [RB] the condition is always true for op.* operations
	}) == null;
};

// Add action operation to remove atom from s-group if needed
Action.prototype.removeAtomFromSgroupIfNeeded = function (id) {
	var sgroups = atomGetSGroups(ui.render.ctab, id);

	if (sgroups.length > 0) {
		sgroups.each(function (sid) {
			this.addOp(new op.SGroupAtomRemove(sid, id));
		}, this);

		return true;
	}

	return false;
};

// Add action operations to remove whole s-group if needed
Action.prototype.removeSgroupIfNeeded = function (atoms) {
	var restruct = ui.render.ctab;
	var struct = restruct.molecule;
	var sgCounts = {};

	atoms.each(function (id) {
		var sgroups = atomGetSGroups(restruct, id);

		sgroups.each(function (sid) {
			sgCounts[sid] = sgCounts[sid] ? (sgCounts[sid] + 1) : 1;
		}, this);
	}, this);

	for (var key in sgCounts) {
		var sid = parseInt(key);
		var sG = restruct.sgroups.get(sid).item;
		var sgAtoms = Struct.SGroup.getAtoms(restruct.molecule, sG);

		if (sgAtoms.length == sgCounts[sid]) {
			// delete whole s-group
			var sgroup = struct.sgroups.get(sid);
			this.mergeWith(sGroupAttributeAction(sid, sgroup.getAttrs()));
			this.addOp(new op.SGroupRemoveFromHierarchy(sid));
			this.addOp(new op.SGroupDelete(sid));
		}
	}
};

function fromMultipleMove(lists, d) { // eslint-disable-line max-statements
	d = new Vec2(d);

	var action = new Action();
	var i;

	var restruct = ui.render.ctab;
	var struct = restruct.molecule;
	var bondlist = [];
	var loops = Set.empty();
	var atomsToInvalidate = Set.empty();

	if (lists.atoms) {
		var atomSet = Set.fromList(lists.atoms);
		restruct.bonds.each(function (bid, bond) {
			if (Set.contains(atomSet, bond.b.begin) && Set.contains(atomSet, bond.b.end)) {
				bondlist.push(bid);
				// add all adjacent loops
				// those that are not completely inside the structure will get redrawn anyway
				['hb1', 'hb2'].forEach(function (hb) {
					var loop = struct.halfBonds.get(bond.b[hb]).loop;
					if (loop >= 0)
						Set.add(loops, loop);
				}, this);
			} else if (Set.contains(atomSet, bond.b.begin)) {
				Set.add(atomsToInvalidate, bond.b.begin);
			} else if (Set.contains(atomSet, bond.b.end)) {
				Set.add(atomsToInvalidate, bond.b.end);
			}
		}, this);
		for (i = 0; i < bondlist.length; ++i)
			action.addOp(new op.BondMove(bondlist[i], d));
		Set.each(loops, function (loopId) {
			if (restruct.reloops.get(loopId) && restruct.reloops.get(loopId).visel) // hack
				action.addOp(new op.LoopMove(loopId, d));
		}, this);
		for (i = 0; i < lists.atoms.length; ++i) {
			var aid = lists.atoms[i];
			action.addOp(new op.AtomMove(aid, d, !Set.contains(atomsToInvalidate, aid)));
		}
	}

	if (lists.rxnArrows) {
		for (i = 0; i < lists.rxnArrows.length; ++i)
			action.addOp(new op.RxnArrowMove(lists.rxnArrows[i], d, true));
	}

	if (lists.rxnPluses) {
		for (i = 0; i < lists.rxnPluses.length; ++i)
			action.addOp(new op.RxnPlusMove(lists.rxnPluses[i], d, true));
	}

	if (lists.sgroupData) {
		for (i = 0; i < lists.sgroupData.length; ++i)
			action.addOp(new op.SGroupDataMove(lists.sgroupData[i], d));
	}

	if (lists.chiralFlags) {
		for (i = 0; i < lists.chiralFlags.length; ++i)
			action.addOp(new op.ChiralFlagMove(d));
	}

	return action.perform();
}

function fromAtomsAttrs(ids, attrs, reset) {
	var action = new Action();
	(typeof (ids) == 'number' ? [ids] : ids).each(function (id) {
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
		if (!reset && 'label' in attrs && attrs.label != null && attrs.label != 'L#' && !attrs['atomList'])
			action.addOp(new op.AtomAttr(id, 'atomList', null));
	}, this);
	return action.perform();
}

function fromBondAttrs(id, attrs, flip, reset) {
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
		action.mergeWith(toBondFlipping(id));
	return action.perform();
}

function fromAtomAddition(pos, atom) {
	atom = Object.clone(atom);
	var action = new Action();
	atom.fragment = action.addOp(new op.FragmentAdd().perform(ui.editor)).frid;
	action.addOp(new op.AtomAdd(atom, pos).perform(ui.editor));
	return action;
}

function mergeFragments(action, frid, frid2) {
	if (frid2 != frid && Object.isNumber(frid2)) {
		var rgid = Struct.RGroup.findRGroupByFragment(ui.render.ctab.molecule.rgroups, frid2);
		if (!Object.isUndefined(rgid))
			action.mergeWith(fromRGroupFragment(null, frid2));
		ui.render.ctab.molecule.atoms.each(function (aid, atom) {
			if (atom.fragment == frid2)
				action.addOp(new op.AtomAttr(aid, 'fragment', frid).perform(ui.editor));
		});
		action.addOp(new op.FragmentDelete(frid2).perform(ui.editor));
	}
}

// Get new atom id/label and pos for bond being added to existing atom
function atomForNewBond(id) { // eslint-disable-line max-statements
	var neighbours = [];
	var pos = atomGetPos(ui.render.ctab, id);

	atomGetNeighbors(ui.render.ctab, id).each(function (nei) {
		var neiPos = atomGetPos(ui.render.ctab, nei.aid);

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
			var nei = atomGetNeighbors(ui.render.ctab, id)[0];
			if (atomGetDegree(ui.render.ctab, nei.aid) > 1) {
				var neiNeighbours = [];
				var neiPos = atomGetPos(ui.render.ctab, nei.aid);
				var neiV = Vec2.diff(pos, neiPos);
				var neiAngle = Math.atan2(neiV.y, neiV.x);

				atomGetNeighbors(ui.render.ctab, nei.aid).each(function (neiNei) {
					var neiNeiPos = atomGetPos(ui.render.ctab, neiNei.aid);

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

	var a = closest.atom(ui.render.ctab, v, 0.1);

	if (a == null)
		a = { label: 'C' };
	else
		a = a.id;

	return { atom: a, pos: v };
}

function fromBondAddition(bond, begin, end, pos, pos2) { // eslint-disable-line max-params, max-statements
	if (end === undefined) {
		var atom = atomForNewBond(begin);
		end = atom.atom;
		pos = atom.pos;
	}
	var action = new Action();

	var frid = null;
	if (!Object.isNumber(begin)) {
		if (Object.isNumber(end))
			frid = atomGetAttr(ui.render.ctab, end, 'fragment');
	} else {
		frid = atomGetAttr(ui.render.ctab, begin, 'fragment');
		if (Object.isNumber(end)) {
			var frid2 = atomGetAttr(ui.render.ctab, end, 'fragment');
			mergeFragments(action, frid, frid2);
		}
	}

	if (frid == null)
		frid = action.addOp(new op.FragmentAdd().perform(ui.editor)).frid;

	if (!Object.isNumber(begin)) {
		begin.fragment = frid;
		begin = action.addOp(new op.AtomAdd(begin, pos).perform(ui.editor)).data.aid;

		pos = pos2;
	} else if (atomGetAttr(ui.render.ctab, begin, 'label') == '*') {
		action.addOp(new op.AtomAttr(begin, 'label', 'C').perform(ui.editor));
	}


	if (!Object.isNumber(end)) {
		end.fragment = frid;
		// TODO: <op>.data.aid here is a hack, need a better way to access the id of a newly created atom
		end = action.addOp(new op.AtomAdd(end, pos).perform(ui.editor)).data.aid;
		if (Object.isNumber(begin)) {
			atomGetSGroups(ui.render.ctab, begin).each(function (sid) {
				action.addOp(new op.SGroupAtomAdd(sid, end).perform(ui.editor));
			}, this);
		}
	} else if (atomGetAttr(ui.render.ctab, end, 'label') == '*') {
		action.addOp(new op.AtomAttr(end, 'label', 'C').perform(ui.editor));
	}

	var bid = action.addOp(new op.BondAdd(begin, end, bond).perform(ui.editor)).data.bid;

	action.operations.reverse();

	return [action, begin, end, bid];
}

function fromArrowAddition(pos) {
	var action = new Action();
	if (ui.render.ctab.molecule.rxnArrows.count() < 1)
		action.addOp(new op.RxnArrowAdd(pos).perform(ui.editor));
	return action;
}

function fromArrowDeletion(id) {
	var action = new Action();
	action.addOp(new op.RxnArrowDelete(id));
	return action.perform();
}

function fromChiralFlagAddition(pos) {  // eslint-disable-line no-unused-vars
	var action = new Action();
	if (ui.render.ctab.chiralFlags.count() < 1)
		action.addOp(new op.ChiralFlagAdd(pos).perform(ui.editor));
	return action;
}

function fromChiralFlagDeletion() {
	var action = new Action();
	action.addOp(new op.ChiralFlagDelete());
	return action.perform();
}

function fromPlusAddition(pos) {
	var action = new Action();
	action.addOp(new op.RxnPlusAdd(pos).perform(ui.editor));
	return action;
}

function fromPlusDeletion(id) {
	var action = new Action();
	action.addOp(new op.RxnPlusDelete(id));
	return action.perform();
}

function fromAtomDeletion(id) {
	var action = new Action();
	var atomsToRemove = [];

	var frid = ui.render.ctab.molecule.atoms.get(id).fragment;

	atomGetNeighbors(ui.render.ctab, id).each(function (nei) {
		action.addOp(new op.BondDelete(nei.bid));// [RB] !!
		if (atomGetDegree(ui.render.ctab, nei.aid) == 1) {
			if (action.removeAtomFromSgroupIfNeeded(nei.aid))
				atomsToRemove.push(nei.aid);

			action.addOp(new op.AtomDelete(nei.aid));
		}
	}, this);

	if (action.removeAtomFromSgroupIfNeeded(id))
		atomsToRemove.push(id);

	action.addOp(new op.AtomDelete(id));

	action.removeSgroupIfNeeded(atomsToRemove);

	action = action.perform();

	action.mergeWith(new FromFragmentSplit(frid));

	return action;
}

function fromBondDeletion(id) {
	var action = new Action();
	var bond = ui.render.ctab.molecule.bonds.get(id);
	var frid = ui.render.ctab.molecule.atoms.get(bond.begin).fragment;
	var atomsToRemove = [];

	action.addOp(new op.BondDelete(id));

	if (atomGetDegree(ui.render.ctab, bond.begin) == 1) {
		if (action.removeAtomFromSgroupIfNeeded(bond.begin))
			atomsToRemove.push(bond.begin);

		action.addOp(new op.AtomDelete(bond.begin));
	}

	if (atomGetDegree(ui.render.ctab, bond.end) == 1) {
		if (action.removeAtomFromSgroupIfNeeded(bond.end))
			atomsToRemove.push(bond.end);

		action.addOp(new op.AtomDelete(bond.end));
	}

	action.removeSgroupIfNeeded(atomsToRemove);

	action = action.perform();

	action.mergeWith(new FromFragmentSplit(frid));

	return action;
}

function FromFragmentSplit(frid) { // TODO [RB] the thing is too tricky :) need something else in future
	var action = new Action();
	var rgid = Struct.RGroup.findRGroupByFragment(ui.render.ctab.molecule.rgroups, frid);
	ui.render.ctab.molecule.atoms.each(function (aid, atom) {
		if (atom.fragment == frid) {
			var newfrid = action.addOp(new op.FragmentAdd().perform(ui.editor)).frid;
			var processAtom = function (aid1) { // eslint-disable-line func-style
				action.addOp(new op.AtomAttr(aid1, 'fragment', newfrid).perform(ui.editor));
				atomGetNeighbors(ui.render.ctab, aid1).each(function (nei) {
					if (ui.render.ctab.molecule.atoms.get(nei.aid).fragment == frid)
						processAtom(nei.aid);
				});
			};
			processAtom(aid);
			if (rgid)
				action.mergeWith(fromRGroupFragment(rgid, newfrid));
		}
	});
	if (frid != -1) {
		action.mergeWith(fromRGroupFragment(0, frid));
		action.addOp(new op.FragmentDelete(frid).perform(ui.editor));
	}
	return action;
}

function fromFragmentDeletion(selection) { // eslint-disable-line max-statements
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
	selection.sgroupData.each(function (id) {
		actionRemoveDataSGroups.mergeWith(fromSgroupDeletion(id));
	}, this);

	selection.atoms.each(function (aid) {
		atomGetNeighbors(ui.render.ctab, aid).each(function (nei) {
			if (selection.bonds.indexOf(nei.bid) == -1)
				selection.bonds = selection.bonds.concat([nei.bid]);
		}, this);
	}, this);

	selection.bonds.each(function (bid) {
		action.addOp(new op.BondDelete(bid));

		var bond = ui.render.ctab.molecule.bonds.get(bid);
		var frid = ui.render.ctab.molecule.atoms.get(bond.begin).fragment;
		if (frids.indexOf(frid) < 0)
			frids.push(frid);

		if (selection.atoms.indexOf(bond.begin) == -1 && atomGetDegree(ui.render.ctab, bond.begin) == 1) {
			if (action.removeAtomFromSgroupIfNeeded(bond.begin))
				atomsToRemove.push(bond.begin);

			action.addOp(new op.AtomDelete(bond.begin));
		}
		if (selection.atoms.indexOf(bond.end) == -1 && atomGetDegree(ui.render.ctab, bond.end) == 1) {
			if (action.removeAtomFromSgroupIfNeeded(bond.end))
				atomsToRemove.push(bond.end);

			action.addOp(new op.AtomDelete(bond.end));
		}
	}, this);


	selection.atoms.each(function (aid) {
		var frid3 = ui.render.ctab.molecule.atoms.get(aid).fragment;
		if (frids.indexOf(frid3) < 0)
			frids.push(frid3);

		if (action.removeAtomFromSgroupIfNeeded(aid))
			atomsToRemove.push(aid);

		action.addOp(new op.AtomDelete(aid));
	}, this);

	action.removeSgroupIfNeeded(atomsToRemove);

	selection.rxnArrows.each(function (id) {
		action.addOp(new op.RxnArrowDelete(id));
	}, this);

	selection.rxnPluses.each(function (id) {
		action.addOp(new op.RxnPlusDelete(id));
	}, this);

	selection.chiralFlags.each(function (id) {
		action.addOp(new op.ChiralFlagDelete(id));
	}, this);

	action = action.perform();

	while (frids.length > 0) action.mergeWith(new FromFragmentSplit(frids.pop()));

	action.mergeWith(actionRemoveDataSGroups);

	return action;
}

function fromAtomMerge(srcId, dstId) {
	var fragAction = new Action();
	var srcFrid = atomGetAttr(ui.render.ctab, srcId, 'fragment');
	var dstFrid = atomGetAttr(ui.render.ctab, dstId, 'fragment');
	if (srcFrid != dstFrid)
		mergeFragments(fragAction, srcFrid, dstFrid);

	var action = new Action();

	atomGetNeighbors(ui.render.ctab, srcId).each(function (nei) {
		var bond = ui.render.ctab.molecule.bonds.get(nei.bid);
		var begin, end;

		if (bond.begin == nei.aid) {
			begin = nei.aid;
			end = dstId;
		} else {
			begin = dstId;
			end = nei.aid;
		}
		if (dstId != bond.begin && dstId != bond.end && ui.render.ctab.molecule.findBondId(begin, end) == -1) // TODO: improve this {
			action.addOp(new op.BondAdd(begin, end, bond));
		action.addOp(new op.BondDelete(nei.bid));
	}, this);

	var attrs = Struct.Atom.getAttrHash(ui.render.ctab.molecule.atoms.get(srcId));

	if (atomGetDegree(ui.render.ctab, srcId) == 1 && attrs['label'] == '*')
		attrs['label'] = 'C';
	for (var key in attrs)
		action.addOp(new op.AtomAttr(dstId, key, attrs[key]));

	var sgChanged = action.removeAtomFromSgroupIfNeeded(srcId);

	action.addOp(new op.AtomDelete(srcId));

	if (sgChanged)
		action.removeSgroupIfNeeded([srcId]);

	return action.perform().mergeWith(fragAction);
}

function toBondFlipping(id) {
	var bond = ui.render.ctab.molecule.bonds.get(id);

	var action = new Action();
	action.addOp(new op.BondDelete(id));
	action.addOp(new op.BondAdd(bond.end, bond.begin, bond)).data.bid = id;
	return action;
}

function fromBondFlipping(bid) {
	return toBondFlipping(bid).perform();
}

function fromTemplateOnCanvas(pos, angle, template) {
	var action = new Action();
	var frag = template.molecule;

	var fragAction = new op.FragmentAdd().perform(ui.editor);

	var map = {};

	// Only template atom label matters for now
	frag.atoms.each(function (aid, atom) {
		var operation;
		var attrs = Struct.Atom.getAttrHash(atom);
		attrs.fragment = fragAction.frid;

		action.addOp(
			operation = new op.AtomAdd(
				attrs,
			Vec2.diff(atom.pp, template.xy0).rotate(angle).add(pos)
			).perform(ui.editor)
		);

		map[aid] = operation.data.aid;
	});

	frag.bonds.each(function (bid, bond) {
		action.addOp(
		new op.BondAdd(
			map[bond.begin],
			map[bond.end],
			bond
		).perform(ui.editor)
		);
	});

	action.operations.reverse();
	action.addOp(fragAction);

	return action;
}

function atomAddToSGroups(sgroups, aid) {
	var action = new Action();
	sgroups.forEach(function (sid) {
		action.addOp(new op.SGroupAtomAdd(sid, aid).perform(ui.editor));
	}, this);
	return action;
}

function fromTemplateOnAtom(aid, angle, extraBond, template) { // eslint-disable-line max-statements
	var action = new Action();
	var frag = template.molecule;
	var restruct = ui.render.ctab;
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
			var middleAtom = atomForNewBond(aid);
			var actionRes = fromBondAddition({ type: 1 }, aid, middleAtom.atom, middleAtom.pos.get_xy0());
			action = actionRes[0];
			action.operations.reverse();
			aid1 = aid = actionRes[2];
		} else {
			var operation;

			action.addOp(
				operation = new op.AtomAdd(
				{ label: 'C', fragment: frid },
				(new Vec2(1, 0)).rotate(angle).add(atom.pp).get_xy0()
				).perform(ui.editor)
			);

			action.addOp(
			new op.BondAdd(
				aid,
				operation.data.aid,
			{ type: 1 }
			).perform(ui.editor)
			);

			aid1 = aid = operation.data.aid;
			action.mergeWith(atomAddToSGroups(sgroups, aid));
		}

		var atom0 = atom;
		atom = struct.atoms.get(aid);
		var delta = utils.calcAngle(atom0.pp, atom.pp) - template.angle0;
	} else {
		if (angle == null) {
			middleAtom = atomForNewBond(aid);
			angle = utils.calcAngle(atom.pp, middleAtom.pos);
		}
		delta = angle - template.angle0;
	}

	frag.atoms.each(function (id, a) {
		var attrs = Struct.Atom.getAttrHash(a);
		attrs.fragment = frid;
		if (id == template.aid) {
			action.mergeWith(fromAtomsAttrs(aid, attrs, true));
			map[id] = aid;
		} else {
			var v;

			v = Vec2.diff(a.pp, xy0).rotate(delta).add(atom.pp);

			action.addOp(
				operation = new op.AtomAdd(
					attrs,
					v.get_xy0()
				).perform(ui.editor)
			);
			map[id] = operation.data.aid;
		}
		if (map[id] - 0 !== aid0 - 0 && map[id] - 0 !== aid1 - 0)
			action.mergeWith(atomAddToSGroups(sgroups, map[id]));
	});

	frag.bonds.each(function (bid, bond) {
		action.addOp(
		new op.BondAdd(
			map[bond.begin],
			map[bond.end],
			bond
		).perform(ui.editor)
		);
	});

	action.operations.reverse();

	return action;
}

function fromTemplateOnBond(bid, template, flip) { // eslint-disable-line max-statements
	var action = new Action();
	var frag = template.molecule;
	var restruct = ui.render.ctab;
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
			action.mergeWith(fromAtomsAttrs(map[id], attrs, true));
			return;
		}

		var v;

		v = Vec2.diff(a.pp, frBegin.pp).rotate(angle).scaled(scale).add(begin.pp);

		var mergeA = closest.atom(restruct, v, 0.1);

		if (mergeA == null) {
			var operation;
			action.addOp(
				operation = new op.AtomAdd(
					attrs,
					v
				).perform(ui.editor)
			);

			map[id] = operation.data.aid;
			action.mergeWith(atomAddToSGroups(sgroups, map[id]));
		} else {
			map[id] = mergeA.id;
			action.mergeWith(fromAtomsAttrs(map[id], attrs, true));
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
			).perform(ui.editor));
		} else {
			action.mergeWith(fromBondAttrs(existId, frBond, false, true));
		}
	});

	action.operations.reverse();

	return action;
}

function fromChain(p0, v, nSect, atomId) {
	var angle = Math.PI / 6;
	var dx = Math.cos(angle);
	var dy = Math.sin(angle);

	var action = new Action();

	var frid;
	if (atomId != null)
		frid = atomGetAttr(ui.render.ctab, atomId, 'fragment');
	else
		frid = action.addOp(new op.FragmentAdd().perform(ui.editor)).frid;

	var id0 = -1;
	if (atomId != null)
		id0 = atomId;
	else
		id0 = action.addOp(new op.AtomAdd({ label: 'C', fragment: frid }, p0).perform(ui.editor)).data.aid;

	action.operations.reverse();

	nSect.times(function (i) {
		var pos = new Vec2(dx * (i + 1), i & 1 ? 0 : dy).rotate(v).add(p0);

		var a = closest.atom(ui.render.ctab, pos, 0.1);

		var ret = fromBondAddition({}, id0, a ? a.id : {}, pos);
		action = ret[0].mergeWith(action);
		id0 = ret[2];
	}, this);

	return action;
}

function fromNewCanvas(struct) {
	var action = new Action();

	action.addOp(new op.CanvasLoad(struct));
	return action.perform();
}

function fromSgroupType(id, type) {
	var restruct = ui.render.ctab;
	var sg = restruct.sgroups.get(id).item;
	var curType = sg.type;
	if (type && type != curType) {
		var atoms = [].slice.call(Struct.SGroup.getAtoms(restruct.molecule, sg));
		var attrs = sg.getAttrs();
		var actionDeletion = fromSgroupDeletion(id); // [MK] order of execution is important, first delete then recreate
		var actionAddition = fromSgroupAddition(type, atoms, attrs, id);
		return actionAddition.mergeWith(actionDeletion); // the actions are already performed and reversed, so we merge them backwards
	}
	return new Action();
}

function fromSgroupAttrs(id, attrs) {
	var action = new Action();

	for (var key in attrs)
		action.addOp(new op.SGroupAttr(id, key, attrs[key]));

	return action.perform();
}

function sGroupAttributeAction(id, attrs) {
	var action = new Action();

	for (var key in attrs)
		action.addOp(new op.SGroupAttr(id, key, attrs[key]));

	return action;
}

function fromSgroupDeletion(id) { // eslint-disable-line max-statements
	var action = new Action();
	var restruct = ui.render.ctab;
	var struct = restruct.molecule;

	var sG = restruct.sgroups.get(id).item;
	if (sG.type == 'SRU') {
		struct.sGroupsRecalcCrossBonds();
		var neiAtoms = sG.neiAtoms;

		neiAtoms.each(function (aid) {
			if (atomGetAttr(restruct, aid, 'label') == '*')
				action.addOp(new op.AtomAttr(aid, 'label', 'C'));
		}, this);
	}

	var sg = struct.sgroups.get(id);
	var atoms = Struct.SGroup.getAtoms(struct, sg);
	var attrs = sg.getAttrs();
	action.addOp(new op.SGroupRemoveFromHierarchy(id));
	for (var i = 0; i < atoms.length; ++i)
		action.addOp(new op.SGroupAtomRemove(id, atoms[i]));
	action.addOp(new op.SGroupDelete(id));

	action = action.perform();

	action.mergeWith(sGroupAttributeAction(id, attrs));

	return action;
}

function fromSgroupAddition(type, atoms, attrs, sgid, pp) { // eslint-disable-line max-params, max-statements
	var action = new Action();
	var i;

	// TODO: shoud the id be generated when OpSGroupCreate is executed?
	//      if yes, how to pass it to the following operations?
	sgid = sgid - 0 === sgid ? sgid : ui.render.ctab.molecule.sgroups.newId();

	action.addOp(new op.SGroupCreate(sgid, type, pp));
	for (i = 0; i < atoms.length; i++)
		action.addOp(new op.SGroupAtomAdd(sgid, atoms[i]));
	action.addOp(type != 'DAT' ?
	             new op.SGroupAddToHierarchy(sgid) :
	             new op.SGroupAddToHierarchy(sgid, -1, []));

	action = action.perform();

	var restruct = ui.render.ctab;
	if (type == 'SRU') {
		restruct.molecule.sGroupsRecalcCrossBonds();
		var asteriskAction = new Action();
		restruct.sgroups.get(sgid).item.neiAtoms.each(function (aid) {
			var plainCarbon = restruct.atoms.get(aid).a.isPlainCarbon();
			if (atomGetDegree(ui.render.ctab, aid) == 1 && plainCarbon)
				asteriskAction.addOp(new op.AtomAttr(aid, 'label', '*'));
		}, this);

		asteriskAction = asteriskAction.perform();
		asteriskAction.mergeWith(action);
		action = asteriskAction;
	}

	return fromSgroupAttrs(sgid, attrs).mergeWith(action);
}

function fromRGroupAttrs(id, attrs) {
	var action = new Action();
	for (var key in attrs)
		action.addOp(new op.RGroupAttr(id, key, attrs[key]));
	return action.perform();
}

function fromRGroupFragment(rgidNew, frid) {
	var action = new Action();
	action.addOp(new op.RGroupFragment(rgidNew, frid));
	return action.perform();
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

	var selection = {
		atoms: struct.atoms.keys(),
		bonds: struct.bonds.keys(),
		rxnArrows: struct.rxnArrows.keys(),
		rxnPluses: struct.rxnPluses.keys()
	};

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
	selection.atoms.each(function (id) {
		var newAtom = new Struct.Atom(struct.atoms.get(id));
		newAtom.pos = newAtom.pp;
		mapping[id] = clipboard.atoms.push(new Struct.Atom(newAtom)) - 1;
	});

	selection.bonds.each(function (id) {
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

	selection.rxnArrows.each(function (id) {
		var arrow = new Struct.RxnArrow(struct.rxnArrows.get(id));
		arrow.pos = arrow.pp;
		clipboard.rxnArrows.push(arrow);
	});

	selection.rxnPluses.each(function (id) {
		var plus = new Struct.RxnPlus(struct.rxnPluses.get(id));
		plus.pos = plus.pp;
		clipboard.rxnPluses.push(plus);
	});

	// r-groups
	var atomFragments = {};
	var fragments = Set.empty();
	selection.atoms.each(function (id) {
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

function fromPaste(struct, point) { // eslint-disable-line max-statements
	var clipboard = struct2Clipboard(struct);
	var offset = point ? Vec2.diff(point, getAnchorPosition(clipboard)) : new Vec2();
	var action = new Action();
	var amap = {};
	var fmap = {};
	// atoms
	for (var aid = 0; aid < clipboard.atoms.length; aid++) {
		var atom = Object.clone(clipboard.atoms[aid]);
		if (!(atom.fragment in fmap))
			fmap[atom.fragment] = action.addOp(new op.FragmentAdd().perform(ui.editor)).frid;
		atom.fragment = fmap[atom.fragment];
		amap[aid] = action.addOp(new op.AtomAdd(atom, atom.pp.add(offset)).perform(ui.editor)).data.aid;
	}

	var rgnew = [];
	for (var rgid in clipboard.rgroups) {
		if (!ui.render.ctab.molecule.rgroups.has(rgid))
			rgnew.push(rgid);
	}

	// assign fragments to r-groups
	for (var frid in clipboard.rgmap)
		action.addOp(new op.RGroupFragment(clipboard.rgmap[frid], fmap[frid]).perform(ui.editor));

	for (var i = 0; i < rgnew.length; ++i)
		action.mergeWith(fromRGroupAttrs(rgnew[i], clipboard.rgroups[rgnew[i]]));

	// bonds
	for (var bid = 0; bid < clipboard.bonds.length; bid++) {
		var bond = Object.clone(clipboard.bonds[bid]);
		action.addOp(new op.BondAdd(amap[bond.begin], amap[bond.end], bond).perform(ui.editor));
	}
	// sgroups
	for (var sgid = 0; sgid < clipboard.sgroups.length; sgid++) {
		var sgroupInfo = clipboard.sgroups[sgid];
		var atoms = sgroupInfo.atoms;
		var sgatoms = [];
		for (var sgaid = 0; sgaid < atoms.length; sgaid++)
			sgatoms.push(amap[atoms[sgaid]]);
		var newsgid = ui.render.ctab.molecule.sgroups.newId();
		var sgaction = fromSgroupAddition(sgroupInfo.type, sgatoms, sgroupInfo.attrs, newsgid, sgroupInfo.pp ? sgroupInfo.pp.add(offset) : null);
		for (var iop = sgaction.operations.length - 1; iop >= 0; iop--)
			action.addOp(sgaction.operations[iop]);
	}
	// reaction arrows
	if (ui.editor.render.ctab.rxnArrows.count() < 1) {
		for (var raid = 0; raid < clipboard.rxnArrows.length; raid++)
			action.addOp(new op.RxnArrowAdd(clipboard.rxnArrows[raid].pp.add(offset)).perform(ui.editor));
	}
	// reaction pluses
	for (var rpid = 0; rpid < clipboard.rxnPluses.length; rpid++)
		action.addOp(new op.RxnPlusAdd(clipboard.rxnPluses[rpid].pp.add(offset)).perform(ui.editor));
	// thats all
	if (struct.isChiral) {
		// mimic Restruct initialization
		var bb = struct.getCoordBoundingBox();
		var pp = new Vec2(bb.max.x, bb.min.y - 1);
		action.addOp(new op.ChiralFlagAdd(pp.add(offset))).perform(ui.editor);
	}
	action.operations.reverse();
	return action;
}

function fromFlip(selection, flip) { // eslint-disable-line max-statements
	var restruct = ui.render.ctab;
	var struct = restruct.molecule;

	var action = new Action();
	var i;
	var fids = {};

	if (!selection) {
		selection = {       // TODO: generic method to get
			                // selection from all the struct
			atoms: struct.atoms.keys(),
			bonds: struct.bonds.keys()
		};
	}

	if (selection.atoms) {
		for (i = 0; i < selection.atoms.length; i++) {
			var aid = selection.atoms[i];
			var atom = struct.atoms.get(aid);
			if (!(atom.fragment in fids))
				fids[atom.fragment] = [aid];
			else
				fids[atom.fragment].push(aid);
		}

		if (Object.keys(fids).find(function (frag) {
			return !Set.eq(struct.getFragmentIds(frag), Set.fromList(fids[frag]));
		}))
			return action; // empty action

		Object.keys(fids).forEach(function (frag) {
			var fragment = Set.fromList(fids[frag]);
			// var x1 = 100500, x2 = -100500, y1 = 100500, y2 = -100500;
			var bbox = struct.getCoordBoundingBox(fragment);

			Set.each(fragment, function (aid) {
				var atom = struct.atoms.get(aid);
				var d = new Vec2();

				/* eslint-disable no-mixed-operators*/
				if (flip == 'horizontal')
					d.x = bbox.min.x + bbox.max.x - 2 * atom.pp.x;
				else // 'vertical'
					d.y = bbox.min.y + bbox.max.y - 2 * atom.pp.y;
				/* eslint-enable no-mixed-operators*/

				action.addOp(new op.AtomMove(aid, d));
			});
		});

		if (selection.bonds) {
			for (i = 0; i < selection.bonds.length; i++) {
				var bid = selection.bonds[i];
				var bond = struct.bonds.get(bid);

				if (bond.type == Struct.Bond.PATTERN.TYPE.SINGLE) {
					if (bond.stereo == Struct.Bond.PATTERN.STEREO.UP) // eslint-disable-line max-depth
						action.addOp(new op.BondAttr(bid, 'stereo', Struct.Bond.PATTERN.STEREO.DOWN));
					else if (bond.stereo == Struct.Bond.PATTERN.STEREO.DOWN)
						action.addOp(new op.BondAttr(bid, 'stereo', Struct.Bond.PATTERN.STEREO.UP));
				}
			}
		}
	}

	return action.perform();
}

function fromRotate(selection, pos, angle) { // eslint-disable-line max-statements
	var restruct = ui.render.ctab;
	var struct = restruct.molecule;

	var action = new Action();

	if (selection.atoms) {
		selection.atoms.each(function (aid) {
			var atom = struct.atoms.get(aid);
			action.addOp(new op.AtomMove(aid, rotateDelta(atom.pp, pos, angle)));
		});
	}

	if (selection.rxnArrows) {
		selection.rxnArrows.each(function (aid) {
			var arrow = struct.rxnArrows.get(aid);
			action.addOp(new op.RxnArrowMove(aid, rotateDelta(arrow.pp, pos, angle)));
		});
	}

	if (selection.rxnPluses) {
		selection.rxnPluses.each(function (pid) {
			var plus = struct.rxnPluses.get(pid);
			action.addOp(new op.RxnPlusMove(pid, rotateDelta(plus.pp, pos, angle)));
		});
	}

	if (selection.sgroupData) {
		selection.sgroupData.each(function (did) {
			var data = struct.sgroups.get(did);
			action.addOp(new op.SGroupDataMove(did, rotateDelta(data.pp, pos, angle)));
		});
	}

	if (selection.chiralFlags) {
		selection.chiralFlags.each(function (fid) {
			var flag = struct.chiralFlags.get(fid);
			action.addOp(new op.ChiralFlagMove(fid, rotateDelta(flag.pp, pos, angle)));
		});
	}

	return action.perform();
}

function getFragmentAtoms(struct, frid) {
	var atoms = [];
	struct.atoms.each(function (aid, atom) {
		if (atom.fragment == frid)
			atoms.push(aid);
	}, this);
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

module.exports = Object.assign(Action, {
	fromMultipleMove: fromMultipleMove,
	fromAtomAddition: fromAtomAddition,
	fromArrowAddition: fromArrowAddition,
	fromArrowDeletion: fromArrowDeletion,
	fromChiralFlagDeletion: fromChiralFlagDeletion,
	fromPlusAddition: fromPlusAddition,
	fromPlusDeletion: fromPlusDeletion,
	fromAtomDeletion: fromAtomDeletion,
	fromBondDeletion: fromBondDeletion,
	fromFragmentDeletion: fromFragmentDeletion,
	fromAtomMerge: fromAtomMerge,
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
	fromRotate: fromRotate
});
