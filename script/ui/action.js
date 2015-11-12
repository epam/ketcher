/*global require, module, global*/

/*eslint-disable*/

var Set = require('../util/set');
var Vec2 = require('../util/vec2');
var util = require('../util');
var op = require('./op');

require('../chem');

var ui = global.ui;
var chem = global.chem;

//
// Undo/redo actions
//
function Action ()
{
	this.operations = [];
};

Action.prototype.addOp = function (operation) {
	if (!operation.isDummy(ui.editor))
		this.operations.push(operation);
	return operation;
};

Action.prototype.mergeWith = function (action)
{
	this.operations = this.operations.concat(action.operations);
	return this;
};

// Perform action and return inverted one
Action.prototype.perform = function ()
{
	var action = new Action();
	var idx = 0;

	this.operations.each(function (operation) {
		action.addOp(operation.perform(ui.editor));
		idx++;
	}, this);

	action.operations.reverse();
	return action;
};

Action.prototype.isDummy = function ()
{
	return this.operations.detect(function (operation) {
		return !operation.isDummy(ui.editor); // TODO [RB] the condition is always true for op.* operations
	}, this) == null;
};

// Add action operation to remove atom from s-group if needed
Action.prototype.removeAtomFromSgroupIfNeeded = function (id)
{
	var sgroups = ui.render.atomGetSGroups(id);

	if (sgroups.length > 0)
	{
		sgroups.each(function (sid)
		{
			this.addOp(new op.SGroupAtomRemove(sid, id));
		}, this);

		return true;
	}

	return false;
};

// Add action operations to remove whole s-group if needed
Action.prototype.removeSgroupIfNeeded = function (atoms)
{
	var R = ui.render;
	var RS = R.ctab;
	var DS = RS.molecule;
	var sg_counts = new Hash();

	atoms.each(function (id)
	{
		var sgroups = ui.render.atomGetSGroups(id);

		sgroups.each(function (sid)
		{
			var n = sg_counts.get(sid);
			if (Object.isUndefined(n))
				n = 1;
			else
				n++;
			sg_counts.set(sid, n);
		}, this);
	}, this);

	sg_counts.each(function (sg)
	{
		var sid = parseInt(sg.key);
		var sg_atoms = ui.render.sGroupGetAtoms(sid);

		if (sg_atoms.length == sg.value)
		{ // delete whole s-group
			var sgroup = DS.sgroups.get(sid);
			this.mergeWith(sGroupAttributeAction(sid, sgroup.getAttrs()));
			this.addOp(new op.SGroupRemoveFromHierarchy(sid));
			this.addOp(new op.SGroupDelete(sid));
		}
	}, this);
};

function fromMultipleMove (lists, d)
{
	d = new Vec2(d);

	var action = new Action();
	var i;

	var R = ui.render;
	var RS = R.ctab;
	var DS = RS.molecule;
	var bondlist = [];
	var loops = Set.empty();
	var atomsToInvalidate = Set.empty();

	if (lists.atoms) {
		var atomSet = Set.fromList(lists.atoms);
		RS.bonds.each(function (bid, bond){

			if (Set.contains(atomSet, bond.b.begin) && Set.contains(atomSet, bond.b.end)) {
				bondlist.push(bid);
				// add all adjacent loops
				// those that are not completely inside the structure will get redrawn anyway
				util.each(['hb1','hb2'], function (hb){
					var loop = DS.halfBonds.get(bond.b[hb]).loop;
					if (loop >= 0)
						Set.add(loops, loop);
				}, this);
			}
			else if (Set.contains(atomSet, bond.b.begin))
				Set.add(atomsToInvalidate, bond.b.begin);
			else if (Set.contains(atomSet, bond.b.end))
				Set.add(atomsToInvalidate, bond.b.end);
		}, this);
		for (i = 0; i < bondlist.length; ++i) {
			action.addOp(new op.BondMove(bondlist[i], d));
		}
		Set.each(loops, function (loopId){
			if (RS.reloops.get(loopId) && RS.reloops.get(loopId).visel) // hack
				action.addOp(new op.LoopMove(loopId, d));
		}, this);
		for (i = 0; i < lists.atoms.length; ++i) {
			var aid = lists.atoms[i];
			action.addOp(new op.AtomMove(aid, d, !Set.contains(atomsToInvalidate, aid)));
		}
	}

	if (lists.rxnArrows)
		for (i = 0; i < lists.rxnArrows.length; ++i)
			action.addOp(new op.RxnArrowMove(lists.rxnArrows[i], d, true));

	if (lists.rxnPluses)
		for (i = 0; i < lists.rxnPluses.length; ++i)
			action.addOp(new op.RxnPlusMove(lists.rxnPluses[i], d, true));

	if (lists.sgroupData)
		for (i = 0; i < lists.sgroupData.length; ++i)
			action.addOp(new op.SGroupDataMove(lists.sgroupData[i], d));

	if (lists.chiralFlags)
		for (i = 0; i < lists.chiralFlags.length; ++i)
			action.addOp(new op.ChiralFlagMove(d));

	return action.perform();
};

