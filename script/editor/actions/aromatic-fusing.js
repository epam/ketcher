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

import * as molfile from '../../chem/molfile';

/*TMP*/
import api from '../../api';
const serv = api('http://dp.itcwin.com:8081/v2', {
	'smart-layout': true,
	'ignore-stereochemistry-errors': true,
	'mass-skip-error-on-pseudoatoms': false,
	'gross-formula-add-rsites': true
});

const op = require('../op');
import Action from '../action';
const Struct = require('../../chem/struct');

// TODO move to actions
function fromTemplateOnBondAction(restruct, bid, template, flip, force) {
	if (!force)
		return Action.fromTemplateOnBond(restruct, bid, template, flip);

	console.log("HARDD!!!");
	return fromAromaticBondFusing(restruct, bid, template, flip);
}

function fromAromaticBondFusing(restruct, bid, template, flip) {
	const tmpl = template.molecule;
	const struct = restruct.molecule;

	const frid = struct.getBondFragment(bid);
	const beforeMerge = getFragmentWithBondMap(struct, frid);
	let afterMerge = null;

	if (!canBeAromatized(beforeMerge.frag) || !canBeAromatized(tmpl)) {
		return Promise.resolve(
			Action.fromTemplateOnBond(restruct, bid, template, flip)
		);
	}

	let action = new Action();

	return Promise.all([
		serv.aromatize({ struct: molfile.stringify(beforeMerge.frag) }),	// TODO editor.event dispatch
		serv.aromatize({ struct: molfile.stringify(tmpl) })
	]).then(([res1, res2]) => {
		const astruct = molfile.parse(res1.struct);
		const atmpl = molfile.parse(res2.struct);

		const aromatizeAction = fromAromatize(restruct, astruct, beforeMerge.bondMap);  	// AROMATIZE
		const templateFusingAction = Action.fromTemplateOnBond(								// TMPL ON BOND
			restruct, bid, { bid: template.bid, molecule: atmpl }, flip
		);
		action = templateFusingAction.mergeWith(aromatizeAction);

		afterMerge = getFragmentWithBondMap(restruct.molecule, frid);

		return serv.dearomatize({ struct: molfile.stringify(afterMerge.frag) });
	}).then(res => {
		const destruct = molfile.parse(res.struct);

		destruct.bonds.each((id, bond) => {
			if (bond.type === 4) throw 'Bad dearomatize';
		});

		const dearomatizeAction = fromDearomatize(restruct, destruct, afterMerge.bondMap);  // DEAROMATIZE
		action = dearomatizeAction.mergeWith(action);

		return action;
	}).catch(err => {
		console.info(err);
		action.perform(restruct); // revert actions if error
		action = Action.fromTemplateOnBond(restruct, bid, template,  flip);

		return action;
	});
}

function fromAromatize(restruct, astruct, bondMap) {
	const action = new Action();

	astruct.bonds.each((bid, bond) => {
		if (bond.type !== Struct.Bond.PATTERN.TYPE.AROMATIC) return;
		action.addOp(
			new op.BondAttr(bondMap[bid], 'type', Struct.Bond.PATTERN.TYPE.AROMATIC)
				.perform(restruct)
		);
	});

	return action;
}

function fromDearomatize(restruct, dastruct, bondMap) {
	const action = new Action();

	dastruct.bonds.each((bid, bond) => {
		action.addOp(
			new op.BondAttr(bondMap[bid], 'type', bond.type)
				.perform(restruct)
		);
	});

	return action;
}

/* UTILS */

function canBeAromatized(struct) { // TODO correct this checking && move to chem.Struct ??
	if (struct.loops.count() === 0) struct.prepareLoopStructure();

	const hasAromLoop = struct.loops.find((id, loop) => loop.aromatic);
	if (struct.loops.count() === 0 || hasAromLoop) return false;

	const correctDblBonds = struct.loops.find((id, loop) =>
		loop.dblBonds === (loop.hbs.length / 2)
	);
	return correctDblBonds !== undefined;
}

function getFragmentWithBondMap(struct, frid) {
	const atomSet = struct.getFragmentIds(frid);
	const atomsInStruct = Object.values(atomSet);

	const frag = struct.clone(atomSet);
	const bondMap = {};
	frag.bonds.each((bid, bond) => {
		bondMap[bid] = struct.findBondId(atomsInStruct[bond.begin], atomsInStruct[bond.end]);
	});

	return { frag, bondMap };
}

module.exports = {
	fromTemplateOnBondAction,
	fromAromaticBondFusing,
	canBeAromatized
};
