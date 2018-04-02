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

import Vec2 from '../../util/vec2';
import { Atom } from '../../chem/struct';
import op from '../shared/op';
import Action from '../shared/action';
import utils from '../shared/utils';
import closest from '../shared/closest';

import { atomGetAttr, atomForNewBond } from './utils';
import { fromAtomsAttrs, mergeSgroups } from './atom';
import { fromBondAddition, fromBondsAttrs } from './bond';
import { fromAromaticTemplateOnBond } from './aromatic-fusing';
import { fromPaste } from './paste';

export function fromTemplateOnCanvas(restruct, template, pos, angle) {
	return fromPaste(restruct, template.molecule, pos, angle);
}

function extraBondAction(restruct, aid, angle) {
	let action = new Action();
	const frid = atomGetAttr(restruct, aid, 'fragment');
	let additionalAtom = null;

	if (angle === null) {
		const middleAtom = atomForNewBond(restruct, aid);
		const actionRes = fromBondAddition(
			restruct, { type: 1 }, aid, middleAtom.atom, middleAtom.pos.get_xy0()
		);
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
	}

	return { action, aid1: additionalAtom };
}

export function fromTemplateOnAtom(restruct, template, aid, angle, extraBond) {
	let action = new Action();

	const tmpl = template.molecule;
	const struct = restruct.molecule;

	let atom = struct.atoms.get(aid); // aid - the atom that was clicked on
	let aid1 = aid; // aid1 - the atom on the other end of the extra bond || aid

	let delta = null;

	if (extraBond) {
		// create extra bond after click on atom
		const extraRes = extraBondAction(restruct, aid, angle);
		action = extraRes.action;
		aid1 = extraRes.aid1;

		atom = struct.atoms.get(aid1);
		delta = utils.calcAngle(struct.atoms.get(aid).pp, atom.pp) - template.angle0;
	} else {
		if (angle === null)
			angle = utils.calcAngle(atom.pp, atomForNewBond(restruct, aid).pos);
		delta = angle - template.angle0;
	}

	const map = new Map();
	const xy0 = tmpl.atoms.get(template.aid).pp;
	const frid = atomGetAttr(restruct, aid, 'fragment');

	/* For merge */
	const pasteItems = { // only atoms and bonds now
		atoms: [],
		bonds: []
	};
	/* ----- */

	tmpl.atoms.forEach((a, id) => {
		const attrs = Atom.getAttrHash(a);
		attrs.fragment = frid;

		if (id === template.aid) {
			action.mergeWith(fromAtomsAttrs(restruct, aid1, attrs, true));
			map.set(id, aid1);
			pasteItems.atoms.push(aid1);
		} else {
			const v = Vec2.diff(a.pp, xy0).rotate(delta).add(atom.pp);

			const operation = new op.AtomAdd(attrs, v.get_xy0()).perform(restruct);
			action.addOp(operation);
			map.set(id, operation.data.aid);
			pasteItems.atoms.push(operation.data.aid);
		}
	});
	mergeSgroups(action, restruct, pasteItems.atoms, aid);

	tmpl.bonds.forEach((bond) => {
		const operation = new op.BondAdd(map.get(bond.begin), map.get(bond.end), bond)
			.perform(restruct);
		action.addOp(operation);

		pasteItems.bonds.push(operation.data.bid);
	});

	action.operations.reverse();
	return [action, pasteItems];
}

export function fromTemplateOnBondAction(restruct, template, bid, events, flip, force) {
	if (!force)
		return fromTemplateOnBond(restruct, template, bid, flip);

	const simpleFusing = (restruct, template, bid) => fromTemplateOnBond(restruct, template, bid, flip); // eslint-disable-line
	/* aromatic merge (Promise)*/
	return fromAromaticTemplateOnBond(restruct, template, bid, events, simpleFusing);
}

function fromTemplateOnBond(restruct, template, bid, flip) { // TODO: refactor function !!
	const action = new Action();

	const tmpl = template.molecule;
	const struct = restruct.molecule;

	const bond = struct.bonds.get(bid);
	const tmplBond = tmpl.bonds.get(template.bid);

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

	/* For merge */
	const pasteItems = { // only atoms and bonds now
		atoms: [],
		bonds: []
	};
	/* ----- */

	tmpl.atoms.forEach((atom, id) => {
		const attrs = Atom.getAttrHash(atom);
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
			pasteItems.atoms.push(operation.data.aid);
		} else {
			atomsMap.set(id, mergeA.id);

			action.mergeWith(fromAtomsAttrs(restruct, atomsMap.get(id), attrs, true));
			// TODO [RB] need to merge fragments?
		}
	});
	mergeSgroups(action, restruct, pasteItems.atoms, bond.begin);

	tmpl.bonds.forEach((tBond) => {
		const existId = struct.findBondId(atomsMap.get(tBond.begin), atomsMap.get(tBond.end));
		if (existId === null) {
			const operation = new op.BondAdd(atomsMap.get(tBond.begin), atomsMap.get(tBond.end), tBond)
				.perform(restruct);
			action.addOp(operation);

			pasteItems.bonds.push(operation.data.bid);
		} else {
			action.mergeWith(fromBondsAttrs(restruct, existId, tmplBond, true));
		}
	});
	action.operations.reverse();
	return [action, pasteItems];
}