function fromAtomsAttrs (ids, attrs, reset)
{
	var action = new Action();
	(typeof(ids) == 'number' ? [ids] : ids).each(function (id) {
		for (var key in chem.Struct.Atom.attrlist) {
			var value;
			if (key in attrs)
				value = attrs[key];
			else if (reset)
				value = chem.Struct.Atom.attrGetDefault(key);
			else
				continue;
			action.addOp(new op.AtomAttr(id, key, value));
		}
		if (!reset && 'label' in attrs && attrs.label != null && attrs.label != 'L#' && !attrs['atomList']) {
			action.addOp(new op.AtomAttr(id, 'atomList', null));
		}
	}, this);
	return action.perform();
};

function fromBondAttrs (id, attrs, flip, reset)
{
	var action = new Action();

	for (var key in chem.Struct.Bond.attrlist) {
		var value;
		if (key in attrs)
			value = attrs[key];
		else if (reset)
			value = chem.Struct.Bond.attrGetDefault(key);
		else
			continue;
		action.addOp(new op.BondAttr(id, key, value));
	}
	if (flip)
		action.mergeWith(toBondFlipping(id));
	return action.perform();
};

function fromSelectedBondsAttrs (attrs, flips)
{
	var action = new Action();

	attrs = new Hash(attrs);

	ui.editor.getSelection().bonds.each(function (id) {
		attrs.each(function (attr) {
			action.addOp(new op.BondAttr(id, attr.key, attr.value));
		}, this);
	}, this);
	if (flips)
		flips.each(function (id) {
			action.mergeWith(toBondFlipping(id));
		}, this);
	return action.perform();
};

function fromAtomAddition (pos, atom)
{
	atom = Object.clone(atom);
	var action = new Action();
	atom.fragment = action.addOp(new op.FragmentAdd().perform(ui.editor)).frid;
	action.addOp(new op.AtomAdd(atom, pos).perform(ui.editor));
	return action;
};

function mergeFragments (action, frid, frid2) {
	if (frid2 != frid && Object.isNumber(frid2)) {
		var rgid = chem.Struct.RGroup.findRGroupByFragment(ui.render.ctab.molecule.rgroups, frid2);
		if (!Object.isUndefined(rgid)) {
			action.mergeWith(fromRGroupFragment(null, frid2));
		}
		ui.render.ctab.molecule.atoms.each(function (aid, atom) {
			if (atom.fragment == frid2) {
				action.addOp(new op.AtomAttr(aid, 'fragment', frid).perform(ui.editor));
			}
		});
		action.addOp(new op.FragmentDelete(frid2).perform(ui.editor));
	}
};

// Get new atom id/label and pos for bond being added to existing atom
function atomForNewBond (id)
{
	var neighbours = [];
	var pos = ui.render.atomGetPos(id);

	ui.render.atomGetNeighbors(id).each(function (nei)
	{
		var nei_pos = ui.render.atomGetPos(nei.aid);

		if (Vec2.dist(pos, nei_pos) < 0.1)
			return;

		neighbours.push({id: nei.aid, v: Vec2.diff(nei_pos, pos)});
	});

	neighbours.sort(function (nei1, nei2)
	{
		return Math.atan2(nei1.v.y, nei1.v.x) - Math.atan2(nei2.v.y, nei2.v.x);
	});

	var i, max_i = 0;
	var angle, max_angle = 0;

	// TODO: impove layout: tree, ...

	for (i = 0; i < neighbours.length; i++) {
		angle = Vec2.angle(neighbours[i].v, neighbours[(i + 1) % neighbours.length].v);

		if (angle < 0)
			angle += 2 * Math.PI;

		if (angle > max_angle)
			max_i = i, max_angle = angle;
	}

	var v = new Vec2(1, 0);

	if (neighbours.length > 0) {
		if (neighbours.length == 1) {
			max_angle = -(4 * Math.PI / 3);

			// zig-zag
			var nei = ui.render.atomGetNeighbors(id)[0];
			if (ui.render.atomGetDegree(nei.aid) > 1) {
				var nei_neighbours = [];
				var nei_pos = ui.render.atomGetPos(nei.aid);
				var nei_v = Vec2.diff(pos, nei_pos);
				var nei_angle = Math.atan2(nei_v.y, nei_v.x);

				ui.render.atomGetNeighbors(nei.aid).each(function (nei_nei) {
					var nei_nei_pos = ui.render.atomGetPos(nei_nei.aid);

					if (nei_nei.bid == nei.bid || Vec2.dist(nei_pos, nei_nei_pos) < 0.1)
						return;

					var v_diff = Vec2.diff(nei_nei_pos, nei_pos);
					var ang = Math.atan2(v_diff.y, v_diff.x) - nei_angle;

					if (ang < 0)
						ang += 2 * Math.PI;

					nei_neighbours.push(ang);
				});
				nei_neighbours.sort(function (nei1, nei2) {
					return nei1 - nei2;
				});

				if (nei_neighbours[0] <= Math.PI * 1.01 && nei_neighbours[nei_neighbours.length - 1] <= 1.01 * Math.PI)
					max_angle *= -1;

			}
		}

		angle = (max_angle / 2) + Math.atan2(neighbours[max_i].v.y, neighbours[max_i].v.x);

		v = v.rotate(angle);
	}

	v.add_(pos);

	var a = ui.render.findClosestAtom(v, 0.1);

	if (a == null)
		a = {label: 'C'};
	else
		a = a.id;

	return {atom: a, pos: v};
};

