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
import { fromPaste } from './paste';

export function fromTemplateOnCanvas(restruct, template, pos, angle) {
	return fromPaste(restruct, template.molecule, pos, angle);
}

function extraBondAction(restruct, aid, angle, sgroups) {
	let action = new Action();
	const frid = atomGetAttr(restruct, aid, 'fragment');
	let additionalAtom = null;

	if (angle === null) {
		const middleAtom = atomForNewBond(restruct, aid);
		const actionRes = fromBondAddition(restruct, { type: 1 }, aid, middleAtom.atom, middleAtom.pos.get_xy0());
		action = actionRes[0];
		action.operations.reverse();
		additionalAtom = actionRes[2];
	} else {
		const operation = new op.AtomAdd(
			{ label: 'C', fragment: frid },
			(new Vec2(1, 0)).rotate(angle).add(restruct.molecule.atoms.get(aid).pp).get_xy0()
		).perform(restruct);

		action.addOp(operation);
		action.addOp(
			new op.BondAdd(aid, operation.data.aid, { type: 1 }).perform(restruct)
		);

		additionalAtom = operation.data.aid;
		action.mergeWith(atomAddToSGroups(restruct, sgroups, aid));
	}

	return { action, aid1: additionalAtom };
}

export function fromTemplateOnAtom(restruct, aid, angle, extraBond, template) {
	let action = new Action();

	const tmpl = template.molecule;
	const struct = restruct.molecule;

	let atom = struct.atoms.get(aid); // aid - the atom that was clicked on
	let aid1 = aid; // aid1 - the atom on the other end of the extra bond || aid

	const sgroups = atomGetSGroups(restruct, aid);
	let delta = null;

	if (extraBond) {
		// create extra bond after click on atom
		const extraRes = extraBondAction(restruct, aid, angle, sgroups);
		action = extraRes.action;
		aid1 = extraRes.aid1;

		atom = struct.atoms.get(aid1);
		delta = utils.calcAngle(struct.atoms.get(aid).pp, atom.pp) - template.angle0;
	} else {
		if (angle === null)
			angle = utils.calcAngle(atom.pp, atomForNewBond(restruct, aid).pos);
		delta = angle - template.angle0;
	}

	const map = {};
	const xy0 = tmpl.atoms.get(template.aid).pp;
	const frid = atomGetAttr(restruct, aid, 'fragment');

	tmpl.atoms.forEach((a, id) => {
		const attrs = Struct.Atom.getAttrHash(a);
		attrs.fragment = frid;
		if (id === template.aid) {
			action.mergeWith(fromAtomsAttrs(restruct, aid1, attrs, true));
			map[id] = aid1;
		} else {
			const v = Vec2.diff(a.pp, xy0).rotate(delta).add(atom.pp);

			const operation = new op.AtomAdd(attrs, v.get_xy0()).perform(restruct);
			action.addOp(operation);
			map[id] = operation.data.aid;
		}
		if (map[id] !== aid && map[id] !== aid1)
			action.mergeWith(atomAddToSGroups(restruct, sgroups, map[id]));
	});

	tmpl.bonds.forEach((bond) => {
		action.addOp(new op.BondAdd(map[bond.begin], map[bond.end], bond).perform(restruct));
	});

	action.operations.reverse();
	return action;
}

export function fromTemplateOnBondAction(restruct, events, bid, template, flip, force) {
	if (!force)
		return fromTemplateOnBond(restruct, bid, template, flip);

	const simpleFusing = (restruct, bid, template) => fromTemplateOnBond(restruct, bid, template, flip); // eslint-disable-line
	/* aromatic merge (Promise)*/
	return fromAromaticTemplateOnBond(restruct, events, bid, template, simpleFusing);
}

function fromTemplateOnBond(restruct, bid, template, flip) {
	const action = new Action();

	const tmpl = template.molecule;
	const struct = restruct.molecule;

	const bond = struct.bonds.get(bid);
	const tmplBond = tmpl.bonds.get(template.bid);

	const atomBeginSgs = restruct.atoms.get(bond.begin).a.sgs;
	const atomEndSgs = restruct.atoms.get(bond.end).a.sgs;

	const sgroups = Array.from(atomBeginSgs.intersection(atomEndSgs));

	const tmplBegin = tmpl.atoms.get(flip ? tmplBond.end : tmplBond.begin);

	const atomsMap = new Map([
		[tmplBond.begin, flip ? bond.end : bond.begin],
		[tmplBond.end, flip ? bond.begin : bond.end]
	]);

	// calc angle
	const bondAtoms = {
		begin: flip ? tmplBond.end : tmplBond.begin,
		end: flip ? tmplBond.begin : tmplBond.end
	};
	const { angle, scale } = utils.mergeBondsParams(struct, bond, tmpl, bondAtoms);

	const frid = struct.getBondFragment(bid);

	tmpl.atoms.forEach((atom, id) => {
		const attrs = Struct.Atom.getAttrHash(atom);
		attrs.fragment = frid;
		if (id === tmplBond.begin || id === tmplBond.end) {
			action.mergeWith(fromAtomsAttrs(restruct, atomsMap.get(id), attrs, true));
			return;
		}

		const v = Vec2.diff(atom.pp, tmplBegin.pp)
			.rotate(angle)
			.scaled(scale)
			.add(struct.atoms.get(bond.begin).pp);
		const mergeA = closest.atom(restruct, v, null, 0.1);

		if (mergeA === null) {
			const operation = new op.AtomAdd(attrs,	v).perform(restruct);
			action.addOp(operation);

			atomsMap.set(id, operation.data.aid);
			action.mergeWith(atomAddToSGroups(restruct, sgroups, atomsMap.get(id)));
		} else {
			atomsMap.set(id, mergeA.id);
			action.mergeWith(fromAtomsAttrs(restruct, atomsMap.get(id), attrs, true));
			// TODO [RB] need to merge fragments?
		}
	});

	tmpl.bonds.forEach((tBond) => {
		const existId = struct.findBondId(atomsMap.get(tBond.begin), atomsMap.get(tBond.end));
		if (!existId)
			action.addOp(new op.BondAdd(atomsMap.get(tBond.begin), atomsMap.get(tBond.end), tBond).perform(restruct));
		else
			action.mergeWith(fromBondAttrs(restruct, existId, tmplBond, false, true));
	});
	action.operations.reverse();
	return action;
}

function atomAddToSGroups(restruct, sgroups, aid) {
	const action = new Action();
	sgroups.forEach((sid) => {
		action.addOp(new op.SGroupAtomAdd(sid, aid).perform(restruct));
	});
	return action;
}
