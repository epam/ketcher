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

import Vec2 from '../../util/vec2';
import Struct from '../../chem/struct';

import op from '../shared/op';
import Action from '../shared/action';
import utils from '../shared/utils';
import closest from '../shared/closest';

import { atomGetAttr, atomGetSGroups, atomForNewBond } from './utils';
import { fromAtomsAttrs } from './atom';
import { fromBondAddition, fromBondAttrs } from './bond';
import { fromAromaticTemplateOnBond } from './aromatic-fusing';
import { fromRGroupAttrs, fromRGroupFragment } from './rgroup';
import { fromChiralFlagAddition } from './chiral-flag';
import { fromSgroupAddition } from './sgroup';

export function fromTemplateOnCanvas(restruct, pos, angle, template) {
	const action = new Action();
	const frag = template.molecule;
	const fridMap = {};
	const fragOps = [];

	frag.frags.each(frid => {
		const fragAction = new op.FragmentAdd().perform(restruct);
		fridMap[frid] = fragAction.frid;
		fragOps.push(fragAction);
	});

	const aidMap = {};

	// Only template atom label matters for now
	frag.atoms.each((aid, atom) => {
		const attrs = Struct.Atom.getAttrHash(atom);
		attrs.fragment = fridMap[atom.fragment];

		const operation = new op.AtomAdd(attrs, Vec2.diff(atom.pp, template.xy0).rotate(angle).add(pos)).perform(restruct);
		action.addOp(operation);
		aidMap[aid] = operation.data.aid;
	});

	frag.bonds
		.each((bid, bond) => action.addOp(new op.BondAdd(aidMap[bond.begin], aidMap[bond.end], bond).perform(restruct)));

	frag.sgroups.each((sgid, sg) => {
		const newsgid = restruct.molecule.sgroups.newId();
		const sgAction = fromSgroupAddition(restruct, sg.type, sg.atoms.map(aid => aidMap[aid]), sg.data, newsgid, Vec2.diff(sg.pp, template.xy0).add(pos));
		sgAction.operations.reverse().forEach(op => action.addOp(op));
	});

	if (restruct.rxnArrows.count() < 1) {
		frag.rxnArrows.values()
			.forEach(rxnArrow => action.addOp(new op.RxnArrowAdd(Vec2.diff(rxnArrow.pp, template.xy0).add(pos)).perform(restruct)));
	}

	// reaction pluses
	frag.rxnPluses.values()
		.forEach(plus => action.addOp(new op.RxnPlusAdd(Vec2.diff(plus.pp, template.xy0).add(pos)).perform(restruct)));

	// chiral flag
	if (frag.isChiral) {
		const bb = frag.getCoordBoundingBox();
		const pp = Vec2.diff(new Vec2(bb.max.x, bb.min.y - 1), template.xy0).add(pos);
		action.mergeWith(fromChiralFlagAddition(restruct, pp));
	}

	frag.rgroups.each((rgid, rg) => {
		rg.frags.each((frid, frag) => action.mergeWith(fromRGroupFragment(restruct, rgid, fridMap[frag])));
		const attrs = {
			ifthen: rg.ifthen,
			range: rg.range,
			resth: rg.resth
		};

		action.mergeWith(fromRGroupAttrs(restruct, rgid, attrs));
	});

	action.operations.reverse();
	fragOps.forEach(op => action.addOp(op));
	return action;
}

export function fromTemplateOnAtom(restruct, aid, angle, extraBond, template) { // eslint-disable-line max-statements, max-params
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

export function fromTemplateOnBondAction(restruct, events, bid, template, flip, force) {
	if (!force)
		return fromTemplateOnBond(restruct, bid, template, flip);

	const simpleFusing = (restruct, bid, template) => fromTemplateOnBond(restruct, bid, template, flip);
	/* aromatic merge (Promise)*/
	return fromAromaticTemplateOnBond(restruct, events, bid, template, simpleFusing);
}

// TODO refactor
function fromTemplateOnBond(restruct, bid, template, flip) {
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
		if (existId === -1) {
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


function atomAddToSGroups(restruct, sgroups, aid) {
	var action = new Action();
	sgroups.forEach(function (sid) {
		action.addOp(new op.SGroupAtomAdd(sid, aid).perform(restruct));
	}, this);
	return action;
}