function fromBondAddition (bond, begin, end, pos, pos2)
{
	if (end === undefined) {
		var atom = atomForNewBond(begin);
		end = atom.atom;
		pos = atom.pos;
	}
	var action = new Action();

	var frid = null;
	if (!Object.isNumber(begin)) {
		if (Object.isNumber(end)) {
			frid = ui.render.atomGetAttr(end, 'fragment');
		}
	}
	else {
		frid = ui.render.atomGetAttr(begin, 'fragment');
		if (Object.isNumber(end)) {
			var frid2 = ui.render.atomGetAttr(end, 'fragment');
			mergeFragments(action, frid, frid2);
		}
	}
	if (frid == null) {
		frid = action.addOp(new op.FragmentAdd().perform(ui.editor)).frid;
	}

	if (!Object.isNumber(begin)) {
		begin.fragment = frid;
		begin = action.addOp(new op.AtomAdd(begin, pos).perform(ui.editor)).data.aid;

		pos = pos2;
	}
	else {
		if (ui.render.atomGetAttr(begin, 'label') == '*') {
			action.addOp(new op.AtomAttr(begin, 'label', 'C').perform(ui.editor));
		}
	}


	if (!Object.isNumber(end)) {
		end.fragment = frid;
		// TODO: <op>.data.aid here is a hack, need a better way to access the id of a newly created atom
		end = action.addOp(new op.AtomAdd(end, pos).perform(ui.editor)).data.aid;
		if (Object.isNumber(begin)) {
			ui.render.atomGetSGroups(begin).each(function (sid) {
				action.addOp(new op.SGroupAtomAdd(sid, end).perform(ui.editor));
			}, this);
		}
	}
	else {
		if (ui.render.atomGetAttr(end, 'label') == '*') {
			action.addOp(new op.AtomAttr(end, 'label', 'C').perform(ui.editor));
		}
	}

	var bid = action.addOp(new op.BondAdd(begin, end, bond).perform(ui.editor)).data.bid;

	action.operations.reverse();

	return [action, begin, end, bid];
};

function fromArrowAddition (pos)
{
	var action = new Action();
	if (ui.ctab.rxnArrows.count() < 1) {
		action.addOp(new op.RxnArrowAdd(pos).perform(ui.editor));
	}
	return action;
};

function fromArrowDeletion (id)
{
	var action = new Action();
	action.addOp(new op.RxnArrowDelete(id));
	return action.perform();
};

function fromChiralFlagAddition (pos)
{
	var action = new Action();
	if (ui.render.ctab.chiralFlags.count() < 1) {
		action.addOp(new op.ChiralFlagAdd(pos).perform(ui.editor));
	}
	return action;
};

function fromChiralFlagDeletion ()
{
	var action = new Action();
	action.addOp(new op.ChiralFlagDelete());
	return action.perform();
};

function fromPlusAddition (pos)
{
	var action = new Action();
	action.addOp(new op.RxnPlusAdd(pos).perform(ui.editor));
	return action;
};

function fromPlusDeletion (id)
{
	var action = new Action();
	action.addOp(new op.RxnPlusDelete(id));
	return action.perform();
};

function fromAtomDeletion (id)
{
	var action = new Action();
	var atoms_to_remove = new Array();

	var frid = ui.ctab.atoms.get(id).fragment;

	ui.render.atomGetNeighbors(id).each(function (nei)
	{
		action.addOp(new op.BondDelete(nei.bid));// [RB] !!
		if (ui.render.atomGetDegree(nei.aid) == 1)
		{
			if (action.removeAtomFromSgroupIfNeeded(nei.aid))
				atoms_to_remove.push(nei.aid);

			action.addOp(new op.AtomDelete(nei.aid));
		}
	}, this);

	if (action.removeAtomFromSgroupIfNeeded(id))
		atoms_to_remove.push(id);

	action.addOp(new op.AtomDelete(id));

	action.removeSgroupIfNeeded(atoms_to_remove);

	action = action.perform();

	action.mergeWith(fromFragmentSplit(frid));

	return action;
};

function fromBondDeletion (id)
{
	var action = new Action();
	var bond = ui.ctab.bonds.get(id);
	var frid = ui.ctab.atoms.get(bond.begin).fragment;
	var atoms_to_remove = new Array();

	action.addOp(new op.BondDelete(id));

	if (ui.render.atomGetDegree(bond.begin) == 1)
	{
		if (action.removeAtomFromSgroupIfNeeded(bond.begin))
			atoms_to_remove.push(bond.begin);

		action.addOp(new op.AtomDelete(bond.begin));
	}

	if (ui.render.atomGetDegree(bond.end) == 1)
	{
		if (action.removeAtomFromSgroupIfNeeded(bond.end))
			atoms_to_remove.push(bond.end);

		action.addOp(new op.AtomDelete(bond.end));
	}

	action.removeSgroupIfNeeded(atoms_to_remove);

	action = action.perform();

	action.mergeWith(fromFragmentSplit(frid));

	return action;
};

