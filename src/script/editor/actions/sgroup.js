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

import { uniq } from 'lodash';

import { SGroup } from '../../chem/struct';

import Pile from '../../util/pile';
import op from '../shared/op';
import Action from '../shared/action';
import { SgContexts } from '../shared/constants';

import { atomGetAttr, atomGetDegree, atomGetSGroups } from './utils';

export function fromSeveralSgroupAddition(restruct, type, atoms, attrs) {
	const descriptors = attrs.fieldValue;

	if (typeof descriptors === 'string' || type !== 'DAT')
		return fromSgroupAddition(restruct, type, atoms, attrs, restruct.molecule.sgroups.newId());

	return descriptors.reduce((acc, fValue) => {
		const localAttrs = Object.assign({}, attrs);
		localAttrs.fieldValue = fValue;

		return acc.mergeWith(
			fromSgroupAddition(restruct, type, atoms, localAttrs, restruct.molecule.sgroups.newId())
		);
	}, new Action());
}

export function fromSgroupAttrs(restruct, id, attrs) {
	const action = new Action();

	Object.keys(attrs).forEach((key) => {
		action.addOp(new op.SGroupAttr(id, key, attrs[key]));
	});

	return action.perform(restruct);
}

export function sGroupAttributeAction(id, attrs) {
	const action = new Action();

	Object.keys(attrs).forEach((key) => {
		action.addOp(new op.SGroupAttr(id, key, attrs[key]));
	});

	return action;
}

export function fromSgroupDeletion(restruct, id) {
	let action = new Action();
	const struct = restruct.molecule;

	const sG = restruct.sgroups.get(id).item;

	if (sG.type === 'SRU') {
		struct.sGroupsRecalcCrossBonds();

		sG.neiAtoms.forEach((aid) => {
			if (atomGetAttr(restruct, aid, 'label') === '*')
				action.addOp(new op.AtomAttr(aid, 'label', 'C'));
		});
	}

	const sg = struct.sgroups.get(id);
	const atoms = SGroup.getAtoms(struct, sg);
	const attrs = sg.getAttrs();

	action.addOp(new op.SGroupRemoveFromHierarchy(id));

	atoms.forEach((atom) => {
		action.addOp(new op.SGroupAtomRemove(id, atom));
	});

	action.addOp(new op.SGroupDelete(id));

	action = action.perform(restruct);

	action.mergeWith(sGroupAttributeAction(id, attrs));

	return action;
}

export function fromSgroupAddition(restruct, type, atoms, attrs, sgid, pp) { // eslint-disable-line
	let action = new Action();

	// TODO: shoud the id be generated when OpSGroupCreate is executed?
	//      if yes, how to pass it to the following operations?
	sgid = sgid - 0 === sgid ? sgid : restruct.molecule.sgroups.newId();

	action.addOp(new op.SGroupCreate(sgid, type, pp));

	atoms.forEach((atom) => {
		action.addOp(new op.SGroupAtomAdd(sgid, atom));
	});

	action.addOp(
		type !== 'DAT' ?
			new op.SGroupAddToHierarchy(sgid) :
			new op.SGroupAddToHierarchy(sgid, -1, [])
	);

	action = action.perform(restruct);

	if (type === 'SRU') {
		restruct.molecule.sGroupsRecalcCrossBonds();
		let asteriskAction = new Action();

		restruct.sgroups.get(sgid).item.neiAtoms.forEach((aid) => {
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

export function fromSgroupAction(context, restruct, newSg, sourceAtoms, selection) {
	if (context === SgContexts.Bond)
		return fromBondAction(restruct, newSg, sourceAtoms, selection);

	const atomsFromBonds = getAtomsFromBonds(restruct.molecule, selection.bonds);
	const newSourceAtoms = uniq(sourceAtoms.concat(atomsFromBonds));

	if (context === SgContexts.Fragment)
		return fromGroupAction(restruct, newSg, newSourceAtoms, Array.from(restruct.atoms.keys()));

	if (context === SgContexts.Multifragment)
		return fromMultiFragmentAction(restruct, newSg, newSourceAtoms);

	if (context === SgContexts.Group)
		return fromGroupAction(restruct, newSg, newSourceAtoms, newSourceAtoms);

	if (context === SgContexts.Atom)
		return fromAtomAction(restruct, newSg, newSourceAtoms);

	return {
		action: fromSeveralSgroupAddition(restruct, newSg.type, sourceAtoms, newSg.attrs)
	};
}

function fromAtomAction(restruct, newSg, sourceAtoms) {
	return sourceAtoms.reduce((acc, atom) => {
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
	const allFragments = new Pile(
		sourceAtoms.map(aid => restruct.atoms.get(aid).a.fragment)
	);

	return Array.from(allFragments).reduce((acc, fragId) => {
		const atoms = targetAtoms
			.reduce((res, aid) => {
				const atom = restruct.atoms.get(aid).a;
				if (fragId === atom.fragment)
					res.push(aid);

				return res;
			}, []);

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
	const struct = restruct.molecule;
	let bonds = getAtomsBondIds(struct, sourceAtoms);

	if (currSelection.bonds)
		bonds = uniq(bonds.concat(currSelection.bonds));

	return bonds.reduce((acc, bondid) => {
		const bond = struct.bonds.get(bondid);

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

// Add action operation to remove atom from s-group if needed
export function removeAtomFromSgroupIfNeeded(action, restruct, id) {
	const sgroups = atomGetSGroups(restruct, id);

	if (sgroups.length > 0) {
		sgroups.forEach((sid) => {
			action.addOp(new op.SGroupAtomRemove(sid, id));
		});

		return true;
	}

	return false;
}

// Add action operations to remove whole s-group if needed
export function removeSgroupIfNeeded(action, restruct, atoms) {
	const struct = restruct.molecule;
	const sgCounts = new Map();

	atoms.forEach((id) => {
		const sgroups = atomGetSGroups(restruct, id);

		sgroups.forEach((sid) => {
			sgCounts.set(sid, sgCounts.has(sid) ? (sgCounts.get(sid) + 1) : 1);
		});
	});

	sgCounts.forEach((count, sid) => {
		const sG = restruct.sgroups.get(sid).item;
		const sgAtoms = SGroup.getAtoms(restruct.molecule, sG);

		if (sgAtoms.length === count) {
			// delete whole s-group
			const sgroup = struct.sgroups.get(sid);
			action.mergeWith(sGroupAttributeAction(sid, sgroup.getAttrs()));
			action.addOp(new op.SGroupRemoveFromHierarchy(sid));
			action.addOp(new op.SGroupDelete(sid));
		}
	});
}

function getAtomsBondIds(struct, atoms) {
	const atomSet = new Pile(atoms);

	return Array.from(struct.bonds.keys()).filter((bid) => {
		const bond = struct.bonds.get(bid);
		return atomSet.has(bond.begin) && atomSet.has(bond.end);
	});
}

function getAtomsFromBonds(struct, bonds) {
	bonds = bonds || [];
	return bonds.reduce((acc, bondid) => {
		const bond = struct.bonds.get(bondid);
		acc = acc.concat([bond.begin, bond.end]);
		return acc;
	}, []);
}