function fromFragmentSplit (frid) { // TODO [RB] the thing is too tricky :) need something else in future
	var action = new Action();
	var rgid = chem.Struct.RGroup.findRGroupByFragment(ui.ctab.rgroups, frid);
	ui.ctab.atoms.each(function (aid, atom) {
		if (atom.fragment == frid) {
			var newfrid = action.addOp(new op.FragmentAdd().perform(ui.editor)).frid;
			var processAtom = function (aid1) {
				action.addOp(new op.AtomAttr(aid1, 'fragment', newfrid).perform(ui.editor));
				ui.render.atomGetNeighbors(aid1).each(function (nei) {
					if (ui.ctab.atoms.get(nei.aid).fragment == frid) {
						processAtom(nei.aid);
					}
				});
			};
			processAtom(aid);
			if (rgid) {
				action.mergeWith(fromRGroupFragment(rgid, newfrid));
			}
		}
	});
	if (frid != -1) {
		action.mergeWith(fromRGroupFragment(0, frid));
		action.addOp(new op.FragmentDelete(frid).perform(ui.editor));
	}
	return action;
};

function fromFragmentAddition (atoms, bonds, sgroups, rxnArrows, rxnPluses)
{
	var action = new Action();

	/*
     atoms.each(function (aid)
     {
     ui.render.atomGetNeighbors(aid).each(function (nei)
     {
     if (ui.selection.bonds.indexOf(nei.bid) == -1)
     ui.selection.bonds = ui.selection.bonds.concat([nei.bid]);
     }, this);
     }, this);
     */

	// TODO: merge close atoms and bonds

	sgroups.each(function (sid)
	{
		action.addOp(new op.SGroupRemoveFromHierarchy(sid));
		action.addOp(new op.SGroupDelete(sid));
	}, this);


	bonds.each(function (bid) {
		action.addOp(new op.BondDelete(bid));
	}, this);


	atoms.each(function (aid) {
		action.addOp(new op.AtomDelete(aid));
	}, this);

	rxnArrows.each(function (id) {
		action.addOp(new op.RxnArrowDelete(id));
	}, this);

	rxnPluses.each(function (id) {
		action.addOp(new op.RxnPlusDelete(id));
	}, this);

	action.mergeWith(new fromFragmentSplit(-1));

	return action;
};

function fromFragmentDeletion (selection)
{
	selection = selection || ui.editor.getSelection();

	var action = new Action();
	var atoms_to_remove = new Array();

	var frids = [];

	var actionRemoveDataSGroups = new Action();
	if (selection.sgroupData) {
		selection.sgroupData.each(function (id) {
			actionRemoveDataSGroups.mergeWith(fromSgroupDeletion(id));
		}, this);
	}

	selection.atoms.each(function (aid)
	{
		ui.render.atomGetNeighbors(aid).each(function (nei)
		{
			if (selection.bonds.indexOf(nei.bid) == -1)
				selection.bonds = selection.bonds.concat([nei.bid]);
		}, this);
	}, this);

	selection.bonds.each(function (bid)
	{
		action.addOp(new op.BondDelete(bid));

		var bond = ui.ctab.bonds.get(bid);

		if (selection.atoms.indexOf(bond.begin) == -1 && ui.render.atomGetDegree(bond.begin) == 1)
		{
			var frid1 = ui.ctab.atoms.get(bond.begin).fragment;
			if (frids.indexOf(frid1) < 0)
				frids.push(frid1);

			if (action.removeAtomFromSgroupIfNeeded(bond.begin))
				atoms_to_remove.push(bond.begin);

			action.addOp(new op.AtomDelete(bond.begin));
		}
		if (selection.atoms.indexOf(bond.end) == -1 && ui.render.atomGetDegree(bond.end) == 1)
		{
			var frid2 = ui.ctab.atoms.get(bond.end).fragment;
			if (frids.indexOf(frid2) < 0)
				frids.push(frid2);

			if (action.removeAtomFromSgroupIfNeeded(bond.end))
				atoms_to_remove.push(bond.end);

			action.addOp(new op.AtomDelete(bond.end));
		}
	}, this);


	selection.atoms.each(function (aid)
	{
		var frid3 = ui.ctab.atoms.get(aid).fragment;
		if (frids.indexOf(frid3) < 0)
			frids.push(frid3);

		if (action.removeAtomFromSgroupIfNeeded(aid))
			atoms_to_remove.push(aid);

		action.addOp(new op.AtomDelete(aid));
	}, this);

	action.removeSgroupIfNeeded(atoms_to_remove);

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

	while (frids.length > 0) action.mergeWith(new fromFragmentSplit(frids.pop()));

	action.mergeWith(actionRemoveDataSGroups);

	return action;
};

function fromAtomMerge (src_id, dst_id)
{
	var fragAction = new Action();
	var src_frid = ui.render.atomGetAttr(src_id, 'fragment'), dst_frid = ui.render.atomGetAttr(dst_id, 'fragment');
	if (src_frid != dst_frid) {
		mergeFragments(fragAction, src_frid, dst_frid);
	}

	var action = new Action();

	ui.render.atomGetNeighbors(src_id).each(function (nei)
	{
		var bond = ui.ctab.bonds.get(nei.bid);
		var begin, end;

		if (bond.begin == nei.aid) {
			begin = nei.aid;
			end = dst_id;
		} else {
			begin = dst_id;
			end = nei.aid;
		}
		if (dst_id != bond.begin && dst_id != bond.end && ui.ctab.findBondId(begin, end) == -1) // TODO: improve this
		{
			action.addOp(new op.BondAdd(begin, end, bond));
		}
		action.addOp(new op.BondDelete(nei.bid));
	}, this);

	var attrs = chem.Struct.Atom.getAttrHash(ui.ctab.atoms.get(src_id));

	if (ui.render.atomGetDegree(src_id) == 1 && attrs.get('label') == '*')
		attrs.set('label', 'C');

	attrs.each(function (attr) {
		action.addOp(new op.AtomAttr(dst_id, attr.key, attr.value));
	}, this);

	var sg_changed = action.removeAtomFromSgroupIfNeeded(src_id);

	action.addOp(new op.AtomDelete(src_id));

	if (sg_changed)
		action.removeSgroupIfNeeded([src_id]);

	return action.perform().mergeWith(fragAction);
};

function toBondFlipping (id)
{
	var bond = ui.ctab.bonds.get(id);

	var action = new Action();
	action.addOp(new op.BondDelete(id));
	action.addOp(new op.BondAdd(bond.end, bond.begin, bond)).data.bid = id;
	return action;
};

function fromBondFlipping (bid) {
	return toBondFlipping(bid).perform();
};

function fromTemplateOnCanvas (pos, angle, template)
{
	var action = new Action();
	var frag = template.molecule;

	var fragAction = new op.FragmentAdd().perform(ui.editor);

	var map = {};

	// Only template atom label matters for now
	frag.atoms.each(function (aid, atom) {
		var operation;
		var attrs = chem.Struct.Atom.getAttrHash(atom).toObject();
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
};

function atomAddToSGroups (sgroups, aid) {
	var action = new Action();
	util.each(sgroups, function (sid){
		action.addOp(new op.SGroupAtomAdd(sid, aid).perform(ui.editor));
	}, this);
	return action;
}

function fromTemplateOnAtom (aid, angle, extra_bond, template, calcAngle)
{
	var action = new Action();
	var frag = template.molecule;
	var R = ui.render;
	var RS = R.ctab;
	var molecule = RS.molecule;
	var atom = molecule.atoms.get(aid);
	var aid0 = aid; // the atom that was clicked on
	var aid1 = null; // the atom on the other end of the extra bond, if any
	var sgroups = ui.render.atomGetSGroups(aid);

	var frid = R.atomGetAttr(aid, 'fragment');

	var map = {};
	var xy0 = frag.atoms.get(template.aid).pp;

	if (extra_bond) {
		// create extra bond after click on atom
		if (angle == null)
		{
			var middle_atom = atomForNewBond(aid);
			var action_res = fromBondAddition({type: 1}, aid, middle_atom.atom, middle_atom.pos);
			action = action_res[0];
			action.operations.reverse();
			aid1 = aid = action_res[2];
		} else {
			var operation;

			action.addOp(
				operation = new op.AtomAdd(
				{ label: 'C', fragment: frid },
				(new Vec2(1, 0)).rotate(angle).add(atom.pp)
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
		atom = molecule.atoms.get(aid);
		var delta = calcAngle(atom0.pp, atom.pp) - template.angle0;
	} else {
		if (angle == null) {
			middle_atom = atomForNewBond(aid);
			angle = calcAngle(atom.pp, middle_atom.pos);
		}
		delta = angle - template.angle0;
	}

	frag.atoms.each(function (id, a) {
		var attrs = chem.Struct.Atom.getAttrHash(a).toObject();
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
					v
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
};

function fromTemplateOnBond (bid, template, calcAngle, flip)
{
	var action = new Action();
	var frag = template.molecule;
	var R = ui.render;
	var RS = R.ctab;
	var molecule = RS.molecule;

	var bond = molecule.bonds.get(bid);
	var begin = molecule.atoms.get(bond.begin);
	var end = molecule.atoms.get(bond.end);
	var sgroups = Set.list(Set.intersection(
	Set.fromList(ui.render.atomGetSGroups(bond.begin)),
	Set.fromList(ui.render.atomGetSGroups(bond.end))));

	var fr_bond = frag.bonds.get(template.bid);
	var fr_begin;
	var fr_end;

	var frid = R.atomGetAttr(bond.begin, 'fragment');

	var map = {};

	if (flip) {
		fr_begin = frag.atoms.get(fr_bond.end);
		fr_end = frag.atoms.get(fr_bond.begin);
		map[fr_bond.end] = bond.begin;
		map[fr_bond.begin] = bond.end;
	} else {
		fr_begin = frag.atoms.get(fr_bond.begin);
		fr_end = frag.atoms.get(fr_bond.end);
		map[fr_bond.begin] = bond.begin;
		map[fr_bond.end] = bond.end;
	}

	// calc angle
	var angle = calcAngle(begin.pp, end.pp) - calcAngle(fr_begin.pp, fr_end.pp);
	var scale = Vec2.dist(begin.pp, end.pp) / Vec2.dist(fr_begin.pp, fr_end.pp);

	var xy0 = fr_begin.pp;

	frag.atoms.each(function (id, a) {
		var attrs = chem.Struct.Atom.getAttrHash(a).toObject();
		attrs.fragment = frid;
		if (id == fr_bond.begin || id == fr_bond.end) {
			action.mergeWith(fromAtomsAttrs(map[id], attrs, true));
			return;
		}

		var v;

		v = Vec2.diff(a.pp, fr_begin.pp).rotate(angle).scaled(scale).add(begin.pp);

		var merge_a = R.findClosestAtom(v, 0.1);

		if (merge_a == null) {
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
			map[id] = merge_a.id;
			action.mergeWith(fromAtomsAttrs(map[id], attrs, true));
			// TODO [RB] need to merge fragments?
		}
	});

	frag.bonds.each(function (id, bond) {
		var exist_id = molecule.findBondId(map[bond.begin], map[bond.end]);
		if (exist_id == -1) {
			action.addOp(
			new op.BondAdd(
				map[bond.begin],
				map[bond.end],
				bond
			).perform(ui.editor));
		} else {
			action.mergeWith(fromBondAttrs(exist_id, fr_bond, false, true));
		}
	});

	action.operations.reverse();

	return action;
}

function fromChain (p0, v, nSect, atom_id)
{
	var angle = Math.PI / 6;
	var dx = Math.cos(angle), dy = Math.sin(angle);

	var action = new Action();

	var frid;
	if (atom_id != null) {
		frid = ui.render.atomGetAttr(atom_id, 'fragment');
	} else {
		frid = action.addOp(new op.FragmentAdd().perform(ui.editor)).frid;
	}

	var id0 = -1;
	if (atom_id != null) {
		id0 = atom_id;
	} else {
		id0 = action.addOp(new op.AtomAdd({label: 'C', fragment: frid}, p0).perform(ui.editor)).data.aid;
	}

	action.operations.reverse();

	nSect.times(function (i) {
		var pos = new Vec2(dx * (i + 1), i & 1 ? 0 : dy).rotate(v).add(p0);

		var a = ui.render.findClosestAtom(pos, 0.1);

		var ret = fromBondAddition({}, id0, a ? a.id : {}, pos);
		action = ret[0].mergeWith(action);
		id0 = ret[2];
	}, this);

	return action;
};

function fromNewCanvas (ctab)
{
	var action = new Action();

	action.addOp(new op.CanvasLoad(ctab));
	return action.perform();
};

function fromSgroupType (id, type)
{
	var R = ui.render;
	var cur_type = R.sGroupGetType(id);
	if (type && type != cur_type) {
		var atoms = util.array(R.sGroupGetAtoms(id));
		var attrs = R.sGroupGetAttrs(id);
		var actionDeletion = fromSgroupDeletion(id); // [MK] order of execution is important, first delete then recreate
		var actionAddition = fromSgroupAddition(type, atoms, attrs, id);
		return actionAddition.mergeWith(actionDeletion); // the actions are already performed and reversed, so we merge them backwards
	}
	return new Action();
};

function fromSgroupAttrs (id, attrs)
{
	var action = new Action();
	var R = ui.render;
	var RS = R.ctab;
	var sg = RS.sgroups.get(id).item;

	new Hash(attrs).each(function (attr) {
		action.addOp(new op.SGroupAttr(id, attr.key, attr.value));
	}, this);

	return action.perform();
};

function sGroupAttributeAction (id, attrs)
{
	var action = new Action();

	new Hash(attrs).each(function (attr) { // store the attribute assignment
		action.addOp(new op.SGroupAttr(id, attr.key, attr.value));
	}, this);

	return action;
};

function fromSgroupDeletion (id)
{
	var action = new Action();
	var R = ui.render;
	var RS = R.ctab;
	var DS = RS.molecule;

	if (ui.render.sGroupGetType(id) == 'SRU') {
		ui.render.sGroupsFindCrossBonds();
		var nei_atoms = ui.render.sGroupGetNeighborAtoms(id);

		nei_atoms.each(function (aid) {
			if (ui.render.atomGetAttr(aid, 'label') == '*') {
				action.addOp(new op.AtomAttr(aid, 'label', 'C'));
			}
		}, this);
	}

	var sg = DS.sgroups.get(id);
	var atoms = chem.SGroup.getAtoms(DS, sg);
	var attrs = sg.getAttrs();
	action.addOp(new op.SGroupRemoveFromHierarchy(id));
	for (var i = 0; i < atoms.length; ++i) {
		action.addOp(new op.SGroupAtomRemove(id, atoms[i]));
	}
	action.addOp(new op.SGroupDelete(id));

	action = action.perform();

	action.mergeWith(sGroupAttributeAction(id, attrs));

	return action;
};

function fromSgroupAddition (type, atoms, attrs, sgid, pp)
{
	var action = new Action();
	var i;

	// TODO: shoud the id be generated when OpSGroupCreate is executed?
	//      if yes, how to pass it to the following operations?
	sgid = sgid - 0 === sgid ? sgid : ui.render.ctab.molecule.sgroups.newId();

	action.addOp(new op.SGroupCreate(sgid, type, pp));
	for (i = 0; i < atoms.length; i++)
		action.addOp(new op.SGroupAtomAdd(sgid, atoms[i]));
	action.addOp(new op.SGroupAddToHierarchy(sgid));

	action = action.perform();

	if (type == 'SRU') {
		ui.render.sGroupsFindCrossBonds();
		var asterisk_action = new Action();
		ui.render.sGroupGetNeighborAtoms(sgid).each(function (aid) {
			if (ui.render.atomGetDegree(aid) == 1 && ui.render.atomIsPlainCarbon(aid)) {
				asterisk_action.addOp(new op.AtomAttr(aid, 'label', '*'));
			}
		}, this);

		asterisk_action = asterisk_action.perform();
		asterisk_action.mergeWith(action);
		action = asterisk_action;
	}

	return fromSgroupAttrs(sgid, attrs).mergeWith(action);
};

function fromRGroupAttrs (id, attrs) {
	var action = new Action();
	new Hash(attrs).each(function (attr) {
		action.addOp(new op.RGroupAttr(id, attr.key, attr.value));
	}, this);
	return action.perform();
};

function fromRGroupFragment (rgidNew, frid) {
	var action = new Action();
	action.addOp(new op.RGroupFragment(rgidNew, frid));
	return action.perform();
};

// Should it be named structCenter?
function getAnchorPosition(clipboard) {
	if (clipboard.atoms.length) {
		var xmin = 1e50, ymin = xmin, xmax = -xmin, ymax = -ymin;
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
	} else {
		return null;
	}
}

// TODO: merge to bellow
function struct2Clipboard(struct) {
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
	selection.atoms.each(function (id)
	{
		var new_atom = new chem.Struct.Atom(struct.atoms.get(id));
		new_atom.pos = new_atom.pp;
		mapping[id] = clipboard.atoms.push(new chem.Struct.Atom(new_atom)) - 1;
	});

	selection.bonds.each(function (id)
	{
		var new_bond = new chem.Struct.Bond(struct.bonds.get(id));
		new_bond.begin = mapping[new_bond.begin];
		new_bond.end = mapping[new_bond.end];
		clipboard.bonds.push(new chem.Struct.Bond(new_bond));
	});

	var sgroup_list = struct.getSGroupsInAtomSet(selection.atoms);

	util.each(sgroup_list, function (sid){
		var sgroup = struct.sgroups.get(sid);
		var sgAtoms = chem.SGroup.getAtoms(struct, sgroup);
		var sgroup_info = {
			type: sgroup.type,
			attrs: sgroup.getAttrs(),
			atoms: util.array(sgAtoms),
			pp: sgroup.pp
		};

		for (var i = 0; i < sgroup_info.atoms.length; i++)
			sgroup_info.atoms[i] = mapping[sgroup_info.atoms[i]];

		clipboard.sgroups.push(sgroup_info);
	}, this);

	selection.rxnArrows.each(function (id)
	{
		var arrow = new chem.Struct.RxnArrow(struct.rxnArrows.get(id));
		arrow.pos = arrow.pp;
		clipboard.rxnArrows.push(arrow);
	});

	selection.rxnPluses.each(function (id)
	{
		var plus = new chem.Struct.RxnPlus(struct.rxnPluses.get(id));
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
	Set.each(fragments, function (frid){
		var atoms = chem.Struct.Fragment.getAtoms(struct, frid);
		for (var i = 0; i < atoms.length; ++i)
			if (!Set.contains(atomFragments, atoms[i]))
				return;
		var rgid = chem.Struct.RGroup.findRGroupByFragment(struct.rgroups, frid);
		clipboard.rgmap[frid] = rgid;
		Set.add(rgids, rgid);
	}, this);

	Set.each(rgids, function (id){
		clipboard.rgroups[id] = struct.rgroups.get(id).getAttrs();
	}, this);

	return clipboard;
}

function fromPaste (struct, point) {
	var clipboard = struct2Clipboard(struct);
	var offset = point ? Vec2.diff(point, getAnchorPosition(clipboard)) : new Vec2();
	var action = new Action(), amap = {}, fmap = {};
	// atoms
	for (var aid = 0; aid < clipboard.atoms.length; aid++) {
		var atom = Object.clone(clipboard.atoms[aid]);
		if (!(atom.fragment in fmap)) {
			fmap[atom.fragment] = action.addOp(new op.FragmentAdd().perform(ui.editor)).frid;
		}
		atom.fragment = fmap[atom.fragment];
		amap[aid] = action.addOp(new op.AtomAdd(atom, atom.pp.add(offset)).perform(ui.editor)).data.aid;
	}

	var rgnew = [];
	for (var rgid in clipboard.rgroups) {
		if (!ui.ctab.rgroups.has(rgid)) {
			rgnew.push(rgid);
		}
	}

	// assign fragments to r-groups
	for (var frid in clipboard.rgmap) {
		action.addOp(new op.RGroupFragment(clipboard.rgmap[frid], fmap[frid]).perform(ui.editor));
	}

	for (var i = 0; i < rgnew.length; ++i) {
		action.mergeWith(fromRGroupAttrs(rgnew[i], clipboard.rgroups[rgnew[i]]));
	}

	//bonds
	for (var bid = 0; bid < clipboard.bonds.length; bid++) {
		var bond = Object.clone(clipboard.bonds[bid]);
		action.addOp(new op.BondAdd(amap[bond.begin], amap[bond.end], bond).perform(ui.editor));
	}
	//sgroups
	for (var sgid = 0; sgid < clipboard.sgroups.length; sgid++) {
		var sgroup_info = clipboard.sgroups[sgid];
		var atoms = sgroup_info.atoms;
		var sgatoms = [];
		for (var sgaid = 0; sgaid < atoms.length; sgaid++) {
			sgatoms.push(amap[atoms[sgaid]]);
		}
		var newsgid = ui.render.ctab.molecule.sgroups.newId();
		var sgaction = fromSgroupAddition(sgroup_info.type, sgatoms, sgroup_info.attrs, newsgid, sgroup_info.pp ? sgroup_info.pp.add(offset) : null);
		for (var iop = sgaction.operations.length - 1; iop >= 0; iop--) {
			action.addOp(sgaction.operations[iop]);
		}
	}
	//reaction arrows
	if (ui.editor.render.ctab.rxnArrows.count() < 1) {
		for (var raid = 0; raid < clipboard.rxnArrows.length; raid++) {
			action.addOp(new op.RxnArrowAdd(clipboard.rxnArrows[raid].pp.add(offset)).perform(ui.editor));
		}
	}
	//reaction pluses
	for (var rpid = 0; rpid < clipboard.rxnPluses.length; rpid++) {
		action.addOp(new op.RxnPlusAdd(clipboard.rxnPluses[rpid].pp.add(offset)).perform(ui.editor));
	}
	//thats all
	action.operations.reverse();
	return action;
};

function fromFlip (objects, flip) {
	var render = ui.render;
	var ctab = render.ctab;
	var molecule = ctab.molecule;

	var action = new Action();
	var i;
	var fids = {};

	if (objects.atoms) {
		for (i = 0; i < objects.atoms.length; i++) {
			var aid = objects.atoms[i];
			var atom = molecule.atoms.get(aid);
			if (!(atom.fragment in fids)) {
				fids[atom.fragment] = [aid];
			} else {
				fids[atom.fragment].push(aid);
			}
		}

		fids = new Hash(fids);

		if (fids.detect(function (frag) {
			return !Set.eq(molecule.getFragmentIds(frag[0]), Set.fromList(frag[1]));
		})) {
			return action; // empty action
		}

		fids.each(function (frag) {
			var fragment = Set.fromList(frag[1]);
			//var x1 = 100500, x2 = -100500, y1 = 100500, y2 = -100500;
			var bbox = molecule.getCoordBoundingBox(fragment);

			Set.each(fragment, function (aid) {
				var atom = molecule.atoms.get(aid);
				var d = new Vec2();

				if (flip == 'horizontal') {
					d.x = bbox.min.x + bbox.max.x - 2 * atom.pp.x;
				} else { // 'vertical'
					d.y = bbox.min.y + bbox.max.y - 2 * atom.pp.y;
				}

				action.addOp(new op.AtomMove(aid, d));
			});
		});

		if (objects.bonds) {
			for (i = 0; i < objects.bonds.length; i++) {
				var bid = objects.bonds[i];
				var bond = molecule.bonds.get(bid);

				if (bond.type == chem.Struct.BOND.TYPE.SINGLE) {
					if (bond.stereo == chem.Struct.BOND.STEREO.UP) {
						action.addOp(new op.BondAttr(bid, 'stereo', chem.Struct.BOND.STEREO.DOWN));
					} else if (bond.stereo == chem.Struct.BOND.STEREO.DOWN) {
						action.addOp(new op.BondAttr(bid, 'stereo', chem.Struct.BOND.STEREO.UP));
					}
				}
			}
		}
	}

	return action.perform();
};

function fromRotate (objects, pos, angle) {
	var render = ui.render;
	var ctab = render.ctab;
	var molecule = ctab.molecule;

	var action = new Action();
	var i;
	var fids = {};

	function rotateDelta(v)
	{
		var v1 = v.sub(pos);
		v1 = v1.rotate(angle);
		v1.add_(pos);
		return v1.sub(v);
	}

	if (objects.atoms) {
		objects.atoms.each(function (aid) {
			var atom = molecule.atoms.get(aid);
			action.addOp(new op.AtomMove(aid, rotateDelta(atom.pp)));
		});
	}

	if (objects.rxnArrows) {
		objects.rxnArrows.each(function (aid) {
			var arrow = molecule.rxnArrows.get(aid);
			action.addOp(new op.RxnArrowMove(aid, rotateDelta(arrow.pp)));
		});
	}

	if (objects.rxnPluses) {
		objects.rxnPluses.each(function (pid) {
			var plus = molecule.rxnPluses.get(pid);
			action.addOp(new op.RxnPlusMove(pid, rotateDelta(plus.pp)));
		});
	}

	if (objects.sgroupData) {
		objects.sgroupData.each(function (did) {
			var data = molecule.sgroups.get(did);
			action.addOp(new op.SGroupDataMove(did, rotateDelta(data.pp)));
		});
	}

	if (objects.chiralFlags) {
		objects.chiralFlags.each(function (fid) {
			var flag = molecule.chiralFlags.get(fid);
			action.addOp(new op.ChiralFlagMove(fid, rotateDelta(flag.pp)));
		});
	}

	return action.perform();
};

module.exports = util.extend(Action, {
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
